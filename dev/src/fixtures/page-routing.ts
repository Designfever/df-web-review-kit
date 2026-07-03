import { pages } from './config';

export function normalizePath(pathname: string) {
  if (pathname === '') return '/';
  if (pathname !== '/' && !pathname.endsWith('/')) return `${pathname}/`;
  return pathname;
}

export function getActivePage(pathname: string) {
  const normalized = normalizePath(pathname);
  return pages.some((page) => page.href === normalized) ? normalized : '/404/';
}
