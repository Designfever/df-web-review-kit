import { L as LocalAdapterOptions, W as WebReviewKitAdapter, S as SupabaseReviewAdapterOptions, R as ReviewWorkflowStatus, a as ReviewItemStatus, b as WebReviewKitOptions, c as WebReviewKitController, d as ReviewViewportPreset, V as ViewportSize, e as ReviewItem, N as NumberedReviewItem, f as ReviewItemScope } from './types-DH4q2_nz.js';
export { D as DomAnchor, g as DomAnchorCandidate, h as DomAnchorStrategy, i as DomSourceHint, j as RelativeSelection, k as ReviewAssigneeOption, l as ReviewAttachment, m as ReviewAttachmentKind, n as ReviewAttachmentUploadError, o as ReviewAttachmentUploadErrorReason, p as ReviewAttachmentUploadInput, q as ReviewExternalLink, r as ReviewExternalLinkIcon, s as ReviewItemKind, t as ReviewItemQuery, u as ReviewMarker, v as ReviewMode, w as ReviewPoint, x as ReviewRulerConfig, y as ReviewSelection, z as ReviewSource, A as ReviewSubmitStatus, B as ReviewViewportScope, C as SupabaseReviewClient, E as WebReviewKitTarget } from './types-DH4q2_nz.js';
import { R as ReviewFigmaImageStore, a as ReviewFigmaImageFormat, b as ReviewFigmaImageTarget } from './image.types-BmzkFSPX.js';
export { A as AddReviewFigmaImageInput, D as DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT, c as ReorderReviewFigmaImagesInput, d as ReviewFigmaImage, e as ReviewFigmaImageAssetInput, f as ReviewFigmaImageViewport, g as ReviewFigmaNodeTarget, h as ReviewFigmaRouteTarget, U as UpdateReviewFigmaImageInput } from './image.types-BmzkFSPX.js';
import { R as ReviewFigmaRenderFormat } from './token-nJXPPdYX.js';
export { C as CollectReviewFigmaReleaseSnapshotOptions, a as CreateReviewFigmaImagesSnapshotOptions, b as CreateReviewFigmaReleaseSnapshotOptions, D as DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY, F as FIGMA_NODE_REF_SEPARATOR, c as REVIEW_FIGMA_TOKEN_MISSING_CODE, d as ReviewFigmaImagesSnapshot, e as ReviewFigmaNodeRef, f as ReviewFigmaReleaseSnapshot, g as ReviewFigmaTokenEnv, h as ReviewFigmaTokenError, i as ReviewFigmaTokenOptions, j as collectReviewFigmaReleaseSnapshot, k as createReviewFigmaFrameUrl, l as createReviewFigmaImagesSnapshot, m as createReviewFigmaNodeValue, n as createReviewFigmaReleaseSnapshot, o as isReviewFigmaTokenError, p as parseReviewFigmaNodeRef, r as readReviewFigmaToken, q as requireReviewFigmaNodeRef, s as requireReviewFigmaToken } from './token-nJXPPdYX.js';

declare function localAdapter(options?: LocalAdapterOptions): WebReviewKitAdapter;

declare function supabaseAdapter(options: SupabaseReviewAdapterOptions): WebReviewKitAdapter;

declare const REVIEW_WORKFLOW_STATUS_OPTIONS: Array<{
    value: ReviewWorkflowStatus;
    label: string;
}>;
declare function normalizeReviewItemStatus(status: ReviewItemStatus | undefined): ReviewWorkflowStatus;

declare const DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT = "/__dfwr/figma-images";
type ReviewFigmaImageTokenProvider = string | null | undefined | (() => string | null | undefined);
type ReviewFigmaImageStoreHeadersProvider = HeadersInit | null | undefined | (() => HeadersInit | null | undefined | Promise<HeadersInit | null | undefined>);
type ReviewFigmaImageStoreClientOptions = {
    endpoint?: string;
    fetch?: typeof fetch;
    token?: ReviewFigmaImageTokenProvider;
    clientRender?: boolean | ReviewFigmaImageClientRenderOptions;
};
type EndpointReviewFigmaImageStoreOptions = ReviewFigmaImageStoreClientOptions & {
    headers?: ReviewFigmaImageStoreHeadersProvider;
};
type ReviewFigmaImageClientRenderOptions = {
    token?: string | null | (() => string | null | undefined);
    apiBaseUrl?: string;
    renderFormat?: Extract<ReviewFigmaRenderFormat, 'png' | 'jpg'>;
    renderScale?: number;
    useAbsoluteBounds?: boolean;
    convertToWebp?: boolean;
    webpQuality?: number;
    timeoutMs?: number;
};
declare function createReviewFigmaImageStoreClient(options?: ReviewFigmaImageStoreClientOptions): ReviewFigmaImageStore;
declare function createEndpointReviewFigmaImageStore(options?: EndpointReviewFigmaImageStoreOptions): ReviewFigmaImageStore;
declare function getReviewFigmaImageTargetKey(target: ReviewFigmaImageTarget): string;
declare function getReviewFigmaImageMimeType(format: ReviewFigmaImageFormat): "image/webp" | "image/png" | "image/jpeg";

declare const DEFAULT_REVIEW_FIGMA_REMOTE_IMAGES_TABLE = "review_figma_images";
type ReviewFigmaRemoteTokenProvider = string | null | undefined | (() => string | null | undefined);
type ReviewFigmaRemoteImageRow = {
    id: string;
    project_id: string;
    target_key: string;
    target: ReviewFigmaImageTarget;
    target_type: 'route' | 'figma-node';
    page_url: string | null;
    viewport_label: string | null;
    viewport_width: number | null;
    viewport_height: number | null;
    viewport_scope: 'mobile' | 'tablet' | 'desktop' | 'wide' | null;
    slot: string | null;
    figma_url: string;
    file_key: string;
    node_id: string;
    image_url: string;
    image_format: ReviewFigmaImageFormat;
    mime_type: string;
    storage_key: string;
    label: string | null;
    sort_order: number;
    width: number | null;
    height: number | null;
    byte_size: number | null;
    created_at: string;
    updated_at: string;
};
type ReviewFigmaRemoteDbResult<T = unknown> = {
    data: T | null;
    error: unknown;
};
type ReviewFigmaRemoteDbQuery<T = unknown> = PromiseLike<ReviewFigmaRemoteDbResult<T>> & {
    delete(): ReviewFigmaRemoteDbQuery<T>;
    eq(column: string, value: unknown): ReviewFigmaRemoteDbQuery<T>;
    insert(value: unknown): ReviewFigmaRemoteDbQuery<T>;
    order(column: string, options?: {
        ascending?: boolean;
    }): ReviewFigmaRemoteDbQuery<T>;
    select(columns?: string): ReviewFigmaRemoteDbQuery<T>;
    single(): PromiseLike<ReviewFigmaRemoteDbResult<T>>;
    update(value: unknown): ReviewFigmaRemoteDbQuery<T>;
};
type ReviewFigmaRemoteDbClient = {
    from(table: string): ReviewFigmaRemoteDbQuery;
};
type ReviewFigmaRemoteAssetUploadResponse = {
    storageKey?: unknown;
    r2Key?: unknown;
    imageUrl?: unknown;
    publicUrl?: unknown;
    error?: unknown;
};
type RemoteReviewFigmaImageStoreOptions = {
    client: ReviewFigmaRemoteDbClient;
    uploadEndpoint: string;
    table?: string;
    fetch?: typeof fetch;
    token?: ReviewFigmaRemoteTokenProvider;
    clientRender?: boolean | ReviewFigmaImageClientRenderOptions;
    uploadTimeoutMs?: number;
};
declare function createRemoteReviewFigmaImageStore({ client, uploadEndpoint, table, fetch: fetchOption, token, clientRender, uploadTimeoutMs, }: RemoteReviewFigmaImageStoreOptions): ReviewFigmaImageStore;

/** Creates the vanilla runtime controller that mounts review overlays on a target page. */
declare function createWebReviewKit(options: WebReviewKitOptions): WebReviewKitController;

/** Default viewport presets used when a host project does not provide its own. */
declare const DEFAULT_REVIEW_VIEWPORTS: ReviewViewportPreset[];
/** Finds the nearest configured preset for a viewport size. */
declare function findReviewViewportPreset(viewport: ViewportSize, presets?: ReviewViewportPreset[]): ReviewViewportPreset;
/** Resolves a viewport size to the review scope used for item grouping. */
declare function getReviewViewportScope(viewport: ViewportSize, presets?: ReviewViewportPreset[]): Exclude<ReviewItemScope, 'dom'>;
/** Resolves an item's persisted scope, falling back to its captured viewport. */
declare function getReviewItemScope(item: ReviewItem, presets?: ReviewViewportPreset[]): ReviewItemScope;
/** Returns the display label for an item's resolved review scope. */
declare function getReviewItemScopeLabel(item: ReviewItem, presets?: ReviewViewportPreset[]): string;
/** Adds scope-aware display labels to review items without mutating them. */
declare function getNumberedReviewItems(items: ReviewItem[], presets?: ReviewViewportPreset[]): NumberedReviewItem[];

export { DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT, DEFAULT_REVIEW_FIGMA_REMOTE_IMAGES_TABLE, DEFAULT_REVIEW_VIEWPORTS, type EndpointReviewFigmaImageStoreOptions, LocalAdapterOptions, NumberedReviewItem, REVIEW_WORKFLOW_STATUS_OPTIONS, type RemoteReviewFigmaImageStoreOptions, type ReviewFigmaImageClientRenderOptions, ReviewFigmaImageFormat, ReviewFigmaImageStore, type ReviewFigmaImageStoreClientOptions, type ReviewFigmaImageStoreHeadersProvider, ReviewFigmaImageTarget, type ReviewFigmaRemoteAssetUploadResponse, type ReviewFigmaRemoteDbClient, type ReviewFigmaRemoteImageRow, ReviewItem, ReviewItemScope, ReviewItemStatus, ReviewViewportPreset, ReviewWorkflowStatus, SupabaseReviewAdapterOptions, ViewportSize, WebReviewKitAdapter, WebReviewKitController, WebReviewKitOptions, createEndpointReviewFigmaImageStore, createRemoteReviewFigmaImageStore, createReviewFigmaImageStoreClient, createWebReviewKit, findReviewViewportPreset, getNumberedReviewItems, getReviewFigmaImageMimeType, getReviewFigmaImageTargetKey, getReviewItemScope, getReviewItemScopeLabel, getReviewViewportScope, localAdapter, normalizeReviewItemStatus, supabaseAdapter };
