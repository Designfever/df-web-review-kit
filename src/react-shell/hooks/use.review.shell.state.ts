import {
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ReviewItem,
  ReviewMode,
  ReviewSource,
  WebReviewKitController,
} from '../../types';
import { normalizeReviewShellAdapters } from '../adapters';
import {
  getInitialItemId,
  getInitialSource,
  getInitialTarget,
} from '../route';
import type {
  ReviewShellAdapters,
  ReviewShellViewportPreset,
  TargetOverlayState,
} from '../types';
import {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
  getInitialSize,
  getIsFigmaOverlayAvailable,
  toReviewViewportPresets,
} from '../viewport';

interface UseReviewShellStateOptions {
  adapters: ReviewShellAdapters;
  presets: ReviewShellViewportPreset[];
  reviewPathPrefix: string;
}

export const useReviewShellState = ({
  adapters,
  presets,
  reviewPathPrefix,
}: UseReviewShellStateOptions) => {
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
  const canWriteArea = activeAdapterEntry.writeModes.includes('area');
  const canWriteDom = activeAdapterEntry.writeModes.includes('dom');
  const adapter = activeAdapterEntry.adapter;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const frameScrollRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<WebReviewKitController | null>(null);
  const cleanupTargetRef = useRef<(() => void) | null>(null);
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
  const [mode, setMode] = useState<ReviewMode>('idle');
  const [targetOverlayState, setTargetOverlayState] =
    useState<TargetOverlayState>({
      grid: false,
      figma: false,
    });
  const [selectedItemId, setSelectedItemId] = useState(getInitialItemId());
  const [isListVisible, setIsListVisible] = useState(true);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isInitialPromptOpen, setIsInitialPromptOpen] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy URL');
  const [toastMessage, setToastMessage] = useState('');
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);
  const targetRef = useRef(target);
  const sizeRef = useRef(size);
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
  };
};
