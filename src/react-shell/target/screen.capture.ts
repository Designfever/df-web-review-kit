import type { RelativeSelection, ViewportSize } from '../../types';

type CaptureTrack = MediaStreamTrack & {
  getCaptureHandle?: () => { handle?: string } | null;
};
type CaptureDevices = MediaDevices & {
  setCaptureHandleConfig?: (config: {
    handle: string;
    exposeOrigin: boolean;
    permittedOrigins: string[];
  }) => void;
};

export const screenCaptureSessions = new WeakMap<
  HTMLIFrameElement,
  ScreenCaptureSession
>();

export class ScreenCaptureSession {
  private stream?: MediaStream;
  private video?: HTMLVideoElement;
  private generation = 0;
  private handle = '';

  constructor(
    private document: Document,
    private onChange: (active: boolean) => void,
    private onStartError: (error: unknown) => void = () => {}
  ) {}

  async ensureStarted() {
    if (this.video && this.stream?.getVideoTracks()[0]?.readyState === 'live') return true;
    try {
      await this.start();
      return Boolean(this.video);
    } catch (error) {
      this.onStartError(error);
      return false;
    }
  }

  async start() {
    this.stop();
    const generation = this.generation;
    const view = this.document.defaultView!;
    const devices = view.navigator.mediaDevices as CaptureDevices | undefined;
    if (!devices?.getDisplayMedia || !devices.setCaptureHandleConfig) {
      throw new Error(
        'Screen capture needs a browser with current-tab verification, such as Chrome.'
      );
    }
    this.handle = view.crypto.randomUUID();
    try {
      devices.setCaptureHandleConfig({
        handle: this.handle,
        exposeOrigin: false,
        permittedOrigins: [view.location.origin],
      });
    } catch (error) {
      throw captureStartError('Current-tab setup', error);
    }
    const context = `focused=${this.document.hasFocus()}, active=${view.navigator.userActivation?.isActive}, top=${view.top === view}`;
    let stream: MediaStream;
    try {
      stream = await devices.getDisplayMedia({
        audio: false,
        video: { displaySurface: 'browser' },
        selfBrowserSurface: 'include',
        surfaceSwitching: 'exclude',
      } as DisplayMediaStreamOptions);
    } catch (error) {
      throw captureStartError(`Browser screen sharing [${context}]`, error);
    }
    if (generation !== this.generation) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    this.stream = stream;
    try {
      this.assertCurrentTab();
      const video = this.document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      this.video = video;
      stream
        .getVideoTracks()[0]
        .addEventListener('ended', () => this.stop(), { once: true });
      await video.play();
      if (generation === this.generation) this.onChange(true);
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  stop() {
    this.generation++;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
    }
    this.video = undefined;
    this.onChange(false);
  }

  private assertCurrentTab() {
    const track = this.stream?.getVideoTracks()[0] as CaptureTrack | undefined;
    if (
      track?.readyState !== 'live' ||
      track.getCaptureHandle?.()?.handle !== this.handle
    ) {
      throw new Error('Choose this Review tab to capture the correct page.');
    }
  }

  async capture(
    frame: HTMLIFrameElement,
    viewport: ViewportSize,
    region?: RelativeSelection
  ) {
    if (!this.video) return null;
    const styles = [this.document, frame.contentDocument].flatMap((document) => {
      if (!document?.documentElement) return [];
      const style = document.createElement('style');
      style.textContent = '#df-web-review-kit-root, .df-review-outside-marker-layer { opacity: 0 !important; }';
      document.documentElement.appendChild(style);
      return [style];
    });
    try {
      return await this.captureFrame(frame, viewport, region);
    } finally {
      styles.forEach((style) => style.remove());
    }
  }

  private async captureFrame(
    frame: HTMLIFrameElement,
    viewport: ViewportSize,
    region?: RelativeSelection
  ) {
    const video = this.video;
    if (!video) return null;
    this.assertCurrentTab();
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        video.cancelVideoFrameCallback(id);
        reject(new Error('Screen capture frame timed out.'));
      }, 3000);
      // Discard the in-flight frame so the screenshot reflects hidden overlays.
      let id = video.requestVideoFrameCallback(() => {
        id = video.requestVideoFrameCallback(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    });
    this.assertCurrentTab();
    const view = this.document.defaultView!;
    const rect = frame.getBoundingClientRect();
    const area = region ?? {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    };
    const left = rect.left + (area.x * rect.width) / viewport.width;
    const top = rect.top + (area.y * rect.height) / viewport.height;
    const width = (area.width * rect.width) / viewport.width;
    const height = (area.height * rect.height) / viewport.height;
    // Screen sharing only contains pixels visible in the host viewport.
    const clip = frame.parentElement?.getBoundingClientRect();
    if (
      width <= 0 ||
      height <= 0 ||
      left < Math.max(0, clip?.left ?? 0) - 1 ||
      top < Math.max(0, clip?.top ?? 0) - 1 ||
      left + width >
        Math.min(view.innerWidth, clip?.right ?? view.innerWidth) + 1 ||
      top + height >
        Math.min(view.innerHeight, clip?.bottom ?? view.innerHeight) + 1
    ) {
      throw new Error(
        'Capture area is clipped. Fit the target into the Review viewport.'
      );
    }
    const scaleX = video.videoWidth / view.innerWidth;
    const scaleY = video.videoHeight / view.innerHeight;
    const canvas = this.document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(area.width));
    canvas.height = Math.max(1, Math.round(area.height));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Screen capture canvas is unavailable.');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      video,
      left * scaleX,
      top * scaleY,
      width * scaleX,
      height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    return canvas;
  }
}

function captureStartError(step: string, error: unknown) {
  const detail =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return new Error(`${step} failed (${detail}).`);
}
