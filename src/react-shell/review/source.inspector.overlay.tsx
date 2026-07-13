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
  state: SourceInspectorState | null;
};

export const SourceInspectorOverlay = ({
  state,
}: SourceInspectorOverlayProps) => {
  if (!state) return null;

  return (
    <div
      className="df-review-source-outline"
      style={{
        height: `${state.rect.height}px`,
        left: `${state.rect.left}px`,
        top: `${state.rect.top}px`,
        width: `${state.rect.width}px`,
      }}
    />
  );
};
