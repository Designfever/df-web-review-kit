import { normalizeRoutePath } from '../route';
import type { ReviewEnvironment } from './geometry';

const INTERNAL_QUERY_PARAMS = ['__dfwr_target'];

/** Returns the public target URL without review-only query params. */
export function getPageUrl(environment?: ReviewEnvironment) {
  const location = environment?.window.location ?? window.location;
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}

/** Mirrors page URL today, kept separate for future canonical/original URL support. */
export function getOriginalUrl(environment?: ReviewEnvironment) {
  const location = environment?.window.location ?? window.location;
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}

/** Returns the normalized route key used for adapter queries. */
export function getRouteKey(environment?: ReviewEnvironment) {
  const location = environment?.window.location ?? window.location;
  return normalizeRoutePath(location.pathname);
}


function getPublicSearch(location: Location) {
  const params = new URLSearchParams(location.search);

  INTERNAL_QUERY_PARAMS.forEach((key) => params.delete(key));

  const value = params.toString();
  return value ? `?${value}` : '';
}
