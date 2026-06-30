// Pure helpers for the Figma images panel (labels, opacity snapping, reorder,
// pointer hit-testing, date formatting). Kept out of images.panel.tsx so the
// component file stays focused on rendering and interaction state.
import type { PointerEvent } from 'react';
import type { ReviewFigmaImage } from '../../figma/image.types';
import type { ReviewFigmaImageOverlayItemState } from './image.overlay.controller';
import { DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY } from './image.overlay.controller';

export const DEFAULT_FIGMA_IMAGE_LAYER_STATE: ReviewFigmaImageOverlayItemState = {
  isLocked: false,
  isVisible: false,
  mode: 'normal',
  offsetY: 0,
  opacity: DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY,
};

export function getFigmaImageLabel(image: ReviewFigmaImage, index: number) {
  return image.label?.trim() || `Image ${index + 1}`;
}

export function getSnappedOpacityPercent(opacity: number) {
  const opacityPercent = Math.round(opacity * 100);
  if (!Number.isFinite(opacityPercent)) return 0;
  return Math.max(0, Math.min(100, Math.round(opacityPercent / 10) * 10));
}

export function getFigmaImageLayerStatusLabel(
  overlayState: ReviewFigmaImageOverlayItemState
) {
  return [
    overlayState.isVisible ? 'Visible' : 'Hidden',
    overlayState.mode === 'invert' ? 'Invert' : '',
    overlayState.isLocked ? 'Locked' : '',
  ]
    .filter(Boolean)
    .join(' / ');
}

export function getReorderedFigmaImageIds(
  images: ReviewFigmaImage[],
  draggedImageId: string,
  dropTargetImageId: string
) {
  const currentImageIds = images.map((image) => image.id);
  const draggedIndex = currentImageIds.indexOf(draggedImageId);
  const dropTargetIndex = currentImageIds.indexOf(dropTargetImageId);
  if (draggedIndex < 0 || dropTargetIndex < 0) return currentImageIds;

  const nextImageIds = [...currentImageIds];
  const [imageId] = nextImageIds.splice(draggedIndex, 1);
  nextImageIds.splice(dropTargetIndex, 0, imageId);
  return nextImageIds;
}

export function isInteractiveFigmaImageTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest('button, a, input, textarea, select, [contenteditable="true"]')
    )
  );
}

export function getPointerFigmaImageTargetId(event: PointerEvent<HTMLElement>) {
  const element = document.elementFromPoint(event.clientX, event.clientY);
  const targetCard = element?.closest<HTMLElement>(
    '.df-review-figma-image-card[data-figma-image-id]'
  );
  return targetCard?.dataset.figmaImageId ?? null;
}

export function formatFigmaImageDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  }).format(date);
}
