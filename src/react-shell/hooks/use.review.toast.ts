import { useCallback } from 'react';
import { useReviewShellStore } from '../store/store.context';

export const useReviewToast = () => {
  const setToastMessage = useReviewShellStore(
    (state) => state.setToastMessage
  );

  return useCallback(
    (message: string) => {
      setToastMessage(message);
      window.setTimeout(() => {
        setToastMessage((current) => (current === message ? '' : current));
      }, 1600);
    },
    [setToastMessage]
  );
};
