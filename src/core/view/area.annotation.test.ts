import { describe, expect, it, vi } from 'vitest';
import type { AreaDraft, DomDraft } from '../review/draft';
import {
  createAreaAnnotationLayer,
  createDomAnnotationLayer,
} from './area.annotation';
import type { DraftLayerContext } from './types';

describe('createAreaAnnotationLayer', () => {
  it('updates the area draft from the rectangle and clear controls', () => {
    let draft: AreaDraft = {
      viewport: { width: 390, height: 844 },
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
    const rectangleButton = layer.querySelector<HTMLButtonElement>(
      '[aria-label="Draw rectangle"]'
    );
    if (!rectangleButton) {
      throw new Error('Area annotation draw control was not created.');
    }
    expect(
      rectangleButton.querySelectorAll(
        '.dfwr-area-annotation-rectangle-icon span'
      )
    ).toHaveLength(4);

    rectangleButton.click();
    expect(draft.annotationTool).toBe('rectangle');

    draft = {
      ...draft,
      annotations: [
        { kind: 'rectangle', x: 20, y: 30, width: 80, height: 40 },
      ],
    };
    const clearButton = createAreaAnnotationLayer(
      context,
      draft
    ).querySelector<HTMLButtonElement>('[aria-label="Clear annotations"]');
    if (!clearButton) {
      throw new Error('Area annotation clear control was not created.');
    }
    expect(clearButton.title).toBe('Clear annotations');
    expect(
      clearButton.querySelector('.dfwr-area-annotation-clear-icon')
    ).not.toBeNull();
    clearButton.click();
    expect(draft.annotations).toBeUndefined();
    expect(draft.annotationTool).toBeUndefined();
  });

  it('updates the DOM draft from the rectangle and clear controls', () => {
    let draft: DomDraft = {
      viewport: { width: 390, height: 844 },
      marker: { viewport: { x: 20, y: 30 } },
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
    if (!rectangleButton) {
      throw new Error('DOM annotation draw control was not created.');
    }

    rectangleButton.click();
    expect(draft.annotationTool).toBe('rectangle');

    draft = {
      ...draft,
      annotations: [
        { kind: 'rectangle', x: 20, y: 30, width: 80, height: 40 },
      ],
    };
    const clearButton = createDomAnnotationLayer(
      context,
      draft,
      () => undefined
    ).querySelector<HTMLButtonElement>('[aria-label="Clear annotations"]');
    if (!clearButton) {
      throw new Error('DOM annotation clear control was not created.');
    }
    expect(
      clearButton.querySelector('.dfwr-area-annotation-clear-icon')
    ).not.toBeNull();
    clearButton.click();
    expect(draft.annotations).toBeUndefined();
    expect(draft.annotationTool).toBeUndefined();
  });
});
