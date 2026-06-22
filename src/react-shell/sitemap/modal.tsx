import type { CSSProperties } from 'react';
import type {
  ReviewPresenceUser,
  ReviewShellPage,
} from '../types';
import {
  createSitemapRows,
  type SitemapQaCount,
} from './tree';

interface SitemapModalProps {
  pages: ReviewShellPage[];
  activeRoute: string;
  pageQaCounts: ReadonlyMap<string, SitemapQaCount>;
  pagePresenceUsers: ReadonlyMap<string, ReviewPresenceUser[]>;
  getPageTarget: (href: string) => string;
  onClose: () => void;
  onSelectPage: (href: string) => void;
}

export const SitemapModal = ({
  pages,
  activeRoute,
  pageQaCounts,
  pagePresenceUsers,
  getPageTarget,
  onClose,
  onSelectPage,
}: SitemapModalProps) => {
  const sitemapRows = createSitemapRows(
    pages,
    activeRoute,
    pageQaCounts,
    pagePresenceUsers,
    getPageTarget
  );

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
            <span>{pages.length} pages</span>
          </div>
          <button aria-label="Close sitemap" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="df-review-sitemap-list">
          <div className="df-review-sitemap-table-head" aria-hidden="true">
            <span>Page</span>
            <span>Local</span>
            <span>Remote</span>
            <span>Online</span>
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
              <>
                <span className="df-review-sitemap-path">
                  <span className="df-review-sitemap-tree-prefix">
                    {row.prefix}
                  </span>
                  <span>{row.label}</span>
                </span>
                <span className="df-review-sitemap-cell is-local">
                  {row.qaCount.local}
                </span>
                <span className="df-review-sitemap-cell is-remote">
                  {row.qaCount.remote}
                </span>
                <span className="df-review-sitemap-cell is-online">
                  {row.users.length > 0 ? (
                    <span className="df-review-sitemap-users">
                      {row.users.map((user) => (
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

            if (!row.isPage) {
              return (
                <div
                  key={row.href}
                  aria-label={`${row.href} group / local ${row.qaCount.local} QA / remote ${row.qaCount.remote} QA / ${row.users.length} online`}
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
                aria-label={`${row.href} / local ${row.qaCount.local} QA / remote ${row.qaCount.remote} QA / ${row.users.length} online`}
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
