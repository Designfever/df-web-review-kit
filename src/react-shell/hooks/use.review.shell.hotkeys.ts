import { useEffect } from 'react';
import { bindReviewPageShortcut } from '../review.page.shortcut';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellRefs } from '../store/shell.refs';
import { getHotkeyActionKey, isHotkey } from '../../core/hotkey';
import type { ReviewMode } from '../../types';
import { useReviewShellStore } from '../store/store.context';
import { isEditableEventTarget } from '../../core/hotkey';
import type { TargetOverlayKey } from '../types';

interface UseReviewShellHotkeysOptions {
  isRailHotkeyBlocked: boolean;
  isFigmaSettingsOpen: boolean;
  isFigmaOverlayAvailable: boolean;
  onCancelReviewMode: () => boolean;
  onCloseFigmaSettings: () => void;
  onSetReviewMode: (mode: ReviewMode) => void;
  onToggleComponentListPanel: () => void;
  onToggleFigmaOverlay: () => void;
  onToggleFigmaImagesPanel: () => void;
  onToggleQaPanel: () => void;
  onToggleDesignInspector: () => void;
  onToggleTargetOverlay: (overlay: TargetOverlayKey) => void;
}

export const useReviewShellHotkeys = ({
  isRailHotkeyBlocked,
  isFigmaSettingsOpen,
  isFigmaOverlayAvailable,
  onCancelReviewMode,
  onCloseFigmaSettings,
  onSetReviewMode,
  onToggleComponentListPanel,
  onToggleFigmaOverlay,
  onToggleFigmaImagesPanel,
  onToggleQaPanel,
  onToggleDesignInspector,
  onToggleTargetOverlay,
}: UseReviewShellHotkeysOptions) => {
  const { iframeRef } = useReviewShellRefs();
  const { reviewPathPrefix } = useReviewShellConfig();
  const targetFrameLoadVersion = useReviewShellStore((state) => state.targetFrameLoadVersion);
  useEffect(() => {
    if (isRailHotkeyBlocked) return;
    return bindReviewPageShortcut(reviewPathPrefix, iframeRef.current);
  }, [isRailHotkeyBlocked, reviewPathPrefix, iframeRef, targetFrameLoadVersion]);
  const isInitialPromptOpen = useReviewShellStore(
    (state) => state.isInitialPromptOpen
  );
  const isSitemapOpen = useReviewShellStore((state) => state.isSitemapOpen);
  const mode = useReviewShellStore((state) => state.mode);
  const setIsInitialPromptOpen = useReviewShellStore(
    (state) => state.setIsInitialPromptOpen
  );
  const setIsSitemapOpen = useReviewShellStore(
    (state) => state.setIsSitemapOpen
  );

  useEffect(() => {
    if (
      mode === 'idle' &&
      !isInitialPromptOpen &&
      !isSitemapOpen &&
      !isFigmaSettingsOpen
    ) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (mode !== 'idle' && onCancelReviewMode()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (isInitialPromptOpen) {
        setIsInitialPromptOpen(false);
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (isSitemapOpen) {
        setIsSitemapOpen(false);
        return;
      }

      if (isFigmaSettingsOpen) {
        onCloseFigmaSettings();
      }
    };

    return bindShellAndFrameKeydown(iframeRef.current, handleKeyDown);
  }, [
    isFigmaSettingsOpen,
    isInitialPromptOpen,
    isSitemapOpen,
    mode,
    onCancelReviewMode,
    onCloseFigmaSettings,
    iframeRef,
    targetFrameLoadVersion,
    setIsInitialPromptOpen,
    setIsSitemapOpen,
  ]);

  useEffect(() => {
    const handleHotkey = (event: KeyboardEvent) => {
      if (isRailHotkeyBlocked || event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      if (isEditableEventTarget(event)) return;

      const actions: Record<string, () => void> = {
        g: () => onToggleTargetOverlay('grid'),
        f: () => {
          if (isFigmaOverlayAvailable) onToggleFigmaOverlay();
        },
        e: () => onSetReviewMode('element'),
        a: () => onSetReviewMode('area'),
      };
      const actionKey = getHotkeyActionKey(event, Object.keys(actions));
      const action = actionKey ? actions[actionKey] : undefined;
      if (!action) return;

      event.preventDefault();
      action();
    };

    return bindShellAndFrameKeydown(iframeRef.current, handleHotkey);
  }, [
    isRailHotkeyBlocked,
    isFigmaOverlayAvailable,
    onSetReviewMode,
    onToggleFigmaOverlay,
    iframeRef,
    targetFrameLoadVersion,
    onToggleTargetOverlay,
  ]);

  useEffect(() => {
    const handleRailHotkey = (event: KeyboardEvent) => {
      if (isRailHotkeyBlocked || event.repeat || isEditableEventTarget(event)) return;

      const actions = [
        { hotkey: 'Shift+1', run: onToggleDesignInspector },
        { hotkey: 'Shift+2', run: onToggleFigmaImagesPanel },
        { hotkey: 'Shift+3', run: onToggleQaPanel },
        { hotkey: 'Shift+4', run: onToggleComponentListPanel },
      ];
      const action = actions.find(({ hotkey }) => isHotkey(event, hotkey));
      if (!action) return;

      event.preventDefault();
      event.stopPropagation();
      action.run();
    };

    return bindShellAndFrameKeydown(iframeRef.current, handleRailHotkey);
  }, [
    isRailHotkeyBlocked,
    onToggleComponentListPanel,
    onToggleFigmaImagesPanel,
    onToggleQaPanel,
    onToggleDesignInspector,
    iframeRef,
    targetFrameLoadVersion,
  ]);
};

function bindShellAndFrameKeydown(frame: HTMLIFrameElement | null, handler: (event: KeyboardEvent) => void) {
  const targets = new Set<Window>([window]);
  try {
    if (frame?.contentDocument && frame.contentWindow) targets.add(frame.contentWindow);
  } catch {
    // Shell hotkeys remain available when the target is cross-origin.
  }
  targets.forEach((target) => target.addEventListener('keydown', handler, true));
  return () => targets.forEach((target) => target.removeEventListener('keydown', handler, true));
}
