import type {
  DomAnchor,
  ReviewMarker,
  ReviewPoint,
  ReviewSelection,
  ViewportSize,
} from '../../types';

export type ReviewDraftPreviewElement = HTMLElement | SVGElement;

interface ReviewAdjustmentDraft extends ReviewPoint {
  isActive?: boolean;
  scale?: number;
}

interface ReviewDraftComposer {
  /** Host viewport top-left position for the floating draft composer. */
  composerPosition?: ReviewPoint;
}

/** In-progress area item before it is persisted through the adapter. */
export interface AreaDraft extends ReviewDraftComposer {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker?: ReviewMarker;
  selection?: ReviewSelection;
  title?: string;
  comment?: string;
  assigneeId?: string | null;
  assigneeName?: string;
}

/** In-progress note or DOM item before it is persisted through the adapter. */
export interface NoteDraft extends ReviewDraftComposer {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker: ReviewMarker;
  selection?: ReviewSelection;
  title?: string;
  comment?: string;
  assigneeId?: string | null;
  assigneeName?: string;
  adjustment?: ReviewAdjustmentDraft;
  previewElement?: ReviewDraftPreviewElement;
}
