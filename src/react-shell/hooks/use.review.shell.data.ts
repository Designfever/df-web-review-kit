import { useCallback, useMemo, useState } from 'react';
import {
  getNumberedReviewItems,
} from '../../core/review/scope';
import type {
  ReviewItem,
  ReviewItemScope,
  ReviewWorkflowStatus,
  ReviewViewportPreset,
} from '../../types';
import { normalizeReviewItemStatus } from '../../status';
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
import {
  addSitemapQaCounts,
  createEmptySitemapQaCount,
} from '../sitemap/tree';

export type SitemapItemsBySource = {
  local: ReviewItem[];
  remote: ReviewItem[];
};

interface UseReviewShellDataOptions {
  activeRoute: string;
  pages: ReviewShellPage[];
  isAllQaVisible: boolean;
  isRemoteSource: boolean;
  reviewPathPrefix: string;
  reviewViewportPresets: ReviewViewportPreset[];
  selectedItemId: string | null;
  size: ReviewShellViewportPreset;
  target: string;
  viewportPresets: ReviewShellViewportPreset[];
}

const SITEMAP_STATUS_DONE: ReviewWorkflowStatus = 'done';

export const useReviewShellData = ({
  activeRoute,
  isAllQaVisible,
  isRemoteSource,
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
  const sitemapSourceItems = useMemo(
    () => (isRemoteSource ? sitemapItems.remote : sitemapItems.local),
    [isRemoteSource, sitemapItems]
  );
  const activeItems = useMemo(
    () =>
      (isAllQaVisible
        ? sitemapSourceItems
        : items.filter(
            (item) => getItemTarget(item, reviewPathPrefix) === activeRoute
          )
      ).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [activeRoute, isAllQaVisible, items, reviewPathPrefix, sitemapSourceItems]
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
  const getItemCountScope = useCallback(
    (item: ReviewItem): ReviewItemScope =>
      item.scope === 'dom' ? 'dom' : getItemPresetScope(item),
    [getItemPresetScope]
  );
  const activeRemainingItemCount = useMemo(
    () =>
      activeItems.filter(
        (item) => normalizeReviewItemStatus(item.status) !== SITEMAP_STATUS_DONE
      ).length,
    [activeItems]
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
        const currentCount =
          counts.get(pageTarget) ?? createEmptySitemapQaCount();
        const status = normalizeReviewItemStatus(item.status);
        const scope = getItemCountScope(item);

        counts.set(pageTarget, {
          ...currentCount,
          total: currentCount.total + 1,
          remaining:
            status === SITEMAP_STATUS_DONE
              ? currentCount.remaining
              : currentCount.remaining + 1,
          local: currentCount.local + (sourceKey === 'local' ? 1 : 0),
          remote: currentCount.remote + (sourceKey === 'remote' ? 1 : 0),
          status: {
            ...currentCount.status,
            [status]: currentCount.status[status] + 1,
          },
          scope: {
            ...currentCount.scope,
            [scope]: (currentCount.scope[scope] ?? 0) + 1,
          },
        });
      });
    };

    addItems('local', sitemapItems.local);
    addItems('remote', sitemapItems.remote);

    return counts;
  }, [getItemCountScope, reviewPathPrefix, sitemapItems]);
  const allQaCount = useMemo(
    () =>
      Array.from(pageQaCounts.values()).reduce(
        addSitemapQaCounts,
        createEmptySitemapQaCount()
      ),
    [pageQaCounts]
  );
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
    activeRemainingItemCount,
    allQaCount,
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
