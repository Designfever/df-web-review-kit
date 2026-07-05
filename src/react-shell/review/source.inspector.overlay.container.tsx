import { useReviewSourceInspectorState } from './source.inspector.context';
import { SourceInspectorOverlay } from './source.inspector.overlay';

export const SourceInspectorOverlayContainer = () => {
  const {
    clearSourceInspector,
    openSourceCandidate,
    sourceInspectorInteractionRef,
    sourceInspectorState,
  } = useReviewSourceInspectorState();

  return (
    <SourceInspectorOverlay
      interactionRef={sourceInspectorInteractionRef}
      state={sourceInspectorState}
      onClear={clearSourceInspector}
      onOpenCandidate={openSourceCandidate}
    />
  );
};
