// Pure shell layout. This component should only place slots, not read store,
// refs, adapter state, or runtime contexts directly.
import type { ReactNode } from 'react';

export interface ReviewShellFrameSlots {
  figmaImagesPanel?: ReactNode;
  modals?: ReactNode;
  qaPanel: ReactNode;
  sideRail: ReactNode;
  sourceInspector: ReactNode;
  sourceTreePanel?: ReactNode;
  targetFrame: ReactNode;
  toast?: ReactNode;
  topbar: ReactNode;
}

interface ReviewShellFrameProps {
  effectiveReviewTheme: string;
  isListVisible: boolean;
  slots: ReviewShellFrameSlots;
}

export const ReviewShellFrame = ({
  effectiveReviewTheme,
  isListVisible,
  slots,
}: ReviewShellFrameProps) => (
  <div
    className={`df-review-shell is-theme-${effectiveReviewTheme}${
      isListVisible ? ' is-list-visible' : ''
    }`}
  >
    {slots.topbar}
    {slots.modals}
    {slots.toast}
    {slots.sideRail}
    {slots.qaPanel}
    {slots.figmaImagesPanel}
    {slots.sourceTreePanel}
    {slots.targetFrame}
    {slots.sourceInspector}
  </div>
);
