export type SourceInspectorRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type SourceInspectorState = {
  rect: SourceInspectorRect;
  targetElement: Element;
};

type SourceInspectorOverlayProps = {
  componentSelectionState: SourceInspectorState | null;
  state: SourceInspectorState | null;
};

export const SourceInspectorOverlay = ({
  componentSelectionState,
  state,
}: SourceInspectorOverlayProps) => {
  const hoverState =
    state?.targetElement === componentSelectionState?.targetElement
      ? null
      : state;

  return (
    <>
      {componentSelectionState ? (
        <div
          className="df-review-source-outline is-component-selection"
          style={{
            height: `${componentSelectionState.rect.height}px`,
            left: `${componentSelectionState.rect.left}px`,
            top: `${componentSelectionState.rect.top}px`,
            width: `${componentSelectionState.rect.width}px`,
          }}
        />
      ) : null}
      {hoverState ? (
        <div
          className="df-review-source-outline is-hover"
          style={{
            height: `${hoverState.rect.height}px`,
            left: `${hoverState.rect.left}px`,
            top: `${hoverState.rect.top}px`,
            width: `${hoverState.rect.width}px`,
          }}
        />
      ) : null}
    </>
  );
};
