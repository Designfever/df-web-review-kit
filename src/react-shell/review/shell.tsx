// 리뷰 셸의 최상위 컴포넌트. 상태 덩어리는 hooks/ 로 분리되어 있고
// 여기서는 훅들을 조합해 topbar / 패널 / target frame / 오버레이를 배치한다.
//
// 분리된 훅 지도:
// - use.review.shell.state      셸 전역 상태 (target/size/source/mode 등)
// - use.review.shell.data       아이템 목록/필터/카운트 파생 데이터
// - use.review.side.panel       사이드 패널 선택/열림 상태
// - use.review.target.navigation target/source/page 이동 액션
// - use.review.command.key      ⌘ 누르는 동안 오버레이 숨김
// - use.review.source.inspector 소스 인스펙터 + Alt 단축키 바인딩
// - use.review.section.outline  Source Tree(컴포넌트 아웃라인) 패널
// - use.review.item.actions     QA 아이템 mutation/복사 액션
// - use.review.controller       코어 리뷰킷 컨트롤러 연결
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ReviewItem,
  ReviewMode,
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
import { DEFAULT_REVIEW_PATH_PREFIX } from '../route';
import {
  InitialPromptModal,
  PromptModal,
  ReviewSettingsModal,
  SitemapModal,
} from '../shell.modals';
import {
  getReviewFigmaImageStore,
  getTargetFigmaFrameConfig,
  type ReviewFigmaFrameConfig,
} from '../figma';
import { FigmaImagesPanel } from '../figma/images.panel';
import { QaItemEditModal } from '../qa/item.edit.modal';
import { ReviewQaPanel } from '../qa/panel';
import type {
  GetSourceCandidatesOptions,
  SourceOpenOptions,
} from '../source.open';
import type { GetSectionOutlineOptions } from '../section.outline';
import { SectionOutlinePanel } from './section.outline.panel';
import { SourceInspectorOverlay } from './source.inspector.overlay';
import { ReviewSideRail } from './side.rail';
import { ReviewTargetFrame } from '../target/frame';
import { createReviewTargetFigmaImageOverlays } from '../target/figma.image.overlay';
import { setTargetFigmaOverlayLocked } from '../target/target';
import { ReviewTopbar } from '../topbar';
import { useReviewCommandKey } from '../hooks/use.review.command.key';
import { useReviewController } from '../hooks/use.review.controller';
import { useReviewItemActions } from '../hooks/use.review.item.actions';
import { useReviewPresence } from '../hooks/use.review.presence';
import { useReviewRuler } from '../hooks/use.review.ruler';
import { useReviewFigmaImages } from '../hooks/use.review.figma.images';
import { useReviewSectionOutline } from '../hooks/use.review.section.outline';
import { useReviewSettings } from '../hooks/use.review.settings';
import { useReviewSidePanel } from '../hooks/use.review.side.panel';
import { useReviewShellData } from '../hooks/use.review.shell.data';
import { useReviewShellHotkeys } from '../hooks/use.review.shell.hotkeys';
import { useReviewShellState } from '../hooks/use.review.shell.state';
import { useReviewSourceInspector } from '../hooks/use.review.source.inspector';
import { useReviewTargetNavigation } from '../hooks/use.review.target.navigation';
import {
  copyCurrentReviewUrl,
  refreshReviewItems,
  refreshSitemapReviewItems,
  refreshReviewData as refreshReviewDataAction,
} from './shell.actions';
import { getReviewModeWriteMode } from './shell.helpers';
import { createReviewShellStore } from '../store/create.review.shell.store';
import {
  createReviewShellConfig,
  ReviewShellConfigProvider,
} from '../store/shell.config';
import { getInitialTargetSliceState } from '../store/target.slice';
import { ReviewShellStoreProvider } from '../store/store.context';

// store 는 인스턴스마다 생성한다 (전역 아님). useState initializer 는 StrictMode 안전.
export const ReviewShell = (props: ReviewShellProps) => {
  const config = useMemo(
    () => createReviewShellConfig(props),
    [
      props.adapters,
      props.pages,
      props.presets,
      props.projectId,
      props.reviewPathPrefix,
    ]
  );
  const [store] = useState(() =>
    createReviewShellStore({ target: getInitialTargetSliceState(config) })
  );

  return (
    <ReviewShellConfigProvider value={config}>
      <ReviewShellStoreProvider value={store}>
        <ReviewShellContent {...props} />
      </ReviewShellStoreProvider>
    </ReviewShellConfigProvider>
  );
};

const ReviewShellContent = ({
  projectId,
  pages,
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
    setIsSitemapOpen,
    setMode,
    setSelectedItemId,
    setSize,
    setSource,
    setTarget,
    setTargetOverlayState,
    showSourceSelect,
    size,
    source,
    sourceEntries,
    target,
    targetOverlayState,
    toastMessage,
    viewportPresets,
    setToastMessage,
  } = useReviewShellState();
  const [targetFrameLoadVersion, setTargetFrameLoadVersion] = useState(0);
  const [isAllQaVisible, setIsAllQaVisible] = useState(false);
  const [isInitialPromptScriptOpen, setIsInitialPromptScriptOpen] =
    useState(false);

  // 소스 인스펙터 관련 옵션들. env(VITE_REVIEW_SOURCE_*) 값이 prop 보다 우선한다.
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
  const isSourceTreeHoverOutlineEnabled =
    resolvedSourceInspector?.hoverOutline !== false;

  const figmaImageStore = useMemo(
    () => getReviewFigmaImageStore(figmaImages),
    [figmaImages]
  );
  const isFigmaImageManagementEnabled = Boolean(figmaImageStore);
  const figmaImageFormat =
    figmaImages?.imageFormat ?? DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT;
  const {
    isFigmaImagesPanelVisible,
    isListVisible,
    isQaPanelVisible,
    isSourceTreePanelVisible,
    openSidePanel,
    sidePanel,
    toggleSidePanel,
  } = useReviewSidePanel({
    isFigmaImageManagementEnabled,
    isSourceInspectorEnabled,
  });

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

  // ⌘ 를 누르는 동안 모든 QA 오버레이를 잠시 숨긴다 (원본 비교용).
  const isCommandKeyPressed = useReviewCommandKey({
    iframeRef,
    targetFrameLoadVersion,
    targetSrc,
  });
  const effectiveHiddenOverlayItemIdList = useMemo(() => {
    if (!isCommandKeyPressed) return hiddenOverlayItemIdList;

    const itemIds = new Set(hiddenOverlayItemIdList);
    activeItems.forEach((item) => itemIds.add(item.id));
    return Array.from(itemIds);
  }, [activeItems, hiddenOverlayItemIdList, isCommandKeyPressed]);

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
  const initialPromptText = initialPrompt.trim();

  const refreshItems = useCallback(
    async () => {
      // 응답 역전 방지: 마지막 요청만 로딩 상태를 해제할 수 있다.
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

  const showToast = useCallback(
    (message: string) => {
      setToastMessage(message);
      window.setTimeout(() => {
        setToastMessage((current) => (current === message ? '' : current));
      }, 1600);
    },
    [setToastMessage]
  );

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
    hiddenOverlayItemIdList: effectiveHiddenOverlayItemIdList,
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
    source,
    target,
    targetOverlayState,
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

  // URL 에 item id 가 있으면 목록 로드 후 해당 아이템을 복원한다.
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

  // 패널 토글/뷰포트 변경 후 target frame 을 가로 중앙으로 다시 맞춘다.
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
    // 패널 여닫는 CSS 트랜지션이 끝난 뒤 한 번 더 보정한다.
    const transitionTimeout = window.setTimeout(centerFrameScroll, 180);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(transitionTimeout);
    };
  }, [isListVisible, size.height, size.width, syncTargetViewport, targetSrc]);

  const {
    applyTarget,
    changeReviewSource,
    clearSelectedReviewItem,
    getPageTarget,
    selectAllQa,
    selectPage,
  } = useReviewTargetNavigation({
    activeAdapterEntry,
    draftTarget,
    reviewPathPrefix,
    source,
    sourceEntries,
    viewportPresets,
    onActiveRouteChange: setActiveRoute,
    onAllQaVisibleChange: setIsAllQaVisible,
    onCancelReviewMode: cancelReviewMode,
    onClearItems: () => setItems([]),
    onClearSelectedItem: clearSelectedItem,
    onDraftTargetChange: setDraftTarget,
    onReloadTargetFrame: reloadTargetFrame,
    onRestoreReviewItem: restoreReviewItem,
    onSitemapOpenChange: setIsSitemapOpen,
    onSizeChange: setSize,
    onSourceChange: setSource,
    onTargetChange: setTarget,
  });

  const setReviewMode = (nextMode: ReviewMode) => {
    const writeMode = getReviewModeWriteMode(nextMode);
    if (writeMode && !activeAdapterEntry.writeModes.includes(writeMode)) return;
    closeRuler();
    if (writeMode && mode !== nextMode) {
      // 작성 모드 진입 시 QA 패널을 열어 draft 폼이 보이게 한다.
      openSidePanel('qa');
    }
    setControllerReviewMode(nextMode);
  };

  const copyCurrentUrl = () =>
    copyCurrentReviewUrl({
      onCopyLabelChange: setCopyLabel,
    });

  const refreshTargetFigmaConfig = useCallback(() => {
    const config = getTargetFigmaFrameConfig(
      iframeRef.current?.contentWindow
    );
    setTargetFigmaState(config ? { targetSrc, config } : null);
  }, [iframeRef, targetSrc]);

  // element 리뷰 중에는 target 의 figma 오버레이 조작을 잠근다.
  useEffect(() => {
    const targetDocument = iframeRef.current?.contentDocument;
    setTargetFigmaOverlayLocked(targetDocument, mode === 'element');
    return () => {
      setTargetFigmaOverlayLocked(targetDocument, false);
    };
  }, [iframeRef, mode, targetSrc]);

  const {
    bindSourceOpenShortcut,
    clearSourceInspector,
    clearSourceOutlineHover,
    openSourceCandidate,
    showSourceOutlineForElement,
    sourceInspectorInteractionRef,
    sourceInspectorState,
  } = useReviewSourceInspector({
    iframeRef,
    isSourceInspectorEnabled,
    isSourceTreeHoverOutlineEnabled,
    sourceCandidateOptions,
    sourceOpenOptions,
    targetSrc,
    onCancelReviewMode: cancelReviewMode,
    onToast: showToast,
  });

  const showQaPanel = useCallback(() => {
    openSidePanel('qa');
  }, [openSidePanel]);

  const {
    collapsedSectionOutlineIds,
    filteredSectionOutline,
    filteredSectionOutlineCount,
    isSectionOutlineFiltering,
    openSectionData,
    openSectionSource,
    openSectionUsageSource,
    refreshCurrentSectionOutline,
    scrollToSection,
    sectionOutline,
    sectionOutlineFilter,
    sectionOutlineMetaVisibility,
    sectionOutlineTotalCount,
    startSectionDomReview,
    toggleSectionOutlineEntry,
    updateSectionOutlineFilter,
    updateSectionOutlineMetaVisibility,
  } = useReviewSectionOutline({
    canWriteDom,
    controllerRef,
    frameScrollRef,
    iframeRef,
    isPanelVisible: isSourceTreePanelVisible,
    sectionOutlineOptions,
    sourceOpenOptions,
    targetFrameLoadVersion,
    targetSrc,
    onClearSourceInspector: clearSourceInspector,
    onInitReviewKit: initReviewKit,
    onModeChange: setMode,
    onShowQaPanel: showQaPanel,
    onToast: showToast,
  });

  const toggleQaPanel = useCallback(() => {
    toggleSidePanel('qa');
  }, [toggleSidePanel]);

  const toggleSourceTreePanel = useCallback(() => {
    if (!isSourceInspectorEnabled) return;

    if (sidePanel !== 'source' || !isListVisible) {
      refreshCurrentSectionOutline(true);
    }

    toggleSidePanel('source');
  }, [
    isListVisible,
    isSourceInspectorEnabled,
    refreshCurrentSectionOutline,
    sidePanel,
    toggleSidePanel,
  ]);

  const toggleFigmaImagesPanel = useCallback(() => {
    if (!isFigmaImageManagementEnabled) return;

    toggleSidePanel('figma-images');
  }, [
    isFigmaImageManagementEnabled,
    toggleSidePanel,
  ]);

  const {
    changeItemAssignee,
    changeItemStatus,
    clearEditingItem,
    copyItemLabel,
    copyItemLink,
    copyItemPrompt,
    copyPrompt,
    copyRemoteIssuePath,
    editingItem,
    mutatingItemIds,
    removeItem,
    saveItemDetails,
    setEditingItem,
    submitItem,
  } = useReviewItemActions({
    activeAdapterEntry,
    isRemoteSource,
    localAdapterEntry,
    remoteAdapterEntry,
    reviewPathPrefix,
    selectedItemIdRef,
    source,
    viewportPresets,
    onClearSelectedItem: clearSelectedItem,
    onCopiedPromptKeyChange: setCopiedPromptKey,
    onRefreshReviewData: refreshReviewData,
    onToast: showToast,
  });

  useReviewShellHotkeys({
    isRailHotkeyBlocked:
      isFigmaSettingsOpen ||
      isInitialPromptOpen ||
      isInitialPromptScriptOpen ||
      isSitemapOpen ||
      Boolean(editingItem),
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
    onToggleComponentListPanel: toggleSourceTreePanel,
    onToggleFigmaImagesPanel: toggleFigmaImagesPanel,
    onToggleQaPanel: toggleQaPanel,
    onToggleRuler: toggleRuler,
    onToggleTargetOverlay: toggleTargetOverlay,
  });

  /** target iframe 로드 완료 시 리뷰킷과 부가 기능을 다시 연결한다. */
  const loadTargetFrame = useCallback(() => {
    setTargetFrameLoadVersion((currentVersion) => currentVersion + 1);
    initReviewKit();
    refreshTargetFigmaConfig();
    setTargetFigmaOverlayLocked(
      iframeRef.current?.contentDocument,
      mode === 'element'
    );
    bindSourceOpenShortcut();
    if (isSourceTreePanelVisible) {
      refreshCurrentSectionOutline(true);
    }
  }, [
    bindSourceOpenShortcut,
    iframeRef,
    initReviewKit,
    isSourceTreePanelVisible,
    mode,
    refreshTargetFigmaConfig,
    refreshCurrentSectionOutline,
  ]);

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
          getPageTarget={getPageTarget}
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
          onClose={clearEditingItem}
          onSave={saveItemDetails}
        />
      )}

      {toastMessage && (
        <div className="df-review-copy-toast" role="status">
          {toastMessage}
        </div>
      )}

      <ReviewSideRail
        currentPagePresenceUsers={currentPagePresenceUsers}
        isFigmaImageManagementEnabled={isFigmaImageManagementEnabled}
        isFigmaImagesPanelVisible={isFigmaImagesPanelVisible}
        isQaPanelVisible={isQaPanelVisible}
        isSourceInspectorEnabled={isSourceInspectorEnabled}
        isSourceTreePanelVisible={isSourceTreePanelVisible}
        presenceSessionId={presenceSessionId}
        onOpenAbout={() => setIsInitialPromptOpen(true)}
        onOpenInitialPrompt={() => setIsInitialPromptScriptOpen(true)}
        onOpenSettings={openFigmaSettings}
        onToggleFigmaImagesPanel={toggleFigmaImagesPanel}
        onToggleQaPanel={toggleQaPanel}
        onToggleSourceTreePanel={toggleSourceTreePanel}
      />

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
          isBoxMetaVisible={sectionOutlineMetaVisibility.box}
          isFontMetaVisible={sectionOutlineMetaVisibility.font}
          isMediaMetaVisible={sectionOutlineMetaVisibility.media}
          isClassMetaVisible={sectionOutlineMetaVisibility.className}
          onToggleMeta={updateSectionOutlineMetaVisibility}
          onFilterChange={updateSectionOutlineFilter}
          onToggleEntry={toggleSectionOutlineEntry}
          onScrollToSection={scrollToSection}
          onOpenData={openSectionData}
          onOpenSource={openSectionSource}
          onOpenUsageSource={openSectionUsageSource}
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
