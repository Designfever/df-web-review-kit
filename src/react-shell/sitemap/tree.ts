import type {
  ReviewItemScope,
  ReviewWorkflowStatus,
} from '../../types';
import type {
  ReviewPresenceUser,
  ReviewShellPage,
  ReviewShellViewportPreset,
} from '../types';

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

type SitemapTreeNode = {
  href: string;
  label: string;
  isPage: boolean;
  children: Map<string, SitemapTreeNode>;
};

type SitemapTreeRow = {
  href: string;
  label: string;
  prefix: string;
  isPage: boolean;
  isActive: boolean;
  qaCount: SitemapQaCount;
  users: ReviewPresenceUser[];
};

export type SitemapSortDirection = 'asc' | 'desc';

export type SitemapSortKey =
  | 'page'
  | 'total'
  | 'review'
  | 'hold'
  | 'online'
  | `viewport:${string}`;

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
  key: `${index}:${preset.width}x${preset.height}`,
  label: preset.label,
  title: `${preset.label} ${preset.width}x${preset.height}`,
});

const normalizeSitemapHref = (href: string) => {
  const [path = '/'] = href.split(/[?#]/);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return normalizedPath || '/';
};

const getSitemapSegments = (href: string) =>
  normalizeSitemapHref(href)
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

const createSitemapNode = (
  href: string,
  label: string,
  isPage = false
): SitemapTreeNode => ({
  href,
  label,
  isPage,
  children: new Map(),
});

const mergeSitemapUsers = (users: ReviewPresenceUser[]) => {
  const userByKey = new Map<string, ReviewPresenceUser>();

  users.forEach((user) => {
    const key = user.sessionId || user.userId;
    const currentUser = userByKey.get(key);

    if (
      !currentUser ||
      Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)
    ) {
      userByKey.set(key, user);
    }
  });

  return Array.from(userByKey.values());
};

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

type SitemapTreeSummary = {
  node: SitemapTreeNode;
  directCount: SitemapQaCount;
  directUsers: ReviewPresenceUser[];
  count: SitemapQaCount;
  users: ReviewPresenceUser[];
  children: SitemapTreeSummary[];
};

export const createSitemapRows = (
  pages: ReviewShellPage[],
  activeRoute: string,
  pageQaCounts: ReadonlyMap<string, SitemapQaCount>,
  pagePresenceUsers: ReadonlyMap<string, ReviewPresenceUser[]>,
  getPageTarget: (href: string) => string,
  options: {
    sortKey?: SitemapSortKey;
    sortDirection?: SitemapSortDirection;
  } = {}
) => {
  const sortKey = options.sortKey ?? 'page';
  const sortDirection = options.sortDirection ?? 'asc';
  const root = createSitemapNode('/', '/', false);

  pages.forEach((page) => {
    const pageHref = page.href.startsWith('/') ? page.href : `/${page.href}`;
    const pathHref = normalizeSitemapHref(pageHref);
    const segments = getSitemapSegments(pathHref);

    if (segments.length === 0) {
      root.href = pageHref;
      root.isPage = true;
      return;
    }

    let parent = root;

    segments.forEach((segment, segmentIndex) => {
      const isLastSegment = segmentIndex === segments.length - 1;
      const segmentPath = `/${segments.slice(0, segmentIndex + 1).join('/')}`;
      const segmentHref = isLastSegment ? pageHref : `${segmentPath}/`;
      const segmentLabel = `${segment}${
        !isLastSegment || pathHref.endsWith('/') ? '/' : ''
      }`;
      const existingNode = parent.children.get(segment);
      const node =
        existingNode ?? createSitemapNode(segmentHref, segmentLabel, false);

      node.href = isLastSegment ? pageHref : node.href;
      node.label = isLastSegment ? segmentLabel : node.label;
      node.isPage = node.isPage || isLastSegment;
      parent.children.set(segment, node);
      parent = node;
    });
  });

  const getDirectCount = (node: SitemapTreeNode) => {
    if (!node.isPage) return createEmptySitemapQaCount();

    return (
      pageQaCounts.get(getPageTarget(node.href)) ??
      createEmptySitemapQaCount()
    );
  };

  const getDirectUsers = (node: SitemapTreeNode) => {
    if (!node.isPage) return [];

    return pagePresenceUsers.get(getPageTarget(node.href)) ?? [];
  };

  const createNodeSummary = (node: SitemapTreeNode): SitemapTreeSummary => {
    const directCount = getDirectCount(node);
    const directUsers = getDirectUsers(node);
    const children = Array.from(node.children.values()).map(createNodeSummary);
    const childAggregate = children.reduce(
      (aggregate, child) => ({
        count: addSitemapQaCounts(aggregate.count, child.count),
        users: mergeSitemapUsers([...aggregate.users, ...child.users]),
      }),
      {
        count: createEmptySitemapQaCount(),
        users: [] as ReviewPresenceUser[],
      }
    );

    return {
      node,
      directCount,
      directUsers,
      count: node.isPage
        ? addSitemapQaCounts(directCount, childAggregate.count)
        : childAggregate.count,
      users: mergeSitemapUsers([...directUsers, ...childAggregate.users]),
      children,
    };
  };

  const getSortValue = (summary: SitemapTreeSummary) => {
    if (sortKey === 'page') return summary.node.label;
    if (sortKey === 'total') return summary.count.remaining;
    if (sortKey === 'review') return summary.count.status.review;
    if (sortKey === 'hold') return summary.count.status.hold;
    if (sortKey === 'online') return summary.users.length;
    if (sortKey.startsWith('viewport:')) {
      const viewportKey = sortKey.slice('viewport:'.length);
      return summary.count.viewport[viewportKey]?.remaining ?? 0;
    }

    return 0;
  };

  const sortSummaries = (summaries: SitemapTreeSummary[]) => {
    return [...summaries].sort((a, b) => {
      const firstValue = getSortValue(a);
      const secondValue = getSortValue(b);
      const valueDiff =
        typeof firstValue === 'string' && typeof secondValue === 'string'
          ? firstValue.localeCompare(secondValue)
          : Number(firstValue) - Number(secondValue);

      if (valueDiff !== 0) {
        return sortDirection === 'asc' ? valueDiff : -valueDiff;
      }

      const totalDiff = b.count.remaining - a.count.remaining;
      if (totalDiff !== 0) return totalDiff;
      return a.node.label.localeCompare(b.node.label);
    });
  };

  const rows: SitemapTreeRow[] = [];

  const appendSummaryRows = (
    summary: SitemapTreeSummary,
    depth: number,
    ancestorLastList: boolean[],
    isLastNode: boolean
  ) => {
    const { node } = summary;
    const rowCount = node.isPage ? summary.directCount : summary.count;
    const rowUsers = node.isPage ? summary.directUsers : summary.users;

    if (node.isPage || depth > 0) {
      const prefix =
        depth === 0
          ? ''
          : `${ancestorLastList.map((isLast) => (isLast ? '   ' : '│  ')).join('')}${
              isLastNode ? '└─ ' : '├─ '
            }`;
      const pageTarget = node.isPage ? getPageTarget(node.href) : null;

      rows.push({
        href: node.href,
        label: node.label,
        prefix,
        isPage: node.isPage,
        isActive: pageTarget === activeRoute,
        qaCount: rowCount,
        users: rowUsers,
      });
    }

    const visibleChildren = sortSummaries(summary.children);
    visibleChildren.forEach((child, childIndex) => {
      appendSummaryRows(
        child,
        depth + 1,
        depth === 0 ? [] : [...ancestorLastList, isLastNode],
        childIndex === visibleChildren.length - 1
      );
    });
  };

  if (root.isPage) {
    const directCount = getDirectCount(root);
    const directUsers = getDirectUsers(root);

    rows.push({
      href: root.href,
      label: root.label,
      prefix: '',
      isPage: true,
      isActive: getPageTarget(root.href) === activeRoute,
      qaCount: directCount,
      users: directUsers,
    });
  }

  const rootSummaries = sortSummaries(
    Array.from(root.children.values()).map(createNodeSummary)
  );

  rootSummaries.forEach((summary, index, siblings) => {
    appendSummaryRows(summary, 1, [], index === siblings.length - 1);
  });

  return rows;
};
