import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Bot as BotIcon,
  Images as ComponentTreeIcon,
  SquareCheckBig as QaListIcon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { DfLogoIcon } from './df.logo';
import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemStatus,
  ReviewMode,
  ReviewSource,
} from '../../types';

import type {
  ReviewShellProps,
} from '../types';
import { resolveReviewSourceOptions } from '../env';
import {
  DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
} from '../../figma/image.types';
import {
  DEFAULT_INITIAL_REVIEW_PROMPT,
} from '../constants';
import {
  DEFAULT_REVIEW_PATH_PREFIX,
  getInitialItemId,
  getItemFrameTarget,
  getItemTarget,
  getShellUrlForItem,
  getTargetRouteKey,
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
  InitialPromptModal,
  PromptModal,
  ReviewSettingsModal,
  SitemapModal,
} from '../shell.modals';
import { buildReviewItemPrompt } from '../prompt/prompt';
import {
  getReviewFigmaImageStore,
  getTargetFigmaFrameConfig,
  type ReviewFigmaFrameConfig,
} from '../figma';
import { FigmaRailIcon } from '../figma/figma-mark-icon';
import { FigmaImagesPanel } from '../figma/images.panel';
import { QaItemEditModal } from '../qa/item.edit.modal';
import { ReviewQaPanel } from '../qa/panel';
import { PresenceOverlay } from '../presence/overlay';
import {
  getSourceCandidates,
  getSourceOpenUrl,
  openSourceInEditor,
  type GetSourceCandidatesOptions,
  type SourceOpenOptions,
} from '../source.open';
import {
  getSectionOutline,
  type GetSectionOutlineOptions,
  type SectionOutlineEntry,
} from '../section.outline';
import { SectionOutlinePanel } from './section.outline.panel';
import { createSourceShortcutStyle } from './source.shortcut.style';
import {
  SourceInspectorOverlay,
  type SourceInspectorCandidate,
  type SourceInspectorRect,
  type SourceInspectorState,
} from './source.inspector.overlay';
import { ReviewTargetFrame } from '../target/frame';
import { createReviewTargetFigmaImageOverlays } from '../target/figma.image.overlay';
import { setTargetFigmaOverlayLocked } from '../target/target';
import { ReviewTopbar } from '../topbar';
import { useReviewController } from '../hooks/use.review.controller';
import { useReviewPresence } from '../hooks/use.review.presence';
import { useReviewRuler } from '../hooks/use.review.ruler';
import { useReviewFigmaImages } from '../hooks/use.review.figma.images';
import { useReviewSettings } from '../hooks/use.review.settings';
import { useReviewShellData } from '../hooks/use.review.shell.data';
import { useReviewShellHotkeys } from '../hooks/use.review.shell.hotkeys';
import { useReviewShellState } from '../hooks/use.review.shell.state';
import {
  getInitialReviewSidePanel,
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
  updateReviewItemAssignee,
  updateReviewItemDetails,
  updateReviewItemStatus,
} from './shell.actions';
import {
  centerFrameScrollOnElement,
  filterSectionOutlineEntries,
  getDefaultCollapsedSectionOutlineIds,
  getReviewModeWriteMode,
  getSectionOutlineEntryCount,
  getSectionOutlineFilterTerms,
  scrollElementInTarget,
  waitForFrame,
  waitForMs,
} from './shell.helpers';

type ReviewSidePanel = StoredReviewSidePanel;
type SourceTreeMetaVisibilityKey = keyof StoredSourceTreeMetaVisibility;

const SOURCE_PANEL_MAX_WIDTH = 440;
const SOURCE_PANEL_MIN_WIDTH = 240;
const SOURCE_PANEL_MAX_HEIGHT = 260;
const SOURCE_TREE_PANEL_CLOSE_DELAY_MS = 180;

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
  presence,
  figmaImages,
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
  const [isInitialPromptScriptOpen, setIsInitialPromptScriptOpen] =
    useState(false);
  const resolvedReviewSourceOptions = useMemo(
    () => resolveReviewSourceOptions({ sourceInspector, sourceRoot }),
    [sourceInspector, sourceRoot]
  );
  const resolvedSourceInspector = resolvedReviewSourceOptions.sourceInspector;
  const resolvedSourceRoot = resolvedReviewSourceOptions.sourceRoot;
  const sourceOpenOptions = useMemo<SourceOpenOptions>(
    () => ({
      ...resolvedSourceInspector,
      sourceRoot: resolvedSourceRoot,
    }),
    [resolvedSourceInspector, resolvedSourceRoot]
  );
  const sourceCandidateOptions = useMemo<GetSourceCandidatesOptions>(
    () => ({
      ignore: resolvedSourceInspector?.ignore,
      includePlacer: resolvedSourceInspector?.includePlacer,
    }),
    [resolvedSourceInspector]
  );
  const sectionOutlineOptions = useMemo<GetSectionOutlineOptions>(
    () => ({
      includePlacer: resolvedSourceInspector?.includePlacer,
      ignore: resolvedSourceInspector?.ignore,
      maxDepth: resolvedSourceInspector?.maxDepth,
    }),
    [resolvedSourceInspector]
  );
  const isSourceInspectorEnabled = resolvedSourceInspector?.enabled !== false;
  const [sidePanel, setSidePanel] = useState<ReviewSidePanel>(() => {
    const initialSidePanel = getInitialReviewSidePanel();
    if (initialSidePanel) return initialSidePanel;
    if (getInitialItemId()) return 'qa';
    return isSourceInspectorEnabled ? getStoredReviewSidePanel() : 'qa';
  });
  const figmaImageStore = useMemo(
    () => getReviewFigmaImageStore(figmaImages),
    [figmaImages]
  );
  const isFigmaImageManagementEnabled = Boolean(figmaImageStore);
  const figmaImageFormat =
    figmaImages?.imageFormat ?? DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT;
  const isSourceTreeHoverOutlineEnabled =
    resolvedSourceInspector?.hoverOutline !== false;
  const isQaPanelVisible = isListVisible && sidePanel === 'qa';
  const isSourceTreePanelVisible =
    isSourceInspectorEnabled && isListVisible && sidePanel === 'source';
  const isFigmaImagesPanelVisible =
    isFigmaImageManagementEnabled &&
    isListVisible &&
    sidePanel === 'figma-images';

  useEffect(() => {
    if (isSourceInspectorEnabled || sidePanel !== 'source') return;
    setSidePanel('qa');
  }, [isSourceInspectorEnabled, sidePanel]);

  useEffect(() => {
    if (isFigmaImageManagementEnabled || sidePanel !== 'figma-images') return;
    setSidePanel('qa');
  }, [isFigmaImageManagementEnabled, sidePanel]);

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
    items,
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
  const itemRefreshIdRef = useRef(0);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [mutatingItemIds, setMutatingItemIds] = useState<Set<string>>(
    () => new Set()
  );
  const {
    addImage: addFigmaImage,
    deleteImage: deleteFigmaImage,
    error: figmaImageError,
    imageOverlayStates: figmaImageOverlayStates,
    images: figmaImageList,
    isAnyImageOverlayVisible: isAnyFigmaImageOverlayVisible,
    isLoading: isFigmaImageLoading,
    isMutating: isFigmaImageMutating,
    refreshImages: refreshFigmaImages,
    reorderImages: reorderFigmaImages,
    selectedImageId: selectedFigmaImageId,
    setImageOverlayOffsetY: setFigmaImageOverlayOffsetY,
    setImageOverlayOpacity: setFigmaImageOverlayOpacity,
    setSelectedImageId: setSelectedFigmaImageId,
    target: figmaImageTarget,
    toggleAllImageOverlayVisible: toggleAllFigmaImageOverlayVisible,
    toggleImageOverlayLocked: toggleFigmaImageOverlayLocked,
    toggleImageOverlayMode: toggleFigmaImageOverlayMode,
    toggleImageOverlayVisible: toggleFigmaImageOverlayVisible,
    updateImage: updateFigmaImage,
  } = useReviewFigmaImages({
    imageFormat: figmaImageFormat,
    pageUrl: target,
    projectId,
    store: figmaImageStore,
    viewport: size,
  });
  const [targetFigmaState, setTargetFigmaState] =
    useState<{ targetSrc: string; config: ReviewFigmaFrameConfig } | null>(null);
  const targetFigmaConfig =
    targetFigmaState?.targetSrc === targetSrc ? targetFigmaState.config : null;
  const isFigmaOverlayAvailable =
    !isFigmaImageManagementEnabled &&
    isViewportFigmaOverlayAvailable &&
    Boolean(targetFigmaConfig);
  const [editingItem, setEditingItem] = useState<ReviewItem | null>(null);
  const initialPromptText = initialPrompt.trim();
  const refreshItems = useCallback(
    async () => {
      const requestId = ++itemRefreshIdRef.current;
      setIsItemsLoading(true);

      try {
        return await refreshReviewItems({
          activeRoute,
          adapter,
          isRemoteSource,
          pageId: activeAdapterEntry.pageId,
          projectId,
          onItemsChange: setItems,
        });
      } finally {
        if (itemRefreshIdRef.current === requestId) {
          setIsItemsLoading(false);
        }
      }
    },
    [
      activeAdapterEntry.pageId,
      activeRoute,
      adapter,
      isRemoteSource,
      projectId,
      setItems,
    ]
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
    defaultReviewUserId: activeAdapterEntry.defaultUserId,
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
    fields: activeAdapterEntry.fields,
    assigneeTitle: activeAdapterEntry.assigneeTitle,
    assigneeOptions: activeAdapterEntry.assigneeOptions,
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

  useEffect(() => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;

    const item = items.find(
      (candidate) =>
        candidate.id === itemId || candidate.externalIssueId === itemId
    );
    if (!item) return;

    restoreReviewItem(item);
  }, [items, pendingInitialItemIdRef, restoreReviewItem]);

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
    const normalizedRoute = getTargetRouteKey(
      normalizedTarget,
      reviewPathPrefix
    );
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
    setActiveRoute(normalizedRoute);
    setDraftTarget(normalizedTarget);
    setSize(nextSize);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, nextSize, nextSource);
    if (isCurrentTarget) reloadTargetFrame();
  };

  const selectPage = (href: string) => {
    const normalizedTarget = normalizeTarget(href, reviewPathPrefix);
    const normalizedRoute = getTargetRouteKey(
      normalizedTarget,
      reviewPathPrefix
    );
    clearSelectedItem();
    setIsAllQaVisible(false);
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedRoute);
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

  const toggleFigmaImagesPanel = useCallback(() => {
    if (!isFigmaImageManagementEnabled) return;

    if (sidePanel === 'figma-images' && isListVisible) {
      setIsListVisible(false);
      return;
    }

    setSidePanel('figma-images');
    setIsListVisible(true);
  }, [
    isFigmaImageManagementEnabled,
    isListVisible,
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

      const rect = entry.element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        showToast('Component has no visible area here');
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
    style.textContent = createSourceShortcutStyle(
      optionAttribute,
      fontOverlayAttribute,
    );

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

  const withItemMutation = async <T,>(
    itemId: string,
    action: () => Promise<T>
  ) => {
    setMutatingItemIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(itemId);
      return nextIds;
    });

    try {
      return await action();
    } finally {
      setMutatingItemIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(itemId);
        return nextIds;
      });
    }
  };
  const showItemMutationError = (error: unknown, fallback: string) => {
    showToast(
      error instanceof Error && error.message ? error.message : fallback
    );
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
    try {
      await withItemMutation(item.id, () =>
        updateReviewItemStatus({
          activeAdapterEntry,
          item,
          nextStatus,
          onRefreshReviewData: refreshReviewData,
          onToast: showToast,
        })
      );
    } catch (error) {
      showItemMutationError(error, 'QA status update failed');
    }
  };

  const changeItemAssignee = async (
    item: ReviewItem,
    assigneeId: string | null
  ) => {
    try {
      await withItemMutation(item.id, () =>
        updateReviewItemAssignee({
          activeAdapterEntry,
          item,
          assigneeId,
          onRefreshReviewData: refreshReviewData,
          onToast: showToast,
        })
      );
    } catch (error) {
      showItemMutationError(error, 'QA assignee update failed');
    }
  };

  const saveItemDetails = async (
    item: ReviewItem,
    patch: Pick<ReviewItem, 'comment'> & Partial<Pick<ReviewItem, 'title'>>
  ) => {
    try {
      await withItemMutation(item.id, () =>
        updateReviewItemDetails({
          activeAdapterEntry,
          fields: activeAdapterEntry.fields,
          item,
          ...patch,
          onRefreshReviewData: refreshReviewData,
          onToast: showToast,
        })
      );
      setEditingItem(null);
    } catch (error) {
      showItemMutationError(error, 'QA update failed');
      throw error;
    }
  };

  const submitItem = async (numberedItem: NumberedReviewItem) => {
    try {
      await withItemMutation(numberedItem.item.id, () =>
        submitReviewItem({
          localAdapterEntry,
          numberedItem,
          remoteAdapterEntry,
          selectedItemIdRef,
          onClearSelectedItem: clearSelectedItem,
          onRefreshReviewData: refreshReviewData,
          onToast: showToast,
        })
      );
    } catch (error) {
      showItemMutationError(error, 'QA submit failed');
    }
  };

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
        getItemFrameTarget(item, reviewPathPrefix),
        getRestoredSize(item, viewportPresets),
        item.id,
        source
      ).href,
      `link:${item.id}`,
      'QA link copied'
    );
  };

  const copyRemoteIssuePath = (item: ReviewItem) => {
    const path = getUrlPathWithoutOrigin(item.externalIssueUrl);
    if (!path) {
      showToast('QA link not found');
      return Promise.resolve();
    }

    return copyPrompt(path, `remote-link:${item.id}`, 'QA path copied');
  };

  const removeItem = async (item: ReviewItem) => {
    try {
      await withItemMutation(item.id, () =>
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
        })
      );
    } catch (error) {
      showItemMutationError(error, 'QA delete failed');
    }
  };

  const figmaImageOverlays = createReviewTargetFigmaImageOverlays({
    imageOverlayStates: figmaImageOverlayStates,
    images: figmaImageList,
  });

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
        figmaOverlayUnavailableMessage={
          isFigmaImageManagementEnabled
            ? 'No Figma images on this viewport.'
            : undefined
        }
        isFigmaOverlayActive={
          isFigmaImageManagementEnabled
            ? isAnyFigmaImageOverlayVisible
            : targetOverlayState.figma
        }
        isFigmaOverlayAvailable={
          isFigmaImageManagementEnabled
            ? figmaImageList.length > 0
            : isFigmaOverlayAvailable
        }
        onDraftTargetChange={setDraftTarget}
        onApplyTarget={applyTarget}
        onOpenSitemap={() => setIsSitemapOpen(true)}
        onCopyCurrentUrl={() => void copyCurrentUrl()}
        onSizeChange={setSize}
        onToggleFigmaOverlay={
          isFigmaImageManagementEnabled
            ? toggleAllFigmaImageOverlayVisible
            : () => toggleTargetOverlay('figma')
        }
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

      {isInitialPromptOpen && <PromptModal onClose={closePromptModal} />}

      {isInitialPromptScriptOpen && (
        <InitialPromptModal
          initialPromptText={initialPromptText}
          copiedPromptKey={copiedPromptKey}
          onClose={() => setIsInitialPromptScriptOpen(false)}
          onCopyPrompt={(text, key) => void copyPrompt(text, key)}
        />
      )}

      {editingItem && (
        <QaItemEditModal
          fields={activeAdapterEntry.fields}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={saveItemDetails}
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
            <QaListIcon />
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
        {isFigmaImageManagementEnabled && (
          <button
            aria-label={
              isFigmaImagesPanelVisible
                ? 'Hide Figma images'
                : 'Show Figma images'
            }
            aria-pressed={isFigmaImagesPanelVisible}
            className={`df-review-side-toggle${
              isFigmaImagesPanelVisible ? ' is-active' : ''
            }`}
            type="button"
            onClick={toggleFigmaImagesPanel}
            title="Figma Images"
          >
            <span aria-hidden="true">
              <FigmaRailIcon />
            </span>
          </button>
        )}
        <div className="df-review-side-actions">
          <button
            aria-label="Open initial prompt"
            className="df-review-side-toggle"
            type="button"
            onClick={() => setIsInitialPromptScriptOpen(true)}
            title="Initial prompt"
          >
            <span aria-hidden="true">
              <BotIcon />
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
          <span className="df-review-side-divider" aria-hidden="true" />
          <button
            aria-label="Open about"
            className="df-review-side-toggle"
            type="button"
            onClick={() => {
              setIsInitialPromptOpen(true);
            }}
            title="About"
          >
            <span aria-hidden="true">
              <DfLogoIcon />
            </span>
          </button>
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
        isLoading={isItemsLoading}
        isRemoteSource={isRemoteSource}
        mutatingItemIds={mutatingItemIds}
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
        fields={activeAdapterEntry.fields}
        assigneeTitle={activeAdapterEntry.assigneeTitle}
        onChangeItemStatus={changeItemStatus}
        onClearSelectedItem={clearSelectedReviewItem}
        onChangeItemAssignee={changeItemAssignee}
        onChangeReviewSource={changeReviewSource}
        onCopyItemLabel={(numberedItem) => void copyItemLabel(numberedItem)}
        onCopyItemLink={(numberedItem) => void copyItemLink(numberedItem)}
        onCopyItemPrompt={(numberedItem) => void copyItemPrompt(numberedItem)}
        onCopyRemoteIssuePath={copyRemoteIssuePath}
        onEditItem={setEditingItem}
        onQaFilterChange={setQaFilter}
        onQaStatusFilterChange={setQaStatusFilter}
        onRefreshReviewData={refreshReviewData}
        onRemoveItem={removeItem}
        onRestoreReviewItem={restoreReviewItem}
        onSubmitItem={submitItem}
        onToggleItemOverlayVisibility={toggleItemOverlayVisibility}
      />

      {isFigmaImageManagementEnabled && (
        <FigmaImagesPanel
          error={figmaImageError}
          imageOverlayStates={figmaImageOverlayStates}
          images={figmaImageList}
          isListVisible={isFigmaImagesPanelVisible}
          isLoading={isFigmaImageLoading}
          isMutating={isFigmaImageMutating}
          selectedImageId={selectedFigmaImageId}
          onAddImage={addFigmaImage}
          onDeleteImage={deleteFigmaImage}
          onRefreshImages={refreshFigmaImages}
          onReorderImages={reorderFigmaImages}
          onSelectImage={setSelectedFigmaImageId}
          onSetImageOverlayOffsetY={setFigmaImageOverlayOffsetY}
          onSetImageOverlayOpacity={setFigmaImageOverlayOpacity}
          onToggleImageOverlayLocked={toggleFigmaImageOverlayLocked}
          onToggleImageOverlayMode={toggleFigmaImageOverlayMode}
          onToggleImageOverlayVisible={toggleFigmaImageOverlayVisible}
          onUpdateImage={updateFigmaImage}
        />
      )}

      {isSourceInspectorEnabled && (
        <SectionOutlinePanel
          isPanelVisible={isSourceTreePanelVisible}
          isFiltering={isSectionOutlineFiltering}
          filteredCount={filteredSectionOutlineCount}
          totalCount={sectionOutlineTotalCount}
          rootCount={sectionOutline?.length ?? 0}
          filter={sectionOutlineFilter}
          entries={filteredSectionOutline}
          collapsedIds={collapsedSectionOutlineIds}
          canWriteDom={canWriteDom}
          isBoxMetaVisible={isSectionOutlineBoxMetaVisible}
          isFontMetaVisible={isSectionOutlineFontMetaVisible}
          isMediaMetaVisible={isSectionOutlineMediaMetaVisible}
          isClassMetaVisible={isSectionOutlineClassMetaVisible}
          onToggleMeta={updateSectionOutlineMetaVisibility}
          onFilterChange={updateSectionOutlineFilter}
          onToggleEntry={toggleSectionOutlineEntry}
          onScrollToSection={scrollToSection}
          onOpenData={openSectionData}
          onOpenSource={openSectionSource}
          onStartDomReview={startSectionDomReview}
          onHoverElement={showSourceOutlineForElement}
          onClearHover={clearSourceOutlineHover}
        />
      )}

      <ReviewTargetFrame
        canWriteArea={canWriteArea}
        canWriteDom={canWriteDom}
        figmaImageOverlays={figmaImageOverlays}
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
        onSetFigmaImageOverlayOffsetY={setFigmaImageOverlayOffsetY}
        onSetReviewMode={setReviewMode}
      />

      <SourceInspectorOverlay
        state={sourceInspectorState}
        interactionRef={sourceInspectorInteractionRef}
        onClear={clearSourceInspector}
        onOpenCandidate={openSourceCandidate}
      />
    </div>
  );
};

function getUrlPathWithoutOrigin(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return trimmed;
  }
}
