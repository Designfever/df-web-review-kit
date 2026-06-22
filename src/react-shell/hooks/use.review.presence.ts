import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { NumberedReviewItem, ReviewMode, ReviewSource } from '../../types';
import {
  getReviewPresenceColor,
  getReviewPresenceDisplayName,
  getReviewPresenceSessionId,
} from '../presence/presence';
import { normalizeTarget } from '../route';
import type {
  ReviewPresenceAdapter,
  ReviewPresenceSession,
  ReviewPresenceState,
  ReviewPresenceStatus,
  ReviewPresenceUser,
  ReviewShellViewportPreset,
} from '../types';
import { getViewportPresetKind } from '../viewport';

interface UseReviewPresenceOptions {
  activeRoute: string;
  mode: ReviewMode;
  presence?: ReviewPresenceAdapter;
  projectId: string;
  reviewPathPrefix: string;
  reviewUserId: string;
  selectedNumberedItem?: NumberedReviewItem;
  size: ReviewShellViewportPreset;
  source: ReviewSource;
}

const getPresenceUserTarget = (
  user: ReviewPresenceUser,
  reviewPathPrefix: string
) => normalizeTarget(user.target || user.routeKey, reviewPathPrefix);

const dedupePresenceUsersByPageAndId = (
  users: ReviewPresenceUser[],
  reviewPathPrefix: string
) => {
  const userByPageAndId = new Map<string, ReviewPresenceUser>();

  users.forEach((user) => {
    const userId = user.userId.trim();
    if (!userId) return;

    const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
    const key = `${userTarget}::${userId}`;
    const currentUser = userByPageAndId.get(key);

    if (
      !currentUser ||
      Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)
    ) {
      userByPageAndId.set(key, user);
    }
  });

  return Array.from(userByPageAndId.values());
};

export const useReviewPresence = ({
  activeRoute,
  mode,
  presence,
  projectId,
  reviewPathPrefix,
  reviewUserId,
  selectedNumberedItem,
  size,
  source,
}: UseReviewPresenceOptions) => {
  const presenceSessionRef = useRef<ReviewPresenceSession | null>(null);
  const [presenceUsers, setPresenceUsers] = useState<ReviewPresenceUser[]>([]);
  const [presenceSessionVersion, setPresenceSessionVersion] = useState(0);
  const presenceSessionId = useMemo(getReviewPresenceSessionId, []);
  const normalizedReviewUserId = reviewUserId.trim();
  const presenceDisplayName = getReviewPresenceDisplayName(
    normalizedReviewUserId
  );
  const presenceColor = getReviewPresenceColor(
    normalizedReviewUserId || presenceSessionId
  );
  const presenceViewport = useMemo(
    () => ({
      label: size.label,
      width: size.width,
      height: size.height,
      kind: getViewportPresetKind(size),
    }),
    [size]
  );
  const presenceStatus: ReviewPresenceStatus =
    mode === 'idle' ? 'reviewing' : 'editing';
  const visiblePresenceUsers = useMemo(
    () => {
      const projectPresenceUsers = presenceUsers.filter(
        (user) => user.projectId === projectId && user.userId.trim()
      );

      return dedupePresenceUsersByPageAndId(
        projectPresenceUsers,
        reviewPathPrefix
      );
    },
    [presenceUsers, projectId, reviewPathPrefix]
  );
  const currentPagePresenceUsers = useMemo(
    () =>
      visiblePresenceUsers.filter((user) => {
        const userTarget = getPresenceUserTarget(user, reviewPathPrefix);

        return userTarget === activeRoute;
      }),
    [activeRoute, reviewPathPrefix, visiblePresenceUsers]
  );
  const pagePresenceUsers = useMemo(() => {
    const usersByTarget = new Map<string, ReviewPresenceUser[]>();

    visiblePresenceUsers.forEach((user) => {
      const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
      const pageUsers = usersByTarget.get(userTarget) ?? [];

      pageUsers.push(user);
      usersByTarget.set(userTarget, pageUsers);
    });

    return usersByTarget;
  }, [reviewPathPrefix, visiblePresenceUsers]);

  const getCurrentPresenceState = useCallback(
    (): ReviewPresenceState => ({
      projectId,
      sessionId: presenceSessionId,
      userId: normalizedReviewUserId,
      displayName: presenceDisplayName,
      color: presenceColor,
      routeKey: activeRoute,
      target: activeRoute,
      source,
      viewport: presenceViewport,
      mode,
      selectedItemId: selectedNumberedItem?.item.id ?? null,
      selectedReviewNumber: selectedNumberedItem?.number ?? null,
      status: presenceStatus,
      updatedAt: new Date().toISOString(),
    }),
    [
      activeRoute,
      mode,
      normalizedReviewUserId,
      presenceColor,
      presenceDisplayName,
      presenceSessionId,
      presenceStatus,
      presenceViewport,
      projectId,
      selectedNumberedItem,
      source,
    ]
  );
  const getCurrentPresenceStateRef = useRef(getCurrentPresenceState);
  getCurrentPresenceStateRef.current = getCurrentPresenceState;

  useEffect(() => {
    if (!presence || !normalizedReviewUserId) {
      const session = presenceSessionRef.current;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
      void session?.disconnect();
      return undefined;
    }

    let isActive = true;
    let unsubscribe: (() => void) | undefined;
    const initialState = getCurrentPresenceStateRef.current();

    void Promise.resolve(
      presence.connect({
        projectId,
        sessionId: presenceSessionId,
        userId: normalizedReviewUserId,
        displayName: presenceDisplayName,
        color: presenceColor,
        initialState,
      })
    ).then((session) => {
      if (!isActive) {
        void session.disconnect();
        return;
      }

      presenceSessionRef.current = session;
      unsubscribe = session.subscribe(setPresenceUsers);
      setPresenceSessionVersion((current) => current + 1);
      void session.update(initialState);
    }).catch(() => {
      if (!isActive) return;

      presenceSessionRef.current = null;
      setPresenceUsers([]);
    });

    return () => {
      isActive = false;
      unsubscribe?.();
      const session = presenceSessionRef.current;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
      void session?.disconnect();
    };
  }, [
    normalizedReviewUserId,
    presence,
    presenceColor,
    presenceDisplayName,
    presenceSessionId,
    projectId,
  ]);

  useEffect(() => {
    const session = presenceSessionRef.current;
    if (!session || !normalizedReviewUserId) return;

    void session.update(getCurrentPresenceState());
  }, [
    getCurrentPresenceState,
    normalizedReviewUserId,
    presenceSessionVersion,
  ]);

  return {
    currentPagePresenceUsers,
    pagePresenceUsers,
    presenceSessionId,
  };
};
