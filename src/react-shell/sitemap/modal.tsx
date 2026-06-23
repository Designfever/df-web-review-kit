import {
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import type { ReviewItemScope } from '../../types';
import type {
  ReviewPresenceUser,
  ReviewShellPage,
} from '../types';
import {
  createSitemapRows,
  getSitemapStatusCount,
  SITEMAP_SORT_OPTIONS,
  SITEMAP_STATUS_FILTERS,
  type SitemapQaCount,
  type SitemapSortKey,
  type SitemapStatusFilter,
} from './tree';

interface SitemapModalProps {
  pages: ReviewShellPage[];
  activeRoute: string;
  allQaCount: SitemapQaCount;
  isAllQaVisible: boolean;
  pageQaCounts: ReadonlyMap<string, SitemapQaCount>;
  pagePresenceUsers: ReadonlyMap<string, ReviewPresenceUser[]>;
  getPageTarget: (href: string) => string;
  onClose: () => void;
  onSelectAllQa: () => void;
  onSelectPage: (href: string) => void;
}

export const SitemapModal = ({
  pages,
  activeRoute,
  allQaCount,
  isAllQaVisible,
  pageQaCounts,
  pagePresenceUsers,
  getPageTarget,
  onClose,
  onSelectAllQa,
  onSelectPage,
}: SitemapModalProps) => {
  const [statusFilter, setStatusFilter] =
    useState<SitemapStatusFilter>('all');
  const [sortKey, setSortKey] = useState<SitemapSortKey>('tree');
  const sitemapRows = createSitemapRows(
    pages,
    activeRoute,
    pageQaCounts,
    pagePresenceUsers,
    getPageTarget,
    { sortKey, statusFilter }
  );
  const filteredAllCount = getSitemapStatusCount(allQaCount, statusFilter);
  const allQaLabel = statusFilter === 'all'
    ? `${allQaCount.remaining}/${allQaCount.total}`
    : String(filteredAllCount);
  const allQaStatusLabel =
    SITEMAP_STATUS_FILTERS.find((filter) => filter.key === statusFilter)
      ?.label ?? 'All status';

  return (
    <div
      aria-label="Sitemap"
      aria-modal="true"
      className="df-review-sitemap-modal"
      role="dialog"
    >
      <button
        aria-label="Close sitemap"
        className="df-review-sitemap-backdrop"
        type="button"
        onClick={onClose}
      />
      <div className="df-review-sitemap-dialog">
        <div className="df-review-sitemap-header">
          <div>
            <strong>Sitemap</strong>
            <span>
              {pages.length} pages · {allQaCount.remaining}/{allQaCount.total}
            </span>
          </div>
          <button aria-label="Close sitemap" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="df-review-sitemap-controls">
          <select
            aria-label="Sitemap status filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.currentTarget.value as SitemapStatusFilter)
            }
          >
            {SITEMAP_STATUS_FILTERS.map((filter) => (
              <option key={filter.key} value={filter.key}>
                {filter.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Sitemap sort"
            value={sortKey}
            onChange={(event) =>
              setSortKey(event.currentTarget.value as SitemapSortKey)
            }
          >
            {SITEMAP_SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="df-review-sitemap-list">
          <div className="df-review-sitemap-table-head" aria-hidden="true">
            <span>Page</span>
            <span>Work</span>
            <span>Source</span>
            <span>Online</span>
          </div>
          <button
            aria-label={`All QA / ${allQaStatusLabel} ${allQaLabel} / local ${allQaCount.local} QA / remote ${allQaCount.remote} QA`}
            className={`df-review-sitemap-row is-page is-all${
              isAllQaVisible ? ' is-active' : ''
            }`}
            type="button"
            onClick={onSelectAllQa}
          >
            <SitemapRowContent
              label="All QA"
              prefix=""
              qaCount={allQaCount}
              statusFilter={statusFilter}
              users={[]}
            />
          </button>
          {sitemapRows.map((row) => {
            const rowClassName = [
              'df-review-sitemap-row',
              row.isPage ? 'is-page' : 'is-folder',
              row.isActive ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ');
            const rowContent = (
              <SitemapRowContent
                label={row.label}
                prefix={row.prefix}
                qaCount={row.qaCount}
                statusFilter={statusFilter}
                users={row.users}
              />
            );

            if (!row.isPage) {
              return (
                <div
                  key={row.href}
                  aria-label={`${row.href} group / remaining ${row.qaCount.remaining} of ${row.qaCount.total} QA / local ${row.qaCount.local} QA / remote ${row.qaCount.remote} QA / ${row.users.length} online`}
                  className={rowClassName}
                  role="row"
                >
                  {rowContent}
                </div>
              );
            }

            return (
              <button
                key={row.href}
                aria-label={`${row.href} / remaining ${row.qaCount.remaining} of ${row.qaCount.total} QA / local ${row.qaCount.local} QA / remote ${row.qaCount.remote} QA / ${row.users.length} online`}
                className={rowClassName}
                type="button"
                onClick={() => onSelectPage(row.href)}
              >
                {rowContent}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SITEMAP_SCOPE_LABELS: Array<{
  key: ReviewItemScope;
  label: string;
}> = [
  { key: 'mobile', label: 'MO' },
  { key: 'tablet', label: 'TA' },
  { key: 'desktop', label: 'PC' },
  { key: 'wide', label: 'WD' },
  { key: 'dom', label: 'DOM' },
];

const SitemapRowContent = ({
  label,
  prefix,
  qaCount,
  statusFilter,
  users,
}: {
  label: string;
  prefix: string;
  qaCount: SitemapQaCount;
  statusFilter: SitemapStatusFilter;
  users: ReviewPresenceUser[];
}) => {
  const visibleScopeCounts = useMemo(
    () =>
      SITEMAP_SCOPE_LABELS.map((scope) => ({
        ...scope,
        count: qaCount.scope[scope.key] ?? 0,
      })).filter((scope) => scope.count > 0),
    [qaCount.scope]
  );
  const statusCount = getSitemapStatusCount(qaCount, statusFilter);

  return (
    <>
      <span className="df-review-sitemap-path">
        <span className="df-review-sitemap-tree-prefix">{prefix}</span>
        <span className="df-review-sitemap-label">{label}</span>
        {visibleScopeCounts.length > 0 && (
          <span className="df-review-sitemap-scope-badges">
            {visibleScopeCounts.map((scope) => (
              <span key={scope.key}>
                {scope.label} {scope.count}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="df-review-sitemap-cell is-work">
        {statusFilter === 'all' ? (
          <strong>
            {qaCount.remaining}/{qaCount.total}
          </strong>
        ) : (
          <strong>{statusCount}</strong>
        )}
      </span>
      <span className="df-review-sitemap-cell is-source">
        <span>L {qaCount.local}</span>
        <span>R {qaCount.remote}</span>
      </span>
      <span className="df-review-sitemap-cell is-online">
        {users.length > 0 ? (
          <span className="df-review-sitemap-users">
            {users.map((user) => (
              <span
                key={user.sessionId}
                className="df-review-sitemap-user"
                style={{
                  '--df-review-presence-color': user.color,
                } as CSSProperties}
              >
                {user.userId}
              </span>
            ))}
          </span>
        ) : (
          <span className="df-review-sitemap-online-empty">0</span>
        )}
      </span>
    </>
  );
};
