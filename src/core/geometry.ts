import type {
  RelativeSelection,
  ReviewPoint,
  ViewportSize,
} from '../types';

/** Rectangle expressed in the target viewport coordinate space. */
export interface ViewportSelection {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Same-origin target document plus its placement inside the host shell. */
export interface ReviewEnvironment {
  window: Window;
  document: Document;
  viewportRect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  overlayRect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

/** Returns true when two viewport rectangles overlap. */
export function rectanglesIntersect(
  a: ViewportSelection,
  b: ViewportSelection
) {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

/** Converts a point into a 1x1 selection for shared selection handling. */
export function getPointSelection(point: ReviewPoint): ViewportSelection {
  return {
    left: point.x,
    top: point.y,
    width: 1,
    height: 1,
  };
}

/** Converts public API selection fields into internal viewport rectangle fields. */
export function toViewportSelection(
  selection: RelativeSelection
): ViewportSelection {
  return {
    left: selection.x,
    top: selection.y,
    width: selection.width,
    height: selection.height,
  };
}

/** Rounds an internal viewport rectangle back to the public selection shape. */
export function toPublicSelection(
  selection: ViewportSelection
): RelativeSelection {
  return {
    x: Math.round(selection.left),
    y: Math.round(selection.top),
    width: Math.round(selection.width),
    height: Math.round(selection.height),
  };
}

/** Finds the center point of either internal or public selection shapes. */
export function getSelectionCenter(
  selection: ViewportSelection | RelativeSelection
): ReviewPoint {
  if ('left' in selection) {
    return {
      x: selection.left + selection.width / 2,
      y: selection.top + selection.height / 2,
    };
  }

  return {
    x: selection.x + selection.width / 2,
    y: selection.y + selection.height / 2,
  };
}

/** Runtime guard for legacy and current persisted selection values. */
export function isRelativeSelection(value: unknown): value is RelativeSelection {
  if (!value || typeof value !== 'object') return false;

  const selection = value as Partial<RelativeSelection>;
  return (
    typeof selection.x === 'number' &&
    typeof selection.y === 'number' &&
    typeof selection.width === 'number' &&
    typeof selection.height === 'number'
  );
}

/** Reads the active target viewport size, falling back to the host window. */
export function getViewportSize(
  environment?: ReviewEnvironment
): ViewportSize {
  const targetWindow = environment?.window ?? window;
  return {
    width: targetWindow.innerWidth,
    height: targetWindow.innerHeight,
  };
}

/** Returns whether a target-space point is currently visible in the target viewport. */
export function isPointInViewport(
  point: ReviewPoint,
  environment?: ReviewEnvironment
) {
  const viewport = getViewportSize(environment);
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x <= viewport.width &&
    point.y <= viewport.height
  );
}

/** Returns whether any part of a target-space selection is visible. */
export function isSelectionInViewport(
  selection: ViewportSelection,
  environment?: ReviewEnvironment
) {
  const viewport = getViewportSize(environment);
  return rectanglesIntersect(selection, {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height,
  });
}

/** Clamps a target-space point to the visible target viewport. */
export function clampPoint(
  point: ReviewPoint,
  environment?: ReviewEnvironment
) {
  const viewport = getViewportSize(environment);
  return {
    x: clamp(point.x, 0, viewport.width),
    y: clamp(point.y, 0, viewport.height),
  };
}

/** Places a popover inside the current overlay bounds near a host-space point. */
export function getPopoverPosition(
  point: ReviewPoint,
  environment?: ReviewEnvironment,
  options?: {
    width?: number;
    estimatedHeight?: number;
    offset?: number;
  }
) {
  const bounds = getPopoverBounds(environment);
  const margin = 12;
  const width = Math.min(
    options?.width ?? 320,
    Math.max(240, bounds.width - margin * 2)
  );
  const estimatedHeight = options?.estimatedHeight ?? 178;
  const offset = options?.offset ?? 12;

  return {
    left: clamp(
      point.x + offset,
      bounds.left + margin,
      bounds.left + bounds.width - width - margin
    ),
    top: clamp(
      point.y + offset,
      bounds.top + margin,
      bounds.top + bounds.height - estimatedHeight - margin
    ),
  };
}

/** Places the area draft popover near the selected area edge. */
export function getAreaPopoverPosition(
  selection: ViewportSelection,
  environment: ReviewEnvironment
) {
  return getPopoverPosition(
    {
      x: selection.left + selection.width,
      y: selection.top,
    },
    environment,
    {
      width: 360,
      estimatedHeight: 206,
    }
  );
}

/** Uses overlay bounds when embedded in a shell, otherwise the host viewport. */
export function getPopoverBounds(environment?: ReviewEnvironment) {
  if (!environment) {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  return environment.overlayRect;
}

/** Converts a target-space point to the host shell coordinate space. */
export function toHostPoint(
  point: ReviewPoint,
  environment?: ReviewEnvironment
) {
  if (!environment) return point;

  return {
    x: point.x + environment.viewportRect.left,
    y: point.y + environment.viewportRect.top,
  };
}

/** Converts a target-space rectangle to the host shell coordinate space. */
export function toHostSelection(
  selection: ViewportSelection,
  environment: ReviewEnvironment
): ViewportSelection {
  return {
    left: selection.left + environment.viewportRect.left,
    top: selection.top + environment.viewportRect.top,
    width: selection.width,
    height: selection.height,
  };
}

/** Converts a host-space point back into target viewport coordinates. */
export function toTargetPoint(
  point: ReviewPoint,
  environment?: ReviewEnvironment
) {
  if (!environment) return point;

  return {
    x: point.x - environment.viewportRect.left,
    y: point.y - environment.viewportRect.top,
  };
}

/** Extracts a host pointer event position as a target-space point. */
export function toTargetPointFromHostEvent(
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
  environment?: ReviewEnvironment
) {
  return toTargetPoint(
    {
      x: event.clientX,
      y: event.clientY,
    },
    environment
  );
}

/** Sizes and positions an overlay layer to cover the target viewport in host space. */
export function placeLayerOverTarget(
  layer: HTMLElement,
  environment: ReviewEnvironment
) {
  layer.style.left = `${environment.viewportRect.left}px`;
  layer.style.top = `${environment.viewportRect.top}px`;
  layer.style.width = `${environment.viewportRect.width}px`;
  layer.style.height = `${environment.viewportRect.height}px`;
  layer.style.right = 'auto';
  layer.style.bottom = 'auto';
}

/** Clamps a value even when max is smaller than min. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/** Keeps persisted relative coordinates stable without excessive precision. */
export function roundRatio(value: number) {
  return Math.round(value * 10000) / 10000;
}

/** Rounds a point to pixel coordinates for persisted review data. */
export function roundPoint(point: ReviewPoint): ReviewPoint {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}
