// Draft composer(플로팅 코멘트 폼)의 크기/위치 계산과 드래그 이동 와이어링.
// composer 는 오버레이 안이 아니라 호스트 문서 기준으로 배치되므로
// overlayRect 와 호스트 뷰포트 두 좌표계를 함께 다룬다.
import type { ReviewPoint } from '../../types';
import {
  clamp,
  type ReviewEnvironment,
  type ViewportSelection,
} from '../geometry';

const COMPOSER_MARGIN = 12;

/** Composer width adapts to the overlay but stays in a readable 240–360px band. */
function getDraftComposerWidth(environment: ReviewEnvironment) {
  const bounds = environment.overlayRect;
  return Math.min(360, Math.max(240, bounds.width - COMPOSER_MARGIN * 2));
}

/** Host document bounds used when the composer may float outside the overlay. */
function getHostComposerBounds() {
  const root = document.documentElement;
  return {
    left: 0,
    top: 0,
    width: root.clientWidth || window.innerWidth,
    height: root.clientHeight || window.innerHeight,
  };
}

/** Clamps a composer position so the whole form stays inside the given bounds. */
function getClampedComposerPosition(
  position: ReviewPoint,
  environment: ReviewEnvironment,
  size?: { width?: number; height?: number },
  bounds = environment.overlayRect
) {
  const width = size?.width ?? getDraftComposerWidth(environment);
  const height = size?.height ?? 236;

  return {
    x: clamp(
      position.x,
      bounds.left + COMPOSER_MARGIN,
      bounds.left + bounds.width - width - COMPOSER_MARGIN
    ),
    y: clamp(
      position.y,
      bounds.top + COMPOSER_MARGIN,
      bounds.top + bounds.height - height - COMPOSER_MARGIN
    ),
  };
}

/**
 * Picks the first-open position: to the right of the selection when there is
 * room, otherwise to the left, always clamped to the host viewport.
 */
function getInitialDraftComposerPosition(
  selection: ViewportSelection | undefined,
  environment: ReviewEnvironment,
  size: { width: number; height?: number }
) {
  const bounds = getHostComposerBounds();
  const gap = 20;

  if (!selection) {
    return getClampedComposerPosition(
      {
        x: environment.overlayRect.left + COMPOSER_MARGIN,
        y: environment.overlayRect.top + COMPOSER_MARGIN,
      },
      environment,
      size,
      bounds
    );
  }

  const preferredX = selection.left + selection.width + gap;
  const maxX = bounds.left + bounds.width - size.width - COMPOSER_MARGIN;
  const x =
    preferredX <= maxX ? preferredX : selection.left - size.width - gap;

  return getClampedComposerPosition(
    {
      x,
      y: selection.top,
    },
    environment,
    size,
    bounds
  );
}

/** Resolves the final composer placement, honoring a user-dragged position. */
export function getDraftComposerPosition({
  selection,
  environment,
  composerPosition,
  estimatedHeight,
}: {
  selection?: ViewportSelection;
  environment: ReviewEnvironment;
  composerPosition?: ReviewPoint;
  estimatedHeight?: number;
}) {
  const width = getDraftComposerWidth(environment);

  if (composerPosition) {
    // 사용자가 드래그로 옮긴 위치가 있으면 그 위치를 우선하되 화면 밖은 막는다.
    const clamped = getClampedComposerPosition(
      composerPosition,
      environment,
      { width, height: estimatedHeight },
      getHostComposerBounds()
    );
    return { width, left: clamped.x, top: clamped.y };
  }

  const position = getInitialDraftComposerPosition(selection, environment, {
    width,
    height: estimatedHeight,
  });

  return { width, left: position.x, top: position.y };
}

/** Wires pointer-drag on the handle so the whole composer popover can be moved. */
export function attachDraftComposerDrag({
  getEnvironment,
  popover,
  handle,
  onMove,
}: {
  getEnvironment: () => ReviewEnvironment | undefined;
  popover: HTMLDivElement;
  handle: HTMLButtonElement;
  onMove: (position: ReviewPoint) => void;
}) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const movePopover = (event: PointerEvent) => {
    const environment = getEnvironment();
    if (!environment) return;

    const position = getClampedComposerPosition(
      {
        x: event.clientX - offsetX,
        y: event.clientY - offsetY,
      },
      environment,
      {
        width: popover.offsetWidth,
        height: popover.offsetHeight,
      },
      getHostComposerBounds()
    );

    popover.style.left = `${position.x}px`;
    popover.style.top = `${position.y}px`;
    onMove(position);
  };

  handle.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;

    // 잡은 지점과 popover 좌상단의 offset 을 기억해서 드래그 중 점프를 막는다.
    const rect = popover.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    isDragging = true;

    event.preventDefault();
    event.stopPropagation();
    handle.setPointerCapture(event.pointerId);
    popover.classList.add('is-dragging');
  });

  handle.addEventListener('pointermove', (event) => {
    if (!isDragging || !handle.hasPointerCapture(event.pointerId)) return;

    event.preventDefault();
    movePopover(event);
  });

  const stopDrag = (event: PointerEvent) => {
    if (!isDragging || !handle.hasPointerCapture(event.pointerId)) return;

    event.preventDefault();
    event.stopPropagation();
    isDragging = false;
    handle.releasePointerCapture(event.pointerId);
    popover.classList.remove('is-dragging');
    movePopover(event);
  };

  handle.addEventListener('pointerup', stopDrag);
  handle.addEventListener('pointercancel', stopDrag);
}
