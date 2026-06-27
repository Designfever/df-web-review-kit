import { useCallback, useMemo } from 'react';
import type {
  ReviewFigmaImageFormat,
  ReviewFigmaImageStore,
  ReviewFigmaRouteTarget,
} from '../../figma/image.types';
import {
  DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
} from '../../figma/image.types';
import type { ReviewShellViewportPreset } from '../types';
import {
  createReviewFigmaRouteTarget,
  useReviewFigmaImageOverlayController,
  useReviewFigmaImageStoreController,
} from '../figma/image.controller';

interface UseReviewFigmaImagesOptions {
  imageFormat?: ReviewFigmaImageFormat;
  pageUrl: string;
  projectId: string;
  store: ReviewFigmaImageStore | null;
  viewport: ReviewShellViewportPreset;
}

export const useReviewFigmaImages = ({
  imageFormat = DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
  pageUrl,
  projectId,
  store,
  viewport,
}: UseReviewFigmaImagesOptions) => {
  const target = useMemo<ReviewFigmaRouteTarget>(
    () =>
      createReviewFigmaRouteTarget({
        pageUrl,
        projectId,
        viewport,
      }),
    [
      pageUrl,
      projectId,
      viewport.height,
      viewport.label,
      viewport.width,
      viewport.kind,
    ]
  );
  const {
    addImage: addStoreImage,
    deleteImage,
    error,
    images,
    isLoading,
    isMutating,
    moveImage,
    refreshImages,
    reorderImages,
    updateImage,
  } = useReviewFigmaImageStoreController({
    imageFormat,
    store,
    target,
  });
  const {
    isOverlayLocked,
    isOverlayVisible,
    overlayMode,
    overlayOffsetY,
    overlayOpacity,
    resetOverlay,
    selectedImage,
    selectedImageId,
    setOverlayLocked,
    setOverlayMode,
    setOverlayOffsetY,
    setOverlayOpacity,
    setSelectedImageId,
    showImage,
    state: overlayState,
    toggleOverlayLocked,
    toggleOverlayMode,
    toggleOverlayVisible,
  } = useReviewFigmaImageOverlayController({
    images,
    isLoading,
    target,
  });

  const addImage = useCallback(
    async (figmaUrl: string, label?: string) => {
      const image = await addStoreImage(figmaUrl, label);
      if (image) showImage(image.id);
      return image;
    },
    [addStoreImage, showImage]
  );

  return {
    addImage,
    deleteImage,
    error,
    images,
    isLoading,
    isMutating,
    isOverlayLocked,
    isOverlayVisible,
    moveImage,
    overlayMode,
    overlayOffsetY,
    overlayOpacity,
    overlayState,
    refreshImages,
    resetOverlay,
    reorderImages,
    selectedImage,
    selectedImageId,
    setOverlayLocked,
    setOverlayMode,
    setOverlayOffsetY,
    setOverlayOpacity,
    setSelectedImageId,
    target,
    toggleOverlayLocked,
    toggleOverlayMode,
    toggleOverlayVisible,
    updateImage,
  };
};
