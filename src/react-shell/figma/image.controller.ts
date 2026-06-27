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

export const DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY = 0.48;
const REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_KEY_PREFIX =
  'df-review-figma-image-overlay-state:';
const REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_VERSION = 1;
const DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_MODE = 'normal';

export type ReviewFigmaImageOverlayMode = 'normal' | 'invert';

export type ReviewFigmaImageOverlayState = {
  selectedImageId: string | null;
  isVisible: boolean;
  opacity: number;
  isLocked: boolean;
  mode: ReviewFigmaImageOverlayMode;
  offsetY: number;
};

interface StoredReviewFigmaImageOverlayState
  extends Partial<ReviewFigmaImageOverlayState> {
  version?: number;
}

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

interface UseReviewFigmaImageOverlayControllerOptions {
  images: ReviewFigmaImage[];
  isLoading: boolean;
  target: ReviewFigmaRouteTarget;
}

type ReviewFigmaImageListState = {
  images: ReviewFigmaImage[];
  targetKey: string;
};

type ReviewFigmaImageOverlayStateContainer = {
  state: ReviewFigmaImageOverlayState;
  storageKey: string;
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
        const image = await store.addImage({
          target,
          figmaUrl: trimmedUrl,
          imageFormat,
          label: label?.trim() || undefined,
        });
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
    [imageFormat, store, target, targetKey]
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

  const moveImage = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      if (!store) return;

      const currentIndex = images.findIndex((image) => image.id === id);
      const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= images.length) {
        return;
      }

      const previousImages = images;
      const reorderedImages = [...images];
      const [image] = reorderedImages.splice(currentIndex, 1);
      reorderedImages.splice(nextIndex, 0, image);
      const optimisticImages = reorderedImages.map((nextImage, order) => ({
        ...nextImage,
        order,
      }));

      setImageList({ images: optimisticImages, targetKey });
      setIsMutating(true);

      try {
        const savedImages = await store.reorderImages({
          target,
          imageIds: reorderedImages.map((nextImage) => nextImage.id),
        });
        setImageList({ images: sortReviewFigmaImages(savedImages), targetKey });
        setError('');
      } catch (moveError) {
        setImageList({ images: previousImages, targetKey });
        setError(getReviewFigmaImageErrorMessage(moveError));
      } finally {
        setIsMutating(false);
      }
    },
    [images, store, target, targetKey]
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
  };
};

export const useReviewFigmaImageOverlayController = ({
  images,
  isLoading,
  target,
}: UseReviewFigmaImageOverlayControllerOptions) => {
  const storageKey = useMemo(
    () => createReviewFigmaImageOverlayStorageKey(target),
    [target]
  );
  const [stateContainer, setStateContainer] =
    useState<ReviewFigmaImageOverlayStateContainer>(() => ({
      state: readStoredReviewFigmaImageOverlayState(storageKey),
      storageKey,
    }));
  const state =
    stateContainer.storageKey === storageKey
      ? stateContainer.state
      : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;
  const updateState = useCallback(
    (
      updater: (
        currentState: ReviewFigmaImageOverlayState
      ) => ReviewFigmaImageOverlayState
    ) => {
      setStateContainer((currentContainer) => {
        const currentState =
          currentContainer.storageKey === storageKey
            ? currentContainer.state
            : readStoredReviewFigmaImageOverlayState(storageKey);

        return {
          state: updater(currentState),
          storageKey,
        };
      });
    },
    [storageKey]
  );

  useEffect(() => {
    setStateContainer({
      state: readStoredReviewFigmaImageOverlayState(storageKey),
      storageKey,
    });
  }, [storageKey]);

  useEffect(() => {
    if (isLoading) return;

    updateState((currentState) => {
      const selectedImageId =
        currentState.selectedImageId &&
        images.some((image) => image.id === currentState.selectedImageId)
          ? currentState.selectedImageId
          : images[0]?.id ?? null;
      const isVisible = currentState.isVisible && images.length > 0;

      if (
        selectedImageId === currentState.selectedImageId &&
        isVisible === currentState.isVisible
      ) {
        return currentState;
      }

      return {
        ...currentState,
        selectedImageId,
        isVisible,
      };
    });
  }, [images, isLoading, updateState]);

  useEffect(() => {
    if (stateContainer.storageKey !== storageKey) return;
    writeStoredReviewFigmaImageOverlayState(storageKey, stateContainer.state);
  }, [stateContainer, storageKey]);

  const selectedImage = useMemo(
    () => images.find((image) => image.id === state.selectedImageId) ?? null,
    [images, state.selectedImageId]
  );

  const setSelectedImageId = useCallback((selectedImageId: string | null) => {
    updateState((currentState) => ({
      ...currentState,
      selectedImageId,
      isVisible: selectedImageId ? currentState.isVisible : false,
    }));
  }, [updateState]);

  const showImage = useCallback((selectedImageId: string) => {
    updateState((currentState) => ({
      ...currentState,
      selectedImageId,
      isVisible: true,
    }));
  }, [updateState]);

  const toggleOverlayVisible = useCallback(() => {
    updateState((currentState) => {
      if (!currentState.selectedImageId && images[0]) {
        return {
          ...currentState,
          selectedImageId: images[0].id,
          isVisible: true,
        };
      }

      return {
        ...currentState,
        isVisible: !currentState.isVisible,
      };
    });
  }, [images, updateState]);

  const setOverlayOpacity = useCallback((opacity: number) => {
    updateState((currentState) => ({
      ...currentState,
      opacity: clampReviewFigmaImageOverlayOpacity(opacity),
    }));
  }, [updateState]);

  const setOverlayLocked = useCallback((isLocked: boolean) => {
    updateState((currentState) => ({
      ...currentState,
      isLocked,
    }));
  }, [updateState]);

  const toggleOverlayLocked = useCallback(() => {
    updateState((currentState) => ({
      ...currentState,
      isLocked: !currentState.isLocked,
    }));
  }, [updateState]);

  const setOverlayMode = useCallback((mode: ReviewFigmaImageOverlayMode) => {
    updateState((currentState) => ({
      ...currentState,
      mode: normalizeReviewFigmaImageOverlayMode(mode),
    }));
  }, [updateState]);

  const toggleOverlayMode = useCallback(() => {
    updateState((currentState) => ({
      ...currentState,
      mode: currentState.mode === 'invert' ? 'normal' : 'invert',
    }));
  }, [updateState]);

  const setOverlayOffsetY = useCallback((offsetY: number) => {
    updateState((currentState) => ({
      ...currentState,
      offsetY: normalizeReviewFigmaImageOverlayOffsetY(offsetY),
    }));
  }, [updateState]);

  const resetOverlay = useCallback(() => {
    updateState((currentState) => ({
      ...DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE,
      selectedImageId: currentState.selectedImageId,
      isVisible: currentState.isVisible,
    }));
  }, [updateState]);

  return {
    isOverlayVisible: state.isVisible,
    overlayMode: state.mode,
    overlayOffsetY: state.offsetY,
    overlayOpacity: state.opacity,
    isOverlayLocked: state.isLocked,
    resetOverlay,
    selectedImage,
    selectedImageId: state.selectedImageId,
    setOverlayLocked,
    setOverlayMode,
    setOverlayOffsetY,
    setOverlayOpacity,
    setSelectedImageId,
    showImage,
    state,
    target,
    toggleOverlayLocked,
    toggleOverlayMode,
    toggleOverlayVisible,
  };
};

export function sortReviewFigmaImages(images: ReviewFigmaImage[]) {
  return [...images].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function createReviewFigmaImageOverlayStorageKey(
  target: ReviewFigmaRouteTarget
) {
  return `${REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_KEY_PREFIX}${createReviewFigmaImageTargetKey(target)}`;
}

function createReviewFigmaImageTargetKey(target: ReviewFigmaRouteTarget) {
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

function readStoredReviewFigmaImageOverlayState(storageKey: string) {
  if (typeof window === 'undefined') {
    return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;
  }

  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;

    return normalizeReviewFigmaImageOverlayState(JSON.parse(value));
  } catch {
    return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;
  }
}

function writeStoredReviewFigmaImageOverlayState(
  storageKey: string,
  state: ReviewFigmaImageOverlayState
) {
  if (typeof window === 'undefined') return;

  try {
    if (isDefaultReviewFigmaImageOverlayState(state)) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_VERSION,
        ...state,
      } satisfies StoredReviewFigmaImageOverlayState)
    );
  } catch {
    return;
  }
}

const DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE: ReviewFigmaImageOverlayState = {
  selectedImageId: null,
  isVisible: false,
  opacity: DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY,
  isLocked: false,
  mode: DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_MODE,
  offsetY: 0,
};

function normalizeReviewFigmaImageOverlayState(
  value: unknown
): ReviewFigmaImageOverlayState {
  if (!value || typeof value !== 'object') {
    return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;
  }

  const state = value as StoredReviewFigmaImageOverlayState;

  return {
    selectedImageId:
      typeof state.selectedImageId === 'string' ? state.selectedImageId : null,
    isVisible: state.isVisible === true,
    opacity: clampReviewFigmaImageOverlayOpacity(
      typeof state.opacity === 'number'
        ? state.opacity
        : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY
    ),
    isLocked: state.isLocked === true,
    mode: normalizeReviewFigmaImageOverlayMode(state.mode),
    offsetY: normalizeReviewFigmaImageOverlayOffsetY(state.offsetY),
  };
}

function normalizeReviewFigmaImageOverlayMode(
  value: unknown
): ReviewFigmaImageOverlayMode {
  return value === 'invert' ? 'invert' : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_MODE;
}

function normalizeReviewFigmaImageOverlayOffsetY(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.round(value);
}

function clampReviewFigmaImageOverlayOpacity(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY;
  return Math.min(1, Math.max(0.08, value));
}

function isDefaultReviewFigmaImageOverlayState(
  state: ReviewFigmaImageOverlayState
) {
  return (
    state.selectedImageId === null &&
    state.isVisible === false &&
    state.opacity === DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY &&
    state.isLocked === false &&
    state.mode === DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_MODE &&
    state.offsetY === 0
  );
}

function getReviewFigmaImageErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Figma image request failed.';
}
