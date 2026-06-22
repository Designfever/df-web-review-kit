import type { CSSProperties } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import type { ReviewPresenceUser } from '../types';

interface PresenceRowProps {
  presenceSessionId: string;
  users: ReviewPresenceUser[];
}

export const PresenceRow = ({
  presenceSessionId,
  users,
}: PresenceRowProps) => {
  if (users.length === 0) return null;

  return (
    <div aria-label="Review presence" className="df-review-presence-row">
      <span className="df-review-presence-label">
        <UsersIcon aria-hidden="true" />
        online {users.length}
      </span>
      <div className="df-review-presence-list">
        {users.map((user) => (
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
          >
            <span className="df-review-presence-dot" aria-hidden="true" />
            <span className="df-review-presence-name">{user.userId}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
