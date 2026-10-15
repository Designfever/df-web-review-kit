import {
  useMemo,
  useCallback,
} from 'react';
import { useReviewFigmaImagesState } from '../figma/images.context';
import { buildTargetSrc } from '../route';
import { ScreenCaptureControl } from './screen.capture.control';
import { ReviewModeToolbar } from '../review/mode.toolbar';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellRefs } from '../store/shell.refs';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import {
  useTargetFigmaImageOverlays,
} from './figma.image.overlay';
import { ReviewOutsideMarkers } from './outside.markers';
import { useCustomPanelRegistry } from '../custom-panels/context';
import { useFrameZoom } from './use.frame.zoom';

export const ReviewTargetFrame = () => {
  const {
    figmaImageOverlays,
    setImageOverlayOffsetY,
  } = useReviewFigmaImagesState();
  const { loadTargetFrame, setReviewMode } = useReviewShellActions();
  const { frameScrollRef, iframeRef } = useReviewShellRefs();
  const customPanels = useCustomPanelRegistry();
  const setFrame = useCallback((frame: HTMLIFrameElement | null) => {
    customPanels.setFrame(frame);
    iframeRef.current = frame;
  }, [customPanels, iframeRef]);
  const { canWriteArea, canWriteDom } = useReviewShellAdapterState();
  const mode = useReviewShellStore((state) => state.mode);
  const frameNavigationVersion = useReviewShellStore(
    (state) => state.frameNavigationVersion
  );
  const frameTarget = useReviewShellStore((state) => state.frameTarget);
  const size = useReviewShellStore((state) => state.size);
  const { scale } = useFrameZoom(
    frameScrollRef, size.width, size.height
  );
  const target = useReviewShellStore((state) => state.target);
  const targetSrc = useMemo(() => buildTargetSrc(target), [target]);
  const frameTargetSrc = useMemo(
    () => buildTargetSrc(frameTarget),
    [frameTarget]
  );
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
                className="df-review-device-frame"
                style={{ width: size.width * scale, height: size.height * scale }}
              >
                <ReviewOutsideMarkers />
                <div className="df-review-device-viewport">
                  <div
                    className="df-review-device"
                    style={{
                      position: 'absolute',
                      border: 0,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      width: `${size.width}px`,
                      height: `${size.height}px`,
                      minWidth: `${size.width}px`,
                      minHeight: `${size.height}px`,
                    }}
                  >
                    <iframe
                      data-design-inspector-preview=""
                      key={`${frameTargetSrc}:${frameNavigationVersion}`}
                      ref={setFrame}
                      width={size.width}
                      height={size.height}
                      src={frameTargetSrc}
                      title="Review target"
                      onLoad={handleLoadTarget}
                    />
                  </div>
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
          <ScreenCaptureControl />
        </div>
      </div>
    </main>
  );
};
