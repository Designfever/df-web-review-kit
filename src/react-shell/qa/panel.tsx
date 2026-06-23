import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemStatus,
  ReviewSource,
} from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { QaItemCard } from './item.card';
import { QaPanelHeader } from './panel.header';
import type {
  ReviewPresenceUser,
  ReviewQaFilter,
  ReviewQaStatusFilter,
  ReviewShellViewportKind,
} from '../types';

interface ReviewQaPanelProps {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  activeItems: ReviewItem[];
  activeRemainingItemCount: number;
  currentPagePresenceUsers: ReviewPresenceUser[];
  currentPresetScope: ReviewShellViewportKind;
  filteredNumberedActiveItems: NumberedReviewItem[];
  getItemPresetScope: (item: ReviewItem) => ReviewShellViewportKind;
  hiddenOverlayItemIds: ReadonlySet<string>;
  isAllQaVisible: boolean;
  isListVisible: boolean;
  isRemoteSource: boolean;
  presenceSessionId: string;
  copiedPromptKey: string | null;
  qaFilter: ReviewQaFilter;
  qaFilterCounts: ReadonlyMap<ReviewQaFilter, number>;
  qaStatusFilter: ReviewQaStatusFilter;
  qaStatusFilterCounts: ReadonlyMap<ReviewQaStatusFilter, number>;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  selectedItemId: string | null;
  showSourceSelect: boolean;
  source: ReviewSource;
  sourceEntries: NormalizedReviewShellAdapter[];
  onChangeItemStatus: (
    item: ReviewItem,
    nextStatus: ReviewItemStatus
  ) => Promise<void>;
  onClearSelectedItem: () => void;
  onChangeReviewSource: (nextSource: ReviewSource) => void;
  onCopyItemLink: (numberedItem: NumberedReviewItem) => void;
  onCopyItemPrompt: (numberedItem: NumberedReviewItem) => void;
  onEditItem: (item: ReviewItem) => void;
  onQaFilterChange: (filter: ReviewQaFilter) => void;
  onQaStatusFilterChange: (filter: ReviewQaStatusFilter) => void;
  onRefreshReviewData: () => Promise<void>;
  onRemoveItem: (item: ReviewItem) => Promise<void>;
  onRestoreReviewItem: (item: ReviewItem) => void;
  onSubmitItem: (numberedItem: NumberedReviewItem) => Promise<void>;
  onToggleItemOverlayVisibility: (itemId: string) => void;
}

export const ReviewQaPanel = ({
  activeAdapterEntry,
  activeItems,
  activeRemainingItemCount,
  currentPagePresenceUsers,
  currentPresetScope,
  filteredNumberedActiveItems,
  getItemPresetScope,
  hiddenOverlayItemIds,
  isAllQaVisible,
  isListVisible,
  isRemoteSource,
  presenceSessionId,
  copiedPromptKey,
  qaFilter,
  qaFilterCounts,
  qaStatusFilter,
  qaStatusFilterCounts,
  remoteAdapterEntry,
  selectedItemId,
  showSourceSelect,
  source,
  sourceEntries,
  onChangeItemStatus,
  onClearSelectedItem,
  onChangeReviewSource,
  onCopyItemLink,
  onCopyItemPrompt,
  onEditItem,
  onQaFilterChange,
  onQaStatusFilterChange,
  onRefreshReviewData,
  onRemoveItem,
  onRestoreReviewItem,
  onSubmitItem,
  onToggleItemOverlayVisibility,
}: ReviewQaPanelProps) => {
  const emptyMessage = isAllQaVisible
    ? `No ${activeAdapterEntry.label} QA.`
    : isRemoteSource
      ? `No ${activeAdapterEntry.label} QA on this page.`
      : 'No QA on this page.';

  return (
    <aside className="df-review-qa-panel" aria-hidden={!isListVisible}>
      <div className="df-review-panel-body">
        <section className="df-review-item-list">
          <QaPanelHeader
            activeItemCount={activeItems.length}
            activeRemainingItemCount={activeRemainingItemCount}
            currentPagePresenceUsers={currentPagePresenceUsers}
            filteredItemCount={filteredNumberedActiveItems.length}
            isAllQaVisible={isAllQaVisible}
            label={activeAdapterEntry.label}
            presenceSessionId={presenceSessionId}
            qaFilter={qaFilter}
            qaFilterCounts={qaFilterCounts}
            qaStatusFilter={qaStatusFilter}
            qaStatusFilterCounts={qaStatusFilterCounts}
            showSourceSelect={showSourceSelect}
            source={source}
            sourceEntries={sourceEntries}
            statusOptions={activeAdapterEntry.statusOptions}
            onChangeReviewSource={onChangeReviewSource}
            onQaFilterChange={onQaFilterChange}
            onQaStatusFilterChange={onQaStatusFilterChange}
            onRefreshReviewData={onRefreshReviewData}
          />
          <div
            className="df-review-list-scroll"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onClearSelectedItem();
              }
            }}
          >
            {activeItems.length === 0 && (
              <p className="df-review-empty">{emptyMessage}</p>
            )}
            {activeItems.length > 0 &&
              filteredNumberedActiveItems.length === 0 && (
                <p className="df-review-empty">No QA in this filter.</p>
              )}
            {filteredNumberedActiveItems.map((numberedItem) => {
              const { item } = numberedItem;

              return (
                <QaItemCard
                  key={item.id}
                  activeAdapterEntry={activeAdapterEntry}
                  currentPresetScope={currentPresetScope}
                  getItemPresetScope={getItemPresetScope}
                  isOverlayVisible={!hiddenOverlayItemIds.has(item.id)}
                  isRemoteSource={isRemoteSource}
                  numberedItem={numberedItem}
                  remoteAdapterEntry={remoteAdapterEntry}
                  copiedPromptKey={copiedPromptKey}
                  selectedItemId={selectedItemId}
                  onChangeItemStatus={onChangeItemStatus}
                  onClearSelectedItem={onClearSelectedItem}
                  onCopyItemLink={onCopyItemLink}
                  onCopyItemPrompt={onCopyItemPrompt}
                  onEditItem={onEditItem}
                  onRemoveItem={onRemoveItem}
                  onRestoreReviewItem={onRestoreReviewItem}
                  onSubmitItem={onSubmitItem}
                  onToggleItemOverlayVisibility={onToggleItemOverlayVisibility}
                />
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
};
