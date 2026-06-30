import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  ReviewFigmaImage,
  ReviewFigmaImageAssetInput,
  ReviewFigmaImageFormat,
  ReviewFigmaImageTarget,
  AddReviewFigmaImageInput,
  UpdateReviewFigmaImageInput,
} from '../figma/image.types';
import {
  getReviewFigmaImageMimeType,
  getReviewFigmaImageTargetKey,
  type ReorderReviewFigmaImagesInput,
} from '../figma/image.store';
import { parseReviewFigmaNodeRef } from '../figma/parse';
import {
  requireReviewFigmaToken,
  DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  type ReviewFigmaTokenEnv,
} from '../figma/token';
import {
  renderReviewFigmaImage,
  type ReviewFigmaRenderFormat,
} from '../figma/render';
import {
  createReviewFigmaAssetStorageKey,
  createReviewFigmaAssetUrl,
  getReviewFigmaImageFormatFromMimeType,
  getStoreRenderFormat,
  isSafeReviewFigmaAssetStorageKey,
  normalizeImageMimeType,
} from './figma-asset';
import type { ReviewFigmaImageStorePluginOptions, ReviewFigmaImageAssetTransformer } from './figma-image-store';

export type ReviewFigmaImageStoreFile = {
  version: 1;
  images: ReviewFigmaImage[];
};

async function readReviewFigmaNodeName({
  apiBaseUrl,
  enabled,
  env,
  envKey,
  fetchOption,
  fileKey,
  nodeId,
  token,
}: {
  apiBaseUrl?: string;
  enabled?: boolean;
  env: ReviewFigmaTokenEnv;
  envKey?: string;
  fetchOption?: typeof fetch;
  fileKey: string;
  nodeId: string;
  token?: string | null;
}) {
  const explicitToken = typeof token === 'string' ? token.trim() : token;
  const figmaToken =
    explicitToken ||
    requireReviewFigmaToken({
      token: null,
      env,
      envKey: envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
      enabled,
    });
  const fetchNode = fetchOption ?? globalThis.fetch;
  if (!fetchNode) throw new Error('Figma node name lookup requires fetch.');

  type FigmaNodeResponse = {
    err?: string | null;
    nodes?: Record<string, { document?: { name?: string | null } | null } | null | undefined>;
  };

  const response = await fetchNode(
    createReviewFigmaNodeApiUrl({ apiBaseUrl, fileKey, nodeId }),
    {
      headers: {
        'X-Figma-Token': figmaToken,
      },
    }
  );
  const body = (await response.json().catch(() => null)) as FigmaNodeResponse | null;

  if (!response.ok) {
    throw new Error(body?.err || `Figma node lookup failed with ${response.status}`);
  }

  const nodes = body?.nodes;
  const node = nodes?.[nodeId] ?? Object.values(nodes ?? {})[0];
  return normalizeOptionalText(node?.document?.name);
}

function createReviewFigmaNodeApiUrl({
  apiBaseUrl = 'https://api.figma.com',
  fileKey,
  nodeId,
}: {
  apiBaseUrl?: string;
  fileKey: string;
  nodeId: string;
}) {
  const url = new URL(
    `/v1/files/${encodeURIComponent(fileKey)}/nodes`,
    apiBaseUrl
  );
  url.searchParams.set('ids', nodeId);
  return url.toString();
}

export async function createReviewFigmaImage({
  assetDir,
  assetEndpoint,
  currentImages,
  env,
  input,
  options,
}: {
  assetDir: string;
  assetEndpoint: string;
  currentImages: ReviewFigmaImage[];
  env: ReviewFigmaTokenEnv;
  input: AddReviewFigmaImageInput;
  options: ReviewFigmaImageStorePluginOptions;
}): Promise<ReviewFigmaImage> {
  const ref = parseReviewFigmaNodeRef(input.figmaUrl);
  if (!ref) {
    throw new Error('A Figma node copy link or fileKey->nodeId value is required.');
  }

  const id = createReviewFigmaImageId();
  const explicitLabel = normalizeOptionalText(input.label);
  if (input.asset) {
    const cachedAsset = await cacheReviewFigmaProvidedImageAsset({
      assetDir,
      assetEndpoint,
      id,
      asset: input.asset,
      options,
    });
    const now = new Date().toISOString();
    const order =
      typeof input.order === 'number' && Number.isFinite(input.order)
        ? input.order
        : getNextImageOrder(currentImages, input.target);

    return {
      id,
      projectId: input.target.projectId,
      target: input.target,
      figmaUrl: input.figmaUrl,
      fileKey: ref.fileKey,
      nodeId: ref.nodeId,
      imageUrl: cachedAsset.imageUrl,
      imageFormat: cachedAsset.imageFormat,
      mimeType: cachedAsset.mimeType,
      label: explicitLabel,
      order,
      storageKey: cachedAsset.storageKey,
      width: input.asset.width,
      height: input.asset.height,
      byteSize: cachedAsset.byteSize,
      createdAt: now,
      updatedAt: now,
    };
  }

  const nodeLabelPromise = explicitLabel
    ? Promise.resolve(undefined)
    : readReviewFigmaNodeName({
        apiBaseUrl: options.apiBaseUrl,
        enabled: options.enabled,
        env,
        envKey: options.envKey,
        fetchOption: options.fetch,
        fileKey: ref.fileKey,
        nodeId: ref.nodeId,
        token: options.token,
      }).catch(() => undefined);
  const targetImageFormat = input.imageFormat ?? options.imageFormat ?? 'webp';
  const renderFormat = getStoreRenderFormat(options.renderFormat, targetImageFormat);
  const explicitToken = typeof options.token === 'string' ? options.token.trim() : options.token;
  const rendered = await renderReviewFigmaImage({
    figmaUrl: input.figmaUrl,
    format: renderFormat,
    scale: options.renderScale,
    useAbsoluteBounds: options.useAbsoluteBounds,
    apiBaseUrl: options.apiBaseUrl,
    fetch: options.fetch,
    token:
      explicitToken ||
      requireReviewFigmaToken({
        token: null,
        env,
        envKey: options.envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
        enabled: options.enabled,
      }),
  });
  const cachedAsset = await cacheReviewFigmaImageAsset({
    assetDir,
    assetEndpoint,
    id,
    imageUrl: rendered.imageUrl,
    options,
    renderFormat,
    targetImageFormat,
  });
  const imageFormat =
    cachedAsset?.imageFormat ?? (renderFormat === 'jpg' ? 'jpg' : 'png');
  const now = new Date().toISOString();
  const order =
    typeof input.order === 'number' && Number.isFinite(input.order)
      ? input.order
      : getNextImageOrder(currentImages, input.target);
  const nodeLabel = await nodeLabelPromise;

  return {
    id,
    projectId: input.target.projectId,
    target: input.target,
    figmaUrl: input.figmaUrl,
    fileKey: rendered.fileKey,
    nodeId: rendered.nodeId,
    imageUrl: cachedAsset?.imageUrl ?? rendered.imageUrl,
    imageFormat,
    mimeType: cachedAsset?.mimeType ?? getReviewFigmaImageMimeType(imageFormat),
    label: explicitLabel ?? nodeLabel,
    order,
    storageKey: cachedAsset?.storageKey,
    byteSize: cachedAsset?.byteSize,
    createdAt: now,
    updatedAt: now,
  };
}

type CachedReviewFigmaImageAsset = {
  imageUrl: string;
  imageFormat: ReviewFigmaImageFormat;
  mimeType: string;
  storageKey: string;
  byteSize: number;
};

async function cacheReviewFigmaProvidedImageAsset({
  assetDir,
  assetEndpoint,
  id,
  asset,
  options,
}: {
  assetDir: string;
  assetEndpoint: string;
  id: string;
  asset: ReviewFigmaImageAssetInput;
  options: ReviewFigmaImageStorePluginOptions;
}): Promise<CachedReviewFigmaImageAsset> {
  const decodedAsset = decodeReviewFigmaImageAsset(asset);
  const storageKey = createReviewFigmaAssetStorageKey(
    id,
    decodedAsset.imageFormat
  );

  await mkdir(assetDir, { recursive: true });
  await writeFile(path.join(assetDir, storageKey), decodedAsset.data);

  return {
    imageUrl: createReviewFigmaAssetUrl(assetEndpoint, storageKey),
    imageFormat: decodedAsset.imageFormat,
    mimeType: decodedAsset.mimeType,
    storageKey,
    byteSize: decodedAsset.data.byteLength,
  };
}

function decodeReviewFigmaImageAsset(asset: ReviewFigmaImageAssetInput) {
  const mimeType = normalizeImageMimeType(asset.mimeType);
  if (!mimeType) throw new Error('Unsupported Figma image asset MIME type.');

  const imageFormat =
    getReviewFigmaImageFormatFromMimeType(mimeType) ?? asset.imageFormat;
  const match = /^data:([^;,]+);base64,([a-zA-Z0-9+/=\s]+)$/.exec(
    asset.dataUrl
  );
  if (!match) throw new Error('Valid Figma image asset data URL is required.');

  const dataUrlMimeType = normalizeImageMimeType(match[1]);
  if (dataUrlMimeType && dataUrlMimeType !== mimeType) {
    throw new Error('Figma image asset MIME type mismatch.');
  }

  return {
    data: Buffer.from(match[2].replace(/\s/g, ''), 'base64'),
    imageFormat,
    mimeType,
  };
}

async function cacheReviewFigmaImageAsset({
  assetDir,
  assetEndpoint,
  id,
  imageUrl,
  options,
  renderFormat,
  targetImageFormat,
}: {
  assetDir: string;
  assetEndpoint: string;
  id: string;
  imageUrl: string;
  options: ReviewFigmaImageStorePluginOptions;
  renderFormat: Extract<ReviewFigmaRenderFormat, 'png' | 'jpg'>;
  targetImageFormat: ReviewFigmaImageFormat;
}): Promise<CachedReviewFigmaImageAsset | null> {
  if (options.cacheAssets === false) return null;

  const asset = await downloadReviewFigmaImageAsset({
    fetchOption: options.fetch,
    imageUrl,
    renderFormat,
    targetImageFormat,
    transformAsset: options.transformAsset,
  });
  const storageKey = createReviewFigmaAssetStorageKey(id, asset.imageFormat);

  await mkdir(assetDir, { recursive: true });
  await writeFile(path.join(assetDir, storageKey), asset.data);

  return {
    imageUrl: createReviewFigmaAssetUrl(assetEndpoint, storageKey),
    imageFormat: asset.imageFormat,
    mimeType: asset.mimeType,
    storageKey,
    byteSize: asset.data.byteLength,
  };
}

async function downloadReviewFigmaImageAsset({
  fetchOption,
  imageUrl,
  renderFormat,
  targetImageFormat,
  transformAsset,
}: {
  fetchOption: typeof fetch | undefined;
  imageUrl: string;
  renderFormat: Extract<ReviewFigmaRenderFormat, 'png' | 'jpg'>;
  targetImageFormat: ReviewFigmaImageFormat;
  transformAsset: ReviewFigmaImageAssetTransformer | undefined;
}) {
  const fetchImage = fetchOption ?? globalThis.fetch;
  if (!fetchImage) throw new Error('Figma image caching requires fetch.');

  const response = await fetchImage(imageUrl);
  if (!response.ok) {
    throw new Error(`Figma image download failed with ${response.status}`);
  }

  const sourceMimeType =
    normalizeImageMimeType(response.headers.get('content-type')) ??
    getReviewFigmaImageMimeType(renderFormat === 'jpg' ? 'jpg' : 'png');
  const sourceImageFormat =
    getReviewFigmaImageFormatFromMimeType(sourceMimeType) ??
    (renderFormat === 'jpg' ? 'jpg' : 'png');
  const sourceData = new Uint8Array(await response.arrayBuffer());
  const transformed = transformAsset
    ? await transformAsset({
        data: sourceData,
        imageFormat: sourceImageFormat,
        mimeType: sourceMimeType,
        targetFormat: targetImageFormat,
      })
    : null;
  const imageFormat = transformed?.imageFormat ?? sourceImageFormat;
  const mimeType =
    normalizeImageMimeType(transformed?.mimeType) ??
    getReviewFigmaImageMimeType(imageFormat);
  const data = createBufferFromImageData(transformed?.data ?? sourceData);

  return { data, imageFormat, mimeType };
}

export async function deleteReviewFigmaImageAsset(
  assetDir: string,
  storageKey: string | undefined
) {
  if (!storageKey) return;
  if (!isSafeReviewFigmaAssetStorageKey(storageKey)) return;
  await rm(path.join(assetDir, storageKey), { force: true }).catch(() => null);
}

function createBufferFromImageData(data: Uint8Array | ArrayBuffer) {
  return data instanceof ArrayBuffer
    ? Buffer.from(new Uint8Array(data))
    : Buffer.from(data);
}

export function listImagesForTarget(
  images: ReviewFigmaImage[],
  target: ReviewFigmaImageTarget
) {
  const targetKey = getReviewFigmaImageTargetKey(target);
  return images
    .filter((image) => getReviewFigmaImageTargetKey(image.target) === targetKey)
    .sort(compareReviewFigmaImages);
}

export function reorderReviewFigmaImages(
  images: ReviewFigmaImage[],
  input: ReorderReviewFigmaImagesInput
) {
  const targetKey = getReviewFigmaImageTargetKey(input.target);
  const orderById = new Map(input.imageIds.map((id, index) => [id, index]));
  const targetImages = listImagesForTarget(images, input.target);
  const nextTargetImages = targetImages
    .map((image) => ({
      ...image,
      order: orderById.get(image.id) ?? input.imageIds.length + image.order,
      updatedAt: orderById.has(image.id) ? new Date().toISOString() : image.updatedAt,
    }))
    .sort(compareReviewFigmaImages);
  const nextTargetImageById = new Map(
    nextTargetImages.map((image, index) => [image.id, { ...image, order: index }])
  );
  const allImages = images.map((image) =>
    getReviewFigmaImageTargetKey(image.target) === targetKey
      ? nextTargetImageById.get(image.id) ?? image
      : image
  );

  return {
    allImages,
    targetImages: listImagesForTarget(allImages, input.target),
  };
}

export function updateReviewFigmaImage(
  images: ReviewFigmaImage[],
  id: string,
  patch: UpdateReviewFigmaImageInput
) {
  const index = images.findIndex((image) => image.id === id);
  if (index < 0) return null;

  const nextImage: ReviewFigmaImage = {
    ...images[index],
    label:
      patch.label === undefined
        ? images[index].label
        : normalizeOptionalText(patch.label),
    order:
      typeof patch.order === 'number' && Number.isFinite(patch.order)
        ? patch.order
        : images[index].order,
    updatedAt: new Date().toISOString(),
  };
  const nextImages = [...images];
  nextImages[index] = nextImage;

  return { image: nextImage, images: nextImages };
}

export async function readReviewFigmaImageStoreFile(
  dataFile: string
): Promise<ReviewFigmaImageStoreFile> {
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ReviewFigmaImageStoreFile>;

    return {
      version: 1,
      images: Array.isArray(parsed.images)
        ? parsed.images.flatMap((image) => (isReviewFigmaImage(image) ? [image] : []))
        : [],
    };
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return { version: 1, images: [] };
    }
    throw error;
  }
}

export async function writeReviewFigmaImageStoreFile(
  dataFile: string,
  data: ReviewFigmaImageStoreFile
) {
  await mkdir(path.dirname(dataFile), { recursive: true });
  await writeFile(
    dataFile,
    `${JSON.stringify({ version: 1, images: data.images }, null, 2)}\n`,
    'utf8'
  );
}

function getNextImageOrder(
  images: ReviewFigmaImage[],
  target: ReviewFigmaImageTarget
) {
  const targetImages = listImagesForTarget(images, target);
  return targetImages.length
    ? Math.max(...targetImages.map((image) => image.order)) + 1
    : 0;
}

function compareReviewFigmaImages(a: ReviewFigmaImage, b: ReviewFigmaImage) {
  return a.order - b.order || a.createdAt.localeCompare(b.createdAt);
}

function createReviewFigmaImageId() {
  return `figma_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isReviewFigmaImage(value: unknown): value is ReviewFigmaImage {
  if (!value || typeof value !== 'object') return false;
  const image = value as ReviewFigmaImage;

  return (
    typeof image.id === 'string' &&
    typeof image.projectId === 'string' &&
    typeof image.figmaUrl === 'string' &&
    typeof image.fileKey === 'string' &&
    typeof image.nodeId === 'string' &&
    typeof image.imageUrl === 'string' &&
    typeof image.order === 'number' &&
    typeof image.createdAt === 'string' &&
    typeof image.updatedAt === 'string'
  );
}

export function isNodeError(error: unknown): error is { code?: string } {
  if (!error || typeof error !== 'object') return false;
  return 'code' in error;
}

export function normalizeOptionalText(value: string | null | undefined) {
  if (typeof value !== 'string') return undefined;
  return value.trim() || undefined;
}
