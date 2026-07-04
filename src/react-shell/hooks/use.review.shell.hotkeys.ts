import { useEffect } from 'react';
import { getHotkeyActionKey, isHotkey } from '../../core/hotkey';
import type { ReviewMode } from '../../types';
import { isEditableEventTarget } from '../target/target';
import type { TargetOverlayKey } from '../types';

interface UseReviewShellHotkeysOptions {
  isRailHotkeyBlocked: boolean;
  isFigmaSettingsOpen: boolean;
  isInitialPromptOpen: boolean;
  isRulerAvailable: boolean;
  isRulerVisible: boolean;
  isSitemapOpen: boolean;
  mode: ReviewMode;
  onCancelReviewMode: () => boolean;
  onCloseFigmaSettings: () => void;
  onCloseInitialPrompt: () => void;
  onCloseRuler: () => boolean;
  onCloseSitemap: () => void;
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
  isInitialPromptOpen,
  isRulerAvailable,
  isRulerVisible,
  isSitemapOpen,
  mode,
  onCancelReviewMode,
  onCloseFigmaSettings,
  onCloseInitialPrompt,
  onCloseRuler,
  onCloseSitemap,
  onSetReviewMode,
  onToggleComponentListPanel,
  onToggleFigmaImagesPanel,
  onToggleQaPanel,
  onToggleRuler,
  onToggleTargetOverlay,
}: UseReviewShellHotkeysOptions) => {
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
        onCloseInitialPrompt();
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (isSitemapOpen) {
        onCloseSitemap();
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
    onCloseInitialPrompt,
    onCloseRuler,
    onCloseSitemap,
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
