import type {
  ReviewItemScope,
  ReviewWorkflowStatus,
} from '../../types';
import type { ReviewShellViewportPreset } from '../types';

// page의 직접 수치와 folder의 하위 합계를 같은 형태로 다루는 집계 모델이다.
export type SitemapViewportCount = {
  total: number;
  remaining: number;
};

export type SitemapViewportColumn = {
  key: string;
  label: string;
  title: string;
};

export type SitemapQaCount = {
  total: number;
  remaining: number;
  local: number;
  remote: number;
  status: Record<ReviewWorkflowStatus, number>;
  scope: Partial<Record<ReviewItemScope, number>>;
  viewport: Record<string, SitemapViewportCount>;
};

const WORKFLOW_STATUSES: ReviewWorkflowStatus[] = [
  'todo',
  'doing',
  'review',
  'hold',
  'done',
];

export const createEmptySitemapQaCount = (): SitemapQaCount => ({
  total: 0,
  remaining: 0,
  local: 0,
  remote: 0,
  status: {
    todo: 0,
    doing: 0,
    review: 0,
    hold: 0,
    done: 0,
  },
  scope: {},
  viewport: {},
});

export const createSitemapViewportColumn = (
  preset: ReviewShellViewportPreset,
  index: number
): SitemapViewportColumn => ({
  // 크기가 같은 preset도 별도 열로 유지될 수 있게 순서를 key에 포함한다.
  key: `${index}:${preset.width}x${preset.height}`,
  label: preset.label,
  title: `${preset.label} ${preset.width}x${preset.height}`,
});

export const addSitemapQaCounts = (
  first: SitemapQaCount,
  second: SitemapQaCount
): SitemapQaCount => ({
  total: first.total + second.total,
  remaining: first.remaining + second.remaining,
  local: first.local + second.local,
  remote: first.remote + second.remote,
  status: WORKFLOW_STATUSES.reduce(
    (statusCounts, status) => ({
      ...statusCounts,
      [status]: first.status[status] + second.status[status],
    }),
    {} as Record<ReviewWorkflowStatus, number>
  ),
  scope: Array.from(
    new Set([
      ...Object.keys(first.scope),
      ...Object.keys(second.scope),
    ] as ReviewItemScope[])
  ).reduce(
    (scopeCounts, scope) => ({
      ...scopeCounts,
      [scope]: (first.scope[scope] ?? 0) + (second.scope[scope] ?? 0),
    }),
    {} as Partial<Record<ReviewItemScope, number>>
  ),
  viewport: Array.from(
    new Set([...Object.keys(first.viewport), ...Object.keys(second.viewport)])
  ).reduce(
    (viewportCounts, viewportKey) => ({
      ...viewportCounts,
      [viewportKey]: {
        total:
          (first.viewport[viewportKey]?.total ?? 0) +
          (second.viewport[viewportKey]?.total ?? 0),
        remaining:
          (first.viewport[viewportKey]?.remaining ?? 0) +
          (second.viewport[viewportKey]?.remaining ?? 0),
      },
    }),
    {} as Record<string, SitemapViewportCount>
  ),
});
