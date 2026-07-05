import { describe, expect, it } from 'vitest';
import type { ReviewItem } from '../../types';
import type { ReviewEnvironment } from '../geometry';
import {
  getBoundMarkerPoint,
  getItemHighlightSelection,
} from './item';

function createEnvironment(): ReviewEnvironment {
  return {
    window: {
      innerWidth: 390,
      innerHeight: 720,
      scrollX: 0,
      scrollY: 0,
    } as Window,
    document,
    viewportRect: { left: 0, top: 0, width: 390, height: 720 },
    overlayRect: { left: 0, top: 0, width: 390, height: 720 },
  };
}

function createAreaItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: 'item-area',
    projectId: 'test',
    routeKey: '/',
    pageUrl: 'http://localhost/',
    normalizedPath: '/',
    kind: 'area',
    comment: 'Check area',
    status: 'todo',
    viewport: { width: 390, height: 720 },
    createdAt: '2026-07-05T09:00:00.000Z',
    updatedAt: '2026-07-05T09:00:00.000Z',
    ...overrides,
  } as ReviewItem;
}

describe('review item area binding', () => {
  it('restores area markers and selections from anchor-relative geometry', () => {
    document.body.innerHTML = '<section data-qa-id="hero"></section>';
    const anchorElement = document.querySelector<HTMLElement>(
      '[data-qa-id="hero"]'
    );
    expect(anchorElement).not.toBeNull();
    if (!anchorElement) return;

    anchorElement.getBoundingClientRect = () => ({
      x: 100,
      y: 200,
      left: 100,
      top: 200,
      right: 400,
      bottom: 300,
      width: 300,
      height: 100,
      toJSON: () => ({}),
    });

    const environment = createEnvironment();
    const item = createAreaItem({
      anchor: {
        selector: '[data-qa-id="hero"]',
        strategy: 'configured-attribute',
      },
      marker: {
        viewport: { x: 10, y: 20 },
        relative: { x: 0.1, y: 0.2 },
      },
      selection: {
        viewport: { x: 10, y: 20, width: 120, height: 80 },
        relative: { x: 0.1, y: 0.2, width: 0.5, height: 0.4 },
      },
    });

    expect(getBoundMarkerPoint(item, environment)?.viewport).toEqual({
      x: 130,
      y: 220,
    });
    expect(getItemHighlightSelection(item, environment)).toMatchObject({
      viewport: { left: 130, top: 220, width: 150, height: 40 },
      isBound: true,
    });
  });
});
