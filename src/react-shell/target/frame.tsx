import {
  useMemo,
} from 'react';
import { useReviewFigmaImagesState } from '../figma/images.context';
import { buildTargetSrc } from '../route';
import { ReviewModeToolbar } from '../review/mode.toolbar';
import { RulerGutters } from '../ruler/gutters';
import { RulerOverlay } from '../ruler/overlay';
import { useReviewRulerState } from '../store/ruler.context';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellRefs } from '../store/shell.refs';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import {
  useTargetFigmaImageOverlays,
} from './figma.image.overlay';
import { ReviewOutsideMarkers } from './outside.markers';

export const ReviewTargetFrame = () => {
  const {
    figmaImageOverlays,
    setImageOverlayOffsetY,
  } = useReviewFigmaImagesState();
  const { loadTargetFrame, setReviewMode } = useReviewShellActions();
  const { frameScrollRef, iframeRef } = useReviewShellRefs();
  const { isRulerAvailable, isRulerVisible } = useReviewRulerState();
  const { canWriteArea, canWriteDom } = useReviewShellAdapterState();
  const mode = useReviewShellStore((state) => state.mode);
  const frameNavigationVersion = useReviewShellStore(
    (state) => state.frameNavigationVersion
  );
  const frameTarget = useReviewShellStore((state) => state.frameTarget);
  const size = useReviewShellStore((state) => state.size);
  const target = useReviewShellStore((state) => state.target);
  const targetSrc = useMemo(() => buildTargetSrc(target), [target]);
  const frameTargetSrc = useMemo(
    () => buildTargetSrc(frameTarget),
    [frameTarget]
  );
  const showRuler = isRulerVisible && isRulerAvailable;
  const syncTargetFigmaImageOverlays = useTargetFigmaImageOverlays({
    figmaImageOverlays,
    iframeRef,
    onSetOverlayOffsetY: setImageOverlayOffsetY,
    size,
    targetSrc,
  });
  const handleLoadTarget = () => {
    loadTargetFrame();
    syncTargetFigmaImageOverlays();
    window.requestAnimationFrame(syncTargetFigmaImageOverlays);
  };

  return (
    <main className="df-review-stage">
      <div className="df-review-frame">
        <div className="df-review-frame-scroll" ref={frameScrollRef}>
          <div className="df-review-frame-canvas">
            <div className="df-review-target-stack">
              <div
                className={`df-review-device-frame${
                  showRuler ? ' is-ruler' : ''
                }`}
              >
                {showRuler && <RulerGutters />}
                <ReviewOutsideMarkers />
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
                    key={`${frameTargetSrc}:${frameNavigationVersion}`}
                    ref={iframeRef}
                    width={size.width}
                    height={size.height}
                    src={frameTargetSrc}
                    title="Review target"
                    onLoad={handleLoadTarget}
                  />
                  {showRuler && <RulerOverlay />}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="df-review-frame-actions">
          <ReviewModeToolbar
            canWriteArea={canWriteArea}
            canWriteDom={canWriteDom}
            mode={mode}
            onSetReviewMode={setReviewMode}
          />
        </div>
      </div>
    </main>
  );
};
