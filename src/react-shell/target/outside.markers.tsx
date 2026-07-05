import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  getBoundMarkerPoint,
  getItemHighlightSelection,
  shouldShowMarkerForScope,
} from '../../core/review/item';
import {
  getNumberedReviewItems,
  getReviewViewportScope,
} from '../../core/review/scope';
import {
  isPointInViewport,
  toHostPoint,
  type ReviewEnvironment,
} from '../../core/geometry';
import type {
  NumberedReviewItem,
  ReviewItem,
} from '../../types';
import { useReviewShellData } from '../hooks/use.review.shell.data';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellRefs } from '../store/shell.refs';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellStore } from '../store/store.context';

interface OutsideMarker {
  item: ReviewItem;
  label: string;
  scope: NumberedReviewItem['scope'];
  top: number;
}

const OUTSIDE_MARKER_HEIGHT = 22;

const createTargetEnvironment = (
  iframe: HTMLIFrameElement | null
): ReviewEnvironment | undefined => {
  const targetWindow = iframe?.contentWindow;
  const targetDocument = iframe?.contentDocument;
  if (!iframe || !targetWindow || !targetDocument) return undefined;
  const rect = iframe.getBoundingClientRect();
  const scaleX =
    targetWindow.innerWidth > 0 ? rect.width / targetWindow.innerWidth : 1;
  const scaleY =
    targetWindow.innerHeight > 0 ? rect.height / targetWindow.innerHeight : 1;

  return {
    window: targetWindow,
    document: targetDocument,
    viewportRect: {
      left: 0,
      top: 0,
      width: rect.width,
      height: rect.height,
    },
    scaleX,
    scaleY,
    overlayRect: {
      left: 0,
      top: 0,
      width: rect.width,
      height: rect.height,
    },
  };
};

const getOutsideMarkerTop = (
  item: ReviewItem,
  environment: ReviewEnvironment
) => {
  const selection = getItemHighlightSelection(item, environment);
  if (selection) return selection.viewport.top;

  const point = getBoundMarkerPoint(item, environment);
  if (!point || !isPointInViewport(point.viewport, environment)) {
    return undefined;
  }
  return point.viewport.y;
};

export const ReviewOutsideMarkers = () => {
  const { reviewViewportPresets } = useReviewShellConfig();
  const { frameScrollRef, iframeRef } = useReviewShellRefs();
  const { restoreReviewItem } = useReviewShellActions();
  const {
    activeItems,
    hiddenOverlayItemIdList,
  } = useReviewShellData();
  const size = useReviewShellStore((state) => state.size);
  const selectedItemId = useReviewShellStore((state) => state.selectedItemId);
  const targetFrameLoadVersion = useReviewShellStore(
    (state) => state.targetFrameLoadVersion
  );
  const setIsListVisible = useReviewShellStore(
    (state) => state.setIsListVisible
  );
  const setSidePanel = useReviewShellStore((state) => state.setSidePanel);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const frameUpdateRef = useRef<number | null>(null);

  useEffect(() => {
    const targetWindow = iframeRef.current?.contentWindow;
    const frameScroll = frameScrollRef.current;
    if (!targetWindow) return undefined;

    const scheduleUpdate = () => {
      if (frameUpdateRef.current !== null) {
        targetWindow.cancelAnimationFrame(frameUpdateRef.current);
      }
      frameUpdateRef.current = targetWindow.requestAnimationFrame(() => {
        frameUpdateRef.current = null;
        setLayoutVersion((version) => version + 1);
      });
    };

    targetWindow.addEventListener('scroll', scheduleUpdate, { passive: true });
    targetWindow.addEventListener('resize', scheduleUpdate);
    frameScroll?.addEventListener('scroll', scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      if (frameUpdateRef.current !== null) {
        targetWindow.cancelAnimationFrame(frameUpdateRef.current);
        frameUpdateRef.current = null;
      }
      targetWindow.removeEventListener('scroll', scheduleUpdate);
      targetWindow.removeEventListener('resize', scheduleUpdate);
      frameScroll?.removeEventListener('scroll', scheduleUpdate);
    };
  }, [frameScrollRef, iframeRef, targetFrameLoadVersion]);

  const markers = useMemo<OutsideMarker[]>(() => {
    const environment = createTargetEnvironment(iframeRef.current);
    if (!environment) return [];

    const hiddenItemIds = new Set(hiddenOverlayItemIdList);
    const currentScope = getReviewViewportScope(size, reviewViewportPresets);

    return getNumberedReviewItems(activeItems, reviewViewportPresets).flatMap(
      (numberedItem) => {
        const { item, scope, displayLabel } = numberedItem;
        if (hiddenItemIds.has(item.id)) return [];
        if (!shouldShowMarkerForScope(scope, currentScope)) return [];

        const top = getOutsideMarkerTop(item, environment);
        if (typeof top !== 'number') return [];
        const hostTop = toHostPoint({ x: 0, y: top }, environment).y;

        return {
          item,
          label: displayLabel,
          scope,
          top: Math.max(
            0,
            Math.min(
              environment.viewportRect.height - OUTSIDE_MARKER_HEIGHT,
              hostTop
            )
          ),
        };
      }
    );
  }, [
    activeItems,
    hiddenOverlayItemIdList,
    iframeRef,
    layoutVersion,
    reviewViewportPresets,
    size,
  ]);

  if (markers.length === 0) return null;

  return (
    <div className="df-review-outside-marker-layer" aria-label="QA markers">
      {markers.map((marker) => (
        <button
          key={marker.item.id}
          aria-label={`Focus ${marker.label}`}
          className={`df-review-outside-marker is-scope-${marker.scope}${
            marker.item.id === selectedItemId ? ' is-active' : ''
          }`}
          style={{ top: `${marker.top}px` }}
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setSidePanel('qa');
            setIsListVisible(true);
            restoreReviewItem(marker.item);
          }}
        >
          {marker.label}
        </button>
      ))}
    </div>
  );
};
