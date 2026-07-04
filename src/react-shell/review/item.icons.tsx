import {
  Maximize2 as Maximize2Icon,
  Monitor as MonitorIcon,
  RectangleHorizontal as TabletIcon,
  Scan as ScanIcon,
  Smartphone as SmartphoneIcon,
  SquareMousePointer as SquareMousePointerIcon,
} from 'lucide-react';
import type { ReviewItem, ReviewItemScope } from '../../types';
import { isAnchorRestorableReviewItem } from '../anchor.restore';

export const ReviewScopeIcon = ({ scope }: { scope: ReviewItemScope }) => {
  if (scope === 'mobile') return <SmartphoneIcon aria-hidden="true" />;
  if (scope === 'tablet') return <TabletIcon aria-hidden="true" />;
  if (scope === 'wide') return <Maximize2Icon aria-hidden="true" />;
  if (scope === 'dom') return <SquareMousePointerIcon aria-hidden="true" />;
  return <MonitorIcon aria-hidden="true" />;
};

export const getReviewItemMode = (item: ReviewItem) =>
  isAnchorRestorableReviewItem(item) ? 'dom' : item.kind;

export const ReviewItemModeIcon = ({
  mode,
}: {
  mode: ReturnType<typeof getReviewItemMode>;
}) => {
  if (mode === 'area') return <ScanIcon aria-hidden="true" />;
  return <SquareMousePointerIcon aria-hidden="true" />;
};
