import type {
  ReviewFigmaImageAssetInput,
  ReviewFigmaImageFormat,
} from './image.types';

const IMAGE_FORMAT_BY_MIME_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const satisfies Record<string, ReviewFigmaImageFormat>;

const IMAGE_URL_PATTERN = /\.(?:jpe?g|png|webp)$/i;

export function isReviewImageUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      IMAGE_URL_PATTERN.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export async function createReviewImageAssetFromFile(
  file: File
): Promise<ReviewFigmaImageAssetInput> {
  const mimeType = normalizeImageMimeType(file.type);
  if (!mimeType) {
    throw new Error('Use a PNG, WebP, JPG, or JPEG image.');
  }

  const dataUrl = await readBlobAsDataUrl(file);
  const dimensions = await readImageDimensions(dataUrl);
  return {
    dataUrl,
    imageFormat: IMAGE_FORMAT_BY_MIME_TYPE[mimeType],
    mimeType,
    byteSize: file.size,
    ...dimensions,
  };
}

export async function createReviewImageAssetFromUrl(
  value: string,
  fetchOption: typeof fetch = fetch
): Promise<ReviewFigmaImageAssetInput> {
  const imageUrl = value.trim();
  if (!isReviewImageUrl(imageUrl)) {
    throw new Error('Use a Figma URL or a PNG, WebP, JPG, or JPEG URL.');
  }

  const response = await fetchOption(imageUrl);
  if (!response.ok) {
    throw new Error(`Image download failed with ${response.status}.`);
  }
  const blob = await response.blob();
  const mimeType = normalizeImageMimeType(blob.type);
  if (!mimeType) {
    throw new Error('The URL did not return a supported image.');
  }
  const fileName = new URL(imageUrl).pathname.split('/').pop() || 'image';
  return createReviewImageAssetFromFile(
    new File([blob], fileName, { type: mimeType })
  );
}

function normalizeImageMimeType(value: string) {
  const mimeType = value.split(';')[0]?.trim().toLowerCase();
  if (mimeType === 'image/jpg') return 'image/jpeg';
  return mimeType in IMAGE_FORMAT_BY_MIME_TYPE
    ? (mimeType as keyof typeof IMAGE_FORMAT_BY_MIME_TYPE)
    : null;
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Image encoding failed.'));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Image encoding failed.'));
    reader.readAsDataURL(blob);
  });
}

function readImageDimensions(dataUrl: string) {
  return new Promise<{ width?: number; height?: number }>((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve({
        width: image.naturalWidth || undefined,
        height: image.naturalHeight || undefined,
      });
    image.onerror = () => resolve({});
    image.src = dataUrl;
  });
}
