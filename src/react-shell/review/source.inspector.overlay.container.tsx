import { useReviewSourceInspectorState } from './source.inspector.context';
import { SourceInspectorOverlay } from './source.inspector.overlay';
import { SourceInspectorPopup } from './source.inspector.popup';

export const SourceInspectorOverlayContainer = () => {
  const {
    componentSelectionState,
    selectSourceComponent,
    sourceComponentPopup,
    sourceInspectorState,
  } = useReviewSourceInspectorState();

  return (
    <>
      <SourceInspectorOverlay
        componentSelectionState={componentSelectionState}
        state={sourceInspectorState}
      />
      <SourceInspectorPopup
        popup={sourceComponentPopup}
        onSelectEntry={selectSourceComponent}
      />
    </>
  );
};
