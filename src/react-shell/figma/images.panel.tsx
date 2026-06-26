import { useState } from 'react';
import {
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  ExternalLink as ExternalLinkIcon,
  Image as ImageIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  Trash2 as TrashIcon,
} from 'lucide-react';
import type { ReviewFigmaImage } from '../../figma/image.types';
import type { ReviewFigmaRouteTarget } from '../../figma/image.types';

interface FigmaImagesPanelProps {
  error: string;
  images: ReviewFigmaImage[];
  isListVisible: boolean;
  isLoading: boolean;
  isMutating: boolean;
  isOverlayVisible: boolean;
  overlayOpacity: number;
  selectedImageId: string | null;
  target: ReviewFigmaRouteTarget;
  onAddImage: (
    figmaUrl: string,
    label?: string
  ) => Promise<ReviewFigmaImage | null>;
  onDeleteImage: (id: string) => Promise<void>;
  onMoveImage: (id: string, direction: 'up' | 'down') => Promise<void>;
  onOverlayOpacityChange: (opacity: number) => void;
  onRefreshImages: () => Promise<ReviewFigmaImage[]>;
  onSelectImage: (id: string) => void;
  onToggleOverlay: () => void;
}

export const FigmaImagesPanel = ({
  error,
  images,
  isListVisible,
  isLoading,
  isMutating,
  isOverlayVisible,
  overlayOpacity,
  selectedImageId,
  target,
  onAddImage,
  onDeleteImage,
  onMoveImage,
  onOverlayOpacityChange,
  onRefreshImages,
  onSelectImage,
  onToggleOverlay,
}: FigmaImagesPanelProps) => {
  const [figmaUrlDraft, setFigmaUrlDraft] = useState('');
  const [labelDraft, setLabelDraft] = useState('');
  const selectedImage = images.find((image) => image.id === selectedImageId);
  const canShowOverlay = Boolean(selectedImage);
  const statusText = error
    ? error
    : isMutating
      ? 'Saving...'
      : isLoading
        ? 'Loading...'
        : '';

  return (
    <aside className="df-review-figma-images-panel" aria-hidden={!isListVisible}>
      <div className="df-review-figma-images-header">
        <div className="df-review-figma-images-title">
          <strong>Figma Images</strong>
          <span>
            {target.viewport?.label ?? 'Viewport'} / {images.length}
          </span>
        </div>
        <button
          aria-label="Refresh Figma images"
          className="df-review-figma-image-icon-button"
          disabled={isLoading || isMutating}
          type="button"
          onClick={() => void onRefreshImages()}
        >
          <RefreshCwIcon aria-hidden="true" />
        </button>
      </div>

      <form
        className="df-review-figma-image-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onAddImage(figmaUrlDraft, labelDraft).then((image) => {
            if (!image) return;
            setFigmaUrlDraft('');
            setLabelDraft('');
          });
        }}
      >
        <input
          aria-label="Figma image label"
          autoComplete="off"
          placeholder="Label"
          spellCheck={false}
          value={labelDraft}
          onChange={(event) => setLabelDraft(event.currentTarget.value)}
        />
        <div className="df-review-figma-image-url-row">
          <input
            aria-label="Figma node link"
            autoComplete="off"
            placeholder="Figma node link"
            required
            spellCheck={false}
            value={figmaUrlDraft}
            onChange={(event) => setFigmaUrlDraft(event.currentTarget.value)}
          />
          <button
            aria-label="Add Figma image"
            disabled={isMutating || figmaUrlDraft.trim().length === 0}
            type="submit"
          >
            <PlusIcon aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="df-review-figma-image-overlay-controls">
        <button
          aria-pressed={isOverlayVisible}
          className={isOverlayVisible ? 'is-active' : undefined}
          disabled={!canShowOverlay}
          type="button"
          onClick={onToggleOverlay}
        >
          <ImageIcon aria-hidden="true" />
          <span>Overlay</span>
        </button>
        <label>
          <span>{Math.round(overlayOpacity * 100)}%</span>
          <input
            aria-label="Figma overlay opacity"
            disabled={!canShowOverlay}
            max="1"
            min="0.08"
            step="0.04"
            type="range"
            value={overlayOpacity}
            onChange={(event) =>
              onOverlayOpacityChange(Number(event.currentTarget.value))
            }
          />
        </label>
      </div>

      {statusText && (
        <p
          className={`df-review-figma-image-status${
            error ? ' is-error' : ''
          }`}
        >
          {statusText}
        </p>
      )}

      <div className="df-review-figma-image-list">
        {images.length === 0 && !isLoading && (
          <p className="df-review-empty">No Figma images on this viewport.</p>
        )}
        {images.map((image, index) => (
          <article
            className={`df-review-figma-image-card${
              image.id === selectedImageId ? ' is-active' : ''
            }`}
            key={image.id}
          >
            <button
              aria-label={`Select ${getFigmaImageLabel(image, index)}`}
              className="df-review-figma-image-preview"
              type="button"
              onClick={() => onSelectImage(image.id)}
            >
              <img alt="" draggable={false} src={image.imageUrl} />
            </button>
            <div className="df-review-figma-image-card-main">
              <strong>{getFigmaImageLabel(image, index)}</strong>
              <span>{image.nodeId}</span>
              <small>
                {image.imageFormat.toUpperCase()} /{' '}
                {formatFigmaImageDate(image.updatedAt)}
              </small>
            </div>
            <div className="df-review-figma-image-card-actions">
              <button
                aria-label="Move Figma image up"
                className="df-review-figma-image-icon-button"
                disabled={index === 0 || isMutating}
                type="button"
                onClick={() => void onMoveImage(image.id, 'up')}
              >
                <ArrowUpIcon aria-hidden="true" />
              </button>
              <button
                aria-label="Move Figma image down"
                className="df-review-figma-image-icon-button"
                disabled={index === images.length - 1 || isMutating}
                type="button"
                onClick={() => void onMoveImage(image.id, 'down')}
              >
                <ArrowDownIcon aria-hidden="true" />
              </button>
              <a
                aria-label="Open Figma node"
                className="df-review-figma-image-icon-button"
                href={image.figmaUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLinkIcon aria-hidden="true" />
              </a>
              <button
                aria-label="Delete Figma image"
                className="df-review-figma-image-icon-button is-danger"
                disabled={isMutating}
                type="button"
                onClick={() => void onDeleteImage(image.id)}
              >
                <TrashIcon aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
};

function getFigmaImageLabel(image: ReviewFigmaImage, index: number) {
  return image.label?.trim() || `Image ${index + 1}`;
}

function formatFigmaImageDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  }).format(date);
}
