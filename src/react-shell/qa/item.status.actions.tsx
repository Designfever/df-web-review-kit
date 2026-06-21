import { normalizeReviewItemStatus } from '../../status';
import type { ReviewItem, ReviewItemStatus } from '../../types';
import type { ReviewShellStatusOption } from '../types';

interface QaItemStatusActionsProps {
  canUpdateStatus: boolean;
  item: ReviewItem;
  statusOptions: readonly ReviewShellStatusOption[];
  onChangeItemStatus: (
    item: ReviewItem,
    nextStatus: ReviewItemStatus
  ) => Promise<void>;
}

const getStatusOption = (
  status: ReviewItemStatus,
  statusOptions: readonly ReviewShellStatusOption[]
) => {
  const normalizedStatus = normalizeReviewItemStatus(status);
  return (
    statusOptions.find((statusOption) => statusOption.value === status) ??
    statusOptions.find(
      (statusOption) => statusOption.value === normalizedStatus
    ) ??
    statusOptions[0]
  );
};

export const QaItemStatusActions = ({
  canUpdateStatus,
  item,
  statusOptions,
  onChangeItemStatus,
}: QaItemStatusActionsProps) => {
  const currentStatusOption = getStatusOption(item.status, statusOptions);
  if (!currentStatusOption) return null;

  return (
    <div
      className="df-review-item-status-actions"
      onClick={(event) => event.stopPropagation()}
    >
      {canUpdateStatus ? (
        <select
          aria-label="QA status"
          className="df-review-item-status-select"
          value={currentStatusOption.value}
          onChange={(event) =>
            void onChangeItemStatus(
              item,
              event.currentTarget.value as ReviewItemStatus
            )
          }
        >
          {statusOptions.map((statusOption) => (
            <option key={statusOption.value} value={statusOption.value}>
              {statusOption.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="df-review-item-status-badge">
          {currentStatusOption.label}
        </span>
      )}
    </div>
  );
};
