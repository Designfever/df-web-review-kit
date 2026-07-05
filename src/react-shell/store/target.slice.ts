import type { StateCreator } from 'zustand';
import type { ReviewSource } from '../../types';
import {
  getInitialSource,
  getInitialTarget,
  getTargetRouteKey,
} from '../route';
import type {
  ReviewShellViewportPreset,
  TargetOverlayState,
} from '../types';
import { getInitialSize } from '../viewport';
import type { ReviewShellConfig } from './shell.config';
import type { ReviewShellState } from './create.review.shell.store';

export interface TargetSliceState {
  activeRoute: string;
  draftTarget: string;
  size: ReviewShellViewportPreset;
  source: ReviewSource;
  target: string;
  targetOverlayState: TargetOverlayState;
}

export interface TargetSlice extends TargetSliceState {
  setActiveRoute: (activeRoute: string) => void;
  setDraftTarget: (draftTarget: string) => void;
  setSize: (size: ReviewShellViewportPreset) => void;
  setSource: (source: ReviewSource) => void;
  setTarget: (target: string) => void;
  setTargetOverlayState: (targetOverlayState: TargetOverlayState) => void;
}

export const getInitialTargetSliceState = (
  config: ReviewShellConfig
): TargetSliceState => {
  const defaultSource = config.sourceEntries[0]?.label ?? 'local';
  const initialSource = getInitialSource(config.remoteAdapterEntry?.label);
  const source = config.sourceEntries.some(
    (entry) => entry.label === initialSource
  )
    ? initialSource
    : defaultSource;
  const target = getInitialTarget(config.reviewPathPrefix);

  return {
    activeRoute: getTargetRouteKey(target, config.reviewPathPrefix),
    draftTarget: target,
    size: getInitialSize(config.viewportPresets),
    source,
    target,
    targetOverlayState: {
      grid: false,
      figma: false,
    },
  };
};

export const createTargetSlice = (
  initialState: TargetSliceState
): StateCreator<ReviewShellState, [], [], TargetSlice> => (set) => ({
  ...initialState,
  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setDraftTarget: (draftTarget) => set({ draftTarget }),
  setSize: (size) => set({ size }),
  setSource: (source) => set({ source }),
  setTarget: (target) => set({ target }),
  setTargetOverlayState: (targetOverlayState) => set({ targetOverlayState }),
});
