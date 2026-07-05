import type {
  ReviewWorkflowStatus,
} from '../types';
import type { ReviewShellTheme } from './types';

export const REVIEW_QA_STATUS_FILTERS = [
  'todo',
  'doing',
  'review',
  'hold',
  'done',
] as const satisfies readonly ReviewWorkflowStatus[];

export const DEFAULT_REVIEW_QA_STATUS_FILTERS = [
  'todo',
  'doing',
  'review',
  'hold',
] as const satisfies readonly ReviewWorkflowStatus[];

export const FIGMA_OVERLAY_UNAVAILABLE_MESSAGE =
  '피그마 오버레이 디버깅이 안되는 해상도';
export const FIGMA_TOKEN_STORAGE_KEY = 'figma-token';
export const REVIEW_USER_ID_STORAGE_KEY = 'user-id';
export const REVIEW_THEME_STORAGE_KEY = 'df-review-theme';
export const REVIEW_SIDE_PANEL_STORAGE_KEY = 'df-review-side-panel';
export const REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY =
  'df-review-side-panel-visible';
export const REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY =
  'df-review-source-tree-filter';
export const REVIEW_SOURCE_TREE_META_STORAGE_KEY =
  'df-review-source-tree-meta-visibility';
export const REVIEW_QA_STATUS_FILTER_STORAGE_KEY =
  'df-review-qa-status-filter';
export const REVIEW_TOOLTIP_STORAGE_KEY = 'df-review-tooltips-enabled';
export const DEFAULT_REVIEW_THEME: ReviewShellTheme = 'dark';
export const DEFAULT_REVIEW_TOOLTIPS_ENABLED = true;
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
