import {
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import type {
  ReviewPresenceUser,
  ReviewShellPage,
  ReviewShellViewportPreset,
} from '../types';
import {
  createSitemapRows,
  createSitemapViewportColumn,
  type SitemapQaCount,
  type SitemapSortDirection,
  type SitemapSortKey,
  type SitemapViewportColumn,
} from './tree';

interface SitemapModalProps {
  pages: ReviewShellPage[];
  activeRoute: string;
  allQaCount: SitemapQaCount;
  isAllQaVisible: boolean;
  pageQaCounts: ReadonlyMap<string, SitemapQaCount>;
  pagePresenceUsers: ReadonlyMap<string, ReviewPresenceUser[]>;
  viewportPresets: ReviewShellViewportPreset[];
  getPageTarget: (href: string) => string;
  onClose: () => void;
  onSelectAllQa: () => void;
  onSelectPage: (href: string) => void;
}

type SortState = {
  key: SitemapSortKey;
  direction: SitemapSortDirection;
};

type SortHeader = {
  key: SitemapSortKey;
  label: string;
  title?: string;
  className?: string;
};

const getNextSortDirection = (
  current: SortState,
  key: SitemapSortKey
): SitemapSortDirection => {
  if (current.key !== key) return key === 'page' ? 'asc' : 'desc';

  return current.direction === 'desc' ? 'asc' : 'desc';
};

const getSortIndicator = (sort: SortState, key: SitemapSortKey) => {
  if (sort.key !== key) return '';

  return sort.direction === 'desc' ? '↓' : '↑';
};

const getViewportCount = (
  qaCount: SitemapQaCount,
  column: SitemapViewportColumn
) => qaCount.viewport[column.key]?.remaining ?? 0;

export const SitemapModal = ({
  pages,
  activeRoute,
  allQaCount,
  isAllQaVisible,
  pageQaCounts,
  pagePresenceUsers,
  viewportPresets,
  getPageTarget,
  onClose,
  onSelectAllQa,
  onSelectPage,
}: SitemapModalProps) => {
  const [sort, setSort] = useState<SortState>({
    key: 'total',
    direction: 'desc',
  });
  const viewportColumns = useMemo(
    () => viewportPresets.map(createSitemapViewportColumn),
    [viewportPresets]
  );
  const sitemapRows = createSitemapRows(
    pages,
    activeRoute,
    pageQaCounts,
    pagePresenceUsers,
    getPageTarget,
    {
      sortKey: sort.key,
      sortDirection: sort.direction,
    }
  );
  const gridStyle = {
    '--df-review-sitemap-grid-template': `minmax(190px, 1fr) repeat(${viewportColumns.length}, minmax(66px, 76px)) 74px 78px 64px minmax(108px, 160px)`,
  } as CSSProperties;
  const sortHeaders: SortHeader[] = [
    { key: 'page', label: 'Page', className: 'is-page' },
    ...viewportColumns.map((column) => ({
      key: `viewport:${column.key}` as SitemapSortKey,
      label: column.label,
      title: column.title,
    })),
    { key: 'total', label: 'Total', title: 'Remaining total' },
    { key: 'review', label: 'Review' },
    { key: 'hold', label: 'Hold' },
    { key: 'online', label: 'Online', className: 'is-online' },
  ];
  const setSortKey = (key: SitemapSortKey) => {
    setSort((current) => ({
      key,
      direction: getNextSortDirection(current, key),
    }));
  };

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
              {pages.length} pages · {allQaCount.remaining} remaining ·{' '}
              {allQaCount.status.review} review · {allQaCount.status.hold} hold
            </span>
          </div>
          <button aria-label="Close sitemap" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="df-review-sitemap-list" style={gridStyle}>
          <div className="df-review-sitemap-table-head" role="row">
            {sortHeaders.map((header) => (
              <button
                key={header.key}
                aria-label={`Sort sitemap by ${header.label}`}
                className={[
                  'df-review-sitemap-sort',
                  header.className ?? '',
                  sort.key === header.key ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                title={header.title ?? header.label}
                type="button"
                onClick={() => setSortKey(header.key)}
              >
                <span
                  aria-hidden="true"
                  className="df-review-sitemap-sort-indicator"
                >
                  {getSortIndicator(sort, header.key)}
                </span>
                <span className="df-review-sitemap-sort-label">
                  {header.label}
                </span>
              </button>
            ))}
          </div>
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
                users={row.users}
                viewportColumns={viewportColumns}
              />
            );

            if (!row.isPage) {
              return (
                <div
                  key={row.href}
                  aria-label={`${row.href} group / ${row.qaCount.remaining} remaining / ${row.qaCount.status.review} review / ${row.qaCount.status.hold} hold / ${row.users.length} online`}
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
                aria-label={`${row.href} / ${row.qaCount.remaining} remaining / ${row.qaCount.status.review} review / ${row.qaCount.status.hold} hold / ${row.users.length} online`}
                className={rowClassName}
                type="button"
                onClick={() => onSelectPage(row.href)}
              >
                {rowContent}
              </button>
            );
          })}
          <button
            aria-label={`All QA / ${allQaCount.remaining} remaining / ${allQaCount.status.review} review / ${allQaCount.status.hold} hold`}
            className={`df-review-sitemap-row is-summary${
              isAllQaVisible ? ' is-active' : ''
            }`}
            type="button"
            onClick={onSelectAllQa}
          >
            <SitemapRowContent
              label="All QA"
              prefix=""
              qaCount={allQaCount}
              users={[]}
              viewportColumns={viewportColumns}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

const SitemapRowContent = ({
  label,
  prefix,
  qaCount,
  users,
  viewportColumns,
}: {
  label: string;
  prefix: string;
  qaCount: SitemapQaCount;
  users: ReviewPresenceUser[];
  viewportColumns: SitemapViewportColumn[];
}) => (
  <>
    <span className="df-review-sitemap-path">
      <span className="df-review-sitemap-tree-prefix">{prefix}</span>
      <span className="df-review-sitemap-label">{label}</span>
    </span>
    {viewportColumns.map((column) => (
      <span key={column.key} className="df-review-sitemap-cell is-viewport">
        {getViewportCount(qaCount, column)}
      </span>
    ))}
    <span className="df-review-sitemap-cell is-total">
      <strong>{qaCount.remaining}</strong>
    </span>
    <span className="df-review-sitemap-cell is-review">
      {qaCount.status.review}
    </span>
    <span className="df-review-sitemap-cell is-hold">
      {qaCount.status.hold}
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
