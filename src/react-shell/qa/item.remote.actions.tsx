import {
  ExternalLink as ExternalLinkIcon,
  Upload as UploadIcon,
} from 'lucide-react';
import type { NumberedReviewItem, ReviewItem } from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';

interface QaItemRemoteActionsProps {
  isRemoteSource: boolean;
  isSubmitted: boolean;
  isSubmitting: boolean;
  item: ReviewItem;
  numberedItem: NumberedReviewItem;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  onSubmitItem: (numberedItem: NumberedReviewItem) => Promise<void>;
}

export const QaItemRemoteActions = ({
  isRemoteSource,
  isSubmitted,
  isSubmitting,
  item,
  numberedItem,
  remoteAdapterEntry,
  onSubmitItem,
}: QaItemRemoteActionsProps) => {
  const canSubmitToRemote = !isRemoteSource && Boolean(remoteAdapterEntry);
  const canOpenRemoteIssue = !isRemoteSource && Boolean(item.externalIssueUrl);
  const hasRemoteActions = canSubmitToRemote || canOpenRemoteIssue;

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
      {canOpenRemoteIssue && (
        <a
          aria-label="Open remote issue"
          className="df-review-item-action-button"
          href={item.externalIssueUrl}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLinkIcon aria-hidden="true" />
        </a>
      )}
    </div>
  );
};
