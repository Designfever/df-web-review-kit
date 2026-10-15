import type { ReviewRulerMeasure, ReviewRulerPoint } from '../types';

export const getRulerPointFromRect = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  size = { width: rect.width, height: rect.height },
): ReviewRulerPoint => {
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);

  return {
    x: Math.round(rect.width > 0 ? x * size.width / rect.width : 0),
    y: Math.round(rect.height > 0 ? y * size.height / rect.height : 0)
  };
};

export const getRulerMeasure = (
  start: ReviewRulerPoint | null,
  end: ReviewRulerPoint | null
): ReviewRulerMeasure | undefined => {
  if (!start || !end) return undefined;

  return {
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
};
