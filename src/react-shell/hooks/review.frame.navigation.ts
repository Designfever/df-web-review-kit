import {
  getFrameRouteTarget,
  getTargetRouteKey,
  normalizeTarget,
} from '../route';

interface BindReviewFrameNavigationOptions {
  getCurrentTarget: () => string;
  pageTargets: ReadonlySet<string>;
  reviewPathPrefix: string;
  targetDocument: Document;
  targetWindow: Window;
  onCancelReviewMode: () => boolean;
  onCloseRuler: () => boolean;
  onSyncShellTarget: (
    target: string,
    navigation: 'hard' | 'soft'
  ) => void;
  onSyncTargetViewport: () => void;
}

export const bindReviewFrameNavigation = ({
  getCurrentTarget,
  pageTargets,
  reviewPathPrefix,
  targetDocument,
  targetWindow,
  onCancelReviewMode,
  onCloseRuler,
  onSyncShellTarget,
  onSyncTargetViewport,
}: BindReviewFrameNavigationOptions) => {
  const syncRouteFromFrame = (navigation: 'hard' | 'soft') => {
    const nextTarget = getFrameRouteTarget(targetWindow, reviewPathPrefix);
    const nextRouteKey = getTargetRouteKey(nextTarget, reviewPathPrefix);
    const currentRouteKey = getTargetRouteKey(
      getCurrentTarget(),
      reviewPathPrefix
    );
    if (nextRouteKey === currentRouteKey) return;
    if (!pageTargets.has(nextRouteKey)) {
      return;
    }

    onSyncShellTarget(nextTarget, navigation);
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
      getCurrentTarget(),
      reviewPathPrefix
    );
    if (nextRouteKey === currentRouteKey) return;
    if (!pageTargets.has(nextRouteKey)) return;

    event.preventDefault();
    onSyncShellTarget(nextTarget, 'hard');
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
    syncRouteFromFrame('soft');
  };
  history.replaceState = (...args: Parameters<History['replaceState']>) => {
    originalReplaceState(...args);
    syncRouteFromFrame('soft');
  };

  const syncHardRouteFromFrame = () => syncRouteFromFrame('hard');

  syncRouteFromFrame('soft');
  targetWindow.addEventListener('popstate', syncHardRouteFromFrame);
  targetWindow.addEventListener('hashchange', syncHardRouteFromFrame);
  targetWindow.addEventListener('keydown', handleFrameKeyDown, true);
  targetDocument.addEventListener('click', handleClick);
  targetWindow.addEventListener('scroll', onSyncTargetViewport, true);
  targetWindow.addEventListener('resize', onSyncTargetViewport);

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    targetWindow.removeEventListener('popstate', syncHardRouteFromFrame);
    targetWindow.removeEventListener('hashchange', syncHardRouteFromFrame);
    targetWindow.removeEventListener('keydown', handleFrameKeyDown, true);
    targetDocument.removeEventListener('click', handleClick);
    targetWindow.removeEventListener('scroll', onSyncTargetViewport, true);
    targetWindow.removeEventListener('resize', onSyncTargetViewport);
  };
};
