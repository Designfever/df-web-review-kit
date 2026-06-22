import type { TargetOverlayState } from '../types';

export const HIDE_SCROLLBAR_STYLE_ID = 'df-review-hide-scrollbar';

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

export const isEditableEventTarget = (event: KeyboardEvent) => {
  const path = event.composedPath?.() ?? [];
  const element = (path[0] ?? event.target) as HTMLElement | null;
  if (!element || typeof element.tagName !== 'string') return false;
  const tag = element.tagName;
  return (
    tag === 'INPUT' || tag === 'TEXTAREA' || element.isContentEditable === true
  );
};

export const getTargetOverlayState = (
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
