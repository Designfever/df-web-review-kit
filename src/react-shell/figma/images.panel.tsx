import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useRef,
  useState,
} from 'react';
import {
  ExternalLink as ExternalLinkIcon,
  MoveVertical as OffsetYIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshCwIcon,
  Trash2 as TrashIcon,
  X as XIcon,
} from 'lucide-react';
import type { ReviewFigmaImage } from '../../figma/image.types';
import type {
  ReviewFigmaImageOverlayItemState,
} from './image.controller';
import {
  DEFAULT_FIGMA_IMAGE_LAYER_STATE,
  formatFigmaImageDate,
  getFigmaImageLabel,
  getFigmaImageLayerStatusLabel,
  getPointerFigmaImageTargetId,
  getReorderedFigmaImageIds,
  getSnappedOpacityPercent,
  isInteractiveFigmaImageTarget,
} from './image-panel.utils';
import { FigmaImageLayerStateButtons } from './layer-state-buttons';
import { ReviewSpinner } from '../review/spinner';

const FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS = 6;

interface FigmaImagesPanelProps {
  error: string;
  images: ReviewFigmaImage[];
  imageOverlayStates: Record<string, ReviewFigmaImageOverlayItemState>;
  isListVisible: boolean;
  isLoading: boolean;
  isMutating: boolean;
  selectedImageId: string | null;
  onAddImage: (
    figmaUrl: string,
    label?: string
  ) => Promise<ReviewFigmaImage | null>;
  onDeleteImage: (id: string) => Promise<void>;
  onRefreshImages: () => Promise<ReviewFigmaImage[]>;
  onReorderImages: (imageIds: string[]) => Promise<void>;
  onSelectImage: (id: string) => void;
  onSetImageOverlayOffsetY: (id: string, offsetY: number) => void;
  onSetImageOverlayOpacity: (id: string, opacity: number) => void;
  onToggleImageOverlayLocked: (id: string) => void;
  onToggleImageOverlayMode: (id: string) => void;
  onToggleImageOverlayVisible: (id: string) => void;
  onUpdateImage: (
    id: string,
    patch: { label?: string }
  ) => Promise<ReviewFigmaImage | null>;
}

export const FigmaImagesPanel = ({
  error,
  images,
  imageOverlayStates,
  isListVisible,
  isLoading,
  isMutating,
  selectedImageId,
  onAddImage,
  onDeleteImage,
  onRefreshImages,
  onReorderImages,
  onSelectImage,
  onSetImageOverlayOffsetY,
  onSetImageOverlayOpacity,
  onToggleImageOverlayLocked,
  onToggleImageOverlayMode,
  onToggleImageOverlayVisible,
  onUpdateImage,
}: FigmaImagesPanelProps) => {
  const [figmaUrlDraft, setFigmaUrlDraft] = useState('');
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingLabelDraft, setEditingLabelDraft] = useState('');
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);
  const [previewImageId, setPreviewImageId] = useState<string | null>(null);
  const pointerDragImageIdRef = useRef<string | null>(null);
  const pointerDragTargetIdRef = useRef<string | null>(null);
  const pointerDragStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerDragDidMoveRef = useRef(false);
  const opacityDragPointerIdRef = useRef<number | null>(null);
  const labelEditCancelRef = useRef(false);
  const labelInputFocusedImageIdRef = useRef<string | null>(null);
  const labelEditFinishedImageIdRef = useRef<string | null>(null);
  const [offsetYDraftByImageId, setOffsetYDraftByImageId] = useState<
    Record<string, string>
  >({});
  const selectedImageIndex = selectedImageId
    ? images.findIndex((image) => image.id === selectedImageId)
    : -1;
  const selectedImage =
    selectedImageIndex >= 0 ? images[selectedImageIndex] : null;
  const previewImage = previewImageId
    ? images.find((image) => image.id === previewImageId) ?? null
    : null;
  const selectedImageLabel = selectedImage
    ? getFigmaImageLabel(selectedImage, selectedImageIndex)
    : 'Select layer';
  const selectedOverlayState = selectedImage
    ? imageOverlayStates[selectedImage.id] ?? DEFAULT_FIGMA_IMAGE_LAYER_STATE
    : DEFAULT_FIGMA_IMAGE_LAYER_STATE;
  const selectedOpacityPercent = selectedImage
    ? getSnappedOpacityPercent(selectedOverlayState.opacity)
    : 0;
  const selectedOpacityThumbOffset =
    FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS *
    (1 - (selectedOpacityPercent / 100) * 2);
  const selectedOffsetYDraft = selectedImage
    ? offsetYDraftByImageId[selectedImage.id] ??
      String(selectedOverlayState.offsetY)
    : '';
  const statusText = error
    ? error
    : '';
  const progressText = isMutating ? 'Saving...' : isLoading ? 'Loading...' : '';
  const draggingImageIndex = draggingImageId
    ? images.findIndex((image) => image.id === draggingImageId)
    : -1;
  const finishEditingImageLabel = (
    imageId: string,
    currentLabel: string
  ) => {
    if (labelEditFinishedImageIdRef.current === imageId) return;

    labelEditFinishedImageIdRef.current = imageId;
    labelInputFocusedImageIdRef.current = null;
    const nextLabel = editingLabelDraft;
    setEditingImageId(null);
    setEditingLabelDraft('');
    if (nextLabel === currentLabel) return;

    void onUpdateImage(imageId, {
      label: nextLabel,
    });
  };
  const updateSelectedImageOpacity = (value: string) => {
    if (!selectedImage) return;
    const opacityPercent = Math.max(
      0,
      Math.min(100, Math.round(Number(value) / 10) * 10)
    );
    if (Number.isFinite(opacityPercent)) {
      onSetImageOverlayOpacity(selectedImage.id, opacityPercent / 100);
    }
  };
  const updateSelectedImageOpacityFromClientX = (
    clientX: number,
    sliderElement: HTMLDivElement
  ) => {
    if (!selectedImage) return;

    const rect = sliderElement.getBoundingClientRect();
    if (rect.width <= 0) return;

    const trackStart = rect.left + FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS;
    const trackWidth = Math.max(
      1,
      rect.width - FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS * 2
    );
    const endpointInset = FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS * 2;
    const rawPercent = ((clientX - trackStart) / trackWidth) * 100;
    let opacityPercent = Math.max(
      0,
      Math.min(100, Math.round(rawPercent / 10) * 10)
    );
    if (clientX <= rect.left + endpointInset) {
      opacityPercent = 0;
    } else if (clientX >= rect.right - endpointInset) {
      opacityPercent = 100;
    }
    onSetImageOverlayOpacity(selectedImage.id, opacityPercent / 100);
  };
  const updateSelectedImageOpacityFromPointer = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    updateSelectedImageOpacityFromClientX(event.clientX, event.currentTarget);
  };
  const updateSelectedImageOpacityFromMouse = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    updateSelectedImageOpacityFromClientX(event.clientX, event.currentTarget);
  };

  return (
    <aside
      className="df-review-figma-images-panel"
      aria-hidden={!isListVisible}
      onPointerDownCapture={(event) => {
        if (
          !editingImageId ||
          (event.target instanceof Element &&
            event.target.closest('.df-review-figma-image-label-input'))
        ) {
          return;
        }

        const editingImage = images.find((image) => image.id === editingImageId);
        if (!editingImage) return;
        finishEditingImageLabel(editingImage.id, editingImage.label ?? '');
      }}
    >
      <form
        className="df-review-figma-image-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onAddImage(figmaUrlDraft).then((image) => {
            if (!image) return;
            setFigmaUrlDraft('');
          });
        }}
      >
        <div className="df-review-figma-images-header">
          <div className="df-review-figma-images-title">
            <strong>Figma</strong>
          </div>
          <button
            aria-label="Refresh Figma images"
            className="df-review-figma-image-header-button"
            disabled={isLoading || isMutating}
            title="Refresh"
            type="button"
            onClick={() => void onRefreshImages()}
          >
            <RefreshCwIcon aria-hidden="true" />
          </button>
        </div>
        <div className="df-review-figma-image-url-row">
          <input
            aria-label="Figma URL"
            autoComplete="off"
            placeholder="Figma URL"
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

      <div
        aria-label="Selected Figma image layer controls"
        className="df-review-figma-image-selected-controls"
      >
        <div className="df-review-figma-image-selected-numbers">
          <label className="df-review-figma-image-opacity-control">
            <span>Opacity</span>
            <div
              className="df-review-figma-image-opacity-slider"
              style={{
                '--df-review-figma-opacity-value': `${selectedOpacityPercent}%`,
                '--df-review-figma-opacity-left': `calc(${selectedOpacityPercent}% + ${selectedOpacityThumbOffset}px)`,
              } as CSSProperties}
              onPointerCancel={() => {
                opacityDragPointerIdRef.current = null;
              }}
              onPointerDown={(event) => {
                if (!selectedImage) return;

                opacityDragPointerIdRef.current = event.pointerId;
                event.currentTarget.setPointerCapture(event.pointerId);
                event.currentTarget.querySelector('input')?.focus();
                updateSelectedImageOpacityFromPointer(event);
              }}
              onPointerMove={(event) => {
                if (opacityDragPointerIdRef.current !== event.pointerId) return;

                updateSelectedImageOpacityFromPointer(event);
              }}
              onPointerUp={(event) => {
                if (opacityDragPointerIdRef.current !== event.pointerId) return;

                updateSelectedImageOpacityFromPointer(event);
                opacityDragPointerIdRef.current = null;
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
              onMouseDown={updateSelectedImageOpacityFromMouse}
              onMouseMove={(event) => {
                if (event.buttons !== 1) return;

                updateSelectedImageOpacityFromMouse(event);
              }}
              onMouseUp={updateSelectedImageOpacityFromMouse}
              onClick={updateSelectedImageOpacityFromMouse}
            >
              <input
                aria-label={`${selectedImageLabel} overlay opacity`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={selectedOpacityPercent}
                disabled={!selectedImage}
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
            </div>
            <strong>{selectedOpacityPercent}</strong>
          </label>
          <label className="df-review-figma-image-number-control">
            <OffsetYIcon aria-hidden="true" />
            <input
              aria-label={`${selectedImageLabel} overlay Y offset`}
              disabled={!selectedImage}
              inputMode="numeric"
              step="1"
              type="number"
              value={selectedOffsetYDraft}
              onBlur={() => {
                if (!selectedImage) return;
                setOffsetYDraftByImageId((currentDrafts) => {
                  const nextDrafts = { ...currentDrafts };
                  delete nextDrafts[selectedImage.id];
                  return nextDrafts;
                });
              }}
              onChange={(event) => {
                if (!selectedImage) return;
                const value = event.currentTarget.value;
                const offsetY = Number(value);
                setOffsetYDraftByImageId((currentDrafts) => ({
                  ...currentDrafts,
                  [selectedImage.id]: value,
                }));
                if (value.trim() !== '' && Number.isFinite(offsetY)) {
                  onSetImageOverlayOffsetY(selectedImage.id, offsetY);
                }
              }}
            />
          </label>
          {selectedImage ? (
            <button
              aria-label={`Preview ${selectedImageLabel} Figma image`}
              className="df-review-figma-image-selected-link"
              title="Preview Figma image"
              type="button"
              onClick={() => setPreviewImageId(selectedImage.id)}
            >
              <ExternalLinkIcon aria-hidden="true" />
            </button>
          ) : (
            <button
              aria-label="Open Figma node"
              className="df-review-figma-image-selected-link"
              disabled
              title="Open Figma node"
              type="button"
            >
              <ExternalLinkIcon aria-hidden="true" />
            </button>
          )}
        </div>
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
        {progressText && (
          <div
            aria-live="polite"
            className="df-review-figma-image-card is-status"
            role="status"
          >
            <ReviewSpinner className="df-review-figma-image-spinner" />
            <div className="df-review-figma-image-card-main">
              <strong>{progressText}</strong>
            </div>
          </div>
        )}
        {images.length === 0 && !isLoading && !isMutating && (
          <p className="df-review-empty">No Figma images on this viewport.</p>
        )}
        {images.map((image, index) => {
          const imageLabel = getFigmaImageLabel(image, index);
          const overlayState =
            imageOverlayStates[image.id] ?? DEFAULT_FIGMA_IMAGE_LAYER_STATE;
          const isDragging = draggingImageId === image.id;
          const isDropTarget =
            dragOverImageId === image.id && draggingImageId !== image.id;
          const isDropBefore = isDropTarget && draggingImageIndex > index;
          const isDropAfter =
            isDropTarget && draggingImageIndex >= 0 && draggingImageIndex < index;

          return (
            <article
              data-figma-image-id={image.id}
              className={`df-review-figma-image-card${
                image.id === selectedImageId ? ' is-active' : ''
              }${editingImageId === image.id ? ' is-editing' : ''}${
                isDragging ? ' is-dragging' : ''
              }${isDropTarget ? ' is-drop-target' : ''}${
                isDropBefore ? ' is-drop-before' : ''
              }${isDropAfter ? ' is-drop-after' : ''}`}
              key={image.id}
              onClick={() => {
                if (pointerDragDidMoveRef.current) {
                  pointerDragDidMoveRef.current = false;
                  return;
                }
                onSelectImage(image.id);
              }}
              onPointerCancel={() => {
                pointerDragImageIdRef.current = null;
                pointerDragTargetIdRef.current = null;
                pointerDragStartRef.current = null;
                setDraggingImageId(null);
                setDragOverImageId(null);
              }}
              onPointerDown={(event: PointerEvent<HTMLElement>) => {
                if (
                  event.button !== 0 ||
                  isMutating ||
                  editingImageId === image.id ||
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
              }}
              onPointerMove={(event) => {
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
              }}
              onPointerUp={(event) => {
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
              }}
            >
              <FigmaImageLayerStateButtons
                imageLabel={imageLabel}
                overlayState={overlayState}
                title={getFigmaImageLayerStatusLabel(overlayState)}
                onSelect={() => onSelectImage(image.id)}
                onToggleLocked={() => onToggleImageOverlayLocked(image.id)}
                onToggleMode={() => onToggleImageOverlayMode(image.id)}
                onToggleVisible={() => onToggleImageOverlayVisible(image.id)}
              />
              <div className="df-review-figma-image-card-main">
                {editingImageId === image.id ? (
                  <input
                    aria-label="Selected Figma image label"
                    autoComplete="off"
                    autoFocus
                    className="df-review-figma-image-label-input"
                    disabled={isMutating}
                    placeholder="Label"
                    ref={(element) => {
                      if (
                        !element ||
                        labelInputFocusedImageIdRef.current === image.id
                      ) {
                        return;
                      }

                      labelInputFocusedImageIdRef.current = image.id;
                      element.focus();
                      element.select();
                    }}
                    spellCheck={false}
                    value={editingLabelDraft}
                    onBlur={() => {
                      if (labelEditCancelRef.current) {
                        labelEditCancelRef.current = false;
                        labelInputFocusedImageIdRef.current = null;
                        labelEditFinishedImageIdRef.current = image.id;
                        setEditingImageId(null);
                        setEditingLabelDraft('');
                        return;
                      }

                      finishEditingImageLabel(image.id, image.label ?? '');
                    }}
                    onChange={(event) =>
                      setEditingLabelDraft(event.currentTarget.value)
                    }
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        event.currentTarget.blur();
                        return;
                      }

                      if (event.key === 'Escape') {
                        labelEditCancelRef.current = true;
                        event.currentTarget.blur();
                      }
                    }}
                  />
                ) : (
                  <strong>{imageLabel}</strong>
                )}
                <small>{formatFigmaImageDate(image.updatedAt)}</small>
              </div>
              <div className="df-review-figma-image-card-actions">
                <button
                  aria-label={`Edit ${imageLabel} label`}
                  className="df-review-figma-image-icon-button"
                  disabled={isMutating}
                  title="Edit label"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectImage(image.id);
                    labelEditCancelRef.current = false;
                    labelInputFocusedImageIdRef.current = null;
                    labelEditFinishedImageIdRef.current = null;
                    setEditingImageId(image.id);
                    setEditingLabelDraft(image.label ?? '');
                  }}
                >
                  <PencilIcon aria-hidden="true" />
                </button>
                <button
                  aria-label="Delete Figma image"
                  className="df-review-figma-image-icon-button is-danger"
                  disabled={isMutating}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void onDeleteImage(image.id);
                  }}
                >
                  <TrashIcon aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {previewImage && (
        <FigmaImagePreviewModal
          image={previewImage}
          label={getFigmaImageLabel(previewImage, images.indexOf(previewImage))}
          onClose={() => setPreviewImageId(null)}
        />
      )}
    </aside>
  );
};

interface FigmaImagePreviewModalProps {
  image: ReviewFigmaImage;
  label: string;
  onClose: () => void;
}

const FigmaImagePreviewModal = ({
  image,
  label,
  onClose,
}: FigmaImagePreviewModalProps) => {
  return (
    <div
      aria-label={`${label} Figma image preview`}
      aria-modal="true"
      className="df-review-prompt-modal"
      role="dialog"
    >
      <button
        aria-label="Close Figma image preview"
        className="df-review-prompt-backdrop"
        type="button"
        onClick={onClose}
      />
      <div className="df-review-prompt-dialog df-review-figma-image-preview-dialog">
        <div className="df-review-figma-image-preview-header">
          <input
            aria-label="Figma URL"
            readOnly
            spellCheck={false}
            value={image.figmaUrl}
          />
          <a
            aria-label={`Open ${label} Figma node`}
            className="df-review-figma-image-preview-link"
            href={image.figmaUrl}
            rel="noreferrer"
            target="_blank"
          >
            <span>Open Figma</span>
            <ExternalLinkIcon aria-hidden="true" />
          </a>
          <button
            aria-label="Close Figma image preview"
            className="df-review-figma-image-preview-close"
            type="button"
            onClick={onClose}
          >
            <XIcon aria-hidden="true" />
          </button>
        </div>
        <div className="df-review-figma-image-preview-scroll">
          <img alt={label} src={image.imageUrl} />
        </div>
      </div>
    </div>
  );
};
