// 셸(오버레이/카운트)과 QA 패널 컨테이너가 공유하는 활성 아이템 파생 로직.
import type { ReviewItem } from '../../types';
import { getItemTarget } from '../route';

interface GetActiveReviewItemsOptions {
  activeRoute: string;
  isAllQaVisible: boolean;
  items: ReviewItem[];
  reviewPathPrefix: string;
  sitemapSourceItems: ReviewItem[];
}

export const getActiveReviewItems = ({
  activeRoute,
  isAllQaVisible,
  items,
  reviewPathPrefix,
  sitemapSourceItems,
}: GetActiveReviewItemsOptions) => {
  const sourceItems = isAllQaVisible
    ? sitemapSourceItems
    : items.filter(
        (item) => getItemTarget(item, reviewPathPrefix) === activeRoute
      );

  return [...sourceItems].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
};
