import {
  ListFilter as ListFilterIcon,
  RefreshCw as RefreshCwIcon,
} from 'lucide-react';
import type { ReviewSource } from '../../types';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { REVIEW_QA_FILTERS } from '../constants';
import { PresenceRow } from '../presence/row';
import { ReviewScopeIcon } from '../review/item.icons';
import type { ReviewPresenceUser, ReviewQaFilter } from '../types';

interface QaPanelHeaderProps {
  activeItemCount: number;
  currentPagePresenceUsers: ReviewPresenceUser[];
  filteredItemCount: number;
  label: ReviewSource;
  presenceSessionId: string;
  qaFilter: ReviewQaFilter;
  qaFilterCounts: ReadonlyMap<ReviewQaFilter, number>;
  showSourceSelect: boolean;
  source: ReviewSource;
  sourceEntries: NormalizedReviewShellAdapter[];
  onChangeReviewSource: (nextSource: ReviewSource) => void;
  onQaFilterChange: (filter: ReviewQaFilter) => void;
  onRefreshReviewData: () => Promise<void>;
}

export const QaPanelHeader = ({
  activeItemCount,
  currentPagePresenceUsers,
  filteredItemCount,
  label,
  presenceSessionId,
  qaFilter,
  qaFilterCounts,
  showSourceSelect,
  source,
  sourceEntries,
  onChangeReviewSource,
  onQaFilterChange,
  onRefreshReviewData,
}: QaPanelHeaderProps) => {
  return (
    <div className="df-review-list-header">
      <div className="df-review-list-toolbar">
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
        <span>{label} QA</span>
        <strong>
          {filteredItemCount}
          {qaFilter === 'all' ? '' : `/${activeItemCount}`}
        </strong>
      </div>
      <PresenceRow
        presenceSessionId={presenceSessionId}
        users={currentPagePresenceUsers}
      />
    </div>
  );
};
