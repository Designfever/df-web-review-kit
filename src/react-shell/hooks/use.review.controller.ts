import {
  useCallback,
  type MutableRefObject,
  type RefObject,
} from 'react';
import type {
  ReviewItem,
  ReviewMode,
  ReviewRulerConfig,
  ReviewSource,
  ReviewViewportPreset,
  WebReviewKitAdapter,
  WebReviewKitController,
} from '../../types';
import type {
  ReviewShellViewportPreset,
  TargetOverlayState,
} from '../types';
import { useReviewItemRestore } from './use.review.item.restore';
import { useReviewKitLifecycle } from './use.review.kit.lifecycle';
import { useReviewTargetOverlay } from './use.review.target.overlay';
import { useReviewTargetSync } from './use.review.target.sync';

interface UseReviewControllerOptions {
  adapter: WebReviewKitAdapter;
  cleanupTargetRef: MutableRefObject<(() => void) | null>;
  controllerRef: MutableRefObject<WebReviewKitController | null>;
  frameScrollRef: RefObject<HTMLDivElement | null>;
  hiddenOverlayItemIdList: string[];
  hiddenOverlayItemIdListRef: MutableRefObject<string[]>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isFigmaOverlayAvailable: boolean;
  pageTargets: ReadonlySet<string>;
  pendingInitialItemIdRef: MutableRefObject<string | null>;
  pendingRestoreRef: MutableRefObject<ReviewItem | null>;
  projectId: string;
  reviewPathPrefix: string;
  reviewUserId: string;
  reviewViewportPresets: ReviewViewportPreset[];
  ruler?: ReviewRulerConfig;
  selectedItemIdRef: MutableRefObject<string | null>;
  size: ReviewShellViewportPreset;
  sizeRef: MutableRefObject<ReviewShellViewportPreset>;
  source: ReviewSource;
  target: string;
  targetOverlayState: TargetOverlayState;
  targetRef: MutableRefObject<string>;
  viewportPresets: ReviewShellViewportPreset[];
  onActiveRouteChange: (target: string) => void;
  onCancelReviewMode: () => boolean;
  onDraftTargetChange: (target: string) => void;
  onItemsRefresh: () => Promise<ReviewItem[]>;
  onModeChange: (mode: ReviewMode) => void;
  onSelectedItemIdChange: (itemId: string | null) => void;
  onSizeChange: (size: ReviewShellViewportPreset) => void;
  onTargetChange: (target: string) => void;
  onTargetOverlayStateChange: (state: TargetOverlayState) => void;
  onCloseRuler: () => boolean;
}

export const useReviewController = ({
  adapter,
  cleanupTargetRef,
  controllerRef,
  frameScrollRef,
  hiddenOverlayItemIdList,
  hiddenOverlayItemIdListRef,
  iframeRef,
  isFigmaOverlayAvailable,
  pageTargets,
  pendingInitialItemIdRef,
  pendingRestoreRef,
  projectId,
  reviewPathPrefix,
  reviewUserId,
  reviewViewportPresets,
  ruler,
  selectedItemIdRef,
  size,
  sizeRef,
  source,
  target,
  targetOverlayState,
  targetRef,
  viewportPresets,
  onActiveRouteChange,
  onCancelReviewMode,
  onDraftTargetChange,
  onItemsRefresh,
  onModeChange,
  onSelectedItemIdChange,
  onSizeChange,
  onTargetChange,
  onTargetOverlayStateChange,
  onCloseRuler,
}: UseReviewControllerOptions) => {
  const syncTargetViewport = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);
  const {
    closeTargetOverlay,
    refreshTargetOverlayState,
    toggleTargetOverlay,
  } = useReviewTargetOverlay({
    iframeRef,
    isFigmaOverlayAvailable,
    targetOverlayState,
    onTargetOverlayStateChange,
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
    selectedItemIdRef,
    source,
    targetRef,
    viewportPresets,
    onActiveRouteChange,
    onDraftTargetChange,
    onSelectedItemIdChange,
    onSizeChange,
    onSyncTargetViewport: syncTargetViewport,
    onTargetChange,
  });
  const { syncShellTarget } = useReviewTargetSync({
    iframeRef,
    reviewPathPrefix,
    selectedItemIdRef,
    size,
    sizeRef,
    source,
    target,
    targetRef,
    onActiveRouteChange,
    onClearSelectedItem: clearSelectedItem,
    onDraftTargetChange,
    onSyncTargetViewport: syncTargetViewport,
    onTargetChange,
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
    hiddenOverlayItemIdListRef,
    iframeRef,
    pageTargets,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    reviewViewportPresets,
    ruler,
    sizeRef,
    targetRef,
    onApplyPendingRestore: applyPendingRestore,
    onCancelReviewMode,
    onCloseRuler,
    onCreateItem: restoreReviewItem,
    onItemsRefresh,
    onModeChange,
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
