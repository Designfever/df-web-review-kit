export type ReviewItemKind = 'dom' | 'area';
export type ReviewItemScope = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'dom';
export type ReviewWorkflowStatus = 'todo' | 'doing' | 'review' | 'hold' | 'done';
export type ReviewItemStatus = 'open' | 'resolved' | ReviewWorkflowStatus;
export type ReviewMode = 'idle' | 'element' | 'area';
export type ReviewSource = 'local' | 'supabase' | (string & {});
export type ReviewSubmitStatus =
  | 'idle'
  | 'submitting'
  | 'submitted'
  | 'failed';
export type ReviewViewportScope = Exclude<ReviewItemScope, 'dom'>;
export type DomAnchorStrategy =
  | 'configured-attribute'
  | 'attribute'
  | 'id'
  | 'class'
  | 'dom-path';

export interface ReviewRulerConfig {
  enabled?: boolean;
  unit?: string;
}

export interface DomAnchorCandidate {
  selector: string;
  strategy: DomAnchorStrategy;
  textFingerprint?: string;
  confidence?: number;
}

export interface DomSourceHint {
  component?: string;
  file?: string;
  line?: string;
  column?: string;
  sectionId?: string;
  sectionIndex?: string;
}

export interface DomAnchor extends DomAnchorCandidate {
  candidates?: DomAnchorCandidate[];
  htmlSnippet?: string;
  source?: DomSourceHint;
}

export interface RelativeSelection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ReviewAssigneeOption {
  value: string;
  label: string;
}

export type ReviewExternalLinkIcon =
  | 'external'
  | 'github'
  | 'issue'
  | 'jira'
  | 'sheet'
  | (string & {});

export interface ReviewExternalLink {
  label: string;
  url: string;
  title?: string;
  icon?: ReviewExternalLinkIcon;
}

export type ReviewAttachmentKind =
  | 'file'
  | 'image'
  | 'capture'
  | (string & {});

export interface ReviewAttachment {
  id?: string;
  url: string;
  name: string;
  mime: string;
  size: number;
  kind?: ReviewAttachmentKind;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface ReviewAttachmentUploadInput {
  file: File | Blob;
  name?: string;
  mime?: string;
  kind?: ReviewAttachmentKind;
  item?: ReviewItem;
  metadata?: Record<string, unknown>;
}

export type ReviewAttachmentUploadErrorReason =
  | 'quota-exceeded'
  | 'storage-full'
  | 'unsupported-type'
  | 'permission-denied'
  | 'upload-failed'
  | (string & {});

export interface ReviewAttachmentUploadError extends Error {
  reason: ReviewAttachmentUploadErrorReason;
}

export interface ReviewViewportCaptureInput {
  routeKey: string;
  pageUrl: string;
  originalUrl?: string;
  viewport: ViewportSize;
  captureRegion?: RelativeSelection;
  devicePixelRatio?: number;
  scroll: {
    x: number;
    y: number;
  };
  marker?: ReviewMarker;
  selection?: ReviewSelection;
  timestamp: string;
}

export interface ReviewViewportCaptureResult {
  file: Blob;
  name?: string;
  mime?: string;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
}

export interface ReviewPoint {
  x: number;
  y: number;
}

export interface ReviewMarker {
  viewport: ReviewPoint;
  relative?: ReviewPoint;
}

export interface ReviewSelection {
  viewport: RelativeSelection;
  relative?: RelativeSelection;
}

export interface ReviewItem {
  id: string;
  reviewNumber?: number;
  projectId: string;
  routeKey: string;
  pageUrl: string;
  originalUrl?: string;
  normalizedPath: string;
  scope?: ReviewItemScope;
  kind: ReviewItemKind;
  title?: string;
  comment: string;
  assigneeId?: string | null;
  assigneeName?: string;
  createdBy?: string;
  status: ReviewItemStatus;
  viewport: ViewportSize;
  devicePixelRatio?: number;
  scroll?: {
    x: number;
    y: number;
  };
  anchor?: DomAnchor;
  marker?: ReviewMarker;
  selection?: ReviewSelection;
  attachments?: ReviewAttachment[];
  externalIssueId?: string;
  externalIssueUrl?: string;
  externalLinks?: ReviewExternalLink[];
  submittedAt?: string;
  submitStatus?: ReviewSubmitStatus;
  submitError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItemQuery {
  projectId: string;
  pageId?: string;
  routeKey?: string;
  normalizedPath?: string;
  status?: ReviewItemStatus;
  source?: string;
}

export interface WebReviewKitAdapter {
  get(id: string): Promise<ReviewItem | null>;
  list(query: ReviewItemQuery): Promise<ReviewItem[]>;
  create(item: ReviewItem): Promise<ReviewItem>;
  update(
    id: string,
    patch: Partial<Omit<ReviewItem, 'id' | 'createdAt'>>
  ): Promise<ReviewItem>;
  uploadAttachment?(
    input: ReviewAttachmentUploadInput
  ): Promise<ReviewAttachment>;
  remove(id: string): Promise<void>;
}

export interface LocalAdapterOptions {
  storageKey?: string;
}

export interface SupabaseReviewClient {
  from(table: string): any;
  rpc?: (fn: string, args?: Record<string, unknown>) => any;
}

export interface SupabaseReviewAdapterOptions {
  client: SupabaseReviewClient;
  table?: string;
  projectId: string;
  source?: ReviewSource;
  createRpc?: string;
  reviewPathPrefix?: string;
  unsafeClientReviewNumberFallback?: boolean;
}

export interface ReviewViewportPreset {
  label: string;
  width: number;
  height: number;
  scope?: Exclude<ReviewItemScope, 'dom'>;
  designWidth?: number;
  designHeight?: number;
}

export interface NumberedReviewItem {
  item: ReviewItem;
  scope: ReviewItemScope;
  label: string;
  number?: number;
  displayLabel: string;
}

export interface ReviewFieldsConfig {
  title?: boolean;
}

export interface WebReviewKitOptions {
  projectId: string;
  userId?: string;
  adapter?: WebReviewKitAdapter;
  target?: WebReviewKitTarget | (() => WebReviewKitTarget | undefined);
  adjustmentLabel?: string;
  fields?: ReviewFieldsConfig;
  assigneeTitle?: string;
  assigneeOptions?: readonly ReviewAssigneeOption[];
  viewports?: {
    presets?: ReviewViewportPreset[];
  };
  ruler?: ReviewRulerConfig;
  hotkeys?: {
    qa?: string;
  };
  anchors?: {
    attribute?: string;
  };
  onRestoreItem?: (item: ReviewItem) => void | Promise<void>;
  onCreateItem?: (item: ReviewItem) => void | Promise<void>;
  onItemsChange?: (items: ReviewItem[]) => void;
  onModeChange?: (mode: ReviewMode) => void;
  ui?: {
    panel?: boolean;
  };
  modules?: {
    qa?: boolean;
    grid?: boolean;
    figma?: boolean;
  };
}

export interface WebReviewKitController {
  open(): void;
  close(): void;
  toggle(): void;
  setMode(mode: ReviewMode): void;
  startElementReview(element: Element, comment?: string): Promise<void>;
  getMode(): ReviewMode;
  highlightItem(itemId?: string): void;
  setHiddenItemIds(itemIds?: string[]): void;
  reload(): Promise<ReviewItem[]>;
  getItems(): ReviewItem[];
  destroy(): void;
}

export interface WebReviewKitTarget {
  window: Window;
  document: Document;
  getViewportRect?: () => Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
  getOverlayRect?: () => Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
  getComposerHost?: () => HTMLElement | null | undefined;
  captureViewport?: (
    input: ReviewViewportCaptureInput
  ) => Promise<ReviewViewportCaptureResult>;
}
