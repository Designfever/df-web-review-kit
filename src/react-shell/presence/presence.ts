import type {
  ReviewPresenceAdapter,
  ReviewPresenceContext,
  ReviewPresenceState,
  ReviewPresenceUser,
} from '../types';

const REVIEW_PRESENCE_SESSION_KEY = 'df-review-presence-session-id';
const DEFAULT_LOCAL_PRESENCE_CHANNEL = 'df-review-kit:presence';
const DEFAULT_LOCAL_PRESENCE_HEARTBEAT_MS = 5000;
const DEFAULT_LOCAL_PRESENCE_STALE_MS = 16000;
const PRESENCE_COLORS = [
  '#7cc7ff',
  '#63d7c7',
  '#f3b75f',
  '#c99cff',
  '#ff8f61',
  '#9cc76b',
  '#f278a6',
  '#79a7ff',
];

type LocalPresenceMessage =
  | {
      type: 'request';
      sessionId: string;
    }
  | {
      type: 'update';
      sessionId: string;
      user: ReviewPresenceUser;
    }
  | {
      type: 'leave';
      sessionId: string;
    };

export type LocalPresenceAdapterOptions = {
  channelName?: string;
  heartbeatMs?: number;
  staleMs?: number;
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

export const getReviewPresenceColor = (value: string) =>
  PRESENCE_COLORS[hashString(value || 'anonymous') % PRESENCE_COLORS.length];

export const getReviewPresenceDisplayName = (userId: string) =>
  userId.trim() || 'anonymous';

export const getReviewPresenceSessionId = () => {
  if (typeof window === 'undefined') return createId();

  try {
    const stored = window.sessionStorage.getItem(REVIEW_PRESENCE_SESSION_KEY);
    if (stored) return stored;

    const nextId = createId();
    window.sessionStorage.setItem(REVIEW_PRESENCE_SESSION_KEY, nextId);
    return nextId;
  } catch {
    return createId();
  }
};

const getTimestamp = () => new Date().toISOString();

const normalizePresenceUser = (
  state: ReviewPresenceState
): ReviewPresenceUser => ({
  ...state,
  displayName: getReviewPresenceDisplayName(state.displayName || state.userId),
  updatedAt: state.updatedAt || getTimestamp(),
});

export const createLocalPresenceAdapter = (
  options: LocalPresenceAdapterOptions = {}
): ReviewPresenceAdapter => ({
  label: 'local-presence',
  connect: (context: ReviewPresenceContext) => {
    const heartbeatMs =
      options.heartbeatMs ?? DEFAULT_LOCAL_PRESENCE_HEARTBEAT_MS;
    const staleMs = options.staleMs ?? DEFAULT_LOCAL_PRESENCE_STALE_MS;
    const users = new Map<string, ReviewPresenceUser>();
    const listeners = new Set<(users: ReviewPresenceUser[]) => void>();
    let currentUser = normalizePresenceUser({
      ...context.initialState,
      sessionId: context.sessionId,
      userId: context.userId,
      displayName: context.displayName,
      color: context.color,
      updatedAt: getTimestamp(),
    });
    users.set(context.sessionId, currentUser);

    const Channel =
      typeof BroadcastChannel === 'undefined' ? undefined : BroadcastChannel;
    const channel = Channel
      ? new Channel(options.channelName ?? DEFAULT_LOCAL_PRESENCE_CHANNEL)
      : null;

    const getUsers = () => {
      const now = Date.now();

      users.forEach((user, sessionId) => {
        if (now - Date.parse(user.updatedAt) > staleMs) {
          users.delete(sessionId);
        }
      });

      return Array.from(users.values()).sort((a, b) => {
        if (a.sessionId === context.sessionId) return -1;
        if (b.sessionId === context.sessionId) return 1;
        return a.displayName.localeCompare(b.displayName);
      });
    };

    const emit = () => {
      const nextUsers = getUsers();
      listeners.forEach((listener) => listener(nextUsers));
    };

    const post = (message: LocalPresenceMessage) => {
      try {
        channel?.postMessage(message);
      } catch {
        return;
      }
    };

    const publish = () => {
      post({
        type: 'update',
        sessionId: context.sessionId,
        user: currentUser,
      });
    };

    if (channel) {
      channel.onmessage = (event: MessageEvent<LocalPresenceMessage>) => {
        const message = event.data;
        if (!message || message.sessionId === context.sessionId) return;

        if (message.type === 'request') {
          publish();
          return;
        }

        if (message.type === 'leave') {
          users.delete(message.sessionId);
          emit();
          return;
        }

        if (message.type === 'update' && message.user) {
          users.set(message.sessionId, normalizePresenceUser(message.user));
          emit();
        }
      };
    }

    const intervalId =
      typeof window === 'undefined'
        ? undefined
        : window.setInterval(() => {
            currentUser = {
              ...currentUser,
              updatedAt: getTimestamp(),
            };
            users.set(context.sessionId, currentUser);
            emit();
            publish();
          }, heartbeatMs);

    emit();
    publish();
    post({
      type: 'request',
      sessionId: context.sessionId,
    });

    return {
      update: (state) => {
        currentUser = normalizePresenceUser({
          ...currentUser,
          ...state,
          sessionId: context.sessionId,
          userId: context.userId,
          displayName: context.displayName,
          color: context.color,
          updatedAt: getTimestamp(),
        });
        users.set(context.sessionId, currentUser);
        emit();
        publish();
      },
      subscribe: (callback) => {
        listeners.add(callback);
        callback(getUsers());

        return () => {
          listeners.delete(callback);
        };
      },
      disconnect: () => {
        if (intervalId) {
          window.clearInterval(intervalId);
        }
        post({
          type: 'leave',
          sessionId: context.sessionId,
        });
        channel?.close();
        listeners.clear();
        users.clear();
      },
    };
  },
});

export const createFallbackPresenceAdapter = (
  primaryAdapter: ReviewPresenceAdapter,
  fallbackAdapter: ReviewPresenceAdapter
): ReviewPresenceAdapter => ({
  label: `${primaryAdapter.label}-with-${fallbackAdapter.label}-fallback`,
  connect: async (context: ReviewPresenceContext) => {
    try {
      return await primaryAdapter.connect(context);
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.warn(
          `[df-review-kit] ${primaryAdapter.label} failed. Falling back to ${fallbackAdapter.label}.`,
          error
        );
      }
      return fallbackAdapter.connect(context);
    }
  },
});
