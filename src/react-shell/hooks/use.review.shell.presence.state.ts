import { useMemo } from 'react';
import type {
  NumberedReviewItem,
  ReviewMode,
  ReviewSource,
} from '../../types';
import type { ReviewPresenceState } from '../presence/presence.context';
import type {
  ReviewShellProps,
  ReviewShellViewportPreset,
} from '../types';
import { useReviewPresence } from './use.review.presence';

interface UseReviewShellPresenceStateOptions {
  activeRoute: string;
  mode: ReviewMode;
  presence: ReviewShellProps['presence'];
  projectId: string;
  reviewPathPrefix: string;
  reviewUserId: string;
  selectedNumberedItem?: NumberedReviewItem;
  size: ReviewShellViewportPreset;
  source: ReviewSource;
}

export const useReviewShellPresenceState = ({
  activeRoute,
  mode,
  presence,
  projectId,
  reviewPathPrefix,
  reviewUserId,
  selectedNumberedItem,
  size,
  source,
}: UseReviewShellPresenceStateOptions): ReviewPresenceState => {
  const {
    currentPagePresenceUsers,
    pagePresenceUsers,
    presenceSessionId,
  } = useReviewPresence({
    activeRoute,
    mode,
    presence,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    selectedNumberedItem,
    size,
    source,
  });

  return useMemo<ReviewPresenceState>(
    () => ({
      currentPagePresenceUsers,
      pagePresenceUsers,
      presenceSessionId,
    }),
    [
      currentPagePresenceUsers,
      pagePresenceUsers,
      presenceSessionId,
    ]
  );
};
