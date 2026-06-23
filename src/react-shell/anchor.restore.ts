import type { DomAnchorCandidate, ReviewItem } from '../types';

export const isAnchorRestorableReviewItem = (item: ReviewItem) =>
  item.scope === 'dom' ||
  (item.kind === 'note' && Boolean(item.anchor && item.selection));

export const queryReviewItemAnchorElement = (
  targetDocument: Document,
  item: ReviewItem
) => {
  return getReviewItemAnchorResolution(targetDocument, item)?.element;
};

export const getReviewItemAnchorResolution = (
  targetDocument: Document,
  item: ReviewItem
) => {
  const anchor = item.anchor;
  if (!anchor || !isAnchorRestorableReviewItem(item)) return undefined;

  const expectedRect = getReviewItemExpectedDocumentRect(item);
  const candidates = [anchor, ...(anchor.candidates ?? [])].filter(
    (candidate) => Boolean(candidate.selector)
  );
  const matches: Array<{
    candidate: DomAnchorCandidate;
    element: Element;
    score: number;
  }> = [];

  candidates.forEach((candidate, index) => {
    try {
      targetDocument.querySelectorAll(candidate.selector).forEach((element) => {
        if (!isScrollableReviewAnchorElement(element)) return;

        matches.push({
          candidate,
          element,
          score: getReviewAnchorMatchScore(
            element,
            expectedRect,
            candidate.textFingerprint ?? anchor.textFingerprint,
            index
          )
        });
      });
    } catch {
      return;
    }
  });

  return matches.sort((a, b) => a.score - b.score)[0];
};

export const getReviewItemRestoreScrollPosition = (
  targetWindow: Window,
  targetDocument: Document,
  item: ReviewItem,
  anchorElement?: Element
) => {
  if (anchorElement) {
    const rect = anchorElement.getBoundingClientRect();
    return clampDocumentScrollPosition(targetDocument, {
      left:
        targetWindow.scrollX +
        rect.left -
        Math.max(0, (targetWindow.innerWidth - rect.width) / 2),
      top:
        targetWindow.scrollY +
        rect.top -
        Math.max(0, (targetWindow.innerHeight - rect.height) / 2)
    });
  }

  return clampDocumentScrollPosition(targetDocument, {
    left: item.scroll?.x ?? 0,
    top: item.scroll?.y ?? 0
  });
};

export const setDocumentScrollInstantly = (
  targetWindow: Window,
  targetDocument: Document,
  position: { left: number; top: number }
) => {
  const scrollElement = targetDocument.scrollingElement as HTMLElement | null;

  if (scrollElement) {
    scrollElement.scrollLeft = position.left;
    scrollElement.scrollTop = position.top;
    return;
  }

  targetWindow.scrollTo(position.left, position.top);
};

export const getReviewItemExpectedDocumentRect = (item: ReviewItem) => {
  const scroll = item.scroll ?? { x: 0, y: 0 };
  const selection = item.selection?.viewport;
  if (
    selection &&
    typeof selection.x === 'number' &&
    typeof selection.y === 'number' &&
    typeof selection.width === 'number' &&
    typeof selection.height === 'number'
  ) {
    return {
      left: scroll.x + selection.x,
      top: scroll.y + selection.y,
      width: selection.width,
      height: selection.height
    };
  }

  const marker = item.marker?.viewport;
  if (marker && typeof marker.x === 'number' && typeof marker.y === 'number') {
    return {
      left: scroll.x + marker.x,
      top: scroll.y + marker.y,
      width: 1,
      height: 1
    };
  }

  return undefined;
};

export const getReviewAnchorMatchScore = (
  element: Element,
  expectedRect:
    | {
        left: number;
        top: number;
        width: number;
        height: number;
      }
    | undefined,
  textFingerprint: string | undefined,
  candidateIndex: number
) => {
  const rect = getElementDocumentRect(element);
  let score = candidateIndex * 25;

  if (expectedRect) {
    score += Math.abs(rect.top - expectedRect.top);
    score += Math.abs(rect.left - expectedRect.left) * 0.25;
    score += Math.abs(rect.width - expectedRect.width) * 0.1;
    score += Math.abs(rect.height - expectedRect.height) * 0.1;
  }

  if (textFingerprint) {
    score +=
      (1 - getReviewTextFingerprintScore(textFingerprint, element)) * 100;
  }

  return score;
};

export const getElementDocumentRect = (element: Element) => {
  const rect = element.getBoundingClientRect();
  const view = element.ownerDocument.defaultView;

  return {
    left: rect.left + (view?.scrollX ?? 0),
    top: rect.top + (view?.scrollY ?? 0),
    width: rect.width,
    height: rect.height
  };
};

const clampDocumentScrollPosition = (
  targetDocument: Document,
  position: { left: number; top: number }
) => {
  const scrollElement = targetDocument.scrollingElement;
  const view = targetDocument.defaultView;
  const maxLeft = Math.max(
    0,
    (scrollElement?.scrollWidth ?? 0) - (view?.innerWidth ?? 0)
  );
  const maxTop = Math.max(
    0,
    (scrollElement?.scrollHeight ?? 0) - (view?.innerHeight ?? 0)
  );

  return {
    left: Math.min(Math.max(0, Math.round(position.left)), maxLeft),
    top: Math.min(Math.max(0, Math.round(position.top)), maxTop)
  };
};

export const getReviewTextFingerprintScore = (expected: string, element: Element) => {
  const actual = element.textContent?.replace(/\s+/g, ' ').trim();
  if (!actual) return 0.5;
  if (expected === actual) return 1;
  if (actual.includes(expected) || expected.includes(actual)) return 0.82;

  const expectedTokens = getReviewFingerprintTokens(expected);
  const actualTokens = new Set(getReviewFingerprintTokens(actual));
  if (expectedTokens.length === 0 || actualTokens.size === 0) return 0.5;

  const matches = expectedTokens.filter((token) => actualTokens.has(token));
  return Math.min(Math.max(matches.length / expectedTokens.length, 0.25), 0.76);
};

export const getReviewFingerprintTokens = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s/|,.:;()[\]{}"'`~!?<>]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

export const isScrollableReviewAnchorElement = (element: Element) => {
  const id = element.id.trim().toLowerCase();
  if (
    element === element.ownerDocument.body ||
    element === element.ownerDocument.documentElement ||
    ['app', 'main', 'page', 'root', '__next', '__nuxt'].includes(id)
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const viewportHeight = element.ownerDocument.documentElement.clientHeight;
  const scrollHeight = element.ownerDocument.documentElement.scrollHeight;
  return !(
    scrollHeight > viewportHeight * 1.5 && rect.height > viewportHeight * 3
  );
};
