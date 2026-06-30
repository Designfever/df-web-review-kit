type ReviewFigmaImageFormat = 'webp' | 'png' | 'jpg';
declare const DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT = "webp";
type ReviewFigmaImageViewport = {
    label?: string;
    width?: number;
    height?: number;
    scope?: 'mobile' | 'tablet' | 'desktop' | 'wide';
};
type ReviewFigmaRouteTarget = {
    type: 'route';
    projectId: string;
    pageUrl: string;
    viewport?: ReviewFigmaImageViewport;
    slot?: string;
};
type ReviewFigmaNodeTarget = {
    type: 'figma-node';
    projectId: string;
    fileKey: string;
    nodeId: string;
};
type ReviewFigmaImageTarget = ReviewFigmaRouteTarget | ReviewFigmaNodeTarget;
type ReviewFigmaImage = {
    id: string;
    projectId: string;
    target: ReviewFigmaImageTarget;
    figmaUrl: string;
    fileKey: string;
    nodeId: string;
    imageUrl: string;
    imageFormat: ReviewFigmaImageFormat;
    mimeType: string;
    label?: string;
    order: number;
    storageKey?: string;
    width?: number;
    height?: number;
    byteSize?: number;
    createdAt: string;
    updatedAt: string;
};
type ReviewFigmaImageAssetInput = {
    dataUrl: string;
    imageFormat: ReviewFigmaImageFormat;
    mimeType: string;
    byteSize?: number;
    width?: number;
    height?: number;
};
type AddReviewFigmaImageInput = {
    target: ReviewFigmaImageTarget;
    figmaUrl: string;
    label?: string;
    order?: number;
    imageFormat?: ReviewFigmaImageFormat;
    asset?: ReviewFigmaImageAssetInput;
};
type UpdateReviewFigmaImageInput = Partial<Pick<ReviewFigmaImage, 'label' | 'order'>>;
type ReorderReviewFigmaImagesInput = {
    target: ReviewFigmaImageTarget;
    imageIds: string[];
};
interface ReviewFigmaImageStore {
    listImages(target: ReviewFigmaImageTarget): Promise<ReviewFigmaImage[]>;
    addImage(input: AddReviewFigmaImageInput): Promise<ReviewFigmaImage>;
    updateImage(id: string, patch: UpdateReviewFigmaImageInput): Promise<ReviewFigmaImage>;
    reorderImages(input: ReorderReviewFigmaImagesInput): Promise<ReviewFigmaImage[]>;
    deleteImage(id: string): Promise<void>;
}

export { type AddReviewFigmaImageInput as A, DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT as D, type ReviewFigmaImageStore as R, type UpdateReviewFigmaImageInput as U, type ReviewFigmaImageFormat as a, type ReviewFigmaImageTarget as b, type ReorderReviewFigmaImagesInput as c, type ReviewFigmaImage as d, type ReviewFigmaImageAssetInput as e, type ReviewFigmaImageViewport as f, type ReviewFigmaNodeTarget as g, type ReviewFigmaRouteTarget as h };
