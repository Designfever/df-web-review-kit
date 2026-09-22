import {
  toHostSelection,
  toViewportSelection,
  type ViewportSelection,
} from '../geometry';
import type { AreaDraft, DomDraft } from '../review/draft';
import type { DraftLayerContext } from './types';

const ANNOTATION_COLOR = '#8b5cf6';
const MIN_SIZE = 8;

export function createAreaAnnotationLayer(
  context: DraftLayerContext,
  initialDraft: AreaDraft
) {
  const { config } = context;
  return createAnnotationLayer(context, initialDraft, {
    getDraft: () => config.getState().areaDraft,
    setDraft: (draft) => config.actions.setAreaDraft(draft),
    getSelection: (draft) => {
      const selection = draft.selection?.viewport;
      return selection ? toViewportSelection(selection) : undefined;
    },
  });
}

export function createDomAnnotationLayer(
  context: DraftLayerContext,
  initialDraft: DomDraft,
  getSelection: (draft: DomDraft) => ViewportSelection | undefined
) {
  const { config } = context;
  return createAnnotationLayer(context, initialDraft, {
    getDraft: () => config.getState().domDraft,
    setDraft: (draft) => config.actions.setDomDraft(draft),
    getSelection,
  });
}

type AnnotationDraft = Pick<
  AreaDraft,
  'annotationTool' | 'annotations'
>;

function createAnnotationLayer<T extends AnnotationDraft>(
  context: DraftLayerContext,
  initialDraft: T,
  options: {
    getDraft: () => T | undefined;
    setDraft: (draft: T) => void;
    getSelection: (draft: T) => ViewportSelection | undefined;
  }
) {
  const { config } = context;
  const root = document.createElement('div');
  root.className = 'dfwr-area-annotation-layer';

  const canvas = document.createElement('canvas');
  canvas.className = 'dfwr-area-annotation-canvas';
  canvas.setAttribute('aria-label', 'Draw rectangle annotations');

  const toolbar = document.createElement('div');
  toolbar.className = 'dfwr-area-annotation-toolbar';

  const rectangleButton = document.createElement('button');
  rectangleButton.type = 'button';
  rectangleButton.className = 'dfwr-area-annotation-tool';
  rectangleButton.setAttribute('aria-label', 'Draw rectangle');
  rectangleButton.title = 'Draw rectangle';
  const rectangleIcon = document.createElement('span');
  rectangleIcon.className = 'dfwr-area-annotation-rectangle-icon';
  rectangleButton.append(rectangleIcon);

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'dfwr-area-annotation-clear';
  clearButton.textContent = 'Clear';
  clearButton.setAttribute('aria-label', 'Clear annotations');

  toolbar.append(rectangleButton, clearButton);
  root.append(canvas, toolbar);

  let pointerId: number | undefined;
  let start: { x: number; y: number } | undefined;
  let preview: { x: number; y: number; width: number; height: number } | undefined;

  const getDraft = () => options.getDraft() ?? initialDraft;
  const getSelection = () => options.getSelection(getDraft());
  const getPoint = (event: PointerEvent) => {
    const selection = getSelection();
    const rect = canvas.getBoundingClientRect();
    if (!selection || rect.width <= 0 || rect.height <= 0) return undefined;
    return {
      x: clamp(
        selection.left + ((event.clientX - rect.left) / rect.width) * selection.width,
        selection.left,
        selection.left + selection.width
      ),
      y: clamp(
        selection.top + ((event.clientY - rect.top) / rect.height) * selection.height,
        selection.top,
        selection.top + selection.height
      ),
    };
  };

  const sync = () => {
    if (!root.isConnected) return;
    const environment = config.getEnvironment();
    const selection = getSelection();
    if (!environment || !selection) return;

    const rect = toHostSelection(selection, environment);
    canvas.style.left = `${rect.left}px`;
    canvas.style.top = `${rect.top}px`;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    toolbar.style.left = `${rect.left + rect.width}px`;
    toolbar.style.top = `${Math.max(8, rect.top - 42)}px`;

    const ratio = root.ownerDocument.defaultView?.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const draw = canvas.getContext('2d');
    if (!draw) return;
    draw.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw.clearRect(0, 0, rect.width, rect.height);
    draw.lineWidth = 2;
    draw.strokeStyle = ANNOTATION_COLOR;

    for (const annotation of [
      ...(getDraft().annotations ?? []),
      ...(preview ? [{ kind: 'rectangle' as const, ...preview }] : []),
    ]) {
      draw.strokeRect(
        ((annotation.x - selection.left) / selection.width) * rect.width,
        ((annotation.y - selection.top) / selection.height) * rect.height,
        (annotation.width / selection.width) * rect.width,
        (annotation.height / selection.height) * rect.height
      );
    }

    const active = getDraft().annotationTool === 'rectangle';
    canvas.classList.toggle('is-active', active);
    rectangleButton.classList.toggle('is-active', active);
    rectangleButton.setAttribute('aria-pressed', String(active));
    clearButton.disabled = !getDraft().annotations?.length;
    root.ownerDocument.defaultView?.requestAnimationFrame(sync);
  };

  rectangleButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const draft = getDraft();
    options.setDraft({
      ...draft,
      annotationTool:
        draft.annotationTool === 'rectangle' ? undefined : 'rectangle',
    });
    config.actions.render();
  });

  clearButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const draft = getDraft();
    options.setDraft({ ...draft, annotations: undefined });
    config.actions.render();
  });

  canvas.addEventListener(
    'wheel',
    (event) => {
      if (getDraft().annotationTool !== 'rectangle') return;
      event.preventDefault();
      event.stopPropagation();
    },
    { passive: false }
  );

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || getDraft().annotationTool !== 'rectangle') return;
    const point = getPoint(event);
    if (!point) return;
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
  });

  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId || !start) return;
    const point = getPoint(event);
    if (!point) return;
    event.preventDefault();
    preview = {
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y),
    };
  });

  const finish = (event: PointerEvent, commit = true) => {
    if (event.pointerId !== pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const point = commit && start ? getPoint(event) : undefined;
    if (point && start) {
      preview = {
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        width: Math.abs(point.x - start.x),
        height: Math.abs(point.y - start.y),
      };
    }
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
      return;
    }
    const draft = getDraft();
    options.setDraft({
      ...draft,
      annotations: [
        ...(draft.annotations ?? []),
        { kind: 'rectangle', ...annotation },
      ],
    });
    config.actions.render();
  };

  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', (event) => finish(event, false));
  root.ownerDocument.defaultView?.requestAnimationFrame(sync);
  return root;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
