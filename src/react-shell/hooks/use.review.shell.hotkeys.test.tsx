import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useReviewShellHotkeys } from './use.review.shell.hotkeys';

const mocks = vi.hoisted(() => ({
  refs: { iframeRef: { current: null as HTMLIFrameElement | null } },
  state: { mode: 'idle', isInitialPromptOpen: false, isSitemapOpen: false, targetFrameLoadVersion: 0,
    setIsInitialPromptOpen: vi.fn(), setIsSitemapOpen: vi.fn() },
}));
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
      isDesignInspectorVisible: true,
      onCancelReviewMode: vi.fn(() => false), onCloseDesignInspector: vi.fn(() => true),
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

  it('toggles from both the shell and focused target iframe, preserving the R alias', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'D', code: 'KeyD', shiftKey: true }));
    frame.contentDocument!.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ㅇ', code: 'KeyD', shiftKey: true, bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', code: 'KeyR' }));
    expect(options.onToggleDesignInspector).toHaveBeenCalledTimes(3);
  });

  it('closes from Escape inside the iframe', () => {
    frame.contentDocument!.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(options.onCloseDesignInspector).toHaveBeenCalledOnce();
  });

  it('does not steal typing or repeat keyboard toggles while blocked', () => {
    const input = frame.contentDocument!.createElement('input');
    frame.contentDocument!.body.append(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'D', shiftKey: true, bubbles: true }));
    expect(options.onToggleDesignInspector).not.toHaveBeenCalled();
    options = { ...options, isRailHotkeyBlocked: true };
    act(() => root.render(<Harness />));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'D', shiftKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
    expect(options.onToggleDesignInspector).not.toHaveBeenCalled();
  });

  it('still allows explicit QA mode switching from the target iframe', () => {
    frame.contentDocument!.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', code: 'KeyE', bubbles: true }));
    expect(options.onSetReviewMode).toHaveBeenCalledWith('element');
  });
});
