import { useCallback, useEffect, type RefObject } from 'react';
import { getTargetOverlayState } from '../target/target';
import type {
  TargetOverlayKey,
  TargetOverlayState,
} from '../types';

interface UseReviewTargetOverlayOptions {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isFigmaOverlayAvailable: boolean;
  targetOverlayState: TargetOverlayState;
  onTargetOverlayStateChange: (state: TargetOverlayState) => void;
}

export const useReviewTargetOverlay = ({
  iframeRef,
  isFigmaOverlayAvailable,
  targetOverlayState,
  onTargetOverlayStateChange,
}: UseReviewTargetOverlayOptions) => {
  const refreshTargetOverlayState = useCallback(() => {
    onTargetOverlayStateChange(
      getTargetOverlayState(iframeRef.current?.contentDocument ?? undefined)
    );
  }, [iframeRef, onTargetOverlayStateChange]);

  const dispatchTargetOverlayHotkey = useCallback(
    (overlay: TargetOverlayKey) => {
      const targetWindow = iframeRef.current?.contentWindow;
      if (!targetWindow) return false;

      const code = overlay === 'grid' ? 'KeyG' : 'KeyF';
      targetWindow.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          code,
          key: code.replace('Key', '').toLowerCase(),
          shiftKey: true,
        })
      );
      window.setTimeout(refreshTargetOverlayState, 80);
      return true;
    },
    [iframeRef, refreshTargetOverlayState]
  );

  const toggleTargetOverlay = useCallback(
    (overlay: TargetOverlayKey) => {
      if (overlay === 'figma' && !isFigmaOverlayAvailable) {
        refreshTargetOverlayState();
        return;
      }

      dispatchTargetOverlayHotkey(overlay);
    },
    [
      dispatchTargetOverlayHotkey,
      isFigmaOverlayAvailable,
      refreshTargetOverlayState,
    ]
  );

  const closeTargetOverlay = useCallback(
    (overlay: TargetOverlayKey) => {
      const currentState = getTargetOverlayState(
        iframeRef.current?.contentDocument ?? undefined
      );
      onTargetOverlayStateChange(currentState);
      if (!currentState[overlay]) return false;

      return dispatchTargetOverlayHotkey(overlay);
    },
    [dispatchTargetOverlayHotkey, iframeRef, onTargetOverlayStateChange]
  );

  useEffect(() => {
    if (isFigmaOverlayAvailable || !targetOverlayState.figma) return;
    closeTargetOverlay('figma');
  }, [closeTargetOverlay, isFigmaOverlayAvailable, targetOverlayState.figma]);

  return {
    closeTargetOverlay,
    refreshTargetOverlayState,
    toggleTargetOverlay,
  };
};
