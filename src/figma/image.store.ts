import type {
  ReorderReviewFigmaImagesInput,
  ReviewFigmaImage,
  ReviewFigmaImageFormat,
  ReviewFigmaImageStore,
  ReviewFigmaImageTarget,
} from './image.types';

export const DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT =
  '/__dfwr/figma-images';

export type ReviewFigmaImageStoreClientOptions = {
  endpoint?: string;
  fetch?: typeof fetch;
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
    addImage(input) {
      return request<ReviewFigmaImage>(endpoint, {
        method: 'POST',
        body: JSON.stringify(input),
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
