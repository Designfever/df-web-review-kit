import { describe, expect, it } from 'vitest';
import {
  createReviewFigmaImageTargetKey,
  getReviewFigmaImageTargetKey,
} from './image.target';
import { getReviewFigmaImageMimeType } from './image.asset';
import {
  DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT,
  getReviewFigmaImageMimeType as publicMimeType,
  getReviewFigmaImageTargetKey as publicTargetKey,
} from './image.store';
import type { ReviewFigmaRouteTarget } from './image.types';

describe('persisted Figma target keys', () => {
  it('preserves distinct store and legacy overlay keys for a route', () => {
    const target: ReviewFigmaRouteTarget = {
      type: 'route',
      projectId: 'project',
      pageUrl: '/page',
      viewport: { width: 390, height: 844 },
    };
    expect(getReviewFigmaImageTargetKey(target)).toBe(
      '{"type":"route","projectId":"project","pageUrl":"/page","slot":"","viewport":{"label":"","width":390,"height":844,"scope":""}}'
    );
    expect(createReviewFigmaImageTargetKey(target)).toBe(
      'project|/page|||390|844|'
    );
    expect(getReviewFigmaImageTargetKey({ ...target, viewport: undefined })).toBe(
      '{"type":"route","projectId":"project","pageUrl":"/page","slot":"","viewport":null}'
    );
  });

  it('preserves normalized Figma node key field order', () => {
    expect(getReviewFigmaImageTargetKey({
      nodeId: '1:2', fileKey: 'FILE', projectId: 'project', type: 'figma-node',
    })).toBe(
      '{"type":"figma-node","projectId":"project","fileKey":"FILE","nodeId":"1:2"}'
    );
  });

  it('keeps existing client-store re-exports and endpoint value', () => {
    expect(publicTargetKey).toBe(getReviewFigmaImageTargetKey);
    expect(publicMimeType).toBe(getReviewFigmaImageMimeType);
    expect(DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT).toBe('/__dfwr/figma-images');
  });
});
