import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createReviewShellStore } from '../store/create.review.shell.store';
import { connectReviewCustomPanel } from './connection';
import { createCustomPanelRegistry } from './registry';
import { PANEL_ENDPOINT, type PanelFrame } from './protocol';
import type { ReviewCustomPanelConnection } from './types';

function setup(start = true) {
  const store = createReviewShellStore({ target: {
    activeRoute: '/', draftTarget: '/', frameNavigationVersion: 0, frameTarget: '/',
    size: { label: 'MO', width: 390, height: 844 }, source: 'local', target: '/',
    targetOverlayState: { grid: false, figma: false },
  } });
  const shell = document.createElement('div');
  shell.className = 'df-review-shell';
  const fallback = document.createElement('button');
  fallback.setAttribute('aria-controls', 'df-review-design-inspector');
  const host = document.createElement('div');
  const frame: PanelFrame = document.createElement('iframe');
  shell.append(fallback, host, frame);
  document.body.append(shell);
  const registry = createCustomPanelRegistry(store);
  registry.setEnabled(true);
  registry.setHost(host);
  registry.setFrame(frame);
  if (start) registry.start();
  const connections: ReviewCustomPanelConnection[] = [];
  const connect = (id = 'demo.controls', targetWindow = frame.contentWindow!) => {
    const connection = connectReviewCustomPanel({ id, label: id }, { targetWindow });
    connections.push(connection);
    return connection;
  };
  const cleanup = () => {
    connections.forEach(connection => connection.dispose());
    registry.stop();
    shell.remove();
  };
  return { store, shell, fallback, host, frame, registry, connect, cleanup };
}
function containerOf(connection: ReviewCustomPanelConnection) {
  const state = connection.getSnapshot();
  expect(state.status).toBe('ready');
  if (state.status !== 'ready') throw new Error('Expected ready');
  return state.container;
}

const cleanups: (() => void)[] = [];
const fixture = (start = true) => {
  const result = setup(start);
  cleanups.push(result.cleanup);
  return result;
};

beforeEach(() => {
  const storage = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value); },
    removeItem: (key: string) => { storage.delete(key); },
  } });
});
afterEach(() => { cleanups.splice(0).reverse().forEach(cleanup => cleanup()); });

describe('custom panel connection and registry lifecycle', () => {
  it.each([true, false])('registers with host-first=%s, snapshots stay stable, hidden container is connected', start => {
    const { registry, connect, frame } = fixture(start);
    const connection = connect();
    const notify = vi.fn();
    connection.subscribe(notify);
    if (!start) {
      expect(connection.getSnapshot().status).toBe('waiting');
      registry.start();
      expect(notify).toHaveBeenCalledTimes(1);
    }
    const container = containerOf(connection);
    expect(container.isConnected).toBe(true);
    expect(container.ownerDocument).toBe(document);
    expect(container.ownerDocument).not.toBe(frame.contentDocument);
    expect(container.hidden).toBe(true);
    expect(connection.getSnapshot()).toBe(connection.getSnapshot());
    expect(Object.isFrozen(connection.getSnapshot())).toBe(true);
    expect(registry.getSnapshot()).toBe(registry.getSnapshot());
  });

  it('allows opening immediately from a delayed ready notification', () => {
    const { registry, connect } = fixture(false);
    const connection = connect();
    connection.subscribe(() => {
      if (connection.getSnapshot().status === 'ready') connection.open();
    });
    registry.start();
    expect(connection.getSnapshot()).toMatchObject({ status: 'ready', visible: true });
  });

  it('allows disposing from readiness without leaking a registration', () => {
    const { registry, connect } = fixture(false);
    const connection = connect();
    connection.subscribe(() => {
      if (connection.getSnapshot().status === 'ready') connection.dispose();
    });
    registry.start();
    expect(connection.getSnapshot().status).toBe('disposed');
    expect(registry.getSnapshot()).toHaveLength(0);
  });

  it('isolates a throwing subscriber from other listeners and cleanup', () => {
    const { registry, connect } = fixture();
    const connection = connect();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const listener = vi.fn();
    connection.subscribe(() => { throw new Error('consumer failed'); });
    connection.subscribe(listener);
    connection.open();
    connection.dispose();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledTimes(2);
    expect(registry.getSnapshot()).toHaveLength(0);
  });

  it('waits for a committed host before delivering a mount container', () => {
    const { registry, host, connect } = fixture();
    registry.setHost(null);
    const connection = connect();
    expect(connection.getSnapshot().status).toBe('waiting');
    registry.setHost(host);
    expect(containerOf(connection).isConnected).toBe(true);
  });

  it('shares exclusive selection with every built-in, preserving hidden DOM and values', () => {
    const { registry, store, connect } = fixture();
    const connection = connect();
    const container = containerOf(connection);
    const input = document.createElement('input');
    input.value = 'unsaved';
    container.append(input);
    for (const builtIn of ['qa', 'source', 'figma-images', 'design-inspector'] as const) {
      connection.open();
      expect(container.hidden).toBe(false);
      expect(store.getState().sidePanel).toBe('custom:demo.controls');
      store.getState().setSidePanel(builtIn);
      expect(container.hidden).toBe(true);
      expect(containerOf(connection)).toBe(container);
      expect(input.value).toBe('unsaved');
    }
    registry.toggle('demo.controls');
    expect(container.hidden).toBe(false);
    registry.toggle('demo.controls');
    expect(container.hidden).toBe(true);
    expect(store.getState().isListVisible).toBe(false);
  });

  it('registers in order and rejects duplicate/invalid IDs without replacing the owner', () => {
    const { registry, connect } = fixture();
    const original = connect();
    const container = containerOf(original);
    const duplicate = connect();
    expect(duplicate.getSnapshot()).toMatchObject({ status: 'error', reason: 'duplicate-id' });
    duplicate.dispose();
    expect(containerOf(original)).toBe(container);
    expect(connect('qa').getSnapshot()).toMatchObject({ status: 'error', reason: 'invalid-definition' });
    connect('demo.other');
    expect(registry.getSnapshot().map(entry => entry.definition.id)).toEqual(['demo.controls', 'demo.other']);
    original.dispose();
    const fresh = connect();
    original.dispose(); // stale handle must not remove fresh owner
    expect(containerOf(fresh)).not.toBe(container);
    expect(registry.getSnapshot()).toHaveLength(2);
  });

  it('disposes active registration to QA closed, inactive removal leaves selection untouched', () => {
    const { store, connect, registry } = fixture();
    const first = connect();
    const second = connect('demo.other');
    const secondContainer = containerOf(second);
    first.open();
    second.close();
    second.dispose();
    expect(secondContainer.isConnected).toBe(false);
    expect(store.getState().sidePanel).toBe('custom:demo.controls');
    const notified = vi.fn();
    first.subscribe(notified);
    first.dispose(); first.dispose();
    expect(first.getSnapshot().status).toBe('disposed');
    expect(notified).toHaveBeenCalledTimes(1);
    expect(store.getState()).toMatchObject({ sidePanel: 'qa', isListVisible: false });
    expect(registry.getSnapshot()).toHaveLength(0);
  });

  it('returns focus to the rail on hide and a built-in on removal', () => {
    const { registry, shell, fallback, connect } = fixture();
    const connection = connect();
    const container = containerOf(connection);
    const input = document.createElement('input');
    const button = document.createElement('button');
    shell.append(button); container.append(input);
    registry.setButton('demo.controls', button);
    connection.open(); input.focus(); connection.close();
    expect(document.activeElement).toBe(button);
    connection.open(); input.focus(); connection.dispose();
    expect(document.activeElement).toBe(fallback);
  });

  it('reconnects surviving target on host restart, without keeping old containers', () => {
    const { registry, connect, frame } = fixture();
    const connection = connect();
    const old = containerOf(connection);
    registry.stop();
    expect(frame[PANEL_ENDPOINT]).toBeUndefined();
    expect(old.isConnected).toBe(false);
    expect(connection.getSnapshot().status).toBe('waiting');
    registry.start();
    expect(containerOf(connection)).not.toBe(old);
    expect(registry.getSnapshot()).toHaveLength(1);
  });

  it('revokes before controlled reload and rejects the old Document token', () => {
    const { registry, frame, connect } = fixture();
    const connection = connect();
    const old = containerOf(connection);
    registry.invalidate();
    expect(old.isConnected).toBe(false);
    expect(registry.getSnapshot()).toHaveLength(0);
    const notify = vi.fn();
    expect(frame[PANEL_ENDPOINT]!.register(frame.contentWindow!, frame.contentDocument!,
      { id: 'demo.stale', label: 'Stale' }, notify)).toBeNull();
    expect(notify).not.toHaveBeenCalled();
    expect(registry.getSnapshot()).toHaveLength(0);
  });

  it.each([true, false])('handles pagehide/pageshow with host-first=%s', start => {
    const { registry, frame, connect } = fixture(start);
    const connection = connect();
    if (!start) registry.start();
    const old = containerOf(connection);
    frame.contentWindow!.dispatchEvent(new Event('pagehide'));
    expect(old.isConnected).toBe(false);
    expect(registry.getSnapshot()).toHaveLength(0);
    frame.contentWindow!.dispatchEvent(new Event('pageshow'));
    expect(containerOf(connection)).not.toBe(old);
    expect(registry.getSnapshot()).toHaveLength(1);
  });

  it('cleans keyed frame replacement without waiting for another load', () => {
    const { registry, shell, connect, frame } = fixture();
    const old = containerOf(connect());
    registry.setFrame(null);
    expect(old.isConnected).toBe(false);
    expect(frame[PANEL_ENDPOINT]).toBeUndefined();
    const next = document.createElement('iframe'); shell.append(next);
    registry.setFrame(next);
    const fresh = connect('demo.controls', next.contentWindow!);
    expect(containerOf(fresh).isConnected).toBe(true);
    expect(registry.getSnapshot()).toHaveLength(1);
  });

  it('does not share registries between shell instances', () => {
    const a = fixture(), b = fixture();
    const first = a.connect(), second = b.connect();
    first.open();
    expect(second.getSnapshot()).toMatchObject({ status: 'ready', visible: false });
    a.registry.stop();
    expect(containerOf(second).isConnected).toBe(true);
  });

  it('reports disabled, top-level, incompatible and cross-origin states without throwing', () => {
    const { registry, connect, frame } = fixture();
    registry.setEnabled(false);
    expect(connect().getSnapshot()).toMatchObject({ status: 'unavailable', reason: 'disabled' });
    expect(connect('demo.top', window).getSnapshot()).toMatchObject({ reason: 'not-target' });
    Object.defineProperty(frame, PANEL_ENDPOINT, { configurable: true, writable: true, value: { version: 2 } });
    expect(connect().getSnapshot()).toMatchObject({ reason: 'incompatible' });
    const inaccessible = { get document() { throw new DOMException('Blocked', 'SecurityError'); } } as unknown as Window;
    expect(connect('demo.cross', inaccessible).getSnapshot()).toMatchObject({ reason: 'cross-origin' });
  });

  it('reconciles a changed document on load and drops inaccessible target registrations', () => {
    const { registry, frame, connect } = fixture();
    const old = containerOf(connect());
    Object.defineProperty(frame, 'contentDocument', { configurable: true, get: () => null });
    frame.dispatchEvent(new Event('load'));
    expect(old.isConnected).toBe(false);
    expect(registry.getSnapshot()).toHaveLength(0);
  });
});
