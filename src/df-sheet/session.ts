import { createEndpointReviewFigmaImageStore } from '../figma/image.store';
import { configureReviewAnalytics, type ReviewAnalyticsConfig } from '../analytics';
import { createDfSheetSessionAdapter } from './adapter';
import { DfSheetReviewSessionExpiredError, requestDfSheet } from './http';
import type { ConnectDfSheetReviewOptions, DfSheetReviewSession, DfSheetReviewProject, DfSheetReviewUser, DfSheetReviewPage, DfSheetReviewAssignee } from './types';

export const DEFAULT_DF_SHEET_REVIEW_URL = 'https://df-sheet.vercel.app';

const SESSION_CLOCK_SKEW_MS = 30_000;

const SESSION_KEY_PREFIX = 'df-web-review-kit:df-sheet:session:';

const PENDING_KEY_PREFIX = 'df-web-review-kit:df-sheet:pending:';

const SELECTED_PAGE_KEY_PREFIX =
  'df-web-review-kit:df-sheet:selected-page:';

type StoredSession = {
  accessToken: string;
  analytics?: ReviewAnalyticsConfig;
  selectedPageId?: string;
  expiresAt: number;
  project: DfSheetReviewProject;
  user: DfSheetReviewUser;
};

type PendingLogin = {
  state: string;
  verifier: string;
  redirectUri: string;
  returnSearch: string;
  selectPage?: boolean;
};

type DfSheetTokenResponse = {
  access_token: string;
  analytics?: ReviewAnalyticsConfig;
  token_type: 'Bearer';
  expires_in: number;
  project: DfSheetReviewProject;
  user: DfSheetReviewUser;
};

/**
 * Connects a host-owned review page to df-sheet through df-login + PKCE.
 * Returns null only when the browser has been redirected to df-login.
 */
export async function connectDfSheetReview(
  options: ConnectDfSheetReviewOptions
): Promise<DfSheetReviewSession | null> {
  if (typeof window === 'undefined') {
    throw new Error('df-sheet review login is available only in a browser.');
  }

  const projectId = options.projectId.trim();
  if (!projectId) throw new Error('projectId is required.');

  const baseUrl = trimBaseUrl(options.baseUrl ?? DEFAULT_DF_SHEET_REVIEW_URL);
  const requestFetch = options.fetch ?? globalThis.fetch;
  if (!requestFetch) throw new Error('df-sheet review login requires fetch.');

  const sessionKey = `${SESSION_KEY_PREFIX}${projectId}`;
  const pendingKey = `${PENDING_KEY_PREFIX}${projectId}`;
  const cached = readStoredValue<StoredSession>(sessionKey);
  if (isStoredSession(cached, projectId) && cached.expiresAt > Date.now() + SESSION_CLOCK_SKEW_MS &&
      (!options.selectPage || cached.selectedPageId)) {
    return createSession({
      baseUrl,
      pendingKey,
      projectId,
      requestFetch,
      sessionKey,
      stored: cached,
      selectPage: options.selectPage,
    });
  }
  window.sessionStorage.removeItem(sessionKey);

  const currentUrl = new URL(window.location.href);
  const code = currentUrl.searchParams.get('code');
  const state = currentUrl.searchParams.get('state');
  const pending = readStoredValue<PendingLogin>(pendingKey);

  if (code && state) {
    if (!isPendingLogin(pending) || pending.state !== state) {
      throw new Error('The df-sheet login state is invalid. Reload and try again.');
    }

    const token = await requestDfSheet<DfSheetTokenResponse>(
      requestFetch,
      baseUrl,
      '/api/review/sso/token',
      undefined,
      {
        method: 'POST',
        body: JSON.stringify({
          code,
          redirect_uri: pending.redirectUri,
          code_verifier: pending.verifier,
        }),
      }
    );
    if (token.project.id !== projectId && token.project.key !== projectId) {
      throw new Error('df-sheet returned a different review project.');
    }

    window.sessionStorage.removeItem(pendingKey);
    window.history.replaceState(
      null,
      '',
      `${currentUrl.pathname}${pending.returnSearch}${currentUrl.hash}`
    );

    // The callback page is a UI preference, not an authorization scope.
    // Resolve it against the authenticated project's pages before using it.
    let selectedPageId: string | undefined;
    if (pending.selectPage || options.selectPage) {
      const pageId = currentUrl.searchParams.get('review_page_id');
      const pages = await requestDfSheet<DfSheetReviewPage[]>(
        requestFetch, baseUrl, '/api/review/pages', token.access_token
      );
      selectedPageId = pages.find((page) => page.id === pageId)?.id;
      if (!selectedPageId) {
        throw new Error('df-sheet did not return a valid review page. Reload to select a page again.');
      }
    }

    const stored: StoredSession = {
      accessToken: token.access_token,
      ...(isReviewAnalyticsConfig(token.analytics)
        ? { analytics: token.analytics }
        : {}),
      ...(selectedPageId ? { selectedPageId } : {}),
      expiresAt: Date.now() + token.expires_in * 1000,
      project: token.project,
      user: token.user,
    };
    window.sessionStorage.setItem(sessionKey, JSON.stringify(stored));
    return createSession({
      baseUrl,
      pendingKey,
      projectId,
      requestFetch,
      sessionKey,
      stored,
      selectPage: options.selectPage,
    });
  }

  const authorizeUrl = await createReviewAuthorizeUrl({
    baseUrl,
    pendingKey,
    projectId,
    selectPage: options.selectPage,
  });
  window.location.assign(authorizeUrl.toString());
  return null;
}

async function createReviewAuthorizeUrl(input: {
  baseUrl: string;
  pendingKey: string;
  projectId: string;
  selectPage?: boolean;
}) {
  const currentUrl = new URL(window.location.href);
  const redirectUri = `${currentUrl.origin}${currentUrl.pathname}`;
  const verifier = randomBase64Url(32);
  const nextPending: PendingLogin = {
    state: randomBase64Url(32),
    verifier,
    redirectUri,
    returnSearch: currentUrl.search,
    ...(input.selectPage ? { selectPage: true } : {}),
  };
  window.sessionStorage.setItem(input.pendingKey, JSON.stringify(nextPending));

  const authorizeUrl = new URL('/api/review/sso/authorize', input.baseUrl);
  authorizeUrl.searchParams.set('project_id', input.projectId);
  if (input.selectPage) authorizeUrl.searchParams.set('select_page', '1');
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('state', nextPending.state);
  authorizeUrl.searchParams.set('code_challenge', await createPkceChallenge(verifier));
  return authorizeUrl;
}

function createSession(input: {
  baseUrl: string;
  pendingKey: string;
  projectId: string;
  requestFetch: typeof fetch;
  sessionKey: string;
  stored: StoredSession;
  selectPage?: boolean;
}): DfSheetReviewSession {
  configureReviewAnalytics(input.stored.analytics, {
    projectId: input.stored.project.id,
    reviewerName: input.stored.user.name,
  });
  const sessionFetch: typeof fetch = async (url, init) => {
    const response = await input.requestFetch(url, init);
    if (response.status === 401) {
      // A late response from an old session must not clear a newer login.
      const cached = readStoredValue<StoredSession>(input.sessionKey);
      if (cached?.accessToken === input.stored.accessToken) {
        window.sessionStorage.removeItem(input.sessionKey);
      }
      throw new DfSheetReviewSessionExpiredError();
    }
    return response;
  };
  const request = <T>(path: string, init?: RequestInit) =>
    requestDfSheet<T>(
      sessionFetch,
      input.baseUrl,
      path,
      input.stored.accessToken,
      init
    );
  const disconnect = () => window.sessionStorage.removeItem(input.sessionKey);
  const selectedPageKey = createSelectedPageKey(
    input.stored.project.id,
    input.stored.user.user_id
  );
  let selectedPageId = input.stored.selectedPageId;

  const updateSelectedPageId = (pageId?: string) => {
    selectedPageId = pageId;
    if (pageId) {
      input.stored.selectedPageId = pageId;
      writeSelectedPageId(selectedPageKey, pageId);
    } else {
      delete input.stored.selectedPageId;
      removeSelectedPageId(selectedPageKey);
    }
    window.sessionStorage.setItem(
      input.sessionKey,
      JSON.stringify(input.stored)
    );
  };

  if (selectedPageId) {
    updateSelectedPageId(selectedPageId);
  }

  const resolveSelectedPageId = (pages: readonly DfSheetReviewPage[]) => {
    const rememberedPageId = readSelectedPageId(selectedPageKey);
    const candidate = selectedPageId ?? rememberedPageId;
    const resolved = pages.find((page) => page.id === candidate)?.id;

    if (!resolved) {
      updateSelectedPageId();
      return undefined;
    }

    updateSelectedPageId(resolved);
    return resolved;
  };

  const rememberSelectedPageId = (
    pageId: string,
    pages: readonly DfSheetReviewPage[]
  ) => {
    const resolved = pages.find((page) => page.id === pageId)?.id;
    if (!resolved) {
      throw new Error('Cannot remember a page outside the authenticated project.');
    }
    updateSelectedPageId(resolved);
  };

  return {
    analytics: input.stored.analytics,
    project: input.stored.project,
    get selectedPageId() {
      return selectedPageId;
    },
    user: input.stored.user,
    expiresAt: input.stored.expiresAt,
    listPages: () => request<DfSheetReviewPage[]>('/api/review/pages'),
    listAssignees: () =>
      request<DfSheetReviewAssignee[]>('/api/review/assignees'),
    resolveSelectedPageId,
    rememberSelectedPageId,
    createAdapter: (options) =>
      createDfSheetSessionAdapter({
        ...options,
        baseUrl: input.baseUrl,
        projectId: input.stored.project.id,
        user: input.stored.user,
        request,
      }),
    figmaImageStore: createEndpointReviewFigmaImageStore({
      endpoint: `${input.baseUrl}/api/review/figma-images`,
      fetch: sessionFetch,
      headers: { Authorization: `Bearer ${input.stored.accessToken}` },
      token: () => null,
    }),
    disconnect,
    createLogoutUrl: async () => {
      const authorizeUrl = await createReviewAuthorizeUrl(input);
      const logoutUrl = new URL('/api/auth/logout', input.baseUrl);
      logoutUrl.searchParams.set(
        'from',
        `${authorizeUrl.pathname}${authorizeUrl.search}`
      );
      return logoutUrl.toString();
    },
  };
}

async function createPkceChallenge(verifier: string) {
  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier)
  );
  return bytesToBase64Url(new Uint8Array(digest));
}

function randomBase64Url(size: number) {
  const bytes = new Uint8Array(size);
  window.crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window
    .btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function readStoredValue<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function createSelectedPageKey(projectId: string, userId: string) {
  return `${SELECTED_PAGE_KEY_PREFIX}${encodeURIComponent(
    projectId
  )}:${encodeURIComponent(userId)}`;
}

function readSelectedPageId(key: string) {
  try {
    return window.localStorage.getItem(key)?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function writeSelectedPageId(key: string, pageId: string) {
  try {
    window.localStorage.setItem(key, pageId);
  } catch {
    // Page persistence is a convenience and must not block review access.
  }
}

function removeSelectedPageId(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Page persistence is a convenience and must not block review access.
  }
}

function isStoredSession(
  value: StoredSession | null,
  projectId: string
): value is StoredSession {
  return Boolean(
    value?.accessToken &&
      value.expiresAt &&
      (value.project?.id === projectId || value.project?.key === projectId)
  );
}

function isPendingLogin(value: PendingLogin | null): value is PendingLogin {
  return Boolean(value?.state && value.verifier && value.redirectUri);
}

function isReviewAnalyticsConfig(
  value: ReviewAnalyticsConfig | undefined
): value is ReviewAnalyticsConfig {
  return Boolean(
    value?.provider === 'amplitude' &&
      typeof value.apiKey === 'string' &&
      value.apiKey.trim()
  );
}

function trimBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}
