import type { ReviewFigmaImageTarget, ReviewFigmaRouteTarget } from './image.types';

export function getReviewFigmaImageTargetKey(target: ReviewFigmaImageTarget) {
  return JSON.stringify(normalizeReviewFigmaImageTarget(target));
}

function normalizeReviewFigmaImageTarget(target: ReviewFigmaImageTarget) {
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
    slot: target.slot ?? '',
    viewport: target.viewport
      ? {
          label: target.viewport.label ?? '',
          width: target.viewport.width ?? null,
          height: target.viewport.height ?? null,
          scope: target.viewport.scope ?? '',
        }
      : null,
  };
}

// Legacy overlay storage keys intentionally differ from normalized store keys.
export function createReviewFigmaImageTargetKey(target: ReviewFigmaRouteTarget) {
  return [
    target.projectId,
    target.pageUrl,
    target.viewport?.scope ?? '',
    target.viewport?.label ?? '',
    target.viewport?.width ?? '',
    target.viewport?.height ?? '',
    target.slot ?? '',
  ].join('|');
}
