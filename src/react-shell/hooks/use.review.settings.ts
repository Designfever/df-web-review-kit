import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_REVIEW_THEME } from '../constants';
import {
  getStoredFigmaToken,
  getStoredReviewTheme,
  getStoredReviewUserId,
  getSystemReviewTheme,
  normalizeReviewTheme,
  writeStoredFigmaToken,
  writeStoredReviewTheme,
  writeStoredReviewUserId,
} from '../settings';
import type { ReviewShellTheme } from '../types';

interface UseReviewSettingsOptions {
  onCancelReviewMode: () => void | boolean;
  onCloseInitialPrompt: () => void;
  onCloseSitemap: () => void;
  onReloadTargetFrame: () => void;
}

export const useReviewSettings = ({
  onCancelReviewMode,
  onCloseInitialPrompt,
  onCloseSitemap,
  onReloadTargetFrame,
}: UseReviewSettingsOptions) => {
  const [figmaTokenDraft, setFigmaTokenDraft] = useState(getStoredFigmaToken);
  const [reviewUserId, setReviewUserId] = useState(getStoredReviewUserId);
  const [reviewUserIdDraft, setReviewUserIdDraft] = useState(
    getStoredReviewUserId
  );
  const [reviewTheme, setReviewTheme] = useState(getStoredReviewTheme);
  const [reviewThemeDraft, setReviewThemeDraft] =
    useState(getStoredReviewTheme);
  const [systemReviewTheme, setSystemReviewTheme] =
    useState(getSystemReviewTheme);
  const [figmaSettingsStatus, setFigmaSettingsStatus] = useState('');
  const [isFigmaSettingsOpen, setIsFigmaSettingsOpen] = useState(false);
  const [isFigmaTokenVisible, setIsFigmaTokenVisible] = useState(false);
  const [isFigmaTokenGuideOpen, setIsFigmaTokenGuideOpen] = useState(false);
  const effectiveReviewTheme =
    reviewTheme === 'system' ? systemReviewTheme : reviewTheme;

  const closeFigmaSettings = useCallback(() => {
    setIsFigmaSettingsOpen(false);
    setFigmaSettingsStatus('');
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
  }, []);

  const openFigmaSettings = useCallback(() => {
    onCancelReviewMode();
    onCloseSitemap();
    onCloseInitialPrompt();
    setFigmaTokenDraft(getStoredFigmaToken());
    setReviewUserIdDraft(getStoredReviewUserId());
    setReviewThemeDraft(reviewTheme);
    setFigmaSettingsStatus('');
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
    setIsFigmaSettingsOpen(true);
  }, [
    onCancelReviewMode,
    onCloseInitialPrompt,
    onCloseSitemap,
    reviewTheme,
  ]);

  const saveReviewSettings = useCallback(
    (token: string, userId: string, theme: ReviewShellTheme) => {
      const nextToken = token.trim();
      const nextUserId = userId.trim();
      const nextTheme = normalizeReviewTheme(theme);
      const shouldReload = nextToken !== getStoredFigmaToken();

      writeStoredFigmaToken(nextToken);
      writeStoredReviewUserId(nextUserId);
      writeStoredReviewTheme(nextTheme);
      setFigmaTokenDraft(nextToken);
      setReviewUserId(nextUserId);
      setReviewUserIdDraft(nextUserId);
      setReviewTheme(nextTheme);
      setReviewThemeDraft(nextTheme);
      setFigmaSettingsStatus(
        nextToken || nextUserId || nextTheme !== DEFAULT_REVIEW_THEME
          ? 'Saved'
          : 'Cleared'
      );

      if (shouldReload) {
        onReloadTargetFrame();
      }
      closeFigmaSettings();
    },
    [closeFigmaSettings, onReloadTargetFrame]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const query = window.matchMedia('(prefers-color-scheme: light)');
    const syncSystemTheme = () => {
      setSystemReviewTheme(query.matches ? 'light' : 'dark');
    };

    syncSystemTheme();

    if (query.addEventListener) {
      query.addEventListener('change', syncSystemTheme);
      return () => query.removeEventListener('change', syncSystemTheme);
    }

    query.addListener(syncSystemTheme);
    return () => query.removeListener(syncSystemTheme);
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      'df-review-theme-light',
      effectiveReviewTheme === 'light'
    );
    document.body.classList.toggle(
      'df-review-theme-dark',
      effectiveReviewTheme === 'dark'
    );

    return () => {
      document.body.classList.remove(
        'df-review-theme-light',
        'df-review-theme-dark'
      );
    };
  }, [effectiveReviewTheme]);

  return {
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
  };
};
