// shell.tsx 에서 분리한 Source Tree(컴포넌트 아웃라인) 패널 훅.
// 담당 범위:
// - target 문서에서 섹션 아웃라인을 추출하고 필터/접힘/메타 표시 상태 관리
// - 패널이 열려 있는 동안 로드 지연/DOM 변경(MutationObserver)에 맞춰 갱신
// - 항목 액션: 스크롤 이동, 소스/사용처/데이터 열기, DOM QA 시작
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { ReviewMode, WebReviewKitController } from '../../types';
import {
  centerFrameScrollOnElement,
  filterSectionOutlineEntries,
  getDefaultCollapsedSectionOutlineIds,
  getSectionOutlineEntryCount,
  getSectionOutlineFilterTerms,
  scrollElementInTarget,
  waitForFrame,
  waitForMs,
} from '../review/shell.helpers';
import {
  getSectionOutline,
  type GetSectionOutlineOptions,
  type SectionOutlineEntry,
} from '../section.outline';
import {
  getStoredSourceTreeFilter,
  getStoredSourceTreeMetaVisibility,
  writeStoredSourceTreeFilter,
  writeStoredSourceTreeMetaVisibility,
  type StoredSourceTreeMetaVisibility,
} from '../settings';
import { openSourceInEditor, type SourceOpenOptions } from '../source.open';

type SourceTreeMetaVisibilityKey = keyof StoredSourceTreeMetaVisibility;

/** 패널이 닫히는 애니메이션을 기다린 뒤 DOM QA 를 시작하기 위한 지연. */
const SOURCE_TREE_PANEL_CLOSE_DELAY_MS = 180;

export function useReviewSectionOutline({
  canWriteDom,
  controllerRef,
  frameScrollRef,
  iframeRef,
  isPanelVisible,
  sectionOutlineOptions,
  sourceOpenOptions,
  targetFrameLoadVersion,
  targetSrc,
  onClearSourceInspector,
  onInitReviewKit,
  onModeChange,
  onShowQaPanel,
  onToast,
}: {
  canWriteDom: boolean;
  controllerRef: RefObject<WebReviewKitController | null>;
  frameScrollRef: RefObject<HTMLDivElement | null>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  /** Source Tree 패널이 실제로 열려 있는지 (열려 있을 때만 갱신 비용을 쓴다). */
  isPanelVisible: boolean;
  sectionOutlineOptions: GetSectionOutlineOptions;
  sourceOpenOptions: SourceOpenOptions;
  targetFrameLoadVersion: number;
  targetSrc: string;
  onClearSourceInspector: () => void;
  onInitReviewKit: () => void;
  onModeChange: (mode: ReviewMode) => void;
  /** DOM QA 시작 시 QA 패널을 열기 위한 콜백. */
  onShowQaPanel: () => void;
  onToast: (message: string) => void;
}) {
  const sectionOutlineCountRef = useRef(0);
  const [sectionOutline, setSectionOutline] = useState<
    SectionOutlineEntry[] | null
  >(null);
  const [sectionOutlineFilter, setSectionOutlineFilter] = useState(() =>
    getStoredSourceTreeFilter()
  );
  const [sectionOutlineMetaVisibility, setSectionOutlineMetaVisibility] =
    useState(() => getStoredSourceTreeMetaVisibility());
  const [collapsedSectionOutlineIds, setCollapsedSectionOutlineIds] = useState<
    Set<string>
  >(() => new Set());

  const updateSectionOutlineFilter = useCallback((nextFilter: string) => {
    setSectionOutlineFilter(nextFilter);
    writeStoredSourceTreeFilter(nextFilter);
  }, []);

  const updateSectionOutlineMetaVisibility = useCallback(
    (key: SourceTreeMetaVisibilityKey) => {
      setSectionOutlineMetaVisibility((current) => {
        const next = { ...current, [key]: !current[key] };
        writeStoredSourceTreeMetaVisibility(next);
        return next;
      });
    },
    []
  );

  const sectionOutlineFilterTerms = useMemo(
    () => getSectionOutlineFilterTerms(sectionOutlineFilter),
    [sectionOutlineFilter]
  );
  const filteredSectionOutline = useMemo(
    () =>
      sectionOutline
        ? filterSectionOutlineEntries(sectionOutline, sectionOutlineFilterTerms)
        : [],
    [sectionOutline, sectionOutlineFilterTerms]
  );
  const sectionOutlineTotalCount = useMemo(
    () => getSectionOutlineEntryCount(sectionOutline ?? []),
    [sectionOutline]
  );
  const filteredSectionOutlineCount = useMemo(
    () => getSectionOutlineEntryCount(filteredSectionOutline),
    [filteredSectionOutline]
  );
  const isSectionOutlineFiltering = sectionOutlineFilterTerms.length > 0;

  useEffect(() => {
    sectionOutlineCountRef.current = sectionOutlineTotalCount;
  }, [sectionOutlineTotalCount]);

  // target 이 바뀌면 이전 문서의 아웃라인/인스펙터 상태를 모두 버린다.
  useEffect(() => {
    onClearSourceInspector();
    setCollapsedSectionOutlineIds(new Set());
    setSectionOutline(null);
  }, [onClearSourceInspector, targetSrc]);

  const getCurrentSectionOutline = useCallback(
    (): SectionOutlineEntry[] | null => {
      let frameDocument: Document | null = null;
      try {
        frameDocument = iframeRef.current?.contentDocument ?? null;
      } catch {
        frameDocument = null;
      }
      if (!frameDocument || frameDocument.readyState !== 'complete') {
        return null;
      }
      return getSectionOutline(frameDocument, sectionOutlineOptions);
    },
    [iframeRef, sectionOutlineOptions]
  );

  const refreshCurrentSectionOutline = useCallback(
    (resetCollapse = false) => {
      const nextSectionOutline = getCurrentSectionOutline();
      if (!nextSectionOutline) return false;

      setSectionOutline(nextSectionOutline);
      const nextCount = getSectionOutlineEntryCount(nextSectionOutline);
      // 첫 로드(count 0 → n)일 때는 기본 접힘 상태로 초기화한다.
      const shouldResetCollapse = resetCollapse ||
        sectionOutlineCountRef.current === 0;
      sectionOutlineCountRef.current = nextCount;

      if (shouldResetCollapse) {
        setCollapsedSectionOutlineIds(
          getDefaultCollapsedSectionOutlineIds(nextSectionOutline)
        );
      }

      return true;
    },
    [getCurrentSectionOutline]
  );

  // 패널을 연 직후에는 target 렌더 완료 시점을 알 수 없어
  // 몇 차례(프레임 + 120/500/1200ms) 재시도한다.
  useEffect(() => {
    if (!isPanelVisible) return undefined;

    const refreshSectionOutline = () => {
      refreshCurrentSectionOutline(true);
    };

    const animationFrame = window.requestAnimationFrame(refreshSectionOutline);
    const firstTimeout = window.setTimeout(refreshSectionOutline, 120);
    const secondTimeout = window.setTimeout(refreshSectionOutline, 500);
    const thirdTimeout = window.setTimeout(refreshSectionOutline, 1200);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(firstTimeout);
      window.clearTimeout(secondTimeout);
      window.clearTimeout(thirdTimeout);
    };
  }, [
    isPanelVisible,
    refreshCurrentSectionOutline,
    targetFrameLoadVersion,
    targetSrc,
  ]);

  // 패널이 열려 있는 동안 target DOM 변경을 감지해 80ms 디바운스로 갱신.
  useEffect(() => {
    if (!isPanelVisible) return undefined;

    const frameDocument = iframeRef.current?.contentDocument;
    const body = frameDocument?.body;
    if (!body) return undefined;

    let refreshTimeout: number | null = null;
    const scheduleRefresh = () => {
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(() => {
        refreshTimeout = null;
        refreshCurrentSectionOutline(false);
      }, 80);
    };

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(body, { childList: true, subtree: true });
    scheduleRefresh();

    return () => {
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
      observer.disconnect();
    };
  }, [
    iframeRef,
    isPanelVisible,
    refreshCurrentSectionOutline,
    targetFrameLoadVersion,
    targetSrc,
  ]);

  const toggleSectionOutlineEntry = useCallback((entryId: string) => {
    setCollapsedSectionOutlineIds((current) => {
      const next = new Set(current);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  }, []);

  const scrollToSection = useCallback((entry: SectionOutlineEntry) => {
    scrollElementInTarget(entry.element, 'start');
    centerFrameScrollOnElement(
      frameScrollRef.current,
      iframeRef.current,
      entry.element
    );
  }, [frameScrollRef, iframeRef]);

  const openSectionSource = useCallback(
    (entry: SectionOutlineEntry) => {
      const didOpen = openSourceInEditor(entry.source, {
        ...sourceOpenOptions,
        omitPosition: true,
      });
      onToast(didOpen ? 'Source opened' : 'Source root required');
    },
    [onToast, sourceOpenOptions]
  );

  const openSectionUsageSource = useCallback(
    (entry: SectionOutlineEntry) => {
      const didOpen = openSourceInEditor(
        entry.metadata.usage?.source,
        sourceOpenOptions
      );
      onToast(didOpen ? 'Usage opened' : 'Usage source not found');
    },
    [onToast, sourceOpenOptions]
  );

  const openSectionData = useCallback(
    (entry: SectionOutlineEntry) => {
      const didOpen = openSourceInEditor(entry.data, sourceOpenOptions);
      onToast(didOpen ? 'Data opened' : 'Data hint not found');
    },
    [onToast, sourceOpenOptions]
  );

  /**
   * 트리 항목에서 바로 DOM QA 를 시작한다.
   * 패널 닫힘 → 리뷰킷 초기화 → 대상 스크롤 정렬 → element review 시작을
   * 프레임 단위로 순차 진행한다 (레이아웃이 안정된 뒤 좌표를 잡기 위함).
   */
  const startSectionDomReview = useCallback(
    (entry: SectionOutlineEntry) => {
      if (!canWriteDom) {
        onToast('DOM QA unavailable');
        return;
      }

      const rect = entry.element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        onToast('Component has no visible area here');
        return;
      }

      onClearSourceInspector();
      onShowQaPanel();

      let targetWindow: Window | null = null;
      try {
        targetWindow =
          entry.element.ownerDocument.defaultView ??
          iframeRef.current?.contentWindow ??
          null;
      } catch {
        targetWindow = null;
      }

      void waitForMs(SOURCE_TREE_PANEL_CLOSE_DELAY_MS)
        .then(async () => {
          onInitReviewKit();
          await waitForFrame(targetWindow);
          const controller = controllerRef.current;
          if (!controller) {
            onToast('DOM QA unavailable');
            return;
          }

          scrollElementInTarget(entry.element, 'center');
          await waitForFrame(targetWindow);
          centerFrameScrollOnElement(
            frameScrollRef.current,
            iframeRef.current,
            entry.element
          );
          await waitForFrame(targetWindow);
          await controller.startElementReview(entry.element);
          await waitForFrame(targetWindow);
          onModeChange(controller.getMode());
        })
        .catch(() => {
          onModeChange(controllerRef.current?.getMode() ?? 'idle');
        });
    },
    [
      canWriteDom,
      controllerRef,
      frameScrollRef,
      iframeRef,
      onClearSourceInspector,
      onInitReviewKit,
      onModeChange,
      onShowQaPanel,
      onToast,
    ]
  );

  return {
    collapsedSectionOutlineIds,
    filteredSectionOutline,
    filteredSectionOutlineCount,
    isSectionOutlineFiltering,
    openSectionData,
    openSectionSource,
    openSectionUsageSource,
    refreshCurrentSectionOutline,
    scrollToSection,
    sectionOutline,
    sectionOutlineFilter,
    sectionOutlineMetaVisibility,
    sectionOutlineTotalCount,
    startSectionDomReview,
    toggleSectionOutlineEntry,
    updateSectionOutlineFilter,
    updateSectionOutlineMetaVisibility,
  };
}
