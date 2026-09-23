import type {
  ReviewItem,
  ReviewPoint,
  ReviewRectangleAnnotation,
} from '../../types';
import { getAdjustedDraftSelection } from '../draft.metrics';
import {
  getViewportSize,
  toHostSelection,
  toTargetPoint,
  toViewportSelection,
  type ViewportSelection,
} from '../geometry';
import {
  getItemHighlightSelection,
  shouldShowMarkerForScope,
} from '../review/item';
import {
  getReviewItemScope,
  getReviewViewportScope,
} from '../review/scope';
import type { AreaDraft, DomDraft } from '../review/draft';
import type { DraftLayerContext, WebReviewKitViewConfig } from './types';

const FRAME_INTERVAL = 1000 / 30;
const ANNOTATION_COLOR = '#8b5cf6';
const AREA_COLOR = '#63d7c7';
const DOM_COLOR = '#ff8f61';
const DRAFT_COLOR = '#7cc7ff';
const MIN_SIZE = 8;

type AnnotationDraft = AreaDraft | DomDraft;

interface ActiveDraftScene {
  draft: AnnotationDraft;
  selection: ViewportSelection;
  setDraft: (draft: AnnotationDraft) => void;
}

/** One viewport-sized Canvas for review selections and annotations. */
export function createReviewCanvas(context: DraftLayerContext) {
  const { config } = context;
  const canvas = document.createElement('canvas');
  canvas.className = 'dfwr-review-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let lastFrame = 0;
  let pointerId: number | undefined;
  let start: ReviewPoint | undefined;
  let preview:
    | { x: number; y: number; width: number; height: number }
    | undefined;

  const paint = () => {
    if (!config.getState().isOpen) return;

    const environment = config.getEnvironment();
    const window = canvas.ownerDocument.defaultView;
    if (!environment || !window) return;

    const viewport = environment.viewportRect;
    const width = Math.max(1, viewport.width);
    const height = Math.max(1, viewport.height);
    canvas.style.left = `${viewport.left}px`;
    canvas.style.top = `${viewport.top}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ratio = window.devicePixelRatio || 1;
    const pixelWidth = Math.max(1, Math.round(width * ratio));
    const pixelHeight = Math.max(1, Math.round(height * ratio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    const draw = canvas.getContext('2d');
    if (!draw) return;
    draw.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw.clearRect(0, 0, width, height);

    drawStoredItems(draw, config);

    const active = getActiveDraftScene(config);
    canvas.classList.toggle(
      'is-drawing',
      active?.draft.annotationTool === 'rectangle'
    );
    if (!active) return;

    drawSelection(
      draw,
      toCanvasSelection(active.selection, environment),
      DRAFT_COLOR
    );
    drawAnnotations(draw, environment, [
      ...(active.draft.annotations ?? []),
      ...(preview ? [{ kind: 'rectangle' as const, ...preview }] : []),
    ]);
  };

  const paintEvent = () => {
    paint();
    const window = canvas.ownerDocument.defaultView;
    if (window) lastFrame = window.performance.now();
  };

  const render = (time: number) => {
    if (!canvas.isConnected) return;
    if (!config.getState().isOpen) return;
    canvas.ownerDocument.defaultView?.requestAnimationFrame(render);
    if (time - lastFrame < FRAME_INTERVAL) return;
    lastFrame = time;
    paint();
  };

  canvas.addEventListener('pointerdown', (event) => {
    const active = getActiveDraftScene(config);
    const environment = config.getEnvironment();
    if (
      event.button !== 0 ||
      active?.draft.annotationTool !== 'rectangle' ||
      !environment
    ) {
      return;
    }
    const point = toTargetPoint(
      { x: event.clientX, y: event.clientY },
      environment
    );
    if (!isPointInSelection(point, active.selection)) return;

    event.preventDefault();
    event.stopPropagation();
    pointerId = event.pointerId;
    start = point;
    preview = { x: point.x, y: point.y, width: 0, height: 0 };
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is optional in older embedded browsers.
    }
    paintEvent();
  });

  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId || !start) return;
    const active = getActiveDraftScene(config);
    const environment = config.getEnvironment();
    if (!active || !environment) return;
    event.preventDefault();
    preview = createRectangle(
      start,
      clampPointToSelection(
        toTargetPoint({ x: event.clientX, y: event.clientY }, environment),
        active.selection
      )
    );
    paintEvent();
  });

  const finish = (event: PointerEvent, commit = true) => {
    if (event.pointerId !== pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture can already be released when the viewport changes.
    }
    const annotation = preview;
    pointerId = undefined;
    start = undefined;
    preview = undefined;
    if (
      !commit ||
      !annotation ||
      annotation.width < MIN_SIZE ||
      annotation.height < MIN_SIZE
    ) {
      paintEvent();
      return;
    }

    const active = getActiveDraftScene(config);
    if (!active) return;
    active.setDraft({
      ...active.draft,
      annotations: [
        ...(active.draft.annotations ?? []),
        { kind: 'rectangle', ...annotation },
      ],
    });
    config.actions.render();
  };

  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', (event) => finish(event, false));
  paint();
  canvas.ownerDocument.defaultView?.requestAnimationFrame(render);
  return canvas;
}

function drawStoredItems(
  draw: CanvasRenderingContext2D,
  config: WebReviewKitViewConfig
) {
  const environment = config.getEnvironment();
  if (!environment) return;
  const state = config.getState();
  const presets = config.options.viewports?.presets;
  const currentScope = getReviewViewportScope(
    getViewportSize(environment),
    presets
  );
  const item = state.items.find(({ id }) => id === state.highlightedItemId);
  if (!item) return;
  if (!shouldShowMarkerForScope(getReviewItemScope(item, presets), currentScope)) {
    return;
  }
  const selection = getItemHighlightSelection(item, environment);
  if (!selection) return;
  drawSelection(
    draw,
    toCanvasSelection(selection.viewport, environment),
    item.kind === 'area' ? AREA_COLOR : DOM_COLOR
  );
  drawAnnotations(
    draw,
    environment,
    getStoredItemAnnotations(item, selection.viewport)
  );
}

function getStoredItemAnnotations(
  item: ReviewItem,
  currentSelection: ViewportSelection
) {
  const annotations =
    item.annotations ??
    [...(item.attachments ?? [])]
      .reverse()
      .find((attachment) =>
        isRectangleAnnotationList(attachment.metadata?.annotations)
      )?.metadata?.annotations;
  if (!isRectangleAnnotationList(annotations)) return [];

  const originalSelection = item.selection?.viewport;
  const deltaX = originalSelection
    ? currentSelection.left - originalSelection.x
    : 0;
  const deltaY = originalSelection
    ? currentSelection.top - originalSelection.y
    : 0;

  return annotations.map((annotation) => ({
    ...annotation,
    x: annotation.x + deltaX,
    y: annotation.y + deltaY,
  }));
}

function isRectangleAnnotationList(
  value: unknown
): value is ReviewRectangleAnnotation[] {
  return (
    Array.isArray(value) &&
    value.every(
      (annotation) =>
        annotation !== null &&
        typeof annotation === 'object' &&
        (annotation as ReviewRectangleAnnotation).kind === 'rectangle' &&
        ['x', 'y', 'width', 'height'].every(
          (key) =>
            typeof (annotation as unknown as Record<string, unknown>)[key] ===
            'number'
        )
    )
  );
}

function drawSelection(
  draw: CanvasRenderingContext2D,
  selection: ViewportSelection,
  color: string
) {
  draw.save();
  draw.lineWidth = 3;
  draw.strokeStyle = color;
  draw.fillStyle = `${color}20`;
  draw.fillRect(
    selection.left,
    selection.top,
    selection.width,
    selection.height
  );
  draw.strokeRect(
    selection.left,
    selection.top,
    selection.width,
    selection.height
  );
  draw.restore();
}

function drawAnnotations(
  draw: CanvasRenderingContext2D,
  environment: NonNullable<ReturnType<WebReviewKitViewConfig['getEnvironment']>>,
  annotations: NonNullable<AnnotationDraft['annotations']>
) {
  draw.save();
  draw.lineWidth = 2;
  draw.strokeStyle = ANNOTATION_COLOR;
  draw.shadowColor = 'rgba(0, 0, 0, 0.9)';
  draw.shadowBlur = 4;
  draw.shadowOffsetY = 2;
  for (const annotation of annotations) {
    const canvasSelection = toCanvasSelection(
      {
        left: annotation.x,
        top: annotation.y,
        width: annotation.width,
        height: annotation.height,
      },
      environment
    );
    draw.strokeRect(
      canvasSelection.left,
      canvasSelection.top,
      canvasSelection.width,
      canvasSelection.height
    );
  }
  draw.restore();
}

function toCanvasSelection(
  selection: ViewportSelection,
  environment: NonNullable<ReturnType<WebReviewKitViewConfig['getEnvironment']>>
) {
  const host = toHostSelection(selection, environment);
  return {
    ...host,
    left: host.left - environment.viewportRect.left,
    top: host.top - environment.viewportRect.top,
  };
}

function getActiveDraftScene(
  config: WebReviewKitViewConfig
): ActiveDraftScene | undefined {
  const state = config.getState();
  if (state.mode === 'area' && state.areaDraft?.selection) {
    return {
      draft: state.areaDraft,
      selection: toViewportSelection(state.areaDraft.selection.viewport),
      setDraft: (draft) => config.actions.setAreaDraft(draft as AreaDraft),
    };
  }
  if (
    state.mode !== 'element' ||
    !state.domDraft?.selection ||
    state.domDraft.isSelectionOnly
  ) {
    return undefined;
  }
  const draft = state.domDraft;
  const selection = toViewportSelection(state.domDraft.selection.viewport);
  return {
    draft,
    selection: getAdjustedDraftSelection(
      selection,
      draft,
      config.options.viewports?.presets
    ),
    setDraft: (nextDraft) =>
      config.actions.setDomDraft(nextDraft as DomDraft),
  };
}

function createRectangle(start: ReviewPoint, end: ReviewPoint) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

function clampPointToSelection(
  point: ReviewPoint,
  selection: ViewportSelection
) {
  return {
    x: clamp(point.x, selection.left, selection.left + selection.width),
    y: clamp(point.y, selection.top, selection.top + selection.height),
  };
}

function isPointInSelection(point: ReviewPoint, selection: ViewportSelection) {
  return (
    point.x >= selection.left &&
    point.x <= selection.left + selection.width &&
    point.y >= selection.top &&
    point.y <= selection.top + selection.height
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
