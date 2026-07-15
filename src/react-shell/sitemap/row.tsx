import type { CSSProperties } from 'react';
import {
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import type { ReviewPresenceUser } from '../types';
import type { SitemapQaCount } from './count';

// page, folder, All QA가 공유하는 표시 전용 row. 선택 상태는 modal이 관리한다.
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

export const SitemapRowContent = ({
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
            // page row 안의 toggle이므로 부모의 page 선택까지 전달하지 않는다.
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
        <span className="df-review-sitemap-page-label">{label}</span>
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
