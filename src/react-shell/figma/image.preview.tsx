import { ExternalLink as ExternalLinkIcon, X as XIcon } from 'lucide-react';
import type { ReviewFigmaImage } from '../../figma/image.types';

interface FigmaImagePreviewModalProps {
  image: ReviewFigmaImage;
  label: string;
  onClose: () => void;
}

export const FigmaImagePreviewModal = ({
  image,
  label,
  onClose,
}: FigmaImagePreviewModalProps) => {
  const isExternalSource = /^https?:\/\//i.test(image.figmaUrl);
  const isFigmaSource = Boolean(image.fileKey && image.nodeId);
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
          {isExternalSource && (
            <a
              aria-label={`Open ${label} source`}
              className="df-review-figma-image-preview-link"
              href={image.figmaUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span>{isFigmaSource ? 'Open Figma' : 'Open Image'}</span>
              <ExternalLinkIcon aria-hidden="true" />
            </a>
          )}
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
