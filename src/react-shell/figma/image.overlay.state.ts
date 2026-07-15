import type { ReviewFigmaRouteTarget } from '../../figma/image.types';
import { createReviewFigmaImageTargetKey } from './image.controller';

// Route별 overlay 선택과 편집값을 브라우저 세션 사이에도 복원한다.
const STORAGE_KEY_PREFIX = 'df-review-figma-image-overlay-state:';
const STORAGE_VERSION = 2;
const DEFAULT_MODE = 'normal';

export const DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY = 0.48;

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

export const DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE: ReviewFigmaImageOverlayState = {
  selectedImageId: null,
  imageStates: {},
  lastVisibleImageIds: [],
};

export const DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE: ReviewFigmaImageOverlayItemState = {
  isVisible: false,
  opacity: DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY,
  isLocked: false,
  mode: DEFAULT_MODE,
  offsetY: 0,
};

export function createReviewFigmaImageOverlayStorageKey(
  target: ReviewFigmaRouteTarget
) {
  return `${STORAGE_KEY_PREFIX}${createReviewFigmaImageTargetKey(target)}`;
}

export function readStoredReviewFigmaImageOverlayState(storageKey: string) {
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

export function writeStoredReviewFigmaImageOverlayState(
  storageKey: string,
  state: ReviewFigmaImageOverlayState
) {
  if (typeof window === 'undefined') return;

  try {
    // 기본값은 저장하지 않아 오래된 route key가 쌓이지 않게 한다.
    if (isDefaultReviewFigmaImageOverlayState(state)) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: STORAGE_VERSION,
        ...state,
      } satisfies StoredReviewFigmaImageOverlayState)
    );
  } catch {
    return;
  }
}

export function normalizeReviewFigmaImageOverlayMode(
  value: unknown
): ReviewFigmaImageOverlayMode {
  return value === 'invert' ? 'invert' : DEFAULT_MODE;
}

export function normalizeReviewFigmaImageOverlayOffsetY(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function clampReviewFigmaImageOverlayOpacity(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY;
  return Math.min(1, Math.max(0, value));
}

export function getReviewFigmaImageOverlayItemState(
  state: ReviewFigmaImageOverlayState,
  imageId: string | null
) {
  return imageId
    ? (state.imageStates[imageId] ??
        DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE)
    : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE;
}

export function updateSelectedReviewFigmaImageOverlayItemState(
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

export function updateReviewFigmaImageOverlayItemState(
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

  // v1은 선택 image의 값을 최상위에 저장했다. v2 record로 읽어 올린다.
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

function isDefaultReviewFigmaImageOverlayState(
  state: ReviewFigmaImageOverlayState
) {
  return (
    state.selectedImageId === null &&
    Object.keys(state.imageStates).length === 0 &&
    state.lastVisibleImageIds.length === 0
  );
}
