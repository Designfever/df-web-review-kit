import {
  Copy as CopyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  FileCode2 as FileCode2Icon,
  Pencil as PencilIcon,
  RefreshCw as RefreshCwIcon,
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
import { getSourceOpenUrl } from '../source.open';
import type {
  ReviewAnchorBindingStatus,
  ReviewSourceInspectorOptions,
  ReviewShellViewportKind,
} from '../types';

interface QaItemCardProps {
  activeAdapterEntry: NormalizedReviewShellAdapter;
  currentPresetScope: ReviewShellViewportKind;
  getItemPresetScope: (item: ReviewItem) => ReviewShellViewportKind;
  isOverlayVisible: boolean;
  isRemoteSource: boolean;
  numberedItem: NumberedReviewItem;
  anchorStatus?: ReviewAnchorBindingStatus;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  copiedPromptKey: string | null;
  selectedItemId: string | null;
  sourceRoot?: string;
  sourceInspectorOptions?: ReviewSourceInspectorOptions;
  onChangeItemStatus: (
    item: ReviewItem,
    nextStatus: ReviewItemStatus
  ) => Promise<void>;
  onClearSelectedItem: () => void;
  onRemoveItem: (item: ReviewItem) => Promise<void>;
  onCopyItemPrompt: (numberedItem: NumberedReviewItem) => void;
  onEditItem: (item: ReviewItem) => void;
  onRebindAnchor: (item: ReviewItem) => void;
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

const getCardAnchorCandidates = (item: ReviewItem) => {
  const anchor = item.anchor;
  if (!anchor) return [];

  const seen = new Set<string>();
  return [anchor, ...(anchor.candidates ?? [])].filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const getAnchorStateLabel = (
  state: ReviewAnchorBindingStatus['state']
) => {
  if (state === 'bound') return 'Anchor bound';
  if (state === 'fallback') return 'Using fallback';
  return 'No anchor';
};

const formatAnchorConfidence = (value?: number) =>
  typeof value === 'number' ? `${Math.round(value * 100)}%` : undefined;

export const QaItemCard = ({
  activeAdapterEntry,
  currentPresetScope,
  getItemPresetScope,
  isOverlayVisible,
  isRemoteSource,
  numberedItem,
  anchorStatus,
  remoteAdapterEntry,
  copiedPromptKey,
  selectedItemId,
  sourceRoot,
  sourceInspectorOptions,
  onChangeItemStatus,
  onClearSelectedItem,
  onRemoveItem,
  onCopyItemPrompt,
  onEditItem,
  onRebindAnchor,
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
  const isActive = item.id === selectedItemId;
  const canUpdateStatus =
    Boolean(activeAdapterEntry.updateStatus) &&
    statusOptions.length > 0 &&
    !isSubmitting;
  const canEditItem = activeAdapterEntry.canUpdate && !isSubmitting;
  const itemMeta = [formatItemCardDate(item.createdAt), itemAuthor]
    .filter(Boolean)
    .join(' | ');
  const sourceOpenUrl =
    sourceInspectorOptions?.enabled === false
      ? null
      : getSourceOpenUrl(item.anchor?.source, {
          ...sourceInspectorOptions,
          sourceRoot,
        });
  const anchorCandidates = getCardAnchorCandidates(item);
  const hasAnchorMeta = Boolean(item.anchor);
  const normalizedAnchorStatus: ReviewAnchorBindingStatus = anchorStatus ?? {
    candidates: anchorCandidates,
    confidence: item.anchor?.confidence,
    selector: item.anchor?.selector,
    state: hasAnchorMeta ? 'missing' : 'missing',
  };
  const anchorConfidenceLabel = formatAnchorConfidence(
    normalizedAnchorStatus.confidence
  );
  const canRebindAnchor =
    activeAdapterEntry.canUpdate && hasAnchorMeta && !isSubmitting;

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
          {hasAnchorMeta && (
            <div
              className={`df-review-item-anchor is-${normalizedAnchorStatus.state}`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="df-review-item-anchor-head">
                <strong>
                  {getAnchorStateLabel(normalizedAnchorStatus.state)}
                </strong>
                {anchorConfidenceLabel && <span>{anchorConfidenceLabel}</span>}
                {canRebindAnchor && (
                  <button
                    type="button"
                    onClick={() => onRebindAnchor(item)}
                  >
                    <RefreshCwIcon aria-hidden="true" />
                    Rebind
                  </button>
                )}
              </div>
              <code>
                {normalizedAnchorStatus.selector ?? item.anchor?.selector}
              </code>
              {anchorCandidates.length > 0 && (
                <div className="df-review-item-anchor-candidates">
                  {anchorCandidates.slice(0, 5).map((candidate) => (
                    <span key={`${candidate.strategy}:${candidate.selector}`}>
                      <b>{candidate.strategy}</b>
                      <code>{candidate.selector}</code>
                    </span>
                  ))}
                </div>
              )}
            </div>
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
          {sourceOpenUrl && (
            <a
              aria-label="Open source"
              className="df-review-item-source-open"
              href={sourceOpenUrl}
              rel="noreferrer"
              target="_blank"
              title="Open source"
            >
              <FileCode2Icon aria-hidden="true" />
            </a>
          )}
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
