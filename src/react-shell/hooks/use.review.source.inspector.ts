// shell.tsx 에서 분리한 소스 인스펙터 훅.
// 담당 범위:
// - 소스 탐색 hover outline 상태와 위치 계산
// - Alt(Option) 단축키로 target iframe 안에서 소스 후보를 추적/클릭하는
//   바인딩 (bindSourceOpenShortcut) — 폰트 힌트 오버레이 포함
// - Source Tree 패널 hover 시 요소 아웃라인 표시
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { createSourceShortcutStyle } from '../review/source.shortcut.style';
import type {
  SourceInspectorRect,
  SourceInspectorState,
} from '../review/source.inspector.overlay';
import {
  getSourceCandidates,
  type GetSourceCandidatesOptions,
} from '../source.open';
import { setTargetFigmaSourceSelectLocked } from '../target/target';
import { useReviewToast } from './use.review.toast';

export function useReviewSourceInspector({
  frameScrollRef,
  iframeRef,
  isSourceTreeHoverOutlineEnabled,
  sourceCandidateOptions,
  targetSrc,
  onCancelReviewMode,
  onRequestSourceTreeFocus,
}: {
  frameScrollRef: RefObject<HTMLDivElement | null>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isSourceTreeHoverOutlineEnabled: boolean;
  sourceCandidateOptions: GetSourceCandidatesOptions;
  /** target 주소가 바뀌면 새 문서에 단축키를 다시 바인딩한다. */
  targetSrc: string;
  onCancelReviewMode: () => boolean;
  onRequestSourceTreeFocus?: (element: Element) => void;
}) {
  const showToast = useReviewToast();
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

    let frameDocument: Document | null = null;
    try {
      frameDocument = iframeRef.current?.contentDocument ?? null;
    } catch {
      return;
    }

    if (!frameDocument) return;

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
        frameDocument.documentElement.setAttribute(optionAttribute, 'true');
        const candidate = showSourceOutlineForTarget(lastSourceTarget);
        setHoveredElement(candidate?.element ?? hoveredElement);
        return;
      }

      setHoveredElement(null);
      fontOverlay.hidden = true;
      frameDocument.documentElement.removeAttribute(optionAttribute);
      clearSourceInspector();
    };

    const handleTargetPointerMove = (event: MouseEvent | PointerEvent) => {
      lastSourceTarget = event.target;
      const candidates = getSourceCandidates(
        event.target,
        sourceCandidateOptions
      );
      const sourceElement = candidates[0]?.element ?? null;

      if (event.altKey && !isSourceSelecting) {
        setSourceSelecting(true);
      }

      if (isSourceSelecting) {
        showSourceOutlineForTarget(event.target);
      }

      setHoveredElement(isSourceSelecting ? sourceElement : null);
    };

    const selectSourceTreeEntry = (event: MouseEvent) => {
      if (!isSourceSelecting && !event.altKey) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const candidates = getSourceCandidates(
        event.target,
        sourceCandidateOptions
      );
      const candidate = candidates
        .filter((item) => item.kind !== 'data')
        .sort((a, b) => a.depth - b.depth)[0] ?? candidates[0];
      if (!candidate) {
        showToast('Source hint not found');
        setSourceSelecting(false);
        return;
      }

      onRequestSourceTreeFocus?.(candidate.element);
      setSourceSelecting(false);
    };

    const handleClick = (event: MouseEvent) => {
      selectSourceTreeEntry(event);
    };

    const isOptionKeyEvent = (event: KeyboardEvent) =>
      event.key === 'Alt' ||
      event.code === 'AltLeft' ||
      event.code === 'AltRight' ||
      event.altKey;

    const getActiveDomSelectButton = () => {
      const activeElement = document.activeElement;
      return (
        activeElement instanceof HTMLButtonElement &&
        activeElement.matches(
          '.df-review-section-outline-link.is-dom-select'
        )
          ? activeElement
          : null
      );
    };

    const blurDomSelectButton = () => {
      getActiveDomSelectButton()?.blur();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancelReviewMode();
        setSourceSelecting(false);
        clearSourceInspector();
        blurDomSelectButton();
        return;
      }
      if (!isOptionKeyEvent(event)) return;

      onCancelReviewMode();
      setSourceSelecting(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isOptionKeyEvent(event) || !event.altKey) setSourceSelecting(false);
    };

    const handleBlur = () => {
      setSourceSelecting(false);
    };

    const handleWindowPointerDown = (event: PointerEvent) => {
      setSourceSelecting(false);

      const activeElement = getActiveDomSelectButton();
      if (!activeElement || event.composedPath().includes(activeElement)) {
        return;
      }

      const isComposerClick = event.composedPath().some((target) => {
        if (!(target instanceof Element)) return false;
        return Boolean(
          target.closest('.df-review-qa-draft-host, .dfwr-dom-popover')
        );
      });
      if (isComposerClick) return;

      onCancelReviewMode();
      activeElement.blur();
    };

    frameDocument.addEventListener('mousemove', handleTargetPointerMove, true);
    frameDocument.addEventListener('pointermove', handleTargetPointerMove, true);
    frameDocument.addEventListener('click', handleClick, true);
    frameDocument.addEventListener('keydown', handleKeyDown, true);
    frameDocument.addEventListener('keyup', handleKeyUp, true);
    frameDocument.addEventListener(
      'pointerdown',
      handleWindowPointerDown,
      true
    );
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pointerdown', handleWindowPointerDown, true);

    sourceShortcutCleanupRef.current = () => {
      frameDocument.removeEventListener(
        'mousemove',
        handleTargetPointerMove,
        true
      );
      frameDocument.removeEventListener(
        'pointermove',
        handleTargetPointerMove,
        true
      );
      frameDocument.removeEventListener('click', handleClick, true);
      frameDocument.removeEventListener('keydown', handleKeyDown, true);
      frameDocument.removeEventListener('keyup', handleKeyUp, true);
      frameDocument.removeEventListener(
        'pointerdown',
        handleWindowPointerDown,
        true
      );
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pointerdown', handleWindowPointerDown, true);
      setSourceSelecting(false);
      blurDomSelectButton();
      style.remove();
      fontOverlay.remove();
    };
  }, [
    onCancelReviewMode,
    clearSourceInspector,
    cleanupSourceOpenShortcut,
    iframeRef,
    onRequestSourceTreeFocus,
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
    selectSourceOutlineForElement,
    showSourceOutlineForElement,
    sourceInspectorState,
  };
}

export type ReviewSourceInspectorController = ReturnType<
  typeof useReviewSourceInspector
>;
