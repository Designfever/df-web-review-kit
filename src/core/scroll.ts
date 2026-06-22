import type { ReviewEnvironment } from './geometry';

/** Waits one target animation frame before reading/restoring overlay state. */
export function waitForNextFrame(environment?: ReviewEnvironment) {
  return new Promise<void>((resolve) => {
    (environment?.window ?? window).requestAnimationFrame(() => resolve());
  });
}

/** Temporarily disables smooth scroll so restore lands synchronously. */
export function runWithAutoScrollBehavior(
  targetDocument: Document,
  callback: () => void
) {
  const elements = [
    targetDocument.documentElement,
    targetDocument.body,
  ].filter((element): element is HTMLElement => Boolean(element));
  const previousValues = elements.map((element) => element.style.scrollBehavior);

  elements.forEach((element) => {
    element.style.scrollBehavior = 'auto';
  });

  try {
    callback();
  } finally {
    elements.forEach((element, index) => {
      element.style.scrollBehavior = previousValues[index] ?? '';
    });
  }
}

/** Restores target document scroll without relying on smooth scrolling behavior. */
export function setDocumentScrollInstantly(
  environment: ReviewEnvironment,
  position: { x: number; y: number }
) {
  const scrollElement = environment.document.scrollingElement as HTMLElement | null;

  if (scrollElement) {
    scrollElement.scrollLeft = Math.max(0, Math.round(position.x));
    scrollElement.scrollTop = Math.max(0, Math.round(position.y));
    return;
  }

  environment.window.scrollTo(
    Math.max(0, Math.round(position.x)),
    Math.max(0, Math.round(position.y))
  );
}
