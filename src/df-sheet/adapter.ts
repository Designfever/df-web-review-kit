import { REVIEW_WORKFLOW_STATUS_OPTIONS } from '../status';
import type { ReviewAttachment, ReviewAttachmentUploadInput, ReviewItem, ReviewItemQuery, WebReviewKitAdapter } from '../types';
import type { ReviewShellAdapter } from '../react-shell/types';
import type { DfSheetReviewAdapterOptions, DfSheetReviewUser } from './types';

type DfSheetIngestResult = {
  id: string;
  project_id: string;
  sequence: number;
};

export function createDfSheetSessionAdapter(
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

function buildReviewPermalink(item: ReviewItem, source: string, prefix: string) {
  const url = new URL(prefix, window.location.origin);
  url.searchParams.set('source', source);
  url.searchParams.set('target', item.routeKey || item.normalizedPath || '/');
  url.searchParams.set('w', String(Math.round(item.viewport.width)));
  url.searchParams.set('h', String(Math.round(item.viewport.height)));
  url.searchParams.set('item', item.id);
  return url.toString();
}
