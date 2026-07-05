import {
  useCallback,
  useState,
  type MutableRefObject,
} from 'react';
import {
  getTargetFigmaFrameConfig,
  type ReviewFigmaFrameConfig,
} from '../figma';

interface UseReviewShellTargetFigmaOptions {
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  isFigmaImageManagementEnabled: boolean;
  isViewportFigmaOverlayAvailable: boolean;
  targetSrc: string;
}

export const useReviewShellTargetFigma = ({
  iframeRef,
  isFigmaImageManagementEnabled,
  isViewportFigmaOverlayAvailable,
  targetSrc,
}: UseReviewShellTargetFigmaOptions) => {
  const [targetFigmaState, setTargetFigmaState] =
    useState<{ targetSrc: string; config: ReviewFigmaFrameConfig } | null>(null);
  const targetFigmaConfig =
    targetFigmaState?.targetSrc === targetSrc ? targetFigmaState.config : null;
  const isFigmaOverlayAvailable =
    !isFigmaImageManagementEnabled &&
    isViewportFigmaOverlayAvailable &&
    Boolean(targetFigmaConfig);
  const refreshTargetFigmaConfig = useCallback(() => {
    const config = getTargetFigmaFrameConfig(
      iframeRef.current?.contentWindow
    );
    setTargetFigmaState(config ? { targetSrc, config } : null);
  }, [iframeRef, targetSrc]);

  return {
    isFigmaOverlayAvailable,
    refreshTargetFigmaConfig,
  };
};
