// Runtime assembler for ReviewShell. It wires hooks, adapter refresh, core
// controller commands, and provider values; rendering stays in shell.frame.
import {
  useCallback,
  useMemo,
} from 'react';
import { refreshReviewData as refreshReviewDataAction } from '../review/shell.actions';
import type { ReviewShellProviderValues } from '../review/shell.providers';
import { DEFAULT_REVIEW_PATH_PREFIX } from '../route';
import type { ReviewShellProps } from '../types';
import { useReviewCommandKey } from './use.review.command.key';
import { useReviewController } from './use.review.controller';
import { useReviewRuler } from './use.review.ruler';
import { useReviewShellActionsValue } from './use.review.shell.actions.value';
import { useReviewShellEffects } from './use.review.shell.effects';
import { useReviewShellFigmaImages } from './use.review.shell.figma.images';
import { useReviewShellFigmaOverlay } from './use.review.shell.figma.overlay';
import { useReviewShellPresenceState } from './use.review.shell.presence.state';
import { useReviewSettings } from './use.review.settings';
import {
  useReviewShellLoadTargetFrame,
  useReviewShellModeSetter,
  useReviewShellPanelActions,
  useReviewShellTransientActions,
} from './use.review.shell.runtime.actions';
import { useReviewShellData } from './use.review.shell.data';
import { useReviewShellHotkeys } from './use.review.shell.hotkeys';
import { useReviewShellRefresh } from './use.review.shell.refresh';
import { useReviewShellState } from './use.review.shell.state';
import { useReviewShellTargetFigma } from './use.review.shell.target.figma';
import { useReviewSidePanel } from './use.review.side.panel';
import { useReviewSourceInspector } from './use.review.source.inspector';
import { useReviewTargetNavigation } from './use.review.target.navigation';
import {
  useReviewShellConfig,
} from '../store/shell.config';
import {
  useReviewShellStore,
  useReviewShellStoreApi,
} from '../store/store.context';

export const useReviewShellRuntime = ({
  projectId,
  ruler,
  adjustmentLabel,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
  presence,
  figmaImages,
}: ReviewShellProps): ReviewShellProviderValues => {
  const {
    activeAdapterEntry,
    activeRoute,
    adapter,
    bumpTargetFrameLoadVersion,
    controllerRef,
    frameScrollRef,
    iframeRef,
    isFigmaOverlayAvailable: isViewportFigmaOverlayAvailable,
    isInitialPromptOpen,
    isInitialPromptScriptOpen,
    isRemoteSource,
    isSitemapOpen,
    localAdapterEntry,
    mode,
    pendingInitialItemIdRef,
    remoteAdapterEntry,
    setIsInitialPromptOpen,
    setIsInitialPromptScriptOpen,
    setIsSitemapOpen,
    setMode,
    size,
    source,
    target,
    targetFrameLoadVersion,
    targetOverlayState,
  } = useReviewShellState();
  const storeApi = useReviewShellStoreApi();
  const isItemEditing = useReviewShellStore((state) =>
    Boolean(state.editingItem)
  );
  const {
    isSourceTreeHoverOutlineEnabled,
    sourceCandidateOptions,
  } = useReviewShellConfig();

  const {
    figmaImagesController,
    figmaImagesState,
    isFigmaImageManagementEnabled,
  } = useReviewShellFigmaImages({
    figmaImages,
    projectId,
    size,
    target,
  });
  const {
    isListVisible,
    openSidePanel,
    toggleSidePanel,
  } = useReviewSidePanel({
    isFigmaImageManagementEnabled,
  });

  const {
    activeItems,
    hiddenOverlayItemIdList,
    items,
    selectedNumberedItem,
    targetSrc,
  } = useReviewShellData();

  const isCommandKeyPressed = useReviewCommandKey({
    iframeRef,
    targetFrameLoadVersion,
    targetSrc,
  });
  const effectiveHiddenOverlayItemIdList = useMemo(() => {
    if (!isCommandKeyPressed) return hiddenOverlayItemIdList;

    const itemIds = new Set(hiddenOverlayItemIdList);
    activeItems.forEach((item) => itemIds.add(item.id));
    return Array.from(itemIds);
  }, [activeItems, hiddenOverlayItemIdList, isCommandKeyPressed]);
  const {
    isFigmaOverlayAvailable,
    refreshTargetFigmaConfig,
  } = useReviewShellTargetFigma({
    iframeRef,
    isFigmaImageManagementEnabled,
    isViewportFigmaOverlayAvailable,
    targetSrc,
  });

  const {
    cancelReviewMode,
    closePromptModal,
    closeSitemap,
    reloadTargetFrame,
  } = useReviewShellTransientActions({
    controllerRef,
    iframeRef,
    setIsInitialPromptOpen,
    setIsSitemapOpen,
    setMode,
  });

  const requestSourceTreeFocus = useCallback(
    (element: Element) => {
      const state = storeApi.getState();
      state.setSidePanel('source');
      state.setIsListVisible(true);
      state.setSourceTreeFocusRequest(element);
    },
    [storeApi]
  );

  const reviewSettings = useReviewSettings({
    defaultReviewUserId: activeAdapterEntry.defaultUserId,
    onCancelReviewMode: cancelReviewMode,
    onCloseInitialPrompt: closePromptModal,
    onCloseSitemap: closeSitemap,
    onReloadTargetFrame: reloadTargetFrame,
  });
  const {
    closeFigmaSettings,
    isFigmaSettingsOpen,
    openFigmaSettings,
    reviewUserId,
  } = reviewSettings;

  const presenceState = useReviewShellPresenceState({
    activeRoute,
    mode,
    presence,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    selectedNumberedItem,
    size,
    source,
  });

  const closeRulerPanels = useCallback(() => {
    closeSitemap();
    closeFigmaSettings();
  }, [closeFigmaSettings, closeSitemap]);

  const rulerState = useReviewRuler({
    iframeRef,
    ruler,
    size,
    targetSrc,
    onCancelReviewMode: cancelReviewMode,
    onCloseTransientPanels: closeRulerPanels,
  });
  const {
    closeRuler,
    isRulerAvailable,
    isRulerVisible,
    toggleRuler,
  } = rulerState;

  const {
    refreshItems,
    refreshSitemapItems,
  } = useReviewShellRefresh({
    activeAdapterEntry,
    activeRoute,
    adapter,
    isRemoteSource,
    isSitemapOpen,
    localAdapterEntry,
    projectId,
    remoteAdapterEntry,
    storeApi,
  });

  const {
    clearSelectedItem,
    initReviewKit,
    reloadReviewKit,
    restoreReviewItem,
    setControllerReviewMode,
    syncTargetViewport,
    toggleTargetOverlay,
  } = useReviewController({
    hiddenOverlayItemIdList: effectiveHiddenOverlayItemIdList,
    isFigmaOverlayAvailable,
    reviewUserId,
    ruler,
    adjustmentLabel,
    onCancelReviewMode: cancelReviewMode,
    onCloseRuler: closeRuler,
    onItemsRefresh: refreshItems,
  });

  const refreshReviewData = useCallback(() => {
    return refreshReviewDataAction({
      onRefreshItems: refreshItems,
      onRefreshSitemapItems: refreshSitemapItems,
      onReloadReviewKit: reloadReviewKit,
    });
  }, [refreshItems, refreshSitemapItems, reloadReviewKit]);

  const {
    applyTarget,
    changeReviewSource,
    clearSelectedReviewItem,
    getPageTarget,
    selectAllQa,
    selectPage,
  } = useReviewTargetNavigation({
    onCancelReviewMode: cancelReviewMode,
    onClearSelectedItem: clearSelectedItem,
    onReloadTargetFrame: reloadTargetFrame,
    onRestoreReviewItem: restoreReviewItem,
  });

  const setReviewMode = useReviewShellModeSetter({
    closeRuler,
    isListVisible,
    mode,
    openSidePanel,
    setControllerReviewMode,
    writeModes: activeAdapterEntry.writeModes,
  });

  useReviewShellEffects({
    frameScrollRef,
    iframeRef,
    isListVisible,
    items,
    mode,
    pendingInitialItemIdRef,
    restoreReviewItem,
    size,
    syncTargetViewport,
    targetSrc,
  });

  const sourceInspector = useReviewSourceInspector({
    frameScrollRef,
    iframeRef,
    isSourceTreeHoverOutlineEnabled,
    sourceCandidateOptions,
    targetSrc,
    onCancelReviewMode: cancelReviewMode,
    onRequestSourceTreeFocus: requestSourceTreeFocus,
  });
  const {
    bindSourceOpenShortcut,
    clearSourceInspector,
    clearSourceOutlineHover,
    showSourceOutlineForElement,
  } = sourceInspector;

  const {
    toggleFigmaImagesPanel,
    toggleQaPanel,
    toggleSourceTreePanel,
  } = useReviewShellPanelActions({
    isFigmaImageManagementEnabled,
    toggleSidePanel,
  });

  const figmaOverlayState = useReviewShellFigmaOverlay({
    figmaImagesController,
    isFigmaImageManagementEnabled,
    isFigmaOverlayAvailable,
    isTargetFigmaOverlayActive: targetOverlayState.figma,
    onToggleTargetOverlay: toggleTargetOverlay,
  });

  useReviewShellHotkeys({
    isRailHotkeyBlocked:
      isFigmaSettingsOpen ||
      isInitialPromptOpen ||
      isInitialPromptScriptOpen ||
      isSitemapOpen ||
      isItemEditing,
    isFigmaSettingsOpen,
    isFigmaOverlayAvailable: figmaOverlayState.isFigmaOverlayAvailable,
    isRulerAvailable,
    isRulerVisible,
    onCancelReviewMode: cancelReviewMode,
    onCloseFigmaSettings: closeFigmaSettings,
    onCloseRuler: closeRuler,
    onSetReviewMode: setReviewMode,
    onToggleComponentListPanel: toggleSourceTreePanel,
    onToggleFigmaOverlay: figmaOverlayState.toggleFigmaOverlay,
    onToggleFigmaImagesPanel: toggleFigmaImagesPanel,
    onToggleQaPanel: toggleQaPanel,
    onToggleRuler: toggleRuler,
    onToggleTargetOverlay: toggleTargetOverlay,
  });

  const loadTargetFrame = useReviewShellLoadTargetFrame({
    bindSourceOpenShortcut,
    bumpTargetFrameLoadVersion,
    iframeRef,
    initReviewKit,
    mode,
    refreshTargetFigmaConfig,
  });

  const shellActions = useReviewShellActionsValue({
    applyTarget,
    changeReviewSource,
    clearSourceInspector,
    clearSourceOutlineHover,
    clearSelectedReviewItem,
    getPageTarget,
    initReviewKit,
    loadTargetFrame,
    openFigmaSettings,
    refreshReviewData,
    restoreReviewItem,
    selectAllQa,
    selectPage,
    setIsInitialPromptOpen,
    setIsInitialPromptScriptOpen,
    setReviewMode,
    showSourceOutlineForElement,
    toggleFigmaImagesPanel,
    toggleQaPanel,
    toggleSourceTreePanel,
    toggleTargetOverlay,
  });

  return {
    actions: shellActions,
    figmaImages: figmaImagesState,
    figmaOverlay: figmaOverlayState,
    presence: presenceState,
    ruler: rulerState,
    settings: reviewSettings,
    sourceInspector,
  };
};
