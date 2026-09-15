import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ReviewFigmaImage } from '../../figma/image.types';
import { FigmaImagesImport } from './images.import';

const helpers = vi.hoisted(() => ({ file: vi.fn(), url: vi.fn() }));
vi.mock('../../figma/image.import', async importOriginal => ({
  ...await importOriginal<typeof import('../../figma/image.import')>(),
  createReviewImageAssetFromFile: helpers.file,
  createReviewImageAssetFromUrl: helpers.url,
}));
let root: Root;
let host: HTMLDivElement;
const asset = { dataUrl: 'data:image/png;base64,fixture', imageFormat: 'png', mimeType: 'image/png' };
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');document.body.append(host);root = createRoot(host);
  helpers.file.mockResolvedValue(asset);helpers.url.mockResolvedValue(asset);
});
afterEach(() => { act(() => root.unmount());document.body.replaceChildren();vi.restoreAllMocks(); });
function fixture() {
  const props = { error: '', isLoading: false, isMutating: false, onAddImage: vi.fn(async (): Promise<ReviewFigmaImage | null> => ({ id: 'added' }) as ReviewFigmaImage), onRefreshImages: vi.fn(async () => []) };
  const render = () => act(() => root.render(<FigmaImagesImport {...props}><div data-controls="true" /></FigmaImagesImport>));
  render();return { props, render };
}
function input(value: string) {
  const field = host.querySelector('input')!;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return field;
}
const submit = async () => { await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }); };

it('keeps Figma vs image URL routing and clears draft only on a returned image', async () => {
  const { props } = fixture();
  const field = input('https://www.figma.com/design/key/test?node-id=1-2');
  await submit();
  expect(helpers.url).not.toHaveBeenCalled();
  expect(props.onAddImage).toHaveBeenLastCalledWith('https://www.figma.com/design/key/test?node-id=1-2', undefined, undefined);
  expect(field.value).toBe('');
  props.onAddImage.mockResolvedValueOnce(null);
  input('https://example.test/image.png');await submit();
  expect(helpers.url).toHaveBeenCalledWith('https://example.test/image.png');
  expect(props.onAddImage).toHaveBeenLastCalledWith('https://example.test/image.png', undefined, asset);
  expect(field.value).toBe('https://example.test/image.png');
});

it('retains error precedence, status position and clears import error on typing', async () => {
  const { props, render } = fixture();
  props.error = 'Store failed';render();
  props.onAddImage.mockRejectedValueOnce(new Error('Import failed'));
  input('figma-source');await submit();
  const status = host.querySelector('.df-review-figma-image-status')!;
  expect(status.textContent).toBe('Import failed');
  expect(status.classList.contains('is-error')).toBe(true);
  expect(status.previousElementSibling?.hasAttribute('data-controls')).toBe(true);
  input('next-source');
  expect(status.textContent).toBe('Store failed');
  props.error = '';render();
  props.onAddImage.mockRejectedValueOnce('unknown');await submit();
  expect(host.querySelector('.df-review-figma-image-status')?.textContent).toBe('Image import failed.');
});

it('uses the first dropped file, strips its final extension and resets drag state', async () => {
  const { props } = fixture();
  const row = host.querySelector('.df-review-figma-image-url-row')!;
  act(() => row.dispatchEvent(new Event('dragenter', { bubbles: true, cancelable: true })));
  expect(row.classList.contains('is-drag-active')).toBe(true);
  const file = new File(['bytes'], 'Hero.mobile.png', { type: 'image/png' });
  const drop = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(drop, 'dataTransfer', { value: { files: [file, new File([], 'ignored.png')] } });
  await act(async () => { row.dispatchEvent(drop); });
  expect(drop.defaultPrevented).toBe(true);
  expect(row.classList.contains('is-drag-active')).toBe(false);
  expect(helpers.file).toHaveBeenCalledWith(file);
  expect(props.onAddImage).toHaveBeenCalledWith('Hero.mobile.png', 'Hero.mobile', asset);
});

it('preserves mutation/loading button guards without resetting the draft on rerender', () => {
  const { props, render } = fixture();
  const add = host.querySelector<HTMLButtonElement>('[aria-label="Add Figma image"]')!;
  expect(add.disabled).toBe(true);
  const field = input('pending-source');
  props.isMutating = true;render();
  expect(add.disabled).toBe(true);
  expect(field.value).toBe('pending-source');
  props.isMutating = false;props.isLoading = true;render();
  expect(add.disabled).toBe(false);
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Refresh Figma images"]')!.disabled).toBe(true);
});
