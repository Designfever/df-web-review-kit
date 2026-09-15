import type { ReviewItem, WebReviewKitOptions } from '../../types';
import type { DraftItemFields } from './draft.builder';
import { getReviewViewportScope } from './scope';

/** Normalize form fields using an explicit persistence/environment snapshot. */
export function buildReviewItemPayload({
  input, options, id, now, routeKey, pageUrl, originalUrl, viewport,
  devicePixelRatio, scroll,
}: {
  input: DraftItemFields & Pick<ReviewItem, 'kind' | 'comment'> &
    Partial<Pick<ReviewItem, 'scope' | 'anchor' | 'marker' | 'selection'>>;
  options: Pick<WebReviewKitOptions, 'projectId' | 'userId' | 'assigneeOptions' | 'viewports'>;
  id: string;
  now: string;
  routeKey: string;
  pageUrl: string;
  originalUrl: string;
  viewport: ReviewItem['viewport'];
  devicePixelRatio: number;
  scroll: ReviewItem['scroll'];
}): ReviewItem {
  const createdBy = options.userId?.trim();
  const title = input.title?.trim();
  const fallbackAssigneeId = input.assigneeId?.trim();
  const assigneeIds = Array.from(
    new Set(
      (input.assigneeIds?.length
        ? input.assigneeIds
        : fallbackAssigneeId
          ? [fallbackAssigneeId]
          : []
      )
        .map((assigneeId) => assigneeId.trim())
        .filter(Boolean)
    )
  );
  const assigneeNames = assigneeIds.map(
    (assigneeId, index) =>
      input.assigneeNames?.[index]?.trim() ||
      (index === 0 ? input.assigneeName?.trim() : '') ||
      options.assigneeOptions?.find(
        (option) => option.value === assigneeId
      )?.label ||
      assigneeId
  );
  const assigneeId = assigneeIds[0];
  const assigneeName = assigneeNames[0];
  return {
    id,
    projectId: options.projectId,
    routeKey,
    pageUrl,
    originalUrl,
    normalizedPath: routeKey,
    scope:
      input.scope ??
      getReviewViewportScope(viewport, options.viewports?.presets),
    kind: input.kind,
    title: title || undefined,
    comment: input.comment,
    assigneeId,
    assigneeName,
    assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
    assigneeNames: assigneeNames.length > 0 ? assigneeNames : undefined,
    createdBy: createdBy || undefined,
    status: input.status ?? 'todo',
    viewport,
    devicePixelRatio,
    scroll,
    anchor: input.anchor,
    marker: input.marker,
    selection: input.selection,
    createdAt: now,
    updatedAt: now,
  };
}
