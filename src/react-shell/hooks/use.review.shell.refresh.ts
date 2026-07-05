// Adapter refresh orchestration for route items and sitemap counts. It writes
// results into the shell store so containers can subscribe with selectors.
import {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { WebReviewKitAdapter } from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import {
  refreshReviewItems,
  refreshSitemapReviewItems,
} from '../review/shell.actions';
import type { ReviewShellStore } from '../store/create.review.shell.store';

interface UseReviewShellRefreshOptions {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  activeRoute: string;
  adapter: WebReviewKitAdapter;
  isRemoteSource: boolean;
  isSitemapOpen: boolean;
  localAdapterEntry: NormalizedReviewShellAdapter | null;
  projectId: string;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  storeApi: ReviewShellStore;
}

export const useReviewShellRefresh = ({
  activeAdapterEntry,
  activeRoute,
  adapter,
  isRemoteSource,
  isSitemapOpen,
  localAdapterEntry,
  projectId,
  remoteAdapterEntry,
  storeApi,
}: UseReviewShellRefreshOptions) => {
  const itemRefreshIdRef = useRef(0);
  const refreshItems = useCallback(
    async () => {
      const requestId = ++itemRefreshIdRef.current;
      storeApi.getState().setIsItemsLoading(true);

      try {
        return await refreshReviewItems({
          activeRoute,
          adapter,
          isRemoteSource,
          pageId: activeAdapterEntry.pageId,
          projectId,
          onItemsChange: storeApi.getState().setItems,
        });
      } finally {
        if (itemRefreshIdRef.current === requestId) {
          storeApi.getState().setIsItemsLoading(false);
        }
      }
    },
    [
      activeAdapterEntry.pageId,
      activeRoute,
      adapter,
      isRemoteSource,
      projectId,
      storeApi,
    ]
  );

  const refreshSitemapItems = useCallback(
    () =>
      refreshSitemapReviewItems({
        localAdapterEntry,
        projectId,
        remoteAdapterEntry,
        onSitemapItemsChange: storeApi.getState().setSitemapItems,
      }),
    [localAdapterEntry, projectId, remoteAdapterEntry, storeApi]
  );

  useEffect(() => {
    void refreshItems();
  }, [refreshItems]);

  useEffect(() => {
    void refreshSitemapItems();
  }, [refreshSitemapItems]);

  useEffect(() => {
    if (!isSitemapOpen) return;
    void refreshSitemapItems();
  }, [isSitemapOpen, refreshSitemapItems]);

  return {
    refreshItems,
    refreshSitemapItems,
  };
};
