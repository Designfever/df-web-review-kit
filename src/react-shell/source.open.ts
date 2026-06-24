import type { DomSourceHint } from '../types';
import type { ReviewSourceInspectorOptions } from './types';

const SOURCE_SELECTOR = [
  '[data-wrk-source-file]',
  '[data-wrk-source-component]',
  '[data-wrk-source-line]',
  '[data-wrk-source-column]',
  '[data-file]',
  '[data-component]',
  '[data-section-index]',
  '[data-section-id]',
].join(', ');

export const getSourceHintElement = (target: EventTarget | null) => {
  return getEventElement(target)?.closest(SOURCE_SELECTOR) ?? null;
};

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
  usesPosition: boolean;
  source: DomSourceHint;
};

export const getElementSourceHint = (
  target: EventTarget | null
): DomSourceHint | undefined => {
  const sourceElement = getSourceHintElement(target);
  if (!sourceElement) return undefined;

  return getSourceHintFromElement(sourceElement);
};

export type SourceIgnorePattern = string | RegExp;

export type GetSourceCandidatesOptions = {
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
  const add = (element: Element, source: DomSourceHint | undefined, depth: number) => {
    if (!source?.file) return;
    // 같은 파일은 1개만(가장 안쪽=클릭에 가까운 것). 중첩 primitive 의 줄 단위 중복을 막는다.
    const key = source.file.replace(/\\/g, '/');
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(createSourceCandidate(element, source, depth));
  };

  // 클릭 지점에서 부모로 거슬러 올라가며 수집
  let element: Element | null = startElement;
  let depth = 0;
  while (element && element.nodeType === 1) {
    add(element, getSourceHintFromElement(element), depth);
    // page data 파일 출처(__wrkDataFile)는 별도 후보로. 라인이 있으므로 depth 0 으로 위치 유지.
    add(element, getDataHintFromElement(element), 0);
    if (element === element.ownerDocument.documentElement) break;
    element = element.parentElement;
    depth += 1;
  }

  // 인프라/래퍼 파일 숨김. 전부 걸러지면 빈 후보 대신 원본을 그대로 노출.
  const ignore = options?.ignore;
  const visible = ignore?.length
    ? candidates.filter((c) => !matchesIgnore(c.source.file ?? '', ignore))
    : candidates;
  return (visible.length ? visible : candidates).slice(0, 8);
};

export type SectionOutlineEntry = {
  id: string;
  label: string;
  filePath: string;
  element: Element;
  source: DomSourceHint | undefined;
  data: DomSourceHint | undefined;
};

/**
 * 섹션 래퍼(`data-wrk-source-component` 가진 요소)를 문서 순서대로 모은다.
 * Option 좌측 아웃라인 패널에서 사용한다.
 */
export const getSectionOutline = (root: ParentNode): SectionOutlineEntry[] => {
  return Array.from(root.querySelectorAll('[data-wrk-source-component]')).map(
    (element, index) => {
      const label =
        element.getAttribute('data-wrk-source-component')?.trim() || 'section';
      const source = getSourceHintFromElement(element);
      return {
        id: `${label}-${index}`,
        label,
        filePath: getDisplaySourcePath(source?.file) ?? label,
        element,
        source,
        data: getDataHintFromElement(element),
      };
    }
  );
};

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
  depth: number
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
    id: getSourceCandidateKey(source),
    depth,
    element,
    filePath: getDisplaySourcePath(source.file) ?? fileName,
    label: component || fallbackComponent || tag,
    detail: `${fileName}${position}`,
    positionLabel: line ? `${line}:${column ?? 1}` : '',
    confidence,
    confidenceLabel:
      confidence >= 0.82 ? 'high' : confidence >= 0.58 ? 'medium' : 'low',
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
