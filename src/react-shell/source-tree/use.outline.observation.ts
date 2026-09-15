import { useCallback, useEffect, type RefObject } from 'react';
import { getSectionOutline, type GetSectionOutlineOptions, type SectionOutlineEntry } from './section.outline';

/** Document scanning and refresh scheduling; tree UI state remains with its caller. */
export function useOutlineObservation({
  iframeRef,
  sectionOutlineOptions,
  isPanelVisible,
  targetFrameLoadVersion,
  targetSrc,
  onReset,
  onRefresh,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  sectionOutlineOptions: GetSectionOutlineOptions;
  isPanelVisible: boolean;
  targetFrameLoadVersion: number;
  targetSrc: string;
  onReset: () => void;
  onRefresh: (entries: SectionOutlineEntry[], resetCollapse: boolean) => void;
}) {
  useEffect(() => {
    onReset();
  }, [onReset, targetFrameLoadVersion, targetSrc]);

  const getCurrentSectionOutline = useCallback(
    (): SectionOutlineEntry[] | null => {
      let frameDocument: Document | null = null;
      try {
        frameDocument = iframeRef.current?.contentDocument ?? null;
      } catch {
        frameDocument = null;
      }
      if (!frameDocument || frameDocument.readyState !== 'complete') {
        return null;
      }
      return getSectionOutline(frameDocument, sectionOutlineOptions);
    },
    [iframeRef, sectionOutlineOptions]
  );

  const refreshCurrentSectionOutline = useCallback(
    (resetCollapse = false) => {
      const nextSectionOutline = getCurrentSectionOutline();
      if (!nextSectionOutline) return false;
      onRefresh(nextSectionOutline, resetCollapse);
      return true;
    },
    [getCurrentSectionOutline, onRefresh]
  );

  // 패널을 연 직후에는 target 렌더 완료 시점을 알 수 없어
  // 몇 차례(프레임 + 120/500/1200ms) 재시도한다.
  // 첫 유효 outline만 기본 접힘 상태로 만들고, 이후 재시도는
  // Option 포커스로 열린 경로를 다시 접지 않도록 현재 상태를 유지한다.
  useEffect(() => {
    if (!isPanelVisible) return undefined;

    const refreshSectionOutline = () => {
      refreshCurrentSectionOutline(false);
    };

    const animationFrame = window.requestAnimationFrame(refreshSectionOutline);
    const firstTimeout = window.setTimeout(refreshSectionOutline, 120);
    const secondTimeout = window.setTimeout(refreshSectionOutline, 500);
    const thirdTimeout = window.setTimeout(refreshSectionOutline, 1200);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(firstTimeout);
      window.clearTimeout(secondTimeout);
      window.clearTimeout(thirdTimeout);
    };
  }, [
    isPanelVisible,
    refreshCurrentSectionOutline,
    targetFrameLoadVersion,
    targetSrc,
  ]);

  // 패널이 열려 있는 동안 target DOM 변경을 감지해 80ms 디바운스로 갱신.
  useEffect(() => {
    if (!isPanelVisible) return undefined;

    const frameDocument = iframeRef.current?.contentDocument;
    const body = frameDocument?.body;
    if (!body) return undefined;

    let refreshTimeout: number | null = null;
    const scheduleRefresh = () => {
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(() => {
        refreshTimeout = null;
        refreshCurrentSectionOutline(false);
      }, 80);
    };

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(body, { childList: true, subtree: true });
    scheduleRefresh();

    return () => {
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
      observer.disconnect();
    };
  }, [
    iframeRef,
    isPanelVisible,
    refreshCurrentSectionOutline,
    targetFrameLoadVersion,
    targetSrc,
  ]);

  return { getCurrentSectionOutline, refreshCurrentSectionOutline };
}
