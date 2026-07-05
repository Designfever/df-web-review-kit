import { useReviewShellRefs } from '../store/shell.refs';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import { getIsFigmaOverlayAvailable } from '../viewport';

// target/source/size/route/overlay/QA 상태는 store slice 로 이동했다.
// 이 훅은 config + store 를 조합해 기존 반환 shape 을 유지하는 과도기 레이어다.
export const useReviewShellState = () => {
  const {
    activeAdapterEntry,
    adapter,
    isRemoteSource,
    localAdapterEntry,
    remoteAdapterEntry,
    source,
  } = useReviewShellAdapterState();

  const activeRoute = useReviewShellStore((state) => state.activeRoute);
  const size = useReviewShellStore((state) => state.size);
  const target = useReviewShellStore((state) => state.target);
  const targetOverlayState = useReviewShellStore(
    (state) => state.targetOverlayState
  );
  const copiedPromptKey = useReviewShellStore(
    (state) => state.copiedPromptKey
  );
  const setCopiedPromptKey = useReviewShellStore(
    (state) => state.setCopiedPromptKey
  );
  const isInitialPromptOpen = useReviewShellStore(
    (state) => state.isInitialPromptOpen
  );
  const isInitialPromptScriptOpen = useReviewShellStore(
    (state) => state.isInitialPromptScriptOpen
  );
  const isSitemapOpen = useReviewShellStore((state) => state.isSitemapOpen);
  const mode = useReviewShellStore((state) => state.mode);
  const targetFrameLoadVersion = useReviewShellStore(
    (state) => state.targetFrameLoadVersion
  );
  const toastMessage = useReviewShellStore((state) => state.toastMessage);
  const bumpTargetFrameLoadVersion = useReviewShellStore(
    (state) => state.bumpTargetFrameLoadVersion
  );
  const setIsInitialPromptOpen = useReviewShellStore(
    (state) => state.setIsInitialPromptOpen
  );
  const setIsInitialPromptScriptOpen = useReviewShellStore(
    (state) => state.setIsInitialPromptScriptOpen
  );
  const setIsSitemapOpen = useReviewShellStore(
    (state) => state.setIsSitemapOpen
  );
  const setMode = useReviewShellStore((state) => state.setMode);

  const {
    controllerRef,
    frameScrollRef,
    iframeRef,
    pendingInitialItemIdRef,
    pendingRestoreRef,
  } = useReviewShellRefs();

  const isFigmaOverlayAvailable = getIsFigmaOverlayAvailable(size);

  return {
    activeAdapterEntry,
    activeRoute,
    adapter,
    controllerRef,
    copiedPromptKey,
    frameScrollRef,
    iframeRef,
    bumpTargetFrameLoadVersion,
    isFigmaOverlayAvailable,
    isInitialPromptOpen,
    isInitialPromptScriptOpen,
    isRemoteSource,
    isSitemapOpen,
    localAdapterEntry,
    mode,
    pendingInitialItemIdRef,
    pendingRestoreRef,
    remoteAdapterEntry,
    setCopiedPromptKey,
    setIsInitialPromptOpen,
    setIsInitialPromptScriptOpen,
    setIsSitemapOpen,
    setMode,
    size,
    source,
    target,
    targetFrameLoadVersion,
    targetOverlayState,
    toastMessage,
  };
};
