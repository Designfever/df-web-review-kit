import type { DomSourceHint } from '../types';
import type { ReviewSourceInspectorOptions } from './types';
import {
  addSourceFileCompareKey,
  getComponentNameFromSourceFile,
  getDataHintFromElement,
  getDisplaySourcePath,
  getSourceFileCompareKey,
  getSourceHintFromElement,
  isCoreOutlineNode,
  isPlacerSourceNode,
  matchesIgnore,
  type GetSourceCandidatesOptions,
} from './source.hint';

export type { GetSourceCandidatesOptions } from './source.hint';

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

type SourceCandidateContext = {
  // dedupe key → 같은 소스에서 렌더된 요소 목록 (문서 순서).
  // getSourceCandidates 호출 한 번 동안만 유효한 캐시. 후보마다 문서 전체를
  // querySelectorAll 로 재스캔하면 큰 DOM 에서 클릭이 느려져서 kind 별 1회로 줄인다.
  repeatIndexByKind: Map<SourceCandidate['kind'], Map<string, Element[]>>;
  sourceStack: SourceStackEntry[];
  targetElement: Element;
  targetQaElement: Element | null;
  targetText: string;
};

type SourceStackEntry = {
  component?: string;
  file?: string;
  key: string;
};

type SourceRepeatInfo = {
  count: number;
  index: number;
};

export const getSourceCandidates = (
  target: EventTarget | null,
  options?: GetSourceCandidatesOptions
): SourceCandidate[] => {
  const startElement = getEventElement(target);
  if (!startElement) return [];

  const candidates: SourceCandidate[] = [];
  const seen = new Set<string>();
  const context = createSourceCandidateContext(startElement);
  const add = (
    element: Element,
    source: DomSourceHint | undefined,
    depth: number,
    kind: SourceCandidate['kind']
  ) => {
    if (!source?.file) return;
    const key = `${kind}:${getSourceCandidateDedupeKey(source)}`;
    if (!addSourceFileCompareKey(seen, key)) return;
    candidates.push(createSourceCandidate(element, source, depth, kind, context));
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
      (options?.includePlacer ||
        !isPlacerSourceNode(candidate.label, candidate.source.file)) &&
      !(ignore?.length && matchesIgnore(candidate.source.file ?? '', ignore))
  );
  return takeVisibleSourceCandidates(visible);
};

const getSourceOpenUrl = (
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

function createSourceCandidate(
  element: Element,
  source: DomSourceHint,
  depth: number,
  kind: SourceCandidate['kind'],
  context: SourceCandidateContext
): SourceCandidate {
  const repeatInfo = getSourceRepeatInfo(element, source, kind, context);
  const scoring = getSourceConfidence({
    context,
    depth,
    element,
    kind,
    repeatInfo,
    source,
  });
  const confidence = scoring.score;
  const fileName = source.file?.split(/[\\/]/).pop() ?? source.file ?? 'source';
  const component = source.component?.trim();
  const fallbackComponent = getComponentNameFromSourceFile(source.file);
  const tag = element.tagName.toLowerCase();
  const line = getSourcePosition(source.line);
  const column = getSourcePosition(source.column);
  const position = line ? `:${line}${column ? `:${column}` : ''}` : '';

  return {
    id: `${kind}:${getSourceCandidateKey(source)}:${repeatInfo?.index ?? 0}:${depth}`,
    depth,
    element,
    filePath: getDisplaySourcePath(source.file) ?? fileName,
    label: component || fallbackComponent || tag,
    detail: scoring.detail,
    positionLabel: line ? `${line}:${column ?? 1}` : '',
    confidence,
    confidenceLabel:
      confidence >= 0.82 ? 'high' : confidence >= 0.58 ? 'medium' : 'low',
    kind,
    usesPosition: confidence >= 0.72 && Boolean(line),
    source,
  };
}

function takeVisibleSourceCandidates(candidates: SourceCandidate[]) {
  const fileCounts = new Map<string, number>();
  const sorted = [...candidates].sort(
    (a, b) => b.confidence - a.confidence || a.depth - b.depth
  );
  const visible: SourceCandidate[] = [];

  for (const candidate of sorted) {
    const fileKey = getSourceFileCompareKey(candidate.source.file);
    const fileCount = fileCounts.get(fileKey) ?? 0;
    if (fileCount >= 3) continue;

    fileCounts.set(fileKey, fileCount + 1);
    visible.push(candidate);
    if (visible.length >= 8) break;
  }

  return visible;
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

function getSourceCandidateDedupeKey(source: DomSourceHint) {
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

function getSourceConfidence({
  context,
  depth,
  element,
  kind,
  repeatInfo,
  source,
}: {
  context: SourceCandidateContext;
  depth: number;
  element: Element;
  kind: SourceCandidate['kind'];
  repeatInfo: SourceRepeatInfo | null;
  source: DomSourceHint;
}) {
  const details: string[] = [];
  const add = (amount: number, detail?: string) => {
    score += amount;
    if (detail) details.push(detail);
  };

  let score = source.file ? 0.38 : 0.12;
  if (kind === 'data') score -= 0.05;
  if (source.component) add(0.1);
  if (getSourcePosition(source.line)) add(0.18);
  if (getSourcePosition(source.column)) add(0.06);
  if (source.sectionId || source.sectionIndex) add(0.03, 'section');

  const stackIndex = getSourceStackIndex(context.sourceStack, source);
  if (stackIndex === 0) add(0.1, source.component ? 'component' : 'source');
  else if (stackIndex > 0) add(Math.max(0.02, 0.08 - stackIndex * 0.012));

  if (element === context.targetElement) add(0.12, 'target');
  else if (element.contains(context.targetElement)) add(0.05);

  if (
    context.targetQaElement &&
    (element === context.targetQaElement ||
      element.contains(context.targetQaElement) ||
      context.targetQaElement.contains(element))
  ) {
    add(0.05, 'qa');
  }

  const textScore = getSourceTextScore(element, context.targetText);
  if (textScore >= 0.12) add(textScore, 'text');
  else if (textScore > 0) add(textScore);

  if (repeatInfo && repeatInfo.count > 1) {
    if (textScore > 0 || context.targetQaElement) add(0.03, `#${repeatInfo.index}/${repeatInfo.count}`);
    else details.push(`#${repeatInfo.index}/${repeatInfo.count}`);
  }

  score -= Math.min(depth, 7) * 0.038;

  const normalizedScore = Math.max(0.1, Math.min(1, Number(score.toFixed(2))));
  return {
    detail: details.length > 0 ? details.join(' · ') : 'fallback',
    score: normalizedScore,
  };
}

function createSourceCandidateContext(
  targetElement: Element
): SourceCandidateContext {
  return {
    repeatIndexByKind: new Map(),
    sourceStack: getSourceStack(targetElement),
    targetElement,
    targetQaElement: targetElement.closest('[data-qa-id]'),
    targetText: getNormalizedElementText(targetElement),
  };
}

function getSourceStack(targetElement: Element): SourceStackEntry[] {
  const stack: SourceStackEntry[] = [];
  const seen = new Set<string>();
  let element: Element | null = targetElement;

  while (element && element.nodeType === 1) {
    const source = getSourceHintFromElement(element);
    const key = source ? getSourceCandidateDedupeKey(source) : '';
    if (key && !seen.has(key)) {
      seen.add(key);
      stack.push({
        component: source?.component,
        file: source?.file,
        key,
      });
    }
    if (element === element.ownerDocument.documentElement) break;
    element = element.parentElement;
  }

  return stack;
}

function getSourceStackIndex(
  stack: SourceStackEntry[],
  source: DomSourceHint
) {
  const sourceKey = getSourceCandidateDedupeKey(source);
  const exactIndex = stack.findIndex((entry) => entry.key === sourceKey);
  if (exactIndex >= 0) return exactIndex;

  const sourceFile = getSourceFileCompareKey(source.file);
  const sourceComponent = source.component?.trim();
  return stack.findIndex((entry) => {
    if (getSourceFileCompareKey(entry.file) !== sourceFile) return false;
    return !sourceComponent || entry.component === sourceComponent;
  });
}

function getSourceTextScore(element: Element, targetText: string) {
  if (!targetText) return 0;

  const elementText = getNormalizedElementText(element);
  if (!elementText) return 0;
  if (elementText === targetText) return 0.14;
  if (elementText.startsWith(targetText)) return 0.1;
  if (targetText.startsWith(elementText)) return 0.08;
  if (elementText.includes(targetText)) return 0.06;

  return 0;
}

function getNormalizedElementText(element: Element) {
  return (
    element.textContent
      ?.replace(/\s+/g, ' ')
      .trim()
      .slice(0, 140) ?? ''
  );
}

function getSourceRepeatInfo(
  element: Element,
  source: DomSourceHint,
  kind: SourceCandidate['kind'],
  context: SourceCandidateContext
): SourceRepeatInfo | null {
  const key = getSourceCandidateDedupeKey(source);
  if (!key) return null;

  // kind 별로 문서를 한 번만 스캔해 dedupe key → 요소 목록 인덱스를 만든다.
  let repeatIndex = context.repeatIndexByKind.get(kind);
  if (!repeatIndex) {
    repeatIndex = buildSourceRepeatIndex(element.ownerDocument, kind);
    context.repeatIndexByKind.set(kind, repeatIndex);
  }

  const matches = repeatIndex.get(key);
  if (!matches || matches.length <= 1) return null;

  const index = matches.indexOf(element);
  if (index < 0) return null;

  return {
    count: matches.length,
    index: index + 1,
  };
}

function buildSourceRepeatIndex(
  ownerDocument: Document,
  kind: SourceCandidate['kind']
) {
  const selector =
    kind === 'data' ? '[data-wrk-data-file]' : '[data-wrk-source-file], [data-file]';
  const repeatIndex = new Map<string, Element[]>();

  ownerDocument.querySelectorAll(selector).forEach((candidate) => {
    const candidateSource =
      kind === 'data'
        ? getDataHintFromElement(candidate)
        : getSourceHintFromElement(candidate);
    const candidateKey = candidateSource
      ? getSourceCandidateDedupeKey(candidateSource)
      : '';
    if (!candidateKey) return;

    const elements = repeatIndex.get(candidateKey);
    if (elements) {
      elements.push(candidate);
    } else {
      repeatIndex.set(candidateKey, [candidate]);
    }
  });

  return repeatIndex;
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
