import { figmaDevOverlayStyle } from './dev.overlay.style';
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
import { isEditableEventTarget, isHotkey } from '../../core/hotkey';
import { normalizeTarget } from '../route';
import { bindReviewPageShortcut } from '../review.page.shortcut';
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
  /** Show the widget immediately when mounting after an explicit login action. */
  initiallyVisible?: boolean;
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
  initiallyVisible = false,
}: FigmaDevOverlayMountOptions) => {
  useEffect(() => {
    if (window.self !== window.top) return;
    return bindReviewPageShortcut(reviewPathPrefix);
  }, [reviewPathPrefix]);
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
  const [isWidgetVisible, setIsWidgetVisible] = useState(initiallyVisible);
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
      if (!isHotkey(event, 'Shift+F') || isEditableEventTarget(event)) {
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

  return normalizeTarget(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
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
