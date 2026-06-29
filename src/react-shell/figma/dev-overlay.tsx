import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  MoveVertical as OffsetYIcon,
} from 'lucide-react';
import {
  DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
} from '../../figma/image.types';
import { normalizeTarget, getTargetRouteKey } from '../route';
import type {
  ReviewShellFigmaImagesOptions,
  ReviewShellViewportPreset,
} from '../types';
import { DEFAULT_REVIEW_VIEWPORT_PRESETS } from '../viewport';
import {
  getReviewFigmaImageStore,
} from '../figma';
import { useReviewFigmaImages } from '../hooks/use.review.figma.images';
import {
  createReviewTargetFigmaImageOverlays,
  removeTargetFigmaImageOverlays,
  renderTargetFigmaImageOverlays,
} from '../target/figma.image.overlay';
import {
  DEFAULT_FIGMA_IMAGE_LAYER_STATE,
  formatFigmaImageDate,
  getFigmaImageLabel,
  getFigmaImageLayerStatusLabel,
  getSnappedOpacityPercent,
} from './image-panel.utils';
import { FigmaMarkIcon } from './figma-mark-icon';
import { FigmaImageLayerStateButtons } from './layer-state-buttons';

const FIGMA_DEV_OVERLAY_ROOT_ID = 'df-review-figma-dev-overlay-root';
const FIGMA_DEV_OVERLAY_MOUNT_ID = 'df-review-figma-dev-overlay-mount';

type FigmaDevViewportMatch = {
  label: 'Mobile' | 'Full width';
  preset: ReviewShellViewportPreset;
  rangeLabel: string;
};

type FigmaDevViewportBoundaries = {
  fullWidthRangeLabel: string;
  maxPreset: ReviewShellViewportPreset;
  minPreset: ReviewShellViewportPreset;
  mobileRangeLabel: string;
};

export interface FigmaDevOverlayMountOptions {
  rootId?: string;
  projectId: string;
  presets?: ReviewShellViewportPreset[];
  reviewPathPrefix?: string;
  figmaImages?: ReviewShellFigmaImagesOptions;
  pageUrl?: string | (() => string);
}

export interface FigmaDevOverlayController {
  destroy(): void;
}

export const mountFigmaDevOverlay = (
  options: FigmaDevOverlayMountOptions
): FigmaDevOverlayController => {
  if (typeof document === 'undefined' || !document.body) {
    return { destroy: () => undefined };
  }

  const rootId = options.rootId ?? FIGMA_DEV_OVERLAY_ROOT_ID;
  document.getElementById(rootId)?.remove();

  const host = document.createElement('div');
  host.id = rootId;
  host.style.display = 'contents';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = figmaDevOverlayStyle;
  const mountNode = document.createElement('div');
  mountNode.id = FIGMA_DEV_OVERLAY_MOUNT_ID;
  shadow.append(style, mountNode);
  document.body.appendChild(host);

  const root: Root = createRoot(mountNode);
  root.render(
    <React.StrictMode>
      <FigmaDevOverlayWidget {...options} />
    </React.StrictMode>
  );

  return {
    destroy() {
      root.unmount();
      host.remove();
      removeTargetFigmaImageOverlays(document);
    },
  };
};

const FigmaDevOverlayWidget = ({
  figmaImages,
  pageUrl,
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  projectId,
  reviewPathPrefix,
}: FigmaDevOverlayMountOptions) => {
  const figmaImageStore = getReviewFigmaImageStore(figmaImages);
  const viewport = useCurrentViewport();
  const currentPageUrl = useCurrentPageUrl(pageUrl, reviewPathPrefix);
  const viewportBoundaries = useMemo(
    () => getFigmaDevViewportBoundaries(presets),
    [presets]
  );
  const matchedViewportMatch = useMemo(
    () => findBoundaryFigmaDevViewportMatch(presets, viewport.width),
    [presets, viewport.width]
  );
  const matchedViewport = matchedViewportMatch?.preset ?? null;
  const activeViewport =
    matchedViewport ??
    viewportBoundaries?.minPreset ??
    presets[0] ??
    DEFAULT_REVIEW_VIEWPORT_PRESETS[0];
  const {
    error,
    images,
    imageOverlayStates,
    isAnyImageOverlayVisible,
    isLoading,
    selectedImageId,
    setImageOverlayOffsetY,
    setImageOverlayOpacity,
    setSelectedImageId,
    toggleImageOverlayLocked,
    toggleImageOverlayMode,
    toggleImageOverlayVisible,
  } = useReviewFigmaImages({
    imageFormat: figmaImages?.imageFormat ?? DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
    pageUrl: currentPageUrl,
    projectId,
    store: matchedViewport ? figmaImageStore : null,
    viewport: activeViewport,
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const [offsetYDraftByImageId, setOffsetYDraftByImageId] = useState<
    Record<string, string>
  >({});
  const selectedImage = selectedImageId
    ? images.find((image) => image.id === selectedImageId) ?? null
    : null;
  const selectedImageIndex = selectedImage ? images.indexOf(selectedImage) : -1;
  const selectedImageLabel = selectedImage
    ? getFigmaImageLabel(selectedImage, selectedImageIndex)
    : 'Figma layer';
  const selectedOverlayState = selectedImage
    ? imageOverlayStates[selectedImage.id] ?? DEFAULT_FIGMA_IMAGE_LAYER_STATE
    : DEFAULT_FIGMA_IMAGE_LAYER_STATE;
  const selectedOpacityPercent = selectedImage
    ? getSnappedOpacityPercent(selectedOverlayState.opacity)
    : 0;
  const selectedOffsetYDraft = selectedImage
    ? offsetYDraftByImageId[selectedImage.id] ??
      String(selectedOverlayState.offsetY)
    : '';
  const figmaImageOverlays = useMemo(
    () =>
      createReviewTargetFigmaImageOverlays({
        imageOverlayStates,
        images,
      }),
    [imageOverlayStates, images]
  );

  useEffect(() => {
    if (!isWidgetVisible || !matchedViewport) {
      removeTargetFigmaImageOverlays(document);
      return;
    }

    renderTargetFigmaImageOverlays({
      onSetOverlayOffsetY: setImageOverlayOffsetY,
      overlays: figmaImageOverlays,
      size: matchedViewport,
      targetDocument: document,
    });
  }, [
    figmaImageOverlays,
    isWidgetVisible,
    matchedViewport,
    setImageOverlayOffsetY,
  ]);

  useEffect(
    () => () => {
      removeTargetFigmaImageOverlays(document);
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !event.shiftKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (event.code !== 'KeyF' && event.key.toLowerCase() !== 'f') ||
        isEditableFigmaDevOverlayEventTarget(event)
      ) {
        return;
      }

      event.preventDefault();
      setIsPanelOpen(false);
      setIsWidgetVisible((currentVisible) => !currentVisible);
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  if (!figmaImageStore) return null;
  if (!isWidgetVisible) return null;

  const updateSelectedImageOpacity = (value: string) => {
    if (!selectedImage) return;
    const opacityPercent = Math.max(
      0,
      Math.min(100, Math.round(Number(value) / 10) * 10)
    );
    if (Number.isFinite(opacityPercent)) {
      setImageOverlayOpacity(selectedImage.id, opacityPercent / 100);
    }
  };

  return (
    <aside
      aria-label="Figma overlay"
      className={`df-review-figma-dev-widget${
        isPanelOpen ? ' is-open' : ''
      }${isAnyImageOverlayVisible ? ' is-active' : ''}`}
    >
      {isPanelOpen && (
        <div className="df-review-figma-dev-panel">
          <div className="df-review-figma-dev-panel-header">
            <strong>Figma</strong>
            <span>
              {matchedViewportMatch
                ? `${matchedViewportMatch.label} · ${matchedViewportMatch.rangeLabel}`
                : `${viewport.width}px`}
            </span>
          </div>
          {selectedImage && (
            <div className="df-review-figma-dev-selected-controls">
              <label className="df-review-figma-dev-opacity-control">
                <span>Opacity</span>
                <input
                  aria-label={`${selectedImageLabel} overlay opacity`}
                  max="100"
                  min="0"
                  step="10"
                  type="range"
                  value={selectedOpacityPercent}
                  onChange={(event) =>
                    updateSelectedImageOpacity(event.currentTarget.value)
                  }
                  onInput={(event) =>
                    updateSelectedImageOpacity(event.currentTarget.value)
                  }
                />
                <strong>{selectedOpacityPercent}</strong>
              </label>
              <label className="df-review-figma-dev-y-control">
                <OffsetYIcon aria-hidden="true" />
                <input
                  aria-label={`${selectedImageLabel} overlay Y offset`}
                  inputMode="numeric"
                  step="1"
                  type="number"
                  value={selectedOffsetYDraft}
                  onBlur={() => {
                    setOffsetYDraftByImageId((currentDrafts) => {
                      const nextDrafts = { ...currentDrafts };
                      delete nextDrafts[selectedImage.id];
                      return nextDrafts;
                    });
                  }}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    const offsetY = Number(value);
                    setOffsetYDraftByImageId((currentDrafts) => ({
                      ...currentDrafts,
                      [selectedImage.id]: value,
                    }));
                    if (value.trim() !== '' && Number.isFinite(offsetY)) {
                      setImageOverlayOffsetY(selectedImage.id, offsetY);
                    }
                  }}
                />
              </label>
            </div>
          )}
          {error && <p className="df-review-figma-dev-status">{error}</p>}
          {!matchedViewport ? (
            <p className="df-review-figma-dev-empty">
              No Figma layers for this viewport.
              {viewportBoundaries
                ? ` Mobile ${viewportBoundaries.mobileRangeLabel} / Full width ${viewportBoundaries.fullWidthRangeLabel}`
                : ''}
            </p>
          ) : isLoading ? (
            <p className="df-review-figma-dev-status">Loading...</p>
          ) : images.length === 0 ? (
            <p className="df-review-figma-dev-empty">
              No Figma layers for this viewport.
            </p>
          ) : (
            <div className="df-review-figma-dev-list">
              {images.map((image, index) => {
                const imageLabel = getFigmaImageLabel(image, index);
                const overlayState =
                  imageOverlayStates[image.id] ??
                  DEFAULT_FIGMA_IMAGE_LAYER_STATE;

                return (
                  <article
                    className={`df-review-figma-dev-row${
                      image.id === selectedImageId ? ' is-active' : ''
                    }`}
                    key={image.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedImageId(image.id)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      setSelectedImageId(image.id);
                    }}
                  >
                    <FigmaImageLayerStateButtons
                      imageLabel={imageLabel}
                      overlayState={overlayState}
                      title={getFigmaImageLayerStatusLabel(overlayState)}
                      onSelect={() => setSelectedImageId(image.id)}
                      onToggleLocked={() =>
                        toggleImageOverlayLocked(image.id)
                      }
                      onToggleMode={() => toggleImageOverlayMode(image.id)}
                      onToggleVisible={() =>
                        toggleImageOverlayVisible(image.id)
                      }
                    />
                    <span className="df-review-figma-dev-row-main">
                      <strong>{imageLabel}</strong>
                      <small>{formatFigmaImageDate(image.updatedAt)}</small>
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div className="df-review-figma-dev-bar">
        <button
          aria-expanded={isPanelOpen}
          aria-label={isPanelOpen ? 'Hide Figma layer controls' : 'Show Figma layer controls'}
          className="df-review-figma-dev-button is-figma"
          title={isPanelOpen ? 'Hide layers' : 'Show layers'}
          type="button"
          onClick={() => setIsPanelOpen((isOpen) => !isOpen)}
        >
          <FigmaMarkIcon />
          <span className="df-review-figma-dev-button-count">
            {images.length}
          </span>
        </button>
      </div>
    </aside>
  );
};

function useCurrentPageUrl(
  pageUrl: FigmaDevOverlayMountOptions['pageUrl'],
  reviewPathPrefix: string | undefined
) {
  const [currentPageUrl, setCurrentPageUrl] = useState(() =>
    getFigmaDevOverlayPageUrl(pageUrl, reviewPathPrefix)
  );

  useEffect(() => {
    const updatePageUrl = () => {
      setCurrentPageUrl(getFigmaDevOverlayPageUrl(pageUrl, reviewPathPrefix));
    };

    window.addEventListener('popstate', updatePageUrl);
    window.addEventListener('hashchange', updatePageUrl);
    return () => {
      window.removeEventListener('popstate', updatePageUrl);
      window.removeEventListener('hashchange', updatePageUrl);
    };
  }, [pageUrl, reviewPathPrefix]);

  return currentPageUrl;
}

function isEditableFigmaDevOverlayEventTarget(event: KeyboardEvent) {
  const path = event.composedPath?.() ?? [];
  const element = (path[0] ?? event.target) as HTMLElement | null;
  if (!element || typeof element.tagName !== 'string') return false;

  const tagName = element.tagName;
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    element.isContentEditable === true
  );
}

function useCurrentViewport() {
  const [viewport, setViewport] = useState(getCurrentViewportSize);

  useEffect(() => {
    const updateViewport = () => setViewport(getCurrentViewportSize());

    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    window.visualViewport?.addEventListener('resize', updateViewport);
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      window.visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, []);

  return viewport;
}

function getCurrentViewportSize() {
  return {
    height: Math.round(window.innerHeight),
    width: Math.round(window.innerWidth),
  };
}

function getFigmaDevOverlayPageUrl(
  pageUrl: FigmaDevOverlayMountOptions['pageUrl'],
  reviewPathPrefix: string | undefined
) {
  if (typeof pageUrl === 'function') return pageUrl();
  if (typeof pageUrl === 'string') return pageUrl;

  return getTargetRouteKey(
    normalizeTarget(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
      reviewPathPrefix
    ),
    reviewPathPrefix
  );
}

function findBoundaryFigmaDevViewportMatch(
  presets: ReviewShellViewportPreset[],
  width: number
): FigmaDevViewportMatch | null {
  const boundaries = getFigmaDevViewportBoundaries(presets);
  if (!boundaries) return null;

  if (width <= boundaries.minPreset.width) {
    return {
      label: 'Mobile',
      preset: boundaries.minPreset,
      rangeLabel: boundaries.mobileRangeLabel,
    };
  }

  if (width >= boundaries.maxPreset.width) {
    return {
      label: 'Full width',
      preset: boundaries.maxPreset,
      rangeLabel: boundaries.fullWidthRangeLabel,
    };
  }

  return null;
}

function getFigmaDevViewportBoundaries(
  presets: ReviewShellViewportPreset[]
): FigmaDevViewportBoundaries | null {
  if (presets.length === 0) return null;

  const sortedPresets = [...presets].sort((a, b) => a.width - b.width);
  const minPreset = sortedPresets[0];
  const maxPreset = sortedPresets[sortedPresets.length - 1];

  return {
    fullWidthRangeLabel: `>= ${maxPreset.width}px`,
    maxPreset,
    minPreset,
    mobileRangeLabel: `<= ${minPreset.width}px`,
  };
}

const figmaDevOverlayStyle = `
  :host {
    all: initial;
    color-scheme: dark;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    --df-review-figma-dev-bg: rgba(15, 18, 24, 0.94);
    --df-review-figma-dev-panel: rgba(19, 24, 33, 0.96);
    --df-review-figma-dev-control: #202938;
    --df-review-figma-dev-control-hover: #273345;
    --df-review-figma-dev-border: rgba(226, 233, 245, 0.16);
    --df-review-figma-dev-border-soft: rgba(226, 233, 245, 0.09);
    --df-review-figma-dev-text: #edf3fb;
    --df-review-figma-dev-muted: rgba(237, 243, 251, 0.58);
    --df-review-figma-dev-subtle: rgba(237, 243, 251, 0.42);
    --df-review-figma-dev-accent: #7cc7ff;
    --df-review-figma-dev-accent-soft: rgba(124, 199, 255, 0.16);
  }

  * {
    box-sizing: border-box;
  }

  .df-review-figma-dev-widget {
    position: fixed;
    right: calc(16px + env(safe-area-inset-right));
    bottom: calc(16px + env(safe-area-inset-bottom));
    z-index: 2147483200;
    display: grid;
    justify-items: end;
    gap: 8px;
    color: var(--df-review-figma-dev-text);
    font-size: 13px;
    line-height: 1.25;
    pointer-events: none;
  }

  .df-review-figma-dev-panel,
  .df-review-figma-dev-bar {
    pointer-events: auto;
  }

  .df-review-figma-dev-panel {
    display: grid;
    gap: 8px;
    width: min(360px, calc(100vw - 32px - env(safe-area-inset-left) - env(safe-area-inset-right)));
    max-height: min(460px, calc(100vh - 96px - env(safe-area-inset-top) - env(safe-area-inset-bottom)));
    overflow: hidden;
    border: 1px solid var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 10px;
    background: var(--df-review-figma-dev-panel);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .df-review-figma-dev-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  }

  .df-review-figma-dev-panel-header strong {
    font-size: 14px;
    font-weight: 700;
  }

  .df-review-figma-dev-panel-header span,
  .df-review-figma-dev-status,
  .df-review-figma-dev-empty {
    color: var(--df-review-figma-dev-muted);
    font-size: 12px;
  }

  .df-review-figma-dev-selected-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 84px;
    gap: 8px;
  }

  .df-review-figma-dev-opacity-control,
  .df-review-figma-dev-y-control {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    height: 36px;
    border: 1px solid var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 0 10px;
    background: var(--df-review-figma-dev-control);
  }

  .df-review-figma-dev-opacity-control span {
    color: var(--df-review-figma-dev-muted);
    font-size: 12px;
  }

  .df-review-figma-dev-opacity-control strong {
    min-width: 24px;
    text-align: right;
    font-size: 13px;
  }

  .df-review-figma-dev-opacity-control input[type="range"] {
    flex: 1;
    min-width: 0;
    height: 24px;
    accent-color: var(--df-review-figma-dev-accent);
  }

  .df-review-figma-dev-y-control svg {
    width: 15px;
    height: 15px;
    color: var(--df-review-figma-dev-muted);
  }

  .df-review-figma-dev-y-control input {
    width: 100%;
    min-width: 0;
    border: 0;
    padding: 0;
    color: var(--df-review-figma-dev-text);
    background: transparent;
    font: inherit;
    outline: none;
  }

  .df-review-figma-dev-status,
  .df-review-figma-dev-empty {
    margin: 0;
    border: 1px dashed var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 12px;
  }

  .df-review-figma-dev-list {
    display: grid;
    gap: 6px;
    min-height: 0;
    overflow: auto;
  }

  .df-review-figma-dev-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
    border: 1px solid var(--df-review-figma-dev-border-soft);
    border-radius: 8px;
    padding: 12px 10px;
    color: var(--df-review-figma-dev-text);
    background: rgba(237, 243, 251, 0.035);
    font: inherit;
    text-align: left;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
  }

  .df-review-figma-dev-row:hover,
  .df-review-figma-dev-row:focus-visible {
    border-color: var(--df-review-figma-dev-border);
    outline: none;
  }

  .df-review-figma-dev-row.is-active {
    border-color: var(--df-review-figma-dev-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-figma-dev-accent-soft);
  }

  .df-review-figma-dev-row-main {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .df-review-figma-dev-row-main strong {
    color: var(--df-review-figma-dev-text);
    font-size: 13px;
    font-weight: 700;
    white-space: normal;
    word-break: break-word;
  }

  .df-review-figma-dev-row-main small {
    color: var(--df-review-figma-dev-muted);
    font-size: 12px;
  }

  .df-review-figma-image-layer-state {
    display: grid;
    grid-template-columns: repeat(3, 22px);
    align-items: center;
    gap: 2px;
    min-width: 0;
    height: 24px;
  }

  .df-review-figma-image-state-button {
    display: inline-grid;
    place-items: center;
    width: 22px;
    min-width: 22px;
    height: 22px;
    min-height: 22px;
    border: 0;
    border-radius: 0;
    padding: 0;
    color: var(--df-review-figma-dev-subtle);
    background: transparent;
    box-shadow: none;
    opacity: 0.68;
    cursor: pointer;
  }

  .df-review-figma-image-state-button:hover,
  .df-review-figma-image-state-button:focus-visible {
    color: var(--df-review-figma-dev-text);
    opacity: 1;
    outline: none;
  }

  .df-review-figma-image-state-button.is-active {
    color: var(--df-review-figma-dev-accent);
    opacity: 1;
  }

  .df-review-figma-image-state-button svg {
    width: 13px;
    height: 13px;
  }

  .df-review-figma-dev-bar {
    display: inline-flex;
    align-items: center;
    pointer-events: auto;
  }

  .df-review-figma-dev-button {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 0;
    color: var(--df-review-figma-dev-muted);
    background: var(--df-review-figma-dev-control);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
    cursor: pointer;
  }

  .df-review-figma-dev-button:hover,
  .df-review-figma-dev-button:focus-visible,
  .df-review-figma-dev-widget.is-active .df-review-figma-dev-button.is-figma {
    color: var(--df-review-figma-dev-accent);
    border-color: rgba(124, 199, 255, 0.5);
    outline: none;
  }

  .df-review-figma-dev-button:disabled {
    color: var(--df-review-figma-dev-subtle);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .df-review-figma-dev-button svg {
    width: 17px;
    height: 17px;
  }

  .df-review-figma-dev-button .df-review-figma-mark-icon {
    width: 17px;
    height: 17px;
    fill: currentColor;
  }

  .df-review-figma-dev-button.is-figma {
    width: 38px;
    height: 38px;
  }

  .df-review-figma-dev-button-count {
    position: absolute;
    right: -3px;
    top: -4px;
    display: inline-grid;
    place-items: center;
    min-width: 15px;
    height: 15px;
    border: 1px solid rgba(15, 18, 24, 0.86);
    border-radius: 4px;
    padding: 0 3px;
    color: currentColor;
    background: rgba(15, 18, 24, 0.92);
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
  }

  .df-review-figma-dev-button.is-figma:disabled .df-review-figma-dev-button-count {
    color: var(--df-review-figma-dev-subtle);
  }

  @media (max-width: 420px) {
    .df-review-figma-dev-widget {
      right: calc(10px + env(safe-area-inset-right));
      bottom: calc(10px + env(safe-area-inset-bottom));
    }

    .df-review-figma-dev-selected-controls {
      grid-template-columns: 1fr;
    }
  }
`;
