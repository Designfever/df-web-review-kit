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
const REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_VERSION = 2;
const DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_MODE = 'normal';

export type ReviewFigmaImageOverlayMode = 'normal' | 'invert';

export type ReviewFigmaImageOverlayItemState = {
  isVisible: boolean;
  opacity: number;
  isLocked: boolean;
  mode: ReviewFigmaImageOverlayMode;
  offsetY: number;
};

export type ReviewFigmaImageOverlayState = {
  selectedImageId: string | null;
  imageStates: Record<string, ReviewFigmaImageOverlayItemState>;
};

type StoredReviewFigmaImageOverlayState = Partial<
  ReviewFigmaImageOverlayState & ReviewFigmaImageOverlayItemState
> & {
  version?: number;
};

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
      const nextImageIds = new Set(images.map((image) => image.id));
      const selectedImageId =
        currentState.selectedImageId &&
        nextImageIds.has(currentState.selectedImageId)
          ? currentState.selectedImageId
          : images[0]?.id ?? null;
      const imageStates = Object.fromEntries(
        Object.entries(currentState.imageStates).filter(([imageId]) =>
          nextImageIds.has(imageId)
        )
      );

      if (
        selectedImageId === currentState.selectedImageId &&
        imageStates === currentState.imageStates
      ) {
        return currentState;
      }

      return {
        ...currentState,
        selectedImageId,
        imageStates,
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
  const selectedImageOverlayState = getReviewFigmaImageOverlayItemState(
    state,
    state.selectedImageId
  );
  const imageOverlayStates = useMemo(
    () =>
      Object.fromEntries(
        images.map((image) => [
          image.id,
          getReviewFigmaImageOverlayItemState(state, image.id),
        ])
      ),
    [images, state]
  );

  const setSelectedImageId = useCallback((selectedImageId: string | null) => {
    updateState((currentState) => ({
      ...currentState,
      selectedImageId,
    }));
  }, [updateState]);

  const updateImageOverlayState = useCallback(
    (
      imageId: string,
      updater: (
        itemState: ReviewFigmaImageOverlayItemState
      ) => ReviewFigmaImageOverlayItemState
    ) => {
      updateState((currentState) => ({
        ...currentState,
        selectedImageId: imageId,
        imageStates: updateReviewFigmaImageOverlayItemState(
          currentState.imageStates,
          imageId,
          updater
        ),
      }));
    },
    [updateState]
  );

  const showImage = useCallback((selectedImageId: string) => {
    updateState((currentState) => ({
      ...currentState,
      selectedImageId,
      imageStates: updateReviewFigmaImageOverlayItemState(
        currentState.imageStates,
        selectedImageId,
        (itemState) => ({
          ...itemState,
          isVisible: true,
        })
      ),
    }));
  }, [updateState]);

  const toggleImageOverlayVisible = useCallback(
    (imageId: string) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        isVisible: !itemState.isVisible,
      }));
    },
    [updateImageOverlayState]
  );

  const setImageOverlayOpacity = useCallback(
    (imageId: string, opacity: number) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        opacity: clampReviewFigmaImageOverlayOpacity(opacity),
      }));
    },
    [updateImageOverlayState]
  );

  const toggleImageOverlayLocked = useCallback(
    (imageId: string) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        isLocked: !itemState.isLocked,
      }));
    },
    [updateImageOverlayState]
  );

  const toggleImageOverlayMode = useCallback(
    (imageId: string) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        mode: itemState.mode === 'invert' ? 'normal' : 'invert',
      }));
    },
    [updateImageOverlayState]
  );

  const setImageOverlayOffsetY = useCallback(
    (imageId: string, offsetY: number) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        offsetY: normalizeReviewFigmaImageOverlayOffsetY(offsetY),
      }));
    },
    [updateImageOverlayState]
  );

  const toggleOverlayVisible = useCallback(() => {
    updateState((currentState) => {
      if (!currentState.selectedImageId && images[0]) {
        return {
          ...currentState,
          selectedImageId: images[0].id,
          imageStates: updateReviewFigmaImageOverlayItemState(
            currentState.imageStates,
            images[0].id,
            (itemState) => ({
              ...itemState,
              isVisible: true,
            })
          ),
        };
      }

      if (!currentState.selectedImageId) return currentState;

      return {
        ...currentState,
        imageStates: updateReviewFigmaImageOverlayItemState(
          currentState.imageStates,
          currentState.selectedImageId,
          (itemState) => ({
            ...itemState,
            isVisible: !itemState.isVisible,
          })
        ),
      };
    });
  }, [images, updateState]);

  const setOverlayOpacity = useCallback((opacity: number) => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          opacity: clampReviewFigmaImageOverlayOpacity(opacity),
        })
      ),
    }));
  }, [updateState]);

  const setOverlayLocked = useCallback((isLocked: boolean) => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          isLocked,
        })
      ),
    }));
  }, [updateState]);

  const toggleOverlayLocked = useCallback(() => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          isLocked: !itemState.isLocked,
        })
      ),
    }));
  }, [updateState]);

  const setOverlayMode = useCallback((mode: ReviewFigmaImageOverlayMode) => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          mode: normalizeReviewFigmaImageOverlayMode(mode),
        })
      ),
    }));
  }, [updateState]);

  const toggleOverlayMode = useCallback(() => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          mode: itemState.mode === 'invert' ? 'normal' : 'invert',
        })
      ),
    }));
  }, [updateState]);

  const setOverlayOffsetY = useCallback((offsetY: number) => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          offsetY: normalizeReviewFigmaImageOverlayOffsetY(offsetY),
        })
      ),
    }));
  }, [updateState]);

  const resetOverlay = useCallback(() => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: currentState.selectedImageId
        ? updateReviewFigmaImageOverlayItemState(
            currentState.imageStates,
            currentState.selectedImageId,
            () => DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE
          )
        : currentState.imageStates,
    }));
  }, [updateState]);

  return {
    imageOverlayStates,
    isOverlayVisible: selectedImageOverlayState.isVisible,
    overlayMode: selectedImageOverlayState.mode,
    overlayOffsetY: selectedImageOverlayState.offsetY,
    overlayOpacity: selectedImageOverlayState.opacity,
    isOverlayLocked: selectedImageOverlayState.isLocked,
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
    toggleImageOverlayLocked,
    toggleImageOverlayMode,
    toggleImageOverlayVisible,
    setImageOverlayOffsetY,
    setImageOverlayOpacity,
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
  imageStates: {},
};

const DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE: ReviewFigmaImageOverlayItemState = {
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
  const selectedImageId =
    typeof state.selectedImageId === 'string' ? state.selectedImageId : null;
  const imageStates = normalizeReviewFigmaImageOverlayItemStateRecord(
    state.imageStates
  );
  if (Object.keys(imageStates).length === 0 && selectedImageId) {
    imageStates[selectedImageId] = normalizeReviewFigmaImageOverlayItemState(
      state
    );
  }

  return {
    selectedImageId,
    imageStates,
  };
}

function normalizeReviewFigmaImageOverlayItemStateRecord(value: unknown) {
  if (!value || typeof value !== 'object') return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([imageId, itemState]) => {
      if (!imageId || typeof itemState !== 'object') return [];
      return [
        [
          imageId,
          normalizeReviewFigmaImageOverlayItemState(
            itemState as Partial<ReviewFigmaImageOverlayItemState>
          ),
        ],
      ];
    })
  );
}

function normalizeReviewFigmaImageOverlayItemState(
  value: Partial<ReviewFigmaImageOverlayItemState>
): ReviewFigmaImageOverlayItemState {
  return {
    isVisible: value.isVisible === true,
    opacity: clampReviewFigmaImageOverlayOpacity(
      typeof value.opacity === 'number'
        ? value.opacity
        : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY
    ),
    isLocked: value.isLocked === true,
    mode: normalizeReviewFigmaImageOverlayMode(value.mode),
    offsetY: normalizeReviewFigmaImageOverlayOffsetY(value.offsetY),
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
    Object.keys(state.imageStates).length === 0
  );
}

function getReviewFigmaImageOverlayItemState(
  state: ReviewFigmaImageOverlayState,
  imageId: string | null
) {
  return imageId
    ? (state.imageStates[imageId] ??
        DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE)
    : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE;
}

function updateSelectedReviewFigmaImageOverlayItemState(
  state: ReviewFigmaImageOverlayState,
  updater: (
    itemState: ReviewFigmaImageOverlayItemState
  ) => ReviewFigmaImageOverlayItemState
) {
  return state.selectedImageId
    ? updateReviewFigmaImageOverlayItemState(
        state.imageStates,
        state.selectedImageId,
        updater
      )
    : state.imageStates;
}

function updateReviewFigmaImageOverlayItemState(
  imageStates: Record<string, ReviewFigmaImageOverlayItemState>,
  imageId: string,
  updater: (
    itemState: ReviewFigmaImageOverlayItemState
  ) => ReviewFigmaImageOverlayItemState
) {
  return {
    ...imageStates,
    [imageId]: updater(
      imageStates[imageId] ?? DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE
    ),
  };
}

function getReviewFigmaImageErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Figma image request failed.';
}
