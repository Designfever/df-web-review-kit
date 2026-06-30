import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  ReviewFigmaImage,
  ReviewFigmaRouteTarget,
} from '../../figma/image.types';
import { createReviewFigmaImageTargetKey } from './image.controller';

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
  lastVisibleImageIds: string[];
};

type StoredReviewFigmaImageOverlayState = Partial<
  ReviewFigmaImageOverlayState & ReviewFigmaImageOverlayItemState
> & {
  version?: number;
};

interface UseReviewFigmaImageOverlayControllerOptions {
  images: ReviewFigmaImage[];
  isLoading: boolean;
  target: ReviewFigmaRouteTarget;
}

type ReviewFigmaImageOverlayStateContainer = {
  state: ReviewFigmaImageOverlayState;
  storageKey: string;
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
    if (typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (
        event.storageArea !== window.localStorage ||
        (event.key !== storageKey && event.key !== null)
      ) {
        return;
      }

      setStateContainer({
        state: readStoredReviewFigmaImageOverlayState(storageKey),
        storageKey,
      });
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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
      const lastVisibleImageIds = currentState.lastVisibleImageIds.filter(
        (imageId) => nextImageIds.has(imageId)
      );

      if (
        selectedImageId === currentState.selectedImageId &&
        imageStates === currentState.imageStates &&
        lastVisibleImageIds.length === currentState.lastVisibleImageIds.length
      ) {
        return currentState;
      }

      return {
        ...currentState,
        selectedImageId,
        imageStates,
        lastVisibleImageIds,
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
  const isAnyImageOverlayVisible = useMemo(
    () =>
      images.some(
        (image) => imageOverlayStates[image.id]?.isVisible === true
      ),
    [imageOverlayStates, images]
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

  const toggleAllImageOverlayVisible = useCallback(() => {
    updateState((currentState) => {
      if (images.length === 0) return currentState;

      const imageIds = images.map((image) => image.id);
      const imageIdSet = new Set(imageIds);
      const visibleImageIds = imageIds.filter(
        (imageId) =>
          getReviewFigmaImageOverlayItemState(currentState, imageId).isVisible
      );
      let imageStates = currentState.imageStates;

      if (visibleImageIds.length > 0) {
        imageIds.forEach((imageId) => {
          imageStates = updateReviewFigmaImageOverlayItemState(
            imageStates,
            imageId,
            (itemState) => ({
              ...itemState,
              isVisible: false,
            })
          );
        });

        return {
          ...currentState,
          imageStates,
          lastVisibleImageIds: visibleImageIds,
        };
      }

      const restoreImageIds = currentState.lastVisibleImageIds.filter(
        (imageId) => imageIdSet.has(imageId)
      );
      const fallbackImageId =
        currentState.selectedImageId && imageIdSet.has(currentState.selectedImageId)
          ? currentState.selectedImageId
          : images[0]?.id ?? null;
      const nextVisibleImageIds =
        restoreImageIds.length > 0
          ? restoreImageIds
          : fallbackImageId
            ? [fallbackImageId]
            : [];
      const nextVisibleImageIdSet = new Set(nextVisibleImageIds);

      imageIds.forEach((imageId) => {
        imageStates = updateReviewFigmaImageOverlayItemState(
          imageStates,
          imageId,
          (itemState) => ({
            ...itemState,
            isVisible: nextVisibleImageIdSet.has(imageId),
          })
        );
      });

      return {
        ...currentState,
        selectedImageId:
          currentState.selectedImageId ?? nextVisibleImageIds[0] ?? null,
        imageStates,
        lastVisibleImageIds: nextVisibleImageIds,
      };
    });
  }, [images, updateState]);

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
    isAnyImageOverlayVisible,
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
    toggleAllImageOverlayVisible,
    setImageOverlayOffsetY,
    setImageOverlayOpacity,
    toggleOverlayLocked,
    toggleOverlayMode,
    toggleOverlayVisible,
  };
};

function createReviewFigmaImageOverlayStorageKey(
  target: ReviewFigmaRouteTarget
) {
  return `${REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_KEY_PREFIX}${createReviewFigmaImageTargetKey(target)}`;
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
  if (isDefaultReviewFigmaImageOverlayState(state)) {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      return;
    }
    return;
  }

  try {
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
  lastVisibleImageIds: [],
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
  const lastVisibleImageIds = Array.isArray(state.lastVisibleImageIds)
    ? state.lastVisibleImageIds.filter(
        (imageId): imageId is string => typeof imageId === 'string'
      )
    : [];
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
    lastVisibleImageIds,
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
  return Math.min(1, Math.max(0, value));
}

function isDefaultReviewFigmaImageOverlayState(
  state: ReviewFigmaImageOverlayState
) {
  return (
    state.selectedImageId === null &&
    Object.keys(state.imageStates).length === 0 &&
    state.lastVisibleImageIds.length === 0
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
