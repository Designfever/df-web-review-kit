import type {
  DfSheetAdapterOptions,
  ReviewItem,
  ReviewItemKind,
  ReviewItemStatus,
  WebReviewKitAdapter,
} from '../types';

export const DF_SHEET_REVIEW_SOURCE = 'df-web-review-kit';
const REVIEW_METADATA_VERSION = 1;

type DfSheetIssue = {
  id: string;
  project_id: string;
  page_id?: string | null;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  links?: string | null;
  review_metadata?: unknown;
  created_at: string;
  updated_at?: string | null;
};

type DfSheetApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

type ReviewMetadata = Partial<ReviewItem> & {
  source?: string;
  schema?: string;
  version?: number;
  reviewProjectId?: string;
  reviewUrl?: string;
};

export function dfSheetAdapter(
  options: DfSheetAdapterOptions
): WebReviewKitAdapter {
  return {
    async get(id) {
      const issue = await requestDfSheet<DfSheetIssue>(
        `/api/issues/${encodeURIComponent(id)}`,
        options
      );
      return issueToReviewItem(issue, options);
    },

    async list(query) {
      const params = new URLSearchParams();
      params.set('project_id', options.projectId);
      params.set('page_id', options.pageId);
      params.set('review_source', options.source ?? DF_SHEET_REVIEW_SOURCE);
      if (query.routeKey ?? query.normalizedPath) {
        params.set('review_route_key', query.routeKey ?? query.normalizedPath ?? '');
      }

      const issues = await requestDfSheet<DfSheetIssue[]>(
        `/api/issues?${params.toString()}`,
        options
      );
      return issues.flatMap((issue) => {
        const item = issueToReviewItem(issue, options);
        return item ? [item] : [];
      });
    },

    async create(item) {
      const metadata = createReviewMetadata(item, options);
      const draftDescription = buildIssueDescription(item, metadata);
      const created = await requestDfSheet<DfSheetIssue>('/api/issues', options, {
        method: 'POST',
        body: JSON.stringify({
          project_id: options.projectId,
          page_id: options.pageId,
          title: buildIssueTitle(item),
          description: draftDescription,
          type: options.issueType ?? 'task',
          types: [options.issueType ?? 'task'],
          status: 'todo',
          priority: options.priority ?? 'medium',
          links: metadata.reviewUrl ?? null,
          review_metadata: metadata,
        }),
      });

      const externalIssueId = created.id;
      const externalIssueUrl = buildIssueUrl(options, externalIssueId);
      const finalMetadata: ReviewMetadata = {
        ...metadata,
        externalIssueId,
        externalIssueUrl,
        reviewUrl: buildReviewUrl(item, options, externalIssueId),
        submittedAt: new Date().toISOString(),
        submitStatus: 'submitted',
      };

      const patched = await requestDfSheet<DfSheetIssue>(
        `/api/issues/${encodeURIComponent(externalIssueId)}`,
        options,
        {
          method: 'PATCH',
          body: JSON.stringify({
            description: buildIssueDescription(item, finalMetadata),
            links: finalMetadata.reviewUrl,
            review_metadata: finalMetadata,
          }),
        }
      );

      return issueToReviewItem(patched, options) ?? {
        ...item,
        id: externalIssueId,
        externalIssueId,
        externalIssueUrl,
        submittedAt: finalMetadata.submittedAt,
        submitStatus: 'submitted',
        updatedAt: finalMetadata.submittedAt ?? item.updatedAt,
      };
    },

    async update() {
      throw new Error('df-sheet review items are read-only in review-kit.');
    },

    async remove() {
      throw new Error('df-sheet review items are read-only in review-kit.');
    },
  };
}

function createReviewMetadata(
  item: ReviewItem,
  options: DfSheetAdapterOptions
): ReviewMetadata {
  return {
    source: options.source ?? DF_SHEET_REVIEW_SOURCE,
    schema: DF_SHEET_REVIEW_SOURCE,
    version: REVIEW_METADATA_VERSION,
    reviewProjectId: options.reviewProjectId ?? item.projectId,
    id: item.id,
    reviewNumber: item.reviewNumber,
    projectId: item.projectId,
    routeKey: item.routeKey,
    pageUrl: item.pageUrl,
    originalUrl: item.originalUrl,
    normalizedPath: item.normalizedPath,
    scope: item.scope,
    kind: item.kind,
    title: item.title,
    comment: item.comment,
    createdBy: item.createdBy,
    status: item.status,
    viewport: item.viewport,
    devicePixelRatio: item.devicePixelRatio,
    scroll: item.scroll,
    anchor: item.anchor,
    marker: item.marker,
    selection: item.selection,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    reviewUrl: buildReviewUrl(item, options),
  };
}

function issueToReviewItem(
  issue: DfSheetIssue,
  options: DfSheetAdapterOptions
): ReviewItem | null {
  const metadata = getReviewMetadata(issue);
  if (!metadata) return null;

  const routeKey = metadata.routeKey ?? metadata.normalizedPath ?? '/';
  const now = new Date().toISOString();

  return {
    id: issue.id,
    reviewNumber: metadata.reviewNumber,
    projectId:
      metadata.reviewProjectId ?? metadata.projectId ?? options.reviewProjectId ?? options.projectId,
    routeKey,
    pageUrl:
      metadata.pageUrl ??
      metadata.originalUrl ??
      toAbsoluteReviewUrl(routeKey),
    originalUrl: metadata.originalUrl,
    normalizedPath: metadata.normalizedPath ?? routeKey,
    scope: metadata.scope,
    kind: normalizeKind(metadata.kind),
    title: metadata.title ?? issue.title,
    comment: metadata.comment ?? issue.title,
    createdBy: metadata.createdBy,
    status: mapIssueStatus(issue.status ?? metadata.status),
    viewport: metadata.viewport ?? { width: 390, height: 720 },
    devicePixelRatio: metadata.devicePixelRatio,
    scroll: metadata.scroll,
    anchor: metadata.anchor,
    marker: metadata.marker,
    selection: metadata.selection,
    externalIssueId: issue.id,
    externalIssueUrl:
      metadata.externalIssueUrl ?? buildIssueUrl(options, issue.id),
    submittedAt: metadata.submittedAt ?? issue.created_at,
    submitStatus: 'submitted',
    createdAt: metadata.createdAt ?? issue.created_at ?? now,
    updatedAt: issue.updated_at ?? metadata.updatedAt ?? issue.created_at ?? now,
  };
}

function getReviewMetadata(issue: DfSheetIssue): ReviewMetadata | null {
  const metadata = issue.review_metadata;
  if (!metadata || typeof metadata !== 'object') return null;

  const value = metadata as ReviewMetadata;
  if (value.source !== DF_SHEET_REVIEW_SOURCE) return null;
  return value;
}

async function requestDfSheet<T>(
  path: string,
  options: DfSheetAdapterOptions,
  init: RequestInit = {}
) {
  const url = new URL(path, getDfSheetBaseUrl(options)).toString();
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
  const json = (await response.json().catch(() => null)) as
    | DfSheetApiResponse<T>
    | null;

  if (!response.ok || !json?.success || json.data === undefined) {
    throw new Error(
      json?.message ?? json?.error ?? `df-sheet request failed: ${response.status}`
    );
  }

  return json.data;
}

function getDfSheetBaseUrl(options: DfSheetAdapterOptions) {
  const baseUrl = options.baseUrl?.trim();
  if (baseUrl) return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost';
}

function buildIssueTitle(item: ReviewItem) {
  const reviewId = formatReviewItemIndexId(item);
  const idPrefix = reviewId ? `${reviewId} ` : '';
  const prefix = item.kind === 'area' ? '[Area]' : '[Note]';
  const summary = item.title || item.comment.split('\n')[0] || 'Review item';
  return `${idPrefix}${prefix} ${summary}`.slice(0, 120);
}

function buildIssueDescription(item: ReviewItem, metadata: ReviewMetadata) {
  const reviewId = formatReviewItemIndexId(item);

  return [
    'df-web-review-kit issue',
    '',
    reviewId ? `Review ID: ${reviewId}` : null,
    `Kind: ${item.kind}`,
    `Page: ${item.routeKey || item.normalizedPath || '/'}`,
    `Viewport: ${Math.round(item.viewport.width)}x${Math.round(item.viewport.height)}`,
    item.scroll ? `Scroll: ${Math.round(item.scroll.x)},${Math.round(item.scroll.y)}` : null,
    item.anchor?.selector ? `Selector: ${item.anchor.selector}` : null,
    item.marker?.viewport
      ? `Point: ${Math.round(item.marker.viewport.x)},${Math.round(item.marker.viewport.y)}`
      : null,
    item.selection?.viewport
      ? `Area: ${Math.round(item.selection.viewport.x)},${Math.round(item.selection.viewport.y)},${Math.round(item.selection.viewport.width)},${Math.round(item.selection.viewport.height)}`
      : null,
    metadata.reviewUrl ? `Review link: ${metadata.reviewUrl}` : null,
    '',
    'Note:',
    item.comment,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

function formatReviewItemIndexId(item: Pick<ReviewItem, 'id' | 'reviewNumber'>) {
  if (typeof item.reviewNumber === 'number' && item.reviewNumber > 0) {
    return `#${item.reviewNumber}`;
  }

  return /^\d+$/.test(item.id) ? `#${item.id}` : undefined;
}

function buildReviewUrl(
  item: ReviewItem,
  options: DfSheetAdapterOptions,
  issueId?: string
) {
  if (typeof window === 'undefined') return undefined;

  const prefix = options.reviewPathPrefix ?? '/review';
  const url = new URL(prefix, window.location.origin);
  url.searchParams.set('source', 'df-sheet');
  url.searchParams.set('target', item.routeKey || item.normalizedPath || '/');
  url.searchParams.set('w', String(Math.round(item.viewport.width)));
  url.searchParams.set('h', String(Math.round(item.viewport.height)));
  if (issueId) url.searchParams.set('item', issueId);
  return url.toString();
}

function buildIssueUrl(options: DfSheetAdapterOptions, issueId: string) {
  const path = `/projects/${options.projectId}/issues/${issueId}`;
  return options.baseUrl ? new URL(path, getDfSheetBaseUrl(options)).toString() : path;
}

function toAbsoluteReviewUrl(path: string) {
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).toString();
}

function normalizeKind(value: unknown): ReviewItemKind {
  return value === 'area' ? 'area' : 'note';
}

function mapIssueStatus(value: unknown): ReviewItemStatus {
  if (value === 'done' || value === 'review' || value === 'todo') return value;
  if (value === 'in_progress') return 'doing';
  if (value === 'on_hold') return 'hold';
  return 'todo';
}
