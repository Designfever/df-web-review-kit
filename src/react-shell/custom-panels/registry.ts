import type { ReviewShellStore } from '../store/create.review.shell.store';
import {
  PANEL_ENDPOINT, announcePanelEndpoint, isValidPanelDefinition, notifyPanelListener,
  type PanelEndpoint, type PanelFrame,
} from './protocol';
import type { ReviewCustomPanelDefinition, ReviewCustomPanelSnapshot } from './types';

interface CustomPanelEntry {
  definition: ReviewCustomPanelDefinition;
  container: HTMLElement;
}
interface Registration extends CustomPanelEntry {
  notify: (snapshot: ReviewCustomPanelSnapshot) => void;
  visible: boolean;
  button: HTMLButtonElement | null;
}

/** Shell-instance owner. DOM is deliberately not owned by the target React root. */
export function createCustomPanelRegistry(store: ReviewShellStore) {
  let enabled = false;
  let started = false;
  let host: HTMLElement | null = null;
  let frame: PanelFrame | null = null;
  let document: Document | null = null;
  let blockedDocument: Document | null = null;
  let targetWindow: Window | null = null;
  let unsubscribeStore: (() => void) | null = null;
  const registrations = new Map<string, Registration>();
  const listeners = new Set<() => void>();
  let entries: readonly CustomPanelEntry[] = [];
  const prefix = `df-review-custom-${Math.random().toString(36).slice(2)}`;
  let nextId = 0;

  const publish = () => {
    entries = [...registrations.values()];
    for (const listener of [...listeners]) notifyPanelListener(listener);
  };
  const focusOutside = (entry: Registration, removing: boolean) => {
    if (!entry.container.contains(entry.container.ownerDocument.activeElement)) return;
    const fallback = host?.closest('.df-review-shell')?.querySelector<HTMLButtonElement>(
      'button[aria-controls="df-review-design-inspector"]',
    );
    (removing ? fallback : entry.button ?? fallback)?.focus();
  };
  const remove = (id: string, entry: Registration) => {
    if (registrations.get(id) !== entry) return;
    registrations.delete(id); // old handle cannot remove a newer owner
    focusOutside(entry, true);
    notifyPanelListener(() => entry.notify({ status: 'waiting', container: null, visible: false }));
    entry.container.remove();
    entry.button = null;
    if (store.getState().sidePanel === `custom:${id}`) {
      store.setState({ sidePanel: 'qa', isListVisible: false });
    }
    publish();
  };
  const clear = () => {
    for (const [id, entry] of [...registrations]) remove(id, entry);
  };
  const syncVisibility = () => {
    const state = store.getState();
    for (const [id, entry] of registrations) {
      const visible = state.isListVisible && state.sidePanel === `custom:${id}`;
      if (entry.visible === visible) continue;
      if (!visible) focusOutside(entry, false);
      entry.visible = visible;
      entry.container.hidden = !visible;
      notifyPanelListener(() => entry.notify({ status: 'ready', container: entry.container, visible }));
    }
  };
  const invalidate = () => {
    blockedDocument = document;
    clear();
  };
  const onPageShow = () => {
    blockedDocument = null;
    reconcile();
    if (frame) announcePanelEndpoint(frame);
  };
  const unwatchDocument = () => {
    try {
      targetWindow?.removeEventListener('pagehide', invalidate);
      targetWindow?.removeEventListener('pageshow', onPageShow);
    } catch { /* Old document was replaced by a cross-origin navigation. */ }
    targetWindow = null;
    document = null;
  };
  function reconcile() {
    let next: Document | null = null;
    try { next = frame?.contentDocument ?? null; } catch { /* cross-origin */ }
    if (next === document) return;
    clear();
    unwatchDocument();
    blockedDocument = null;
    document = next;
    targetWindow = next?.defaultView ?? null;
    targetWindow?.addEventListener('pagehide', invalidate);
    targetWindow?.addEventListener('pageshow', onPageShow);
  }
  const onLoad = () => {
    reconcile();
    if (frame) announcePanelEndpoint(frame);
  };
  const endpoint: PanelEndpoint = {
    version: 1,
    register(target, owner, definition, notify) {
      const unavailable = (reason: 'not-target' | 'cross-origin' | 'disabled') => {
        notify({ status: 'unavailable', container: null, visible: false, reason });
        return null;
      };
      if (!started || !frame) return null;
      reconcile();
      try {
        if (frame.contentWindow !== target || frame.contentDocument !== owner ||
            owner !== document) return unavailable('not-target');
        if (target.parent.document !== frame.ownerDocument) return unavailable('not-target');
      } catch { return unavailable('cross-origin'); }
      // A pagehide may precede pageshow listeners in either realm. Stay pending
      // until reconciliation; never re-register the revoked document early.
      if (owner === blockedDocument) return null;
      if (!enabled) return unavailable('disabled');
      if (!host?.isConnected) return null; // ready event retries when the host commits
      if (!isValidPanelDefinition(definition)) {
        notify({ status: 'error', container: null, visible: false, reason: 'invalid-definition' });
        return null;
      }
      if (registrations.has(definition.id)) {
        notify({ status: 'error', container: null, visible: false, reason: 'duplicate-id' });
        return null;
      }
      const metadata: ReviewCustomPanelDefinition = {
        ...definition,
        icon: definition.icon && { ...definition.icon, paths: [...definition.icon.paths] },
      };
      const container = host.ownerDocument.createElement('section');
      container.id = `${prefix}-${++nextId}`;
      container.className = 'df-review-custom-panel';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', metadata.label);
      container.hidden = true;
      host.append(container);
      const entry: Registration = {
        definition: metadata, container, notify, visible: false, button: null,
      };
      registrations.set(metadata.id, entry);
      publish();
      notify({ status: 'ready', container, visible: false });
      const owns = () => registrations.get(metadata.id) === entry;
      return {
        open() {
          if (owns()) store.setState({ sidePanel: `custom:${metadata.id}`, isListVisible: true });
        },
        close() {
          if (owns() && store.getState().sidePanel === `custom:${metadata.id}`) {
            store.getState().setIsListVisible(false);
          }
        },
        dispose: () => remove(metadata.id, entry),
      };
    },
  };
  const detachFrame = () => {
    if (frame) {
      frame.removeEventListener('load', onLoad);
      if (frame[PANEL_ENDPOINT] === endpoint) delete frame[PANEL_ENDPOINT];
    }
    clear();
    unwatchDocument();
    blockedDocument = null;
  };
  const attachFrame = () => {
    if (!started || !frame) return;
    frame[PANEL_ENDPOINT] = endpoint;
    frame.addEventListener('load', onLoad);
    reconcile();
    announcePanelEndpoint(frame);
  };
  return {
    getSnapshot: () => entries,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    start() {
      if (started) return;
      started = true;
      unsubscribeStore = store.subscribe(syncVisibility);
      attachFrame();
    },
    stop() {
      if (!started) return;
      started = false;
      unsubscribeStore?.();
      unsubscribeStore = null;
      detachFrame();
    },
    setEnabled(value: boolean) {
      if (enabled === value) return;
      enabled = value;
      if (!value) clear();
      if (started && frame) announcePanelEndpoint(frame);
    },
    setHost(value: HTMLElement | null) {
      if (host === value) return;
      clear();
      host = value;
      if (started && frame) announcePanelEndpoint(frame);
    },
    setFrame(value: HTMLIFrameElement | null) {
      if (frame === value) return;
      detachFrame();
      frame = value;
      attachFrame();
    },
    setButton(id: string, button: HTMLButtonElement | null) {
      const entry = registrations.get(id);
      if (entry) entry.button = button;
    },
    toggle(id: string) {
      if (!registrations.has(id)) return;
      const state = store.getState();
      store.setState({
        sidePanel: `custom:${id}`,
        isListVisible: state.sidePanel === `custom:${id}` ? !state.isListVisible : true,
      });
    },
    invalidate,
  };
}
export type CustomPanelRegistry = ReturnType<typeof createCustomPanelRegistry>;
