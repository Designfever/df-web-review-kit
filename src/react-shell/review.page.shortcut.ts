import { isEditableEventTarget, isHotkey } from '../core/hotkey';
import { DEFAULT_REVIEW_PATH_PREFIX } from './route';

export function getReviewPageToggleUrl(
  currentUrl: string,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
  frameUrl?: string,
  size?: { width: number; height: number }
) {
  const current = new URL(currentUrl);
  const prefix = `/${reviewPathPrefix.replace(/^\/+|\/+$/g, '')}`;
  const isReview = current.pathname === prefix || current.pathname.startsWith(`${prefix}/`);
  const target = new URL(
    isReview ? frameUrl || current.searchParams.get('target') || '/' : current.href,
    current.origin
  );
  if (target.origin !== current.origin || !['http:', 'https:'].includes(target.protocol)) return null;
  target.searchParams.delete('__dfwr_target');
  const path = `${target.pathname}${target.search}${target.hash}`;
  if (isReview) return path;
  const review = new URL(`${prefix}/`, current.origin);
  review.searchParams.set('target', path);
  if (size) {
    review.searchParams.set('w', String(size.width));
    review.searchParams.set('h', String(size.height));
  }
  return `${review.pathname}${review.search}`;
}

export function bindReviewPageShortcut(reviewPathPrefix?: string, frame?: HTMLIFrameElement | null) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat || isEditableEventTarget(event) || !isHotkey(event, 'Shift+Q')) return;
    let frameUrl: string | undefined;
    try { frameUrl = frame?.contentWindow?.location.href; } catch { /* Use the shell target. */ }
    if (frameUrl === 'about:blank') frameUrl = undefined;
    const url = getReviewPageToggleUrl(window.location.href, reviewPathPrefix, frameUrl, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    if (!url) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(url);
  };
  const targets = new Set<Window>([window]);
  try {
    if (frame?.contentDocument && frame.contentWindow) targets.add(frame.contentWindow);
  } catch { /* Shell shortcut remains available for cross-origin previews. */ }
  targets.forEach((target) => target.addEventListener('keydown', handleKeyDown, true));
  return () => targets.forEach((target) => target.removeEventListener('keydown', handleKeyDown, true));
}
