import { useCallback } from 'react';
import {
  InitialPromptModal,
  PromptModal,
  ReviewSettingsModal,
  SitemapModal,
} from '../shell.modals';
import { useReviewShellData } from '../hooks/use.review.shell.data';
import { useReviewToast } from '../hooks/use.review.toast';
import { useReviewPresenceState } from '../presence/presence.context';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellStore } from '../store/store.context';
import { copyReviewPrompt } from './shell.actions';
import { useReviewSettingsState } from './settings.context';

export const ReviewShellModalsContainer = () => {
  const { initialPrompt, pages } = useReviewShellConfig();
  const {
    getPageTarget,
    selectAllQa,
    selectPage,
  } = useReviewShellActions();
  const { pagePresenceUsers } = useReviewPresenceState();
  const {
    areTooltipsEnabledDraft,
    closeFigmaSettings,
    figmaSettingsStatus,
    figmaTokenDraft,
    isFigmaSettingsOpen,
    isFigmaTokenGuideOpen,
    isFigmaTokenVisible,
    reviewThemeDraft,
    reviewUserIdDraft,
    saveReviewSettings,
    setAreTooltipsEnabledDraft,
    setFigmaSettingsStatus,
    setFigmaTokenDraft,
    setIsFigmaTokenGuideOpen,
    setIsFigmaTokenVisible,
    setReviewThemeDraft,
    setReviewUserIdDraft,
  } = useReviewSettingsState();
  const {
    allQaCount,
    pageQaCounts,
  } = useReviewShellData();
  const activeRoute = useReviewShellStore((state) => state.activeRoute);
  const copiedPromptKey = useReviewShellStore(
    (state) => state.copiedPromptKey
  );
  const isAllQaVisible = useReviewShellStore((state) => state.isAllQaVisible);
  const isInitialPromptOpen = useReviewShellStore(
    (state) => state.isInitialPromptOpen
  );
  const isInitialPromptScriptOpen = useReviewShellStore(
    (state) => state.isInitialPromptScriptOpen
  );
  const isSitemapOpen = useReviewShellStore((state) => state.isSitemapOpen);
  const setCopiedPromptKey = useReviewShellStore(
    (state) => state.setCopiedPromptKey
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
  const showToast = useReviewToast();
  const initialPromptText = initialPrompt.trim();
  const copyInitialPrompt = useCallback(
    (value: string, key: string) =>
      copyReviewPrompt({
        key,
        value,
        onCopiedPromptKeyChange: setCopiedPromptKey,
        onToast: showToast,
      }),
    [setCopiedPromptKey, showToast]
  );

  return (
    <>
      {isSitemapOpen && (
        <SitemapModal
          activeRoute={activeRoute}
          allQaCount={allQaCount}
          getPageTarget={getPageTarget}
          isAllQaVisible={isAllQaVisible}
          pagePresenceUsers={pagePresenceUsers}
          pageQaCounts={pageQaCounts}
          pages={pages}
          onClose={() => setIsSitemapOpen(false)}
          onSelectAllQa={selectAllQa}
          onSelectPage={selectPage}
        />
      )}

      {isFigmaSettingsOpen && (
        <ReviewSettingsModal
          areTooltipsEnabledDraft={areTooltipsEnabledDraft}
          figmaSettingsStatus={figmaSettingsStatus}
          figmaTokenDraft={figmaTokenDraft}
          isFigmaTokenGuideOpen={isFigmaTokenGuideOpen}
          isFigmaTokenVisible={isFigmaTokenVisible}
          reviewThemeDraft={reviewThemeDraft}
          reviewUserIdDraft={reviewUserIdDraft}
          onClearStatus={() => setFigmaSettingsStatus('')}
          onClose={closeFigmaSettings}
          onFigmaTokenDraftChange={setFigmaTokenDraft}
          onReviewThemeDraftChange={setReviewThemeDraft}
          onReviewUserIdDraftChange={setReviewUserIdDraft}
          onSave={saveReviewSettings}
          onTooltipsEnabledDraftChange={setAreTooltipsEnabledDraft}
          onToggleFigmaTokenGuide={() =>
            setIsFigmaTokenGuideOpen((current) => !current)
          }
          onToggleFigmaTokenVisible={() =>
            setIsFigmaTokenVisible((current) => !current)
          }
        />
      )}

      {isInitialPromptOpen && (
        <PromptModal onClose={() => setIsInitialPromptOpen(false)} />
      )}

      {isInitialPromptScriptOpen && (
        <InitialPromptModal
          copiedPromptKey={copiedPromptKey}
          initialPromptText={initialPromptText}
          onClose={() => setIsInitialPromptScriptOpen(false)}
          onCopyPrompt={(text, key) => void copyInitialPrompt(text, key)}
        />
      )}
    </>
  );
};
