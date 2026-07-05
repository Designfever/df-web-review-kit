import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react';
import type {
  NumberedReviewItem,
  ReviewFieldsConfig,
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
  onToast?: (message: string) => void;
}

interface UpdateReviewItemAssigneeOptions {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  item: ReviewItem;
  assigneeId: string | null;
  onRefreshReviewData: () => Promise<void>;
  onToast?: (message: string) => void;
}

interface UpdateReviewItemDetailsOptions {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  fields: Required<Pick<ReviewFieldsConfig, 'title'>>;
  item: ReviewItem;
  title?: string;
  comment: string;
  onRefreshReviewData: () => Promise<void>;
  onToast?: (message: string) => void;
}

interface SubmitReviewItemOptions {
  localAdapterEntry: NormalizedReviewShellAdapter | null;
  numberedItem: NumberedReviewItem;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  selectedItemIdRef: MutableRefObject<string | null>;
  onClearSelectedItem: () => void;
  onRefreshReviewData: () => Promise<void>;
  onToast?: (message: string) => void;
}

interface CopyReviewPromptOptions {
  key: string;
  toastMessage?: string;
  value: string;
  onCopiedPromptKeyChange: Dispatch<SetStateAction<string | null>>;
  onToast?: (message: string) => void;
}

interface RemoveReviewItemOptions {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  getCurrentSize: () => ReviewShellViewportPreset;
  getCurrentTarget: () => string;
  isRemoteSource: boolean;
  item: ReviewItem;
  selectedItemIdRef: MutableRefObject<string | null>;
  source: ReviewSource;
  onClearSelectedItem: () => void;
  onRefreshReviewData: () => Promise<void>;
  onToast?: (message: string) => void;
}

const writeClipboardTextFallback = (value: string) => {
  const selection = document.getSelection();
  const activeElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) =>
        selection.getRangeAt(index)
      )
    : [];
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const isCopied = document.execCommand('copy');
  textarea.remove();

  selection?.removeAllRanges();
  ranges.forEach((range) => selection?.addRange(range));
  activeElement?.focus();

  if (!isCopied) {
    throw new Error('Failed to copy to clipboard');
  }
};

const writeClipboardText = async (value: string) => {
  try {
    writeClipboardTextFallback(value);
    return;
  } catch (error) {
    if (!navigator.clipboard?.writeText) {
      throw error;
    }
    await navigator.clipboard.writeText(value);
  }
};

const listReviewItems = async ({
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

const listSitemapReviewItems = async ({
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
  await writeClipboardText(window.location.href);
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
  onToast,
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
  onToast?.('QA status updated');
};

export const updateReviewItemAssignee = async ({
  activeAdapterEntry,
  item,
  assigneeId,
  onRefreshReviewData,
  onToast,
}: UpdateReviewItemAssigneeOptions) => {
  if (!activeAdapterEntry.updateAssignee) return;

  const assigneeIndex = activeAdapterEntry.assigneeOptions.findIndex(
    (assigneeOption) => assigneeOption.value === assigneeId
  );
  const assigneeOption = activeAdapterEntry.assigneeOptions[assigneeIndex];
  const nextAssigneeId =
    assigneeOption?.value ??
    (assigneeId && item.assigneeId === assigneeId ? assigneeId : null);
  const nextAssigneeName =
    assigneeOption?.label ??
    (nextAssigneeId ? item.assigneeName : undefined);

  if ((item.assigneeId ?? null) === nextAssigneeId) {
    onToast?.('No QA assignee changes');
    return item;
  }

  const updated = await activeAdapterEntry.updateAssignee({
    id: item.id,
    item,
    assigneeId: nextAssigneeId,
    assigneeName: nextAssigneeName,
    assigneeOption,
    assigneeIndex,
  });
  await onRefreshReviewData();
  onToast?.('QA assignee updated');
  return updated as ReviewItem;
};

export const updateReviewItemDetails = async ({
  activeAdapterEntry,
  fields,
  item,
  title,
  comment,
  onRefreshReviewData,
  onToast,
}: UpdateReviewItemDetailsOptions) => {
  const nextTitle = title?.trim() || undefined;
  const nextComment = comment.trim();
  if (!nextComment) throw new Error('Comment is required.');
  if (!activeAdapterEntry.canUpdate) {
    throw new Error(
      `Review adapter "${activeAdapterEntry.label}" does not support edit.`
    );
  }

  const isTitleUnchanged =
    !fields.title || nextTitle === (item.title?.trim() || undefined);
  const isUnchanged = isTitleUnchanged && nextComment === item.comment.trim();

  if (isUnchanged) {
    onToast?.('No QA changes');
    return item;
  }

  const updated = await activeAdapterEntry.adapter.update(item.id, {
    ...(fields.title ? { title: nextTitle } : {}),
    comment: nextComment,
  });
  await onRefreshReviewData();
  onToast?.('QA updated');
  return updated;
};

export const submitReviewItem = async ({
  localAdapterEntry,
  numberedItem,
  remoteAdapterEntry,
  selectedItemIdRef,
  onClearSelectedItem,
  onRefreshReviewData,
  onToast,
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

  let toastMessage: string;
  try {
    await remoteAdapterEntry.adapter.create({
      ...item,
      reviewNumber: undefined,
      externalLinks: undefined,
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
    toastMessage = 'Remote submitted';
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
    toastMessage = 'Remote submit failed';
  }

  await onRefreshReviewData();
  onToast?.(toastMessage);
};

export const copyReviewPrompt = async ({
  key,
  toastMessage = 'Copied',
  value,
  onCopiedPromptKeyChange,
  onToast,
}: CopyReviewPromptOptions) => {
  if (!value) return;

  await writeClipboardText(value);
  onCopiedPromptKeyChange(key);
  onToast?.(toastMessage);
  window.setTimeout(() => {
    onCopiedPromptKeyChange((current) => (current === key ? null : current));
  }, 1200);
};

export const removeReviewItem = async ({
  activeAdapterEntry,
  getCurrentSize,
  getCurrentTarget,
  isRemoteSource,
  item,
  selectedItemIdRef,
  source,
  onClearSelectedItem,
  onRefreshReviewData,
  onToast,
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
    updateShellUrl(getCurrentTarget(), getCurrentSize(), source);
  }
  await onRefreshReviewData();
  onToast?.('QA deleted');
};
