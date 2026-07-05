import {
  createContext,
  useContext,
} from 'react';
import type { ReviewFigmaImagesController } from '../hooks/use.review.figma.images';
import type { ReviewTargetFigmaImageOverlay } from '../target/figma.image.overlay';

export type ReviewFigmaImagesState = ReviewFigmaImagesController & {
  figmaImageOverlays: ReviewTargetFigmaImageOverlay[];
  isEnabled: boolean;
};

const ReviewFigmaImagesContext =
  createContext<ReviewFigmaImagesState | null>(null);

export const ReviewFigmaImagesProvider = ReviewFigmaImagesContext.Provider;

export const useReviewFigmaImagesState = (): ReviewFigmaImagesState => {
  const state = useContext(ReviewFigmaImagesContext);
  if (!state) {
    throw new Error(
      'useReviewFigmaImagesState must be used within a ReviewFigmaImages provider'
    );
  }
  return state;
};
