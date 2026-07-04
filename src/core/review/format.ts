import type {
  DomAnchor,
  RelativeSelection,
  ReviewItem,
  ReviewPoint,
  ViewportSize,
} from '../../types';
import { getAnchorCandidates } from '../dom.anchor';
import type { DomDraft } from './draft';
import { getItemMarker, getItemSelection } from './item';

/** Formats DOM draft metadata for compact debug display in the overlay UI. */
export function formatDomDraftMeta(draft: DomDraft) {
  const parts = [
    `viewport ${formatSize(draft.viewport)}`,
    `point ${formatPoint(draft.marker.viewport)}`,
  ];

  if (draft.anchor) {
    parts.push(formatAnchorMeta(draft.anchor));
  }

  return parts.join(' / ');
}

/** Formats persisted item metadata for list rows, marker titles, and overlays. */
export function formatItemMeta(item: ReviewItem) {
  const parts = [formatDate(item.createdAt)];
  const marker = getItemMarker(item);
  const selection = getItemSelection(item);

  if (item.viewport) {
    parts.push(`viewport ${formatSize(item.viewport)}`);
  }

  if (marker) {
    parts.push(`point ${formatPoint(marker.viewport)}`);
  }

  if (selection) {
    parts.push(`rect ${formatSelection(selection.viewport)}`);
  }

  if (item.anchor) {
    parts.push(formatAnchorMeta(item.anchor));
  }

  return parts.join(' / ');
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSize(size: ViewportSize) {
  return `${Math.round(size.width)}x${Math.round(size.height)}`;
}

function formatPoint(point: ReviewPoint) {
  return `${Math.round(point.x)},${Math.round(point.y)}`;
}

function formatSelection(selection: RelativeSelection) {
  return [
    Math.round(selection.x),
    Math.round(selection.y),
    Math.round(selection.width),
    Math.round(selection.height),
  ].join(',');
}

function formatAnchorMeta(anchor: DomAnchor) {
  const parts = [`dom ${anchor.strategy}`];

  if (typeof anchor.confidence === 'number') {
    parts.push(`${Math.round(anchor.confidence * 100)}%`);
  }

  const candidates = getAnchorCandidates(anchor);
  if (candidates.length > 1) {
    parts.push(`${candidates.length} candidates`);
  }

  return parts.join(' ');
}
