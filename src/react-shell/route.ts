import type { ReviewItem, ReviewSource } from '../types';
import type { ReviewShellViewportPreset } from './types';

export const DEFAULT_REVIEW_PATH_PREFIX = '/review';

export type ReviewAddressInput = {
  height?: number;
  itemId?: string | null;
  source?: ReviewSource;
  target: string;
  width?: number;
};

export const normalizeReviewPathPrefix = (value: string) => {
  const raw = value.trim() || DEFAULT_REVIEW_PATH_PREFIX;
  const prefix = raw.startsWith('/') ? raw : `/${raw}`;
  return prefix.length > 1 && prefix.endsWith('/')
    ? prefix.slice(0, -1)
    : prefix;
};

export const normalizeTarget = (
  value: string,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
) => {
  const raw = value.trim() || '/';
  const [path] = raw.split(/[?#]/);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const reviewPrefix = normalizeReviewPathPrefix(reviewPathPrefix);

  return normalized === reviewPrefix ||
    normalized.startsWith(`${reviewPrefix}/`)
    ? '/'
    : normalized;
};

export const parseReviewAddressInput = (
  value: string,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
): ReviewAddressInput => {
  const raw = value.trim();
  if (!raw) return { target: '/' };

  const parsedUrl = parseSameOriginUrl(raw);
  if (!parsedUrl) {
    return { target: normalizeTarget(raw, reviewPathPrefix) };
  }

  const reviewPrefix = normalizeReviewPathPrefix(reviewPathPrefix);
  const isReviewUrl =
    parsedUrl.pathname === reviewPrefix ||
    parsedUrl.pathname.startsWith(`${reviewPrefix}/`);

  if (!isReviewUrl) {
    return {
      target: normalizeTarget(parsedUrl.pathname, reviewPathPrefix),
    };
  }

  const source = parsedUrl.searchParams.get('source')?.trim();

  return {
    height: getPositiveParamNumber(parsedUrl.searchParams, 'h'),
    itemId: parsedUrl.searchParams.get('item'),
    source: source ? source as ReviewSource : undefined,
    target: normalizeTarget(
      parsedUrl.searchParams.get('target') ?? '/',
      reviewPathPrefix
    ),
    width: getPositiveParamNumber(parsedUrl.searchParams, 'w'),
  };
};

function parseSameOriginUrl(value: string) {
  if (typeof window === 'undefined') return null;

  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? url : null;
  } catch {
    return null;
  }
}

function getPositiveParamNumber(params: URLSearchParams, name: string) {
  const value = Number(params.get(name));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export const getInitialTarget = (reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  if (typeof window === 'undefined') return '/';

  const target = new URLSearchParams(window.location.search).get('target');
  return target ? normalizeTarget(target, reviewPathPrefix) : '/';
};

export const buildTargetSrc = (target: string) => {
  const url = new URL(target || '/', window.location.origin);
  url.searchParams.set('__dfwr_target', '1');
  return `${url.pathname}${url.search}${url.hash}`;
};

export const getHashRoutePath = (hash: string) => {
  if (!hash.startsWith('#/')) return null;

  const [path] = hash.slice(1).split(/[?#]/);
  try {
    return decodeURI(path || '/');
  } catch {
    return path || '/';
  }
};

export const getFrameRouteTarget = (
  targetWindow: Window,
  reviewPathPrefix: string
) => {
  const hashPath = getHashRoutePath(targetWindow.location.hash);
  return normalizeTarget(
    hashPath ?? targetWindow.location.pathname,
    reviewPathPrefix
  );
};

export const updateShellUrl = (
  target: string,
  size: ReviewShellViewportPreset,
  source: ReviewSource
) => {
  const url = new URL(window.location.href);
  url.searchParams.set('target', target);
  url.searchParams.set('w', String(size.width));
  url.searchParams.set('h', String(size.height));
  if (source !== 'local') {
    url.searchParams.set('source', source);
  } else {
    url.searchParams.delete('source');
  }
  url.searchParams.delete('item');
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
};

export const updateShellUrlForItem = (
  target: string,
  size: ReviewShellViewportPreset,
  itemId: string,
  source: ReviewSource
) => {
  const url = getShellUrlForItem(target, size, itemId, source);
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
};

export const getShellUrlForItem = (
  target: string,
  size: ReviewShellViewportPreset,
  itemId: string,
  source: ReviewSource
) => {
  const url = new URL(window.location.href);
  url.searchParams.set('target', target);
  url.searchParams.set('w', String(size.width));
  url.searchParams.set('h', String(size.height));
  url.searchParams.set('item', itemId);
  if (source !== 'local') {
    url.searchParams.set('source', source);
  } else {
    url.searchParams.delete('source');
  }
  return url;
};

export const getInitialItemId = () => {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('item');
};

export const getInitialSource = (
  remoteSource: ReviewSource | null | undefined
): ReviewSource => {
  if (typeof window === 'undefined' || !remoteSource) return 'local';
  return new URLSearchParams(window.location.search).get('source') ===
    remoteSource
    ? remoteSource
    : 'local';
};

export const getItemTarget = (
  item: ReviewItem,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
) => {
  if (item.routeKey) return normalizeTarget(item.routeKey, reviewPathPrefix);
  if (item.normalizedPath) {
    return normalizeTarget(item.normalizedPath, reviewPathPrefix);
  }

  try {
    return normalizeTarget(new URL(item.pageUrl).pathname, reviewPathPrefix);
  } catch {
    return '/';
  }
};
