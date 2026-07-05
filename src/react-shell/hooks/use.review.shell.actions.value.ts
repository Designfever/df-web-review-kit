// Stable cross-feature command surface. Containers should use this only for
// commands shared across features; local state setters should stay local.
import { useMemo } from 'react';
import type {
  ReviewItem,
  ReviewMode,
  ReviewSource,
} from '../../types';
import type { TargetOverlayKey } from '../types';
import type { ReviewShellActions } from '../store/shell.actions.context';

interface UseReviewShellActionsValueOptions {
  applyTarget: () => Promise<void>;
  changeReviewSource: (nextSource: ReviewSource) => void;
  clearSourceInspector: () => void;
  clearSourceOutlineHover: () => void;
  clearSelectedReviewItem: () => void;
  getPageTarget: (href: string) => string;
  initReviewKit: () => void;
  loadTargetFrame: () => void;
  openFigmaSettings: () => void;
  refreshReviewData: () => Promise<void>;
  restoreReviewItem: (item: ReviewItem) => void;
  selectAllQa: () => void;
  selectPage: (href: string) => void;
  setIsInitialPromptOpen: (isOpen: boolean) => void;
  setIsInitialPromptScriptOpen: (isOpen: boolean) => void;
  setReviewMode: (mode: ReviewMode) => void;
  showSourceOutlineForElement: (element: Element) => void;
  toggleFigmaImagesPanel: () => void;
  toggleQaPanel: () => void;
  toggleSourceTreePanel: () => void;
  toggleTargetOverlay: (key: TargetOverlayKey) => void;
}

export const useReviewShellActionsValue = ({
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
}: UseReviewShellActionsValueOptions): ReviewShellActions =>
  useMemo<ReviewShellActions>(
    () => ({
      applyTarget: () => {
        void applyTarget();
      },
      changeReviewSource,
      clearSourceInspector,
      clearSourceOutlineHover,
      clearSelectedReviewItem,
      getPageTarget,
      initReviewKit,
      loadTargetFrame,
      openAbout: () => setIsInitialPromptOpen(true),
      openInitialPrompt: () => setIsInitialPromptScriptOpen(true),
      openSettings: openFigmaSettings,
      refreshReviewData,
      restoreReviewItem,
      selectAllQa,
      selectPage,
      setReviewMode,
      showSourceOutlineForElement,
      toggleFigmaImagesPanel,
      toggleQaPanel,
      toggleSourceTreePanel,
      toggleTargetOverlay,
    }),
    [
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
    ]
  );
