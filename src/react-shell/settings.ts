import type { ReviewShellTheme } from './types';
import {
  DEFAULT_REVIEW_TOOLTIPS_ENABLED,
  DEFAULT_REVIEW_THEME,
  FIGMA_TOKEN_STORAGE_KEY,
  REVIEW_QA_STATUS_FILTERS,
  REVIEW_QA_STATUS_FILTER_STORAGE_KEY,
  REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY,
  REVIEW_SOURCE_TREE_META_STORAGE_KEY,
  REVIEW_SIDE_PANEL_STORAGE_KEY,
  REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY,
  REVIEW_TOOLTIP_STORAGE_KEY,
  REVIEW_THEME_STORAGE_KEY,
  REVIEW_USER_ID_STORAGE_KEY,
} from './constants';
import type { ReviewQaStatusFilter } from './types';
import {
  getDefaultReviewQaStatusFilters,
  isDefaultReviewQaStatusFilters,
  isReviewQaStatusFilter,
  normalizeReviewQaStatusFilters,
} from './qa/status.filter';

export type StoredReviewSidePanel = 'qa' | 'source' | 'figma-images';
export interface StoredSourceTreeMetaVisibility {
  font: boolean;
  media: boolean;
  className: boolean;
}

const DEFAULT_SOURCE_TREE_META_VISIBILITY: StoredSourceTreeMetaVisibility = {
  font: true,
  media: true,
  className: false,
};
const REVIEW_QA_STATUS_FILTER_VALUES = new Set([
  'active',
  'all',
  'todo',
  'doing',
  'review',
  'hold',
  'done',
]);

/** SSR 이거나 storage 접근이 막혀 있으면 null. */
const readStorage = (key: string) => {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** null 을 넘기면 키를 제거한다. storage 접근 실패는 무시한다. */
const writeStorage = (key: string, value: string | null) => {
  if (typeof window === 'undefined') return;

  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    return;
  }
};

export const normalizeReviewTheme = (value: string | null): ReviewShellTheme =>
  value === 'light' || value === 'system' || value === 'dark'
    ? value
    : DEFAULT_REVIEW_THEME;

const normalizeReviewSidePanel = (
  value: string | null
): StoredReviewSidePanel | null => {
  if (value === 'qa' || value === 'source' || value === 'figma-images') {
    return value;
  }
  return null;
};

const normalizeStoredReviewSidePanel = (
  value: string | null
): StoredReviewSidePanel => normalizeReviewSidePanel(value) ?? 'qa';

const normalizeStoredReviewQaStatusFilters = (
  value: string | null
): ReviewQaStatusFilter[] => {
  if (!value) return getDefaultReviewQaStatusFilters();

  try {
    const parsedValue = JSON.parse(value) as unknown;
    if (Array.isArray(parsedValue)) {
      return normalizeReviewQaStatusFilters(parsedValue);
    }
  } catch {}

  if (!REVIEW_QA_STATUS_FILTER_VALUES.has(value)) {
    return getDefaultReviewQaStatusFilters();
  }
  if (value === 'active') return getDefaultReviewQaStatusFilters();
  if (value === 'all') {
    return normalizeReviewQaStatusFilters(REVIEW_QA_STATUS_FILTERS);
  }
  if (isReviewQaStatusFilter(value)) return [value];

  return getDefaultReviewQaStatusFilters();
};

const normalizeStoredSourceTreeMetaVisibility = (
  value: unknown
): StoredSourceTreeMetaVisibility => {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SOURCE_TREE_META_VISIBILITY;
  }

  const metaVisibility = value as Partial<
    Record<keyof StoredSourceTreeMetaVisibility, unknown>
  >;

  return {
    font:
      typeof metaVisibility.font === 'boolean'
        ? metaVisibility.font
        : DEFAULT_SOURCE_TREE_META_VISIBILITY.font,
    media:
      typeof metaVisibility.media === 'boolean'
        ? metaVisibility.media
        : DEFAULT_SOURCE_TREE_META_VISIBILITY.media,
    className:
      typeof metaVisibility.className === 'boolean'
        ? metaVisibility.className
        : DEFAULT_SOURCE_TREE_META_VISIBILITY.className,
  };
};

export const getStoredFigmaToken = () =>
  readStorage(FIGMA_TOKEN_STORAGE_KEY) ?? '';

export const writeStoredFigmaToken = (token: string) => {
  writeStorage(FIGMA_TOKEN_STORAGE_KEY, token || null);
};

export const getStoredReviewUserId = (fallback = '') => {
  const normalizedFallback = fallback.trim();
  return (
    readStorage(REVIEW_USER_ID_STORAGE_KEY)?.trim() || normalizedFallback
  );
};

export const writeStoredReviewUserId = (userId: string) => {
  writeStorage(REVIEW_USER_ID_STORAGE_KEY, userId || null);
};

export const getStoredReviewTheme = () =>
  normalizeReviewTheme(readStorage(REVIEW_THEME_STORAGE_KEY));

export const writeStoredReviewTheme = (theme: ReviewShellTheme) => {
  writeStorage(
    REVIEW_THEME_STORAGE_KEY,
    theme === DEFAULT_REVIEW_THEME ? null : theme
  );
};

export const getStoredReviewTooltipsEnabled = () => {
  const value = readStorage(REVIEW_TOOLTIP_STORAGE_KEY);
  return value === null ? DEFAULT_REVIEW_TOOLTIPS_ENABLED : value !== 'false';
};

export const writeStoredReviewTooltipsEnabled = (isEnabled: boolean) => {
  writeStorage(
    REVIEW_TOOLTIP_STORAGE_KEY,
    isEnabled === DEFAULT_REVIEW_TOOLTIPS_ENABLED ? null : 'false'
  );
};

export const getStoredReviewSidePanel = () =>
  normalizeStoredReviewSidePanel(readStorage(REVIEW_SIDE_PANEL_STORAGE_KEY));

export const getInitialReviewSidePanel = () => {
  if (typeof window === 'undefined') return null;

  try {
    return normalizeReviewSidePanel(
      new URLSearchParams(window.location.search).get('panel')
    );
  } catch {
    return null;
  }
};

export const writeStoredReviewSidePanel = (
  sidePanel: StoredReviewSidePanel
) => {
  writeStorage(
    REVIEW_SIDE_PANEL_STORAGE_KEY,
    normalizeStoredReviewSidePanel(sidePanel)
  );
};

export const getStoredReviewSidePanelVisible = () => {
  const value = readStorage(REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY);
  return value === null ? true : value === 'true';
};

export const writeStoredReviewSidePanelVisible = (isVisible: boolean) => {
  writeStorage(
    REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY,
    isVisible ? 'true' : 'false'
  );
};

export const getStoredReviewQaStatusFilters = () =>
  normalizeStoredReviewQaStatusFilters(
    readStorage(REVIEW_QA_STATUS_FILTER_STORAGE_KEY)
  );

export const writeStoredReviewQaStatusFilters = (
  filters: readonly ReviewQaStatusFilter[]
) => {
  const normalizedFilters = normalizeReviewQaStatusFilters(filters);
  writeStorage(
    REVIEW_QA_STATUS_FILTER_STORAGE_KEY,
    isDefaultReviewQaStatusFilters(normalizedFilters)
      ? null
      : JSON.stringify(normalizedFilters)
  );
};

export const getStoredSourceTreeFilter = () =>
  readStorage(REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY) ?? '';

export const writeStoredSourceTreeFilter = (filter: string) => {
  writeStorage(REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY, filter || null);
};

export const getStoredSourceTreeMetaVisibility = () => {
  const value = readStorage(REVIEW_SOURCE_TREE_META_STORAGE_KEY);
  if (!value) return DEFAULT_SOURCE_TREE_META_VISIBILITY;

  try {
    return normalizeStoredSourceTreeMetaVisibility(JSON.parse(value));
  } catch {
    return DEFAULT_SOURCE_TREE_META_VISIBILITY;
  }
};

export const writeStoredSourceTreeMetaVisibility = (
  metaVisibility: StoredSourceTreeMetaVisibility
) => {
  writeStorage(
    REVIEW_SOURCE_TREE_META_STORAGE_KEY,
    JSON.stringify(normalizeStoredSourceTreeMetaVisibility(metaVisibility))
  );
};

export const getSystemReviewTheme = (): Exclude<ReviewShellTheme, 'system'> => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
};
