import {
  createContext,
  useContext,
} from 'react';
import type { ReviewPresenceUser } from '../types';

export interface ReviewPresenceState {
  currentPagePresenceUsers: ReviewPresenceUser[];
  pagePresenceUsers: ReadonlyMap<string, ReviewPresenceUser[]>;
  presenceSessionId: string;
}

const ReviewPresenceContext = createContext<ReviewPresenceState | null>(null);

export const ReviewPresenceProvider = ReviewPresenceContext.Provider;

export const useReviewPresenceState = (): ReviewPresenceState => {
  const state = useContext(ReviewPresenceContext);
  if (!state) {
    throw new Error(
      'useReviewPresenceState must be used within a ReviewPresence provider'
    );
  }
  return state;
};
