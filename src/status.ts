import type { ReviewItemStatus, ReviewWorkflowStatus } from './types';

export const REVIEW_WORKFLOW_STATUS_OPTIONS: Array<{
  value: ReviewWorkflowStatus;
  label: string;
}> = [
  { value: 'todo', label: '작업전' },
  { value: 'doing', label: '작업중' },
  { value: 'review', label: '검토 필요' },
  { value: 'hold', label: '보류' },
  { value: 'done', label: '완료' },
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
