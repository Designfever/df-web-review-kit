import type {
  RelativeSelection,
  ReviewViewportCaptureInput,
  ReviewViewportCaptureResult,
  ViewportSize,
} from '../../types';
import type { Options as Html2CanvasOptions } from 'html2canvas';

const CAPTURE_MIME = 'image/webp';
const CAPTURE_QUALITY = 0.86;
const CAPTURE_ACCENT = '#d7ff5f';
const CAPTURE_PANEL = '#1f2428';

export async function captureIframeViewport(
  frame: HTMLIFrameElement,
  input: ReviewViewportCaptureInput
): Promise<ReviewViewportCaptureResult> {
  const targetWindow = frame.contentWindow;
  const targetDocument = frame.contentDocument;
  if (!targetWindow || !targetDocument) {
    throw new Error('Capture target iframe is not available.');
  }
  if (!targetDocument.documentElement || !targetDocument.body) {
    throw new Error('Capture target document is not ready.');
  }

  const viewport = getCaptureViewport(input.viewport, targetWindow);
  const scale = getCaptureScale(targetWindow);
  const errors: string[] = [];

  try {
    return await createHtml2CanvasCapture(
      targetDocument,
      targetWindow,
      viewport,
      scale,
      input
    );
  } catch (error) {
    errors.push(`html2canvas: ${getUnknownErrorMessage(error)}`);
  }

  const svg = createViewportSvg(targetDocument, targetWindow, viewport, input);
  const svgFile = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });

  try {
    const image = await loadViewportImage(svgFile);
    return await createSvgCanvasCapture(
      targetDocument,
      image,
      viewport,
      scale,
      input
    );
  } catch (error) {
    errors.push(`svg-canvas: ${getUnknownErrorMessage(error)}`);
  }

  return {
    file: svgFile,
    name: `review-capture-${formatCaptureTimestamp(input.timestamp)}.svg`,
    mime: 'image/svg+xml',
    width: viewport.width,
    height: viewport.height,
    metadata: {
      captureFallback: 'svg',
      captureError: errors.join(' | ') || 'Capture was saved as SVG fallback.',
    },
  };
}

async function createHtml2CanvasCapture(
  targetDocument: Document,
  targetWindow: Window,
  viewport: ViewportSize,
  scale: number,
  input: ReviewViewportCaptureInput
) {
  const html2canvas = (await import('html2canvas')).default;
  const scrollX = Math.round(targetWindow.scrollX || 0);
  const scrollY = Math.round(targetWindow.scrollY || 0);
  const options: Partial<Html2CanvasOptions> = {
    allowTaint: false,
    backgroundColor: getDocumentBackground(targetDocument),
    foreignObjectRendering: false,
    height: viewport.height,
    ignoreElements: (element) =>
      element.tagName === 'SCRIPT' ||
      element.hasAttribute('data-dfwr-source-open-shortcut'),
    imageTimeout: 5000,
    logging: false,
    removeContainer: true,
    scale,
    scrollX,
    scrollY,
    useCORS: true,
    width: viewport.width,
    windowHeight: viewport.height,
    windowWidth: viewport.width,
    x: scrollX,
    y: scrollY,
  };

  const canvas = await html2canvas(targetDocument.documentElement, options);
  drawCaptureAnnotations(canvas, scale, input);
  const file = await canvasToBlob(canvas, CAPTURE_MIME, CAPTURE_QUALITY);

  return {
    file,
    name: `review-capture-${formatCaptureTimestamp(input.timestamp)}.webp`,
    mime: CAPTURE_MIME,
    width: canvas.width,
    height: canvas.height,
    metadata: {
      captureRenderer: 'html2canvas',
      captureScale: scale,
    },
  };
}

async function createSvgCanvasCapture(
  targetDocument: Document,
  image: HTMLImageElement,
  viewport: ViewportSize,
  scale: number,
  input: ReviewViewportCaptureInput
) {
  const canvas = targetDocument.createElement('canvas');
  canvas.width = Math.round(viewport.width * scale);
  canvas.height = Math.round(viewport.height * scale);

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Capture canvas is not available.');

  context.scale(scale, scale);
  context.fillStyle = getDocumentBackground(targetDocument);
  context.fillRect(0, 0, viewport.width, viewport.height);
  context.drawImage(image, 0, 0, viewport.width, viewport.height);

  const file = await canvasToBlob(canvas, CAPTURE_MIME, CAPTURE_QUALITY);
  return {
    file,
    name: `review-capture-${formatCaptureTimestamp(input.timestamp)}.webp`,
    mime: CAPTURE_MIME,
    width: canvas.width,
    height: canvas.height,
    metadata: {
      captureRenderer: 'svg-canvas',
      captureScale: scale,
    },
  };
}

function getCaptureViewport(viewport: ViewportSize, targetWindow: Window) {
  return {
    width: Math.max(1, Math.round(viewport.width || targetWindow.innerWidth)),
    height: Math.max(1, Math.round(viewport.height || targetWindow.innerHeight)),
  };
}

function getCaptureScale(targetWindow: Window) {
  const devicePixelRatio =
    targetWindow.devicePixelRatio || window.devicePixelRatio || 1;
  return Math.max(1, Math.min(2, devicePixelRatio));
}

async function loadViewportImage(file: Blob) {
  const url = URL.createObjectURL(file);

  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function createViewportSvg(
  targetDocument: Document,
  targetWindow: Window,
  viewport: ViewportSize,
  input: ReviewViewportCaptureInput
) {
  const clone = targetDocument.documentElement.cloneNode(true) as HTMLElement;
  prepareCaptureClone(clone);

  const width = getDocumentWidth(targetDocument, targetWindow, viewport);
  const height = getDocumentHeight(targetDocument, targetWindow, viewport);
  clone.style.width = `${width}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minHeight = `${height}px`;

  const source = new XMLSerializer().serializeToString(clone);
  const x = -Math.round(targetWindow.scrollX || 0);
  const y = -Math.round(targetWindow.scrollY || 0);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${viewport.width}" height="${viewport.height}" viewBox="0 0 ${viewport.width} ${viewport.height}">`,
    `<foreignObject x="${x}" y="${y}" width="${width}" height="${height}">`,
    source,
    '</foreignObject>',
    createCaptureAnnotationSvg(input),
    '</svg>',
  ].join('');
}

function prepareCaptureClone(clone: HTMLElement) {
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  clone.querySelectorAll('script').forEach((element) => element.remove());
  clone
    .querySelectorAll('[data-dfwr-source-open-shortcut]')
    .forEach((element) => element.remove());
}

function getDocumentWidth(
  targetDocument: Document,
  targetWindow: Window,
  viewport: ViewportSize
) {
  const root = targetDocument.documentElement;
  const body = targetDocument.body;
  return Math.max(
    viewport.width,
    root.scrollWidth,
    root.clientWidth,
    body.scrollWidth,
    body.clientWidth,
    Math.round((targetWindow.scrollX || 0) + viewport.width)
  );
}

function getDocumentHeight(
  targetDocument: Document,
  targetWindow: Window,
  viewport: ViewportSize
) {
  const root = targetDocument.documentElement;
  const body = targetDocument.body;
  return Math.max(
    viewport.height,
    root.scrollHeight,
    root.clientHeight,
    body.scrollHeight,
    body.clientHeight,
    Math.round((targetWindow.scrollY || 0) + viewport.height)
  );
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to render capture image.'));
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode capture image.'));
        return;
      }
      resolve(blob);
    }, mime, quality);
  });
}

function getDocumentBackground(targetDocument: Document) {
  const view = targetDocument.defaultView;
  if (!view) return '#ffffff';

  const bodyColor = view.getComputedStyle(targetDocument.body).backgroundColor;
  if (bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)') return bodyColor;

  const rootColor = view.getComputedStyle(
    targetDocument.documentElement
  ).backgroundColor;
  return rootColor && rootColor !== 'rgba(0, 0, 0, 0)'
    ? rootColor
    : '#ffffff';
}

function createCaptureAnnotationSvg(input: ReviewViewportCaptureInput) {
  const selection = input.selection?.viewport
    ? createSelectionSvg(input.selection.viewport)
    : '';
  const marker = input.marker?.viewport
    ? createMarkerSvg(input.marker.viewport.x, input.marker.viewport.y)
    : '';
  if (!selection && !marker) return '';

  return `<g pointer-events="none">${selection}${marker}</g>`;
}

function drawCaptureAnnotations(
  canvas: HTMLCanvasElement,
  scale: number,
  input: ReviewViewportCaptureInput
) {
  const context = canvas.getContext('2d');
  if (!context) return;

  context.save();
  context.scale(scale, scale);
  drawCaptureSelection(context, input.selection?.viewport);
  drawCaptureMarker(context, input.marker?.viewport);
  context.restore();
}

function drawCaptureSelection(
  context: CanvasRenderingContext2D,
  selection?: RelativeSelection
) {
  if (!selection) return;

  const x = Math.round(selection.x);
  const y = Math.round(selection.y);
  const width = Math.round(selection.width);
  const height = Math.round(selection.height);
  const innerWidth = Math.max(0, width - 3);
  const innerHeight = Math.max(0, height - 3);

  context.fillStyle = 'rgba(215,255,95,0.12)';
  context.fillRect(x, y, width, height);

  context.lineWidth = 6;
  context.strokeStyle = 'rgba(0,0,0,0.36)';
  context.strokeRect(x + 1.5, y + 1.5, innerWidth, innerHeight);

  context.lineWidth = 3;
  context.strokeStyle = CAPTURE_ACCENT;
  context.strokeRect(x + 1.5, y + 1.5, innerWidth, innerHeight);
}

function drawCaptureMarker(
  context: CanvasRenderingContext2D,
  point?: { x: number; y: number }
) {
  if (!point) return;

  const cx = Math.round(point.x);
  const cy = Math.round(point.y);

  context.beginPath();
  context.arc(cx, cy, 12, 0, Math.PI * 2);
  context.fillStyle = 'rgba(0,0,0,0.42)';
  context.fill();

  context.beginPath();
  context.arc(cx, cy, 9, 0, Math.PI * 2);
  context.fillStyle = CAPTURE_ACCENT;
  context.fill();
  context.lineWidth = 4;
  context.strokeStyle = CAPTURE_PANEL;
  context.stroke();
}

function createSelectionSvg(selection: RelativeSelection) {
  const x = Math.round(selection.x);
  const y = Math.round(selection.y);
  const width = Math.round(selection.width);
  const height = Math.round(selection.height);
  const innerWidth = Math.max(0, width - 3);
  const innerHeight = Math.max(0, height - 3);

  return [
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="rgba(215,255,95,0.12)" />`,
    `<rect x="${x + 1.5}" y="${y + 1.5}" width="${innerWidth}" height="${innerHeight}" fill="none" stroke="rgba(0,0,0,0.36)" stroke-width="6" />`,
    `<rect x="${x + 1.5}" y="${y + 1.5}" width="${innerWidth}" height="${innerHeight}" fill="none" stroke="${CAPTURE_ACCENT}" stroke-width="3" />`,
  ].join('');
}

function createMarkerSvg(x: number, y: number) {
  const cx = Math.round(x);
  const cy = Math.round(y);
  return [
    `<circle cx="${cx}" cy="${cy}" r="12" fill="rgba(0,0,0,0.42)" />`,
    `<circle cx="${cx}" cy="${cy}" r="9" fill="${CAPTURE_ACCENT}" stroke="${CAPTURE_PANEL}" stroke-width="4" />`,
  ].join('');
}

function formatCaptureTimestamp(timestamp: string) {
  return timestamp.replace(/[^0-9A-Za-z]+/g, '-').replace(/^-|-$/g, '');
}

function getUnknownErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'Capture was saved as SVG fallback.';
}
