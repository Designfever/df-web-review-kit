// Pure helpers for Figma image asset format conversion and storage-key handling.
// Extracted from src/vite.ts to keep the plugin entry focused on request flow.
import type { ReviewFigmaImageFormat } from '../figma/image.types';
import type { ReviewFigmaRenderFormat } from '../figma/render';

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

export function getReviewFigmaAssetStorageKeyFromPathname(
  pathname: string,
  assetEndpoint: string
) {
  try {
    const storageKey = decodeURIComponent(
      pathname.slice(assetEndpoint.length + 1)
    );
    return isSafeReviewFigmaAssetStorageKey(storageKey) ? storageKey : null;
  } catch {
    return null;
  }
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
