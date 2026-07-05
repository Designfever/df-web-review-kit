// Topbar feature container. 주소/뷰포트/URL 복사 상태를 store/config 에서 직접 읽고
// ruler·figma overlay·sitemap 등 셸 결합 콜백만 props 로 받는다.
import { useState } from 'react';
import type { ReviewItemScope } from '../index';
import { copyCurrentReviewUrl } from './review/shell.actions';
import { useReviewShellConfig } from './store/shell.config';
import { useReviewShellStore } from './store/store.context';
import { ReviewTopbar } from './topbar';
import type { TargetOverlayKey } from './types';

interface TopbarContainerProps {
  figmaOverlayUnavailableMessage?: string;
  isFigmaOverlayActive: boolean;
  isFigmaOverlayAvailable: boolean;
  isRulerAvailable: boolean;
  isRulerVisible: boolean;
  presetScopeCounts: ReadonlyMap<ReviewItemScope, number>;
  onApplyTarget: () => void;
  onOpenSitemap: () => void;
  onToggleFigmaOverlay: () => void;
  onToggleRuler: () => void;
  onToggleTargetOverlay: (key: TargetOverlayKey) => void;
}

export const TopbarContainer = ({
  figmaOverlayUnavailableMessage,
  isFigmaOverlayActive,
  isFigmaOverlayAvailable,
  isRulerAvailable,
  isRulerVisible,
  presetScopeCounts,
  onApplyTarget,
  onOpenSitemap,
  onToggleFigmaOverlay,
  onToggleRuler,
  onToggleTargetOverlay,
}: TopbarContainerProps) => {
  const { viewportPresets } = useReviewShellConfig();
  const draftTarget = useReviewShellStore((state) => state.draftTarget);
  const size = useReviewShellStore((state) => state.size);
  const targetOverlayState = useReviewShellStore(
    (state) => state.targetOverlayState
  );
  const setDraftTarget = useReviewShellStore((state) => state.setDraftTarget);
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
      onApplyTarget={onApplyTarget}
      onOpenSitemap={onOpenSitemap}
      onCopyCurrentUrl={() => void copyCurrentUrl()}
      onSizeChange={setSize}
      onToggleFigmaOverlay={onToggleFigmaOverlay}
      onToggleRuler={onToggleRuler}
      onToggleTargetOverlay={onToggleTargetOverlay}
    />
  );
};
