import type { DomSourceHint } from '../types';
import type { ReviewSourceInspectorOptions } from './types';

const SECTION_OUTLINE_ROOT_SELECTOR = [
  '[data-wrk-source-component]',
  'header[data-wrk-source-file]',
  'footer[data-wrk-source-file]',
  '[role="banner"][data-wrk-source-file]',
  '[role="contentinfo"][data-wrk-source-file]',
].join(', ');

export type SourceOpenOptions = ReviewSourceInspectorOptions & {
  omitPosition?: boolean;
  sourceRoot?: string;
};

export type SourceCandidate = {
  id: string;
  depth: number;
  element: Element;
  filePath: string;
  label: string;
  detail: string;
  positionLabel: string;
  confidence: number;
  confidenceLabel: 'high' | 'medium' | 'low';
  kind: 'source' | 'data';
  usesPosition: boolean;
  source: DomSourceHint;
};

type SourceIgnorePattern = string | RegExp;

export type GetSourceCandidatesOptions = {
  includePlacer?: boolean;
  ignore?: readonly SourceIgnorePattern[];
};

const matchesIgnore = (
  file: string,
  patterns: readonly SourceIgnorePattern[]
) => {
  const normalized = file.replace(/\\/g, '/');
  return patterns.some((pattern) =>
    typeof pattern === 'string'
      ? normalized.includes(pattern)
      : pattern.test(normalized)
  );
};

export const getSourceCandidates = (
  target: EventTarget | null,
  options?: GetSourceCandidatesOptions
): SourceCandidate[] => {
  const startElement = getEventElement(target);
  if (!startElement) return [];

  const candidates: SourceCandidate[] = [];
  const seen = new Set<string>();
  const add = (
    element: Element,
    source: DomSourceHint | undefined,
    depth: number,
    kind: SourceCandidate['kind']
  ) => {
    if (!source?.file) return;
    // 같은 파일은 1개만(가장 안쪽=클릭에 가까운 것). 중첩 primitive 의 줄 단위 중복을 막는다.
    const key = getSourceFileCompareKey(source.file);
    if (!addSourceFileCompareKey(seen, key)) return;
    candidates.push(createSourceCandidate(element, source, depth, kind));
  };

  // 클릭 지점에서 부모로 거슬러 올라가며 수집
  let element: Element | null = startElement;
  let depth = 0;
  while (element && element.nodeType === 1) {
    add(element, getSourceHintFromElement(element), depth, 'source');
    // page data 파일 출처(__wrkDataFile)는 별도 후보로. 라인이 있으므로 depth 0 으로 위치 유지.
    add(element, getDataHintFromElement(element), 0, 'data');
    if (element === element.ownerDocument.documentElement) break;
    element = element.parentElement;
    depth += 1;
  }

  // 인프라/래퍼 파일 숨김. 전부 걸러지면 빈 후보 대신 원본을 그대로 노출.
  const ignore = options?.ignore;
  const visible = candidates.filter(
    (candidate) =>
      !isCoreOutlineNode(candidate.label, candidate.source.file) &&
      !(ignore?.length && matchesIgnore(candidate.source.file ?? '', ignore))
  );
  return visible.slice(0, 8);
};

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

type SectionOutlineRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type SectionOutlineMetadata = {
  rect: SectionOutlineRect;
  textValue?: string;
  fontLabel?: string;
  mediaItems?: SectionOutlineMediaItem[];
  classNames?: string[];
};

type SectionOutlineMediaItem = {
  type: 'image' | 'video';
  url: string;
  variant: 'desktop' | 'mobile' | 'media';
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

function getSectionOutlineRoots(
  root: ParentNode,
  options: GetSectionOutlineOptions | undefined
) {
  return Array.from(root.querySelectorAll(SECTION_OUTLINE_ROOT_SELECTOR)).filter(
    (element) => {
      const source = getSourceHintFromElement(element);
      const label = getOutlineLabel(element, source, '');
      return !isSkippedOutlineNode(label, source?.file, options);
    }
  );
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
    rect: getSectionOutlineRect(element),
    textValue: textElement
      ? truncateOutlineValue(
          normalizeOutlineValue(textElement.textContent),
          180
        )
      : undefined,
    fontLabel: textElement ? getFontLabel(textElement) : undefined,
    mediaItems: getPlacerMediaItems(element, label, source?.file),
    classNames: getElementClassNames(element),
  };
}

function getSectionOutlineRect(element: Element): SectionOutlineRect {
  const rect = element.getBoundingClientRect();
  return {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
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

function getSourceFileCompareKey(file: string | undefined) {
  return file?.trim().replace(/\\/g, '/') ?? '';
}

function addSourceFileCompareKey(seen: Set<string>, key: string) {
  if (!key || hasEquivalentSourceFileKey(seen, key)) return false;
  seen.add(key);
  return true;
}

function hasEquivalentSourceFileKey(seen: Set<string>, key: string) {
  for (const seenKey of seen) {
    if (isEquivalentSourceFileKey(seenKey, key)) return true;
  }
  return false;
}

function isEquivalentSourceFileKey(a: string, b: string) {
  return a === b || a.endsWith(`/${b}`) || b.endsWith(`/${a}`);
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

function isCoreOutlineNode(label: string, file: string | undefined) {
  const text = `${label} ${file ?? ''}`.toLowerCase();
  return (
    text.includes('core.section') ||
    text.includes('core.content') ||
    text.includes('core.column') ||
    ['coresection', 'corecontent', 'corecolumn'].includes(label.toLowerCase())
  );
}

function isPlacerOutlineNode(label: string, file: string | undefined) {
  return `${label} ${file ?? ''}`.toLowerCase().includes('placer');
}

export const getSourceOpenUrl = (
  source: DomSourceHint | undefined,
  options?: string | SourceOpenOptions
) => {
  const normalizedOptions = normalizeSourceOpenOptions(options);
  const file = source?.file?.trim();
  if (!file) return null;

  const sourcePath = getSourcePath(file, normalizedOptions.sourceRoot);
  if (!sourcePath) return null;

  const hasPosition = !normalizedOptions.omitPosition;
  const line = hasPosition ? getSourcePosition(source?.line) : null;
  const column = hasPosition ? getSourcePosition(source?.column) : null;
  const editor = normalizedOptions.editor ?? 'vscode';

  if (normalizedOptions.urlTemplate) {
    return buildSourceUrlFromTemplate(normalizedOptions.urlTemplate, {
      column,
      file,
      line,
      sourcePath,
      sourceRoot: normalizedOptions.sourceRoot,
    });
  }

  if (editor === 'webstorm') {
    const params = new URLSearchParams({ file: sourcePath });
    if (line) params.set('line', String(line));
    if (column) params.set('column', String(column));
    return `webstorm://open?${params.toString()}`;
  }

  if (editor === 'custom') return null;

  const encodedPath = encodePathForFileScheme(sourcePath);
  const scheme = editor === 'cursor' ? 'cursor' : 'vscode';
  if (!line) return `${scheme}://file/${encodedPath}`;
  if (!column) return `${scheme}://file/${encodedPath}:${line}`;
  return `${scheme}://file/${encodedPath}:${line}:${column}`;
};

export const openSourceInEditor = (
  source: DomSourceHint | undefined,
  options?: string | SourceOpenOptions
) => {
  const url = getSourceOpenUrl(source, options);
  if (!url) return false;

  window.open(url, '_blank', 'noreferrer');
  return true;
};

function getDataHintFromElement(element: Element): DomSourceHint | undefined {
  const file = getSourceAttribute(element, 'data-wrk-data-file');
  if (!file) return undefined;

  return {
    component: undefined,
    file,
    line: getSourceAttribute(element, 'data-wrk-data-line'),
    column: undefined,
    sectionId: undefined,
    sectionIndex: undefined,
  };
}

function getSourceHintFromElement(element: Element): DomSourceHint | undefined {
  const source: DomSourceHint = {
    component: getSourceAttribute(
      element,
      'data-wrk-source-component',
      'data-component'
    ),
    file: getSourceAttribute(element, 'data-wrk-source-file', 'data-file'),
    line: getSourceAttribute(element, 'data-wrk-source-line'),
    column: getSourceAttribute(element, 'data-wrk-source-column'),
    sectionId: getSourceAttribute(element, 'data-section-id'),
    sectionIndex: getSourceAttribute(element, 'data-section-index'),
  };

  return Object.values(source).some(Boolean) ? source : undefined;
}

function createSourceCandidate(
  element: Element,
  source: DomSourceHint,
  depth: number,
  kind: SourceCandidate['kind']
): SourceCandidate {
  const confidence = getSourceConfidence(source, depth);
  const fileName = source.file?.split(/[\\/]/).pop() ?? source.file ?? 'source';
  const component = source.component?.trim();
  const fallbackComponent = getComponentNameFromSourceFile(source.file);
  const tag = element.tagName.toLowerCase();
  const line = getSourcePosition(source.line);
  const column = getSourcePosition(source.column);
  const position = line ? `:${line}${column ? `:${column}` : ''}` : '';

  return {
    id: `${kind}:${getSourceCandidateKey(source)}`,
    depth,
    element,
    filePath: getDisplaySourcePath(source.file) ?? fileName,
    label: component || fallbackComponent || tag,
    detail: `${fileName}${position}`,
    positionLabel: line ? `${line}:${column ?? 1}` : '',
    confidence,
    confidenceLabel:
      confidence >= 0.82 ? 'high' : confidence >= 0.58 ? 'medium' : 'low',
    kind,
    usesPosition: confidence >= 0.72 && Boolean(line),
    source,
  };
}

function getComponentNameFromSourceFile(file: string | undefined) {
  const normalizedFile = file?.trim().replace(/\\/g, '/');
  if (!normalizedFile) return undefined;

  const pathParts = normalizedFile.split('/').filter(Boolean);
  const fileName = pathParts[pathParts.length - 1];
  if (!fileName) return undefined;

  const stem = fileName.replace(/\.[^.]+$/, '');
  const sourceName =
    stem.toLowerCase() === 'index'
      ? pathParts[pathParts.length - 2]?.replace(/\.[^.]+$/, '')
      : stem;

  return toPascalCase(sourceName);
}

function toPascalCase(value: string | undefined) {
  const words = value
    ?.split(/[._\-\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!words?.length) return undefined;

  return words
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join('');
}

function getDisplaySourcePath(file: string | undefined) {
  const normalizedFile = file?.trim().replace(/\\/g, '/');
  if (!normalizedFile) return undefined;

  const sourceRootMatch = normalizedFile.match(
    /(?:^|\/)((?:dev\/)?src\/.+|app\/.+|pages?\/.+|components\/.+)$/
  );
  return sourceRootMatch?.[1] ?? normalizedFile;
}

function getSourceCandidateKey(source: DomSourceHint) {
  return [
    source.file,
    source.component,
    source.line,
    source.column,
    source.sectionId,
    source.sectionIndex,
  ]
    .filter(Boolean)
    .join('|');
}

function getSourceConfidence(source: DomSourceHint, depth: number) {
  let score = source.file ? 0.54 : 0.12;
  if (source.component) score += 0.12;
  if (getSourcePosition(source.line)) score += 0.22;
  if (getSourcePosition(source.column)) score += 0.08;
  if (source.sectionId || source.sectionIndex) score += 0.04;
  score -= Math.min(depth, 5) * 0.045;
  return Math.max(0.1, Math.min(1, Number(score.toFixed(2))));
}

function normalizeSourceOpenOptions(
  options?: string | SourceOpenOptions
): SourceOpenOptions {
  return typeof options === 'string' ? { sourceRoot: options } : options ?? {};
}

function buildSourceUrlFromTemplate(
  template: string,
  values: {
    column: number | null;
    file: string;
    line: number | null;
    sourcePath: string;
    sourceRoot?: string;
  }
) {
  const replacements: Record<string, string> = {
    column: values.column ? String(values.column) : '',
    encodedPath: encodeURIComponent(values.sourcePath),
    file: values.file,
    line: values.line ? String(values.line) : '',
    path: values.sourcePath,
    sourceRoot: values.sourceRoot ?? '',
    uriPath: encodePathForFileScheme(values.sourcePath),
  };

  return template.replace(/\{([a-zA-Z]+)\}/g, (_, key: string) =>
    replacements[key] ?? ''
  );
}

function getSourceAttribute(element: Element, ...names: string[]) {
  for (const name of names) {
    const value = element.getAttribute(name)?.trim();
    if (value) return value;
  }

  return undefined;
}

function getEventElement(target: EventTarget | null): Element | null {
  if (!target || typeof target !== 'object') return null;

  const node = target as {
    closest?: (selector: string) => Element | null;
    nodeType?: number;
    parentElement?: Element | null;
  };

  if (node.nodeType === 1 && typeof node.closest === 'function') {
    return node as Element;
  }

  if (node.parentElement && typeof node.parentElement.closest === 'function') {
    return node.parentElement;
  }

  return null;
}

function getSourcePath(file: string, sourceRoot?: string) {
  const normalizedFile = file.replace(/\\/g, '/');
  if (normalizedFile.startsWith('/') || /^[a-zA-Z]:\//.test(normalizedFile)) {
    return normalizedFile;
  }

  const normalizedRoot = sourceRoot
    ?.trim()
    .replace(/\\/g, '/')
    .replace(/\/+$/, '');
  if (!normalizedRoot) return null;

  return `${normalizedRoot}/${normalizedFile.replace(/^\/+/, '')}`;
}

function getSourcePosition(value: string | undefined) {
  const position = Number(value);
  return Number.isInteger(position) && position > 0 ? position : null;
}

function encodePathForFileScheme(path: string) {
  return encodeURI(path).replace(/[#?]/g, (match) =>
    match === '#' ? '%23' : '%3F'
  );
}
