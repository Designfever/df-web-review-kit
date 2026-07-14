// Shell-level effects that depend on multiple runtime pieces. Keep feature-only
// effects near the feature hook instead of adding them here.
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

const REVIEW_SELECTION_ACTION_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'summary',
  'textarea',
  '[contenteditable="true"]',
  '[data-dfwr-move-entry-id]',
  '[role="button"]',
].join(', ');

const isReviewSelectionAction = (target: EventTarget | null) => {
  const element = target as Element | null;
  return (
    typeof element?.closest === 'function' &&
    Boolean(element.closest(REVIEW_SELECTION_ACTION_SELECTOR))
  );
};

interface UseReviewShellEffectsOptions {
  clearSelectedReviewItem: () => void;
  frameScrollRef: MutableRefObject<HTMLDivElement | null>;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  isListVisible: boolean;
  items: ReviewItem[];
  mode: ReviewMode;
  pendingInitialItemIdRef: MutableRefObject<string | null>;
  restoreReviewItem: (item: ReviewItem) => void;
  selectedItemId: string | null;
  size: ReviewShellViewportPreset;
  syncTargetViewport: () => void;
  targetFrameLoadVersion: number;
  targetSrc: string;
}

export const useReviewShellEffects = ({
  clearSelectedReviewItem,
  frameScrollRef,
  iframeRef,
  isListVisible,
  items,
  mode,
  pendingInitialItemIdRef,
  restoreReviewItem,
  selectedItemId,
  size,
  syncTargetViewport,
  targetFrameLoadVersion,
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

  useEffect(() => {
    if (!selectedItemId) return undefined;

    const frameScroll = frameScrollRef.current;
    let frameDocument: Document | null = null;
    try {
      frameDocument = iframeRef.current?.contentDocument ?? null;
    } catch {
      frameDocument = null;
    }

    const clearOnWorkspacePointerDown = (event: PointerEvent) => {
      if (isReviewSelectionAction(event.target)) return;
      clearSelectedReviewItem();
    };

    frameScroll?.addEventListener(
      'pointerdown',
      clearOnWorkspacePointerDown,
      true
    );
    frameDocument?.addEventListener(
      'pointerdown',
      clearOnWorkspacePointerDown,
      true
    );
    return () => {
      frameScroll?.removeEventListener(
        'pointerdown',
        clearOnWorkspacePointerDown,
        true
      );
      frameDocument?.removeEventListener(
        'pointerdown',
        clearOnWorkspacePointerDown,
        true
      );
    };
  }, [
    clearSelectedReviewItem,
    frameScrollRef,
    iframeRef,
    selectedItemId,
    targetFrameLoadVersion,
  ]);
};
