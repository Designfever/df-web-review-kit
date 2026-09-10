import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useReviewShellHotkeys } from './use.review.shell.hotkeys';

const mocks = vi.hoisted(() => ({
  refs: { iframeRef: { current: null as HTMLIFrameElement | null } },
  state: { mode: 'idle', isInitialPromptOpen: false, isSitemapOpen: false, targetFrameLoadVersion: 0,
    setIsInitialPromptOpen: vi.fn(), setIsSitemapOpen: vi.fn() },
}));
vi.mock('../store/shell.config', () => ({ useReviewShellConfig: () => ({ reviewPathPrefix: '/review' }) }));
vi.mock('../store/shell.refs', () => ({ useReviewShellRefs: () => mocks.refs }));
vi.mock('../store/store.context', () => ({
  useReviewShellStore: (selector: (state: typeof mocks.state) => unknown) => selector(mocks.state),
}));

describe('design inspector shell hotkeys', () => {
  let host: HTMLDivElement;
  let frame: HTMLIFrameElement;
  let root: Root;
  let options: Parameters<typeof useReviewShellHotkeys>[0];
  const Harness = () => { useReviewShellHotkeys(options); return null; };
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement('div');
    frame = document.createElement('iframe');
    document.body.append(host, frame);
    mocks.refs.iframeRef.current = frame;
    root = createRoot(host);
    options = {
      isRailHotkeyBlocked: false, isFigmaSettingsOpen: false, isFigmaOverlayAvailable: false,
      onCancelReviewMode: vi.fn(() => false),
      onCloseFigmaSettings: vi.fn(), onSetReviewMode: vi.fn(), onToggleComponentListPanel: vi.fn(),
      onToggleFigmaOverlay: vi.fn(), onToggleFigmaImagesPanel: vi.fn(), onToggleQaPanel: vi.fn(),
      onToggleDesignInspector: vi.fn(), onToggleTargetOverlay: vi.fn(),
    };
    act(() => root.render(<Harness />));
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove(); frame.remove();
    mocks.refs.iframeRef.current = null;
  });

  it('toggles with Shift+1 from both the shell and focused target iframe', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '!', code: 'Digit1', shiftKey: true }));
    frame.contentDocument!.body.dispatchEvent(new KeyboardEvent('keydown', { key: '!', code: 'Digit1', shiftKey: true, bubbles: true }));
    expect(options.onToggleDesignInspector).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['@', 'Digit2', 'onToggleFigmaImagesPanel'],
    ['#', 'Digit3', 'onToggleQaPanel'],
    ['$', 'Digit4', 'onToggleComponentListPanel'],
  ] as const)('maps Shift+%s in rail order from shell and iframe', (key, code, action) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, code, shiftKey: true }));
    frame.contentDocument!.body.dispatchEvent(new KeyboardEvent('keydown', { key, code, shiftKey: true, bubbles: true }));
    expect(options[action]).toHaveBeenCalledTimes(2);
    expect(options.onToggleDesignInspector).not.toHaveBeenCalled();
  });

  it('does not toggle the inspector with retired shortcuts', () => {
    for (const key of ['r', 'ㄱ']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key, code: 'KeyR' }));
      frame.contentDocument!.body.dispatchEvent(new KeyboardEvent('keydown', { key, code: 'KeyR', bubbles: true }));
    }
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'D', code: 'KeyD', shiftKey: true }));
    expect(options.onToggleDesignInspector).not.toHaveBeenCalled();
  });

  it('does not consume Escape for an idle rail panel', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    frame.contentDocument!.body.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(options.onToggleDesignInspector).not.toHaveBeenCalled();
  });

  it('does not steal typing or repeat keyboard toggles while blocked', () => {
    const input = frame.contentDocument!.createElement('input');
    frame.contentDocument!.body.append(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '!', code: 'Digit1', shiftKey: true, bubbles: true }));
    expect(options.onToggleDesignInspector).not.toHaveBeenCalled();
    options = { ...options, isRailHotkeyBlocked: true };
    act(() => root.render(<Harness />));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '!', code: 'Digit1', shiftKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
    expect(options.onToggleDesignInspector).not.toHaveBeenCalled();
  });

  it('still allows explicit QA mode switching from the target iframe', () => {
    frame.contentDocument!.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', code: 'KeyE', bubbles: true }));
    expect(options.onSetReviewMode).toHaveBeenCalledWith('element');
  });
});
