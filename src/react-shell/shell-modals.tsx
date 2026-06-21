import type React from 'react';
import {
  CircleHelp as CircleHelpIcon,
  Copy as CopyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from 'lucide-react';
import {
  DEFAULT_REVIEW_THEME,
  FIGMA_TOKEN_GUIDE_ID,
  FIGMA_TOKEN_STORAGE_KEY,
  REVIEW_THEME_OPTIONS,
  REVIEW_THEME_STORAGE_KEY,
  REVIEW_USER_ID_STORAGE_KEY,
} from './constants';
import { getPromptLengthLabel } from './prompt';
import { normalizeReviewTheme } from './settings';
import type {
  ReviewPresenceUser,
  ReviewShellPage,
  ReviewShellTheme,
} from './types';

type SitemapQaCount = {
  local: number;
  remote: number;
};

interface SitemapModalProps {
  pages: ReviewShellPage[];
  activeRoute: string;
  pageQaCounts: ReadonlyMap<string, SitemapQaCount>;
  pagePresenceUsers: ReadonlyMap<string, ReviewPresenceUser[]>;
  getPageTarget: (href: string) => string;
  onClose: () => void;
  onSelectPage: (href: string) => void;
}

const EMPTY_SITEMAP_QA_COUNT: SitemapQaCount = {
  local: 0,
  remote: 0,
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

const createSitemapRows = (
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
      const segmentHref = isLastSegment
        ? pageHref
        : `${segmentPath}/`;
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

export const SitemapModal = ({
  pages,
  activeRoute,
  pageQaCounts,
  pagePresenceUsers,
  getPageTarget,
  onClose,
  onSelectPage,
}: SitemapModalProps) => {
  const sitemapRows = createSitemapRows(
    pages,
    activeRoute,
    pageQaCounts,
    pagePresenceUsers,
    getPageTarget
  );

  return (
    <div
      aria-label="Sitemap"
      aria-modal="true"
      className="df-review-sitemap-modal"
      role="dialog"
    >
      <button
        aria-label="Close sitemap"
        className="df-review-sitemap-backdrop"
        type="button"
        onClick={onClose}
      />
      <div className="df-review-sitemap-dialog">
        <div className="df-review-sitemap-header">
          <div>
            <strong>Sitemap</strong>
            <span>{pages.length} pages</span>
          </div>
          <button aria-label="Close sitemap" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="df-review-sitemap-list">
          <div className="df-review-sitemap-table-head" aria-hidden="true">
            <span>Page</span>
            <span>Local</span>
            <span>Remote</span>
            <span>Online</span>
          </div>
          {sitemapRows.map((row) => {
            const rowClassName = [
              'df-review-sitemap-row',
              row.isPage ? 'is-page' : 'is-folder',
              row.isActive ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ');
            const rowContent = (
              <>
                <span className="df-review-sitemap-path">
                  <span className="df-review-sitemap-tree-prefix">
                    {row.prefix}
                  </span>
                  <span>{row.label}</span>
                </span>
                <span className="df-review-sitemap-cell is-local">
                  {row.qaCount.local}
                </span>
                <span className="df-review-sitemap-cell is-remote">
                  {row.qaCount.remote}
                </span>
                <span className="df-review-sitemap-cell is-online">
                  {row.users.length > 0 ? (
                    <span className="df-review-sitemap-users">
                      {row.users.map((user) => (
                        <span
                          key={user.sessionId}
                          className="df-review-sitemap-user"
                          style={{
                            '--df-review-presence-color': user.color,
                          } as React.CSSProperties}
                        >
                          {user.userId}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="df-review-sitemap-online-empty">0</span>
                  )}
                </span>
              </>
            );

            if (!row.isPage) {
              return (
                <div
                  key={row.href}
                  aria-label={`${row.href} group / local ${row.qaCount.local} QA / remote ${row.qaCount.remote} QA / ${row.users.length} online`}
                  className={rowClassName}
                  role="row"
                >
                  {rowContent}
                </div>
              );
            }

            return (
              <button
                key={row.href}
                aria-label={`${row.href} / local ${row.qaCount.local} QA / remote ${row.qaCount.remote} QA / ${row.users.length} online`}
                className={rowClassName}
                type="button"
                onClick={() => onSelectPage(row.href)}
              >
                {rowContent}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface ReviewSettingsModalProps {
  figmaTokenDraft: string;
  reviewUserIdDraft: string;
  reviewThemeDraft: ReviewShellTheme;
  figmaSettingsStatus: string;
  isFigmaTokenVisible: boolean;
  isFigmaTokenGuideOpen: boolean;
  onClose: () => void;
  onFigmaTokenDraftChange: (value: string) => void;
  onReviewUserIdDraftChange: (value: string) => void;
  onReviewThemeDraftChange: (value: ReviewShellTheme) => void;
  onClearStatus: () => void;
  onToggleFigmaTokenVisible: () => void;
  onToggleFigmaTokenGuide: () => void;
  onSave: (
    figmaToken: string,
    reviewUserId: string,
    reviewTheme: ReviewShellTheme
  ) => void;
}

export const ReviewSettingsModal = ({
  figmaTokenDraft,
  reviewUserIdDraft,
  reviewThemeDraft,
  figmaSettingsStatus,
  isFigmaTokenVisible,
  isFigmaTokenGuideOpen,
  onClose,
  onFigmaTokenDraftChange,
  onReviewUserIdDraftChange,
  onReviewThemeDraftChange,
  onClearStatus,
  onToggleFigmaTokenVisible,
  onToggleFigmaTokenGuide,
  onSave,
}: ReviewSettingsModalProps) => {
  return (
    <div
      aria-label="Review settings"
      aria-modal="true"
      className="df-review-settings-modal"
      role="dialog"
    >
      <button
        aria-label="Close settings"
        className="df-review-settings-backdrop"
        type="button"
        onClick={onClose}
      />
      <form
        className="df-review-settings-dialog"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(figmaTokenDraft, reviewUserIdDraft, reviewThemeDraft);
        }}
      >
        <div className="df-review-settings-header">
          <div className="df-review-settings-title">
            <strong>Settings</strong>
            <span>
              {FIGMA_TOKEN_STORAGE_KEY} / {REVIEW_USER_ID_STORAGE_KEY} /{' '}
              {REVIEW_THEME_STORAGE_KEY}
            </span>
          </div>
          <div className="df-review-settings-header-actions">
            <select
              aria-label="Review theme"
              className="df-review-settings-theme-select"
              value={reviewThemeDraft}
              onChange={(event) => {
                onReviewThemeDraftChange(normalizeReviewTheme(event.target.value));
                onClearStatus();
              }}
            >
              {REVIEW_THEME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button aria-label="Close settings" type="button" onClick={onClose}>
              x
            </button>
          </div>
        </div>
        <div className="df-review-settings-body">
          <div className="df-review-settings-field">
            <div className="df-review-settings-label-row">
              <label htmlFor="df-review-figma-token">Figma token</label>
              <button
                aria-controls={FIGMA_TOKEN_GUIDE_ID}
                aria-expanded={isFigmaTokenGuideOpen}
                aria-label="Show Figma token guide"
                className={`df-review-settings-help-button${
                  isFigmaTokenGuideOpen ? ' is-active' : ''
                }`}
                type="button"
                onClick={onToggleFigmaTokenGuide}
              >
                <CircleHelpIcon aria-hidden="true" />
              </button>
            </div>
            <div className="df-review-settings-token-input">
              <input
                id="df-review-figma-token"
                aria-label="Figma token"
                aria-describedby={
                  isFigmaTokenGuideOpen ? FIGMA_TOKEN_GUIDE_ID : undefined
                }
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className={isFigmaTokenVisible ? undefined : 'is-token-masked'}
                data-1p-ignore="true"
                data-lpignore="true"
                inputMode="text"
                name="df-review-figma-access-key"
                spellCheck={false}
                type="text"
                value={figmaTokenDraft}
                onChange={(event) => {
                  onFigmaTokenDraftChange(event.target.value);
                  onClearStatus();
                }}
              />
              <button
                aria-label={
                  isFigmaTokenVisible
                    ? 'Hide Figma token'
                    : 'Show Figma token'
                }
                className="df-review-settings-token-toggle"
                type="button"
                onClick={onToggleFigmaTokenVisible}
              >
                {isFigmaTokenVisible ? (
                  <EyeOffIcon aria-hidden="true" />
                ) : (
                  <EyeIcon aria-hidden="true" />
                )}
              </button>
            </div>
            {isFigmaTokenGuideOpen && (
              <div
                className="df-review-settings-guide"
                id={FIGMA_TOKEN_GUIDE_ID}
              >
                <ol>
                  <li>Figma file browser에서 account menu를 열고 Settings로 이동</li>
                  <li>Security 탭의 Personal access tokens로 이동</li>
                  <li>Generate new token에서 이름과 scope를 정한 뒤 생성</li>
                  <li>생성된 token을 복사해서 여기에 붙여넣기</li>
                </ol>
              </div>
            )}
          </div>
          <label className="df-review-settings-field">
            <span>User ID</span>
            <div className="df-review-settings-text-input">
              <input
                aria-label="Review user ID"
                autoComplete="off"
                spellCheck={false}
                type="text"
                value={reviewUserIdDraft}
                onChange={(event) => {
                  onReviewUserIdDraftChange(event.target.value);
                  onClearStatus();
                }}
              />
            </div>
          </label>

          {figmaSettingsStatus && (
            <p className="df-review-settings-status">{figmaSettingsStatus}</p>
          )}
          <div className="df-review-settings-actions">
            <button
              type="button"
              onClick={() => onSave('', '', DEFAULT_REVIEW_THEME)}
            >
              Clear
            </button>
            <span />
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </div>
      </form>
    </div>
  );
};

interface PromptModalProps {
  initialPromptText: string;
  copiedPromptKey: string | null;
  onClose: () => void;
  onCopyPrompt: (text: string, key: string) => void;
}

const ABOUT_SECTIONS = [
  {
    title: 'What this is',
    body:
      'df-web-review-kit is a project-embedded review shell. It mounts a /review page, opens real host pages in an iframe, and lets reviewers create QA notes, area markers, and DOM markers against the actual implementation instead of a separate screenshot tool.',
  },
  {
    title: 'How to setup',
    body:
      'Install the package, mount the review route in the host project, and choose the storage adapters for that project. Local drafts work by default; shared remote QA and realtime presence depend on the host project configuration.',
  },
  {
    title: 'Figma token',
    body:
      'Add a browser-safe Figma token in Settings only when the host page already supports the Figma overlay helper. The package stores it in localStorage as figma-token and does not own a server-side Figma integration.',
  },
  {
    title: 'User ID',
    body:
      'Set your User ID in Settings before reviewing. It is used for presence, online user pills, and author context so teammates can tell who is looking at the same project or route.',
  },
  {
    title: 'Remote',
    body:
      'Remote QA is optional and project-specific. If you need shared canonical items, Supabase, or realtime presence, ask the project owner or 담당 개발자 which remote adapter and browser-safe env values are connected. Never put service_role or operator secrets in the browser.',
  },
];

export const PromptModal = ({
  initialPromptText,
  copiedPromptKey,
  onClose,
  onCopyPrompt,
}: PromptModalProps) => {
  return (
    <div
      aria-label="Review help"
      aria-modal="true"
      className="df-review-prompt-modal"
      role="dialog"
    >
      <button
        aria-label="Close help"
        className="df-review-prompt-backdrop"
        type="button"
        onClick={onClose}
      />
      <div className="df-review-prompt-dialog">
        <div className="df-review-prompt-header">
          <div>
            <strong>Review shell help</strong>
            <span>About / Initial prompt</span>
          </div>
          <button aria-label="Close help" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="df-review-prompt-body">
          <section className="df-review-prompt-about" aria-labelledby="df-review-about-title">
            <div className="df-review-prompt-section-header">
              <strong id="df-review-about-title">About</strong>
              <span>Program overview and setup notes</span>
            </div>
            <div className="df-review-prompt-about-grid">
              {ABOUT_SECTIONS.map((section) => (
                <article key={section.title}>
                  <strong>{section.title}</strong>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
          </section>
          <section
            className="df-review-prompt-block"
            aria-labelledby="df-review-initial-prompt-title"
          >
            <div className="df-review-prompt-block-header">
              <div>
                <strong id="df-review-initial-prompt-title">
                  Initial Prompt
                </strong>
                <span>{getPromptLengthLabel(initialPromptText)}</span>
              </div>
              <button
                disabled={!initialPromptText}
                type="button"
                onClick={() => onCopyPrompt(initialPromptText, 'initial')}
              >
                <CopyIcon aria-hidden="true" />
                {copiedPromptKey === 'initial' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              aria-label="Initial Prompt content"
              value={initialPromptText || 'Initial prompt is not configured.'}
            />
          </section>
        </div>
      </div>
    </div>
  );
};
