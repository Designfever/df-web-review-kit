// 셸 레벨에서 공유되는 파생 데이터 (topbar 카운트/sitemap 카운트/오버레이 id 목록 등).
// QA 패널 전용 파생값은 qa/use.review.qa.panel.data.ts 가 담당한다.
import { useCallback, useMemo } from 'react';
import {
  getNumberedReviewItems,
} from '../../core/review/scope';
import type {
  ReviewItem,
  ReviewItemScope,
  ReviewWorkflowStatus,
} from '../../types';
import { normalizeReviewItemStatus } from '../../status';
import {
  buildTargetSrc,
  getItemTarget,
  normalizeTarget,
} from '../route';
import { getActiveReviewItems } from '../qa/derive';
import { matchesReviewQaStatusFilters } from '../qa/status.filter';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import type { ReviewShellViewportKind } from '../types';
import {
  findViewportPreset,
  getViewportPresetKind,
} from '../viewport';
import type { SitemapQaCount } from '../sitemap/tree';
import {
  addSitemapQaCounts,
  createEmptySitemapQaCount,
  createSitemapViewportColumn,
} from '../sitemap/tree';

const SITEMAP_STATUS_DONE: ReviewWorkflowStatus = 'done';

export const useReviewShellData = () => {
  const { pages, reviewPathPrefix, reviewViewportPresets, viewportPresets } =
    useReviewShellConfig();
  const { isRemoteSource } = useReviewShellAdapterState();
  const activeRoute = useReviewShellStore((state) => state.activeRoute);
  const target = useReviewShellStore((state) => state.target);
  const items = useReviewShellStore((state) => state.items);
  const sitemapItems = useReviewShellStore((state) => state.sitemapItems);
  const hiddenOverlayItemIds = useReviewShellStore(
    (state) => state.hiddenOverlayItemIds
  );
  const qaStatusFilters = useReviewShellStore((state) => state.qaStatusFilters);
  const selectedItemId = useReviewShellStore((state) => state.selectedItemId);
  const isAllQaVisible = useReviewShellStore((state) => state.isAllQaVisible);

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
  const hiddenOverlayItemIdList = useMemo(
    () => {
      const nextHiddenItemIds = new Set(hiddenOverlayItemIds);

      activeItems.forEach((item) => {
        if (!matchesReviewQaStatusFilters(item.status, qaStatusFilters)) {
          nextHiddenItemIds.add(item.id);
        }
      });

      return Array.from(nextHiddenItemIds);
    },
    [activeItems, hiddenOverlayItemIds, qaStatusFilters]
  );
  const getItemPreset = useCallback(
    (item: ReviewItem) =>
      findViewportPreset(
        viewportPresets,
        item.viewport?.width ?? 0,
        item.viewport?.height ?? 0
      ),
    [viewportPresets]
  );
  const getItemPresetScope = useCallback(
    (item: ReviewItem) => getViewportPresetKind(getItemPreset(item)),
    [getItemPreset]
  );
  const getItemPresetColumn = useCallback(
    (item: ReviewItem) => {
      const preset = getItemPreset(item);
      const presetIndex = Math.max(0, viewportPresets.indexOf(preset));

      return createSitemapViewportColumn(preset, presetIndex);
    },
    [getItemPreset, viewportPresets]
  );
  const getItemCountScope = useCallback(
    (item: ReviewItem): ReviewItemScope =>
      item.scope === 'dom' ? 'dom' : getItemPresetScope(item),
    [getItemPresetScope]
  );
  const presetScopeCounts = useMemo(() => {
    const counts = new Map<ReviewShellViewportKind, number>();
    activeItems.forEach((item) => {
      const scope = getItemPresetScope(item);
      counts.set(scope, (counts.get(scope) ?? 0) + 1);
    });
    return counts;
  }, [activeItems, getItemPresetScope]);
  const pageQaCounts = useMemo(() => {
    const counts = new Map<string, SitemapQaCount>();
    const addItems = (
      sourceKey: 'local' | 'remote',
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
        const viewportColumn = getItemPresetColumn(item);
        const currentViewportCount = currentCount.viewport[
          viewportColumn.key
        ] ?? { total: 0, remaining: 0 };
        const isRemaining = status !== SITEMAP_STATUS_DONE;

        counts.set(pageTarget, {
          ...currentCount,
          total: currentCount.total + 1,
          remaining:
            isRemaining ? currentCount.remaining + 1 : currentCount.remaining,
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
          viewport: {
            ...currentCount.viewport,
            [viewportColumn.key]: {
              total: currentViewportCount.total + 1,
              remaining: isRemaining
                ? currentViewportCount.remaining + 1
                : currentViewportCount.remaining,
            },
          },
        });
      });
    };

    addItems('local', sitemapItems.local);
    addItems('remote', sitemapItems.remote);

    return counts;
  }, [getItemCountScope, getItemPresetColumn, reviewPathPrefix, sitemapItems]);
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
    allQaCount,
    hiddenOverlayItemIdList,
    items,
    pageQaCounts,
    pageTargets,
    presetScopeCounts,
    selectedNumberedItem,
    targetSrc,
  };
};
