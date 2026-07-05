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

  it('updates qa state through slice actions', () => {
    const store = createReviewShellStore(createTestInit());

    store.getState().toggleHiddenOverlayItemId('item-1');
    expect(store.getState().hiddenOverlayItemIds.has('item-1')).toBe(true);
    store.getState().toggleHiddenOverlayItemId('item-1');
    expect(store.getState().hiddenOverlayItemIds.has('item-1')).toBe(false);

    store.getState().addMutatingItemId('item-2');
    expect(store.getState().mutatingItemIds.has('item-2')).toBe(true);
    store.getState().removeMutatingItemId('item-2');
    expect(store.getState().mutatingItemIds.has('item-2')).toBe(false);

    store.getState().setCopiedPromptKey('qa:item-3');
    store
      .getState()
      .setCopiedPromptKey((current) =>
        current === 'qa:item-3' ? null : current
      );
    expect(store.getState().copiedPromptKey).toBe(null);

    store.getState().setSelectedItemId('item-4');
    expect(store.getState().selectedItemId).toBe('item-4');
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

  it('updates ui state through slice actions', () => {
    const store = createReviewShellStore(createTestInit());

    store.getState().setMode('element');
    store.getState().setIsSitemapOpen(true);
    store
      .getState()
      .setIsSitemapOpen((current) => !current);
    store.getState().setToastMessage('Copied');
    store
      .getState()
      .setToastMessage((current) => (current === 'Copied' ? '' : current));
    store.getState().bumpTargetFrameLoadVersion();

    const state = store.getState();
    expect(state.mode).toBe('element');
    expect(state.isSitemapOpen).toBe(false);
    expect(state.toastMessage).toBe('');
    expect(state.targetFrameLoadVersion).toBe(1);
  });
});
