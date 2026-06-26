import { b as ReviewFigmaImageTarget, d as ReviewFigmaImage, R as ReviewFigmaImageStore } from './image.types-DZSqTbSX.js';

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

export { type CollectReviewFigmaReleaseSnapshotOptions as C, DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY as D, FIGMA_NODE_REF_SEPARATOR as F, REVIEW_FIGMA_TOKEN_MISSING_CODE as R, type CreateReviewFigmaImagesSnapshotOptions as a, type CreateReviewFigmaReleaseSnapshotOptions as b, type ReviewFigmaImagesSnapshot as c, type ReviewFigmaNodeRef as d, type ReviewFigmaReleaseSnapshot as e, type ReviewFigmaTokenEnv as f, ReviewFigmaTokenError as g, type ReviewFigmaTokenOptions as h, collectReviewFigmaReleaseSnapshot as i, createReviewFigmaFrameUrl as j, createReviewFigmaImagesSnapshot as k, createReviewFigmaNodeValue as l, createReviewFigmaReleaseSnapshot as m, isReviewFigmaTokenError as n, requireReviewFigmaNodeRef as o, parseReviewFigmaNodeRef as p, requireReviewFigmaToken as q, readReviewFigmaToken as r };
