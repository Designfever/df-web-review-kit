import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ChevronDown as ChevronDownIcon,
  CircleHelp as CircleHelpIcon,
  Code2 as Code2Icon,
  Workflow as ComponentTreeIcon,
  Database as DatabaseIcon,
  FileText as FileTextIcon,
  Image as ImageIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  SquareDashed as SquareDashedIcon,
  SquareMousePointer as SquareMousePointerIcon,
  Type as TypeIcon,
  X as XIcon,
} from 'lucide-react';
import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemStatus,
  ReviewMode,
  ReviewSource,
} from '../../types';
import { clamp } from '../../core/geometry';
import { runWithAutoScrollBehavior } from '../../core/scroll';

import type {
  ReviewShellProps,
  ReviewShellWriteMode,
} from '../types';
import {
  DEFAULT_INITIAL_REVIEW_PROMPT,
} from '../constants';
import {
  DEFAULT_REVIEW_PATH_PREFIX,
  getItemTarget,
  getShellUrlForItem,
  normalizeTarget,
  parseReviewAddressInput,
  updateShellUrl,
} from '../route';
import {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
  findViewportPreset,
  getRestoredSize,
} from '../viewport';
import {
  PromptModal,
  ReviewSettingsModal,
  SitemapModal,
} from '../shell.modals';
import { buildReviewItemPrompt } from '../prompt/prompt';
import {
  getFigmaFrameUrl,
  getTargetFigmaFrameConfig,
  type ReviewFigmaFrameConfig,
} from '../figma';
import { QaItemEditModal } from '../qa/item.edit.modal';
import { ReviewQaPanel } from '../qa/panel';
import { PresenceOverlay } from '../presence/overlay';
import {
  getSectionOutline,
  getSourceCandidates,
  getSourceOpenUrl,
  openSourceInEditor,
  type GetSourceCandidatesOptions,
  type GetSectionOutlineOptions,
  type SectionOutlineEntry,
  type SourceCandidate,
  type SourceOpenOptions,
} from '../source.open';
import { ReviewTargetFrame } from '../target/frame';
import { setTargetFigmaOverlayLocked } from '../target/target';
import { ReviewTopbar } from '../topbar';
import { useReviewController } from '../hooks/use.review.controller';
import { useReviewPresence } from '../hooks/use.review.presence';
import { useReviewRuler } from '../hooks/use.review.ruler';
import { useReviewSettings } from '../hooks/use.review.settings';
import { useReviewShellData } from '../hooks/use.review.shell.data';
import { useReviewShellHotkeys } from '../hooks/use.review.shell.hotkeys';
import { useReviewShellState } from '../hooks/use.review.shell.state';
import {
  getStoredReviewSidePanel,
  getStoredSourceTreeFilter,
  getStoredSourceTreeMetaVisibility,
  type StoredReviewSidePanel,
  type StoredSourceTreeMetaVisibility,
  writeStoredReviewSidePanel,
  writeStoredReviewSidePanelVisible,
  writeStoredSourceTreeFilter,
  writeStoredSourceTreeMetaVisibility,
} from '../settings';
import {
  copyCurrentReviewUrl,
  copyReviewPrompt,
  removeReviewItem,
  refreshReviewItems,
  refreshSitemapReviewItems,
  refreshReviewData as refreshReviewDataAction,
  submitReviewItem,
  updateReviewItemComment,
  updateReviewItemStatus,
} from './shell.actions';

const getReviewModeWriteMode = (
  mode: ReviewMode
): ReviewShellWriteMode | null => {
  if (mode === 'element') return 'dom';
  if (mode === 'note' || mode === 'area') return mode;
  return null;
};

type SourceInspectorRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type SourceInspectorCandidate = SourceCandidate & {
  openUrl: string | null;
};

type SourceInspectorState = {
  candidates: SourceInspectorCandidate[];
  isPinned: boolean;
  panelLeft: number;
  panelMaxWidth: number;
  panelRight: number | null;
  panelTop: number;
  rect: SourceInspectorRect;
};

type ReviewSidePanel = StoredReviewSidePanel;
type SourceTreeMetaVisibilityKey = keyof StoredSourceTreeMetaVisibility;

const SOURCE_PANEL_MAX_WIDTH = 440;
const SOURCE_PANEL_MIN_WIDTH = 240;
const SOURCE_PANEL_MAX_HEIGHT = 260;
const SOURCE_TREE_PANEL_CLOSE_DELAY_MS = 180;

const waitForFrame = (targetWindow: Window | null | undefined) =>
  new Promise<void>((resolve) => {
    (targetWindow ?? window).requestAnimationFrame(() => resolve());
  });

const waitForMs = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const getScrollElement = (targetDocument: Document) =>
  targetDocument.scrollingElement as HTMLElement | null;

const scrollElementInTarget = (
  element: Element,
  block: 'center' | 'start'
) => {
  const targetWindow = element.ownerDocument.defaultView;
  if (!targetWindow) return;

  const targetDocument = element.ownerDocument;
  const scrollElement = getScrollElement(targetDocument);
  const rect = element.getBoundingClientRect();
  const currentLeft = scrollElement?.scrollLeft ?? targetWindow.scrollX;
  const currentTop = scrollElement?.scrollTop ?? targetWindow.scrollY;
  const clientWidth = scrollElement?.clientWidth ?? targetWindow.innerWidth;
  const clientHeight = scrollElement?.clientHeight ?? targetWindow.innerHeight;
  const scrollWidth =
    scrollElement?.scrollWidth ?? targetDocument.documentElement.scrollWidth;
  const scrollHeight =
    scrollElement?.scrollHeight ??
    targetDocument.documentElement.scrollHeight;
  const nextLeft = clamp(
    currentLeft + rect.left + rect.width / 2 - clientWidth / 2,
    0,
    Math.max(0, scrollWidth - clientWidth)
  );
  const nextTop =
    block === 'center'
      ? clamp(
          currentTop + rect.top + rect.height / 2 - clientHeight / 2,
          0,
          Math.max(0, scrollHeight - clientHeight)
        )
      : clamp(
          currentTop + rect.top,
          0,
          Math.max(0, scrollHeight - clientHeight)
        );

  runWithAutoScrollBehavior(targetDocument, () => {
    if (scrollElement) {
      scrollElement.scrollLeft = Math.round(nextLeft);
      scrollElement.scrollTop = Math.round(nextTop);
      return;
    }

    targetWindow.scrollTo(Math.round(nextLeft), Math.round(nextTop));
  });
};

const centerFrameScrollOnElement = (
  frameScroll: HTMLDivElement | null,
  frame: HTMLIFrameElement | null,
  element: Element
) => {
  if (!frameScroll || !frame) return;

  const frameScrollRect = frameScroll.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const elementHostCenterX =
    frameRect.left + elementRect.left + elementRect.width / 2;
  const elementHostCenterY =
    frameRect.top + elementRect.top + elementRect.height / 2;
  const visibleCenterX = frameScrollRect.left + frameScrollRect.width / 2;
  const visibleCenterY = frameScrollRect.top + frameScrollRect.height / 2;
  const nextLeft = clamp(
    frameScroll.scrollLeft + elementHostCenterX - visibleCenterX,
    0,
    Math.max(0, frameScroll.scrollWidth - frameScroll.clientWidth)
  );
  const nextTop = clamp(
    frameScroll.scrollTop + elementHostCenterY - visibleCenterY,
    0,
    Math.max(0, frameScroll.scrollHeight - frameScroll.clientHeight)
  );
  const previousScrollBehavior = frameScroll.style.scrollBehavior;

  frameScroll.style.scrollBehavior = 'auto';
  frameScroll.scrollLeft = Math.round(nextLeft);
  frameScroll.scrollTop = Math.round(nextTop);
  frameScroll.style.scrollBehavior = previousScrollBehavior;
};

const getSectionOutlineFilterTerms = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

const getSectionOutlineEntryCount = (entries: SectionOutlineEntry[]): number =>
  entries.reduce(
    (count, entry) => count + 1 + getSectionOutlineEntryCount(entry.children),
    0
  );

const getDefaultCollapsedSectionOutlineIds = (
  entries: SectionOutlineEntry[]
) => {
  const collapsedIds = new Set<string>();
  const visit = (entry: SectionOutlineEntry) => {
    if (entry.children.length > 0) {
      collapsedIds.add(entry.id);
    }
    entry.children.forEach(visit);
  };

  entries.forEach(visit);
  return collapsedIds;
};

const getLiveSectionOutlineRect = (entry: SectionOutlineEntry) => {
  if (!entry.element.isConnected) return entry.metadata.rect;

  const rect = entry.element.getBoundingClientRect();
  return {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
};

const matchesSectionOutlineFilter = (
  entry: SectionOutlineEntry,
  terms: string[]
) => {
  if (terms.length === 0) return true;

  const text = [
    entry.label,
    entry.filePath,
    entry.source?.file,
    entry.data?.file,
    entry.metadata.textValue,
    entry.metadata.fontLabel,
    entry.metadata.mediaItems
      ?.map((mediaItem) => `${mediaItem.variant} ${mediaItem.type} ${mediaItem.url}`)
      .join(' '),
    entry.metadata.classNames?.join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return terms.every((term) => text.includes(term));
};

const filterSectionOutlineEntries = (
  entries: SectionOutlineEntry[],
  terms: string[]
): SectionOutlineEntry[] => {
  if (terms.length === 0) return entries;

  return entries.flatMap((entry) => {
    const children = filterSectionOutlineEntries(entry.children, terms);
    if (!matchesSectionOutlineFilter(entry, terms) && children.length === 0) {
      return [];
    }

    return [{ ...entry, children }];
  });
};

export const ReviewShell = ({
  projectId,
  pages,
  adapters,
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ruler,
  initialPrompt = DEFAULT_INITIAL_REVIEW_PROMPT,
  adjustmentLabel,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
  sourceRoot,
  sourceInspector,
  presence
}: ReviewShellProps) => {
  const {
    activeAdapterEntry,
    activeRoute,
    adapter,
    canWriteArea,
    canWriteDom,
    cleanupTargetRef,
    controllerRef,
    copiedPromptKey,
    copyLabel,
    draftTarget,
    frameScrollRef,
    hiddenOverlayItemIdListRef,
    iframeRef,
    isFigmaOverlayAvailable: isViewportFigmaOverlayAvailable,
    isInitialPromptOpen,
    isListVisible,
    isRemoteSource,
    isSitemapOpen,
    localAdapterEntry,
    mode,
    pendingInitialItemIdRef,
    pendingRestoreRef,
    remoteAdapterEntry,
    reviewViewportPresets,
    selectedItemId,
    selectedItemIdRef,
    setActiveRoute,
    setCopiedPromptKey,
    setCopyLabel,
    setDraftTarget,
    setIsInitialPromptOpen,
    setIsListVisible,
    setIsSitemapOpen,
    setMode,
    setSelectedItemId,
    setSize,
    setSource,
    setTarget,
    setTargetOverlayState,
    showSourceSelect,
    size,
    sizeRef,
    source,
    sourceEntries,
    target,
    targetOverlayState,
    targetRef,
    toastMessage,
    viewportPresets,
    setToastMessage,
  } = useReviewShellState({
    adapters,
    presets,
    reviewPathPrefix,
  });
  const sourceShortcutCleanupRef = useRef<(() => void) | null>(null);
  const sourceInspectorInteractionRef = useRef(false);
  const [sourceInspectorState, setSourceInspectorState] =
    useState<SourceInspectorState | null>(null);
  const [sectionOutline, setSectionOutline] = useState<
    SectionOutlineEntry[] | null
  >(null);
  const [sectionOutlineFilter, setSectionOutlineFilter] = useState(() =>
    getStoredSourceTreeFilter()
  );
  const [sectionOutlineMetaVisibility, setSectionOutlineMetaVisibility] =
    useState(() => getStoredSourceTreeMetaVisibility());
  const isSectionOutlineBoxMetaVisible = sectionOutlineMetaVisibility.box;
  const isSectionOutlineFontMetaVisible = sectionOutlineMetaVisibility.font;
  const isSectionOutlineMediaMetaVisible = sectionOutlineMetaVisibility.media;
  const isSectionOutlineClassMetaVisible =
    sectionOutlineMetaVisibility.className;
  const [collapsedSectionOutlineIds, setCollapsedSectionOutlineIds] = useState<
    Set<string>
  >(() => new Set());
  const [isAllQaVisible, setIsAllQaVisible] = useState(false);
  const sourceOpenOptions = useMemo<SourceOpenOptions>(
    () => ({
      ...sourceInspector,
      sourceRoot,
    }),
    [sourceInspector, sourceRoot]
  );
  const sourceCandidateOptions = useMemo<GetSourceCandidatesOptions>(
    () => ({
      ignore: sourceInspector?.ignore,
      includePlacer: sourceInspector?.includePlacer,
    }),
    [sourceInspector]
  );
  const sectionOutlineOptions = useMemo<GetSectionOutlineOptions>(
    () => ({
      includePlacer: sourceInspector?.includePlacer,
      ignore: sourceInspector?.ignore,
      maxDepth: sourceInspector?.maxDepth,
    }),
    [sourceInspector]
  );
  const isSourceInspectorEnabled = sourceInspector?.enabled !== false;
  const [sidePanel, setSidePanel] = useState<ReviewSidePanel>(() =>
    isSourceInspectorEnabled ? getStoredReviewSidePanel() : 'qa'
  );
  const isSourceTreeHoverOutlineEnabled =
    sourceInspector?.hoverOutline !== false;
  const isQaPanelVisible = isListVisible && sidePanel === 'qa';
  const isSourceTreePanelVisible =
    isSourceInspectorEnabled && isListVisible && sidePanel === 'source';

  useEffect(() => {
    if (isSourceInspectorEnabled || sidePanel !== 'source') return;
    setSidePanel('qa');
  }, [isSourceInspectorEnabled, sidePanel]);

  useEffect(() => {
    writeStoredReviewSidePanel(sidePanel);
  }, [sidePanel]);

  useEffect(() => {
    writeStoredReviewSidePanelVisible(isListVisible);
  }, [isListVisible]);

  const updateSectionOutlineFilter = useCallback((nextFilter: string) => {
    setSectionOutlineFilter(nextFilter);
    writeStoredSourceTreeFilter(nextFilter);
  }, []);

  const updateSectionOutlineMetaVisibility = useCallback(
    (key: SourceTreeMetaVisibilityKey) => {
      setSectionOutlineMetaVisibility((current) => {
        const next = { ...current, [key]: !current[key] };
        writeStoredSourceTreeMetaVisibility(next);
        return next;
      });
    },
    []
  );

  const sectionOutlineFilterTerms = useMemo(
    () => getSectionOutlineFilterTerms(sectionOutlineFilter),
    [sectionOutlineFilter]
  );
  const filteredSectionOutline = useMemo(
    () =>
      sectionOutline
        ? filterSectionOutlineEntries(sectionOutline, sectionOutlineFilterTerms)
        : [],
    [sectionOutline, sectionOutlineFilterTerms]
  );
  const sectionOutlineTotalCount = useMemo(
    () => getSectionOutlineEntryCount(sectionOutline ?? []),
    [sectionOutline]
  );
  const filteredSectionOutlineCount = useMemo(
    () => getSectionOutlineEntryCount(filteredSectionOutline),
    [filteredSectionOutline]
  );
  const isSectionOutlineFiltering = sectionOutlineFilterTerms.length > 0;
  const {
    activeItems,
    activeRemainingItemCount,
    allQaCount,
    currentPresetScope,
    filteredNumberedActiveItems,
    getItemPresetScope,
    hiddenOverlayItemIdList,
    hiddenOverlayItemIds,
    pageQaCounts,
    pageTargets,
    presetScopeCounts,
    qaFilter,
    qaFilterCounts,
    qaStatusFilter,
    qaStatusFilterCounts,
    selectedNumberedItem,
    setHiddenOverlayItemIds,
    setItems,
    setQaFilter,
    setQaStatusFilter,
    setSitemapItems,
    targetSrc,
  } = useReviewShellData({
    activeRoute,
    isAllQaVisible,
    isRemoteSource,
    pages,
    reviewPathPrefix,
    reviewViewportPresets,
    selectedItemId,
    size,
    target,
    viewportPresets,
  });
  const [targetFigmaState, setTargetFigmaState] =
    useState<{ targetSrc: string; config: ReviewFigmaFrameConfig } | null>(null);
  const targetFigmaConfig =
    targetFigmaState?.targetSrc === targetSrc ? targetFigmaState.config : null;
  const figmaFrameUrl = useMemo(
    () => getFigmaFrameUrl(targetFigmaConfig, size),
    [targetFigmaConfig, size]
  );
  const isFigmaOverlayAvailable =
    isViewportFigmaOverlayAvailable && Boolean(targetFigmaConfig);
  const [editingItem, setEditingItem] = useState<ReviewItem | null>(null);
  const initialPromptText = initialPrompt.trim();
  const refreshItems = useCallback(
    () =>
      refreshReviewItems({
        activeRoute,
        adapter,
        isRemoteSource,
        pageId: activeAdapterEntry.pageId,
        projectId,
        onItemsChange: setItems,
      }),
    [activeAdapterEntry.pageId, activeRoute, adapter, isRemoteSource, projectId]
  );

  const refreshSitemapItems = useCallback(
    () =>
      refreshSitemapReviewItems({
        localAdapterEntry,
        projectId,
        remoteAdapterEntry,
        onSitemapItemsChange: setSitemapItems,
      }),
    [localAdapterEntry, projectId, remoteAdapterEntry]
  );

  const cancelReviewMode = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || controller.getMode() === 'idle') return false;

    controller.setMode('idle');
    setMode(controller.getMode());
    return true;
  }, []);

  const closePromptModal = useCallback(() => {
    setIsInitialPromptOpen(false);
  }, []);

  const closeSitemap = useCallback(() => {
    setIsSitemapOpen(false);
  }, []);

  const reloadTargetFrame = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      return;
    }
  }, []);

  const {
    closeFigmaSettings,
    effectiveReviewTheme,
    figmaSettingsStatus,
    figmaTokenDraft,
    isFigmaSettingsOpen,
    isFigmaTokenGuideOpen,
    isFigmaTokenVisible,
    openFigmaSettings,
    reviewThemeDraft,
    reviewUserId,
    reviewUserIdDraft,
    saveReviewSettings,
    setFigmaSettingsStatus,
    setFigmaTokenDraft,
    setIsFigmaTokenGuideOpen,
    setIsFigmaTokenVisible,
    setReviewThemeDraft,
    setReviewUserIdDraft,
  } = useReviewSettings({
    onCancelReviewMode: cancelReviewMode,
    onCloseInitialPrompt: closePromptModal,
    onCloseSitemap: closeSitemap,
    onReloadTargetFrame: reloadTargetFrame,
  });

  const {
    currentPagePresenceUsers,
    pagePresenceUsers,
    presenceSessionId,
  } = useReviewPresence({
    activeRoute,
    mode,
    presence,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    selectedNumberedItem,
    size,
    source,
  });

  const closeRulerPanels = useCallback(() => {
    closeSitemap();
    closeFigmaSettings();
  }, [closeFigmaSettings, closeSitemap]);

  const {
    closeRuler,
    isRulerAvailable,
    isRulerDragging,
    isRulerVisible,
    rulerHover,
    rulerMeasure,
    rulerMeasureLabel,
    rulerOverlayRef,
    rulerScaleX,
    rulerScaleY,
    rulerUnit,
    toggleRuler,
  } = useReviewRuler({
    iframeRef,
    ruler,
    size,
    targetSrc,
    onCancelReviewMode: cancelReviewMode,
    onCloseTransientPanels: closeRulerPanels,
  });

  const {
    clearSelectedItem,
    initReviewKit,
    reloadReviewKit,
    restoreReviewItem,
    setControllerReviewMode,
    syncTargetViewport,
    toggleTargetOverlay,
  } = useReviewController({
    adapter,
    cleanupTargetRef,
    controllerRef,
    frameScrollRef,
    hiddenOverlayItemIdList,
    hiddenOverlayItemIdListRef,
    iframeRef,
    isFigmaOverlayAvailable,
    pageTargets,
    pendingInitialItemIdRef,
    pendingRestoreRef,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    reviewViewportPresets,
    ruler,
    adjustmentLabel,
    selectedItemIdRef,
    size,
    sizeRef,
    source,
    target,
    targetOverlayState,
    targetRef,
    viewportPresets,
    onActiveRouteChange: setActiveRoute,
    onCancelReviewMode: cancelReviewMode,
    onCloseRuler: closeRuler,
    onDraftTargetChange: setDraftTarget,
    onItemsRefresh: refreshItems,
    onModeChange: setMode,
    onSelectedItemIdChange: setSelectedItemId,
    onSizeChange: setSize,
    onTargetChange: setTarget,
    onTargetOverlayStateChange: setTargetOverlayState,
  });

  const refreshReviewData = useCallback(() => {
    return refreshReviewDataAction({
      onRefreshItems: refreshItems,
      onRefreshSitemapItems: refreshSitemapItems,
      onReloadReviewKit: reloadReviewKit,
    });
  }, [refreshItems, refreshSitemapItems, reloadReviewKit]);

  const toggleItemOverlayVisibility = useCallback((itemId: string) => {
    setHiddenOverlayItemIds((currentHiddenOverlayItemIds) => {
      const nextHiddenItemIds = new Set(currentHiddenOverlayItemIds);
      if (nextHiddenItemIds.has(itemId)) {
        nextHiddenItemIds.delete(itemId);
      } else {
        nextHiddenItemIds.add(itemId);
      }

      return nextHiddenItemIds;
    });
  }, []);

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
    const frameScroll = frameScrollRef.current;
    if (!frameScroll) return undefined;

    const centerFrameScroll = () => {
      frameScroll.scrollLeft = Math.max(
        0,
        (frameScroll.scrollWidth - frameScroll.clientWidth) / 2
      );
      frameScroll.scrollTop = 0;
      syncTargetViewport();
    };

    const animationFrame = window.requestAnimationFrame(centerFrameScroll);
    const transitionTimeout = window.setTimeout(centerFrameScroll, 180);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(transitionTimeout);
    };
  }, [isListVisible, size.height, size.width, syncTargetViewport, targetSrc]);

  const applyTarget = async () => {
    const parsedInput = parseReviewAddressInput(draftTarget, reviewPathPrefix);
    const normalizedTarget = parsedInput.target;
    const nextSource =
      parsedInput.source &&
      sourceEntries.some((entry) => entry.label === parsedInput.source)
        ? parsedInput.source
        : source;
    const nextSize =
      parsedInput.width && parsedInput.height
        ? findViewportPreset(
            viewportPresets,
            parsedInput.width,
            parsedInput.height
          )
        : sizeRef.current;
    const nextAdapter =
      sourceEntries.find((entry) => entry.label === nextSource) ??
      activeAdapterEntry;
    const isCurrentTarget =
      targetRef.current === normalizedTarget &&
      source === nextSource &&
      sizeRef.current.width === nextSize.width &&
      sizeRef.current.height === nextSize.height;

    if (parsedInput.itemId) {
      const item = await nextAdapter.adapter.get(parsedInput.itemId);
      if (item) {
        setIsAllQaVisible(false);
        setSource(nextSource);
        restoreReviewItem(item);
        return;
      }
    }

    clearSelectedItem();
    setIsAllQaVisible(false);
    setSource(nextSource);
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setSize(nextSize);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, nextSize, nextSource);
    if (isCurrentTarget) reloadTargetFrame();
  };

  const selectPage = (href: string) => {
    const normalizedTarget = normalizeTarget(href, reviewPathPrefix);
    clearSelectedItem();
    setIsAllQaVisible(false);
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current, source);
    setIsSitemapOpen(false);
  };

  const selectAllQa = () => {
    setIsAllQaVisible(true);
    setIsSitemapOpen(false);
  };

  const setReviewMode = (nextMode: ReviewMode) => {
    const writeMode = getReviewModeWriteMode(nextMode);
    if (writeMode && !activeAdapterEntry.writeModes.includes(writeMode)) return;
    closeRuler();
    if (writeMode && mode !== nextMode) {
      setSidePanel('qa');
      setIsListVisible(true);
    }
    setControllerReviewMode(nextMode);
  };

  useReviewShellHotkeys({
    isFigmaSettingsOpen,
    isInitialPromptOpen,
    isRulerAvailable,
    isRulerVisible,
    isSitemapOpen,
    mode,
    onCancelReviewMode: cancelReviewMode,
    onCloseFigmaSettings: closeFigmaSettings,
    onCloseInitialPrompt: closePromptModal,
    onCloseRuler: closeRuler,
    onCloseSitemap: closeSitemap,
    onSetReviewMode: setReviewMode,
    onToggleRuler: toggleRuler,
    onToggleTargetOverlay: toggleTargetOverlay,
  });

  const copyCurrentUrl = () =>
    copyCurrentReviewUrl({
      onCopyLabelChange: setCopyLabel,
    });

  const showToast = useCallback(
    (message: string) => {
      setToastMessage(message);
      window.setTimeout(() => {
        setToastMessage((current) => (current === message ? '' : current));
      }, 1600);
    },
    [setToastMessage]
  );

  const refreshTargetFigmaConfig = useCallback(() => {
    const config = getTargetFigmaFrameConfig(
      iframeRef.current?.contentWindow
    );
    setTargetFigmaState(config ? { targetSrc, config } : null);
  }, [iframeRef, targetSrc]);

  useEffect(() => {
    const targetDocument = iframeRef.current?.contentDocument;
    setTargetFigmaOverlayLocked(targetDocument, mode === 'element');
    return () => {
      setTargetFigmaOverlayLocked(targetDocument, false);
    };
  }, [iframeRef, mode, targetSrc]);

  const clearSourceInspector = useCallback(() => {
    sourceInspectorInteractionRef.current = false;
    setSourceInspectorState(null);
  }, []);

  useEffect(() => {
    clearSourceInspector();
    setCollapsedSectionOutlineIds(new Set());
    setSectionOutline(null);
  }, [clearSourceInspector, targetSrc]);

  const getSourceInspectorRect = useCallback(
    (element: Element): SourceInspectorRect | null => {
      const frame = iframeRef.current;
      if (!frame) return null;

      const frameRect = frame.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const left = Math.max(frameRect.left, frameRect.left + elementRect.left);
      const top = Math.max(frameRect.top, frameRect.top + elementRect.top);
      const right = Math.min(
        frameRect.right,
        frameRect.left + elementRect.right
      );
      const bottom = Math.min(
        frameRect.bottom,
        frameRect.top + elementRect.bottom
      );

      return {
        height: Math.max(2, bottom - top),
        left,
        top,
        width: Math.max(2, right - left),
      };
    },
    [iframeRef]
  );

  const getSourceInspectorPanelPosition = useCallback(
    (rect: SourceInspectorRect) => {
      const margin = 12;
      const gap = 10;
      const preferredLeft = rect.left + rect.width + gap;
      const rightSpace = window.innerWidth - preferredLeft - margin;
      const leftSpace = rect.left - gap - margin;
      const canOpenRight = rightSpace >= SOURCE_PANEL_MIN_WIDTH;
      const canOpenLeft = leftSpace >= SOURCE_PANEL_MIN_WIDTH;
      const left = canOpenRight || !canOpenLeft ? preferredLeft : margin;
      const right = canOpenRight || !canOpenLeft
        ? null
        : Math.max(margin, window.innerWidth - (rect.left - gap));
      const maxWidth = Math.min(
        SOURCE_PANEL_MAX_WIDTH,
        Math.max(
          SOURCE_PANEL_MIN_WIDTH,
          canOpenRight
            ? rightSpace
            : canOpenLeft
              ? leftSpace
              : window.innerWidth - margin * 2
        )
      );
      const top = Math.min(
        Math.max(margin, rect.top),
        Math.max(margin, window.innerHeight - SOURCE_PANEL_MAX_HEIGHT - margin)
      );

      return { left, maxWidth, right, top };
    },
    []
  );

  const showSourceInspectorForTarget = useCallback(
    (target: EventTarget | null, isPinned = false) => {
      const candidates = getSourceCandidates(target, sourceCandidateOptions).map(
        (candidate) => ({
          ...candidate,
          openUrl: getSourceOpenUrl(candidate.source, {
            ...sourceOpenOptions,
            omitPosition: !candidate.usesPosition,
          }),
        })
      );
      const firstCandidate = candidates[0];
      const rect = firstCandidate
        ? getSourceInspectorRect(firstCandidate.element)
        : null;

      if (!firstCandidate || !rect) {
        setSourceInspectorState(null);
        return [];
      }

      const { left, maxWidth, right, top } =
        getSourceInspectorPanelPosition(rect);
      setSourceInspectorState({
        candidates,
        isPinned,
        panelLeft: left,
        panelMaxWidth: maxWidth,
        panelRight: right,
        panelTop: top,
        rect,
      });
      return candidates;
    },
    [
      getSourceInspectorPanelPosition,
      getSourceInspectorRect,
      sourceCandidateOptions,
      sourceOpenOptions,
    ]
  );

  const showSourceOutlineForTarget = useCallback(
    (target: EventTarget | null) => {
      const firstCandidate = getSourceCandidates(
        target,
        sourceCandidateOptions
      )[0];
      const rect = firstCandidate
        ? getSourceInspectorRect(firstCandidate.element)
        : null;

      if (!firstCandidate || !rect) {
        setSourceInspectorState(null);
        return null;
      }

      setSourceInspectorState({
        candidates: [],
        isPinned: false,
        panelLeft: 0,
        panelMaxWidth: SOURCE_PANEL_MAX_WIDTH,
        panelRight: null,
        panelTop: 0,
        rect,
      });
      return firstCandidate;
    },
    [getSourceInspectorRect, sourceCandidateOptions]
  );

  const showSourceOutlineForElement = useCallback(
    (element: Element) => {
      if (!isSourceTreeHoverOutlineEnabled) return;

      const rect = getSourceInspectorRect(element);

      if (!rect) {
        setSourceInspectorState((current) =>
          current?.isPinned ? current : null
        );
        return;
      }

      setSourceInspectorState((current) =>
        current?.isPinned
          ? current
          : {
              candidates: [],
              isPinned: false,
              panelLeft: 0,
              panelMaxWidth: SOURCE_PANEL_MAX_WIDTH,
              panelRight: null,
              panelTop: 0,
              rect,
            }
      );
    },
    [getSourceInspectorRect, isSourceTreeHoverOutlineEnabled]
  );

  const clearSourceOutlineHover = useCallback(() => {
    setSourceInspectorState((current) => (current?.isPinned ? current : null));
  }, []);

  const openSourceCandidate = useCallback(
    (candidate: SourceInspectorCandidate) => {
      const didOpen = openSourceInEditor(candidate.source, {
        ...sourceOpenOptions,
        omitPosition: !candidate.usesPosition,
      });
      showToast(didOpen ? 'Source opened' : 'Source root required');
      clearSourceInspector();
    },
    [clearSourceInspector, showToast, sourceOpenOptions]
  );

  const getCurrentSectionOutline = useCallback(
    (): SectionOutlineEntry[] | null => {
      let frameDocument: Document | null = null;
      try {
        frameDocument = iframeRef.current?.contentDocument ?? null;
      } catch {
        frameDocument = null;
      }
      if (!frameDocument || frameDocument.readyState !== 'complete') {
        return null;
      }
      return getSectionOutline(frameDocument, sectionOutlineOptions);
    },
    [iframeRef, sectionOutlineOptions]
  );

  const setSectionOutlineWithDefaultCollapse = useCallback(
    (nextSectionOutline: SectionOutlineEntry[]) => {
      setSectionOutline(nextSectionOutline);
      setCollapsedSectionOutlineIds(
        getDefaultCollapsedSectionOutlineIds(nextSectionOutline)
      );
    },
    []
  );

  useEffect(() => {
    if (sidePanel !== 'source' || !isListVisible) return undefined;

    const refreshSectionOutline = () => {
      const nextSectionOutline = getCurrentSectionOutline();
      if (!nextSectionOutline) return;
      setSectionOutlineWithDefaultCollapse(nextSectionOutline);
    };

    const animationFrame = window.requestAnimationFrame(refreshSectionOutline);
    const firstTimeout = window.setTimeout(refreshSectionOutline, 120);
    const secondTimeout = window.setTimeout(refreshSectionOutline, 500);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(firstTimeout);
      window.clearTimeout(secondTimeout);
    };
  }, [
    getCurrentSectionOutline,
    isListVisible,
    setSectionOutlineWithDefaultCollapse,
    sidePanel,
    targetSrc,
  ]);

  const toggleQaPanel = useCallback(() => {
    setSidePanel('qa');
    setIsListVisible((current) => (sidePanel === 'qa' ? !current : true));
  }, [setIsListVisible, sidePanel]);

  const toggleSourceTreePanel = useCallback(() => {
    if (!isSourceInspectorEnabled) return;

    if (sidePanel === 'source' && isListVisible) {
      setIsListVisible(false);
      return;
    }

    setSidePanel('source');
    const nextSectionOutline = getCurrentSectionOutline();
    if (nextSectionOutline) {
      setSectionOutlineWithDefaultCollapse(nextSectionOutline);
    }
    setIsListVisible(true);
  }, [
    getCurrentSectionOutline,
    isListVisible,
    isSourceInspectorEnabled,
    setSectionOutlineWithDefaultCollapse,
    setIsListVisible,
    sidePanel,
  ]);

  const toggleSectionOutlineEntry = useCallback((entryId: string) => {
    setCollapsedSectionOutlineIds((current) => {
      const next = new Set(current);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  }, []);

  const scrollToSection = useCallback((entry: SectionOutlineEntry) => {
    scrollElementInTarget(entry.element, 'start');
    centerFrameScrollOnElement(
      frameScrollRef.current,
      iframeRef.current,
      entry.element
    );
  }, [frameScrollRef, iframeRef]);

  const openSectionSource = useCallback(
    (entry: SectionOutlineEntry) => {
      const didOpen = openSourceInEditor(entry.source, {
        ...sourceOpenOptions,
        omitPosition: true,
      });
      showToast(didOpen ? 'Source opened' : 'Source root required');
    },
    [showToast, sourceOpenOptions]
  );

  const openSectionData = useCallback(
    (entry: SectionOutlineEntry) => {
      const didOpen = openSourceInEditor(entry.data, sourceOpenOptions);
      showToast(didOpen ? 'Data opened' : 'Data hint not found');
    },
    [showToast, sourceOpenOptions]
  );

  const startSectionDomReview = useCallback(
    (entry: SectionOutlineEntry) => {
      if (!canWriteDom) {
        showToast('DOM QA unavailable');
        return;
      }

      clearSourceInspector();
      setSidePanel('qa');
      setIsListVisible(true);

      let targetWindow: Window | null = null;
      try {
        targetWindow =
          entry.element.ownerDocument.defaultView ??
          iframeRef.current?.contentWindow ??
          null;
      } catch {
        targetWindow = null;
      }

      void waitForMs(SOURCE_TREE_PANEL_CLOSE_DELAY_MS)
        .then(async () => {
          initReviewKit();
          await waitForFrame(targetWindow);
          const controller = controllerRef.current;
          if (!controller) {
            showToast('DOM QA unavailable');
            return;
          }

          scrollElementInTarget(entry.element, 'center');
          await waitForFrame(targetWindow);
          centerFrameScrollOnElement(
            frameScrollRef.current,
            iframeRef.current,
            entry.element
          );
          await waitForFrame(targetWindow);
          await controller.startElementReview(entry.element);
          await waitForFrame(targetWindow);
          setMode(controller.getMode());
        })
        .catch(() => {
          setMode(controllerRef.current?.getMode() ?? 'idle');
        });
    },
    [
      canWriteDom,
      clearSourceInspector,
      controllerRef,
      frameScrollRef,
      iframeRef,
      initReviewKit,
      setIsListVisible,
      setMode,
      showToast,
    ]
  );

  const cleanupSourceOpenShortcut = useCallback(() => {
    sourceShortcutCleanupRef.current?.();
    sourceShortcutCleanupRef.current = null;
  }, []);

  const bindSourceOpenShortcut = useCallback(() => {
    cleanupSourceOpenShortcut();

    let frameDocument: Document | null = null;
    try {
      frameDocument = iframeRef.current?.contentDocument ?? null;
    } catch {
      return;
    }

    if (!frameDocument || !isSourceInspectorEnabled) return;

    const frameRoot = frameDocument.head ?? frameDocument.documentElement;
    const frameBody = frameDocument.body ?? frameDocument.documentElement;
    if (!frameRoot || !frameBody) return;

    const optionAttribute = 'data-dfwr-source-option';
    const fontOverlayAttribute = 'data-dfwr-source-fonts';
    const style = frameDocument.createElement('style');
    style.dataset.dfwrSourceOpenShortcut = 'true';
    style.textContent = `
      html[${optionAttribute}="true"],
      html[${optionAttribute}="true"] * {
        cursor: crosshair !important;
      }

      html[${optionAttribute}="true"] .helper-figma-root,
      html[${optionAttribute}="true"] .helper-figma-root *,
      html[${optionAttribute}="true"] .helper-figma-loading-backdrop,
      html[${optionAttribute}="true"] .helper-figma-loading-backdrop * {
        pointer-events: none !important;
      }

      html[${optionAttribute}="true"] body::before {
        position: fixed !important;
        z-index: 2147483647 !important;
        top: 10px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        display: block !important;
        border: 1px solid rgba(124, 199, 255, 0.72) !important;
        border-radius: 999px !important;
        padding: 6px 10px !important;
        color: #ffffff !important;
        background: rgba(15, 23, 42, 0.86) !important;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24) !important;
        content: "Source select" !important;
        font: 500 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        pointer-events: none !important;
      }

      [${fontOverlayAttribute}] {
        position: fixed !important;
        z-index: 2147483647 !important;
        display: flex !important;
        flex-direction: column !important;
        width: max-content !important;
        max-width: calc(100vw - 8px) !important;
        border: 1px solid rgba(124, 199, 255, 0.72) !important;
        border-radius: 6px !important;
        padding: 4px 6px !important;
        color: #ffffff !important;
        background: rgba(15, 23, 42, 0.9) !important;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28) !important;
        font: 500 11px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
        overflow-wrap: anywhere !important;
        pointer-events: none !important;
        white-space: normal !important;
      }

      [${fontOverlayAttribute}] > span {
        display: grid !important;
        grid-template-columns: auto minmax(0, 1fr) !important;
        justify-content: space-between !important;
        gap: 10px !important;
      }

      [${fontOverlayAttribute}] > span > span:last-child {
        min-width: 0 !important;
        text-align: right !important;
      }

      [${fontOverlayAttribute}][hidden] {
        display: none !important;
      }
    `;

    frameRoot.append(style);

    const fontOverlay = frameDocument.createElement('div');
    fontOverlay.setAttribute(fontOverlayAttribute, 'true');
    fontOverlay.hidden = true;
    frameBody.append(fontOverlay);

    let hoveredElement: Element | null = null;
    let lastSourceTarget: EventTarget | null = null;
    let isSourceSelecting = false;
    let isSourcePanelPinned = false;

    const getFontHints = (element: Element | null) => {
      if (!element) return [];

      const values: Array<{ tag: string; value: string }> = [];
      const addValue = (target: Element) => {
        const value = target.getAttribute('data-font')?.trim();
        const tag = target.tagName.toLowerCase();
        if (
          value &&
          !values.some((item) => item.tag === tag && item.value === value)
        ) {
          values.push({ tag, value });
        }
      };

      addValue(element);
      element.querySelectorAll('[data-font]').forEach(addValue);
      return values;
    };

    const updateFontOverlay = (element: Element | null) => {
      const values = isSourceSelecting ? getFontHints(element) : [];
      if (!values.length || !element) {
        fontOverlay.hidden = true;
        return;
      }

      const rect = element.getBoundingClientRect();
      const frameWidth = frameDocument.documentElement.clientWidth;
      const showAbove = rect.top > 48;
      const top = Math.max(4, showAbove ? rect.top : rect.bottom);

      fontOverlay.replaceChildren();
      fontOverlay.style.minWidth = '72px';
      fontOverlay.style.left = '4px';
      fontOverlay.style.top = `${top}px`;
      fontOverlay.style.transform = showAbove
        ? 'translateY(calc(-100% - 6px))'
        : 'translateY(6px)';
      fontOverlay.style.visibility = 'hidden';
      const rows = values.map(({ tag, value }) => {
        const row = frameDocument.createElement('span');
        const tagText = frameDocument.createElement('span');
        const valueText = frameDocument.createElement('span');
        tagText.textContent = tag;
        valueText.textContent = value;
        row.append(tagText, valueText);
        return row;
      });
      fontOverlay.append(...rows);
      fontOverlay.hidden = false;
      const overlayWidth = fontOverlay.getBoundingClientRect().width;
      const left = Math.max(
        4,
        Math.min(rect.left, frameWidth - overlayWidth - 4)
      );
      fontOverlay.style.left = `${left}px`;
      fontOverlay.style.visibility = '';
    };

    const setHoveredElement = (element: Element | null) => {
      hoveredElement = element;
      updateFontOverlay(element);
    };

    const setSourceSelecting = (isSelecting: boolean) => {
      isSourceSelecting = isSelecting;
      if (isSelecting) {
        isSourcePanelPinned = false;
        frameDocument.documentElement.setAttribute(optionAttribute, 'true');
        const candidate = showSourceOutlineForTarget(lastSourceTarget);
        setHoveredElement(candidate?.element ?? hoveredElement);
        return;
      }

      setHoveredElement(null);
      fontOverlay.hidden = true;
      frameDocument.documentElement.removeAttribute(optionAttribute);
      if (!isSourcePanelPinned && !sourceInspectorInteractionRef.current) {
        clearSourceInspector();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      // 팝업이 고정된 동안에는 마우스 이동으로 target 을 다시 추적하지 않는다.
      // (닫기/다른 곳 클릭 전까지 고정 유지)
      if (isSourcePanelPinned) return;

      lastSourceTarget = event.target;
      const candidates = getSourceCandidates(event.target, sourceCandidateOptions);
      const sourceElement = candidates[0]?.element ?? null;

      if (event.altKey && !isSourceSelecting) {
        setSourceSelecting(true);
      }

      if (isSourceSelecting && !isSourcePanelPinned) {
        showSourceOutlineForTarget(event.target);
      }

      setHoveredElement(isSourceSelecting ? sourceElement : null);
    };

    const handleClick = (event: MouseEvent) => {
      if (!isSourceSelecting && !event.altKey) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const candidates = showSourceInspectorForTarget(event.target, true);
      if (!candidates.length) {
        showToast('Source hint not found');
        isSourcePanelPinned = false;
        setSourceSelecting(false);
        return;
      }

      isSourcePanelPinned = true;
      setSourceSelecting(false);
    };

    const isOptionKeyEvent = (event: KeyboardEvent) =>
      event.key === 'Alt' ||
      event.code === 'AltLeft' ||
      event.code === 'AltRight' ||
      event.altKey;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        isSourcePanelPinned = false;
        setSourceSelecting(false);
        clearSourceInspector();
        return;
      }
      if (!isOptionKeyEvent(event)) return;
      // 팝업 고정 중에는 Option 키(반복 입력 포함)로 다시 추적하지 않는다.
      if (isSourcePanelPinned) return;

      cancelReviewMode();
      setSourceSelecting(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isOptionKeyEvent(event) || !event.altKey) setSourceSelecting(false);
    };

    const handleBlur = () => {
      isSourcePanelPinned = false;
      setSourceSelecting(false);
    };

    const handleWindowPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('.df-review-source-popover')
      ) {
        sourceInspectorInteractionRef.current = true;
        return;
      }

      isSourcePanelPinned = false;
      sourceInspectorInteractionRef.current = false;
      setSourceSelecting(false);
      clearSourceInspector();
    };

    frameDocument.addEventListener('mousemove', handleMouseMove, true);
    frameDocument.addEventListener('click', handleClick, true);
    frameDocument.addEventListener('keydown', handleKeyDown, true);
    frameDocument.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pointerdown', handleWindowPointerDown, true);

    sourceShortcutCleanupRef.current = () => {
      frameDocument.removeEventListener('mousemove', handleMouseMove, true);
      frameDocument.removeEventListener('click', handleClick, true);
      frameDocument.removeEventListener('keydown', handleKeyDown, true);
      frameDocument.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pointerdown', handleWindowPointerDown, true);
      isSourcePanelPinned = false;
      setSourceSelecting(false);
      style.remove();
      fontOverlay.remove();
    };
  }, [
    cancelReviewMode,
    clearSourceInspector,
    cleanupSourceOpenShortcut,
    iframeRef,
    isSourceInspectorEnabled,
    showToast,
    sourceCandidateOptions,
    showSourceOutlineForTarget,
    showSourceInspectorForTarget,
  ]);

  useEffect(() => {
    return cleanupSourceOpenShortcut;
  }, [cleanupSourceOpenShortcut]);

  const loadTargetFrame = useCallback(() => {
    initReviewKit();
    refreshTargetFigmaConfig();
    setTargetFigmaOverlayLocked(
      iframeRef.current?.contentDocument,
      mode === 'element'
    );
    bindSourceOpenShortcut();
    if (sidePanel === 'source' && isListVisible) {
      const nextSectionOutline = getCurrentSectionOutline();
      if (nextSectionOutline) {
        setSectionOutlineWithDefaultCollapse(nextSectionOutline);
      }
    }
  }, [
    bindSourceOpenShortcut,
    getCurrentSectionOutline,
    iframeRef,
    initReviewKit,
    isListVisible,
    mode,
    refreshTargetFigmaConfig,
    setSectionOutlineWithDefaultCollapse,
    sidePanel,
  ]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(bindSourceOpenShortcut);
    return () => window.cancelAnimationFrame(frame);
  }, [bindSourceOpenShortcut, targetSrc]);

  const clearSelectedReviewItem = useCallback(() => {
    clearSelectedItem();
    updateShellUrl(targetRef.current, sizeRef.current, source);
  }, [clearSelectedItem, sizeRef, source, targetRef]);

  const changeReviewSource = (nextSource: ReviewSource) => {
    if (!sourceEntries.some((entry) => entry.label === nextSource)) return;

    cancelReviewMode();
    clearSelectedItem();
    setItems([]);
    setSource(nextSource);
    updateShellUrl(targetRef.current, sizeRef.current, nextSource);
  };

  const changeItemStatus = (
    item: ReviewItem,
    nextStatus: ReviewItemStatus
  ) =>
    updateReviewItemStatus({
      activeAdapterEntry,
      item,
      nextStatus,
      onRefreshReviewData: refreshReviewData,
      onToast: showToast,
    });

  const saveItemComment = async (item: ReviewItem, comment: string) => {
    await updateReviewItemComment({
      activeAdapterEntry,
      item,
      comment,
      onRefreshReviewData: refreshReviewData,
      onToast: showToast,
    });
    setEditingItem(null);
  };

  const submitItem = (numberedItem: NumberedReviewItem) =>
    submitReviewItem({
      localAdapterEntry,
      numberedItem,
      remoteAdapterEntry,
      selectedItemIdRef,
      onClearSelectedItem: clearSelectedItem,
      onRefreshReviewData: refreshReviewData,
      onToast: showToast,
    });

  const copyPrompt = (
    value: string,
    key: string,
    toastMessage = 'Prompt copied'
  ) =>
    copyReviewPrompt({
      key,
      toastMessage,
      value,
      onCopiedPromptKeyChange: setCopiedPromptKey,
      onToast: showToast,
    });

  const copyItemPrompt = (numberedItem: NumberedReviewItem) =>
    copyPrompt(
      buildReviewItemPrompt(numberedItem, reviewPathPrefix),
      `qa:${numberedItem.item.id}`,
      'QA prompt copied'
    );

  const copyItemLabel = (numberedItem: NumberedReviewItem) =>
    copyPrompt(
      numberedItem.displayLabel,
      `label:${numberedItem.item.id}`,
      'QA number copied'
    );

  const copyItemLink = (numberedItem: NumberedReviewItem) => {
    const { item } = numberedItem;
    return copyPrompt(
      getShellUrlForItem(
        getItemTarget(item, reviewPathPrefix),
        getRestoredSize(item, viewportPresets),
        item.id,
        source
      ).href,
      `link:${item.id}`,
      'QA link copied'
    );
  };

  const removeItem = (item: ReviewItem) =>
    removeReviewItem({
      activeAdapterEntry,
      isRemoteSource,
      item,
      selectedItemIdRef,
      sizeRef,
      source,
      targetRef,
      onClearSelectedItem: clearSelectedItem,
      onRefreshReviewData: refreshReviewData,
      onToast: showToast,
    });

  const renderSectionOutlineMeta = (entry: SectionOutlineEntry) => {
    const { metadata } = entry;
    const rows: React.ReactNode[] = [];
    const metaPaddingLeft = Math.max(0, entry.depth - 1) * 12 + 29;
    const rect = getLiveSectionOutlineRect(entry);

    if (isSectionOutlineBoxMetaVisible) {
      rows.push(
        <span className="df-review-section-outline-meta-row" key="box">
          <b>box</b>
          <code>
            top {rect.top} / left {rect.left} / width {rect.width} / height{' '}
            {rect.height}
          </code>
        </span>
      );
    }

    if (metadata.textValue) {
      rows.push(
        <span
          className="df-review-section-outline-meta-row is-text"
          key="text"
        >
          <b>text</b>
          <code>{metadata.textValue}</code>
        </span>
      );
    }

    if (isSectionOutlineFontMetaVisible && metadata.fontLabel) {
      rows.push(
        <span className="df-review-section-outline-meta-row" key="font">
          <b>font</b>
          <code>{metadata.fontLabel}</code>
        </span>
      );
    }

    if (isSectionOutlineMediaMetaVisible && metadata.mediaItems?.length) {
      metadata.mediaItems.forEach((mediaItem) => {
        const mediaKey = `${mediaItem.variant}:${mediaItem.type}:${mediaItem.url}`;
        const mediaLabel =
          mediaItem.variant === 'media' ? mediaItem.type : mediaItem.variant;
        rows.push(
          <span
            className="df-review-section-outline-meta-row is-media"
            key={mediaKey}
          >
            <b>{mediaLabel}</b>
            <a
              className="df-review-section-outline-media-link"
              href={mediaItem.url}
              rel="noopener noreferrer"
              target="_blank"
              title={`${mediaLabel} ${mediaItem.type}`}
            >
              <code>{mediaItem.url}</code>
            </a>
          </span>
        );
      });
    }

    if (isSectionOutlineClassMetaVisible && metadata.classNames?.length) {
      rows.push(
        <span className="df-review-section-outline-meta-row is-class" key="class">
          <b>class</b>
          <span className="df-review-section-outline-class-tags">
            {metadata.classNames.map((className) => (
              <code key={className}>{className}</code>
            ))}
          </span>
        </span>
      );
    }

    if (rows.length === 0) return null;

    return (
      <div
        className="df-review-section-outline-meta"
        style={{ paddingLeft: `${metaPaddingLeft}px` }}
      >
        {rows}
      </div>
    );
  };

  const renderSectionOutlineEntry = (
    entry: SectionOutlineEntry
  ): React.ReactNode => {
    const hasChildren = entry.children.length > 0;
    const isCollapsed =
      !isSectionOutlineFiltering && collapsedSectionOutlineIds.has(entry.id);

    return (
      <div
        className={`df-review-section-outline-item is-depth-${entry.depth}`}
        key={entry.id}
      >
        <div
          className="df-review-section-outline-entry-body"
          onMouseEnter={() => showSourceOutlineForElement(entry.element)}
          onMouseLeave={clearSourceOutlineHover}
          onMouseOver={() => showSourceOutlineForElement(entry.element)}
          onMouseOut={(event) => {
            if (
              event.relatedTarget instanceof Node &&
              event.currentTarget.contains(event.relatedTarget)
            ) {
              return;
            }
            clearSourceOutlineHover();
          }}
          onPointerEnter={() => showSourceOutlineForElement(entry.element)}
          onPointerLeave={clearSourceOutlineHover}
        >
          <div
            className="df-review-section-outline-row"
            style={{ paddingLeft: `${Math.max(0, entry.depth - 1) * 12 + 6}px` }}
          >
            {hasChildren ? (
              <button
                aria-label={
                  isCollapsed
                    ? `Expand ${entry.label}`
                    : `Collapse ${entry.label}`
                }
                aria-expanded={!isCollapsed}
                className={`df-review-section-outline-toggle${
                  isCollapsed ? ' is-collapsed' : ''
                }`}
                type="button"
                onClick={() => toggleSectionOutlineEntry(entry.id)}
              >
                <ChevronDownIcon aria-hidden="true" />
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="df-review-section-outline-toggle is-placeholder"
              />
            )}
            <button
              className="df-review-section-outline-name"
              type="button"
              onClick={() => scrollToSection(entry)}
            >
              <span>{entry.label}</span>
            </button>
            <span className="df-review-section-outline-links">
              <button
                aria-label={`Open ${entry.label} data`}
                className="df-review-section-outline-link"
                title="Open data"
                type="button"
                disabled={!entry.data?.file}
                onClick={() => openSectionData(entry)}
              >
                <DatabaseIcon aria-hidden="true" />
              </button>
              <button
                aria-label={`Open ${entry.label} source`}
                className="df-review-section-outline-link"
                title="Open source"
                type="button"
                disabled={!entry.source?.file}
                onClick={() => openSectionSource(entry)}
              >
                <Code2Icon aria-hidden="true" />
              </button>
              <span
                aria-hidden="true"
                className="df-review-section-outline-divider"
              >
                |
              </span>
              <button
                aria-label={`Start DOM QA for ${entry.label}`}
                className="df-review-section-outline-link is-dom-select"
                title="DOM select"
                type="button"
                disabled={!canWriteDom}
                onClick={() => startSectionDomReview(entry)}
              >
                <SquareMousePointerIcon aria-hidden="true" />
              </button>
            </span>
          </div>
          {renderSectionOutlineMeta(entry)}
        </div>
        {hasChildren && !isCollapsed && (
          <div className="df-review-section-outline-children">
            {entry.children.map(renderSectionOutlineEntry)}
          </div>
        )}
      </div>
    );
  };

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
      />

      {isSitemapOpen && (
        <SitemapModal
          pages={pages}
          activeRoute={activeRoute}
          allQaCount={allQaCount}
          isAllQaVisible={isAllQaVisible}
          pageQaCounts={pageQaCounts}
          pagePresenceUsers={pagePresenceUsers}
          getPageTarget={(href) => normalizeTarget(href, reviewPathPrefix)}
          onClose={() => setIsSitemapOpen(false)}
          onSelectAllQa={selectAllQa}
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

      {isInitialPromptOpen && (
        <PromptModal
          initialPromptText={initialPromptText}
          copiedPromptKey={copiedPromptKey}
          onClose={closePromptModal}
          onCopyPrompt={(text, key) => void copyPrompt(text, key)}
        />
      )}

      {editingItem && (
        <QaItemEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={saveItemComment}
        />
      )}

      {toastMessage && (
        <div className="df-review-copy-toast" role="status">
          {toastMessage}
        </div>
      )}

      <div className="df-review-side-rail">
        <button
          aria-label={isQaPanelVisible ? 'Hide QA list' : 'Show QA list'}
          aria-pressed={isQaPanelVisible}
          className={`df-review-side-toggle${
            isQaPanelVisible ? ' is-active' : ''
          }`}
          type="button"
          onClick={toggleQaPanel}
          title="QA"
        >
          <span aria-hidden="true">
            <FileTextIcon />
          </span>
        </button>
        {isSourceInspectorEnabled && (
          <button
            aria-controls="df-review-section-outline"
            aria-label={
              isSourceTreePanelVisible
                ? 'Hide source tree'
                : 'Show source tree'
            }
            aria-pressed={isSourceTreePanelVisible}
            className={`df-review-side-toggle${
              isSourceTreePanelVisible ? ' is-active' : ''
            }`}
            type="button"
            onClick={toggleSourceTreePanel}
            title="Source Tree"
          >
            <span aria-hidden="true">
              <ComponentTreeIcon />
            </span>
          </button>
        )}
        <div className="df-review-side-actions">
          <button
            aria-label="Open initial prompt"
            className="df-review-side-toggle"
            type="button"
            onClick={() => {
              setIsInitialPromptOpen(true);
            }}
            title="Help"
          >
            <span aria-hidden="true">
              <CircleHelpIcon />
            </span>
          </button>
          <button
            aria-label="Open settings"
            className="df-review-side-toggle"
            type="button"
            onClick={openFigmaSettings}
            title="Settings"
          >
            <span aria-hidden="true">
              <SettingsIcon />
            </span>
          </button>
          {currentPagePresenceUsers.length > 0 && (
            <PresenceOverlay
              presenceSessionId={presenceSessionId}
              users={currentPagePresenceUsers}
            />
          )}
        </div>
      </div>

      <ReviewQaPanel
        activeAdapterEntry={activeAdapterEntry}
        activeItems={activeItems}
        activeRemainingItemCount={activeRemainingItemCount}
        currentPresetScope={currentPresetScope}
        filteredNumberedActiveItems={filteredNumberedActiveItems}
        getItemPresetScope={getItemPresetScope}
        hiddenOverlayItemIds={hiddenOverlayItemIds}
        isListVisible={isQaPanelVisible}
        isAllQaVisible={isAllQaVisible}
        isRemoteSource={isRemoteSource}
        copiedPromptKey={copiedPromptKey}
        qaFilter={qaFilter}
        qaFilterCounts={qaFilterCounts}
        qaStatusFilter={qaStatusFilter}
        qaStatusFilterCounts={qaStatusFilterCounts}
        remoteAdapterEntry={remoteAdapterEntry}
        selectedItemId={selectedItemId}
        showSourceSelect={showSourceSelect}
        source={source}
        sourceEntries={sourceEntries}
        onChangeItemStatus={changeItemStatus}
        onClearSelectedItem={clearSelectedReviewItem}
        onChangeReviewSource={changeReviewSource}
        onCopyItemLabel={(numberedItem) => void copyItemLabel(numberedItem)}
        onCopyItemLink={(numberedItem) => void copyItemLink(numberedItem)}
        onCopyItemPrompt={(numberedItem) => void copyItemPrompt(numberedItem)}
        onEditItem={setEditingItem}
        onQaFilterChange={setQaFilter}
        onQaStatusFilterChange={setQaStatusFilter}
        onRefreshReviewData={refreshReviewData}
        onRemoveItem={removeItem}
        onRestoreReviewItem={restoreReviewItem}
        onSubmitItem={submitItem}
        onToggleItemOverlayVisibility={toggleItemOverlayVisibility}
      />

      {isSourceInspectorEnabled && (
        <aside
          className="df-review-source-tree-panel"
          aria-hidden={!isSourceTreePanelVisible}
        >
          <div id="df-review-section-outline" className="df-review-section-outline">
            <div className="df-review-section-outline-head">
              <div className="df-review-section-outline-summary">
                <span>
                  <strong>Component</strong>
                  <small>
                    {isSectionOutlineFiltering
                      ? `${filteredSectionOutlineCount} / ${sectionOutlineTotalCount} results`
                      : `${sectionOutline?.length ?? 0} ${
                          sectionOutline?.length === 1 ? 'root' : 'roots'
                        }`}
                  </small>
                </span>
                <div className="df-review-section-outline-meta-controls">
                  <button
                    aria-label="Toggle source tree box metadata"
                    aria-pressed={isSectionOutlineBoxMetaVisible}
                    className={`df-review-section-outline-meta-toggle${
                      isSectionOutlineBoxMetaVisible ? ' is-active' : ''
                    }`}
                    title="top / left / width / height"
                    type="button"
                    onClick={() => updateSectionOutlineMetaVisibility('box')}
                  >
                    <SquareDashedIcon aria-hidden="true" />
                  </button>
                  <button
                    aria-label="Toggle source tree font metadata"
                    aria-pressed={isSectionOutlineFontMetaVisible}
                    className={`df-review-section-outline-meta-toggle${
                      isSectionOutlineFontMetaVisible ? ' is-active' : ''
                    }`}
                    title="font size / weight"
                    type="button"
                    onClick={() => updateSectionOutlineMetaVisibility('font')}
                  >
                    <TypeIcon aria-hidden="true" />
                  </button>
                  <button
                    aria-label="Toggle source tree media metadata"
                    aria-pressed={isSectionOutlineMediaMetaVisible}
                    className={`df-review-section-outline-meta-toggle${
                      isSectionOutlineMediaMetaVisible ? ' is-active' : ''
                    }`}
                    title="media urls"
                    type="button"
                    onClick={() => updateSectionOutlineMetaVisibility('media')}
                  >
                    <ImageIcon aria-hidden="true" />
                  </button>
                  <button
                    aria-label="Toggle source tree class metadata"
                    aria-pressed={isSectionOutlineClassMetaVisible}
                    className={`df-review-section-outline-meta-toggle${
                      isSectionOutlineClassMetaVisible ? ' is-active' : ''
                    }`}
                    title="class names"
                    type="button"
                    onClick={() =>
                      updateSectionOutlineMetaVisibility('className')
                    }
                  >
                    <Code2Icon aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="df-review-section-outline-filter">
                <SearchIcon aria-hidden="true" />
                <input
                  aria-label="Filter source tree"
                  type="text"
                  value={sectionOutlineFilter}
                  placeholder="Filter"
                  autoComplete="off"
                  enterKeyHint="search"
                  spellCheck={false}
                  onChange={(event) =>
                    updateSectionOutlineFilter(event.currentTarget.value)
                  }
                />
                {sectionOutlineFilter && (
                  <button
                    aria-label="Clear source tree filter"
                    className="df-review-section-outline-filter-clear"
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => updateSectionOutlineFilter('')}
                  >
                    <XIcon aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            {filteredSectionOutline.length > 0 ? (
              <div className="df-review-section-outline-list">
                {filteredSectionOutline.map(renderSectionOutlineEntry)}
              </div>
            ) : (
              <div className="df-review-section-outline-empty">
                {isSectionOutlineFiltering
                  ? 'No source matches'
                  : 'No sections found'}
              </div>
            )}
          </div>
        </aside>
      )}

      <ReviewTargetFrame
        canWriteArea={canWriteArea}
        canWriteDom={canWriteDom}
        figmaFrameUrl={figmaFrameUrl}
        frameScrollRef={frameScrollRef}
        iframeRef={iframeRef}
        isRulerAvailable={isRulerAvailable}
        isRulerDragging={isRulerDragging}
        isRulerVisible={isRulerVisible}
        mode={mode}
        rulerHover={rulerHover}
        rulerMeasure={rulerMeasure}
        rulerMeasureLabel={rulerMeasureLabel}
        rulerOverlayRef={rulerOverlayRef}
        rulerScaleX={rulerScaleX}
        rulerScaleY={rulerScaleY}
        rulerUnit={rulerUnit}
        size={size}
        targetSrc={targetSrc}
        onLoadTarget={loadTargetFrame}
        onSetReviewMode={setReviewMode}
      />

      {sourceInspectorState && (
        <>
          <div
            className={`df-review-source-outline${
              sourceInspectorState.isPinned ? ' is-pinned' : ''
            }`}
            style={{
              height: `${sourceInspectorState.rect.height}px`,
              left: `${sourceInspectorState.rect.left}px`,
              top: `${sourceInspectorState.rect.top}px`,
              width: `${sourceInspectorState.rect.width}px`,
            }}
          />
          {sourceInspectorState.candidates.length > 0 && (
            <div
              className={`df-review-source-popover${
                sourceInspectorState.isPinned ? ' is-pinned' : ''
              }`}
              style={{
                left:
                  sourceInspectorState.panelRight === null
                    ? `${sourceInspectorState.panelLeft}px`
                    : undefined,
                maxWidth: `${sourceInspectorState.panelMaxWidth}px`,
                right:
                  sourceInspectorState.panelRight === null
                    ? undefined
                    : `${sourceInspectorState.panelRight}px`,
                top: `${sourceInspectorState.panelTop}px`,
              }}
              onPointerDown={() => {
                sourceInspectorInteractionRef.current = true;
              }}
              onPointerEnter={() => {
                sourceInspectorInteractionRef.current = true;
              }}
              onPointerLeave={() => {
                sourceInspectorInteractionRef.current = false;
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="df-review-source-popover-close">
                <button
                  aria-label="Close source candidates"
                  type="button"
                  onClick={clearSourceInspector}
                >
                  ×
                </button>
              </div>
              <div className="df-review-source-candidate-list">
                {sourceInspectorState.candidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    className={`df-review-source-candidate is-${candidate.kind}`}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      openSourceCandidate(candidate);
                    }}
                  >
                    <span className="df-review-source-candidate-main">
                      <strong>{candidate.label}</strong>
                      <span>{candidate.filePath}</span>
                      <small>{candidate.positionLabel || '-:-'}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
