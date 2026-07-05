import { describe, expect, it } from 'vitest';
import type { ReviewItem } from '../../types';
import type { ReviewEnvironment } from '../geometry';
import { createMarkerLayer } from './markers';

function createEnvironment(): ReviewEnvironment {
  return {
    window: {
      innerWidth: 390,
      innerHeight: 720,
      scrollX: 0,
      scrollY: 0,
    } as Window,
    document: document,
    viewportRect: { left: 100, top: 50, width: 390, height: 720 },
    overlayRect: { left: 0, top: 0, width: 800, height: 900 },
  };
}

function createAreaItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: 'item-111',
    projectId: 'test',
    routeKey: '/',
    pageUrl: 'http://localhost/',
    normalizedPath: '/',
    kind: 'area',
    comment: 'Check area',
    status: 'todo',
    reviewNumber: 111,
    viewport: { width: 390, height: 720 },
    selection: {
      viewport: { x: 10, y: 20, width: 120, height: 80 },
    },
    createdAt: '2026-07-05T09:00:00.000Z',
    updatedAt: '2026-07-05T09:00:00.000Z',
    ...overrides,
  } as ReviewItem;
}

describe('createMarkerLayer', () => {
  it('renders stored area items as compact markers until selected', () => {
    const layer = createMarkerLayer({
      items: [createAreaItem()],
      environment: createEnvironment(),
    });

    expect(layer.querySelector('.dfwr-bound-marker-number')?.textContent).toBe(
      '#111'
    );
    expect(
      layer.querySelector<HTMLElement>('.dfwr-bound-marker')?.style.left
    ).toBe('110px');
    expect(
      layer.querySelector<HTMLElement>('.dfwr-bound-marker')?.style.top
    ).toBe('70px');
    expect(layer.querySelector('.dfwr-item-target-highlight')).toBeNull();
    expect(layer.querySelector('.dfwr-item-target-label')).toBeNull();
  });

  it('renders markers through the target-to-host scale', () => {
    const layer = createMarkerLayer({
      items: [createAreaItem()],
      environment: {
        ...createEnvironment(),
        viewportRect: { left: 100, top: 50, width: 195, height: 360 },
        scaleX: 0.5,
        scaleY: 0.5,
      },
    });

    expect(
      layer.querySelector<HTMLElement>('.dfwr-bound-marker')?.style.left
    ).toBe('105px');
    expect(
      layer.querySelector<HTMLElement>('.dfwr-bound-marker')?.style.top
    ).toBe('60px');
  });

  it('can leave compact markers to the shell outside-marker layer', () => {
    const layer = createMarkerLayer({
      items: [createAreaItem()],
      environment: createEnvironment(),
      showCompactMarkers: false,
    });

    expect(layer.querySelector('.dfwr-bound-marker')).toBeNull();
    expect(layer.querySelector('.dfwr-item-target-highlight')).toBeNull();
  });

  it('renders the selected item with its target highlight', () => {
    const layer = createMarkerLayer({
      items: [createAreaItem({ scope: 'mobile' })],
      highlightedItemId: 'item-111',
      environment: createEnvironment(),
      showCompactMarkers: false,
    });

    expect(layer.querySelector('.dfwr-bound-marker')).toBeNull();
    expect(
      layer.querySelector('.dfwr-item-target-highlight.is-scope-mobile')
    ).not.toBeNull();
    expect(
      layer.querySelector('.dfwr-item-target-label.is-scope-mobile')
    ).not.toBeNull();
    expect(layer.querySelector('.dfwr-item-target-label')?.textContent).toBe(
      '#111'
    );
  });
});
