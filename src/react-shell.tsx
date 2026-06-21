import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Copy as CopyIcon,
  ExternalLink as ExternalLinkIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  GripVertical as GripVerticalIcon,
  Image as ImageIcon,
  LayoutGrid as LayoutGridIcon,
  ListFilter as ListFilterIcon,
  Map as MapIcon,
  Maximize2 as Maximize2Icon,
  Monitor as MonitorIcon,
  RectangleHorizontal as TabletIcon,
  RefreshCw as RefreshCwIcon,
  Ruler as RulerIcon,
  Scan as ScanIcon,
  Settings as SettingsIcon,
  Smartphone as SmartphoneIcon,
  SquareMousePointer as SquareMousePointerIcon,
  StickyNote as StickyNoteIcon,
  Upload as UploadIcon,
  Users as UsersIcon,
  X as XIcon
} from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { normalizeReviewShellAdapters } from './react-shell/adapters';
import { ensureReviewShellStyle } from './react-shell/style';
import {
  createWebReviewKit,
  getNumberedReviewItems,
  normalizeReviewItemStatus,
  type NumberedReviewItem,
  type ReviewItemScope,
  type ReviewSource,
  type ReviewItem,
  type ReviewItemStatus,
  type ReviewMode,
  type WebReviewKitController
} from './index';

import type {
  ReviewPromptTab,
  ReviewPresenceSession,
  ReviewPresenceState,
  ReviewPresenceStatus,
  ReviewPresenceUser,
  ReviewQaFilter,
  ReviewRulerPoint,
  ReviewShellMountOptions,
  ReviewShellProps,
  ReviewShellStatusOption,
  ReviewShellTheme,
  ReviewShellViewportKind,
  ReviewShellViewportPreset,
  ReviewShellWriteMode,
  TargetOverlayKey,
  TargetOverlayState,
} from './react-shell/types';
import {
  getReviewPresenceColor,
  getReviewPresenceDisplayName,
  getReviewPresenceSessionId,
} from './react-shell/presence';
import {
  DEFAULT_INITIAL_REVIEW_PROMPT,
  DEFAULT_REVIEW_THEME,
  FIGMA_OVERLAY_UNAVAILABLE_MESSAGE,
  FIGMA_TOKEN_STORAGE_KEY,
  FIGMA_TOKEN_GUIDE_ID,
  REVIEW_QA_FILTERS,
  REVIEW_THEME_STORAGE_KEY,
  REVIEW_THEME_OPTIONS,
  REVIEW_USER_ID_STORAGE_KEY,
} from './react-shell/constants';
import {
  DEFAULT_REVIEW_PATH_PREFIX,
  buildTargetSrc,
  getFrameRouteTarget,
  getInitialItemId,
  getInitialSource,
  getInitialTarget,
  getItemTarget,
  normalizeTarget,
  updateShellUrl,
  updateShellUrlForItem,
} from './react-shell/route';
import {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
  findViewportPreset,
  getInitialSize,
  getIsFigmaOverlayAvailable,
  getRestoredSize,
  getViewportPresetKind,
  toReviewViewportPresets,
} from './react-shell/viewport';
import {
  getReviewItemRestoreScrollPosition,
  isAnchorRestorableReviewItem,
  queryReviewItemAnchorElement,
  setDocumentScrollInstantly,
} from './react-shell/anchor-restore';
import {
  getTargetOverlayState,
  isEditableEventTarget,
  setTargetScrollbarHidden,
} from './react-shell/target';
import { getRulerMeasure, getRulerPointFromRect } from './react-shell/ruler';
import {
  getStoredFigmaToken,
  getStoredReviewTheme,
  getStoredReviewUserId,
  getSystemReviewTheme,
  normalizeReviewTheme,
  writeStoredFigmaToken,
  writeStoredReviewTheme,
  writeStoredReviewUserId,
} from './react-shell/settings';
import {
  buildReviewItemPrompt,
  formatDate,
  getItemTitle,
  getPromptLengthLabel,
} from './react-shell/prompt';
import {
  PromptModal,
  ReviewSettingsModal,
  SitemapModal,
} from './react-shell/shell-modals';
import { ReviewTopbar } from './react-shell/topbar';

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
} from './react-shell/presence';
export type { LocalPresenceAdapterOptions } from './react-shell/presence';
export { createSupabasePresenceAdapter } from './react-shell/supabase-presence';
export type {
  SupabasePresenceAdapterOptions,
  SupabasePresenceClient,
} from './react-shell/supabase-presence';

const ReviewScopeIcon = ({ scope }: { scope: ReviewItemScope }) => {
  if (scope === 'mobile') return <SmartphoneIcon aria-hidden="true" />;
  if (scope === 'tablet') return <TabletIcon aria-hidden="true" />;
  if (scope === 'wide') return <Maximize2Icon aria-hidden="true" />;
  if (scope === 'dom') return <SquareMousePointerIcon aria-hidden="true" />;
  return <MonitorIcon aria-hidden="true" />;
};

const isDomReviewItem = (item: ReviewItem) =>
  isAnchorRestorableReviewItem(item);

const getReviewItemMode = (item: ReviewItem) =>
  isDomReviewItem(item) ? 'dom' : item.kind;

const getReviewModeWriteMode = (
  mode: ReviewMode
): ReviewShellWriteMode | null => {
  if (mode === 'element') return 'dom';
  if (mode === 'note' || mode === 'area') return mode;
  return null;
};

type SitemapItemsBySource = {
  local: ReviewItem[];
  remote: ReviewItem[];
};

type SitemapQaCount = {
  local: number;
  remote: number;
};

const createEmptySitemapQaCount = (): SitemapQaCount => ({
  local: 0,
  remote: 0,
});

const getStatusOption = (
  status: ReviewItemStatus,
  statusOptions: readonly ReviewShellStatusOption[]
) => {
  const normalizedStatus = normalizeReviewItemStatus(status);
  return (
    statusOptions.find((statusOption) => statusOption.value === status) ??
    statusOptions.find(
      (statusOption) => statusOption.value === normalizedStatus
    ) ??
    statusOptions[0]
  );
};

const ReviewItemModeIcon = ({
  mode
}: {
  mode: ReturnType<typeof getReviewItemMode>;
}) => {
  if (mode === 'area') return <ScanIcon aria-hidden="true" />;
  if (mode === 'dom') return <SquareMousePointerIcon aria-hidden="true" />;
  return <StickyNoteIcon aria-hidden="true" />;
};

const getPresenceUserTarget = (
  user: ReviewPresenceUser,
  reviewPathPrefix: string
) => normalizeTarget(user.target || user.routeKey, reviewPathPrefix);

const dedupePresenceUsersByPageAndId = (
  users: ReviewPresenceUser[],
  reviewPathPrefix: string
) => {
  const userByPageAndId = new Map<string, ReviewPresenceUser>();

  users.forEach((user) => {
    const userId = user.userId.trim();
    if (!userId) return;

    const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
    const key = `${userTarget}::${userId}`;
    const currentUser = userByPageAndId.get(key);

    if (
      !currentUser ||
      Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)
    ) {
      userByPageAndId.set(key, user);
    }
  });

  return Array.from(userByPageAndId.values());
};

function runWithAutoScrollBehavior(
  targetDocument: Document | undefined,
  callback: () => void
) {
  const elements = [
    targetDocument?.documentElement,
    targetDocument?.body,
  ].filter((element): element is HTMLElement => Boolean(element));
  const previousValues = elements.map((element) => element.style.scrollBehavior);

  elements.forEach((element) => {
    element.style.scrollBehavior = 'auto';
  });

  try {
    callback();
  } finally {
    elements.forEach((element, index) => {
      element.style.scrollBehavior = previousValues[index] ?? '';
    });
  }
}

export const ReviewShell = ({
  projectId,
  pages,
  adapters,
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ruler,
  initialPrompt = DEFAULT_INITIAL_REVIEW_PROMPT,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
  presence
}: ReviewShellProps) => {
  const viewportPresets =
    presets.length > 0 ? presets : DEFAULT_REVIEW_VIEWPORT_PRESETS;
  const reviewViewportPresets = useMemo(
    () => toReviewViewportPresets(viewportPresets),
    [viewportPresets]
  );
  const normalizedAdapters = useMemo(
    () => normalizeReviewShellAdapters(adapters),
    [adapters]
  );
  const localAdapterEntry = normalizedAdapters.local;
  const remoteAdapterEntry = normalizedAdapters.remote;
  const sourceEntries = normalizedAdapters.sources;
  const defaultSource = sourceEntries[0]?.label ?? 'local';
  const [source, setSource] = useState<ReviewSource>(() => {
    const initialSource = getInitialSource(remoteAdapterEntry?.label);
    return sourceEntries.some((entry) => entry.label === initialSource)
      ? initialSource
      : defaultSource;
  });
  const remoteSource = remoteAdapterEntry?.label ?? null;
  const activeAdapterEntry =
    sourceEntries.find((entry) => entry.label === source) ?? sourceEntries[0]!;
  const isRemoteSource = Boolean(
    remoteSource && activeAdapterEntry.label === remoteSource
  );
  const showSourceSelect = sourceEntries.length > 1;
  const canWriteDom = activeAdapterEntry.writeModes.includes('dom');
  const canWriteNote = activeAdapterEntry.writeModes.includes('note');
  const canWriteArea = activeAdapterEntry.writeModes.includes('area');
  const canWriteAny = canWriteDom || canWriteNote || canWriteArea;
  const adapter = activeAdapterEntry.adapter;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const frameScrollRef = useRef<HTMLDivElement | null>(null);
  const rulerOverlayRef = useRef<HTMLDivElement | null>(null);
  const rulerDragRectRef = useRef<DOMRect | null>(null);
  const isRulerDraggingRef = useRef(false);
  const controllerRef = useRef<WebReviewKitController | null>(null);
  const cleanupTargetRef = useRef<(() => void) | null>(null);
  const presenceSessionRef = useRef<ReviewPresenceSession | null>(null);
  const pendingRestoreRef = useRef<ReviewItem | null>(null);
  const pendingInitialItemIdRef = useRef(getInitialItemId());
  const selectedItemIdRef = useRef(getInitialItemId());
  const hiddenOverlayItemIdListRef = useRef<string[]>([]);
  const [target, setTarget] = useState(() =>
    getInitialTarget(reviewPathPrefix)
  );
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
      figma: false
    });
  const [selectedItemId, setSelectedItemId] = useState(getInitialItemId());
  const [hiddenOverlayItemIds, setHiddenOverlayItemIds] = useState<
    Set<string>
  >(() => new Set());
  const [isListVisible, setIsListVisible] = useState(true);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isFigmaSettingsOpen, setIsFigmaSettingsOpen] = useState(false);
  const [figmaTokenDraft, setFigmaTokenDraft] = useState(getStoredFigmaToken);
  const [reviewUserId, setReviewUserId] = useState(getStoredReviewUserId);
  const [reviewUserIdDraft, setReviewUserIdDraft] = useState(
    getStoredReviewUserId
  );
  const [reviewTheme, setReviewTheme] = useState(getStoredReviewTheme);
  const [reviewThemeDraft, setReviewThemeDraft] =
    useState(getStoredReviewTheme);
  const [systemReviewTheme, setSystemReviewTheme] =
    useState(getSystemReviewTheme);
  const [figmaSettingsStatus, setFigmaSettingsStatus] = useState('');
  const [isFigmaTokenVisible, setIsFigmaTokenVisible] = useState(false);
  const [isFigmaTokenGuideOpen, setIsFigmaTokenGuideOpen] = useState(false);
  const [isInitialPromptOpen, setIsInitialPromptOpen] = useState(false);
  const [qaFilter, setQaFilter] = useState<ReviewQaFilter>('all');
  const [copyLabel, setCopyLabel] = useState('Copy URL');
  const [sitemapItems, setSitemapItems] = useState<SitemapItemsBySource>(() => ({
    local: [],
    remote: [],
  }));
  const [isRulerVisible, setIsRulerVisible] = useState(false);
  const [rulerStart, setRulerStart] = useState<ReviewRulerPoint | null>(null);
  const [rulerPoint, setRulerPoint] = useState<ReviewRulerPoint | null>(null);
  const [rulerHover, setRulerHover] = useState<ReviewRulerPoint | null>(null);
  const [isRulerDragging, setIsRulerDragging] = useState(false);
  const [promptItemId, setPromptItemId] = useState<string | null>(null);
  const [promptTab, setPromptTab] = useState<ReviewPromptTab>('item');
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);
  const [presenceUsers, setPresenceUsers] = useState<ReviewPresenceUser[]>([]);
  const [presenceSessionVersion, setPresenceSessionVersion] = useState(0);
  const presenceSessionId = useMemo(getReviewPresenceSessionId, []);
  const targetRef = useRef(target);
  const sizeRef = useRef(size);

  const effectiveReviewTheme =
    reviewTheme === 'system' ? systemReviewTheme : reviewTheme;
  const isFigmaOverlayAvailable = getIsFigmaOverlayAvailable(size);
  const isRulerAvailable =
    ruler?.enabled !== false &&
    typeof size.designWidth === 'number' &&
    size.designWidth > 0;
  const rulerUnit = ruler?.unit ?? 'px';
  const rulerScaleX =
    isRulerAvailable && size.designWidth
      ? size.width / size.designWidth
      : 1;
  const rulerScaleY =
    size.designHeight && size.designHeight > 0
      ? size.height / size.designHeight
      : rulerScaleX;
  const rulerMeasure = useMemo(
    () => getRulerMeasure(rulerStart, rulerPoint),
    [rulerPoint, rulerStart]
  );
  const rulerMeasureLabel = useMemo(() => {
    if (!rulerMeasure) return '';

    const designWidth = Math.round(rulerMeasure.width / rulerScaleX);
    const designHeight = Math.round(rulerMeasure.height / rulerScaleY);

    return `Figma ${designWidth}x${designHeight}${rulerUnit}`;
  }, [rulerMeasure, rulerScaleX, rulerScaleY, rulerUnit]);
  const targetSrc = useMemo(() => buildTargetSrc(target), [target]);
  const pageTargets = useMemo(
    () =>
      new Set(
        pages.map((page) => normalizeTarget(page.href, reviewPathPrefix))
      ),
    [pages, reviewPathPrefix]
  );
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
  const filteredNumberedActiveItems = useMemo(
    () =>
      qaFilter === 'all'
        ? numberedActiveItems
        : numberedActiveItems.filter(
            (numberedItem) => numberedItem.scope === qaFilter
          ),
    [numberedActiveItems, qaFilter]
  );
  const hiddenOverlayItemIdList = useMemo(
    () => Array.from(hiddenOverlayItemIds),
    [hiddenOverlayItemIds]
  );
  const qaFilterCounts = useMemo(() => {
    const counts = new Map<ReviewQaFilter, number>();
    counts.set('all', numberedActiveItems.length);
    numberedActiveItems.forEach((numberedItem) => {
      counts.set(numberedItem.scope, (counts.get(numberedItem.scope) ?? 0) + 1);
    });
    return counts;
  }, [numberedActiveItems]);
  const getItemPresetScope = useCallback(
    (item: ReviewItem) =>
      getViewportPresetKind(
        findViewportPreset(
          viewportPresets,
          item.viewport?.width ?? 0,
          item.viewport?.height ?? 0
        )
      ),
    [viewportPresets]
  );
  const presetScopeCounts = useMemo(() => {
    const counts = new Map<ReviewShellViewportKind, number>();
    activeItems.forEach((item) => {
      const scope = getItemPresetScope(item);
      counts.set(scope, (counts.get(scope) ?? 0) + 1);
    });
    return counts;
  }, [activeItems, getItemPresetScope]);
  const currentPresetScope = getViewportPresetKind(size);
  const pageQaCounts = useMemo(() => {
    const counts = new Map<string, SitemapQaCount>();
    const addItems = (
      sourceKey: keyof SitemapItemsBySource,
      sourceItems: ReviewItem[]
    ) => {
      sourceItems.forEach((item) => {
        const pageTarget = normalizeTarget(
          getItemTarget(item, reviewPathPrefix),
          reviewPathPrefix
        );
        const count = counts.get(pageTarget) ?? createEmptySitemapQaCount();
        count[sourceKey] += 1;
        counts.set(pageTarget, count);
      });
    };

    addItems('local', sitemapItems.local);
    addItems('remote', sitemapItems.remote);

    return counts;
  }, [reviewPathPrefix, sitemapItems]);
  const promptDialogNumberedItem = useMemo(
    () =>
      promptItemId
        ? numberedActiveItems.find(
            (numberedItem) => numberedItem.item.id === promptItemId
          )
        : undefined,
    [numberedActiveItems, promptItemId]
  );
  const selectedNumberedItem = useMemo(
    () =>
      selectedItemId
        ? numberedActiveItems.find(
            (numberedItem) => numberedItem.item.id === selectedItemId
          )
        : undefined,
    [numberedActiveItems, selectedItemId]
  );
  const initialPromptText = initialPrompt.trim();
  const promptDialogItemPrompt = promptDialogNumberedItem
    ? buildReviewItemPrompt(promptDialogNumberedItem, reviewPathPrefix)
    : '';
  const promptDialogItemCopyKey = promptDialogNumberedItem
    ? `dialog:${promptDialogNumberedItem.item.id}`
    : 'dialog:item';
  const isPromptDialogInitial = promptTab === 'initial' || !promptDialogNumberedItem;
  const promptDialogActiveText = isPromptDialogInitial
    ? initialPromptText
    : promptDialogItemPrompt;
  const promptDialogActiveLabel = isPromptDialogInitial
    ? 'Initial prompt'
    : 'This QA prompt';
  const promptDialogActiveCopyKey = isPromptDialogInitial
    ? 'initial'
    : promptDialogItemCopyKey;
  const normalizedReviewUserId = reviewUserId.trim();
  const presenceDisplayName = getReviewPresenceDisplayName(
    normalizedReviewUserId
  );
  const presenceColor = getReviewPresenceColor(
    normalizedReviewUserId || presenceSessionId
  );
  const presenceViewport = useMemo(
    () => ({
      label: size.label,
      width: size.width,
      height: size.height,
      kind: getViewportPresetKind(size),
    }),
    [size]
  );
  const presenceStatus: ReviewPresenceStatus =
    mode === 'idle' ? 'reviewing' : 'editing';
  const visiblePresenceUsers = useMemo(
    () => {
      const projectPresenceUsers = presenceUsers.filter(
        (user) => user.projectId === projectId && user.userId.trim()
      );

      return dedupePresenceUsersByPageAndId(
        projectPresenceUsers,
        reviewPathPrefix
      );
    },
    [presenceUsers, projectId, reviewPathPrefix]
  );
  const currentPagePresenceUsers = useMemo(
    () =>
      visiblePresenceUsers.filter((user) => {
        const userTarget = getPresenceUserTarget(user, reviewPathPrefix);

        return userTarget === activeRoute;
      }),
    [activeRoute, reviewPathPrefix, visiblePresenceUsers]
  );
  const pagePresenceUsers = useMemo(() => {
    const usersByTarget = new Map<string, ReviewPresenceUser[]>();

    visiblePresenceUsers.forEach((user) => {
      const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
      const pageUsers = usersByTarget.get(userTarget) ?? [];

      pageUsers.push(user);
      usersByTarget.set(userTarget, pageUsers);
    });

    return usersByTarget;
  }, [reviewPathPrefix, visiblePresenceUsers]);

  const getCurrentPresenceState = useCallback(
    (): ReviewPresenceState => ({
      projectId,
      sessionId: presenceSessionId,
      userId: normalizedReviewUserId,
      displayName: presenceDisplayName,
      color: presenceColor,
      routeKey: activeRoute,
      target: activeRoute,
      source,
      viewport: presenceViewport,
      mode,
      selectedItemId: selectedNumberedItem?.item.id ?? null,
      selectedReviewNumber: selectedNumberedItem?.number ?? null,
      status: presenceStatus,
      updatedAt: new Date().toISOString(),
    }),
    [
      activeRoute,
      mode,
      normalizedReviewUserId,
      presenceColor,
      presenceDisplayName,
      presenceSessionId,
      presenceStatus,
      presenceViewport,
      projectId,
      selectedNumberedItem,
      source,
    ]
  );

  const refreshItems = useCallback(async () => {
    const nextItems = await adapter.list({
      projectId,
      pageId: activeAdapterEntry.pageId,
      routeKey: isRemoteSource ? activeRoute : undefined
    });
    setItems(nextItems);
    return nextItems;
  }, [activeAdapterEntry.pageId, activeRoute, adapter, isRemoteSource, projectId]);

  const refreshSitemapItems = useCallback(async () => {
    const [localResult, remoteResult] = await Promise.allSettled([
      localAdapterEntry
        ? localAdapterEntry.adapter.list({
            projectId,
            pageId: localAdapterEntry.pageId,
          })
        : Promise.resolve([]),
      remoteAdapterEntry
        ? remoteAdapterEntry.adapter.list({
            projectId,
            pageId: remoteAdapterEntry.pageId,
            source: remoteAdapterEntry.label,
          })
        : Promise.resolve([]),
    ]);

    setSitemapItems({
      local: localResult.status === 'fulfilled' ? localResult.value : [],
      remote: remoteResult.status === 'fulfilled' ? remoteResult.value : [],
    });
  }, [localAdapterEntry, projectId, remoteAdapterEntry]);

  const refreshReviewData = useCallback(async () => {
    await controllerRef.current?.reload();
    await Promise.all([refreshItems(), refreshSitemapItems()]);
  }, [refreshItems, refreshSitemapItems]);

  const clearSelectedItem = useCallback(() => {
    pendingRestoreRef.current = null;
    selectedItemIdRef.current = null;
    setSelectedItemId(null);
    controllerRef.current?.highlightItem(undefined);
  }, []);

  const toggleItemOverlayVisibility = useCallback(
    (itemId: string) => {
      const nextHiddenItemIds = new Set(hiddenOverlayItemIds);
      if (nextHiddenItemIds.has(itemId)) {
        nextHiddenItemIds.delete(itemId);
      } else {
        nextHiddenItemIds.add(itemId);
      }

      const nextHiddenItemIdList = Array.from(nextHiddenItemIds);

      setHiddenOverlayItemIds(nextHiddenItemIds);
      const controller = controllerRef.current;
      controller?.setHiddenItemIds(nextHiddenItemIdList);
      hiddenOverlayItemIdListRef.current = nextHiddenItemIdList;
    },
    [hiddenOverlayItemIds]
  );

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
          shiftKey: true
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
      refreshTargetOverlayState
    ]
  );

  const closeTargetOverlay = useCallback(
    (overlay: TargetOverlayKey) => {
      const currentState = getTargetOverlayState(
        iframeRef.current?.contentDocument ?? undefined
      );
      setTargetOverlayState(currentState);
      if (!currentState[overlay]) return false;

      return dispatchTargetOverlayHotkey(overlay);
    },
    [dispatchTargetOverlayHotkey]
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
          selectedItemIdRef.current,
          source
        );
      } else {
        updateShellUrl(normalizedTarget, sizeRef.current, source);
      }
    },
    [clearSelectedItem, reviewPathPrefix, source]
  );

  const applyItemScroll = useCallback(
    (item: ReviewItem) => {
      if (selectedItemIdRef.current !== item.id) return;

      const targetWindow = iframeRef.current?.contentWindow;
      const targetDocument = iframeRef.current?.contentDocument;
      if (!targetWindow) return;

      const anchorElement = targetDocument
        ? queryReviewItemAnchorElement(targetDocument, item)
        : undefined;

      runWithAutoScrollBehavior(targetDocument ?? undefined, () => {
        if (!targetDocument) return;

        setDocumentScrollInstantly(
          targetWindow,
          targetDocument,
          getReviewItemRestoreScrollPosition(
            targetWindow,
            targetDocument,
            item,
            anchorElement
          )
        );
      });
      syncTargetViewport();
      controllerRef.current?.highlightItem(item.id);
    },
    [syncTargetViewport]
  );

  const applyPendingRestore = useCallback(() => {
    const item = pendingRestoreRef.current;
    if (!item) return;

    applyItemScroll(item);
    pendingRestoreRef.current = null;
  }, [applyItemScroll]);

  const cancelReviewMode = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || controller.getMode() === 'idle') return false;

    controller.setMode('idle');
    setMode(controller.getMode());
    return true;
  }, []);

  const clearRulerMeasure = useCallback(() => {
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setRulerStart(null);
    setRulerPoint(null);
    setRulerHover(null);
    setIsRulerDragging(false);
  }, []);

  const closeRuler = useCallback(() => {
    if (!isRulerVisible) return false;

    setIsRulerVisible(false);
    clearRulerMeasure();
    return true;
  }, [clearRulerMeasure, isRulerVisible]);

  const toggleRuler = useCallback(() => {
    if (!isRulerAvailable) return;

    cancelReviewMode();
    setIsSitemapOpen(false);
    setIsFigmaSettingsOpen(false);
    setPromptItemId(null);
    clearRulerMeasure();
    setIsRulerVisible((current) => !current);
  }, [cancelReviewMode, clearRulerMeasure, isRulerAvailable]);

  const finishRulerDrag = useCallback((point?: ReviewRulerPoint) => {
    if (point) {
      setRulerPoint(point);
    }

    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setIsRulerDragging(false);
  }, []);

  const startRulerDrag = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const point = getRulerPointFromRect(clientX, clientY, rect);

      rulerDragRectRef.current = rect;
      isRulerDraggingRef.current = true;

      setRulerStart(point);
      setRulerPoint(point);
      setIsRulerDragging(true);
    },
    []
  );

  const reloadTargetFrame = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      return;
    }
  }, []);

  const openFigmaSettings = useCallback(() => {
    cancelReviewMode();
    setIsSitemapOpen(false);
    setIsInitialPromptOpen(false);
    setPromptItemId(null);
    setFigmaTokenDraft(getStoredFigmaToken());
    setReviewUserIdDraft(getStoredReviewUserId());
    setReviewThemeDraft(reviewTheme);
    setFigmaSettingsStatus('');
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
    setIsFigmaSettingsOpen(true);
  }, [cancelReviewMode, reviewTheme]);

  const closeFigmaSettings = useCallback(() => {
    setIsFigmaSettingsOpen(false);
    setFigmaSettingsStatus('');
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
  }, []);

  const saveReviewSettings = useCallback(
    (token: string, userId: string, theme: ReviewShellTheme) => {
      const nextToken = token.trim();
      const nextUserId = userId.trim();
      const nextTheme = normalizeReviewTheme(theme);
      const shouldReload =
        nextToken !== getStoredFigmaToken() ||
        nextUserId !== getStoredReviewUserId();

      writeStoredFigmaToken(nextToken);
      writeStoredReviewUserId(nextUserId);
      writeStoredReviewTheme(nextTheme);
      setFigmaTokenDraft(nextToken);
      setReviewUserId(nextUserId);
      setReviewUserIdDraft(nextUserId);
      setReviewTheme(nextTheme);
      setReviewThemeDraft(nextTheme);
      setFigmaSettingsStatus(
        nextToken || nextUserId || nextTheme !== DEFAULT_REVIEW_THEME
          ? 'Saved'
          : 'Cleared'
      );

      if (shouldReload) {
        reloadTargetFrame();
      }
      closeFigmaSettings();
    },
    [closeFigmaSettings, reloadTargetFrame]
  );

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
      updateShellUrlForItem(nextTarget, nextSize, item.id, source);

      if (targetRef.current !== nextTarget) {
        setTarget(nextTarget);
        return;
      }

      applyPendingRestore();
    },
    [applyPendingRestore, viewportPresets, reviewPathPrefix, source]
  );

  const restoreInitialItem = useCallback(async () => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;

    pendingInitialItemIdRef.current = null;

    const item = await adapter.get(itemId);
    if (item) {
      restoreReviewItem(item);
    }
  }, [adapter, restoreReviewItem]);

  const initReviewKit = useCallback(() => {
    destroyReviewKit();

    const iframe = iframeRef.current;
    const targetWindow = iframe?.contentWindow;
    const targetDocument = iframe?.contentDocument;
    if (!iframe || !targetWindow || !targetDocument) return;

    const syncRouteFromFrame = () => {
      const nextTarget = getFrameRouteTarget(targetWindow, reviewPathPrefix);
      if (nextTarget !== targetRef.current && !pageTargets.has(nextTarget)) {
        return;
      }

      syncShellTarget(nextTarget);
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

    const handleFrameKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (!cancelReviewMode() && !closeRuler()) return;

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
    targetWindow.addEventListener('scroll', syncTargetViewport, true);
    targetWindow.addEventListener('resize', syncTargetViewport);
    cleanupTargetRef.current = () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      targetWindow.removeEventListener('popstate', syncRouteFromFrame);
      targetWindow.removeEventListener('hashchange', syncRouteFromFrame);
      targetWindow.removeEventListener('keydown', handleFrameKeyDown, true);
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
          getOverlayRect: () => {
            const frameRect = frame.getBoundingClientRect();
            const scrollRect = frameScrollRef.current?.getBoundingClientRect();
            if (!scrollRect) return frameRect;

            const left = Math.max(frameRect.left, scrollRect.left);
            const top = Math.max(frameRect.top, scrollRect.top);
            const right = Math.min(
              frameRect.left + frameRect.width,
              scrollRect.left + scrollRect.width
            );
            const bottom = Math.min(
              frameRect.top + frameRect.height,
              scrollRect.top + scrollRect.height
            );

            return {
              left,
              top,
              width: Math.max(0, right - left),
              height: Math.max(0, bottom - top)
            };
          }
        };
      },
      hotkeys: {
        qa: 'Shift+Q'
      },
      anchors: {
        attribute: 'data-qa-id'
      },
      viewports: {
        presets: reviewViewportPresets
      },
      ruler,
      onRestoreItem: restoreReviewItem,
      onItemsChange: () => {
        void refreshItems();
      },
      onModeChange: setMode,
      ui: {
        panel: false
      },
      modules: {
        qa: true,
        grid: false,
        figma: false
      }
    });
    controllerRef.current.open();
    controllerRef.current.setHiddenItemIds(hiddenOverlayItemIdListRef.current);
    setMode(controllerRef.current.getMode());
    void refreshItems();
    void restoreInitialItem();
    applyPendingRestore();
    refreshTargetOverlayState();
    setTargetScrollbarHidden(
      targetDocument,
      getViewportPresetKind(sizeRef.current) === 'mobile'
    );
  }, [
    adapter,
    applyPendingRestore,
    cancelReviewMode,
    closeRuler,
    destroyReviewKit,
    projectId,
    pageTargets,
    refreshItems,
    refreshTargetOverlayState,
    reviewViewportPresets,
    restoreInitialItem,
    restoreReviewItem,
    ruler,
    reviewPathPrefix,
    syncShellTarget,
    syncTargetViewport
  ]);

  useEffect(() => destroyReviewKit, [destroyReviewKit]);

  useEffect(() => {
    if (!presence || !normalizedReviewUserId) {
      const session = presenceSessionRef.current;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
      void session?.disconnect();
      return undefined;
    }

    let isActive = true;
    let unsubscribe: (() => void) | undefined;
    const initialState = getCurrentPresenceState();

    void Promise.resolve(
      presence.connect({
        projectId,
        sessionId: presenceSessionId,
        userId: normalizedReviewUserId,
        displayName: presenceDisplayName,
        color: presenceColor,
        initialState,
      })
    ).then((session) => {
      if (!isActive) {
        void session.disconnect();
        return;
      }

      presenceSessionRef.current = session;
      unsubscribe = session.subscribe(setPresenceUsers);
      setPresenceSessionVersion((current) => current + 1);
      void session.update(initialState);
    }).catch(() => {
      if (!isActive) return;

      presenceSessionRef.current = null;
      setPresenceUsers([]);
    });

    return () => {
      isActive = false;
      unsubscribe?.();
      const session = presenceSessionRef.current;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
      void session?.disconnect();
    };
  }, [
    normalizedReviewUserId,
    presence,
    presenceColor,
    presenceDisplayName,
    presenceSessionId,
    projectId,
  ]);

  useEffect(() => {
    const session = presenceSessionRef.current;
    if (!session || !normalizedReviewUserId) return;

    void session.update(getCurrentPresenceState());
  }, [
    getCurrentPresenceState,
    normalizedReviewUserId,
    presenceSessionVersion,
  ]);

  useEffect(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument || frameDocument.readyState !== 'complete') return;
    initReviewKit();
  }, [initReviewKit]);

  useEffect(() => {
    void refreshItems();
  }, [refreshItems]);

  useEffect(() => {
    void refreshSitemapItems();
  }, [refreshSitemapItems]);

  useEffect(() => {
    if (!isSitemapOpen) return;
    void refreshSitemapItems();
  }, [isSitemapOpen, refreshSitemapItems]);

  useEffect(() => {
    hiddenOverlayItemIdListRef.current = hiddenOverlayItemIdList;
    controllerRef.current?.setHiddenItemIds(hiddenOverlayItemIdList);
  }, [hiddenOverlayItemIdList]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const query = window.matchMedia('(prefers-color-scheme: light)');
    const syncSystemTheme = () => {
      setSystemReviewTheme(query.matches ? 'light' : 'dark');
    };

    syncSystemTheme();

    if (query.addEventListener) {
      query.addEventListener('change', syncSystemTheme);
      return () => query.removeEventListener('change', syncSystemTheme);
    }

    query.addListener(syncSystemTheme);
    return () => query.removeListener(syncSystemTheme);
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      'df-review-theme-light',
      effectiveReviewTheme === 'light'
    );
    document.body.classList.toggle(
      'df-review-theme-dark',
      effectiveReviewTheme === 'dark'
    );

    return () => {
      document.body.classList.remove(
        'df-review-theme-light',
        'df-review-theme-dark'
      );
    };
  }, [effectiveReviewTheme]);

  useEffect(() => {
    if (
      mode === 'idle' &&
      !isRulerVisible &&
      !promptItemId &&
      !isInitialPromptOpen &&
      !isSitemapOpen &&
      !isFigmaSettingsOpen
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (mode !== 'idle' && cancelReviewMode()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (closeRuler()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (promptItemId) {
        setPromptItemId(null);
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (isInitialPromptOpen) {
        setIsInitialPromptOpen(false);
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (isSitemapOpen) {
        setIsSitemapOpen(false);
        return;
      }

      if (isFigmaSettingsOpen) {
        closeFigmaSettings();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    cancelReviewMode,
    closeRuler,
    closeFigmaSettings,
    isFigmaSettingsOpen,
    isInitialPromptOpen,
    isRulerVisible,
    isSitemapOpen,
    promptItemId,
    mode
  ]);

  useEffect(() => {
    targetRef.current = target;
    setActiveRoute(target);
  }, [target]);

  useEffect(() => {
    sizeRef.current = size;
    if (selectedItemIdRef.current) {
      updateShellUrlForItem(
        targetRef.current,
        size,
        selectedItemIdRef.current,
        source
      );
    } else {
      updateShellUrl(targetRef.current, size, source);
    }
    syncTargetViewport();
    setTargetScrollbarHidden(
      iframeRef.current?.contentDocument,
      getViewportPresetKind(size) === 'mobile'
    );
  }, [size, source, syncTargetViewport]);

  useEffect(() => {
    const frameScroll = frameScrollRef.current;
    if (!frameScroll) return undefined;

    const centerFrameScroll = () => {
      frameScroll.scrollLeft = Math.max(
        0,
        (frameScroll.scrollWidth - frameScroll.clientWidth) / 2
      );
      frameScroll.scrollTop = 0;
    };

    const animationFrame = window.requestAnimationFrame(centerFrameScroll);
    const transitionTimeout = window.setTimeout(centerFrameScroll, 180);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(transitionTimeout);
    };
  }, [isListVisible, size.height, size.width, targetSrc]);

  useEffect(() => {
    if (isFigmaOverlayAvailable || !targetOverlayState.figma) return;

    dispatchTargetOverlayHotkey('figma');
  }, [
    dispatchTargetOverlayHotkey,
    isFigmaOverlayAvailable,
    targetOverlayState.figma
  ]);

  useEffect(() => {
    if (!isRulerVisible || !isRulerAvailable) return undefined;

    const getRulerEventClientPoint = (event: MouseEvent) => {
      const frame = iframeRef.current;
      let isFrameEvent = false;

      try {
        isFrameEvent =
          Boolean(frame?.contentWindow) && event.view === frame?.contentWindow;

        if (!isFrameEvent && frame?.contentDocument) {
          const targetDocument = (
            event.target as { ownerDocument?: Document } | null
          )?.ownerDocument;
          isFrameEvent = targetDocument === frame.contentDocument;
        }
      } catch {
        isFrameEvent = false;
      }

      if (isFrameEvent && frame) {
        const frameRect = frame.getBoundingClientRect();

        return {
          clientX: event.clientX + frameRect.left,
          clientY: event.clientY + frameRect.top
        };
      }

      return {
        clientX: event.clientX,
        clientY: event.clientY
      };
    };

    const snapDesign = (screen: number, axis: 'x' | 'y') => {
      const current = sizeRef.current;
      const scaleX = current.designWidth
        ? current.width / current.designWidth
        : 1;
      const scale =
        axis === 'y'
          ? current.designHeight
            ? current.height / current.designHeight
            : scaleX
          : scaleX;
      return Math.round(Math.round(screen / scale) * scale);
    };

    const getActiveRulerPoint = (event: MouseEvent) => {
      const rect =
        rulerDragRectRef.current ??
        rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return undefined;

      const point = getRulerEventClientPoint(event);
      const snapped = getRulerPointFromRect(point.clientX, point.clientY, rect);

      return { x: snapDesign(snapped.x, 'x'), y: snapDesign(snapped.y, 'y') };
    };

    const getHoverRulerPoint = (event: MouseEvent) => {
      const rect = rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return null;

      const { clientX, clientY } = getRulerEventClientPoint(event);
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

      return { x: snapDesign(x, 'x'), y: snapDesign(y, 'y') };
    };

    const handleDragStart: EventListener = (event) => {
      if (isRulerDraggingRef.current) return;

      const mouseEvent = event as MouseEvent;
      if (mouseEvent.button !== 0) return;

      const overlay = rulerOverlayRef.current;
      const target = mouseEvent.target;
      if (!overlay || !(target instanceof Node) || !overlay.contains(target)) {
        return;
      }

      event.preventDefault();
      startRulerDrag(
        mouseEvent.clientX,
        mouseEvent.clientY,
        overlay.getBoundingClientRect()
      );
    };

    const handlePointerMove: EventListener = (event) => {
      const mouseEvent = event as MouseEvent;

      if (isRulerDraggingRef.current) {
        const point = getActiveRulerPoint(mouseEvent);
        if (!point) return;

        mouseEvent.preventDefault();
        setRulerPoint(point);
        setRulerHover(point);
        return;
      }

      setRulerHover(getHoverRulerPoint(mouseEvent));
    };

    const handleDragEnd: EventListener = (event) => {
      if (!isRulerDraggingRef.current) return;

      const point = getActiveRulerPoint(event as MouseEvent);
      event.preventDefault();
      finishRulerDrag(point);
    };

    const handleWindowBlur = () => {
      if (!isRulerDraggingRef.current) return;

      finishRulerDrag();
    };

    const dragTargets = new Set<EventTarget>([window]);
    const frame = iframeRef.current;

    try {
      if (frame?.contentWindow) dragTargets.add(frame.contentWindow);
      if (frame?.contentDocument) dragTargets.add(frame.contentDocument);
    } catch {
      // Cross-origin frames cannot expose their document. Parent listeners still run.
    }

    dragTargets.forEach((target) => {
      target.addEventListener('mousedown', handleDragStart, true);
      target.addEventListener('mousemove', handlePointerMove, true);
      target.addEventListener('mouseup', handleDragEnd, true);
    });

    window.addEventListener('blur', handleWindowBlur);

    return () => {
      dragTargets.forEach((target) => {
        target.removeEventListener('mousedown', handleDragStart, true);
        target.removeEventListener('mousemove', handlePointerMove, true);
        target.removeEventListener('mouseup', handleDragEnd, true);
      });
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [finishRulerDrag, isRulerAvailable, isRulerVisible, startRulerDrag]);

  useEffect(() => {
    clearRulerMeasure();
  }, [clearRulerMeasure, size.height, size.width, targetSrc]);

  useEffect(() => {
    if (!isRulerVisible || isRulerAvailable) return;
    closeRuler();
  }, [closeRuler, isRulerAvailable, isRulerVisible]);

  const applyTarget = () => {
    const normalizedTarget = normalizeTarget(draftTarget, reviewPathPrefix);
    clearSelectedItem();
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current, source);
  };

  const selectPage = (href: string) => {
    const normalizedTarget = normalizeTarget(href, reviewPathPrefix);
    clearSelectedItem();
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current, source);
    setIsSitemapOpen(false);
  };

  const setReviewMode = (nextMode: ReviewMode) => {
    const writeMode = getReviewModeWriteMode(nextMode);
    if (writeMode && !activeAdapterEntry.writeModes.includes(writeMode)) return;
    closeRuler();
    if (nextMode === 'element') {
      closeTargetOverlay('figma');
    }
    controllerRef.current?.setMode(nextMode);
    setMode(controllerRef.current?.getMode() ?? 'idle');
  };

  const copyCurrentUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopyLabel('Copied');
    window.setTimeout(() => setCopyLabel('Copy URL'), 1200);
  };

  const changeReviewSource = (nextSource: ReviewSource) => {
    if (!sourceEntries.some((entry) => entry.label === nextSource)) return;

    cancelReviewMode();
    clearSelectedItem();
    setItems([]);
    setSource(nextSource);
    updateShellUrl(targetRef.current, sizeRef.current, nextSource);
  };

  const changeItemStatus = async (
    item: ReviewItem,
    nextStatus: ReviewItemStatus
  ) => {
    if (!activeAdapterEntry.updateStatus) return;

    const statusIndex = activeAdapterEntry.statusOptions.findIndex(
      (statusOption) => statusOption.value === nextStatus
    );
    const statusOption = activeAdapterEntry.statusOptions[statusIndex];
    if (!statusOption) return;

    await activeAdapterEntry.updateStatus({
      id: item.id,
      item,
      status: statusOption.value,
      statusOption,
      statusIndex,
    });
    await refreshReviewData();
  };

  const submitItem = async (numberedItem: NumberedReviewItem) => {
    const { item } = numberedItem;
    const localSubmitAdapter = localAdapterEntry;
    const syncLocalSubmission = localSubmitAdapter?.syncSubmission;
    if (
      !remoteAdapterEntry ||
      !localSubmitAdapter ||
      !syncLocalSubmission ||
      item.submitStatus === 'submitted'
    ) {
      return;
    }

    const submitLocal = syncLocalSubmission;
    await submitLocal({
      id: item.id,
      item,
      patch: {
        submitStatus: 'submitting',
        submitError: undefined
      }
    });
    await refreshReviewData();

    try {
      await remoteAdapterEntry.adapter.create({
        ...item,
        reviewNumber: undefined,
        externalIssueId: undefined,
        externalIssueUrl: undefined,
        submittedAt: undefined,
        submitStatus: 'submitted',
        submitError: undefined
      });
      await localSubmitAdapter.adapter.remove(item.id);
      if (selectedItemIdRef.current === item.id) {
        clearSelectedItem();
      }
    } catch (error) {
      await submitLocal({
        id: item.id,
        item,
        patch: {
          submitStatus: 'failed',
          submitError:
            error instanceof Error ? error.message : 'Failed to submit remote'
        }
      });
    }

    await refreshReviewData();
  };

  const copyPrompt = async (value: string, key: string) => {
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopiedPromptKey(key);
    window.setTimeout(() => {
      setCopiedPromptKey((current) => (current === key ? null : current));
    }, 1200);
  };

  const copyItemPrompt = async (numberedItem: NumberedReviewItem) => {
    await copyPrompt(
      buildReviewItemPrompt(numberedItem, reviewPathPrefix),
      `item:${numberedItem.item.id}`
    );
  };

  const closePromptModal = () => {
    setPromptItemId(null);
    setIsInitialPromptOpen(false);
  };

  const removeItem = async (item: ReviewItem) => {
    if (
      !activeAdapterEntry.canRemove ||
      item.submitStatus === 'submitting' ||
      (!isRemoteSource && item.submitStatus === 'submitted')
    ) {
      return;
    }

    await activeAdapterEntry.adapter.remove(item.id);
    if (selectedItemIdRef.current === item.id) {
      clearSelectedItem();
      updateShellUrl(targetRef.current, sizeRef.current, source);
    }
    await refreshReviewData();
  };

  useEffect(() => {
    const handleHotkey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      if (isEditableEventTarget(event)) return;

      const actions: Record<string, () => void> = {
        r: () => {
          if (isRulerAvailable) toggleRuler();
        },
        g: () => toggleTargetOverlay('grid'),
        f: () => toggleTargetOverlay('figma'),
        n: () => setReviewMode('note'),
        e: () => setReviewMode('element'),
        a: () => setReviewMode('area')
      };
      const action = actions[event.key.toLowerCase()];
      if (!action) return;

      event.preventDefault();
      action();
    };

    window.addEventListener('keydown', handleHotkey);
    return () => window.removeEventListener('keydown', handleHotkey);
  }, [isRulerAvailable, toggleRuler, toggleTargetOverlay, setReviewMode]);

  return (
    <div
      className={`df-review-shell is-theme-${effectiveReviewTheme}${
        isListVisible ? ' is-list-visible' : ''
      }`}
    >
      <ReviewTopbar
        draftTarget={draftTarget}
        copyLabel={copyLabel}
        viewportPresets={viewportPresets}
        size={size}
        presetScopeCounts={presetScopeCounts}
        isRulerAvailable={isRulerAvailable}
        isRulerVisible={isRulerVisible}
        targetOverlayState={targetOverlayState}
        isFigmaOverlayAvailable={isFigmaOverlayAvailable}
        onDraftTargetChange={setDraftTarget}
        onApplyTarget={applyTarget}
        onOpenSitemap={() => setIsSitemapOpen(true)}
        onCopyCurrentUrl={() => void copyCurrentUrl()}
        onSizeChange={setSize}
        onToggleRuler={toggleRuler}
        onToggleTargetOverlay={toggleTargetOverlay}
        onOpenInitialPrompt={() => {
          setPromptTab('initial');
          setPromptItemId(null);
          setIsInitialPromptOpen(true);
        }}
        onOpenSettings={openFigmaSettings}
      />

      {isSitemapOpen && (
        <SitemapModal
          pages={pages}
          activeRoute={activeRoute}
          pageQaCounts={pageQaCounts}
          pagePresenceUsers={pagePresenceUsers}
          getPageTarget={(href) => normalizeTarget(href, reviewPathPrefix)}
          onClose={() => setIsSitemapOpen(false)}
          onSelectPage={selectPage}
        />
      )}

      {isFigmaSettingsOpen && (
        <ReviewSettingsModal
          figmaTokenDraft={figmaTokenDraft}
          reviewUserIdDraft={reviewUserIdDraft}
          reviewThemeDraft={reviewThemeDraft}
          figmaSettingsStatus={figmaSettingsStatus}
          isFigmaTokenVisible={isFigmaTokenVisible}
          isFigmaTokenGuideOpen={isFigmaTokenGuideOpen}
          onClose={closeFigmaSettings}
          onFigmaTokenDraftChange={setFigmaTokenDraft}
          onReviewUserIdDraftChange={setReviewUserIdDraft}
          onReviewThemeDraftChange={setReviewThemeDraft}
          onClearStatus={() => setFigmaSettingsStatus('')}
          onToggleFigmaTokenVisible={() =>
            setIsFigmaTokenVisible((current) => !current)
          }
          onToggleFigmaTokenGuide={() =>
            setIsFigmaTokenGuideOpen((current) => !current)
          }
          onSave={saveReviewSettings}
        />
      )}

      {(promptDialogNumberedItem || isInitialPromptOpen) && (
        <PromptModal
          numberedItem={promptDialogNumberedItem}
          promptTab={promptTab}
          activeLabel={promptDialogActiveLabel}
          activeText={promptDialogActiveText}
          activeCopyKey={promptDialogActiveCopyKey}
          copiedPromptKey={copiedPromptKey}
          onClose={closePromptModal}
          onPromptTabChange={setPromptTab}
          onCopyPrompt={(text, key) => void copyPrompt(text, key)}
        />
      )}

      <div className="df-review-side-rail">
        <button
          aria-label={isListVisible ? 'Hide QA list' : 'Show QA list'}
          className="df-review-side-toggle"
          type="button"
          onClick={() => setIsListVisible((current) => !current)}
        >
          <span aria-hidden="true">
            <GripVerticalIcon />
          </span>
          <strong>QA</strong>
        </button>
      </div>

      <aside className="df-review-qa-panel" aria-hidden={!isListVisible}>
        <div className="df-review-panel-body">
          <section className="df-review-item-list">
            <div className="df-review-list-header">
              <div className="df-review-list-toolbar">
                <div className="df-review-list-controls">
                  {showSourceSelect && (
                    <select
                      aria-label="QA source"
                      className="df-review-source-select"
                      value={source}
                      onChange={(event) =>
                        changeReviewSource(event.currentTarget.value as ReviewSource)
                      }
                    >
                      {sourceEntries.map((entry) => (
                        <option key={entry.label} value={entry.label}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    aria-label="Refresh QA"
                    className="df-review-source-refresh"
                    type="button"
                    onClick={() => void refreshReviewData()}
                  >
                    <RefreshCwIcon aria-hidden="true" />
                  </button>
                </div>
                <div className="df-review-filter-tabs" aria-label="QA filters">
                  {REVIEW_QA_FILTERS.map((filter) => {
                    const count = qaFilterCounts.get(filter.key) ?? 0;
                    const isActive = qaFilter === filter.key;

                    return (
                      <button
                        key={filter.key}
                        aria-label={`${filter.label} QA (${count})`}
                        aria-pressed={isActive}
                        className={`df-review-filter-tab${
                          isActive ? ' is-active' : ''
                        }`}
                        type="button"
                        onClick={() => setQaFilter(filter.key)}
                      >
                        <span className="df-review-filter-icon">
                          {filter.scope ? (
                            <ReviewScopeIcon scope={filter.scope} />
                          ) : (
                            <ListFilterIcon aria-hidden="true" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="df-review-list-title">
                <span>{activeAdapterEntry.label} QA</span>
                <strong>
                  {filteredNumberedActiveItems.length}
                  {qaFilter === 'all' ? '' : `/${activeItems.length}`}
                </strong>
              </div>
              {currentPagePresenceUsers.length > 0 && (
                <div
                  aria-label="Review presence"
                  className="df-review-presence-row"
                >
                  <span className="df-review-presence-label">
                    <UsersIcon aria-hidden="true" />
                    online {currentPagePresenceUsers.length}
                  </span>
                  <div className="df-review-presence-list">
                    {currentPagePresenceUsers.map((user) => (
                      <span
                        key={user.sessionId}
                        className={`df-review-presence-chip${
                          user.sessionId === presenceSessionId
                            ? ' is-self'
                            : ''
                        }`}
                        style={{
                          '--df-review-presence-color': user.color,
                        } as React.CSSProperties}
                      >
                        <span
                          className="df-review-presence-dot"
                          aria-hidden="true"
                        />
                        <span className="df-review-presence-name">
                          {user.userId}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="df-review-list-scroll">
              {activeItems.length === 0 && (
                <p className="df-review-empty">
                  {isRemoteSource
                    ? `No ${activeAdapterEntry.label} QA on this page.`
                    : 'No QA on this page.'}
                </p>
              )}
              {activeItems.length > 0 &&
                filteredNumberedActiveItems.length === 0 && (
                  <p className="df-review-empty">No QA in this filter.</p>
                )}
              {filteredNumberedActiveItems.map((numberedItem) => {
                const { item } = numberedItem;
                const itemMode = getReviewItemMode(item);
                const isSubmitted = item.submitStatus === 'submitted';
                const isSubmitting = item.submitStatus === 'submitting';
                const canRemoveItem =
                  activeAdapterEntry.canRemove &&
                  !isSubmitting &&
                  (isRemoteSource || !isSubmitted);
                const hasRemoteActions =
                  (!isRemoteSource && Boolean(remoteAdapterEntry)) ||
                  Boolean(item.externalIssueUrl);
                const isItemOverlayVisible = !hiddenOverlayItemIds.has(item.id);
                const itemComment = item.comment.trim() || getItemTitle(item);
                const statusOptions = activeAdapterEntry.statusOptions;
                const currentStatusOption = getStatusOption(
                  item.status,
                  statusOptions
                );
                const canUpdateStatus =
                  Boolean(activeAdapterEntry.updateStatus) &&
                  statusOptions.length > 0 &&
                  !isSubmitting;

                return (
                  <article
                    key={item.id}
                    className={`df-review-item-card${
                      item.id === selectedItemId ? ' is-active' : ''
                    }${
                      getItemPresetScope(item) !== currentPresetScope
                        ? ' is-dim'
                        : ''
                    }${isItemOverlayVisible ? '' : ' is-overlay-hidden'}`}
                    onClick={() => restoreReviewItem(item)}
                  >
                    <div className="df-review-item-header">
                      <div className="df-review-item-main">
                        <span className="df-review-item-badges">
                          <span className="df-review-item-id">
                            {numberedItem.displayLabel}
                          </span>
                          <span
                            className={`df-review-item-scope is-scope-${numberedItem.scope}`}
                          >
                            <ReviewScopeIcon scope={numberedItem.scope} />
                            {numberedItem.label}
                          </span>
                          <span
                            className={`df-review-item-mode is-mode-${itemMode}`}
                          >
                            <ReviewItemModeIcon mode={itemMode} />
                            {itemMode}
                          </span>
                          <span
                            className="df-review-item-prompt-actions"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              className="df-review-item-prompt"
                              type="button"
                              onClick={() => {
                                setIsInitialPromptOpen(false);
                                setPromptTab('item');
                                setPromptItemId(item.id);
                              }}
                            >
                              Prompt
                            </button>
                            <button
                              aria-label="Copy QA prompt"
                              className={`df-review-item-prompt-copy${
                                copiedPromptKey === `item:${item.id}`
                                  ? ' is-copied'
                                  : ''
                              }`}
                              type="button"
                              onClick={() => void copyItemPrompt(numberedItem)}
                            >
                              <CopyIcon aria-hidden="true" />
                            </button>
                          </span>
                        </span>
                        <strong className="df-review-item-comment">
                          {itemComment}
                        </strong>
                        <small>{formatDate(item.createdAt)}</small>
                        {item.submitError && (
                          <small className="df-review-item-error">
                            {item.submitError}
                          </small>
                        )}
                      </div>
                      <div
                        className="df-review-item-header-actions"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          aria-label={
                            isItemOverlayVisible
                              ? 'Hide QA overlay'
                              : 'Show QA overlay'
                          }
                          className={`df-review-item-visibility${
                            isItemOverlayVisible ? ' is-visible' : ' is-hidden'
                          }`}
                          type="button"
                          onClick={() => toggleItemOverlayVisibility(item.id)}
                        >
                          {isItemOverlayVisible ? (
                            <EyeIcon aria-hidden="true" />
                          ) : (
                            <EyeOffIcon aria-hidden="true" />
                          )}
                        </button>
                        {canRemoveItem && (
                          <button
                            aria-label="Delete QA"
                            className="df-review-item-delete"
                            type="button"
                            onClick={() => void removeItem(item)}
                          >
                            <XIcon aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="df-review-item-actions">
                      {currentStatusOption && (
                        <div
                          className="df-review-item-status-actions"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {canUpdateStatus ? (
                            <select
                              aria-label="QA status"
                              className="df-review-item-status-select"
                              value={currentStatusOption.value}
                              onChange={(event) =>
                                void changeItemStatus(
                                  item,
                                  event.currentTarget.value as ReviewItemStatus
                                )
                              }
                            >
                              {statusOptions.map((statusOption) => (
                                <option
                                  key={statusOption.value}
                                  value={statusOption.value}
                                >
                                  {statusOption.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="df-review-item-status-badge">
                              {currentStatusOption.label}
                            </span>
                          )}
                        </div>
                      )}
                      {hasRemoteActions && (
                        <div
                          className="df-review-item-remote-actions"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {!isRemoteSource && remoteAdapterEntry && (
                            <button
                              aria-label="Submit to remote"
                              className="df-review-item-action-button df-review-item-submit-button"
                              disabled={isSubmitted || isSubmitting}
                              type="button"
                              onClick={() => void submitItem(numberedItem)}
                            >
                              <UploadIcon aria-hidden="true" />
                              <span>
                                {isSubmitted
                                  ? '등록됨'
                                  : isSubmitting
                                    ? '등록 중'
                                    : 'remote 등록'}
                              </span>
                            </button>
                          )}
                          {item.externalIssueUrl && (
                            <a
                              aria-label="Open remote issue"
                              className="df-review-item-action-button"
                              href={item.externalIssueUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <ExternalLinkIcon aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </aside>

      <main className="df-review-stage">
        <div className="df-review-frame">
          <div className="df-review-frame-scroll" ref={frameScrollRef}>
            <div className="df-review-frame-canvas">
              <div
                className={`df-review-device-frame${
                  isRulerVisible && isRulerAvailable ? ' is-ruler' : ''
                }`}
              >
                {isRulerVisible && isRulerAvailable && (
                  <>
                    <div className="df-review-ruler-corner" aria-hidden="true" />
                    <div
                      className="df-review-ruler-gutter is-x"
                      style={
                        {
                          '--df-review-ruler-step-x': `${rulerScaleX * 20}px`
                        } as React.CSSProperties
                      }
                    >
                      <div className="df-review-ruler-frame-label">
                        <strong>{size.label}</strong>
                        <span>
                          {size.designWidth}
                          {size.designHeight ? `x${size.designHeight}` : ''}
                          {rulerUnit}
                        </span>
                      </div>
                      {rulerHover && (
                        <div
                          className="df-review-ruler-coord is-x"
                          style={{ left: `${rulerHover.x}px` }}
                        >
                          {Math.round(rulerHover.x / rulerScaleX)}
                        </div>
                      )}
                    </div>
                    <div
                      className="df-review-ruler-gutter is-y"
                      style={
                        {
                          '--df-review-ruler-step-y': `${rulerScaleY * 20}px`
                        } as React.CSSProperties
                      }
                    >
                      {rulerHover && (
                        <div
                          className="df-review-ruler-coord is-y"
                          style={{ top: `${rulerHover.y}px` }}
                        >
                          {Math.round(rulerHover.y / rulerScaleY)}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div
                  className="df-review-device"
                  style={{
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    minWidth: `${size.width}px`,
                    minHeight: `${size.height}px`
                  }}
                >
                  <iframe
                    key={targetSrc}
                    ref={iframeRef}
                    width={size.width}
                    height={size.height}
                    src={targetSrc}
                    title="Review target"
                    onLoad={initReviewKit}
                  />
                  {isRulerVisible && isRulerAvailable && (
                    <div
                      ref={rulerOverlayRef}
                      aria-label="Ruler"
                      className={`df-review-ruler-overlay${
                        isRulerDragging ? ' is-dragging' : ''
                      }`}
                      role="application"
                      onWheel={(event) => {
                        iframeRef.current?.contentWindow?.scrollBy(
                          event.deltaX,
                          event.deltaY
                        );
                      }}
                    >
                      {rulerHover && (
                        <>
                          <div
                            className="df-review-ruler-guide is-x"
                            aria-hidden="true"
                            style={{ top: `${rulerHover.y}px` }}
                          />
                          <div
                            className="df-review-ruler-guide is-y"
                            aria-hidden="true"
                            style={{ left: `${rulerHover.x}px` }}
                          />
                        </>
                      )}
                      {rulerMeasure &&
                        (rulerMeasure.width > 0 || rulerMeasure.height > 0) && (
                          <>
                            <div
                              className="df-review-ruler-selection"
                              aria-hidden="true"
                              style={{
                                left: `${rulerMeasure.left}px`,
                                top: `${rulerMeasure.top}px`,
                                width: `${rulerMeasure.width}px`,
                                height: `${rulerMeasure.height}px`
                              }}
                            />
                            <div
                              className="df-review-ruler-label"
                              style={{
                                left: `${Math.min(
                                  Math.max(
                                    rulerMeasure.left + rulerMeasure.width + 8,
                                    8
                                  ),
                                  Math.max(8, size.width - 164)
                                )}px`,
                                top: `${Math.min(
                                  Math.max(
                                    rulerMeasure.top + rulerMeasure.height + 8,
                                    8
                                  ),
                                  Math.max(8, size.height - 34)
                                )}px`
                              }}
                            >
                              {rulerMeasureLabel}
                            </div>
                          </>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="df-review-frame-actions">
            {canWriteAny && (
              <div className="df-review-mode" aria-label="Add QA">
                {canWriteDom && (
                  <button
                    aria-label="Element"
                    className={`df-review-mode-button is-element${
                      mode === 'element' ? ' is-active' : ''
                    }`}
                    type="button"
                    onClick={() => setReviewMode('element')}
                  >
                    <SquareMousePointerIcon aria-hidden="true" />
                  </button>
                )}
                {canWriteDom && (canWriteNote || canWriteArea) && (
                  <span className="df-review-mode-divider" aria-hidden="true">
                    |
                  </span>
                )}
                {canWriteNote && (
                  <button
                    aria-label="Note"
                    className={`df-review-mode-button is-note${
                      mode === 'note' ? ' is-active' : ''
                    }`}
                    type="button"
                    onClick={() => setReviewMode('note')}
                  >
                    <StickyNoteIcon aria-hidden="true" />
                  </button>
                )}
                {canWriteArea && (
                  <button
                    aria-label="Area"
                    className={`df-review-mode-button is-area${
                      mode === 'area' ? ' is-active' : ''
                    }`}
                    type="button"
                    onClick={() => setReviewMode('area')}
                  >
                    <ScanIcon aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

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
