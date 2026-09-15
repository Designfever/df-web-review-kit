import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  refs: { iframeRef: { current: null as HTMLIFrameElement | null } },
  state: { frameTarget: '/', frameNavigationVersion: 0 },
  stop: vi.fn(),
  start: vi.fn(),
  settings: { captureMethod: 'browser' },
}));
vi.mock('../review/settings.context', () => ({ useReviewSettingsState: () => mocks.settings }));
vi.mock('../store/shell.refs', () => ({
  useReviewShellRefs: () => mocks.refs,
}));
vi.mock('../store/store.context', () => ({
  useReviewShellStore: (select: (state: typeof mocks.state) => unknown) =>
    select(mocks.state),
}));
vi.mock('./screen.capture', () => ({
  screenCaptureSessions: new WeakMap(),
  ScreenCaptureSession: class {
    stop = mocks.stop;
    start = mocks.start;
  },
}));
import { ScreenCaptureControl } from './screen.capture.control';
import { screenCaptureSessions } from './screen.capture';

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = true; },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    },
  });
});
afterEach(() => {
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

it('reattaches the same session when navigation replaces the iframe', async () => {
  const host = document.createElement('div');
  const first = document.createElement('iframe');
  const next = document.createElement('iframe');
  document.body.append(host, first, next);
  mocks.refs.iframeRef.current = first;
  const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(ScreenCaptureControl)));
    const session = screenCaptureSessions.get(first);
    expect(session).toBeDefined();
    mocks.refs.iframeRef.current = next;
    mocks.state.frameNavigationVersion++;
    await act(async () => root.render(createElement(ScreenCaptureControl)));
    expect(screenCaptureSessions.get(first)).toBeUndefined();
    expect(screenCaptureSessions.get(next)).toBe(session);
    expect(mocks.stop).not.toHaveBeenCalled();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    first.remove();
    next.remove();
  }
  expect(mocks.stop).toHaveBeenCalledOnce();
  expect(screenCaptureSessions.get(next)).toBeUndefined();
});


it('shows sharing errors in a dismissible modal instead of toolbar text', async () => {
  const host = document.createElement('div');
  const frame = document.createElement('iframe');
  document.body.append(host, frame);
  mocks.refs.iframeRef.current = frame;
  mocks.start.mockRejectedValueOnce(new Error('Choose this Review tab.'));
  const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(ScreenCaptureControl)));
    expect(mocks.start).not.toHaveBeenCalled();
    expect(host.querySelector('dialog')).toBeNull();
    await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
    expect(host.querySelector('dialog[open]')).not.toBeNull();
    expect(host.querySelector('dialog p')?.textContent).toContain('현재 리뷰 탭 → 「공유」를 선택하세요.');
    expect(host.querySelector('span[role="alert"]')).toBeNull();
    await act(async () => host.querySelector<HTMLButtonElement>('dialog button')!.click());
    expect(host.querySelector('dialog')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    frame.remove();
  }
});
