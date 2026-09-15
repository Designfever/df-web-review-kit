import { getSourceCandidates, type GetSourceCandidatesOptions } from './source.open';
import { setTargetFigmaSourceSelectLocked } from '../target/target';
import { createSourceFontOverlay } from './source.font.overlay';

/** Binds one iframe document; the hook owns hover, selection and popup state. */
export function bindSourceSelectionEvents({
  frameDocument,
  hostWindow,
  sourceCandidateOptions,
  showSourceOutlineForTarget,
  selectSourceOutlineForElement,
  clearSourceInspector,
  onCancelReviewMode,
  onRequestSourceTreeFocus,
  showToast,
}: {
  frameDocument: Document;
  hostWindow: Window & typeof globalThis;
  sourceCandidateOptions: GetSourceCandidatesOptions;
  showSourceOutlineForTarget: (target: EventTarget | null) => { element: Element } | null;
  selectSourceOutlineForElement: (element: Element) => void;
  clearSourceInspector: () => void;
  onCancelReviewMode: () => boolean;
  onRequestSourceTreeFocus?: (element: Element) => void;
  showToast: (message: string) => void;
}) {
  const optionAttribute = 'data-dfwr-source-option';
  const fontOverlay = createSourceFontOverlay(frameDocument, optionAttribute);
  if (!fontOverlay) return undefined;

  let hoveredElement: Element | null = null;
  let lastSourceTarget: EventTarget | null = null;
  let isSourceSelecting = false;

  const setHoveredElement = (element: Element | null) => {
    hoveredElement = element;
    fontOverlay.update(element, isSourceSelecting);
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
    fontOverlay.hide();
    frameDocument.documentElement.removeAttribute(optionAttribute);
    clearSourceInspector();
  };

  const handleTargetPointerMove = (event: MouseEvent | PointerEvent) => {
    if (frameDocument.documentElement.hasAttribute('data-df-review-design-inspecting')) return;
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
    if (frameDocument.documentElement.hasAttribute('data-df-review-design-inspecting')) return;
    if (!isSourceSelecting && !event.altKey) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // 첫 click의 event.target이 아직 Figma overlay여도 pointer lock을 적용한
    // 뒤 같은 좌표를 다시 hit-test해 실제 DOM element를 선택한다.
    setTargetFigmaSourceSelectLocked(frameDocument, true);
    const sourceTarget =
      frameDocument.elementFromPoint(event.clientX, event.clientY) ??
      event.target;
    const candidates = getSourceCandidates(
      sourceTarget,
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

    selectSourceOutlineForElement(candidate.element);
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
    const activeElement = hostWindow.document.activeElement;
    return (
      activeElement instanceof hostWindow.HTMLButtonElement &&
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
    if (frameDocument.documentElement.hasAttribute('data-df-review-design-inspecting')) return;
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
    const isTargetDocumentPointerDown = event.currentTarget === frameDocument;
    if (
      isTargetDocumentPointerDown &&
      (isSourceSelecting || event.altKey)
    ) {
      return;
    }

    setSourceSelecting(false);

    const activeElement = getActiveDomSelectButton();
    if (!activeElement || event.composedPath().includes(activeElement)) {
      return;
    }

    const isComposerClick = event.composedPath().some((target) => {
      if (!(target instanceof hostWindow.Element)) return false;
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
  hostWindow.addEventListener('keydown', handleKeyDown, true);
  hostWindow.addEventListener('keyup', handleKeyUp, true);
  hostWindow.addEventListener('blur', handleBlur);
  hostWindow.addEventListener('pointerdown', handleWindowPointerDown, true);

  return () => {
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
    hostWindow.removeEventListener('keydown', handleKeyDown, true);
    hostWindow.removeEventListener('keyup', handleKeyUp, true);
    hostWindow.removeEventListener('blur', handleBlur);
    hostWindow.removeEventListener('pointerdown', handleWindowPointerDown, true);
    setSourceSelecting(false);
    blurDomSelectButton();
    fontOverlay.destroy();
  };
}
