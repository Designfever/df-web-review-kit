import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { getFitZoom, useFrameZoom } from './use.frame.zoom';
import { getRulerPointFromRect } from '../ruler/ruler';
import { createReviewShellStore } from '../store/create.review.shell.store';
import { ReviewShellStoreProvider } from '../store/store.context';

it('fits a 3840px viewport without changing its coordinates', () => {
  const scale = getFitZoom(960, 540, 3840, 2160);
  expect(scale).toBe(0.25);
  expect(getFitZoom(8000, 5000, 3840, 2160)).toBe(1);
  expect(getRulerPointFromRect(580, 320, new DOMRect(100, 50, 960, 540), { width: 3840, height: 2160 }))
    .toEqual({ x: 1920, y: 1080 });
});

it('keeps Fit responsive, preserves manual zoom, and refreshes host overlays', () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  let resize!: () => void;
  const disconnect = vi.fn();
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback; }
    observe() {}
    disconnect = disconnect;
  });
  const host = document.createElement('div');
  const scroll = document.createElement('div');
  scroll.innerHTML = '<div style="padding:34px 58px 12px"></div>';
  document.body.append(host, scroll);
  let width = 1076;
  Object.defineProperty(scroll, 'clientWidth', { get: () => width });
  Object.defineProperty(scroll, 'clientHeight', { value: 586 });
  const changed = vi.fn();
  scroll.addEventListener('scroll', changed);
  let result!: ReturnType<typeof useFrameZoom>;
  const ref = { current: scroll };
  const Harness = () => { result = useFrameZoom(ref, 3840, 2160); return null; };
  const root = createRoot(host);
  const store = createReviewShellStore({ target: {
    activeRoute: '/', draftTarget: '/', frameNavigationVersion: 0,
    frameTarget: '/', size: { label: 'Wide', width: 3840, height: 2160 },
    source: 'local', target: '/', targetOverlayState: { grid: false, figma: false },
  } });
  try {
    act(() => root.render(<ReviewShellStoreProvider value={store}><Harness /></ReviewShellStoreProvider>));
    expect(result.scale).toBe(0.25);
    act(() => result.setZoom(2));
    expect(result.scale).toBe(2);
    width = 596;
    act(resize);
    expect(result.scale).toBe(2);
    act(() => result.setZoom('fit'));
    expect(result.scale).toBe(0.125);
    expect(changed).toHaveBeenCalled();
  } finally {
    act(() => root.unmount());
    expect(disconnect).toHaveBeenCalledOnce();
    host.remove();
    scroll.remove();
    vi.unstubAllGlobals();
  }
});
