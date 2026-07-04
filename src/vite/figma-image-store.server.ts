import { readFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type {
  ReviewFigmaImage,
  ReviewFigmaImageTarget,
  AddReviewFigmaImageInput,
} from '../figma/image.types';
import {
  getReviewFigmaImageTargetKey,
  type ReorderReviewFigmaImagesInput,
} from '../figma/image.store';
import type { ReviewFigmaTokenEnv } from '../figma/token';
import { createReviewFigmaReleaseSnapshot } from '../figma/image.snapshot';
import {
  getReviewFigmaAssetMimeType,
  getReviewFigmaAssetStorageKeyFromPathname,
  parseReviewFigmaImageFormat,
} from './figma-asset';
import type { ReviewFigmaImageStorePluginOptions } from './figma-image-store';
import {
  createReviewFigmaImage,
  deleteReviewFigmaImageAsset,
  isNodeError,
  listImagesForTarget,
  normalizeOptionalText,
  readReviewFigmaImageStoreFile,
  reorderReviewFigmaImages,
  runExclusiveReviewImageStoreTask,
  updateReviewFigmaImage,
  writeReviewFigmaImageStoreFile,
} from './figma-image-store.image';

type ReviewFigmaImageStoreResponse = {
  status: number;
  body: unknown;
};

export async function handleReviewFigmaImageStoreRequest({
  dataFile,
  assetDir,
  assetEndpoint,
  endpoint,
  method,
  options,
  pathname,
  requestUrl,
  body,
  env,
  requestToken,
}: {
  dataFile: string;
  assetDir: string;
  assetEndpoint: string;
  endpoint: string;
  method: string;
  options: ReviewFigmaImageStorePluginOptions;
  env: ReviewFigmaTokenEnv;
  pathname: string;
  requestUrl: URL;
  body: unknown;
  requestToken?: string | null;
}): Promise<ReviewFigmaImageStoreResponse> {
  if (method === 'OPTIONS') return { status: 204, body: null };

  if (
    (method === 'GET' || method === 'POST') &&
    pathname === `${endpoint}/snapshot`
  ) {
    const input = parseReleaseSnapshotInput(body, requestUrl, options.projectId);
    if (!input) return jsonError(400, 'valid snapshot input is required.');
    if (options.projectId && input.projectId !== options.projectId) {
      return jsonError(403, 'snapshot project is not allowed.');
    }
    if (input.targets.some((target) => !isAllowedProjectTarget(target, options.projectId))) {
      return jsonError(403, 'snapshot target project is not allowed.');
    }

    const data = await readReviewFigmaImageStoreFile(dataFile);
    return {
      status: 200,
      body: createReviewFigmaReleaseSnapshot({
        images: data.images,
        projectId: input.projectId,
        releaseId: input.releaseId,
        label: input.label,
        targets: input.targets.length > 0 ? input.targets : undefined,
      }),
    };
  }

  if (method === 'GET' && pathname === endpoint) {
    const target = parseTargetParam(requestUrl.searchParams.get('target'));
    if (!target) return jsonError(400, 'target query is required.');
    if (!isAllowedProjectTarget(target, options.projectId)) {
      return { status: 200, body: [] };
    }

    const data = await readReviewFigmaImageStoreFile(dataFile);
    return { status: 200, body: listImagesForTarget(data.images, target) };
  }

  // mutation 분기들은 read-modify-write 전체를 락으로 감싼다.
  // (동시 요청이 겹치면 나중 쓰기가 앞선 변경을 덮어써 유실됨)
  if (method === 'POST' && pathname === endpoint) {
    const input = parseAddImageInput(body);
    if (!input) return jsonError(400, 'valid add image input is required.');
    if (!isAllowedProjectTarget(input.target, options.projectId)) {
      return jsonError(403, 'target project is not allowed.');
    }

    return runExclusiveReviewImageStoreTask(dataFile, async () => {
      const data = await readReviewFigmaImageStoreFile(dataFile);
      const image = await createReviewFigmaImage({
        assetDir,
        assetEndpoint,
        currentImages: data.images,
        env,
        input,
        options,
        requestToken,
      });
      data.images = [image, ...data.images];
      await writeReviewFigmaImageStoreFile(dataFile, data);

      return { status: 201, body: image };
    });
  }

  if (method === 'PATCH' && pathname === `${endpoint}/reorder`) {
    const input = parseReorderImagesInput(body);
    if (!input) return jsonError(400, 'valid reorder input is required.');
    if (!isAllowedProjectTarget(input.target, options.projectId)) {
      return jsonError(403, 'target project is not allowed.');
    }

    return runExclusiveReviewImageStoreTask(dataFile, async () => {
      const data = await readReviewFigmaImageStoreFile(dataFile);
      const images = reorderReviewFigmaImages(data.images, input);
      data.images = images.allImages;
      await writeReviewFigmaImageStoreFile(dataFile, data);

      return { status: 200, body: images.targetImages };
    });
  }

  const id = getEndpointItemId(pathname, endpoint);
  if (id && method === 'PATCH') {
    const patch = parseUpdateImageInput(body);
    if (!patch) return jsonError(400, 'valid update patch is required.');

    return runExclusiveReviewImageStoreTask(dataFile, async () => {
      const data = await readReviewFigmaImageStoreFile(dataFile);
      const result = updateReviewFigmaImage(data.images, id, patch);
      if (!result) return jsonError(404, `Figma image not found: ${id}`);
      if (!isAllowedProjectTarget(result.image.target, options.projectId)) {
        return jsonError(403, 'target project is not allowed.');
      }

      data.images = result.images;
      await writeReviewFigmaImageStoreFile(dataFile, data);

      return { status: 200, body: result.image };
    });
  }

  if (id && method === 'DELETE') {
    return runExclusiveReviewImageStoreTask(dataFile, async () => {
      const data = await readReviewFigmaImageStoreFile(dataFile);
      const image = data.images.find((item) => item.id === id);
      if (!image) return jsonError(404, `Figma image not found: ${id}`);
      if (!isAllowedProjectTarget(image.target, options.projectId)) {
        return jsonError(403, 'target project is not allowed.');
      }

      data.images = data.images.filter((item) => item.id !== id);
      await writeReviewFigmaImageStoreFile(dataFile, data);
      await deleteReviewFigmaImageAsset(assetDir, image.storageKey);

      return { status: 200, body: { ok: true } };
    });
  }

  return jsonError(405, 'method not allowed.');
}

// 첨부 이미지가 dataURL 로 JSON body 에 실려 오므로 넉넉하게 잡는다.
export const DEFAULT_REVIEW_IMAGE_STORE_MAX_BODY_BYTES = 25 * 1024 * 1024;

/** 4xx 로 내려보낼 요청 검증 실패. 미들웨어 catch 에서 status 를 그대로 쓴다. */
export class ReviewImageStoreRequestError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ReviewImageStoreRequestError';
  }
}

export function isReviewImageStoreRequestError(
  error: unknown
): error is ReviewImageStoreRequestError {
  return error instanceof ReviewImageStoreRequestError;
}

/**
 * CSRF 방어: 브라우저 요청(Origin 헤더 존재)은 요청 Host 와 같은 origin 이거나
 * loopback(localhost/127.0.0.1/::1)에서 온 것만 허용한다.
 * - LAN IP(폰 테스트 등) 접속: Origin.host === Host 라서 통과한다.
 * - curl/스크립트: Origin 헤더가 없으므로 통과한다. 악성 웹페이지는 브라우저가
 *   Origin 을 강제로 붙이기 때문에 이 검사로 걸러진다.
 */
export function assertTrustedReviewImageStoreRequest(
  req: Pick<IncomingMessage, 'headers'>
) {
  const origin = req.headers.origin;
  if (!origin || typeof origin !== 'string') return;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new ReviewImageStoreRequestError(
      403,
      'Cross-origin request is not allowed.'
    );
  }

  const host = req.headers.host;
  if (host && originUrl.host === host) return;
  if (isLoopbackHostname(originUrl.hostname)) return;

  throw new ReviewImageStoreRequestError(
    403,
    'Cross-origin request is not allowed.'
  );
}

function isLoopbackHostname(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]'
  );
}

export async function readJsonRequestBody(
  req: IncomingMessage,
  maxBytes = DEFAULT_REVIEW_IMAGE_STORE_MAX_BODY_BYTES
) {
  if (req.method === 'GET' || req.method === 'DELETE') return null;

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
    totalBytes += buffer.length;
    if (totalBytes > maxBytes) {
      throw new ReviewImageStoreRequestError(
        413,
        `Request body exceeds ${maxBytes} bytes.`
      );
    }
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return null;

  // CSRF 방어: CORS preflight 없이 보낼 수 있는 text/plain 류 body 를 거부한다.
  // 정상 클라이언트(image.store.ts)는 항상 application/json 을 보낸다.
  const contentType = req.headers['content-type'];
  if (
    typeof contentType !== 'string' ||
    !contentType.split(';')[0].trim().toLowerCase().endsWith('/json')
  ) {
    throw new ReviewImageStoreRequestError(
      415,
      'Request body must be application/json.'
    );
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new ReviewImageStoreRequestError(400, 'Invalid JSON request body.');
  }
}

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (status === 204) {
    res.end();
    return;
  }
  res.end(JSON.stringify(body ?? null));
}

export async function sendReviewFigmaAsset(
  res: ServerResponse,
  assetDir: string,
  assetEndpoint: string,
  pathname: string
) {
  const storageKey = getReviewFigmaAssetStorageKeyFromPathname(pathname, assetEndpoint);
  if (!storageKey) {
    sendPlainText(res, 400, 'Invalid Figma image asset path.');
    return;
  }

  try {
    const data = await readFile(path.join(assetDir, storageKey));
    res.statusCode = 200;
    res.setHeader('Content-Type', getReviewFigmaAssetMimeType(storageKey));
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    res.end(data);
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      sendPlainText(res, 404, 'Figma image asset not found.');
      return;
    }
    sendPlainText(
      res,
      500,
      error instanceof Error ? error.message : 'Figma image asset request failed.'
    );
  }
}

function sendPlainText(res: ServerResponse, status: number, body: string) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(body);
}

function parseTargetParam(value: string | null) {
  if (!value) return null;
  try {
    return parseReviewFigmaImageTarget(JSON.parse(value));
  } catch {
    return null;
  }
}

function parseAddImageInput(value: unknown): AddReviewFigmaImageInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Partial<AddReviewFigmaImageInput>;
  const target = parseReviewFigmaImageTarget(input.target);
  if (!target || typeof input.figmaUrl !== 'string') return null;

  return {
    target,
    figmaUrl: input.figmaUrl,
    label: typeof input.label === 'string' ? input.label : undefined,
    order: typeof input.order === 'number' ? input.order : undefined,
    imageFormat: parseReviewFigmaImageFormat(input.imageFormat),
    asset: parseAddImageAssetInput(input.asset),
  };
}

function parseAddImageAssetInput(
  value: unknown
): AddReviewFigmaImageInput['asset'] {
  if (!value || typeof value !== 'object') return undefined;
  const input = value as Partial<NonNullable<AddReviewFigmaImageInput['asset']>>;
  const imageFormat = parseReviewFigmaImageFormat(input.imageFormat);
  if (
    !imageFormat ||
    typeof input.dataUrl !== 'string' ||
    typeof input.mimeType !== 'string'
  ) {
    return undefined;
  }

  return {
    dataUrl: input.dataUrl,
    imageFormat,
    mimeType: input.mimeType,
    byteSize: typeof input.byteSize === 'number' ? input.byteSize : undefined,
    width: typeof input.width === 'number' ? input.width : undefined,
    height: typeof input.height === 'number' ? input.height : undefined,
  };
}

function parseUpdateImageInput(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const input = value as { label?: unknown; order?: unknown };

  return {
    label: typeof input.label === 'string' ? input.label : undefined,
    order: typeof input.order === 'number' ? input.order : undefined,
  };
}

function parseReorderImagesInput(
  value: unknown
): ReorderReviewFigmaImagesInput | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as ReorderReviewFigmaImagesInput;
  const target = parseReviewFigmaImageTarget(input.target);
  if (!target || !Array.isArray(input.imageIds)) return null;

  return {
    target,
    imageIds: input.imageIds.filter((id) => typeof id === 'string'),
  };
}

function parseReleaseSnapshotInput(
  value: unknown,
  requestUrl: URL,
  fallbackProjectId: string | undefined
): {
  projectId: string;
  releaseId?: string;
  label?: string;
  targets: ReviewFigmaImageTarget[];
} | null {
  const input = value && typeof value === 'object'
    ? (value as Partial<{ projectId: unknown; releaseId: unknown; label: unknown; targets: unknown }>)
    : null;
  const projectId = normalizeOptionalText(
    typeof input?.projectId === 'string'
      ? input.projectId
      : requestUrl.searchParams.get('projectId') ?? fallbackProjectId
  );
  if (!projectId) return null;

  return {
    projectId,
    releaseId: normalizeOptionalText(
      typeof input?.releaseId === 'string'
        ? input.releaseId
        : requestUrl.searchParams.get('releaseId')
    ),
    label: normalizeOptionalText(
      typeof input?.label === 'string'
        ? input.label
        : requestUrl.searchParams.get('label')
    ),
    targets: parseReleaseSnapshotTargets(input?.targets, requestUrl),
  };
}

function parseReleaseSnapshotTargets(value: unknown, requestUrl: URL) {
  const bodyTargets = Array.isArray(value)
    ? value.flatMap((target) => {
        const parsed = parseReviewFigmaImageTarget(target);
        return parsed ? [parsed] : [];
      })
    : [];
  const queryTargets = requestUrl.searchParams
    .getAll('target')
    .flatMap((target) => {
      const parsed = parseTargetParam(target);
      return parsed ? [parsed] : [];
    });
  const targetByKey = new Map(
    [...bodyTargets, ...queryTargets].map((target) => [
      getReviewFigmaImageTargetKey(target),
      target,
    ])
  );

  return Array.from(targetByKey.values());
}

function parseReviewFigmaImageTarget(
  value: unknown
): ReviewFigmaImageTarget | null {
  if (!value || typeof value !== 'object') return null;
  const target = value as ReviewFigmaImageTarget;
  if (target.type === 'route') {
    if (
      typeof target.projectId !== 'string' ||
      typeof target.pageUrl !== 'string'
    ) {
      return null;
    }

    return {
      type: 'route',
      projectId: target.projectId,
      pageUrl: target.pageUrl,
      viewport:
        target.viewport && typeof target.viewport === 'object'
          ? target.viewport
          : undefined,
      slot: typeof target.slot === 'string' ? target.slot : undefined,
    };
  }

  if (target.type === 'figma-node') {
    if (
      typeof target.projectId !== 'string' ||
      typeof target.fileKey !== 'string' ||
      typeof target.nodeId !== 'string'
    ) {
      return null;
    }

    return {
      type: 'figma-node',
      projectId: target.projectId,
      fileKey: target.fileKey,
      nodeId: target.nodeId,
    };
  }

  return null;
}

export function normalizeEndpoint(endpoint: string) {
  const normalized = endpoint.trim().replace(/\/+$/, '');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function getEndpointItemId(pathname: string, endpoint: string) {
  if (!pathname.startsWith(`${endpoint}/`)) return null;
  const value = pathname.slice(endpoint.length + 1);
  if (!value || value.includes('/')) return null;
  return decodeURIComponent(value);
}

function isAllowedProjectTarget(
  target: ReviewFigmaImageTarget,
  projectId: string | undefined
) {
  return !projectId || target.projectId === projectId;
}

function jsonError(status: number, error: string): ReviewFigmaImageStoreResponse {
  return { status, body: { error } };
}
