import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import type { WebReviewKitController } from '../../types';
import { createReviewShellStore } from '../store/create.review.shell.store';
import { ReviewShellStoreProvider } from '../store/store.context';
import { useReviewKitLifecycle } from './use.review.kit.lifecycle';

it('ends initial QA loading and shows the session error after page switching', async () => {
  const host = document.createElement('div');
  const frame = document.createElement('iframe');
  document.body.append(host, frame);
  const root = createRoot(host);
  const store = createReviewShellStore({ target: {
    activeRoute: '/', draftTarget: '/', frameNavigationVersion: 0,
    frameTarget: '/', target: '/', source: 'remote',
    size: { label: 'Mobile', width: 540, height: 1080 },
    targetOverlayState: { grid: false, figma: false },
  } });
  const error = new Error('Your df-sheet review session expired. Reload this page to sign in again.');
  const options = {
    adapter: {
      list: vi.fn().mockRejectedValue(error), get: vi.fn(),
      create: vi.fn(), update: vi.fn(), remove: vi.fn(),
    },
    fields: { title: true }, statusOptions: [], assigneeTitle: 'Owner', assigneeOptions: [],
    cleanupTargetRef: { current: null },
    controllerRef: { current: null as WebReviewKitController | null },
    frameScrollRef: { current: null }, iframeRef: { current: frame },
    hiddenOverlayItemIdList: [], pageTargets: new Set(['/']), projectId: 'test-project',
    reviewPathPrefix: '/review', reviewUserId: '', reviewViewportPresets: [],
    onApplyPendingRestore: vi.fn(), onCancelReviewMode: () => false,
    onCloseRuler: () => false, onModeChange: vi.fn(), onCreateItem: vi.fn(),
    onRefreshTargetOverlayState: vi.fn(), onRestoreInitialItem: async () => {},
    onRestoreReviewItem: vi.fn(), onSyncShellTarget: vi.fn(), onSyncTargetViewport: vi.fn(),
  };
  let lifecycle: ReturnType<typeof useReviewKitLifecycle>;
  function Harness() {
    lifecycle = useReviewKitLifecycle(options);
    return null;
  }
  try {
    await act(async () => root.render(
      <ReviewShellStoreProvider value={store}><Harness /></ReviewShellStoreProvider>
    ));
    expect(options.adapter.list).toHaveBeenCalled();
    expect(store.getState().isItemsLoading).toBe(false);
    expect(store.getState().toastMessage).toBe(error.message);

    await act(async () => lifecycle.initReviewKit());
    expect(store.getState().isItemsLoading).toBe(false);
    expect(store.getState().toastMessage).toBe(error.message);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    frame.remove();
  }
});
