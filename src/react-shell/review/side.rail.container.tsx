import { useReviewFigmaImagesState } from '../figma/images.context';
import { useReviewPresenceState } from '../presence/presence.context';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellStore } from '../store/store.context';
import { ReviewSideRail } from './side.rail';
import { CustomPanelRailButtons } from '../custom-panels/rail';

export const ReviewSideRailContainer = () => {
  const { improvementAdapterEntry, onLogout } = useReviewShellConfig();
  const {
    openAbout,
    toggleFigmaImagesPanel,
    toggleImprovementsPanel,
    toggleDesignInspectorPanel,
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
  const isImprovementsOpen = useReviewShellStore((state) => state.isImprovementsOpen);
  const sidePanel = useReviewShellStore((state) => state.sidePanel);

  return (
    <ReviewSideRail
      customButtons={<CustomPanelRailButtons />}
      currentPagePresenceUsers={currentPagePresenceUsers}
      isFigmaImageManagementEnabled={isFigmaImageManagementEnabled}
      isFigmaImagesPanelVisible={
        isFigmaImageManagementEnabled &&
        isListVisible &&
        sidePanel === 'figma-images'
      }
      isQaPanelVisible={isListVisible && sidePanel === 'qa'}
      isImprovementEnabled={Boolean(improvementAdapterEntry?.createImprovement)}
      isImprovementsPanelVisible={
        Boolean(improvementAdapterEntry?.createImprovement) &&
        isImprovementsOpen
      }
      isDesignInspectorVisible={isListVisible && sidePanel === 'design-inspector'}
      isSourceTreePanelVisible={isListVisible && sidePanel === 'source'}
      presenceSessionId={presenceSessionId}
      onOpenAbout={openAbout}
      onLogout={onLogout}
      onToggleFigmaImagesPanel={toggleFigmaImagesPanel}
      onToggleImprovementsPanel={toggleImprovementsPanel}
      onToggleDesignInspector={toggleDesignInspectorPanel}
      onToggleQaPanel={toggleQaPanel}
      onToggleSourceTreePanel={toggleSourceTreePanel}
    />
  );
};
