import { useState, type CSSProperties } from 'react';
import type { ReviewPresenceUser } from '../types';

interface PresenceOverlayProps {
  presenceSessionId: string;
  users: ReviewPresenceUser[];
}

const getPresenceName = (user: ReviewPresenceUser) =>
  user.displayName || user.userId;

const PresenceUserIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 30 30">
    <circle
      cx="15"
      cy="15"
      r="12.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
    />
    <circle cx="15" cy="10.5" r="3.4" fill="currentColor" stroke="none" />
    <path
      d="M7.8 22.1c.9-4.1 3.4-6.1 7.2-6.1s6.3 2 7.2 6.1c-1.7 1.5-4.1 2.4-7.2 2.4s-5.5-.9-7.2-2.4z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const PresenceOverlay = ({
  presenceSessionId,
  users,
}: PresenceOverlayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (users.length === 0) return null;

  return (
    <div
      aria-label={`Review presence, ${users.length} online`}
      className={`df-review-presence-overlay${
        isExpanded ? ' is-expanded' : ''
      }`}
    >
      <button
        aria-label={`Show online reviewers, ${users.length} online`}
        aria-expanded={isExpanded}
        className="df-review-presence-button"
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
      >
        <PresenceUserIcon />
        <span className="df-review-presence-badge">{users.length}</span>
      </button>
      {isExpanded && (
        <div className="df-review-presence-list" role="list">
          {users.map((user) => (
            <span
              key={user.sessionId}
              className={`df-review-presence-chip${
                user.sessionId === presenceSessionId ? ' is-self' : ''
              }`}
              role="listitem"
              style={
                {
                  '--df-review-presence-color': user.color,
                } as CSSProperties
              }
              title={getPresenceName(user)}
            >
              <span>{getPresenceName(user)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
