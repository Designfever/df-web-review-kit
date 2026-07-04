// shell.tsx 에서 분리한 QA 아이템 액션 훅.
// 상태 변경/담당자/수정/제출/삭제 mutation 과 프롬프트·링크 복사 액션을 모은다.
// mutation 중인 아이템 id 집합을 추적해 UI 가 개별 스피너를 표시할 수 있게 한다.
import {
  useCallback,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemStatus,
  ReviewSource,
} from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { buildReviewItemPrompt } from '../prompt/prompt';
import { getItemFrameTarget, getShellUrlForItem } from '../route';
import type { ReviewShellViewportPreset } from '../types';
import { getRestoredSize } from '../viewport';
import {
  copyReviewPrompt,
  removeReviewItem,
  submitReviewItem,
  updateReviewItemAssignee,
  updateReviewItemDetails,
  updateReviewItemStatus,
} from '../review/shell.actions';

export function useReviewItemActions({
  activeAdapterEntry,
  isRemoteSource,
  localAdapterEntry,
  remoteAdapterEntry,
  reviewPathPrefix,
  selectedItemIdRef,
  sizeRef,
  source,
  targetRef,
  viewportPresets,
  onClearSelectedItem,
  onCopiedPromptKeyChange,
  onRefreshReviewData,
  onToast,
}: {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  isRemoteSource: boolean;
  localAdapterEntry: NormalizedReviewShellAdapter | null;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  reviewPathPrefix: string;
  selectedItemIdRef: MutableRefObject<string | null>;
  sizeRef: MutableRefObject<ReviewShellViewportPreset>;
  source: ReviewSource;
  targetRef: MutableRefObject<string>;
  viewportPresets: ReviewShellViewportPreset[];
  onClearSelectedItem: () => void;
  onCopiedPromptKeyChange: Dispatch<SetStateAction<string | null>>;
  onRefreshReviewData: () => Promise<void>;
  onToast: (message: string) => void;
}) {
  const [mutatingItemIds, setMutatingItemIds] = useState<Set<string>>(
    () => new Set()
  );
  const [editingItem, setEditingItem] = useState<ReviewItem | null>(null);

  /** 액션 실행 동안 해당 아이템을 mutation 중으로 표시한다. */
  const withItemMutation = async <T,>(
    itemId: string,
    action: () => Promise<T>
  ) => {
    setMutatingItemIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(itemId);
      return nextIds;
    });

    try {
      return await action();
    } finally {
      setMutatingItemIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(itemId);
        return nextIds;
      });
    }
  };

  const showItemMutationError = (error: unknown, fallback: string) => {
    onToast(
      error instanceof Error && error.message ? error.message : fallback
    );
  };

  const changeItemStatus = async (
    item: ReviewItem,
    nextStatus: ReviewItemStatus
  ) => {
    try {
      await withItemMutation(item.id, () =>
        updateReviewItemStatus({
          activeAdapterEntry,
          item,
          nextStatus,
          onRefreshReviewData,
          onToast,
        })
      );
    } catch (error) {
      showItemMutationError(error, 'QA status update failed');
    }
  };

  const changeItemAssignee = async (
    item: ReviewItem,
    assigneeId: string | null
  ) => {
    try {
      await withItemMutation(item.id, () =>
        updateReviewItemAssignee({
          activeAdapterEntry,
          item,
          assigneeId,
          onRefreshReviewData,
          onToast,
        })
      );
    } catch (error) {
      showItemMutationError(error, 'QA assignee update failed');
    }
  };

  const saveItemDetails = async (
    item: ReviewItem,
    patch: Pick<ReviewItem, 'comment'> & Partial<Pick<ReviewItem, 'title'>>
  ) => {
    try {
      await withItemMutation(item.id, () =>
        updateReviewItemDetails({
          activeAdapterEntry,
          fields: activeAdapterEntry.fields,
          item,
          ...patch,
          onRefreshReviewData,
          onToast,
        })
      );
      setEditingItem(null);
    } catch (error) {
      showItemMutationError(error, 'QA update failed');
      // 수정 모달이 실패를 표시할 수 있게 다시 던진다.
      throw error;
    }
  };

  /** 로컬 draft 아이템을 원격 어댑터로 제출한다. */
  const submitItem = async (numberedItem: NumberedReviewItem) => {
    try {
      await withItemMutation(numberedItem.item.id, () =>
        submitReviewItem({
          localAdapterEntry,
          numberedItem,
          remoteAdapterEntry,
          selectedItemIdRef,
          onClearSelectedItem,
          onRefreshReviewData,
          onToast,
        })
      );
    } catch (error) {
      showItemMutationError(error, 'QA submit failed');
    }
  };

  const removeItem = async (item: ReviewItem) => {
    try {
      await withItemMutation(item.id, () =>
        removeReviewItem({
          activeAdapterEntry,
          isRemoteSource,
          item,
          selectedItemIdRef,
          sizeRef,
          source,
          targetRef,
          onClearSelectedItem,
          onRefreshReviewData,
          onToast,
        })
      );
    } catch (error) {
      showItemMutationError(error, 'QA delete failed');
    }
  };

  // --- 복사 액션: 복사된 key 를 잠시 기억해 버튼에 "Copied" 표시를 띄운다 ---

  const copyPrompt = (
    value: string,
    key: string,
    toastMessage = 'Prompt copied'
  ) =>
    copyReviewPrompt({
      key,
      toastMessage,
      value,
      onCopiedPromptKeyChange,
      onToast,
    });

  const copyItemPrompt = (numberedItem: NumberedReviewItem) =>
    copyPrompt(
      buildReviewItemPrompt(numberedItem, reviewPathPrefix),
      `qa:${numberedItem.item.id}`,
      'QA prompt copied'
    );

  const copyItemLabel = (numberedItem: NumberedReviewItem) =>
    copyPrompt(
      numberedItem.displayLabel,
      `label:${numberedItem.item.id}`,
      'QA number copied'
    );

  const copyItemLink = (numberedItem: NumberedReviewItem) => {
    const { item } = numberedItem;
    return copyPrompt(
      getShellUrlForItem(
        getItemFrameTarget(item, reviewPathPrefix),
        getRestoredSize(item, viewportPresets),
        item.id,
        source
      ).href,
      `link:${item.id}`,
      'QA link copied'
    );
  };

  const copyRemoteIssuePath = (item: ReviewItem) => {
    const path = getUrlPathWithoutOrigin(item.externalIssueUrl);
    if (!path) {
      onToast('QA link not found');
      return Promise.resolve();
    }

    return copyPrompt(path, `remote-link:${item.id}`, 'QA path copied');
  };

  const clearEditingItem = useCallback(() => setEditingItem(null), []);

  return {
    changeItemAssignee,
    changeItemStatus,
    clearEditingItem,
    copyItemLabel,
    copyItemLink,
    copyItemPrompt,
    copyPrompt,
    copyRemoteIssuePath,
    editingItem,
    mutatingItemIds,
    removeItem,
    saveItemDetails,
    setEditingItem,
    submitItem,
  };
}

/** 원격 이슈 URL 에서 origin 을 뗀 경로만 복사용으로 돌려준다. */
function getUrlPathWithoutOrigin(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return trimmed;
  }
}
