import {
  useCallback,
  useEffect,
  type MutableRefObject,
  type RefObject,
} from 'react';
import type {
  ReviewAssigneeOption,
  ReviewFieldsConfig,
  ReviewItem,
  ReviewMode,
  ReviewRulerConfig,
  ReviewViewportPreset,
  WebReviewKitAdapter,
  WebReviewKitController,
} from '../../types';
import { createWebReviewKit } from '../../core/web.review.kit.app';
import { useReviewShellStoreApi } from '../store/store.context';
import { setTargetScrollbarHidden } from '../target/target';
import { getViewportPresetKind } from '../viewport';
import { bindReviewFrameNavigation } from './review.frame.navigation';
import { getReviewKitTarget } from './review.kit.target';

interface UseReviewKitLifecycleOptions {
  adapter: WebReviewKitAdapter;
  fields: Required<Pick<ReviewFieldsConfig, 'title'>>;
  assigneeTitle: string;
  assigneeOptions: readonly ReviewAssigneeOption[];
  cleanupTargetRef: MutableRefObject<(() => void) | null>;
  controllerRef: MutableRefObject<WebReviewKitController | null>;
  frameScrollRef: RefObject<HTMLDivElement | null>;
  hiddenOverlayItemIdList: string[];
  hiddenOverlayItemIdListRef: MutableRefObject<string[]>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  pageTargets: ReadonlySet<string>;
  projectId: string;
  reviewPathPrefix: string;
  reviewUserId: string;
  reviewViewportPresets: ReviewViewportPreset[];
  ruler?: ReviewRulerConfig;
  adjustmentLabel?: string;
  onApplyPendingRestore: () => void;
  onCancelReviewMode: () => boolean;
  onCloseRuler: () => boolean;
  onItemsRefresh: () => Promise<ReviewItem[]>;
  onModeChange: (mode: ReviewMode) => void;
  onCreateItem: (item: ReviewItem) => void;
  onRefreshTargetOverlayState: () => void;
  onRestoreInitialItem: () => Promise<void>;
  onRestoreReviewItem: (item: ReviewItem) => void;
  onSyncShellTarget: (target: string) => void;
  onSyncTargetViewport: () => void;
}

export const useReviewKitLifecycle = ({
  adapter,
  fields,
  assigneeTitle,
  assigneeOptions,
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
  adjustmentLabel,
  onApplyPendingRestore,
  onCancelReviewMode,
  onCloseRuler,
  onItemsRefresh,
  onModeChange,
  onCreateItem,
  onRefreshTargetOverlayState,
  onRestoreInitialItem,
  onRestoreReviewItem,
  onSyncShellTarget,
  onSyncTargetViewport,
}: UseReviewKitLifecycleOptions) => {
  const storeApi = useReviewShellStoreApi();
  const destroyReviewKit = useCallback(() => {
    cleanupTargetRef.current?.();
    cleanupTargetRef.current = null;
    controllerRef.current?.destroy();
    controllerRef.current = null;
  }, [cleanupTargetRef, controllerRef]);

  const initReviewKit = useCallback(() => {
    destroyReviewKit();

    const iframe = iframeRef.current;
    const targetWindow = iframe?.contentWindow;
    const targetDocument = iframe?.contentDocument;
    if (!iframe || !targetWindow || !targetDocument) return;

    cleanupTargetRef.current = bindReviewFrameNavigation({
      getCurrentTarget: () => storeApi.getState().target,
      pageTargets,
      reviewPathPrefix,
      targetDocument,
      targetWindow,
      onCancelReviewMode,
      onCloseRuler,
      onSyncShellTarget,
      onSyncTargetViewport,
    });

    controllerRef.current = createWebReviewKit({
      projectId,
      userId: reviewUserId.trim() || undefined,
      adapter,
      fields,
      assigneeTitle,
      assigneeOptions,
      target: () => getReviewKitTarget({ frameScrollRef, iframeRef }),
      hotkeys: {
        qa: 'Shift+Q',
      },
      anchors: {
        attribute: 'data-qa-id',
      },
      viewports: {
        presets: reviewViewportPresets,
      },
      ruler,
      adjustmentLabel,
      onCreateItem,
      onRestoreItem: onRestoreReviewItem,
      onItemsChange: () => {
        void onItemsRefresh();
      },
      onModeChange,
      ui: {
        panel: false,
      },
      modules: {
        qa: true,
        grid: false,
        figma: false,
      },
    });
    controllerRef.current.open();
    controllerRef.current.setHiddenItemIds(hiddenOverlayItemIdListRef.current);
    onModeChange(controllerRef.current.getMode());
    void onItemsRefresh();
    void onRestoreInitialItem().then(onApplyPendingRestore);
    onRefreshTargetOverlayState();
    setTargetScrollbarHidden(
      targetDocument,
      getViewportPresetKind(storeApi.getState().size) === 'mobile'
    );
  }, [
    adapter,
    fields,
    assigneeTitle,
    assigneeOptions,
    cleanupTargetRef,
    controllerRef,
    destroyReviewKit,
    frameScrollRef,
    hiddenOverlayItemIdListRef,
    iframeRef,
    onApplyPendingRestore,
    onCancelReviewMode,
    onCloseRuler,
    onCreateItem,
    onItemsRefresh,
    onModeChange,
    onRefreshTargetOverlayState,
    onRestoreInitialItem,
    onRestoreReviewItem,
    onSyncShellTarget,
    onSyncTargetViewport,
    pageTargets,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    reviewViewportPresets,
    ruler,
    adjustmentLabel,
    storeApi,
  ]);

  const reloadReviewKit = useCallback(async () => {
    await controllerRef.current?.reload();
  }, [controllerRef]);

  const setControllerReviewMode = useCallback(
    (nextMode: ReviewMode) => {
      controllerRef.current?.setMode(nextMode);
      onModeChange(controllerRef.current?.getMode() ?? 'idle');
    },
    [controllerRef, onModeChange]
  );

  useEffect(() => destroyReviewKit, [destroyReviewKit]);

  useEffect(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument || frameDocument.readyState !== 'complete') return;
    initReviewKit();
  }, [iframeRef, initReviewKit]);

  useEffect(() => {
    hiddenOverlayItemIdListRef.current = hiddenOverlayItemIdList;
    controllerRef.current?.setHiddenItemIds(hiddenOverlayItemIdList);
  }, [controllerRef, hiddenOverlayItemIdList, hiddenOverlayItemIdListRef]);

  return {
    destroyReviewKit,
    initReviewKit,
    reloadReviewKit,
    setControllerReviewMode,
  };
};
