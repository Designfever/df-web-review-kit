import {
  useEffect,
  type MutableRefObject,
} from 'react';
import type {
  ReviewItem,
  ReviewMode,
} from '../../types';
import { setTargetFigmaOverlayLocked } from '../target/target';
import type { ReviewShellViewportPreset } from '../types';

interface UseReviewShellEffectsOptions {
  frameScrollRef: MutableRefObject<HTMLDivElement | null>;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  isListVisible: boolean;
  items: ReviewItem[];
  mode: ReviewMode;
  pendingInitialItemIdRef: MutableRefObject<string | null>;
  restoreReviewItem: (item: ReviewItem) => void;
  size: ReviewShellViewportPreset;
  syncTargetViewport: () => void;
  targetSrc: string;
}

export const useReviewShellEffects = ({
  frameScrollRef,
  iframeRef,
  isListVisible,
  items,
  mode,
  pendingInitialItemIdRef,
  restoreReviewItem,
  size,
  syncTargetViewport,
  targetSrc,
}: UseReviewShellEffectsOptions) => {
  useEffect(() => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;

    const item = items.find(
      (candidate) =>
        candidate.id === itemId || candidate.externalIssueId === itemId
    );
    if (!item) return;

    restoreReviewItem(item);
  }, [items, pendingInitialItemIdRef, restoreReviewItem]);

  useEffect(() => {
    const frameScroll = frameScrollRef.current;
    if (!frameScroll) return undefined;

    const centerFrameScroll = () => {
      frameScroll.scrollLeft = Math.max(
        0,
        (frameScroll.scrollWidth - frameScroll.clientWidth) / 2
      );
      frameScroll.scrollTop = 0;
      syncTargetViewport();
    };

    const animationFrame = window.requestAnimationFrame(centerFrameScroll);
    const transitionTimeout = window.setTimeout(centerFrameScroll, 180);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(transitionTimeout);
    };
  }, [
    frameScrollRef,
    isListVisible,
    size.height,
    size.width,
    syncTargetViewport,
    targetSrc,
  ]);

  useEffect(() => {
    const targetDocument = iframeRef.current?.contentDocument;
    setTargetFigmaOverlayLocked(targetDocument, mode === 'element');
    return () => {
      setTargetFigmaOverlayLocked(targetDocument, false);
    };
  }, [iframeRef, mode, targetSrc]);
};
