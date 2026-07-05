import { useReviewShellStore } from '../store/store.context';
import { ReviewShellFrame, type ReviewShellFrameSlots } from './shell.frame';
import { useReviewSettingsState } from './settings.context';

interface ReviewShellFrameContainerProps {
  slots: ReviewShellFrameSlots;
}

export const ReviewShellFrameContainer = ({
  slots,
}: ReviewShellFrameContainerProps) => {
  const { effectiveReviewTheme } = useReviewSettingsState();
  const isListVisible = useReviewShellStore((state) => state.isListVisible);

  return (
    <ReviewShellFrame
      effectiveReviewTheme={effectiveReviewTheme}
      isListVisible={isListVisible}
      slots={slots}
    />
  );
};
