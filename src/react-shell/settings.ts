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

export const getStoredFigmaToken = () => {
  if (typeof window === 'undefined') return '';

  try {
    return window.localStorage.getItem(FIGMA_TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

export const writeStoredFigmaToken = (token: string) => {
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

export const getStoredReviewUserId = (fallback = '') => {
  const normalizedFallback = fallback.trim();
  if (typeof window === 'undefined') return normalizedFallback;

  try {
    return (
      window.localStorage.getItem(REVIEW_USER_ID_STORAGE_KEY)?.trim() ||
      normalizedFallback
    );
  } catch {
    return normalizedFallback;
  }
};

export const writeStoredReviewUserId = (userId: string) => {
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

export const getStoredReviewTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_REVIEW_THEME;

  try {
    return normalizeReviewTheme(
      window.localStorage.getItem(REVIEW_THEME_STORAGE_KEY)
    );
  } catch {
    return DEFAULT_REVIEW_THEME;
  }
};

export const writeStoredReviewTheme = (theme: ReviewShellTheme) => {
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

export const getStoredReviewTooltipsEnabled = () => {
  if (typeof window === 'undefined') return DEFAULT_REVIEW_TOOLTIPS_ENABLED;

  try {
    const value = window.localStorage.getItem(REVIEW_TOOLTIP_STORAGE_KEY);
    return value === null ? DEFAULT_REVIEW_TOOLTIPS_ENABLED : value !== 'false';
  } catch {
    return DEFAULT_REVIEW_TOOLTIPS_ENABLED;
  }
};

export const writeStoredReviewTooltipsEnabled = (isEnabled: boolean) => {
  if (typeof window === 'undefined') return;

  try {
    if (isEnabled === DEFAULT_REVIEW_TOOLTIPS_ENABLED) {
      window.localStorage.removeItem(REVIEW_TOOLTIP_STORAGE_KEY);
    } else {
      window.localStorage.setItem(REVIEW_TOOLTIP_STORAGE_KEY, 'false');
    }
  } catch {
    return;
  }
};

export const getStoredReviewSidePanel = () => {
  if (typeof window === 'undefined') return 'qa';

  try {
    return normalizeStoredReviewSidePanel(
      window.localStorage.getItem(REVIEW_SIDE_PANEL_STORAGE_KEY)
    );
  } catch {
    return 'qa';
  }
};

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
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      REVIEW_SIDE_PANEL_STORAGE_KEY,
      normalizeStoredReviewSidePanel(sidePanel)
    );
  } catch {
    return;
  }
};

export const getStoredReviewSidePanelVisible = () => {
  if (typeof window === 'undefined') return true;

  try {
    const value = window.localStorage.getItem(
      REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY
    );
    return value === null ? true : value === 'true';
  } catch {
    return true;
  }
};

export const writeStoredReviewSidePanelVisible = (isVisible: boolean) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY,
      isVisible ? 'true' : 'false'
    );
  } catch {
    return;
  }
};

export const getStoredReviewQaStatusFilters = () => {
  if (typeof window === 'undefined') return getDefaultReviewQaStatusFilters();

  try {
    return normalizeStoredReviewQaStatusFilters(
      window.localStorage.getItem(REVIEW_QA_STATUS_FILTER_STORAGE_KEY)
    );
  } catch {
    return getDefaultReviewQaStatusFilters();
  }
};

export const writeStoredReviewQaStatusFilters = (
  filters: readonly ReviewQaStatusFilter[]
) => {
  if (typeof window === 'undefined') return;

  try {
    const normalizedFilters = normalizeReviewQaStatusFilters(filters);
    if (isDefaultReviewQaStatusFilters(normalizedFilters)) {
      window.localStorage.removeItem(REVIEW_QA_STATUS_FILTER_STORAGE_KEY);
    } else {
      window.localStorage.setItem(
        REVIEW_QA_STATUS_FILTER_STORAGE_KEY,
        JSON.stringify(normalizedFilters)
      );
    }
  } catch {
    return;
  }
};

export const getStoredSourceTreeFilter = () => {
  if (typeof window === 'undefined') return '';

  try {
    return (
      window.localStorage.getItem(REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY) ?? ''
    );
  } catch {
    return '';
  }
};

export const writeStoredSourceTreeFilter = (filter: string) => {
  if (typeof window === 'undefined') return;

  try {
    if (filter) {
      window.localStorage.setItem(REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY, filter);
    } else {
      window.localStorage.removeItem(REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY);
    }
  } catch {
    return;
  }
};

export const getStoredSourceTreeMetaVisibility = () => {
  if (typeof window === 'undefined') return DEFAULT_SOURCE_TREE_META_VISIBILITY;

  try {
    const value = window.localStorage.getItem(
      REVIEW_SOURCE_TREE_META_STORAGE_KEY
    );
    if (!value) return DEFAULT_SOURCE_TREE_META_VISIBILITY;
    return normalizeStoredSourceTreeMetaVisibility(JSON.parse(value));
  } catch {
    return DEFAULT_SOURCE_TREE_META_VISIBILITY;
  }
};

export const writeStoredSourceTreeMetaVisibility = (
  metaVisibility: StoredSourceTreeMetaVisibility
) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      REVIEW_SOURCE_TREE_META_STORAGE_KEY,
      JSON.stringify(normalizeStoredSourceTreeMetaVisibility(metaVisibility))
    );
  } catch {
    return;
  }
};

export const getSystemReviewTheme = (): Exclude<ReviewShellTheme, 'system'> => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
};
