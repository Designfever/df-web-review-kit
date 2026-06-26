import type {
  ReviewFigmaImage,
  ReviewFigmaImageStore,
  ReviewFigmaImageTarget,
} from './image.types';
import { getReviewFigmaImageTargetKey } from './image.store';

export type ReviewFigmaImagesSnapshot = ReviewFigmaImage[];

export type ReviewFigmaReleaseSnapshot = {
  version: 1;
  projectId: string;
  releaseId?: string;
  label?: string;
  createdAt: string;
  figmaImagesSnapshot: ReviewFigmaImagesSnapshot;
};

export type CreateReviewFigmaImagesSnapshotOptions = {
  projectId?: string;
  targets?: readonly ReviewFigmaImageTarget[];
};

export type CreateReviewFigmaReleaseSnapshotOptions =
  CreateReviewFigmaImagesSnapshotOptions & {
    images: readonly ReviewFigmaImage[];
    projectId: string;
    releaseId?: string;
    label?: string;
    createdAt?: string;
  };

export type CollectReviewFigmaReleaseSnapshotOptions = Omit<
  CreateReviewFigmaReleaseSnapshotOptions,
  'images'
> & {
  store: ReviewFigmaImageStore;
  targets: readonly ReviewFigmaImageTarget[];
};

export function createReviewFigmaImagesSnapshot(
  images: readonly ReviewFigmaImage[],
  options: CreateReviewFigmaImagesSnapshotOptions = {}
): ReviewFigmaImagesSnapshot {
  const targetKeys = options.targets?.length
    ? new Set(options.targets.map(getReviewFigmaImageTargetKey))
    : null;

  return images
    .filter((image) => {
      if (options.projectId && image.projectId !== options.projectId) {
        return false;
      }
      if (
        targetKeys &&
        !targetKeys.has(getReviewFigmaImageTargetKey(image.target))
      ) {
        return false;
      }
      return true;
    })
    .map(cloneReviewFigmaImage)
    .sort(compareReviewFigmaSnapshotImages);
}

export function createReviewFigmaReleaseSnapshot({
  images,
  projectId,
  releaseId,
  label,
  createdAt,
  targets,
}: CreateReviewFigmaReleaseSnapshotOptions): ReviewFigmaReleaseSnapshot {
  return {
    version: 1,
    projectId,
    ...(releaseId ? { releaseId } : null),
    ...(label ? { label } : null),
    createdAt: createdAt ?? new Date().toISOString(),
    figmaImagesSnapshot: createReviewFigmaImagesSnapshot(images, {
      projectId,
      targets,
    }),
  };
}

export async function collectReviewFigmaReleaseSnapshot({
  store,
  targets,
  ...snapshotOptions
}: CollectReviewFigmaReleaseSnapshotOptions): Promise<ReviewFigmaReleaseSnapshot> {
  const imagesByTarget = await Promise.all(
    targets.map((target) => store.listImages(target))
  );

  return createReviewFigmaReleaseSnapshot({
    ...snapshotOptions,
    targets,
    images: dedupeReviewFigmaImages(imagesByTarget.flat()),
  });
}

function dedupeReviewFigmaImages(images: readonly ReviewFigmaImage[]) {
  return Array.from(new Map(images.map((image) => [image.id, image])).values());
}

function cloneReviewFigmaImage(image: ReviewFigmaImage): ReviewFigmaImage {
  return {
    ...image,
    target: cloneReviewFigmaImageTarget(image.target),
  };
}

function cloneReviewFigmaImageTarget(
  target: ReviewFigmaImageTarget
): ReviewFigmaImageTarget {
  if (target.type === 'figma-node') {
    return {
      type: target.type,
      projectId: target.projectId,
      fileKey: target.fileKey,
      nodeId: target.nodeId,
    };
  }

  return {
    type: target.type,
    projectId: target.projectId,
    pageUrl: target.pageUrl,
    slot: target.slot,
    viewport: target.viewport
      ? {
          label: target.viewport.label,
          width: target.viewport.width,
          height: target.viewport.height,
          scope: target.viewport.scope,
        }
      : undefined,
  };
}

function compareReviewFigmaSnapshotImages(
  a: ReviewFigmaImage,
  b: ReviewFigmaImage
) {
  return (
    a.projectId.localeCompare(b.projectId) ||
    getReviewFigmaImageTargetKey(a.target).localeCompare(
      getReviewFigmaImageTargetKey(b.target)
    ) ||
    a.order - b.order ||
    a.createdAt.localeCompare(b.createdAt) ||
    a.id.localeCompare(b.id)
  );
}
