import type { StateCreator } from 'zustand';
import { getInitialItemId } from '../route';
import {
  getInitialReviewSidePanel,
  getStoredReviewSidePanel,
  getStoredReviewSidePanelVisible,
  type StoredReviewSidePanel,
} from '../settings';
import type { ReviewShellState } from './create.review.shell.store';

export interface SidePanelSlice {
  sidePanel: StoredReviewSidePanel;
  isListVisible: boolean;
  setSidePanel: (sidePanel: StoredReviewSidePanel) => void;
  setIsListVisible: (isListVisible: boolean) => void;
}

const getInitialSidePanel = (): StoredReviewSidePanel =>
  getInitialReviewSidePanel() ??
  (getInitialItemId() ? 'qa' : getStoredReviewSidePanel());

const getInitialIsListVisible = () =>
  Boolean(getInitialItemId() || getInitialReviewSidePanel()) ||
  getStoredReviewSidePanelVisible();

export const createSidePanelSlice: StateCreator<
  ReviewShellState,
  [],
  [],
  SidePanelSlice
> = (set) => ({
  sidePanel: getInitialSidePanel(),
  isListVisible: getInitialIsListVisible(),
  setSidePanel: (sidePanel) => set({ sidePanel }),
  setIsListVisible: (isListVisible) => set({ isListVisible }),
});
