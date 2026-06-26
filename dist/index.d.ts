import { L as LocalAdapterOptions, W as WebReviewKitAdapter, S as SupabaseReviewAdapterOptions, R as ReviewWorkflowStatus, a as ReviewItemStatus, b as WebReviewKitOptions, c as WebReviewKitController, d as ReviewViewportPreset, V as ViewportSize, e as ReviewItem, N as NumberedReviewItem, f as ReviewItemScope } from './types-DFHHVRBc.js';
export { D as DomAnchor, g as DomAnchorCandidate, h as DomAnchorStrategy, i as DomSourceHint, j as RelativeSelection, k as ReviewItemKind, l as ReviewItemQuery, m as ReviewMarker, n as ReviewMode, o as ReviewPoint, p as ReviewRulerConfig, q as ReviewSelection, r as ReviewSource, s as ReviewSubmitStatus, t as ReviewViewportScope, u as SupabaseReviewClient, v as WebReviewKitTarget } from './types-DFHHVRBc.js';
import { R as ReviewFigmaImageStore, a as ReviewFigmaImageFormat, b as ReviewFigmaImageTarget } from './image.types-DZSqTbSX.js';
export { A as AddReviewFigmaImageInput, D as DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT, c as ReorderReviewFigmaImagesInput, d as ReviewFigmaImage, e as ReviewFigmaImageViewport, f as ReviewFigmaNodeTarget, g as ReviewFigmaRouteTarget, U as UpdateReviewFigmaImageInput } from './image.types-DZSqTbSX.js';
export { C as CollectReviewFigmaReleaseSnapshotOptions, a as CreateReviewFigmaImagesSnapshotOptions, b as CreateReviewFigmaReleaseSnapshotOptions, D as DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY, F as FIGMA_NODE_REF_SEPARATOR, R as REVIEW_FIGMA_TOKEN_MISSING_CODE, c as ReviewFigmaImagesSnapshot, d as ReviewFigmaNodeRef, e as ReviewFigmaReleaseSnapshot, f as ReviewFigmaTokenEnv, g as ReviewFigmaTokenError, h as ReviewFigmaTokenOptions, i as collectReviewFigmaReleaseSnapshot, j as createReviewFigmaFrameUrl, k as createReviewFigmaImagesSnapshot, l as createReviewFigmaNodeValue, m as createReviewFigmaReleaseSnapshot, n as isReviewFigmaTokenError, p as parseReviewFigmaNodeRef, r as readReviewFigmaToken, o as requireReviewFigmaNodeRef, q as requireReviewFigmaToken } from './parse-Bw6C7Xlq.js';

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
};
declare function createReviewFigmaImageStoreClient(options?: ReviewFigmaImageStoreClientOptions): ReviewFigmaImageStore;
declare function getReviewFigmaImageTargetKey(target: ReviewFigmaImageTarget): string;
declare function getReviewFigmaImageMimeType(format: ReviewFigmaImageFormat): "image/jpeg" | "image/png" | "image/webp";

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

export { DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT, DEFAULT_REVIEW_VIEWPORTS, LocalAdapterOptions, NumberedReviewItem, REVIEW_WORKFLOW_STATUS_OPTIONS, ReviewFigmaImageFormat, ReviewFigmaImageStore, type ReviewFigmaImageStoreClientOptions, ReviewFigmaImageTarget, ReviewItem, ReviewItemScope, ReviewItemStatus, ReviewViewportPreset, ReviewWorkflowStatus, SupabaseReviewAdapterOptions, ViewportSize, WebReviewKitAdapter, WebReviewKitController, WebReviewKitOptions, createReviewFigmaImageStoreClient, createWebReviewKit, findReviewViewportPreset, getNumberedReviewItems, getReviewFigmaImageMimeType, getReviewFigmaImageTargetKey, getReviewItemScope, getReviewItemScopeLabel, getReviewViewportScope, localAdapter, normalizeReviewItemStatus, supabaseAdapter };
