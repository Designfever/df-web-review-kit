export type ReviewFigmaImageFormat = 'webp' | 'png' | 'jpg';

export const DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT =
  'webp' satisfies ReviewFigmaImageFormat;

export type ReviewFigmaImageViewport = {
  label?: string;
  width?: number;
  height?: number;
  scope?: 'mobile' | 'tablet' | 'desktop' | 'wide';
};

export type ReviewFigmaRouteTarget = {
  type: 'route';
  projectId: string;
  pageUrl: string;
  viewport?: ReviewFigmaImageViewport;
  slot?: string;
};

export type ReviewFigmaNodeTarget = {
  type: 'figma-node';
  projectId: string;
  fileKey: string;
  nodeId: string;
};

export type ReviewFigmaImageTarget =
  | ReviewFigmaRouteTarget
  | ReviewFigmaNodeTarget;

export type ReviewFigmaImage = {
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

export type ReviewFigmaImageAssetInput = {
  dataUrl: string;
  imageFormat: ReviewFigmaImageFormat;
  mimeType: string;
  byteSize?: number;
  width?: number;
  height?: number;
};

export type AddReviewFigmaImageInput = {
  target: ReviewFigmaImageTarget;
  figmaUrl: string;
  label?: string;
  order?: number;
  imageFormat?: ReviewFigmaImageFormat;
  asset?: ReviewFigmaImageAssetInput;
};

export type UpdateReviewFigmaImageInput = Partial<
  Pick<ReviewFigmaImage, 'label' | 'order'>
>;

export type ReorderReviewFigmaImagesInput = {
  target: ReviewFigmaImageTarget;
  imageIds: string[];
};

export interface ReviewFigmaImageStore {
  listImages(target: ReviewFigmaImageTarget): Promise<ReviewFigmaImage[]>;
  addImage(input: AddReviewFigmaImageInput): Promise<ReviewFigmaImage>;
  updateImage(
    id: string,
    patch: UpdateReviewFigmaImageInput
  ): Promise<ReviewFigmaImage>;
  reorderImages(
    input: ReorderReviewFigmaImagesInput
  ): Promise<ReviewFigmaImage[]>;
  deleteImage(id: string): Promise<void>;
}
