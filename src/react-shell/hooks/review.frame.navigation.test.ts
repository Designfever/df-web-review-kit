import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { bindReviewFrameNavigation } from './review.frame.navigation';

const pageTargets = new Set(['/', '/components/', '/long-form/']);

const bindNavigation = (
  getCurrentTarget: () => string,
  onSyncShellTarget: (
    target: string,
    navigation: 'hard' | 'soft'
  ) => void
) =>
  bindReviewFrameNavigation({
    getCurrentTarget,
    pageTargets,
    reviewPathPrefix: '/review',
    targetDocument: document,
    targetWindow: window,
    onCancelReviewMode: () => false,
    onCloseRuler: () => false,
    onSyncShellTarget,
    onSyncTargetViewport: () => undefined,
  });

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, '', '/');
});

describe('bindReviewFrameNavigation', () => {
  it('reports pushState navigation as soft', () => {
    const onSyncShellTarget = vi.fn();
    const cleanup = bindNavigation(() => '/', onSyncShellTarget);

    window.history.pushState({}, '', '/components/');

    expect(onSyncShellTarget).toHaveBeenLastCalledWith(
      '/components/',
      'soft'
    );
    cleanup();
  });

  it('leaves host-managed SPA links alone', () => {
    const onSyncShellTarget = vi.fn();
    const link = document.createElement('a');
    link.href = '/components/';
    link.addEventListener('click', (event) => event.preventDefault());
    document.body.append(link);
    const cleanup = bindNavigation(() => '/', onSyncShellTarget);

    link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    );

    expect(onSyncShellTarget).not.toHaveBeenCalled();
    cleanup();
  });

  it('reports unhandled internal links as hard navigation', () => {
    const onSyncShellTarget = vi.fn();
    const link = document.createElement('a');
    link.href = '/components/';
    document.body.append(link);
    const cleanup = bindNavigation(() => '/', onSyncShellTarget);
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
    });

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onSyncShellTarget).toHaveBeenLastCalledWith(
      '/components/',
      'hard'
    );
    cleanup();
  });

  it('reports popstate navigation as hard', () => {
    window.history.replaceState(null, '', '/components/');
    const onSyncShellTarget = vi.fn();
    const cleanup = bindNavigation(() => '/long-form/', onSyncShellTarget);
    onSyncShellTarget.mockClear();

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(onSyncShellTarget).toHaveBeenLastCalledWith(
      '/components/',
      'hard'
    );
    cleanup();
  });
});
