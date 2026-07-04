// 리뷰 대상 선택용 전면 레이어 두 종류.
// - element layer: hover 로 DOM 요소를 하이라이트하고 클릭으로 draft 를 바인딩
// - area layer: 드래그로 사각형 영역을 선택해 area draft 를 시작
import type { ReviewPoint } from '../../types';
import {
  getDomAnchorFromPoint,
  getElementViewportSelection,
} from '../dom.anchor';
import {
  clampPoint,
  placeLayerOverTarget,
  toHostPoint,
  toHostSelection,
  toTargetPointFromHostEvent,
  type ViewportSelection,
} from '../geometry';
import type { WebReviewKitViewConfig } from './types';

/** Element-pick layer: hover highlight + click-to-bind for DOM QA drafts. */
export function createElementLayer(config: WebReviewKitViewConfig) {
  const layer = document.createElement('div');
  layer.className = 'dfwr-element-layer';
  const environment = config.getEnvironment();
  const hover = document.createElement('div');
  hover.className = 'dfwr-dom-hover';
  hover.hidden = true;
  layer.append(hover);

  if (environment) {
    placeLayerOverTarget(layer, environment);
  }

  const updateHover = (point: ReviewPoint) => {
    // 스크롤/리사이즈로 environment 가 바뀔 수 있어 매번 다시 읽는다.
    const nextEnvironment = config.getEnvironment();
    if (!nextEnvironment) return;

    const anchor = getDomAnchorFromPoint(
      clampPoint(point, nextEnvironment),
      config.options.anchors?.attribute,
      nextEnvironment
    );
    const selection = anchor
      ? getElementViewportSelection(anchor, nextEnvironment)
      : undefined;

    if (!selection) {
      hover.hidden = true;
      return;
    }

    const rect = toHostSelection(selection, nextEnvironment);
    hover.hidden = false;
    hover.style.left = `${rect.left}px`;
    hover.style.top = `${rect.top}px`;
    hover.style.width = `${rect.width}px`;
    hover.style.height = `${rect.height}px`;
  };

  layer.addEventListener('pointermove', (event) => {
    updateHover(toTargetPointFromHostEvent(event, config.getEnvironment()));
  });

  layer.addEventListener('pointerleave', () => {
    hover.hidden = true;
  });

  layer.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    void config.actions.bindElementDraftToPoint(
      toTargetPointFromHostEvent(event, config.getEnvironment())
    );
  });

  return layer;
}

/** Area-select layer: drag a rectangle, then hand it off as an area draft. */
export function createAreaLayer(config: WebReviewKitViewConfig) {
  const layer = document.createElement('div');
  layer.className = 'dfwr-area-layer';
  const environment = config.getEnvironment();

  if (environment) {
    placeLayerOverTarget(layer, environment);
  }

  const box = document.createElement('div');
  box.className = 'dfwr-area-box';
  layer.append(box);

  let startX = 0;
  let startY = 0;
  let selection: ViewportSelection | undefined;
  let activePointerId: number | undefined;
  let isDragging = false;
  // iframe 안에서 렌더될 수 있어 layer 가 속한 window 의 이벤트를 쓴다.
  const ownerWindow = layer.ownerDocument.defaultView ?? window;

  const updateBox = (event: PointerEvent) => {
    const nextEnvironment = config.getEnvironment();
    const nextPoint = toTargetPointFromHostEvent(event, nextEnvironment);
    const left = Math.min(startX, nextPoint.x);
    const top = Math.min(startY, nextPoint.y);
    const width = Math.abs(nextPoint.x - startX);
    const height = Math.abs(nextPoint.y - startY);
    const hostPoint = toHostPoint({ x: left, y: top }, nextEnvironment);

    selection = { left, top, width, height };
    box.style.left = `${hostPoint.x}px`;
    box.style.top = `${hostPoint.y}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
  };

  // pointer capture 가 끊기는 환경(iframe 리플로우 등)에 대비해
  // window 레벨 리스너를 드래그 동안에만 추가로 건다.
  const addDragListeners = () => {
    ownerWindow.addEventListener('pointermove', handlePointerMove, true);
    ownerWindow.addEventListener('pointerup', handlePointerUp, true);
    ownerWindow.addEventListener('pointercancel', handlePointerCancel, true);
  };

  const removeDragListeners = () => {
    ownerWindow.removeEventListener('pointermove', handlePointerMove, true);
    ownerWindow.removeEventListener('pointerup', handlePointerUp, true);
    ownerWindow.removeEventListener(
      'pointercancel',
      handlePointerCancel,
      true
    );
  };

  const releasePointerCapture = (event: PointerEvent) => {
    try {
      if (layer.hasPointerCapture(event.pointerId)) {
        layer.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture can be gone when the iframe/overlay reflows mid-drag.
    }
  };

  function isActivePointer(event: PointerEvent) {
    return isDragging && event.pointerId === activePointerId;
  }

  const finishAreaSelection = (event: PointerEvent) => {
    if (!isActivePointer(event)) return;

    event.preventDefault();
    updateBox(event);
    releasePointerCapture(event);
    removeDragListeners();
    isDragging = false;
    activePointerId = undefined;

    // 실수로 스친 드래그(8px 미만)는 무시한다.
    if (!selection || selection.width < 8 || selection.height < 8) return;

    config.actions.setSelectingArea(true);
    config.actions.render();
    void config.actions.createAreaDraft(selection);
  };

  function handlePointerMove(event: PointerEvent) {
    if (!isActivePointer(event)) return;

    event.preventDefault();
    updateBox(event);
  }

  const handlePointerUp = (event: PointerEvent) => {
    finishAreaSelection(event);
  };

  const handlePointerCancel = (event: PointerEvent) => {
    if (!isActivePointer(event)) return;

    releasePointerCapture(event);
    removeDragListeners();
    isDragging = false;
    activePointerId = undefined;
  };

  layer.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;

    event.preventDefault();
    activePointerId = event.pointerId;
    isDragging = true;

    try {
      layer.setPointerCapture(event.pointerId);
    } catch {
      // Continue with window-level listeners when capture is unavailable.
    }

    const startPoint = toTargetPointFromHostEvent(
      event,
      config.getEnvironment()
    );
    startX = startPoint.x;
    startY = startPoint.y;
    updateBox(event);
    addDragListeners();
  });

  layer.addEventListener('pointermove', handlePointerMove);
  layer.addEventListener('pointerup', handlePointerUp);
  layer.addEventListener('pointercancel', handlePointerCancel);

  return layer;
}
