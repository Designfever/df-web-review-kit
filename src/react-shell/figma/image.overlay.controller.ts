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
import {
  clampReviewFigmaImageOverlayOpacity,
  createReviewFigmaImageOverlayStorageKey,
  DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE,
  DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE,
  getReviewFigmaImageOverlayItemState,
  normalizeReviewFigmaImageOverlayMode,
  normalizeReviewFigmaImageOverlayOffsetY,
  readStoredReviewFigmaImageOverlayState,
  updateReviewFigmaImageOverlayItemState,
  updateSelectedReviewFigmaImageOverlayItemState,
  writeStoredReviewFigmaImageOverlayState,
  type ReviewFigmaImageOverlayItemState,
  type ReviewFigmaImageOverlayMode,
  type ReviewFigmaImageOverlayState,
} from './image.overlay.state';

export {
  DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY,
  type ReviewFigmaImageOverlayItemState,
  type ReviewFigmaImageOverlayMode,
  type ReviewFigmaImageOverlayState,
} from './image.overlay.state';

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
        const nextState = updater(currentState);

        // 같은 route의 no-op update는 container identity도 유지해야
        // 아래 storage effect가 동일 상태를 다시 저장하지 않는다.
        if (
          currentContainer.storageKey === storageKey &&
          nextState === currentState
        ) {
          return currentContainer;
        }

        return {
          state: nextState,
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

      // imageStates/lastVisibleImageIds 는 현재 값의 부분집합이므로
      // 개수가 같으면 내용도 같다. 그대로면 상태를 갈아끼우지 않는다.
      if (
        selectedImageId === currentState.selectedImageId &&
        Object.keys(imageStates).length ===
          Object.keys(currentState.imageStates).length &&
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

  const updateSelectedOverlayState = useCallback(
    (
      updater: (
        itemState: ReviewFigmaImageOverlayItemState
      ) => ReviewFigmaImageOverlayItemState
    ) => {
      updateState((currentState) => ({
        ...currentState,
        imageStates: updateSelectedReviewFigmaImageOverlayItemState(
          currentState,
          updater
        ),
      }));
    },
    [updateState]
  );

  const setOverlayOpacity = useCallback((opacity: number) => {
    updateSelectedOverlayState((itemState) => ({
      ...itemState,
      opacity: clampReviewFigmaImageOverlayOpacity(opacity),
    }));
  }, [updateSelectedOverlayState]);

  const setOverlayLocked = useCallback((isLocked: boolean) => {
    updateSelectedOverlayState((itemState) => ({
      ...itemState,
      isLocked,
    }));
  }, [updateSelectedOverlayState]);

  const toggleOverlayLocked = useCallback(() => {
    updateSelectedOverlayState((itemState) => ({
      ...itemState,
      isLocked: !itemState.isLocked,
    }));
  }, [updateSelectedOverlayState]);

  const setOverlayMode = useCallback((mode: ReviewFigmaImageOverlayMode) => {
    updateSelectedOverlayState((itemState) => ({
      ...itemState,
      mode: normalizeReviewFigmaImageOverlayMode(mode),
    }));
  }, [updateSelectedOverlayState]);

  const toggleOverlayMode = useCallback(() => {
    updateSelectedOverlayState((itemState) => ({
      ...itemState,
      mode: itemState.mode === 'invert' ? 'normal' : 'invert',
    }));
  }, [updateSelectedOverlayState]);

  const setOverlayOffsetY = useCallback((offsetY: number) => {
    updateSelectedOverlayState((itemState) => ({
      ...itemState,
      offsetY: normalizeReviewFigmaImageOverlayOffsetY(offsetY),
    }));
  }, [updateSelectedOverlayState]);

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
