import { useEffect } from 'react';
import { getHotkeyActionKey, isHotkey } from '../../core/hotkey';
import type { ReviewMode } from '../../types';
import { useReviewShellStore } from '../store/store.context';
import { isEditableEventTarget } from '../target/target';
import type { TargetOverlayKey } from '../types';

interface UseReviewShellHotkeysOptions {
  isRailHotkeyBlocked: boolean;
  isFigmaSettingsOpen: boolean;
  isRulerAvailable: boolean;
  isRulerVisible: boolean;
  onCancelReviewMode: () => boolean;
  onCloseFigmaSettings: () => void;
  onCloseRuler: () => boolean;
  onSetReviewMode: (mode: ReviewMode) => void;
  onToggleComponentListPanel: () => void;
  onToggleFigmaImagesPanel: () => void;
  onToggleQaPanel: () => void;
  onToggleRuler: () => void;
  onToggleTargetOverlay: (overlay: TargetOverlayKey) => void;
}

export const useReviewShellHotkeys = ({
  isRailHotkeyBlocked,
  isFigmaSettingsOpen,
  isRulerAvailable,
  isRulerVisible,
  onCancelReviewMode,
  onCloseFigmaSettings,
  onCloseRuler,
  onSetReviewMode,
  onToggleComponentListPanel,
  onToggleFigmaImagesPanel,
  onToggleQaPanel,
  onToggleRuler,
  onToggleTargetOverlay,
}: UseReviewShellHotkeysOptions) => {
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
      !isRulerVisible &&
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

      if (onCloseRuler()) {
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isFigmaSettingsOpen,
    isInitialPromptOpen,
    isRulerVisible,
    isSitemapOpen,
    mode,
    onCancelReviewMode,
    onCloseFigmaSettings,
    onCloseRuler,
    setIsInitialPromptOpen,
    setIsSitemapOpen,
  ]);

  useEffect(() => {
    const handleHotkey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      if (isEditableEventTarget(event)) return;

      const actions: Record<string, () => void> = {
        r: () => {
          if (isRulerAvailable) onToggleRuler();
        },
        g: () => onToggleTargetOverlay('grid'),
        f: () => onToggleTargetOverlay('figma'),
        e: () => onSetReviewMode('element'),
        a: () => onSetReviewMode('area'),
      };
      const actionKey = getHotkeyActionKey(event, Object.keys(actions));
      const action = actionKey ? actions[actionKey] : undefined;
      if (!action) return;

      event.preventDefault();
      action();
    };

    window.addEventListener('keydown', handleHotkey);
    return () => window.removeEventListener('keydown', handleHotkey);
  }, [
    isRulerAvailable,
    onSetReviewMode,
    onToggleRuler,
    onToggleTargetOverlay,
  ]);

  useEffect(() => {
    const handleRailHotkey = (event: KeyboardEvent) => {
      if (isRailHotkeyBlocked || isEditableEventTarget(event)) return;

      const actions = [
        { hotkey: 'Shift+1', run: onToggleFigmaImagesPanel },
        { hotkey: 'Shift+2', run: onToggleQaPanel },
        { hotkey: 'Shift+3', run: onToggleComponentListPanel },
      ];
      const action = actions.find(({ hotkey }) => isHotkey(event, hotkey));
      if (!action) return;

      event.preventDefault();
      event.stopPropagation();
      action.run();
    };

    window.addEventListener('keydown', handleRailHotkey);
    return () => window.removeEventListener('keydown', handleRailHotkey);
  }, [
    isRailHotkeyBlocked,
    onToggleComponentListPanel,
    onToggleFigmaImagesPanel,
    onToggleQaPanel,
  ]);
};
