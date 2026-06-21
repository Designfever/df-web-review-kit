import type { RefObject } from 'react';
import type {
  ReviewRulerMeasure,
  ReviewRulerPoint,
  ReviewShellViewportPreset,
} from '../types';

interface RulerOverlayProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isRulerDragging: boolean;
  rulerHover: ReviewRulerPoint | null;
  rulerMeasure: ReviewRulerMeasure | undefined;
  rulerMeasureLabel: string;
  rulerOverlayRef: RefObject<HTMLDivElement | null>;
  size: ReviewShellViewportPreset;
}

export const RulerOverlay = ({
  iframeRef,
  isRulerDragging,
  rulerHover,
  rulerMeasure,
  rulerMeasureLabel,
  rulerOverlayRef,
  size,
}: RulerOverlayProps) => {
  return (
    <div
      ref={rulerOverlayRef}
      aria-label="Ruler"
      className={`df-review-ruler-overlay${
        isRulerDragging ? ' is-dragging' : ''
      }`}
      role="application"
      onWheel={(event) => {
        iframeRef.current?.contentWindow?.scrollBy(
          event.deltaX,
          event.deltaY
        );
      }}
    >
      {rulerHover && (
        <>
          <div
            className="df-review-ruler-guide is-x"
            aria-hidden="true"
            style={{ top: `${rulerHover.y}px` }}
          />
          <div
            className="df-review-ruler-guide is-y"
            aria-hidden="true"
            style={{ left: `${rulerHover.x}px` }}
          />
        </>
      )}
      {rulerMeasure &&
        (rulerMeasure.width > 0 || rulerMeasure.height > 0) && (
          <>
            <div
              className="df-review-ruler-selection"
              aria-hidden="true"
              style={{
                left: `${rulerMeasure.left}px`,
                top: `${rulerMeasure.top}px`,
                width: `${rulerMeasure.width}px`,
                height: `${rulerMeasure.height}px`,
              }}
            />
            <div
              className="df-review-ruler-label"
              style={{
                left: `${Math.min(
                  Math.max(rulerMeasure.left + rulerMeasure.width + 8, 8),
                  Math.max(8, size.width - 164)
                )}px`,
                top: `${Math.min(
                  Math.max(rulerMeasure.top + rulerMeasure.height + 8, 8),
                  Math.max(8, size.height - 34)
                )}px`,
              }}
            >
              {rulerMeasureLabel}
            </div>
          </>
        )}
    </div>
  );
};
