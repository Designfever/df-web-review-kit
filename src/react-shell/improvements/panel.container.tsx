import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellStore } from '../store/store.context';
import { ImprovementsPanel } from './panel';

export const ImprovementsPanelContainer = () => {
  const { improvementAdapterEntry, projectId } = useReviewShellConfig();
  const isVisible = useReviewShellStore(
    (state) => state.isListVisible && state.sidePanel === 'improvements'
  );
  const activeRoute = useReviewShellStore((state) => state.activeRoute);
  const setIsListVisible = useReviewShellStore(
    (state) => state.setIsListVisible
  );

  if (!improvementAdapterEntry?.createImprovement) return null;

  return (
    <ImprovementsPanel
      adapter={improvementAdapterEntry}
      isVisible={isVisible}
      projectId={projectId}
      reviewRoute={activeRoute}
      onClose={() => setIsListVisible(false)}
    />
  );
};
