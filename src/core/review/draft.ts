import type {
  DomAnchor,
  ReviewAttachmentKind,
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

export interface ReviewDraftAttachment {
  id: string;
  file: File | Blob;
  name: string;
  mime: string;
  size: number;
  kind: ReviewAttachmentKind;
  previewUrl?: string;
  metadata?: Record<string, unknown>;
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
  attachments?: ReviewDraftAttachment[];
}

/** In-progress DOM item before it is persisted through the adapter. */
export interface DomDraft extends ReviewDraftComposer {
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
  attachments?: ReviewDraftAttachment[];
}
