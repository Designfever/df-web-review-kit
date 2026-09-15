import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScreenCaptureSession } from './screen.capture';

const originalDevices = Object.getOwnPropertyDescriptor(
  navigator,
  'mediaDevices'
);
afterEach(() => {
  vi.restoreAllMocks();
  if (originalDevices)
    Object.defineProperty(navigator, 'mediaDevices', originalDevices);
  else Reflect.deleteProperty(navigator, 'mediaDevices');
});

function setup() {
  let handle = '';
  const stop = vi.fn();
  const track = {
    readyState: 'live',
    stop,
    getCaptureHandle: () => ({ handle }),
    addEventListener: vi.fn(),
  };
  const stream = {
    getTracks: () => [track],
    getVideoTracks: () => [track],
  } as unknown as MediaStream;
  const getDisplayMedia = vi.fn(async () => stream);
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getDisplayMedia,
      setCaptureHandleConfig: (config: { handle: string }) => {
        handle = config.handle;
      },
    } as unknown as MediaDevices,
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const changed = vi.fn();
  return {
    session: new ScreenCaptureSession(document, changed),
    stream,
    track,
    stop,
    getDisplayMedia,
    changed,
  };
}

describe('screen capture session', () => {
  it('reuses sharing until stopped and responds to browser stop', async () => {
    const { session, getDisplayMedia, stop, track, changed } = setup();
    await session.start();
    expect(await session.ensureStarted()).toBe(true);
    expect(getDisplayMedia).toHaveBeenCalledTimes(1);
    expect(stop).not.toHaveBeenCalled();
    expect(changed).toHaveBeenLastCalledWith(true);
    (
      track.addEventListener.mock.calls[0] as unknown as [string, () => void]
    )[1]();
    expect(stop).toHaveBeenCalledOnce();
    expect(changed).toHaveBeenLastCalledWith(false);
  });

  it('stops a different tab instead of capturing it', async () => {
    const { session, track, stop } = setup();
    track.getCaptureHandle = () => ({ handle: 'different-tab' });
    await expect(session.start()).rejects.toThrow('Choose this Review tab');
    expect(stop).toHaveBeenCalledOnce();
  });

  it('stops permission results arriving after disposal', async () => {
    const { session, stream, stop, getDisplayMedia, changed } = setup();
    let accept!: (stream: MediaStream) => void;
    getDisplayMedia.mockImplementation(
      () =>
        new Promise((resolve) => {
          accept = resolve;
        })
    );
    const pending = session.start();
    session.stop();
    accept(stream);
    await pending;
    expect(stop).toHaveBeenCalledOnce();
    expect(changed).not.toHaveBeenCalledWith(true);
  });

  it('crops the current iframe position after navigation without requesting sharing again', async () => {
    const { session, getDisplayMedia } = setup();
    const frame = document.createElement('iframe');
    document.body.append(frame);
    let left = 100;
    vi.spyOn(frame, 'getBoundingClientRect').mockImplementation(
      () => ({ left, top: 100, width: 400, height: 300 }) as DOMRect
    );
    vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 1024,
      bottom: 768,
    } as DOMRect);
    Object.defineProperty(
      HTMLVideoElement.prototype,
      'requestVideoFrameCallback',
      {
        configurable: true,
        value: (callback: () => void) => {
          queueMicrotask(callback);
          return 1;
        },
      }
    );
    vi.spyOn(HTMLVideoElement.prototype, 'videoWidth', 'get').mockReturnValue(
      2048
    );
    vi.spyOn(HTMLVideoElement.prototype, 'videoHeight', 'get').mockReturnValue(
      1536
    );
    const drawImage = vi.fn();
    const overlay = document.createElement('div');
    overlay.className = 'df-review-outside-marker-layer';
    overlay.style.opacity = '0.7';
    document.body.append(overlay);
    const targetOverlay = frame.contentDocument!.createElement('div');
    targetOverlay.id = 'df-web-review-kit-root';
    frame.contentDocument!.body.append(targetOverlay);
    drawImage.mockImplementation(() => {
      expect(getComputedStyle(overlay).opacity).toBe('0');
      expect(frame.contentWindow!.getComputedStyle(targetOverlay).opacity).toBe('0');
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    await session.start();
    try {
      const viewport = { width: 800, height: 600 };
      const region = { x: 20, y: 40, width: 100, height: 80 };
      const first = await session.capture(frame, viewport, region);
      expect(getComputedStyle(overlay).opacity).toBe('0.7');
      expect(frame.contentDocument!.querySelector('style')).toBeNull();
      expect(first?.width).toBe(100);
      expect(drawImage.mock.calls[0].slice(1)).toEqual([
        220, 240, 100, 80, 0, 0, 100, 80,
      ]);
      // A Retina stream still produces one output pixel per target CSS pixel.
      vi.spyOn(HTMLVideoElement.prototype, 'videoWidth', 'get').mockReturnValue(4096);
      vi.spyOn(HTMLVideoElement.prototype, 'videoHeight', 'get').mockReturnValue(3072);
      const retina = await session.capture(frame, viewport, region);
      expect(retina?.width).toBe(100);
      expect(retina?.height).toBe(80);
      expect(drawImage.mock.calls[1].slice(1)).toEqual([
        440, 480, 200, 160, 0, 0, 100, 80,
      ]);
      left = 150;
      await session.capture(frame, viewport, region);
      expect(drawImage.mock.calls[2][1]).toBe(640);
      expect(getDisplayMedia).toHaveBeenCalledOnce();
      left = -100;
      await expect(session.capture(frame, viewport)).rejects.toThrow('clipped');
      expect(getComputedStyle(overlay).opacity).toBe('0.7');
      expect(frame.contentDocument!.querySelector('style')).toBeNull();
    } finally {
      session.stop();
      overlay.remove();
      frame.remove();
      Reflect.deleteProperty(
        HTMLVideoElement.prototype,
        'requestVideoFrameCallback'
      );
    }
  });

  it('never opens a picker during capture, including after sharing is denied', async () => {
    const { session, getDisplayMedia } = setup();
    getDisplayMedia.mockRejectedValue(new Error('Permission denied'));
    const frame = document.createElement('iframe');
    const viewport = { width: 390, height: 844 };
    expect(await session.capture(frame, viewport)).toBeNull();
    expect(getDisplayMedia).not.toHaveBeenCalled();
    await expect(session.start()).rejects.toThrow('Permission denied');
    expect(await session.capture(frame, viewport)).toBeNull();
    expect(getDisplayMedia).toHaveBeenCalledOnce();
  });

  it('uses fallback after the user stops sharing without reopening the picker', async () => {
    const { session, getDisplayMedia } = setup();
    session.stop();
    expect(
      await session.capture(document.createElement('iframe'), {
        width: 390,
        height: 844,
      })
    ).toBeNull();
    expect(getDisplayMedia).not.toHaveBeenCalled();
  });
});
