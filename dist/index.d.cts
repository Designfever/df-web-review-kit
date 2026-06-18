type ReviewItemKind = 'text' | 'capture';
type ReviewItemScope = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'dom';
type ReviewWorkflowStatus = 'todo' | 'doing' | 'review' | 'hold' | 'done';
type ReviewItemStatus = 'open' | 'resolved' | ReviewWorkflowStatus;
type ReviewMode = 'idle' | 'text' | 'element' | 'capture';
type ReviewViewportScope = Exclude<ReviewItemScope, 'dom'>;
type DomAnchorStrategy = 'configured-attribute' | 'id' | 'class' | 'dom-path';
interface ReviewRulerFrame {
    label?: string;
    scope?: ReviewViewportScope;
    viewportWidth?: number;
    viewportHeight?: number;
    designWidth: number;
    designHeight?: number;
}
interface ReviewRulerConfig {
    enabled?: boolean;
    unit?: string;
    frames?: ReviewRulerFrame[];
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
interface ReviewScreenshot {
    dataUrl: string;
    width: number;
    height: number;
}
interface ReviewSelection {
    viewport: RelativeSelection;
    relative?: RelativeSelection;
}
interface ReviewItem {
    id: string;
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
    screenshot?: ReviewScreenshot;
    externalIssueId?: string;
    createdAt: string;
    updatedAt: string;
}
interface ReviewItemQuery {
    projectId: string;
    routeKey?: string;
    normalizedPath?: string;
    status?: ReviewItemStatus;
}
interface WebReviewKitAdapter {
    list(query: ReviewItemQuery): Promise<ReviewItem[]>;
    create(item: ReviewItem): Promise<ReviewItem>;
    update(id: string, patch: Partial<Omit<ReviewItem, 'id' | 'createdAt'>>): Promise<ReviewItem>;
    remove(id: string): Promise<void>;
}
interface LocalAdapterOptions {
    storageKey?: string;
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
declare const REVIEW_WORKFLOW_STATUS_OPTIONS: Array<{
    value: ReviewWorkflowStatus;
    label: string;
}>;
declare function normalizeReviewItemStatus(status: ReviewItemStatus | undefined): ReviewWorkflowStatus;
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
    highlightItem(itemId: string): void;
    reload(): Promise<ReviewItem[]>;
    getItems(): ReviewItem[];
    destroy(): void;
}
interface WebReviewKitTarget {
    window: Window;
    document: Document;
    getViewportRect?: () => Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
}
declare const DEFAULT_REVIEW_VIEWPORTS: ReviewViewportPreset[];
declare function findReviewViewportPreset(viewport: ViewportSize, presets?: ReviewViewportPreset[]): ReviewViewportPreset;
declare function getReviewViewportScope(viewport: ViewportSize, presets?: ReviewViewportPreset[]): Exclude<ReviewItemScope, 'dom'>;
declare function getReviewItemScope(item: ReviewItem, presets?: ReviewViewportPreset[]): ReviewItemScope;
declare function getReviewItemScopeLabel(item: ReviewItem, presets?: ReviewViewportPreset[]): string;
declare function getNumberedReviewItems(items: ReviewItem[], presets?: ReviewViewportPreset[]): NumberedReviewItem[];
declare function localAdapter(options?: LocalAdapterOptions): WebReviewKitAdapter;
declare function createWebReviewKit(options: WebReviewKitOptions): WebReviewKitController;

export { DEFAULT_REVIEW_VIEWPORTS, type DomAnchor, type DomAnchorCandidate, type DomAnchorStrategy, type DomSourceHint, type LocalAdapterOptions, type NumberedReviewItem, REVIEW_WORKFLOW_STATUS_OPTIONS, type RelativeSelection, type ReviewItem, type ReviewItemKind, type ReviewItemQuery, type ReviewItemScope, type ReviewItemStatus, type ReviewMarker, type ReviewMode, type ReviewPoint, type ReviewRulerConfig, type ReviewRulerFrame, type ReviewScreenshot, type ReviewSelection, type ReviewViewportPreset, type ReviewViewportScope, type ReviewWorkflowStatus, type ViewportSize, type WebReviewKitAdapter, type WebReviewKitController, type WebReviewKitOptions, type WebReviewKitTarget, createWebReviewKit, findReviewViewportPreset, getNumberedReviewItems, getReviewItemScope, getReviewItemScopeLabel, getReviewViewportScope, localAdapter, normalizeReviewItemStatus };
