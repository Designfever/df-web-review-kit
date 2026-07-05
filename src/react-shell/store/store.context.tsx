import {
  createContext,
  useContext,
} from 'react';
import { useStore } from 'zustand';
import type {
  ReviewShellState,
  ReviewShellStore,
} from './create.review.shell.store';

const ReviewShellStoreContext = createContext<ReviewShellStore | null>(null);

export const ReviewShellStoreProvider = ReviewShellStoreContext.Provider;

/** store 인스턴스 직접 접근용. 콜백에서 getState() 로 최신 값을 읽을 때 쓴다. */
export const useReviewShellStoreApi = (): ReviewShellStore => {
  const store = useContext(ReviewShellStoreContext);
  if (!store) {
    throw new Error(
      'useReviewShellStore must be used within a ReviewShell provider'
    );
  }
  return store;
};

/** selector 필수. selector 없이 store 전체를 구독하지 않는다. */
export const useReviewShellStore = <T,>(
  selector: (state: ReviewShellState) => T
): T => useStore(useReviewShellStoreApi(), selector);
