// QA 패널 feature container. store/config 를 selector 로 읽고
// presentational 컴포넌트(ReviewQaPanel/QaItemEditModal)에 좁은 props 를 내려준다.
// 컨트롤러/셸 결합 액션(restore/refresh/toast 등)만 셸에서 props 로 받는다.
import type { ReviewItem } from '../../types';
import { useReviewItemActions } from '../hooks/use.review.item.actions';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import type { ReviewSource } from '../../types';
import { QaItemEditModal } from './item.edit.modal';
import { ReviewQaPanel } from './panel';
import { useReviewQaPanelData } from './use.review.qa.panel.data';

interface QaPanelContainerProps {
  isListVisible: boolean;
  onChangeReviewSource: (nextSource: ReviewSource) => void;
  onClearSelectedItem: () => void;
  onRefreshReviewData: () => Promise<void>;
  onRestoreReviewItem: (item: ReviewItem) => void;
  onToast: (message: string) => void;
}

export const QaPanelContainer = ({
  isListVisible,
  onChangeReviewSource,
  onClearSelectedItem,
  onRefreshReviewData,
  onRestoreReviewItem,
  onToast,
}: QaPanelContainerProps) => {
  const {
    activeAdapterEntry,
    isRemoteSource,
    remoteAdapterEntry,
    showSourceSelect,
    source,
    sourceEntries,
  } = useReviewShellAdapterState();
  const hiddenOverlayItemIds = useReviewShellStore(
    (state) => state.hiddenOverlayItemIds
  );
  const selectedItemId = useReviewShellStore((state) => state.selectedItemId);
  const isAllQaVisible = useReviewShellStore((state) => state.isAllQaVisible);
  const isItemsLoading = useReviewShellStore((state) => state.isItemsLoading);
  const qaFilter = useReviewShellStore((state) => state.qaFilter);
  const qaStatusFilter = useReviewShellStore((state) => state.qaStatusFilter);
  const copiedPromptKey = useReviewShellStore(
    (state) => state.copiedPromptKey
  );
  const setQaFilter = useReviewShellStore((state) => state.setQaFilter);
  const toggleHiddenOverlayItemId = useReviewShellStore(
    (state) => state.toggleHiddenOverlayItemId
  );

  const {
    activeItems,
    activeRemainingItemCount,
    currentPresetScope,
    filteredNumberedActiveItems,
    getItemPresetScope,
    qaFilterCounts,
    qaStatusFilterCounts,
    setQaStatusFilter,
  } = useReviewQaPanelData();

  const {
    changeItemAssignee,
    changeItemStatus,
    clearEditingItem,
    copyItemLabel,
    copyItemLink,
    copyItemPrompt,
    copyRemoteIssuePath,
    editingItem,
    mutatingItemIds,
    removeItem,
    saveItemDetails,
    setEditingItem,
    submitItem,
  } = useReviewItemActions({
    onClearSelectedItem,
    onRefreshReviewData,
    onToast,
  });

  return (
    <>
      {editingItem && (
        <QaItemEditModal
          fields={activeAdapterEntry.fields}
          item={editingItem}
          onClose={clearEditingItem}
          onSave={saveItemDetails}
        />
      )}

      <ReviewQaPanel
        activeAdapterEntry={activeAdapterEntry}
        activeItems={activeItems}
        activeRemainingItemCount={activeRemainingItemCount}
        currentPresetScope={currentPresetScope}
        filteredNumberedActiveItems={filteredNumberedActiveItems}
        getItemPresetScope={getItemPresetScope}
        hiddenOverlayItemIds={hiddenOverlayItemIds}
        isListVisible={isListVisible}
        isAllQaVisible={isAllQaVisible}
        isLoading={isItemsLoading}
        isRemoteSource={isRemoteSource}
        mutatingItemIds={mutatingItemIds}
        copiedPromptKey={copiedPromptKey}
        qaFilter={qaFilter}
        qaFilterCounts={qaFilterCounts}
        qaStatusFilter={qaStatusFilter}
        qaStatusFilterCounts={qaStatusFilterCounts}
        remoteAdapterEntry={remoteAdapterEntry}
        selectedItemId={selectedItemId}
        showSourceSelect={showSourceSelect}
        source={source}
        sourceEntries={sourceEntries}
        fields={activeAdapterEntry.fields}
        assigneeTitle={activeAdapterEntry.assigneeTitle}
        onChangeItemStatus={changeItemStatus}
        onClearSelectedItem={onClearSelectedItem}
        onChangeItemAssignee={changeItemAssignee}
        onChangeReviewSource={onChangeReviewSource}
        onCopyItemLabel={(numberedItem) => void copyItemLabel(numberedItem)}
        onCopyItemLink={(numberedItem) => void copyItemLink(numberedItem)}
        onCopyItemPrompt={(numberedItem) => void copyItemPrompt(numberedItem)}
        onCopyRemoteIssuePath={copyRemoteIssuePath}
        onEditItem={setEditingItem}
        onQaFilterChange={setQaFilter}
        onQaStatusFilterChange={setQaStatusFilter}
        onRefreshReviewData={onRefreshReviewData}
        onRemoveItem={removeItem}
        onRestoreReviewItem={onRestoreReviewItem}
        onSubmitItem={submitItem}
        onToggleItemOverlayVisibility={toggleHiddenOverlayItemId}
      />
    </>
  );
};
