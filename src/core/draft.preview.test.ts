import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getDraftAdjustmentMetrics,
  hasDraftAdjustment,
} from './draft.metrics';
import { DraftPreviewController } from './draft.preview';
import type { ReviewEnvironment } from './geometry';
import type { DomDraft } from './review/draft';

afterEach(() => document.body.replaceChildren());

describe('DraftPreviewController', () => {
  it('follows the source element when its viewport rect changes', () => {
    const element = document.createElement('section');
    let top = 20;
    vi.spyOn(element, 'getBoundingClientRect').mockImplementation(
      () =>
        ({ left: 10, top, width: 120, height: 60 } as DOMRect)
    );
    document.body.appendChild(element);

    const environment: ReviewEnvironment = {
      window,
      document,
      viewportRect: { left: 0, top: 0, width: 390, height: 844 },
      overlayRect: { left: 0, top: 0, width: 390, height: 844 },
    };
    const draft: DomDraft = {
      viewport: { width: 390, height: 844 },
      marker: { viewport: { x: 10, y: 20 } },
      selection: { viewport: { x: 10, y: 20, width: 120, height: 60 } },
      adjustment: { x: 1, y: 0, scale: 0 },
      previewElement: element,
    };
    const controller = new DraftPreviewController({
      getEnvironment: () => environment,
      getMetrics: (value) => getDraftAdjustmentMetrics(value),
      hasAdjustment: (value) => hasDraftAdjustment(value),
    });

    controller.sync(draft);
    const clone = document.querySelector<HTMLElement>(
      '[data-dfwr-adjust-preview="true"]'
    );
    expect(clone?.style.top).toBe('20px');

    top = -40;
    controller.sync(draft);
    expect(clone?.style.top).toBe('-40px');

    controller.clear();
    expect(element.style.visibility).toBe('');
  });
});
