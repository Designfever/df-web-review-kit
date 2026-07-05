import {
  createContext,
  useContext,
  type RefObject,
} from 'react';
import type {
  ReviewRulerMeasure,
  ReviewRulerPoint,
} from '../types';

export interface ReviewRulerState {
  closeRuler: () => boolean;
  isRulerAvailable: boolean;
  isRulerDragging: boolean;
  isRulerVisible: boolean;
  rulerHover: ReviewRulerPoint | null;
  rulerMeasure: ReviewRulerMeasure | undefined;
  rulerMeasureLabel: string;
  rulerOverlayRef: RefObject<HTMLDivElement | null>;
  rulerScaleX: number;
  rulerScaleY: number;
  rulerUnit: string;
  toggleRuler: () => void;
}

const ReviewRulerContext = createContext<ReviewRulerState | null>(null);

export const ReviewRulerProvider = ReviewRulerContext.Provider;

export const useReviewRulerState = (): ReviewRulerState => {
  const state = useContext(ReviewRulerContext);
  if (!state) {
    throw new Error(
      'useReviewRulerState must be used within a ReviewRuler provider'
    );
  }
  return state;
};
