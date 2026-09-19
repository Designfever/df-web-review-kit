import { useEffect } from 'react';
import { trackReviewEvent } from '../../analytics';
import type { ReviewSidePanel } from '../store/side.panel.slice';

export function useReviewAnalyticsPanelView({
  isVisible,
  panelId,
}: {
  isVisible: boolean;
  panelId: ReviewSidePanel;
}) {
  useEffect(() => {
    if (!isVisible) return;
    trackReviewEvent('view', { panelId });
  }, [isVisible, panelId]);
}
