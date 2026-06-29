import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type { ReviewFigmaImage } from '../../figma/image.types';
import type { ReviewFigmaImageOverlayItemState } from '../figma/image.controller';
import type { ReviewShellViewportPreset } from '../types';
import { getViewportPresetKind } from '../viewport';

const TARGET_FIGMA_IMAGE_ROOT_ID = 'df-review-figma-image-target-root';
const TARGET_FIGMA_IMAGE_STYLE_ID = 'df-review-figma-image-target-style';
const TARGET_FIGMA_IMAGE_ID_ATTRIBUTE = 'data-df-review-figma-image-id';
const targetFigmaImageDragStates = new WeakMap<
  HTMLElement,
  {
    overlayId: string;
    pointerId: number;
    startClientY: number;
    startOffsetY: number;
  }
>();

export type ReviewTargetFigmaImageOverlay = {
  id: string;
  imageUrl: string;
  isLocked?: boolean;
  label?: string;
  mode?: 'normal' | 'invert';
  offsetY?: number;
  opacity: number;
  zIndex: number;
};

export function createReviewTargetFigmaImageOverlays({
  imageOverlayStates,
  images,
}: {
  imageOverlayStates: Record<string, ReviewFigmaImageOverlayItemState>;
  images: ReviewFigmaImage[];
}): ReviewTargetFigmaImageOverlay[] {
  return images.flatMap((image, index) => {
    const overlayState = imageOverlayStates[image.id];
    if (!overlayState?.isVisible) return [];

    return [
      {
        id: image.id,
        imageUrl: image.imageUrl,
        isLocked: overlayState.isLocked,
        label: image.label ?? image.nodeId,
        mode: overlayState.mode,
        offsetY: overlayState.offsetY,
        opacity: overlayState.opacity,
        zIndex: images.length - index,
      },
    ];
  });
}

interface UseTargetFigmaImageOverlaysOptions {
  figmaImageOverlays: ReviewTargetFigmaImageOverlay[];
  iframeRef: RefObject<HTMLIFrameElement | null>;
  size: ReviewShellViewportPreset;
  targetSrc: string;
  onSetOverlayOffsetY?: (id: string, offsetY: number) => void;
}

export const useTargetFigmaImageOverlays = ({
  figmaImageOverlays,
  iframeRef,
  onSetOverlayOffsetY,
  size,
  targetSrc,
}: UseTargetFigmaImageOverlaysOptions) => {
  const targetDocumentRef = useRef<Document | null>(null);
  const overlaySignature = createTargetFigmaImageOverlaySignature(
    figmaImageOverlays
  );

  const syncTargetFigmaImageOverlays = useCallback(() => {
    let targetDocument: Document | null | undefined;

    try {
      targetDocument = iframeRef.current?.contentDocument;
    } catch {
      targetDocument = null;
    }

    if (!targetDocument?.body) return;
    if (
      targetDocumentRef.current &&
      targetDocumentRef.current !== targetDocument
    ) {
      removeTargetFigmaImageOverlays(targetDocumentRef.current);
    }

    targetDocumentRef.current = targetDocument;
    renderTargetFigmaImageOverlays({
      onSetOverlayOffsetY,
      overlays: figmaImageOverlays,
      size,
      targetDocument,
    });
  }, [
    iframeRef,
    onSetOverlayOffsetY,
    overlaySignature,
    size,
    targetSrc,
  ]);

  useEffect(() => {
    syncTargetFigmaImageOverlays();
  }, [syncTargetFigmaImageOverlays]);

  useEffect(() => {
    return () => {
      if (!targetDocumentRef.current) return;
      removeTargetFigmaImageOverlays(targetDocumentRef.current);
      targetDocumentRef.current = null;
    };
  }, []);

  return syncTargetFigmaImageOverlays;
};

export function renderTargetFigmaImageOverlays({
  onSetOverlayOffsetY,
  overlays,
  size,
  targetDocument,
}: {
  onSetOverlayOffsetY?: (id: string, offsetY: number) => void;
  overlays: ReviewTargetFigmaImageOverlay[];
  size: ReviewShellViewportPreset;
  targetDocument: Document;
}) {
  if (overlays.length === 0) {
    removeTargetFigmaImageOverlays(targetDocument);
    return;
  }

  const isMobileViewport = getViewportPresetKind(size) === 'mobile';
  const fixedOverlayWidth = getTargetFigmaImageFixedWidth(size);
  const root = ensureTargetFigmaImageRoot(targetDocument);
  const existingElements = new Map(
    Array.from(
      root.querySelectorAll<HTMLElement>(
        `[${TARGET_FIGMA_IMAGE_ID_ATTRIBUTE}]`
      )
    ).flatMap((element) => {
      const id = element.getAttribute(TARGET_FIGMA_IMAGE_ID_ATTRIBUTE);
      return id ? [[id, element] as const] : [];
    })
  );
  const nextIds = new Set(overlays.map((overlay) => overlay.id));

  existingElements.forEach((element, id) => {
    if (!nextIds.has(id)) element.remove();
  });

  overlays.forEach((overlay) => {
    let element = existingElements.get(overlay.id);
    let image = element?.querySelector('img') ?? null;

    if (!element) {
      element = targetDocument.createElement('div');
      element.className = 'df-review-figma-image-target-overlay';
      element.setAttribute(TARGET_FIGMA_IMAGE_ID_ATTRIBUTE, overlay.id);
      image = targetDocument.createElement('img');
      image.alt = '';
      image.draggable = false;
      element.appendChild(image);
    }

    if (image && image.getAttribute('src') !== overlay.imageUrl) {
      image.setAttribute('src', overlay.imageUrl);
    }

    element.setAttribute('aria-label', overlay.label ?? 'Figma image overlay');
    element.setAttribute('role', 'img');
    element.dataset.viewport = isMobileViewport ? 'mobile' : 'fixed';
    element.style.filter = overlay.mode === 'invert' ? 'invert(1)' : '';
    element.style.left = isMobileViewport ? '0' : '50%';
    element.style.opacity = String(overlay.opacity);
    element.style.pointerEvents =
      overlay.isLocked || !onSetOverlayOffsetY ? 'none' : 'auto';
    element.style.top = `${normalizeTargetFigmaImageOffsetY(
      overlay.offsetY
    )}px`;
    element.style.transform = isMobileViewport ? 'none' : 'translateX(-50%)';
    element.style.width = isMobileViewport ? '100%' : `${fixedOverlayWidth}px`;
    element.style.zIndex = String(overlay.zIndex);
    attachTargetFigmaImageDrag({
      element,
      onSetOverlayOffsetY,
      overlay,
    });

    root.appendChild(element);
  });
}

function attachTargetFigmaImageDrag({
  element,
  onSetOverlayOffsetY,
  overlay,
}: {
  element: HTMLElement;
  onSetOverlayOffsetY?: (id: string, offsetY: number) => void;
  overlay: ReviewTargetFigmaImageOverlay;
}) {
  if (overlay.isLocked || !onSetOverlayOffsetY) {
    targetFigmaImageDragStates.delete(element);
    element.classList.remove('is-dragging');
    element.onpointerdown = null;
    element.onpointermove = null;
    element.onpointerup = null;
    element.onpointercancel = null;
    return;
  }

  element.onpointerdown = (event) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();
    element.setPointerCapture(event.pointerId);
    element.classList.add('is-dragging');
    targetFigmaImageDragStates.set(element, {
      overlayId: overlay.id,
      pointerId: event.pointerId,
      startClientY: event.clientY,
      startOffsetY: normalizeTargetFigmaImageOffsetY(overlay.offsetY),
    });
  };

  element.onpointermove = (event) => {
    const dragState = targetFigmaImageDragStates.get(element);
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.stopPropagation();
    const nextOffsetY = Math.round(
      dragState.startOffsetY + event.clientY - dragState.startClientY
    );
    element.style.top = `${nextOffsetY}px`;
    onSetOverlayOffsetY(dragState.overlayId, nextOffsetY);
  };

  const stopDrag = (event: PointerEvent) => {
    const dragState = targetFigmaImageDragStates.get(element);
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.stopPropagation();
    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
    element.classList.remove('is-dragging');
    targetFigmaImageDragStates.delete(element);
  };

  element.onpointerup = stopDrag;
  element.onpointercancel = stopDrag;
}

function ensureTargetFigmaImageRoot(targetDocument: Document) {
  ensureTargetFigmaImageStyle(targetDocument);

  const [existingRoot, ...duplicateRoots] = Array.from(
    targetDocument.querySelectorAll<HTMLElement>(
      `#${TARGET_FIGMA_IMAGE_ROOT_ID}`
    )
  );
  duplicateRoots.forEach((root) => root.remove());
  if (existingRoot) return existingRoot;

  const root = targetDocument.createElement('div');
  root.id = TARGET_FIGMA_IMAGE_ROOT_ID;
  root.setAttribute('aria-hidden', 'true');
  targetDocument.body.appendChild(root);
  return root;
}

function ensureTargetFigmaImageStyle(targetDocument: Document) {
  if (targetDocument.getElementById(TARGET_FIGMA_IMAGE_STYLE_ID)) return;

  const style = targetDocument.createElement('style');
  style.id = TARGET_FIGMA_IMAGE_STYLE_ID;
  style.textContent = `
    #${TARGET_FIGMA_IMAGE_ROOT_ID} {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2147483000;
      width: 100%;
      height: 0;
      overflow: visible;
      pointer-events: none;
    }

    #${TARGET_FIGMA_IMAGE_ROOT_ID} .df-review-figma-image-target-overlay {
      position: absolute;
      display: block;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      will-change: opacity, top, transform;
    }

    #${TARGET_FIGMA_IMAGE_ROOT_ID} .df-review-figma-image-target-overlay.is-dragging {
      cursor: grabbing;
    }

    #${TARGET_FIGMA_IMAGE_ROOT_ID} .df-review-figma-image-target-overlay img {
      display: block;
      width: 100%;
      max-width: none;
      height: auto;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
      -webkit-user-select: none;
    }
  `;
  targetDocument.head?.appendChild(style);
}

export function removeTargetFigmaImageOverlays(targetDocument: Document) {
  targetDocument
    .querySelectorAll(`#${TARGET_FIGMA_IMAGE_ROOT_ID}`)
    .forEach((element) => element.remove());
  targetDocument
    .querySelectorAll(`#${TARGET_FIGMA_IMAGE_STYLE_ID}`)
    .forEach((element) => element.remove());
}

function createTargetFigmaImageOverlaySignature(
  overlays: ReviewTargetFigmaImageOverlay[]
) {
  return overlays
    .map((overlay) =>
      [
        overlay.id,
        overlay.imageUrl,
        overlay.label ?? '',
        overlay.isLocked ? 'locked' : 'unlocked',
        overlay.mode ?? '',
        overlay.offsetY ?? 0,
        overlay.opacity,
        overlay.zIndex,
      ].join(':')
    )
    .join('|');
}

function getTargetFigmaImageFixedWidth(size: ReviewShellViewportPreset) {
  const width = size.designWidth ?? size.width;
  return Math.max(1, Math.round(width));
}

function normalizeTargetFigmaImageOffsetY(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
