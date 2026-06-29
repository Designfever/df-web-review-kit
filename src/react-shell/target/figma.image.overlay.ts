import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type { ReviewShellViewportPreset } from '../types';
import { getViewportPresetKind } from '../viewport';

const TARGET_FIGMA_IMAGE_ROOT_ID = 'df-review-figma-image-target-root';
const TARGET_FIGMA_IMAGE_STYLE_ID = 'df-review-figma-image-target-style';
const TARGET_FIGMA_IMAGE_ID_ATTRIBUTE = 'data-df-review-figma-image-id';

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

interface UseTargetFigmaImageOverlaysOptions {
  figmaImageOverlays: ReviewTargetFigmaImageOverlay[];
  iframeRef: RefObject<HTMLIFrameElement | null>;
  size: ReviewShellViewportPreset;
  targetSrc: string;
}

export const useTargetFigmaImageOverlays = ({
  figmaImageOverlays,
  iframeRef,
  size,
  targetSrc,
}: UseTargetFigmaImageOverlaysOptions) => {
  const targetDocumentRef = useRef<Document | null>(null);
  const overlaySignature = createTargetFigmaImageOverlaySignature(
    figmaImageOverlays
  );
  const isMobileViewport = getViewportPresetKind(size) === 'mobile';
  const fixedOverlayWidth = getTargetFigmaImageFixedWidth(size);

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
      fixedOverlayWidth,
      isMobileViewport,
      overlays: figmaImageOverlays,
      targetDocument,
    });
  }, [
    fixedOverlayWidth,
    iframeRef,
    isMobileViewport,
    overlaySignature,
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

function renderTargetFigmaImageOverlays({
  fixedOverlayWidth,
  isMobileViewport,
  overlays,
  targetDocument,
}: {
  fixedOverlayWidth: number;
  isMobileViewport: boolean;
  overlays: ReviewTargetFigmaImageOverlay[];
  targetDocument: Document;
}) {
  if (overlays.length === 0) {
    removeTargetFigmaImageOverlays(targetDocument);
    return;
  }

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
    element.style.pointerEvents = 'none';
    element.style.top = `${normalizeTargetFigmaImageOffsetY(
      overlay.offsetY
    )}px`;
    element.style.transform = isMobileViewport ? 'none' : 'translateX(-50%)';
    element.style.width = isMobileViewport ? '100%' : `${fixedOverlayWidth}px`;
    element.style.zIndex = String(overlay.zIndex);

    root.appendChild(element);
  });
}

function ensureTargetFigmaImageRoot(targetDocument: Document) {
  ensureTargetFigmaImageStyle(targetDocument);

  const existingRoot = targetDocument.getElementById(
    TARGET_FIGMA_IMAGE_ROOT_ID
  );
  if (existingRoot instanceof HTMLElement) return existingRoot;

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
      user-select: none;
      -webkit-user-select: none;
      will-change: opacity, transform;
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

function removeTargetFigmaImageOverlays(targetDocument: Document) {
  targetDocument.getElementById(TARGET_FIGMA_IMAGE_ROOT_ID)?.remove();
  targetDocument.getElementById(TARGET_FIGMA_IMAGE_STYLE_ID)?.remove();
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
