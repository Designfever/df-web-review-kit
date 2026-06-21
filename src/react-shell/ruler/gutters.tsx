import type { CSSProperties } from 'react';
import type { ReviewRulerPoint, ReviewShellViewportPreset } from '../types';

interface RulerGuttersProps {
  rulerHover: ReviewRulerPoint | null;
  rulerScaleX: number;
  rulerScaleY: number;
  rulerUnit: string;
  size: ReviewShellViewportPreset;
}

export const RulerGutters = ({
  rulerHover,
  rulerScaleX,
  rulerScaleY,
  rulerUnit,
  size,
}: RulerGuttersProps) => {
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
