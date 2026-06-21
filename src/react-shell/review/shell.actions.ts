import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react';
import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemStatus,
  ReviewSource,
  WebReviewKitAdapter,
} from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { updateShellUrl } from '../route';
import type { ReviewShellViewportPreset } from '../types';
import type { SitemapItemsBySource } from '../hooks/use.review.shell.data';

interface ListReviewItemsOptions {
  activeRoute: string;
  adapter: WebReviewKitAdapter;
  isRemoteSource: boolean;
  pageId?: string;
  projectId: string;
}

interface ListSitemapReviewItemsOptions {
  localAdapterEntry: NormalizedReviewShellAdapter | null;
  projectId: string;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
}

interface CopyCurrentReviewUrlOptions {
  onCopyLabelChange: Dispatch<SetStateAction<string>>;
}

interface RefreshReviewItemsOptions extends ListReviewItemsOptions {
  onItemsChange: (items: ReviewItem[]) => void;
}

interface RefreshSitemapReviewItemsOptions
  extends ListSitemapReviewItemsOptions {
  onSitemapItemsChange: (items: SitemapItemsBySource) => void;
}

interface RefreshReviewDataOptions {
  onRefreshItems: () => Promise<ReviewItem[]>;
  onRefreshSitemapItems: () => Promise<void>;
  onReloadReviewKit: () => Promise<void>;
}

interface UpdateReviewItemStatusOptions {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  item: ReviewItem;
  nextStatus: ReviewItemStatus;
  onRefreshReviewData: () => Promise<void>;
}

interface SubmitReviewItemOptions {
  localAdapterEntry: NormalizedReviewShellAdapter | null;
  numberedItem: NumberedReviewItem;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  selectedItemIdRef: MutableRefObject<string | null>;
  onClearSelectedItem: () => void;
  onRefreshReviewData: () => Promise<void>;
}

interface CopyReviewPromptOptions {
  key: string;
  value: string;
  onCopiedPromptKeyChange: Dispatch<SetStateAction<string | null>>;
}

interface RemoveReviewItemOptions {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  isRemoteSource: boolean;
  item: ReviewItem;
  selectedItemIdRef: MutableRefObject<string | null>;
  sizeRef: MutableRefObject<ReviewShellViewportPreset>;
  source: ReviewSource;
  targetRef: MutableRefObject<string>;
  onClearSelectedItem: () => void;
  onRefreshReviewData: () => Promise<void>;
}

export const listReviewItems = async ({
  activeRoute,
  adapter,
  isRemoteSource,
  pageId,
  projectId,
}: ListReviewItemsOptions) =>
  adapter.list({
    projectId,
    pageId,
    routeKey: isRemoteSource ? activeRoute : undefined,
  });

export const listSitemapReviewItems = async ({
  localAdapterEntry,
  projectId,
  remoteAdapterEntry,
}: ListSitemapReviewItemsOptions): Promise<SitemapItemsBySource> => {
  const [localResult, remoteResult] = await Promise.allSettled([
    localAdapterEntry
      ? localAdapterEntry.adapter.list({
          projectId,
          pageId: localAdapterEntry.pageId,
        })
      : Promise.resolve([]),
    remoteAdapterEntry
      ? remoteAdapterEntry.adapter.list({
          projectId,
          pageId: remoteAdapterEntry.pageId,
          source: remoteAdapterEntry.label,
        })
      : Promise.resolve([]),
  ]);

  return {
    local: localResult.status === 'fulfilled' ? localResult.value : [],
    remote: remoteResult.status === 'fulfilled' ? remoteResult.value : [],
  };
};

export const refreshReviewItems = async ({
  onItemsChange,
  ...listOptions
}: RefreshReviewItemsOptions) => {
  const nextItems = await listReviewItems(listOptions);
  onItemsChange(nextItems);
  return nextItems;
};

export const refreshSitemapReviewItems = async ({
  onSitemapItemsChange,
  ...listOptions
}: RefreshSitemapReviewItemsOptions) => {
  const sitemapItems = await listSitemapReviewItems(listOptions);
  onSitemapItemsChange(sitemapItems);
};

export const copyCurrentReviewUrl = async ({
  onCopyLabelChange,
}: CopyCurrentReviewUrlOptions) => {
  await navigator.clipboard.writeText(window.location.href);
  onCopyLabelChange('Copied');
  window.setTimeout(() => onCopyLabelChange('Copy URL'), 1200);
};

export const refreshReviewData = async ({
  onRefreshItems,
  onRefreshSitemapItems,
  onReloadReviewKit,
}: RefreshReviewDataOptions) => {
  await onReloadReviewKit();
  await Promise.all([onRefreshItems(), onRefreshSitemapItems()]);
};

export const updateReviewItemStatus = async ({
  activeAdapterEntry,
  item,
  nextStatus,
  onRefreshReviewData,
}: UpdateReviewItemStatusOptions) => {
  if (!activeAdapterEntry.updateStatus) return;

  const statusIndex = activeAdapterEntry.statusOptions.findIndex(
    (statusOption) => statusOption.value === nextStatus
  );
  const statusOption = activeAdapterEntry.statusOptions[statusIndex];
  if (!statusOption) return;

  await activeAdapterEntry.updateStatus({
    id: item.id,
    item,
    status: statusOption.value,
    statusOption,
    statusIndex,
  });
  await onRefreshReviewData();
};

export const submitReviewItem = async ({
  localAdapterEntry,
  numberedItem,
  remoteAdapterEntry,
  selectedItemIdRef,
  onClearSelectedItem,
  onRefreshReviewData,
}: SubmitReviewItemOptions) => {
  const { item } = numberedItem;
  const syncLocalSubmission = localAdapterEntry?.syncSubmission;
  if (
    !remoteAdapterEntry ||
    !localAdapterEntry ||
    !syncLocalSubmission ||
    item.submitStatus === 'submitted'
  ) {
    return;
  }

  await syncLocalSubmission({
    id: item.id,
    item,
    patch: {
      submitStatus: 'submitting',
      submitError: undefined,
    },
  });
  await onRefreshReviewData();

  try {
    await remoteAdapterEntry.adapter.create({
      ...item,
      reviewNumber: undefined,
      externalIssueId: undefined,
      externalIssueUrl: undefined,
      submittedAt: undefined,
      submitStatus: 'submitted',
      submitError: undefined,
    });
    await localAdapterEntry.adapter.remove(item.id);
    if (selectedItemIdRef.current === item.id) {
      onClearSelectedItem();
    }
  } catch (error) {
    await syncLocalSubmission({
      id: item.id,
      item,
      patch: {
        submitStatus: 'failed',
        submitError:
          error instanceof Error ? error.message : 'Failed to submit remote',
      },
    });
  }

  await onRefreshReviewData();
};

export const copyReviewPrompt = async ({
  key,
  value,
  onCopiedPromptKeyChange,
}: CopyReviewPromptOptions) => {
  if (!value) return;

  await navigator.clipboard.writeText(value);
  onCopiedPromptKeyChange(key);
  window.setTimeout(() => {
    onCopiedPromptKeyChange((current) => (current === key ? null : current));
  }, 1200);
};

export const removeReviewItem = async ({
  activeAdapterEntry,
  isRemoteSource,
  item,
  selectedItemIdRef,
  sizeRef,
  source,
  targetRef,
  onClearSelectedItem,
  onRefreshReviewData,
}: RemoveReviewItemOptions) => {
  if (
    !activeAdapterEntry.canRemove ||
    item.submitStatus === 'submitting' ||
    (!isRemoteSource && item.submitStatus === 'submitted')
  ) {
    return;
  }

  await activeAdapterEntry.adapter.remove(item.id);
  if (selectedItemIdRef.current === item.id) {
    onClearSelectedItem();
    updateShellUrl(targetRef.current, sizeRef.current, source);
  }
  await onRefreshReviewData();
};
