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

export const getSourceCandidates = (
  target: EventTarget | null
): SourceCandidate[] => {
  const startElement = getEventElement(target);
  if (!startElement) return [];

  const candidates: SourceCandidate[] = [];
  const seen = new Set<string>();
  let element: Element | null = startElement;
  let depth = 0;

  while (element && element.nodeType === 1) {
    const source = getSourceHintFromElement(element);
    if (source?.file) {
      const key = getSourceCandidateKey(source);
      if (!seen.has(key)) {
        seen.add(key);
        candidates.push(createSourceCandidate(element, source, depth));
      }
    }

    if (element === element.ownerDocument.documentElement) break;
    element = element.parentElement;
    depth += 1;
  }

  return candidates.slice(0, 8);
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
    /(?:^|\/)((?:dev\/)?src\/.+|app\/.+|pages\/.+|components\/.+)$/
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
