import {
  useCallback,
  useEffect,
  type MutableRefObject,
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
  selectedItemIdRef: MutableRefObject<string | null>;
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
  selectedItemIdRef,
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

      const currentSize = storeApi.getState().size;
      if (selectedItemIdRef.current) {
        updateShellUrlForItem(
          normalizedTarget,
          currentSize,
          selectedItemIdRef.current,
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
      selectedItemIdRef,
      source,
      storeApi,
    ]
  );

  useEffect(() => {
    onActiveRouteChange(getTargetRouteKey(target, reviewPathPrefix));
  }, [onActiveRouteChange, reviewPathPrefix, target]);

  useEffect(() => {
    if (selectedItemIdRef.current) {
      updateShellUrlForItem(
        storeApi.getState().target,
        size,
        selectedItemIdRef.current,
        source
      );
    } else {
      updateShellUrl(storeApi.getState().target, size, source);
    }
    onSyncTargetViewport();
    setTargetScrollbarHidden(
      iframeRef.current?.contentDocument,
      getViewportPresetKind(size) === 'mobile'
    );
  }, [
    iframeRef,
    onSyncTargetViewport,
    selectedItemIdRef,
    size,
    source,
    storeApi,
  ]);

  return {
    syncShellTarget,
  };
};
