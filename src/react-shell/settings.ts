import type { ReviewShellTheme } from './types';
import {
  DEFAULT_REVIEW_THEME,
  FIGMA_TOKEN_STORAGE_KEY,
  REVIEW_THEME_STORAGE_KEY,
  REVIEW_USER_ID_STORAGE_KEY,
} from './constants';

export const normalizeReviewTheme = (value: string | null): ReviewShellTheme =>
  value === 'light' || value === 'system' || value === 'dark'
    ? value
    : DEFAULT_REVIEW_THEME;

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

export const getSystemReviewTheme = (): Exclude<ReviewShellTheme, 'system'> => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
};
