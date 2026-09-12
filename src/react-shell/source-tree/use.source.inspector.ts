// shell.tsx 에서 분리한 소스 인스펙터 훅.
// 담당 범위:
// - 소스 탐색 hover outline 상태와 위치 계산
// - Alt(Option) 단축키로 target iframe 안에서 소스 후보를 추적/클릭하는
//   바인딩 (bindSourceOpenShortcut) — 폰트 힌트 오버레이 포함
// - Source Tree 패널 hover 시 요소 아웃라인 표시
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { bindSourceSelectionEvents } from './source.selection.events';
import type {
  SourceComponentPopup,
  SourceInspectorRect,
  SourceInspectorState,
} from './source.inspector.overlay';
import {
  getSectionOutlinePathForElement,
  type GetSectionOutlineOptions,
} from './section.outline';
import {
  getSourceCandidates,
  openSourceInEditor,
  type GetSourceCandidatesOptions,
} from './source.open';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewToast } from '../hooks/use.review.toast';

export function useReviewSourceInspector({
  isBlocked = false,
  frameScrollRef,
  iframeRef,
  isSourceTreeHoverOutlineEnabled,
  sectionOutlineOptions,
  sourceCandidateOptions,
  targetSrc,
  onCancelReviewMode,
  onRequestSourceTreeFocus,
}: {
  isBlocked?: boolean;
  frameScrollRef: RefObject<HTMLDivElement | null>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isSourceTreeHoverOutlineEnabled: boolean;
  sectionOutlineOptions: GetSectionOutlineOptions;
  sourceCandidateOptions: GetSourceCandidatesOptions;
  /** target 주소가 바뀌면 새 문서에 단축키를 다시 바인딩한다. */
  targetSrc: string;
  onCancelReviewMode: () => boolean;
  onRequestSourceTreeFocus?: (element: Element) => void;
}) {
  const showToast = useReviewToast();
  const { canOpenSourceFiles, sourceOpenOptions } = useReviewShellConfig();
  const sourceShortcutCleanupRef = useRef<(() => void) | null>(null);
  const [componentSelectionState, setComponentSelectionState] =
    useState<SourceInspectorState | null>(null);
  const [sourceInspectorState, setSourceInspectorState] =
    useState<SourceInspectorState | null>(null);

  const clearSourceInspector = useCallback(() => {
    setSourceInspectorState(null);
  }, []);

  /** target iframe 안 요소의 화면(호스트) 기준 사각형. frame 밖은 잘라낸다. */
  const getSourceInspectorRect = useCallback(
    (element: Element): SourceInspectorRect | null => {
      const frame = iframeRef.current;
      if (!frame) return null;

      const frameRect = frame.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const left = Math.max(frameRect.left, frameRect.left + elementRect.left);
      const top = Math.max(frameRect.top, frameRect.top + elementRect.top);
      const right = Math.min(
        frameRect.right,
        frameRect.left + elementRect.right
      );
      const bottom = Math.min(
        frameRect.bottom,
        frameRect.top + elementRect.bottom
      );

      return {
        height: Math.max(2, bottom - top),
        left,
        top,
        width: Math.max(2, right - left),
      };
    },
    [iframeRef]
  );

  /** hover 추적용: 패널 없이 아웃라인 사각형만 표시. */
  const showSourceOutlineForTarget = useCallback(
    (target: EventTarget | null) => {
      const firstCandidate = getSourceCandidates(
        target,
        sourceCandidateOptions
      )[0];
      const rect = firstCandidate
        ? getSourceInspectorRect(firstCandidate.element)
        : null;

      if (!firstCandidate || !rect) {
        setSourceInspectorState(null);
        return null;
      }

      setSourceInspectorState({
        rect,
        targetElement: firstCandidate.element,
      });
      return firstCandidate;
    },
    [getSourceInspectorRect, sourceCandidateOptions]
  );

  /** Source Tree 항목 hover 시 대응 요소를 아웃라인으로 강조. */
  const showSourceOutlineForElement = useCallback(
    (element: Element) => {
      if (!isSourceTreeHoverOutlineEnabled) return;

      const rect = getSourceInspectorRect(element);

      if (!rect) {
        setSourceInspectorState(null);
        return;
      }

      setSourceInspectorState({ rect, targetElement: element });
    },
    [getSourceInspectorRect, isSourceTreeHoverOutlineEnabled]
  );

  const selectSourceOutlineForElement = useCallback(
    (element: Element) => {
      const rect = getSourceInspectorRect(element);

      setComponentSelectionState(
        rect ? { rect, targetElement: element } : null
      );
    },
    [getSourceInspectorRect]
  );

  const clearSourceOutlineSelection = useCallback(() => {
    setComponentSelectionState(null);
  }, []);

  const clearSourceOutlineHover = useCallback(() => {
    setSourceInspectorState(null);
  }, []);

  const sourceInspectorTargetElement =
    sourceInspectorState?.targetElement ?? null;
  const componentSelectionTargetElement =
    componentSelectionState?.targetElement ?? null;

  // 선택 지점의 data 후보와 outline 조상 체인(선택→부모→…→루트)을 계산한다.
  // 요소가 바뀔 때만 다시 만들고, rect 는 아래에서 매 렌더 최신값을 쓴다.
  const sourceComponentPopupContent = useMemo(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!componentSelectionTargetElement || !frameDocument) return null;

    const path = getSectionOutlinePathForElement(
      frameDocument,
      componentSelectionTargetElement,
      sectionOutlineOptions
    );
    if (!path || path.length === 0) return null;

    return {
      dataEntries: getSourceCandidates(
        componentSelectionTargetElement,
        sourceCandidateOptions
      )
        .filter((candidate) => candidate.kind === 'data')
        .map((candidate) => ({
          id: candidate.id,
          label: candidate.label,
          filePath: candidate.filePath,
          source: candidate.source,
        })),
      entries: [...path].reverse().map((entry) => ({
        id: entry.id,
        label: entry.label,
        filePath: entry.filePath,
        source: entry.source,
      })),
    };
  }, [
    componentSelectionTargetElement,
    iframeRef,
    sectionOutlineOptions,
    sourceCandidateOptions,
  ]);

  const sourceComponentPopup: SourceComponentPopup | null =
    componentSelectionState && sourceComponentPopupContent
      ? {
          rect: componentSelectionState.rect,
          ...sourceComponentPopupContent,
        }
      : null;

  const openSourceComponent = useCallback(
    (source: SourceComponentPopup['entries'][number]['source']) => {
      if (!canOpenSourceFiles) {
        showToast('Source opening unavailable');
        return;
      }

      const didOpen = openSourceInEditor(source, {
        ...sourceOpenOptions,
        omitPosition: true,
      });
      showToast(didOpen ? 'Source opened' : 'Source root required');
    },
    [canOpenSourceFiles, showToast, sourceOpenOptions]
  );

  const selectSourceData = useCallback(
    (source: SourceComponentPopup['dataEntries'][number]['source']) => {
      if (!canOpenSourceFiles) {
        showToast('Source opening unavailable');
        return;
      }

      const didOpen = openSourceInEditor(source, sourceOpenOptions);
      showToast(didOpen ? 'Data opened' : 'Source root required');
    },
    [canOpenSourceFiles, showToast, sourceOpenOptions]
  );

  useEffect(() => {
    const trackedElement =
      sourceInspectorTargetElement ?? componentSelectionTargetElement;
    if (!trackedElement) return undefined;

    const targetWindow =
      trackedElement.ownerDocument.defaultView ??
      iframeRef.current?.contentWindow ??
      null;
    const frameScroll = frameScrollRef.current;
    if (!targetWindow) return undefined;

    let frameId: number | null = null;
    const scheduleUpdate = () => {
      if (frameId !== null) targetWindow.cancelAnimationFrame(frameId);
      frameId = targetWindow.requestAnimationFrame(() => {
        frameId = null;
        setSourceInspectorState((current) => {
          if (!current) return current;

          const rect = getSourceInspectorRect(current.targetElement);
          if (!rect) return null;

          return { ...current, rect };
        });
        setComponentSelectionState((current) => {
          if (!current) return current;

          const rect = getSourceInspectorRect(current.targetElement);
          if (!rect) return null;

          return { ...current, rect };
        });
      });
    };

    targetWindow.addEventListener('scroll', scheduleUpdate, { passive: true });
    targetWindow.addEventListener('resize', scheduleUpdate);
    frameScroll?.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();

    return () => {
      if (frameId !== null) {
        targetWindow.cancelAnimationFrame(frameId);
        frameId = null;
      }
      targetWindow.removeEventListener('scroll', scheduleUpdate);
      targetWindow.removeEventListener('resize', scheduleUpdate);
      frameScroll?.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [
    componentSelectionTargetElement,
    frameScrollRef,
    getSourceInspectorRect,
    iframeRef,
    sourceInspectorTargetElement,
  ]);

  const cleanupSourceOpenShortcut = useCallback(() => {
    sourceShortcutCleanupRef.current?.();
    sourceShortcutCleanupRef.current = null;
  }, []);

  /**
   * target iframe 문서에 Alt(Option) 소스 선택 모드를 바인딩한다.
   * - Alt 누름: hover 요소의 소스 아웃라인 + data-font 힌트 오버레이 표시
   * - Alt+클릭: 가장 가까운 컴포넌트를 Source Tree 에서 바로 선택
   * - Escape/바깥 클릭/blur: 선택 모드 해제
   * iframe 이 새 문서로 바뀔 때마다 다시 호출해야 한다 (loadTargetFrame).
   */
  const bindSourceOpenShortcut = useCallback(() => {
    cleanupSourceOpenShortcut();
    setComponentSelectionState(null);
    if (isBlocked) {
      clearSourceInspector();
      return;
    }

    let frameDocument: Document | null = null;
    try {
      frameDocument = iframeRef.current?.contentDocument ?? null;
    } catch {
      return;
    }

    if (!frameDocument) return;

    sourceShortcutCleanupRef.current = bindSourceSelectionEvents({
      frameDocument,
      hostWindow: window,
      sourceCandidateOptions,
      showSourceOutlineForTarget,
      selectSourceOutlineForElement,
      clearSourceInspector,
      onCancelReviewMode,
      onRequestSourceTreeFocus,
      showToast,
    }) ?? null;
  }, [
    onCancelReviewMode,
    clearSourceInspector,
    cleanupSourceOpenShortcut,
    isBlocked,
    iframeRef,
    onRequestSourceTreeFocus,
    selectSourceOutlineForElement,
    showToast,
    sourceCandidateOptions,
    showSourceOutlineForTarget,
  ]);

  // 언마운트 시 iframe 문서에 남은 리스너/스타일을 정리한다.
  useEffect(() => {
    return cleanupSourceOpenShortcut;
  }, [cleanupSourceOpenShortcut]);

  // target 이 바뀌면 다음 프레임에 새 문서로 재바인딩.
  useEffect(() => {
    const frame = window.requestAnimationFrame(bindSourceOpenShortcut);
    return () => window.cancelAnimationFrame(frame);
  }, [bindSourceOpenShortcut, targetSrc]);

  return {
    bindSourceOpenShortcut,
    clearSourceInspector,
    clearSourceOutlineHover,
    clearSourceOutlineSelection,
    componentSelectionState,
    openSourceComponent,
    selectSourceData,
    selectSourceOutlineForElement,
    showSourceOutlineForElement,
    sourceComponentPopup,
    sourceInspectorState,
  };
}

export type ReviewSourceInspectorController = ReturnType<
  typeof useReviewSourceInspector
>;
