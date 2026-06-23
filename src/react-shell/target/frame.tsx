import type { RefObject } from 'react';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
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
  figmaFrameUrl: string | null;
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
  figmaFrameUrl,
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
              <div className="df-review-frame-link-stack">
                <a
                  aria-label="Open target page"
                  className="df-review-frame-link is-target"
                  href={targetSrc}
                  rel="noreferrer"
                  target="_blank"
                  title="Open target page"
                >
                  <ExternalLinkIcon aria-hidden="true" />
                </a>
                {figmaFrameUrl && (
                  <a
                    aria-label="Open Figma frame"
                    className="df-review-frame-link is-figma"
                    href={figmaFrameUrl}
                    rel="noreferrer"
                    target="_blank"
                    title="Open Figma frame"
                  >
                    <FigmaIcon />
                  </a>
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

const FigmaIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441C12.735 21.964 10.688 24 8.172 24zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" />
  </svg>
);
