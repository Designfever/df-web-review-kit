import { useState, type CSSProperties } from 'react';
import type { ReviewPresenceUser } from '../types';

interface PresenceOverlayProps {
  presenceSessionId: string;
  users: ReviewPresenceUser[];
}

const COLLAPSED_USER_COUNT = 1;

const getPresenceName = (user: ReviewPresenceUser) =>
  user.displayName || user.userId;

export const PresenceOverlay = ({
  presenceSessionId,
  users,
}: PresenceOverlayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (users.length === 0) return null;

  const visibleUsers = isExpanded ? users : users.slice(0, COLLAPSED_USER_COUNT);
  const hiddenUserCount = users.length - visibleUsers.length;

  return (
    <div
      aria-label={`Review presence, ${users.length} online`}
      className={`df-review-presence-overlay${
        isExpanded ? ' is-expanded' : ''
      }`}
    >
      {visibleUsers.map((user) => (
        <span
          key={user.sessionId}
          className={`df-review-presence-chip${
            user.sessionId === presenceSessionId ? ' is-self' : ''
          }`}
          style={
            {
              '--df-review-presence-color': user.color,
            } as CSSProperties
          }
          title={getPresenceName(user)}
        >
          {getPresenceName(user)}
        </span>
      ))}
      {hiddenUserCount > 0 && (
        <button
          aria-label={`Show ${hiddenUserCount} more online reviewers`}
          aria-expanded={isExpanded}
          className="df-review-presence-more"
          type="button"
          onClick={() => setIsExpanded(true)}
        >
          +{hiddenUserCount}
        </button>
      )}
    </div>
  );
};
