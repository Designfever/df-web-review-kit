import {
  Copy as CopyIcon,
  Upload as UploadIcon,
} from 'lucide-react';
import type { NumberedReviewItem, ReviewItem } from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';

interface QaItemRemoteActionsProps {
  isRemoteSource: boolean;
  isSubmitted: boolean;
  isSubmitting: boolean;
  item: ReviewItem;
  isRemoteIssueCopied: boolean;
  numberedItem: NumberedReviewItem;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  onCopyRemoteIssuePath: (item: ReviewItem) => Promise<void>;
  onSubmitItem: (numberedItem: NumberedReviewItem) => Promise<void>;
}

export const QaItemRemoteActions = ({
  isRemoteSource,
  isSubmitted,
  isSubmitting,
  item,
  isRemoteIssueCopied,
  numberedItem,
  remoteAdapterEntry,
  onCopyRemoteIssuePath,
  onSubmitItem,
}: QaItemRemoteActionsProps) => {
  const canSubmitToRemote = !isRemoteSource && Boolean(remoteAdapterEntry);
  const canCopyRemoteIssuePath =
    !isRemoteSource && Boolean(item.externalIssueUrl);
  const hasRemoteActions = canSubmitToRemote || canCopyRemoteIssuePath;

  if (!hasRemoteActions) return null;

  return (
    <div
      className="df-review-item-remote-actions"
      onClick={(event) => event.stopPropagation()}
    >
      {canSubmitToRemote && remoteAdapterEntry && (
        <button
          aria-label="Submit to remote"
          className="df-review-item-action-button df-review-item-submit-button"
          disabled={isSubmitted || isSubmitting}
          type="button"
          onClick={() => void onSubmitItem(numberedItem)}
        >
          <UploadIcon aria-hidden="true" />
          <span>
            {isSubmitted
              ? 'Submitted'
              : isSubmitting
                ? 'Submitting'
                : 'Submit'}
          </span>
        </button>
      )}
      {canCopyRemoteIssuePath && (
        <button
          aria-label={
            isRemoteIssueCopied
              ? 'Copied remote QA path'
              : 'Copy remote QA path'
          }
          className={`df-review-item-action-button df-review-item-remote-copy${
            isRemoteIssueCopied ? ' is-copied' : ''
          }`}
          title={
            isRemoteIssueCopied
              ? 'Copied remote QA path'
              : 'Copy remote QA path'
          }
          type="button"
          onClick={() => void onCopyRemoteIssuePath(item)}
        >
          <CopyIcon aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
