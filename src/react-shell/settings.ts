import type { ReviewShellTheme } from './types';
import {
  DEFAULT_REVIEW_THEME,
  FIGMA_TOKEN_STORAGE_KEY,
  REVIEW_QA_STATUS_FILTER_STORAGE_KEY,
  REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY,
  REVIEW_SOURCE_TREE_META_STORAGE_KEY,
  REVIEW_SIDE_PANEL_STORAGE_KEY,
  REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY,
  REVIEW_THEME_STORAGE_KEY,
  REVIEW_USER_ID_STORAGE_KEY,
} from './constants';
import type { ReviewQaStatusFilter } from './types';

export type StoredReviewSidePanel = 'qa' | 'source' | 'figma-images';
export interface StoredSourceTreeMetaVisibility {
  box: boolean;
  font: boolean;
  media: boolean;
  className: boolean;
}

const DEFAULT_SOURCE_TREE_META_VISIBILITY: StoredSourceTreeMetaVisibility = {
  box: true,
  font: true,
  media: true,
  className: false,
};
const REVIEW_QA_STATUS_FILTER_VALUES = new Set([
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

const normalizeStoredReviewSidePanel = (
  value: string | null
): StoredReviewSidePanel => {
  if (value === 'source' || value === 'figma-images') return value;
  return 'qa';
};

const normalizeStoredReviewQaStatusFilter = (
  value: string | null
): ReviewQaStatusFilter =>
  value && REVIEW_QA_STATUS_FILTER_VALUES.has(value)
    ? (value as ReviewQaStatusFilter)
    : 'all';

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
    box:
      typeof metaVisibility.box === 'boolean'
        ? metaVisibility.box
        : DEFAULT_SOURCE_TREE_META_VISIBILITY.box,
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

export const getStoredReviewUserId = () => {
  if (typeof window === 'undefined') return '';

  try {
    return window.localStorage.getItem(REVIEW_USER_ID_STORAGE_KEY) ?? '';
  } catch {
    return '';
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

export const getStoredReviewQaStatusFilter = () => {
  if (typeof window === 'undefined') return 'all';

  try {
    return normalizeStoredReviewQaStatusFilter(
      window.localStorage.getItem(REVIEW_QA_STATUS_FILTER_STORAGE_KEY)
    );
  } catch {
    return 'all';
  }
};

export const writeStoredReviewQaStatusFilter = (
  filter: ReviewQaStatusFilter
) => {
  if (typeof window === 'undefined') return;

  try {
    const normalizedFilter = normalizeStoredReviewQaStatusFilter(filter);
    if (normalizedFilter === 'all') {
      window.localStorage.removeItem(REVIEW_QA_STATUS_FILTER_STORAGE_KEY);
    } else {
      window.localStorage.setItem(
        REVIEW_QA_STATUS_FILTER_STORAGE_KEY,
        normalizedFilter
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
