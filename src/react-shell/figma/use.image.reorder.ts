import { useRef, useState, type PointerEvent } from 'react';
import type { ReviewFigmaImage } from '../../figma/image.types';
import { getPointerFigmaImageTargetId, getReorderedFigmaImageIds, isInteractiveFigmaImageTarget } from './image-panel.utils';

/** Shared pointer drag state and the one post-drag click suppression flag. */
export function useFigmaImageReorder(
  images: ReviewFigmaImage[],
  isMutating: boolean,
  onReorderImages: (ids: string[]) => Promise<void>,
  onSelectImage: (id: string) => void
) {
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);
  const pointerDragImageIdRef = useRef<string | null>(null);
  const pointerDragTargetIdRef = useRef<string | null>(null);
  const pointerDragStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerDragDidMoveRef = useRef(false);
  const draggingImageIndex = draggingImageId
    ? images.findIndex((image) => image.id === draggingImageId)
    : -1;
  const getRowProps = (image: ReviewFigmaImage, index: number, isEditing: boolean) => {
    const isDragging = draggingImageId === image.id;
    const isDropTarget =
      dragOverImageId === image.id && draggingImageId !== image.id;
    const isDropBefore = isDropTarget && draggingImageIndex > index;
    const isDropAfter =
      isDropTarget && draggingImageIndex >= 0 && draggingImageIndex < index;
    return {
      isDragging, isDropTarget, isDropBefore, isDropAfter,
      onClick: () => {
        if (pointerDragDidMoveRef.current) {
          pointerDragDidMoveRef.current = false;
          return;
        }
        onSelectImage(image.id);
      },
      onPointerCancel: () => {
        pointerDragImageIdRef.current = null;
        pointerDragTargetIdRef.current = null;
        pointerDragStartRef.current = null;
        setDraggingImageId(null);
        setDragOverImageId(null);
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (
          event.button !== 0 ||
          isMutating ||
          isEditing ||
          isInteractiveFigmaImageTarget(event.target)
        ) {
          return;
        }

        pointerDragImageIdRef.current = image.id;
        pointerDragTargetIdRef.current = null;
        pointerDragStartRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
        pointerDragDidMoveRef.current = false;
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const sourceImageId = pointerDragImageIdRef.current;
        const dragStart = pointerDragStartRef.current;
        if (!sourceImageId || !dragStart) return;

        const hasMoved =
          Math.abs(event.clientX - dragStart.x) +
          Math.abs(event.clientY - dragStart.y) >
          6;
        if (!hasMoved) return;

        pointerDragDidMoveRef.current = true;
        setDraggingImageId(sourceImageId);
        const targetImageId = getPointerFigmaImageTargetId(event);
        pointerDragTargetIdRef.current =
          targetImageId && targetImageId !== sourceImageId
            ? targetImageId
            : null;
        setDragOverImageId(pointerDragTargetIdRef.current);
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => {
        const sourceImageId = pointerDragImageIdRef.current;
        const targetImageId = pointerDragTargetIdRef.current;
        pointerDragImageIdRef.current = null;
        pointerDragTargetIdRef.current = null;
        pointerDragStartRef.current = null;
        setDraggingImageId(null);
        setDragOverImageId(null);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (
          !sourceImageId ||
          !targetImageId ||
          sourceImageId === targetImageId
        ) {
          return;
        }

        const nextImageIds = getReorderedFigmaImageIds(
          images,
          sourceImageId,
          targetImageId
        );
        void onReorderImages(nextImageIds);
      }
    };
  };
  return { getRowProps };
}
