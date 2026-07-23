import type { DomSourceHint } from '../types';
import {
  addSourceFileCompareKey,
  getComponentNameFromSourceFile,
  getDataHintFromElement,
  getDisplaySourcePath,
  getParentSourceHintFromElement,
  getSourceFileCompareKey,
  getSourceHintFromElement,
  hasEquivalentSourceFileKey,
  isCoreOutlineNode,
  isPlacerSourceNode,
  matchesIgnore,
  type GetSourceCandidatesOptions,
} from './source.hint';

const SECTION_OUTLINE_ROOT_SELECTOR = [
  '[data-wrk-source-component]',
  'header[data-wrk-source-file]',
  'footer[data-wrk-source-file]',
  '[role="banner"][data-wrk-source-file]',
  '[role="contentinfo"][data-wrk-source-file]',
].join(', ');

export type SectionOutlineEntry = {
  id: string;
  label: string;
  filePath: string;
  depth: number;
  element: Element;
  source: DomSourceHint | undefined;
  data: DomSourceHint | undefined;
  metadata: SectionOutlineMetadata;
  children: SectionOutlineEntry[];
};

type SectionOutlineMetadata = {
  textValue?: string;
  fontLabel?: string;
  mediaItems?: SectionOutlineMediaItem[];
  classNames?: string[];
  usage?: SectionOutlineUsageMetadata;
};

type SectionOutlineMediaItem = {
  type: 'image' | 'video';
  url: string;
  variant: 'desktop' | 'mobile' | 'media';
};

type SectionOutlineUsageMetadata = {
  source: DomSourceHint;
  label: string;
  filePath: string;
  positionLabel: string;
};

export type GetSectionOutlineOptions = GetSourceCandidatesOptions & {
  maxDepth?: number;
};

/**
 * 섹션 래퍼와 frame landmark(header/footer)를 루트로 source tree를 만든다.
 * Placer 계열 primitive는 기본으로 숨기고, includePlacer 옵션에서만 표시한다.
 */
export const getSectionOutline = (
  root: ParentNode,
  options?: GetSectionOutlineOptions
): SectionOutlineEntry[] => {
  const maxDepth = options?.maxDepth ?? 9;
  return getSectionOutlineRoots(root, options).map((element, index) => {
    const source = getSourceHintFromElement(element);
    const label = getOutlineLabel(element, source, 'section');
    const seen = new Set<string>();
    if (source?.file) {
      addSourceFileCompareKey(seen, getOutlineSourceKey(source));
    }
    return createSectionOutlineEntry({
      id: `${label}-${index}`,
      label,
      depth: 1,
      filePath: getDisplaySourcePath(source?.file) ?? label,
      element,
      source,
      data: getDataHintFromElement(element),
      children: getSectionOutlineChildren(
        element,
        2,
        maxDepth,
        seen,
        options
      ),
    });
  });
};

/**
 * entries 트리에서 element 를 포함하는 가장 깊은 경로(root→해당 entry)를 찾는다.
 * entry.element 가 element 이거나 이를 포함하면 매칭으로 본다.
 */
export function findSectionOutlinePath(
  entries: SectionOutlineEntry[],
  element: Element
): SectionOutlineEntry[] | null {
  let bestPath: SectionOutlineEntry[] | null = null;

  const visit = (entry: SectionOutlineEntry, path: SectionOutlineEntry[]) => {
    const isMatch = entry.element === element || entry.element.contains(element);
    if (!isMatch) return;

    const nextPath = [...path, entry];
    bestPath = nextPath;
    entry.children.forEach((child) => visit(child, nextPath));
  };

  entries.forEach((entry) => visit(entry, []));
  return bestPath;
}

/** target 문서에서 outline 을 즉석으로 만들어 element 의 경로를 반환한다. */
export function getSectionOutlinePathForElement(
  root: ParentNode,
  element: Element,
  options?: GetSectionOutlineOptions
): SectionOutlineEntry[] | null {
  return findSectionOutlinePath(getSectionOutline(root, options), element);
}

function getSectionOutlineRoots(
  root: ParentNode,
  options: GetSectionOutlineOptions | undefined
) {
  return Array.from(root.querySelectorAll(SECTION_OUTLINE_ROOT_SELECTOR)).filter(
    (element) => {
      if (element.closest('[data-dfwr-adjust-preview="true"]')) return false;

      const source = getSourceHintFromElement(element);
      const label = getOutlineLabel(element, source, '');
      return (
        !isSkippedOutlineNode(label, source?.file, options) &&
        !hasSectionOutlineRootAncestor(element, root, options)
      );
    }
  );
}

function hasSectionOutlineRootAncestor(
  element: Element,
  root: ParentNode,
  options: GetSectionOutlineOptions | undefined
) {
  let parent = element.parentElement;
  while (parent && parent !== root) {
    if (parent.matches(SECTION_OUTLINE_ROOT_SELECTOR)) {
      const source = getSourceHintFromElement(parent);
      const label = getOutlineLabel(parent, source, '');
      if (!isSkippedOutlineNode(label, source?.file, options)) return true;
    }
    parent = parent.parentElement;
  }

  return false;
}

function getSectionOutlineChildren(
  parent: Element,
  depth: number,
  maxDepth: number,
  seen: Set<string>,
  options: GetSectionOutlineOptions | undefined
): SectionOutlineEntry[] {
  if (depth > maxDepth) return [];

  const entries: SectionOutlineEntry[] = [];
  for (const child of Array.from(parent.children)) {
    const source = getSourceHintFromElement(child);
    const label = getOutlineLabel(child, source, child.tagName.toLowerCase());
    const sourceKey = source?.file ? getOutlineSourceKey(source) : '';
    const isNewSource =
      Boolean(sourceKey) && !hasEquivalentSourceFileKey(seen, sourceKey);

    if (shouldStopOutlineBranch(label, source?.file, options)) continue;

    if (isHiddenOutlineNode(label, source?.file, options)) {
      entries.push(
        ...getSectionOutlineChildren(child, depth, maxDepth, seen, options)
      );
      continue;
    }

    if (source?.file && isNewSource) {
      const childSeen = new Set(seen);
      addSourceFileCompareKey(childSeen, sourceKey);
      entries.push(createSectionOutlineEntry({
        id: `${sourceKey}-${getElementOutlinePath(child)}-${entries.length}`,
        label,
        depth,
        filePath: getDisplaySourcePath(source.file) ?? source.file,
        element: child,
        source,
        data: getDataHintFromElement(child),
        children: getSectionOutlineChildren(
          child,
          depth + 1,
          maxDepth,
          childSeen,
          options
        ),
      }));
      continue;
    }

    entries.push(
      ...getSectionOutlineChildren(child, depth, maxDepth, seen, options)
    );
  }

  return entries;
}

function getElementOutlinePath(element: Element) {
  const indices: number[] = [];
  let current: Element | null = element;

  while (current?.parentElement) {
    indices.unshift(Array.from(current.parentElement.children).indexOf(current));
    current = current.parentElement;
  }

  return indices.join('-');
}

function createSectionOutlineEntry(
  entry: Omit<SectionOutlineEntry, 'metadata'>
): SectionOutlineEntry {
  return {
    ...entry,
    metadata: getSectionOutlineMetadata(entry.element, entry.label, entry.source),
  };
}

const truncateOutlineValue = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;

const normalizeOutlineValue = (value: string | null | undefined) =>
  value?.replace(/\s+/g, ' ').trim() ?? '';

function getSectionOutlineMetadata(
  element: Element,
  label: string,
  source: DomSourceHint | undefined
): SectionOutlineMetadata {
  const textElement = getPlacerTextElement(element, label, source?.file);

  return {
    textValue: textElement
      ? truncateOutlineValue(
          normalizeOutlineValue(textElement.textContent),
          180
        )
      : undefined,
    fontLabel: textElement ? getFontLabel(textElement) : undefined,
    mediaItems: getPlacerMediaItems(element, label, source?.file),
    classNames: getElementClassNames(element),
    usage: getSectionOutlineUsageMetadata(element, source),
  };
}

function getSectionOutlineUsageMetadata(
  element: Element,
  source: DomSourceHint | undefined
): SectionOutlineUsageMetadata | undefined {
  const usage = getElementParentSourceHint(element);
  if (!usage?.file || isSameSourceLocation(source, usage)) return undefined;

  return {
    source: usage,
    label:
      usage.component?.trim() ||
      getComponentNameFromSourceFile(usage.file) ||
      'Parent',
    filePath: getDisplaySourcePath(usage.file) ?? usage.file,
    positionLabel: getSourcePositionLabel(usage),
  };
}

function getElementParentSourceHint(element: Element) {
  const direct = getParentSourceHintFromElement(element);
  if (direct?.file) return direct;

  const descendant = element.querySelector('[data-wrk-source-parent-file]');
  return descendant ? getParentSourceHintFromElement(descendant) : undefined;
}

function isSameSourceLocation(
  source: DomSourceHint | undefined,
  usage: DomSourceHint
) {
  return (
    getSourceFileCompareKey(source?.file) === getSourceFileCompareKey(usage.file) &&
    normalizeSourcePosition(source?.line) === normalizeSourcePosition(usage.line) &&
    normalizeSourcePosition(source?.column) === normalizeSourcePosition(usage.column)
  );
}

function getSourcePositionLabel(source: DomSourceHint) {
  const line = normalizeSourcePosition(source.line);
  const column = normalizeSourcePosition(source.column);
  if (!line) return '';
  return `${line}:${column || 1}`;
}

function normalizeSourcePosition(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : '';
}

function getElementClassNames(element: Element) {
  const classNames = Array.from(element.classList).filter(Boolean);
  return classNames.length > 0 ? classNames : undefined;
}

function getPlacerTextElement(
  element: Element,
  label: string,
  file: string | undefined
) {
  if (!isPlacerTextOutlineNode(label, file) && !element.hasAttribute('data-font')) {
    return null;
  }

  return element.hasAttribute('data-font')
    ? element
    : element.querySelector('[data-font]');
}

function isPlacerTextOutlineNode(label: string, file: string | undefined) {
  return `${label} ${file ?? ''}`.toLowerCase().includes('placertext');
}

function getFontLabel(element: Element) {
  const dataFont = element.getAttribute('data-font');
  if (dataFont) {
    return dataFont
      .replace(/\bs\b/g, 'sb')
      .replace(/\bsemibold\b/g, 'sb')
      .replace(/\bregular\b/g, 'r');
  }

  const style = window.getComputedStyle(element);
  return `${Math.round(parseFloat(style.fontSize))}px ${style.fontWeight}`;
}

function getPlacerMediaItems(
  element: Element,
  label: string,
  file: string | undefined
) {
  if (!isPlacerMediaOutlineNode(label, file)) return undefined;

  const mediaItems: SectionOutlineMediaItem[] = [];
  const seen = new Set<string>();
  const addMediaItem = (
    target: Element,
    type: SectionOutlineMediaItem['type'],
    url: string | null | undefined
  ) => {
    const normalizedUrl = normalizeOutlineValue(url);
    if (!normalizedUrl) return;

    const variant = getPlacerMediaVariant(target, element);
    const key = `${variant}:${type}:${normalizedUrl}`;
    if (seen.has(key)) return;
    seen.add(key);
    mediaItems.push({ type, url: normalizedUrl, variant });
  };

  if (element instanceof HTMLVideoElement) {
    addMediaItem(element, 'video', getVideoElementUrl(element));
    addMediaItem(element, 'image', element.getAttribute('poster'));
  }
  if (element instanceof HTMLImageElement) {
    addMediaItem(element, 'image', getMediaElementUrl(element));
  }
  if (element instanceof HTMLSourceElement) {
    addMediaItem(element, 'video', getSourceElementUrl(element));
  }

  Array.from(element.querySelectorAll('video')).forEach((video) => {
    addMediaItem(video, 'video', getVideoElementUrl(video));
    addMediaItem(video, 'image', video.getAttribute('poster'));
  });
  Array.from(element.querySelectorAll('source')).forEach((source) => {
    addMediaItem(source, 'video', getSourceElementUrl(source));
  });
  Array.from(element.querySelectorAll('img')).forEach((img) => {
    addMediaItem(img, 'image', getMediaElementUrl(img));
  });

  return mediaItems.length > 0 ? mediaItems : undefined;
}

function isPlacerMediaOutlineNode(label: string, file: string | undefined) {
  return `${label} ${file ?? ''}`.toLowerCase().includes('placermedia');
}

function getPlacerMediaVariant(
  target: Element,
  root: Element
): SectionOutlineMediaItem['variant'] {
  let current: Element | null = target;
  while (current) {
    if (current.classList.contains('d-block-pc')) return 'desktop';
    if (current.classList.contains('d-block-m')) return 'mobile';
    if (current === root) break;
    current = current.parentElement;
  }

  return 'media';
}

function getVideoElementUrl(video: HTMLVideoElement) {
  return (
    video.currentSrc ||
    video.getAttribute('src') ||
    video.querySelector('source')?.getAttribute('src') ||
    video.getAttribute('poster') ||
    video.src
  );
}

function getSourceElementUrl(source: HTMLSourceElement) {
  return source.getAttribute('src') || source.src;
}

function getMediaElementUrl(img: HTMLImageElement) {
  return img.currentSrc || img.getAttribute('src') || img.src;
}

function getOutlineSourceKey(source: DomSourceHint) {
  return getSourceFileCompareKey(source.file);
}

function getOutlineLabel(
  element: Element,
  source: DomSourceHint | undefined,
  fallback: string
) {
  return (
    source?.component?.trim() ||
    getComponentNameFromSourceFile(source?.file) ||
    element.id.trim() ||
    fallback
  );
}

function isHiddenOutlineNode(
  label: string,
  file: string | undefined,
  options: GetSourceCandidatesOptions | undefined
) {
  const ignore = options?.ignore;
  const isIgnoredSource =
    file && ignore?.length ? matchesIgnore(file, ignore) : false;
  return isCoreOutlineNode(label, file) || isIgnoredSource;
}

function shouldStopOutlineBranch(
  label: string,
  file: string | undefined,
  options: GetSourceCandidatesOptions | undefined
) {
  return !options?.includePlacer && isPlacerOutlineNode(label, file);
}

function isSkippedOutlineNode(
  label: string,
  file: string | undefined,
  options: GetSourceCandidatesOptions | undefined
) {
  return (
    shouldStopOutlineBranch(label, file, options) ||
    isHiddenOutlineNode(label, file, options)
  );
}

function isPlacerOutlineNode(label: string, file: string | undefined) {
  return isPlacerSourceNode(label, file);
}
