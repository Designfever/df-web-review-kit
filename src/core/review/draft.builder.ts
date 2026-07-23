// web.review.kit.app.ts 에서 분리한 draft 생성 geometry.
// 사용자 제스처(포인트/엘리먼트/영역 선택)를 앵커가 붙은 draft 로 변환한다.
// 인스턴스 상태에 의존하지 않는 순수 변환만 담는다.
import type {
  DomAnchor,
  ReviewItem,
  ReviewMarker,
  ReviewPoint,
  ReviewSelection,
} from '../../types';
import {
  clampPoint,
  getPointSelection,
  getSelectionCenter,
  getViewportSize,
  roundPoint,
  toPublicSelection,
  type ReviewEnvironment,
  type ViewportSelection,
} from '../geometry';
import {
  getDomAnchorFromElement,
  getDomAnchorFromPoint,
  getElementViewportSelection,
  getRelativePoint,
  getRelativeSelection,
} from '../dom.anchor';
import { createSelectionStartMarker } from './item';
import type {
  AreaDraft,
  DomDraft,
  ReviewDraftPreviewElement,
} from './draft';

export type DraftItemFields = Partial<
  Pick<ReviewItem, 'title' | 'comment' | 'assigneeId' | 'assigneeName'>
>;
export type ElementDraftFields = DraftItemFields &
  Partial<Pick<DomDraft, 'adjustment' | 'isSelectionOnly'>>;

export function buildDomDraftFromPoint(params: {
  point: ReviewPoint;
  environment: ReviewEnvironment;
  attribute: string | undefined;
  fields: DraftItemFields;
}): DomDraft {
  const { point, environment, attribute, fields } = params;
  const viewport = getViewportSize(environment);
  const nextPoint = clampPoint(point, environment);

  const pointSelection = getPointSelection(nextPoint);
  const targetElement = environment.document.elementFromPoint(
    nextPoint.x,
    nextPoint.y
  );
  const previewElement =
    targetElement && 'style' in targetElement
      ? (targetElement as ReviewDraftPreviewElement)
      : undefined;
  const targetRect = targetElement?.getBoundingClientRect();
  const clickedSelection =
    targetRect && targetRect.width > 0 && targetRect.height > 0
      ? {
          left: targetRect.left,
          top: targetRect.top,
          width: targetRect.width,
          height: targetRect.height,
        }
      : undefined;
  const anchor = getDomAnchorFromPoint(nextPoint, attribute, environment);
  const elementSelection = anchor
    ? (clickedSelection ??
      getElementViewportSelection(anchor, environment, pointSelection))
    : undefined;
  const selection = elementSelection ?? pointSelection;
  const markerPoint = elementSelection
    ? { x: selection.left, y: selection.top }
    : getSelectionCenter(selection);
  const reviewSelection = elementSelection
    ? {
        viewport: toPublicSelection(elementSelection),
        relative: getRelativeSelection(
          elementSelection,
          anchor as DomAnchor,
          environment
        ),
      }
    : undefined;
  const marker: ReviewMarker = {
    viewport: roundPoint(markerPoint),
    relative: anchor
      ? getRelativePoint(markerPoint, anchor, environment)
      : undefined,
  };

  return {
    viewport,
    anchor,
    marker,
    selection: reviewSelection,
    ...fields,
    previewElement,
  };
}

export function buildDomDraftFromElement(params: {
  element: Element;
  environment: ReviewEnvironment;
  attribute: string | undefined;
  fields: ElementDraftFields;
}): DomDraft | undefined {
  const { element, environment, attribute, fields } = params;
  const viewport = getViewportSize(environment);

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return undefined;

  const selection: ViewportSelection = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
  const anchor = getDomAnchorFromElement(element, attribute, environment);
  const markerPoint = { x: selection.left, y: selection.top };
  const marker: ReviewMarker = {
    viewport: roundPoint(markerPoint),
    relative: anchor
      ? getRelativePoint(markerPoint, anchor, environment)
      : undefined,
  };
  const reviewSelection: ReviewSelection = {
    viewport: toPublicSelection(selection),
    relative: anchor
      ? getRelativeSelection(selection, anchor, environment)
      : undefined,
  };
  const previewElement =
    'style' in element ? (element as ReviewDraftPreviewElement) : undefined;

  return {
    viewport,
    anchor,
    marker,
    selection: reviewSelection,
    ...fields,
    previewElement,
  };
}

export function buildAreaDraft(params: {
  selection: ViewportSelection;
  environment: ReviewEnvironment;
  attribute: string | undefined;
}): AreaDraft {
  const { selection, environment, attribute } = params;
  const viewport = getViewportSize(environment);

  const anchorPoint = clampPoint(getSelectionCenter(selection), environment);
  const anchor = getDomAnchorFromPoint(anchorPoint, attribute, environment);
  const marker = createSelectionStartMarker(selection, anchor, environment);
  const reviewSelection: ReviewSelection = {
    viewport: toPublicSelection(selection),
    relative: anchor
      ? getRelativeSelection(selection, anchor, environment)
      : undefined,
  };

  return {
    viewport,
    anchor,
    marker,
    selection: reviewSelection,
  };
}
