import {
  Contrast as InvertIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
} from 'lucide-react';
import type { ReviewFigmaImageOverlayItemState } from './image.overlay.controller';

interface FigmaImageLayerStateButtonsProps {
  imageLabel: string;
  overlayState: ReviewFigmaImageOverlayItemState;
  title?: string;
  onSelect?: () => void;
  onToggleLocked: () => void;
  onToggleMode: () => void;
  onToggleVisible: () => void;
}

export const FigmaImageLayerStateButtons = ({
  imageLabel,
  overlayState,
  title,
  onSelect,
  onToggleLocked,
  onToggleMode,
  onToggleVisible,
}: FigmaImageLayerStateButtonsProps) => {
  const handleAction = (action: () => void) => {
    onSelect?.();
    action();
  };

  return (
    <div
      aria-label={`${imageLabel} overlay state`}
      className="df-review-figma-image-layer-state"
      title={title}
    >
      <button
        aria-label={
          overlayState.isVisible
            ? `Hide ${imageLabel} overlay`
            : `Show ${imageLabel} overlay`
        }
        aria-pressed={overlayState.isVisible}
        className={`df-review-figma-image-state-button${
          overlayState.isVisible ? ' is-active' : ''
        }`}
        data-review-tooltip={overlayState.isVisible ? 'Hide overlay' : 'Show overlay'}
        title={overlayState.isVisible ? 'Hide overlay' : 'Show overlay'}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleAction(onToggleVisible);
        }}
      >
        {overlayState.isVisible ? (
          <EyeIcon aria-hidden="true" />
        ) : (
          <EyeOffIcon aria-hidden="true" />
        )}
      </button>
      <button
        aria-label={
          overlayState.isLocked
            ? `Unlock ${imageLabel} overlay`
            : `Lock ${imageLabel} overlay`
        }
        aria-pressed={overlayState.isLocked}
        className={`df-review-figma-image-state-button${
          overlayState.isLocked ? ' is-active' : ''
        }`}
        data-review-tooltip={overlayState.isLocked ? 'Unlock' : 'Lock'}
        title={overlayState.isLocked ? 'Unlock' : 'Lock'}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleAction(onToggleLocked);
        }}
      >
        {overlayState.isLocked ? (
          <LockIcon aria-hidden="true" />
        ) : (
          <UnlockIcon aria-hidden="true" />
        )}
      </button>
      <button
        aria-label={
          overlayState.mode === 'invert'
            ? `Disable ${imageLabel} invert`
            : `Enable ${imageLabel} invert`
        }
        aria-pressed={overlayState.mode === 'invert'}
        className={`df-review-figma-image-state-button${
          overlayState.mode === 'invert' ? ' is-active' : ''
        }`}
        data-review-tooltip="Invert"
        title="Invert"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleAction(onToggleMode);
        }}
      >
        <InvertIcon aria-hidden="true" />
      </button>
    </div>
  );
};
