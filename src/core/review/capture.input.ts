// web.review.kit.app.ts 에서 분리한 뷰포트 캡처 입력/첨부 빌더.
// 인스턴스 상태에 의존하지 않는 순수 변환이라 별도 모듈로 둔다.
import type {
  RelativeSelection,
  ReviewViewportCaptureInput,
  ReviewViewportCaptureResult,
} from '../../types';
import { getViewportSize, type ReviewEnvironment } from '../geometry';
import { getOriginalUrl, getPageUrl, getRouteKey } from '../location';
import { createId } from '../id';
import type { AreaDraft, ReviewDraftAttachment } from './draft';

export type CaptureDraftInput = Pick<
  AreaDraft,
  'marker' | 'selection' | 'viewport'
>;

export function createViewportCaptureInput(
  environment: ReviewEnvironment,
  draft: CaptureDraftInput,
  captureRegion?: RelativeSelection
): ReviewViewportCaptureInput {
  const timestamp = new Date().toISOString();
  const viewport = draft.viewport ?? getViewportSize(environment);
  const routeKey = getRouteKey(environment);

  return {
    routeKey,
    pageUrl: getPageUrl(environment),
    originalUrl: getOriginalUrl(environment),
    viewport,
    captureRegion,
    devicePixelRatio: environment.window.devicePixelRatio || 1,
    scroll: {
      x: environment.window.scrollX,
      y: environment.window.scrollY,
    },
    marker: draft.marker,
    selection: draft.selection,
    timestamp,
  };
}

export function createCaptureDraftAttachment(
  result: ReviewViewportCaptureResult,
  input: ReviewViewportCaptureInput
): ReviewDraftAttachment {
  const mime = result.mime || result.file.type || 'image/png';
  const name = result.name || `review-capture-${Date.now()}.png`;
  return {
    id: createId(),
    file: result.file,
    name,
    mime,
    size: result.file.size,
    kind: 'capture',
    previewUrl: mime.startsWith('image/')
      ? URL.createObjectURL(result.file)
      : undefined,
    metadata: {
      ...result.metadata,
      source: 'viewport-capture',
      target: 'iframe',
      routeKey: input.routeKey,
      pageUrl: input.pageUrl,
      originalUrl: input.originalUrl,
      viewport: input.viewport,
      scroll: input.scroll,
      marker: input.marker,
      selection: input.selection,
      timestamp: input.timestamp,
      devicePixelRatio: input.devicePixelRatio,
      width: result.width,
      height: result.height,
    },
  };
}
