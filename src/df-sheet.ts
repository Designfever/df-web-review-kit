import {
  createEndpointReviewFigmaImageStore,
} from './figma/image.store';
import type { ReviewFigmaImageStore } from './figma/image.types';
import { REVIEW_WORKFLOW_STATUS_OPTIONS } from './status';
import type {
  ReviewAttachment,
  ReviewAttachmentUploadInput,
  ReviewItem,
  ReviewItemQuery,
  WebReviewKitAdapter,
} from './types';
import type {
  ReviewShellAdapter,
  ReviewShellAssigneeOption,
} from './react-shell/types';

export const DEFAULT_DF_SHEET_REVIEW_URL = 'https://df-sheet.vercel.app';

const SESSION_CLOCK_SKEW_MS = 30_000;
const SESSION_KEY_PREFIX = 'df-web-review-kit:df-sheet:session:';
const PENDING_KEY_PREFIX = 'df-web-review-kit:df-sheet:pending:';

export type DfSheetReviewPage = {
  id: string;
  name: string;
};

export type DfSheetReviewProject = {
  id: string;
  key: string;
};

export type DfSheetReviewUser = {
  user_id: string;
  name: string | null;
};

export type DfSheetReviewAssignee = ReviewShellAssigneeOption;

export type ConnectDfSheetReviewOptions = {
  projectId: string;
  baseUrl?: string;
  fetch?: typeof fetch;
};

export type DfSheetReviewAdapterOptions = {
  pageId: string;
  source?: string;
  reviewPathPrefix?: string;
  fields?: ReviewShellAdapter['fields'];
  buildPrompt?: (item: ReviewItem) => string | undefined;
  assigneeTitle?: string;
  assigneeOptions?: readonly ReviewShellAssigneeOption[];
};

export type DfSheetReviewSession = {
  project: DfSheetReviewProject;
  user: DfSheetReviewUser;
  expiresAt: number;
  listPages: () => Promise<DfSheetReviewPage[]>;
  listAssignees: () => Promise<DfSheetReviewAssignee[]>;
  createAdapter: (options: DfSheetReviewAdapterOptions) => ReviewShellAdapter;
  figmaImageStore: ReviewFigmaImageStore;
  disconnect: () => void;
  createLogoutUrl: () => Promise<string>;
};

type StoredSession = {
  accessToken: string;
  expiresAt: number;
  project: DfSheetReviewProject;
  user: DfSheetReviewUser;
};

type PendingLogin = {
  state: string;
  verifier: string;
  redirectUri: string;
  returnSearch: string;
};

type DfSheetEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

type DfSheetTokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  project: DfSheetReviewProject;
  user: DfSheetReviewUser;
};

type DfSheetIngestResult = {
  id: string;
  project_id: string;
  sequence: number;
};

export class DfSheetReviewSessionExpiredError extends Error {
  constructor() {
    super('Your df-sheet review session expired. Reload this page to sign in again.');
    this.name = 'DfSheetReviewSessionExpiredError';
  }
}

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
  if (isStoredSession(cached, projectId) && cached.expiresAt > Date.now() + SESSION_CLOCK_SKEW_MS) {
    return createSession({
      baseUrl,
      pendingKey,
      projectId,
      requestFetch,
      sessionKey,
      stored: cached,
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

    const stored: StoredSession = {
      accessToken: token.access_token,
      expiresAt: Date.now() + token.expires_in * 1000,
      project: token.project,
      user: token.user,
    };
    window.sessionStorage.setItem(sessionKey, JSON.stringify(stored));
    window.sessionStorage.removeItem(pendingKey);
    window.history.replaceState(
      null,
      '',
      `${currentUrl.pathname}${pending.returnSearch}${currentUrl.hash}`
    );
    return createSession({
      baseUrl,
      pendingKey,
      projectId,
      requestFetch,
      sessionKey,
      stored,
    });
  }

  const authorizeUrl = await createReviewAuthorizeUrl({
    baseUrl,
    pendingKey,
    projectId,
  });
  window.location.assign(authorizeUrl.toString());
  return null;
}

async function createReviewAuthorizeUrl(input: {
  baseUrl: string;
  pendingKey: string;
  projectId: string;
}) {
  const currentUrl = new URL(window.location.href);
  const redirectUri = `${currentUrl.origin}${currentUrl.pathname}`;
  const verifier = randomBase64Url(32);
  const nextPending: PendingLogin = {
    state: randomBase64Url(32),
    verifier,
    redirectUri,
    returnSearch: currentUrl.search,
  };
  window.sessionStorage.setItem(input.pendingKey, JSON.stringify(nextPending));

  const authorizeUrl = new URL('/api/review/sso/authorize', input.baseUrl);
  authorizeUrl.searchParams.set('project_id', input.projectId);
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
}): DfSheetReviewSession {
  const request = <T>(path: string, init?: RequestInit) =>
    requestDfSheet<T>(
      input.requestFetch,
      input.baseUrl,
      path,
      input.stored.accessToken,
      init
    );
  const disconnect = () => window.sessionStorage.removeItem(input.sessionKey);

  return {
    project: input.stored.project,
    user: input.stored.user,
    expiresAt: input.stored.expiresAt,
    listPages: () => request<DfSheetReviewPage[]>('/api/review/pages'),
    listAssignees: () =>
      request<DfSheetReviewAssignee[]>('/api/review/assignees'),
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
      fetch: input.requestFetch,
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

function createDfSheetSessionAdapter(
  options: DfSheetReviewAdapterOptions & {
    baseUrl: string;
    projectId: string;
    user: DfSheetReviewUser;
    request: <T>(path: string, init?: RequestInit) => Promise<T>;
  }
): ReviewShellAdapter {
  const source = options.source ?? 'df-sheet';
  const inflightLists = new Map<string, Promise<ReviewItem[]>>();
  let lastItems: ReviewItem[] = [];

  const findItem = (items: ReviewItem[], id: string) =>
    items.find((item) => item.id === id || item.externalIssueId === id) ?? null;
  const listItems = (query?: ReviewItemQuery) => {
    const params = new URLSearchParams({ page_id: options.pageId });
    const routeKey = query?.routeKey ?? query?.normalizedPath;
    if (routeKey) params.set('route_key', routeKey);
    const cacheKey = params.toString();
    const inflight = inflightLists.get(cacheKey);
    if (inflight) return inflight;

    const next = options
      .request<ReviewItem[]>(`/api/review/items?${cacheKey}`)
      .then((items) => {
        lastItems = items;
        return items;
      })
      .finally(() => inflightLists.delete(cacheKey));
    inflightLists.set(cacheKey, next);
    return next;
  };

  const core: WebReviewKitAdapter = {
    list: listItems,
    get: async (id) => {
      const cached = findItem(lastItems, id);
      if (cached) return cached;
      const pending = await Promise.allSettled(inflightLists.values());
      for (const result of pending) {
        if (result.status !== 'fulfilled') continue;
        const item = findItem(result.value, id);
        if (item) return item;
      }
      return findItem(await listItems(), id);
    },
    create: async (item) => {
      const reviewUrl = buildReviewPermalink(
        item,
        source,
        options.reviewPathPrefix ?? '/review'
      );
      const data = await options.request<DfSheetIngestResult>(
        '/api/review/ingest',
        {
          method: 'POST',
          body: JSON.stringify({
            page_id: options.pageId,
            comment: item.comment,
            title: item.title,
            review_url: reviewUrl,
            source,
            prompt: options.buildPrompt?.(item),
            review_item: item,
          }),
        }
      );
      return {
        ...item,
        reviewNumber: data.sequence ?? item.reviewNumber,
        externalIssueId: data.id,
        externalIssueUrl: `${options.baseUrl}/projects/${data.project_id}/issues/${data.id}`,
        submitStatus: 'submitted',
        submittedAt: item.submittedAt ?? new Date().toISOString(),
      };
    },
    uploadAttachment: (attachment) =>
      uploadDfSheetAttachment(options, attachment),
    update: (id, patch) =>
      options.request<ReviewItem>(`/api/review/issues/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ patch }),
      }),
    remove: async (id) => {
      await options.request(`/api/review/issues/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  };

  return {
    label: source,
    pageId: options.pageId,
    defaultUserId: options.user.user_id,
    get: core.get,
    list: core.list,
    create: core.create,
    update: core.update,
    uploadAttachment: core.uploadAttachment,
    remove: core.remove,
    canWrite: ['dom', 'area'],
    fields: options.fields,
    statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
    updateStatus: ({ id, status }) => core.update(id, { status }),
    assigneeTitle: options.assigneeTitle,
    assigneeOptions: options.assigneeOptions ?? [],
    updateAssignee: ({
      id,
      assigneeId,
      assigneeName,
      assigneeIds,
      assigneeNames,
    }) =>
      core.update(id, {
        assigneeId,
        assigneeName,
        assigneeIds,
        assigneeNames,
      }),
  };
}

async function uploadDfSheetAttachment(
  options: {
    request: <T>(path: string, init?: RequestInit) => Promise<T>;
  },
  input: ReviewAttachmentUploadInput
): Promise<ReviewAttachment> {
  const name =
    input.name || (input.file instanceof File ? input.file.name : '') || 'attachment';
  const form = new FormData();
  form.set('file', input.file, name);
  form.set('name', name);
  if (input.mime || input.file.type) form.set('mime', input.mime || input.file.type);
  if (input.kind) form.set('kind', input.kind);
  if (input.item?.id) form.set('item_id', input.item.id);
  if (input.metadata) form.set('metadata', JSON.stringify(input.metadata));
  return options.request<ReviewAttachment>('/api/review/attachments', {
    method: 'POST',
    body: form,
  });
}

async function requestDfSheet<T>(
  requestFetch: typeof fetch,
  baseUrl: string,
  path: string,
  accessToken?: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await requestFetch(`${baseUrl}${path}`, { ...init, headers });
  const body = (await response.json().catch(() => null)) as DfSheetEnvelope<T> | null;
  if (response.status === 401 && accessToken) {
    throw new DfSheetReviewSessionExpiredError();
  }
  if (!response.ok || body?.success !== true || !('data' in body)) {
    throw new Error(
      body?.message || body?.error || `df-sheet request failed (${response.status} ${path}).`
    );
  }
  return body.data as T;
}

function buildReviewPermalink(item: ReviewItem, source: string, prefix: string) {
  const url = new URL(prefix, window.location.origin);
  url.searchParams.set('source', source);
  url.searchParams.set('target', item.routeKey || item.normalizedPath || '/');
  url.searchParams.set('w', String(Math.round(item.viewport.width)));
  url.searchParams.set('h', String(Math.round(item.viewport.height)));
  url.searchParams.set('item', item.id);
  return url.toString();
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

function trimBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}
