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

const normalizeReviewPathPrefix = (value: string) => {
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
  const { hash, path, search } = splitTarget(raw);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const reviewPrefix = normalizeReviewPathPrefix(reviewPathPrefix);

  const normalizedPath = normalized === reviewPrefix ||
    normalized.startsWith(`${reviewPrefix}/`)
    ? '/'
    : normalized;

  return `${normalizedPath}${search}${hash}`;
};

export const getTargetRouteKey = (
  value: string,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
) => {
  const { path } = splitTarget(normalizeTarget(value, reviewPathPrefix));
  return path || '/';
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
      target: normalizeTarget(
        `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
        reviewPathPrefix
      ),
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

export const getFrameRouteTarget = (
  targetWindow: Window,
  reviewPathPrefix: string
) => {
  return normalizeTarget(
    `${targetWindow.location.pathname}${targetWindow.location.search}${targetWindow.location.hash}`,
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
  url.searchParams.delete('panel');
  window.history.replaceState(
    null,
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
};

export const updateShellUrlForItem = (
  target: string,
  size: ReviewShellViewportPreset,
  itemId: string,
  source: ReviewSource
) => {
  const url = getShellUrlForItem(target, size, itemId, source);
  window.history.replaceState(
    null,
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
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
  url.searchParams.set('panel', 'qa');
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
  if (item.routeKey) return getTargetRouteKey(item.routeKey, reviewPathPrefix);
  if (item.normalizedPath) {
    return getTargetRouteKey(item.normalizedPath, reviewPathPrefix);
  }

  try {
    return getTargetRouteKey(new URL(item.pageUrl).pathname, reviewPathPrefix);
  } catch {
    return '/';
  }
};

export const getItemFrameTarget = (
  item: ReviewItem,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
) => {
  const routeTarget = getItemTarget(item, reviewPathPrefix);
  const originalTarget = getItemUrlTarget(item.originalUrl, reviewPathPrefix);
  if (
    originalTarget &&
    getTargetRouteKey(originalTarget, reviewPathPrefix) === routeTarget
  ) {
    return originalTarget;
  }

  const pageTarget = getItemUrlTarget(item.pageUrl, reviewPathPrefix);
  if (
    pageTarget &&
    getTargetRouteKey(pageTarget, reviewPathPrefix) === routeTarget
  ) {
    return pageTarget;
  }

  return routeTarget;
};

function splitTarget(value: string) {
  const hashIndex = value.indexOf('#');
  const beforeHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : '';
  const searchIndex = beforeHash.indexOf('?');
  const path = searchIndex >= 0
    ? beforeHash.slice(0, searchIndex)
    : beforeHash;
  const search = searchIndex >= 0 ? beforeHash.slice(searchIndex) : '';

  return {
    hash,
    path: path || '/',
    search,
  };
}

function getItemUrlTarget(
  value: string | undefined,
  reviewPathPrefix: string
) {
  if (!value) return null;
  if (typeof window === 'undefined') return null;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return normalizeTarget(
      `${url.pathname}${url.search}${url.hash}`,
      reviewPathPrefix
    );
  } catch {
    return null;
  }
}
