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
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isPage: boolean;
  isActive: boolean;
  qaCount: SitemapQaCount;
  users: ReviewPresenceUser[];
};

export const SITEMAP_STATUS_FILTERS = ['todo', 'review', 'hold'] as const;

export type SitemapStatusFilter = (typeof SITEMAP_STATUS_FILTERS)[number];

export type SitemapSortDirection = 'asc' | 'desc';

export type SitemapSortKey =
  | 'page'
  | 'todo'
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
    collapsedFolderHrefs?: ReadonlySet<string>;
    searchQuery?: string;
    sortKey?: SitemapSortKey;
    sortDirection?: SitemapSortDirection;
    statusFilters?: ReadonlySet<SitemapStatusFilter>;
  } = {}
) => {
  const collapsedFolderHrefs =
    options.collapsedFolderHrefs ?? new Set<string>();
  const searchQuery = normalizeSitemapSearchQuery(options.searchQuery);
  const statusFilters = options.statusFilters ?? new Set<SitemapStatusFilter>();
  const isStatusFiltering = statusFilters.size > 0;
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

  const getSortValueFor = (
    label: string,
    count: SitemapQaCount,
    users: ReviewPresenceUser[]
  ) => {
    if (sortKey === 'page') return label;
    if (sortKey === 'todo') return count.status.todo;
    if (sortKey === 'review') return count.status.review;
    if (sortKey === 'hold') return count.status.hold;
    if (sortKey === 'online') return users.length;
    if (sortKey.startsWith('viewport:')) {
      const viewportKey = sortKey.slice('viewport:'.length);
      return count.viewport[viewportKey]?.remaining ?? 0;
    }

    return 0;
  };
  const getSortValue = (summary: SitemapTreeSummary) =>
    getSortValueFor(summary.node.label, summary.count, summary.users);

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
  const summaryMatchesSearch = (summary: SitemapTreeSummary): boolean => {
    if (!searchQuery) return true;
    if (sitemapNodeMatchesSearch(summary.node, searchQuery, getPageTarget)) {
      return true;
    }

    return summary.children.some(summaryMatchesSearch);
  };
  const countMatchesStatusFilters = (count: SitemapQaCount) =>
    Array.from(statusFilters).some((status) => count.status[status] > 0);

  // status filter 중에는 tree 대신 매칭 페이지만 전체 경로로 평평하게 보여준다.
  if (isStatusFiltering) {
    const flatEntries: {
      node: SitemapTreeNode;
      count: SitemapQaCount;
      users: ReviewPresenceUser[];
    }[] = [];

    const collectMatchingPages = (node: SitemapTreeNode) => {
      if (node.isPage) {
        const directCount = getDirectCount(node);
        if (
          countMatchesStatusFilters(directCount) &&
          (!searchQuery ||
            sitemapNodeMatchesSearch(node, searchQuery, getPageTarget))
        ) {
          flatEntries.push({
            node,
            count: directCount,
            users: getDirectUsers(node),
          });
        }
      }

      node.children.forEach(collectMatchingPages);
    };

    collectMatchingPages(root);

    return flatEntries
      .sort((a, b) => {
        const firstValue = getSortValueFor(
          normalizeSitemapHref(a.node.href),
          a.count,
          a.users
        );
        const secondValue = getSortValueFor(
          normalizeSitemapHref(b.node.href),
          b.count,
          b.users
        );
        const valueDiff =
          typeof firstValue === 'string' && typeof secondValue === 'string'
            ? firstValue.localeCompare(secondValue)
            : Number(firstValue) - Number(secondValue);

        if (valueDiff !== 0) {
          return sortDirection === 'asc' ? valueDiff : -valueDiff;
        }

        const remainingDiff = b.count.remaining - a.count.remaining;
        if (remainingDiff !== 0) return remainingDiff;
        return a.node.href.localeCompare(b.node.href);
      })
      .map((entry): SitemapTreeRow => ({
        href: entry.node.href,
        label: normalizeSitemapHref(entry.node.href),
        depth: 0,
        hasChildren: false,
        isExpanded: false,
        isPage: true,
        isActive: getPageTarget(entry.node.href) === activeRoute,
        qaCount: entry.count,
        users: entry.users,
      }));
  }

  const rows: SitemapTreeRow[] = [];

  const appendSummaryRows = (
    summary: SitemapTreeSummary,
    depth: number
  ) => {
    const { node } = summary;
    const rowCount = node.isPage ? summary.directCount : summary.count;
    const rowUsers = node.isPage ? summary.directUsers : summary.users;
    const nodeMatchesSearch =
      Boolean(searchQuery) &&
      sitemapNodeMatchesSearch(node, searchQuery, getPageTarget);
    const visibleChildren = sortSummaries(
      summary.children.filter(
        (child) =>
          !searchQuery || nodeMatchesSearch || summaryMatchesSearch(child)
      )
    );
    const hasChildren = visibleChildren.length > 0;
    const isExpanded =
      hasChildren &&
      (Boolean(searchQuery) || !collapsedFolderHrefs.has(node.href));

    if (node.isPage || hasChildren || depth > 0) {
      const pageTarget = node.isPage ? getPageTarget(node.href) : null;

      rows.push({
        href: node.href,
        label: node.label,
        depth,
        hasChildren,
        isExpanded,
        isPage: node.isPage,
        isActive: pageTarget === activeRoute,
        qaCount: rowCount,
        users: rowUsers,
      });
    }

    if (!isExpanded) return;

    visibleChildren.forEach((child) => {
      appendSummaryRows(child, depth + 1);
    });
  };

  if (
    root.isPage &&
    (!searchQuery || sitemapNodeMatchesSearch(root, searchQuery, getPageTarget))
  ) {
    const directCount = getDirectCount(root);
    const directUsers = getDirectUsers(root);

    rows.push({
      href: root.href,
      label: root.label,
      depth: 0,
      hasChildren: false,
      isExpanded: false,
      isPage: true,
      isActive: getPageTarget(root.href) === activeRoute,
      qaCount: directCount,
      users: directUsers,
    });
  }

  const rootSummaries = sortSummaries(
    Array.from(root.children.values())
      .map(createNodeSummary)
      .filter(summaryMatchesSearch)
  );

  rootSummaries.forEach((summary) => {
    appendSummaryRows(summary, 0);
  });

  return rows;
};

function normalizeSitemapSearchQuery(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function sitemapNodeMatchesSearch(
  node: SitemapTreeNode,
  searchQuery: string,
  getPageTarget: (href: string) => string
) {
  return [
    node.href,
    node.label,
    normalizeSitemapHref(node.href),
    node.isPage ? getPageTarget(node.href) : '',
  ]
    .join(' ')
    .toLowerCase()
    .includes(searchQuery);
}
