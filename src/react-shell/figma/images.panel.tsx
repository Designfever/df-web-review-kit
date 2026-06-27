import { type DragEvent, useState } from 'react';
import {
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  Check as CheckIcon,
  FileText as PageIcon,
  ExternalLink as ExternalLinkIcon,
  GripVertical as DragHandleIcon,
  Image as ImageIcon,
  Monitor as ViewportIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  Trash2 as TrashIcon,
  X as XIcon,
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
  onReorderImages: (imageIds: string[]) => Promise<void>;
  onSelectImage: (id: string) => void;
  onToggleOverlay: () => void;
  onUpdateImage: (
    id: string,
    patch: { label?: string }
  ) => Promise<ReviewFigmaImage | null>;
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
  onReorderImages,
  onSelectImage,
  onToggleOverlay,
  onUpdateImage,
}: FigmaImagesPanelProps) => {
  const [figmaUrlDraft, setFigmaUrlDraft] = useState('');
  const [labelDraft, setLabelDraft] = useState('');
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingLabelDraft, setEditingLabelDraft] = useState('');
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);
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

      <div className="df-review-figma-image-target-summary">
        <div>
          <PageIcon aria-hidden="true" />
          <span>Page</span>
          <strong>{target.pageUrl}</strong>
        </div>
        <div>
          <ViewportIcon aria-hidden="true" />
          <span>Viewport</span>
          <strong>{getFigmaTargetViewportLabel(target)}</strong>
        </div>
      </div>

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
        {images.map((image, index) => {
          const imageLabel = getFigmaImageLabel(image, index);
          const isDragging = draggingImageId === image.id;
          const isDropTarget =
            dragOverImageId === image.id && draggingImageId !== image.id;

          return (
            <article
              className={`df-review-figma-image-card${
                image.id === selectedImageId ? ' is-active' : ''
              }${editingImageId === image.id ? ' is-editing' : ''}${
                isDragging ? ' is-dragging' : ''
              }${isDropTarget ? ' is-drop-target' : ''}`}
              key={image.id}
              onDragLeave={() => {
                setDragOverImageId((currentImageId) =>
                  currentImageId === image.id ? null : currentImageId
                );
              }}
              onDragOver={(event) => {
                if (!draggingImageId || draggingImageId === image.id) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setDragOverImageId(image.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const draggedImageId =
                  draggingImageId || event.dataTransfer.getData('text/plain');
                if (!draggedImageId || draggedImageId === image.id) {
                  setDraggingImageId(null);
                  setDragOverImageId(null);
                  return;
                }

                const nextImageIds = getReorderedFigmaImageIds(
                  images,
                  draggedImageId,
                  image.id
                );
                setDraggingImageId(null);
                setDragOverImageId(null);
                void onReorderImages(nextImageIds);
              }}
            >
              <button
                aria-label={`Drag ${imageLabel}`}
                className="df-review-figma-image-drag-handle"
                disabled={images.length < 2 || isMutating}
                draggable={images.length > 1 && !isMutating}
                title="Drag to reorder"
                type="button"
                onDragEnd={() => {
                  setDraggingImageId(null);
                  setDragOverImageId(null);
                }}
                onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                  if (isMutating) {
                    event.preventDefault();
                    return;
                  }

                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', image.id);
                  setDraggingImageId(image.id);
                }}
              >
                <DragHandleIcon aria-hidden="true" />
              </button>
              <button
                aria-label={`Select ${imageLabel}`}
                className="df-review-figma-image-preview"
                type="button"
                onClick={() => onSelectImage(image.id)}
              >
                <img alt="" draggable={false} src={image.imageUrl} />
              </button>
              <div className="df-review-figma-image-card-main">
                {editingImageId === image.id ? (
                  <form
                    className="df-review-figma-image-edit-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void onUpdateImage(image.id, {
                        label: editingLabelDraft,
                      }).then((updatedImage) => {
                        if (!updatedImage) return;
                        setEditingImageId(null);
                        setEditingLabelDraft('');
                      });
                    }}
                  >
                    <input
                      aria-label="Selected Figma image label"
                      autoComplete="off"
                      autoFocus
                      placeholder="Label"
                      spellCheck={false}
                      value={editingLabelDraft}
                      onChange={(event) =>
                        setEditingLabelDraft(event.currentTarget.value)
                      }
                    />
                    <button
                      aria-label="Save Figma image label"
                      className="df-review-figma-image-icon-button"
                      disabled={isMutating}
                      title="Save"
                      type="submit"
                    >
                      <CheckIcon aria-hidden="true" />
                    </button>
                    <button
                      aria-label="Cancel Figma image label edit"
                      className="df-review-figma-image-icon-button"
                      disabled={isMutating}
                      title="Cancel"
                      type="button"
                      onClick={() => {
                        setEditingImageId(null);
                        setEditingLabelDraft('');
                      }}
                    >
                      <XIcon aria-hidden="true" />
                    </button>
                  </form>
                ) : (
                  <strong>{imageLabel}</strong>
                )}
                <span>{image.nodeId}</span>
                <small>
                  {image.imageFormat.toUpperCase()} /{' '}
                  {formatFigmaImageDate(image.updatedAt)}
                </small>
              </div>
              <div className="df-review-figma-image-card-actions">
                <button
                  aria-label={`Edit ${imageLabel} label`}
                  className="df-review-figma-image-icon-button"
                  disabled={isMutating}
                  title="Edit label"
                  type="button"
                  onClick={() => {
                    onSelectImage(image.id);
                    setEditingImageId(image.id);
                    setEditingLabelDraft(image.label ?? '');
                  }}
                >
                  <PencilIcon aria-hidden="true" />
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
                <button
                  aria-label="Move Figma image up"
                  className="df-review-figma-image-icon-button is-order-fallback"
                  disabled={index === 0 || isMutating}
                  title="Move up"
                  type="button"
                  onClick={() => void onMoveImage(image.id, 'up')}
                >
                  <ArrowUpIcon aria-hidden="true" />
                </button>
                <button
                  aria-label="Move Figma image down"
                  className="df-review-figma-image-icon-button is-order-fallback"
                  disabled={index === images.length - 1 || isMutating}
                  title="Move down"
                  type="button"
                  onClick={() => void onMoveImage(image.id, 'down')}
                >
                  <ArrowDownIcon aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
};

function getFigmaImageLabel(image: ReviewFigmaImage, index: number) {
  return image.label?.trim() || `Image ${index + 1}`;
}

function getReorderedFigmaImageIds(
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

function getFigmaTargetViewportLabel(target: ReviewFigmaRouteTarget) {
  const label = target.viewport?.label?.trim() || target.viewport?.scope;
  const size =
    typeof target.viewport?.width === 'number' &&
    typeof target.viewport?.height === 'number'
      ? `${target.viewport.width}x${target.viewport.height}`
      : '';

  return [label, size].filter(Boolean).join(' / ') || 'Viewport';
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
