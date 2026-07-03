import type { RefObject } from 'react';
import type { WebReviewKitTarget } from '../../types';
import { captureIframeViewport } from '../target/capture';

interface GetReviewKitTargetOptions {
  frameScrollRef: RefObject<HTMLDivElement | null>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
}

export const getReviewKitTarget = ({
  frameScrollRef,
  iframeRef,
}: GetReviewKitTargetOptions): WebReviewKitTarget | undefined => {
  const frame = iframeRef.current;
  const frameWindow = frame?.contentWindow;
  const frameDocument = frame?.contentDocument;

  if (!frame || !frameWindow || !frameDocument) return undefined;

  return {
    window: frameWindow,
    document: frameDocument,
    getViewportRect: () => frame.getBoundingClientRect(),
    getOverlayRect: () => {
      const frameRect = frame.getBoundingClientRect();
      const scrollRect = frameScrollRef.current?.getBoundingClientRect();
      if (!scrollRect) return frameRect;

      const left = Math.max(frameRect.left, scrollRect.left);
      const top = Math.max(frameRect.top, scrollRect.top);
      const right = Math.min(
        frameRect.left + frameRect.width,
        scrollRect.left + scrollRect.width
      );
      const bottom = Math.min(
        frameRect.top + frameRect.height,
        scrollRect.top + scrollRect.height
      );

      return {
        left,
        top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      };
    },
    getComposerHost: () =>
      document.querySelector<HTMLElement>('.df-review-qa-draft-host'),
    captureViewport: (input) => captureIframeViewport(frame, input),
  };
};
