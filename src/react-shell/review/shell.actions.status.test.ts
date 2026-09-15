import { describe, expect, it, vi } from 'vitest';
import type { ReviewItem } from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { updateReviewItemStatus } from './shell.actions';

const statusOptions = [
  { value: 'todo' as const, label: 'Todo' },
  { value: 'doing' as const, label: 'Doing' },
  { value: 'done' as const, label: 'Done' },
];

const item: ReviewItem = {
  id: 'local-item-1',
  projectId: 'project-1',
  routeKey: '/story',
  pageUrl: '/story',
  normalizedPath: '/story',
  kind: 'dom',
  comment: '완료 상태 동기화',
  status: 'doing',
  viewport: { width: 390, height: 844 },
  externalIssueId: 'df-sheet-issue-1',
  submitStatus: 'submitted',
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

const adapterEntry = (
  label: string,
  updateStatus: NormalizedReviewShellAdapter['updateStatus'],
  get = vi.fn(async () => item)
) =>
  ({
    label,
    statusOptions,
    updateStatus,
    adapter: { get },
  }) as unknown as NormalizedReviewShellAdapter;

describe('updateReviewItemStatus', () => {
  it('syncs a linked local completion to DF Sheet before updating local state', async () => {
    const callOrder: string[] = [];
    const localUpdate = vi.fn(async () => {
      callOrder.push('local');
    });
    const remoteUpdate = vi.fn(async () => {
      callOrder.push('remote');
    });
    const local = adapterEntry('local', localUpdate);
    const remoteItem = { ...item, id: 'df-sheet-issue-1' };
    const remoteGet = vi.fn(async () => remoteItem);
    const remote = adapterEntry('df-sheet', remoteUpdate, remoteGet);
    const refresh = vi.fn(async () => undefined);
    const toast = vi.fn();

    await updateReviewItemStatus({
      activeAdapterEntry: local,
      completionSyncAdapterEntry: remote,
      item,
      nextStatus: 'done',
      onRefreshReviewData: refresh,
      onToast: toast,
    });

    expect(callOrder).toEqual(['remote', 'local']);
    expect(remoteGet).toHaveBeenCalledWith('df-sheet-issue-1');
    expect(remoteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'df-sheet-issue-1',
        item: remoteItem,
        status: 'done',
      })
    );
    expect(localUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'local-item-1', status: 'done' })
    );
    expect(refresh).toHaveBeenCalledOnce();
    expect(toast).toHaveBeenCalledWith(
      'QA completed and synced to DF Sheet'
    );
  });

  it('does not update local state when the DF Sheet completion fails', async () => {
    const localUpdate = vi.fn(async () => undefined);
    const remoteUpdate = vi.fn(async () => {
      throw new Error('DF Sheet status update failed');
    });
    const refresh = vi.fn(async () => undefined);

    await expect(
      updateReviewItemStatus({
        activeAdapterEntry: adapterEntry('local', localUpdate),
        completionSyncAdapterEntry: adapterEntry('df-sheet', remoteUpdate),
        item,
        nextStatus: 'done',
        onRefreshReviewData: refresh,
      })
    ).rejects.toThrow('DF Sheet status update failed');

    expect(localUpdate).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('does not complete a linked local item when DF Sheet sync is unavailable', async () => {
    const localUpdate = vi.fn(async () => undefined);

    await expect(
      updateReviewItemStatus({
        activeAdapterEntry: adapterEntry('local', localUpdate),
        completionSyncAdapterEntry: null,
        item,
        nextStatus: 'done',
        onRefreshReviewData: vi.fn(async () => undefined),
      })
    ).rejects.toThrow('DF Sheet completion sync is unavailable');

    expect(localUpdate).not.toHaveBeenCalled();
  });

  it('keeps non-completion status changes in the active adapter', async () => {
    const localUpdate = vi.fn(async () => undefined);
    const remoteUpdate = vi.fn(async () => undefined);

    await updateReviewItemStatus({
      activeAdapterEntry: adapterEntry('local', localUpdate),
      completionSyncAdapterEntry: adapterEntry('df-sheet', remoteUpdate),
      item,
      nextStatus: 'todo',
      onRefreshReviewData: vi.fn(async () => undefined),
    });

    expect(localUpdate).toHaveBeenCalledOnce();
    expect(remoteUpdate).not.toHaveBeenCalled();
  });
});
