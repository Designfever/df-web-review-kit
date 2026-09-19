import { useState } from 'react';
import { trackReviewEvent } from '../../analytics';
import { useReviewSettingsState } from './settings.context';
import { useReviewShellRefs } from '../store/shell.refs';
import { screenCaptureSessions } from '../target/screen.capture';
import {
  Scan as ScanIcon,
  MousePointerClick as ElementQaIcon,
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
  const { captureMethod } = useReviewSettingsState();
  const { iframeRef } = useReviewShellRefs();
  const [pending, setPending] = useState(false);
  const selectMode = async (nextMode: ReviewMode) => {
    trackReviewEvent('click', {
      panelId: 'qa',
      controlId: `${nextMode}-mode`,
      action: 'select-review-mode',
    });
    if (captureMethod === 'browser') {
      const frame = iframeRef.current;
      const session = frame && screenCaptureSessions.get(frame);
      if (!session) return;
      setPending(true);
      try {
        if (!await session.ensureStarted()) return;
      } finally {
        setPending(false);
      }
    }
    onSetReviewMode(nextMode);
  };
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
          disabled={pending}
          onClick={() => void selectMode('element')}
        >
          <ElementQaIcon aria-hidden="true" />
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
          disabled={pending}
          onClick={() => void selectMode('area')}
        >
          <ScanIcon aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
