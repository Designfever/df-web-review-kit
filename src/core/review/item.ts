import type {
  DomAnchor,
  RelativeSelection,
  ReviewItem,
  ReviewItemScope,
  ReviewMarker,
  ReviewSelection,
} from '../../types';
import {
  getElementViewportSelection,
  getRelativePoint,
  resolveAnchorElement,
} from '../dom.anchor';
import {
  isRelativeSelection,
  isSelectionInViewport,
  roundPoint,
  toViewportSelection,
  type ReviewEnvironment,
  type ViewportSelection,
} from '../geometry';

/** Rendering mode used by marker and highlight overlays. */
export type ReviewItemHighlightMode = 'area' | 'dom';

/** Target-space highlight rectangle plus whether it was rebound to an anchor. */
export interface ReviewItemHighlightSelection {
  viewport: ViewportSelection;
  isBound: boolean;
}

/** Resolves a review marker to its current viewport point, with scroll fallback. */
export function getBoundMarkerPoint(
  item: ReviewItem,
  environment: ReviewEnvironment
) {
  const marker = getItemMarker(item);
  if (!marker) return undefined;

  // Prefer anchor-relative positions because absolute viewport points drift after layout changes.
  if (item.anchor && marker.relative) {
    const resolved = resolveAnchorElement(item.anchor, environment);
    const element = resolved?.element;

    if (element) {
      const rect = element.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: roundPoint({
            x: rect.left + rect.width * marker.relative.x,
            y: rect.top + rect.height * marker.relative.y,
          }),
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector,
        };
      }
    }
  }

  const sourceScroll = item.scroll ?? { x: 0, y: 0 };

  return {
    viewport: roundPoint({
      x: marker.viewport.x + sourceScroll.x - environment.window.scrollX,
      y: marker.viewport.y + sourceScroll.y - environment.window.scrollY,
    }),
    isBound: false,
    confidence: 0,
  };
}

/** Chooses the best visible highlight selection for the current target viewport. */
export function getItemHighlightSelection(
  item: ReviewItem,
  environment: ReviewEnvironment
): ReviewItemHighlightSelection | undefined {
  if (item.kind === 'area') {
    return getVisibleHighlightSelection(
      [
        getBoundSelection(item, environment),
        getPointHighlightSelection(item, environment),
      ],
      environment
    );
  }

  if (isDomReviewItem(item)) {
    return getVisibleHighlightSelection(
      [
        getAnchorHighlightSelection(item, environment),
        getBoundSelection(item, environment),
        getPointHighlightSelection(item, environment),
      ],
      environment
    );
  }

  return undefined;
}

/** Maps an item to its overlay visual treatment. */
export function getReviewItemHighlightMode(
  item: ReviewItem
): ReviewItemHighlightMode {
  if (isDomReviewItem(item)) return 'dom';
  return 'area';
}

/** Returns an explicit marker or derives one from the item's selection origin. */
export function getItemMarker(item: ReviewItem): ReviewMarker | undefined {
  if (item.marker) return item.marker;

  const selection = getItemSelection(item);
  if (!selection?.viewport) return undefined;

  return {
    viewport: roundPoint({
      x: selection.viewport.x,
      y: selection.viewport.y,
    }),
    relative: selection.relative
      ? roundPoint({
          x: selection.relative.x,
          y: selection.relative.y,
        })
      : undefined,
  };
}

/** Normalizes current and legacy selection shapes into ReviewSelection. */
export function getItemSelection(item: ReviewItem): ReviewSelection | undefined {
  const value = item.selection as
    | ReviewSelection
    | RelativeSelection
    | undefined;
  if (!value) return undefined;

  if ('viewport' in value && isRelativeSelection(value.viewport)) {
    return value;
  }

  if (isRelativeSelection(value)) {
    return {
      viewport: value,
    };
  }

  return undefined;
}

/** Filters markers to the active viewport scope. */
export function shouldShowMarkerForScope(
  scope: ReviewItemScope,
  currentScope: ReviewItemScope
) {
  return scope === currentScope;
}

/** Creates a marker at the selection origin and stores an anchor-relative fallback. */
export function createSelectionStartMarker(
  selection: ViewportSelection,
  anchor: DomAnchor | undefined,
  environment: ReviewEnvironment
): ReviewMarker {
  const startPoint = {
    x: selection.left,
    y: selection.top,
  };

  return {
    viewport: roundPoint(startPoint),
    relative: anchor
      ? getRelativePoint(startPoint, anchor, environment)
      : undefined,
  };
}

function getBoundSelection(item: ReviewItem, environment: ReviewEnvironment) {
  const selection = getItemSelection(item);
  if (!selection?.viewport) return undefined;

  // Rebuild the rectangle from the anchor when possible, then fall back to scroll offset.
  if (item.anchor && selection.relative) {
    const resolved = resolveAnchorElement(item.anchor, environment);
    const element = resolved?.element;

    if (element) {
      const rect = element.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: {
            left: rect.left + rect.width * selection.relative.x,
            top: rect.top + rect.height * selection.relative.y,
            width: rect.width * selection.relative.width,
            height: rect.height * selection.relative.height,
          },
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector,
        };
      }
    }
  }

  const sourceScroll = item.scroll ?? { x: 0, y: 0 };
  const viewportSelection = toViewportSelection(selection.viewport);

  return {
    viewport: {
      left: viewportSelection.left + sourceScroll.x - environment.window.scrollX,
      top: viewportSelection.top + sourceScroll.y - environment.window.scrollY,
      width: viewportSelection.width,
      height: viewportSelection.height,
    },
    isBound: item.kind === 'area',
    confidence: 0,
  };
}

function getAnchorHighlightSelection(
  item: ReviewItem,
  environment: ReviewEnvironment
): ReviewItemHighlightSelection | undefined {
  if (!item.anchor) return undefined;

  const viewport = getElementViewportSelection(item.anchor, environment);
  if (!viewport) return undefined;

  return {
    viewport,
    isBound: true,
  };
}

function getPointHighlightSelection(
  item: ReviewItem,
  environment: ReviewEnvironment
): ReviewItemHighlightSelection | undefined {
  const point = getBoundMarkerPoint(item, environment);
  if (!point) return undefined;

  const size = 16;
  return {
    viewport: {
      left: point.viewport.x - size / 2,
      top: point.viewport.y - size / 2,
      width: size,
      height: size,
    },
    isBound: point.isBound,
  };
}

function getVisibleHighlightSelection(
  candidates: Array<ReviewItemHighlightSelection | undefined>,
  environment: ReviewEnvironment
): ReviewItemHighlightSelection | undefined {
  // Candidate order encodes item-type priority; this only discards offscreen options.
  return candidates.find(
    (candidate): candidate is ReviewItemHighlightSelection =>
      Boolean(candidate && isSelectionInViewport(candidate.viewport, environment))
  );
}

function isDomReviewItem(item: ReviewItem) {
  return item.kind === 'dom' || item.scope === 'dom';
}
