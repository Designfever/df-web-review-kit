import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import type { ReviewItem, WebReviewKitController } from '../../types';
import { createReviewShellStore } from '../store/create.review.shell.store';
import { ReviewShellStoreProvider } from '../store/store.context';
import { useReviewItemRestore } from './use.review.item.restore';

it('restores an area item once while the same restore is already running', async () => {
  const host = document.createElement('div');
  const iframe = document.createElement('iframe');
  document.body.append(host, iframe);
  const targetDocument = iframe.contentDocument;
  if (!targetDocument) throw new Error('Target document was not created.');
  Object.defineProperty(targetDocument, 'scrollingElement', {
    configurable: true,
    value: targetDocument.documentElement,
  });
  Object.defineProperty(targetDocument.documentElement, 'scrollHeight', {
    configurable: true,
    value: 2000,
  });

  const item = createAreaItem();
  const store = createReviewShellStore({
    target: {
      activeRoute: '/',
      draftTarget: '/',
      frameNavigationVersion: 0,
      frameTarget: '/',
      target: '/',
      source: 'remote',
      size: { label: 'Desktop', width: 1440, height: 900 },
      targetOverlayState: { grid: false, figma: false },
    },
  });
  store.getState().setSelectedItemId(item.id);
  const pendingRestoreRef = { current: item as ReviewItem | null };
  const syncTargetViewport = vi.fn();
  const controller = {
    getItems: () => [item],
    highlightItem: vi.fn(),
  } as unknown as WebReviewKitController;
  const root = createRoot(host);
  let restore: ReturnType<typeof useReviewItemRestore>;

  function Harness() {
    restore = useReviewItemRestore({
      adapter: {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
      },
      controllerRef: { current: controller },
      iframeRef: { current: iframe },
      pendingInitialItemIdRef: { current: null },
      pendingRestoreRef,
      reviewPathPrefix: '/review',
      source: 'remote',
      viewportPresets: [],
      onActiveRouteChange: vi.fn(),
      onDraftTargetChange: vi.fn(),
      onSelectedItemIdChange: vi.fn(),
      onSizeChange: vi.fn(),
      onSyncTargetViewport: syncTargetViewport,
      onTargetChange: vi.fn(),
    });
    return null;
  }

  try {
    await act(async () => {
      root.render(
        <ReviewShellStoreProvider value={store}>
          <Harness />
        </ReviewShellStoreProvider>
      );
    });
    await act(async () => {
      restore.applyPendingRestore();
      restore.applyPendingRestore();
      await Promise.resolve();
    });

    expect(syncTargetViewport).toHaveBeenCalledTimes(1);
    expect(targetDocument.documentElement.scrollTop).toBe(240);
    expect(pendingRestoreRef.current).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    iframe.remove();
  }
});

function createAreaItem(): ReviewItem {
  return {
    id: 'area-item',
    projectId: 'test',
    routeKey: '/',
    pageUrl: 'http://localhost/',
    normalizedPath: '/',
    kind: 'area',
    comment: 'Area issue',
    status: 'todo',
    viewport: { width: 1440, height: 900 },
    scroll: { x: 0, y: 240 },
    selection: {
      viewport: { x: 20, y: 30, width: 120, height: 80 },
    },
    createdAt: '2026-09-23T00:00:00.000Z',
    updatedAt: '2026-09-23T00:00:00.000Z',
  } as ReviewItem;
}
