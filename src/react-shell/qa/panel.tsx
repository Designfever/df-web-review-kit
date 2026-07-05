import {
  useEffect,
  useRef,
} from 'react';
import type {
  NumberedReviewItem,
  ReviewFieldsConfig,
  ReviewItem,
  ReviewItemStatus,
  ReviewSource,
} from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { QaItemCard } from './item.card';
import { QaPanelHeader } from './panel.header';
import type {
  ReviewQaStatusFilter,
  ReviewShellViewportKind,
} from '../types';

interface ReviewQaPanelProps {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  activeItems: ReviewItem[];
  activeRemainingItemCount: number;
  fields: Required<Pick<ReviewFieldsConfig, 'title'>>;
  assigneeTitle: string;
  currentPresetScope: ReviewShellViewportKind;
  filteredNumberedActiveItems: NumberedReviewItem[];
  getItemPresetScope: (item: ReviewItem) => ReviewShellViewportKind;
  hiddenOverlayItemIds: ReadonlySet<string>;
  isAllQaVisible: boolean;
  isListVisible: boolean;
  isLoading: boolean;
  isRemoteSource: boolean;
  mutatingItemIds: ReadonlySet<string>;
  copiedPromptKey: string | null;
  qaStatusFilters: readonly ReviewQaStatusFilter[];
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
  onChangeItemAssignee: (
    item: ReviewItem,
    assigneeId: string | null
  ) => Promise<void>;
  onClearSelectedItem: () => void;
  onChangeReviewSource: (nextSource: ReviewSource) => void;
  onCopyItemLabel: (numberedItem: NumberedReviewItem) => void;
  onCopyItemLink: (numberedItem: NumberedReviewItem) => void;
  onCopyItemPrompt: (numberedItem: NumberedReviewItem) => void;
  onCopyRemoteIssuePath: (item: ReviewItem) => Promise<void>;
  onEditItem: (item: ReviewItem) => void;
  onQaStatusFilterToggle: (filter: ReviewQaStatusFilter) => void;
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
  fields,
  assigneeTitle,
  currentPresetScope,
  filteredNumberedActiveItems,
  getItemPresetScope,
  hiddenOverlayItemIds,
  isAllQaVisible,
  isListVisible,
  isLoading,
  isRemoteSource,
  mutatingItemIds,
  copiedPromptKey,
  qaStatusFilters,
  qaStatusFilterCounts,
  remoteAdapterEntry,
  selectedItemId,
  showSourceSelect,
  source,
  sourceEntries,
  onChangeItemStatus,
  onChangeItemAssignee,
  onClearSelectedItem,
  onChangeReviewSource,
  onCopyItemLabel,
  onCopyItemLink,
  onCopyItemPrompt,
  onCopyRemoteIssuePath,
  onEditItem,
  onQaStatusFilterToggle,
  onRefreshReviewData,
  onRemoveItem,
  onRestoreReviewItem,
  onSubmitItem,
  onToggleItemOverlayVisibility,
}: ReviewQaPanelProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const emptyMessage = isAllQaVisible
    ? `No ${activeAdapterEntry.label} QA.`
    : isRemoteSource
      ? `No ${activeAdapterEntry.label} QA on this page.`
      : 'No QA on this page.';

  useEffect(() => {
    if (!isListVisible || !selectedItemId) return;

    const selectedCard = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>(
        '[data-review-qa-item-id]'
      ) ?? []
    ).find(
      (element) => element.dataset.reviewQaItemId === selectedItemId
    );
    selectedCard?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    selectedCard?.focus({ preventScroll: true });
  }, [filteredNumberedActiveItems, isListVisible, selectedItemId]);

  return (
    <aside className="df-review-qa-panel" aria-hidden={!isListVisible}>
      <div className="df-review-panel-body">
        <section className="df-review-item-list">
          <QaPanelHeader
            activeItemCount={activeItems.length}
            activeRemainingItemCount={activeRemainingItemCount}
            filteredItemCount={filteredNumberedActiveItems.length}
            isAllQaVisible={isAllQaVisible}
            isLoading={isLoading}
            label={activeAdapterEntry.label}
            qaStatusFilters={qaStatusFilters}
            qaStatusFilterCounts={qaStatusFilterCounts}
            showSourceSelect={showSourceSelect}
            source={source}
            sourceEntries={sourceEntries}
            statusOptions={activeAdapterEntry.statusOptions}
            onChangeReviewSource={onChangeReviewSource}
            onQaStatusFilterToggle={onQaStatusFilterToggle}
            onRefreshReviewData={onRefreshReviewData}
          />
          <div
            className="df-review-list-scroll"
            ref={listRef}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onClearSelectedItem();
              }
            }}
          >
            {activeItems.length === 0 && (
              <p
                className={`df-review-empty${isLoading ? ' is-loading' : ''}`}
              >
                {isLoading && (
                  <span className="df-review-spinner" aria-hidden="true" />
                )}
                <span>
                  {isLoading
                    ? `Loading ${activeAdapterEntry.label} QA...`
                    : emptyMessage}
                </span>
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
                  fields={fields}
                  assigneeTitle={assigneeTitle}
                  currentPresetScope={currentPresetScope}
                  getItemPresetScope={getItemPresetScope}
                  isOverlayVisible={!hiddenOverlayItemIds.has(item.id)}
                  isMutating={mutatingItemIds.has(item.id)}
                  isRemoteSource={isRemoteSource}
                  numberedItem={numberedItem}
                  remoteAdapterEntry={remoteAdapterEntry}
                  copiedPromptKey={copiedPromptKey}
                  selectedItemId={selectedItemId}
                  onChangeItemAssignee={onChangeItemAssignee}
                  onChangeItemStatus={onChangeItemStatus}
                  onClearSelectedItem={onClearSelectedItem}
                  onCopyItemLabel={onCopyItemLabel}
                  onCopyItemLink={onCopyItemLink}
                  onCopyItemPrompt={onCopyItemPrompt}
                  onCopyRemoteIssuePath={onCopyRemoteIssuePath}
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
      <div className="df-review-qa-draft-host" />
    </aside>
  );
};
