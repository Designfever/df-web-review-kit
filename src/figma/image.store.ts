import type {
  AddReviewFigmaImageInput,
  ReorderReviewFigmaImagesInput,
  ReviewFigmaImage,
  ReviewFigmaImageAssetInput,
  ReviewFigmaImageFormat,
  ReviewFigmaImageStore,
  ReviewFigmaImageTarget,
} from './image.types';
import { getReviewFigmaImageFormatFromMimeType } from '../vite/figma-asset';
import { parseReviewFigmaNodeRef } from './parse';
import {
  createReviewFigmaImageApiUrl,
  type ReviewFigmaRenderFormat,
} from './render';

export const DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT =
  '/__dfwr/figma-images';

export type ReviewFigmaImageStoreClientOptions = {
  endpoint?: string;
  fetch?: typeof fetch;
  clientRender?: boolean | ReviewFigmaImageClientRenderOptions;
};

export type ReviewFigmaImageClientRenderOptions = {
  token?: string | null | (() => string | null | undefined);
  apiBaseUrl?: string;
  renderFormat?: Extract<ReviewFigmaRenderFormat, 'png' | 'jpg'>;
  renderScale?: number;
  useAbsoluteBounds?: boolean;
  convertToWebp?: boolean;
  webpQuality?: number;
  timeoutMs?: number;
};

export function createReviewFigmaImageStoreClient(
  options: ReviewFigmaImageStoreClientOptions = {}
): ReviewFigmaImageStore {
  const endpoint =
    options.endpoint ?? DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT;
  const request = createReviewFigmaImageStoreRequest(endpoint, options.fetch);

  return {
    listImages(target) {
      const url = `${endpoint}?target=${encodeURIComponent(
        JSON.stringify(target)
      )}`;
      return request<ReviewFigmaImage[]>(url);
    },
    async addImage(input) {
      const nextInput = await createClientRenderedAddImageInput(
        input,
        options.clientRender,
        options.fetch
      );
      return request<ReviewFigmaImage>(endpoint, {
        method: 'POST',
        body: JSON.stringify(nextInput),
      });
    },
    updateImage(id, patch) {
      return request<ReviewFigmaImage>(`${endpoint}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
    },
    reorderImages(input) {
      return request<ReviewFigmaImage[]>(`${endpoint}/reorder`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },
    deleteImage(id) {
      return request<void>(`${endpoint}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  };
}

async function createClientRenderedAddImageInput(
  input: AddReviewFigmaImageInput,
  clientRender: ReviewFigmaImageStoreClientOptions['clientRender'],
  fetchOption: typeof fetch | undefined
): Promise<AddReviewFigmaImageInput> {
  const options = normalizeClientRenderOptions(clientRender);
  if (!options) return input;

  const token = readClientRenderToken(options);
  if (!token) return input;

  try {
    const asset = await withTimeout(
      createClientRenderedFigmaAsset(input.figmaUrl, token, options, fetchOption),
      options.timeoutMs ?? 10000
    );
    return {
      ...input,
      imageFormat: asset.imageFormat,
      asset,
    };
  } catch {
    return input;
  }
}

function normalizeClientRenderOptions(
  clientRender: ReviewFigmaImageStoreClientOptions['clientRender']
): ReviewFigmaImageClientRenderOptions | null {
  if (!clientRender) return null;
  if (clientRender === true) return {};
  return clientRender;
}

function readClientRenderToken(options: ReviewFigmaImageClientRenderOptions) {
  const token =
    typeof options.token === 'function' ? options.token() : options.token;
  return typeof token === 'string' ? token.trim() : '';
}

async function createClientRenderedFigmaAsset(
  figmaUrl: string,
  token: string,
  options: ReviewFigmaImageClientRenderOptions,
  fetchOption: typeof fetch | undefined
): Promise<ReviewFigmaImageAssetInput> {
  const ref = parseReviewFigmaNodeRef(figmaUrl);
  if (!ref) throw new Error('A Figma node link is required.');

  const requestFetch = fetchOption ?? globalThis.fetch;
  if (!requestFetch) throw new Error('Figma client rendering requires fetch.');

  const renderFormat = options.renderFormat ?? 'png';
  const response = await requestFetch(
    createReviewFigmaImageApiUrl({
      apiBaseUrl: options.apiBaseUrl,
      fileKey: ref.fileKey,
      nodeId: ref.nodeId,
      format: renderFormat,
      scale: options.renderScale,
      useAbsoluteBounds: options.useAbsoluteBounds,
    }),
    {
      headers: {
        'X-Figma-Token': token,
      },
    }
  );
  const body = (await response.json().catch(() => null)) as
    | { err?: string | null; images?: Record<string, string | null | undefined> }
    | null;
  if (!response.ok) {
    throw new Error(body?.err || `Figma image render failed with ${response.status}`);
  }

  const imageUrl = body?.images?.[ref.nodeId];
  if (!imageUrl) throw new Error(`Figma image render returned no URL for ${ref.nodeId}.`);

  const imageResponse = await requestFetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Figma image download failed with ${imageResponse.status}`);
  }

  const originalBlob = await imageResponse.blob();
  const originalMimeType =
    normalizeClientImageMimeType(originalBlob.type) ??
    getReviewFigmaImageMimeType(renderFormat === 'jpg' ? 'jpg' : 'png');
  const originalFormat =
    getReviewFigmaImageFormatFromMimeType(originalMimeType) ??
    (renderFormat === 'jpg' ? 'jpg' : 'png');
  const dimensions = await readImageBlobDimensions(originalBlob);
  const shouldConvertToWebp = options.convertToWebp ?? true;
  const convertedBlob = shouldConvertToWebp
    ? await convertImageBlobToWebp(
        originalBlob,
        options.webpQuality ?? 0.9,
        dimensions
      ).catch(() => null)
    : null;
  const finalBlob =
    convertedBlob?.type === 'image/webp' ? convertedBlob : originalBlob;
  const finalMimeType =
    normalizeClientImageMimeType(finalBlob.type) ?? originalMimeType;
  const finalFormat =
    getReviewFigmaImageFormatFromMimeType(finalMimeType) ?? originalFormat;

  return {
    dataUrl: await blobToDataUrl(finalBlob),
    imageFormat: finalFormat,
    mimeType: finalMimeType,
    byteSize: finalBlob.size,
    width: dimensions.width,
    height: dimensions.height,
  };
}

async function readImageBlobDimensions(blob: Blob) {
  const image = await loadImageBlob(blob);
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
}

async function convertImageBlobToWebp(
  blob: Blob,
  quality: number,
  dimensions: { width: number; height: number }
) {
  if (typeof document === 'undefined') return null;
  if (!dimensions.width || !dimensions.height) return null;

  const image = await loadImageBlob(blob);
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(image, 0, 0);

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', quality);
  });
}

function loadImageBlob(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (typeof Image === 'undefined' || typeof URL === 'undefined') {
      reject(new Error('Image decoding is unavailable.'));
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(blob);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image decoding failed.'));
    };
    image.src = objectUrl;
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Blob encoding failed.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Blob encoding failed.'));
    reader.readAsDataURL(blob);
  });
}

function normalizeClientImageMimeType(value: string | null | undefined) {
  const mimeType = value?.split(';')[0]?.trim().toLowerCase();
  if (mimeType === 'image/jpg') return 'image/jpeg';
  if (
    mimeType === 'image/jpeg' ||
    mimeType === 'image/png' ||
    mimeType === 'image/webp'
  ) {
    return mimeType;
  }
  return null;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('Figma client rendering timed out.')),
          timeoutMs
        );
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function getReviewFigmaImageTargetKey(target: ReviewFigmaImageTarget) {
  return JSON.stringify(normalizeReviewFigmaImageTarget(target));
}

export function getReviewFigmaImageMimeType(
  format: ReviewFigmaImageFormat
) {
  if (format === 'jpg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  return 'image/webp';
}

function createReviewFigmaImageStoreRequest(
  endpoint: string,
  fetchOption: typeof fetch | undefined
) {
  return async <T>(input: string, init: RequestInit = {}) => {
    const requestFetch = fetchOption ?? globalThis.fetch;
    if (!requestFetch) throw new Error('Figma image store requires fetch.');

    const response = await requestFetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message =
        typeof body?.error === 'string'
          ? body.error
          : `Figma image store request failed: ${response.status}`;
      throw new Error(message);
    }

    return body as T;
  };
}

function normalizeReviewFigmaImageTarget(target: ReviewFigmaImageTarget) {
  if (target.type === 'figma-node') {
    return {
      type: target.type,
      projectId: target.projectId,
      fileKey: target.fileKey,
      nodeId: target.nodeId,
    };
  }

  return {
    type: target.type,
    projectId: target.projectId,
    pageUrl: target.pageUrl,
    slot: target.slot ?? '',
    viewport: target.viewport
      ? {
          label: target.viewport.label ?? '',
          width: target.viewport.width ?? null,
          height: target.viewport.height ?? null,
          scope: target.viewport.scope ?? '',
        }
      : null,
  };
}

export type { ReorderReviewFigmaImagesInput };
