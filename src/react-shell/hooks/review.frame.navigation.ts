import type { MutableRefObject } from 'react';
import {
  getFrameRouteTarget,
  getTargetRouteKey,
  normalizeTarget,
} from '../route';

interface BindReviewFrameNavigationOptions {
  pageTargets: ReadonlySet<string>;
  reviewPathPrefix: string;
  targetDocument: Document;
  targetRef: MutableRefObject<string>;
  targetWindow: Window;
  onCancelReviewMode: () => boolean;
  onCloseRuler: () => boolean;
  onSyncShellTarget: (target: string) => void;
  onSyncTargetViewport: () => void;
}

export const bindReviewFrameNavigation = ({
  pageTargets,
  reviewPathPrefix,
  targetDocument,
  targetRef,
  targetWindow,
  onCancelReviewMode,
  onCloseRuler,
  onSyncShellTarget,
  onSyncTargetViewport,
}: BindReviewFrameNavigationOptions) => {
  const syncRouteFromFrame = () => {
    const nextTarget = getFrameRouteTarget(targetWindow, reviewPathPrefix);
    const nextRouteKey = getTargetRouteKey(nextTarget, reviewPathPrefix);
    const currentRouteKey = getTargetRouteKey(
      targetRef.current,
      reviewPathPrefix
    );
    if (nextRouteKey === currentRouteKey) return;
    if (!pageTargets.has(nextRouteKey)) {
      return;
    }

    onSyncShellTarget(nextTarget);
  };

  const handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const targetElement = event.target;
    if (!targetElement || !('closest' in targetElement)) return;

    const link = (targetElement as Element).closest('a[href]');
    const href = link?.getAttribute('href');
    const linkTarget = link?.getAttribute('target');
    if (!href || (linkTarget && linkTarget !== '_self')) return;

    const url = new URL(href, targetWindow.location.href);
    if (url.origin !== targetWindow.location.origin) return;

    const nextTarget = normalizeTarget(
      `${url.pathname}${url.search}${url.hash}`,
      reviewPathPrefix
    );
    const nextRouteKey = getTargetRouteKey(nextTarget, reviewPathPrefix);
    const currentRouteKey = getTargetRouteKey(
      targetRef.current,
      reviewPathPrefix
    );
    if (nextRouteKey === currentRouteKey) return;
    if (!pageTargets.has(nextRouteKey)) return;

    event.preventDefault();
    onSyncShellTarget(nextTarget);
  };

  const handleFrameKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    if (!onCancelReviewMode() && !onCloseRuler()) return;

    event.preventDefault();
    event.stopPropagation();
  };

  const history = targetWindow.history;
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args: Parameters<History['pushState']>) => {
    originalPushState(...args);
    syncRouteFromFrame();
  };
  history.replaceState = (...args: Parameters<History['replaceState']>) => {
    originalReplaceState(...args);
    syncRouteFromFrame();
  };

  syncRouteFromFrame();
  targetWindow.addEventListener('popstate', syncRouteFromFrame);
  targetWindow.addEventListener('hashchange', syncRouteFromFrame);
  targetWindow.addEventListener('keydown', handleFrameKeyDown, true);
  targetDocument.addEventListener('click', handleClick, true);
  targetWindow.addEventListener('scroll', onSyncTargetViewport, true);
  targetWindow.addEventListener('resize', onSyncTargetViewport);

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    targetWindow.removeEventListener('popstate', syncRouteFromFrame);
    targetWindow.removeEventListener('hashchange', syncRouteFromFrame);
    targetWindow.removeEventListener('keydown', handleFrameKeyDown, true);
    targetDocument.removeEventListener('click', handleClick, true);
    targetWindow.removeEventListener('scroll', onSyncTargetViewport, true);
    targetWindow.removeEventListener('resize', onSyncTargetViewport);
  };
};
