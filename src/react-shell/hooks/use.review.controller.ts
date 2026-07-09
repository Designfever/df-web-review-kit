import {
  useCallback,
  useMemo,
} from 'react';
import type {
  ReviewItem,
  ReviewRulerConfig,
} from '../../types';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellRefs } from '../store/shell.refs';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import { normalizeTarget } from '../route';
import { useReviewItemRestore } from './use.review.item.restore';
import { useReviewKitLifecycle } from './use.review.kit.lifecycle';
import { useReviewTargetOverlay } from './use.review.target.overlay';
import { useReviewTargetSync } from './use.review.target.sync';

interface UseReviewControllerOptions {
  hiddenOverlayItemIdList: string[];
  isFigmaOverlayAvailable: boolean;
  reviewUserId: string;
  ruler?: ReviewRulerConfig;
  adjustmentLabel?: string;
  onCancelReviewMode: () => boolean;
  onItemsRefresh: () => Promise<ReviewItem[]>;
  onCloseRuler: () => boolean;
}

export const useReviewController = ({
  hiddenOverlayItemIdList,
  isFigmaOverlayAvailable,
  reviewUserId,
  ruler,
  adjustmentLabel,
  onCancelReviewMode,
  onItemsRefresh,
  onCloseRuler,
}: UseReviewControllerOptions) => {
  const {
    pages,
    projectId,
    reviewPathPrefix,
    reviewViewportPresets,
    viewportPresets,
  } = useReviewShellConfig();
  const {
    activeAdapterEntry,
    adapter,
    source,
  } = useReviewShellAdapterState();
  const {
    cleanupTargetRef,
    controllerRef,
    frameScrollRef,
    iframeRef,
    pendingInitialItemIdRef,
    pendingRestoreRef,
  } = useReviewShellRefs();
  const size = useReviewShellStore((state) => state.size);
  const target = useReviewShellStore((state) => state.target);
  const targetOverlayState = useReviewShellStore(
    (state) => state.targetOverlayState
  );
  const setActiveRoute = useReviewShellStore((state) => state.setActiveRoute);
  const setDraftTarget = useReviewShellStore((state) => state.setDraftTarget);
  const setIsListVisible = useReviewShellStore(
    (state) => state.setIsListVisible
  );
  const setMode = useReviewShellStore((state) => state.setMode);
  const setSelectedItemId = useReviewShellStore(
    (state) => state.setSelectedItemId
  );
  const setSidePanel = useReviewShellStore((state) => state.setSidePanel);
  const setSize = useReviewShellStore((state) => state.setSize);
  const setTarget = useReviewShellStore((state) => state.setTarget);
  const setTargetOverlayState = useReviewShellStore(
    (state) => state.setTargetOverlayState
  );
  const syncTargetViewport = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);
  const pageTargets = useMemo(
    () =>
      new Set(
        pages.map((page) => normalizeTarget(page.href, reviewPathPrefix))
      ),
    [pages, reviewPathPrefix]
  );
  const {
    closeTargetOverlay,
    refreshTargetOverlayState,
    toggleTargetOverlay,
  } = useReviewTargetOverlay({
    iframeRef,
    isFigmaOverlayAvailable,
    targetOverlayState,
    onTargetOverlayStateChange: setTargetOverlayState,
  });
  const {
    applyPendingRestore,
    clearSelectedItem,
    restoreInitialItem,
    restoreReviewItem,
  } = useReviewItemRestore({
    adapter,
    controllerRef,
    iframeRef,
    pendingInitialItemIdRef,
    pendingRestoreRef,
    reviewPathPrefix,
    source,
    viewportPresets,
    onActiveRouteChange: setActiveRoute,
    onDraftTargetChange: setDraftTarget,
    onSelectedItemIdChange: setSelectedItemId,
    onSizeChange: setSize,
    onSyncTargetViewport: syncTargetViewport,
    onTargetChange: setTarget,
  });
  const restoreCreatedReviewItem = useCallback(
    (item: ReviewItem) => {
      setSidePanel('qa');
      setIsListVisible(true);
      restoreReviewItem(item);
    },
    [
      restoreReviewItem,
      setIsListVisible,
      setSidePanel,
    ]
  );
  const { syncShellTarget } = useReviewTargetSync({
    iframeRef,
    reviewPathPrefix,
    size,
    source,
    target,
    onActiveRouteChange: setActiveRoute,
    onClearSelectedItem: clearSelectedItem,
    onDraftTargetChange: setDraftTarget,
    onSyncTargetViewport: syncTargetViewport,
    onTargetChange: setTarget,
  });
  const {
    initReviewKit,
    reloadReviewKit,
    setControllerReviewMode,
  } = useReviewKitLifecycle({
    adapter,
    cleanupTargetRef,
    controllerRef,
    frameScrollRef,
    hiddenOverlayItemIdList,
    iframeRef,
    pageTargets,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    reviewViewportPresets,
    fields: activeAdapterEntry.fields,
    assigneeTitle: activeAdapterEntry.assigneeTitle,
    assigneeOptions: activeAdapterEntry.assigneeOptions,
    ruler,
    adjustmentLabel,
    onApplyPendingRestore: applyPendingRestore,
    onCancelReviewMode,
    onCloseRuler,
    onCreateItem: restoreCreatedReviewItem,
    onItemsRefresh,
    onModeChange: setMode,
    onRefreshTargetOverlayState: refreshTargetOverlayState,
    onRestoreInitialItem: restoreInitialItem,
    onRestoreReviewItem: restoreReviewItem,
    onSyncShellTarget: syncShellTarget,
    onSyncTargetViewport: syncTargetViewport,
  });

  return {
    clearSelectedItem,
    closeTargetOverlay,
    initReviewKit,
    reloadReviewKit,
    restoreReviewItem,
    setControllerReviewMode,
    syncTargetViewport,
    toggleTargetOverlay,
  };
};
