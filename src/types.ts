export type ReviewItemKind = 'note' | 'area';
export type ReviewItemScope = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'dom';
export type ReviewWorkflowStatus = 'todo' | 'doing' | 'review' | 'hold' | 'done';
export type ReviewItemStatus = 'open' | 'resolved' | ReviewWorkflowStatus;
export type ReviewMode = 'idle' | 'note' | 'element' | 'area';
export type ReviewSource = 'local' | 'df-sheet' | 'supabase' | (string & {});
export type ReviewSubmitStatus =
  | 'idle'
  | 'submitting'
  | 'submitted'
  | 'failed';
export type ReviewViewportScope = Exclude<ReviewItemScope, 'dom'>;
export type DomAnchorStrategy =
  | 'configured-attribute'
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
  externalIssueId?: string;
  externalIssueUrl?: string;
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
  remove(id: string): Promise<void>;
}

export interface LocalAdapterOptions {
  storageKey?: string;
}

export interface DfSheetAdapterOptions {
  baseUrl?: string;
  projectId: string;
  pageId: string;
  reviewProjectId?: string;
  reviewPathPrefix?: string;
  source?: string;
  issueType?: string;
  priority?: string;
  token?: string;
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
}

export interface NumberedReviewItem {
  item: ReviewItem;
  scope: ReviewItemScope;
  label: string;
  number?: number;
  displayLabel: string;
}

export interface WebReviewKitOptions {
  projectId: string;
  adapter?: WebReviewKitAdapter;
  target?: WebReviewKitTarget | (() => WebReviewKitTarget | undefined);
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
}
