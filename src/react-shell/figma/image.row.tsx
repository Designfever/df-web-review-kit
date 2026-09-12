import {
  useRef, useState,
  type ChangeEvent, type KeyboardEvent, type MouseEvent, type PointerEvent,
} from 'react';
import { Pencil as PencilIcon, Trash2 as TrashIcon } from 'lucide-react';
import type { ReviewFigmaImage } from '../../figma/image.types';
import type { ReviewFigmaImageOverlayItemState } from './image.overlay.state';
import type { useFigmaImageReorder } from './use.image.reorder';
import { formatFigmaImageDate, getFigmaImageLabel, getFigmaImageLayerStatusLabel } from './image-panel.utils';
import { FigmaImageLayerStateButtons } from './layer-state-buttons';

/** One editing session for the whole panel, including capture-before-blur commits. */
export function useFigmaImageRowEditing(
  images: ReviewFigmaImage[],
  onUpdateImage: (id: string, patch: { label?: string }) => Promise<ReviewFigmaImage | null>,
  onSelectImage: (id: string) => void
) {
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingLabelDraft, setEditingLabelDraft] = useState('');
  const labelEditCancelRef = useRef(false);
  const labelInputFocusedImageIdRef = useRef<string | null>(null);
  const labelEditFinishedImageIdRef = useRef<string | null>(null);
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
  const onPanelPointerDownCapture = (event: PointerEvent<HTMLElement>) => {
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
  };
  const startEditingImage = (image: ReviewFigmaImage) => {
    onSelectImage(image.id);
    labelEditCancelRef.current = false;
    labelInputFocusedImageIdRef.current = null;
    labelEditFinishedImageIdRef.current = null;
    setEditingImageId(image.id);
    setEditingLabelDraft(image.label ?? '');
  };
  const getLabelInputProps = (image: ReviewFigmaImage) => ({
    ref: (element: HTMLInputElement | null) => {
      if (
        !element ||
        labelInputFocusedImageIdRef.current === image.id
      ) {
        return;
      }

      labelInputFocusedImageIdRef.current = image.id;
      element.focus();
      element.select();
    },
    value: editingLabelDraft,
    onBlur: () => {
      if (labelEditCancelRef.current) {
        labelEditCancelRef.current = false;
        labelInputFocusedImageIdRef.current = null;
        labelEditFinishedImageIdRef.current = image.id;
        setEditingImageId(null);
        setEditingLabelDraft('');
        return;
      }

      finishEditingImageLabel(image.id, image.label ?? '');
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setEditingLabelDraft(event.currentTarget.value),
    onClick: (event: MouseEvent<HTMLInputElement>) => event.stopPropagation(),
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.currentTarget.blur();
        return;
      }

      if (event.key === 'Escape') {
        labelEditCancelRef.current = true;
        event.currentTarget.blur();
      }
    }
  });
  return { editingImageId, onPanelPointerDownCapture, startEditingImage, getLabelInputProps };
}

export function FigmaImageRow({
  image, index, overlayState, selectedImageId, isMutating, editing, reorder,
  onSelectImage, onDeleteImage, onToggleImageOverlayLocked,
  onToggleImageOverlayMode, onToggleImageOverlayVisible,
}: {
  image: ReviewFigmaImage;
  index: number;
  overlayState: ReviewFigmaImageOverlayItemState;
  selectedImageId: string | null;
  isMutating: boolean;
  editing: ReturnType<typeof useFigmaImageRowEditing>;
  reorder: ReturnType<typeof useFigmaImageReorder>;
  onSelectImage: (id: string) => void;
  onDeleteImage: (id: string) => Promise<void>;
  onToggleImageOverlayLocked: (id: string) => void;
  onToggleImageOverlayMode: (id: string) => void;
  onToggleImageOverlayVisible: (id: string) => void;
}) {
  const imageLabel = getFigmaImageLabel(image, index);
  const rowProps = reorder.getRowProps(image, index, editing.editingImageId === image.id);
  const { isDragging, isDropTarget, isDropBefore, isDropAfter } = rowProps;
  return (
    <article
      data-figma-image-id={image.id}
      className={`df-review-figma-image-card${image.id === selectedImageId ? ' is-active' : ''
        }${editing.editingImageId === image.id ? ' is-editing' : ''}${isDragging ? ' is-dragging' : ''
        }${isDropTarget ? ' is-drop-target' : ''}${isDropBefore ? ' is-drop-before' : ''
        }${isDropAfter ? ' is-drop-after' : ''}`}
      key={image.id}
      onClick={rowProps.onClick}
      onPointerCancel={rowProps.onPointerCancel}
      onPointerDown={rowProps.onPointerDown}
      onPointerMove={rowProps.onPointerMove}
      onPointerUp={rowProps.onPointerUp}
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
        {editing.editingImageId === image.id ? (
          <input
            aria-label="Selected Figma image label"
            autoComplete="off"
            autoFocus
            className="df-review-figma-image-label-input"
            disabled={isMutating}
            placeholder="Label"
            spellCheck={false}
            {...editing.getLabelInputProps(image)}
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
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            editing.startEditingImage(image);
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
}
