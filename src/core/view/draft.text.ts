// Draft 관련 수치를 사람이 읽을 문자열로 변환하는 모듈.
// (adjustment 패널의 x/y/scale 표시, area 크기 표시, 저장 코멘트 꼬리표 등)
// 실제 기하 계산은 draft.metrics.ts 가 담당하고 여기서는 포맷만 한다.
import type {
  ReviewViewportPreset,
  ViewportSize,
  WebReviewKitOptions,
} from '../../types';
import * as draftMetrics from '../draft.metrics';
import { toViewportSelection, type ViewportSelection } from '../geometry';
import type { AreaDraft, DomDraft } from '../review/draft';

const DEFAULT_ADJUSTMENT_LABEL = 'Responsive CSS px adjustments';

/** Host-configurable label shown on the adjustment panel and saved comments. */
export function getAdjustmentLabel(options: WebReviewKitOptions) {
  return options.adjustmentLabel?.trim() || DEFAULT_ADJUSTMENT_LABEL;
}

/** Formats a delta as "+3px" / "-2px"; zero keeps the plus for alignment. */
function formatSignedPx(value: number) {
  if (value === 0) return '+0px';
  return `${value > 0 ? '+' : ''}${value}px`;
}

function formatRoundedPx(value: number) {
  return `${Math.round(value)}px`;
}

/**
 * Converts a viewport-space selection into design-space (media query) pixels
 * using the preset's design width, so reviewers see design values, not CSS px.
 */
function getSelectionMqMetrics(
  selection: ViewportSelection,
  viewport: ViewportSize,
  presets?: ReviewViewportPreset[]
) {
  const { scale } = draftMetrics.getDraftViewportScale(viewport, presets);
  const ratio = scale > 0 ? 1 / scale : 1;

  return {
    x: selection.left * ratio,
    y: selection.top * ratio,
    width: selection.width * ratio,
    height: selection.height * ratio,
  };
}

/** Three display lines (label / position / size) for the area metrics panel. */
export function getSelectionMetricLines(
  selection: ViewportSelection | undefined,
  viewport: ViewportSize,
  presets?: ReviewViewportPreset[]
) {
  if (!selection) return ['area', 'x none / y none', 'w none / h none'];

  const metrics = getSelectionMqMetrics(selection, viewport, presets);
  return [
    'area',
    `x ${formatRoundedPx(metrics.x)} / y ${formatRoundedPx(metrics.y)}`,
    `w ${formatRoundedPx(metrics.width)} / h ${formatRoundedPx(
      metrics.height
    )}`,
  ];
}

/** Selection rectangle an area draft should report metrics for, if any. */
export function getAreaDraftMetricSelection(draft: AreaDraft) {
  if (!draft.selection) return undefined;

  return toViewportSelection(draft.selection.viewport);
}

/** Two display lines (x/y and scale) for the DOM adjustment panel. */
export function getDraftAdjustmentMetricLines(
  draft: DomDraft,
  presets?: ReviewViewportPreset[]
) {
  const metrics = draftMetrics.getDraftAdjustmentMetrics(draft, presets);
  return [
    `x ${formatSignedPx(metrics.x)} / y ${formatSignedPx(metrics.y)}`,
    `scale ${formatSignedPx(metrics.scale)}`,
  ];
}

/**
 * Appends the adjustment summary to a saved comment so the reviewed change
 * (x/y/scale in design px) survives even after the draft preview is gone.
 */
export function withDraftAdjustmentComment(
  comment: string,
  draft: DomDraft,
  options: WebReviewKitOptions
) {
  const presets = options.viewports?.presets;
  if (!draftMetrics.hasDraftAdjustment(draft, presets)) return comment;

  const trimmedComment = comment.trim();
  const metrics = draftMetrics.getDraftAdjustmentMetrics(draft, presets);
  const adjustment = [
    `${getAdjustmentLabel(options)}: x ${formatSignedPx(
      metrics.x
    )}, y ${formatSignedPx(metrics.y)}, scale ${formatSignedPx(
      metrics.scale
    )}`,
    `(${metrics.presetLabel} viewport, ${Math.round(
      metrics.viewportWidth
    )}/design ${Math.round(metrics.designWidth)})`,
  ].join(' ');

  return trimmedComment ? `${trimmedComment}\n${adjustment}` : adjustment;
}
