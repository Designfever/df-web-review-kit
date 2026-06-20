import type { ReviewItemScope } from '../types';
import type { ReviewQaFilter, ReviewShellTheme } from './types';

export const REVIEW_QA_FILTERS: Array<{
  key: ReviewQaFilter;
  label: string;
  scope?: ReviewItemScope;
}> = [
  { key: 'all', label: 'All' },
  { key: 'mobile', label: 'Mobile', scope: 'mobile' },
  { key: 'tablet', label: 'Tablet', scope: 'tablet' },
  { key: 'desktop', label: 'Desktop', scope: 'desktop' },
  { key: 'wide', label: 'Wide', scope: 'wide' },
];

export const FIGMA_OVERLAY_UNAVAILABLE_MESSAGE =
  '피그마 오버레이 디버깅이 안되는 해상도';
export const FIGMA_TOKEN_STORAGE_KEY = 'figma-token';
export const REVIEW_USER_ID_STORAGE_KEY = 'user-id';
export const REVIEW_THEME_STORAGE_KEY = 'df-review-theme';
export const DEFAULT_REVIEW_THEME: ReviewShellTheme = 'dark';
export const FIGMA_TOKEN_GUIDE_ID = 'df-review-figma-token-guide';
export const DEFAULT_INITIAL_REVIEW_PROMPT =
  'You are fixing QA issues collected with df-web-review-kit. Use the copied QA prompt as the source of truth for page, viewport, selector, DOM metadata, coordinates, and user comment. Make the smallest code or CSS change that fixes the issue, preserve unrelated behavior, then verify the target viewport again.';

export const REVIEW_THEME_OPTIONS: Array<{
  value: ReviewShellTheme;
  label: string;
}> = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' }
];
