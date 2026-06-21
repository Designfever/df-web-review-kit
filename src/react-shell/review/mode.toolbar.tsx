import {
  Scan as ScanIcon,
  SquareMousePointer as SquareMousePointerIcon,
  StickyNote as StickyNoteIcon,
} from 'lucide-react';
import type { ReviewMode } from '../../types';

interface ReviewModeToolbarProps {
  canWriteAny: boolean;
  canWriteArea: boolean;
  canWriteDom: boolean;
  canWriteNote: boolean;
  mode: ReviewMode;
  onSetReviewMode: (mode: ReviewMode) => void;
}

export const ReviewModeToolbar = ({
  canWriteAny,
  canWriteArea,
  canWriteDom,
  canWriteNote,
  mode,
  onSetReviewMode,
}: ReviewModeToolbarProps) => {
  if (!canWriteAny) return null;

  return (
    <div className="df-review-mode" aria-label="Add QA">
      {canWriteDom && (
        <button
          aria-label="Element"
          className={`df-review-mode-button is-element${
            mode === 'element' ? ' is-active' : ''
          }`}
          type="button"
          onClick={() => onSetReviewMode('element')}
        >
          <SquareMousePointerIcon aria-hidden="true" />
        </button>
      )}
      {canWriteDom && (canWriteNote || canWriteArea) && (
        <span className="df-review-mode-divider" aria-hidden="true">
          |
        </span>
      )}
      {canWriteNote && (
        <button
          aria-label="Note"
          className={`df-review-mode-button is-note${
            mode === 'note' ? ' is-active' : ''
          }`}
          type="button"
          onClick={() => onSetReviewMode('note')}
        >
          <StickyNoteIcon aria-hidden="true" />
        </button>
      )}
      {canWriteArea && (
        <button
          aria-label="Area"
          className={`df-review-mode-button is-area${
            mode === 'area' ? ' is-active' : ''
          }`}
          type="button"
          onClick={() => onSetReviewMode('area')}
        >
          <ScanIcon aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
