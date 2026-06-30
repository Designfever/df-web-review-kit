import { Plugin } from 'vite';
import { a as ReviewFigmaImageFormat } from './image.types-BmzkFSPX.cjs';
import { g as ReviewFigmaTokenEnv, R as ReviewFigmaRenderFormat, t as ReviewFigmaImageRenderOptions, u as ReviewFigmaRenderedImage } from './token-Dt-ZH-YO.cjs';
export { C as CollectReviewFigmaReleaseSnapshotOptions, a as CreateReviewFigmaImagesSnapshotOptions, b as CreateReviewFigmaReleaseSnapshotOptions, d as ReviewFigmaImagesSnapshot, f as ReviewFigmaReleaseSnapshot, j as collectReviewFigmaReleaseSnapshot, v as createReviewFigmaImageApiUrl, l as createReviewFigmaImagesSnapshot, n as createReviewFigmaReleaseSnapshot, w as renderReviewFigmaImage } from './token-Dt-ZH-YO.cjs';

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

declare const readReviewFigmaServerToken: (options?: ReviewFigmaServerTokenOptions) => string | null;
declare const requireReviewFigmaServerToken: (options?: ReviewFigmaServerTokenOptions) => string;
declare const renderReviewFigmaServerImage: (options: ReviewFigmaServerImageRenderOptions) => Promise<ReviewFigmaRenderedImage>;
declare const reviewFigmaImageStore: (options?: ReviewFigmaImageStorePluginOptions) => Plugin;

type SourceLocatorPattern = string | RegExp;
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

export { type ReviewDataLocatorOptions, type ReviewFigmaImageAssetTransformInput, type ReviewFigmaImageAssetTransformResult, type ReviewFigmaImageAssetTransformer, ReviewFigmaImageRenderOptions, type ReviewFigmaImageStorePluginOptions, ReviewFigmaRenderFormat, ReviewFigmaRenderedImage, type ReviewFigmaServerImageRenderOptions, type ReviewFigmaServerTokenOptions, type ReviewSourceLocatorOptions, readReviewFigmaServerToken, renderReviewFigmaServerImage, requireReviewFigmaServerToken, reviewDataLocator, reviewFigmaImageStore, reviewSourceLocator };
