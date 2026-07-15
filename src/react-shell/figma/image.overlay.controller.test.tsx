import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type {
  ReviewFigmaImage,
  ReviewFigmaRouteTarget,
} from '../../figma/image.types';
import { useReviewFigmaImageOverlayController } from './image.overlay.controller';

const target: ReviewFigmaRouteTarget = {
  type: 'route',
  projectId: 'project',
  pageUrl: '/',
  viewport: { width: 390, height: 844 },
};

const image: ReviewFigmaImage = {
  id: 'image-1',
  projectId: 'project',
  target,
  figmaUrl: 'https://www.figma.com/design/file?node-id=1-1',
  fileKey: 'file',
  nodeId: '1:1',
  imageUrl: 'data:image/png;base64,AA==',
  imageFormat: 'png',
  mimeType: 'image/png',
  order: 0,
  createdAt: '2026-07-15T00:00:00.000Z',
  updatedAt: '2026-07-15T00:00:00.000Z',
};

const OverlayHarness = ({ images }: { images: ReviewFigmaImage[] }) => {
  useReviewFigmaImageOverlayController({
    images,
    isLoading: false,
    target,
  });
  return null;
};

describe('useReviewFigmaImageOverlayController', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('does not rewrite unchanged overlay state when the image list refreshes', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    await act(async () => {
      root.render(<OverlayHarness images={[image]} />);
    });

    const countOverlayWrites = () =>
      setItem.mock.calls.filter(([key]) =>
        String(key).startsWith('df-review-figma-image-overlay-state:')
      ).length;
    const initialWriteCount = countOverlayWrites();
    expect(initialWriteCount).toBeGreaterThan(0);

    await act(async () => {
      root.render(<OverlayHarness images={[{ ...image }]} />);
    });

    expect(countOverlayWrites()).toBe(initialWriteCount);
  });
});
