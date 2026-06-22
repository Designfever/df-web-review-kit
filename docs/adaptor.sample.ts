import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  type ReviewItem,
  type ReviewItemQuery,
  type ReviewItemStatus,
  type ReviewSource,
  type WebReviewKitAdapter,
} from '@designfever/web-review-kit';
import type {
  ReviewShellAdapter,
} from '@designfever/web-review-kit/react-shell';

type RemoteReviewAdapterOptions = {
  baseUrl: string;
  projectId: string;
  source?: ReviewSource;
  token?: string;
};

type RemoteReviewItemResponse = ReviewItem | { item: ReviewItem };

/*
 * WebReviewKitAdapter is the core storage contract.
 *
 * ReviewItem is the full QA payload. Persist it as structured JSON so marker,
 * anchor, selection, viewport, scroll, status, and external issue fields survive.
 *
 * ReviewItemQuery is used by the shell for current-page lists and sitemap counts.
 * A remote backend should support at least projectId, routeKey, status, source,
 * and pageId when the host project needs page-level grouping.
 *
 * Keep private tokens, admin keys, numbering, and permission checks in your
 * backend. Browser code should only call browser-safe endpoints.
 */
export function createRemoteReviewAdapter(
  options: RemoteReviewAdapterOptions
): WebReviewKitAdapter {
  const source = options.source ?? 'remote';

  return {
    async get(id) {
      return readReviewItem(
        await requestJson<RemoteReviewItemResponse>(
          `/review-items/${encodeURIComponent(id)}`,
          options
        )
      );
    },

    async list(query) {
      const rows = await requestJson<RemoteReviewItemResponse[]>(
        `/review-items?${createListParams(query, source).toString()}`,
        options
      );

      return rows.map(readReviewItem);
    },

    async create(item) {
      return readReviewItem(
        await requestJson<RemoteReviewItemResponse>('/review-items', options, {
          method: 'POST',
          body: JSON.stringify({
            project_id: options.projectId,
            source,
            item,
          }),
        })
      );
    },

    async update(id, patch) {
      return readReviewItem(
        await requestJson<RemoteReviewItemResponse>(
          `/review-items/${encodeURIComponent(id)}`,
          options,
          {
            method: 'PATCH',
            body: JSON.stringify({ patch }),
          }
        )
      );
    },

    async remove(id) {
      await requestJson<void>(
        `/review-items/${encodeURIComponent(id)}`,
        options,
        { method: 'DELETE' }
      );
    },
  };
}

/*
 * ReviewShellAdapter is the React shell wiring.
 *
 * label becomes the URL source, for example /review?source=remote.
 * create controls whether the shell can write to this adapter.
 * canWrite can be true or limited to ['dom', 'note', 'area'].
 * updateStatus drives the status buttons in the QA panel.
 * remove enables delete actions for this source.
 */
export function createRemoteReviewShellAdapter(
  options: RemoteReviewAdapterOptions
): ReviewShellAdapter {
  const adapter = createRemoteReviewAdapter(options);

  return {
    label: options.source ?? 'remote',
    get: (id) => adapter.get(id),
    list: (query) => adapter.list(query),
    create: (item) => adapter.create(item),
    canWrite: true,
    statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
    updateStatus: ({ id, status }) =>
      adapter.update(id, { status: normalizeRemoteStatus(status) }),
    remove: (id) => adapter.remove(id),
  };
}

function appendParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined
) {
  if (value) params.set(key, value);
}

function createListParams(query: ReviewItemQuery, source: ReviewSource) {
  const params = new URLSearchParams();
  params.set('project_id', query.projectId);
  params.set('source', query.source ?? source);
  appendParam(params, 'page_id', query.pageId);
  appendParam(params, 'route_key', query.routeKey ?? query.normalizedPath);
  appendParam(params, 'status', query.status);
  return params;
}

async function requestJson<T>(
  path: string,
  options: RemoteReviewAdapterOptions,
  init: RequestInit = {}
) {
  const url = new URL(path, ensureTrailingSlash(options.baseUrl));
  const headers = new Headers(init.headers);

  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`remote review adapter request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

function readReviewItem(response: RemoteReviewItemResponse) {
  return 'item' in response ? response.item : response;
}

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}

function normalizeRemoteStatus(status: ReviewItemStatus) {
  if (status === 'open') return 'todo';
  if (status === 'resolved') return 'done';
  return status;
}
