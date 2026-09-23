import type {
  DomAnchor,
  ReviewAttachmentKind,
  ReviewItemStatus,
  ReviewMarker,
  ReviewPoint,
  ReviewRectangleAnnotation,
  ReviewSelection,
  ViewportSize,
} from '../../types';

export type ReviewDraftPreviewElement = HTMLElement | SVGElement;

interface ReviewAdjustmentDraft extends ReviewPoint {
  isActive?: boolean;
  preview?: boolean;
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
  /** Target scroll position used to keep viewport geometry attached to page content. */
  scroll?: ReviewPoint;
  anchor?: DomAnchor;
  marker?: ReviewMarker;
  selection?: ReviewSelection;
  title?: string;
  comment?: string;
  status?: ReviewItemStatus;
  assigneeId?: string | null;
  assigneeName?: string;
  assigneeIds?: string[];
  assigneeNames?: string[];
  attachments?: ReviewDraftAttachment[];
  annotationTool?: 'rectangle';
  annotations?: ReviewRectangleAnnotation[];
}

/** In-progress DOM item before it is persisted through the adapter. */
export interface DomDraft extends ReviewDraftComposer {
  /** Selection-only drafts do not show the QA composer or create review items. */
  isSelectionOnly?: boolean;
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker: ReviewMarker;
  selection?: ReviewSelection;
  title?: string;
  comment?: string;
  status?: ReviewItemStatus;
  assigneeId?: string | null;
  assigneeName?: string;
  assigneeIds?: string[];
  assigneeNames?: string[];
  adjustment?: ReviewAdjustmentDraft;
  previewElement?: ReviewDraftPreviewElement;
  attachments?: ReviewDraftAttachment[];
  annotationTool?: 'rectangle';
  annotations?: ReviewRectangleAnnotation[];
}
