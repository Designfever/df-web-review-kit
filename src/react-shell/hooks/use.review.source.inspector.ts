// shell.tsx 에서 분리한 소스 인스펙터 훅.
// 담당 범위:
// - 인스펙터 패널 상태(위치/후보 목록/고정 여부) 계산
// - Alt(Option) 단축키로 target iframe 안에서 소스 후보를 추적/클릭하는
//   바인딩 (bindSourceOpenShortcut) — 폰트 힌트 오버레이 포함
// - Source Tree 패널 hover 시 요소 아웃라인 표시
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { createSourceShortcutStyle } from '../review/source.shortcut.style';
import type {
  SourceInspectorCandidate,
  SourceInspectorRect,
  SourceInspectorState,
} from '../review/source.inspector.overlay';
import {
  getSourceCandidates,
  getSourceOpenUrl,
  openSourceInEditor,
  type GetSourceCandidatesOptions,
  type SourceOpenOptions,
} from '../source.open';
import { setTargetFigmaSourceSelectLocked } from '../target/target';
import { useReviewToast } from './use.review.toast';

const SOURCE_PANEL_MAX_WIDTH = 440;
const SOURCE_PANEL_MIN_WIDTH = 240;
const SOURCE_PANEL_MAX_HEIGHT = 260;

export function useReviewSourceInspector({
  iframeRef,
  isSourceInspectorEnabled,
  isSourceTreeHoverOutlineEnabled,
  sourceCandidateOptions,
  sourceOpenOptions,
  targetSrc,
  onCancelReviewMode,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isSourceInspectorEnabled: boolean;
  isSourceTreeHoverOutlineEnabled: boolean;
  sourceCandidateOptions: GetSourceCandidatesOptions;
  sourceOpenOptions: SourceOpenOptions;
  /** target 주소가 바뀌면 새 문서에 단축키를 다시 바인딩한다. */
  targetSrc: string;
  onCancelReviewMode: () => boolean;
}) {
  const showToast = useReviewToast();
  const sourceShortcutCleanupRef = useRef<(() => void) | null>(null);
  // 인스펙터 팝업 내부를 조작 중인지 여부. 팝업 클릭이 "바깥 클릭으로 닫힘"
  // 처리에 걸리지 않게 하는 플래그.
  const sourceInspectorInteractionRef = useRef(false);
  const [sourceInspectorState, setSourceInspectorState] =
    useState<SourceInspectorState | null>(null);

  const clearSourceInspector = useCallback(() => {
    sourceInspectorInteractionRef.current = false;
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

  /** 패널을 대상 오른쪽에, 공간이 없으면 왼쪽에 배치. */
  const getSourceInspectorPanelPosition = useCallback(
    (rect: SourceInspectorRect) => {
      const margin = 12;
      const gap = 10;
      const preferredLeft = rect.left + rect.width + gap;
      const rightSpace = window.innerWidth - preferredLeft - margin;
      const leftSpace = rect.left - gap - margin;
      const canOpenRight = rightSpace >= SOURCE_PANEL_MIN_WIDTH;
      const canOpenLeft = leftSpace >= SOURCE_PANEL_MIN_WIDTH;
      const left = canOpenRight || !canOpenLeft ? preferredLeft : margin;
      const right = canOpenRight || !canOpenLeft
        ? null
        : Math.max(margin, window.innerWidth - (rect.left - gap));
      const maxWidth = Math.min(
        SOURCE_PANEL_MAX_WIDTH,
        Math.max(
          SOURCE_PANEL_MIN_WIDTH,
          canOpenRight
            ? rightSpace
            : canOpenLeft
              ? leftSpace
              : window.innerWidth - margin * 2
        )
      );
      const top = Math.min(
        Math.max(margin, rect.top),
        Math.max(margin, window.innerHeight - SOURCE_PANEL_MAX_HEIGHT - margin)
      );

      return { left, maxWidth, right, top };
    },
    []
  );

  /** 클릭 지점의 소스 후보 목록으로 인스펙터 패널을 연다. */
  const showSourceInspectorForTarget = useCallback(
    (target: EventTarget | null, isPinned = false) => {
      const candidates = getSourceCandidates(target, sourceCandidateOptions).map(
        (candidate) => ({
          ...candidate,
          openUrl: getSourceOpenUrl(candidate.source, {
            ...sourceOpenOptions,
            omitPosition: !candidate.usesPosition,
          }),
        })
      );
      const firstCandidate = candidates[0];
      const rect = firstCandidate
        ? getSourceInspectorRect(firstCandidate.element)
        : null;

      if (!firstCandidate || !rect) {
        setSourceInspectorState(null);
        return [];
      }

      const { left, maxWidth, right, top } =
        getSourceInspectorPanelPosition(rect);
      setSourceInspectorState({
        candidates,
        isPinned,
        panelLeft: left,
        panelMaxWidth: maxWidth,
        panelRight: right,
        panelTop: top,
        rect,
      });
      return candidates;
    },
    [
      getSourceInspectorPanelPosition,
      getSourceInspectorRect,
      sourceCandidateOptions,
      sourceOpenOptions,
    ]
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
        candidates: [],
        isPinned: false,
        panelLeft: 0,
        panelMaxWidth: SOURCE_PANEL_MAX_WIDTH,
        panelRight: null,
        panelTop: 0,
        rect,
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
        setSourceInspectorState((current) =>
          current?.isPinned ? current : null
        );
        return;
      }

      setSourceInspectorState((current) =>
        current?.isPinned
          ? current
          : {
              candidates: [],
              isPinned: false,
              panelLeft: 0,
              panelMaxWidth: SOURCE_PANEL_MAX_WIDTH,
              panelRight: null,
              panelTop: 0,
              rect,
            }
      );
    },
    [getSourceInspectorRect, isSourceTreeHoverOutlineEnabled]
  );

  const clearSourceOutlineHover = useCallback(() => {
    // 고정(pinned)된 패널은 hover 해제로 닫지 않는다.
    setSourceInspectorState((current) => (current?.isPinned ? current : null));
  }, []);

  const openSourceCandidate = useCallback(
    (candidate: SourceInspectorCandidate) => {
      const didOpen = openSourceInEditor(candidate.source, {
        ...sourceOpenOptions,
        omitPosition: !candidate.usesPosition,
      });
      showToast(didOpen ? 'Source opened' : 'Source root required');
      clearSourceInspector();
    },
    [clearSourceInspector, showToast, sourceOpenOptions]
  );

  const cleanupSourceOpenShortcut = useCallback(() => {
    sourceShortcutCleanupRef.current?.();
    sourceShortcutCleanupRef.current = null;
  }, []);

  /**
   * target iframe 문서에 Alt(Option) 소스 선택 모드를 바인딩한다.
   * - Alt 누름: hover 요소의 소스 아웃라인 + data-font 힌트 오버레이 표시
   * - Alt+클릭: 후보 패널을 고정(pin) 상태로 오픈
   * - Escape/바깥 클릭/blur: 선택 모드와 패널 해제
   * iframe 이 새 문서로 바뀔 때마다 다시 호출해야 한다 (loadTargetFrame).
   */
  const bindSourceOpenShortcut = useCallback(() => {
    cleanupSourceOpenShortcut();

    let frameDocument: Document | null = null;
    try {
      frameDocument = iframeRef.current?.contentDocument ?? null;
    } catch {
      return;
    }

    if (!frameDocument || !isSourceInspectorEnabled) return;

    const frameRoot = frameDocument.head ?? frameDocument.documentElement;
    const frameBody = frameDocument.body ?? frameDocument.documentElement;
    if (!frameRoot || !frameBody) return;

    const optionAttribute = 'data-dfwr-source-option';
    const fontOverlayAttribute = 'data-dfwr-source-fonts';
    const style = frameDocument.createElement('style');
    style.dataset.dfwrSourceOpenShortcut = 'true';
    style.textContent = createSourceShortcutStyle(
      optionAttribute,
      fontOverlayAttribute,
    );

    frameRoot.append(style);

    const fontOverlay = frameDocument.createElement('div');
    fontOverlay.setAttribute(fontOverlayAttribute, 'true');
    fontOverlay.hidden = true;
    frameBody.append(fontOverlay);

    let hoveredElement: Element | null = null;
    let lastSourceTarget: EventTarget | null = null;
    let isSourceSelecting = false;
    let isSourcePanelPinned = false;

    // 요소와 하위의 data-font 값을 수집해 폰트 힌트로 보여준다.
    const getFontHints = (element: Element | null) => {
      if (!element) return [];

      const values: Array<{ tag: string; value: string }> = [];
      const addValue = (target: Element) => {
        const value = target.getAttribute('data-font')?.trim();
        const tag = target.tagName.toLowerCase();
        if (
          value &&
          !values.some((item) => item.tag === tag && item.value === value)
        ) {
          values.push({ tag, value });
        }
      };

      addValue(element);
      element.querySelectorAll('[data-font]').forEach(addValue);
      return values;
    };

    const updateFontOverlay = (element: Element | null) => {
      const values = isSourceSelecting ? getFontHints(element) : [];
      if (!values.length || !element) {
        fontOverlay.hidden = true;
        return;
      }

      const rect = element.getBoundingClientRect();
      const frameWidth = frameDocument.documentElement.clientWidth;
      const showAbove = rect.top > 48;
      const top = Math.max(4, showAbove ? rect.top : rect.bottom);

      fontOverlay.replaceChildren();
      fontOverlay.style.minWidth = '72px';
      fontOverlay.style.left = '4px';
      fontOverlay.style.top = `${top}px`;
      fontOverlay.style.transform = showAbove
        ? 'translateY(calc(-100% - 6px))'
        : 'translateY(6px)';
      // 너비 측정 전까지 숨겨서 좌표 보정 중 깜빡임을 막는다.
      fontOverlay.style.visibility = 'hidden';
      const rows = values.map(({ tag, value }) => {
        const row = frameDocument.createElement('span');
        const tagText = frameDocument.createElement('span');
        const valueText = frameDocument.createElement('span');
        tagText.textContent = tag;
        valueText.textContent = value;
        row.append(tagText, valueText);
        return row;
      });
      fontOverlay.append(...rows);
      fontOverlay.hidden = false;
      const overlayWidth = fontOverlay.getBoundingClientRect().width;
      const left = Math.max(
        4,
        Math.min(rect.left, frameWidth - overlayWidth - 4)
      );
      fontOverlay.style.left = `${left}px`;
      fontOverlay.style.visibility = '';
    };

    const setHoveredElement = (element: Element | null) => {
      hoveredElement = element;
      updateFontOverlay(element);
    };

    const setSourceSelecting = (isSelecting: boolean) => {
      isSourceSelecting = isSelecting;
      setTargetFigmaSourceSelectLocked(frameDocument, isSelecting);
      if (isSelecting) {
        isSourcePanelPinned = false;
        frameDocument.documentElement.setAttribute(optionAttribute, 'true');
        const candidate = showSourceOutlineForTarget(lastSourceTarget);
        setHoveredElement(candidate?.element ?? hoveredElement);
        return;
      }

      setHoveredElement(null);
      fontOverlay.hidden = true;
      frameDocument.documentElement.removeAttribute(optionAttribute);
      if (!isSourcePanelPinned && !sourceInspectorInteractionRef.current) {
        clearSourceInspector();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      // 팝업이 고정된 동안에는 마우스 이동으로 target 을 다시 추적하지 않는다.
      // (닫기/다른 곳 클릭 전까지 고정 유지)
      if (isSourcePanelPinned) return;

      lastSourceTarget = event.target;
      const candidates = getSourceCandidates(event.target, sourceCandidateOptions);
      const sourceElement = candidates[0]?.element ?? null;

      if (event.altKey && !isSourceSelecting) {
        setSourceSelecting(true);
      }

      if (isSourceSelecting && !isSourcePanelPinned) {
        showSourceOutlineForTarget(event.target);
      }

      setHoveredElement(isSourceSelecting ? sourceElement : null);
    };

    const handleClick = (event: MouseEvent) => {
      if (!isSourceSelecting && !event.altKey) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const candidates = showSourceInspectorForTarget(event.target, true);
      if (!candidates.length) {
        showToast('Source hint not found');
        isSourcePanelPinned = false;
        setSourceSelecting(false);
        return;
      }

      isSourcePanelPinned = true;
      setSourceSelecting(false);
    };

    const isOptionKeyEvent = (event: KeyboardEvent) =>
      event.key === 'Alt' ||
      event.code === 'AltLeft' ||
      event.code === 'AltRight' ||
      event.altKey;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        isSourcePanelPinned = false;
        setSourceSelecting(false);
        clearSourceInspector();
        return;
      }
      if (!isOptionKeyEvent(event)) return;
      // 팝업 고정 중에는 Option 키(반복 입력 포함)로 다시 추적하지 않는다.
      if (isSourcePanelPinned) return;

      onCancelReviewMode();
      setSourceSelecting(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isOptionKeyEvent(event) || !event.altKey) setSourceSelecting(false);
    };

    const handleBlur = () => {
      isSourcePanelPinned = false;
      setSourceSelecting(false);
    };

    const handleWindowPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('.df-review-source-popover')
      ) {
        sourceInspectorInteractionRef.current = true;
        return;
      }

      isSourcePanelPinned = false;
      sourceInspectorInteractionRef.current = false;
      setSourceSelecting(false);
      clearSourceInspector();
    };

    frameDocument.addEventListener('mousemove', handleMouseMove, true);
    frameDocument.addEventListener('click', handleClick, true);
    frameDocument.addEventListener('keydown', handleKeyDown, true);
    frameDocument.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pointerdown', handleWindowPointerDown, true);

    sourceShortcutCleanupRef.current = () => {
      frameDocument.removeEventListener('mousemove', handleMouseMove, true);
      frameDocument.removeEventListener('click', handleClick, true);
      frameDocument.removeEventListener('keydown', handleKeyDown, true);
      frameDocument.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pointerdown', handleWindowPointerDown, true);
      isSourcePanelPinned = false;
      setSourceSelecting(false);
      style.remove();
      fontOverlay.remove();
    };
  }, [
    onCancelReviewMode,
    clearSourceInspector,
    cleanupSourceOpenShortcut,
    iframeRef,
    isSourceInspectorEnabled,
    showToast,
    sourceCandidateOptions,
    showSourceOutlineForTarget,
    showSourceInspectorForTarget,
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
    openSourceCandidate,
    showSourceOutlineForElement,
    sourceInspectorInteractionRef,
    sourceInspectorState,
  };
}

export type ReviewSourceInspectorController = ReturnType<
  typeof useReviewSourceInspector
>;
