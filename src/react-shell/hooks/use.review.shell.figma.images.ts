import {
  DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
} from '../../figma/image.types';
import {
  getReviewFigmaImageStore,
} from '../figma';
import type { ReviewFigmaImagesState } from '../figma/images.context';
import { createReviewTargetFigmaImageOverlays } from '../target/figma.image.overlay';
import type {
  ReviewShellProps,
  ReviewShellViewportPreset,
} from '../types';
import { useReviewFigmaImages } from './use.review.figma.images';

interface UseReviewShellFigmaImagesOptions {
  figmaImages: ReviewShellProps['figmaImages'];
  projectId: string;
  size: ReviewShellViewportPreset;
  target: string;
}

export const useReviewShellFigmaImages = ({
  figmaImages,
  projectId,
  size,
  target,
}: UseReviewShellFigmaImagesOptions) => {
  const figmaImageStore = getReviewFigmaImageStore(figmaImages);
  const isFigmaImageManagementEnabled = Boolean(figmaImageStore);
  const figmaImagesController = useReviewFigmaImages({
    imageFormat: figmaImages?.imageFormat ?? DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
    pageUrl: target,
    projectId,
    store: figmaImageStore,
    viewport: size,
  });
  const figmaImageOverlays = createReviewTargetFigmaImageOverlays({
    imageOverlayStates: figmaImagesController.imageOverlayStates,
    images: figmaImagesController.images,
  });
  const figmaImagesState: ReviewFigmaImagesState = {
    ...figmaImagesController,
    figmaImageOverlays,
    isEnabled: isFigmaImageManagementEnabled,
  };

  return {
    figmaImagesController,
    figmaImagesState,
    isFigmaImageManagementEnabled,
  };
};
