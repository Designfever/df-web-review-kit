import type { CreateReviewPagesOptions, ReviewShellGlobEntries, ReviewShellPage } from './types';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizePageHref = (value: string) => {
  const href = value || '/';
  return href.startsWith('/') ? href : `/${href}`;
};

const sortReviewPages = (a: ReviewShellPage, b: ReviewShellPage) => {
  if (a.href === '/') return -1;
  if (b.href === '/') return 1;
  return a.href.localeCompare(b.href);
};

export const createReviewPagesFromGlob = (
  entries: ReviewShellGlobEntries,
  options: CreateReviewPagesOptions = {}
): ReviewShellPage[] => {
  const root = options.root ?? '/page';
  const rootPattern = root ? new RegExp(`^${escapeRegExp(root)}`) : null;

  return Object.keys(entries)
    .map((key) => {
      const withoutRoot = rootPattern ? key.replace(rootPattern, '') : key;
      const href = withoutRoot.replace(/index\.(tsx|ts|jsx|js)$/, '');
      return normalizePageHref(href === '' ? '/' : href);
    })
    .filter((href) => !options.exclude?.(href))
    .sort((a, b) => sortReviewPages({ href: a }, { href: b }))
    .map((href) => ({ href }));
};
