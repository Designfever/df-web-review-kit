import { useReviewSourceInspectorState } from './source.inspector.context';
import { SourceInspectorOverlay } from './source.inspector.overlay';

export const SourceInspectorOverlayContainer = () => {
  const { componentSelectionState, sourceInspectorState } =
    useReviewSourceInspectorState();

  return (
    <SourceInspectorOverlay
      componentSelectionState={componentSelectionState}
      state={sourceInspectorState}
    />
  );
};
