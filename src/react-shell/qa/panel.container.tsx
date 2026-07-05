// QA 패널 feature container. store/config 를 selector 로 읽고
// presentational 컴포넌트(ReviewQaPanel/QaItemEditModal)에 좁은 props 를 내려준다.
// 컨트롤러/셸 결합 액션(restore/refresh/toast 등)만 셸에서 props 로 받는다.
import { useReviewItemActions } from '../hooks/use.review.item.actions';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import { QaItemEditModal } from './item.edit.modal';
import { ReviewQaPanel } from './panel';
import { useReviewQaPanelData } from './use.review.qa.panel.data';

export const QaPanelContainer = () => {
  const {
    changeReviewSource,
    clearSelectedReviewItem,
    refreshReviewData,
    restoreReviewItem,
  } = useReviewShellActions();
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
  const qaStatusFilters = useReviewShellStore((state) => state.qaStatusFilters);
  const copiedPromptKey = useReviewShellStore(
    (state) => state.copiedPromptKey
  );
  const toggleHiddenOverlayItemId = useReviewShellStore(
    (state) => state.toggleHiddenOverlayItemId
  );
  const isListVisible = useReviewShellStore(
    (state) => state.isListVisible && state.sidePanel === 'qa'
  );

  const {
    activeItems,
    activeRemainingItemCount,
    currentPresetScope,
    filteredNumberedActiveItems,
    getItemPresetScope,
    qaStatusFilterCounts,
    toggleQaStatusFilter,
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
    onClearSelectedItem: clearSelectedReviewItem,
    onRefreshReviewData: refreshReviewData,
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
        qaStatusFilters={qaStatusFilters}
        qaStatusFilterCounts={qaStatusFilterCounts}
        remoteAdapterEntry={remoteAdapterEntry}
        selectedItemId={selectedItemId}
        showSourceSelect={showSourceSelect}
        source={source}
        sourceEntries={sourceEntries}
        fields={activeAdapterEntry.fields}
        assigneeTitle={activeAdapterEntry.assigneeTitle}
        onChangeItemStatus={changeItemStatus}
        onClearSelectedItem={clearSelectedReviewItem}
        onChangeItemAssignee={changeItemAssignee}
        onChangeReviewSource={changeReviewSource}
        onCopyItemLabel={(numberedItem) => void copyItemLabel(numberedItem)}
        onCopyItemLink={(numberedItem) => void copyItemLink(numberedItem)}
        onCopyItemPrompt={(numberedItem) => void copyItemPrompt(numberedItem)}
        onCopyRemoteIssuePath={copyRemoteIssuePath}
        onEditItem={setEditingItem}
        onQaStatusFilterToggle={toggleQaStatusFilter}
        onRefreshReviewData={refreshReviewData}
        onRemoveItem={removeItem}
        onRestoreReviewItem={restoreReviewItem}
        onSubmitItem={submitItem}
        onToggleItemOverlayVisibility={toggleHiddenOverlayItemId}
      />
    </>
  );
};
