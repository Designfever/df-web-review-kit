import type { DomSourceHint } from '../types';

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

export const getElementSourceHint = (
  target: EventTarget | null
): DomSourceHint | undefined => {
  const sourceElement = getSourceHintElement(target);
  if (!sourceElement) return undefined;

  const source: DomSourceHint = {
    component: getSourceAttribute(
      sourceElement,
      'data-wrk-source-component',
      'data-component'
    ),
    file: getSourceAttribute(sourceElement, 'data-wrk-source-file', 'data-file'),
    line: getSourceAttribute(sourceElement, 'data-wrk-source-line'),
    column: getSourceAttribute(sourceElement, 'data-wrk-source-column'),
    sectionId: getSourceAttribute(sourceElement, 'data-section-id'),
    sectionIndex: getSourceAttribute(sourceElement, 'data-section-index'),
  };

  return Object.values(source).some(Boolean) ? source : undefined;
};

export const getSourceOpenUrl = (
  source: DomSourceHint | undefined,
  sourceRoot?: string
) => {
  const file = source?.file?.trim();
  if (!file) return null;

  const sourcePath = getSourcePath(file, sourceRoot);
  if (!sourcePath) return null;

  const line = getSourcePosition(source?.line);
  const column = getSourcePosition(source?.column);
  const encodedPath = encodeURI(sourcePath).replace(/[#?]/g, (match) =>
    match === '#' ? '%23' : '%3F'
  );

  return `vscode://file/${encodedPath}:${line}:${column}`;
};

export const openSourceInEditor = (
  source: DomSourceHint | undefined,
  sourceRoot?: string
) => {
  const url = getSourceOpenUrl(source, sourceRoot);
  if (!url) return false;

  window.open(url, '_blank', 'noreferrer');
  return true;
};

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
  return Number.isInteger(position) && position > 0 ? position : 1;
}
