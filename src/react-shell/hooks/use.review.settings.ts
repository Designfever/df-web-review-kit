import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_REVIEW_THEME,
  DEFAULT_REVIEW_TOOLTIPS_ENABLED,
} from '../constants';
import {
  getStoredFigmaToken,
  getStoredReviewTooltipsEnabled,
  getStoredReviewTheme,
  getStoredReviewUserId,
  getSystemReviewTheme,
  normalizeReviewTheme,
  writeStoredFigmaToken,
  writeStoredReviewTooltipsEnabled,
  writeStoredReviewTheme,
  writeStoredReviewUserId,
} from '../settings';
import type { ReviewShellTheme } from '../types';

interface UseReviewSettingsOptions {
  defaultReviewUserId?: string;
  onCancelReviewMode: () => void | boolean;
  onCloseInitialPrompt: () => void;
  onCloseSitemap: () => void;
  onReloadTargetFrame: () => void;
}

export const useReviewSettings = ({
  defaultReviewUserId = '',
  onCancelReviewMode,
  onCloseInitialPrompt,
  onCloseSitemap,
  onReloadTargetFrame,
}: UseReviewSettingsOptions) => {
  const [figmaTokenDraft, setFigmaTokenDraft] = useState(getStoredFigmaToken);
  const [reviewUserId, setReviewUserId] = useState(() =>
    getStoredReviewUserId(defaultReviewUserId)
  );
  const [reviewUserIdDraft, setReviewUserIdDraft] = useState(
    () => getStoredReviewUserId(defaultReviewUserId)
  );
  const [reviewTheme, setReviewTheme] = useState(getStoredReviewTheme);
  const [reviewThemeDraft, setReviewThemeDraft] =
    useState(getStoredReviewTheme);
  const [areTooltipsEnabled, setAreTooltipsEnabled] = useState(
    getStoredReviewTooltipsEnabled
  );
  const [areTooltipsEnabledDraft, setAreTooltipsEnabledDraft] = useState(
    getStoredReviewTooltipsEnabled
  );
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
    setReviewUserIdDraft(getStoredReviewUserId(defaultReviewUserId));
    setReviewThemeDraft(reviewTheme);
    setAreTooltipsEnabledDraft(areTooltipsEnabled);
    setFigmaSettingsStatus('');
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
    setIsFigmaSettingsOpen(true);
  }, [
    onCancelReviewMode,
    onCloseInitialPrompt,
    onCloseSitemap,
    defaultReviewUserId,
    areTooltipsEnabled,
    reviewTheme,
  ]);

  const saveReviewSettings = useCallback(
    (
      token: string,
      userId: string,
      theme: ReviewShellTheme,
      tooltipsEnabled: boolean
    ) => {
      const nextToken = token.trim();
      const nextUserId = userId.trim();
      const nextTheme = normalizeReviewTheme(theme);
      const shouldReload = nextToken !== getStoredFigmaToken();

      writeStoredFigmaToken(nextToken);
      writeStoredReviewUserId(nextUserId);
      writeStoredReviewTheme(nextTheme);
      writeStoredReviewTooltipsEnabled(tooltipsEnabled);
      setFigmaTokenDraft(nextToken);
      setReviewUserId(nextUserId);
      setReviewUserIdDraft(nextUserId);
      setReviewTheme(nextTheme);
      setReviewThemeDraft(nextTheme);
      setAreTooltipsEnabled(tooltipsEnabled);
      setAreTooltipsEnabledDraft(tooltipsEnabled);
      setFigmaSettingsStatus(
        nextToken ||
          nextUserId ||
          nextTheme !== DEFAULT_REVIEW_THEME ||
          tooltipsEnabled !== DEFAULT_REVIEW_TOOLTIPS_ENABLED
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
    if (getStoredReviewUserId()) return;

    const nextDefaultUserId = defaultReviewUserId.trim();
    setReviewUserId(nextDefaultUserId);
    setReviewUserIdDraft(nextDefaultUserId);
  }, [defaultReviewUserId]);

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
    areTooltipsEnabled,
    areTooltipsEnabledDraft,
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
    setAreTooltipsEnabledDraft,
    setFigmaSettingsStatus,
    setFigmaTokenDraft,
    setIsFigmaTokenGuideOpen,
    setIsFigmaTokenVisible,
    setReviewThemeDraft,
    setReviewUserIdDraft,
  };
};

export type ReviewSettingsController = ReturnType<typeof useReviewSettings>;
