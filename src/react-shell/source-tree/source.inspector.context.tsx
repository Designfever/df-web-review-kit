import {
  createContext,
  useContext,
} from 'react';
import type { ReviewSourceInspectorController } from './use.source.inspector';

const ReviewSourceInspectorContext =
  createContext<ReviewSourceInspectorController | null>(null);

export const ReviewSourceInspectorProvider =
  ReviewSourceInspectorContext.Provider;

export const useReviewSourceInspectorState =
  (): ReviewSourceInspectorController => {
    const state = useContext(ReviewSourceInspectorContext);
    if (!state) {
      throw new Error(
        'useReviewSourceInspectorState must be used within a ReviewSourceInspector provider'
      );
    }
    return state;
  };
