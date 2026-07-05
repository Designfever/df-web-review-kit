import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  createReviewShellStore,
  type ReviewShellStoreInit,
} from './create.review.shell.store';

const createTestInit = (): ReviewShellStoreInit => ({
  target: {
    activeRoute: '/',
    draftTarget: '/',
    size: { label: 'MO', width: 390, height: 844 },
    source: 'local',
    target: '/',
    targetOverlayState: {
      grid: false,
      figma: false,
    },
  },
});

describe('createReviewShellStore', () => {
  it('creates isolated store instances', () => {
    const storeA = createReviewShellStore(createTestInit());
    const storeB = createReviewShellStore(createTestInit());

    storeA.getState().setSidePanel('source');
    storeA.getState().setIsListVisible(false);
    storeA.getState().setTarget('/about');

    expect(storeA.getState().sidePanel).toBe('source');
    expect(storeB.getState().sidePanel).toBe('qa');
    expect(storeB.getState().isListVisible).not.toBe(
      storeA.getState().isListVisible
    );
    expect(storeA.getState().target).toBe('/about');
    expect(storeB.getState().target).toBe('/');
  });

  it('updates side panel state through slice actions', () => {
    const store = createReviewShellStore(createTestInit());

    store.getState().setSidePanel('figma-images');
    expect(store.getState().sidePanel).toBe('figma-images');

    store.getState().setIsListVisible(false);
    expect(store.getState().isListVisible).toBe(false);
  });

  it('updates target state through slice actions', () => {
    const store = createReviewShellStore(createTestInit());

    store.getState().setTarget('/pricing');
    store.getState().setDraftTarget('/pricing');
    store.getState().setActiveRoute('/pricing');
    store.getState().setSource('remote');
    store.getState().setSize({ label: 'PC', width: 1440, height: 900 });
    store.getState().setTargetOverlayState({ grid: true, figma: false });

    const state = store.getState();
    expect(state.target).toBe('/pricing');
    expect(state.draftTarget).toBe('/pricing');
    expect(state.activeRoute).toBe('/pricing');
    expect(state.source).toBe('remote');
    expect(state.size.width).toBe(1440);
    expect(state.targetOverlayState.grid).toBe(true);
  });
});
