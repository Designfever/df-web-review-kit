import { b as ReviewFigmaImageTarget, d as ReviewFigmaImage, R as ReviewFigmaImageStore } from './image.types-BmzkFSPX.cjs';

type ReviewFigmaNodeRef = {
    fileKey: string;
    nodeId: string;
    sourceUrl?: string;
};
declare const FIGMA_NODE_REF_SEPARATOR = "->";
declare function parseReviewFigmaNodeRef(value: string | ReviewFigmaNodeRef): ReviewFigmaNodeRef | null;
declare function requireReviewFigmaNodeRef(value: string | ReviewFigmaNodeRef): ReviewFigmaNodeRef;
declare function createReviewFigmaNodeValue(ref: ReviewFigmaNodeRef): string;
declare function createReviewFigmaFrameUrl(value: string | ReviewFigmaNodeRef): string | null;

type ReviewFigmaRenderFormat = 'png' | 'jpg' | 'svg' | 'pdf';
type ReviewFigmaImageRenderOptions = {
    figmaUrl: string | ReviewFigmaNodeRef;
    token?: string | null;
    format?: ReviewFigmaRenderFormat;
    scale?: number;
    useAbsoluteBounds?: boolean;
    apiBaseUrl?: string;
    fetch?: typeof fetch;
    signal?: AbortSignal;
};
type ReviewFigmaRenderedImage = {
    fileKey: string;
    nodeId: string;
    figmaUrl?: string;
    imageUrl: string;
    renderFormat: ReviewFigmaRenderFormat;
};
declare function renderReviewFigmaImage(options: ReviewFigmaImageRenderOptions): Promise<ReviewFigmaRenderedImage>;
declare function createReviewFigmaImageApiUrl({ apiBaseUrl, fileKey, nodeId, format, scale, useAbsoluteBounds, }: {
    apiBaseUrl?: string;
    fileKey: string;
    nodeId: string;
    format?: ReviewFigmaRenderFormat;
    scale?: number;
    useAbsoluteBounds?: boolean;
}): string;

type ReviewFigmaImagesSnapshot = ReviewFigmaImage[];
type ReviewFigmaReleaseSnapshot = {
    version: 1;
    projectId: string;
    releaseId?: string;
    label?: string;
    createdAt: string;
    figmaImagesSnapshot: ReviewFigmaImagesSnapshot;
};
type CreateReviewFigmaImagesSnapshotOptions = {
    projectId?: string;
    targets?: readonly ReviewFigmaImageTarget[];
};
type CreateReviewFigmaReleaseSnapshotOptions = CreateReviewFigmaImagesSnapshotOptions & {
    images: readonly ReviewFigmaImage[];
    projectId: string;
    releaseId?: string;
    label?: string;
    createdAt?: string;
};
type CollectReviewFigmaReleaseSnapshotOptions = Omit<CreateReviewFigmaReleaseSnapshotOptions, 'images'> & {
    store: ReviewFigmaImageStore;
    targets: readonly ReviewFigmaImageTarget[];
};
declare function createReviewFigmaImagesSnapshot(images: readonly ReviewFigmaImage[], options?: CreateReviewFigmaImagesSnapshotOptions): ReviewFigmaImagesSnapshot;
declare function createReviewFigmaReleaseSnapshot({ images, projectId, releaseId, label, createdAt, targets, }: CreateReviewFigmaReleaseSnapshotOptions): ReviewFigmaReleaseSnapshot;
declare function collectReviewFigmaReleaseSnapshot({ store, targets, ...snapshotOptions }: CollectReviewFigmaReleaseSnapshotOptions): Promise<ReviewFigmaReleaseSnapshot>;

declare const DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY = "FIGMA_TOKEN";
declare const REVIEW_FIGMA_TOKEN_MISSING_CODE = "DFWR_FIGMA_TOKEN_MISSING";
type ReviewFigmaTokenEnv = Record<string, string | null | undefined>;
type ReviewFigmaTokenOptions = {
    token?: string | null;
    env?: ReviewFigmaTokenEnv;
    envKey?: string;
    enabled?: boolean;
};
declare class ReviewFigmaTokenError extends Error {
    readonly code = "DFWR_FIGMA_TOKEN_MISSING";
    readonly envKey: string;
    constructor(envKey?: string);
}
declare function readReviewFigmaToken(options?: ReviewFigmaTokenOptions): string | null;
declare function requireReviewFigmaToken(options?: ReviewFigmaTokenOptions): string;
declare function isReviewFigmaTokenError(error: unknown): error is ReviewFigmaTokenError;

export { type CollectReviewFigmaReleaseSnapshotOptions as C, DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY as D, FIGMA_NODE_REF_SEPARATOR as F, type ReviewFigmaRenderFormat as R, type CreateReviewFigmaImagesSnapshotOptions as a, type CreateReviewFigmaReleaseSnapshotOptions as b, REVIEW_FIGMA_TOKEN_MISSING_CODE as c, type ReviewFigmaImagesSnapshot as d, type ReviewFigmaNodeRef as e, type ReviewFigmaReleaseSnapshot as f, type ReviewFigmaTokenEnv as g, ReviewFigmaTokenError as h, type ReviewFigmaTokenOptions as i, collectReviewFigmaReleaseSnapshot as j, createReviewFigmaFrameUrl as k, createReviewFigmaImagesSnapshot as l, createReviewFigmaNodeValue as m, createReviewFigmaReleaseSnapshot as n, isReviewFigmaTokenError as o, parseReviewFigmaNodeRef as p, requireReviewFigmaNodeRef as q, readReviewFigmaToken as r, requireReviewFigmaToken as s, type ReviewFigmaImageRenderOptions as t, type ReviewFigmaRenderedImage as u, createReviewFigmaImageApiUrl as v, renderReviewFigmaImage as w };
