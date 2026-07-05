import type { CSSProperties } from 'react';
import { useReviewRulerState } from '../store/ruler.context';
import { useReviewShellStore } from '../store/store.context';

export const RulerGutters = () => {
  const size = useReviewShellStore((state) => state.size);
  const {
    rulerHover,
    rulerScaleX,
    rulerScaleY,
    rulerUnit,
  } = useReviewRulerState();

  return (
    <>
      <div className="df-review-ruler-corner" aria-hidden="true" />
      <div
        className="df-review-ruler-gutter is-x"
        style={
          {
            '--df-review-ruler-step-x': `${rulerScaleX * 20}px`,
          } as CSSProperties
        }
      >
        <div className="df-review-ruler-frame-label">
          <strong>{size.label}</strong>
          <span>
            {size.designWidth}
            {size.designHeight ? `x${size.designHeight}` : ''}
            {rulerUnit}
          </span>
        </div>
        {rulerHover && (
          <div
            className="df-review-ruler-coord is-x"
            style={{ left: `${rulerHover.x}px` }}
          >
            {Math.round(rulerHover.x / rulerScaleX)}
          </div>
        )}
      </div>
      <div
        className="df-review-ruler-gutter is-y"
        style={
          {
            '--df-review-ruler-step-y': `${rulerScaleY * 20}px`,
          } as CSSProperties
        }
      >
        {rulerHover && (
          <div
            className="df-review-ruler-coord is-y"
            style={{ top: `${rulerHover.y}px` }}
          >
            {Math.round(rulerHover.y / rulerScaleY)}
          </div>
        )}
      </div>
    </>
  );
};
