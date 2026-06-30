import {
  Bot as BotIcon,
  Copy as CopyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Link2 as Link2Icon,
  Pencil as PencilIcon,
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
import type {
  ReviewShellViewportKind,
} from '../types';

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
  onClearSelectedItem: () => void;
  onRemoveItem: (item: ReviewItem) => Promise<void>;
  onCopyItemLabel: (numberedItem: NumberedReviewItem) => void;
  onCopyItemLink: (numberedItem: NumberedReviewItem) => void;
  onCopyItemPrompt: (numberedItem: NumberedReviewItem) => void;
  onCopyRemoteIssuePath: (item: ReviewItem) => Promise<void>;
  onEditItem: (item: ReviewItem) => void;
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
  onClearSelectedItem,
  onRemoveItem,
  onCopyItemLabel,
  onCopyItemLink,
  onCopyItemPrompt,
  onCopyRemoteIssuePath,
  onEditItem,
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
  const labelCopyKey = `label:${item.id}`;
  const linkCopyKey = `link:${item.id}`;
  const remoteIssueCopyKey = `remote-link:${item.id}`;
  const isPromptCopied = copiedPromptKey === promptCopyKey;
  const isLabelCopied = copiedPromptKey === labelCopyKey;
  const isLinkCopied = copiedPromptKey === linkCopyKey;
  const isRemoteIssueCopied = copiedPromptKey === remoteIssueCopyKey;
  const statusOptions = activeAdapterEntry.statusOptions;
  const isActive = item.id === selectedItemId;
  const canUpdateStatus =
    Boolean(activeAdapterEntry.updateStatus) &&
    statusOptions.length > 0 &&
    !isSubmitting;
  const canEditItem = activeAdapterEntry.canUpdate && !isSubmitting;
  const itemMeta = [formatItemCardDate(item.createdAt), itemAuthor]
    .filter(Boolean)
    .join(' | ');

  return (
    <article
      className={`df-review-item-card${isActive ? ' is-active' : ''}${
        getItemPresetScope(item) !== currentPresetScope ? ' is-dim' : ''
      }${isOverlayVisible ? '' : ' is-overlay-hidden'}`}
      onClick={() => {
        if (isActive) {
          onClearSelectedItem();
          return;
        }

        onRestoreReviewItem(item);
      }}
    >
      <div className="df-review-item-header">
        <div className="df-review-item-main">
          <span className="df-review-item-badges">
            <button
              aria-label={
                isLabelCopied ? 'Copied QA number' : 'Copy QA number'
              }
              className={`df-review-item-id${
                isLabelCopied ? ' is-copied' : ''
              }`}
              title={isLabelCopied ? 'Copied QA number' : 'Copy QA number'}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCopyItemLabel(numberedItem);
              }}
            >
              {numberedItem.displayLabel}
            </button>
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
            aria-label={isLinkCopied ? 'Copied QA link' : 'Copy QA link'}
            className={`df-review-item-link-copy${
              isLinkCopied ? ' is-copied' : ''
            }`}
            title={isLinkCopied ? 'Copied QA link' : 'Copy QA link'}
            type="button"
            onClick={() => onCopyItemLink(numberedItem)}
          >
            <Link2Icon aria-hidden="true" />
          </button>
          {canEditItem && (
            <button
              aria-label="Edit QA comment"
              className="df-review-item-edit"
              title="Edit QA comment"
              type="button"
              onClick={() => onEditItem(item)}
            >
              <PencilIcon aria-hidden="true" />
            </button>
          )}
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
        <div
          className="df-review-item-prompt-actions"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            aria-label={isPromptCopied ? 'Copied QA prompt' : 'Copy QA prompt'}
            className={`df-review-item-action-button df-review-item-prompt-copy${
              isPromptCopied ? ' is-copied' : ''
            }`}
            title={isPromptCopied ? 'Copied QA prompt' : 'Copy QA prompt'}
            type="button"
            onClick={() => onCopyItemPrompt(numberedItem)}
          >
            {isPromptCopied ? (
              <CopyIcon aria-hidden="true" />
            ) : (
              <BotIcon aria-hidden="true" />
            )}
          </button>
        </div>
        <QaItemRemoteActions
          isRemoteSource={isRemoteSource}
          isSubmitted={isSubmitted}
          isSubmitting={isSubmitting}
          item={item}
          isRemoteIssueCopied={isRemoteIssueCopied}
          numberedItem={numberedItem}
          remoteAdapterEntry={remoteAdapterEntry}
          onCopyRemoteIssuePath={onCopyRemoteIssuePath}
          onSubmitItem={onSubmitItem}
        />
      </div>
    </article>
  );
};
