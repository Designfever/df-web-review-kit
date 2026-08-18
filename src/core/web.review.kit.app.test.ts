import { afterEach, describe, expect, it } from 'vitest';
import { createWebReviewKit } from './web.review.kit.app';

describe('createWebReviewKit', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('mounts the interaction layers in a fixed viewport host', () => {
    const controller = createWebReviewKit({ projectId: 'test-project' });
    const root = document.getElementById('df-web-review-kit-root');

    expect(root?.style.position).toBe('fixed');
    expect(root?.style.inset).toBe('0px');
    expect(root?.style.zIndex).toBe('2147483647');
    expect(root?.style.pointerEvents).toBe('none');
    expect(root?.style.display).not.toBe('contents');

    controller.destroy();
  });
});
