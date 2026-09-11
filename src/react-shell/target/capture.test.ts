import { describe, expect, it, vi } from 'vitest';
import { normalizeZeroSizeCaptureGradients } from './capture';

describe('normalizeZeroSizeCaptureGradients', () => {
  it('removes gradients from zero-size elements only', () => {
    const hidden = document.createElement('span');
    hidden.style.backgroundImage = 'linear-gradient(red 0%, blue 100%)';
    vi.spyOn(hidden, 'getBoundingClientRect').mockReturnValue({
      width: 0,
      height: 0,
    } as DOMRect);

    const visible = document.createElement('span');
    visible.style.backgroundImage = 'linear-gradient(red 0%, blue 100%)';
    vi.spyOn(visible, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 20,
    } as DOMRect);

    document.body.append(hidden, visible);

    normalizeZeroSizeCaptureGradients(document);

    expect(hidden.style.getPropertyValue('background-image')).toBe('none');
    expect(hidden.style.getPropertyPriority('background-image')).toBe(
      'important'
    );
    expect(visible.style.backgroundImage).toContain('linear-gradient');
  });
});

describe('captureIframeViewport resolution', () => {
  it('uses CSS pixel dimensions on a Retina target', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    Object.defineProperty(frame.contentWindow, 'devicePixelRatio', { configurable: true, value: 2 });
    const canvas = frame.contentDocument!.createElement('canvas');
    const render = vi.fn(async (_element, options) => {
      canvas.width = options.width * options.scale;
      canvas.height = options.height * options.scale;
      return canvas;
    });
    vi.doMock('html2canvas', () => ({ default: render }));
    const prototype = Object.getPrototypeOf(canvas) as HTMLCanvasElement;
    const context = vi.spyOn(prototype, 'getContext')
      .mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    const encode = vi.spyOn(prototype, 'toBlob')
      .mockImplementation(callback => callback(new Blob(['image'], { type: 'image/webp' })));
    try {
      const { captureIframeViewport } = await import('./capture');
      const result = await captureIframeViewport(frame, {
        routeKey: '/', pageUrl: 'http://localhost/', viewport: { width: 390, height: 844 },
        scroll: { x: 0, y: 0 }, timestamp: '2026-09-11T00:00:00Z',
        captureRegion: { x: 20, y: 30, width: 120, height: 40 },
      });
      expect(render.mock.calls[0][1].scale).toBe(1);
      expect(result).toMatchObject({ width: 120, height: 40, metadata: { captureScale: 1 } });
    } finally {
      context.mockRestore(); encode.mockRestore(); frame.remove();
      vi.doUnmock('html2canvas');
    }
  });
});
