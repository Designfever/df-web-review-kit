import type {
  ReviewPresenceAdapter,
  ReviewPresenceContext,
  ReviewPresenceState,
  ReviewPresenceUser,
} from '../types';

type SupabaseRealtimeStatus =
  | 'SUBSCRIBED'
  | 'CHANNEL_ERROR'
  | 'TIMED_OUT'
  | 'CLOSED'
  | string;

type SupabaseRealtimeChannel = {
  topic?: string;
  on: (
    type: 'presence',
    filter: { event: 'sync' | 'join' | 'leave' },
    callback: () => void
  ) => SupabaseRealtimeChannel;
  subscribe: (
    callback: (status: SupabaseRealtimeStatus, error?: Error) => void
  ) => SupabaseRealtimeChannel;
  track: (payload: ReviewPresenceUser) => Promise<unknown>;
  untrack: () => Promise<unknown>;
  presenceState: () => Record<string, unknown[]>;
  teardown?: () => void;
};

export type SupabasePresenceClient = {
  channel: (
    topic: string,
    options?: {
      config?: {
        private?: boolean;
        presence?: {
          key?: string;
        };
      };
    }
  ) => SupabaseRealtimeChannel;
  getChannels?: () => SupabaseRealtimeChannel[];
  removeChannel: (channel: SupabaseRealtimeChannel) => Promise<unknown>;
};

export type SupabasePresenceAdapterOptions = {
  client: SupabasePresenceClient;
  channelPrefix?: string;
  private?: boolean;
};

const normalizeTopicPart = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'default';

const getPresenceTopic = (channelPrefix: string, projectId: string) =>
  `${normalizeTopicPart(channelPrefix)}-${normalizeTopicPart(projectId)}`;

const PRESENCE_BRIDGE_KEY = '__dfReviewPresenceBridge';

type SupabasePresenceBridge = {
  channel: SupabaseRealtimeChannel;
  emit: () => void;
  getUsers: () => ReviewPresenceUser[];
  listeners: Set<() => void>;
  ready: Promise<void>;
  refCount: number;
};

type SupabasePresenceBridgeChannel = SupabaseRealtimeChannel & {
  [PRESENCE_BRIDGE_KEY]?: SupabasePresenceBridge;
};

const isReviewPresenceUser = (value: unknown): value is ReviewPresenceUser => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<ReviewPresenceUser>;
  return (
    typeof candidate.projectId === 'string' &&
    typeof candidate.sessionId === 'string' &&
    typeof candidate.userId === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
};

const flattenPresenceState = (
  state: Record<string, unknown[]>
): ReviewPresenceUser[] =>
  Object.values(state).flat().filter(isReviewPresenceUser);

const dedupePresenceUsers = (users: ReviewPresenceUser[]) => {
  const userBySessionId = new Map<string, ReviewPresenceUser>();

  users.forEach((user) => {
    const currentUser = userBySessionId.get(user.sessionId);
    if (
      !currentUser ||
      Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)
    ) {
      userBySessionId.set(user.sessionId, user);
    }
  });

  return Array.from(userBySessionId.values());
};

const sortPresenceUsers = (
  users: ReviewPresenceUser[],
  selfSessionId: string
) =>
  users.sort((a, b) => {
    if (a.sessionId === selfSessionId) return -1;
    if (b.sessionId === selfSessionId) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

const subscribeChannel = (channel: SupabaseRealtimeChannel) =>
  new Promise<void>((resolve, reject) => {
    channel.subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        resolve();
        return;
      }

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        reject(error ?? new Error(`Supabase presence ${status}`));
      }
    });
  });

const removeTopicChannels = async (
  client: SupabasePresenceClient,
  topic: string
) => {
  const existingChannels = client.getChannels?.() ?? [];
  const normalizedTopic = `realtime:${topic}`;
  const topicChannels = existingChannels.filter(
    (channel) => channel.topic === topic || channel.topic === normalizedTopic
  );

  await Promise.allSettled(
    topicChannels.map(async (channel) => {
      const result = await client.removeChannel(channel);
      if (result !== 'ok') {
        channel.teardown?.();
      }
    })
  );
};

const getTopicChannel = (
  client: SupabasePresenceClient,
  topic: string
): SupabasePresenceBridgeChannel | undefined => {
  const normalizedTopic = `realtime:${topic}`;

  return client
    .getChannels?.()
    .find(
      (channel) =>
        channel.topic === topic || channel.topic === normalizedTopic
    ) as SupabasePresenceBridgeChannel | undefined;
};

const createPresenceBridge = (
  client: SupabasePresenceClient,
  topic: string,
  context: ReviewPresenceContext,
  isPrivate: boolean
) => {
  const channel = client.channel(topic, {
    config: {
      private: isPrivate,
      presence: {
        key: context.sessionId,
      },
    },
  }) as SupabasePresenceBridgeChannel;

  const bridge: SupabasePresenceBridge = {
    channel,
    listeners: new Set(),
    refCount: 0,
    getUsers: () =>
      dedupePresenceUsers(flattenPresenceState(channel.presenceState())),
    emit: () => {
      bridge.listeners.forEach((listener) => listener());
    },
    ready: Promise.resolve(),
  };

  channel[PRESENCE_BRIDGE_KEY] = bridge;
  channel
    .on('presence', { event: 'sync' }, bridge.emit)
    .on('presence', { event: 'join' }, bridge.emit)
    .on('presence', { event: 'leave' }, bridge.emit);

  bridge.ready = subscribeChannel(channel).catch((error) => {
    delete channel[PRESENCE_BRIDGE_KEY];
    throw error;
  });

  return bridge;
};

const getPresenceBridge = async (
  client: SupabasePresenceClient,
  topic: string,
  context: ReviewPresenceContext,
  isPrivate: boolean
) => {
  const existingChannel = getTopicChannel(client, topic);
  const existingBridge = existingChannel?.[PRESENCE_BRIDGE_KEY];

  if (existingBridge) return existingBridge;

  if (existingChannel) {
    await removeTopicChannels(client, topic);
  }

  return createPresenceBridge(client, topic, context, isPrivate);
};

export const createSupabasePresenceAdapter = ({
  client,
  channelPrefix = 'review-presence',
  private: isPrivate = false,
}: SupabasePresenceAdapterOptions): ReviewPresenceAdapter => ({
  label: 'supabase-presence',
  connect: async (context: ReviewPresenceContext) => {
    const topic = getPresenceTopic(channelPrefix, context.projectId);
    const bridge = await getPresenceBridge(client, topic, context, isPrivate);
    const listeners = new Set<(users: ReviewPresenceUser[]) => void>();
    let currentState = context.initialState;
    bridge.refCount += 1;

    const getUsers = () =>
      sortPresenceUsers(
        [...bridge.getUsers()],
        context.sessionId
      );

    const emit = () => {
      const users = getUsers();
      listeners.forEach((listener) => listener(users));
    };

    const bridgeListener = () => emit();
    bridge.listeners.add(bridgeListener);

    await bridge.ready;
    await bridge.channel.track(currentState);
    bridge.emit();
    emit();

    return {
      update: async (state: Partial<ReviewPresenceState>) => {
        currentState = {
          ...currentState,
          ...state,
          sessionId: context.sessionId,
          userId: context.userId,
          displayName: context.displayName,
          color: context.color,
          updatedAt: new Date().toISOString(),
        };
        await bridge.channel.track(currentState);
      },
      subscribe: (callback) => {
        listeners.add(callback);
        callback(getUsers());

        return () => {
          listeners.delete(callback);
        };
      },
      disconnect: async () => {
        listeners.clear();
        bridge.listeners.delete(bridgeListener);
        bridge.refCount = Math.max(0, bridge.refCount - 1);
        if (bridge.refCount > 0) return;

        delete (bridge.channel as SupabasePresenceBridgeChannel)[
          PRESENCE_BRIDGE_KEY
        ];
        await bridge.channel.untrack();
        await client.removeChannel(bridge.channel);
      },
    };
  },
});
