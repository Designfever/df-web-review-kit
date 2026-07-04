import {
  Scan as ScanIcon,
  SquareMousePointer as SquareMousePointerIcon,
} from 'lucide-react';
import type { ReviewMode } from '../../types';

interface ReviewModeToolbarProps {
  canWriteArea: boolean;
  canWriteDom: boolean;
  mode: ReviewMode;
  onSetReviewMode: (mode: ReviewMode) => void;
}

export const ReviewModeToolbar = ({
  canWriteArea,
  canWriteDom,
  mode,
  onSetReviewMode,
}: ReviewModeToolbarProps) => {
  if (!canWriteDom && !canWriteArea) return null;

  return (
    <div className="df-review-mode" aria-label="Add QA">
      {canWriteDom && (
        <button
          aria-label="Element"
          className={`df-review-mode-button is-element${
            mode === 'element' ? ' is-active' : ''
          }`}
          data-review-tooltip="Element QA"
          type="button"
          onClick={() => onSetReviewMode('element')}
        >
          <SquareMousePointerIcon aria-hidden="true" />
        </button>
      )}
      {canWriteDom && canWriteArea && (
        <span className="df-review-mode-divider" aria-hidden="true">
          |
        </span>
      )}
      {canWriteArea && (
        <button
          aria-label="Area"
          className={`df-review-mode-button is-area${
            mode === 'area' ? ' is-active' : ''
          }`}
          data-review-tooltip="Area QA"
          type="button"
          onClick={() => onSetReviewMode('area')}
        >
          <ScanIcon aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
