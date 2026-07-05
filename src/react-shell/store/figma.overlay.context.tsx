import {
  createContext,
  useContext,
} from 'react';

export interface ReviewFigmaOverlayState {
  figmaOverlayUnavailableMessage?: string;
  isFigmaOverlayActive: boolean;
  isFigmaOverlayAvailable: boolean;
  toggleFigmaOverlay: () => void;
}

const ReviewFigmaOverlayContext =
  createContext<ReviewFigmaOverlayState | null>(null);

export const ReviewFigmaOverlayProvider = ReviewFigmaOverlayContext.Provider;

export const useReviewFigmaOverlayState = (): ReviewFigmaOverlayState => {
  const state = useContext(ReviewFigmaOverlayContext);
  if (!state) {
    throw new Error(
      'useReviewFigmaOverlayState must be used within a ReviewFigmaOverlay provider'
    );
  }
  return state;
};
