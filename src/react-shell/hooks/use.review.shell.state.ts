import {
  useRef,
  useState,
} from 'react';
import type {
  ReviewItem,
  ReviewMode,
  WebReviewKitController,
} from '../../types';
import { getInitialItemId } from '../route';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import { getIsFigmaOverlayAvailable } from '../viewport';

// target/source/size/route/overlay/QA 상태는 store slice 로 이동했다.
// 이 훅은 config + store 를 조합해 기존 반환 shape 을 유지하는 과도기 레이어다.
export const useReviewShellState = () => {
  const { reviewViewportPresets, viewportPresets } = useReviewShellConfig();
  const {
    activeAdapterEntry,
    adapter,
    canWriteArea,
    canWriteDom,
    isRemoteSource,
    localAdapterEntry,
    remoteAdapterEntry,
    showSourceSelect,
    source,
    sourceEntries,
  } = useReviewShellAdapterState();

  const activeRoute = useReviewShellStore((state) => state.activeRoute);
  const draftTarget = useReviewShellStore((state) => state.draftTarget);
  const size = useReviewShellStore((state) => state.size);
  const target = useReviewShellStore((state) => state.target);
  const targetOverlayState = useReviewShellStore(
    (state) => state.targetOverlayState
  );
  const setActiveRoute = useReviewShellStore((state) => state.setActiveRoute);
  const setDraftTarget = useReviewShellStore((state) => state.setDraftTarget);
  const setSize = useReviewShellStore((state) => state.setSize);
  const setSource = useReviewShellStore((state) => state.setSource);
  const setTarget = useReviewShellStore((state) => state.setTarget);
  const setTargetOverlayState = useReviewShellStore(
    (state) => state.setTargetOverlayState
  );
  const setSelectedItemId = useReviewShellStore(
    (state) => state.setSelectedItemId
  );
  const copiedPromptKey = useReviewShellStore(
    (state) => state.copiedPromptKey
  );
  const setCopiedPromptKey = useReviewShellStore(
    (state) => state.setCopiedPromptKey
  );

  const initialItemId = getInitialItemId();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const frameScrollRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<WebReviewKitController | null>(null);
  const cleanupTargetRef = useRef<(() => void) | null>(null);
  const pendingRestoreRef = useRef<ReviewItem | null>(null);
  const pendingInitialItemIdRef = useRef(initialItemId);

  const [mode, setMode] = useState<ReviewMode>('idle');
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isInitialPromptOpen, setIsInitialPromptOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy URL');
  const [toastMessage, setToastMessage] = useState('');
  const isFigmaOverlayAvailable = getIsFigmaOverlayAvailable(size);

  return {
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
    iframeRef,
    isFigmaOverlayAvailable,
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
  };
};
