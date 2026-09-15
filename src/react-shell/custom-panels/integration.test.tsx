import { StrictMode, act, createContext, useContext, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createReviewShellStore } from '../store/create.review.shell.store';
import { ReviewShellStoreProvider } from '../store/store.context';
import { createReviewShellRefs, ReviewShellRefsProvider } from '../store/shell.refs';
import { useReviewSidePanel } from '../hooks/use.review.side.panel';
import { getStoredReviewSidePanel, getStoredReviewSidePanelVisible } from '../settings';
import { CustomPanelHost, CustomPanelProvider, useCustomPanelRegistry } from './context';
import { CustomPanelRailButtons } from './rail';
import { connectReviewCustomPanel } from './connection';
import type { ReviewCustomPanelSnapshot } from './types';

const EditorContext = createContext('missing');
let mounts = 0;
function Editor({ text, setText }: { text: string; setText: (value: string) => void }) {
  const context = useContext(EditorContext);
  useEffect(() => { mounts++; return () => { mounts--; }; }, []);
  return <label>{context}<input value={text} onInput={event => setText(event.currentTarget.value)} /></label>;
}
function Target({ targetWindow }: { targetWindow: Window }) {
  const [text, setText] = useState('initial');
  const [snapshot, setSnapshot] = useState<ReviewCustomPanelSnapshot | null>(null);
  useEffect(() => {
    const connection = connectReviewCustomPanel({ id: 'test.editor', label: 'Editor' }, { targetWindow });
    const sync = () => setSnapshot(connection.getSnapshot());
    const unsubscribe = connection.subscribe(sync);
    sync();
    return () => { unsubscribe(); connection.dispose(); };
  }, [targetWindow]);
  return <EditorContext.Provider value="target context">
    <output>{text}</output>
    {snapshot?.status === 'ready' && createPortal(<Editor text={text} setText={setText} />, snapshot.container)}
  </EditorContext.Provider>;
}
function ShellParts() {
  const registry = useCustomPanelRegistry();
  const panels = useReviewSidePanel({
    isFigmaImageManagementEnabled: true,
    isImprovementEnabled: true,
  });
  return <div className="df-review-shell">
    <div className="df-review-side-rail">
      <button aria-controls="df-review-design-inspector" onClick={() => panels.toggleSidePanel('design-inspector')}>Design</button>
      <button onClick={() => panels.toggleSidePanel('qa')}>QA</button>
      <button onClick={() => panels.toggleSidePanel('source')}>Source</button>
      <CustomPanelRailButtons />
    </div>
    <CustomPanelHost />
    <iframe ref={registry.setFrame} title="Target" width={390} height={844} />
  </div>;
}

describe('React custom panels integration', () => {
  let host: HTMLDivElement, root: Root, targetRoot: Root | undefined;
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const storage = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
      removeItem: (key: string) => { storage.delete(key); },
    } });
    mounts = 0;
    host = document.createElement('div'); document.body.append(host);
    root = createRoot(host);
  });
  afterEach(() => {
    act(() => { targetRoot?.unmount(); root.unmount(); });
    targetRoot = undefined;
    host.remove();
  });
  function mount() {
    const store = createReviewShellStore({ target: {
      activeRoute: '/', draftTarget: '/', frameNavigationVersion: 0, frameTarget: '/',
      size: { label: 'MO', width: 390, height: 844 }, source: 'local', target: '/',
      targetOverlayState: { grid: false, figma: false },
    } });
    const refs = createReviewShellRefs();
    act(() => root.render(<StrictMode>
      <ReviewShellStoreProvider value={store}>
        <ReviewShellRefsProvider value={refs}>
          <CustomPanelProvider enabled><ShellParts /></CustomPanelProvider>
        </ReviewShellRefsProvider>
      </ReviewShellStoreProvider>
    </StrictMode>));
    const frame = host.querySelector('iframe')!;
    targetRoot = createRoot(frame.contentDocument!.body);
    act(() => targetRoot!.render(<StrictMode><Target targetWindow={frame.contentWindow!} /></StrictMode>));
    return { store, refs, frame };
  }

  it('portals one context-aware editor, retaining input identity/state across built-in switches', () => {
    const { frame } = mount();
    expect(host.querySelectorAll('[aria-label="Show Editor"]')).toHaveLength(1);
    const editorButton = host.querySelector<HTMLButtonElement>('[aria-label="Show Editor"]')!;
    const container = host.querySelector<HTMLElement>('.df-review-custom-panel')!;
    const input = container.querySelector('input')!;
    expect(container.hidden).toBe(true);
    expect(container.textContent).toContain('target context');
    expect(mounts).toBe(1);
    act(() => editorButton.click());
    expect(container.hidden).toBe(false);
    act(() => {
      input.value = 'edited';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(frame.contentDocument!.querySelector('output')!.textContent).toBe('edited');
    act(() => host.querySelectorAll('button')[1].click()); // QA
    expect(container.hidden).toBe(true);
    act(() => editorButton.click());
    expect(container.querySelector('input')).toBe(input);
    expect(input.value).toBe('edited');
    expect(mounts).toBe(1);
    expect(frame.width).toBe('390'); expect(frame.height).toBe('844');
  });

  it('preserves built-in preferences while custom is selected, then persists built-ins normally', () => {
    const { store } = mount();
    act(() => host.querySelectorAll('button')[2].click()); // Source
    expect(getStoredReviewSidePanel()).toBe('source');
    expect(getStoredReviewSidePanelVisible()).toBe(true);
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="Show Editor"]')!.click());
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="Hide Editor"]')!.click());
    expect(getStoredReviewSidePanel()).toBe('source');
    expect(getStoredReviewSidePanelVisible()).toBe(true);
    act(() => store.getState().setSidePanel('design-inspector'));
    expect(getStoredReviewSidePanel()).toBe('design-inspector');
    expect(getStoredReviewSidePanelVisible()).toBe(false);
  });

  it('removes the target portal and rail entry on pre-reload revocation', () => {
    const { refs } = mount();
    const container = host.querySelector('.df-review-custom-panel')!;
    act(() => refs.invalidateCustomPanelsRef.current!());
    expect(container.isConnected).toBe(false);
    expect(mounts).toBe(0);
    expect(host.querySelector('[aria-label="Show Editor"]')).toBeNull();
  });
});
