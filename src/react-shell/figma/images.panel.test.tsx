import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ReviewFigmaImage } from '../../figma/image.types';
import { FigmaImagesPanel } from './images.panel';

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');document.body.append(host);root = createRoot(host);
});
afterEach(() => { act(() => root.unmount());document.body.replaceChildren();vi.restoreAllMocks();vi.unstubAllGlobals(); });
function fixture() {
  const images = ['a', 'b'].map(id => ({ id, label: id.toUpperCase(), updatedAt: '2026-09-12T00:00:00Z' } as ReviewFigmaImage));
  const props = {
    error: '', images, imageOverlayStates: {}, isListVisible: true, isLoading: false, isMutating: false, selectedImageId: 'a',
    onAddImage: vi.fn(async () => null), onDeleteImage: vi.fn(async () => {}), onRefreshImages: vi.fn(async () => images), onReorderImages: vi.fn(async () => {}), onSelectImage: vi.fn(),
    onSetImageOverlayOffsetY: vi.fn(), onSetImageOverlayOpacity: vi.fn(), onToggleImageOverlayLocked: vi.fn(), onToggleImageOverlayMode: vi.fn(), onToggleImageOverlayVisible: vi.fn(), onUpdateImage: vi.fn(async () => null),
  };
  const render = () => act(() => root.render(<FigmaImagesPanel {...props} />));
  render();
  return { props, render };
}
const click = (selector: string) => act(() => host.querySelector<HTMLElement>(selector)!.click());
function input(value: string) {
  const field = host.querySelector<HTMLInputElement>('.df-review-figma-image-label-input')!;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return field;
}
const pointer = (node: Element, name: string, x = 0, y = 0) => {
  const event = new MouseEvent(name, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  node.dispatchEvent(event);
};

it('commits Enter once, cancels Escape and commits capture+blur once when switching rows', () => {
  const { props } = fixture();
  click('[aria-label="Edit A label"]');
  let field = input('Renamed');
  act(() => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  expect(props.onUpdateImage).toHaveBeenCalledTimes(1);
  expect(props.onUpdateImage).toHaveBeenLastCalledWith('a', { label: 'Renamed' });
  click('[aria-label="Edit A label"]');field = input('Canceled');
  act(() => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(props.onUpdateImage).toHaveBeenCalledTimes(1);
  click('[aria-label="Edit A label"]');field = input('Outside');
  const other = host.querySelector<HTMLElement>('[aria-label="Edit B label"]')!;
  act(() => { pointer(other, 'pointerdown');field.blur(); });
  act(() => other.click());
  expect(props.onUpdateImage).toHaveBeenCalledTimes(2);
  expect(props.onUpdateImage).toHaveBeenLastCalledWith('a', { label: 'Outside' });
  expect(host.querySelectorAll('.df-review-figma-image-label-input')).toHaveLength(1);
  expect(host.querySelector<HTMLInputElement>('.df-review-figma-image-label-input')!.value).toBe('B');
});

it('does not save an unchanged label and preserves editing on input pointerdown', () => {
  const { props } = fixture();click('[aria-label="Edit A label"]');
  const field = input('A');
  act(() => pointer(field, 'pointerdown'));
  expect(host.contains(field)).toBe(true);
  act(() => field.blur());
  expect(props.onUpdateImage).not.toHaveBeenCalled();
});

it('distinguishes clicks from drag, emits reordered ids and suppresses the post-drag click', () => {
  const { props } = fixture();
  const a = host.querySelector<HTMLElement>('[data-figma-image-id="a"]')!;
  const b = host.querySelector<HTMLElement>('[data-figma-image-id="b"]')!;
  const capture = vi.fn(), release = vi.fn();
  Object.assign(a, { setPointerCapture: capture, hasPointerCapture: () => true, releasePointerCapture: release });
  Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => b });
  act(() => { pointer(a, 'pointerdown');pointer(a, 'pointermove', 6);pointer(a, 'pointerup', 6);a.click(); });
  expect(props.onSelectImage).toHaveBeenCalledWith('a');
  expect(props.onReorderImages).not.toHaveBeenCalled();
  props.onSelectImage.mockClear();
  act(() => pointer(a, 'pointerdown'));
  act(() => pointer(a, 'pointermove', 20));
  expect(a.classList.contains('is-dragging')).toBe(true);
  expect(b.classList.contains('is-drop-after')).toBe(true);
  act(() => { pointer(a, 'pointerup', 20);a.click(); });
  expect(props.onReorderImages).toHaveBeenCalledWith(['b', 'a']);
  expect(props.onSelectImage).not.toHaveBeenCalled();
  expect(release).toHaveBeenCalledTimes(2);
  act(() => a.click());
  expect(props.onSelectImage).toHaveBeenCalledOnce();
  delete (document as Partial<Document>).elementFromPoint;
});

it('does not start dragging from interactive targets, during mutation or while editing', () => {
  const { props, render } = fixture();
  const a = host.querySelector<HTMLElement>('[data-figma-image-id="a"]')!;
  const capture = vi.fn();Object.assign(a, { setPointerCapture: capture });
  act(() => pointer(a.querySelector('button')!, 'pointerdown'));
  props.isMutating = true;render();
  act(() => pointer(a, 'pointerdown'));
  props.isMutating = false;render();
  click('[aria-label="Edit A label"]');
  act(() => pointer(host.querySelector('input.df-review-figma-image-label-input')!, 'pointerdown'));
  expect(capture).not.toHaveBeenCalled();
});
