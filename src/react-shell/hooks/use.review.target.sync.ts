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
import { setTargetScrollbarHidden } from '../target/target';
import type { ReviewShellViewportPreset } from '../types';
import { getViewportPresetKind } from '../viewport';

interface UseReviewTargetSyncOptions {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  reviewPathPrefix: string;
  selectedItemIdRef: MutableRefObject<string | null>;
  size: ReviewShellViewportPreset;
  sizeRef: MutableRefObject<ReviewShellViewportPreset>;
  source: ReviewSource;
  target: string;
  targetRef: MutableRefObject<string>;
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
  sizeRef,
  source,
  target,
  targetRef,
  onActiveRouteChange,
  onClearSelectedItem,
  onDraftTargetChange,
  onSyncTargetViewport,
  onTargetChange,
}: UseReviewTargetSyncOptions) => {
  const syncShellTarget = useCallback(
    (nextTarget: string) => {
      const normalizedTarget = normalizeTarget(nextTarget, reviewPathPrefix);
      const nextRouteKey = getTargetRouteKey(
        normalizedTarget,
        reviewPathPrefix
      );

      if (normalizedTarget !== targetRef.current) {
        onClearSelectedItem();
        targetRef.current = normalizedTarget;
        onTargetChange(normalizedTarget);
        onDraftTargetChange(normalizedTarget);
        onActiveRouteChange(nextRouteKey);
      }

      if (selectedItemIdRef.current) {
        updateShellUrlForItem(
          normalizedTarget,
          sizeRef.current,
          selectedItemIdRef.current,
          source
        );
      } else {
        updateShellUrl(normalizedTarget, sizeRef.current, source);
      }
    },
    [
      onActiveRouteChange,
      onClearSelectedItem,
      onDraftTargetChange,
      onTargetChange,
      reviewPathPrefix,
      selectedItemIdRef,
      sizeRef,
      source,
      targetRef,
    ]
  );

  useEffect(() => {
    targetRef.current = target;
    onActiveRouteChange(getTargetRouteKey(target, reviewPathPrefix));
  }, [onActiveRouteChange, reviewPathPrefix, target, targetRef]);

  useEffect(() => {
    sizeRef.current = size;
    if (selectedItemIdRef.current) {
      updateShellUrlForItem(
        targetRef.current,
        size,
        selectedItemIdRef.current,
        source
      );
    } else {
      updateShellUrl(targetRef.current, size, source);
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
    sizeRef,
    source,
    targetRef,
  ]);

  return {
    syncShellTarget,
  };
};
