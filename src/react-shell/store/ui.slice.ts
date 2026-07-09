import type { SetStateAction } from 'react';
import type { StateCreator } from 'zustand';
import type { ReviewMode } from '../../types';
import type { ReviewShellState } from './create.review.shell.store';

export interface UiSlice {
  isInitialPromptOpen: boolean;
  isInitialPromptScriptOpen: boolean;
  isSitemapOpen: boolean;
  mode: ReviewMode;
  sourceTreeFocusRequest: SourceTreeFocusRequest | null;
  targetFrameLoadVersion: number;
  toastMessage: string;
  bumpTargetFrameLoadVersion: () => void;
  setIsInitialPromptOpen: (value: SetStateAction<boolean>) => void;
  setIsInitialPromptScriptOpen: (value: SetStateAction<boolean>) => void;
  setIsSitemapOpen: (value: SetStateAction<boolean>) => void;
  setMode: (mode: ReviewMode) => void;
  setSourceTreeFocusRequest: (element: Element | null) => void;
  setToastMessage: (value: SetStateAction<string>) => void;
}

type SourceTreeFocusRequest = {
  element: Element;
  version: number;
};

const resolveSetStateAction = <T,>(value: SetStateAction<T>, current: T): T =>
  typeof value === 'function'
    ? (value as (currentValue: T) => T)(current)
    : value;

export const createUiSlice: StateCreator<
  ReviewShellState,
  [],
  [],
  UiSlice
> = (set) => ({
  isInitialPromptOpen: false,
  isInitialPromptScriptOpen: false,
  isSitemapOpen: false,
  mode: 'idle',
  sourceTreeFocusRequest: null,
  targetFrameLoadVersion: 0,
  toastMessage: '',
  bumpTargetFrameLoadVersion: () =>
    set((state) => ({
      targetFrameLoadVersion: state.targetFrameLoadVersion + 1,
    })),
  setIsInitialPromptOpen: (value) =>
    set((state) => ({
      isInitialPromptOpen: resolveSetStateAction(
        value,
        state.isInitialPromptOpen
      ),
    })),
  setIsInitialPromptScriptOpen: (value) =>
    set((state) => ({
      isInitialPromptScriptOpen: resolveSetStateAction(
        value,
        state.isInitialPromptScriptOpen
      ),
    })),
  setIsSitemapOpen: (value) =>
    set((state) => ({
      isSitemapOpen: resolveSetStateAction(value, state.isSitemapOpen),
    })),
  setMode: (mode) => set({ mode }),
  setSourceTreeFocusRequest: (element) =>
    set((state) => ({
      sourceTreeFocusRequest: element
        ? {
            element,
            version: (state.sourceTreeFocusRequest?.version ?? 0) + 1,
          }
        : null,
    })),
  setToastMessage: (value) =>
    set((state) => ({
      toastMessage: resolveSetStateAction(value, state.toastMessage),
    })),
});
