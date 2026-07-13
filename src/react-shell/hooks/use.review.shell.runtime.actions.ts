import {
  useCallback,
  type MutableRefObject,
} from 'react';
import type {
  ReviewMode,
  WebReviewKitController,
} from '../../types';
import type { ReviewShellWriteMode } from '../types';
import type { StoredReviewSidePanel } from '../settings';
import { getReviewModeWriteMode } from '../review/shell.helpers';
import { setTargetFigmaOverlayLocked } from '../target/target';

interface UseReviewShellTransientActionsOptions {
  controllerRef: MutableRefObject<WebReviewKitController | null>;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  setIsInitialPromptOpen: (isOpen: boolean) => void;
  setIsSitemapOpen: (isOpen: boolean) => void;
  setMode: (mode: ReviewMode) => void;
}

export const useReviewShellTransientActions = ({
  controllerRef,
  iframeRef,
  setIsInitialPromptOpen,
  setIsSitemapOpen,
  setMode,
}: UseReviewShellTransientActionsOptions) => {
  const cancelReviewMode = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || controller.getMode() === 'idle') return false;

    controller.setMode('idle');
    setMode(controller.getMode());
    return true;
  }, [controllerRef, setMode]);

  const closePromptModal = useCallback(() => {
    setIsInitialPromptOpen(false);
  }, [setIsInitialPromptOpen]);

  const closeSitemap = useCallback(() => {
    setIsSitemapOpen(false);
  }, [setIsSitemapOpen]);

  const reloadTargetFrame = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      return;
    }
  }, [iframeRef]);

  return {
    cancelReviewMode,
    closePromptModal,
    closeSitemap,
    reloadTargetFrame,
  };
};

interface UseReviewShellPanelActionsOptions {
  isFigmaImageManagementEnabled: boolean;
  toggleSidePanel: (sidePanel: StoredReviewSidePanel) => void;
}

export const useReviewShellPanelActions = ({
  isFigmaImageManagementEnabled,
  toggleSidePanel,
}: UseReviewShellPanelActionsOptions) => {
  const toggleQaPanel = useCallback(() => {
    toggleSidePanel('qa');
  }, [toggleSidePanel]);

  const toggleSourceTreePanel = useCallback(() => {
    toggleSidePanel('source');
  }, [toggleSidePanel]);

  const toggleFigmaImagesPanel = useCallback(() => {
    if (!isFigmaImageManagementEnabled) return;

    toggleSidePanel('figma-images');
  }, [
    isFigmaImageManagementEnabled,
    toggleSidePanel,
  ]);

  return {
    toggleFigmaImagesPanel,
    toggleQaPanel,
    toggleSourceTreePanel,
  };
};

interface UseReviewShellModeSetterOptions {
  closeRuler: () => void;
  isListVisible: boolean;
  mode: ReviewMode;
  openSidePanel: (sidePanel: StoredReviewSidePanel) => void;
  setControllerReviewMode: (mode: ReviewMode) => void;
  writeModes: ReviewShellWriteMode[];
}

export const useReviewShellModeSetter = ({
  closeRuler,
  isListVisible,
  mode,
  openSidePanel,
  setControllerReviewMode,
  writeModes,
}: UseReviewShellModeSetterOptions) =>
  useCallback(
    (nextMode: ReviewMode) => {
      const writeMode = getReviewModeWriteMode(nextMode);
      if (writeMode && !writeModes.includes(writeMode)) return;
      closeRuler();
      if (writeMode && mode !== nextMode && !isListVisible) {
        openSidePanel('qa');
      }
      setControllerReviewMode(nextMode);
    },
    [
      closeRuler,
      isListVisible,
      mode,
      openSidePanel,
      setControllerReviewMode,
      writeModes,
    ]
  );

interface UseReviewShellLoadTargetFrameOptions {
  bindSourceOpenShortcut: () => void;
  bumpTargetFrameLoadVersion: () => void;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  initReviewKit: () => void;
  mode: ReviewMode;
  refreshTargetFigmaConfig: () => void;
}

export const useReviewShellLoadTargetFrame = ({
  bindSourceOpenShortcut,
  bumpTargetFrameLoadVersion,
  iframeRef,
  initReviewKit,
  mode,
  refreshTargetFigmaConfig,
}: UseReviewShellLoadTargetFrameOptions) =>
  useCallback(() => {
    bumpTargetFrameLoadVersion();
    initReviewKit();
    refreshTargetFigmaConfig();
    setTargetFigmaOverlayLocked(
      iframeRef.current?.contentDocument,
      mode === 'element'
    );
    bindSourceOpenShortcut();
  }, [
    bindSourceOpenShortcut,
    bumpTargetFrameLoadVersion,
    iframeRef,
    initReviewKit,
    mode,
    refreshTargetFigmaConfig,
  ]);
