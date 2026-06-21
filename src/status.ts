import type { ReviewItemStatus, ReviewWorkflowStatus } from './types';

export const REVIEW_WORKFLOW_STATUS_OPTIONS: Array<{
  value: ReviewWorkflowStatus;
  label: string;
}> = [
  { value: 'todo', label: 'Todo' },
  { value: 'doing', label: 'Doing' },
  { value: 'review', label: 'Review' },
  { value: 'hold', label: 'Hold' },
  { value: 'done', label: 'Done' },
];

export function normalizeReviewItemStatus(
  status: ReviewItemStatus | undefined
): ReviewWorkflowStatus {
  if (status === 'resolved') return 'done';
  if (status === 'open' || !status) return 'todo';
  return status;
}

export function matchesReviewItemStatus(
  itemStatus: ReviewItemStatus | undefined,
  queryStatus: ReviewItemStatus
) {
  return (
    normalizeReviewItemStatus(itemStatus) === normalizeReviewItemStatus(queryStatus)
  );
}
