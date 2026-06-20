type ReviewItemKind = 'note' | 'area';
type ReviewItemScope = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'dom';
type ReviewWorkflowStatus = 'todo' | 'doing' | 'review' | 'hold' | 'done';
type ReviewItemStatus = 'open' | 'resolved' | ReviewWorkflowStatus;
type ReviewMode = 'idle' | 'note' | 'element' | 'area';
type ReviewSource = 'local' | 'df-sheet' | 'supabase' | (string & {});
type ReviewSubmitStatus = 'idle' | 'submitting' | 'submitted' | 'failed';
type ReviewViewportScope = Exclude<ReviewItemScope, 'dom'>;
type DomAnchorStrategy = 'configured-attribute' | 'id' | 'class' | 'dom-path';
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
    remove(id: string): Promise<void>;
}
interface LocalAdapterOptions {
    storageKey?: string;
}
interface DfSheetAdapterOptions {
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
}
interface NumberedReviewItem {
    item: ReviewItem;
    scope: ReviewItemScope;
    label: string;
    number: number;
    displayLabel: string;
}
interface WebReviewKitOptions {
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
interface WebReviewKitController {
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
interface WebReviewKitTarget {
    window: Window;
    document: Document;
    getViewportRect?: () => Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
    getOverlayRect?: () => Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
}

export type { DfSheetAdapterOptions as D, LocalAdapterOptions as L, NumberedReviewItem as N, ReviewWorkflowStatus as R, SupabaseReviewAdapterOptions as S, ViewportSize as V, WebReviewKitAdapter as W, ReviewItemStatus as a, WebReviewKitOptions as b, WebReviewKitController as c, ReviewViewportPreset as d, ReviewItem as e, ReviewItemScope as f, DomAnchor as g, DomAnchorCandidate as h, DomAnchorStrategy as i, DomSourceHint as j, RelativeSelection as k, ReviewItemKind as l, ReviewItemQuery as m, ReviewMarker as n, ReviewMode as o, ReviewPoint as p, ReviewRulerConfig as q, ReviewSelection as r, ReviewSource as s, ReviewSubmitStatus as t, ReviewViewportScope as u, SupabaseReviewClient as v, WebReviewKitTarget as w };
