import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellStore } from '../store/store.context';
import { ImprovementsPanel } from './panel';

export const ImprovementsPanelContainer = () => {
  const { improvementAdapterEntry, projectId } = useReviewShellConfig();
  const isVisible = useReviewShellStore(
    (state) => state.isImprovementsOpen
  );
  const activeRoute = useReviewShellStore((state) => state.activeRoute);
  const setIsImprovementsOpen = useReviewShellStore(
    (state) => state.setIsImprovementsOpen
  );

  if (!improvementAdapterEntry?.createImprovement) return null;

  return (
    <ImprovementsPanel
      adapter={improvementAdapterEntry}
      isVisible={isVisible}
      projectId={projectId}
      reviewRoute={activeRoute}
      onClose={() => setIsImprovementsOpen(false)}
    />
  );
};
