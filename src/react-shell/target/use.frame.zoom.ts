import { useLayoutEffect, type RefObject } from 'react';
import { useReviewShellStore } from '../store/store.context';

export const getFitZoom = (
  availableWidth: number,
  availableHeight: number,
  width: number,
  height: number,
) => Math.min(1, Math.max(1, availableWidth) / width, Math.max(1, availableHeight) / height);

export function useFrameZoom(
  scrollRef: RefObject<HTMLDivElement | null>,
  width: number,
  height: number,
) {
  const zoom = useReviewShellStore((state) => state.zoom);
  const setZoom = useReviewShellStore((state) => state.setZoom);
  const fitZoom = useReviewShellStore((state) => state.fitZoom);
  const setFitZoom = useReviewShellStore((state) => state.setFitZoom);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const update = () => {
      const canvas = scroll.firstElementChild;
      const style = canvas ? getComputedStyle(canvas) : null;
      const paddingX = style ? parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) : 0;
      const paddingY = style ? parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) : 0;
      setFitZoom(getFitZoom(scroll.clientWidth - paddingX, scroll.clientHeight - paddingY, width, height));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    return () => observer.disconnect();
  }, [scrollRef, width, height, setFitZoom]);

  const scale = zoom === 'fit' ? fitZoom : zoom;
  useLayoutEffect(() => {
    // Transform changes don't resize the iframe viewport. Refresh host overlays explicitly.
    window.dispatchEvent(new Event('resize'));
    scrollRef.current?.dispatchEvent(new Event('scroll'));
  }, [scale, scrollRef]);

  return { zoom, setZoom, scale, fitZoom };
}
