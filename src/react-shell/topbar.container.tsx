// Topbar feature container. 주소/뷰포트/URL 복사 상태를 store/config 에서 직접 읽는다.
import { useState } from 'react';
import { useReviewShellData } from './hooks/use.review.shell.data';
import { copyCurrentReviewUrl } from './review/shell.actions';
import { useReviewFigmaOverlayState } from './store/figma.overlay.context';
import { useReviewRulerState } from './store/ruler.context';
import { useReviewShellActions } from './store/shell.actions.context';
import { useReviewShellConfig } from './store/shell.config';
import { useReviewShellStore } from './store/store.context';
import { ReviewTopbar } from './topbar';

export const TopbarContainer = () => {
  const {
    applyTarget,
    toggleTargetOverlay,
  } = useReviewShellActions();
  const {
    isRulerAvailable,
    isRulerVisible,
    toggleRuler,
  } = useReviewRulerState();
  const {
    figmaOverlayUnavailableMessage,
    isFigmaOverlayActive,
    isFigmaOverlayAvailable,
    toggleFigmaOverlay,
  } = useReviewFigmaOverlayState();
  const { presetScopeCounts } = useReviewShellData();
  const { viewportPresets } = useReviewShellConfig();
  const draftTarget = useReviewShellStore((state) => state.draftTarget);
  const size = useReviewShellStore((state) => state.size);
  const targetOverlayState = useReviewShellStore(
    (state) => state.targetOverlayState
  );
  const setDraftTarget = useReviewShellStore((state) => state.setDraftTarget);
  const setIsSitemapOpen = useReviewShellStore(
    (state) => state.setIsSitemapOpen
  );
  const setSize = useReviewShellStore((state) => state.setSize);
  const [copyLabel, setCopyLabel] = useState('Copy URL');

  const copyCurrentUrl = () =>
    copyCurrentReviewUrl({
      onCopyLabelChange: setCopyLabel,
    });

  return (
    <ReviewTopbar
      draftTarget={draftTarget}
      copyLabel={copyLabel}
      viewportPresets={viewportPresets}
      size={size}
      presetScopeCounts={presetScopeCounts}
      isRulerAvailable={isRulerAvailable}
      isRulerVisible={isRulerVisible}
      targetOverlayState={targetOverlayState}
      figmaOverlayUnavailableMessage={figmaOverlayUnavailableMessage}
      isFigmaOverlayActive={isFigmaOverlayActive}
      isFigmaOverlayAvailable={isFigmaOverlayAvailable}
      onDraftTargetChange={setDraftTarget}
      onApplyTarget={applyTarget}
      onOpenSitemap={() => setIsSitemapOpen(true)}
      onCopyCurrentUrl={() => void copyCurrentUrl()}
      onSizeChange={setSize}
      onToggleFigmaOverlay={toggleFigmaOverlay}
      onToggleRuler={toggleRuler}
      onToggleTargetOverlay={toggleTargetOverlay}
    />
  );
};
