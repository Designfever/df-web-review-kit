// 인스턴스 스코프 imperative ref 모음. store 에 넣지 않는 값들이다 (계획 문서 참고).
// wrapper 에서 한 번 생성해 context 로 내려 feature container 가 prop-threading 없이 쓴다.
import {
  createContext,
  useContext,
  type MutableRefObject,
} from 'react';
import type {
  ReviewItem,
  WebReviewKitController,
} from '../../types';
import { getInitialItemId } from '../route';

export interface ReviewShellRefs {
  cleanupTargetRef: MutableRefObject<(() => void) | null>;
  controllerRef: MutableRefObject<WebReviewKitController | null>;
  frameScrollRef: MutableRefObject<HTMLDivElement | null>;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  pendingInitialItemIdRef: MutableRefObject<string | null>;
  pendingRestoreRef: MutableRefObject<ReviewItem | null>;
}

export const createReviewShellRefs = (): ReviewShellRefs => ({
  cleanupTargetRef: { current: null },
  controllerRef: { current: null },
  frameScrollRef: { current: null },
  iframeRef: { current: null },
  pendingInitialItemIdRef: { current: getInitialItemId() },
  pendingRestoreRef: { current: null },
});

const ReviewShellRefsContext = createContext<ReviewShellRefs | null>(null);

export const ReviewShellRefsProvider = ReviewShellRefsContext.Provider;

export const useReviewShellRefs = (): ReviewShellRefs => {
  const refs = useContext(ReviewShellRefsContext);
  if (!refs) {
    throw new Error(
      'useReviewShellRefs must be used within a ReviewShell provider'
    );
  }
  return refs;
};
