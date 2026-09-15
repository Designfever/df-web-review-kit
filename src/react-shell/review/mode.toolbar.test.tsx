import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  settings: { captureMethod: 'browser' },
  refs: { iframeRef: { current: null as HTMLIFrameElement | null } },
  ensureStarted: vi.fn(),
}));
vi.mock('./settings.context', () => ({ useReviewSettingsState: () => mocks.settings }));
vi.mock('../store/shell.refs', () => ({ useReviewShellRefs: () => mocks.refs }));
vi.mock('../target/screen.capture', () => ({
  screenCaptureSessions: { get: () => ({ ensureStarted: mocks.ensureStarted }) },
}));
import { ReviewModeToolbar } from './mode.toolbar';
afterEach(() => { vi.clearAllMocks(); mocks.settings.captureMethod = 'browser'; });

it.each(['Element', 'Area'])('waits for sharing before %s selection and preserves mode on failure', async (label) => {
  const host = document.createElement('div');
  document.body.append(host);
  mocks.refs.iframeRef.current = document.createElement('iframe');
  const onSetReviewMode = vi.fn();
  const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(ReviewModeToolbar, {
      canWriteArea: true, canWriteDom: true, mode: 'idle', onSetReviewMode,
    })));
    const button = host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
    let resolve!: (value: boolean) => void;
    mocks.ensureStarted.mockImplementationOnce(() => new Promise<boolean>(done => { resolve = done; }));
    await act(async () => button.click());
    expect(onSetReviewMode).not.toHaveBeenCalled();
    expect(button.disabled).toBe(true);
    await act(async () => resolve(false));
    expect(onSetReviewMode).not.toHaveBeenCalled();
    mocks.ensureStarted.mockResolvedValueOnce(true);
    await act(async () => button.click());
    expect(onSetReviewMode).toHaveBeenCalledWith(label === 'Element' ? 'element' : 'area');
    mocks.settings.captureMethod = 'html2canvas';
    await act(async () => root.render(createElement(ReviewModeToolbar, {
      canWriteArea: true, canWriteDom: true, mode: 'idle', onSetReviewMode,
    })));
    await act(async () => button.click());
    expect(mocks.ensureStarted).toHaveBeenCalledTimes(2);
    expect(onSetReviewMode).toHaveBeenCalledTimes(2);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
