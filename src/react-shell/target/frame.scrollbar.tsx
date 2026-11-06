import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

export function ReviewFrameScrollbar({
  frameKey,
  frameScrollRef,
  iframeRef,
  scale,
}: {
  frameKey: string;
  frameScrollRef: RefObject<HTMLDivElement | null>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  scale: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const stage = frameScrollRef.current;
    if (!track || !stage) return;

    let detachFrame = () => {};
    const sync = () => {
      const frame = iframeRef.current;
      const device = stage.querySelector<HTMLElement>('.df-review-device-frame');
      const host = track.parentElement;
      let win: Window | null = null;
      let doc: Document | null = null;
      try {
        win = frame?.contentWindow ?? null;
        doc = frame?.contentDocument ?? null;
      } catch {
        win = null;
        doc = null;
      }
      const html = doc?.documentElement;
      if (!device || !host || !win || !html) return;

      const hostRect = host.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const deviceRect = device.getBoundingClientRect();
      const top = Math.max(deviceRect.top, stageRect.top);
      const bottom = Math.min(deviceRect.bottom, stageRect.bottom);
      const height = Math.max(0, bottom - top);
      const edge = Math.min(deviceRect.right, stageRect.right - 18);
      track.style.top = `${top - hostRect.top}px`;
      track.style.left = `${edge - hostRect.left + 8}px`;
      track.style.height = `${height}px`;

      const overflows = height >= 1 && html.scrollHeight > html.clientHeight + 1;
      track.style.visibility = overflows ? 'visible' : 'hidden';
      track.style.pointerEvents = overflows ? 'auto' : 'none';
      if (!overflows || html.clientHeight <= 0) return;

      const ratio = track.clientHeight / html.clientHeight;
      const nextHeight = html.scrollHeight * ratio;
      setContentHeight((current) => (current === nextHeight ? current : nextHeight));
      const nextTop = win.scrollY * ratio;
      if (Math.abs(track.scrollTop - nextTop) < 1) return;
      track.scrollTop = nextTop;
    };

    const bindFrame = () => {
      detachFrame();
      let win: Window | null = null;
      let doc: Document | null = null;
      try {
        win = iframeRef.current?.contentWindow ?? null;
        doc = iframeRef.current?.contentDocument ?? null;
      } catch {
        return;
      }
      if (!win || !doc) return;
      const contentObserver = new ResizeObserver(sync);
      if (doc.documentElement) contentObserver.observe(doc.documentElement);
      if (doc.body) contentObserver.observe(doc.body);
      win.addEventListener('scroll', sync, { passive: true });
      detachFrame = () => {
        win.removeEventListener('scroll', sync);
        contentObserver.disconnect();
      };
      sync();
    };

    const observer = new ResizeObserver(sync);
    observer.observe(stage);
    const device = stage.querySelector('.df-review-device-frame');
    if (device) observer.observe(device);
    stage.addEventListener('scroll', sync, { passive: true });
    const frame = iframeRef.current;
    frame?.addEventListener('load', bindFrame);
    bindFrame();

    return () => {
      observer.disconnect();
      stage.removeEventListener('scroll', sync);
      frame?.removeEventListener('load', bindFrame);
      detachFrame();
    };
  }, [frameKey, frameScrollRef, iframeRef, scale]);

  return (
    <div
      aria-label="Target scroll"
      className="df-review-frame-scrollbar"
      ref={trackRef}
      onScroll={(event) => {
        const track = event.currentTarget;
        let win: Window | null = null;
        let doc: Document | null = null;
        try {
          win = iframeRef.current?.contentWindow ?? null;
          doc = iframeRef.current?.contentDocument ?? null;
        } catch {
          return;
        }
        const clientHeight = doc?.documentElement?.clientHeight ?? 0;
        if (!win || clientHeight <= 0 || track.clientHeight <= 0) return;
        const next = track.scrollTop / (track.clientHeight / clientHeight);
        if (Math.abs(win.scrollY - next) < 1) return;
        win.scrollTo(0, next);
      }}
    >
      <div style={{ height: contentHeight }} />
    </div>
  );
}
