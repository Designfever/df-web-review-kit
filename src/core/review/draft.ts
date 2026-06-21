import type {
  DomAnchor,
  ReviewMarker,
  ReviewSelection,
  ViewportSize,
} from '../../types';

/** In-progress area item before it is persisted through the adapter. */
export interface AreaDraft {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker?: ReviewMarker;
  selection?: ReviewSelection;
}

/** In-progress note or DOM item before it is persisted through the adapter. */
export interface NoteDraft {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker: ReviewMarker;
  selection?: ReviewSelection;
  comment?: string;
}
