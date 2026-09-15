import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useOutlineObservation } from './use.outline.observation';

let root: Root;
beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

function fixture() {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  Object.defineProperty(doc, 'readyState', { configurable: true, value: 'complete' });
  const props = {
    iframeRef: { current: frame }, sectionOutlineOptions: {}, isPanelVisible: true,
    targetFrameLoadVersion: 0, targetSrc: 'fixture', onReset: vi.fn(), onRefresh: vi.fn(),
  };
  const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
  function Harness() { useOutlineObservation(props); return null; }
  const render = () => act(() => root.render(<Harness />));
  render();
  return { doc, props, disconnect, render };
}
const advance = async (ms: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };

it('keeps the initial frame/120/500/1200ms retries and sees late-rendered DOM', async () => {
  const { doc, props } = fixture();
  await advance(16);
  expect(props.onRefresh).toHaveBeenCalledTimes(1);
  await advance(64); // initial observer scan at 80ms
  expect(props.onRefresh).toHaveBeenCalledTimes(2);
  await advance(40);
  expect(props.onRefresh).toHaveBeenCalledTimes(3);
  await advance(380);
  expect(props.onRefresh).toHaveBeenCalledTimes(4);
  doc.body.innerHTML = '<section data-wrk-source-component="Late" data-wrk-source-file="src/Late.tsx"></section>';
  await act(async () => {}); // deliver MutationObserver
  await advance(80);
  expect(props.onRefresh.mock.lastCall?.[0][0].label).toBe('Late');
  const calls = props.onRefresh.mock.calls.length;
  await advance(620);
  expect(props.onRefresh).toHaveBeenCalledTimes(calls + 1);
  expect(props.onRefresh.mock.calls.every(call => call[1] === false)).toBe(true);
});

it('debounces mutations and disposes pending work on close, reload and unmount', async () => {
  const { doc, props, disconnect, render } = fixture();
  await advance(1200);
  props.onRefresh.mockClear();
  doc.body.append(document.createElement('div'));
  await act(async () => {});
  await advance(50);
  doc.body.append(document.createElement('div'));
  await act(async () => {});
  await advance(79);
  expect(props.onRefresh).not.toHaveBeenCalled();
  await advance(1);
  expect(props.onRefresh).toHaveBeenCalledOnce();
  props.isPanelVisible = false;
  render();
  expect(disconnect).toHaveBeenCalledOnce();
  props.onRefresh.mockClear();
  doc.body.append(document.createElement('div'));
  await advance(1500);
  expect(props.onRefresh).not.toHaveBeenCalled();
  props.isPanelVisible = true;
  props.targetFrameLoadVersion++;
  render();
  expect(props.onReset).toHaveBeenCalledTimes(2);
  props.targetFrameLoadVersion++;
  render();
  expect(disconnect).toHaveBeenCalledTimes(2);
  expect(props.onReset).toHaveBeenCalledTimes(3);
  act(() => root.unmount());
  expect(disconnect).toHaveBeenCalledTimes(3);
  await advance(1500);
  expect(props.onRefresh).not.toHaveBeenCalled();
});
