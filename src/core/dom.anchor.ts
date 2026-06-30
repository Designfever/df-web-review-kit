import type {
  DomAnchor,
  DomAnchorCandidate,
  DomSourceHint,
  RelativeSelection,
  ReviewPoint,
} from '../types';
import {
  clamp,
  roundRatio,
  type ReviewEnvironment,
  type ViewportSelection,
} from './geometry';

const COMMON_ANCHOR_ATTRIBUTES = [
  'data-testid',
  'data-test-id',
  'data-cy',
  'data-test',
  'data-qa',
  'data-section-id',
  'data-component',
];

const SEMANTIC_ANCHOR_ATTRIBUTES = [
  'aria-label',
  'title',
  'name',
  'href',
];

/** Resolves a DOM anchor from the center of a target-space selection. */
export function getDomAnchor(
  selection: ViewportSelection,
  configuredAttribute = 'data-qa-id',
  environment: ReviewEnvironment
): DomAnchor | undefined {
  const x = selection.left + selection.width / 2;
  const y = selection.top + selection.height / 2;
  return getDomAnchorFromPoint({ x, y }, configuredAttribute, environment);
}

/** Builds the best DOM anchor candidate set from a target-space point. */
export function getDomAnchorFromPoint(
  point: ReviewPoint,
  configuredAttribute = 'data-qa-id',
  environment: ReviewEnvironment
): DomAnchor | undefined {
  const target = environment.document.elementFromPoint(point.x, point.y);
  if (!target) return undefined;

  const candidates = createAnchorCandidates(target, configuredAttribute);
  const primaryCandidate = candidates[0];
  if (!primaryCandidate) return undefined;

  return {
    ...primaryCandidate,
    candidates,
    htmlSnippet: getElementHtmlSnippet(
      getAnchorSourceElement(target, primaryCandidate, configuredAttribute) ?? target
    ),
    source: getDomSourceHint(target),
  };
}

/** Builds the best DOM anchor candidate set from an exact target element. */
export function getDomAnchorFromElement(
  target: Element,
  configuredAttribute = 'data-qa-id',
  environment: ReviewEnvironment
): DomAnchor | undefined {
  if (target.ownerDocument !== environment.document) return undefined;

  const candidates = createAnchorCandidates(target, configuredAttribute);
  const primaryCandidate = candidates[0];
  if (!primaryCandidate) return undefined;

  return {
    ...primaryCandidate,
    candidates,
    htmlSnippet: getElementHtmlSnippet(
      getAnchorSourceElement(target, primaryCandidate, configuredAttribute) ?? target
    ),
    source: getDomSourceHint(target),
  };
}

/** Reads the current target-space rectangle for a previously captured anchor. */
export function getElementViewportSelection(
  anchor: DomAnchor,
  environment: ReviewEnvironment,
  preferredSelection?: ViewportSelection
): ViewportSelection | undefined {
  const element = getAnchorElement(anchor, environment, preferredSelection);
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return undefined;

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/** Stores a selection relative to an anchor so it can survive layout shifts. */
export function getRelativeSelection(
  selection: ViewportSelection,
  anchor: DomAnchor | string,
  environment: ReviewEnvironment
): RelativeSelection | undefined {
  const element = getAnchorElement(anchor, environment);
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return undefined;

  return {
    x: roundRatio((selection.left - rect.left) / rect.width),
    y: roundRatio((selection.top - rect.top) / rect.height),
    width: roundRatio(selection.width / rect.width),
    height: roundRatio(selection.height / rect.height),
  };
}

/** Stores a point relative to an anchor so marker positions can be rebound. */
export function getRelativePoint(
  point: ReviewPoint,
  anchor: DomAnchor | string,
  environment: ReviewEnvironment
): ReviewPoint | undefined {
  const element = getAnchorElement(anchor, environment);
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return undefined;

  return {
    x: roundRatio((point.x - rect.left) / rect.width),
    y: roundRatio((point.y - rect.top) / rect.height),
  };
}

/** Returns the primary anchor plus any fallback candidates without duplicates. */
export function getAnchorCandidates(anchor: DomAnchor) {
  return dedupeAnchorCandidates([
    anchor,
    ...(anchor.candidates ?? []),
  ]);
}

/** Finds the best current DOM element for a persisted anchor candidate set. */
export function resolveAnchorElement(
  anchor: DomAnchor,
  environment: ReviewEnvironment,
  preferredSelection?: ViewportSelection
) {
  // Try every persisted candidate because IDs/classes can disappear between builds.
  const matches = getAnchorCandidates(anchor).flatMap((candidate) => {
    const textFingerprint = candidate.textFingerprint ?? anchor.textFingerprint;

    if (!preferredSelection) {
      const match = queryBestAnchorCandidate(
        candidate,
        textFingerprint,
        environment
      );

      if (!match) return [];

      const confidence = roundRatio(
        (candidate.confidence ?? 0.5) * match.score
      );

      return [{
        element: match.element,
        candidate,
        confidence,
      }];
    }

    return queryAnchorElements(candidate.selector, environment).map((element) => {
      const confidence = roundRatio(
        (candidate.confidence ?? 0.5) *
          getTextFingerprintScore(textFingerprint, getTextFingerprint(element)) *
          getSelectionMatchScore(element, preferredSelection)
      );

      return {
        element,
        candidate,
        confidence,
      };
    });
  });

  return matches.sort((a, b) => b.confidence - a.confidence)[0];
}

/** CSS.escape wrapper with a small fallback for older browsers. */
export function cssEscape(value: string) {
  if ('CSS' in window && typeof window.CSS.escape === 'function') {
    return window.CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function getAnchorElement(
  anchor: DomAnchor | string,
  environment: ReviewEnvironment,
  preferredSelection?: ViewportSelection
) {
  return typeof anchor === 'string'
    ? queryAnchorElement(anchor, environment)
    : resolveAnchorElement(anchor, environment, preferredSelection)?.element;
}

function createAnchorCandidates(
  target: Element,
  configuredAttribute: string
): DomAnchorCandidate[] {
  const targetCandidates: DomAnchorCandidate[] = [];

  // Prefer the deepest clicked element. Ancestor anchors are kept as fallbacks.
  const configuredAnchor = getExactAttributeAnchorCandidate(
    target,
    configuredAttribute,
    0.98,
    'configured-attribute'
  );
  if (configuredAnchor) targetCandidates.push(configuredAnchor);

  const targetAttributeAnchor = getAttributeAnchorCandidate(
    target,
    COMMON_ANCHOR_ATTRIBUTES.filter((name) => name !== configuredAttribute),
    0.9
  );
  if (targetAttributeAnchor) targetCandidates.push(targetAttributeAnchor);

  if (isMeaningfulId(target.id)) {
    targetCandidates.push({
      selector: `#${cssEscape(target.id)}`,
      strategy: 'id',
      confidence: 0.94,
      textFingerprint: getTextFingerprint(target),
    });
  }

  const semanticAnchor = getAttributeAnchorCandidate(
    target,
    SEMANTIC_ANCHOR_ATTRIBUTES,
    0.84
  );
  if (semanticAnchor) targetCandidates.push(semanticAnchor);

  const targetClassName = getMeaningfulClassName(target);
  if (targetClassName) {
    targetCandidates.push({
      selector: `${target.tagName.toLowerCase()}.${cssEscape(targetClassName)}`,
      strategy: 'class',
      confidence: 0.82,
      textFingerprint: getTextFingerprint(target),
    });
  }

  const scopedPath = getScopedDomPathCandidate(target, configuredAttribute);
  if (scopedPath) targetCandidates.push(scopedPath);

  const targetDomPath: DomAnchorCandidate = {
    selector: getDomPath(target),
    strategy: 'dom-path',
    confidence: targetCandidates.length > 0 ? 0.8 : 0.5,
    textFingerprint: getTextFingerprint(target),
  };

  const parentCandidates: DomAnchorCandidate[] = [];

  const parent = target.parentElement;
  const parentConfiguredAnchor = parent
    ? findClosestAttributeAnchor(parent, [configuredAttribute], 0.72, {
        strategy: 'configured-attribute',
      })
    : undefined;
  if (parentConfiguredAnchor) parentCandidates.push(parentConfiguredAnchor);

  const anchoredByAttribute = parent
    ? findClosestAttributeAnchor(
        parent,
        COMMON_ANCHOR_ATTRIBUTES.filter((name) => name !== configuredAttribute),
        0.7
      )
    : undefined;
  if (anchoredByAttribute) parentCandidates.push(anchoredByAttribute);

  const anchoredById = parent
    ? findClosest(parent, (element) => isMeaningfulId(element.id))
    : undefined;
  if (anchoredById?.id) {
    parentCandidates.push({
      selector: `#${cssEscape(anchoredById.id)}`,
      strategy: 'id',
      confidence: 0.72,
      textFingerprint: getTextFingerprint(anchoredById),
    });
  }

  const anchoredByClass = parent
    ? findClosest(parent, (element) => Boolean(getMeaningfulClassName(element)))
    : undefined;
  const className = anchoredByClass
    ? getMeaningfulClassName(anchoredByClass)
    : undefined;

  if (anchoredByClass && className) {
    parentCandidates.push({
      selector: `${anchoredByClass.tagName.toLowerCase()}.${cssEscape(
        className
      )}`,
      strategy: 'class',
      confidence: 0.58,
      textFingerprint: getTextFingerprint(anchoredByClass),
    });
  }

  const candidates =
    targetCandidates.length > 0
      ? [...targetCandidates, targetDomPath, ...parentCandidates]
      : [...parentCandidates, targetDomPath];

  return dedupeAnchorCandidates(candidates);
}

function findClosestAttributeAnchor(
  target: Element,
  attributeNames: string[],
  confidence: number,
  options?: {
    strategy?: DomAnchorCandidate['strategy'];
  }
): DomAnchorCandidate | undefined {
  for (const attributeName of attributeNames) {
    const selector = `[${attributeName}]`;
    const element = tryClosest(target, selector);
    if (!element) continue;

    const value = getStableAttributeValue(element, attributeName);
    if (!value) continue;

    return {
      selector: `[${attributeName}="${cssEscape(value)}"]`,
      strategy: options?.strategy ?? 'attribute',
      confidence,
      textFingerprint: getTextFingerprint(element),
    };
  }

  return undefined;
}

function getExactAttributeAnchorCandidate(
  element: Element,
  attributeName: string,
  confidence: number,
  strategy: DomAnchorCandidate['strategy']
): DomAnchorCandidate | undefined {
  const value = getStableAttributeValue(element, attributeName);
  if (!value) return undefined;

  return {
    selector: `[${attributeName}="${cssEscape(value)}"]`,
    strategy,
    confidence,
    textFingerprint: getTextFingerprint(element),
  };
}

function getAttributeAnchorCandidate(
  element: Element,
  attributeNames: string[],
  confidence: number
): DomAnchorCandidate | undefined {
  for (const attributeName of attributeNames) {
    const value = getStableAttributeValue(element, attributeName);
    if (!value) continue;

    return {
      selector: `${element.tagName.toLowerCase()}[${attributeName}="${cssEscape(
        value
      )}"]`,
      strategy: 'attribute',
      confidence,
      textFingerprint: getTextFingerprint(element),
    };
  }

  return undefined;
}

function getScopedDomPathCandidate(
  target: Element,
  configuredAttribute: string
): DomAnchorCandidate | undefined {
  const parent = target.parentElement;
  if (!parent) return undefined;

  const anchor = findStableAncestorSelector(parent, configuredAttribute);
  if (!anchor) return undefined;

  const selector = getDomPathBetween(anchor.element, target, anchor.selector);
  if (!selector) return undefined;

  return {
    selector,
    strategy: 'dom-path',
    confidence: anchor.confidence,
    textFingerprint: getTextFingerprint(target),
  };
}

function findStableAncestorSelector(
  start: Element,
  configuredAttribute: string
) {
  let element: Element | null = start;
  const root = start.ownerDocument.documentElement;

  while (element && element !== root) {
    const configuredValue = getStableAttributeValue(element, configuredAttribute);
    if (configuredValue) {
      return {
        element,
        selector: `[${configuredAttribute}="${cssEscape(configuredValue)}"]`,
        confidence: 0.88,
      };
    }

    const attributeAnchor = getAttributeAnchorCandidate(
      element,
      COMMON_ANCHOR_ATTRIBUTES.filter((name) => name !== configuredAttribute),
      0.84
    );
    if (attributeAnchor) {
      return {
        element,
        selector: attributeAnchor.selector,
        confidence: 0.84,
      };
    }

    if (isMeaningfulId(element.id)) {
      return {
        element,
        selector: `#${cssEscape(element.id)}`,
        confidence: 0.82,
      };
    }

    const className = getMeaningfulClassName(element);
    if (className) {
      return {
        element,
        selector: `${element.tagName.toLowerCase()}.${cssEscape(className)}`,
        confidence: 0.76,
      };
    }

    element = element.parentElement;
  }

  return undefined;
}

function getAnchorSourceElement(
  target: Element,
  candidate: DomAnchorCandidate,
  configuredAttribute: string
) {
  if (candidate.strategy === 'configured-attribute') {
    return target.closest(`[${configuredAttribute}]`);
  }

  if (candidate.strategy === 'dom-path') return target;

  try {
    return target.closest(candidate.selector);
  } catch {
    return target;
  }
}

function tryClosest(element: Element, selector: string) {
  try {
    return element.closest(selector);
  } catch {
    return null;
  }
}

function getElementHtmlSnippet(element: Element, maxLength = 1000) {
  const html = decodeHtmlEntities(element.outerHTML.replace(/\s+/g, ' ').trim());
  if (html.length <= maxLength) return html;
  return `${html.slice(0, maxLength - 3)}...`;
}

function decodeHtmlEntities(value: string) {
  return value.replace(
    /&(#\d+|#x[\da-f]+|lt|gt|quot|apos|amp);/gi,
    (match, entity: string) => {
      const normalized = entity.toLowerCase();

      if (normalized === 'lt') return '<';
      if (normalized === 'gt') return '>';
      if (normalized === 'quot') return '"';
      if (normalized === 'apos') return "'";
      if (normalized === 'amp') return '&';

      const codePoint = normalized.startsWith('#x')
        ? Number.parseInt(normalized.slice(2), 16)
        : Number.parseInt(normalized.slice(1), 10);

      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : match;
    }
  );
}

function getDomSourceHint(target: Element): DomSourceHint | undefined {
  const sourceElement = target.closest(
    [
      '[data-wrk-source-file]',
      '[data-wrk-source-component]',
      '[data-wrk-source-line]',
      '[data-wrk-source-column]',
      '[data-file]',
      '[data-component]',
      '[data-section-index]',
      '[data-section-id]',
    ].join(', ')
  );
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
}

function getSourceAttribute(element: Element, ...names: string[]) {
  for (const name of names) {
    const value = element.getAttribute(name)?.trim();
    if (value) return value;
  }

  return undefined;
}

function dedupeAnchorCandidates(candidates: DomAnchorCandidate[]) {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function queryBestAnchorCandidate(
  candidate: DomAnchorCandidate,
  textFingerprint: string | undefined,
  environment: ReviewEnvironment
) {
  const elements = queryAnchorElements(candidate.selector, environment);
  if (elements.length === 0) return undefined;
  if (!textFingerprint) {
    return {
      element: elements[0],
      score: 1,
    };
  }

  // If a selector matches multiple nodes, text similarity keeps restore deterministic.
  return elements
    .map((element) => ({
      element,
      score: getTextFingerprintScore(
        textFingerprint,
        getTextFingerprint(element)
      ),
    }))
    .sort((a, b) => b.score - a.score)[0];
}

function queryAnchorElement(selector: string, environment: ReviewEnvironment) {
  return queryAnchorElements(selector, environment)[0];
}

function queryAnchorElements(selector: string, environment: ReviewEnvironment) {
  try {
    return Array.from(environment.document.querySelectorAll(selector));
  } catch {
    return [];
  }
}

function findClosest(
  start: Element,
  predicate: (element: Element) => boolean
) {
  let element: Element | null = start;
  const root = start.ownerDocument.documentElement;

  while (element && element !== root) {
    if (predicate(element)) return element;
    element = element.parentElement;
  }

  return undefined;
}

// Builds an absolute CSS selector from <body> down to the element.
// Each step uses :nth-of-type so the path stays stable even when siblings
// share the same tag and carry no id/class to anchor on.
function getDomPath(element: Element) {
  const parts: string[] = [];
  let current: Element | null = element;
  const ownerDocument = element.ownerDocument;

  while (
    current &&
    current !== ownerDocument.body &&
    current !== ownerDocument.documentElement
  ) {
    const parent: Element | null = current.parentElement;
    const tag = current.tagName.toLowerCase();

    if (!parent) {
      parts.unshift(tag);
      break;
    }

    const currentTagName = current.tagName;
    const siblings: Element[] = Array.from(parent.children).filter(
      (child) => child.tagName === currentTagName
    );
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }

  return `body > ${parts.join(' > ')}`;
}

// Like getDomPath but relative: the selector is scoped under a known ancestor
// (e.g. an element with a stable attribute) so it survives layout changes above
// that ancestor. Returns undefined if target is not actually inside ancestor.
function getDomPathBetween(
  ancestor: Element,
  target: Element,
  ancestorSelector: string
) {
  const parts: string[] = [];
  let current: Element | null = target;

  while (current && current !== ancestor) {
    parts.unshift(getDomPathPart(current));
    current = current.parentElement;
  }

  if (current !== ancestor || parts.length === 0) return undefined;

  return `${ancestorSelector} > ${parts.join(' > ')}`;
}

function getDomPathPart(element: Element) {
  const parent: Element | null = element.parentElement;
  const tag = element.tagName.toLowerCase();

  if (!parent) return tag;

  const currentTagName = element.tagName;
  const siblings: Element[] = Array.from(parent.children).filter(
    (child) => child.tagName === currentTagName
  );
  const index = siblings.indexOf(element) + 1;
  return `${tag}:nth-of-type(${index})`;
}

function getTextFingerprint(element: Element) {
  const text = element.textContent?.replace(/\s+/g, ' ').trim();
  // Cap at 120 chars: enough to identify the element, short enough to keep
  // stored anchors small and to tolerate minor trailing-content edits.
  return text ? text.slice(0, 120) : undefined;
}

// Returns an attribute value only if it looks like a stable identifier.
// Rejects overly long values (>160 chars, likely generated/serialized data),
// booleans, and short numeric values (1-2 digits, likely volatile indexes).
function getStableAttributeValue(element: Element, attributeName: string) {
  const value = element.getAttribute(attributeName)?.trim();
  if (!value || value.length > 160) return undefined;
  if (/^(true|false)$/i.test(value)) return undefined;
  if (/^\d+$/.test(value) && value.length < 3) return undefined;

  return value;
}

// Scores how well a candidate's text matches the fingerprint captured earlier.
// Tiered confidence: exact match = 1, substring containment = 0.82, otherwise
// a token-overlap ratio. Missing data returns a neutral 0.5 so it neither
// confirms nor rules out the candidate.
function getTextFingerprintScore(expected?: string, actual?: string) {
  if (!expected) return 1;
  if (!actual) return 0.5;
  if (expected === actual) return 1;
  if (actual.includes(expected) || expected.includes(actual)) return 0.82;

  const expectedTokens = getFingerprintTokens(expected);
  const actualTokens = new Set(getFingerprintTokens(actual));
  if (expectedTokens.length === 0 || actualTokens.size === 0) return 0.5;

  const matches = expectedTokens.filter((token) => actualTokens.has(token));
  return clamp(matches.length / expectedTokens.length, 0.25, 0.76);
}

// Scores how well an element's box matches the original selection rectangle.
// Overlapping elements score >1 (1 + overlap ratio) so any overlap always beats
// the non-overlapping branch, which falls back to a center-distance score in
// (0.05, 0.95). This keeps the closest enclosing element ranked highest.
function getSelectionMatchScore(
  element: Element,
  selection: ViewportSelection
) {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return 0.05;

  const overlapLeft = Math.max(rect.left, selection.left);
  const overlapTop = Math.max(rect.top, selection.top);
  const overlapRight = Math.min(rect.right, selection.left + selection.width);
  const overlapBottom = Math.min(rect.bottom, selection.top + selection.height);
  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  const overlapHeight = Math.max(0, overlapBottom - overlapTop);
  const overlapArea = overlapWidth * overlapHeight;

  if (overlapArea > 0) {
    const selectionArea = Math.max(1, selection.width * selection.height);
    const rectArea = Math.max(1, rect.width * rect.height);
    return 1 + overlapArea / Math.min(selectionArea, rectArea);
  }

  const rectCenterX = rect.left + rect.width / 2;
  const rectCenterY = rect.top + rect.height / 2;
  const selectionCenterX = selection.left + selection.width / 2;
  const selectionCenterY = selection.top + selection.height / 2;
  const distance = Math.hypot(
    rectCenterX - selectionCenterX,
    rectCenterY - selectionCenterY
  );
  const basis = Math.max(
    1,
    rect.width,
    rect.height,
    selection.width,
    selection.height
  );

  return clamp(1 / (1 + distance / basis), 0.05, 0.95);
}

function getFingerprintTokens(value: string) {
  return value
    .toLowerCase()
    .split(/[\s/|,.:;()[\]{}"'`~!?<>]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function isMeaningfulId(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.length <= 1) return false;

  return ![
    'app',
    'main',
    'page',
    'root',
    '__next',
    '__nuxt',
  ].includes(normalized);
}

function getMeaningfulClassName(element: Element) {
  return Array.from(element.classList).find((name) => isMeaningfulClass(name));
}

function isMeaningfulClass(value: string) {
  const normalized = value.trim();
  if (
    [
      'absolute',
      'block',
      'contents',
      'fixed',
      'flex',
      'grid',
      'hidden',
      'relative',
      'sticky',
    ].includes(normalized)
  ) {
    return false;
  }

  return (
    normalized.length > 2 &&
    !normalized.includes(':') &&
    !/^(aspect|basis|bg|border|bottom|col|content|delay|duration|ease|font|from|gap|grow|h|inset|items|justify|leading|left|m|max-h|max-w|mb|ml|mr|mt|mx|my|min-h|min-w|object|opacity|order|origin|overflow|p|pb|pl|place|pointer|pr|pt|px|py|right|rotate|rounded|row|scale|self|shadow|shrink|text|to|top|tracking|transition|translate|via|w|z)-/.test(
      normalized
    ) &&
    !normalized.startsWith('mq-')
  );
}
