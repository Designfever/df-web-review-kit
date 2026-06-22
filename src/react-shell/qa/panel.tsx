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
  ReviewShellViewportKind,
} from '../types';

interface ReviewQaPanelProps {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  activeItems: ReviewItem[];
  currentPagePresenceUsers: ReviewPresenceUser[];
  currentPresetScope: ReviewShellViewportKind;
  filteredNumberedActiveItems: NumberedReviewItem[];
  getItemPresetScope: (item: ReviewItem) => ReviewShellViewportKind;
  hiddenOverlayItemIds: ReadonlySet<string>;
  isListVisible: boolean;
  isRemoteSource: boolean;
  presenceSessionId: string;
  copiedPromptKey: string | null;
  qaFilter: ReviewQaFilter;
  qaFilterCounts: ReadonlyMap<ReviewQaFilter, number>;
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
  onCopyItemPrompt: (numberedItem: NumberedReviewItem) => void;
  onQaFilterChange: (filter: ReviewQaFilter) => void;
  onRefreshReviewData: () => Promise<void>;
  onRemoveItem: (item: ReviewItem) => Promise<void>;
  onRestoreReviewItem: (item: ReviewItem) => void;
  onSubmitItem: (numberedItem: NumberedReviewItem) => Promise<void>;
  onToggleItemOverlayVisibility: (itemId: string) => void;
}

export const ReviewQaPanel = ({
  activeAdapterEntry,
  activeItems,
  currentPagePresenceUsers,
  currentPresetScope,
  filteredNumberedActiveItems,
  getItemPresetScope,
  hiddenOverlayItemIds,
  isListVisible,
  isRemoteSource,
  presenceSessionId,
  copiedPromptKey,
  qaFilter,
  qaFilterCounts,
  remoteAdapterEntry,
  selectedItemId,
  showSourceSelect,
  source,
  sourceEntries,
  onChangeItemStatus,
  onClearSelectedItem,
  onChangeReviewSource,
  onCopyItemPrompt,
  onQaFilterChange,
  onRefreshReviewData,
  onRemoveItem,
  onRestoreReviewItem,
  onSubmitItem,
  onToggleItemOverlayVisibility,
}: ReviewQaPanelProps) => {
  return (
    <aside className="df-review-qa-panel" aria-hidden={!isListVisible}>
      <div className="df-review-panel-body">
        <section className="df-review-item-list">
          <QaPanelHeader
            activeItemCount={activeItems.length}
            currentPagePresenceUsers={currentPagePresenceUsers}
            filteredItemCount={filteredNumberedActiveItems.length}
            label={activeAdapterEntry.label}
            presenceSessionId={presenceSessionId}
            qaFilter={qaFilter}
            qaFilterCounts={qaFilterCounts}
            showSourceSelect={showSourceSelect}
            source={source}
            sourceEntries={sourceEntries}
            onChangeReviewSource={onChangeReviewSource}
            onQaFilterChange={onQaFilterChange}
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
              <p className="df-review-empty">
                {isRemoteSource
                  ? `No ${activeAdapterEntry.label} QA on this page.`
                  : 'No QA on this page.'}
              </p>
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
                  onCopyItemPrompt={onCopyItemPrompt}
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
