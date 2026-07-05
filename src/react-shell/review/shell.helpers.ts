import { clamp } from '../../core/geometry';
import { runWithAutoScrollBehavior } from '../../core/scroll';
import type { ReviewMode } from '../../types';
import type { ReviewShellWriteMode } from '../types';
import type { SectionOutlineEntry } from '../section.outline';

export const getReviewModeWriteMode = (
  mode: ReviewMode
): ReviewShellWriteMode | null => {
  if (mode === 'element') return 'dom';
  if (mode === 'area') return mode;
  return null;
};

export const waitForFrame = (targetWindow: Window | null | undefined) =>
  new Promise<void>((resolve) => {
    (targetWindow ?? window).requestAnimationFrame(() => resolve());
  });

export const waitForMs = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const getScrollElement = (targetDocument: Document) =>
  targetDocument.scrollingElement as HTMLElement | null;

export const scrollElementInTarget = (
  element: Element,
  block: 'center' | 'start'
) => {
  const targetWindow = element.ownerDocument.defaultView;
  if (!targetWindow) return;

  const targetDocument = element.ownerDocument;
  const scrollElement = getScrollElement(targetDocument);
  const rect = element.getBoundingClientRect();
  const currentLeft = scrollElement?.scrollLeft ?? targetWindow.scrollX;
  const currentTop = scrollElement?.scrollTop ?? targetWindow.scrollY;
  const clientWidth = scrollElement?.clientWidth ?? targetWindow.innerWidth;
  const clientHeight = scrollElement?.clientHeight ?? targetWindow.innerHeight;
  const scrollWidth =
    scrollElement?.scrollWidth ?? targetDocument.documentElement.scrollWidth;
  const scrollHeight =
    scrollElement?.scrollHeight ??
    targetDocument.documentElement.scrollHeight;
  const nextLeft = clamp(
    currentLeft + rect.left + rect.width / 2 - clientWidth / 2,
    0,
    Math.max(0, scrollWidth - clientWidth)
  );
  const nextTop =
    block === 'center'
      ? clamp(
          currentTop + rect.top + rect.height / 2 - clientHeight / 2,
          0,
          Math.max(0, scrollHeight - clientHeight)
        )
      : clamp(
          currentTop + rect.top,
          0,
          Math.max(0, scrollHeight - clientHeight)
        );

  runWithAutoScrollBehavior(targetDocument, () => {
    if (scrollElement) {
      scrollElement.scrollLeft = Math.round(nextLeft);
      scrollElement.scrollTop = Math.round(nextTop);
      return;
    }

    targetWindow.scrollTo(Math.round(nextLeft), Math.round(nextTop));
  });
};

export const centerFrameScrollOnElement = (
  frameScroll: HTMLDivElement | null,
  frame: HTMLIFrameElement | null,
  element: Element
) => {
  if (!frameScroll || !frame) return;

  const frameScrollRect = frameScroll.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const elementHostCenterX =
    frameRect.left + elementRect.left + elementRect.width / 2;
  const elementHostCenterY =
    frameRect.top + elementRect.top + elementRect.height / 2;
  const visibleCenterX = frameScrollRect.left + frameScrollRect.width / 2;
  const visibleCenterY = frameScrollRect.top + frameScrollRect.height / 2;
  const nextLeft = clamp(
    frameScroll.scrollLeft + elementHostCenterX - visibleCenterX,
    0,
    Math.max(0, frameScroll.scrollWidth - frameScroll.clientWidth)
  );
  const nextTop = clamp(
    frameScroll.scrollTop + elementHostCenterY - visibleCenterY,
    0,
    Math.max(0, frameScroll.scrollHeight - frameScroll.clientHeight)
  );
  const previousScrollBehavior = frameScroll.style.scrollBehavior;

  frameScroll.style.scrollBehavior = 'auto';
  frameScroll.scrollLeft = Math.round(nextLeft);
  frameScroll.scrollTop = Math.round(nextTop);
  frameScroll.style.scrollBehavior = previousScrollBehavior;
};

export const getSectionOutlineFilterTerms = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

export const getSectionOutlineEntryCount = (
  entries: SectionOutlineEntry[]
): number =>
  entries.reduce(
    (count, entry) => count + 1 + getSectionOutlineEntryCount(entry.children),
    0
  );

const DEFAULT_VISIBLE_SECTION_OUTLINE_DEPTH = 1;

export const getDefaultCollapsedSectionOutlineIds = (
  entries: SectionOutlineEntry[]
) => {
  const collapsedIds = new Set<string>();
  const visit = (entry: SectionOutlineEntry) => {
    if (
      entry.children.length > 0 &&
      entry.depth >= DEFAULT_VISIBLE_SECTION_OUTLINE_DEPTH
    ) {
      collapsedIds.add(entry.id);
    }
    entry.children.forEach(visit);
  };

  entries.forEach(visit);
  return collapsedIds;
};

const matchesSectionOutlineFilter = (
  entry: SectionOutlineEntry,
  terms: string[]
) => {
  if (terms.length === 0) return true;

  const text = [
    entry.label,
    entry.filePath,
    entry.source?.file,
    entry.data?.file,
    entry.metadata.textValue,
    entry.metadata.fontLabel,
    entry.metadata.mediaItems
      ?.map((mediaItem) => `${mediaItem.variant} ${mediaItem.type} ${mediaItem.url}`)
      .join(' '),
    entry.metadata.classNames?.join(' '),
    entry.metadata.usage?.label,
    entry.metadata.usage?.filePath,
    entry.metadata.usage?.positionLabel,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return terms.every((term) => text.includes(term));
};

export const filterSectionOutlineEntries = (
  entries: SectionOutlineEntry[],
  terms: string[]
): SectionOutlineEntry[] => {
  if (terms.length === 0) return entries;

  return entries.flatMap((entry) => {
    const children = filterSectionOutlineEntries(entry.children, terms);
    if (!matchesSectionOutlineFilter(entry, terms) && children.length === 0) {
      return [];
    }

    return [{ ...entry, children }];
  });
};
