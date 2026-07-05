// 저장된 리뷰 아이템을 페이지 위에 그리는 마커/하이라이트 레이어.
// 모든 좌표는 target(대상 페이지) 좌표를 host(셸) 좌표로 변환해서 그린다.
import type {
  ReviewItem,
  ReviewItemScope,
  ReviewPoint,
  ReviewViewportPreset,
} from '../../types';
import {
  getViewportSize,
  isPointInViewport,
  toHostPoint,
  toHostSelection,
  type ReviewEnvironment,
  type ViewportSelection,
} from '../geometry';
import { formatItemMeta } from '../review/format';
import {
  getBoundMarkerPoint,
  getItemHighlightSelection,
  getReviewItemHighlightMode,
  shouldShowMarkerForScope,
} from '../review/item';
import {
  getNumberedReviewItems,
  getReviewViewportScope,
} from '../review/scope';

/** Numbered pin marker for a stored item (or the transient area draft dot). */
export function createMarkerElement(
  itemId: string | undefined,
  hostPoint: ReviewPoint,
  label: string,
  scope: ReviewItemScope,
  isBound: boolean,
  isHighlighted: boolean
) {
  const marker = document.createElement('div');
  marker.className = [
    'dfwr-bound-marker',
    `is-scope-${scope}`,
    isBound ? 'is-bound' : 'is-fallback',
    isHighlighted ? 'is-highlighted' : '',
  ]
    .filter(Boolean)
    .join(' ');
  marker.style.left = `${hostPoint.x}px`;
  marker.style.top = `${hostPoint.y}px`;
  marker.dataset.scope = scope;
  if (itemId) {
    marker.dataset.reviewItemId = itemId;
  }

  const iconElement = document.createElement('span');
  iconElement.className = 'dfwr-bound-marker-icon';
  iconElement.setAttribute('aria-hidden', 'true');
  const labelElement = document.createElement('span');
  labelElement.className = 'dfwr-bound-marker-number';
  labelElement.textContent = label;
  marker.append(iconElement, labelElement);

  return marker;
}

/** Dashed rectangle shown while drafting or when restoring a selection. */
export function createSelectionHighlight(
  selection: ViewportSelection,
  environment: ReviewEnvironment,
  isDraft: boolean
) {
  const rect = toHostSelection(selection, environment);
  const highlight = document.createElement('div');
  highlight.className = `dfwr-selection-highlight${
    isDraft ? ' is-draft' : ''
  }`;
  highlight.style.left = `${rect.left}px`;
  highlight.style.top = `${rect.top}px`;
  highlight.style.width = `${rect.width}px`;
  highlight.style.height = `${rect.height}px`;
  return highlight;
}

/** Highlight box + floating label pair for a stored item's target area. */
function createItemHighlightElements(
  selection: ViewportSelection,
  environment: ReviewEnvironment,
  item: ReviewItem,
  label: string,
  scope: ReviewItemScope,
  isBound: boolean,
  isHighlighted: boolean
) {
  const rect = toHostSelection(selection, environment);
  const mode = getReviewItemHighlightMode(item);
  const highlight = document.createElement('div');
  highlight.className = [
    'dfwr-item-target-highlight',
    `is-mode-${mode}`,
    `is-scope-${scope}`,
    isBound ? 'is-bound' : 'is-fallback',
    isHighlighted ? 'is-highlighted' : '',
  ]
    .filter(Boolean)
    .join(' ');
  highlight.style.left = `${rect.left}px`;
  highlight.style.top = `${rect.top}px`;
  highlight.style.width = `${rect.width}px`;
  highlight.style.height = `${rect.height}px`;
  highlight.dataset.reviewItemId = item.id;

  const labelElement = document.createElement('div');
  labelElement.className = [
    'dfwr-item-target-label',
    `is-mode-${mode}`,
    `is-scope-${scope}`,
    isHighlighted ? 'is-highlighted' : '',
  ]
    .filter(Boolean)
    .join(' ');
  labelElement.textContent = label;
  // 라벨은 하이라이트 위쪽에 두되 화면 밖으로 나가지 않게 최소 4px 를 지킨다.
  labelElement.style.left = `${Math.max(4, rect.left)}px`;
  labelElement.style.top = `${Math.max(4, rect.top - 24)}px`;
  labelElement.dataset.reviewItemId = item.id;

  return [highlight, labelElement];
}

/**
 * Renders all visible item markers for the current viewport scope.
 * highlightedItemId 가 있으면 그 아이템만 하이라이트 형태로 강조한다.
 */
export function createMarkerLayer({
  items,
  highlightedItemId,
  environment,
  presets,
  showCompactMarkers = true,
}: {
  items: ReviewItem[];
  highlightedItemId?: string;
  environment: ReviewEnvironment | undefined;
  presets?: ReviewViewportPreset[];
  showCompactMarkers?: boolean;
}) {
  const layer = document.createElement('div');
  layer.className = 'dfwr-marker-layer';
  if (!environment) return layer;

  const currentScope = getReviewViewportScope(
    getViewportSize(environment),
    presets
  );

  getNumberedReviewItems(items, presets).forEach((numberedItem) => {
    const { item, scope, displayLabel } = numberedItem;
    // 다른 뷰포트(scope)에서 남긴 아이템은 현재 화면에서 숨긴다.
    if (!shouldShowMarkerForScope(scope, currentScope)) {
      return;
    }

    const isHighlighted = item.id === highlightedItemId;
    if (isHighlighted) {
      const selection = getItemHighlightSelection(item, environment);
      if (selection) {
        layer.append(
          ...createItemHighlightElements(
            selection.viewport,
            environment,
            item,
            displayLabel,
            scope,
            selection.isBound,
            isHighlighted
          )
        );
        return;
      }
    }

    if (!showCompactMarkers && !isHighlighted) {
      return;
    }

    const point = getBoundMarkerPoint(item, environment);
    if (!point || !isPointInViewport(point.viewport, environment)) {
      return;
    }

    const hostPoint = toHostPoint(point.viewport, environment);
    const marker = createMarkerElement(
      item.id,
      hostPoint,
      displayLabel,
      scope,
      point.isBound,
      isHighlighted
    );
    marker.title = `${displayLabel} / ${item.comment}\n${formatItemMeta(item)}`;
    layer.append(marker);
  });

  return layer;
}
