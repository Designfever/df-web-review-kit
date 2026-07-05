import { describe, expect, it, vi } from 'vitest';
import type { ReviewItem } from '../../types';
import type { ReviewEnvironment } from '../geometry';
import { createElementLayer } from './selection.layers';
import type { WebReviewKitViewConfig } from './types';

function createEnvironment(): ReviewEnvironment {
  return {
    window: {
      innerWidth: 400,
      innerHeight: 300,
      scrollX: 0,
      scrollY: 0,
    } as Window,
    document,
    viewportRect: { left: 100, top: 50, width: 200, height: 150 },
    overlayRect: { left: 0, top: 0, width: 600, height: 400 },
    scaleX: 0.5,
    scaleY: 0.5,
  };
}

function createConfig(
  environment: ReviewEnvironment,
  bindElementDraftToPoint: WebReviewKitViewConfig['actions']['bindElementDraftToPoint']
): WebReviewKitViewConfig {
  return {
    options: { projectId: 'test' },
    getEnvironment: () => environment,
    getState: () => ({
      isOpen: true,
      mode: 'element',
      items: [],
      isCreatingItem: false,
      isCapturingViewport: false,
      isSelectingArea: false,
    }),
    actions: {
      close: vi.fn(),
      render: vi.fn(),
      reload: vi.fn(async () => [] as ReviewItem[]),
      restoreItem: vi.fn(async () => undefined),
      removeItem: vi.fn(async () => undefined),
      setModeState: vi.fn(),
      clearDrafts: vi.fn(),
      setDomDraft: vi.fn(),
      setAreaDraft: vi.fn(),
      setSelectingArea: vi.fn(),
      createItem: vi.fn(async () => undefined),
      captureDomDraft: vi.fn(async () => undefined),
      captureAreaDraft: vi.fn(async () => undefined),
      bindElementDraftToPoint,
      createAreaDraft: vi.fn(async () => undefined),
    },
  };
}

describe('createElementLayer', () => {
  it('passes scaled host clicks to DOM select as target-space points', () => {
    const environment = createEnvironment();
    const bindElementDraftToPoint = vi.fn(async () => undefined);
    const layer = createElementLayer(
      createConfig(environment, bindElementDraftToPoint)
    );

    layer.dispatchEvent(
      new MouseEvent('pointerdown', {
        button: 0,
        clientX: 120,
        clientY: 90,
        bubbles: true,
      })
    );

    expect(bindElementDraftToPoint).toHaveBeenCalledWith({ x: 40, y: 80 });
  });
});
