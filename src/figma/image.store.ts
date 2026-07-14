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

type ReviewFigmaImageTokenProvider =
  | string
  | null
  | undefined
  | (() => string | null | undefined);

export type ReviewFigmaImageStoreHeadersProvider =
  | HeadersInit
  | null
  | undefined
  | (() => HeadersInit | null | undefined | Promise<HeadersInit | null | undefined>);

export type ReviewFigmaImageStoreClientOptions = {
  endpoint?: string;
  fetch?: typeof fetch;
  token?: ReviewFigmaImageTokenProvider;
  clientRender?: boolean | ReviewFigmaImageClientRenderOptions;
};

export type EndpointReviewFigmaImageStoreOptions =
  ReviewFigmaImageStoreClientOptions & {
    headers?: ReviewFigmaImageStoreHeadersProvider;
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

export type CreateReviewFigmaClientRenderedAssetOptions =
  ReviewFigmaImageClientRenderOptions & {
    figmaUrl: string;
    token: string;
    fetch?: typeof fetch;
  };

export function createReviewFigmaImageStoreClient(
  options: ReviewFigmaImageStoreClientOptions = {}
): ReviewFigmaImageStore {
  return createEndpointReviewFigmaImageStore(options);
}

export function createEndpointReviewFigmaImageStore(
  options: EndpointReviewFigmaImageStoreOptions = {}
): ReviewFigmaImageStore {
  const endpoint =
    options.endpoint ?? DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT;
  const request = createReviewFigmaImageStoreRequest(
    options.fetch,
    options.headers
  );

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
        figmaToken: readReviewFigmaImageToken(
          options.token ?? getStoredReviewFigmaImageToken
        ),
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
    const asset = await createReviewFigmaClientRenderedAsset({
      ...options,
      fetch: fetchOption,
      figmaUrl: input.figmaUrl,
      token,
    });
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
  const timeoutMs = options.timeoutMs ?? 10000;
  const imageUrl = await withStageTimeout(
    async (signal) => {
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
          signal,
        }
      );
      const body = (await response.json().catch(() => null)) as
        | {
            err?: string | null;
            images?: Record<string, string | null | undefined>;
          }
        | null;
      if (!response.ok) {
        throw new Error(
          body?.err || `Figma image render failed with ${response.status}`
        );
      }

      const nextImageUrl = body?.images?.[ref.nodeId];
      if (!nextImageUrl) {
        throw new Error(
          `Figma image render returned no URL for ${ref.nodeId}.`
        );
      }
      return nextImageUrl;
    },
    timeoutMs,
    'Figma API request timed out.'
  );

  const originalBlob = await withStageTimeout(
    async (signal) => {
      const imageResponse = await requestFetch(imageUrl, { signal });
      if (!imageResponse.ok) {
        throw new Error(
          `Figma image download failed with ${imageResponse.status}`
        );
      }
      return imageResponse.blob();
    },
    timeoutMs,
    'Figma image download timed out.'
  );

  return withStageTimeout(
    () => createProcessedFigmaAsset(originalBlob, renderFormat, options),
    timeoutMs,
    'Figma image processing timed out.'
  );
}

async function createProcessedFigmaAsset(
  originalBlob: Blob,
  renderFormat: Extract<ReviewFigmaRenderFormat, 'png' | 'jpg'>,
  options: ReviewFigmaImageClientRenderOptions
): Promise<ReviewFigmaImageAssetInput> {
  const originalMimeType =
    normalizeClientImageMimeType(originalBlob.type) ??
    getReviewFigmaImageMimeType(renderFormat === 'jpg' ? 'jpg' : 'png');
  const originalFormat =
    getReviewFigmaImageFormatFromMimeType(originalMimeType) ??
    (renderFormat === 'jpg' ? 'jpg' : 'png');
  const image = await loadImageBlob(originalBlob);
  const dimensions = readImageDimensions(image);
  const shouldConvertToWebp = options.convertToWebp ?? true;
  const convertedBlob = shouldConvertToWebp
    ? await convertImageToWebp(
        image,
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

export function createReviewFigmaClientRenderedAsset({
  fetch: fetchOption,
  figmaUrl,
  token,
  ...options
}: CreateReviewFigmaClientRenderedAssetOptions): Promise<ReviewFigmaImageAssetInput> {
  return createClientRenderedFigmaAsset(figmaUrl, token, options, fetchOption);
}

function readImageDimensions(image: HTMLImageElement) {
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
}

async function convertImageToWebp(
  image: HTMLImageElement,
  quality: number,
  dimensions: { width: number; height: number }
) {
  if (typeof document === 'undefined') return null;
  if (!dimensions.width || !dimensions.height) return null;

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

async function withStageTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  message: string
) {
  const controller = new AbortController();
  let didTimeout = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    try {
      return await Promise.race([
        run(controller.signal),
        new Promise<T>((_, reject) => {
          timeoutId = setTimeout(() => {
            didTimeout = true;
            controller.abort();
            reject(new Error(message));
          }, timeoutMs);
        }),
      ]);
    } catch (error) {
      if (didTimeout) throw new Error(message);
      throw error;
    }
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

type ReviewFigmaImageStoreRequestInit = RequestInit & {
  figmaToken?: string;
};

function createReviewFigmaImageStoreRequest(
  fetchOption: typeof fetch | undefined,
  headersProvider: ReviewFigmaImageStoreHeadersProvider
) {
  return async <T>(
    input: string,
    init: ReviewFigmaImageStoreRequestInit = {}
  ) => {
    const requestFetch = fetchOption ?? globalThis.fetch;
    if (!requestFetch) throw new Error('Figma image store requires fetch.');
    const figmaToken = init.figmaToken ?? '';
    const {
      figmaToken: _figmaToken,
      headers: requestHeaders,
      ...requestInit
    } = init;
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (figmaToken) headers.set('X-Figma-Token', figmaToken);
    appendReviewFigmaImageStoreHeaders(
      headers,
      await readReviewFigmaImageStoreHeaders(headersProvider)
    );
    appendReviewFigmaImageStoreHeaders(headers, requestHeaders);

    const response = await requestFetch(input, {
      ...requestInit,
      headers,
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

async function readReviewFigmaImageStoreHeaders(
  provider: ReviewFigmaImageStoreHeadersProvider
) {
  return typeof provider === 'function' ? provider() : provider;
}

function appendReviewFigmaImageStoreHeaders(
  target: Headers,
  source: HeadersInit | null | undefined
) {
  if (!source) return;
  new Headers(source).forEach((value, key) => {
    target.set(key, value);
  });
}

function readReviewFigmaImageToken(provider: ReviewFigmaImageTokenProvider) {
  const token = typeof provider === 'function' ? provider() : provider;
  return typeof token === 'string' ? token.trim() : '';
}

function getStoredReviewFigmaImageToken() {
  if (typeof window === 'undefined') return '';

  try {
    return window.localStorage.getItem('figma-token') ?? '';
  } catch {
    return '';
  }
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
