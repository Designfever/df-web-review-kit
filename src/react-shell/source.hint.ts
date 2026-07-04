import type { DomSourceHint } from '../types';

export type SourceIgnorePattern = string | RegExp;

export type GetSourceCandidatesOptions = {
  includePlacer?: boolean;
  ignore?: readonly SourceIgnorePattern[];
};

export const matchesIgnore = (
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

function getSourceAttribute(element: Element, ...names: string[]) {
  for (const name of names) {
    const value = element.getAttribute(name)?.trim();
    if (value) return value;
  }

  return undefined;
}

export function getDataHintFromElement(
  element: Element
): DomSourceHint | undefined {
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

export function getSourceHintFromElement(
  element: Element
): DomSourceHint | undefined {
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

export function getParentSourceHintFromElement(
  element: Element
): DomSourceHint | undefined {
  const source: DomSourceHint = {
    component: getSourceAttribute(
      element,
      'data-wrk-source-parent-component'
    ),
    file: getSourceAttribute(element, 'data-wrk-source-parent-file'),
    line: getSourceAttribute(element, 'data-wrk-source-parent-line'),
    column: getSourceAttribute(element, 'data-wrk-source-parent-column'),
    sectionId: undefined,
    sectionIndex: undefined,
  };

  return Object.values(source).some(Boolean) ? source : undefined;
}

export function getComponentNameFromSourceFile(file: string | undefined) {
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

export function getDisplaySourcePath(file: string | undefined) {
  const normalizedFile = file?.trim().replace(/\\/g, '/');
  if (!normalizedFile) return undefined;

  const sourceRootMatch = normalizedFile.match(
    /(?:^|\/)((?:dev\/)?src\/.+|app\/.+|pages?\/.+|components\/.+)$/
  );
  return sourceRootMatch?.[1] ?? normalizedFile;
}

export function getSourceFileCompareKey(file: string | undefined) {
  return file?.trim().replace(/\\/g, '/') ?? '';
}

export function addSourceFileCompareKey(seen: Set<string>, key: string) {
  if (!key || hasEquivalentSourceFileKey(seen, key)) return false;
  seen.add(key);
  return true;
}

export function hasEquivalentSourceFileKey(seen: Set<string>, key: string) {
  for (const seenKey of seen) {
    if (isEquivalentSourceFileKey(seenKey, key)) return true;
  }
  return false;
}

function isEquivalentSourceFileKey(a: string, b: string) {
  return a === b || a.endsWith(`/${b}`) || b.endsWith(`/${a}`);
}

export function isCoreOutlineNode(label: string, file: string | undefined) {
  const text = `${label} ${file ?? ''}`.toLowerCase();
  return (
    text.includes('core.section') ||
    text.includes('core.content') ||
    text.includes('core.column') ||
    ['coresection', 'corecontent', 'corecolumn'].includes(label.toLowerCase())
  );
}

export function isPlacerSourceNode(label: string, file: string | undefined) {
  return `${label} ${file ?? ''}`.toLowerCase().includes('placer');
}
