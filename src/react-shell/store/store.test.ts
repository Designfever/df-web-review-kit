import {
  describe,
  expect,
  it,
} from 'vitest';
import { createReviewShellStore } from './create.review.shell.store';

describe('createReviewShellStore', () => {
  it('creates isolated store instances', () => {
    const storeA = createReviewShellStore();
    const storeB = createReviewShellStore();

    storeA.getState().setSidePanel('source');
    storeA.getState().setIsListVisible(false);

    expect(storeA.getState().sidePanel).toBe('source');
    expect(storeB.getState().sidePanel).toBe('qa');
    expect(storeB.getState().isListVisible).not.toBe(
      storeA.getState().isListVisible
    );
  });

  it('updates side panel state through slice actions', () => {
    const store = createReviewShellStore();

    store.getState().setSidePanel('figma-images');
    expect(store.getState().sidePanel).toBe('figma-images');

    store.getState().setIsListVisible(false);
    expect(store.getState().isListVisible).toBe(false);
  });
});
