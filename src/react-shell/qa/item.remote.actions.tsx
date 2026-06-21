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
  const hasRemoteActions =
    (!isRemoteSource && Boolean(remoteAdapterEntry)) ||
    Boolean(item.externalIssueUrl);

  if (!hasRemoteActions) return null;

  return (
    <div
      className="df-review-item-remote-actions"
      onClick={(event) => event.stopPropagation()}
    >
      {!isRemoteSource && remoteAdapterEntry && (
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
              ? '등록됨'
              : isSubmitting
                ? '등록 중'
                : 'remote 등록'}
          </span>
        </button>
      )}
      {item.externalIssueUrl && (
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
