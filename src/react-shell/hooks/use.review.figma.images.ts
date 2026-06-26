import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ReviewFigmaImage,
  ReviewFigmaImageFormat,
  ReviewFigmaImageStore,
  ReviewFigmaRouteTarget,
} from '../../figma/image.types';
import {
  DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
} from '../../figma/image.types';
import type { ReviewShellViewportPreset } from '../types';
import { getViewportPresetKind } from '../viewport';

const DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY = 0.48;

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
  const requestIdRef = useRef(0);
  const target = useMemo<ReviewFigmaRouteTarget>(
    () => ({
      type: 'route',
      projectId,
      pageUrl,
      viewport: {
        label: viewport.label,
        width: viewport.width,
        height: viewport.height,
        scope: getViewportPresetKind(viewport),
      },
    }),
    [pageUrl, projectId, viewport.height, viewport.label, viewport.width, viewport.kind]
  );
  const [images, setImages] = useState<ReviewFigmaImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(
    DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY
  );
  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedImageId) ?? null,
    [images, selectedImageId]
  );

  const refreshImages = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!store) {
      setImages([]);
      setSelectedImageId(null);
      setIsOverlayVisible(false);
      setError('');
      return [];
    }

    setIsLoading(true);

    try {
      const nextImages = sortReviewFigmaImages(await store.listImages(target));
      if (requestId !== requestIdRef.current) return nextImages;

      setImages(nextImages);
      setSelectedImageId((currentId) =>
        currentId && nextImages.some((image) => image.id === currentId)
          ? currentId
          : nextImages[0]?.id ?? null
      );
      setIsOverlayVisible((current) => current && nextImages.length > 0);
      setError('');
      return nextImages;
    } catch (refreshError) {
      if (requestId === requestIdRef.current) {
        setError(getReviewFigmaImageErrorMessage(refreshError));
      }
      return [];
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [store, target]);

  useEffect(() => {
    setSelectedImageId(null);
    setIsOverlayVisible(false);
    void refreshImages();
  }, [refreshImages]);

  const addImage = useCallback(
    async (figmaUrl: string, label?: string) => {
      const trimmedUrl = figmaUrl.trim();
      if (!store || !trimmedUrl) return null;

      setIsMutating(true);

      try {
        const image = await store.addImage({
          target,
          figmaUrl: trimmedUrl,
          imageFormat,
          label: label?.trim() || undefined,
        });
        setImages((currentImages) =>
          sortReviewFigmaImages([
            ...currentImages.filter((currentImage) => currentImage.id !== image.id),
            image,
          ])
        );
        setSelectedImageId(image.id);
        setIsOverlayVisible(true);
        setError('');
        return image;
      } catch (addError) {
        setError(getReviewFigmaImageErrorMessage(addError));
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [imageFormat, store, target]
  );

  const deleteImage = useCallback(
    async (id: string) => {
      if (!store) return;

      const previousImages = images;
      const nextImages = images.filter((image) => image.id !== id);
      setImages(nextImages);
      setSelectedImageId((currentId) =>
        currentId === id ? nextImages[0]?.id ?? null : currentId
      );
      if (nextImages.length === 0) setIsOverlayVisible(false);
      setIsMutating(true);

      try {
        await store.deleteImage(id);
        setError('');
      } catch (deleteError) {
        setImages(previousImages);
        setError(getReviewFigmaImageErrorMessage(deleteError));
      } finally {
        setIsMutating(false);
      }
    },
    [images, store]
  );

  const moveImage = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      if (!store) return;

      const currentIndex = images.findIndex((image) => image.id === id);
      const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= images.length) return;

      const previousImages = images;
      const reorderedImages = [...images];
      const [image] = reorderedImages.splice(currentIndex, 1);
      reorderedImages.splice(nextIndex, 0, image);
      const optimisticImages = reorderedImages.map((nextImage, order) => ({
        ...nextImage,
        order,
      }));

      setImages(optimisticImages);
      setIsMutating(true);

      try {
        const savedImages = await store.reorderImages({
          target,
          imageIds: reorderedImages.map((nextImage) => nextImage.id),
        });
        setImages(sortReviewFigmaImages(savedImages));
        setError('');
      } catch (moveError) {
        setImages(previousImages);
        setError(getReviewFigmaImageErrorMessage(moveError));
      } finally {
        setIsMutating(false);
      }
    },
    [images, store, target]
  );

  const toggleOverlayVisible = useCallback(() => {
    if (!selectedImage && images[0]) {
      setSelectedImageId(images[0].id);
      setIsOverlayVisible(true);
      return;
    }

    setIsOverlayVisible((current) => !current);
  }, [images, selectedImage]);

  return {
    addImage,
    deleteImage,
    error,
    images,
    isLoading,
    isMutating,
    isOverlayVisible,
    moveImage,
    overlayOpacity,
    refreshImages,
    selectedImage,
    selectedImageId,
    setOverlayOpacity: (nextOpacity: number) =>
      setOverlayOpacity(clampReviewFigmaImageOverlayOpacity(nextOpacity)),
    setSelectedImageId,
    target,
    toggleOverlayVisible,
  };
};

function sortReviewFigmaImages(images: ReviewFigmaImage[]) {
  return [...images].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function clampReviewFigmaImageOverlayOpacity(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY;
  return Math.min(1, Math.max(0.08, value));
}

function getReviewFigmaImageErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Figma image request failed.';
}
