import { useCallback, useEffect, useRef, type RefObject } from 'react';
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

const TARGET_OVERLAY_REFRESH_DELAYS = [80, 240, 600];

export const useReviewTargetOverlay = ({
  iframeRef,
  isFigmaOverlayAvailable,
  targetOverlayState,
  onTargetOverlayStateChange,
}: UseReviewTargetOverlayOptions) => {
  const refreshTimersRef = useRef<number[]>([]);

  const clearRefreshTimers = useCallback(() => {
    refreshTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    refreshTimersRef.current = [];
  }, []);

  const updateTargetOverlayState = useCallback(() => {
    const state = getTargetOverlayState(
      iframeRef.current?.contentDocument ?? undefined
    );
    onTargetOverlayStateChange(state);
    return state;
  }, [iframeRef, onTargetOverlayStateChange]);

  const refreshTargetOverlayState = useCallback(() => {
    clearRefreshTimers();
    updateTargetOverlayState();
    refreshTimersRef.current = TARGET_OVERLAY_REFRESH_DELAYS.map((delay) =>
      window.setTimeout(updateTargetOverlayState, delay)
    );
  }, [clearRefreshTimers, updateTargetOverlayState]);

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
      const currentState = updateTargetOverlayState();
      if (!currentState[overlay]) return false;

      return dispatchTargetOverlayHotkey(overlay);
    },
    [dispatchTargetOverlayHotkey, updateTargetOverlayState]
  );

  useEffect(() => {
    if (isFigmaOverlayAvailable || !targetOverlayState.figma) return;
    closeTargetOverlay('figma');
  }, [closeTargetOverlay, isFigmaOverlayAvailable, targetOverlayState.figma]);

  useEffect(() => clearRefreshTimers, [clearRefreshTimers]);

  return {
    closeTargetOverlay,
    refreshTargetOverlayState,
    toggleTargetOverlay,
  };
};
