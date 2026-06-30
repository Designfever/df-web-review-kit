import { L as LocalAdapterOptions, W as WebReviewKitAdapter, S as SupabaseReviewAdapterOptions, R as ReviewWorkflowStatus, a as ReviewItemStatus, b as WebReviewKitOptions, c as WebReviewKitController, d as ReviewViewportPreset, V as ViewportSize, e as ReviewItem, N as NumberedReviewItem, f as ReviewItemScope } from './types-DT9Z66mV.cjs';
export { D as DomAnchor, g as DomAnchorCandidate, h as DomAnchorStrategy, i as DomSourceHint, j as RelativeSelection, k as ReviewAssigneeOption, l as ReviewItemKind, m as ReviewItemQuery, n as ReviewMarker, o as ReviewMode, p as ReviewPoint, q as ReviewRulerConfig, r as ReviewSelection, s as ReviewSource, t as ReviewSubmitStatus, u as ReviewViewportScope, v as SupabaseReviewClient, w as WebReviewKitTarget } from './types-DT9Z66mV.cjs';
import { R as ReviewFigmaImageStore, a as ReviewFigmaImageFormat, b as ReviewFigmaImageTarget } from './image.types-BmzkFSPX.cjs';
export { A as AddReviewFigmaImageInput, D as DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT, c as ReorderReviewFigmaImagesInput, d as ReviewFigmaImage, e as ReviewFigmaImageAssetInput, f as ReviewFigmaImageViewport, g as ReviewFigmaNodeTarget, h as ReviewFigmaRouteTarget, U as UpdateReviewFigmaImageInput } from './image.types-BmzkFSPX.cjs';
import { R as ReviewFigmaRenderFormat } from './token-Dt-ZH-YO.cjs';
export { C as CollectReviewFigmaReleaseSnapshotOptions, a as CreateReviewFigmaImagesSnapshotOptions, b as CreateReviewFigmaReleaseSnapshotOptions, D as DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY, F as FIGMA_NODE_REF_SEPARATOR, c as REVIEW_FIGMA_TOKEN_MISSING_CODE, d as ReviewFigmaImagesSnapshot, e as ReviewFigmaNodeRef, f as ReviewFigmaReleaseSnapshot, g as ReviewFigmaTokenEnv, h as ReviewFigmaTokenError, i as ReviewFigmaTokenOptions, j as collectReviewFigmaReleaseSnapshot, k as createReviewFigmaFrameUrl, l as createReviewFigmaImagesSnapshot, m as createReviewFigmaNodeValue, n as createReviewFigmaReleaseSnapshot, o as isReviewFigmaTokenError, p as parseReviewFigmaNodeRef, r as readReviewFigmaToken, q as requireReviewFigmaNodeRef, s as requireReviewFigmaToken } from './token-Dt-ZH-YO.cjs';

declare function localAdapter(options?: LocalAdapterOptions): WebReviewKitAdapter;

declare function supabaseAdapter(options: SupabaseReviewAdapterOptions): WebReviewKitAdapter;

declare const REVIEW_WORKFLOW_STATUS_OPTIONS: Array<{
    value: ReviewWorkflowStatus;
    label: string;
}>;
declare function normalizeReviewItemStatus(status: ReviewItemStatus | undefined): ReviewWorkflowStatus;

declare const DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT = "/__dfwr/figma-images";
type ReviewFigmaImageStoreClientOptions = {
    endpoint?: string;
    fetch?: typeof fetch;
    clientRender?: boolean | ReviewFigmaImageClientRenderOptions;
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
declare function getReviewFigmaImageTargetKey(target: ReviewFigmaImageTarget): string;
declare function getReviewFigmaImageMimeType(format: ReviewFigmaImageFormat): "image/webp" | "image/png" | "image/jpeg";

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

export { DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT, DEFAULT_REVIEW_VIEWPORTS, LocalAdapterOptions, NumberedReviewItem, REVIEW_WORKFLOW_STATUS_OPTIONS, type ReviewFigmaImageClientRenderOptions, ReviewFigmaImageFormat, ReviewFigmaImageStore, type ReviewFigmaImageStoreClientOptions, ReviewFigmaImageTarget, ReviewItem, ReviewItemScope, ReviewItemStatus, ReviewViewportPreset, ReviewWorkflowStatus, SupabaseReviewAdapterOptions, ViewportSize, WebReviewKitAdapter, WebReviewKitController, WebReviewKitOptions, createReviewFigmaImageStoreClient, createWebReviewKit, findReviewViewportPreset, getNumberedReviewItems, getReviewFigmaImageMimeType, getReviewFigmaImageTargetKey, getReviewItemScope, getReviewItemScopeLabel, getReviewViewportScope, localAdapter, normalizeReviewItemStatus, supabaseAdapter };
