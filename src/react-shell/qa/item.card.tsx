import {
  Copy as CopyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  X as XIcon,
} from 'lucide-react';
import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemStatus,
} from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { getItemTitle } from '../prompt/prompt';
import { QaItemRemoteActions } from './item.remote.actions';
import { QaItemStatusActions } from './item.status.actions';
import {
  getReviewItemMode,
  ReviewItemModeIcon,
  ReviewScopeIcon,
} from '../review/item.icons';
import type { ReviewShellViewportKind } from '../types';

interface QaItemCardProps {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  currentPresetScope: ReviewShellViewportKind;
  getItemPresetScope: (item: ReviewItem) => ReviewShellViewportKind;
  isOverlayVisible: boolean;
  isRemoteSource: boolean;
  numberedItem: NumberedReviewItem;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  copiedPromptKey: string | null;
  selectedItemId: string | null;
  onChangeItemStatus: (
    item: ReviewItem,
    nextStatus: ReviewItemStatus
  ) => Promise<void>;
  onRemoveItem: (item: ReviewItem) => Promise<void>;
  onCopyItemPrompt: (numberedItem: NumberedReviewItem) => void;
  onRestoreReviewItem: (item: ReviewItem) => void;
  onSubmitItem: (numberedItem: NumberedReviewItem) => Promise<void>;
  onToggleItemOverlayVisibility: (itemId: string) => void;
}

const formatItemCardDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  }).format(date);
};

export const QaItemCard = ({
  activeAdapterEntry,
  currentPresetScope,
  getItemPresetScope,
  isOverlayVisible,
  isRemoteSource,
  numberedItem,
  remoteAdapterEntry,
  copiedPromptKey,
  selectedItemId,
  onChangeItemStatus,
  onRemoveItem,
  onCopyItemPrompt,
  onRestoreReviewItem,
  onSubmitItem,
  onToggleItemOverlayVisibility,
}: QaItemCardProps) => {
  const { item } = numberedItem;
  const itemMode = getReviewItemMode(item);
  const isSubmitted = item.submitStatus === 'submitted';
  const isSubmitting = item.submitStatus === 'submitting';
  const canRemoveItem =
    activeAdapterEntry.canRemove &&
    !isSubmitting &&
    (isRemoteSource || !isSubmitted);
  const itemComment = item.comment.trim() || getItemTitle(item);
  const itemAuthor = item.createdBy?.trim();
  const promptCopyKey = `qa:${item.id}`;
  const isPromptCopied = copiedPromptKey === promptCopyKey;
  const statusOptions = activeAdapterEntry.statusOptions;
  const canUpdateStatus =
    Boolean(activeAdapterEntry.updateStatus) &&
    statusOptions.length > 0 &&
    !isSubmitting;
  const itemMeta = [formatItemCardDate(item.createdAt), itemAuthor]
    .filter(Boolean)
    .join(' | ');

  return (
    <article
      className={`df-review-item-card${
        item.id === selectedItemId ? ' is-active' : ''
      }${
        getItemPresetScope(item) !== currentPresetScope ? ' is-dim' : ''
      }${isOverlayVisible ? '' : ' is-overlay-hidden'}`}
      onClick={() => onRestoreReviewItem(item)}
    >
      <div className="df-review-item-header">
        <div className="df-review-item-main">
          <span className="df-review-item-badges">
            <span className="df-review-item-id">
              {numberedItem.displayLabel}
            </span>
            <span
              className={`df-review-item-scope is-scope-${numberedItem.scope}`}
            >
              <ReviewScopeIcon scope={numberedItem.scope} />
              {numberedItem.label}
            </span>
            <span className={`df-review-item-mode is-mode-${itemMode}`}>
              <ReviewItemModeIcon mode={itemMode} />
              {itemMode}
            </span>
          </span>
          <strong className="df-review-item-comment">{itemComment}</strong>
          <small className="df-review-item-meta">{itemMeta}</small>
          {item.submitError && (
            <small className="df-review-item-error">{item.submitError}</small>
          )}
        </div>
        <div
          className="df-review-item-header-actions"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            aria-label={isOverlayVisible ? 'Hide QA overlay' : 'Show QA overlay'}
            className={`df-review-item-visibility${
              isOverlayVisible ? ' is-visible' : ' is-hidden'
            }`}
            type="button"
            onClick={() => onToggleItemOverlayVisibility(item.id)}
          >
            {isOverlayVisible ? (
              <EyeIcon aria-hidden="true" />
            ) : (
              <EyeOffIcon aria-hidden="true" />
            )}
          </button>
          <button
            aria-label={isPromptCopied ? 'Copied QA prompt' : 'Copy QA prompt'}
            className={`df-review-item-prompt-copy${
              isPromptCopied ? ' is-copied' : ''
            }`}
            title={isPromptCopied ? 'Copied QA prompt' : 'Copy QA prompt'}
            type="button"
            onClick={() => onCopyItemPrompt(numberedItem)}
          >
            <CopyIcon aria-hidden="true" />
          </button>
          {canRemoveItem && (
            <button
              aria-label="Delete QA"
              className="df-review-item-delete"
              type="button"
              onClick={() => void onRemoveItem(item)}
            >
              <XIcon aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="df-review-item-actions">
        <QaItemStatusActions
          canUpdateStatus={canUpdateStatus}
          item={item}
          statusOptions={statusOptions}
          onChangeItemStatus={onChangeItemStatus}
        />
        <QaItemRemoteActions
          isRemoteSource={isRemoteSource}
          isSubmitted={isSubmitted}
          isSubmitting={isSubmitting}
          item={item}
          numberedItem={numberedItem}
          remoteAdapterEntry={remoteAdapterEntry}
          onSubmitItem={onSubmitItem}
        />
      </div>
    </article>
  );
};
