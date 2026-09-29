// Pure helpers for Figma image asset format conversion and storage-key handling.
import type {
  ReviewFigmaImageAssetInput,
  ReviewFigmaImageFormat,
} from './image.types';
import type { ReviewFigmaRenderFormat } from './render';

export function parseReviewFigmaImageFormat(value: unknown) {
  return value === 'webp' || value === 'png' || value === 'jpg'
    ? value
    : undefined;
}

export function getStoreRenderFormat(
  renderFormat: ReviewFigmaRenderFormat | undefined,
  imageFormat: ReviewFigmaImageFormat | undefined
): Extract<ReviewFigmaRenderFormat, 'png' | 'jpg'> {
  if (renderFormat === 'jpg' || renderFormat === 'png') return renderFormat;
  if (imageFormat === 'jpg') return 'jpg';
  return 'png';
}

export function getReviewFigmaImageFormatFromMimeType(
  mimeType: string
): ReviewFigmaImageFormat | null {
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/jpeg') return 'jpg';
  return null;
}

export function normalizeImageMimeType(value: string | null | undefined) {
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

export function createReviewFigmaAssetStorageKey(
  id: string,
  imageFormat: ReviewFigmaImageFormat
) {
  return `${id}.${getReviewFigmaAssetExtension(imageFormat)}`;
}

export function createReviewFigmaAssetUrl(
  assetEndpoint: string,
  storageKey: string
) {
  return `${assetEndpoint}/${encodeURIComponent(storageKey)}`;
}

export function isSafeReviewFigmaAssetStorageKey(value: string) {
  return /^figma_[a-z0-9_]+\.(webp|png|jpg)$/.test(value);
}

function getReviewFigmaAssetExtension(format: ReviewFigmaImageFormat) {
  return format === 'jpg' ? 'jpg' : format;
}

export function getReviewFigmaAssetMimeType(storageKey: string) {
  if (storageKey.endsWith('.jpg')) return 'image/jpeg';
  if (storageKey.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

export function getReviewFigmaImageMimeType(
  format: ReviewFigmaImageFormat
) {
  if (format === 'jpg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  return 'image/webp';
}

export function decodeReviewFigmaImageDataUrl(asset: ReviewFigmaImageAssetInput) {
  const match = asset.dataUrl.match(/^data:([^;,]+);base64,(.*)$/);
  if (!match) throw new Error('Valid Figma image asset data URL is required.');
  if (match[1]?.trim() !== asset.mimeType) {
    throw new Error('Figma image asset MIME type mismatch.');
  }
  const binary = globalThis.atob(match[2] ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return {
    blob: new Blob([bytes], { type: asset.mimeType }),
    mimeType: asset.mimeType,
  };
}
