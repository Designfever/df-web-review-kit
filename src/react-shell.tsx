import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  CircleHelp as CircleHelpIcon,
  Copy as CopyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  GripVertical as GripVerticalIcon,
  Image as ImageIcon,
  LayoutGrid as LayoutGridIcon,
  ListFilter as ListFilterIcon,
  Map as MapIcon,
  Maximize2 as Maximize2Icon,
  Monitor as MonitorIcon,
  RectangleHorizontal as TabletIcon,
  Ruler as RulerIcon,
  Scan as ScanIcon,
  Settings as SettingsIcon,
  Smartphone as SmartphoneIcon,
  SquareMousePointer as SquareMousePointerIcon,
  StickyNote as StickyNoteIcon,
  X as XIcon
} from 'lucide-react';
import { createRoot } from 'react-dom/client';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  createWebReviewKit,
  getNumberedReviewItems,
  localAdapter,
  normalizeReviewItemStatus,
  type NumberedReviewItem,
  type ReviewRulerConfig,
  type ReviewRulerFrame,
  type ReviewItemScope,
  type ReviewItemStatus,
  type ReviewViewportPreset,
  type ReviewItem,
  type ReviewMode,
  type ReviewWorkflowStatus,
  type WebReviewKitController
} from './index';

export type ReviewShellViewportKind = Exclude<ReviewItemScope, 'dom'>;

export type ReviewShellViewportPreset = {
  label: string;
  width: number;
  height: number;
  kind?: ReviewShellViewportKind;
};

export type ReviewShellPage = {
  href: string;
};

export type ReviewShellGlobEntries = Record<string, unknown>;

export interface CreateReviewPagesOptions {
  root?: string;
  exclude?: (href: string) => boolean;
}

export interface ReviewShellProps {
  projectId: string;
  pages: ReviewShellPage[];
  storageKey?: string;
  presets?: ReviewShellViewportPreset[];
  ruler?: ReviewRulerConfig;
  initialPrompt?: string;
  reviewPathPrefix?: string;
}

export interface ReviewShellMountOptions extends ReviewShellProps {
  rootId?: string;
}

type TargetOverlayKey = 'grid' | 'figma';

type TargetOverlayState = Record<TargetOverlayKey, boolean>;

type ReviewQaFilter = 'all' | ReviewItemScope;

type ReviewShellTheme = 'dark' | 'light' | 'system';

type ReviewPromptTab = 'initial' | 'item';

type ReviewRulerPoint = {
  x: number;
  y: number;
};

type ReviewRulerMeasure = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const REVIEW_QA_FILTERS: Array<{
  key: ReviewQaFilter;
  label: string;
  scope?: ReviewItemScope;
}> = [
  { key: 'all', label: 'All' },
  { key: 'mobile', label: 'Mobile', scope: 'mobile' },
  { key: 'tablet', label: 'Tablet', scope: 'tablet' },
  { key: 'desktop', label: 'Desktop', scope: 'desktop' },
  { key: 'wide', label: 'Wide', scope: 'wide' },
  { key: 'dom', label: 'Element', scope: 'dom' }
];

export const DEFAULT_REVIEW_VIEWPORT_PRESETS: ReviewShellViewportPreset[] = [
  { label: 'Mobile', width: 390, height: 720, kind: 'mobile' },
  { label: 'Tablet', width: 768, height: 1024, kind: 'tablet' },
  { label: 'Desktop', width: 1440, height: 900, kind: 'desktop' },
  { label: 'Wide', width: 1980, height: 1080, kind: 'wide' }
];

const DEFAULT_REVIEW_PATH_PREFIX = '/review';
const REVIEW_SHELL_STYLE_ID = 'df-review-shell-style';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizePageHref = (value: string) => {
  const href = value || '/';
  return href.startsWith('/') ? href : `/${href}`;
};

const sortReviewPages = (a: ReviewShellPage, b: ReviewShellPage) => {
  if (a.href === '/') return -1;
  if (b.href === '/') return 1;
  return a.href.localeCompare(b.href);
};

export const createReviewPagesFromGlob = (
  entries: ReviewShellGlobEntries,
  options: CreateReviewPagesOptions = {}
): ReviewShellPage[] => {
  const root = options.root ?? '/page';
  const rootPattern = root ? new RegExp(`^${escapeRegExp(root)}`) : null;

  return Object.keys(entries)
    .map((key) => {
      const withoutRoot = rootPattern ? key.replace(rootPattern, '') : key;
      const href = withoutRoot.replace(/index\.(tsx|ts|jsx|js)$/, '');
      return normalizePageHref(href === '' ? '/' : href);
    })
    .filter((href) => !options.exclude?.(href))
    .sort((a, b) => sortReviewPages({ href: a }, { href: b }))
    .map((href) => ({ href }));
};

const getStorageKey = (projectId: string) =>
  `df-web-review-kit:${projectId}:review-items`;

const normalizeReviewPathPrefix = (value: string) => {
  const raw = value.trim() || DEFAULT_REVIEW_PATH_PREFIX;
  const prefix = raw.startsWith('/') ? raw : `/${raw}`;
  return prefix.length > 1 && prefix.endsWith('/')
    ? prefix.slice(0, -1)
    : prefix;
};

const normalizeTarget = (
  value: string,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
) => {
  const raw = value.trim() || '/';
  const [path] = raw.split(/[?#]/);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const reviewPrefix = normalizeReviewPathPrefix(reviewPathPrefix);

  return normalized === reviewPrefix ||
    normalized.startsWith(`${reviewPrefix}/`)
    ? '/'
    : normalized;
};

const getInitialTarget = (reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  if (typeof window === 'undefined') return '/';

  const target = new URLSearchParams(window.location.search).get('target');
  return target ? normalizeTarget(target, reviewPathPrefix) : '/';
};

const getFallbackPreset = (presets: ReviewShellViewportPreset[]) =>
  presets[0] ?? DEFAULT_REVIEW_VIEWPORT_PRESETS[0];

const getViewportPresetDistance = (
  preset: ReviewShellViewportPreset,
  width: number,
  height: number
) => Math.abs(preset.width - width) + Math.abs(preset.height - height);

const findViewportPreset = (
  presets: ReviewShellViewportPreset[],
  width: number,
  height: number
) => {
  const fallback = getFallbackPreset(presets);
  const exact = presets.find(
    (preset) => preset.width === width && preset.height === height
  );

  if (exact) return exact;

  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance(closest, width, height);
    const presetDistance = getViewportPresetDistance(preset, width, height);
    return presetDistance < closestDistance ? preset : closest;
  }, fallback);
};

const getInitialSize = (
  presets: ReviewShellViewportPreset[]
): ReviewShellViewportPreset => {
  if (typeof window === 'undefined') return getFallbackPreset(presets);

  const params = new URLSearchParams(window.location.search);
  const width = Number(params.get('w'));
  const height = Number(params.get('h'));

  if (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  ) {
    return findViewportPreset(presets, width, height);
  }

  return getFallbackPreset(presets);
};

const buildTargetSrc = (target: string) => {
  const url = new URL(target || '/', window.location.origin);
  url.searchParams.set('__dfwr_target', '1');
  return `${url.pathname}${url.search}${url.hash}`;
};

const updateShellUrl = (target: string, size: ReviewShellViewportPreset) => {
  const url = new URL(window.location.href);
  url.searchParams.set('target', target);
  url.searchParams.set('w', String(size.width));
  url.searchParams.set('h', String(size.height));
  url.searchParams.delete('item');
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
};

const updateShellUrlForItem = (
  target: string,
  size: ReviewShellViewportPreset,
  itemId: string
) => {
  const url = new URL(window.location.href);
  url.searchParams.set('target', target);
  url.searchParams.set('w', String(size.width));
  url.searchParams.set('h', String(size.height));
  url.searchParams.set('item', itemId);
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
};

const getInitialItemId = () => {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('item');
};

const getItemTarget = (
  item: ReviewItem,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
) => {
  if (item.routeKey) return normalizeTarget(item.routeKey, reviewPathPrefix);
  if (item.normalizedPath) {
    return normalizeTarget(item.normalizedPath, reviewPathPrefix);
  }

  try {
    return normalizeTarget(new URL(item.pageUrl).pathname, reviewPathPrefix);
  } catch {
    return '/';
  }
};

const getStoredItem = (itemId: string, storageKey: string) => {
  try {
    const items = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(items)) return undefined;
    return items.find((item): item is ReviewItem => item?.id === itemId);
  } catch {
    return undefined;
  }
};

const queryReviewItemAnchorElement = (
  targetDocument: Document,
  item: ReviewItem
) => {
  const anchor = item.anchor;
  if (!anchor || item.scope !== 'dom') return undefined;

  const expectedRect = getReviewItemExpectedDocumentRect(item);
  const candidates = [anchor, ...(anchor.candidates ?? [])].filter(
    (candidate) => Boolean(candidate.selector)
  );
  const matches: Array<{
    element: Element;
    score: number;
  }> = [];

  candidates.forEach((candidate, index) => {
    try {
      targetDocument.querySelectorAll(candidate.selector).forEach((element) => {
        if (!isScrollableReviewAnchorElement(element)) return;

        matches.push({
          element,
          score: getReviewAnchorMatchScore(
            element,
            expectedRect,
            candidate.textFingerprint ?? anchor.textFingerprint,
            index
          )
        });
      });
    } catch {
      return;
    }
  });

  return matches.sort((a, b) => a.score - b.score)[0]?.element;
};

const getReviewItemExpectedDocumentRect = (item: ReviewItem) => {
  const scroll = item.scroll ?? { x: 0, y: 0 };
  const selection = item.selection?.viewport;
  if (
    selection &&
    typeof selection.x === 'number' &&
    typeof selection.y === 'number' &&
    typeof selection.width === 'number' &&
    typeof selection.height === 'number'
  ) {
    return {
      left: scroll.x + selection.x,
      top: scroll.y + selection.y,
      width: selection.width,
      height: selection.height
    };
  }

  const marker = item.marker?.viewport;
  if (marker && typeof marker.x === 'number' && typeof marker.y === 'number') {
    return {
      left: scroll.x + marker.x,
      top: scroll.y + marker.y,
      width: 1,
      height: 1
    };
  }

  return undefined;
};

const getReviewAnchorMatchScore = (
  element: Element,
  expectedRect:
    | {
        left: number;
        top: number;
        width: number;
        height: number;
      }
    | undefined,
  textFingerprint: string | undefined,
  candidateIndex: number
) => {
  const rect = getElementDocumentRect(element);
  let score = candidateIndex * 25;

  if (expectedRect) {
    score += Math.abs(rect.top - expectedRect.top);
    score += Math.abs(rect.left - expectedRect.left) * 0.25;
    score += Math.abs(rect.width - expectedRect.width) * 0.1;
    score += Math.abs(rect.height - expectedRect.height) * 0.1;
  }

  if (textFingerprint) {
    score +=
      (1 - getReviewTextFingerprintScore(textFingerprint, element)) * 100;
  }

  return score;
};

const getElementDocumentRect = (element: Element) => {
  const rect = element.getBoundingClientRect();
  const view = element.ownerDocument.defaultView;

  return {
    left: rect.left + (view?.scrollX ?? 0),
    top: rect.top + (view?.scrollY ?? 0),
    width: rect.width,
    height: rect.height
  };
};

const getReviewTextFingerprintScore = (expected: string, element: Element) => {
  const actual = element.textContent?.replace(/\s+/g, ' ').trim();
  if (!actual) return 0.5;
  if (expected === actual) return 1;
  if (actual.includes(expected) || expected.includes(actual)) return 0.82;

  const expectedTokens = getReviewFingerprintTokens(expected);
  const actualTokens = new Set(getReviewFingerprintTokens(actual));
  if (expectedTokens.length === 0 || actualTokens.size === 0) return 0.5;

  const matches = expectedTokens.filter((token) => actualTokens.has(token));
  return Math.min(Math.max(matches.length / expectedTokens.length, 0.25), 0.76);
};

const getReviewFingerprintTokens = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s/|,.:;()[\]{}"'`~!?<>]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

const isScrollableReviewAnchorElement = (element: Element) => {
  const id = element.id.trim().toLowerCase();
  if (
    element === element.ownerDocument.body ||
    element === element.ownerDocument.documentElement ||
    ['app', 'main', 'page', 'root', '__next', '__nuxt'].includes(id)
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const viewportHeight = element.ownerDocument.documentElement.clientHeight;
  const scrollHeight = element.ownerDocument.documentElement.scrollHeight;
  return !(
    scrollHeight > viewportHeight * 1.5 && rect.height > viewportHeight * 3
  );
};

const getRestoredSize = (
  item: ReviewItem,
  presets: ReviewShellViewportPreset[]
): ReviewShellViewportPreset =>
  findViewportPreset(
    presets,
    Math.max(
      240,
      Math.round(item.viewport?.width ?? getFallbackPreset(presets).width)
    ),
    Math.max(
      320,
      Math.round(item.viewport?.height ?? getFallbackPreset(presets).height)
    )
  );

const getViewportPresetKind = (
  preset: ReviewShellViewportPreset
): ReviewShellViewportKind => {
  if (preset.kind) return preset.kind;

  const label = preset.label.toLowerCase();

  if (label.includes('mobile') || label.includes('phone')) return 'mobile';
  if (label.includes('tablet') || label.includes('pad')) return 'tablet';
  if (
    label.includes('wide') ||
    label.includes('1980') ||
    label.includes('1940') ||
    label.includes('1920')
  ) {
    return 'wide';
  }
  if (label.includes('desktop')) return 'desktop';
  if (preset.width >= 1800) return 'wide';
  if (preset.width >= 1000) return 'desktop';
  if (preset.width >= 700) return 'tablet';
  return 'mobile';
};

const ViewportPresetIcon = ({
  preset
}: {
  preset: ReviewShellViewportPreset;
}) => {
  return <ReviewScopeIcon scope={getViewportPresetKind(preset)} />;
};

const ReviewScopeIcon = ({ scope }: { scope: ReviewItemScope }) => {
  if (scope === 'mobile') return <SmartphoneIcon aria-hidden="true" />;
  if (scope === 'tablet') return <TabletIcon aria-hidden="true" />;
  if (scope === 'wide') return <Maximize2Icon aria-hidden="true" />;
  if (scope === 'dom') return <SquareMousePointerIcon aria-hidden="true" />;
  return <MonitorIcon aria-hidden="true" />;
};

const toReviewViewportPresets = (
  presets: ReviewShellViewportPreset[]
): ReviewViewportPreset[] =>
  presets.map((preset) => ({
    label: preset.label,
    width: preset.width,
    height: preset.height,
    scope: getViewportPresetKind(preset)
  }));

const getIsFigmaOverlayAvailable = (preset: ReviewShellViewportPreset) => {
  const kind = getViewportPresetKind(preset);
  return kind === 'mobile' || kind === 'wide';
};

const getRulerFrameDistance = (
  frame: ReviewRulerFrame,
  preset: ReviewShellViewportPreset
) => {
  const widthDistance =
    typeof frame.viewportWidth === 'number'
      ? Math.abs(frame.viewportWidth - preset.width)
      : 0;
  const heightDistance =
    typeof frame.viewportHeight === 'number'
      ? Math.abs(frame.viewportHeight - preset.height)
      : 0;
  return widthDistance + heightDistance;
};

const getReviewRulerFrame = (
  ruler: ReviewRulerConfig | undefined,
  preset: ReviewShellViewportPreset
) => {
  if (ruler?.enabled === false || !ruler?.frames?.length) return undefined;

  const kind = getViewportPresetKind(preset);
  const scopeMatches = ruler.frames.filter((frame) => frame.scope === kind);

  if (scopeMatches.length > 0) {
    return scopeMatches.reduce((closest, frame) =>
      getRulerFrameDistance(frame, preset) <
      getRulerFrameDistance(closest, preset)
        ? frame
        : closest
    );
  }

  return ruler.frames.reduce((closest, frame) =>
    getRulerFrameDistance(frame, preset) <
    getRulerFrameDistance(closest, preset)
      ? frame
      : closest
  );
};

const getRulerPointFromRect = (
  clientX: number,
  clientY: number,
  rect: DOMRect
): ReviewRulerPoint => {
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);

  return {
    x: Math.round(x),
    y: Math.round(y)
  };
};

const getRulerMeasure = (
  start: ReviewRulerPoint | null,
  end: ReviewRulerPoint | null
): ReviewRulerMeasure | undefined => {
  if (!start || !end) return undefined;

  return {
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
};

const formatRulerNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const FIGMA_OVERLAY_UNAVAILABLE_MESSAGE =
  '피그마 오버레이 디버깅이 안되는 해상도';
const FIGMA_TOKEN_STORAGE_KEY = 'figma-token';
const REVIEW_USER_ID_STORAGE_KEY = 'user-id';
const REVIEW_THEME_STORAGE_KEY = 'df-review-theme';
const DEFAULT_REVIEW_THEME: ReviewShellTheme = 'dark';
const FIGMA_TOKEN_GUIDE_ID = 'df-review-figma-token-guide';
const DEFAULT_INITIAL_REVIEW_PROMPT =
  'You are fixing QA issues collected with df-web-review-kit. Use the copied QA prompt as the source of truth for page, viewport, selector, coordinates, screenshot context, and user comment. Make the smallest code or CSS change that fixes the issue, preserve unrelated behavior, then verify the target viewport again.';

const REVIEW_THEME_OPTIONS: Array<{
  value: ReviewShellTheme;
  label: string;
}> = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' }
];

const normalizeReviewTheme = (value: string | null): ReviewShellTheme =>
  value === 'light' || value === 'system' || value === 'dark'
    ? value
    : DEFAULT_REVIEW_THEME;

const getStoredFigmaToken = () => {
  if (typeof window === 'undefined') return '';

  try {
    return window.localStorage.getItem(FIGMA_TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

const writeStoredFigmaToken = (token: string) => {
  if (typeof window === 'undefined') return;

  try {
    if (token) {
      window.localStorage.setItem(FIGMA_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(FIGMA_TOKEN_STORAGE_KEY);
    }
  } catch {
    return;
  }
};

const getStoredReviewUserId = () => {
  if (typeof window === 'undefined') return '';

  try {
    return window.localStorage.getItem(REVIEW_USER_ID_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

const writeStoredReviewUserId = (userId: string) => {
  if (typeof window === 'undefined') return;

  try {
    if (userId) {
      window.localStorage.setItem(REVIEW_USER_ID_STORAGE_KEY, userId);
    } else {
      window.localStorage.removeItem(REVIEW_USER_ID_STORAGE_KEY);
    }
  } catch {
    return;
  }
};

const getStoredReviewTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_REVIEW_THEME;

  try {
    return normalizeReviewTheme(
      window.localStorage.getItem(REVIEW_THEME_STORAGE_KEY)
    );
  } catch {
    return DEFAULT_REVIEW_THEME;
  }
};

const writeStoredReviewTheme = (theme: ReviewShellTheme) => {
  if (typeof window === 'undefined') return;

  try {
    if (theme === DEFAULT_REVIEW_THEME) {
      window.localStorage.removeItem(REVIEW_THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(REVIEW_THEME_STORAGE_KEY, theme);
    }
  } catch {
    return;
  }
};

const getSystemReviewTheme = (): Exclude<ReviewShellTheme, 'system'> => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
};

const getItemTitle = (item: ReviewItem) =>
  item.title || item.comment.split('\n')[0] || item.kind;

const getReviewStatusLabel = (status: ReviewItemStatus | undefined) =>
  REVIEW_WORKFLOW_STATUS_OPTIONS.find(
    (option) => option.value === normalizeReviewItemStatus(status)
  )?.label ?? REVIEW_WORKFLOW_STATUS_OPTIONS[0].label;

const getTargetOverlayState = (
  targetDocument: Document | undefined
): TargetOverlayState => ({
  grid: Boolean(
    targetDocument?.body.classList.contains('is-help') ||
    targetDocument?.querySelector('.helper.onShow')
  ),
  figma: Boolean(
    targetDocument?.querySelector(
      '.helper-figma-root, .helper-figma-loading-backdrop'
    )
  )
});

const formatItemMeta = (item: ReviewItem) => {
  const parts = [
    `${Math.round(item.viewport?.width ?? 0)}x${Math.round(item.viewport?.height ?? 0)}`
  ];

  if (item.scroll) {
    parts.push(
      `scroll ${Math.round(item.scroll.x)},${Math.round(item.scroll.y)}`
    );
  }

  return parts.join(' / ');
};

const formatPromptViewport = (item: ReviewItem) =>
  `${Math.round(item.viewport?.width ?? 0)}x${Math.round(
    item.viewport?.height ?? 0
  )}`;

const formatPromptPoint = (point: { x: number; y: number } | undefined) =>
  point ? `x=${Math.round(point.x)}, y=${Math.round(point.y)}` : '(none)';

const formatPromptSelection = (
  selection:
    | {
        x?: number;
        y?: number;
        left?: number;
        top?: number;
        width: number;
        height: number;
      }
    | undefined
) => {
  if (!selection) return '(none)';

  const x = 'x' in selection ? selection.x : selection.left;
  const y = 'y' in selection ? selection.y : selection.top;
  return `x=${Math.round(x ?? 0)}, y=${Math.round(y ?? 0)}, width=${Math.round(
    selection.width
  )}, height=${Math.round(selection.height)}`;
};

const decodePromptHtmlEntities = (value: string) =>
  value.replace(
    /&(#\d+|#x[\da-f]+|lt|gt|quot|apos|amp);/gi,
    (match, entity: string) => {
      const normalized = entity.toLowerCase();

      if (normalized === 'lt') return '<';
      if (normalized === 'gt') return '>';
      if (normalized === 'quot') return '"';
      if (normalized === 'apos') return "'";
      if (normalized === 'amp') return '&';

      const codePoint = normalized.startsWith('#x')
        ? Number.parseInt(normalized.slice(2), 16)
        : Number.parseInt(normalized.slice(1), 10);

      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : match;
    }
  );

const getPromptAnchorCandidates = (item: ReviewItem) => {
  const anchor = item.anchor;
  if (!anchor) return [];

  const seen = new Set<string>();
  return [anchor, ...(anchor.candidates ?? [])].filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatPromptSourceHint = (item: ReviewItem) => {
  const source = item.anchor?.source;
  if (!source) return '(none)';

  return [
    `Component: ${source.component ?? '(unknown)'}`,
    `File: ${source.file ?? '(unknown)'}`,
    `Section index: ${source.sectionIndex ?? '(unknown)'}`,
    `Section id: ${source.sectionId ?? '(none)'}`,
  ].join('\n');
};

const buildReviewItemPrompt = (
  numberedItem: NumberedReviewItem,
  reviewPathPrefix: string
) => {
  const { item } = numberedItem;
  const anchor = item.anchor;
  const candidates = getPromptAnchorCandidates(item);
  const candidateLines =
    candidates.length > 0
      ? candidates
          .map((candidate, index) => {
            const confidence =
              typeof candidate.confidence === 'number'
                ? `, confidence=${Math.round(candidate.confidence * 100)}%`
                : '';
            const fingerprint = candidate.textFingerprint
              ? `, text="${candidate.textFingerprint}"`
              : '';
            return `${index + 1}. ${candidate.selector} (${candidate.strategy}${confidence}${fingerprint})`;
          })
          .join('\n')
      : '(none)';

  return [
    'Fix this df-web-review-kit QA issue.',
    '',
    `Page: ${getItemTarget(item, reviewPathPrefix)}`,
    `URL: ${item.originalUrl ?? item.pageUrl}`,
    `QA item: ${numberedItem.displayLabel}`,
    `Status: ${getReviewStatusLabel(item.status)}`,
    `Viewport: ${numberedItem.label} ${formatPromptViewport(item)}`,
    `Scroll: ${formatPromptPoint(item.scroll)}`,
    '',
    'Target:',
    `Primary selector: ${anchor?.selector ?? '(missing)'}`,
    `Primary strategy: ${anchor?.strategy ?? '(missing)'}`,
    `Text fingerprint: ${anchor?.textFingerprint ?? '(none)'}`,
    'Selector candidates:',
    candidateLines,
    '',
    'Source hint:',
    formatPromptSourceHint(item),
    '',
    `Marker: ${formatPromptPoint(item.marker?.viewport)}`,
    `Marker relative: ${formatPromptPoint(item.marker?.relative)}`,
    `Selection: ${formatPromptSelection(item.selection?.viewport)}`,
    `Selection relative: ${formatPromptSelection(item.selection?.relative)}`,
    '',
    'Element HTML snippet:',
    '```html',
    anchor?.htmlSnippet
      ? decodePromptHtmlEntities(anchor.htmlSnippet)
      : '(not captured)',
    '```',
    '',
    'Issue:',
    item.comment,
    '',
    'Request:',
    'Find the target element with the selector candidates above and apply the smallest UI/CSS/code change that fixes this QA issue. If the selector is missing because CSR or hydration has not finished, wait for the page to load and use the Source hint first. Preserve unrelated layout and behavior.'
  ].join('\n');
};

const getPromptLengthLabel = (value: string) => {
  const length = value.length;
  if (length <= 2000) return `${length} chars / Discord 2,000 OK`;
  if (length <= 4000) return `${length} chars / Nitro 4,000 OK`;
  return `${length} chars / attach as file`;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ReviewShell = ({
  projectId,
  pages,
  storageKey = getStorageKey(projectId),
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ruler,
  initialPrompt = DEFAULT_INITIAL_REVIEW_PROMPT,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
}: ReviewShellProps) => {
  const viewportPresets =
    presets.length > 0 ? presets : DEFAULT_REVIEW_VIEWPORT_PRESETS;
  const reviewViewportPresets = useMemo(
    () => toReviewViewportPresets(viewportPresets),
    [viewportPresets]
  );
  const adapter = useMemo(
    () =>
      localAdapter({
        storageKey
      }),
    [storageKey]
  );
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const frameScrollRef = useRef<HTMLDivElement | null>(null);
  const rulerOverlayRef = useRef<HTMLDivElement | null>(null);
  const rulerDragRectRef = useRef<DOMRect | null>(null);
  const isRulerDraggingRef = useRef(false);
  const controllerRef = useRef<WebReviewKitController | null>(null);
  const cleanupTargetRef = useRef<(() => void) | null>(null);
  const pendingRestoreRef = useRef<ReviewItem | null>(null);
  const pendingInitialItemIdRef = useRef(getInitialItemId());
  const selectedItemIdRef = useRef(getInitialItemId());
  const [target, setTarget] = useState(() =>
    getInitialTarget(reviewPathPrefix)
  );
  const [draftTarget, setDraftTarget] = useState(() =>
    getInitialTarget(reviewPathPrefix)
  );
  const [activeRoute, setActiveRoute] = useState(() =>
    getInitialTarget(reviewPathPrefix)
  );
  const [size, setSize] = useState<ReviewShellViewportPreset>(() =>
    getInitialSize(viewportPresets)
  );
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [mode, setMode] = useState<ReviewMode>('idle');
  const [targetOverlayState, setTargetOverlayState] =
    useState<TargetOverlayState>({
      grid: false,
      figma: false
    });
  const [selectedItemId, setSelectedItemId] = useState(getInitialItemId());
  const [isListVisible, setIsListVisible] = useState(true);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isFigmaSettingsOpen, setIsFigmaSettingsOpen] = useState(false);
  const [figmaTokenDraft, setFigmaTokenDraft] = useState(getStoredFigmaToken);
  const [reviewUserIdDraft, setReviewUserIdDraft] = useState(
    getStoredReviewUserId
  );
  const [reviewTheme, setReviewTheme] = useState(getStoredReviewTheme);
  const [reviewThemeDraft, setReviewThemeDraft] =
    useState(getStoredReviewTheme);
  const [systemReviewTheme, setSystemReviewTheme] =
    useState(getSystemReviewTheme);
  const [figmaSettingsStatus, setFigmaSettingsStatus] = useState('');
  const [isFigmaTokenVisible, setIsFigmaTokenVisible] = useState(false);
  const [isFigmaTokenGuideOpen, setIsFigmaTokenGuideOpen] = useState(false);
  const [qaFilter, setQaFilter] = useState<ReviewQaFilter>('all');
  const [isRulerVisible, setIsRulerVisible] = useState(false);
  const [rulerStart, setRulerStart] = useState<ReviewRulerPoint | null>(null);
  const [rulerPoint, setRulerPoint] = useState<ReviewRulerPoint | null>(null);
  const [isRulerDragging, setIsRulerDragging] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy URL');
  const [promptItemId, setPromptItemId] = useState<string | null>(null);
  const [promptTab, setPromptTab] = useState<ReviewPromptTab>('item');
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);
  const targetRef = useRef(target);
  const sizeRef = useRef(size);

  const effectiveReviewTheme =
    reviewTheme === 'system' ? systemReviewTheme : reviewTheme;
  const isFigmaOverlayAvailable = getIsFigmaOverlayAvailable(size);
  const activeRulerFrame = useMemo(
    () => getReviewRulerFrame(ruler, size),
    [ruler, size]
  );
  const isRulerAvailable = Boolean(activeRulerFrame);
  const rulerUnit = ruler?.unit ?? 'px';
  const rulerScaleX = activeRulerFrame
    ? size.width / activeRulerFrame.designWidth
    : 1;
  const rulerScaleY =
    activeRulerFrame?.designHeight && activeRulerFrame.designHeight > 0
      ? size.height / activeRulerFrame.designHeight
      : rulerScaleX;
  const rulerMeasure = useMemo(
    () => getRulerMeasure(rulerStart, rulerPoint),
    [rulerPoint, rulerStart]
  );
  const rulerMeasureLabel = useMemo(() => {
    if (!rulerMeasure) return '';

    const designWidth = formatRulerNumber(rulerMeasure.width / rulerScaleX);
    const designHeight = formatRulerNumber(rulerMeasure.height / rulerScaleY);

    return `Figma ${designWidth}x${designHeight}${rulerUnit}`;
  }, [rulerMeasure, rulerScaleX, rulerScaleY, rulerUnit]);
  const targetSrc = useMemo(() => buildTargetSrc(target), [target]);
  const activeItems = useMemo(
    () =>
      items
        .filter((item) => getItemTarget(item, reviewPathPrefix) === activeRoute)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [activeRoute, items, reviewPathPrefix]
  );
  const numberedActiveItems = useMemo(
    () => getNumberedReviewItems(activeItems, reviewViewportPresets),
    [activeItems, reviewViewportPresets]
  );
  const filteredNumberedActiveItems = useMemo(
    () =>
      qaFilter === 'all'
        ? numberedActiveItems
        : numberedActiveItems.filter(
            (numberedItem) => numberedItem.scope === qaFilter
          ),
    [numberedActiveItems, qaFilter]
  );
  const qaFilterCounts = useMemo(() => {
    const counts = new Map<ReviewQaFilter, number>();
    counts.set('all', numberedActiveItems.length);
    numberedActiveItems.forEach((numberedItem) => {
      counts.set(numberedItem.scope, (counts.get(numberedItem.scope) ?? 0) + 1);
    });
    return counts;
  }, [numberedActiveItems]);
  const pageQaCounts = useMemo(() => {
    const counts = new Map<string, number>();

    items.forEach((item) => {
      const pageTarget = normalizeTarget(
        getItemTarget(item, reviewPathPrefix),
        reviewPathPrefix
      );
      counts.set(pageTarget, (counts.get(pageTarget) ?? 0) + 1);
    });

    return counts;
  }, [items, reviewPathPrefix]);
  const promptDialogNumberedItem = useMemo(
    () =>
      promptItemId
        ? numberedActiveItems.find(
            (numberedItem) => numberedItem.item.id === promptItemId
          )
        : undefined,
    [numberedActiveItems, promptItemId]
  );
  const initialPromptText = initialPrompt.trim();
  const promptDialogItemPrompt = promptDialogNumberedItem
    ? buildReviewItemPrompt(promptDialogNumberedItem, reviewPathPrefix)
    : '';
  const promptDialogItemCopyKey = promptDialogNumberedItem
    ? `dialog:${promptDialogNumberedItem.item.id}`
    : 'dialog:item';
  const promptDialogActiveText =
    promptTab === 'initial' ? initialPromptText : promptDialogItemPrompt;
  const promptDialogActiveLabel =
    promptTab === 'initial' ? 'Initial prompt' : 'This QA prompt';
  const promptDialogActiveCopyKey =
    promptTab === 'initial' ? 'initial' : promptDialogItemCopyKey;

  const refreshItems = useCallback(async () => {
    const nextItems = await adapter.list({
      projectId
    });
    setItems(nextItems);
    return nextItems;
  }, [adapter, projectId]);

  const refreshReviewData = useCallback(async () => {
    await controllerRef.current?.reload();
    await refreshItems();
  }, [refreshItems]);

  const clearSelectedItem = useCallback(() => {
    selectedItemIdRef.current = null;
    setSelectedItemId(null);
  }, []);

  const destroyReviewKit = useCallback(() => {
    cleanupTargetRef.current?.();
    cleanupTargetRef.current = null;
    controllerRef.current?.destroy();
    controllerRef.current = null;
  }, []);

  const syncTargetViewport = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  const refreshTargetOverlayState = useCallback(() => {
    setTargetOverlayState(
      getTargetOverlayState(iframeRef.current?.contentDocument ?? undefined)
    );
  }, []);

  const dispatchTargetOverlayHotkey = useCallback(
    (overlay: TargetOverlayKey) => {
      const targetWindow = iframeRef.current?.contentWindow;
      if (!targetWindow) return false;

      const code = overlay === 'grid' ? 'KeyG' : 'KeyF';
      targetWindow.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          code,
          key: code.replace('Key', '').toLowerCase(),
          shiftKey: true
        })
      );
      window.setTimeout(refreshTargetOverlayState, 80);
      return true;
    },
    [refreshTargetOverlayState]
  );

  const toggleTargetOverlay = useCallback(
    (overlay: TargetOverlayKey) => {
      if (overlay === 'figma' && !isFigmaOverlayAvailable) {
        refreshTargetOverlayState();
        return;
      }

      dispatchTargetOverlayHotkey(overlay);
    },
    [
      dispatchTargetOverlayHotkey,
      isFigmaOverlayAvailable,
      refreshTargetOverlayState
    ]
  );

  const syncShellTarget = useCallback(
    (nextTarget: string) => {
      const normalizedTarget = normalizeTarget(nextTarget, reviewPathPrefix);

      if (normalizedTarget !== targetRef.current) {
        clearSelectedItem();
        targetRef.current = normalizedTarget;
        setTarget(normalizedTarget);
        setDraftTarget(normalizedTarget);
        setActiveRoute(normalizedTarget);
      }

      if (selectedItemIdRef.current) {
        updateShellUrlForItem(
          normalizedTarget,
          sizeRef.current,
          selectedItemIdRef.current
        );
      } else {
        updateShellUrl(normalizedTarget, sizeRef.current);
      }
    },
    [clearSelectedItem, reviewPathPrefix]
  );

  const applyItemScroll = useCallback(
    (item: ReviewItem) => {
      const scrollToItem = () => {
        const targetWindow = iframeRef.current?.contentWindow;
        const targetDocument = iframeRef.current?.contentDocument;
        if (!targetWindow) return;

        const anchorElement = targetDocument
          ? queryReviewItemAnchorElement(targetDocument, item)
          : undefined;

        if (anchorElement) {
          anchorElement.scrollIntoView({
            block: 'center',
            inline: 'center'
          });
        } else {
          targetWindow.scrollTo(item.scroll?.x ?? 0, item.scroll?.y ?? 0);
        }
        syncTargetViewport();
        controllerRef.current?.highlightItem(item.id);
      };

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollToItem);
      });
      window.setTimeout(scrollToItem, 120);
      window.setTimeout(scrollToItem, 360);
      window.setTimeout(scrollToItem, 720);
    },
    [syncTargetViewport]
  );

  const applyPendingRestore = useCallback(() => {
    const item = pendingRestoreRef.current;
    if (!item) return;

    applyItemScroll(item);
    pendingRestoreRef.current = null;
  }, [applyItemScroll]);

  const cancelReviewMode = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || controller.getMode() === 'idle') return false;

    controller.setMode('idle');
    setMode(controller.getMode());
    return true;
  }, []);

  const clearRulerMeasure = useCallback(() => {
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setRulerStart(null);
    setRulerPoint(null);
    setIsRulerDragging(false);
  }, []);

  const closeRuler = useCallback(() => {
    if (!isRulerVisible) return false;

    setIsRulerVisible(false);
    clearRulerMeasure();
    return true;
  }, [clearRulerMeasure, isRulerVisible]);

  const toggleRuler = useCallback(() => {
    if (!isRulerAvailable) return;

    cancelReviewMode();
    setIsSitemapOpen(false);
    setIsFigmaSettingsOpen(false);
    setPromptItemId(null);
    clearRulerMeasure();
    setIsRulerVisible((current) => !current);
  }, [cancelReviewMode, clearRulerMeasure, isRulerAvailable]);

  const finishRulerDrag = useCallback((point?: ReviewRulerPoint) => {
    if (point) {
      setRulerPoint(point);
    }

    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setIsRulerDragging(false);
  }, []);

  const startRulerDrag = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const point = getRulerPointFromRect(clientX, clientY, rect);

      rulerDragRectRef.current = rect;
      isRulerDraggingRef.current = true;

      setRulerStart(point);
      setRulerPoint(point);
      setIsRulerDragging(true);
    },
    []
  );

  const reloadTargetFrame = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      return;
    }
  }, []);

  const openFigmaSettings = useCallback(() => {
    cancelReviewMode();
    setIsSitemapOpen(false);
    setPromptItemId(null);
    setFigmaTokenDraft(getStoredFigmaToken());
    setReviewUserIdDraft(getStoredReviewUserId());
    setReviewThemeDraft(reviewTheme);
    setFigmaSettingsStatus('');
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
    setIsFigmaSettingsOpen(true);
  }, [cancelReviewMode, reviewTheme]);

  const closeFigmaSettings = useCallback(() => {
    setIsFigmaSettingsOpen(false);
    setFigmaSettingsStatus('');
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
  }, []);

  const saveReviewSettings = useCallback(
    (token: string, userId: string, theme: ReviewShellTheme) => {
      const nextToken = token.trim();
      const nextUserId = userId.trim();
      const nextTheme = normalizeReviewTheme(theme);
      const shouldReload =
        nextToken !== getStoredFigmaToken() ||
        nextUserId !== getStoredReviewUserId();

      writeStoredFigmaToken(nextToken);
      writeStoredReviewUserId(nextUserId);
      writeStoredReviewTheme(nextTheme);
      setFigmaTokenDraft(nextToken);
      setReviewUserIdDraft(nextUserId);
      setReviewTheme(nextTheme);
      setReviewThemeDraft(nextTheme);
      setFigmaSettingsStatus(
        nextToken || nextUserId || nextTheme !== DEFAULT_REVIEW_THEME
          ? 'Saved'
          : 'Cleared'
      );

      if (shouldReload) {
        reloadTargetFrame();
      }
    },
    [reloadTargetFrame]
  );

  const restoreReviewItem = useCallback(
    (item: ReviewItem) => {
      const nextTarget = getItemTarget(item, reviewPathPrefix);
      const nextSize = getRestoredSize(item, viewportPresets);

      pendingRestoreRef.current = item;
      selectedItemIdRef.current = item.id;
      setSelectedItemId(item.id);
      setActiveRoute(nextTarget);
      setDraftTarget(nextTarget);
      setSize(nextSize);
      updateShellUrlForItem(nextTarget, nextSize, item.id);

      if (targetRef.current !== nextTarget) {
        setTarget(nextTarget);
        return;
      }

      applyPendingRestore();
    },
    [applyPendingRestore, viewportPresets, reviewPathPrefix]
  );

  const restoreInitialItem = useCallback(() => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;

    pendingInitialItemIdRef.current = null;

    const item = getStoredItem(itemId, storageKey);
    if (item) {
      restoreReviewItem(item);
    }
  }, [restoreReviewItem, storageKey]);

  const initReviewKit = useCallback(() => {
    destroyReviewKit();

    const iframe = iframeRef.current;
    const targetWindow = iframe?.contentWindow;
    const targetDocument = iframe?.contentDocument;
    if (!iframe || !targetWindow || !targetDocument) return;

    const syncRouteFromFrame = () => {
      syncShellTarget(targetWindow.location.pathname);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const targetElement = event.target;
      if (!targetElement || !('closest' in targetElement)) return;

      const link = (targetElement as Element).closest('a[href]');
      const href = link?.getAttribute('href');
      const linkTarget = link?.getAttribute('target');
      if (!href || (linkTarget && linkTarget !== '_self')) return;

      const url = new URL(href, targetWindow.location.href);
      if (url.origin !== targetWindow.location.origin) return;

      const nextTarget = normalizeTarget(url.pathname, reviewPathPrefix);
      if (nextTarget === targetRef.current) return;

      event.preventDefault();
      syncShellTarget(nextTarget);
    };

    const handleFrameKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (!cancelReviewMode() && !closeRuler()) return;

      event.preventDefault();
      event.stopPropagation();
    };

    const history = targetWindow.history;
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args: Parameters<History['pushState']>) => {
      originalPushState(...args);
      syncRouteFromFrame();
    };
    history.replaceState = (...args: Parameters<History['replaceState']>) => {
      originalReplaceState(...args);
      syncRouteFromFrame();
    };

    syncRouteFromFrame();
    targetWindow.addEventListener('popstate', syncRouteFromFrame);
    targetWindow.addEventListener('hashchange', syncRouteFromFrame);
    targetWindow.addEventListener('keydown', handleFrameKeyDown, true);
    targetDocument.addEventListener('click', handleClick, true);
    targetWindow.addEventListener('scroll', syncTargetViewport, true);
    targetWindow.addEventListener('resize', syncTargetViewport);
    cleanupTargetRef.current = () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      targetWindow.removeEventListener('popstate', syncRouteFromFrame);
      targetWindow.removeEventListener('hashchange', syncRouteFromFrame);
      targetWindow.removeEventListener('keydown', handleFrameKeyDown, true);
      targetDocument.removeEventListener('click', handleClick, true);
      targetWindow.removeEventListener('scroll', syncTargetViewport, true);
      targetWindow.removeEventListener('resize', syncTargetViewport);
    };

    controllerRef.current = createWebReviewKit({
      projectId,
      adapter,
      target: () => {
        const frame = iframeRef.current;
        const frameWindow = frame?.contentWindow;
        const frameDocument = frame?.contentDocument;

        if (!frame || !frameWindow || !frameDocument) return undefined;

        return {
          window: frameWindow,
          document: frameDocument,
          getViewportRect: () => frame.getBoundingClientRect()
        };
      },
      hotkeys: {
        qa: 'Shift+Q'
      },
      anchors: {
        attribute: 'data-qa-id'
      },
      viewports: {
        presets: reviewViewportPresets
      },
      ruler,
      onRestoreItem: restoreReviewItem,
      onItemsChange: () => {
        void refreshItems();
      },
      onModeChange: setMode,
      ui: {
        panel: false
      },
      modules: {
        qa: true,
        grid: false,
        figma: false
      }
    });
    controllerRef.current.open();
    setMode(controllerRef.current.getMode());
    void refreshItems();
    restoreInitialItem();
    applyPendingRestore();
    refreshTargetOverlayState();
  }, [
    adapter,
    applyPendingRestore,
    cancelReviewMode,
    closeRuler,
    destroyReviewKit,
    projectId,
    refreshItems,
    refreshTargetOverlayState,
    reviewViewportPresets,
    restoreInitialItem,
    restoreReviewItem,
    ruler,
    reviewPathPrefix,
    syncShellTarget,
    syncTargetViewport
  ]);

  useEffect(() => destroyReviewKit, [destroyReviewKit]);

  useEffect(() => {
    void refreshItems();
  }, [refreshItems]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const query = window.matchMedia('(prefers-color-scheme: light)');
    const syncSystemTheme = () => {
      setSystemReviewTheme(query.matches ? 'light' : 'dark');
    };

    syncSystemTheme();

    if (query.addEventListener) {
      query.addEventListener('change', syncSystemTheme);
      return () => query.removeEventListener('change', syncSystemTheme);
    }

    query.addListener(syncSystemTheme);
    return () => query.removeListener(syncSystemTheme);
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      'df-review-theme-light',
      effectiveReviewTheme === 'light'
    );
    document.body.classList.toggle(
      'df-review-theme-dark',
      effectiveReviewTheme === 'dark'
    );

    return () => {
      document.body.classList.remove(
        'df-review-theme-light',
        'df-review-theme-dark'
      );
    };
  }, [effectiveReviewTheme]);

  useEffect(() => {
    if (
      mode === 'idle' &&
      !isRulerVisible &&
      !promptItemId &&
      !isSitemapOpen &&
      !isFigmaSettingsOpen
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (mode !== 'idle' && cancelReviewMode()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (closeRuler()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (promptItemId) {
        setPromptItemId(null);
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (isSitemapOpen) {
        setIsSitemapOpen(false);
        return;
      }

      if (isFigmaSettingsOpen) {
        closeFigmaSettings();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    cancelReviewMode,
    closeRuler,
    closeFigmaSettings,
    isFigmaSettingsOpen,
    isRulerVisible,
    isSitemapOpen,
    promptItemId,
    mode
  ]);

  useEffect(() => {
    targetRef.current = target;
    setActiveRoute(target);
  }, [target]);

  useEffect(() => {
    sizeRef.current = size;
    if (selectedItemIdRef.current) {
      updateShellUrlForItem(targetRef.current, size, selectedItemIdRef.current);
    } else {
      updateShellUrl(targetRef.current, size);
    }
    syncTargetViewport();
  }, [size, syncTargetViewport]);

  useEffect(() => {
    const frameScroll = frameScrollRef.current;
    if (!frameScroll) return undefined;

    const centerFrameScroll = () => {
      frameScroll.scrollLeft = Math.max(
        0,
        (frameScroll.scrollWidth - frameScroll.clientWidth) / 2
      );
      frameScroll.scrollTop = 0;
    };

    const animationFrame = window.requestAnimationFrame(centerFrameScroll);
    const transitionTimeout = window.setTimeout(centerFrameScroll, 180);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(transitionTimeout);
    };
  }, [isListVisible, size.height, size.width, targetSrc]);

  useEffect(() => {
    if (isFigmaOverlayAvailable || !targetOverlayState.figma) return;

    dispatchTargetOverlayHotkey('figma');
  }, [
    dispatchTargetOverlayHotkey,
    isFigmaOverlayAvailable,
    targetOverlayState.figma
  ]);

  useEffect(() => {
    if (!isRulerVisible || !isRulerAvailable) return undefined;

    const getRulerEventClientPoint = (event: MouseEvent) => {
      const frame = iframeRef.current;
      let isFrameEvent = false;

      try {
        isFrameEvent =
          Boolean(frame?.contentWindow) && event.view === frame?.contentWindow;

        if (!isFrameEvent && frame?.contentDocument) {
          const targetDocument = (
            event.target as { ownerDocument?: Document } | null
          )?.ownerDocument;
          isFrameEvent = targetDocument === frame.contentDocument;
        }
      } catch {
        isFrameEvent = false;
      }

      if (isFrameEvent && frame) {
        const frameRect = frame.getBoundingClientRect();

        return {
          clientX: event.clientX + frameRect.left,
          clientY: event.clientY + frameRect.top
        };
      }

      return {
        clientX: event.clientX,
        clientY: event.clientY
      };
    };

    const getActiveRulerPoint = (event: MouseEvent) => {
      const rect =
        rulerDragRectRef.current ??
        rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return undefined;

      const point = getRulerEventClientPoint(event);

      return getRulerPointFromRect(point.clientX, point.clientY, rect);
    };

    const handleDragStart: EventListener = (event) => {
      if (isRulerDraggingRef.current) return;

      const mouseEvent = event as MouseEvent;
      if (mouseEvent.button !== 0) return;

      const overlay = rulerOverlayRef.current;
      const target = mouseEvent.target;
      if (!overlay || !(target instanceof Node) || !overlay.contains(target)) {
        return;
      }

      event.preventDefault();
      startRulerDrag(
        mouseEvent.clientX,
        mouseEvent.clientY,
        overlay.getBoundingClientRect()
      );
    };

    const handleDragMove: EventListener = (event) => {
      if (!isRulerDraggingRef.current) return;

      const point = getActiveRulerPoint(event as MouseEvent);
      if (!point) return;

      event.preventDefault();
      setRulerPoint(point);
    };

    const handleDragEnd: EventListener = (event) => {
      if (!isRulerDraggingRef.current) return;

      const point = getActiveRulerPoint(event as MouseEvent);
      event.preventDefault();
      finishRulerDrag(point);
    };

    const handleWindowBlur = () => {
      if (!isRulerDraggingRef.current) return;

      finishRulerDrag();
    };

    const dragTargets = new Set<EventTarget>([window]);
    const frame = iframeRef.current;

    try {
      if (frame?.contentWindow) dragTargets.add(frame.contentWindow);
      if (frame?.contentDocument) dragTargets.add(frame.contentDocument);
    } catch {
      // Cross-origin frames cannot expose their document. Parent listeners still run.
    }

    dragTargets.forEach((target) => {
      target.addEventListener('mousedown', handleDragStart, true);
      target.addEventListener('mousemove', handleDragMove, true);
      target.addEventListener('mouseup', handleDragEnd, true);
    });

    window.addEventListener('blur', handleWindowBlur);

    return () => {
      dragTargets.forEach((target) => {
        target.removeEventListener('mousedown', handleDragStart, true);
        target.removeEventListener('mousemove', handleDragMove, true);
        target.removeEventListener('mouseup', handleDragEnd, true);
      });
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [finishRulerDrag, isRulerAvailable, isRulerVisible, startRulerDrag]);

  useEffect(() => {
    clearRulerMeasure();
  }, [clearRulerMeasure, size.height, size.width, targetSrc]);

  useEffect(() => {
    if (!isRulerVisible || isRulerAvailable) return;
    closeRuler();
  }, [closeRuler, isRulerAvailable, isRulerVisible]);

  const applyTarget = () => {
    const normalizedTarget = normalizeTarget(draftTarget, reviewPathPrefix);
    clearSelectedItem();
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current);
  };

  const selectPage = (href: string) => {
    const normalizedTarget = normalizeTarget(href, reviewPathPrefix);
    clearSelectedItem();
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current);
    setIsSitemapOpen(false);
  };

  const setReviewMode = (nextMode: ReviewMode) => {
    closeRuler();
    controllerRef.current?.setMode(nextMode);
    setMode(controllerRef.current?.getMode() ?? 'idle');
  };

  const copyCurrentUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopyLabel('Copied');
    window.setTimeout(() => setCopyLabel('Copy URL'), 1200);
  };

  const updateItemStatus = async (
    item: ReviewItem,
    status: ReviewWorkflowStatus
  ) => {
    await adapter.update(item.id, { status });
    await refreshReviewData();
  };

  const copyPrompt = async (value: string, key: string) => {
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopiedPromptKey(key);
    window.setTimeout(() => {
      setCopiedPromptKey((current) => (current === key ? null : current));
    }, 1200);
  };

  const copyItemPrompt = async (numberedItem: NumberedReviewItem) => {
    await copyPrompt(
      buildReviewItemPrompt(numberedItem, reviewPathPrefix),
      `item:${numberedItem.item.id}`
    );
  };

  const removeItem = async (item: ReviewItem) => {
    await adapter.remove(item.id);
    if (selectedItemIdRef.current === item.id) {
      clearSelectedItem();
      updateShellUrl(targetRef.current, sizeRef.current);
    }
    await refreshReviewData();
  };

  return (
    <div
      className={`df-review-shell is-theme-${effectiveReviewTheme}${
        isListVisible ? ' is-list-visible' : ''
      }`}
    >
      <header className="df-review-topbar">
        <form
          className="df-review-address"
          onSubmit={(event) => {
            event.preventDefault();
            applyTarget();
          }}
        >
          <button
            aria-label="Open sitemap"
            className="df-review-sitemap-button"
            data-tooltip="Sitemap"
            type="button"
            onClick={() => setIsSitemapOpen(true)}
          >
            <MapIcon aria-hidden="true" />
          </button>
          <input
            aria-label="Path"
            value={draftTarget}
            onChange={(event) => setDraftTarget(event.target.value)}
          />
          <button type="submit">Load</button>
          <button type="button" onClick={() => void copyCurrentUrl()}>
            {copyLabel}
          </button>
        </form>

        <div className="df-review-tools">
          <div className="df-review-tool-controls">
            <div className="df-review-presets" aria-label="Viewport presets">
              {viewportPresets.map((preset) => (
                <button
                  key={preset.label}
                  className={preset.label === size.label ? 'is-active' : ''}
                  type="button"
                  onClick={() => setSize(preset)}
                >
                  <ViewportPresetIcon preset={preset} />
                  <span className="df-review-preset-copy">
                    <strong>{preset.label}</strong>
                  </span>
                </button>
              ))}
            </div>

            <span className="df-review-tool-divider" aria-hidden="true">
              |
            </span>

            <span className="df-review-active-size">
              {size.width}x{size.height}
            </span>
          </div>

          <div className="df-review-overlays" aria-label="Target overlays">
            <button
              aria-label="Toggle grid overlay"
              className={`df-review-overlay-button is-grid${
                targetOverlayState.grid ? ' is-active' : ''
              }`}
              data-tooltip="Grid"
              type="button"
              onClick={() => toggleTargetOverlay('grid')}
            >
              <LayoutGridIcon aria-hidden="true" />
            </button>
            <button
              aria-disabled={!isFigmaOverlayAvailable}
              aria-label={
                isFigmaOverlayAvailable
                  ? 'Toggle Figma overlay'
                  : FIGMA_OVERLAY_UNAVAILABLE_MESSAGE
              }
              className={`df-review-overlay-button is-figma${
                targetOverlayState.figma ? ' is-active' : ''
              }${isFigmaOverlayAvailable ? '' : ' is-disabled'}`}
              data-tooltip={
                isFigmaOverlayAvailable
                  ? 'Figma'
                  : FIGMA_OVERLAY_UNAVAILABLE_MESSAGE
              }
              type="button"
              onClick={() => toggleTargetOverlay('figma')}
            >
              <ImageIcon aria-hidden="true" />
            </button>
            {isRulerAvailable && (
              <button
                aria-label="Toggle ruler"
                className={`df-review-overlay-button is-ruler${
                  isRulerVisible ? ' is-active' : ''
                }`}
                data-tooltip="Ruler"
                type="button"
                onClick={toggleRuler}
              >
                <RulerIcon aria-hidden="true" />
              </button>
            )}
            <button
              aria-label="Open settings"
              className="df-review-overlay-button is-settings"
              data-tooltip="Settings"
              type="button"
              onClick={openFigmaSettings}
            >
              <SettingsIcon aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {isSitemapOpen && (
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
            onClick={() => setIsSitemapOpen(false)}
          />
          <div className="df-review-sitemap-dialog">
            <div className="df-review-sitemap-header">
              <div>
                <strong>Sitemap</strong>
                <span>{pages.length} pages</span>
              </div>
              <button
                aria-label="Close sitemap"
                type="button"
                onClick={() => setIsSitemapOpen(false)}
              >
                x
              </button>
            </div>
            <div className="df-review-sitemap-list">
              {pages.map((page) => {
                const pageTarget = normalizeTarget(page.href, reviewPathPrefix);
                const qaCount = pageQaCounts.get(pageTarget) ?? 0;

                return (
                  <button
                    key={page.href}
                    aria-label={`${page.href} / ${qaCount} QA`}
                    className={pageTarget === activeRoute ? 'is-active' : ''}
                    type="button"
                    onClick={() => selectPage(page.href)}
                  >
                    <span className="df-review-sitemap-path">{page.href}</span>
                    <span className="df-review-sitemap-count">{qaCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isFigmaSettingsOpen && (
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
            onClick={closeFigmaSettings}
          />
          <form
            className="df-review-settings-dialog"
            onSubmit={(event) => {
              event.preventDefault();
              saveReviewSettings(
                figmaTokenDraft,
                reviewUserIdDraft,
                reviewThemeDraft
              );
            }}
          >
            <div className="df-review-settings-header">
              <div>
                <strong>Settings</strong>
                <span>
                  {FIGMA_TOKEN_STORAGE_KEY} / {REVIEW_USER_ID_STORAGE_KEY} /{' '}
                  {REVIEW_THEME_STORAGE_KEY}
                </span>
              </div>
              <button
                aria-label="Close settings"
                type="button"
                onClick={closeFigmaSettings}
              >
                x
              </button>
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
                    onClick={() =>
                      setIsFigmaTokenGuideOpen((current) => !current)
                    }
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
                    className={
                      isFigmaTokenVisible ? undefined : 'is-token-masked'
                    }
                    data-1p-ignore="true"
                    data-lpignore="true"
                    inputMode="text"
                    name="df-review-figma-access-key"
                    spellCheck={false}
                    type="text"
                    value={figmaTokenDraft}
                    onChange={(event) => {
                      setFigmaTokenDraft(event.target.value);
                      setFigmaSettingsStatus('');
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
                    onClick={() =>
                      setIsFigmaTokenVisible((current) => !current)
                    }
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
                      setReviewUserIdDraft(event.target.value);
                      setFigmaSettingsStatus('');
                    }}
                  />
                </div>
              </label>
              <label className="df-review-settings-field">
                <span>Theme</span>
                <div className="df-review-settings-select-input">
                  <select
                    aria-label="Review theme"
                    value={reviewThemeDraft}
                    onChange={(event) => {
                      setReviewThemeDraft(
                        normalizeReviewTheme(event.target.value)
                      );
                      setFigmaSettingsStatus('');
                    }}
                  >
                    {REVIEW_THEME_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              {figmaSettingsStatus && (
                <p className="df-review-settings-status">
                  {figmaSettingsStatus}
                </p>
              )}
              <div className="df-review-settings-actions">
                <button
                  type="button"
                  onClick={() =>
                    saveReviewSettings('', '', DEFAULT_REVIEW_THEME)
                  }
                >
                  Clear
                </button>
                <span />
                <button type="button" onClick={closeFigmaSettings}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {promptDialogNumberedItem && (
        <div
          aria-label="Prompt"
          aria-modal="true"
          className="df-review-prompt-modal"
          role="dialog"
        >
          <button
            aria-label="Close prompt"
            className="df-review-prompt-backdrop"
            type="button"
            onClick={() => setPromptItemId(null)}
          />
          <div className="df-review-prompt-dialog">
            <div className="df-review-prompt-header">
              <div>
                <strong>Prompt</strong>
                <span>
                  {promptDialogNumberedItem.displayLabel} /{' '}
                  {getItemTitle(promptDialogNumberedItem.item)}
                </span>
              </div>
              <button
                aria-label="Close prompt"
                type="button"
                onClick={() => setPromptItemId(null)}
              >
                x
              </button>
            </div>
            <div className="df-review-prompt-body">
              <div className="df-review-prompt-tabs" role="tablist">
                <button
                  aria-selected={promptTab === 'initial'}
                  className={promptTab === 'initial' ? 'is-active' : ''}
                  role="tab"
                  type="button"
                  onClick={() => setPromptTab('initial')}
                >
                  Initial prompt
                </button>
                <button
                  aria-selected={promptTab === 'item'}
                  className={promptTab === 'item' ? 'is-active' : ''}
                  role="tab"
                  type="button"
                  onClick={() => setPromptTab('item')}
                >
                  This QA prompt
                </button>
              </div>
              <section className="df-review-prompt-block" role="tabpanel">
                <div className="df-review-prompt-block-header">
                  <div>
                    <strong>{promptDialogActiveLabel}</strong>
                    <span>{getPromptLengthLabel(promptDialogActiveText)}</span>
                  </div>
                  <button
                    disabled={!promptDialogActiveText}
                    type="button"
                    onClick={() =>
                      void copyPrompt(promptDialogActiveText, promptDialogActiveCopyKey)
                    }
                  >
                    <CopyIcon aria-hidden="true" />
                    {copiedPromptKey === promptDialogActiveCopyKey
                      ? 'Copied'
                      : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  aria-label={promptDialogActiveLabel}
                  value={
                    promptDialogActiveText ||
                    `${promptDialogActiveLabel} is not configured.`
                  }
                />
              </section>
            </div>
          </div>
        </div>
      )}

      <div className="df-review-side-rail">
        <button
          aria-label={isListVisible ? 'Hide QA list' : 'Show QA list'}
          className="df-review-side-toggle"
          type="button"
          onClick={() => setIsListVisible((current) => !current)}
        >
          <span aria-hidden="true">
            <GripVerticalIcon />
          </span>
          <strong>QA</strong>
        </button>
      </div>

      <aside className="df-review-qa-panel" aria-hidden={!isListVisible}>
        <div className="df-review-panel-body">
          <section className="df-review-item-list">
            <div className="df-review-list-header">
              <div className="df-review-list-title">
                <span>Current page QA</span>
                <strong>
                  {filteredNumberedActiveItems.length}
                  {qaFilter === 'all' ? '' : `/${activeItems.length}`}
                </strong>
              </div>
              <div className="df-review-filter-tabs" aria-label="QA filters">
                {REVIEW_QA_FILTERS.map((filter) => {
                  const count = qaFilterCounts.get(filter.key) ?? 0;
                  const isActive = qaFilter === filter.key;

                  return (
                    <button
                      key={filter.key}
                      aria-label={`${filter.label} QA (${count})`}
                      aria-pressed={isActive}
                      className={`df-review-filter-tab${
                        isActive ? ' is-active' : ''
                      }`}
                      data-tooltip={`${filter.label} ${count}`}
                      title={`${filter.label} (${count})`}
                      type="button"
                      onClick={() => setQaFilter(filter.key)}
                    >
                      {filter.scope ? (
                        <ReviewScopeIcon scope={filter.scope} />
                      ) : (
                        <ListFilterIcon aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="df-review-list-scroll">
              {activeItems.length === 0 && (
                <p className="df-review-empty">No QA on this page.</p>
              )}
              {activeItems.length > 0 &&
                filteredNumberedActiveItems.length === 0 && (
                  <p className="df-review-empty">No QA in this filter.</p>
                )}
              {filteredNumberedActiveItems.map((numberedItem) => {
                const { item } = numberedItem;

                return (
                  <article
                    key={item.id}
                    className={`df-review-item-card${
                      item.id === selectedItemId ? ' is-active' : ''
                    }`}
                  >
                    <button
                      aria-label="Delete QA"
                      className="df-review-item-delete"
                      data-tooltip="Delete"
                      title="Delete"
                      type="button"
                      onClick={() => void removeItem(item)}
                    >
                      <XIcon aria-hidden="true" />
                    </button>
                    <button
                      className="df-review-item-main"
                      type="button"
                      onClick={() => restoreReviewItem(item)}
                    >
                      <span className="df-review-item-badges">
                        <span
                          className={`df-review-item-viewport is-scope-${numberedItem.scope}`}
                        >
                          <ReviewScopeIcon scope={numberedItem.scope} />
                          {numberedItem.displayLabel}
                        </span>
                        <span className="df-review-item-kind">{item.kind}</span>
                        <span className="df-review-item-status-badge">
                          {getReviewStatusLabel(item.status)}
                        </span>
                      </span>
                      <strong>{getItemTitle(item)}</strong>
                      <small>{formatDate(item.createdAt)}</small>
                      <small>{formatItemMeta(item)}</small>
                      {item.screenshot && (
                        <img src={item.screenshot.dataUrl} alt="" />
                      )}
                    </button>
                    <div
                      className="df-review-item-actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="df-review-item-prompt-actions">
                        <button
                          className="df-review-item-prompt"
                          type="button"
                          onClick={() => {
                            setPromptTab('item');
                            setPromptItemId(item.id);
                          }}
                        >
                          Prompt
                        </button>
                        <button
                          aria-label="Copy QA prompt"
                          className={`df-review-item-prompt-copy${
                            copiedPromptKey === `item:${item.id}`
                              ? ' is-copied'
                              : ''
                          }`}
                          data-tooltip={
                            copiedPromptKey === `item:${item.id}`
                              ? 'Copied'
                              : 'Copy prompt'
                          }
                          type="button"
                          onClick={() => void copyItemPrompt(numberedItem)}
                        >
                          <CopyIcon aria-hidden="true" />
                        </button>
                      </div>
                      <select
                        aria-label="Workflow status"
                        className="df-review-item-status-select"
                        value={normalizeReviewItemStatus(item.status)}
                        onChange={(event) =>
                          void updateItemStatus(
                            item,
                            event.currentTarget.value as ReviewWorkflowStatus
                          )
                        }
                      >
                        {REVIEW_WORKFLOW_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </aside>

      <main className="df-review-stage">
        <div className="df-review-frame">
          <div className="df-review-frame-scroll" ref={frameScrollRef}>
            <div className="df-review-frame-canvas">
              <div
                className="df-review-device"
                style={{
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                  minWidth: `${size.width}px`,
                  minHeight: `${size.height}px`
                }}
              >
                <iframe
                  key={targetSrc}
                  ref={iframeRef}
                  width={size.width}
                  height={size.height}
                  src={targetSrc}
                  title="Review target"
                  onLoad={initReviewKit}
                />
                {isRulerVisible && activeRulerFrame && (
                  <div
                    ref={rulerOverlayRef}
                    aria-label="Ruler"
                    className={`df-review-ruler-overlay${
                      isRulerDragging ? ' is-dragging' : ''
                    }`}
                    role="application"
                    style={
                      {
                        '--df-review-ruler-step-x': `${rulerScaleX * 10}px`,
                        '--df-review-ruler-major-x': `${rulerScaleX * 100}px`,
                        '--df-review-ruler-step-y': `${rulerScaleY * 10}px`,
                        '--df-review-ruler-major-y': `${rulerScaleY * 100}px`
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className="df-review-ruler-axis is-x"
                      aria-hidden="true"
                    />
                    <div
                      className="df-review-ruler-axis is-y"
                      aria-hidden="true"
                    />
                    {rulerPoint && (
                      <>
                        <div
                          className="df-review-ruler-guide is-x"
                          aria-hidden="true"
                          style={{ top: `${rulerPoint.y}px` }}
                        />
                        <div
                          className="df-review-ruler-guide is-y"
                          aria-hidden="true"
                          style={{ left: `${rulerPoint.x}px` }}
                        />
                      </>
                    )}
                    {rulerMeasure &&
                      (rulerMeasure.width > 0 || rulerMeasure.height > 0) && (
                        <>
                          <div
                            className="df-review-ruler-selection"
                            aria-hidden="true"
                            style={{
                              left: `${rulerMeasure.left}px`,
                              top: `${rulerMeasure.top}px`,
                              width: `${rulerMeasure.width}px`,
                              height: `${rulerMeasure.height}px`
                            }}
                          />
                          <div
                            className="df-review-ruler-label"
                            style={{
                              left: `${Math.min(
                                Math.max(
                                  rulerMeasure.left + rulerMeasure.width + 8,
                                  8
                                ),
                                Math.max(8, size.width - 164)
                              )}px`,
                              top: `${Math.min(
                                Math.max(
                                  rulerMeasure.top + rulerMeasure.height + 8,
                                  8
                                ),
                                Math.max(8, size.height - 34)
                              )}px`
                            }}
                          >
                            {rulerMeasureLabel}
                          </div>
                        </>
                      )}
                    <div className="df-review-ruler-info">
                      <strong>{activeRulerFrame.label ?? size.label}</strong>
                      <span>
                        {activeRulerFrame.designWidth}
                        {activeRulerFrame.designHeight
                          ? `x${activeRulerFrame.designHeight}`
                          : ''}
                        {rulerUnit}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="df-review-frame-actions">
            <div className="df-review-mode" aria-label="Add QA">
              <button
                aria-label="Element"
                className={`df-review-mode-button is-element${
                  mode === 'element' ? ' is-active' : ''
                }`}
                data-tooltip="Element"
                type="button"
                onClick={() => setReviewMode('element')}
              >
                <SquareMousePointerIcon aria-hidden="true" />
              </button>
              <span className="df-review-mode-divider" aria-hidden="true">
                |
              </span>
              <button
                aria-label="Note"
                className={`df-review-mode-button is-note${
                  mode === 'text' ? ' is-active' : ''
                }`}
                data-tooltip="Note"
                type="button"
                onClick={() => setReviewMode('text')}
              >
                <StickyNoteIcon aria-hidden="true" />
              </button>
              <button
                aria-label="Capture"
                className={`df-review-mode-button is-capture${
                  mode === 'capture' ? ' is-active' : ''
                }`}
                data-tooltip="Capture"
                type="button"
                onClick={() => setReviewMode('capture')}
              >
                <ScanIcon aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const mountReviewShell = (options: ReviewShellMountOptions) => {
  if (typeof document === 'undefined' || !document.head) return;

  const { rootId = 'root', ...shellProps } = options;

  if (!document.getElementById(REVIEW_SHELL_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = REVIEW_SHELL_STYLE_ID;
    style.textContent = `
	  * {
	    box-sizing: border-box;
	    scrollbar-color: var(--df-review-scrollbar-thumb, rgba(237, 243, 251, 0.2)) var(--df-review-scrollbar-track, rgba(237, 243, 251, 0.04));
	    scrollbar-width: thin;
	  }

	  *::-webkit-scrollbar {
	    width: 10px;
	    height: 10px;
	  }

	  *::-webkit-scrollbar-track {
	    background: var(--df-review-scrollbar-track, rgba(237, 243, 251, 0.04));
	  }

	  *::-webkit-scrollbar-thumb {
	    border: 2px solid var(--df-review-scrollbar-border, rgba(15, 18, 24, 0.92));
	    border-radius: 999px;
	    background: var(--df-review-scrollbar-thumb, rgba(237, 243, 251, 0.18));
	  }

	  *::-webkit-scrollbar-thumb:hover {
	    background: var(--df-review-scrollbar-thumb-hover, rgba(237, 243, 251, 0.28));
	  }

	  *::-webkit-scrollbar-corner {
	    background: transparent;
	  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
  }

	  body {
	    overflow: hidden;
	    --df-review-bg: #0f1218;
	    --df-review-topbar: #171c24;
	    --df-review-panel: #131821;
	    --df-review-panel-strong: #1b2430;
	    --df-review-control: #202938;
	    --df-review-control-hover: #273345;
	    --df-review-line: rgba(226, 233, 245, 0.14);
	    --df-review-line-soft: rgba(226, 233, 245, 0.08);
	    --df-review-text: #edf3fb;
	    --df-review-muted: rgba(237, 243, 251, 0.58);
	    --df-review-subtle: rgba(237, 243, 251, 0.42);
	    --df-review-accent: #7cc7ff;
	    --df-review-accent-soft: rgba(124, 199, 255, 0.12);
	    --df-review-accent-hover: rgba(124, 199, 255, 0.2);
	    --df-review-note: #f3b75f;
	    --df-review-note-soft: rgba(243, 183, 95, 0.14);
	    --df-review-capture: #63d7c7;
	    --df-review-capture-soft: rgba(99, 215, 199, 0.14);
	    --df-review-tooltip-bg: #0a0d12;
	    --df-review-side-rail: #111722;
	    --df-review-mode-bar: rgba(15, 18, 24, 0.86);
	    --df-review-chip-bg: rgba(237, 243, 251, 0.06);
	    --df-review-scrollbar-track: rgba(237, 243, 251, 0.04);
	    --df-review-scrollbar-thumb: rgba(237, 243, 251, 0.18);
	    --df-review-scrollbar-thumb-hover: rgba(237, 243, 251, 0.28);
	    --df-review-scrollbar-border: rgba(15, 18, 24, 0.92);
	    background: var(--df-review-bg);
	    color: var(--df-review-text);
	    font-family:
	      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
	      "Segoe UI", sans-serif;
	  }

	  body.df-review-theme-light {
	    --df-review-bg: #f4f6f9;
	    --df-review-topbar: #ffffff;
	    --df-review-panel: #ffffff;
	    --df-review-panel-strong: #edf1f6;
	    --df-review-control: #eef2f7;
	    --df-review-control-hover: #e3e9f1;
	    --df-review-line: rgba(16, 24, 40, 0.14);
	    --df-review-line-soft: rgba(16, 24, 40, 0.08);
	    --df-review-text: #17202c;
	    --df-review-muted: rgba(23, 32, 44, 0.62);
	    --df-review-subtle: rgba(23, 32, 44, 0.44);
	    --df-review-accent: #1769aa;
	    --df-review-accent-soft: rgba(23, 105, 170, 0.1);
	    --df-review-accent-hover: rgba(23, 105, 170, 0.16);
	    --df-review-note: #a76617;
	    --df-review-note-soft: rgba(167, 102, 23, 0.12);
	    --df-review-capture: #087f73;
	    --df-review-capture-soft: rgba(8, 127, 115, 0.12);
	    --df-review-tooltip-bg: #17202c;
	    --df-review-side-rail: #edf1f6;
	    --df-review-mode-bar: rgba(255, 255, 255, 0.9);
	    --df-review-chip-bg: rgba(23, 32, 44, 0.06);
	    --df-review-scrollbar-track: rgba(23, 32, 44, 0.06);
	    --df-review-scrollbar-thumb: rgba(23, 32, 44, 0.24);
	    --df-review-scrollbar-thumb-hover: rgba(23, 32, 44, 0.34);
	    --df-review-scrollbar-border: rgba(244, 246, 249, 0.92);
	  }

	  button,
	  input,
	  select,
	  textarea {
	    font: inherit;
	  }

  button {
    cursor: pointer;
  }

  .df-review-shell {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 0 32px;
    grid-template-rows: auto minmax(0, 1fr);
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: grid-template-columns 160ms ease;
  }

  .df-review-shell.is-list-visible {
    grid-template-columns: minmax(0, 1fr) clamp(320px, 28vw, 420px) 32px;
  }

	  .df-review-topbar {
	    grid-column: 1;
	    grid-row: 1;
	    display: grid;
	    gap: 10px;
	    min-width: 0;
	    padding: 12px 16px;
	    border-bottom: 1px solid var(--df-review-line);
	    background: var(--df-review-topbar);
	  }

		  .df-review-address {
		    display: grid;
		    grid-template-columns: auto minmax(0, 1fr) auto auto;
		    gap: 8px;
		    width: 100%;
		    max-width: 1440px;
		    margin: 0 auto;
		  }

  .df-review-address input {
	    width: 100%;
	    min-height: 34px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 6px;
	    padding: 0 10px;
	    color: var(--df-review-text);
	    background: var(--df-review-bg);
	    font-size: 13px;
	  }

	  .df-review-address input:focus {
	    outline: 2px solid rgba(124, 199, 255, 0.58);
	    outline-offset: 1px;
	  }

		  .df-review-address button,
		  .df-review-side-toggle,
		  .df-review-presets button,
		  .df-review-overlay-button,
			  .df-review-mode-button,
			  .df-review-settings-header button,
			  .df-review-prompt-header button,
			  .df-review-settings-actions button,
			  .df-review-prompt-tabs button,
			  .df-review-prompt-block-header button,
			  .df-review-item-actions button,
			  .df-review-item-status-select {
		    min-height: 34px;
		    border: 1px solid var(--df-review-line);
		    border-radius: 6px;
		    background: var(--df-review-control);
	    color: var(--df-review-text);
	    font-size: 12px;
	    font-weight: 700;
	  }

		  .df-review-address button:hover,
	  .df-review-side-toggle:hover,
		  .df-review-presets button:hover,
		  .df-review-overlay-button:hover,
		  .df-review-mode-button:hover,
		  .df-review-settings-header button:hover,
		  .df-review-prompt-header button:hover,
		  .df-review-settings-actions button:hover,
		  .df-review-prompt-tabs button:hover,
		  .df-review-prompt-tabs button.is-active,
		  .df-review-prompt-block-header button:hover,
			  .df-review-item-actions button:hover,
		  .df-review-item-delete:hover,
		  .df-review-item-status-select:hover,
		  .df-review-presets button.is-active,
			  .df-review-overlay-button.is-active,
			  .df-review-mode-button.is-active {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-control-hover);
		  }

	  .df-review-sitemap-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: 38px;
	    min-width: 38px;
	    padding: 0;
	    color: var(--df-review-accent);
	  }

  .df-review-sitemap-button svg,
  .df-review-sitemap-header button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .df-review-sitemap-button::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 0;
    bottom: -30px;
    z-index: 5;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-2px);
	    border: 1px solid var(--df-review-line);
	    border-radius: 5px;
	    padding: 4px 7px;
	    background: var(--df-review-tooltip-bg);
	    color: var(--df-review-text);
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    transition:
      opacity 120ms ease,
      transform 120ms ease;
  }

	  .df-review-sitemap-button:hover::after,
	  .df-review-sitemap-button:focus-visible::after {
	    opacity: 1;
	    transform: translateY(0);
	  }

  .df-review-sitemap-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
				    padding: 18px;
  }

	  .df-review-sitemap-backdrop {
	    position: absolute;
	    inset: 0;
	    min-height: 0;
	    border: 0;
	    border-radius: 0;
	    padding: 0;
	    background: rgba(2, 6, 12, 0.62);
	  }

  .df-review-sitemap-dialog {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
	    width: min(760px, calc(100vw - 48px));
	    max-height: min(720px, calc(100vh - 48px));
	    overflow: hidden;
	    border: 1px solid var(--df-review-line);
	    border-radius: 8px;
	    background: var(--df-review-panel);
	    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
	  }

  .df-review-sitemap-header {
    display: flex;
    align-items: center;
	    justify-content: space-between;
	    gap: 12px;
	    min-height: 54px;
	    padding: 0 14px 0 16px;
	    border-bottom: 1px solid var(--df-review-line);
	  }

  .df-review-sitemap-header div {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
  }

  .df-review-sitemap-header strong {
    font-size: 14px;
  }

	  .df-review-sitemap-header span {
	    color: var(--df-review-muted);
	    font-size: 12px;
	    font-weight: 700;
	  }

  .df-review-sitemap-header button {
    display: grid;
    place-items: center;
	    width: 34px;
	    min-width: 34px;
	    min-height: 34px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 6px;
	    background: var(--df-review-control);
	    color: var(--df-review-text);
	    font-size: 13px;
	    font-weight: 800;
	  }

	  .df-review-sitemap-header button:hover {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-control-hover);
	  }

  .df-review-sitemap-list {
    display: grid;
    align-content: start;
    min-height: 0;
    overflow: auto;
    padding: 8px;
  }

  .df-review-sitemap-list button {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-height: 40px;
	    border: 0;
	    border-radius: 6px;
	    padding: 8px 10px;
	    background: transparent;
	    color: var(--df-review-text);
	    text-align: left;
	  }

	  .df-review-sitemap-list button:hover,
	  .df-review-sitemap-list button.is-active {
	    background: var(--df-review-accent-soft);
	  }

	  .df-review-sitemap-path {
	    min-width: 0;
	    overflow-wrap: anywhere;
	    color: var(--df-review-text);
	    font-size: 13px;
	    font-weight: 800;
	    line-height: 1.35;
  }

  .df-review-sitemap-count {
    display: inline-grid;
	    place-items: center;
	    min-width: 26px;
	    height: 24px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 999px;
	    padding: 0 8px;
	    background: var(--df-review-chip-bg);
	    color: var(--df-review-muted);
	    font-size: 12px;
	    font-weight: 900;
	  }

	  .df-review-sitemap-list button:hover .df-review-sitemap-path,
	  .df-review-sitemap-list button.is-active .df-review-sitemap-path {
	    color: var(--df-review-text);
	  }

		  .df-review-sitemap-list button:hover .df-review-sitemap-count,
		  .df-review-sitemap-list button.is-active .df-review-sitemap-count {
		    border-color: rgba(124, 199, 255, 0.72);
		    background: var(--df-review-accent-hover);
		    color: var(--df-review-accent);
		  }

		  .df-review-settings-modal {
		    position: fixed;
		    inset: 0;
		    z-index: 1001;
		    display: grid;
		    place-items: center;
		    padding: 24px;
		  }

		  .df-review-settings-backdrop {
		    position: absolute;
		    inset: 0;
		    min-height: 0;
		    border: 0;
		    border-radius: 0;
		    padding: 0;
		    background: rgba(2, 6, 12, 0.62);
		  }

		  .df-review-settings-dialog {
		    position: relative;
		    z-index: 1;
		    display: grid;
		    width: min(460px, calc(100vw - 48px));
		    overflow: hidden;
		    border: 1px solid var(--df-review-line);
		    border-radius: 8px;
		    background: var(--df-review-panel);
		    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
		  }

		  .df-review-settings-header {
		    display: flex;
		    align-items: center;
		    justify-content: space-between;
		    gap: 12px;
		    min-height: 54px;
		    padding: 0 14px 0 16px;
		    border-bottom: 1px solid var(--df-review-line);
		  }

		  .df-review-settings-header div {
		    display: grid;
		    gap: 2px;
		    min-width: 0;
		  }

		  .df-review-settings-header strong {
		    color: var(--df-review-text);
		    font-size: 14px;
		  }

		  .df-review-settings-header span {
		    color: var(--df-review-muted);
		    font-size: 11px;
		    font-weight: 800;
		  }

		  .df-review-settings-header button {
		    display: grid;
		    place-items: center;
		    width: 34px;
		    min-width: 34px;
		    padding: 0;
		    font-size: 13px;
		    font-weight: 800;
		  }

		  .df-review-settings-body {
		    display: grid;
		    gap: 12px;
		    padding: 16px;
		  }

		  .df-review-settings-field {
		    display: grid;
		    gap: 7px;
		  }

		  .df-review-settings-field span,
		  .df-review-settings-label-row label {
		    color: var(--df-review-muted);
		    font-size: 12px;
		    font-weight: 800;
		  }

		  .df-review-settings-label-row {
		    display: flex;
		    align-items: center;
		    gap: 6px;
		  }

		  .df-review-settings-help-button {
		    display: inline-grid;
		    place-items: center;
		    width: 20px;
		    min-width: 20px;
		    min-height: 20px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: 50%;
		    padding: 0;
		    background: transparent;
		    color: var(--df-review-muted);
		  }

		  .df-review-settings-help-button:hover,
		  .df-review-settings-help-button.is-active {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-accent-soft);
		    color: var(--df-review-accent);
		  }

		  .df-review-settings-help-button svg {
		    width: 13px;
		    height: 13px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
		    stroke-width: 2.1;
		  }

			  .df-review-settings-token-input,
			  .df-review-settings-text-input,
			  .df-review-settings-select-input {
			    display: grid;
			    align-items: stretch;
			    overflow: hidden;
			    border: 1px solid var(--df-review-line);
		    border-radius: 6px;
			    background: var(--df-review-bg);
			  }

			  .df-review-settings-token-input {
			    grid-template-columns: minmax(0, 1fr) 38px;
			  }

			  .df-review-settings-text-input,
			  .df-review-settings-select-input {
			    grid-template-columns: minmax(0, 1fr);
			  }

			  .df-review-settings-token-input:focus-within,
			  .df-review-settings-text-input:focus-within,
			  .df-review-settings-select-input:focus-within {
			    outline: 2px solid rgba(124, 199, 255, 0.58);
			    outline-offset: 1px;
			  }

			  .df-review-settings-token-input input,
			  .df-review-settings-text-input input,
			  .df-review-settings-select-input select {
			    min-width: 0;
			    min-height: 38px;
			    border: 0;
		    padding: 0 10px;
		    background: transparent;
		    color: var(--df-review-text);
			    font-size: 13px;
			  }

			  .df-review-settings-token-input input:focus,
			  .df-review-settings-text-input input:focus,
			  .df-review-settings-select-input select:focus {
			    outline: 0;
			  }

			  .df-review-settings-token-input input.is-token-masked {
			    -webkit-text-security: disc;
			  }

			  .df-review-settings-select-input select {
			    appearance: none;
			    cursor: pointer;
			  }

		  .df-review-settings-token-toggle {
		    display: grid;
		    place-items: center;
		    width: 38px;
		    min-width: 38px;
		    min-height: 38px;
		    border: 0;
		    border-left: 1px solid var(--df-review-line-soft);
		    border-radius: 0;
		    padding: 0;
		    background: transparent;
		    color: var(--df-review-muted);
		  }

		  .df-review-settings-token-toggle:hover {
		    background: var(--df-review-chip-bg);
		    color: var(--df-review-text);
		  }

		  .df-review-settings-token-toggle svg {
		    width: 16px;
		    height: 16px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
		    stroke-width: 2;
		  }

		  .df-review-settings-guide {
		    margin-top: -2px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: 6px;
		    padding: 9px 11px;
		    background: var(--df-review-chip-bg);
		    color: var(--df-review-muted);
		    font-size: 11px;
		    font-weight: 700;
		    line-height: 1.55;
		  }

		  .df-review-settings-guide ol {
		    display: grid;
		    gap: 3px;
		    margin: 0;
		    padding-left: 17px;
		  }

		  .df-review-settings-status {
		    min-height: 20px;
		    margin: 0;
		    color: var(--df-review-accent);
		    font-size: 12px;
		    font-weight: 800;
		  }

		  .df-review-settings-actions {
		    display: grid;
		    grid-template-columns: auto minmax(0, 1fr) auto auto;
		    gap: 8px;
		    align-items: center;
		  }

		  .df-review-settings-actions button {
		    padding: 0 12px;
		  }

			  .df-review-settings-actions button[type='submit'] {
			    border-color: var(--df-review-accent);
			    background: var(--df-review-accent-soft);
			    color: var(--df-review-accent);
			  }

			  .df-review-prompt-modal {
			    position: fixed;
			    inset: 0;
			    z-index: 1002;
			    display: grid;
			    place-items: center;
			    padding: 24px;
			  }

			  .df-review-prompt-backdrop {
			    position: absolute;
			    inset: 0;
			    min-height: 0;
			    border: 0;
			    border-radius: 0;
			    padding: 0;
			    background: rgba(2, 6, 12, 0.62);
			  }

			  .df-review-prompt-dialog {
			    position: relative;
			    z-index: 1;
			    display: grid;
			    grid-template-rows: auto minmax(0, 1fr);
				    width: min(1040px, calc(100vw - 36px));
				    max-height: min(900px, calc(100vh - 36px));
			    overflow: hidden;
			    border: 1px solid var(--df-review-line);
			    border-radius: 8px;
			    background: var(--df-review-panel);
			    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
			  }

			  .df-review-prompt-header {
			    display: flex;
			    align-items: center;
			    justify-content: space-between;
			    gap: 12px;
			    min-height: 54px;
			    padding: 0 14px 0 16px;
			    border-bottom: 1px solid var(--df-review-line);
			  }

			  .df-review-prompt-header div {
			    display: grid;
			    gap: 2px;
			    min-width: 0;
			  }

			  .df-review-prompt-header strong {
			    color: var(--df-review-text);
			    font-size: 14px;
			  }

			  .df-review-prompt-header span {
			    overflow: hidden;
			    color: var(--df-review-muted);
			    font-size: 11px;
			    font-weight: 800;
			    text-overflow: ellipsis;
			    white-space: nowrap;
			  }

			  .df-review-prompt-header button {
			    display: grid;
			    place-items: center;
			    width: 34px;
			    min-width: 34px;
			    padding: 0;
			    font-size: 13px;
			    font-weight: 800;
			  }

			  .df-review-prompt-body {
			    display: grid;
			    gap: 12px;
			    min-height: 0;
			    overflow: auto;
			    padding: 16px;
			  }

			  .df-review-prompt-tabs {
			    display: grid;
			    grid-template-columns: repeat(2, minmax(0, 1fr));
			    gap: 4px;
			    padding: 3px;
			    border: 1px solid var(--df-review-line-soft);
			    border-radius: 7px;
			    background: var(--df-review-line-soft);
			  }

			  .df-review-prompt-tabs button {
			    min-width: 0;
			    min-height: 32px;
			    padding: 0 10px;
			    border-color: transparent;
			    background: transparent;
			    color: var(--df-review-muted);
			    font-size: 11px;
			    font-weight: 900;
			  }

			  .df-review-prompt-tabs button:hover,
			  .df-review-prompt-tabs button.is-active {
			    border-color: var(--df-review-line);
			    background: var(--df-review-panel);
			    color: var(--df-review-text);
			  }

			  .df-review-prompt-block {
			    display: grid;
			    gap: 8px;
			    min-width: 0;
			  }

			  .df-review-prompt-block-header {
			    display: flex;
			    align-items: center;
			    justify-content: space-between;
			    gap: 12px;
			    min-width: 0;
			  }

			  .df-review-prompt-block-header div {
			    display: grid;
			    gap: 2px;
			    min-width: 0;
			  }

			  .df-review-prompt-block-header strong {
			    color: var(--df-review-text);
			    font-size: 12px;
			    font-weight: 900;
			  }

			  .df-review-prompt-block-header span {
			    color: var(--df-review-muted);
			    font-size: 11px;
			    font-weight: 800;
			  }

			  .df-review-prompt-block-header button {
			    display: inline-flex;
			    align-items: center;
			    gap: 6px;
			    min-height: 30px;
			    padding: 0 10px;
			  }

			  .df-review-prompt-block-header button:disabled {
			    cursor: not-allowed;
			    opacity: 0.5;
			  }

			  .df-review-prompt-block-header svg {
			    width: 13px;
			    height: 13px;
			    fill: none;
			    stroke: currentColor;
			    stroke-linecap: round;
			    stroke-linejoin: round;
			    stroke-width: 2;
			  }

				  .df-review-prompt-block textarea {
				    width: 100%;
				    height: min(520px, calc(100vh - 290px));
				    min-height: 360px;
				    max-height: calc(100vh - 290px);
			    resize: vertical;
			    border: 1px solid var(--df-review-line);
			    border-radius: 6px;
			    padding: 10px;
			    background: var(--df-review-bg);
			    color: var(--df-review-text);
			    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
			    font-size: 11px;
			    font-weight: 600;
			    line-height: 1.5;
			    white-space: pre;
			  }

			  .df-review-prompt-block textarea:focus {
			    outline: 2px solid rgba(124, 199, 255, 0.58);
			    outline-offset: 1px;
			  }

				  .df-review-tools {
			    display: flex;
			    align-items: center;
		    justify-content: space-between;
		    gap: 12px;
		    width: 100%;
		    max-width: 1440px;
		    min-width: 0;
		    margin: 0 auto;
		  }

		  .df-review-tool-controls {
		    display: flex;
		    align-items: center;
		    justify-content: flex-start;
		    gap: 12px;
		    min-width: 0;
		    flex-wrap: wrap;
	  }

		  .df-review-presets,
		  .df-review-mode,
	  .df-review-overlays {
	    display: flex;
	    align-items: center;
	    gap: 6px;
	  }

		  .df-review-tool-divider,
		  .df-review-mode-divider {
		    display: inline-flex;
		    align-items: center;
		    color: var(--df-review-line);
		    font-size: 18px;
		    font-weight: 700;
	    line-height: 1;
		    user-select: none;
	  }

		  .df-review-active-size {
		    flex: 0 0 auto;
		    display: inline-flex;
		    align-items: center;
		    min-height: 38px;
		    color: var(--df-review-muted);
		    font-size: 12px;
		    font-variant-numeric: tabular-nums;
	    font-weight: 800;
	    line-height: 1;
	  }

	  .df-review-presets button {
	    display: inline-flex;
	    align-items: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 11px 0 9px;
  }

  .df-review-presets button svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
  }

  .df-review-preset-copy {
    display: grid;
    gap: 1px;
    min-width: 0;
    text-align: left;
    line-height: 1.05;
  }

  .df-review-preset-copy strong {
    color: var(--df-review-text);
    font-size: 12px;
  }

	  .df-review-overlay-button,
	  .df-review-mode-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: 38px;
	    min-width: 38px;
	    padding: 0;
	    color: var(--df-review-muted);
	  }

  .df-review-overlay-button svg,
  .df-review-mode-button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
	  }

	  .df-review-overlay-button.is-grid {
	    border-color: rgba(124, 199, 255, 0.46);
	    background: var(--df-review-accent-soft);
	    color: var(--df-review-accent);
	  }

	  .df-review-overlay-button.is-grid:hover,
	  .df-review-overlay-button.is-grid.is-active {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-accent-hover);
	    color: #c7e7ff;
	  }

	  .df-review-overlay-button.is-figma {
	    border-color: rgba(255, 143, 97, 0.46);
	    background: rgba(255, 143, 97, 0.14);
	    color: #ffab83;
	  }

		  .df-review-overlay-button.is-figma:hover,
		  .df-review-overlay-button.is-figma.is-active {
		    border-color: #ff8f61;
		    background: rgba(255, 143, 97, 0.24);
		    color: #ffd1bf;
		  }

		  .df-review-overlay-button.is-ruler {
		    border-color: rgba(179, 149, 255, 0.46);
		    background: rgba(179, 149, 255, 0.14);
		    color: #c9b8ff;
		  }

		  .df-review-overlay-button.is-ruler:hover,
		  .df-review-overlay-button.is-ruler.is-active {
		    border-color: #b395ff;
		    background: rgba(179, 149, 255, 0.24);
		    color: #e1d8ff;
		  }

		  .df-review-overlay-button.is-settings {
		    color: var(--df-review-muted);
		  }

		  .df-review-overlay-button.is-settings:hover {
		    color: var(--df-review-text);
		  }

	  .df-review-overlay-button.is-disabled,
	  .df-review-overlay-button.is-disabled:hover {
	    cursor: not-allowed;
	    border-color: var(--df-review-line);
	    background: var(--df-review-line-soft);
	    color: var(--df-review-subtle);
	  }

	  .df-review-mode-button.is-note {
	    border-color: rgba(243, 183, 95, 0.46);
	    background: var(--df-review-note-soft);
	    color: var(--df-review-note);
	  }

		  .df-review-mode-button.is-note:hover,
		  .df-review-mode-button.is-note.is-active {
		    border-color: var(--df-review-note);
		    background: rgba(243, 183, 95, 0.24);
		    color: #ffd99a;
		  }

		  .df-review-mode-button.is-element {
		    border-color: rgba(255, 143, 97, 0.46);
		    background: rgba(255, 143, 97, 0.14);
		    color: #ff8f61;
		  }

		  .df-review-mode-button.is-element:hover,
		  .df-review-mode-button.is-element.is-active {
		    border-color: #ff8f61;
		    background: rgba(255, 143, 97, 0.24);
		    color: #ffc3ad;
		  }

		  .df-review-mode-button.is-capture {
		    border-color: rgba(99, 215, 199, 0.46);
		    background: var(--df-review-capture-soft);
	    color: var(--df-review-capture);
	  }

	  .df-review-mode-button.is-capture:hover,
	  .df-review-mode-button.is-capture.is-active {
	    border-color: var(--df-review-capture);
	    background: rgba(99, 215, 199, 0.24);
	    color: #bdf4ed;
	  }

  .df-review-overlay-button::after,
  .df-review-mode-button::after {
    content: attr(data-tooltip);
    position: absolute;
    right: 0;
    bottom: -30px;
    z-index: 4;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-2px);
	    border: 1px solid var(--df-review-line);
	    border-radius: 5px;
	    padding: 4px 7px;
	    background: var(--df-review-tooltip-bg);
	    color: var(--df-review-text);
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    transition:
      opacity 120ms ease,
      transform 120ms ease;
  }

  .df-review-overlay-button:hover::after,
  .df-review-overlay-button:focus-visible::after,
  .df-review-mode-button:hover::after,
  .df-review-mode-button:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
  }

	  .df-review-side-rail {
	    grid-column: 3;
	    grid-row: 1 / span 2;
	    display: flex;
	    align-items: stretch;
	    justify-content: center;
	    min-width: 0;
	    min-height: 0;
	    border-left: 1px solid var(--df-review-line);
	    background: var(--df-review-side-rail);
	  }

  .df-review-side-toggle {
    display: grid;
    grid-template-rows: 28px auto;
    align-items: start;
    justify-items: center;
    gap: 8px;
    width: 100%;
    min-height: 100%;
    border: 0;
	    border-radius: 0;
	    padding: 10px 0;
	    background: transparent;
	    color: var(--df-review-muted);
	  }

	  .df-review-side-toggle:hover {
	    background: var(--df-review-accent-soft);
	    color: var(--df-review-text);
	  }

  .df-review-side-toggle span {
    display: grid;
    place-items: center;
	    width: 20px;
	    height: 24px;
	    line-height: 1;
	  }

	  .df-review-side-toggle svg {
	    width: 18px;
	    height: 18px;
	    fill: none;
	    stroke: currentColor;
	    stroke-linecap: round;
	    stroke-width: 2;
	  }

  .df-review-side-toggle strong {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: inherit;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.08em;
  }

	  .df-review-qa-panel {
	    grid-column: 2;
	    grid-row: 1 / span 2;
	    display: grid;
	    grid-template-rows: minmax(0, 1fr);
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	    border-left: 1px solid var(--df-review-line);
	    background: var(--df-review-panel);
	  }

	  .df-review-shell:not(.is-list-visible) .df-review-qa-panel {
	    visibility: hidden;
	    border-left: 0;
	  }

	  .df-review-panel-body {
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-item-list {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }

		  .df-review-list-header {
		    display: grid;
		    grid-template-columns: minmax(0, 1fr) auto;
		    align-items: center;
		    gap: 8px;
		    min-height: 48px;
		    padding: 8px 10px 8px 12px;
		    border-bottom: 1px solid var(--df-review-line-soft);
		    color: var(--df-review-muted);
		    font-size: 12px;
		    font-weight: 800;
		  }

		  .df-review-list-title {
		    display: flex;
		    align-items: center;
		    gap: 8px;
		    min-width: 0;
		  }

		  .df-review-list-title span {
		    min-width: 0;
		    overflow: hidden;
		    text-overflow: ellipsis;
		    white-space: nowrap;
		  }

		  .df-review-list-title strong {
		    flex: 0 0 auto;
		    color: var(--df-review-muted);
		    font-size: 11px;
		    font-variant-numeric: tabular-nums;
		  }

		  .df-review-filter-tabs {
		    display: flex;
		    align-items: center;
		    gap: 3px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: 7px;
		    padding: 2px;
		    background: var(--df-review-line-soft);
		  }

		  .df-review-filter-tab {
		    position: relative;
		    display: grid;
		    place-items: center;
		    width: 28px;
		    min-width: 28px;
		    height: 28px;
		    border: 0;
		    border-radius: 5px;
		    padding: 0;
		    background: transparent;
		    color: var(--df-review-subtle);
		  }

		  .df-review-filter-tab:hover,
		  .df-review-filter-tab.is-active {
		    background: var(--df-review-accent-soft);
		    color: var(--df-review-text);
		  }

		  .df-review-filter-tab.is-active {
		    box-shadow: inset 0 0 0 1px rgba(124, 199, 255, 0.42);
		    color: var(--df-review-accent);
		  }

		  .df-review-filter-tab svg {
		    width: 15px;
		    height: 15px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
		    stroke-width: 2;
		  }

		  .df-review-filter-tab::after {
		    content: attr(data-tooltip);
		    position: absolute;
		    right: 0;
		    bottom: -29px;
		    z-index: 6;
		    pointer-events: none;
		    opacity: 0;
		    transform: translateY(-2px);
		    border: 1px solid var(--df-review-line);
		    border-radius: 5px;
		    padding: 4px 7px;
		    background: var(--df-review-tooltip-bg);
		    color: var(--df-review-text);
		    font-size: 11px;
		    font-weight: 800;
		    white-space: nowrap;
		    transition:
		      opacity 120ms ease,
		      transform 120ms ease;
		  }

		  .df-review-filter-tab:hover::after,
		  .df-review-filter-tab:focus-visible::after {
		    opacity: 1;
		    transform: translateY(0);
		  }

  .df-review-list-scroll {
    min-height: 0;
    overflow: auto;
  }

	  .df-review-empty {
	    margin: 0;
	    padding: 14px 12px;
	    color: var(--df-review-subtle);
	    font-size: 12px;
	    line-height: 1.45;
	  }

  .df-review-item-card {
	    position: relative;
	    display: grid;
	    gap: 8px;
	    padding: 10px 38px 10px 12px;
	    border-bottom: 1px solid var(--df-review-line-soft);
	  }

	  .df-review-item-card.is-active {
	    background: var(--df-review-accent-soft);
	  }

  .df-review-item-main {
    display: grid;
    gap: 4px;
    min-width: 0;
	    border: 0;
	    padding: 0;
	    text-align: left;
	    background: transparent;
	    color: var(--df-review-text);
	  }

  .df-review-item-main strong {
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 1.35;
  }

	  .df-review-item-main small {
	    color: var(--df-review-subtle);
	    font-size: 11px;
	  }

  .df-review-item-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-item-viewport,
	  .df-review-item-kind,
	  .df-review-item-status-badge {
    --df-review-scope: var(--df-review-accent);
    --df-review-scope-rgb: 124, 199, 255;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 20px;
    border: 1px solid var(--df-review-line);
    border-radius: 999px;
    padding: 0 7px;
    font-size: 10px;
    font-weight: 900;
    line-height: 1;
    text-transform: uppercase;
  }

  .df-review-item-viewport.is-scope-tablet {
    --df-review-scope: var(--df-review-capture);
    --df-review-scope-rgb: 99, 215, 199;
  }

  .df-review-item-viewport.is-scope-desktop {
    --df-review-scope: var(--df-review-note);
    --df-review-scope-rgb: 243, 183, 95;
  }

  .df-review-item-viewport.is-scope-wide {
    --df-review-scope: #c99cff;
    --df-review-scope-rgb: 201, 156, 255;
  }

  .df-review-item-viewport.is-scope-dom {
    --df-review-scope: #ff8f61;
    --df-review-scope-rgb: 255, 143, 97;
  }

  .df-review-item-viewport {
    border-color: rgba(var(--df-review-scope-rgb), 0.36);
    background: rgba(var(--df-review-scope-rgb), 0.12);
    color: var(--df-review-scope);
  }

  .df-review-item-viewport svg {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

	  .df-review-item-kind {
	    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

  .df-review-item-status-badge {
    border-color: var(--df-review-line);
    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

	  .df-review-item-main img {
	    width: 100%;
	    max-height: 110px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 6px;
	    object-fit: cover;
	    background: var(--df-review-control);
  }

  .df-review-item-delete {
    position: absolute;
    top: 8px;
    right: 8px;
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
  }

  .df-review-item-delete svg {
    width: 14px;
    height: 14px;
  }

	  .df-review-item-actions {
	    display: flex;
	    align-items: center;
	    gap: 6px;
	    min-width: 0;
	  }

	  .df-review-item-prompt-actions {
	    display: inline-grid;
	    grid-template-columns: auto 28px;
	    align-items: stretch;
	    min-width: 0;
	  }

	  .df-review-item-prompt {
	    display: inline-flex;
	    align-items: center;
	    min-height: 28px;
	    padding: 0 8px;
	    border-top-right-radius: 0;
	    border-bottom-right-radius: 0;
	    font-size: 10px;
	    text-transform: uppercase;
	  }

	  .df-review-item-prompt-copy {
	    position: relative;
	    display: inline-grid;
	    place-items: center;
	    width: 28px;
	    min-width: 28px;
	    min-height: 28px;
	    border-left: 0;
	    border-top-left-radius: 0;
	    border-bottom-left-radius: 0;
	    padding: 0;
	  }

	  .df-review-item-prompt-copy.is-copied {
	    border-color: var(--df-review-accent);
	    color: var(--df-review-accent);
	  }

	  .df-review-item-prompt-copy::after {
	    content: attr(data-tooltip);
	    position: absolute;
	    right: 0;
	    bottom: calc(100% + 7px);
	    z-index: 5;
	    pointer-events: none;
	    opacity: 0;
	    transform: translateY(2px);
	    border: 1px solid var(--df-review-line);
	    border-radius: 5px;
	    padding: 4px 7px;
	    background: var(--df-review-tooltip-bg);
	    color: var(--df-review-text);
	    font-size: 11px;
	    font-weight: 800;
	    text-transform: none;
	    white-space: nowrap;
	    transition:
	      opacity 120ms ease,
	      transform 120ms ease;
	  }

	  .df-review-item-prompt-copy:hover::after,
	  .df-review-item-prompt-copy:focus-visible::after {
	    opacity: 1;
	    transform: translateY(0);
	  }

	  .df-review-item-prompt-copy svg {
	    width: 12px;
	    height: 12px;
	    fill: none;
	    stroke: currentColor;
	    stroke-linecap: round;
	    stroke-linejoin: round;
	    stroke-width: 2;
	  }

  .df-review-item-status-select {
    width: min(100%, 112px);
    min-height: 28px;
    padding: 0 7px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    font-size: 11px;
    font-weight: 800;
  }

	  .df-review-stage {
	    grid-column: 1;
	    grid-row: 2;
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-frame {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    min-width: 0;
    min-height: 0;
  }

  .df-review-frame-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    padding: 8px 40px 10px;
    border-top: 1px solid var(--df-review-line-soft);
    background: var(--df-review-mode-bar);
  }

  .df-review-frame-actions .df-review-mode-button::after {
    top: -30px;
    bottom: auto;
  }

	  .df-review-frame-scroll {
	    min-width: 0;
	    min-height: 0;
	    overflow: auto;
	  }

	  .df-review-frame-canvas {
	    display: grid;
	    place-items: center;
	    width: max-content;
	    height: max-content;
	    min-width: 100%;
	    min-height: 100%;
	    padding: 8px 40px;
	  }

  .df-review-device {
	    box-sizing: border-box;
	    flex: 0 0 auto;
	    position: relative;
	    margin: 0;
	    overflow: hidden;
	    border: 1px solid rgba(226, 233, 245, 0.22);
	    border-radius: 8px;
	    background: #fff;
	    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);
  }

  .df-review-device iframe {
    display: block;
    width: inherit;
    height: inherit;
    min-width: inherit;
    min-height: inherit;
    border: 0;
    background: #fff;
  }

  .df-review-ruler-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: inherit;
    height: inherit;
    z-index: 5;
    cursor: crosshair;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    background:
      linear-gradient(
        to right,
        rgba(179, 149, 255, 0.18) 1px,
        transparent 1px
      )
      0 0 / var(--df-review-ruler-major-x) 100%,
      linear-gradient(
        to bottom,
        rgba(179, 149, 255, 0.18) 1px,
        transparent 1px
      )
      0 0 / 100% var(--df-review-ruler-major-y),
      linear-gradient(
        to right,
        rgba(179, 149, 255, 0.08) 1px,
        transparent 1px
      )
      0 0 / var(--df-review-ruler-step-x) 100%,
      linear-gradient(
        to bottom,
        rgba(179, 149, 255, 0.08) 1px,
        transparent 1px
      )
      0 0 / 100% var(--df-review-ruler-step-y);
  }

  .df-review-ruler-overlay.is-dragging {
    cursor: crosshair;
  }

  .df-review-ruler-axis {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    border: 0 solid rgba(237, 243, 251, 0.18);
    background: rgba(10, 13, 18, 0.76);
    backdrop-filter: blur(5px);
  }

  .df-review-ruler-axis.is-x {
    left: 0;
    right: 0;
    top: 0;
    height: 24px;
    border-bottom-width: 1px;
    background-image: linear-gradient(
      to right,
      rgba(237, 243, 251, 0.28) 1px,
      transparent 1px
    );
    background-size: var(--df-review-ruler-step-x) 100%;
  }

  .df-review-ruler-axis.is-y {
    left: 0;
    top: 0;
    bottom: 0;
    width: 24px;
    border-right-width: 1px;
    background-image: linear-gradient(
      to bottom,
      rgba(237, 243, 251, 0.28) 1px,
      transparent 1px
    );
    background-size: 100% var(--df-review-ruler-step-y);
  }

  .df-review-ruler-guide {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    background: rgba(255, 255, 255, 0.74);
    box-shadow: 0 0 0 1px rgba(87, 55, 166, 0.45);
  }

  .df-review-ruler-guide.is-x {
    left: 0;
    right: 0;
    height: 1px;
  }

  .df-review-ruler-guide.is-y {
    top: 0;
    bottom: 0;
    width: 1px;
  }

  .df-review-ruler-selection {
    position: absolute;
    z-index: 3;
    pointer-events: none;
    border: 1px solid #c9b8ff;
    background: rgba(179, 149, 255, 0.16);
    box-shadow:
      inset 0 0 0 1px rgba(20, 12, 40, 0.38),
      0 0 0 1px rgba(20, 12, 40, 0.38);
  }

  .df-review-ruler-label,
  .df-review-ruler-info {
    position: absolute;
    z-index: 4;
    pointer-events: none;
    border: 1px solid rgba(237, 243, 251, 0.22);
    border-radius: 6px;
    background: rgba(10, 13, 18, 0.9);
    color: var(--df-review-text);
    font-size: 11px;
    font-weight: 900;
    line-height: 1;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.34);
  }

  .df-review-ruler-label {
    min-width: 156px;
    padding: 7px 8px;
    white-space: nowrap;
  }

  .df-review-ruler-info {
    right: 8px;
    top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    padding: 0 8px;
  }

  .df-review-ruler-info strong {
    color: #e1d8ff;
    font-size: 11px;
  }

  .df-review-ruler-info span {
    color: var(--df-review-muted);
    font-size: 10px;
    font-weight: 900;
  }

	  @media (max-width: 860px) {
	    .df-review-shell,
	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) 0 32px;
	      grid-template-rows: auto minmax(0, 1fr);
	    }

	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) minmax(260px, 70vw) 32px;
	    }

	    .df-review-qa-panel {
	      border-left: 1px solid var(--df-review-line);
	      border-bottom: 0;
	    }

	    .df-review-tools {
	      flex-wrap: wrap;
	    }

	    .df-review-tool-controls {
	      justify-content: flex-start;
	    }

    .df-review-frame-actions {
      padding: 8px 20px 10px;
    }

	    .df-review-frame-canvas {
	      padding: 8px 20px;
	    }

		    .df-review-prompt-modal {
		      padding: 12px;
		    }

		    .df-review-prompt-dialog {
		      width: calc(100vw - 24px);
		      max-height: calc(100vh - 24px);
		    }

		    .df-review-prompt-block textarea {
		      height: min(360px, calc(100vh - 270px));
		      min-height: 240px;
		      max-height: calc(100vh - 270px);
		    }

	    .df-review-panel-body {
	      min-height: 0;
	    }
  }
    `;
    document.head.append(style);
  }

  const root = document.getElementById(rootId);
  if (!root) return;

  root.style.width = '100%';
  root.style.height = '100%';
  root.style.margin = '0';

  createRoot(root).render(
    <React.StrictMode>
      <ReviewShell {...shellProps} />
    </React.StrictMode>
  );
};
