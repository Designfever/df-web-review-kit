import type { ReviewItem } from './types';

export function getItemRouteKey(
  item: Pick<ReviewItem, 'routeKey' | 'normalizedPath'>
) {
  return normalizeRoutePath(item.routeKey || item.normalizedPath);
}

export function normalizeRoutePath(pathname: string) {
  const [pathWithoutQuery] = pathname.split(/[?#]/);
  const path = (pathWithoutQuery || '/').replace(/\/index\.html$/, '/');
  return path.startsWith('/') ? path : `/${path}`;
}
