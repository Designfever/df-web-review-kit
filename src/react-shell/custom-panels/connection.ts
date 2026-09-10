import {
  PANEL_ENDPOINT, PANEL_READY_EVENT, isValidPanelDefinition, notifyPanelListener,
  type PanelFrame, type PanelRegistration,
} from './protocol';
import type {
  ReviewCustomPanelConnection, ReviewCustomPanelDefinition, ReviewCustomPanelSnapshot,
} from './types';

/** Connect from a target browser effect. No DOM selectors or parent React root needed. */
export function connectReviewCustomPanel(
  definition: ReviewCustomPanelDefinition,
  options: { targetWindow?: Window } = {},
): ReviewCustomPanelConnection {
  let snapshot: ReviewCustomPanelSnapshot = Object.freeze({ status: 'waiting', container: null, visible: false });
  const listeners = new Set<() => void>();
  let registration: PanelRegistration | null = null;
  let frame: PanelFrame | null = null;
  let target: Window | undefined = options.targetWindow ??
    (typeof window === 'undefined' ? undefined : window);
  let targetDocument: Document | null = null;
  let terminal = false;
  let listeningToTarget = false;

  const emit = (next: ReviewCustomPanelSnapshot) => {
    if (terminal) return;
    if (snapshot.status === next.status && snapshot.container === next.container &&
        snapshot.visible === next.visible &&
        ('reason' in snapshot ? snapshot.reason : undefined) ===
        ('reason' in next ? next.reason : undefined)) return;
    snapshot = Object.freeze(next);
    for (const listener of [...listeners]) notifyPanelListener(listener);
  };
  const stopListening = () => {
    frame?.removeEventListener(PANEL_READY_EVENT, discover);
    if (listeningToTarget) {
      try {
        target?.removeEventListener('pageshow', discover);
        target?.removeEventListener('pagehide', onPageHide);
      } catch { /* A navigated WindowProxy may no longer be same-origin. */ }
      listeningToTarget = false;
    }
  };
  const fail = (next: ReviewCustomPanelSnapshot) => {
    emit(next);
    terminal = true;
    stopListening();
    frame = null;
    targetDocument = null;
    target = undefined;
  };
  const receive = (next: ReviewCustomPanelSnapshot) => {
    if (next.status !== 'ready') registration = null;
    if (next.status === 'error' || next.status === 'unavailable') fail(next);
    else emit(next);
  };
  function onPageHide() {
    const old = registration;
    registration = null;
    old?.dispose();
    if (!terminal) emit({ status: 'waiting', container: null, visible: false });
  }
  function discover() {
    if (terminal || registration || !frame || !target || !targetDocument) return;
    const endpoint = frame[PANEL_ENDPOINT];
    if (!endpoint) return;
    if (endpoint.version !== 1 || typeof endpoint.register !== 'function') {
      fail({ status: 'unavailable', container: null, visible: false, reason: 'incompatible' });
      return;
    }
    // Install the handle before publishing initial readiness: a subscriber may open
    // or dispose immediately from its ready notification.
    let registering = true;
    let initial: ReviewCustomPanelSnapshot | undefined;
    const next = endpoint.register(target, targetDocument, definition, state => {
      if (registering) initial = state;
      else receive(state);
    });
    registration = next;
    registering = false;
    if (initial) receive(initial);
    if (terminal) next?.dispose();
  }

  if (!isValidPanelDefinition(definition)) {
    fail({ status: 'error', container: null, visible: false, reason: 'invalid-definition' });
  } else if (!target) {
    fail({ status: 'unavailable', container: null, visible: false, reason: 'not-target' });
  } else {
    // Freeze caller metadata by copying, without depending on cross-realm constructors.
    definition = { ...definition, icon: definition.icon && {
      viewBox: definition.icon.viewBox, paths: [...definition.icon.paths],
    } };
    try {
      targetDocument = target.document;
      if (target.parent === target) {
        fail({ status: 'unavailable', container: null, visible: false, reason: 'not-target' });
      } else {
        // Accessing parent.document detects cross-origin even if frameElement returns null.
        void target.parent.document;
        frame = target.frameElement as PanelFrame | null;
        if (!frame || frame.tagName !== 'IFRAME') {
          fail({ status: 'unavailable', container: null, visible: false, reason: 'not-target' });
        } else {
          frame.addEventListener(PANEL_READY_EVENT, discover);
          target.addEventListener('pageshow', discover);
          target.addEventListener('pagehide', onPageHide);
          listeningToTarget = true;
          discover();
        }
      }
    } catch {
      fail({ status: 'unavailable', container: null, visible: false, reason: 'cross-origin' });
    }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      if (snapshot.status !== 'disposed') listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    open: () => registration?.open(),
    close: () => registration?.close(),
    dispose() {
      if (snapshot.status === 'disposed') return;
      terminal = true;
      stopListening();
      const old = registration;
      registration = null;
      old?.dispose();
      frame = null;
      targetDocument = null;
      target = undefined;
      snapshot = Object.freeze({ status: 'disposed', container: null, visible: false });
      for (const listener of [...listeners]) notifyPanelListener(listener);
      listeners.clear();
    },
  };
}
