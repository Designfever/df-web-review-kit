import {
  useCallback,
  type MutableRefObject,
  type RefObject,
} from 'react';
import type {
  ReviewItem,
  ReviewSource,
  WebReviewKitAdapter,
  WebReviewKitController,
} from '../../types';
import {
  getReviewItemRestoreScrollPosition,
  queryReviewItemAnchorElement,
  setDocumentScrollInstantly,
} from '../anchor.restore';
import {
  getItemFrameTarget,
  getItemTarget,
  updateShellUrlForItem,
} from '../route';
import type { ReviewShellViewportPreset } from '../types';
import { getRestoredSize } from '../viewport';

interface UseReviewItemRestoreOptions {
  adapter: WebReviewKitAdapter;
  controllerRef: MutableRefObject<WebReviewKitController | null>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  pendingInitialItemIdRef: MutableRefObject<string | null>;
  pendingRestoreRef: MutableRefObject<ReviewItem | null>;
  reviewPathPrefix: string;
  selectedItemIdRef: MutableRefObject<string | null>;
  source: ReviewSource;
  targetRef: MutableRefObject<string>;
  viewportPresets: ReviewShellViewportPreset[];
  onActiveRouteChange: (target: string) => void;
  onDraftTargetChange: (target: string) => void;
  onSelectedItemIdChange: (itemId: string | null) => void;
  onSizeChange: (size: ReviewShellViewportPreset) => void;
  onSyncTargetViewport: () => void;
  onTargetChange: (target: string) => void;
}

function runWithAutoScrollBehavior(
  targetDocument: Document | undefined,
  callback: () => void
) {
  const elements = [
    targetDocument?.documentElement,
    targetDocument?.body,
  ].filter((element): element is HTMLElement => Boolean(element));
  const previousValues = elements.map((element) => element.style.scrollBehavior);

  elements.forEach((element) => {
    element.style.scrollBehavior = 'auto';
  });

  try {
    callback();
  } finally {
    elements.forEach((element, index) => {
      element.style.scrollBehavior = previousValues[index] ?? '';
    });
  }
}

const RESTORE_WAIT_MAX_MS = 2600;
const RESTORE_STABLE_FRAME_COUNT = 2;
const RESTORE_SCROLL_RECHECK_DELAYS_MS = [120, 360] as const;

const waitForNextAnimationFrame = (targetWindow: Window) =>
  new Promise<void>((resolve) => {
    targetWindow.requestAnimationFrame(() => resolve());
  });

const waitForTargetTimeout = (targetWindow: Window, ms: number) =>
  new Promise<void>((resolve) => {
    targetWindow.setTimeout(resolve, ms);
  });

const getRestoreLayoutSnapshot = (
  targetDocument: Document,
  anchorElement?: Element
) => {
  const root = targetDocument.documentElement;
  const body = targetDocument.body;
  const anchorRect = anchorElement?.getBoundingClientRect();

  return [
    root.scrollWidth,
    root.scrollHeight,
    body?.scrollWidth ?? 0,
    body?.scrollHeight ?? 0,
    anchorRect ? Math.round(anchorRect.left) : -1,
    anchorRect ? Math.round(anchorRect.top) : -1,
    anchorRect ? Math.round(anchorRect.width) : -1,
    anchorRect ? Math.round(anchorRect.height) : -1,
  ].join(':');
};

const waitForRestoreAnchor = async (
  targetWindow: Window,
  targetDocument: Document,
  item: ReviewItem,
  isCurrent: () => boolean
) => {
  const startedAt = targetWindow.performance.now();
  let previousSnapshot = '';
  let stableFrameCount = 0;

  while (
    isCurrent() &&
    targetWindow.performance.now() - startedAt < RESTORE_WAIT_MAX_MS
  ) {
    const anchorElement = queryReviewItemAnchorElement(targetDocument, item);
    const snapshot = getRestoreLayoutSnapshot(targetDocument, anchorElement);
    const canRestore = item.anchor ? Boolean(anchorElement) : true;

    if (snapshot === previousSnapshot) {
      stableFrameCount += 1;
    } else {
      stableFrameCount = 0;
    }

    if (canRestore && stableFrameCount >= RESTORE_STABLE_FRAME_COUNT) {
      return anchorElement;
    }

    previousSnapshot = snapshot;
    await waitForNextAnimationFrame(targetWindow);
  }

  return queryReviewItemAnchorElement(targetDocument, item);
};

export const useReviewItemRestore = ({
  adapter,
  controllerRef,
  iframeRef,
  pendingInitialItemIdRef,
  pendingRestoreRef,
  reviewPathPrefix,
  selectedItemIdRef,
  source,
  targetRef,
  viewportPresets,
  onActiveRouteChange,
  onDraftTargetChange,
  onSelectedItemIdChange,
  onSizeChange,
  onSyncTargetViewport,
  onTargetChange,
}: UseReviewItemRestoreOptions) => {
  const clearSelectedItem = useCallback(() => {
    pendingRestoreRef.current = null;
    selectedItemIdRef.current = null;
    onSelectedItemIdChange(null);
    controllerRef.current?.highlightItem(undefined);
  }, [
    controllerRef,
    onSelectedItemIdChange,
    pendingRestoreRef,
    selectedItemIdRef,
  ]);

  const applyItemScroll = useCallback(
    async (item: ReviewItem) => {
      if (selectedItemIdRef.current !== item.id) return false;

      const targetWindow = iframeRef.current?.contentWindow;
      const targetDocument = iframeRef.current?.contentDocument;
      if (!targetWindow || !targetDocument) return false;

      const isCurrentRestore = () =>
        selectedItemIdRef.current === item.id &&
        iframeRef.current?.contentDocument === targetDocument;
      const anchorElement = await waitForRestoreAnchor(
        targetWindow,
        targetDocument,
        item,
        isCurrentRestore
      );
      if (!isCurrentRestore()) return false;

      const applyScrollPosition = () => {
        if (!isCurrentRestore()) return false;
        const currentAnchorElement =
          queryReviewItemAnchorElement(targetDocument, item) ?? anchorElement;

        runWithAutoScrollBehavior(targetDocument, () => {
          setDocumentScrollInstantly(
            targetWindow,
            targetDocument,
            getReviewItemRestoreScrollPosition(
              targetWindow,
              targetDocument,
              item,
              currentAnchorElement
            )
          );
        });
        onSyncTargetViewport();
        return true;
      };

      if (!applyScrollPosition()) return false;
      controllerRef.current?.highlightItem(item.id);

      for (const delay of RESTORE_SCROLL_RECHECK_DELAYS_MS) {
        await waitForTargetTimeout(targetWindow, delay);
        if (!applyScrollPosition()) return false;
        controllerRef.current?.highlightItem(item.id);
      }

      return true;
    },
    [controllerRef, iframeRef, onSyncTargetViewport, selectedItemIdRef]
  );

  const applyPendingRestore = useCallback(() => {
    const item = pendingRestoreRef.current;
    if (!item) return;

    void applyItemScroll(item).then((didApply) => {
      if (didApply && pendingRestoreRef.current?.id === item.id) {
        pendingRestoreRef.current = null;
      }
    });
  }, [applyItemScroll, pendingRestoreRef]);

  const restoreReviewItem = useCallback(
    (item: ReviewItem) => {
      const nextRoute = getItemTarget(item, reviewPathPrefix);
      const nextTarget = getItemFrameTarget(item, reviewPathPrefix);
      const nextSize = getRestoredSize(item, viewportPresets);

      pendingInitialItemIdRef.current = null;
      pendingRestoreRef.current = item;
      selectedItemIdRef.current = item.id;
      onSelectedItemIdChange(item.id);
      onActiveRouteChange(nextRoute);
      onDraftTargetChange(nextTarget);
      onSizeChange(nextSize);
      updateShellUrlForItem(nextTarget, nextSize, item.id, source);

      if (targetRef.current !== nextTarget) {
        onTargetChange(nextTarget);
        return;
      }

      applyPendingRestore();
    },
    [
      applyPendingRestore,
      onActiveRouteChange,
      onDraftTargetChange,
      onSelectedItemIdChange,
      onSizeChange,
      onTargetChange,
      pendingRestoreRef,
      pendingInitialItemIdRef,
      reviewPathPrefix,
      selectedItemIdRef,
      source,
      targetRef,
      viewportPresets,
    ]
  );

  const restoreInitialItem = useCallback(async () => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;

    try {
      const item = await adapter.get(itemId);
      if (item && pendingInitialItemIdRef.current === itemId) {
        restoreReviewItem(item);
      }
    } catch {
      /* retry when the list response arrives */
    }
  }, [adapter, pendingInitialItemIdRef, restoreReviewItem]);

  return {
    applyPendingRestore,
    clearSelectedItem,
    restoreInitialItem,
    restoreReviewItem,
  };
};
