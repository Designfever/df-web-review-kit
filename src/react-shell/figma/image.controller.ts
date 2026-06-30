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

interface CreateReviewFigmaRouteTargetOptions {
  pageUrl: string;
  projectId: string;
  viewport: ReviewShellViewportPreset;
}

interface UseReviewFigmaImageStoreControllerOptions {
  imageFormat?: ReviewFigmaImageFormat;
  store: ReviewFigmaImageStore | null;
  target: ReviewFigmaRouteTarget;
}

type ReviewFigmaImageListState = {
  images: ReviewFigmaImage[];
  targetKey: string;
};

export const createReviewFigmaRouteTarget = ({
  pageUrl,
  projectId,
  viewport,
}: CreateReviewFigmaRouteTargetOptions): ReviewFigmaRouteTarget => ({
  type: 'route',
  projectId,
  pageUrl,
  viewport: {
    label: viewport.label,
    width: viewport.width,
    height: viewport.height,
    scope: getViewportPresetKind(viewport),
  },
});

export const useReviewFigmaImageStoreController = ({
  imageFormat = DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
  store,
  target,
}: UseReviewFigmaImageStoreControllerOptions) => {
  const targetKey = useMemo(
    () => createReviewFigmaImageTargetKey(target),
    [target]
  );
  const requestIdRef = useRef(0);
  const [imageList, setImageList] = useState<ReviewFigmaImageListState>(() => ({
    images: [],
    targetKey,
  }));
  const [isLoading, setIsLoading] = useState(Boolean(store));
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const images = imageList.targetKey === targetKey ? imageList.images : [];

  const refreshImages = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!store) {
      setImageList({ images: [], targetKey });
      setIsLoading(false);
      setError('');
      return [];
    }

    setIsLoading(true);

    try {
      const nextImages = sortReviewFigmaImages(await store.listImages(target));
      if (requestId !== requestIdRef.current) return nextImages;

      setImageList({ images: nextImages, targetKey });
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
  }, [store, target, targetKey]);

  useEffect(() => {
    void refreshImages();
  }, [refreshImages]);

  const addImage = useCallback(
    async (figmaUrl: string, label?: string) => {
      const trimmedUrl = figmaUrl.trim();
      if (!store || !trimmedUrl) return null;

      setIsMutating(true);

      try {
        let image = await store.addImage({
          target,
          figmaUrl: trimmedUrl,
          imageFormat,
          label: label?.trim() || undefined,
          order: getNewReviewFigmaImageOrder(images),
        });
        const uniqueLabel = getUniqueReviewFigmaImageLabel(
          getReviewFigmaImageComparableLabel(image),
          images
        );
        if (uniqueLabel !== getReviewFigmaImageComparableLabel(image)) {
          image = await store.updateImage(image.id, { label: uniqueLabel });
        }
        setImageList((currentList) => ({
          images: sortReviewFigmaImages([
            ...(currentList.targetKey === targetKey ? currentList.images : [])
              .filter((currentImage) => currentImage.id !== image.id),
            image,
          ]),
          targetKey,
        }));
        setError('');
        return image;
      } catch (addError) {
        setError(getReviewFigmaImageErrorMessage(addError));
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [imageFormat, images, store, target, targetKey]
  );

  const deleteImage = useCallback(
    async (id: string) => {
      if (!store) return;

      const previousImageList = imageList;
      setImageList({
        images: images.filter((image) => image.id !== id),
        targetKey,
      });
      setIsMutating(true);

      try {
        await store.deleteImage(id);
        setError('');
      } catch (deleteError) {
        setImageList(previousImageList);
        setError(getReviewFigmaImageErrorMessage(deleteError));
      } finally {
        setIsMutating(false);
      }
    },
    [imageList, images, store, targetKey]
  );

  const updateImage = useCallback(
    async (id: string, patch: { label?: string }) => {
      if (!store) return null;

      const previousImageList = imageList;
      setIsMutating(true);

      try {
        const image = await store.updateImage(id, patch);
        setImageList((currentList) => ({
          images: sortReviewFigmaImages([
            ...(currentList.targetKey === targetKey ? currentList.images : images)
              .filter((currentImage) => currentImage.id !== image.id),
            image,
          ]),
          targetKey,
        }));
        setError('');
        return image;
      } catch (updateError) {
        setImageList(previousImageList);
        setError(getReviewFigmaImageErrorMessage(updateError));
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [imageList, images, store, targetKey]
  );

  const reorderImages = useCallback(
    async (imageIds: string[]) => {
      if (!store) return;

      const currentImageIds = images.map((image) => image.id);
      const nextImageIdSet = new Set(imageIds);
      const hasSameIds =
        imageIds.length === currentImageIds.length &&
        nextImageIdSet.size === currentImageIds.length &&
        currentImageIds.every((imageId) => nextImageIdSet.has(imageId));
      const hasSameOrder =
        hasSameIds &&
        imageIds.every((imageId, index) => imageId === currentImageIds[index]);
      if (!hasSameIds || hasSameOrder) return;

      const previousImages = images;
      const imageById = new Map(images.map((image) => [image.id, image]));
      const optimisticImages = imageIds.flatMap((imageId, order) => {
        const image = imageById.get(imageId);
        return image ? [{ ...image, order }] : [];
      });

      setImageList({ images: optimisticImages, targetKey });
      setIsMutating(true);

      try {
        const savedImages = await store.reorderImages({
          target,
          imageIds,
        });
        setImageList({ images: sortReviewFigmaImages(savedImages), targetKey });
        setError('');
      } catch (reorderError) {
        setImageList({ images: previousImages, targetKey });
        setError(getReviewFigmaImageErrorMessage(reorderError));
      } finally {
        setIsMutating(false);
      }
    },
    [images, store, target, targetKey]
  );

  const moveImage = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const currentIndex = images.findIndex((image) => image.id === id);
      const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= images.length) {
        return;
      }

      const reorderedImages = [...images];
      const [image] = reorderedImages.splice(currentIndex, 1);
      reorderedImages.splice(nextIndex, 0, image);
      await reorderImages(reorderedImages.map((nextImage) => nextImage.id));
    },
    [images, reorderImages]
  );

  return {
    addImage,
    deleteImage,
    error,
    images,
    isLoading: isLoading || imageList.targetKey !== targetKey,
    isMutating,
    moveImage,
    refreshImages,
    reorderImages,
    updateImage,
  };
};

function sortReviewFigmaImages(images: ReviewFigmaImage[]) {
  return [...images].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function getNewReviewFigmaImageOrder(images: ReviewFigmaImage[]) {
  return images.length
    ? Math.min(...images.map((image) => image.order)) - 1
    : 0;
}

export function createReviewFigmaImageTargetKey(target: ReviewFigmaRouteTarget) {
  return [
    target.projectId,
    target.pageUrl,
    target.viewport?.scope ?? '',
    target.viewport?.label ?? '',
    target.viewport?.width ?? '',
    target.viewport?.height ?? '',
    target.slot ?? '',
  ].join('|');
}

function getReviewFigmaImageComparableLabel(image: ReviewFigmaImage) {
  return image.label?.trim() || image.nodeId;
}

function getUniqueReviewFigmaImageLabel(
  label: string,
  images: readonly ReviewFigmaImage[]
) {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) return trimmedLabel;

  const existingLabels = new Set(
    images.map(getReviewFigmaImageComparableLabel).filter(Boolean)
  );
  if (!existingLabels.has(trimmedLabel)) return trimmedLabel;

  for (let index = 2; index < Number.MAX_SAFE_INTEGER; index += 1) {
    const candidate = `${trimmedLabel}-${index}`;
    if (!existingLabels.has(candidate)) return candidate;
  }

  return trimmedLabel;
}

function getReviewFigmaImageErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Figma image request failed.';
}
