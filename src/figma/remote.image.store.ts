import type {
  AddReviewFigmaImageInput,
  ReviewFigmaImage,
  ReviewFigmaImageAssetInput,
  ReviewFigmaImageFormat,
  ReviewFigmaImageStore,
  ReviewFigmaImageTarget,
  UpdateReviewFigmaImageInput,
} from './image.types';
import {
  createReviewFigmaClientRenderedAsset,
  getReviewFigmaImageTargetKey,
  type ReviewFigmaImageClientRenderOptions,
} from './image.store';
import { parseReviewFigmaNodeRef } from './parse';

export const DEFAULT_REVIEW_FIGMA_REMOTE_IMAGES_TABLE = 'review_figma_images';
const DEFAULT_REVIEW_FIGMA_REMOTE_UPLOAD_TIMEOUT_MS = 30000;
const FIGMA_TOKEN_STORAGE_KEY = 'figma-token';

type ReviewFigmaRemoteTokenProvider =
  | string
  | null
  | undefined
  | (() => string | null | undefined);

export type ReviewFigmaRemoteImageRow = {
  id: string;
  project_id: string;
  target_key: string;
  target: ReviewFigmaImageTarget;
  target_type: 'route' | 'figma-node';
  page_url: string | null;
  viewport_label: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  viewport_scope: 'mobile' | 'tablet' | 'desktop' | 'wide' | null;
  slot: string | null;
  figma_url: string;
  file_key: string;
  node_id: string;
  image_url: string;
  image_format: ReviewFigmaImageFormat;
  mime_type: string;
  storage_key: string;
  label: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  byte_size: number | null;
  created_at: string;
  updated_at: string;
};

type ReviewFigmaRemoteDbResult<T = unknown> = {
  data: T | null;
  error: unknown;
};

type ReviewFigmaRemoteDbQuery<T = unknown> = PromiseLike<
  ReviewFigmaRemoteDbResult<T>
> & {
  delete(): ReviewFigmaRemoteDbQuery<T>;
  eq(column: string, value: unknown): ReviewFigmaRemoteDbQuery<T>;
  insert(value: unknown): ReviewFigmaRemoteDbQuery<T>;
  order(
    column: string,
    options?: { ascending?: boolean }
  ): ReviewFigmaRemoteDbQuery<T>;
  select(columns?: string): ReviewFigmaRemoteDbQuery<T>;
  single(): PromiseLike<ReviewFigmaRemoteDbResult<T>>;
  update(value: unknown): ReviewFigmaRemoteDbQuery<T>;
};

export type ReviewFigmaRemoteDbClient = {
  from(table: string): ReviewFigmaRemoteDbQuery;
};

export type ReviewFigmaRemoteAssetUploadResponse = {
  storageKey?: unknown;
  r2Key?: unknown;
  imageUrl?: unknown;
  publicUrl?: unknown;
  error?: unknown;
};

export type RemoteReviewFigmaImageStoreOptions = {
  client: ReviewFigmaRemoteDbClient;
  uploadEndpoint: string;
  table?: string;
  fetch?: typeof fetch;
  token?: ReviewFigmaRemoteTokenProvider;
  clientRender?: boolean | ReviewFigmaImageClientRenderOptions;
  uploadTimeoutMs?: number;
};

export function createRemoteReviewFigmaImageStore({
  client,
  uploadEndpoint,
  table = DEFAULT_REVIEW_FIGMA_REMOTE_IMAGES_TABLE,
  fetch: fetchOption,
  token,
  clientRender = true,
  uploadTimeoutMs = DEFAULT_REVIEW_FIGMA_REMOTE_UPLOAD_TIMEOUT_MS,
}: RemoteReviewFigmaImageStoreOptions): ReviewFigmaImageStore {
  const listImages = async (target: ReviewFigmaImageTarget) => {
    const targetKey = getReviewFigmaImageTargetKey(target);
    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('project_id', target.projectId)
      .eq('target_key', targetKey)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throwRemoteStoreError(error, 'list Figma images');
    return ((data ?? []) as ReviewFigmaRemoteImageRow[]).map(rowToFigmaImage);
  };

  return {
    listImages,
    async addImage(input) {
      const ref = parseReviewFigmaNodeRef(input.figmaUrl);
      if (!ref) {
        throw new Error('A Figma node link or fileKey->nodeId value is required.');
      }

      const id = createFigmaImageId();
      const asset = await resolveFigmaImageAsset({
        input,
        token,
        clientRender,
        fetch: fetchOption,
      });
      const uploaded = await uploadFigmaAsset({
        asset,
        endpoint: uploadEndpoint,
        fetch: fetchOption,
        imageId: id,
        projectId: input.target.projectId,
        timeoutMs: uploadTimeoutMs,
      });
      const order =
        typeof input.order === 'number' && Number.isFinite(input.order)
          ? input.order
          : await getNextImageOrder(listImages, input.target);
      const now = new Date().toISOString();
      const row = createImageRow({
        asset,
        fileKey: ref.fileKey,
        id,
        imageUrl: uploaded.imageUrl,
        input,
        nodeId: ref.nodeId,
        now,
        order,
        storageKey: uploaded.storageKey,
      });
      const { data, error } = await client
        .from(table)
        .insert(row)
        .select('*')
        .single();

      if (error) throwRemoteStoreError(error, 'insert Figma image');
      return rowToFigmaImage(data as ReviewFigmaRemoteImageRow);
    },
    async updateImage(id, patch) {
      const { data, error } = await client
        .from(table)
        .update(createUpdatePatch(patch))
        .eq('id', id)
        .select('*')
        .single();

      if (error) throwRemoteStoreError(error, 'update Figma image');
      return rowToFigmaImage(data as ReviewFigmaRemoteImageRow);
    },
    async reorderImages(input) {
      const current = await listImages(input.target);
      const currentIds = new Set(current.map((image) => image.id));
      const nextIds = [
        ...input.imageIds.filter((id) => currentIds.has(id)),
        ...current
          .map((image) => image.id)
          .filter((id) => !input.imageIds.includes(id)),
      ];
      const targetKey = getReviewFigmaImageTargetKey(input.target);
      const updatedAt = new Date().toISOString();

      const results = await Promise.all(
        nextIds.map((id, index) =>
          client
            .from(table)
            .update({ sort_order: index, updated_at: updatedAt })
            .eq('id', id)
            .eq('project_id', input.target.projectId)
            .eq('target_key', targetKey)
        )
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) throwRemoteStoreError(failed.error, 'reorder Figma images');

      return listImages(input.target);
    },
    async deleteImage(id) {
      const { error } = await client.from(table).delete().eq('id', id);
      if (error) throwRemoteStoreError(error, 'delete Figma image');
    },
  };
}

async function resolveFigmaImageAsset({
  input,
  token,
  clientRender,
  fetch,
}: {
  input: AddReviewFigmaImageInput;
  token: ReviewFigmaRemoteTokenProvider;
  clientRender: boolean | ReviewFigmaImageClientRenderOptions;
  fetch: typeof globalThis.fetch | undefined;
}) {
  if (input.asset) return input.asset;
  if (!clientRender) {
    throw new Error('Figma image asset is required when clientRender is disabled.');
  }

  const renderOptions = clientRender === true ? {} : clientRender;
  const figmaToken = readRemoteFigmaToken(renderOptions.token ?? token);
  if (!figmaToken) throw new Error('Figma token is required.');

  return createReviewFigmaClientRenderedAsset({
    ...renderOptions,
    fetch,
    figmaUrl: input.figmaUrl,
    token: figmaToken,
  });
}

async function uploadFigmaAsset({
  asset,
  endpoint,
  fetch: fetchOption,
  imageId,
  projectId,
  timeoutMs,
}: {
  asset: ReviewFigmaImageAssetInput;
  endpoint: string;
  fetch: typeof globalThis.fetch | undefined;
  imageId: string;
  projectId: string;
  timeoutMs: number;
}) {
  const requestFetch = fetchOption ?? globalThis.fetch;
  if (!requestFetch) throw new Error('Figma asset upload requires fetch.');

  const { blob, mimeType } = decodeAssetDataUrl(asset);
  const response = await withTimeout(
    requestFetch(
      createAssetUploadUrl(endpoint, {
        imageFormat: asset.imageFormat,
        imageId,
        projectId,
      }),
      {
        method: 'POST',
        headers: {
          'Content-Type': mimeType,
        },
        body: blob,
      }
    ),
    timeoutMs,
    'Figma asset upload timed out.'
  );
  const data = (await response.json().catch(() => null)) as
    | ReviewFigmaRemoteAssetUploadResponse
    | null;

  if (!response.ok) {
    throw new Error(
      readString(data?.error) || `Figma asset upload failed with ${response.status}`
    );
  }

  const storageKey = readString(data?.storageKey) ?? readString(data?.r2Key);
  const imageUrl = readString(data?.imageUrl) ?? readString(data?.publicUrl);
  if (!storageKey || !imageUrl) {
    throw new Error('Figma asset upload response is missing image URL.');
  }

  return { storageKey, imageUrl };
}

function createAssetUploadUrl(
  endpoint: string,
  params: {
    imageFormat: ReviewFigmaImageFormat;
    imageId: string;
    projectId: string;
  }
) {
  const base =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const url = new URL(endpoint, base);
  url.searchParams.set('projectId', params.projectId);
  url.searchParams.set('imageId', params.imageId);
  url.searchParams.set('imageFormat', params.imageFormat);
  return url.toString();
}

function createImageRow({
  asset,
  fileKey,
  id,
  imageUrl,
  input,
  nodeId,
  now,
  order,
  storageKey,
}: {
  asset: ReviewFigmaImageAssetInput;
  fileKey: string;
  id: string;
  imageUrl: string;
  input: AddReviewFigmaImageInput;
  nodeId: string;
  now: string;
  order: number;
  storageKey: string;
}): ReviewFigmaRemoteImageRow {
  const target = input.target;
  const targetKey = getReviewFigmaImageTargetKey(target);

  return {
    id,
    project_id: target.projectId,
    target_key: targetKey,
    target,
    target_type: target.type,
    page_url: target.type === 'route' ? target.pageUrl : null,
    viewport_label: target.type === 'route' ? target.viewport?.label ?? null : null,
    viewport_width: target.type === 'route' ? target.viewport?.width ?? null : null,
    viewport_height: target.type === 'route' ? target.viewport?.height ?? null : null,
    viewport_scope: target.type === 'route' ? target.viewport?.scope ?? null : null,
    slot: target.type === 'route' ? target.slot ?? null : null,
    figma_url: input.figmaUrl,
    file_key: fileKey,
    node_id: nodeId,
    image_url: imageUrl,
    image_format: asset.imageFormat,
    mime_type: asset.mimeType,
    storage_key: storageKey,
    label: normalizeOptionalText(input.label) ?? null,
    sort_order: order,
    width: asset.width ?? null,
    height: asset.height ?? null,
    byte_size: asset.byteSize ?? null,
    created_at: now,
    updated_at: now,
  };
}

function createUpdatePatch(patch: UpdateReviewFigmaImageInput) {
  return {
    ...(patch.label !== undefined
      ? { label: normalizeOptionalText(patch.label) ?? null }
      : {}),
    ...(typeof patch.order === 'number' && Number.isFinite(patch.order)
      ? { sort_order: patch.order }
      : {}),
    updated_at: new Date().toISOString(),
  };
}

async function getNextImageOrder(
  listImages: (target: ReviewFigmaImageTarget) => Promise<ReviewFigmaImage[]>,
  target: ReviewFigmaImageTarget
) {
  const images = await listImages(target);
  return images.length
    ? Math.max(...images.map((image) => image.order)) + 1
    : 0;
}

function rowToFigmaImage(row: ReviewFigmaRemoteImageRow): ReviewFigmaImage {
  return {
    id: row.id,
    projectId: row.project_id,
    target: row.target,
    figmaUrl: row.figma_url,
    fileKey: row.file_key,
    nodeId: row.node_id,
    imageUrl: row.image_url,
    imageFormat: row.image_format,
    mimeType: row.mime_type,
    label: row.label ?? undefined,
    order: row.sort_order,
    storageKey: row.storage_key,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    byteSize: row.byte_size ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function decodeAssetDataUrl(asset: ReviewFigmaImageAssetInput) {
  const match = asset.dataUrl.match(/^data:([^;,]+);base64,(.*)$/);
  if (!match) throw new Error('Valid Figma image asset data URL is required.');

  const mimeType = match[1]?.trim();
  if (!mimeType || mimeType !== asset.mimeType) {
    throw new Error('Figma image asset MIME type mismatch.');
  }

  const binary = globalThis.atob(match[2] ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return {
    blob: new Blob([bytes], { type: mimeType }),
    mimeType,
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function readRemoteFigmaToken(provider: ReviewFigmaRemoteTokenProvider) {
  const token = typeof provider === 'function' ? provider() : provider;
  if (typeof token === 'string' && token.trim()) return token.trim();
  return readStoredFigmaToken();
}

function readStoredFigmaToken() {
  if (typeof window === 'undefined') return '';

  try {
    return window.localStorage.getItem(FIGMA_TOKEN_STORAGE_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

function createFigmaImageId() {
  const id =
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `figma_${id.replace(/[^A-Za-z0-9_-]+/g, '-')}`;
}

function normalizeOptionalText(value: string | null | undefined) {
  if (typeof value !== 'string') return undefined;
  return value.trim() || undefined;
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function throwRemoteStoreError(error: unknown, action: string): never {
  const source = error as {
    code?: unknown;
    details?: unknown;
    hint?: unknown;
    message?: unknown;
  };
  const message = readString(source.message) ?? `Remote Figma image ${action} failed.`;
  const code = readString(source.code);
  const details = readString(source.details);
  const hint = readString(source.hint);
  const suffix = [code, details, hint].filter(Boolean).join(' / ');

  throw new Error(suffix ? `${message} (${suffix})` : message);
}
