import React, {
  useCallback,
  useEffect,
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
  normalizeTarget,
  updateShellUrl,
} from '../route';
import {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
} from '../viewport';
import {
  PromptModal,
  ReviewSettingsModal,
  SitemapModal,
} from '../shell.modals';
import { buildReviewItemPrompt } from '../prompt/prompt';
import { QaItemEditModal } from '../qa/item.edit.modal';
import { ReviewQaPanel } from '../qa/panel';
import {
  getElementSourceHint,
  getSourceHintElement,
  openSourceInEditor,
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

export const ReviewShell = ({
  projectId,
  pages,
  adapters,
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ruler,
  initialPrompt = DEFAULT_INITIAL_REVIEW_PROMPT,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
  sourceRoot,
  presence
}: ReviewShellProps) => {
  const {
    activeAdapterEntry,
    activeRoute,
    adapter,
    canWriteAny,
    canWriteArea,
    canWriteDom,
    canWriteNote,
    cleanupTargetRef,
    controllerRef,
    copiedPromptKey,
    copyLabel,
    draftTarget,
    frameScrollRef,
    hiddenOverlayItemIdListRef,
    iframeRef,
    isFigmaOverlayAvailable,
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
  const {
    activeItems,
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
    selectedNumberedItem,
    setHiddenOverlayItemIds,
    setItems,
    setQaFilter,
    setSitemapItems,
    targetSrc,
  } = useReviewShellData({
    activeRoute,
    pages,
    reviewPathPrefix,
    reviewViewportPresets,
    selectedItemId,
    size,
    target,
    viewportPresets,
  });
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

    if (!frameDocument) return;

    const hoverAttribute = 'data-dfwr-source-hover';
    const optionAttribute = 'data-dfwr-source-option';
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

      [${hoverAttribute}="true"] {
        outline: 2px solid rgba(124, 199, 255, 0.96) !important;
        outline-offset: 2px !important;
      }
    `;

    (frameDocument.head ?? frameDocument.documentElement).append(style);

    let hoveredElement: Element | null = null;
    let lastSourceElement: Element | null = null;
    let isSourceSelecting = false;

    const setHoveredElement = (element: Element | null) => {
      if (hoveredElement === element) return;
      hoveredElement?.removeAttribute(hoverAttribute);
      hoveredElement = element;
      hoveredElement?.setAttribute(hoverAttribute, 'true');
    };

    const setSourceSelecting = (isSelecting: boolean) => {
      isSourceSelecting = isSelecting;
      if (isSelecting) {
        frameDocument.documentElement.setAttribute(optionAttribute, 'true');
        setHoveredElement(lastSourceElement);
        return;
      }

      setHoveredElement(null);
      frameDocument.documentElement.removeAttribute(optionAttribute);
    };

    const handleMouseMove = (event: MouseEvent) => {
      lastSourceElement = getSourceHintElement(event.target);

      if (event.altKey && !isSourceSelecting) {
        setSourceSelecting(true);
      }

      setHoveredElement(isSourceSelecting ? lastSourceElement : null);
    };

    const handleClick = (event: MouseEvent) => {
      if (!isSourceSelecting && !event.altKey) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const source = getElementSourceHint(event.target);
      if (!source?.file) {
        showToast('Source hint not found');
        setSourceSelecting(false);
        return;
      }

      const didOpen = openSourceInEditor(source, sourceRoot);
      showToast(didOpen ? 'Source opened' : 'Source root required');
      setSourceSelecting(false);
    };

    const isOptionKeyEvent = (event: KeyboardEvent) =>
      event.key === 'Alt' ||
      event.code === 'AltLeft' ||
      event.code === 'AltRight' ||
      event.altKey;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOptionKeyEvent(event)) return;

      cancelReviewMode();
      setSourceSelecting(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isOptionKeyEvent(event) || !event.altKey) setSourceSelecting(false);
    };

    const handleBlur = () => {
      setSourceSelecting(false);
    };

    frameDocument.addEventListener('mousemove', handleMouseMove, true);
    frameDocument.addEventListener('click', handleClick, true);
    frameDocument.addEventListener('keydown', handleKeyDown, true);
    frameDocument.addEventListener('keyup', handleKeyUp, true);
    frameDocument.defaultView?.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);

    sourceShortcutCleanupRef.current = () => {
      frameDocument.removeEventListener('mousemove', handleMouseMove, true);
      frameDocument.removeEventListener('click', handleClick, true);
      frameDocument.removeEventListener('keydown', handleKeyDown, true);
      frameDocument.removeEventListener('keyup', handleKeyUp, true);
      frameDocument.defaultView?.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
      setSourceSelecting(false);
      style.remove();
    };
  }, [
    cancelReviewMode,
    cleanupSourceOpenShortcut,
    iframeRef,
    showToast,
    sourceRoot,
  ]);

  useEffect(() => {
    return cleanupSourceOpenShortcut;
  }, [cleanupSourceOpenShortcut]);

  const loadTargetFrame = useCallback(() => {
    initReviewKit();
    bindSourceOpenShortcut();
  }, [bindSourceOpenShortcut, initReviewKit]);

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
        currentPagePresenceUsers={currentPagePresenceUsers}
        currentPresetScope={currentPresetScope}
        filteredNumberedActiveItems={filteredNumberedActiveItems}
        getItemPresetScope={getItemPresetScope}
        hiddenOverlayItemIds={hiddenOverlayItemIds}
        isListVisible={isListVisible}
        isRemoteSource={isRemoteSource}
        presenceSessionId={presenceSessionId}
        copiedPromptKey={copiedPromptKey}
        qaFilter={qaFilter}
        qaFilterCounts={qaFilterCounts}
        remoteAdapterEntry={remoteAdapterEntry}
        selectedItemId={selectedItemId}
        showSourceSelect={showSourceSelect}
        sourceRoot={sourceRoot}
        source={source}
        sourceEntries={sourceEntries}
        onChangeItemStatus={changeItemStatus}
        onClearSelectedItem={clearSelectedReviewItem}
        onChangeReviewSource={changeReviewSource}
        onCopyItemPrompt={(numberedItem) => void copyItemPrompt(numberedItem)}
        onEditItem={setEditingItem}
        onQaFilterChange={setQaFilter}
        onRefreshReviewData={refreshReviewData}
        onRemoveItem={removeItem}
        onRestoreReviewItem={restoreReviewItem}
        onSubmitItem={submitItem}
        onToggleItemOverlayVisibility={toggleItemOverlayVisibility}
      />

      <ReviewTargetFrame
        canWriteAny={canWriteAny}
        canWriteArea={canWriteArea}
        canWriteDom={canWriteDom}
        canWriteNote={canWriteNote}
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
    </div>
  );
};
