import type { StateCreator } from 'zustand';
import { getInitialItemId } from '../route';
import {
  getInitialReviewSidePanel,
  getStoredReviewSidePanel,
  getStoredReviewSidePanelVisible,
  type StoredReviewSidePanel,
} from '../settings';
import type { ReviewShellState } from './create.review.shell.store';

export type ReviewSidePanel = StoredReviewSidePanel | `custom:${string}`;

export const isBuiltInSidePanel = (panel: ReviewSidePanel): panel is StoredReviewSidePanel =>
  !panel.startsWith('custom:');

export interface SidePanelSlice {
  sidePanel: ReviewSidePanel;
  isListVisible: boolean;
  designInspectorMode: 'pick' | 'browse';
  setDesignInspectorMode: (mode: 'pick' | 'browse') => void;
  setSidePanel: (sidePanel: ReviewSidePanel) => void;
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
  designInspectorMode: 'pick',
  setDesignInspectorMode: (designInspectorMode) => set({ designInspectorMode }),
  setSidePanel: (sidePanel) => set({ sidePanel }),
  setIsListVisible: (isListVisible) => set({ isListVisible }),
});
