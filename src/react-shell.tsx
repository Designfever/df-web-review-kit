import React from 'react';
import { createRoot } from 'react-dom/client';
import { ensureReviewShellStyle } from './react-shell/style';
import type { ReviewShellMountOptions } from './react-shell/types';
import { ReviewShell } from './react-shell/review/shell';

export { ReviewShell } from './react-shell/review/shell';
export type {
  CreateReviewPagesOptions,
  ReviewShellAdapter,
  ReviewShellAdapters,
  ReviewPresenceAdapter,
  ReviewPresenceContext,
  ReviewPresenceSession,
  ReviewPresenceState,
  ReviewPresenceStatus,
  ReviewPresenceUser,
  ReviewSourceEditor,
  ReviewSourceInspectorOptions,
  ReviewShellFigmaImagesOptions,
  ReviewShellGlobEntries,
  ReviewShellMountOptions,
  ReviewShellPage,
  ReviewShellProps,
  ReviewShellStatusOption,
  ReviewShellViewportKind,
  ReviewShellViewportPreset,
} from './react-shell/types';
export { createReviewPagesFromGlob } from './react-shell/pages';
export { DEFAULT_REVIEW_VIEWPORT_PRESETS } from './react-shell/viewport';
export {
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
} from './react-shell/presence/presence';
export type { LocalPresenceAdapterOptions } from './react-shell/presence/presence';
export { createSupabasePresenceAdapter } from './react-shell/presence/supabase';
export type {
  SupabasePresenceAdapterOptions,
  SupabasePresenceClient,
} from './react-shell/presence/supabase';

export const mountReviewShell = (options: ReviewShellMountOptions) => {
  if (typeof document === 'undefined' || !document.head) return;

  const { rootId = 'root', ...shellProps } = options;

  ensureReviewShellStyle();

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
