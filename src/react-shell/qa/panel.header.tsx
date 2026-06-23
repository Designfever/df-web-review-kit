import {
  ListFilter as ListFilterIcon,
  RefreshCw as RefreshCwIcon,
} from 'lucide-react';
import type { ReviewSource } from '../../types';
import { normalizeReviewItemStatus } from '../../status';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { REVIEW_QA_FILTERS } from '../constants';
import { PresenceRow } from '../presence/row';
import { ReviewScopeIcon } from '../review/item.icons';
import type {
  ReviewPresenceUser,
  ReviewQaFilter,
  ReviewQaStatusFilter,
  ReviewShellStatusOption,
} from '../types';

interface QaPanelHeaderProps {
  activeItemCount: number;
  activeRemainingItemCount: number;
  currentPagePresenceUsers: ReviewPresenceUser[];
  filteredItemCount: number;
  isAllQaVisible: boolean;
  label: ReviewSource;
  presenceSessionId: string;
  qaFilter: ReviewQaFilter;
  qaFilterCounts: ReadonlyMap<ReviewQaFilter, number>;
  qaStatusFilter: ReviewQaStatusFilter;
  qaStatusFilterCounts: ReadonlyMap<ReviewQaStatusFilter, number>;
  showSourceSelect: boolean;
  source: ReviewSource;
  sourceEntries: NormalizedReviewShellAdapter[];
  statusOptions: readonly ReviewShellStatusOption[];
  onChangeReviewSource: (nextSource: ReviewSource) => void;
  onQaFilterChange: (filter: ReviewQaFilter) => void;
  onQaStatusFilterChange: (filter: ReviewQaStatusFilter) => void;
  onRefreshReviewData: () => Promise<void>;
}

export const QaPanelHeader = ({
  activeItemCount,
  activeRemainingItemCount,
  currentPagePresenceUsers,
  filteredItemCount,
  isAllQaVisible,
  label,
  presenceSessionId,
  qaFilter,
  qaFilterCounts,
  qaStatusFilter,
  qaStatusFilterCounts,
  showSourceSelect,
  source,
  sourceEntries,
  statusOptions,
  onChangeReviewSource,
  onQaFilterChange,
  onQaStatusFilterChange,
  onRefreshReviewData,
}: QaPanelHeaderProps) => {
  const statusFilterOptions = getStatusFilterOptions(statusOptions);
  const hasActiveFilter = qaFilter !== 'all' || qaStatusFilter !== 'all';

  return (
    <div className="df-review-list-header">
      <div className="df-review-list-toolbar">
        <div className="df-review-list-controls">
          <select
            aria-label="QA status filter"
            className="df-review-status-filter-select"
            value={qaStatusFilter}
            onChange={(event) =>
              onQaStatusFilterChange(
                event.currentTarget.value as ReviewQaStatusFilter
              )
            }
          >
            <option value="all">
              {`All status (${qaStatusFilterCounts.get('all') ?? 0})`}
            </option>
            {statusFilterOptions.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {`${statusOption.label} (${
                  qaStatusFilterCounts.get(statusOption.value) ?? 0
                })`}
              </option>
            ))}
          </select>
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
            className="df-review-source-refresh"
            type="button"
            onClick={() => void onRefreshReviewData()}
          >
            <RefreshCwIcon aria-hidden="true" />
          </button>
        </div>
        <div className="df-review-filter-tabs" aria-label="QA filters">
          {REVIEW_QA_FILTERS.map((filter) => {
            const count = qaFilterCounts.get(filter.key) ?? 0;
            const isActive = qaFilter === filter.key;

            return (
              <button
                key={filter.key}
                aria-label={`${filter.label} QA (${count})`}
                aria-pressed={isActive}
                className={`df-review-filter-tab${
                  isActive ? ' is-active' : ''
                }`}
                type="button"
                onClick={() => onQaFilterChange(filter.key)}
              >
                <span className="df-review-filter-icon">
                  {filter.scope ? (
                    <ReviewScopeIcon scope={filter.scope} />
                  ) : (
                    <ListFilterIcon aria-hidden="true" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="df-review-list-title">
        <span>{isAllQaVisible ? `${label} QA · All pages` : `${label} QA`}</span>
        <strong title={`${activeRemainingItemCount} remaining of ${activeItemCount}`}>
          {!hasActiveFilter
            ? `${activeRemainingItemCount}/${activeItemCount}`
            : `${filteredItemCount}/${activeItemCount}`}
        </strong>
      </div>
      <PresenceRow
        presenceSessionId={presenceSessionId}
        users={currentPagePresenceUsers}
      />
    </div>
  );
};

function getStatusFilterOptions(
  statusOptions: readonly ReviewShellStatusOption[]
) {
  const seen = new Set<ReviewQaStatusFilter>();

  return statusOptions.flatMap((statusOption) => {
    const value = normalizeReviewItemStatus(statusOption.value);
    if (seen.has(value)) return [];

    seen.add(value);
    return [{
      value,
      label: statusOption.label,
    }];
  });
}
