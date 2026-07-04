import type { TargetOverlayState } from '../types';

const HIDE_SCROLLBAR_STYLE_ID = 'df-review-hide-scrollbar';
const FIGMA_POINTER_LOCK_STYLE_ID = 'df-review-figma-pointer-lock';
const FIGMA_SOURCE_SELECT_POINTER_LOCK_STYLE_ID =
  'df-review-source-select-figma-pointer-lock';
const TARGET_OVERLAY_STACKING_STYLE_ID = 'df-review-target-overlay-stacking';
export const TARGET_FIGMA_IMAGE_LAYER_Z_INDEX = 2147483000;
const TARGET_GRID_LAYER_Z_INDEX = 2147483100;
const FIGMA_POINTER_LOCK_STYLE_TEXT = [
  '#df-review-figma-image-target-root,',
  '#df-review-figma-image-target-root *,',
  '.df-review-figma-image-target-overlay,',
  '.df-review-figma-image-target-overlay *,',
  '.helper-figma-root,',
  '.helper-figma-root *,',
  '.helper-figma-loading-backdrop,',
  '.helper-figma-loading-backdrop * {',
  'pointer-events: none !important;',
  '}',
].join('\n');
const TARGET_OVERLAY_STACKING_STYLE_TEXT = [
  ':root {',
  `  --df-review-target-figma-layer-z: ${TARGET_FIGMA_IMAGE_LAYER_Z_INDEX};`,
  `  --df-review-target-grid-layer-z: ${TARGET_GRID_LAYER_Z_INDEX};`,
  '}',
  '',
  '#df-review-figma-image-target-root,',
  '.helper-figma-root,',
  '.helper-figma-loading-backdrop {',
  '  z-index: var(--df-review-target-figma-layer-z) !important;',
  '}',
  '',
  'body.is-help .helper,',
  '.helper.onShow,',
  '#df-review-grid-overlay,',
  '.df-review-grid-overlay,',
  '[data-df-review-grid-overlay] {',
  '  z-index: var(--df-review-target-grid-layer-z) !important;',
  '}',
  '',
  'body.is-help .helper.onShow ~ main section::before,',
  '.helper.onShow ~ main section::before {',
  '  z-index: var(--df-review-target-grid-layer-z) !important;',
  '}',
].join('\n');

export const setTargetScrollbarHidden = (
  targetDocument: Document | null | undefined,
  hidden: boolean
) => {
  if (!targetDocument) return;

  const existing = targetDocument.getElementById(HIDE_SCROLLBAR_STYLE_ID);
  if (hidden) {
    if (existing) return;
    const style = targetDocument.createElement('style');
    style.id = HIDE_SCROLLBAR_STYLE_ID;
    style.textContent =
      'html{scrollbar-width:none}html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0;display:none}';
    targetDocument.head?.appendChild(style);
  } else {
    existing?.remove();
  }
};

const setTargetFigmaPointerLockStyle = (
  targetDocument: Document | null | undefined,
  styleId: string,
  locked: boolean
) => {
  if (!targetDocument) return;

  const existing = targetDocument.getElementById(styleId);
  if (locked) {
    if (existing) return;
    const style = targetDocument.createElement('style');
    style.id = styleId;
    style.textContent = FIGMA_POINTER_LOCK_STYLE_TEXT;
    targetDocument.head?.appendChild(style);
  } else {
    existing?.remove();
  }
};

export const ensureTargetOverlayStackingStyle = (
  targetDocument: Document | null | undefined
) => {
  if (!targetDocument) return;

  const existing = targetDocument.getElementById(
    TARGET_OVERLAY_STACKING_STYLE_ID
  );
  if (existing) {
    if (existing.textContent !== TARGET_OVERLAY_STACKING_STYLE_TEXT) {
      existing.textContent = TARGET_OVERLAY_STACKING_STYLE_TEXT;
    }
    return;
  }

  const style = targetDocument.createElement('style');
  style.id = TARGET_OVERLAY_STACKING_STYLE_ID;
  style.textContent = TARGET_OVERLAY_STACKING_STYLE_TEXT;
  targetDocument.head?.appendChild(style);
};

export const setTargetFigmaOverlayLocked = (
  targetDocument: Document | null | undefined,
  locked: boolean
) => {
  setTargetFigmaPointerLockStyle(
    targetDocument,
    FIGMA_POINTER_LOCK_STYLE_ID,
    locked
  );
};

export const setTargetFigmaSourceSelectLocked = (
  targetDocument: Document | null | undefined,
  locked: boolean
) => {
  setTargetFigmaPointerLockStyle(
    targetDocument,
    FIGMA_SOURCE_SELECT_POINTER_LOCK_STYLE_ID,
    locked
  );
};

export const isEditableEventTarget = (event: KeyboardEvent) => {
  const path = event.composedPath?.() ?? [];
  const element = (path[0] ?? event.target) as HTMLElement | null;
  if (!element || typeof element.tagName !== 'string') return false;
  const tag = element.tagName;
  return (
    tag === 'INPUT' || tag === 'TEXTAREA' || element.isContentEditable === true
  );
};

const TRUE_STORAGE_VALUES = new Set([
  '1',
  'true',
  'on',
  'show',
  'shown',
  'visible',
  'enabled',
  'yes',
]);

const OVERLAY_STORAGE_KEYS = {
  grid: ['isHelp', 'df-review-grid-overlay', 'dfReviewGridOverlay'],
  figma: ['isFigmaHelp', 'df-review-figma-overlay', 'dfReviewFigmaOverlay'],
} satisfies Record<keyof TargetOverlayState, string[]>;

const isStoredOverlayEnabled = (value: string | null | undefined) =>
  TRUE_STORAGE_VALUES.has(value?.trim().toLowerCase() ?? '');

const getCookieValue = (
  targetDocument: Document | undefined,
  name: string
) => {
  const cookies = targetDocument?.cookie ? targetDocument.cookie.split(';') : [];
  const prefix = `${name}=`;
  const match = cookies
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix));

  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
};

const getStorageValue = (
  storage: Storage | undefined,
  key: string
): string | null => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const getStoredOverlayState = (
  targetDocument: Document | undefined,
  overlay: keyof TargetOverlayState
) => {
  const targetWindow = targetDocument?.defaultView;

  return OVERLAY_STORAGE_KEYS[overlay].some((key) => {
    if (isStoredOverlayEnabled(getCookieValue(targetDocument, key))) {
      return true;
    }

    return (
      isStoredOverlayEnabled(getStorageValue(targetWindow?.localStorage, key)) ||
      isStoredOverlayEnabled(getStorageValue(targetWindow?.sessionStorage, key))
    );
  });
};

export const getTargetOverlayState = (
  targetDocument: Document | undefined
): TargetOverlayState => ({
  grid: Boolean(
    targetDocument?.body?.classList.contains('is-help') ||
      targetDocument?.querySelector('.helper.onShow') ||
      getStoredOverlayState(targetDocument, 'grid')
  ),
  figma: Boolean(
    targetDocument?.querySelector(
      '.helper-figma-root, .helper-figma-loading-backdrop'
    ) || getStoredOverlayState(targetDocument, 'figma')
  ),
});
