import {
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  X as XIcon,
} from 'lucide-react';
import type {
  ReviewPresenceUser,
  ReviewShellPage,
} from '../types';
import {
  createSitemapRows,
  type SitemapQaCount,
  type SitemapSortDirection,
  type SitemapSortKey,
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

const getCountCellClassName = (
  status: 'todo' | 'review' | 'hold',
  count: number
) =>
  [
    'df-review-sitemap-cell',
    `is-${status}`,
    count === 0 ? 'is-zero' : '',
  ]
    .filter(Boolean)
    .join(' ');

const mergePresenceUsers = (users: ReviewPresenceUser[]) => {
  const userByKey = new Map<string, ReviewPresenceUser>();

  users.forEach((user) => {
    const key = user.sessionId || user.userId;
    const currentUser = userByKey.get(key);

    if (
      !currentUser ||
      Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)
    ) {
      userByKey.set(key, user);
    }
  });

  return Array.from(userByKey.values());
};

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
  const [sort, setSort] = useState<SortState>({
    key: 'page',
    direction: 'asc',
  });
  const [collapsedFolderHrefs, setCollapsedFolderHrefs] = useState<Set<string>>(
    () => new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedSearchQuery = searchQuery.trim();
  const allQaUsers = useMemo(
    () => mergePresenceUsers(Array.from(pagePresenceUsers.values()).flat()),
    [pagePresenceUsers]
  );
  const sitemapRows = createSitemapRows(
    pages,
    activeRoute,
    pageQaCounts,
    pagePresenceUsers,
    getPageTarget,
    {
      collapsedFolderHrefs,
      searchQuery: trimmedSearchQuery,
      sortKey: sort.key,
      sortDirection: sort.direction,
    }
  );
  const matchingPageCount = sitemapRows.filter((row) => row.isPage).length;
  const gridStyle = {
    '--df-review-sitemap-grid-template': 'minmax(190px, 1fr) 58px 70px 56px minmax(96px, 140px)',
  } as CSSProperties;
  const sortHeaders: SortHeader[] = [
    { key: 'page', label: 'Path', className: 'is-page' },
    { key: 'todo', label: 'Todo' },
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
  const toggleFolder = (href: string) => {
    setCollapsedFolderHrefs((currentHrefs) => {
      const nextHrefs = new Set(currentHrefs);
      if (nextHrefs.has(href)) {
        nextHrefs.delete(href);
      } else {
        nextHrefs.add(href);
      }
      return nextHrefs;
    });
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
              {pages.length} pages · {allQaCount.status.todo} todo ·{' '}
              {allQaCount.status.review} review · {allQaCount.status.hold} hold
            </span>
          </div>
          <button aria-label="Close sitemap" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="df-review-sitemap-controls">
          <label className="df-review-sitemap-search">
            <SearchIcon aria-hidden="true" />
            <input
              aria-label="Search sitemap"
              autoComplete="off"
              placeholder="Search pages"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
            />
          </label>
          {trimmedSearchQuery && (
            <button
              aria-label="Clear sitemap search"
              className="df-review-sitemap-search-clear"
              type="button"
              onClick={() => setSearchQuery('')}
            >
              <XIcon aria-hidden="true" />
            </button>
          )}
          <span className="df-review-sitemap-search-count">
            {trimmedSearchQuery
              ? `${matchingPageCount} matches`
              : `${pages.length} pages`}
          </span>
        </div>
        <div className="df-review-sitemap-list" style={gridStyle}>
          <div className="df-review-sitemap-table-head" role="row">
            {sortHeaders.map((header) => (
              <button
                key={header.key}
                aria-label={`Sort sitemap by ${header.title ?? header.label}`}
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
            const selectRowPage = () => {
              if (row.isPage) onSelectPage(row.href);
            };
            const rowClassName = [
              'df-review-sitemap-row',
              row.isPage ? 'is-page' : 'is-folder',
              row.isActive ? 'is-active' : '',
              row.isPage ? 'is-clickable' : '',
            ]
              .filter(Boolean)
              .join(' ');
            const rowContent = (
              <SitemapRowContent
                depth={row.depth}
                hasChildren={row.hasChildren}
                isExpanded={row.isExpanded}
                isPage={row.isPage}
                label={row.label}
                qaCount={row.qaCount}
                users={row.users}
                onToggleFolder={() => toggleFolder(row.href)}
              />
            );

            return (
              <div
                key={row.href}
                aria-label={
                  row.isPage
                    ? `${row.href} / ${row.qaCount.status.todo} todo / ${row.qaCount.status.review} review / ${row.qaCount.status.hold} hold / ${row.users.length} online`
                    : `${row.href} group / ${row.qaCount.status.todo} todo / ${row.qaCount.status.review} review / ${row.qaCount.status.hold} hold / ${row.users.length} online`
                }
                className={rowClassName}
                role={row.isPage ? 'button' : 'row'}
                tabIndex={row.isPage ? 0 : undefined}
                onClick={row.isPage ? selectRowPage : undefined}
                onKeyDown={
                  row.isPage
                    ? (event) => {
                        if (event.currentTarget !== event.target) return;
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        selectRowPage();
                      }
                    : undefined
                }
              >
                {rowContent}
              </div>
            );
          })}
          {sitemapRows.length === 0 && (
            <div className="df-review-sitemap-empty" role="status">
              No matching pages
            </div>
          )}
          <button
            aria-label={`All QA / ${allQaCount.status.todo} todo / ${allQaCount.status.review} review / ${allQaCount.status.hold} hold`}
            className={`df-review-sitemap-row is-summary${
              isAllQaVisible ? ' is-active' : ''
            }`}
            type="button"
            onClick={onSelectAllQa}
          >
            <SitemapRowContent
              depth={0}
              hasChildren={false}
              isExpanded={false}
              isPage={false}
              label="All QA"
              qaCount={allQaCount}
              users={allQaUsers}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

const SitemapRowContent = ({
  depth,
  hasChildren,
  isExpanded,
  isPage,
  label,
  qaCount,
  users,
  onToggleFolder,
}: {
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isPage: boolean;
  label: string;
  qaCount: SitemapQaCount;
  users: ReviewPresenceUser[];
  onToggleFolder?: () => void;
}) => (
  <>
    <span
      className="df-review-sitemap-path"
      style={{ '--df-review-sitemap-depth': depth } as CSSProperties}
    >
      {hasChildren ? (
        <button
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label}`}
          className="df-review-sitemap-tree-toggle"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFolder?.();
          }}
        >
          {isExpanded ? (
            <ChevronDownIcon aria-hidden="true" />
          ) : (
            <ChevronRightIcon aria-hidden="true" />
          )}
        </button>
      ) : (
        <span className="df-review-sitemap-tree-spacer" aria-hidden="true" />
      )}
      {isPage ? (
        <span className="df-review-sitemap-page-label">
          {label}
        </span>
      ) : (
        <span className="df-review-sitemap-label">{label}</span>
      )}
    </span>
    <span className={getCountCellClassName('todo', qaCount.status.todo)}>
      <strong>{qaCount.status.todo}</strong>
    </span>
    <span className={getCountCellClassName('review', qaCount.status.review)}>
      {qaCount.status.review}
    </span>
    <span className={getCountCellClassName('hold', qaCount.status.hold)}>
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
      ) : null}
    </span>
  </>
);
