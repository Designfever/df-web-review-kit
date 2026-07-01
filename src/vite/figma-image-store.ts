import path from 'node:path';
import { loadEnv, type Plugin } from 'vite';
import type { ReviewFigmaImageFormat } from '../figma/image.types';
import {
  DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT,
} from '../figma/image.store';
import {
  DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  readReviewFigmaToken,
  requireReviewFigmaToken,
  type ReviewFigmaTokenEnv,
} from '../figma/token';
import {
  renderReviewFigmaImage,
  type ReviewFigmaImageRenderOptions,
  type ReviewFigmaRenderFormat,
} from '../figma/render';
import {
  handleReviewFigmaImageStoreRequest,
  normalizeEndpoint,
  readJsonRequestBody,
  sendJson,
  sendReviewFigmaAsset,
} from './figma-image-store.server';

export interface ReviewFigmaImageStorePluginOptions
  extends ReviewFigmaServerTokenOptions {
  enabled?: boolean;
  projectId?: string;
  endpoint?: string;
  dataFile?: string;
  assetDir?: string;
  assetEndpoint?: string;
  cacheAssets?: boolean;
  imageFormat?: ReviewFigmaImageFormat;
  renderFormat?: ReviewFigmaRenderFormat;
  renderScale?: number;
  useAbsoluteBounds?: boolean;
  apiBaseUrl?: string;
  fetch?: typeof fetch;
  transformAsset?: ReviewFigmaImageAssetTransformer;
}

export interface ReviewFigmaServerTokenOptions {
  token?: string | null;
  env?: ReviewFigmaTokenEnv;
  envKey?: string;
  enabled?: boolean;
}

export type ReviewFigmaServerImageRenderOptions =
  Omit<ReviewFigmaImageRenderOptions, 'token'> &
    ReviewFigmaServerTokenOptions;

export type ReviewFigmaImageAssetTransformInput = {
  data: Uint8Array;
  imageFormat: ReviewFigmaImageFormat;
  mimeType: string;
  targetFormat: ReviewFigmaImageFormat;
};

export type ReviewFigmaImageAssetTransformResult = {
  data: Uint8Array | ArrayBuffer;
  imageFormat: ReviewFigmaImageFormat;
  mimeType?: string;
};

export type ReviewFigmaImageAssetTransformer = (
  input: ReviewFigmaImageAssetTransformInput
) =>
  | ReviewFigmaImageAssetTransformResult
  | null
  | undefined
  | Promise<ReviewFigmaImageAssetTransformResult | null | undefined>;

export {
  createReviewFigmaImageApiUrl,
  renderReviewFigmaImage,
} from '../figma/render';
export {
  collectReviewFigmaReleaseSnapshot,
  createReviewFigmaImagesSnapshot,
  createReviewFigmaReleaseSnapshot,
} from '../figma/image.snapshot';
export type {
  ReviewFigmaImageRenderOptions,
  ReviewFigmaRenderFormat,
  ReviewFigmaRenderedImage,
} from '../figma/render';
export type {
  CollectReviewFigmaReleaseSnapshotOptions,
  CreateReviewFigmaImagesSnapshotOptions,
  CreateReviewFigmaReleaseSnapshotOptions,
  ReviewFigmaImagesSnapshot,
  ReviewFigmaReleaseSnapshot,
} from '../figma/image.snapshot';

export const readReviewFigmaServerToken = (
  options: ReviewFigmaServerTokenOptions = {}
) =>
  readReviewFigmaToken({
    token: options.token,
    env: options.env ?? getServerEnv(),
    envKey: options.envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
    enabled: options.enabled,
  });

export const requireReviewFigmaServerToken = (
  options: ReviewFigmaServerTokenOptions = {}
) =>
  requireReviewFigmaToken({
    token: options.token,
    env: options.env ?? getServerEnv(),
    envKey: options.envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
    enabled: options.enabled,
  });

export const renderReviewFigmaServerImage = (
  options: ReviewFigmaServerImageRenderOptions
) => {
  const { token, env, envKey, enabled, ...renderOptions } = options;
  const explicitToken = typeof token === 'string' ? token.trim() : token;

  return renderReviewFigmaImage({
    ...renderOptions,
    token:
      explicitToken ||
      requireReviewFigmaServerToken({ env, envKey, enabled }),
  });
};

export const reviewFigmaImageStore = (
  options: ReviewFigmaImageStorePluginOptions = {}
): Plugin => {
  let root = '';
  let dataFile = '';
  let assetDir = '';
  let env: ReviewFigmaTokenEnv = {};
  const enabled = options.enabled ?? true;
  const endpoint = normalizeEndpoint(
    options.endpoint ?? DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT
  );
  const assetEndpoint = normalizeEndpoint(
    options.assetEndpoint ?? `${endpoint}/assets`
  );

  return {
    name: 'df-web-review-kit-figma-image-store',
    apply: 'serve',
    configResolved(config) {
      root = config.root;
      dataFile = path.resolve(
        root,
        options.dataFile ?? '.df-review/figma-images.json'
      );
      assetDir = options.assetDir
        ? path.resolve(root, options.assetDir)
        : path.join(path.dirname(dataFile), 'figma-assets');
      env = {
        ...loadEnv(config.mode, config.envDir, ''),
        ...getServerEnv(),
        ...(options.env ?? {}),
      };
    },
    configureServer(server) {
      if (!enabled) return;

      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url ?? '/', 'http://localhost');
        const pathname = requestUrl.pathname;
        if (pathname.startsWith(`${assetEndpoint}/`)) {
          await sendReviewFigmaAsset(res, assetDir, assetEndpoint, pathname);
          return;
        }
        if (pathname !== endpoint && !pathname.startsWith(`${endpoint}/`)) {
          next();
          return;
        }

        try {
          const response = await handleReviewFigmaImageStoreRequest({
            dataFile,
            assetDir,
            assetEndpoint,
            endpoint,
            options,
            env,
            pathname,
            requestUrl,
            method: req.method ?? 'GET',
            body: await readJsonRequestBody(req),
            requestToken: readRequestFigmaToken(req),
          });

          sendJson(res, response.status, response.body);
        } catch (error) {
          sendJson(res, 500, {
            error:
              error instanceof Error
                ? error.message
                : 'Figma image store request failed.',
          });
        }
      });
    },
  };
};

function readRequestFigmaToken(req: { headers?: Record<string, unknown> }) {
  const value = req.headers?.['x-figma-token'];
  const token = Array.isArray(value) ? value[0] : value;

  return typeof token === 'string' ? token.trim() || null : null;
}

function getServerEnv(): ReviewFigmaTokenEnv {
  const runtime = globalThis as typeof globalThis & {
    process?: {
      env?: ReviewFigmaTokenEnv;
    };
  };

  return runtime.process?.env ?? {};
}
