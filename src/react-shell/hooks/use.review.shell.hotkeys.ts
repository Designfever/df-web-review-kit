import { useEffect } from 'react';
import type { ReviewMode } from '../../types';
import { isEditableEventTarget } from '../target/target';
import type { TargetOverlayKey } from '../types';

interface UseReviewShellHotkeysOptions {
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
  onToggleRuler: () => void;
  onToggleTargetOverlay: (overlay: TargetOverlayKey) => void;
}

export const useReviewShellHotkeys = ({
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
        n: () => onSetReviewMode('note'),
        e: () => onSetReviewMode('element'),
        a: () => onSetReviewMode('area'),
      };
      const action = actions[event.key.toLowerCase()];
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
};
