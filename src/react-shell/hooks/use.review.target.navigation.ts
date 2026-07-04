import {
  useCallback,
  type MutableRefObject,
} from 'react';
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
import type { ReviewShellViewportPreset } from '../types';
import { findViewportPreset } from '../viewport';

interface UseReviewTargetNavigationOptions {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  draftTarget: string;
  reviewPathPrefix: string;
  sizeRef: MutableRefObject<ReviewShellViewportPreset>;
  source: ReviewSource;
  sourceEntries: NormalizedReviewShellAdapter[];
  targetRef: MutableRefObject<string>;
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
  sizeRef,
  source,
  sourceEntries,
  targetRef,
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
    const nextSize =
      parsedInput.width && parsedInput.height
        ? findViewportPreset(
            viewportPresets,
            parsedInput.width,
            parsedInput.height
          )
        : sizeRef.current;
    const nextAdapter =
      sourceEntries.find((entry) => entry.label === nextSource) ??
      activeAdapterEntry;
    const isCurrentTarget =
      targetRef.current === normalizedTarget &&
      source === nextSource &&
      sizeRef.current.width === nextSize.width &&
      sizeRef.current.height === nextSize.height;

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
    targetRef.current = normalizedTarget;
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
    sizeRef,
    source,
    sourceEntries,
    targetRef,
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
      targetRef.current = normalizedTarget;
      onActiveRouteChange(normalizedRoute);
      onDraftTargetChange(normalizedTarget);
      onTargetChange(normalizedTarget);
      updateShellUrl(normalizedTarget, sizeRef.current, source);
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
      sizeRef,
      source,
      targetRef,
    ]
  );

  const selectAllQa = useCallback(() => {
    onAllQaVisibleChange(true);
    onSitemapOpenChange(false);
  }, [onAllQaVisibleChange, onSitemapOpenChange]);

  const clearSelectedReviewItem = useCallback(() => {
    onClearSelectedItem();
    updateShellUrl(targetRef.current, sizeRef.current, source);
  }, [onClearSelectedItem, sizeRef, source, targetRef]);

  const changeReviewSource = useCallback(
    (nextSource: ReviewSource) => {
      if (!sourceEntries.some((entry) => entry.label === nextSource)) return;

      onCancelReviewMode();
      onClearSelectedItem();
      onClearItems();
      onSourceChange(nextSource);
      updateShellUrl(targetRef.current, sizeRef.current, nextSource);
    },
    [
      onCancelReviewMode,
      onClearItems,
      onClearSelectedItem,
      onSourceChange,
      sizeRef,
      sourceEntries,
      targetRef,
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
