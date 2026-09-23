import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReviewItem } from '../../types';
import type { AreaDraft } from '../review/draft';
import { createReviewCanvas } from './review.canvas';
import type { DraftLayerContext } from './types';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('createReviewCanvas', () => {
  it('paints immediately and caps continuous drawing at 30 FPS', () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const draw = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(draw);
    const context = createContext();
    const canvas = createReviewCanvas(context);
    expect(getContext).toHaveBeenCalledTimes(1);
    document.body.append(canvas);

    runNextFrame(frames, 0);
    runNextFrame(frames, 34);
    runNextFrame(frames, 50);
    runNextFrame(frames, 68);

    expect(document.querySelectorAll('.dfwr-review-canvas')).toHaveLength(1);
    expect(getContext).toHaveBeenCalledTimes(3);
    expect(canvas.style.left).toBe('100px');
    expect(canvas.style.top).toBe('50px');
    expect(canvas.style.width).toBe('390px');
    expect(canvas.style.height).toBe('844px');
    expect(canvas.width).toBe(Math.round(390 * window.devicePixelRatio));
    expect(canvas.height).toBe(Math.round(844 * window.devicePixelRatio));
  });

  it('draws only the highlighted item with a solid rectangle', () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const draw = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      restore: vi.fn(),
      setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(draw);
    const context = createContext(() => undefined, {
      items: [createAreaItem('hidden'), createAreaItem('highlighted')],
      highlightedItemId: 'highlighted',
    });
    document.body.append(createReviewCanvas(context));

    runNextFrame(frames, 34);

    expect(draw.fillRect).toHaveBeenCalledTimes(2);
    expect(draw.strokeRect).toHaveBeenCalledTimes(2);
    expect(draw.setLineDash).not.toHaveBeenCalled();
  });

  it('draws the highlighted item annotations from capture metadata', () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const draw = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      restore: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(draw);
    const item = createAreaItem('highlighted');
    item.attachments = [
      {
        url: 'https://example.com/capture.png',
        name: 'capture.png',
        mime: 'image/png',
        size: 1,
        kind: 'capture',
        metadata: {
          annotations: [
            { kind: 'rectangle', x: 20, y: 30, width: 40, height: 50 },
          ],
        },
      },
    ];
    const context = createContext(() => undefined, {
      items: [item],
      highlightedItemId: item.id,
    });
    document.body.append(createReviewCanvas(context));

    runNextFrame(frames, 34);

    expect(draw.strokeRect).toHaveBeenCalledWith(20, 30, 40, 50);
  });
});

function createContext(
  getDraft: () => AreaDraft | undefined = () => undefined,
  state: Record<string, unknown> = {}
) {
  return {
    config: {
      options: {},
      getState: () => ({
        isOpen: true,
        mode: 'area',
        items: [],
        areaDraft: getDraft(),
        ...state,
      }),
      getEnvironment: () => ({
        window: {
          innerWidth: 390,
          innerHeight: 844,
          scrollX: 0,
          scrollY: 0,
        } as Window,
        document,
        viewportRect: {
          left: 100,
          top: 50,
          width: 390,
          height: 844,
        },
        overlayRect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }),
      actions: {
        setAreaDraft: vi.fn(),
      },
    },
  } as unknown as DraftLayerContext;
}

function createAreaItem(id: string): ReviewItem {
  return {
    id,
    projectId: 'test',
    routeKey: '/',
    pageUrl: 'http://localhost/',
    normalizedPath: '/',
    kind: 'area',
    comment: id,
    status: 'todo',
    viewport: { width: 390, height: 844 },
    selection: {
      viewport: { x: 10, y: 20, width: 120, height: 80 },
    },
    createdAt: '2026-09-23T00:00:00.000Z',
    updatedAt: '2026-09-23T00:00:00.000Z',
  } as ReviewItem;
}

function runNextFrame(frames: FrameRequestCallback[], time: number) {
  const frame = frames.shift();
  if (!frame) throw new Error('Animation frame was not scheduled.');
  frame(time);
}
