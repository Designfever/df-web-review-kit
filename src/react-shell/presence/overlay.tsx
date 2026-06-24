import { useState, type CSSProperties } from 'react';
import { UserRound as UserRoundIcon } from 'lucide-react';
import type { ReviewPresenceUser } from '../types';

interface PresenceOverlayProps {
  presenceSessionId: string;
  users: ReviewPresenceUser[];
}

const getPresenceName = (user: ReviewPresenceUser) =>
  user.displayName || user.userId;

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
        <UserRoundIcon aria-hidden="true" />
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
              {getPresenceName(user)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
