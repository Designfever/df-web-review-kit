import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  GripVertical as GripVerticalIcon,
} from 'lucide-react';
import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemStatus,
  ReviewMode,
  ReviewSource,
} from '../../types';

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
  getSourceCandidates,
  getSourceOpenUrl,
  openSourceInEditor,
  type SourceCandidate,
  type SourceOpenOptions,
} from '../source.open';
import { ReviewTargetFrame } from '../target/frame';
import { ReviewTopbar } from '../topbar';
import { useReviewController } from '../hooks/use.review.controller';
import { useReviewPresence } from '../hooks/use.review.presence';
import { useReviewRuler } from '../hooks/use.review.ruler';
import { useReviewSettings } from '../hooks/use.review.settings';
import { useReviewShellData } from '../hooks/use.review.shell.data';
import { useReviewShellHotkeys } from '../hooks/use.review.shell.hotkeys';
import { useReviewShellState } from '../hooks/use.review.shell.state';
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

const SOURCE_PANEL_MAX_WIDTH = 440;
const SOURCE_PANEL_MIN_WIDTH = 240;
const SOURCE_PANEL_MAX_HEIGHT = 260;

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
  const [isAllQaVisible, setIsAllQaVisible] = useState(false);
  const sourceOpenOptions = useMemo<SourceOpenOptions>(
    () => ({
      ...sourceInspector,
      sourceRoot,
    }),
    [sourceInspector, sourceRoot]
  );
  const isSourceInspectorEnabled = sourceInspector?.enabled !== false;
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
    closeTargetOverlay,
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
    if (nextMode === 'element') {
      closeTargetOverlay('figma');
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

  const clearSourceInspector = useCallback(() => {
    sourceInspectorInteractionRef.current = false;
    setSourceInspectorState(null);
  }, []);

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
      const candidates = getSourceCandidates(target).map((candidate) => ({
        ...candidate,
        openUrl: getSourceOpenUrl(candidate.source, {
          ...sourceOpenOptions,
          omitPosition: !candidate.usesPosition,
        }),
      }));
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
      sourceOpenOptions,
    ]
  );

  const showSourceOutlineForTarget = useCallback(
    (target: EventTarget | null) => {
      const firstCandidate = getSourceCandidates(target)[0];
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
    [getSourceInspectorRect]
  );

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
        font: 700 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
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
        font: 800 11px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
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
      lastSourceTarget = event.target;
      const candidates = getSourceCandidates(event.target);
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
    showSourceOutlineForTarget,
    showSourceInspectorForTarget,
  ]);

  useEffect(() => {
    return cleanupSourceOpenShortcut;
  }, [cleanupSourceOpenShortcut]);

  const loadTargetFrame = useCallback(() => {
    initReviewKit();
    refreshTargetFigmaConfig();
    bindSourceOpenShortcut();
  }, [bindSourceOpenShortcut, initReviewKit, refreshTargetFigmaConfig]);

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
          setIsInitialPromptOpen(true);
        }}
        onOpenSettings={openFigmaSettings}
      />

      {currentPagePresenceUsers.length > 0 && (
        <div className="df-review-presence-row">
          <PresenceOverlay
            presenceSessionId={presenceSessionId}
            users={currentPagePresenceUsers}
          />
        </div>
      )}

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

      <ReviewQaPanel
        activeAdapterEntry={activeAdapterEntry}
        activeItems={activeItems}
        activeRemainingItemCount={activeRemainingItemCount}
        currentPresetScope={currentPresetScope}
        filteredNumberedActiveItems={filteredNumberedActiveItems}
        getItemPresetScope={getItemPresetScope}
        hiddenOverlayItemIds={hiddenOverlayItemIds}
        isListVisible={isListVisible}
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
                    className="df-review-source-candidate"
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
                      <small>
                        {candidate.positionLabel ||
                          (candidate.usesPosition ? '' : 'file only')}
                      </small>
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
