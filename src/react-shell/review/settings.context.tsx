import {
  createContext,
  useContext,
} from 'react';
import type { ReviewSettingsController } from '../hooks/use.review.settings';

const ReviewSettingsContext =
  createContext<ReviewSettingsController | null>(null);

export const ReviewSettingsProvider = ReviewSettingsContext.Provider;

export const useReviewSettingsState = (): ReviewSettingsController => {
  const state = useContext(ReviewSettingsContext);
  if (!state) {
    throw new Error(
      'useReviewSettingsState must be used within a ReviewSettings provider'
    );
  }
  return state;
};
