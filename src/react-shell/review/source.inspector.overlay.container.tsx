import { useReviewSourceInspectorState } from './source.inspector.context';
import { SourceInspectorOverlay } from './source.inspector.overlay';

export const SourceInspectorOverlayContainer = () => {
  const { sourceInspectorState } = useReviewSourceInspectorState();

  return <SourceInspectorOverlay state={sourceInspectorState} />;
};
