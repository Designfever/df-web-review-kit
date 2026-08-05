// Adapter refresh orchestration for route items, lazy all-QA items, and
// lightweight sitemap summaries. Results are cached in the shell store.
import { useCallback, useEffect, useRef } from 'react';
import type { ReviewItem, WebReviewKitAdapter } from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { refreshSitemapReviewItems } from '../review/shell.actions';
import type { ReviewShellStore } from '../store/create.review.shell.store';

interface UseReviewShellRefreshOptions {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  isAllQaVisible: boolean;
  isRemoteSource: boolean;
  isSitemapOpen: boolean;
  localAdapterEntry: NormalizedReviewShellAdapter | null;
  projectId: string;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  storeApi: ReviewShellStore;
}

type CacheIdentity = {
  projectId: string;
  localAdapter: WebReviewKitAdapter | null;
  remoteAdapter: WebReviewKitAdapter | null;
};

const isSameCacheIdentity = (
  current: CacheIdentity | null,
  next: CacheIdentity
) =>
  current?.projectId === next.projectId &&
  current.localAdapter === next.localAdapter &&
  current.remoteAdapter === next.remoteAdapter;

export const useReviewShellRefresh = ({
  activeAdapterEntry,
  isAllQaVisible,
  isRemoteSource,
  isSitemapOpen,
  localAdapterEntry,
  projectId,
  remoteAdapterEntry,
  storeApi,
}: UseReviewShellRefreshOptions) => {
  const sitemapCacheRef = useRef<CacheIdentity | null>(null);
  const sitemapDirtyRef = useRef(true);
  const sitemapInvalidationRef = useRef(0);
  const sitemapRequestRef = useRef<Promise<void> | null>(null);
  const allQaCacheRef = useRef(
    new Map<string, { adapter: WebReviewKitAdapter; projectId: string }>()
  );
  const allQaDirtyRef = useRef(new Set<string>());
  const allQaInvalidationRef = useRef(new Map<string, number>());
  const allQaRequestRef = useRef(new Map<string, Promise<ReviewItem[]>>());
  const activeSourceKey = isRemoteSource ? 'remote' : 'local';

  const refreshSitemapItems = useCallback(
    async (force = false) => {
      const identity: CacheIdentity = {
        projectId,
        localAdapter: localAdapterEntry?.adapter ?? null,
        remoteAdapter: remoteAdapterEntry?.adapter ?? null,
      };
      if (sitemapRequestRef.current) {
        await sitemapRequestRef.current;
      }
      if (
        !force &&
        !sitemapDirtyRef.current &&
        isSameCacheIdentity(sitemapCacheRef.current, identity)
      ) {
        return;
      }

      const invalidation = sitemapInvalidationRef.current;
      const request = refreshSitemapReviewItems({
        localAdapterEntry,
        projectId,
        remoteAdapterEntry,
        onSitemapItemsChange: storeApi.getState().setSitemapItems,
      }).then(() => {
        sitemapCacheRef.current = identity;
        if (sitemapInvalidationRef.current === invalidation) {
          sitemapDirtyRef.current = false;
        }
      });
      sitemapRequestRef.current = request;
      try {
        await request;
      } finally {
        if (sitemapRequestRef.current === request) {
          sitemapRequestRef.current = null;
        }
      }
    },
    [localAdapterEntry, projectId, remoteAdapterEntry, storeApi]
  );

  const refreshAllItems = useCallback(
    async (force = false): Promise<ReviewItem[]> => {
      const pendingRequest = allQaRequestRef.current.get(activeSourceKey);
      if (pendingRequest) await pendingRequest;

      const cache = allQaCacheRef.current.get(activeSourceKey);
      if (
        !force &&
        cache?.adapter === activeAdapterEntry.adapter &&
        cache.projectId === projectId &&
        !allQaDirtyRef.current.has(activeSourceKey)
      ) {
        return storeApi.getState().allQaItems[activeSourceKey];
      }

      const invalidation = allQaInvalidationRef.current.get(activeSourceKey) ?? 0;
      storeApi.getState().setIsItemsLoading(true);
      const request = activeAdapterEntry.adapter
        .list({
          projectId,
          pageId: activeAdapterEntry.pageId,
          source: activeAdapterEntry.label,
        })
        .then((items) => {
          const current = storeApi.getState().allQaItems;
          storeApi.getState().setAllQaItems({
            ...current,
            [activeSourceKey]: items,
          });
          allQaCacheRef.current.set(activeSourceKey, {
            adapter: activeAdapterEntry.adapter,
            projectId,
          });
          if (
            (allQaInvalidationRef.current.get(activeSourceKey) ?? 0) ===
            invalidation
          ) {
            allQaDirtyRef.current.delete(activeSourceKey);
          }
          return items;
        });
      allQaRequestRef.current.set(activeSourceKey, request);
      try {
        return await request;
      } finally {
        if (allQaRequestRef.current.get(activeSourceKey) === request) {
          allQaRequestRef.current.delete(activeSourceKey);
        }
        storeApi.getState().setIsItemsLoading(false);
      }
    }, [activeAdapterEntry, activeSourceKey, projectId, storeApi]
  );

  const invalidateSitemapItems = useCallback(() => {
    sitemapDirtyRef.current = true;
    sitemapInvalidationRef.current += 1;
  }, []);

  const invalidateAllItems = useCallback(() => {
    allQaDirtyRef.current.add(activeSourceKey);
    const invalidation = allQaInvalidationRef.current.get(activeSourceKey) ?? 0;
    allQaInvalidationRef.current.set(activeSourceKey, invalidation + 1);
  }, [activeSourceKey]);

  useEffect(() => {
    if (!isSitemapOpen) return;
    void refreshSitemapItems();
  }, [isSitemapOpen, refreshSitemapItems]);

  useEffect(() => {
    if (!isAllQaVisible) return;
    void refreshAllItems();
  }, [isAllQaVisible, refreshAllItems]);

  return {
    invalidateAllItems,
    invalidateSitemapItems,
    refreshAllItems,
    refreshSitemapItems,
  };
};
