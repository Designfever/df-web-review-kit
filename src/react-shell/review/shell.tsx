// 리뷰 셸의 최상위 컴포넌트. 상태는 store(slice)/config/refs context 로,
// feature UI 는 container 로 분리되어 있고 여기서는 조합만 담당한다.
//
// 구조 지도:
// - store/                      zustand slice (sidePanel/target/qa) + config/refs context
// - qa/panel.container          QA 패널 (아이템 목록/액션/수정 모달)
// - review/section.outline.container  Source Tree 패널
// - topbar.container            주소/뷰포트/복사/오버레이 토글 바
// - use.review.shell.state      과도기 상태 레이어 (mode/모달 로컬 상태 + store 조합)
// - use.review.shell.data       셸 공유 파생 데이터 (sitemap/topbar 카운트 등)
// - use.review.target.navigation target/source/page 이동 액션
// - use.review.command.key      ⌘ 누르는 동안 오버레이 숨김
// - use.review.source.inspector 소스 인스펙터 + Alt 단축키 바인딩
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
import { QaPanelContainer } from '../qa/panel.container';
import type {
  GetSourceCandidatesOptions,
  SourceOpenOptions,
} from '../source.open';
import type { GetSectionOutlineOptions } from '../section.outline';
import { SectionOutlineContainer } from './section.outline.container';
import { SourceInspectorOverlay } from './source.inspector.overlay';
import { ReviewSideRail } from './side.rail';
import { ReviewTargetFrame } from '../target/frame';
import { createReviewTargetFigmaImageOverlays } from '../target/figma.image.overlay';
import { setTargetFigmaOverlayLocked } from '../target/target';
import { TopbarContainer } from '../topbar.container';
import { useReviewCommandKey } from '../hooks/use.review.command.key';
import { useReviewController } from '../hooks/use.review.controller';
import { useReviewPresence } from '../hooks/use.review.presence';
import { useReviewRuler } from '../hooks/use.review.ruler';
import { useReviewFigmaImages } from '../hooks/use.review.figma.images';
import { useReviewSettings } from '../hooks/use.review.settings';
import { useReviewSidePanel } from '../hooks/use.review.side.panel';
import { useReviewShellData } from '../hooks/use.review.shell.data';
import { useReviewShellHotkeys } from '../hooks/use.review.shell.hotkeys';
import { useReviewShellState } from '../hooks/use.review.shell.state';
import { useReviewSourceInspector } from '../hooks/use.review.source.inspector';
import { useReviewTargetNavigation } from '../hooks/use.review.target.navigation';
import {
  copyReviewPrompt,
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
import {
  createReviewShellRefs,
  ReviewShellRefsProvider,
} from '../store/shell.refs';
import { getInitialTargetSliceState } from '../store/target.slice';
import {
  ReviewShellStoreProvider,
  useReviewShellStore,
  useReviewShellStoreApi,
} from '../store/store.context';

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
  const [refs] = useState(createReviewShellRefs);

  return (
    <ReviewShellConfigProvider value={config}>
      <ReviewShellStoreProvider value={store}>
        <ReviewShellRefsProvider value={refs}>
          <ReviewShellContent {...props} />
        </ReviewShellRefsProvider>
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
    draftTarget,
    frameScrollRef,
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
    setActiveRoute,
    setCopiedPromptKey,
    setDraftTarget,
    setIsInitialPromptOpen,
    setIsSitemapOpen,
    setMode,
    setSelectedItemId,
    setSize,
    setSource,
    setTarget,
    setTargetOverlayState,
    size,
    source,
    sourceEntries,
    target,
    targetOverlayState,
    toastMessage,
    viewportPresets,
    setToastMessage,
  } = useReviewShellState();
  const storeApi = useReviewShellStoreApi();
  const isAllQaVisible = useReviewShellStore((state) => state.isAllQaVisible);
  const setIsAllQaVisible = useReviewShellStore(
    (state) => state.setIsAllQaVisible
  );
  const isItemEditing = useReviewShellStore((state) =>
    Boolean(state.editingItem)
  );
  const [targetFrameLoadVersion, setTargetFrameLoadVersion] = useState(0);
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
    toggleSidePanel,
  } = useReviewSidePanel({
    isFigmaImageManagementEnabled,
    isSourceInspectorEnabled,
  });

  const {
    activeItems,
    allQaCount,
    hiddenOverlayItemIdList,
    items,
    pageQaCounts,
    pageTargets,
    presetScopeCounts,
    selectedNumberedItem,
    targetSrc,
  } = useReviewShellData();
  const itemRefreshIdRef = useRef(0);

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
      storeApi.getState().setIsItemsLoading(true);

      try {
        return await refreshReviewItems({
          activeRoute,
          adapter,
          isRemoteSource,
          pageId: activeAdapterEntry.pageId,
          projectId,
          onItemsChange: storeApi.getState().setItems,
        });
      } finally {
        if (itemRefreshIdRef.current === requestId) {
          storeApi.getState().setIsItemsLoading(false);
        }
      }
    },
    [
      activeAdapterEntry.pageId,
      activeRoute,
      adapter,
      isRemoteSource,
      projectId,
      storeApi,
    ]
  );

  const refreshSitemapItems = useCallback(
    () =>
      refreshSitemapReviewItems({
        localAdapterEntry,
        projectId,
        remoteAdapterEntry,
        onSitemapItemsChange: storeApi.getState().setSitemapItems,
      }),
    [localAdapterEntry, projectId, remoteAdapterEntry, storeApi]
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
    onClearItems: () => storeApi.getState().setItems([]),
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

  const toggleQaPanel = useCallback(() => {
    toggleSidePanel('qa');
  }, [toggleSidePanel]);

  const toggleSourceTreePanel = useCallback(() => {
    if (!isSourceInspectorEnabled) return;

    toggleSidePanel('source');
  }, [isSourceInspectorEnabled, toggleSidePanel]);

  const toggleFigmaImagesPanel = useCallback(() => {
    if (!isFigmaImageManagementEnabled) return;

    toggleSidePanel('figma-images');
  }, [
    isFigmaImageManagementEnabled,
    toggleSidePanel,
  ]);

  const copyInitialPrompt = useCallback(
    (value: string, key: string) =>
      copyReviewPrompt({
        key,
        value,
        onCopiedPromptKeyChange: setCopiedPromptKey,
        onToast: showToast,
      }),
    [setCopiedPromptKey, showToast]
  );

  useReviewShellHotkeys({
    isRailHotkeyBlocked:
      isFigmaSettingsOpen ||
      isInitialPromptOpen ||
      isInitialPromptScriptOpen ||
      isSitemapOpen ||
      isItemEditing,
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

  /** target iframe 로드 완료 시 리뷰킷과 부가 기능을 다시 연결한다.
      Source Tree 갱신은 아웃라인 훅이 targetFrameLoadVersion 을 보고 스스로 한다. */
  const loadTargetFrame = useCallback(() => {
    setTargetFrameLoadVersion((currentVersion) => currentVersion + 1);
    initReviewKit();
    refreshTargetFigmaConfig();
    setTargetFigmaOverlayLocked(
      iframeRef.current?.contentDocument,
      mode === 'element'
    );
    bindSourceOpenShortcut();
  }, [
    bindSourceOpenShortcut,
    iframeRef,
    initReviewKit,
    mode,
    refreshTargetFigmaConfig,
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
      <TopbarContainer
        presetScopeCounts={presetScopeCounts}
        isRulerAvailable={isRulerAvailable}
        isRulerVisible={isRulerVisible}
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
        onApplyTarget={applyTarget}
        onOpenSitemap={() => setIsSitemapOpen(true)}
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
          onCopyPrompt={(text, key) => void copyInitialPrompt(text, key)}
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

      <QaPanelContainer
        isListVisible={isQaPanelVisible}
        onChangeReviewSource={changeReviewSource}
        onClearSelectedItem={clearSelectedReviewItem}
        onRefreshReviewData={refreshReviewData}
        onRestoreReviewItem={restoreReviewItem}
        onToast={showToast}
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
        <SectionOutlineContainer
          isPanelVisible={isSourceTreePanelVisible}
          sectionOutlineOptions={sectionOutlineOptions}
          sourceOpenOptions={sourceOpenOptions}
          targetFrameLoadVersion={targetFrameLoadVersion}
          onClearHover={clearSourceOutlineHover}
          onClearSourceInspector={clearSourceInspector}
          onHoverElement={showSourceOutlineForElement}
          onInitReviewKit={initReviewKit}
          onModeChange={setMode}
          onShowQaPanel={showQaPanel}
          onToast={showToast}
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
