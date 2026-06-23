import { useCallback, useMemo, useState } from 'react';
import {
  getNumberedReviewItems,
} from '../../core/review/scope';
import type {
  ReviewItem,
  ReviewViewportPreset,
} from '../../types';
import {
  buildTargetSrc,
  getItemTarget,
  normalizeTarget,
} from '../route';
import type {
  ReviewQaFilter,
  ReviewShellPage,
  ReviewShellViewportKind,
  ReviewShellViewportPreset,
} from '../types';
import {
  findViewportPreset,
  getViewportPresetKind,
} from '../viewport';
import type { SitemapQaCount } from '../sitemap/tree';

export type SitemapItemsBySource = {
  local: ReviewItem[];
  remote: ReviewItem[];
};

interface UseReviewShellDataOptions {
  activeRoute: string;
  pages: ReviewShellPage[];
  reviewPathPrefix: string;
  reviewViewportPresets: ReviewViewportPreset[];
  selectedItemId: string | null;
  size: ReviewShellViewportPreset;
  target: string;
  viewportPresets: ReviewShellViewportPreset[];
}

const createEmptySitemapQaCount = (): SitemapQaCount => ({
  local: 0,
  remote: 0,
});

export const useReviewShellData = ({
  activeRoute,
  pages,
  reviewPathPrefix,
  reviewViewportPresets,
  selectedItemId,
  size,
  target,
  viewportPresets,
}: UseReviewShellDataOptions) => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [hiddenOverlayItemIds, setHiddenOverlayItemIds] = useState<Set<string>>(
    () => new Set()
  );
  const [qaFilter, setQaFilter] = useState<ReviewQaFilter>('all');
  const [sitemapItems, setSitemapItems] = useState<SitemapItemsBySource>(() => ({
    local: [],
    remote: [],
  }));

  const targetSrc = useMemo(() => buildTargetSrc(target), [target]);
  const pageTargets = useMemo(
    () =>
      new Set(
        pages.map((page) => normalizeTarget(page.href, reviewPathPrefix))
      ),
    [pages, reviewPathPrefix]
  );
  const activeItems = useMemo(
    () =>
      items
        .filter((item) => getItemTarget(item, reviewPathPrefix) === activeRoute)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [activeRoute, items, reviewPathPrefix]
  );
  const numberedActiveItems = useMemo(
    () => getNumberedReviewItems(activeItems, reviewViewportPresets),
    [activeItems, reviewViewportPresets]
  );
  const filteredNumberedActiveItems = useMemo(
    () =>
      qaFilter === 'all'
        ? numberedActiveItems
        : numberedActiveItems.filter(
            (numberedItem) => numberedItem.scope === qaFilter
          ),
    [numberedActiveItems, qaFilter]
  );
  const hiddenOverlayItemIdList = useMemo(
    () => Array.from(hiddenOverlayItemIds),
    [hiddenOverlayItemIds]
  );
  const qaFilterCounts = useMemo(() => {
    const counts = new Map<ReviewQaFilter, number>();
    counts.set('all', numberedActiveItems.length);
    numberedActiveItems.forEach((numberedItem) => {
      counts.set(numberedItem.scope, (counts.get(numberedItem.scope) ?? 0) + 1);
    });
    return counts;
  }, [numberedActiveItems]);
  const getItemPresetScope = useCallback(
    (item: ReviewItem) =>
      getViewportPresetKind(
        findViewportPreset(
          viewportPresets,
          item.viewport?.width ?? 0,
          item.viewport?.height ?? 0
        )
      ),
    [viewportPresets]
  );
  const presetScopeCounts = useMemo(() => {
    const counts = new Map<ReviewShellViewportKind, number>();
    activeItems.forEach((item) => {
      const scope = getItemPresetScope(item);
      counts.set(scope, (counts.get(scope) ?? 0) + 1);
    });
    return counts;
  }, [activeItems, getItemPresetScope]);
  const currentPresetScope = getViewportPresetKind(size);
  const pageQaCounts = useMemo(() => {
    const counts = new Map<string, SitemapQaCount>();
    const addItems = (
      sourceKey: keyof SitemapItemsBySource,
      sourceItems: ReviewItem[]
    ) => {
      sourceItems.forEach((item) => {
        const pageTarget = normalizeTarget(
          getItemTarget(item, reviewPathPrefix),
          reviewPathPrefix
        );
        const count = counts.get(pageTarget) ?? createEmptySitemapQaCount();
        count[sourceKey] += 1;
        counts.set(pageTarget, count);
      });
    };

    addItems('local', sitemapItems.local);
    addItems('remote', sitemapItems.remote);

    return counts;
  }, [reviewPathPrefix, sitemapItems]);
  const selectedNumberedItem = useMemo(
    () =>
      selectedItemId
        ? numberedActiveItems.find(
            (numberedItem) => numberedItem.item.id === selectedItemId
          )
        : undefined,
    [numberedActiveItems, selectedItemId]
  );

  return {
    activeItems,
    currentPresetScope,
    filteredNumberedActiveItems,
    getItemPresetScope,
    hiddenOverlayItemIdList,
    hiddenOverlayItemIds,
    pageQaCounts,
    pageTargets,
    presetScopeCounts,
    qaFilter,
    qaFilterCounts,
    selectedNumberedItem,
    setHiddenOverlayItemIds,
    setItems,
    setQaFilter,
    setSitemapItems,
    targetSrc,
  };
};
