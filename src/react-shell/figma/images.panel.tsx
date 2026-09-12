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
} from 'lucide-react';
import type {
  ReviewFigmaImage,
  ReviewFigmaImageAssetInput,
} from '../../figma/image.types';
import type {
  ReviewFigmaImageOverlayItemState,
} from './use.image.overlay';
import {
  DEFAULT_FIGMA_IMAGE_LAYER_STATE,
  getFigmaImageLabel,
  getSnappedOpacityPercent,
} from './image-panel.utils';
import { FigmaImageRow, useFigmaImageRowEditing } from './image.row';
import { useFigmaImageReorder } from './use.image.reorder';
import { ReviewSpinner } from '../review/spinner';

import { FigmaImagesImport } from './images.import';
import { FigmaImagePreviewModal } from './image.preview';

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
    label?: string,
    asset?: ReviewFigmaImageAssetInput
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
  const editing = useFigmaImageRowEditing(images, onUpdateImage, onSelectImage);
  const reorder = useFigmaImageReorder(images, isMutating, onReorderImages, onSelectImage);
  const [previewImageId, setPreviewImageId] = useState<string | null>(null);
  const opacityDragPointerIdRef = useRef<number | null>(null);
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
  const progressText = isMutating ? 'Saving...' : isLoading ? 'Loading...' : '';
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
      onPointerDownCapture={editing.onPanelPointerDownCapture}
    >
      <FigmaImagesImport
        error={error}
        isLoading={isLoading}
        isMutating={isMutating}
        onAddImage={onAddImage}
        onRefreshImages={onRefreshImages}
      >
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
              data-review-tooltip="Preview Figma image"
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
              data-review-tooltip="Open Figma node"
              disabled
              title="Open Figma node"
              type="button"
            >
              <ExternalLinkIcon aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      </FigmaImagesImport>

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
        {images.map((image, index) => (
          <FigmaImageRow
            key={image.id}
            image={image}
            index={index}
            overlayState={imageOverlayStates[image.id] ?? DEFAULT_FIGMA_IMAGE_LAYER_STATE}
            selectedImageId={selectedImageId}
            isMutating={isMutating}
            editing={editing}
            reorder={reorder}
            onSelectImage={onSelectImage}
            onDeleteImage={onDeleteImage}
            onToggleImageOverlayLocked={onToggleImageOverlayLocked}
            onToggleImageOverlayMode={onToggleImageOverlayMode}
            onToggleImageOverlayVisible={onToggleImageOverlayVisible}
          />
        ))}
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
