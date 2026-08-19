import {
  CheckCheck as CheckCheckIcon,
  RefreshCw as RefreshCwIcon,
} from 'lucide-react';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  normalizeReviewItemStatus,
} from '../../status';
import type { ReviewSource } from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { REVIEW_QA_STATUS_FILTERS } from '../constants';
import type {
  ReviewQaStatusFilter,
  ReviewShellQaPageSelector,
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
  qaPageSelector?: ReviewShellQaPageSelector;
  showSourceSelect: boolean;
  source: ReviewSource;
  sourceEntries: NormalizedReviewShellAdapter[];
  statusOptions: readonly ReviewShellStatusOption[];
  onChangeReviewSource: (nextSource: ReviewSource) => void;
  onEnableActiveQaStatusFilters: () => void;
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
  qaPageSelector,
  showSourceSelect,
  source,
  sourceEntries,
  statusOptions,
  onChangeReviewSource,
  onEnableActiveQaStatusFilters,
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
          {!qaPageSelector && (
            <span>
              {isAllQaVisible
                ? `${displayLabel} QA · All pages`
                : `${displayLabel} QA`}
            </span>
          )}
          {qaPageSelector && qaPageSelector.options.length > 1 && (
            <select
              aria-label="df-sheet page"
              className="df-review-page-select"
              value={qaPageSelector.value}
              onChange={(event) =>
                qaPageSelector.onChange(event.currentTarget.value)
              }
            >
              {qaPageSelector.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
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
        <button
          aria-label="Show all non-done QA"
          aria-pressed={!hasActiveFilter}
          className={`df-review-status-toggle df-review-status-preset-toggle${
            !hasActiveFilter ? ' is-active' : ''
          }`}
          data-review-tooltip="Show all non-done QA"
          title="Show all non-done QA"
          type="button"
          onClick={onEnableActiveQaStatusFilters}
        >
          <CheckCheckIcon aria-hidden="true" />
        </button>
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
