import { L as LocalAdapterOptions, W as WebReviewKitAdapter, S as SupabaseReviewAdapterOptions, R as ReviewWorkflowStatus, a as ReviewItemStatus, b as WebReviewKitOptions, c as WebReviewKitController, d as ReviewViewportPreset, V as ViewportSize, e as ReviewItem, N as NumberedReviewItem, f as ReviewItemScope } from './types-Mk1TPvds.cjs';
export { D as DomAnchor, g as DomAnchorCandidate, h as DomAnchorStrategy, i as DomSourceHint, j as RelativeSelection, k as ReviewItemKind, l as ReviewItemQuery, m as ReviewMarker, n as ReviewMode, o as ReviewPoint, p as ReviewRulerConfig, q as ReviewSelection, r as ReviewSource, s as ReviewSubmitStatus, t as ReviewViewportScope, u as SupabaseReviewClient, v as WebReviewKitTarget } from './types-Mk1TPvds.cjs';

declare function localAdapter(options?: LocalAdapterOptions): WebReviewKitAdapter;

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

export { DEFAULT_REVIEW_VIEWPORTS, LocalAdapterOptions, NumberedReviewItem, REVIEW_WORKFLOW_STATUS_OPTIONS, ReviewItem, ReviewItemScope, ReviewItemStatus, ReviewViewportPreset, ReviewWorkflowStatus, SupabaseReviewAdapterOptions, ViewportSize, WebReviewKitAdapter, WebReviewKitController, WebReviewKitOptions, createWebReviewKit, findReviewViewportPreset, getNumberedReviewItems, getReviewItemScope, getReviewItemScopeLabel, getReviewViewportScope, localAdapter, normalizeReviewItemStatus, supabaseAdapter };
