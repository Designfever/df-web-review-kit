import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { getRulerMeasure, getRulerPointFromRect } from '../ruler/ruler';
import type { ReviewRulerPoint, ReviewShellViewportPreset } from '../types';

interface UseReviewRulerDragOptions {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  isRulerAvailable: boolean;
  isRulerVisible: boolean;
  size: ReviewShellViewportPreset;
  targetSrc: string;
}

export const useReviewRulerDrag = ({
  iframeRef,
  isRulerAvailable,
  isRulerVisible,
  size,
  targetSrc,
}: UseReviewRulerDragOptions) => {
  const rulerOverlayRef = useRef<HTMLDivElement | null>(null);
  const rulerDragRectRef = useRef<DOMRect | null>(null);
  const isRulerDraggingRef = useRef(false);
  const sizeRef = useRef(size);
  const [rulerStart, setRulerStart] = useState<ReviewRulerPoint | null>(null);
  const [rulerPoint, setRulerPoint] = useState<ReviewRulerPoint | null>(null);
  const [rulerHover, setRulerHover] = useState<ReviewRulerPoint | null>(null);
  const [isRulerDragging, setIsRulerDragging] = useState(false);

  const rulerMeasure = useMemo(
    () => getRulerMeasure(rulerStart, rulerPoint),
    [rulerPoint, rulerStart]
  );

  const clearRulerMeasure = useCallback(() => {
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setRulerStart(null);
    setRulerPoint(null);
    setRulerHover(null);
    setIsRulerDragging(false);
  }, []);

  const finishRulerDrag = useCallback((point?: ReviewRulerPoint) => {
    if (point) {
      setRulerPoint(point);
    }

    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setIsRulerDragging(false);
  }, []);

  const startRulerDrag = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const point = getRulerPointFromRect(clientX, clientY, rect);

      rulerDragRectRef.current = rect;
      isRulerDraggingRef.current = true;

      setRulerStart(point);
      setRulerPoint(point);
      setIsRulerDragging(true);
    },
    []
  );

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    if (!isRulerVisible || !isRulerAvailable) return undefined;

    const getRulerEventClientPoint = (event: MouseEvent) => {
      const frame = iframeRef.current;
      let isFrameEvent = false;

      try {
        isFrameEvent =
          Boolean(frame?.contentWindow) && event.view === frame?.contentWindow;

        if (!isFrameEvent && frame?.contentDocument) {
          const targetDocument = (
            event.target as { ownerDocument?: Document } | null
          )?.ownerDocument;
          isFrameEvent = targetDocument === frame.contentDocument;
        }
      } catch {
        isFrameEvent = false;
      }

      if (isFrameEvent && frame) {
        const frameRect = frame.getBoundingClientRect();

        return {
          clientX: event.clientX + frameRect.left,
          clientY: event.clientY + frameRect.top,
        };
      }

      return {
        clientX: event.clientX,
        clientY: event.clientY,
      };
    };

    const snapDesign = (screen: number, axis: 'x' | 'y') => {
      const current = sizeRef.current;
      const scaleX = current.designWidth
        ? current.width / current.designWidth
        : 1;
      const scale =
        axis === 'y'
          ? current.designHeight
            ? current.height / current.designHeight
            : scaleX
          : scaleX;
      return Math.round(Math.round(screen / scale) * scale);
    };

    const getActiveRulerPoint = (event: MouseEvent) => {
      const rect =
        rulerDragRectRef.current ??
        rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return undefined;

      const point = getRulerEventClientPoint(event);
      const snapped = getRulerPointFromRect(point.clientX, point.clientY, rect);

      return { x: snapDesign(snapped.x, 'x'), y: snapDesign(snapped.y, 'y') };
    };

    const getHoverRulerPoint = (event: MouseEvent) => {
      const rect = rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return null;

      const { clientX, clientY } = getRulerEventClientPoint(event);
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

      return { x: snapDesign(x, 'x'), y: snapDesign(y, 'y') };
    };

    const handleDragStart: EventListener = (event) => {
      if (isRulerDraggingRef.current) return;

      const mouseEvent = event as MouseEvent;
      if (mouseEvent.button !== 0) return;

      const overlay = rulerOverlayRef.current;
      const target = mouseEvent.target;
      if (!overlay || !(target instanceof Node) || !overlay.contains(target)) {
        return;
      }

      event.preventDefault();
      startRulerDrag(
        mouseEvent.clientX,
        mouseEvent.clientY,
        overlay.getBoundingClientRect()
      );
    };

    const handlePointerMove: EventListener = (event) => {
      const mouseEvent = event as MouseEvent;

      if (isRulerDraggingRef.current) {
        const point = getActiveRulerPoint(mouseEvent);
        if (!point) return;

        mouseEvent.preventDefault();
        setRulerPoint(point);
        setRulerHover(point);
        return;
      }

      setRulerHover(getHoverRulerPoint(mouseEvent));
    };

    const handleDragEnd: EventListener = (event) => {
      if (!isRulerDraggingRef.current) return;

      const point = getActiveRulerPoint(event as MouseEvent);
      event.preventDefault();
      finishRulerDrag(point);
    };

    const handleWindowBlur = () => {
      if (!isRulerDraggingRef.current) return;

      finishRulerDrag();
    };

    const dragTargets = new Set<EventTarget>([window]);
    const frame = iframeRef.current;

    try {
      if (frame?.contentWindow) dragTargets.add(frame.contentWindow);
      if (frame?.contentDocument) dragTargets.add(frame.contentDocument);
    } catch {
      // Cross-origin frames cannot expose their document. Parent listeners still run.
    }

    dragTargets.forEach((target) => {
      target.addEventListener('mousedown', handleDragStart, true);
      target.addEventListener('mousemove', handlePointerMove, true);
      target.addEventListener('mouseup', handleDragEnd, true);
    });

    window.addEventListener('blur', handleWindowBlur);

    return () => {
      dragTargets.forEach((target) => {
        target.removeEventListener('mousedown', handleDragStart, true);
        target.removeEventListener('mousemove', handlePointerMove, true);
        target.removeEventListener('mouseup', handleDragEnd, true);
      });
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [
    finishRulerDrag,
    iframeRef,
    isRulerAvailable,
    isRulerVisible,
    startRulerDrag,
  ]);

  useEffect(() => {
    clearRulerMeasure();
  }, [clearRulerMeasure, size.height, size.width, targetSrc]);

  return {
    clearRulerMeasure,
    isRulerDragging,
    rulerHover,
    rulerMeasure,
    rulerOverlayRef,
  };
};
