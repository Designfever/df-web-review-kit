import { useState, type DragEvent, type ReactNode } from 'react';
import { Plus as PlusIcon, RefreshCw as RefreshCwIcon } from 'lucide-react';
import type { ReviewFigmaImage, ReviewFigmaImageAssetInput } from '../../figma/image.types';
import {
  createReviewImageAssetFromFile,
  createReviewImageAssetFromUrl,
  isReviewImageUrl,
} from '../../figma/image.import';

interface FigmaImagesImportProps {
  error: string;
  isLoading: boolean;
  isMutating: boolean;
  onAddImage: (source: string, label?: string, asset?: ReviewFigmaImageAssetInput) => Promise<ReviewFigmaImage | null>;
  onRefreshImages: () => Promise<ReviewFigmaImage[]>;
  /** Selected-layer controls retain their existing position between form and status. */
  children: ReactNode;
}

export const FigmaImagesImport = ({
  error, isLoading, isMutating, onAddImage, onRefreshImages, children,
}: FigmaImagesImportProps) => {
  const [figmaUrlDraft, setFigmaUrlDraft] = useState('');
  const [importError, setImportError] = useState('');
  const [isImportDragActive, setIsImportDragActive] = useState(false);
  const statusText = importError || error;
  const addImageSource = async (source: string, file?: File) => {
    setImportError('');
    try {
      const asset = file
        ? await createReviewImageAssetFromFile(file)
        : isReviewImageUrl(source)
          ? await createReviewImageAssetFromUrl(source)
          : undefined;
      const image = await onAddImage(
        source,
        file?.name.replace(/\.[^.]+$/, ''),
        asset
      );
      if (image) setFigmaUrlDraft('');
    } catch (addError) {
      setImportError(
        addError instanceof Error ? addError.message : 'Image import failed.'
      );
    }
  };
  const handleImageFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsImportDragActive(false);
    const file = event.dataTransfer.files[0];
    if (!file) return;
    void addImageSource(file.name, file);
  };

  return (
    <>
      <form
        className="df-review-figma-image-form"
        onSubmit={(event) => {
          event.preventDefault();
          void addImageSource(figmaUrlDraft);
        }}
      >
        <div className="df-review-figma-images-header">
          <div className="df-review-figma-images-title">
            <strong>Figma</strong>
          </div>
          <button
            aria-label="Refresh Figma images"
            className="df-review-figma-image-header-button"
            data-review-tooltip="Refresh Figma images"
            disabled={isLoading || isMutating}
            title="Refresh"
            type="button"
            onClick={() => void onRefreshImages()}
          >
            <RefreshCwIcon aria-hidden="true" />
          </button>
        </div>
        <div
          className={`df-review-figma-image-url-row${
            isImportDragActive ? ' is-drag-active' : ''
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsImportDragActive(true);
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node)) return;
            setIsImportDragActive(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={handleImageFileDrop}
        >
          <input
            aria-label="Figma or image URL"
            autoComplete="off"
            placeholder="Figma or image URL · drop image"
            required
            spellCheck={false}
            value={figmaUrlDraft}
            onChange={(event) => {
              setImportError('');
              setFigmaUrlDraft(event.currentTarget.value);
            }}
          />
          <button
            aria-label="Add Figma image"
            data-review-tooltip="Add Figma image"
            disabled={isMutating || figmaUrlDraft.trim().length === 0}
            type="submit"
          >
            <PlusIcon aria-hidden="true" />
          </button>
        </div>
      </form>
      {children}
      {statusText && (
        <p
          className={`df-review-figma-image-status${
            error ? ' is-error' : ''
          }`}
        >
          {statusText}
        </p>
      )}
    </>
  );
};
