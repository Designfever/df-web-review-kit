// QA 아이템 액션 훅. QA 패널 컨테이너에서 인스턴스화한다.
// 상태 변경/담당자/수정/제출/삭제 mutation 과 프롬프트·링크 복사 액션을 모은다.
// mutation 중인 아이템 id 집합(store)으로 UI 가 개별 스피너를 표시한다.
import { useCallback } from 'react';
import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemStatus,
} from '../../types';
import { buildReviewItemPrompt } from '../prompt/prompt';
import { getItemFrameTarget, getShellUrlForItem } from '../route';
import { useReviewShellConfig } from '../store/shell.config';
import {
  useReviewShellStore,
  useReviewShellStoreApi,
} from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
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
  onClearSelectedItem,
  onRefreshReviewData,
  onToast,
}: {
  onClearSelectedItem: () => void;
  onRefreshReviewData: () => Promise<void>;
  onToast: (message: string) => void;
}) {
  const { reviewPathPrefix, viewportPresets } = useReviewShellConfig();
  const {
    activeAdapterEntry,
    isRemoteSource,
    localAdapterEntry,
    remoteAdapterEntry,
    source,
  } = useReviewShellAdapterState();
  const storeApi = useReviewShellStoreApi();
  const mutatingItemIds = useReviewShellStore(
    (state) => state.mutatingItemIds
  );
  const editingItem = useReviewShellStore((state) => state.editingItem);
  const setEditingItem = useReviewShellStore((state) => state.setEditingItem);
  const setCopiedPromptKey = useReviewShellStore(
    (state) => state.setCopiedPromptKey
  );

  /** 액션 실행 동안 해당 아이템을 mutation 중으로 표시한다. */
  const withItemMutation = async <T,>(
    itemId: string,
    action: () => Promise<T>
  ) => {
    storeApi.getState().addMutatingItemId(itemId);

    try {
      return await action();
    } finally {
      storeApi.getState().removeMutatingItemId(itemId);
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
          getSelectedItemId: () => storeApi.getState().selectedItemId,
          localAdapterEntry,
          numberedItem,
          remoteAdapterEntry,
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
          getCurrentSize: () => storeApi.getState().size,
          getCurrentTarget: () => storeApi.getState().target,
          getSelectedItemId: () => storeApi.getState().selectedItemId,
          isRemoteSource,
          item,
          source,
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
      onCopiedPromptKeyChange: setCopiedPromptKey,
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

  const clearEditingItem = useCallback(
    () => setEditingItem(null),
    [setEditingItem]
  );

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
