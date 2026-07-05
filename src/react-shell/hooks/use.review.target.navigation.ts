import { useCallback } from 'react';
import type {
  ReviewItem,
  ReviewSource,
} from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import {
  getTargetRouteKey,
  normalizeTarget,
  parseReviewAddressInput,
  updateShellUrl,
} from '../route';
import { useReviewShellStoreApi } from '../store/store.context';
import type { ReviewShellViewportPreset } from '../types';
import { findViewportPreset } from '../viewport';

interface UseReviewTargetNavigationOptions {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  draftTarget: string;
  reviewPathPrefix: string;
  source: ReviewSource;
  sourceEntries: NormalizedReviewShellAdapter[];
  viewportPresets: ReviewShellViewportPreset[];
  onActiveRouteChange: (routeKey: string) => void;
  onAllQaVisibleChange: (isVisible: boolean) => void;
  onCancelReviewMode: () => boolean;
  onClearItems: () => void;
  onClearSelectedItem: () => void;
  onDraftTargetChange: (target: string) => void;
  onReloadTargetFrame: () => void;
  onRestoreReviewItem: (item: ReviewItem) => void;
  onSitemapOpenChange: (isOpen: boolean) => void;
  onSizeChange: (size: ReviewShellViewportPreset) => void;
  onSourceChange: (source: ReviewSource) => void;
  onTargetChange: (target: string) => void;
}

export const useReviewTargetNavigation = ({
  activeAdapterEntry,
  draftTarget,
  reviewPathPrefix,
  source,
  sourceEntries,
  viewportPresets,
  onActiveRouteChange,
  onAllQaVisibleChange,
  onCancelReviewMode,
  onClearItems,
  onClearSelectedItem,
  onDraftTargetChange,
  onReloadTargetFrame,
  onRestoreReviewItem,
  onSitemapOpenChange,
  onSizeChange,
  onSourceChange,
  onTargetChange,
}: UseReviewTargetNavigationOptions) => {
  const storeApi = useReviewShellStoreApi();
  const getPageTarget = useCallback(
    (href: string) => normalizeTarget(href, reviewPathPrefix),
    [reviewPathPrefix]
  );

  const applyTarget = useCallback(async () => {
    const parsedInput = parseReviewAddressInput(draftTarget, reviewPathPrefix);
    const normalizedTarget = parsedInput.target;
    const normalizedRoute = getTargetRouteKey(
      normalizedTarget,
      reviewPathPrefix
    );
    const nextSource =
      parsedInput.source &&
      sourceEntries.some((entry) => entry.label === parsedInput.source)
        ? parsedInput.source
        : source;
    const currentSize = storeApi.getState().size;
    const nextSize =
      parsedInput.width && parsedInput.height
        ? findViewportPreset(
            viewportPresets,
            parsedInput.width,
            parsedInput.height
          )
        : currentSize;
    const nextAdapter =
      sourceEntries.find((entry) => entry.label === nextSource) ??
      activeAdapterEntry;
    const isCurrentTarget =
      storeApi.getState().target === normalizedTarget &&
      source === nextSource &&
      currentSize.width === nextSize.width &&
      currentSize.height === nextSize.height;

    if (parsedInput.itemId) {
      const item = await nextAdapter.adapter.get(parsedInput.itemId);
      if (item) {
        onAllQaVisibleChange(false);
        onSourceChange(nextSource);
        onRestoreReviewItem(item);
        return;
      }
    }

    onClearSelectedItem();
    onAllQaVisibleChange(false);
    onSourceChange(nextSource);
    onActiveRouteChange(normalizedRoute);
    onDraftTargetChange(normalizedTarget);
    onSizeChange(nextSize);
    onTargetChange(normalizedTarget);
    updateShellUrl(normalizedTarget, nextSize, nextSource);
    if (isCurrentTarget) onReloadTargetFrame();
  }, [
    activeAdapterEntry,
    draftTarget,
    onActiveRouteChange,
    onAllQaVisibleChange,
    onClearSelectedItem,
    onDraftTargetChange,
    onReloadTargetFrame,
    onRestoreReviewItem,
    onSizeChange,
    onSourceChange,
    onTargetChange,
    reviewPathPrefix,
    source,
    sourceEntries,
    storeApi,
    viewportPresets,
  ]);

  const selectPage = useCallback(
    (href: string) => {
      const normalizedTarget = getPageTarget(href);
      const normalizedRoute = getTargetRouteKey(
        normalizedTarget,
        reviewPathPrefix
      );
      onClearSelectedItem();
      onAllQaVisibleChange(false);
      onActiveRouteChange(normalizedRoute);
      onDraftTargetChange(normalizedTarget);
      onTargetChange(normalizedTarget);
      updateShellUrl(normalizedTarget, storeApi.getState().size, source);
      onSitemapOpenChange(false);
    },
    [
      getPageTarget,
      onActiveRouteChange,
      onAllQaVisibleChange,
      onClearSelectedItem,
      onDraftTargetChange,
      onSitemapOpenChange,
      onTargetChange,
      reviewPathPrefix,
      source,
      storeApi,
    ]
  );

  const selectAllQa = useCallback(() => {
    onAllQaVisibleChange(true);
    onSitemapOpenChange(false);
  }, [onAllQaVisibleChange, onSitemapOpenChange]);

  const clearSelectedReviewItem = useCallback(() => {
    onClearSelectedItem();
    const state = storeApi.getState();
    updateShellUrl(state.target, state.size, source);
  }, [onClearSelectedItem, source, storeApi]);

  const changeReviewSource = useCallback(
    (nextSource: ReviewSource) => {
      if (!sourceEntries.some((entry) => entry.label === nextSource)) return;

      onCancelReviewMode();
      onClearSelectedItem();
      onClearItems();
      onSourceChange(nextSource);
      const state = storeApi.getState();
      updateShellUrl(state.target, state.size, nextSource);
    },
    [
      onCancelReviewMode,
      onClearItems,
      onClearSelectedItem,
      onSourceChange,
      sourceEntries,
      storeApi,
    ]
  );

  return {
    applyTarget,
    changeReviewSource,
    clearSelectedReviewItem,
    getPageTarget,
    selectAllQa,
    selectPage,
  };
};
