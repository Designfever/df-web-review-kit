import { isElement } from './dom';

/** Event policy for one iframe document. All mutable inspection state stays in the controller. */
export function bindDesignInspectorTargetEvents(eventDoc: Document, {
  isPicking, isInside, getSelected, sourceEnabled,
  onHover, onSelect, onOpenSource, onAltChange, onLeave, onPageHide,
  onViewportChange, schedule, invalidate,
}: {
  isPicking(): boolean;
  isInside(event: Event): boolean;
  getSelected(): Element | null;
  sourceEnabled: boolean;
  onHover(element: Element | null, point: { x: number; y: number }, alt: boolean): void;
  onSelect(element: Element, alt: boolean): void;
  onOpenSource(): void;
  onAltChange(alt: boolean): void;
  onLeave(clearPoint: boolean): void;
  onPageHide(): void;
  onViewportChange(readStyles: boolean): void;
  schedule(): void;
  invalidate(): void;
}): () => void {
  const eventWin = eventDoc.defaultView!;
  const cleanups: (() => void)[] = [];
  const listenTarget = (
    target: EventTarget,
    name: string,
    callback: EventListener,
    options?: AddEventListenerOptions,
  ) => {
    target.addEventListener(name, callback, options);
    cleanups.push(() => target.removeEventListener(name, callback, options));
  };
  const targetOf = (event: Event) =>
    isInside(event) ? null : event.composedPath().find(isElement) ?? null;
  listenTarget(
    eventDoc,
    'pointermove',
    (event) => {
      const pointer = event as PointerEvent;
      if (!isPicking() || pointer.pointerType === 'touch' || isInside(event)) return;
      onHover(targetOf(event), { x: pointer.clientX, y: pointer.clientY }, pointer.altKey);
    },
    { capture: true, passive: true }
  );
  listenTarget(
    eventDoc,
    'pointerdown',
    (event) => {
      if (!isPicking() || isInside(event)) return;
      // Keep touch scrolling native. Selection is completed on click, not touchstart.
      if ((event as PointerEvent).pointerType !== 'touch') event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true }
  );
  listenTarget(
    eventDoc,
    'click',
    (event) => {
      if (!isPicking() || isInside(event)) return;
      const element = targetOf(event);
      if (!element) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onSelect(element, (event as MouseEvent).altKey);
    },
    { capture: true }
  );
  listenTarget(
    eventDoc,
    'dblclick',
    (event) => {
      if (!isPicking() || isInside(event)) return;
      const element = targetOf(event);
      if (!element || element !== getSelected() || !sourceEnabled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onOpenSource();
    },
    { capture: true }
  );
  listenTarget(eventDoc, 'keydown', (event) => {
    onAltChange((event as KeyboardEvent).altKey);
  });
  listenTarget(eventDoc, 'keyup', (event) => {
    onAltChange((event as KeyboardEvent).altKey);
  });
  listenTarget(eventWin, 'blur', () => {
    onLeave(false);
  });
  listenTarget(eventDoc, 'pointerout', (event) => {
    if ((event as MouseEvent).relatedTarget) return;
    onLeave(true);
  }, { capture: true });
  listenTarget(eventWin, 'pagehide', onPageHide);
  listenTarget(
    eventDoc,
    'scroll',
    (event) => {
      if (isInside(event)) return;
      onViewportChange(false);
    },
    { capture: true, passive: true }
  );
  listenTarget(
    eventWin,
    'resize',
    () => {
      onViewportChange(true);
    },
    { passive: true }
  );
  if (eventWin.visualViewport) {
    listenTarget(eventWin.visualViewport, 'resize', invalidate, { passive: true });
    listenTarget(eventWin.visualViewport, 'scroll', () => schedule(), { passive: true });
  }
  for (const name of [
    'transitionend',
    'animationend',
    'input',
    'change',
    'focusin',
    'focusout'
  ]) {
    listenTarget(
      eventDoc,
      name,
      (event) => {
        if (!isInside(event)) invalidate();
      },
      { capture: true, passive: true }
    );
  }
  if (eventDoc.fonts) listenTarget(eventDoc.fonts, 'loadingdone', invalidate);
  return () => cleanups.splice(0).forEach((cleanup) => cleanup());
}
