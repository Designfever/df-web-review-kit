// Pure geometry for draft "adjustment" (nudge/scale) previews.
// Extracted from web.review.kit.view.ts so the renderer keeps only DOM wiring.
// Each function takes the viewport presets explicitly instead of reading config,
// which keeps them side-effect free and unit-testable.
import type { ReviewPoint, ReviewViewportPreset, ViewportSize } from '../types';
import type { NoteDraft } from './review/draft';
import { toViewportSelection, type ViewportSelection } from './geometry';
import { findReviewViewportPreset } from './review/scope';

export interface DraftAdjustmentMetrics {
  x: number;
  y: number;
  scale: number;
  cssX: number;
  cssY: number;
  scaleFactor: number;
  viewportScale: number;
  designWidth: number;
  presetLabel: string;
  viewportWidth: number;
}

// Maps a viewport size to the matching preset's design scale.
export function getDraftViewportScale(
  viewport: ViewportSize,
  presets?: ReviewViewportPreset[]
) {
  const preset = findReviewViewportPreset(viewport, presets);
  const designWidth =
    typeof preset.designWidth === 'number' && preset.designWidth > 0
      ? preset.designWidth
      : viewport.width;
  const scale = designWidth > 0 ? viewport.width / designWidth : 1;

  return { scale, designWidth, presetLabel: preset.label };
}

// Resolves the raw adjustment (design-space x/y/scale) into CSS-space deltas.
export function getDraftAdjustmentMetrics(
  draft: NoteDraft,
  presets?: ReviewViewportPreset[]
): DraftAdjustmentMetrics {
  const adjustment = draft.adjustment;
  const x = adjustment?.x ?? 0;
  const y = adjustment?.y ?? 0;
  const scale = adjustment?.scale ?? 0;
  const {
    scale: viewportScale,
    designWidth,
    presetLabel,
  } = getDraftViewportScale(draft.viewport, presets);
  const selection = draft.selection
    ? toViewportSelection(draft.selection.viewport)
    : undefined;
  const scaleCssDelta = scale * viewportScale;
  const scaleFactor =
    selection && selection.width > 0
      ? Math.max(
          1 / selection.width,
          (selection.width + scaleCssDelta) / selection.width
        )
      : 1;

  return {
    x,
    y,
    scale,
    cssX: x * viewportScale,
    cssY: y * viewportScale,
    scaleFactor,
    viewportScale,
    designWidth,
    presetLabel,
    viewportWidth: draft.viewport.width,
  };
}

export function hasDraftAdjustment(
  draft: NoteDraft,
  presets?: ReviewViewportPreset[]
) {
  const metrics = getDraftAdjustmentMetrics(draft, presets);
  return metrics.x !== 0 || metrics.y !== 0 || metrics.scale !== 0;
}

export function getAdjustedDraftPoint(
  point: ReviewPoint,
  draft: NoteDraft,
  presets?: ReviewViewportPreset[]
) {
  const metrics = getDraftAdjustmentMetrics(draft, presets);
  return {
    x: point.x + metrics.cssX,
    y: point.y + metrics.cssY,
  };
}

export function getAdjustedDraftSelection(
  selection: ViewportSelection,
  draft: NoteDraft,
  presets?: ReviewViewportPreset[]
) {
  const metrics = getDraftAdjustmentMetrics(draft, presets);
  return {
    ...selection,
    left: selection.left + metrics.cssX,
    top: selection.top + metrics.cssY,
    width: selection.width * metrics.scaleFactor,
    height: selection.height * metrics.scaleFactor,
  };
}
