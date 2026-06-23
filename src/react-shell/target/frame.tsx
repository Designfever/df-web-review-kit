import type { RefObject } from 'react';
import type { ReviewMode } from '../../types';
import type {
  ReviewRulerMeasure,
  ReviewRulerPoint,
  ReviewShellViewportPreset,
} from '../types';
import { ReviewModeToolbar } from '../review/mode.toolbar';
import { RulerGutters } from '../ruler/gutters';
import { RulerOverlay } from '../ruler/overlay';

interface ReviewTargetFrameProps {
  canWriteArea: boolean;
  canWriteDom: boolean;
  frameScrollRef: RefObject<HTMLDivElement | null>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isRulerAvailable: boolean;
  isRulerDragging: boolean;
  isRulerVisible: boolean;
  mode: ReviewMode;
  rulerHover: ReviewRulerPoint | null;
  rulerMeasure: ReviewRulerMeasure | undefined;
  rulerMeasureLabel: string;
  rulerOverlayRef: RefObject<HTMLDivElement | null>;
  rulerScaleX: number;
  rulerScaleY: number;
  rulerUnit: string;
  size: ReviewShellViewportPreset;
  targetSrc: string;
  onLoadTarget: () => void;
  onSetReviewMode: (mode: ReviewMode) => void;
}

export const ReviewTargetFrame = ({
  canWriteArea,
  canWriteDom,
  frameScrollRef,
  iframeRef,
  isRulerAvailable,
  isRulerDragging,
  isRulerVisible,
  mode,
  rulerHover,
  rulerMeasure,
  rulerMeasureLabel,
  rulerOverlayRef,
  rulerScaleX,
  rulerScaleY,
  rulerUnit,
  size,
  targetSrc,
  onLoadTarget,
  onSetReviewMode,
}: ReviewTargetFrameProps) => {
  const showRuler = isRulerVisible && isRulerAvailable;

  return (
    <main className="df-review-stage">
      <div className="df-review-frame">
        <div className="df-review-frame-scroll" ref={frameScrollRef}>
          <div className="df-review-frame-canvas">
            <div
              className={`df-review-device-frame${
                showRuler ? ' is-ruler' : ''
              }`}
            >
              {showRuler && (
                <RulerGutters
                  rulerHover={rulerHover}
                  rulerScaleX={rulerScaleX}
                  rulerScaleY={rulerScaleY}
                  rulerUnit={rulerUnit}
                  size={size}
                />
              )}
              <div
                className="df-review-device"
                style={{
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                  minWidth: `${size.width}px`,
                  minHeight: `${size.height}px`,
                }}
              >
                <iframe
                  key={targetSrc}
                  ref={iframeRef}
                  width={size.width}
                  height={size.height}
                  src={targetSrc}
                  title="Review target"
                  onLoad={onLoadTarget}
                />
                {showRuler && (
                  <RulerOverlay
                    iframeRef={iframeRef}
                    isRulerDragging={isRulerDragging}
                    rulerHover={rulerHover}
                    rulerMeasure={rulerMeasure}
                    rulerMeasureLabel={rulerMeasureLabel}
                    rulerOverlayRef={rulerOverlayRef}
                    size={size}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="df-review-frame-actions">
          <ReviewModeToolbar
            canWriteArea={canWriteArea}
            canWriteDom={canWriteDom}
            mode={mode}
            onSetReviewMode={onSetReviewMode}
          />
        </div>
      </div>
    </main>
  );
};
