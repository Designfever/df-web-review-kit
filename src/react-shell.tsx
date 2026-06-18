import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  GripVertical as GripVerticalIcon,
  Image as ImageIcon,
  LayoutGrid as LayoutGridIcon,
  Map as MapIcon,
  Maximize2 as Maximize2Icon,
  Monitor as MonitorIcon,
  Scan as ScanIcon,
  Smartphone as SmartphoneIcon,
  SquareMousePointer as SquareMousePointerIcon,
  StickyNote as StickyNoteIcon,
  Tablet as TabletIcon,
} from 'lucide-react';
import { createRoot } from 'react-dom/client';
import {
  createWebReviewKit,
  getNumberedReviewItems,
  localAdapter,
  type ReviewItemScope,
  type ReviewViewportPreset,
  type ReviewItem,
  type ReviewMode,
  type WebReviewKitController,
} from './index';

export type ReviewShellViewportKind = Exclude<ReviewItemScope, 'dom'>;

export type ReviewShellViewportPreset = {
  label: string;
  width: number;
  height: number;
  kind?: ReviewShellViewportKind;
};

export type ReviewShellPage = {
  href: string;
};

export type ReviewShellGlobEntries = Record<string, unknown>;

export interface CreateReviewPagesOptions {
  root?: string;
  exclude?: (href: string) => boolean;
}

export interface ReviewShellProps {
  projectId: string;
  pages: ReviewShellPage[];
  storageKey?: string;
  presets?: ReviewShellViewportPreset[];
  reviewPathPrefix?: string;
}

export interface ReviewShellMountOptions extends ReviewShellProps {
  rootId?: string;
}

type TargetOverlayKey = 'grid' | 'figma';

type TargetOverlayState = Record<TargetOverlayKey, boolean>;

export const DEFAULT_REVIEW_VIEWPORT_PRESETS: ReviewShellViewportPreset[] = [
  { label: 'Mobile', width: 390, height: 844, kind: 'mobile' },
  { label: 'Tablet', width: 768, height: 1024, kind: 'tablet' },
  { label: 'Desktop', width: 1440, height: 900, kind: 'desktop' },
  { label: 'Wide', width: 1940, height: 1080, kind: 'wide' },
];

const DEFAULT_REVIEW_PATH_PREFIX = '/review';
const REVIEW_SHELL_STYLE_ID = 'df-review-shell-style';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizePageHref = (value: string) => {
  const href = value || '/';
  return href.startsWith('/') ? href : `/${href}`;
};

const sortReviewPages = (a: ReviewShellPage, b: ReviewShellPage) => {
  if (a.href === '/') return -1;
  if (b.href === '/') return 1;
  return a.href.localeCompare(b.href);
};

export const createReviewPagesFromGlob = (
  entries: ReviewShellGlobEntries,
  options: CreateReviewPagesOptions = {}
): ReviewShellPage[] => {
  const root = options.root ?? '/page';
  const rootPattern = root ? new RegExp(`^${escapeRegExp(root)}`) : null;

  return Object.keys(entries)
    .map((key) => {
      const withoutRoot = rootPattern ? key.replace(rootPattern, '') : key;
      const href = withoutRoot.replace(/index\.(tsx|ts|jsx|js)$/, '');
      return normalizePageHref(href === '' ? '/' : href);
    })
    .filter((href) => !options.exclude?.(href))
    .sort((a, b) => sortReviewPages({ href: a }, { href: b }))
    .map((href) => ({ href }));
};

const getStorageKey = (projectId: string) =>
  `df-web-review-kit:${projectId}:review-items`;

const normalizeReviewPathPrefix = (value: string) => {
  const raw = value.trim() || DEFAULT_REVIEW_PATH_PREFIX;
  const prefix = raw.startsWith('/') ? raw : `/${raw}`;
  return prefix.length > 1 && prefix.endsWith('/')
    ? prefix.slice(0, -1)
    : prefix;
};

const normalizeTarget = (
  value: string,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
) => {
  const raw = value.trim() || '/';
  const [path] = raw.split(/[?#]/);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const reviewPrefix = normalizeReviewPathPrefix(reviewPathPrefix);

  return normalized === reviewPrefix || normalized.startsWith(`${reviewPrefix}/`)
    ? '/'
    : normalized;
};

const getInitialTarget = (reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  if (typeof window === 'undefined') return '/';

  const target = new URLSearchParams(window.location.search).get('target');
  return target ? normalizeTarget(target, reviewPathPrefix) : '/';
};

const getFallbackPreset = (presets: ReviewShellViewportPreset[]) =>
  presets[0] ?? DEFAULT_REVIEW_VIEWPORT_PRESETS[0];

const getViewportPresetDistance = (
  preset: ReviewShellViewportPreset,
  width: number,
  height: number
) => Math.abs(preset.width - width) + Math.abs(preset.height - height);

const findViewportPreset = (
  presets: ReviewShellViewportPreset[],
  width: number,
  height: number
) => {
  const fallback = getFallbackPreset(presets);
  const exact = presets.find(
    (preset) => preset.width === width && preset.height === height
  );

  if (exact) return exact;

  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance(closest, width, height);
    const presetDistance = getViewportPresetDistance(preset, width, height);
    return presetDistance < closestDistance ? preset : closest;
  }, fallback);
};

const getInitialSize = (
  presets: ReviewShellViewportPreset[]
): ReviewShellViewportPreset => {
  if (typeof window === 'undefined') return getFallbackPreset(presets);

  const params = new URLSearchParams(window.location.search);
  const width = Number(params.get('w'));
  const height = Number(params.get('h'));

  if (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  ) {
    return findViewportPreset(presets, width, height);
  }

  return getFallbackPreset(presets);
};

const buildTargetSrc = (target: string) => {
  const url = new URL(target || '/', window.location.origin);
  url.searchParams.set('__dfwr_target', '1');
  return `${url.pathname}${url.search}${url.hash}`;
};

const updateShellUrl = (
  target: string,
  size: ReviewShellViewportPreset
) => {
  const url = new URL(window.location.href);
  url.searchParams.set('target', target);
  url.searchParams.set('w', String(size.width));
  url.searchParams.set('h', String(size.height));
  url.searchParams.delete('item');
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
};

const updateShellUrlForItem = (
  target: string,
  size: ReviewShellViewportPreset,
  itemId: string
) => {
  const url = new URL(window.location.href);
  url.searchParams.set('target', target);
  url.searchParams.set('w', String(size.width));
  url.searchParams.set('h', String(size.height));
  url.searchParams.set('item', itemId);
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
};

const getInitialItemId = () => {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('item');
};

const getItemTarget = (
  item: ReviewItem,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
) => {
  if (item.routeKey) return normalizeTarget(item.routeKey, reviewPathPrefix);
  if (item.normalizedPath) {
    return normalizeTarget(item.normalizedPath, reviewPathPrefix);
  }

  try {
    return normalizeTarget(new URL(item.pageUrl).pathname, reviewPathPrefix);
  } catch {
    return '/';
  }
};

const getStoredItem = (itemId: string, storageKey: string) => {
  try {
    const items = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(items)) return undefined;
    return items.find((item): item is ReviewItem => item?.id === itemId);
  } catch {
    return undefined;
  }
};

const getRestoredSize = (
  item: ReviewItem,
  presets: ReviewShellViewportPreset[]
): ReviewShellViewportPreset =>
  findViewportPreset(
    presets,
    Math.max(
      240,
      Math.round(item.viewport?.width ?? getFallbackPreset(presets).width)
    ),
    Math.max(
      320,
      Math.round(item.viewport?.height ?? getFallbackPreset(presets).height)
    )
  );

const getViewportPresetKind = (
  preset: ReviewShellViewportPreset
): ReviewShellViewportKind => {
  if (preset.kind) return preset.kind;

  const label = preset.label.toLowerCase();

  if (label.includes('mobile') || label.includes('phone')) return 'mobile';
  if (label.includes('tablet') || label.includes('pad')) return 'tablet';
  if (label.includes('wide') || label.includes('1940') || label.includes('1920')) {
    return 'wide';
  }
  if (label.includes('desktop')) return 'desktop';
  if (preset.width >= 1800) return 'wide';
  if (preset.width >= 1000) return 'desktop';
  if (preset.width >= 700) return 'tablet';
  return 'mobile';
};

const ViewportPresetIcon = ({
  preset,
}: {
  preset: ReviewShellViewportPreset;
}) => {
  return <ReviewScopeIcon scope={getViewportPresetKind(preset)} />;
};

const ReviewScopeIcon = ({ scope }: { scope: ReviewItemScope }) => {
  if (scope === 'mobile') return <SmartphoneIcon aria-hidden='true' />;
  if (scope === 'tablet') return <TabletIcon aria-hidden='true' />;
  if (scope === 'wide') return <Maximize2Icon aria-hidden='true' />;
  if (scope === 'dom') return <SquareMousePointerIcon aria-hidden='true' />;
  return <MonitorIcon aria-hidden='true' />;
};

const toReviewViewportPresets = (
  presets: ReviewShellViewportPreset[]
): ReviewViewportPreset[] =>
  presets.map((preset) => ({
    label: preset.label,
    width: preset.width,
    height: preset.height,
    scope: getViewportPresetKind(preset),
  }));

const getIsFigmaOverlayAvailable = (preset: ReviewShellViewportPreset) => {
  const kind = getViewportPresetKind(preset);
  return kind === 'mobile' || kind === 'wide';
};

const FIGMA_OVERLAY_UNAVAILABLE_MESSAGE =
  '피그마 오버레이 디버깅이 안되는 해상도';

const getItemTitle = (item: ReviewItem) =>
  item.title || item.comment.split('\n')[0] || item.kind;

const getTargetOverlayState = (
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
  ),
});

const formatItemMeta = (item: ReviewItem) => {
  const parts = [
    `${Math.round(item.viewport?.width ?? 0)}x${Math.round(item.viewport?.height ?? 0)}`,
  ];

  if (item.scroll) {
    parts.push(
      `scroll ${Math.round(item.scroll.x)},${Math.round(item.scroll.y)}`
    );
  }

  return parts.join(' / ');
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ReviewShell = ({
  projectId,
  pages,
  storageKey = getStorageKey(projectId),
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
}: ReviewShellProps) => {
  const viewportPresets =
    presets.length > 0 ? presets : DEFAULT_REVIEW_VIEWPORT_PRESETS;
  const reviewViewportPresets = useMemo(
    () => toReviewViewportPresets(viewportPresets),
    [viewportPresets]
  );
  const adapter = useMemo(
    () =>
      localAdapter({
        storageKey,
      }),
    [storageKey]
  );
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const controllerRef = useRef<WebReviewKitController | null>(null);
  const cleanupTargetRef = useRef<(() => void) | null>(null);
  const pendingRestoreRef = useRef<ReviewItem | null>(null);
  const pendingInitialItemIdRef = useRef(getInitialItemId());
  const selectedItemIdRef = useRef(getInitialItemId());
  const [target, setTarget] = useState(() => getInitialTarget(reviewPathPrefix));
  const [draftTarget, setDraftTarget] = useState(() =>
    getInitialTarget(reviewPathPrefix)
  );
  const [activeRoute, setActiveRoute] = useState(() =>
    getInitialTarget(reviewPathPrefix)
  );
  const [size, setSize] = useState<ReviewShellViewportPreset>(() =>
    getInitialSize(viewportPresets)
  );
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [mode, setMode] = useState<ReviewMode>('idle');
  const [targetOverlayState, setTargetOverlayState] =
    useState<TargetOverlayState>({
      grid: false,
      figma: false,
    });
  const [selectedItemId, setSelectedItemId] = useState(getInitialItemId());
  const [isListVisible, setIsListVisible] = useState(true);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy URL');
  const targetRef = useRef(target);
  const sizeRef = useRef(size);

  const isFigmaOverlayAvailable = getIsFigmaOverlayAvailable(size);
  const targetSrc = useMemo(() => buildTargetSrc(target), [target]);
  const activeItems = useMemo(
    () =>
      items
        .filter((item) => getItemTarget(item, reviewPathPrefix) === activeRoute)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [activeRoute, items, reviewPathPrefix]
  );
  const numberedActiveItems = useMemo(
    () => getNumberedReviewItems(activeItems, reviewViewportPresets),
    [activeItems, reviewViewportPresets]
  );
  const pageQaCounts = useMemo(() => {
    const counts = new Map<string, number>();

    items.forEach((item) => {
      const pageTarget = normalizeTarget(
        getItemTarget(item, reviewPathPrefix),
        reviewPathPrefix
      );
      counts.set(pageTarget, (counts.get(pageTarget) ?? 0) + 1);
    });

    return counts;
  }, [items, reviewPathPrefix]);

  const refreshItems = useCallback(async () => {
    const nextItems = await adapter.list({
      projectId,
      status: 'open',
    });
    setItems(nextItems);
    return nextItems;
  }, [adapter, projectId]);

  const refreshReviewData = useCallback(async () => {
    await controllerRef.current?.reload();
    await refreshItems();
  }, [refreshItems]);

  const clearSelectedItem = useCallback(() => {
    selectedItemIdRef.current = null;
    setSelectedItemId(null);
  }, []);

  const destroyReviewKit = useCallback(() => {
    cleanupTargetRef.current?.();
    cleanupTargetRef.current = null;
    controllerRef.current?.destroy();
    controllerRef.current = null;
  }, []);

  const syncTargetViewport = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  const refreshTargetOverlayState = useCallback(() => {
    setTargetOverlayState(
      getTargetOverlayState(iframeRef.current?.contentDocument ?? undefined)
    );
  }, []);

  const dispatchTargetOverlayHotkey = useCallback(
    (overlay: TargetOverlayKey) => {
      const targetWindow = iframeRef.current?.contentWindow;
      if (!targetWindow) return false;

      const code = overlay === 'grid' ? 'KeyG' : 'KeyF';
      targetWindow.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          code,
          key: code.replace('Key', '').toLowerCase(),
          shiftKey: true,
        })
      );
      window.setTimeout(refreshTargetOverlayState, 80);
      return true;
    },
    [refreshTargetOverlayState]
  );

  const toggleTargetOverlay = useCallback(
    (overlay: TargetOverlayKey) => {
      if (overlay === 'figma' && !isFigmaOverlayAvailable) {
        refreshTargetOverlayState();
        return;
      }

      dispatchTargetOverlayHotkey(overlay);
    },
    [
      dispatchTargetOverlayHotkey,
      isFigmaOverlayAvailable,
      refreshTargetOverlayState,
    ]
  );

  const syncShellTarget = useCallback(
    (nextTarget: string) => {
      const normalizedTarget = normalizeTarget(nextTarget, reviewPathPrefix);

      if (normalizedTarget !== targetRef.current) {
        clearSelectedItem();
        targetRef.current = normalizedTarget;
        setTarget(normalizedTarget);
        setDraftTarget(normalizedTarget);
        setActiveRoute(normalizedTarget);
      }

      if (selectedItemIdRef.current) {
        updateShellUrlForItem(
          normalizedTarget,
          sizeRef.current,
          selectedItemIdRef.current
        );
      } else {
        updateShellUrl(normalizedTarget, sizeRef.current);
      }
    },
    [clearSelectedItem, reviewPathPrefix]
  );

  const applyItemScroll = useCallback(
    (item: ReviewItem) => {
      const scrollToItem = () => {
        const targetWindow = iframeRef.current?.contentWindow;
        if (!targetWindow) return;

        targetWindow.scrollTo(item.scroll?.x ?? 0, item.scroll?.y ?? 0);
        syncTargetViewport();
        controllerRef.current?.highlightItem(item.id);
      };

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollToItem);
      });
      window.setTimeout(scrollToItem, 120);
      window.setTimeout(scrollToItem, 360);
      window.setTimeout(scrollToItem, 720);
    },
    [syncTargetViewport]
  );

  const applyPendingRestore = useCallback(() => {
    const item = pendingRestoreRef.current;
    if (!item) return;

    applyItemScroll(item);
    pendingRestoreRef.current = null;
  }, [applyItemScroll]);

  const restoreReviewItem = useCallback(
    (item: ReviewItem) => {
      const nextTarget = getItemTarget(item, reviewPathPrefix);
      const nextSize = getRestoredSize(item, viewportPresets);

      pendingRestoreRef.current = item;
      selectedItemIdRef.current = item.id;
      setSelectedItemId(item.id);
      setActiveRoute(nextTarget);
      setDraftTarget(nextTarget);
      setSize(nextSize);
      updateShellUrlForItem(nextTarget, nextSize, item.id);

      if (targetRef.current !== nextTarget) {
        setTarget(nextTarget);
        return;
      }

      applyPendingRestore();
    },
    [applyPendingRestore, viewportPresets, reviewPathPrefix]
  );

  const restoreInitialItem = useCallback(() => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;

    pendingInitialItemIdRef.current = null;

    const item = getStoredItem(itemId, storageKey);
    if (item) {
      restoreReviewItem(item);
    }
  }, [restoreReviewItem, storageKey]);

  const initReviewKit = useCallback(() => {
    destroyReviewKit();

    const iframe = iframeRef.current;
    const targetWindow = iframe?.contentWindow;
    const targetDocument = iframe?.contentDocument;
    if (!iframe || !targetWindow || !targetDocument) return;

    const syncRouteFromFrame = () => {
      syncShellTarget(targetWindow.location.pathname);
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

      const nextTarget = normalizeTarget(url.pathname, reviewPathPrefix);
      if (nextTarget === targetRef.current) return;

      event.preventDefault();
      syncShellTarget(nextTarget);
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
    targetDocument.addEventListener('click', handleClick, true);
    targetWindow.addEventListener('scroll', syncTargetViewport, true);
    targetWindow.addEventListener('resize', syncTargetViewport);
    cleanupTargetRef.current = () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      targetWindow.removeEventListener('popstate', syncRouteFromFrame);
      targetWindow.removeEventListener('hashchange', syncRouteFromFrame);
      targetDocument.removeEventListener('click', handleClick, true);
      targetWindow.removeEventListener('scroll', syncTargetViewport, true);
      targetWindow.removeEventListener('resize', syncTargetViewport);
    };

    controllerRef.current = createWebReviewKit({
      projectId,
      adapter,
      target: () => {
        const frame = iframeRef.current;
        const frameWindow = frame?.contentWindow;
        const frameDocument = frame?.contentDocument;

        if (!frame || !frameWindow || !frameDocument) return undefined;

        return {
          window: frameWindow,
          document: frameDocument,
          getViewportRect: () => frame.getBoundingClientRect(),
        };
      },
      hotkeys: {
        qa: 'Shift+Q',
      },
      anchors: {
        attribute: 'data-qa-id',
      },
      viewports: {
        presets: reviewViewportPresets,
      },
      onRestoreItem: restoreReviewItem,
      onItemsChange: () => {
        void refreshItems();
      },
      onModeChange: setMode,
      ui: {
        panel: false,
      },
      modules: {
        qa: true,
        grid: false,
        figma: false,
      },
    });
    controllerRef.current.open();
    setMode(controllerRef.current.getMode());
    void refreshItems();
    restoreInitialItem();
    applyPendingRestore();
    refreshTargetOverlayState();
  }, [
    adapter,
    applyPendingRestore,
    destroyReviewKit,
    projectId,
    refreshItems,
    refreshTargetOverlayState,
    reviewViewportPresets,
    restoreInitialItem,
    restoreReviewItem,
    reviewPathPrefix,
    syncShellTarget,
    syncTargetViewport,
  ]);

  useEffect(() => destroyReviewKit, [destroyReviewKit]);

  useEffect(() => {
    void refreshItems();
  }, [refreshItems]);

  useEffect(() => {
    if (!isListVisible && !isSitemapOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (isSitemapOpen) {
        setIsSitemapOpen(false);
        return;
      }

      setIsListVisible(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListVisible, isSitemapOpen]);

  useEffect(() => {
    targetRef.current = target;
    setActiveRoute(target);
  }, [target]);

  useEffect(() => {
    sizeRef.current = size;
    if (selectedItemIdRef.current) {
      updateShellUrlForItem(targetRef.current, size, selectedItemIdRef.current);
    } else {
      updateShellUrl(targetRef.current, size);
    }
    syncTargetViewport();
  }, [size, syncTargetViewport]);

  useEffect(() => {
    if (isFigmaOverlayAvailable || !targetOverlayState.figma) return;

    dispatchTargetOverlayHotkey('figma');
  }, [
    dispatchTargetOverlayHotkey,
    isFigmaOverlayAvailable,
    targetOverlayState.figma,
  ]);

  const applyTarget = () => {
    const normalizedTarget = normalizeTarget(draftTarget, reviewPathPrefix);
    clearSelectedItem();
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current);
  };

  const selectPage = (href: string) => {
    const normalizedTarget = normalizeTarget(href, reviewPathPrefix);
    clearSelectedItem();
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current);
    setIsSitemapOpen(false);
  };

  const setReviewMode = (nextMode: ReviewMode) => {
    controllerRef.current?.setMode(nextMode);
    setMode(controllerRef.current?.getMode() ?? 'idle');
  };

  const copyCurrentUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopyLabel('Copied');
    window.setTimeout(() => setCopyLabel('Copy URL'), 1200);
  };

  const resolveItem = async (item: ReviewItem) => {
    await adapter.update(item.id, { status: 'resolved' });
    if (selectedItemIdRef.current === item.id) {
      clearSelectedItem();
      updateShellUrl(targetRef.current, sizeRef.current);
    }
    await refreshReviewData();
  };

  const removeItem = async (item: ReviewItem) => {
    await adapter.remove(item.id);
    if (selectedItemIdRef.current === item.id) {
      clearSelectedItem();
      updateShellUrl(targetRef.current, sizeRef.current);
    }
    await refreshReviewData();
  };

  return (
    <div className='df-review-shell'>
      <header className='df-review-topbar'>
        <form
          className='df-review-address'
          onSubmit={(event) => {
            event.preventDefault();
            applyTarget();
          }}
        >
          <button
            aria-label='Open sitemap'
            className='df-review-sitemap-button'
            data-tooltip='Sitemap'
            type='button'
            onClick={() => setIsSitemapOpen(true)}
          >
            <MapIcon aria-hidden='true' />
          </button>
          <input
            aria-label='Path'
            value={draftTarget}
            onChange={(event) => setDraftTarget(event.target.value)}
          />
          <button type='submit'>Load</button>
          <button type='button' onClick={() => void copyCurrentUrl()}>
            {copyLabel}
          </button>
        </form>

        <div className='df-review-tools'>
          <div className='df-review-presets' aria-label='Viewport presets'>
            {viewportPresets.map((preset) => (
              <button
                key={preset.label}
                className={preset.label === size.label ? 'is-active' : ''}
                type='button'
                onClick={() => setSize(preset)}
              >
                <ViewportPresetIcon preset={preset} />
                <span className='df-review-preset-copy'>
                  <strong>{preset.label}</strong>
                  <span>
                    {preset.width}x{preset.height}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className='df-review-mode'>
            <button
              aria-label='Note'
              className={`df-review-mode-button is-note${
                mode === 'text' ? ' is-active' : ''
              }`}
              data-tooltip='Note'
              type='button'
              onClick={() => setReviewMode('text')}
            >
              <StickyNoteIcon aria-hidden='true' />
            </button>
            <button
              aria-label='Capture'
              className={`df-review-mode-button is-capture${
                mode === 'capture' ? ' is-active' : ''
              }`}
              data-tooltip='Capture'
              type='button'
              onClick={() => setReviewMode('capture')}
            >
              <ScanIcon aria-hidden='true' />
            </button>
          </div>
        </div>
      </header>

      {isSitemapOpen && (
        <div
          aria-label='Sitemap'
          aria-modal='true'
          className='df-review-sitemap-modal'
          role='dialog'
        >
          <button
            aria-label='Close sitemap'
            className='df-review-sitemap-backdrop'
            type='button'
            onClick={() => setIsSitemapOpen(false)}
          />
          <div className='df-review-sitemap-dialog'>
            <div className='df-review-sitemap-header'>
              <div>
                <strong>Sitemap</strong>
                <span>{pages.length} pages</span>
              </div>
              <button
                aria-label='Close sitemap'
                type='button'
                onClick={() => setIsSitemapOpen(false)}
              >
                x
              </button>
            </div>
            <div className='df-review-sitemap-list'>
              {pages.map((page) => {
                const pageTarget = normalizeTarget(page.href, reviewPathPrefix);
                const qaCount = pageQaCounts.get(pageTarget) ?? 0;

                return (
                  <button
                    key={page.href}
                    aria-label={`${page.href} / ${qaCount} QA`}
                    className={pageTarget === activeRoute ? 'is-active' : ''}
                    type='button'
                    onClick={() => selectPage(page.href)}
                  >
                    <span className='df-review-sitemap-path'>{page.href}</span>
                    <span className='df-review-sitemap-count'>{qaCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div
        className={`df-review-workspace${isListVisible ? ' is-list-visible' : ''}`}
      >
        <div className='df-review-side-rail'>
          <button
            aria-label={isListVisible ? 'Hide QA list' : 'Show QA list'}
            className='df-review-side-toggle'
            type='button'
            onClick={() => setIsListVisible((current) => !current)}
          >
            <span aria-hidden='true'>
              <GripVerticalIcon />
            </span>
            <strong>QA</strong>
          </button>
        </div>

        <aside className='df-review-qa-panel' aria-hidden={!isListVisible}>
          <div className='df-review-panel-body'>
            <section className='df-review-item-list'>
              <div className='df-review-list-header'>
                <span>Current page QA</span>
                <strong>{activeItems.length}</strong>
              </div>
              <div className='df-review-list-scroll'>
                {activeItems.length === 0 && (
                  <p className='df-review-empty'>No open QA on this page.</p>
                )}
                {numberedActiveItems.map((numberedItem) => {
                  const { item } = numberedItem;

                  return (
                    <article
                      key={item.id}
                      className={`df-review-item-card${
                        item.id === selectedItemId ? ' is-active' : ''
                      }`}
                    >
                      <button
                        className='df-review-item-main'
                        type='button'
                        onClick={() => restoreReviewItem(item)}
                        >
                          <span className='df-review-item-badges'>
                          <span
                            className={`df-review-item-viewport is-scope-${numberedItem.scope}`}
                          >
                            <ReviewScopeIcon scope={numberedItem.scope} />
                            {numberedItem.displayLabel}
                          </span>
                          <span className='df-review-item-kind'>
                            {item.kind}
                          </span>
                        </span>
                        <strong>{getItemTitle(item)}</strong>
                        <small>{formatDate(item.createdAt)}</small>
                        <small>{formatItemMeta(item)}</small>
                        {item.screenshot && (
                          <img src={item.screenshot.dataUrl} alt='' />
                        )}
                      </button>
                      <div className='df-review-item-actions'>
                        <button
                          type='button'
                          onClick={() => void resolveItem(item)}
                        >
                          ok
                        </button>
                        <button
                          type='button'
                          onClick={() => void removeItem(item)}
                        >
                          del
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </aside>

        <main className='df-review-stage'>
          <div className='df-review-frame'>
            <div className='df-review-frame-toolbar'>
              <div className='df-review-frame-meta'>
                <ViewportPresetIcon preset={size} />
                <div>
                  <strong>{size.label}</strong>
                  <span>
                    {size.width}x{size.height}
                  </span>
                </div>
              </div>
              <div className='df-review-overlays' aria-label='Target overlays'>
                <button
                  aria-label='Toggle grid overlay'
                  className={`df-review-overlay-button is-grid${
                    targetOverlayState.grid ? ' is-active' : ''
                  }`}
                  data-tooltip='Grid'
                  type='button'
                  onClick={() => toggleTargetOverlay('grid')}
                >
                  <LayoutGridIcon aria-hidden='true' />
                </button>
                <button
                  aria-disabled={!isFigmaOverlayAvailable}
                  aria-label={
                    isFigmaOverlayAvailable
                      ? 'Toggle Figma overlay'
                      : FIGMA_OVERLAY_UNAVAILABLE_MESSAGE
                  }
                  className={`df-review-overlay-button is-figma${
                    targetOverlayState.figma ? ' is-active' : ''
                  }${isFigmaOverlayAvailable ? '' : ' is-disabled'}`}
                  data-tooltip={
                    isFigmaOverlayAvailable
                      ? 'Figma'
                      : FIGMA_OVERLAY_UNAVAILABLE_MESSAGE
                  }
                  type='button'
                  onClick={() => toggleTargetOverlay('figma')}
                >
                  <ImageIcon aria-hidden='true' />
                </button>
              </div>
            </div>
            <div className='df-review-frame-scroll'>
              <div
                className='df-review-device'
                style={{
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                  minWidth: `${size.width}px`,
                  minHeight: `${size.height}px`,
                }}
              >
                <iframe
                  key={targetSrc}
                  ref={iframeRef}
                  width={size.width}
                  height={size.height}
                  src={targetSrc}
                  title='Review target'
                  onLoad={initReviewKit}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export const mountReviewShell = (options: ReviewShellMountOptions) => {
  if (typeof document === 'undefined' || !document.head) return;

  const { rootId = 'root', ...shellProps } = options;

  if (!document.getElementById(REVIEW_SHELL_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = REVIEW_SHELL_STYLE_ID;
    style.textContent = `
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
  }

	  body {
	    overflow: hidden;
	    --df-review-bg: #0f1218;
	    --df-review-topbar: #171c24;
	    --df-review-panel: #131821;
	    --df-review-panel-strong: #1b2430;
	    --df-review-control: #202938;
	    --df-review-control-hover: #273345;
	    --df-review-line: rgba(226, 233, 245, 0.14);
	    --df-review-line-soft: rgba(226, 233, 245, 0.08);
	    --df-review-text: #edf3fb;
	    --df-review-muted: rgba(237, 243, 251, 0.58);
	    --df-review-subtle: rgba(237, 243, 251, 0.42);
	    --df-review-accent: #7cc7ff;
	    --df-review-accent-soft: rgba(124, 199, 255, 0.12);
	    --df-review-accent-hover: rgba(124, 199, 255, 0.2);
	    --df-review-note: #f3b75f;
	    --df-review-note-soft: rgba(243, 183, 95, 0.14);
	    --df-review-capture: #63d7c7;
	    --df-review-capture-soft: rgba(99, 215, 199, 0.14);
	    background: var(--df-review-bg);
	    color: var(--df-review-text);
	    font-family:
	      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
	      "Segoe UI", sans-serif;
	  }

  button,
  input {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  .df-review-shell {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: 100%;
    height: 100%;
  }

	  .df-review-topbar {
	    display: grid;
	    gap: 10px;
	    padding: 12px 16px;
	    border-bottom: 1px solid var(--df-review-line);
	    background: var(--df-review-topbar);
	  }

	  .df-review-address {
	    display: grid;
	    grid-template-columns: auto minmax(0, 1fr) auto auto;
	    gap: 8px;
	  }

  .df-review-address input {
	    width: 100%;
	    min-height: 34px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 6px;
	    padding: 0 10px;
	    color: var(--df-review-text);
	    background: var(--df-review-bg);
	    font-size: 13px;
	  }

	  .df-review-address input:focus {
	    outline: 2px solid rgba(124, 199, 255, 0.58);
	    outline-offset: 1px;
	  }

	  .df-review-address button,
	  .df-review-side-toggle,
	  .df-review-presets button,
		  .df-review-overlay-button,
		  .df-review-mode-button,
		  .df-review-item-actions button {
		    min-height: 34px;
		    border: 1px solid var(--df-review-line);
		    border-radius: 6px;
		    background: var(--df-review-control);
	    color: var(--df-review-text);
	    font-size: 12px;
	    font-weight: 700;
	  }

		  .df-review-address button:hover,
	  .df-review-side-toggle:hover,
	  .df-review-presets button:hover,
	  .df-review-overlay-button:hover,
	  .df-review-mode-button:hover,
		  .df-review-item-actions button:hover,
		  .df-review-presets button.is-active,
		  .df-review-overlay-button.is-active,
		  .df-review-mode-button.is-active {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-control-hover);
		  }

	  .df-review-sitemap-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: 38px;
	    min-width: 38px;
	    padding: 0;
	    color: var(--df-review-accent);
	  }

  .df-review-sitemap-button svg,
  .df-review-sitemap-header button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .df-review-sitemap-button::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 0;
    bottom: -30px;
    z-index: 5;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-2px);
	    border: 1px solid var(--df-review-line);
	    border-radius: 5px;
	    padding: 4px 7px;
	    background: #0a0d12;
	    color: var(--df-review-text);
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    transition:
      opacity 120ms ease,
      transform 120ms ease;
  }

  .df-review-sitemap-button:hover::after,
  .df-review-sitemap-button:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
  }

  .df-review-sitemap-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
    padding: 24px;
  }

	  .df-review-sitemap-backdrop {
	    position: absolute;
	    inset: 0;
	    min-height: 0;
	    border: 0;
	    border-radius: 0;
	    padding: 0;
	    background: rgba(2, 6, 12, 0.62);
	  }

  .df-review-sitemap-dialog {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
	    width: min(760px, calc(100vw - 48px));
	    max-height: min(720px, calc(100vh - 48px));
	    overflow: hidden;
	    border: 1px solid var(--df-review-line);
	    border-radius: 8px;
	    background: var(--df-review-panel);
	    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
	  }

  .df-review-sitemap-header {
    display: flex;
    align-items: center;
	    justify-content: space-between;
	    gap: 12px;
	    min-height: 54px;
	    padding: 0 14px 0 16px;
	    border-bottom: 1px solid var(--df-review-line);
	  }

  .df-review-sitemap-header div {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
  }

  .df-review-sitemap-header strong {
    font-size: 14px;
  }

	  .df-review-sitemap-header span {
	    color: var(--df-review-muted);
	    font-size: 12px;
	    font-weight: 700;
	  }

  .df-review-sitemap-header button {
    display: grid;
    place-items: center;
	    width: 34px;
	    min-width: 34px;
	    min-height: 34px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 6px;
	    background: var(--df-review-control);
	    color: var(--df-review-text);
	    font-size: 13px;
	    font-weight: 800;
	  }

	  .df-review-sitemap-header button:hover {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-control-hover);
	  }

  .df-review-sitemap-list {
    display: grid;
    align-content: start;
    min-height: 0;
    overflow: auto;
    padding: 8px;
  }

  .df-review-sitemap-list button {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-height: 40px;
	    border: 0;
	    border-radius: 6px;
	    padding: 8px 10px;
	    background: transparent;
	    color: var(--df-review-text);
	    text-align: left;
	  }

	  .df-review-sitemap-list button:hover,
	  .df-review-sitemap-list button.is-active {
	    background: var(--df-review-accent-soft);
	  }

	  .df-review-sitemap-path {
	    min-width: 0;
	    overflow-wrap: anywhere;
	    color: rgba(237, 243, 251, 0.78);
	    font-size: 13px;
	    font-weight: 800;
	    line-height: 1.35;
  }

  .df-review-sitemap-count {
    display: inline-grid;
	    place-items: center;
	    min-width: 26px;
	    height: 24px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 999px;
	    padding: 0 8px;
	    background: rgba(237, 243, 251, 0.06);
	    color: var(--df-review-muted);
	    font-size: 12px;
	    font-weight: 900;
	  }

	  .df-review-sitemap-list button:hover .df-review-sitemap-path,
	  .df-review-sitemap-list button.is-active .df-review-sitemap-path {
	    color: var(--df-review-text);
	  }

	  .df-review-sitemap-list button:hover .df-review-sitemap-count,
	  .df-review-sitemap-list button.is-active .df-review-sitemap-count {
	    border-color: rgba(124, 199, 255, 0.72);
	    background: var(--df-review-accent-hover);
	    color: var(--df-review-accent);
	  }

  .df-review-tools {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-presets,
  .df-review-mode {
    display: flex;
    gap: 6px;
  }

  .df-review-mode {
    margin-left: auto;
  }

  .df-review-presets button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 11px 0 9px;
  }

  .df-review-presets button svg,
  .df-review-frame-meta svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
  }

  .df-review-preset-copy {
    display: grid;
    gap: 1px;
    min-width: 0;
    text-align: left;
    line-height: 1.05;
  }

  .df-review-preset-copy strong {
    color: var(--df-review-text);
    font-size: 12px;
  }

	  .df-review-preset-copy span {
	    color: var(--df-review-muted);
	    font-size: 11px;
	  }

  .df-review-overlay-button,
  .df-review-mode-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: 38px;
	    min-width: 38px;
	    padding: 0;
	    color: rgba(237, 243, 251, 0.86);
	  }

  .df-review-overlay-button svg,
  .df-review-mode-button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
	  }

	  .df-review-overlay-button.is-grid {
	    border-color: rgba(124, 199, 255, 0.46);
	    background: var(--df-review-accent-soft);
	    color: var(--df-review-accent);
	  }

	  .df-review-overlay-button.is-grid:hover,
	  .df-review-overlay-button.is-grid.is-active {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-accent-hover);
	    color: #c7e7ff;
	  }

	  .df-review-overlay-button.is-figma {
	    border-color: rgba(255, 143, 97, 0.46);
	    background: rgba(255, 143, 97, 0.14);
	    color: #ffab83;
	  }

	  .df-review-overlay-button.is-figma:hover,
	  .df-review-overlay-button.is-figma.is-active {
	    border-color: #ff8f61;
	    background: rgba(255, 143, 97, 0.24);
	    color: #ffd1bf;
	  }

	  .df-review-overlay-button.is-disabled,
	  .df-review-overlay-button.is-disabled:hover {
	    cursor: not-allowed;
	    border-color: var(--df-review-line);
	    background: rgba(237, 243, 251, 0.04);
	    color: var(--df-review-subtle);
	  }

	  .df-review-mode-button.is-note {
	    border-color: rgba(243, 183, 95, 0.46);
	    background: var(--df-review-note-soft);
	    color: var(--df-review-note);
	  }

	  .df-review-mode-button.is-note:hover,
	  .df-review-mode-button.is-note.is-active {
	    border-color: var(--df-review-note);
	    background: rgba(243, 183, 95, 0.24);
	    color: #ffd99a;
	  }

	  .df-review-mode-button.is-capture {
	    border-color: rgba(99, 215, 199, 0.46);
	    background: var(--df-review-capture-soft);
	    color: var(--df-review-capture);
	  }

	  .df-review-mode-button.is-capture:hover,
	  .df-review-mode-button.is-capture.is-active {
	    border-color: var(--df-review-capture);
	    background: rgba(99, 215, 199, 0.24);
	    color: #bdf4ed;
	  }

  .df-review-overlay-button::after,
  .df-review-mode-button::after {
    content: attr(data-tooltip);
    position: absolute;
    right: 0;
    bottom: -30px;
    z-index: 4;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-2px);
	    border: 1px solid var(--df-review-line);
	    border-radius: 5px;
	    padding: 4px 7px;
	    background: #0a0d12;
	    color: var(--df-review-text);
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    transition:
      opacity 120ms ease,
      transform 120ms ease;
  }

  .df-review-overlay-button:hover::after,
  .df-review-overlay-button:focus-visible::after,
  .df-review-mode-button:hover::after,
  .df-review-mode-button:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
  }

		  .df-review-workspace {
		    position: relative;
		    display: grid;
		    grid-template-columns: minmax(0, 1fr) 0 32px;
		    min-height: 0;
		    overflow: hidden;
		    transition: grid-template-columns 160ms ease;
		  }

	  .df-review-workspace.is-list-visible {
	    grid-template-columns: minmax(0, 1fr) clamp(320px, 28vw, 420px) 32px;
	  }

	  .df-review-side-rail {
	    grid-column: 3;
	    grid-row: 1;
	    display: flex;
	    align-items: stretch;
	    justify-content: center;
	    min-width: 0;
	    min-height: 0;
	    border-left: 1px solid var(--df-review-line);
	    background: #111722;
	  }

  .df-review-side-toggle {
    display: grid;
    grid-template-rows: 28px auto;
    align-items: start;
    justify-items: center;
    gap: 8px;
    width: 100%;
    min-height: 100%;
    border: 0;
	    border-radius: 0;
	    padding: 10px 0;
	    background: transparent;
	    color: var(--df-review-muted);
	  }

	  .df-review-side-toggle:hover {
	    background: var(--df-review-accent-soft);
	    color: var(--df-review-text);
	  }

  .df-review-side-toggle span {
    display: grid;
    place-items: center;
	    width: 20px;
	    height: 24px;
	    line-height: 1;
	  }

	  .df-review-side-toggle svg {
	    width: 18px;
	    height: 18px;
	    fill: none;
	    stroke: currentColor;
	    stroke-linecap: round;
	    stroke-width: 2;
	  }

  .df-review-side-toggle strong {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: inherit;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.08em;
  }

	  .df-review-qa-panel {
	    grid-column: 2;
	    grid-row: 1;
	    display: grid;
	    grid-template-rows: minmax(0, 1fr);
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	    border-left: 1px solid var(--df-review-line);
	    background: var(--df-review-panel);
	  }

	  .df-review-workspace:not(.is-list-visible) .df-review-qa-panel {
	    visibility: hidden;
	    border-left: 0;
	  }

	  .df-review-panel-body {
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-item-list {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }

	  .df-review-list-header {
	    display: flex;
	    align-items: center;
	    justify-content: space-between;
	    gap: 8px;
	    min-height: 42px;
	    padding: 0 12px;
	    border-bottom: 1px solid var(--df-review-line-soft);
	    color: rgba(237, 243, 251, 0.76);
	    font-size: 12px;
	    font-weight: 800;
	  }

  .df-review-list-header span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

		  .df-review-list-header strong {
		    color: var(--df-review-muted);
		    font-size: 11px;
		  }

  .df-review-list-scroll {
    min-height: 0;
    overflow: auto;
  }

	  .df-review-empty {
	    margin: 0;
	    padding: 14px 12px;
	    color: var(--df-review-subtle);
	    font-size: 12px;
	    line-height: 1.45;
	  }

  .df-review-item-card {
	    display: grid;
	    grid-template-columns: minmax(0, 1fr) auto;
	    gap: 8px;
	    padding: 10px 10px 10px 12px;
	    border-bottom: 1px solid var(--df-review-line-soft);
	  }

	  .df-review-item-card.is-active {
	    background: var(--df-review-accent-soft);
	  }

  .df-review-item-main {
    display: grid;
    gap: 4px;
    min-width: 0;
	    border: 0;
	    padding: 0;
	    text-align: left;
	    background: transparent;
	    color: var(--df-review-text);
	  }

  .df-review-item-main strong {
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 1.35;
  }

	  .df-review-item-main small {
	    color: var(--df-review-subtle);
	    font-size: 11px;
	  }

  .df-review-item-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-item-viewport,
	  .df-review-item-kind {
    --df-review-scope: var(--df-review-accent);
    --df-review-scope-rgb: 124, 199, 255;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 20px;
    border: 1px solid var(--df-review-line);
    border-radius: 999px;
    padding: 0 7px;
    font-size: 10px;
    font-weight: 900;
    line-height: 1;
    text-transform: uppercase;
  }

  .df-review-item-viewport.is-scope-tablet {
    --df-review-scope: var(--df-review-capture);
    --df-review-scope-rgb: 99, 215, 199;
  }

  .df-review-item-viewport.is-scope-desktop {
    --df-review-scope: var(--df-review-note);
    --df-review-scope-rgb: 243, 183, 95;
  }

  .df-review-item-viewport.is-scope-wide {
    --df-review-scope: #c99cff;
    --df-review-scope-rgb: 201, 156, 255;
  }

  .df-review-item-viewport.is-scope-dom {
    --df-review-scope: #ff8f61;
    --df-review-scope-rgb: 255, 143, 97;
  }

  .df-review-item-viewport {
    border-color: rgba(var(--df-review-scope-rgb), 0.36);
    background: rgba(var(--df-review-scope-rgb), 0.12);
    color: var(--df-review-scope);
  }

  .df-review-item-viewport svg {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

	  .df-review-item-kind {
	    color: var(--df-review-muted);
    background: rgba(237, 243, 251, 0.05);
  }

	  .df-review-item-main img {
	    width: 100%;
	    max-height: 110px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 6px;
	    object-fit: cover;
	    background: #111;
  }

  .df-review-item-actions {
    display: grid;
    align-content: start;
    gap: 6px;
  }

  .df-review-item-actions button {
    min-width: 34px;
    min-height: 28px;
    padding: 0 7px;
    font-size: 10px;
    text-transform: uppercase;
  }

	  .df-review-stage {
	    grid-column: 1;
	    grid-row: 1;
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-frame {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }

  .df-review-frame-toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 48px;
    padding: 8px 40px;
    border-bottom: 1px solid var(--df-review-line-soft);
    background: rgba(15, 18, 24, 0.86);
  }

  .df-review-frame-meta {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    border: 1px solid var(--df-review-line);
    border-radius: 6px;
    padding: 0 10px;
    background: var(--df-review-control);
    color: var(--df-review-text);
  }

  .df-review-frame-meta div {
    display: grid;
    gap: 1px;
    line-height: 1.05;
  }

  .df-review-frame-meta strong {
    font-size: 12px;
  }

  .df-review-frame-meta span {
    color: var(--df-review-muted);
    font-size: 11px;
    font-weight: 800;
  }

  .df-review-overlays {
    display: flex;
    gap: 6px;
  }

  .df-review-frame-scroll {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    padding: 28px 40px;
  }

  .df-review-device {
	    box-sizing: border-box;
	    flex: 0 0 auto;
	    position: relative;
	    margin: 0;
	    overflow: hidden;
	    border: 1px solid rgba(226, 233, 245, 0.22);
	    border-radius: 8px;
	    background: #fff;
	    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);
  }

  .df-review-device iframe {
    display: block;
    width: inherit;
    height: inherit;
    min-width: inherit;
    min-height: inherit;
    border: 0;
    background: #fff;
  }

	  @media (max-width: 860px) {
	    .df-review-workspace,
	    .df-review-workspace.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) 0 32px;
	      grid-template-rows: minmax(0, 1fr);
	    }

	    .df-review-workspace.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) minmax(260px, 70vw) 32px;
	    }

	    .df-review-qa-panel {
	      border-left: 1px solid var(--df-review-line);
	      border-bottom: 0;
	    }

    .df-review-frame-toolbar {
      justify-content: flex-start;
      padding: 8px 20px;
    }

    .df-review-frame-scroll {
      justify-content: flex-start;
      padding: 20px;
    }

    .df-review-panel-body {
      min-height: 0;
    }
  }
    `;
    document.head.append(style);
  }

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
