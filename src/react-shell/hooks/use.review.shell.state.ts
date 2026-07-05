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
import { getIsFigmaOverlayAvailable } from '../viewport';

// target/source/size/route/overlay 상태는 target slice 로 이동했다.
// 이 훅은 config + store 를 조합해 기존 반환 shape 을 유지하는 과도기 레이어다.
export const useReviewShellState = () => {
  const {
    localAdapterEntry,
    remoteAdapterEntry,
    reviewViewportPresets,
    showSourceSelect,
    sourceEntries,
    viewportPresets,
  } = useReviewShellConfig();

  const activeRoute = useReviewShellStore((state) => state.activeRoute);
  const draftTarget = useReviewShellStore((state) => state.draftTarget);
  const size = useReviewShellStore((state) => state.size);
  const source = useReviewShellStore((state) => state.source);
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

  const remoteSource = remoteAdapterEntry?.label ?? null;
  const activeAdapterEntry =
    sourceEntries.find((entry) => entry.label === source) ?? sourceEntries[0]!;
  const isRemoteSource = Boolean(
    remoteSource && activeAdapterEntry.label === remoteSource
  );
  const canWriteArea = activeAdapterEntry.writeModes.includes('area');
  const canWriteDom = activeAdapterEntry.writeModes.includes('dom');
  const adapter = activeAdapterEntry.adapter;

  const initialItemId = getInitialItemId();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const frameScrollRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<WebReviewKitController | null>(null);
  const cleanupTargetRef = useRef<(() => void) | null>(null);
  const pendingRestoreRef = useRef<ReviewItem | null>(null);
  const pendingInitialItemIdRef = useRef(initialItemId);
  const selectedItemIdRef = useRef(initialItemId);
  const hiddenOverlayItemIdListRef = useRef<string[]>([]);

  const [mode, setMode] = useState<ReviewMode>('idle');
  const [selectedItemId, setSelectedItemId] = useState(initialItemId);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isInitialPromptOpen, setIsInitialPromptOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy URL');
  const [toastMessage, setToastMessage] = useState('');
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);
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
    hiddenOverlayItemIdListRef,
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
  };
};
