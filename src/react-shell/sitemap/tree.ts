import type {
  ReviewPresenceUser,
  ReviewShellPage,
} from '../types';

export type SitemapQaCount = {
  local: number;
  remote: number;
};

type SitemapTreeNode = {
  href: string;
  label: string;
  isPage: boolean;
  children: Map<string, SitemapTreeNode>;
};

export type SitemapTreeRow = {
  href: string;
  label: string;
  prefix: string;
  isPage: boolean;
  isActive: boolean;
  qaCount: SitemapQaCount;
  users: ReviewPresenceUser[];
};

const EMPTY_SITEMAP_QA_COUNT: SitemapQaCount = {
  local: 0,
  remote: 0,
};

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

const addSitemapQaCounts = (
  first: SitemapQaCount,
  second: SitemapQaCount
): SitemapQaCount => ({
  local: first.local + second.local,
  remote: first.remote + second.remote,
});

export const createSitemapRows = (
  pages: ReviewShellPage[],
  activeRoute: string,
  pageQaCounts: ReadonlyMap<string, SitemapQaCount>,
  pagePresenceUsers: ReadonlyMap<string, ReviewPresenceUser[]>,
  getPageTarget: (href: string) => string
) => {
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
    if (!node.isPage) return EMPTY_SITEMAP_QA_COUNT;

    return pageQaCounts.get(getPageTarget(node.href)) ?? EMPTY_SITEMAP_QA_COUNT;
  };

  const getDirectUsers = (node: SitemapTreeNode) => {
    if (!node.isPage) return [];

    return pagePresenceUsers.get(getPageTarget(node.href)) ?? [];
  };

  const rows: SitemapTreeRow[] = [];

  const appendNodeRows = (
    node: SitemapTreeNode,
    depth: number,
    ancestorLastList: boolean[],
    isLastNode: boolean
  ): { count: SitemapQaCount; users: ReviewPresenceUser[] } => {
    const children = Array.from(node.children.values());
    const directCount = getDirectCount(node);
    const directUsers = getDirectUsers(node);
    let rowIndex: number | null = null;

    if (node.isPage || depth > 0) {
      const prefix =
        depth === 0
          ? ''
          : `${ancestorLastList.map((isLast) => (isLast ? '   ' : '│  ')).join('')}${
              isLastNode ? '└─ ' : '├─ '
            }`;
      const pageTarget = node.isPage ? getPageTarget(node.href) : null;

      rowIndex = rows.length;
      rows.push({
        href: node.href,
        label: node.label,
        prefix,
        isPage: node.isPage,
        isActive: pageTarget === activeRoute,
        qaCount: directCount,
        users: directUsers,
      });
    }

    const childAggregate = children.reduce(
      (aggregate, child, childIndex) => {
        const childResult = appendNodeRows(
          child,
          depth + 1,
          depth === 0 ? [] : [...ancestorLastList, isLastNode],
          childIndex === children.length - 1
        );

        return {
          count: addSitemapQaCounts(aggregate.count, childResult.count),
          users: mergeSitemapUsers([...aggregate.users, ...childResult.users]),
        };
      },
      { count: EMPTY_SITEMAP_QA_COUNT, users: [] as ReviewPresenceUser[] }
    );

    if (rowIndex !== null && !node.isPage) {
      rows[rowIndex] = {
        ...rows[rowIndex],
        qaCount: childAggregate.count,
        users: childAggregate.users,
      };
    }

    return {
      count: node.isPage
        ? addSitemapQaCounts(directCount, childAggregate.count)
        : childAggregate.count,
      users: mergeSitemapUsers([...directUsers, ...childAggregate.users]),
    };
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

  Array.from(root.children.values()).forEach((node, index, siblings) => {
    appendNodeRows(node, 1, [], index === siblings.length - 1);
  });

  return rows;
};
