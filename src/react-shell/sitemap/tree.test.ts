import { describe, expect, it } from 'vitest';
import {
  createEmptySitemapQaCount,
  createSitemapRows,
  type SitemapQaCount,
} from './tree';

const createCount = (
  status: Partial<SitemapQaCount['status']>
): SitemapQaCount => {
  const empty = createEmptySitemapQaCount();
  const statusCount = Object.values(status).reduce(
    (total, count) => total + (count ?? 0),
    0
  );

  return {
    ...empty,
    total: statusCount,
    remaining: statusCount,
    status: { ...empty.status, ...status },
  };
};

const pages = [
  { href: '/alpha/' },
  { href: '/group/beta/' },
  { href: '/group/gamma/' },
];
const pageQaCounts = new Map([
  ['/alpha/', createCount({ todo: 1 })],
  ['/group/beta/', createCount({ review: 1 })],
  ['/group/gamma/', createCount({ hold: 1 })],
]);
const getPageTarget = (href: string) => href;

describe('createSitemapRows status filters', () => {
  it('combines enabled statuses with OR and returns flat full paths', () => {
    const rows = createSitemapRows(
      pages,
      '/',
      pageQaCounts,
      new Map(),
      getPageTarget,
      { statusFilters: new Set(['todo', 'review']) }
    );

    expect(rows.map((row) => row.label)).toEqual([
      '/alpha/',
      '/group/beta/',
    ]);
    expect(rows.every((row) => row.depth === 0 && !row.hasChildren)).toBe(true);
  });

  it('combines status filters with the search query using AND', () => {
    const rows = createSitemapRows(
      pages,
      '/',
      pageQaCounts,
      new Map(),
      getPageTarget,
      {
        searchQuery: 'beta',
        statusFilters: new Set(['todo', 'review']),
      }
    );

    expect(rows.map((row) => row.href)).toEqual(['/group/beta/']);
  });
});
