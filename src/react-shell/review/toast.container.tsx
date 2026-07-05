import { useReviewShellStore } from '../store/store.context';

export const ReviewToastContainer = () => {
  const toastMessage = useReviewShellStore((state) => state.toastMessage);

  if (!toastMessage) return null;

  return (
    <div className="df-review-copy-toast" role="status">
      {toastMessage}
    </div>
  );
};
