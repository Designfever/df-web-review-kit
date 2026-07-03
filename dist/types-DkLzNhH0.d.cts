type ReviewItemKind = 'note' | 'area';
type ReviewItemScope = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'dom';
type ReviewWorkflowStatus = 'todo' | 'doing' | 'review' | 'hold' | 'done';
type ReviewItemStatus = 'open' | 'resolved' | ReviewWorkflowStatus;
type ReviewMode = 'idle' | 'note' | 'element' | 'area';
type ReviewSource = 'local' | 'supabase' | (string & {});
type ReviewSubmitStatus = 'idle' | 'submitting' | 'submitted' | 'failed';
type ReviewViewportScope = Exclude<ReviewItemScope, 'dom'>;
type DomAnchorStrategy = 'configured-attribute' | 'attribute' | 'id' | 'class' | 'dom-path';
interface ReviewRulerConfig {
    enabled?: boolean;
    unit?: string;
}
interface DomAnchorCandidate {
    selector: string;
    strategy: DomAnchorStrategy;
    textFingerprint?: string;
    confidence?: number;
}
interface DomSourceHint {
    component?: string;
    file?: string;
    line?: string;
    column?: string;
    sectionId?: string;
    sectionIndex?: string;
}
interface DomAnchor extends DomAnchorCandidate {
    candidates?: DomAnchorCandidate[];
    htmlSnippet?: string;
    source?: DomSourceHint;
}
interface RelativeSelection {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface ViewportSize {
    width: number;
    height: number;
}
interface ReviewAssigneeOption {
    value: string;
    label: string;
}
type ReviewExternalLinkIcon = 'external' | 'github' | 'issue' | 'jira' | 'sheet' | (string & {});
interface ReviewExternalLink {
    label: string;
    url: string;
    title?: string;
    icon?: ReviewExternalLinkIcon;
}
type ReviewAttachmentKind = 'file' | 'image' | 'capture' | (string & {});
interface ReviewAttachment {
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
interface ReviewAttachmentUploadInput {
    file: File | Blob;
    name?: string;
    mime?: string;
    kind?: ReviewAttachmentKind;
    item?: ReviewItem;
    metadata?: Record<string, unknown>;
}
type ReviewAttachmentUploadErrorReason = 'quota-exceeded' | 'storage-full' | 'unsupported-type' | 'permission-denied' | 'upload-failed' | (string & {});
interface ReviewAttachmentUploadError extends Error {
    reason: ReviewAttachmentUploadErrorReason;
}
interface ReviewViewportCaptureInput {
    routeKey: string;
    pageUrl: string;
    originalUrl?: string;
    viewport: ViewportSize;
    devicePixelRatio?: number;
    scroll: {
        x: number;
        y: number;
    };
    marker?: ReviewMarker;
    selection?: ReviewSelection;
    timestamp: string;
}
interface ReviewViewportCaptureResult {
    file: Blob;
    name?: string;
    mime?: string;
    width?: number;
    height?: number;
    metadata?: Record<string, unknown>;
}
interface ReviewPoint {
    x: number;
    y: number;
}
interface ReviewMarker {
    viewport: ReviewPoint;
    relative?: ReviewPoint;
}
interface ReviewSelection {
    viewport: RelativeSelection;
    relative?: RelativeSelection;
}
interface ReviewItem {
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
interface ReviewItemQuery {
    projectId: string;
    pageId?: string;
    routeKey?: string;
    normalizedPath?: string;
    status?: ReviewItemStatus;
    source?: string;
}
interface WebReviewKitAdapter {
    get(id: string): Promise<ReviewItem | null>;
    list(query: ReviewItemQuery): Promise<ReviewItem[]>;
    create(item: ReviewItem): Promise<ReviewItem>;
    update(id: string, patch: Partial<Omit<ReviewItem, 'id' | 'createdAt'>>): Promise<ReviewItem>;
    uploadAttachment?(input: ReviewAttachmentUploadInput): Promise<ReviewAttachment>;
    remove(id: string): Promise<void>;
}
interface LocalAdapterOptions {
    storageKey?: string;
}
interface SupabaseReviewClient {
    from(table: string): any;
    rpc?: (fn: string, args?: Record<string, unknown>) => any;
}
interface SupabaseReviewAdapterOptions {
    client: SupabaseReviewClient;
    table?: string;
    projectId: string;
    source?: ReviewSource;
    createRpc?: string;
    reviewPathPrefix?: string;
    unsafeClientReviewNumberFallback?: boolean;
}
interface ReviewViewportPreset {
    label: string;
    width: number;
    height: number;
    scope?: Exclude<ReviewItemScope, 'dom'>;
    designWidth?: number;
    designHeight?: number;
}
interface NumberedReviewItem {
    item: ReviewItem;
    scope: ReviewItemScope;
    label: string;
    number?: number;
    displayLabel: string;
}
interface ReviewFieldsConfig {
    title?: boolean;
}
interface WebReviewKitOptions {
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
interface WebReviewKitController {
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
interface WebReviewKitTarget {
    window: Window;
    document: Document;
    getViewportRect?: () => Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
    getOverlayRect?: () => Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
    getComposerHost?: () => HTMLElement | null | undefined;
    captureViewport?: (input: ReviewViewportCaptureInput) => Promise<ReviewViewportCaptureResult>;
}

export type { ReviewSubmitStatus as A, ReviewViewportScope as B, SupabaseReviewClient as C, DomAnchor as D, WebReviewKitTarget as E, ReviewFieldsConfig as F, LocalAdapterOptions as L, NumberedReviewItem as N, ReviewWorkflowStatus as R, SupabaseReviewAdapterOptions as S, ViewportSize as V, WebReviewKitAdapter as W, ReviewItemStatus as a, WebReviewKitOptions as b, WebReviewKitController as c, ReviewViewportPreset as d, ReviewItem as e, ReviewItemScope as f, DomAnchorCandidate as g, DomAnchorStrategy as h, DomSourceHint as i, RelativeSelection as j, ReviewAssigneeOption as k, ReviewAttachment as l, ReviewAttachmentKind as m, ReviewAttachmentUploadError as n, ReviewAttachmentUploadErrorReason as o, ReviewAttachmentUploadInput as p, ReviewExternalLink as q, ReviewExternalLinkIcon as r, ReviewItemKind as s, ReviewItemQuery as t, ReviewMarker as u, ReviewMode as v, ReviewPoint as w, ReviewRulerConfig as x, ReviewSelection as y, ReviewSource as z };
