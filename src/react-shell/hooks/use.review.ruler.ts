import {
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from 'react';
import type { ReviewRulerConfig } from '../../types';
import type { ReviewShellViewportPreset } from '../types';
import { useReviewRulerDrag } from './use.review.ruler.drag';

interface UseReviewRulerOptions {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  ruler?: ReviewRulerConfig;
  size: ReviewShellViewportPreset;
  targetSrc: string;
  onCancelReviewMode: () => void;
  onCloseTransientPanels: () => void;
}

export const useReviewRuler = ({
  iframeRef,
  ruler,
  size,
  targetSrc,
  onCancelReviewMode,
  onCloseTransientPanels,
}: UseReviewRulerOptions) => {
  const [isRulerVisible, setIsRulerVisible] = useState(false);
  const isRulerAvailable =
    ruler?.enabled !== false &&
    typeof size.designWidth === 'number' &&
    size.designWidth > 0;
  const rulerUnit = ruler?.unit ?? 'px';
  const rulerScaleX =
    isRulerAvailable && size.designWidth ? size.width / size.designWidth : 1;
  const rulerScaleY =
    size.designHeight && size.designHeight > 0
      ? size.height / size.designHeight
      : rulerScaleX;
  const {
    clearRulerMeasure,
    isRulerDragging,
    rulerHover,
    rulerMeasure,
    rulerOverlayRef,
  } = useReviewRulerDrag({
    iframeRef,
    isRulerAvailable,
    isRulerVisible,
    size,
    targetSrc,
  });
  const rulerMeasureLabel = rulerMeasure
    ? `${Math.round(rulerMeasure.width / rulerScaleX)} × ${Math.round(
        rulerMeasure.height / rulerScaleY
      )} ${rulerUnit}`
    : '';

  const closeRuler = useCallback(() => {
    if (!isRulerVisible) return false;

    setIsRulerVisible(false);
    clearRulerMeasure();
    return true;
  }, [clearRulerMeasure, isRulerVisible]);

  const toggleRuler = useCallback(() => {
    if (!isRulerAvailable) return;

    onCancelReviewMode();
    onCloseTransientPanels();
    clearRulerMeasure();
    setIsRulerVisible((current) => !current);
  }, [
    clearRulerMeasure,
    isRulerAvailable,
    onCancelReviewMode,
    onCloseTransientPanels,
  ]);

  useEffect(() => {
    if (!isRulerVisible || isRulerAvailable) return;
    closeRuler();
  }, [closeRuler, isRulerAvailable, isRulerVisible]);

  return {
    closeRuler,
    isRulerAvailable,
    isRulerDragging,
    isRulerVisible,
    rulerHover,
    rulerMeasure,
    rulerMeasureLabel,
    rulerOverlayRef,
    rulerScaleX,
    rulerScaleY,
    rulerUnit,
    toggleRuler,
  };
};
