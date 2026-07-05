import { RefreshCw as RefreshCwIcon } from 'lucide-react';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  normalizeReviewItemStatus,
} from '../../status';
import type { ReviewSource } from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { REVIEW_QA_STATUS_FILTERS } from '../constants';
import type {
  ReviewQaStatusFilter,
  ReviewShellStatusOption,
} from '../types';
import { isDefaultReviewQaStatusFilters } from './status.filter';

interface QaPanelHeaderProps {
  activeItemCount: number;
  activeRemainingItemCount: number;
  filteredItemCount: number;
  isAllQaVisible: boolean;
  isLoading: boolean;
  label: ReviewSource;
  qaStatusFilters: readonly ReviewQaStatusFilter[];
  qaStatusFilterCounts: ReadonlyMap<ReviewQaStatusFilter, number>;
  showSourceSelect: boolean;
  source: ReviewSource;
  sourceEntries: NormalizedReviewShellAdapter[];
  statusOptions: readonly ReviewShellStatusOption[];
  onChangeReviewSource: (nextSource: ReviewSource) => void;
  onQaStatusFilterToggle: (filter: ReviewQaStatusFilter) => void;
  onRefreshReviewData: () => Promise<void>;
}

export const QaPanelHeader = ({
  activeItemCount,
  activeRemainingItemCount,
  filteredItemCount,
  isAllQaVisible,
  isLoading,
  label,
  qaStatusFilters,
  qaStatusFilterCounts,
  showSourceSelect,
  source,
  sourceEntries,
  statusOptions,
  onChangeReviewSource,
  onQaStatusFilterToggle,
  onRefreshReviewData,
}: QaPanelHeaderProps) => {
  const statusFilterOptions = getStatusFilterOptions(statusOptions);
  const hasActiveFilter = !isDefaultReviewQaStatusFilters(qaStatusFilters);
  const displayLabel = getQaSourceDisplayLabel(label);

  return (
    <div className="df-review-list-header">
      <div className="df-review-list-title">
        <span className="df-review-list-meta">
          <span>
            {isAllQaVisible
              ? `${displayLabel} QA · All pages`
              : `${displayLabel} QA`}
          </span>
          <strong
            title={`${activeRemainingItemCount} remaining of ${activeItemCount}`}
          >
            {!hasActiveFilter
              ? `${activeRemainingItemCount}/${activeItemCount}`
              : `${filteredItemCount}/${activeItemCount}`}
          </strong>
        </span>
        <div className="df-review-list-controls">
          {showSourceSelect && (
            <select
              aria-label="QA source"
              className="df-review-source-select"
              value={source}
              onChange={(event) =>
                onChangeReviewSource(event.currentTarget.value as ReviewSource)
              }
            >
              {sourceEntries.map((entry) => (
                <option key={entry.label} value={entry.label}>
                  {entry.label}
                </option>
              ))}
            </select>
          )}
          <button
            aria-label="Refresh QA"
            aria-busy={isLoading ? 'true' : 'false'}
            className={`df-review-source-refresh${
              isLoading ? ' is-loading' : ''
            }`}
            disabled={isLoading}
            type="button"
            onClick={() => void onRefreshReviewData()}
          >
            <RefreshCwIcon aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        className="df-review-status-toggle-row"
        aria-label="QA status filters"
      >
        {statusFilterOptions.map((statusOption) => {
          const isActive = qaStatusFilters.includes(statusOption.value);
          const count = qaStatusFilterCounts.get(statusOption.value) ?? 0;

          return (
            <button
              key={statusOption.value}
              aria-label={`${statusOption.label} QA (${count})`}
              aria-pressed={isActive}
              className={`df-review-status-toggle is-status-${statusOption.value}${
                isActive ? ' is-active' : ''
              }`}
              type="button"
              onClick={() => onQaStatusFilterToggle(statusOption.value)}
            >
              <span>{statusOption.label}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
};

function getQaSourceDisplayLabel(label: ReviewSource) {
  return label === 'local' ? 'Local' : label;
}

function getStatusFilterOptions(
  statusOptions: readonly ReviewShellStatusOption[]
) {
  const labelByValue = new Map<ReviewQaStatusFilter, string>();

  REVIEW_WORKFLOW_STATUS_OPTIONS.forEach((statusOption) => {
    labelByValue.set(statusOption.value, statusOption.label);
  });
  statusOptions.forEach((statusOption) => {
    const value = normalizeReviewItemStatus(statusOption.value);
    if (!REVIEW_QA_STATUS_FILTERS.includes(value)) return;
    labelByValue.set(value, statusOption.label);
  });

  return REVIEW_QA_STATUS_FILTERS.map((value) => ({
    value,
    label: labelByValue.get(value) ?? value,
  }));
}
