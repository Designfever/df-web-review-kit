import { describe, expect, it, vi } from 'vitest';
import type { AreaDraft, DomDraft } from '../review/draft';
import {
  createAreaAnnotationLayer,
  createDomAnnotationLayer,
} from './area.annotation';
import type { DraftLayerContext } from './types';

describe('createAreaAnnotationLayer', () => {
  it('blocks wheel scrolling only while the rectangle tool is active', () => {
    let draft: AreaDraft = {
      viewport: { width: 390, height: 844 },
      annotationTool: 'rectangle',
    };
    const context = {
      config: {
        getState: () => ({ areaDraft: draft }),
        getEnvironment: () => undefined,
        actions: {
          setAreaDraft: (nextDraft: AreaDraft) => {
            draft = nextDraft;
          },
          render: vi.fn(),
        },
      },
    } as unknown as DraftLayerContext;
    const layer = createAreaAnnotationLayer(context, draft);
    const canvas = layer.querySelector('canvas');
    if (!canvas) throw new Error('Annotation canvas was not created.');

    expect(
      canvas.dispatchEvent(new WheelEvent('wheel', { cancelable: true }))
    ).toBe(false);

    draft = { ...draft, annotationTool: undefined };
    expect(
      canvas.dispatchEvent(new WheelEvent('wheel', { cancelable: true }))
    ).toBe(true);
  });

  it('updates the DOM draft from the rectangle and clear controls', () => {
    let draft: DomDraft = {
      viewport: { width: 390, height: 844 },
      marker: { viewport: { x: 20, y: 30 } },
      annotations: [
        { kind: 'rectangle', x: 20, y: 30, width: 80, height: 40 },
      ],
    };
    const context = {
      config: {
        getState: () => ({ domDraft: draft }),
        getEnvironment: () => undefined,
        actions: {
          setDomDraft: (nextDraft: DomDraft) => {
            draft = nextDraft;
          },
          render: vi.fn(),
        },
      },
    } as unknown as DraftLayerContext;
    const layer = createDomAnnotationLayer(context, draft, () => undefined);
    const rectangleButton = layer.querySelector<HTMLButtonElement>(
      '[aria-label="Draw rectangle"]'
    );
    const clearButton = layer.querySelector<HTMLButtonElement>(
      '[aria-label="Clear annotations"]'
    );
    if (!rectangleButton || !clearButton) {
      throw new Error('DOM annotation controls were not created.');
    }

    rectangleButton.click();
    expect(draft.annotationTool).toBe('rectangle');

    clearButton.click();
    expect(draft.annotations).toBeUndefined();
  });
});
