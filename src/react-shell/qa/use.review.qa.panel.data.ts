// QA 패널 전용 파생 데이터. 컨테이너에서 store/config 를 읽어 계산한다.
import { useCallback, useMemo } from 'react';
import { getNumberedReviewItems } from '../../core/review/scope';
import type { ReviewItem } from '../../types';
import { normalizeReviewItemStatus } from '../../status';
import {
  writeStoredReviewQaStatusFilters,
} from '../settings';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import type { ReviewQaStatusFilter } from '../types';
import {
  findViewportPreset,
  getViewportPresetKind,
} from '../viewport';
import { getActiveReviewItems } from './derive';
import {
  matchesReviewQaStatusFilters,
  normalizeReviewQaStatusFilters,
} from './status.filter';

const SITEMAP_STATUS_DONE = 'done';

export const useReviewQaPanelData = () => {
  const { reviewPathPrefix, reviewViewportPresets, viewportPresets } =
    useReviewShellConfig();
  const activeRoute = useReviewShellStore((state) => state.activeRoute);
  const size = useReviewShellStore((state) => state.size);
  const items = useReviewShellStore((state) => state.items);
  const sitemapItems = useReviewShellStore((state) => state.sitemapItems);
  const qaFilter = useReviewShellStore((state) => state.qaFilter);
  const qaStatusFilters = useReviewShellStore((state) => state.qaStatusFilters);
  const isAllQaVisible = useReviewShellStore((state) => state.isAllQaVisible);
  const setQaStatusFiltersState = useReviewShellStore(
    (state) => state.setQaStatusFilters
  );
  const { isRemoteSource } = useReviewShellAdapterState();

  const sitemapSourceItems = useMemo(
    () => (isRemoteSource ? sitemapItems.remote : sitemapItems.local),
    [isRemoteSource, sitemapItems]
  );

  const activeItems = useMemo(
    () =>
      getActiveReviewItems({
        activeRoute,
        isAllQaVisible,
        items,
        reviewPathPrefix,
        sitemapSourceItems,
      }),
    [activeRoute, isAllQaVisible, items, reviewPathPrefix, sitemapSourceItems]
  );
  const numberedActiveItems = useMemo(
    () => getNumberedReviewItems(activeItems, reviewViewportPresets),
    [activeItems, reviewViewportPresets]
  );
  const scopeFilteredNumberedActiveItems = useMemo(
    () =>
      qaFilter === 'all'
        ? numberedActiveItems
        : numberedActiveItems.filter(
            (numberedItem) => numberedItem.scope === qaFilter
          ),
    [numberedActiveItems, qaFilter]
  );
  const filteredNumberedActiveItems = useMemo(
    () =>
      scopeFilteredNumberedActiveItems.filter((numberedItem) =>
        matchesReviewQaStatusFilters(numberedItem.item.status, qaStatusFilters)
      ),
    [qaStatusFilters, scopeFilteredNumberedActiveItems]
  );
  const qaStatusFilterCounts = useMemo(() => {
    const counts = new Map<ReviewQaStatusFilter, number>();
    scopeFilteredNumberedActiveItems.forEach((numberedItem) => {
      const status = normalizeReviewItemStatus(numberedItem.item.status);
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });
    return counts;
  }, [scopeFilteredNumberedActiveItems]);
  const activeRemainingItemCount = useMemo(
    () =>
      activeItems.filter(
        (item) => normalizeReviewItemStatus(item.status) !== SITEMAP_STATUS_DONE
      ).length,
    [activeItems]
  );
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
  const toggleQaStatusFilter = useCallback(
    (filter: ReviewQaStatusFilter) => {
      const normalizedFilters = normalizeReviewQaStatusFilters(qaStatusFilters);
      const nextFilters = normalizedFilters.includes(filter)
        ? normalizedFilters.filter((item) => item !== filter)
        : [...normalizedFilters, filter];

      if (nextFilters.length === 0) return;

      const normalizedNextFilters = normalizeReviewQaStatusFilters(nextFilters);
      setQaStatusFiltersState(normalizedNextFilters);
      writeStoredReviewQaStatusFilters(normalizedNextFilters);
    },
    [qaStatusFilters, setQaStatusFiltersState]
  );
  const currentPresetScope = getViewportPresetKind(size);

  return {
    activeItems,
    activeRemainingItemCount,
    currentPresetScope,
    filteredNumberedActiveItems,
    getItemPresetScope,
    qaStatusFilterCounts,
    toggleQaStatusFilter,
  };
};
