import { useCallback } from 'react';
import type {
  ReviewItem,
  ReviewSource,
} from '../../types';
import {
  getTargetRouteKey,
  normalizeTarget,
  parseReviewAddressInput,
  updateShellUrl,
} from '../route';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellStoreApi } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import { findViewportPreset } from '../viewport';

interface UseReviewTargetNavigationOptions {
  onCancelReviewMode: () => boolean;
  onClearSelectedItem: () => void;
  onReloadTargetFrame: () => void;
  onRestoreReviewItem: (item: ReviewItem) => void;
}

export const useReviewTargetNavigation = ({
  onCancelReviewMode,
  onClearSelectedItem,
  onReloadTargetFrame,
  onRestoreReviewItem,
}: UseReviewTargetNavigationOptions) => {
  const { reviewPathPrefix, viewportPresets } = useReviewShellConfig();
  const { activeAdapterEntry, source, sourceEntries } =
    useReviewShellAdapterState();
  const storeApi = useReviewShellStoreApi();
  const getPageTarget = useCallback(
    (href: string) => normalizeTarget(href, reviewPathPrefix),
    [reviewPathPrefix]
  );

  const applyTarget = useCallback(async () => {
    const state = storeApi.getState();
    const parsedInput = parseReviewAddressInput(
      state.draftTarget,
      reviewPathPrefix
    );
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
    const currentSize = state.size;
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
      state.target === normalizedTarget &&
      source === nextSource &&
      currentSize.width === nextSize.width &&
      currentSize.height === nextSize.height;
    const shouldNavigateFrame =
      state.target !== normalizedTarget ||
      state.frameTarget !== normalizedTarget;

    if (parsedInput.itemId) {
      const item = await nextAdapter.adapter.get(parsedInput.itemId);
      if (item) {
        state.setIsAllQaVisible(false);
        state.setSource(nextSource);
        onRestoreReviewItem(item);
        return;
      }
    }

    onClearSelectedItem();
    state.setIsAllQaVisible(false);
    state.setSource(nextSource);
    state.setActiveRoute(normalizedRoute);
    state.setDraftTarget(normalizedTarget);
    state.setSize(nextSize);
    state.setTarget(normalizedTarget);
    if (shouldNavigateFrame) {
      state.navigateFrameTarget(normalizedTarget);
    }
    updateShellUrl(normalizedTarget, nextSize, nextSource);
    if (isCurrentTarget && !shouldNavigateFrame) onReloadTargetFrame();
  }, [
    activeAdapterEntry,
    onClearSelectedItem,
    onReloadTargetFrame,
    onRestoreReviewItem,
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
      const state = storeApi.getState();
      const shouldNavigateFrame =
        state.target !== normalizedTarget ||
        state.frameTarget !== normalizedTarget;
      state.setIsAllQaVisible(false);
      state.setActiveRoute(normalizedRoute);
      state.setDraftTarget(normalizedTarget);
      state.setTarget(normalizedTarget);
      if (shouldNavigateFrame) {
        state.navigateFrameTarget(normalizedTarget);
      }
      updateShellUrl(normalizedTarget, state.size, source);
      state.setIsSitemapOpen(false);
    },
    [
      getPageTarget,
      onClearSelectedItem,
      reviewPathPrefix,
      source,
      storeApi,
    ]
  );

  const selectAllQa = useCallback(() => {
    const state = storeApi.getState();
    state.setIsAllQaVisible(true);
    state.setIsSitemapOpen(false);
  }, [storeApi]);

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
      const state = storeApi.getState();
      state.setItems([]);
      state.setSource(nextSource);
      updateShellUrl(state.target, state.size, nextSource);
    },
    [onCancelReviewMode, onClearSelectedItem, sourceEntries, storeApi]
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
