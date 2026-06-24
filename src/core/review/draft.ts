import type {
  DomAnchor,
  ReviewMarker,
  ReviewPoint,
  ReviewSelection,
  ViewportSize,
} from '../../types';

export type ReviewDraftPreviewElement = HTMLElement | SVGElement;

export interface ReviewAdjustmentDraft extends ReviewPoint {
  isActive?: boolean;
  scale?: number;
}

export interface ReviewDraftComposer {
  /** Host viewport top-left position for the floating draft composer. */
  composerPosition?: ReviewPoint;
}

/** In-progress area item before it is persisted through the adapter. */
export interface AreaDraft extends ReviewDraftComposer {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker?: ReviewMarker;
  selection?: ReviewSelection;
  comment?: string;
}

/** In-progress note or DOM item before it is persisted through the adapter. */
export interface NoteDraft extends ReviewDraftComposer {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker: ReviewMarker;
  selection?: ReviewSelection;
  comment?: string;
  adjustment?: ReviewAdjustmentDraft;
  previewElement?: ReviewDraftPreviewElement;
}
