import { Plugin } from 'vite';
import { a as ReviewFigmaImageFormat } from './image.types-DZSqTbSX.js';
import { d as ReviewFigmaNodeRef, f as ReviewFigmaTokenEnv } from './parse-Bw6C7Xlq.js';
export { C as CollectReviewFigmaReleaseSnapshotOptions, a as CreateReviewFigmaImagesSnapshotOptions, b as CreateReviewFigmaReleaseSnapshotOptions, c as ReviewFigmaImagesSnapshot, e as ReviewFigmaReleaseSnapshot, i as collectReviewFigmaReleaseSnapshot, k as createReviewFigmaImagesSnapshot, m as createReviewFigmaReleaseSnapshot } from './parse-Bw6C7Xlq.js';

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

type SourceLocatorPattern = string | RegExp;
interface ReviewFigmaImageStorePluginOptions extends ReviewFigmaServerTokenOptions {
    enabled?: boolean;
    projectId?: string;
    endpoint?: string;
    dataFile?: string;
    assetDir?: string;
    assetEndpoint?: string;
    cacheAssets?: boolean;
    imageFormat?: ReviewFigmaImageFormat;
    renderFormat?: ReviewFigmaRenderFormat;
    renderScale?: number;
    useAbsoluteBounds?: boolean;
    apiBaseUrl?: string;
    fetch?: typeof fetch;
    transformAsset?: ReviewFigmaImageAssetTransformer;
}
interface ReviewFigmaServerTokenOptions {
    token?: string | null;
    env?: ReviewFigmaTokenEnv;
    envKey?: string;
    enabled?: boolean;
}
type ReviewFigmaServerImageRenderOptions = Omit<ReviewFigmaImageRenderOptions, 'token'> & ReviewFigmaServerTokenOptions;
type ReviewFigmaImageAssetTransformInput = {
    data: Uint8Array;
    imageFormat: ReviewFigmaImageFormat;
    mimeType: string;
    targetFormat: ReviewFigmaImageFormat;
};
type ReviewFigmaImageAssetTransformResult = {
    data: Uint8Array | ArrayBuffer;
    imageFormat: ReviewFigmaImageFormat;
    mimeType?: string;
};
type ReviewFigmaImageAssetTransformer = (input: ReviewFigmaImageAssetTransformInput) => ReviewFigmaImageAssetTransformResult | null | undefined | Promise<ReviewFigmaImageAssetTransformResult | null | undefined>;

interface ReviewSourceLocatorOptions {
    enabled?: boolean;
    root?: string;
    include?: readonly SourceLocatorPattern[];
    exclude?: readonly SourceLocatorPattern[];
    filePath?: 'relative' | 'absolute';
    line?: boolean;
    column?: boolean;
    attributePrefix?: string;
}
declare const readReviewFigmaServerToken: (options?: ReviewFigmaServerTokenOptions) => string | null;
declare const requireReviewFigmaServerToken: (options?: ReviewFigmaServerTokenOptions) => string;
declare const renderReviewFigmaServerImage: (options: ReviewFigmaServerImageRenderOptions) => Promise<ReviewFigmaRenderedImage>;
declare const reviewFigmaImageStore: (options?: ReviewFigmaImageStorePluginOptions) => Plugin;
declare const reviewSourceLocator: (options?: ReviewSourceLocatorOptions) => Plugin;
interface ReviewDataLocatorOptions {
    enabled?: boolean;
    root?: string;
    include?: readonly SourceLocatorPattern[];
    exclude?: readonly SourceLocatorPattern[];
    filePath?: 'relative' | 'absolute';
    /** 매칭할 component 이름 패턴. 기본은 `Section`으로 시작하는 이름. */
    componentPattern?: RegExp;
    fileAttribute?: string;
    lineAttribute?: string;
}
/**
 * page data 파일의 section 객체(`component: 'SectionXxx'`)에 출처 파일/라인을
 * `__wrkDataFile`/`__wrkDataLine` prop 으로 주입한다. 라인 보존을 위해 같은 줄에만 삽입한다.
 */
declare const reviewDataLocator: (options?: ReviewDataLocatorOptions) => Plugin;

export { type ReviewDataLocatorOptions, type ReviewFigmaImageAssetTransformInput, type ReviewFigmaImageAssetTransformResult, type ReviewFigmaImageAssetTransformer, type ReviewFigmaImageRenderOptions, type ReviewFigmaImageStorePluginOptions, type ReviewFigmaRenderFormat, type ReviewFigmaRenderedImage, type ReviewFigmaServerImageRenderOptions, type ReviewFigmaServerTokenOptions, type ReviewSourceLocatorOptions, createReviewFigmaImageApiUrl, readReviewFigmaServerToken, renderReviewFigmaImage, renderReviewFigmaServerImage, requireReviewFigmaServerToken, reviewDataLocator, reviewFigmaImageStore, reviewSourceLocator };
