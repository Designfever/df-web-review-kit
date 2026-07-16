import type {
  RelativeSelection,
  ReviewViewportCaptureInput,
  ReviewViewportCaptureResult,
  ViewportSize,
} from '../../types';
import type { Options as Html2CanvasOptions } from 'html2canvas';
import { getErrorMessage } from '../../core/error';

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
  const region = getCaptureRegion(input.captureRegion, viewport);
  const scale = getCaptureScale(targetWindow);
  const errors: string[] = [];

  if (region) {
    try {
      return await createHtml2CanvasCapture(
        targetDocument,
        targetWindow,
        viewport,
        scale,
        input,
        region
      );
    } catch (error) {
      throw new Error(
        `Selected region capture failed: ${getCaptureErrorMessage(error)}`
      );
    }
  }

  try {
    return await createHtml2CanvasCapture(
      targetDocument,
      targetWindow,
      viewport,
      scale,
      input
    );
  } catch (error) {
    errors.push(`html2canvas: ${getCaptureErrorMessage(error)}`);
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
    errors.push(`svg-canvas: ${getCaptureErrorMessage(error)}`);
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
  input: ReviewViewportCaptureInput,
  region?: RelativeSelection
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
    onclone: (documentClone) => {
      normalizeUnsupportedCaptureStyles(documentClone);
      normalizeUnsupportedCaptureColors(documentClone);
      normalizeZeroSizeCaptureGradients(documentClone);
    },
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

  const sourceCanvas = await html2canvas(targetDocument.documentElement, options);
  const canvas = region
    ? cropCaptureCanvas(targetDocument, sourceCanvas, region, scale)
    : sourceCanvas;
  if (!region) {
    drawCaptureAnnotations(canvas, scale, input);
  }
  const file = await canvasToBlob(canvas, CAPTURE_MIME, CAPTURE_QUALITY);

  return {
    file,
    name: `review-capture-${formatCaptureTimestamp(input.timestamp)}.webp`,
    mime: CAPTURE_MIME,
    width: canvas.width,
    height: canvas.height,
    metadata: {
      captureRenderer: 'html2canvas',
      captureTarget: region ? 'selection' : 'viewport',
      ...(region ? { captureRegion: region } : {}),
      captureScale: scale,
    },
  };
}

function cropCaptureCanvas(
  targetDocument: Document,
  sourceCanvas: HTMLCanvasElement,
  region: RelativeSelection,
  scale: number
) {
  const x = Math.round(region.x * scale);
  const y = Math.round(region.y * scale);
  const width = Math.min(
    Math.max(1, Math.round(region.width * scale)),
    Math.max(1, sourceCanvas.width - x)
  );
  const height = Math.min(
    Math.max(1, Math.round(region.height * scale)),
    Math.max(1, sourceCanvas.height - y)
  );
  const canvas = targetDocument.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Capture canvas is not available.');

  context.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);
  return canvas;
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

function getCaptureRegion(
  region: RelativeSelection | undefined,
  viewport: ViewportSize
): RelativeSelection | undefined {
  if (!region) return undefined;

  const x = Math.max(0, Math.round(region.x));
  const y = Math.max(0, Math.round(region.y));
  const width = Math.min(
    Math.max(1, Math.round(region.width)),
    Math.max(1, viewport.width - x)
  );
  const height = Math.min(
    Math.max(1, Math.round(region.height)),
    Math.max(1, viewport.height - y)
  );

  return { x, y, width, height };
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

function normalizeUnsupportedCaptureStyles(documentClone: Document) {
  documentClone.querySelectorAll('style').forEach((styleElement) => {
    if (!hasUnsupportedColorFunction(styleElement.textContent ?? '')) return;
    styleElement.textContent = normalizeUnsupportedStyleText(
      styleElement.textContent
    );
  });

  Array.from(documentClone.styleSheets).forEach((sheet) => {
    try {
      normalizeCssRuleList(sheet.cssRules);
    } catch {
      // Ignore inaccessible stylesheets.
    }
  });
}

function normalizeCssRuleList(rules: CSSRuleList) {
  Array.from(rules).forEach((rule) => {
    const style = (rule as CSSStyleRule).style;
    if (style) normalizeStyleDeclaration(style);

    const nestedRules = (rule as CSSGroupingRule).cssRules;
    if (nestedRules) normalizeCssRuleList(nestedRules);
  });
}

function normalizeStyleDeclaration(style: CSSStyleDeclaration) {
  for (let index = 0; index < style.length; index += 1) {
    const property = style.item(index);
    const value = style.getPropertyValue(property);
    if (!hasUnsupportedColorFunction(value)) continue;

    try {
      style.setProperty(
        property,
        normalizeUnsupportedStyleValue(property, value),
        style.getPropertyPriority(property)
      );
    } catch {
      // Ignore read-only CSS rules in the cloned tree.
    }
  }
}

function normalizeUnsupportedCaptureColors(documentClone: Document) {
  const view = documentClone.defaultView;
  if (!view) return;

  const elements = [
    documentClone.documentElement,
    ...Array.from(documentClone.documentElement.querySelectorAll('*')),
  ];

  elements.forEach((element) => {
    const HTMLElementConstructor = view.HTMLElement;
    const SVGElementConstructor = view.SVGElement;
    const isHtmlElement =
      typeof HTMLElementConstructor === 'function' &&
      element instanceof HTMLElementConstructor;
    const isSvgElement =
      typeof SVGElementConstructor === 'function' &&
      element instanceof SVGElementConstructor;

    if (!isHtmlElement && !isSvgElement) {
      return;
    }

    const style = view.getComputedStyle(element);
    for (let index = 0; index < style.length; index += 1) {
      const property = style.item(index);
      const value = style.getPropertyValue(property);
      if (!hasUnsupportedColorFunction(value)) continue;

      try {
        element.style.setProperty(
          property,
          normalizeUnsupportedStyleValue(property, value)
        );
      } catch {
        // Ignore properties that cannot be assigned inline in the cloned tree.
      }
    }
  });
}

export function normalizeZeroSizeCaptureGradients(documentClone: Document) {
  const view = documentClone.defaultView;
  if (!view) return;

  documentClone.documentElement.querySelectorAll<HTMLElement>('*').forEach(
    (element) => {
      const backgroundImage = view.getComputedStyle(element).backgroundImage;
      if (!backgroundImage.includes('gradient(')) return;

      const bounds = element.getBoundingClientRect();
      if (bounds.width > 0 && bounds.height > 0) return;

      element.style.setProperty('background-image', 'none', 'important');
    }
  );
}

function hasUnsupportedColorFunction(value: string) {
  return /okl(?:ch|ab)\(|color-mix\(/i.test(value);
}

function normalizeUnsupportedStyleText(value: string) {
  return normalizeUnsupportedColorFunctions(value);
}

function normalizeUnsupportedStyleValue(property: string, value: string) {
  if (/color-mix\(/i.test(value)) {
    if (property.includes('shadow')) return 'none';
    if (property === 'background' || property === 'background-image') {
      return 'none';
    }
    return 'rgba(0, 0, 0, 0)';
  }

  return normalizeUnsupportedColorFunctions(value);
}

function normalizeUnsupportedColorFunctions(value: string) {
  return value
    .replace(
      /oklch\(\s*([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)(deg|rad|turn)?(?:\s*\/\s*([+-]?\d*\.?\d+%?))?\s*\)/gi,
      (_match, lightness, chroma, hue, unit, alpha) =>
        oklchToRgbString(lightness, chroma, hue, unit, alpha)
    )
    .replace(
      /oklab\(\s*([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+%?)(?:\s*\/\s*([+-]?\d*\.?\d+%?))?\s*\)/gi,
      (_match, lightness, okA, okB, alpha) =>
        oklabToRgbString(lightness, okA, okB, alpha)
    );
}

function oklchToRgbString(
  lightness: string,
  chroma: string,
  hue: string,
  unit?: string,
  alpha?: string
) {
  const l = parsePercentNumber(lightness);
  const c = Number.parseFloat(chroma);
  const h = parseHueDegrees(hue, unit);
  const a = alpha ? parsePercentNumber(alpha) : 1;
  const hueRadians = (h * Math.PI) / 180;
  const okA = c * Math.cos(hueRadians);
  const okB = c * Math.sin(hueRadians);

  return oklabComponentsToRgbString(l, okA, okB, a);
}

function oklabToRgbString(
  lightness: string,
  okA: string,
  okB: string,
  alpha?: string
) {
  return oklabComponentsToRgbString(
    parsePercentNumber(lightness),
    parseOklabChannel(okA),
    parseOklabChannel(okB),
    alpha ? parsePercentNumber(alpha) : 1
  );
}

function oklabComponentsToRgbString(
  l: number,
  okA: number,
  okB: number,
  alpha: number
) {
  const l_ = l + 0.3963377774 * okA + 0.2158037573 * okB;
  const m_ = l - 0.1055613458 * okA - 0.0638541728 * okB;
  const s_ = l - 0.0894841775 * okA - 1.291485548 * okB;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = linearRgbToSrgb(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3);
  const g = linearRgbToSrgb(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3);
  const b = linearRgbToSrgb(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3);
  const red = Math.round(clamp01(r) * 255);
  const green = Math.round(clamp01(g) * 255);
  const blue = Math.round(clamp01(b) * 255);
  const opacity = clamp01(alpha);

  return opacity < 1
    ? `rgba(${red}, ${green}, ${blue}, ${roundAlpha(opacity)})`
    : `rgb(${red}, ${green}, ${blue})`;
}

function parsePercentNumber(value: string) {
  const number = Number.parseFloat(value);
  return value.trim().endsWith('%') ? number / 100 : number;
}

function parseOklabChannel(value: string) {
  const number = Number.parseFloat(value);
  return value.trim().endsWith('%') ? (number / 100) * 0.4 : number;
}

function parseHueDegrees(value: string, unit?: string) {
  const number = Number.parseFloat(value);
  if (unit === 'rad') return (number * 180) / Math.PI;
  if (unit === 'turn') return number * 360;
  return number;
}

function linearRgbToSrgb(value: number) {
  return value <= 0.0031308
    ? 12.92 * value
    : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function roundAlpha(value: number) {
  return Math.round(value * 1000) / 1000;
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

function getCaptureErrorMessage(error: unknown) {
  return getErrorMessage(error, 'Capture was saved as SVG fallback.');
}
