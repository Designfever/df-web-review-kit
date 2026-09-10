import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DesignInspectorOptions } from '../../design-inspector';
import { DesignInspectorPanelContainer } from './panel.container';

const mocks = vi.hoisted(() => ({
  create: vi.fn(), destroy: vi.fn(), clear: vi.fn(), openSource: vi.fn(), candidates: vi.fn(() => []),
  refs: { iframeRef: { current: null as HTMLIFrameElement | null }, controllerRef: { current: { setMode: vi.fn() } } },
  config: { canOpenSourceFiles: true, sourceCandidateOptions: {}, sourceOpenOptions: { editor: 'cursor' } },
  state: { sidePanel: 'design-inspector', isListVisible: false, frameNavigationVersion: 0, frameTarget: '/',
    setIsListVisible: vi.fn(), setDesignInspectorMode: vi.fn(), setMode: vi.fn() },
}));
vi.mock('../../design-inspector', () => ({ createDesignInspector: mocks.create }));
vi.mock('../source.open', () => ({ getSourceCandidates: mocks.candidates, openSourceInEditor: mocks.openSource }));
vi.mock('../store/shell.refs', () => ({ useReviewShellRefs: () => mocks.refs }));
vi.mock('../store/shell.config', () => ({ useReviewShellConfig: () => mocks.config }));
vi.mock('../store/shell.actions.context', () => ({
  useReviewShellActions: () => ({ clearSourceInspector: mocks.clear, clearSourceOutlineSelection: mocks.clear }),
}));
const storeApi = { getState: () => mocks.state };
vi.mock('../store/store.context', () => ({
  useReviewShellStore: (selector: (state: typeof mocks.state) => unknown) => selector(mocks.state),
  useReviewShellStoreApi: () => storeApi,
}));

describe('embedded design inspector panel lifecycle', () => {
  let host: HTMLDivElement;
  let frame: HTMLIFrameElement;
  let root: Root;
  let engineOptions: DesignInspectorOptions;
  const render = async () => {
    await act(async () => root.render(<DesignInspectorPanelContainer />));
  };
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement('div'); frame = document.createElement('iframe');
    document.body.append(host, frame);
    mocks.refs.iframeRef.current = frame;
    mocks.state.isListVisible = false;
    mocks.state.frameNavigationVersion = 0;
    mocks.state.sidePanel = 'design-inspector';
    mocks.create.mockImplementation((options: DesignInspectorOptions) => {
      engineOptions = options;
      options.onModeChange?.(options.initialMode ?? 'pick');
      return { destroy: mocks.destroy };
    });
    root = createRoot(host);
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove(); frame.remove(); mocks.refs.iframeRef.current = null;
  });

  it('mounts lazily only when visible and reuses the existing target iframe', async () => {
    await render();
    expect(mocks.create).not.toHaveBeenCalled();
    mocks.state.isListVisible = true;
    await render();
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(engineOptions.frame).toBe(frame);
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(frame.contentDocument!.documentElement.hasAttribute('data-df-review-design-inspecting')).toBe(true);
    expect(mocks.refs.controllerRef.current.setMode).toHaveBeenCalledWith('idle');
  });

  it('allows browsing and cleans up locks and engine when the panel closes', async () => {
    mocks.state.isListVisible = true;
    await render();
    engineOptions.onModeChange?.('browse');
    expect(frame.contentDocument!.documentElement.hasAttribute('data-df-review-design-inspecting')).toBe(false);
    engineOptions.onModeChange?.('pick');
    mocks.state.isListVisible = false;
    await render();
    expect(mocks.destroy).toHaveBeenCalledOnce();
    expect(frame.contentDocument!.querySelector('#df-review-design-inspector-figma-pointer-lock')).toBeNull();
    expect(frame.contentDocument!.documentElement.hasAttribute('data-df-review-design-inspecting')).toBe(false);
  });

  it('preserves browsing when recreating the engine for a replacement iframe', async () => {
    mocks.state.isListVisible = true;
    await render();
    engineOptions.onModeChange?.('browse');
    const replacement = document.createElement('iframe');
    host.append(replacement);
    mocks.refs.iframeRef.current = replacement;
    mocks.state.frameNavigationVersion += 1;
    await render();
    expect(mocks.destroy).toHaveBeenCalledOnce();
    expect(mocks.create).toHaveBeenCalledTimes(2);
    expect(engineOptions.frame).toBe(replacement);
    expect(engineOptions.initialMode).toBe('browse');
    expect(mocks.state.setDesignInspectorMode).toHaveBeenLastCalledWith('browse');
    expect(replacement.contentDocument!.documentElement.hasAttribute('data-df-review-design-inspecting')).toBe(false);
    mocks.state.isListVisible = false;
    await render();
    mocks.state.isListVisible = true;
    await render();
    expect(engineOptions.initialMode).toBe('pick');
  });

  it('routes source opening through the configured review-kit editor adapter', async () => {
    mocks.state.isListVisible = true;
    await render();
    await engineOptions.source!.open({ file: 'src/page.tsx', displayPath: 'page.tsx', line: 10, column: 2 });
    expect(mocks.openSource).toHaveBeenCalledWith({ file: 'src/page.tsx', line: '10', column: '2' }, mocks.config.sourceOpenOptions);
  });
});
