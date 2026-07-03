import React from 'react';
import type { SourceCandidate } from '../source.open';

export type SourceInspectorRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type SourceInspectorCandidate = SourceCandidate & {
  openUrl: string | null;
};

export type SourceInspectorState = {
  candidates: SourceInspectorCandidate[];
  isPinned: boolean;
  panelLeft: number;
  panelMaxWidth: number;
  panelRight: number | null;
  panelTop: number;
  rect: SourceInspectorRect;
};

type SourceInspectorOverlayProps = {
  state: SourceInspectorState | null;
  interactionRef: React.MutableRefObject<boolean>;
  onClear: () => void;
  onOpenCandidate: (candidate: SourceInspectorCandidate) => void;
};

export const SourceInspectorOverlay = ({
  state,
  interactionRef,
  onClear,
  onOpenCandidate,
}: SourceInspectorOverlayProps) => {
  if (!state) return null;

  return (
    <>
      <div
        className={`df-review-source-outline${
          state.isPinned ? ' is-pinned' : ''
        }`}
        style={{
          height: `${state.rect.height}px`,
          left: `${state.rect.left}px`,
          top: `${state.rect.top}px`,
          width: `${state.rect.width}px`,
        }}
      />
      {state.candidates.length > 0 && (
        <div
          className={`df-review-source-popover${
            state.isPinned ? ' is-pinned' : ''
          }`}
          style={{
            left:
              state.panelRight === null
                ? `${state.panelLeft}px`
                : undefined,
            maxWidth: `${state.panelMaxWidth}px`,
            right:
              state.panelRight === null
                ? undefined
                : `${state.panelRight}px`,
            top: `${state.panelTop}px`,
          }}
          onPointerDown={() => {
            interactionRef.current = true;
          }}
          onPointerEnter={() => {
            interactionRef.current = true;
          }}
          onPointerLeave={() => {
            interactionRef.current = false;
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="df-review-source-popover-close">
            <button
              aria-label="Close source candidates"
              type="button"
              onClick={onClear}
            >
              ×
            </button>
          </div>
          <div className="df-review-source-candidate-list">
            {state.candidates.map((candidate) => (
              <button
                key={candidate.id}
                className={`df-review-source-candidate is-${candidate.kind}`}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onOpenCandidate(candidate);
                }}
              >
                <span className="df-review-source-candidate-main">
                  <strong>{candidate.label}</strong>
                  <span>{candidate.filePath}</span>
                  <small>
                    {[candidate.positionLabel || '-:-', candidate.detail]
                      .filter(Boolean)
                      .join(' · ')}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
