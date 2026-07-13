import { useReviewFigmaImagesState } from '../figma/images.context';
import { useReviewPresenceState } from '../presence/presence.context';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellStore } from '../store/store.context';
import { ReviewSideRail } from './side.rail';

export const ReviewSideRailContainer = () => {
  const {
    openAbout,
    openInitialPrompt,
    openSettings,
    toggleFigmaImagesPanel,
    toggleQaPanel,
    toggleSourceTreePanel,
  } = useReviewShellActions();
  const {
    currentPagePresenceUsers,
    presenceSessionId,
  } = useReviewPresenceState();
  const { isEnabled: isFigmaImageManagementEnabled } =
    useReviewFigmaImagesState();
  const isListVisible = useReviewShellStore((state) => state.isListVisible);
  const sidePanel = useReviewShellStore((state) => state.sidePanel);

  return (
    <ReviewSideRail
      currentPagePresenceUsers={currentPagePresenceUsers}
      isFigmaImageManagementEnabled={isFigmaImageManagementEnabled}
      isFigmaImagesPanelVisible={
        isFigmaImageManagementEnabled &&
        isListVisible &&
        sidePanel === 'figma-images'
      }
      isQaPanelVisible={isListVisible && sidePanel === 'qa'}
      isSourceTreePanelVisible={isListVisible && sidePanel === 'source'}
      presenceSessionId={presenceSessionId}
      onOpenAbout={openAbout}
      onOpenInitialPrompt={openInitialPrompt}
      onOpenSettings={openSettings}
      onToggleFigmaImagesPanel={toggleFigmaImagesPanel}
      onToggleQaPanel={toggleQaPanel}
      onToggleSourceTreePanel={toggleSourceTreePanel}
    />
  );
};
