import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Camera as CameraIcon } from 'lucide-react';
import {
  getBoundMarkerPoint,
  getItemHighlightSelection,
  shouldShowMarkerForScope,
} from '../../core/review/item';
import {
  getNumberedReviewItems,
  getReviewViewportScope,
} from '../../core/review/scope';
import {
  isPointInViewport,
  toHostPoint,
  type ReviewEnvironment,
} from '../../core/geometry';
import type {
  NumberedReviewItem,
  ReviewAttachment,
  ReviewItem,
} from '../../types';
import { useReviewShellData } from '../hooks/use.review.shell.data';
import { ImagePreviewModal } from '../image.preview.modal';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellRefs } from '../store/shell.refs';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellStore } from '../store/store.context';

interface OutsideMarker {
  item: ReviewItem;
  label: string;
  scope: NumberedReviewItem['scope'];
  anchorTop: number;
  top: number;
  connectorTop: number;
  connectorStemTop: number;
  connectorStemHeight: number;
  capture?: ReviewAttachment;
  captureStyle: CSSProperties;
  titleStyle: CSSProperties;
}

const OUTSIDE_MARKER_HEIGHT = 22;
const OUTSIDE_MARKER_CONNECTOR_TOP = 10;
const OUTSIDE_MARKER_GAP = 6;
const OUTSIDE_MARKER_SPACING = OUTSIDE_MARKER_HEIGHT + OUTSIDE_MARKER_GAP;

interface OutsideMarkerAnchor {
  anchorTop: number;
}

interface OutsideMarkerLayout {
  anchorTop: number;
  top: number;
  connectorTop: number;
  connectorStemTop: number;
  connectorStemHeight: number;
}

const clampMarkerTop = (top: number, maxTop: number) =>
  Math.max(0, Math.min(maxTop, top));

const toMarkerPixel = (value: number) => Math.round(value * 100) / 100;

export const arrangeOutsideMarkerLayout = <T extends OutsideMarkerAnchor>(
  markers: readonly T[],
  viewportHeight: number
): Array<T & OutsideMarkerLayout> => {
  if (markers.length === 0) return [];

  const maxTop = Math.max(0, viewportHeight - OUTSIDE_MARKER_HEIGHT);
  const sorted = markers
    .map((marker, index) => ({
      marker,
      index,
      anchorTop: clampMarkerTop(marker.anchorTop, maxTop),
      top: clampMarkerTop(marker.anchorTop, maxTop),
    }))
    .sort(
      (a, b) => a.anchorTop - b.anchorTop || a.index - b.index
    );

  for (let index = 1; index < sorted.length; index += 1) {
    sorted[index].top = Math.max(
      sorted[index].top,
      sorted[index - 1].top + OUTSIDE_MARKER_SPACING
    );
  }

  if (sorted[sorted.length - 1].top > maxTop) {
    sorted[sorted.length - 1].top = maxTop;

    for (let index = sorted.length - 2; index >= 0; index -= 1) {
      sorted[index].top = Math.min(
        sorted[index].top,
        sorted[index + 1].top - OUTSIDE_MARKER_SPACING
      );
    }
  }

  if (sorted[0].top < 0) {
    const spacing =
      sorted.length > 1 ? maxTop / (sorted.length - 1) : 0;
    sorted.forEach((marker, index) => {
      marker.top = index * spacing;
    });
  }

  return sorted
    .map(({ marker, index, anchorTop, top }) => {
      const safeTop = clampMarkerTop(top, maxTop);
      const connectorTop =
        anchorTop - safeTop + OUTSIDE_MARKER_CONNECTOR_TOP;
      const connectorStemTop = Math.min(
        OUTSIDE_MARKER_CONNECTOR_TOP,
        connectorTop
      );
      const connectorStemHeight = Math.abs(
        connectorTop - OUTSIDE_MARKER_CONNECTOR_TOP
      );

      return {
        index,
        marker: {
          ...marker,
          anchorTop: toMarkerPixel(anchorTop),
          top: toMarkerPixel(safeTop),
          connectorTop: toMarkerPixel(connectorTop),
          connectorStemTop: toMarkerPixel(connectorStemTop),
          connectorStemHeight: toMarkerPixel(connectorStemHeight),
        } as T & OutsideMarkerLayout,
      };
    })
    .sort((a, b) => a.index - b.index)
    .map(({ marker }) => marker);
};

const createTargetEnvironment = (
  iframe: HTMLIFrameElement | null
): ReviewEnvironment | undefined => {
  const targetWindow = iframe?.contentWindow;
  const targetDocument = iframe?.contentDocument;
  if (!iframe || !targetWindow || !targetDocument) return undefined;
  const rect = iframe.getBoundingClientRect();
  const scaleX =
    targetWindow.innerWidth > 0 ? rect.width / targetWindow.innerWidth : 1;
  const scaleY =
    targetWindow.innerHeight > 0 ? rect.height / targetWindow.innerHeight : 1;

  return {
    window: targetWindow,
    document: targetDocument,
    viewportRect: {
      left: 0,
      top: 0,
      width: rect.width,
      height: rect.height,
    },
    scaleX,
    scaleY,
    overlayRect: {
      left: 0,
      top: 0,
      width: rect.width,
      height: rect.height,
    },
  };
};

const getOutsideMarkerTop = (
  item: ReviewItem,
  environment: ReviewEnvironment
) => {
  const selection = getItemHighlightSelection(item, environment);
  if (selection) return selection.viewport.top;

  const point = getBoundMarkerPoint(item, environment);
  if (!point || !isPointInViewport(point.viewport, environment)) {
    return undefined;
  }
  return point.viewport.y;
};

export const ReviewOutsideMarkers = () => {
  const isDesignInspecting = useReviewShellStore(
    (state) => state.isListVisible && state.sidePanel === 'design-inspector' && state.designInspectorMode === 'pick'
  );
  const { reviewViewportPresets } = useReviewShellConfig();
  const { frameScrollRef, iframeRef } = useReviewShellRefs();
  const { restoreReviewItem } = useReviewShellActions();
  const {
    activeItems,
    hiddenOverlayItemIdList,
  } = useReviewShellData();
  const size = useReviewShellStore((state) => state.size);
  const selectedItemId = useReviewShellStore((state) => state.selectedItemId);
  const targetFrameLoadVersion = useReviewShellStore(
    (state) => state.targetFrameLoadVersion
  );
  const setIsListVisible = useReviewShellStore(
    (state) => state.setIsListVisible
  );
  const setSidePanel = useReviewShellStore((state) => state.setSidePanel);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [preview, setPreview] = useState<ReviewAttachment | null>(null);
  const frameUpdateRef = useRef<number | null>(null);

  useEffect(() => { setPreview(null); }, [targetFrameLoadVersion]);

  useEffect(() => {
    const targetWindow = iframeRef.current?.contentWindow;
    const frameScroll = frameScrollRef.current;
    if (!targetWindow) return undefined;

    const scheduleUpdate = () => {
      if (frameUpdateRef.current !== null) {
        targetWindow.cancelAnimationFrame(frameUpdateRef.current);
      }
      frameUpdateRef.current = targetWindow.requestAnimationFrame(() => {
        frameUpdateRef.current = null;
        setLayoutVersion((version) => version + 1);
      });
    };

    targetWindow.addEventListener('scroll', scheduleUpdate, { passive: true });
    targetWindow.addEventListener('resize', scheduleUpdate);
    frameScroll?.addEventListener('scroll', scheduleUpdate, { passive: true });
    scheduleUpdate();

    return () => {
      if (frameUpdateRef.current !== null) {
        targetWindow.cancelAnimationFrame(frameUpdateRef.current);
        frameUpdateRef.current = null;
      }
      targetWindow.removeEventListener('scroll', scheduleUpdate);
      targetWindow.removeEventListener('resize', scheduleUpdate);
      frameScroll?.removeEventListener('scroll', scheduleUpdate);
    };
  }, [frameScrollRef, iframeRef, targetFrameLoadVersion]);

  const markers = useMemo<OutsideMarker[]>(() => {
    const environment = createTargetEnvironment(iframeRef.current);
    if (!environment) return [];

    const hiddenItemIds = new Set(hiddenOverlayItemIdList);
    const currentScope = getReviewViewportScope(size, reviewViewportPresets);

    const rawMarkers = getNumberedReviewItems(
      activeItems,
      reviewViewportPresets
    ).flatMap((numberedItem) => {
      const { item, scope, displayLabel } = numberedItem;
      if (hiddenItemIds.has(item.id)) return [];
      if (!shouldShowMarkerForScope(scope, currentScope)) return [];

      const top = getOutsideMarkerTop(item, environment);
      if (typeof top !== 'number') return [];
      const hostTop = toHostPoint({ x: 0, y: top }, environment).y;
      const selection = getItemHighlightSelection(item, environment)?.viewport;
      const capture = [...(item.attachments ?? [])].reverse().find(
        (attachment) => attachment.kind === 'capture' && attachment.url && attachment.mime.startsWith('image/')
      );
      const isViewportCapture = capture?.metadata?.captureTarget === 'viewport';
      const width = isViewportCapture ? Math.min(320, size.width) : selection?.width ?? 320;
      const height = isViewportCapture ? width * size.height / size.width : selection?.height ?? 240;
      const point = toHostPoint({ x: selection?.left ?? 0, y: top }, environment);

      return {
        item,
        label: displayLabel,
        scope,
        anchorTop: hostTop,
        capture,
        titleStyle: {
          left: Math.max(4, point.x) - Math.max(0, point.x),
          top: Math.max(4, point.y - 24) - Math.max(0, point.y),
        },
        captureStyle: {
          left: 44 + Math.max(0, point.x),
          top: Math.max(0, point.y),
          width: Math.min(width * (environment.scaleX ?? 1), environment.viewportRect.width - Math.max(0, point.x)),
          height: Math.min(height * (environment.scaleY ?? 1), environment.viewportRect.height - Math.max(0, point.y)),
        },
      };
    });

    return arrangeOutsideMarkerLayout(
      rawMarkers,
      environment.viewportRect.height
    );
  }, [
    activeItems,
    hiddenOverlayItemIdList,
    iframeRef,
    layoutVersion,
    reviewViewportPresets,
    size,
  ]);

  if (isDesignInspecting || markers.length === 0) return null;

  return (
    <>
      <div className="df-review-outside-marker-layer" aria-label="QA markers">
        {markers.map((marker) => {
          const isActive = marker.item.id === selectedItemId;
          const style = {
            top: `${marker.top}px`,
            '--df-review-outside-marker-connector-top': `${marker.connectorTop}px`,
            '--df-review-outside-marker-connector-stem-top': `${marker.connectorStemTop}px`,
            '--df-review-outside-marker-connector-stem-height': `${marker.connectorStemHeight}px`,
            '--df-review-outside-marker-z-index': isActive ? 2 : 1,
          } as CSSProperties & Record<string, string | number>;

          const openCapture = () => {
            setPreview(marker.capture ?? null);
          };
          return (
            <div key={marker.item.id}>
              <div
                className={`df-review-outside-marker is-scope-${marker.scope}${
                  isActive ? ' is-active' : ''
                }`}
                style={style}
              >
                <button
                  type="button"
                  className="df-review-outside-marker-focus"
                  aria-label={`Focus ${marker.label}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSidePanel('qa');
                    setIsListVisible(true);
                    restoreReviewItem(marker.item);
                  }}
                >
                  {marker.label}
                </button>
                {marker.capture && <button
                  type="button"
                  className="df-review-capture-icon"
                  aria-label={`View capture for ${marker.label}`}
                  aria-haspopup="dialog"
                  title="View capture"
                  onClick={(event) => { event.stopPropagation(); openCapture(); }}
                ><CameraIcon aria-hidden="true" /></button>}
              </div>
              {isActive && (
                <div
                  className={`df-review-marker-capture is-scope-${marker.scope}`}
                  style={marker.captureStyle}
                >
                  <div className="df-review-marker-title" style={marker.titleStyle}>
                    <span>{marker.label}</span>
                    {marker.capture && <button
                      type="button"
                      className="df-review-capture-icon"
                      aria-label={`View capture ${marker.label}`}
                      aria-haspopup="dialog"
                      title="View capture"
                      onClick={(event) => {
                        event.stopPropagation();
                        openCapture();
                      }}
                    ><CameraIcon aria-hidden="true" /></button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {preview && <ImagePreviewModal attachment={preview} onClose={() => setPreview(null)} />}
    </>
  );
};
