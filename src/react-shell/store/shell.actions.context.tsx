import {
  createContext,
  useContext,
} from 'react';
import type {
  ReviewItem,
  ReviewMode,
  ReviewSource,
} from '../../types';
import type { TargetOverlayKey } from '../types';

export interface ReviewShellActions {
  applyTarget: () => void;
  changeReviewSource: (nextSource: ReviewSource) => void;
  clearSourceInspector: () => void;
  clearSourceOutlineHover: () => void;
  clearSourceOutlineSelection: () => void;
  clearSelectedReviewItem: () => void;
  getPageTarget: (href: string) => string;
  initReviewKit: () => void;
  loadTargetFrame: () => void;
  openAbout: () => void;
  openInitialPrompt: () => void;
  openSettings: () => void;
  refreshReviewData: () => Promise<void>;
  restoreReviewItem: (item: ReviewItem) => void;
  selectAllQa: () => void;
  selectPage: (href: string) => void;
  selectSourceOutlineForElement: (element: Element) => void;
  setReviewMode: (mode: ReviewMode) => void;
  showSourceOutlineForElement: (element: Element) => void;
  toggleFigmaImagesPanel: () => void;
  toggleQaPanel: () => void;
  toggleSourceTreePanel: () => void;
  toggleTargetOverlay: (key: TargetOverlayKey) => void;
}

const ReviewShellActionsContext = createContext<ReviewShellActions | null>(
  null
);

export const ReviewShellActionsProvider = ReviewShellActionsContext.Provider;

export const useReviewShellActions = (): ReviewShellActions => {
  const actions = useContext(ReviewShellActionsContext);
  if (!actions) {
    throw new Error(
      'useReviewShellActions must be used within a ReviewShell provider'
    );
  }
  return actions;
};
