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
} from 'react';
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
import { buildTargetSrc } from '../route';
import {
  getSectionOutline,
  type SectionOutlineEntry,
} from '../section.outline';
import { getDraftViewportScale } from '../../core/draft.metrics';
import {
  getStoredSourceTreeFilter,
  getStoredSourceTreeMetaVisibility,
  writeStoredSourceTreeFilter,
  writeStoredSourceTreeMetaVisibility,
  type StoredSourceTreeMetaVisibility,
} from '../settings';
import { openSourceInEditor } from '../source.open';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellRefs } from '../store/shell.refs';
import {
  useReviewShellStore,
  useReviewShellStoreApi,
} from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import { useReviewToast } from './use.review.toast';
import {
  DomAdjustmentLayerManager,
  type DomAdjustmentPosition,
} from '../target/dom-adjustment.layer';

type SourceTreeMetaVisibilityKey = keyof StoredSourceTreeMetaVisibility;

const EMPTY_DOM_ADJUSTMENT_POSITION: DomAdjustmentPosition = {
  x: 0,
  y: 0,
};

/** 패널이 닫히는 애니메이션을 기다린 뒤 DOM QA 를 시작하기 위한 지연. */
const SOURCE_TREE_PANEL_CLOSE_DELAY_MS = 180;

const getSectionDomAdjustmentKeyDelta = (event: KeyboardEvent) => {
  const step = event.shiftKey ? 10 : 1;
  if (event.key === 'ArrowLeft') return { x: -step };
  if (event.key === 'ArrowRight') return { x: step };
  if (event.key === 'ArrowUp') return { y: -step };
  if (event.key === 'ArrowDown') return { y: step };
  return null;
};

const isDomAdjustmentEmpty = (position: DomAdjustmentPosition) =>
  position.x === 0 && position.y === 0;

const isEditableKeyTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
};

const COMPONENT_SELECTION_ACTION_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'summary',
  'textarea',
  '[contenteditable="true"]',
  '[data-dfwr-move-entry-id]',
  '[role="button"]',
].join(', ');

const getClosestElement = (target: EventTarget | null, selector: string) => {
  const element = target as Element | null;
  return typeof element?.closest === 'function'
    ? element.closest(selector)
    : null;
};

const findSectionOutlinePathForElement = (
  entries: SectionOutlineEntry[],
  element: Element
): SectionOutlineEntry[] | null => {
  let bestPath: SectionOutlineEntry[] | null = null;

  const visit = (entry: SectionOutlineEntry, path: SectionOutlineEntry[]) => {
    const isMatch = entry.element === element || entry.element.contains(element);
    if (!isMatch) return;

    const nextPath = [...path, entry];
    bestPath = nextPath;
    entry.children.forEach((child) => visit(child, nextPath));
  };

  entries.forEach((entry) => visit(entry, []));
  return bestPath;
};

export function useReviewSectionOutline({
  onClearSourceInspector,
  onClearSourceSelection,
  onInitReviewKit,
  onSelectSourceElement,
}: {
  onClearSourceInspector: () => void;
  onClearSourceSelection: () => void;
  onInitReviewKit: () => void;
  onSelectSourceElement: (element: Element) => void;
}) {
  const { reviewViewportPresets, sectionOutlineOptions, sourceOpenOptions } =
    useReviewShellConfig();
  const { controllerRef, frameScrollRef, iframeRef } = useReviewShellRefs();
  const { canWriteDom } = useReviewShellAdapterState();
  const storeApi = useReviewShellStoreApi();
  const isListVisible = useReviewShellStore((state) => state.isListVisible);
  const sidePanel = useReviewShellStore((state) => state.sidePanel);
  const target = useReviewShellStore((state) => state.target);
  const size = useReviewShellStore((state) => state.size);
  const targetFrameLoadVersion = useReviewShellStore(
    (state) => state.targetFrameLoadVersion
  );
  const sourceTreeFocusRequest = useReviewShellStore(
    (state) => state.sourceTreeFocusRequest
  );
  const mode = useReviewShellStore((state) => state.mode);
  const setMode = useReviewShellStore((state) => state.setMode);
  const showToast = useReviewToast();
  const isPanelVisible = isListVisible && sidePanel === 'source';
  const targetSrc = useMemo(() => buildTargetSrc(target), [target]);
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
  const [selectedSectionOutlineId, setSelectedSectionOutlineId] = useState<
    string | null
  >(null);
  const [activeDomAdjustmentEntryId, setActiveDomAdjustmentEntryId] = useState<
    string | null
  >(null);
  const [domAdjustmentByEntryId, setDomAdjustmentByEntryId] = useState<
    Record<string, DomAdjustmentPosition>
  >({});
  const handledSourceTreeFocusVersionRef = useRef(0);
  const domAdjustmentManagerRef = useRef<DomAdjustmentLayerManager | null>(null);
  const domAdjustmentRequestVersionRef = useRef(0);

  const clearSectionOutlineSelection = useCallback(() => {
    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLElement &&
      activeElement.closest('.df-review-section-outline-entry-body')
    ) {
      activeElement.blur();
    }
    setSelectedSectionOutlineId(null);
    onClearSourceSelection();
  }, [onClearSourceSelection]);

  const handleDomAdjustmentCleared = useCallback((entryId: string) => {
    setActiveDomAdjustmentEntryId((current) =>
      current === entryId ? null : current
    );
    setDomAdjustmentByEntryId((current) => {
      if (!current[entryId]) return current;
      const next = { ...current };
      delete next[entryId];
      return next;
    });
  }, []);

  const getDomAdjustmentManager = useCallback(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument?.documentElement || !frameDocument.body) return null;

    const current = domAdjustmentManagerRef.current;
    if (current?.belongsTo(frameDocument)) return current;

    current?.destroy();
    const next = new DomAdjustmentLayerManager({
      document: frameDocument,
      onClear: handleDomAdjustmentCleared,
    });
    domAdjustmentManagerRef.current = next;
    return next;
  }, [handleDomAdjustmentCleared, iframeRef]);

  const domAdjustmentViewportScale = useMemo(
    () =>
      getDraftViewportScale(
        { width: size.width, height: size.height },
        reviewViewportPresets
      ).scale,
    [reviewViewportPresets, size.height, size.width]
  );

  const clearActiveDomAdjustment = useCallback(() => {
    setActiveDomAdjustmentEntryId(null);
  }, []);

  const clearDomAdjustments = useCallback(() => {
    domAdjustmentRequestVersionRef.current += 1;
    domAdjustmentManagerRef.current?.destroy();
    domAdjustmentManagerRef.current = null;
    setActiveDomAdjustmentEntryId(null);
    setDomAdjustmentByEntryId({});
  }, []);

  const finishActiveDomAdjustment = useCallback(() => {
    if (!activeDomAdjustmentEntryId) return;
    clearActiveDomAdjustment();
  }, [activeDomAdjustmentEntryId, clearActiveDomAdjustment]);

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

  // target 문서가 바뀌거나 다시 로드되면 이동 Canvas 를 포함한 상태를 버린다.
  useEffect(() => {
    onClearSourceInspector();
    onClearSourceSelection();
    setCollapsedSectionOutlineIds(new Set());
    setSelectedSectionOutlineId(null);
    clearDomAdjustments();
    setSectionOutline(null);
  }, [
    clearDomAdjustments,
    onClearSourceInspector,
    onClearSourceSelection,
    targetFrameLoadVersion,
    targetSrc,
  ]);

  useEffect(() => {
    if (!activeDomAdjustmentEntryId) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableKeyTarget(event.target)) return;

      const delta = getSectionDomAdjustmentKeyDelta(event);
      if (!delta) return;

      const position = domAdjustmentManagerRef.current?.adjust(
        activeDomAdjustmentEntryId,
        delta,
        domAdjustmentViewportScale
      );
      if (!position) {
        clearActiveDomAdjustment();
        return;
      }

      setDomAdjustmentByEntryId((current) => ({
        ...current,
        [activeDomAdjustmentEntryId]: position,
      }));
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    activeDomAdjustmentEntryId,
    clearActiveDomAdjustment,
    domAdjustmentViewportScale,
  ]);

  useEffect(() => {
    if (!activeDomAdjustmentEntryId) return undefined;

    const finishOnPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('.df-review-section-outline-link.is-dom-adjust')
      ) {
        return;
      }
      finishActiveDomAdjustment();
    };

    let frameDocument: Document | null = null;
    try {
      frameDocument = iframeRef.current?.contentDocument ?? null;
    } catch {
      frameDocument = null;
    }

    window.addEventListener('pointerdown', finishOnPointerDown, true);
    frameDocument?.addEventListener(
      'pointerdown',
      finishOnPointerDown,
      true
    );
    return () => {
      window.removeEventListener('pointerdown', finishOnPointerDown, true);
      frameDocument?.removeEventListener(
        'pointerdown',
        finishOnPointerDown,
        true
      );
    };
  }, [
    activeDomAdjustmentEntryId,
    finishActiveDomAdjustment,
    iframeRef,
  ]);

  useEffect(() => {
    domAdjustmentManagerRef.current?.setActive(activeDomAdjustmentEntryId);
  }, [activeDomAdjustmentEntryId]);

  useEffect(() => {
    if (
      !selectedSectionOutlineId ||
      mode !== 'idle' ||
      activeDomAdjustmentEntryId
    ) {
      return undefined;
    }

    let frameDocument: Document | null = null;
    try {
      frameDocument = iframeRef.current?.contentDocument ?? null;
    } catch {
      frameDocument = null;
    }

    const clearOnFramePointerDown = (event: PointerEvent) => {
      if (
        getClosestElement(event.target, COMPONENT_SELECTION_ACTION_SELECTOR)
      ) {
        return;
      }
      clearSectionOutlineSelection();
    };
    const clearOnWorkspacePointerDown = (event: PointerEvent) => {
      if (!getClosestElement(event.target, '.df-review-frame-scroll')) return;
      if (
        getClosestElement(event.target, COMPONENT_SELECTION_ACTION_SELECTOR)
      ) {
        return;
      }
      clearSectionOutlineSelection();
    };
    const clearOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearSectionOutlineSelection();
    };

    frameDocument?.addEventListener(
      'pointerdown',
      clearOnFramePointerDown,
      true
    );
    frameDocument?.addEventListener('keydown', clearOnEscape, true);
    window.addEventListener(
      'pointerdown',
      clearOnWorkspacePointerDown,
      true
    );
    window.addEventListener('keydown', clearOnEscape, true);
    return () => {
      frameDocument?.removeEventListener(
        'pointerdown',
        clearOnFramePointerDown,
        true
      );
      frameDocument?.removeEventListener('keydown', clearOnEscape, true);
      window.removeEventListener(
        'pointerdown',
        clearOnWorkspacePointerDown,
        true
      );
      window.removeEventListener('keydown', clearOnEscape, true);
    };
  }, [
    activeDomAdjustmentEntryId,
    clearSectionOutlineSelection,
    iframeRef,
    mode,
    selectedSectionOutlineId,
  ]);

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
    scrollElementInTarget(entry.element, 'center');
    centerFrameScrollOnElement(
      frameScrollRef.current,
      iframeRef.current,
      entry.element
    );
  }, [frameScrollRef, iframeRef]);

  const selectSectionOutlinePath = useCallback(
    (path: SectionOutlineEntry[]) => {
      const entry = path[path.length - 1];
      if (!entry) return;

      setSelectedSectionOutlineId(entry.id);
      onSelectSourceElement(entry.element);
      setCollapsedSectionOutlineIds((current) => {
        const next = new Set(current);
        path.slice(0, -1).forEach((ancestor) => next.delete(ancestor.id));
        return next;
      });
    },
    [onSelectSourceElement]
  );

  const selectSectionOutlineEntry = useCallback(
    (entry: SectionOutlineEntry) => {
      finishActiveDomAdjustment();
      if (selectedSectionOutlineId === entry.id) {
        clearSectionOutlineSelection();
        return;
      }
      scrollToSection(entry);
      setSelectedSectionOutlineId(entry.id);
      onSelectSourceElement(entry.element);
    },
    [
      clearSectionOutlineSelection,
      finishActiveDomAdjustment,
      onSelectSourceElement,
      scrollToSection,
      selectedSectionOutlineId,
    ]
  );

  useEffect(() => {
    const request = sourceTreeFocusRequest;
    if (
      !request ||
      handledSourceTreeFocusVersionRef.current === request.version ||
      !isPanelVisible
    ) {
      return;
    }

    const entries = sectionOutline ?? getCurrentSectionOutline();
    if (!entries) return;

    if (!sectionOutline) {
      setSectionOutline(entries);
      setCollapsedSectionOutlineIds(
        getDefaultCollapsedSectionOutlineIds(entries)
      );
      sectionOutlineCountRef.current = getSectionOutlineEntryCount(entries);
    }

    const path = findSectionOutlinePathForElement(entries, request.element);
    if (!path) {
      handledSourceTreeFocusVersionRef.current = request.version;
      showToast('Component not found');
      return;
    }

    handledSourceTreeFocusVersionRef.current = request.version;
    if (sectionOutlineFilter) updateSectionOutlineFilter('');
    selectSectionOutlinePath(path);
  }, [
    getCurrentSectionOutline,
    isPanelVisible,
    sectionOutline,
    sectionOutlineFilter,
    selectSectionOutlinePath,
    showToast,
    sourceTreeFocusRequest,
    updateSectionOutlineFilter,
  ]);

  const openSectionSource = useCallback(
    (entry: SectionOutlineEntry) => {
      const didOpen = openSourceInEditor(entry.source, {
        ...sourceOpenOptions,
        omitPosition: true,
      });
      showToast(didOpen ? 'Source opened' : 'Source root required');
    },
    [showToast, sourceOpenOptions]
  );

  const openSectionUsageSource = useCallback(
    (entry: SectionOutlineEntry) => {
      const didOpen = openSourceInEditor(
        entry.metadata.usage?.source,
        sourceOpenOptions
      );
      showToast(didOpen ? 'Usage opened' : 'Usage source not found');
    },
    [showToast, sourceOpenOptions]
  );

  const openSectionData = useCallback(
    (entry: SectionOutlineEntry) => {
      const didOpen = openSourceInEditor(entry.data, sourceOpenOptions);
      showToast(didOpen ? 'Data opened' : 'Data hint not found');
    },
    [showToast, sourceOpenOptions]
  );

  /**
   * 트리 항목에서 바로 DOM QA 를 시작한다.
   * 패널 닫힘 → 리뷰킷 초기화 → 대상 스크롤 정렬 → element review 시작을
   * 프레임 단위로 순차 진행한다 (레이아웃이 안정된 뒤 좌표를 잡기 위함).
   */
  const startSectionDomReview = useCallback(
    (entry: SectionOutlineEntry) => {
      if (!canWriteDom) {
        showToast('DOM QA unavailable');
        return;
      }

      const rect = entry.element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        showToast('Component has no visible area here');
        return;
      }

      const position = domAdjustmentByEntryId[entry.id];
      setSelectedSectionOutlineId(entry.id);
      onSelectSourceElement(entry.element);
      clearActiveDomAdjustment();
      onClearSourceInspector();
      const state = storeApi.getState();
      state.setIsListVisible(true);

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
            showToast('DOM QA unavailable');
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
          if (position && !isDomAdjustmentEmpty(position)) {
            controller.adjustElementSelection(position, { preview: false });
          }
          await waitForFrame(targetWindow);
          setMode(controller.getMode());
        })
        .catch(() => {
          setMode(controllerRef.current?.getMode() ?? 'idle');
        });
    },
    [
      canWriteDom,
      controllerRef,
      domAdjustmentByEntryId,
      frameScrollRef,
      iframeRef,
      onClearSourceInspector,
      onInitReviewKit,
      onSelectSourceElement,
      clearActiveDomAdjustment,
      setMode,
      showToast,
      storeApi,
    ]
  );

  const startSectionDomAdjustment = useCallback(
    (entry: SectionOutlineEntry) => {
      if (!canWriteDom) {
        showToast('DOM select unavailable');
        return;
      }

      const rect = entry.element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        showToast('Component has no visible area here');
        return;
      }

      finishActiveDomAdjustment();
      scrollToSection(entry);
      setSelectedSectionOutlineId(entry.id);
      onSelectSourceElement(entry.element);
      const requestVersion = domAdjustmentRequestVersionRef.current + 1;
      domAdjustmentRequestVersionRef.current = requestVersion;

      let targetWindow: Window | null = null;
      try {
        targetWindow =
          entry.element.ownerDocument.defaultView ??
          iframeRef.current?.contentWindow ??
          null;
      } catch {
        targetWindow = null;
      }

      void waitForFrame(targetWindow)
        .then(async () => {
          const position =
            domAdjustmentByEntryId[entry.id] ?? EMPTY_DOM_ADJUSTMENT_POSITION;
          const manager = getDomAdjustmentManager();
          if (!manager) {
            showToast('DOM move unavailable');
            return;
          }

          const didCreate = await manager.create(
            entry.id,
            entry.label,
            entry.element,
            position,
            domAdjustmentViewportScale
          );
          if (!didCreate) {
            showToast('DOM move unavailable');
            return;
          }

          setDomAdjustmentByEntryId((current) => ({
            ...current,
            [entry.id]: position,
          }));
          if (domAdjustmentRequestVersionRef.current === requestVersion) {
            setActiveDomAdjustmentEntryId(entry.id);
          }
        })
        .catch(() => {
          clearActiveDomAdjustment();
          showToast('DOM move unavailable');
        });
    },
    [
      canWriteDom,
      clearActiveDomAdjustment,
      domAdjustmentByEntryId,
      domAdjustmentViewportScale,
      finishActiveDomAdjustment,
      getDomAdjustmentManager,
      iframeRef,
      onSelectSourceElement,
      scrollToSection,
      showToast,
    ]
  );

  const clearSectionDomAdjustment = useCallback(
    (entry: SectionOutlineEntry) => {
      const manager = domAdjustmentManagerRef.current;
      if (manager) {
        manager.clear(entry.id);
        return;
      }
      handleDomAdjustmentCleared(entry.id);
    },
    [handleDomAdjustmentCleared]
  );

  return {
    canWriteDom,
    collapsedSectionOutlineIds,
    filteredSectionOutline,
    filteredSectionOutlineCount,
    isPanelVisible,
    isSectionOutlineFiltering,
    openSectionData,
    openSectionSource,
    openSectionUsageSource,
    refreshCurrentSectionOutline,
    sectionOutline,
    sectionOutlineFilter,
    sectionOutlineMetaVisibility,
    sectionOutlineTotalCount,
    activeDomAdjustmentEntryId,
    domAdjustmentByEntryId,
    clearSectionDomAdjustment,
    clearSectionOutlineSelection,
    selectedSectionOutlineId,
    selectSectionOutlineEntry,
    startSectionDomAdjustment,
    startSectionDomReview,
    toggleSectionOutlineEntry,
    updateSectionOutlineFilter,
    updateSectionOutlineMetaVisibility,
  };
}
