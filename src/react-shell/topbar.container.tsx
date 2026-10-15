// Topbar feature container. 주소/뷰포트/URL 복사 상태를 store/config 에서 직접 읽는다.
import { useState } from 'react';
import { useReviewShellData } from './hooks/use.review.shell.data';
import { copyCurrentReviewUrl } from './review/shell.actions';
import { useReviewFigmaOverlayState } from './store/figma.overlay.context';
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
    figmaOverlayUnavailableMessage,
    isFigmaOverlayActive,
    isFigmaOverlayAvailable,
    toggleFigmaOverlay,
  } = useReviewFigmaOverlayState();
  const { presetScopeCounts } = useReviewShellData();
  const { viewportPresets } = useReviewShellConfig();
  const draftTarget = useReviewShellStore((state) => state.draftTarget);
  const size = useReviewShellStore((state) => state.size);
  const zoom = useReviewShellStore((state) => state.zoom);
  const fitZoom = useReviewShellStore((state) => state.fitZoom);
  const setZoom = useReviewShellStore((state) => state.setZoom);
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
      zoomControl={
        <label className="df-review-frame-zoom">
          <select
            aria-label="Target zoom"
            value={zoom}
            onChange={(event) => setZoom(
              event.target.value === 'fit' ? 'fit' : Number(event.target.value)
            )}
          >
            <option value="fit">Fit ({Math.round(fitZoom * 100)}%)</option>
            {[0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
              <option key={value} value={value}>{value * 100}%</option>
            ))}
          </select>
        </label>
      }
      presetScopeCounts={presetScopeCounts}
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
      onToggleTargetOverlay={toggleTargetOverlay}
    />
  );
};
