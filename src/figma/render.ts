import {
  requireReviewFigmaNodeRef,
  type ReviewFigmaNodeRef,
} from './parse';
import { requireReviewFigmaToken } from './token';

export type ReviewFigmaRenderFormat = 'png' | 'jpg' | 'svg' | 'pdf';

export type ReviewFigmaImageRenderOptions = {
  figmaUrl: string | ReviewFigmaNodeRef;
  token?: string | null;
  format?: ReviewFigmaRenderFormat;
  scale?: number;
  useAbsoluteBounds?: boolean;
  apiBaseUrl?: string;
  fetch?: typeof fetch;
  signal?: AbortSignal;
};

export type ReviewFigmaRenderedImage = {
  fileKey: string;
  nodeId: string;
  figmaUrl?: string;
  imageUrl: string;
  renderFormat: ReviewFigmaRenderFormat;
};

type FigmaImageResponse = {
  err?: string | null;
  images?: Record<string, string | null | undefined>;
};

const DEFAULT_FIGMA_API_BASE_URL = 'https://api.figma.com';

export async function renderReviewFigmaImage(
  options: ReviewFigmaImageRenderOptions
): Promise<ReviewFigmaRenderedImage> {
  const token = requireReviewFigmaToken({ token: options.token });
  const ref = requireReviewFigmaNodeRef(options.figmaUrl);
  const renderFormat = options.format ?? 'png';
  const requestUrl = createReviewFigmaImageApiUrl({
    apiBaseUrl: options.apiBaseUrl,
    fileKey: ref.fileKey,
    nodeId: ref.nodeId,
    format: renderFormat,
    scale: options.scale,
    useAbsoluteBounds: options.useAbsoluteBounds,
  });
  const fetchImage = options.fetch ?? globalThis.fetch;
  if (!fetchImage) throw new Error('Figma image rendering requires fetch.');

  const response = await fetchImage(requestUrl, {
    headers: {
      'X-Figma-Token': token,
    },
    signal: options.signal,
  });
  const body = (await response.json().catch(() => null)) as
    | FigmaImageResponse
    | null;

  if (!response.ok) {
    throw new Error(
      body?.err || `Figma image render failed with ${response.status}`
    );
  }

  const imageUrl = body?.images?.[ref.nodeId];
  if (!imageUrl) {
    throw new Error(`Figma image render returned no URL for ${ref.nodeId}.`);
  }

  return {
    fileKey: ref.fileKey,
    nodeId: ref.nodeId,
    figmaUrl: typeof options.figmaUrl === 'string'
      ? options.figmaUrl
      : options.figmaUrl.sourceUrl,
    imageUrl,
    renderFormat,
  };
}

export function createReviewFigmaImageApiUrl({
  apiBaseUrl = DEFAULT_FIGMA_API_BASE_URL,
  fileKey,
  nodeId,
  format = 'png',
  scale,
  useAbsoluteBounds,
}: {
  apiBaseUrl?: string;
  fileKey: string;
  nodeId: string;
  format?: ReviewFigmaRenderFormat;
  scale?: number;
  useAbsoluteBounds?: boolean;
}) {
  const url = new URL(`/v1/images/${encodeURIComponent(fileKey)}`, apiBaseUrl);
  url.searchParams.set('ids', nodeId);
  url.searchParams.set('format', format);

  if (typeof scale === 'number' && Number.isFinite(scale) && scale > 0) {
    url.searchParams.set('scale', String(scale));
  }
  if (useAbsoluteBounds !== undefined) {
    url.searchParams.set('use_absolute_bounds', String(useAbsoluteBounds));
  }

  return url.toString();
}
