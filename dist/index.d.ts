import { L as LocalAdapterOptions, W as WebReviewKitAdapter, D as DfSheetAdapterOptions, S as SupabaseReviewAdapterOptions, R as ReviewWorkflowStatus, a as ReviewItemStatus, b as WebReviewKitOptions, c as WebReviewKitController, d as ReviewViewportPreset, V as ViewportSize, e as ReviewItem, N as NumberedReviewItem, f as ReviewItemScope } from './types-D_mNjOHx.js';
export { g as DomAnchor, h as DomAnchorCandidate, i as DomAnchorStrategy, j as DomSourceHint, k as RelativeSelection, l as ReviewItemKind, m as ReviewItemQuery, n as ReviewMarker, o as ReviewMode, p as ReviewPoint, q as ReviewRulerConfig, r as ReviewSelection, s as ReviewSource, t as ReviewSubmitStatus, u as ReviewViewportScope, v as SupabaseReviewClient, w as WebReviewKitTarget } from './types-D_mNjOHx.js';

declare function localAdapter(options?: LocalAdapterOptions): WebReviewKitAdapter;

declare const DF_SHEET_REVIEW_SOURCE = "df-web-review-kit";
declare function dfSheetAdapter(options: DfSheetAdapterOptions): WebReviewKitAdapter;

declare function supabaseAdapter(options: SupabaseReviewAdapterOptions): WebReviewKitAdapter;

declare const REVIEW_WORKFLOW_STATUS_OPTIONS: Array<{
    value: ReviewWorkflowStatus;
    label: string;
}>;
declare function normalizeReviewItemStatus(status: ReviewItemStatus | undefined): ReviewWorkflowStatus;

declare function createWebReviewKit(options: WebReviewKitOptions): WebReviewKitController;

declare const DEFAULT_REVIEW_VIEWPORTS: ReviewViewportPreset[];
declare function findReviewViewportPreset(viewport: ViewportSize, presets?: ReviewViewportPreset[]): ReviewViewportPreset;
declare function getReviewViewportScope(viewport: ViewportSize, presets?: ReviewViewportPreset[]): Exclude<ReviewItemScope, 'dom'>;
declare function getReviewItemScope(item: ReviewItem, presets?: ReviewViewportPreset[]): ReviewItemScope;
declare function getReviewItemScopeLabel(item: ReviewItem, presets?: ReviewViewportPreset[]): string;
declare function getNumberedReviewItems(items: ReviewItem[], presets?: ReviewViewportPreset[]): NumberedReviewItem[];

export { DEFAULT_REVIEW_VIEWPORTS, DF_SHEET_REVIEW_SOURCE, DfSheetAdapterOptions, LocalAdapterOptions, NumberedReviewItem, REVIEW_WORKFLOW_STATUS_OPTIONS, ReviewItem, ReviewItemScope, ReviewItemStatus, ReviewViewportPreset, ReviewWorkflowStatus, SupabaseReviewAdapterOptions, ViewportSize, WebReviewKitAdapter, WebReviewKitController, WebReviewKitOptions, createWebReviewKit, dfSheetAdapter, findReviewViewportPreset, getNumberedReviewItems, getReviewItemScope, getReviewItemScopeLabel, getReviewViewportScope, localAdapter, normalizeReviewItemStatus, supabaseAdapter };
