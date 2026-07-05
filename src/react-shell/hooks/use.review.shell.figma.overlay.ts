import { useMemo } from 'react';
import type { ReviewFigmaImagesController } from './use.review.figma.images';
import type { ReviewFigmaOverlayState } from '../store/figma.overlay.context';
import type { TargetOverlayKey } from '../types';

interface UseReviewShellFigmaOverlayOptions {
  figmaImagesController: ReviewFigmaImagesController;
  isFigmaImageManagementEnabled: boolean;
  isFigmaOverlayAvailable: boolean;
  isTargetFigmaOverlayActive: boolean;
  onToggleTargetOverlay: (key: TargetOverlayKey) => void;
}

export const useReviewShellFigmaOverlay = ({
  figmaImagesController,
  isFigmaImageManagementEnabled,
  isFigmaOverlayAvailable,
  isTargetFigmaOverlayActive,
  onToggleTargetOverlay,
}: UseReviewShellFigmaOverlayOptions): ReviewFigmaOverlayState =>
  useMemo<ReviewFigmaOverlayState>(
    () => ({
      figmaOverlayUnavailableMessage: isFigmaImageManagementEnabled
        ? 'No Figma images on this viewport.'
        : undefined,
      isFigmaOverlayActive: isFigmaImageManagementEnabled
        ? figmaImagesController.isAnyImageOverlayVisible
        : isTargetFigmaOverlayActive,
      isFigmaOverlayAvailable: isFigmaImageManagementEnabled
        ? figmaImagesController.images.length > 0
        : isFigmaOverlayAvailable,
      toggleFigmaOverlay: isFigmaImageManagementEnabled
        ? figmaImagesController.toggleAllImageOverlayVisible
        : () => onToggleTargetOverlay('figma'),
    }),
    [
      figmaImagesController.images.length,
      figmaImagesController.isAnyImageOverlayVisible,
      figmaImagesController.toggleAllImageOverlayVisible,
      isFigmaImageManagementEnabled,
      isFigmaOverlayAvailable,
      isTargetFigmaOverlayActive,
      onToggleTargetOverlay,
    ]
  );
