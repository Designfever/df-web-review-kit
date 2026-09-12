import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ReviewShellState } from '../store/create.review.shell.store';
import { DomAdjustmentLayerManager } from '../target/dom-adjustment.layer';
import { useReviewSectionOutline } from './use.section.outline';

const mock = vi.hoisted(() => ({
  config: { canOpenSourceFiles: false, sectionOutlineOptions: {}, sourceOpenOptions: {}, reviewViewportPresets: [] },
  refs: { iframeRef: { current: null as HTMLIFrameElement | null }, frameScrollRef: { current: null }, controllerRef: { current: null as unknown } },
  state: { isListVisible: true, sidePanel: 'source', target: '/', targetFrameLoadVersion: 0, sourceTreeFocusRequest: null as { version: number; element: Element } | null, mode: 'idle', size: { width: 1000, height: 800 }, setMode: vi.fn(), setIsListVisible: vi.fn() },
  toast: vi.fn(),
}));
vi.mock('../store/shell.config', () => ({ useReviewShellConfig: () => mock.config }));
vi.mock('../store/shell.refs', () => ({ useReviewShellRefs: () => mock.refs }));
vi.mock('../store/use.review.adapter.state', () => ({ useReviewShellAdapterState: () => ({ canWriteDom: true }) }));
vi.mock('../hooks/use.review.toast', () => ({ useReviewToast: () => mock.toast }));
vi.mock('../store/store.context', () => {
  const api = { getState: () => mock.state };
  return { useReviewShellStoreApi: () => api, useReviewShellStore: (selector: (s: ReviewShellState) => unknown) => selector(mock.state as unknown as ReviewShellState) };
});
let root: Root;
let current: ReturnType<typeof useReviewSectionOutline>;
const callbacks = { onClearSourceInspector: vi.fn(), onClearSourceSelection: vi.fn(), onInitReviewKit: vi.fn(), onSelectSourceElement: vi.fn() };
function Harness() { current = useReviewSectionOutline(callbacks); return null; }
const render = () => act(() => root.render(<Harness />));
const advance = async (ms: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };

beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear();
  mock.state.sourceTreeFocusRequest = null;
  mock.state.targetFrameLoadVersion = 0;
  mock.state.isListVisible = true;
  const container = document.createElement('div');
  const frame = document.createElement('iframe');
  document.body.append(container, frame);
  mock.refs.iframeRef.current = frame;
  const doc = frame.contentDocument!;
  Object.defineProperty(doc, 'readyState', { configurable: true, value: 'complete' });
  doc.body.innerHTML = '<main data-wrk-source-component="Root" data-wrk-source-file="src/Root.tsx"><section data-wrk-source-component="Branch" data-wrk-source-file="src/Branch.tsx"><article data-wrk-source-component="Leaf" data-wrk-source-file="src/Leaf.tsx"></article></section></main>';
  vi.spyOn(frame.contentWindow!, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(frame.contentWindow!, 'requestAnimationFrame').mockImplementation(fn => window.setTimeout(() => fn(0), 16));
  root = createRoot(container);
  render();
});
afterEach(() => {
  act(() => root?.unmount());
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

it('keeps filter/collapse state and expands a late focus path through subsequent retries', async () => {
  await advance(16);
  const branch = current.sectionOutline![0].children[0];
  expect(current.collapsedSectionOutlineIds.has(branch.id)).toBe(true);
  act(() => current.updateSectionOutlineFilter('Leaf'));
  expect(current.filteredSectionOutlineCount).toBe(3);
  act(() => current.toggleSectionOutlineEntry(branch.id));
  expect(current.collapsedSectionOutlineIds.has(branch.id)).toBe(false);
  const doc = mock.refs.iframeRef.current!.contentDocument!;
  const late = doc.createElement('div');
  late.setAttribute('data-wrk-source-component', 'Late');
  late.setAttribute('data-wrk-source-file', 'src/Late.tsx');
  doc.querySelector('article')!.append(late);
  mock.state.sourceTreeFocusRequest = { version: 1, element: late };
  render();
  expect(current.sectionOutlineFilter).toBe('');
  expect(current.sectionOutlineTotalCount).toBe(4);
  expect(callbacks.onSelectSourceElement).toHaveBeenLastCalledWith(late);
  const selected = current.selectedSectionOutlineId;
  await advance(1300);
  expect(current.selectedSectionOutlineId).toBe(selected);
  expect(current.collapsedSectionOutlineIds.has(branch.id)).toBe(false);
  expect(current.sectionOutlineTotalCount).toBe(4);
});

it('clears selection and moved layers on frame reload, then rebuilds the tree', async () => {
  await advance(16);
  const entry = current.sectionOutline![0];
  vi.spyOn(entry.element, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 50 } as DOMRect);
  vi.spyOn(DomAdjustmentLayerManager.prototype, 'create').mockResolvedValue(true);
  const destroy = vi.spyOn(DomAdjustmentLayerManager.prototype, 'destroy');
  act(() => current.startSectionDomAdjustment(entry));
  await advance(16);
  expect(current.domAdjustmentByEntryId[entry.id]).toEqual({ x: 0, y: 0 });
  expect(current.selectedSectionOutlineId).not.toBeNull();
  mock.state.targetFrameLoadVersion++;
  render();
  expect(current.selectedSectionOutlineId).toBeNull();
  expect(current.sectionOutline).toBeNull();
  expect(current.domAdjustmentByEntryId).toEqual({});
  expect(destroy).toHaveBeenCalledOnce();
  await advance(16);
  expect(current.sectionOutlineTotalCount).toBe(3);
});

it('hands the real adjustment-hook position to DOM QA after the unchanged delay/frame sequence', async () => {
  await advance(16);
  const entry = current.sectionOutline![0];
  vi.spyOn(entry.element, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 50 } as DOMRect);
  // Rasterization is outside this test; retain both hooks' state and command flow.
  vi.spyOn(DomAdjustmentLayerManager.prototype, 'create').mockResolvedValue(true);
  vi.spyOn(DomAdjustmentLayerManager.prototype, 'adjust').mockReturnValue({ x: 10, y: -1 });
  act(() => current.startSectionDomAdjustment(entry));
  await advance(16);
  expect(current.activeDomAdjustmentEntryId).toBe(entry.id);
  act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true })));
  expect(current.domAdjustmentByEntryId[entry.id]).toEqual({ x: 10, y: -1 });
  const controller = { startElementReview: vi.fn(async () => {}), adjustElementSelection: vi.fn(), getMode: () => 'selecting' };
  mock.refs.controllerRef.current = controller;
  act(() => current.startSectionDomReview(entry));
  expect(current.activeDomAdjustmentEntryId).toBeNull();
  await advance(179);
  expect(controller.startElementReview).not.toHaveBeenCalled();
  await advance(81);
  expect(controller.startElementReview).toHaveBeenCalledWith(entry.element);
  expect(controller.adjustElementSelection).toHaveBeenCalledWith({ x: 10, y: -1 }, { preview: false });
  expect(mock.state.setMode).toHaveBeenLastCalledWith('selecting');
});
