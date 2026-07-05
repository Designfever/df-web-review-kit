import {
  useCallback,
  useEffect,
  type RefObject,
} from 'react';
import type { ReviewSource } from '../../types';
import {
  getTargetRouteKey,
  normalizeTarget,
  updateShellUrl,
  updateShellUrlForItem,
} from '../route';
import { useReviewShellStoreApi } from '../store/store.context';
import { setTargetScrollbarHidden } from '../target/target';
import type { ReviewShellViewportPreset } from '../types';
import { getViewportPresetKind } from '../viewport';

interface UseReviewTargetSyncOptions {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  reviewPathPrefix: string;
  size: ReviewShellViewportPreset;
  source: ReviewSource;
  target: string;
  onActiveRouteChange: (target: string) => void;
  onClearSelectedItem: () => void;
  onDraftTargetChange: (target: string) => void;
  onSyncTargetViewport: () => void;
  onTargetChange: (target: string) => void;
}

export const useReviewTargetSync = ({
  iframeRef,
  reviewPathPrefix,
  size,
  source,
  target,
  onActiveRouteChange,
  onClearSelectedItem,
  onDraftTargetChange,
  onSyncTargetViewport,
  onTargetChange,
}: UseReviewTargetSyncOptions) => {
  const storeApi = useReviewShellStoreApi();
  const syncShellTarget = useCallback(
    (nextTarget: string) => {
      const normalizedTarget = normalizeTarget(nextTarget, reviewPathPrefix);
      const nextRouteKey = getTargetRouteKey(
        normalizedTarget,
        reviewPathPrefix
      );

      if (normalizedTarget !== storeApi.getState().target) {
        onClearSelectedItem();
        onTargetChange(normalizedTarget);
        onDraftTargetChange(normalizedTarget);
        onActiveRouteChange(nextRouteKey);
      }

      const { size: currentSize, selectedItemId } = storeApi.getState();
      if (selectedItemId) {
        updateShellUrlForItem(
          normalizedTarget,
          currentSize,
          selectedItemId,
          source
        );
      } else {
        updateShellUrl(normalizedTarget, currentSize, source);
      }
    },
    [
      onActiveRouteChange,
      onClearSelectedItem,
      onDraftTargetChange,
      onTargetChange,
      reviewPathPrefix,
      source,
      storeApi,
    ]
  );

  useEffect(() => {
    onActiveRouteChange(getTargetRouteKey(target, reviewPathPrefix));
  }, [onActiveRouteChange, reviewPathPrefix, target]);

  useEffect(() => {
    const { target: currentTarget, selectedItemId } = storeApi.getState();
    if (selectedItemId) {
      updateShellUrlForItem(currentTarget, size, selectedItemId, source);
    } else {
      updateShellUrl(currentTarget, size, source);
    }
    onSyncTargetViewport();
    setTargetScrollbarHidden(
      iframeRef.current?.contentDocument,
      getViewportPresetKind(size) === 'mobile'
    );
  }, [
    iframeRef,
    onSyncTargetViewport,
    size,
    source,
    storeApi,
  ]);

  return {
    syncShellTarget,
  };
};
