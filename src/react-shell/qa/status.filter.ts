import { normalizeReviewItemStatus } from '../../status';
import type {
  ReviewItemStatus,
  ReviewWorkflowStatus,
} from '../../types';
import {
  DEFAULT_REVIEW_QA_STATUS_FILTERS,
  REVIEW_QA_STATUS_FILTERS,
} from '../constants';
import type { ReviewQaStatusFilter } from '../types';

export function isReviewQaStatusFilter(
  value: unknown
): value is ReviewQaStatusFilter {
  return (
    typeof value === 'string' &&
    REVIEW_QA_STATUS_FILTERS.includes(value as ReviewWorkflowStatus)
  );
}

export function getDefaultReviewQaStatusFilters(): ReviewQaStatusFilter[] {
  return [...DEFAULT_REVIEW_QA_STATUS_FILTERS];
}

export function normalizeReviewQaStatusFilters(
  filters: readonly unknown[] | null | undefined
): ReviewQaStatusFilter[] {
  const normalizedFilters: ReviewQaStatusFilter[] = [];

  filters?.forEach((filter) => {
    if (!isReviewQaStatusFilter(filter)) return;
    if (normalizedFilters.includes(filter)) return;
    normalizedFilters.push(filter);
  });

  return normalizedFilters.length > 0
    ? normalizedFilters
    : getDefaultReviewQaStatusFilters();
}

export function isDefaultReviewQaStatusFilters(
  filters: readonly ReviewQaStatusFilter[]
) {
  const normalizedFilters = normalizeReviewQaStatusFilters(filters);

  return (
    normalizedFilters.length === DEFAULT_REVIEW_QA_STATUS_FILTERS.length &&
    DEFAULT_REVIEW_QA_STATUS_FILTERS.every(
      (filter) => normalizedFilters.includes(filter)
    )
  );
}

export function matchesReviewQaStatusFilters(
  status: ReviewItemStatus | undefined,
  filters: readonly ReviewQaStatusFilter[]
) {
  const normalizedStatus = normalizeReviewItemStatus(status);

  return normalizeReviewQaStatusFilters(filters).includes(normalizedStatus);
}
