import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReviewItemSummary, WebReviewKitAdapter } from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import type { ReviewShellStore } from '../store/create.review.shell.store';
import { useReviewShellRefresh } from './use.review.shell.refresh';

const summary: ReviewItemSummary = {
  id: 'summary-1',
  routeKey: '/about/',
  scope: 'dom',
  status: 'todo',
  viewport: { width: 390, height: 844 },
};

const createAdapter = (listSummary: WebReviewKitAdapter['listSummary']) =>
  ({
    get: vi.fn(),
    list: vi.fn(),
    listSummary,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }) as unknown as WebReviewKitAdapter;

const createEntry = (adapter: WebReviewKitAdapter) =>
  ({
    label: 'supabase',
    adapter,
    fields: { title: true },
    statusOptions: [],
    assigneeTitle: 'Assignee',
    assigneeOptions: [],
    defaultUserId: '',
    writeModes: [],
    canUpdate: true,
    canRemove: true,
  }) as NormalizedReviewShellAdapter;

describe('useReviewShellRefresh sitemap loading', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('does not query while closed and reuses the first open result', async () => {
    const listSummary = vi.fn().mockResolvedValue([summary]);
    const adapter = createAdapter(listSummary);
    const entry = createEntry(adapter);
    const state = {
      allQaItems: { local: [], remote: [] },
      setAllQaItems: vi.fn(),
      setIsItemsLoading: vi.fn(),
      setSitemapItems: vi.fn(),
    };
    const storeApi = {
      getState: () => state,
    } as unknown as ReviewShellStore;
    let invalidateSitemapItems: (() => void) | undefined;

    const Harness = ({ isOpen }: { isOpen: boolean }) => {
      ({ invalidateSitemapItems } = useReviewShellRefresh({
        activeAdapterEntry: entry,
        isAllQaVisible: false,
        isRemoteSource: true,
        isSitemapOpen: isOpen,
        localAdapterEntry: null,
        projectId: 'project-1',
        remoteAdapterEntry: entry,
        storeApi,
      }));
      return null;
    };

    await act(async () => {
      root.render(
        <StrictMode>
          <Harness isOpen={false} />
        </StrictMode>
      );
    });
    expect(listSummary).not.toHaveBeenCalled();

    await act(async () => {
      root.render(
        <StrictMode>
          <Harness isOpen />
        </StrictMode>
      );
    });
    expect(listSummary).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.render(
        <StrictMode>
          <Harness isOpen={false} />
        </StrictMode>
      );
      root.render(
        <StrictMode>
          <Harness isOpen />
        </StrictMode>
      );
    });
    expect(listSummary).toHaveBeenCalledTimes(1);
    expect(adapter.list).not.toHaveBeenCalled();

    act(() => invalidateSitemapItems?.());
    await act(async () => {
      root.render(
        <StrictMode>
          <Harness isOpen={false} />
        </StrictMode>
      );
    });
    await act(async () => {
      root.render(
        <StrictMode>
          <Harness isOpen />
        </StrictMode>
      );
    });
    expect(listSummary).toHaveBeenCalledTimes(2);
  });
});
