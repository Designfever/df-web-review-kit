// src/status.ts
var REVIEW_WORKFLOW_STATUS_OPTIONS = [
  { value: "todo", label: "Todo" },
  { value: "doing", label: "Doing" },
  { value: "review", label: "Review" },
  { value: "hold", label: "Hold" },
  { value: "done", label: "Done" }
];
function normalizeReviewItemStatus(status) {
  if (status === "resolved") return "done";
  if (status === "open" || !status) return "todo";
  return status;
}
function matchesReviewItemStatus(itemStatus, queryStatus) {
  return normalizeReviewItemStatus(itemStatus) === normalizeReviewItemStatus(queryStatus);
}

// src/route.ts
function getItemRouteKey(item) {
  return item.routeKey || normalizeRoutePath(item.normalizedPath);
}
function normalizeRoutePath(pathname) {
  const [pathWithoutQuery] = pathname.split(/[?#]/);
  const path = (pathWithoutQuery || "/").replace(/\/index\.html$/, "/");
  return path.startsWith("/") ? path : `/${path}`;
}

// src/adapters/local.ts
var DEFAULT_STORAGE_KEY = "df-web-review-kit:items";
function localAdapter(options = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const write = (items) => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  };
  const read = () => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      const value = JSON.parse(raw);
      if (!Array.isArray(value)) return [];
      let changed = false;
      const items = value.flatMap((item) => {
        const normalized = normalizeStoredReviewItem(item);
        if (!normalized || normalized !== item) changed = true;
        return normalized ? [normalized] : [];
      });
      if (changed) write(items);
      return items;
    } catch {
      return [];
    }
  };
  return {
    async get(id) {
      return read().find((item) => item.id === id) ?? null;
    },
    async list(query) {
      return read().filter((item) => {
        if (item.projectId !== query.projectId) return false;
        const queryRouteKey = query.routeKey ?? query.normalizedPath;
        if (queryRouteKey && getItemRouteKey(item) !== queryRouteKey) {
          return false;
        }
        if (query.status && !matchesReviewItemStatus(item.status, query.status)) {
          return false;
        }
        return true;
      });
    },
    async create(item) {
      const items = read();
      items.unshift(item);
      write(items);
      return item;
    },
    async update(id, patch) {
      const items = read();
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) {
        throw new Error(`Review item not found: ${id}`);
      }
      const next = {
        ...items[index],
        ...patch,
        id,
        createdAt: items[index].createdAt,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      items[index] = next;
      write(items);
      return next;
    },
    async remove(id) {
      write(read().filter((item) => item.id !== id));
    }
  };
}
function normalizeStoredReviewItem(value) {
  if (!value || typeof value !== "object") return void 0;
  const raw = value;
  const kind = raw.kind === "text" ? "note" : raw.kind === "capture" ? "area" : raw.kind;
  if (kind !== "note" && kind !== "area") return void 0;
  const { screenshot: _screenshot, reviewNumber: _reviewNumber, ...item } = raw;
  if (kind === raw.kind && _screenshot === void 0 && _reviewNumber === void 0) {
    return raw;
  }
  return {
    ...item,
    kind
  };
}

// src/core/review/scope.ts
var DEFAULT_REVIEW_VIEWPORTS = [
  { label: "Mobile", width: 390, height: 720, scope: "mobile" },
  { label: "Tablet", width: 768, height: 1024, scope: "tablet" },
  { label: "Desktop", width: 1440, height: 900, scope: "desktop" },
  { label: "Wide", width: 1980, height: 1080, scope: "wide" }
];
var REVIEW_SCOPE_LABELS = {
  mobile: "Mobile",
  tablet: "Tablet",
  desktop: "Desktop",
  wide: "Wide",
  dom: "Element"
};
var normalizeReviewItemScope = (value) => {
  if (value === "element") return "dom";
  if (value === "mobile" || value === "tablet" || value === "desktop" || value === "wide" || value === "dom") {
    return value;
  }
  return void 0;
};
var getViewportPresetDistance = (preset, viewport) => Math.abs(preset.width - viewport.width) + Math.abs(preset.height - viewport.height);
var inferViewportScope = (preset) => {
  if (preset.scope) return preset.scope;
  const label = preset.label.toLowerCase();
  if (label.includes("mobile") || label.includes("phone")) return "mobile";
  if (label.includes("tablet") || label.includes("pad")) return "tablet";
  if (label.includes("wide") || label.includes("1980") || label.includes("1940") || label.includes("1920")) {
    return "wide";
  }
  if (label.includes("desktop")) return "desktop";
  if (preset.width >= 1800) return "wide";
  if (preset.width >= 1e3) return "desktop";
  if (preset.width >= 700) return "tablet";
  return "mobile";
};
function findReviewViewportPreset(viewport, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const fallback = presets[0] ?? DEFAULT_REVIEW_VIEWPORTS[0];
  const exact = presets.find(
    (preset) => preset.width === viewport.width && preset.height === viewport.height
  );
  if (exact) return exact;
  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance(closest, viewport);
    const presetDistance = getViewportPresetDistance(preset, viewport);
    return presetDistance < closestDistance ? preset : closest;
  }, fallback);
}
function getReviewViewportScope(viewport, presets = DEFAULT_REVIEW_VIEWPORTS) {
  return inferViewportScope(findReviewViewportPreset(viewport, presets));
}
function getReviewItemScope(item, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const scope = normalizeReviewItemScope(item.scope);
  if (scope && scope !== "dom") return scope;
  return getReviewViewportScope(item.viewport, presets);
}
function getReviewItemScopeLabel(item, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const scope = getReviewItemScope(item, presets);
  if (scope === "dom") return REVIEW_SCOPE_LABELS.dom;
  const preset = findReviewViewportPreset(item.viewport, presets);
  return preset.label || REVIEW_SCOPE_LABELS[scope];
}
function getNumberedReviewItems(items, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const draftLabels = /* @__PURE__ */ new Map();
  let nextDraftNumber = 1;
  [...items].sort((a, b) => {
    const createdOrder = a.createdAt.localeCompare(b.createdAt);
    if (createdOrder !== 0) return createdOrder;
    return a.id.localeCompare(b.id);
  }).forEach((item) => {
    if (!getReviewItemNumber(item)) {
      draftLabels.set(item.id, `draft-${nextDraftNumber++}`);
    }
  });
  return items.map((item) => {
    const scope = getReviewItemScope(item, presets);
    const label = getReviewItemScopeLabel(item, presets);
    const number = getReviewItemNumber(item);
    return {
      item,
      scope,
      label,
      number,
      displayLabel: number ? `#${number}` : draftLabels.get(item.id) ?? "draft"
    };
  });
}
function getReviewItemNumber(item) {
  return normalizeReviewNumber(item.reviewNumber);
}
function normalizeReviewNumber(value) {
  if (typeof value !== "number") return void 0;
  if (!Number.isInteger(value) || value < 1) return void 0;
  return value;
}

// src/core/geometry.ts
function rectanglesIntersect(a, b) {
  return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
}
function getPointSelection(point) {
  return {
    left: point.x,
    top: point.y,
    width: 1,
    height: 1
  };
}
function toViewportSelection(selection) {
  return {
    left: selection.x,
    top: selection.y,
    width: selection.width,
    height: selection.height
  };
}
function toPublicSelection(selection) {
  return {
    x: Math.round(selection.left),
    y: Math.round(selection.top),
    width: Math.round(selection.width),
    height: Math.round(selection.height)
  };
}
function getSelectionCenter(selection) {
  if ("left" in selection) {
    return {
      x: selection.left + selection.width / 2,
      y: selection.top + selection.height / 2
    };
  }
  return {
    x: selection.x + selection.width / 2,
    y: selection.y + selection.height / 2
  };
}
function isRelativeSelection(value) {
  if (!value || typeof value !== "object") return false;
  const selection = value;
  return typeof selection.x === "number" && typeof selection.y === "number" && typeof selection.width === "number" && typeof selection.height === "number";
}
function getViewportSize(environment) {
  const targetWindow = environment?.window ?? window;
  return {
    width: targetWindow.innerWidth,
    height: targetWindow.innerHeight
  };
}
function isPointInViewport(point, environment) {
  const viewport = getViewportSize(environment);
  return point.x >= 0 && point.y >= 0 && point.x <= viewport.width && point.y <= viewport.height;
}
function isSelectionInViewport(selection, environment) {
  const viewport = getViewportSize(environment);
  return rectanglesIntersect(selection, {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height
  });
}
function clampPoint(point, environment) {
  const viewport = getViewportSize(environment);
  return {
    x: clamp(point.x, 0, viewport.width),
    y: clamp(point.y, 0, viewport.height)
  };
}
function getPopoverPosition(point, environment, options) {
  const bounds = getPopoverBounds(environment);
  const margin = 12;
  const width = Math.min(
    options?.width ?? 320,
    Math.max(240, bounds.width - margin * 2)
  );
  const estimatedHeight = options?.estimatedHeight ?? 178;
  const offset = options?.offset ?? 12;
  return {
    left: clamp(
      point.x + offset,
      bounds.left + margin,
      bounds.left + bounds.width - width - margin
    ),
    top: clamp(
      point.y + offset,
      bounds.top + margin,
      bounds.top + bounds.height - estimatedHeight - margin
    )
  };
}
function getPopoverBounds(environment) {
  if (!environment) {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  return environment.overlayRect;
}
function toHostPoint(point, environment) {
  if (!environment) return point;
  return {
    x: point.x + environment.viewportRect.left,
    y: point.y + environment.viewportRect.top
  };
}
function toHostSelection(selection, environment) {
  return {
    left: selection.left + environment.viewportRect.left,
    top: selection.top + environment.viewportRect.top,
    width: selection.width,
    height: selection.height
  };
}
function toTargetPoint(point, environment) {
  if (!environment) return point;
  return {
    x: point.x - environment.viewportRect.left,
    y: point.y - environment.viewportRect.top
  };
}
function toTargetPointFromHostEvent(event, environment) {
  return toTargetPoint(
    {
      x: event.clientX,
      y: event.clientY
    },
    environment
  );
}
function placeLayerOverTarget(layer, environment) {
  layer.style.left = `${environment.viewportRect.left}px`;
  layer.style.top = `${environment.viewportRect.top}px`;
  layer.style.width = `${environment.viewportRect.width}px`;
  layer.style.height = `${environment.viewportRect.height}px`;
  layer.style.right = "auto";
  layer.style.bottom = "auto";
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
function roundRatio(value) {
  return Math.round(value * 1e4) / 1e4;
}
function roundPoint(point) {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
}

// src/core/dom.anchor.ts
var COMMON_ANCHOR_ATTRIBUTES = [
  "data-testid",
  "data-test-id",
  "data-cy",
  "data-test",
  "data-qa",
  "data-section-id",
  "data-component"
];
var SEMANTIC_ANCHOR_ATTRIBUTES = [
  "aria-label",
  "title",
  "name",
  "href"
];
function getDomAnchor(selection, configuredAttribute = "data-qa-id", environment) {
  const x = selection.left + selection.width / 2;
  const y = selection.top + selection.height / 2;
  return getDomAnchorFromPoint({ x, y }, configuredAttribute, environment);
}
function getDomAnchorFromPoint(point, configuredAttribute = "data-qa-id", environment) {
  const target = environment.document.elementFromPoint(point.x, point.y);
  if (!target) return void 0;
  const candidates = createAnchorCandidates(target, configuredAttribute);
  const primary = candidates[0];
  if (!primary) return void 0;
  return {
    ...primary,
    candidates,
    htmlSnippet: getElementHtmlSnippet(
      getAnchorSourceElement(target, primary, configuredAttribute) ?? target
    ),
    source: getDomSourceHint(target)
  };
}
function getElementViewportSelection(anchor, environment) {
  const element = getAnchorElement(anchor, environment);
  if (!element) return void 0;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return void 0;
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
}
function getRelativeSelection(selection, anchor, environment) {
  const element = getAnchorElement(anchor, environment);
  if (!element) return void 0;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return void 0;
  return {
    x: roundRatio((selection.left - rect.left) / rect.width),
    y: roundRatio((selection.top - rect.top) / rect.height),
    width: roundRatio(selection.width / rect.width),
    height: roundRatio(selection.height / rect.height)
  };
}
function getRelativePoint(point, anchor, environment) {
  const element = getAnchorElement(anchor, environment);
  if (!element) return void 0;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return void 0;
  return {
    x: roundRatio((point.x - rect.left) / rect.width),
    y: roundRatio((point.y - rect.top) / rect.height)
  };
}
function getAnchorCandidates(anchor) {
  return dedupeAnchorCandidates([
    anchor,
    ...anchor.candidates ?? []
  ]);
}
function resolveAnchorElement(anchor, environment) {
  const matches = getAnchorCandidates(anchor).flatMap((candidate) => {
    const match = queryBestAnchorCandidate(
      candidate,
      candidate.textFingerprint ?? anchor.textFingerprint,
      environment
    );
    if (!match) return [];
    const confidence = roundRatio(
      (candidate.confidence ?? 0.5) * match.score
    );
    return [{
      element: match.element,
      candidate,
      confidence
    }];
  });
  return matches.sort((a, b) => b.confidence - a.confidence)[0];
}
function cssEscape(value) {
  if ("CSS" in window && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
function getAnchorElement(anchor, environment) {
  return typeof anchor === "string" ? queryAnchorElement(anchor, environment) : resolveAnchorElement(anchor, environment)?.element;
}
function createAnchorCandidates(target, configuredAttribute) {
  const candidates = [];
  const configuredAnchor = getClosestAttributeAnchor(
    target,
    configuredAttribute
  );
  if (configuredAnchor) candidates.push(configuredAnchor);
  const targetAttributeAnchor = getAttributeAnchorCandidate(
    target,
    COMMON_ANCHOR_ATTRIBUTES,
    0.9
  );
  if (targetAttributeAnchor) candidates.push(targetAttributeAnchor);
  if (isMeaningfulId(target.id)) {
    candidates.push({
      selector: `#${cssEscape(target.id)}`,
      strategy: "id",
      confidence: 0.94,
      textFingerprint: getTextFingerprint(target)
    });
  }
  const semanticAnchor = getAttributeAnchorCandidate(
    target,
    SEMANTIC_ANCHOR_ATTRIBUTES,
    0.84
  );
  if (semanticAnchor) candidates.push(semanticAnchor);
  const targetClassName = getMeaningfulClassName(target);
  if (targetClassName) {
    candidates.push({
      selector: `${target.tagName.toLowerCase()}.${cssEscape(targetClassName)}`,
      strategy: "class",
      confidence: 0.82,
      textFingerprint: getTextFingerprint(target)
    });
  }
  const scopedPath = getScopedDomPathCandidate(target, configuredAttribute);
  if (scopedPath) candidates.push(scopedPath);
  candidates.push({
    selector: getDomPath(target),
    strategy: "dom-path",
    confidence: 0.9,
    textFingerprint: getTextFingerprint(target)
  });
  const parent = target.parentElement;
  const anchoredByAttribute = parent ? findClosestAttributeAnchor(
    parent,
    COMMON_ANCHOR_ATTRIBUTES.filter((name) => name !== configuredAttribute),
    0.7
  ) : void 0;
  if (anchoredByAttribute) candidates.push(anchoredByAttribute);
  const anchoredById = parent ? findClosest(parent, (element) => isMeaningfulId(element.id)) : void 0;
  if (anchoredById?.id) {
    candidates.push({
      selector: `#${cssEscape(anchoredById.id)}`,
      strategy: "id",
      confidence: 0.72,
      textFingerprint: getTextFingerprint(anchoredById)
    });
  }
  const anchoredByClass = parent ? findClosest(parent, (element) => Boolean(getMeaningfulClassName(element))) : void 0;
  const className = anchoredByClass ? getMeaningfulClassName(anchoredByClass) : void 0;
  if (anchoredByClass && className) {
    candidates.push({
      selector: `${anchoredByClass.tagName.toLowerCase()}.${cssEscape(
        className
      )}`,
      strategy: "class",
      confidence: 0.58,
      textFingerprint: getTextFingerprint(anchoredByClass)
    });
  }
  return dedupeAnchorCandidates(candidates);
}
function getClosestAttributeAnchor(target, attributeName) {
  return findClosestAttributeAnchor(target, [attributeName], 0.98, {
    strategy: "configured-attribute"
  });
}
function findClosestAttributeAnchor(target, attributeNames, confidence, options) {
  for (const attributeName of attributeNames) {
    const selector = `[${attributeName}]`;
    const element = safeClosest(target, selector);
    if (!element) continue;
    const value = getStableAttributeValue(element, attributeName);
    if (!value) continue;
    return {
      selector: `[${attributeName}="${cssEscape(value)}"]`,
      strategy: options?.strategy ?? "attribute",
      confidence,
      textFingerprint: getTextFingerprint(element)
    };
  }
  return void 0;
}
function getAttributeAnchorCandidate(element, attributeNames, confidence) {
  for (const attributeName of attributeNames) {
    const value = getStableAttributeValue(element, attributeName);
    if (!value) continue;
    return {
      selector: `${element.tagName.toLowerCase()}[${attributeName}="${cssEscape(
        value
      )}"]`,
      strategy: "attribute",
      confidence,
      textFingerprint: getTextFingerprint(element)
    };
  }
  return void 0;
}
function getScopedDomPathCandidate(target, configuredAttribute) {
  const parent = target.parentElement;
  if (!parent) return void 0;
  const anchor = findStableAncestorSelector(parent, configuredAttribute);
  if (!anchor) return void 0;
  const selector = getDomPathBetween(anchor.element, target, anchor.selector);
  if (!selector) return void 0;
  return {
    selector,
    strategy: "dom-path",
    confidence: anchor.confidence,
    textFingerprint: getTextFingerprint(target)
  };
}
function findStableAncestorSelector(start, configuredAttribute) {
  let element = start;
  const root = start.ownerDocument.documentElement;
  while (element && element !== root) {
    const configuredValue = getStableAttributeValue(element, configuredAttribute);
    if (configuredValue) {
      return {
        element,
        selector: `[${configuredAttribute}="${cssEscape(configuredValue)}"]`,
        confidence: 0.88
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
        confidence: 0.84
      };
    }
    if (isMeaningfulId(element.id)) {
      return {
        element,
        selector: `#${cssEscape(element.id)}`,
        confidence: 0.82
      };
    }
    const className = getMeaningfulClassName(element);
    if (className) {
      return {
        element,
        selector: `${element.tagName.toLowerCase()}.${cssEscape(className)}`,
        confidence: 0.76
      };
    }
    element = element.parentElement;
  }
  return void 0;
}
function getAnchorSourceElement(target, candidate, configuredAttribute) {
  if (candidate.strategy === "configured-attribute") {
    return target.closest(`[${configuredAttribute}]`);
  }
  if (candidate.strategy === "dom-path") return target;
  try {
    return target.closest(candidate.selector);
  } catch {
    return target;
  }
}
function safeClosest(element, selector) {
  try {
    return element.closest(selector);
  } catch {
    return null;
  }
}
function getElementHtmlSnippet(element, maxLength = 1e3) {
  const html = decodeHtmlEntities(element.outerHTML.replace(/\s+/g, " ").trim());
  if (html.length <= maxLength) return html;
  return `${html.slice(0, maxLength - 3)}...`;
}
function decodeHtmlEntities(value) {
  return value.replace(
    /&(#\d+|#x[\da-f]+|lt|gt|quot|apos|amp);/gi,
    (match, entity) => {
      const normalized = entity.toLowerCase();
      if (normalized === "lt") return "<";
      if (normalized === "gt") return ">";
      if (normalized === "quot") return '"';
      if (normalized === "apos") return "'";
      if (normalized === "amp") return "&";
      const codePoint = normalized.startsWith("#x") ? Number.parseInt(normalized.slice(2), 16) : Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
  );
}
function getDomSourceHint(target) {
  const sourceElement = target.closest(
    [
      "[data-wrk-source-file]",
      "[data-wrk-source-component]",
      "[data-wrk-source-line]",
      "[data-wrk-source-column]",
      "[data-file]",
      "[data-component]",
      "[data-section-index]",
      "[data-section-id]"
    ].join(", ")
  );
  if (!sourceElement) return void 0;
  const source = {
    component: getSourceAttribute(
      sourceElement,
      "data-wrk-source-component",
      "data-component"
    ),
    file: getSourceAttribute(sourceElement, "data-wrk-source-file", "data-file"),
    line: getSourceAttribute(sourceElement, "data-wrk-source-line"),
    column: getSourceAttribute(sourceElement, "data-wrk-source-column"),
    sectionId: getSourceAttribute(sourceElement, "data-section-id"),
    sectionIndex: getSourceAttribute(sourceElement, "data-section-index")
  };
  return Object.values(source).some(Boolean) ? source : void 0;
}
function getSourceAttribute(element, ...names) {
  for (const name of names) {
    const value = element.getAttribute(name)?.trim();
    if (value) return value;
  }
  return void 0;
}
function dedupeAnchorCandidates(candidates) {
  const seen = /* @__PURE__ */ new Set();
  return candidates.filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function queryBestAnchorCandidate(candidate, textFingerprint, environment) {
  const elements = queryAnchorElements(candidate.selector, environment);
  if (elements.length === 0) return void 0;
  if (!textFingerprint) {
    return {
      element: elements[0],
      score: 1
    };
  }
  return elements.map((element) => ({
    element,
    score: getTextFingerprintScore(
      textFingerprint,
      getTextFingerprint(element)
    )
  })).sort((a, b) => b.score - a.score)[0];
}
function queryAnchorElement(selector, environment) {
  return queryAnchorElements(selector, environment)[0];
}
function queryAnchorElements(selector, environment) {
  try {
    return Array.from(environment.document.querySelectorAll(selector));
  } catch {
    return [];
  }
}
function findClosest(start, predicate) {
  let element = start;
  const root = start.ownerDocument.documentElement;
  while (element && element !== root) {
    if (predicate(element)) return element;
    element = element.parentElement;
  }
  return void 0;
}
function getDomPath(element) {
  const parts = [];
  let current = element;
  const ownerDocument = element.ownerDocument;
  while (current && current !== ownerDocument.body && current !== ownerDocument.documentElement) {
    const parent = current.parentElement;
    const tag = current.tagName.toLowerCase();
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const currentTagName = current.tagName;
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === currentTagName
    );
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  return `body > ${parts.join(" > ")}`;
}
function getDomPathBetween(ancestor, target, ancestorSelector) {
  const parts = [];
  let current = target;
  while (current && current !== ancestor) {
    parts.unshift(getDomPathPart(current));
    current = current.parentElement;
  }
  if (current !== ancestor || parts.length === 0) return void 0;
  return `${ancestorSelector} > ${parts.join(" > ")}`;
}
function getDomPathPart(element) {
  const parent = element.parentElement;
  const tag = element.tagName.toLowerCase();
  if (!parent) return tag;
  const currentTagName = element.tagName;
  const siblings = Array.from(parent.children).filter(
    (child) => child.tagName === currentTagName
  );
  const index = siblings.indexOf(element) + 1;
  return `${tag}:nth-of-type(${index})`;
}
function getTextFingerprint(element) {
  const text = element.textContent?.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 120) : void 0;
}
function getStableAttributeValue(element, attributeName) {
  const value = element.getAttribute(attributeName)?.trim();
  if (!value || value.length > 160) return void 0;
  if (/^(true|false)$/i.test(value)) return void 0;
  if (/^\d+$/.test(value) && value.length < 3) return void 0;
  return value;
}
function getTextFingerprintScore(expected, actual) {
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
function getFingerprintTokens(value) {
  return value.toLowerCase().split(/[\s/|,.:;()[\]{}"'`~!?<>]+/).map((token) => token.trim()).filter((token) => token.length > 1);
}
function isMeaningfulId(value) {
  const normalized = value.trim().toLowerCase();
  if (normalized.length <= 1) return false;
  return ![
    "app",
    "main",
    "page",
    "root",
    "__next",
    "__nuxt"
  ].includes(normalized);
}
function getMeaningfulClassName(element) {
  return Array.from(element.classList).find((name) => isMeaningfulClass(name));
}
function isMeaningfulClass(value) {
  const normalized = value.trim();
  if ([
    "absolute",
    "block",
    "contents",
    "fixed",
    "flex",
    "grid",
    "hidden",
    "relative",
    "sticky"
  ].includes(normalized)) {
    return false;
  }
  return normalized.length > 2 && !normalized.includes(":") && !/^(aspect|basis|bg|border|bottom|col|content|delay|duration|ease|font|from|gap|grow|h|inset|items|justify|leading|left|m|max-h|max-w|mb|ml|mr|mt|mx|my|min-h|min-w|object|opacity|order|origin|overflow|p|pb|pl|place|pointer|pr|pt|px|py|right|rotate|rounded|row|scale|self|shadow|shrink|text|to|top|tracking|transition|translate|via|w|z)-/.test(
    normalized
  ) && !normalized.startsWith("mq-");
}

// src/core/id.ts
function createId() {
  if ("randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// src/core/hotkey.ts
function isHotkey(event, hotkey) {
  const parts = hotkey.split("+").map((part) => part.trim().toLowerCase()).filter(Boolean);
  const key = parts.find(
    (part) => !["shift", "ctrl", "control", "alt", "meta", "cmd"].includes(part)
  );
  if (!key) return false;
  if (parts.includes("shift") !== event.shiftKey) return false;
  if ((parts.includes("ctrl") || parts.includes("control")) !== event.ctrlKey) {
    return false;
  }
  if (parts.includes("alt") !== event.altKey) return false;
  if ((parts.includes("meta") || parts.includes("cmd")) !== event.metaKey) {
    return false;
  }
  return isHotkeyKey(event, key);
}
function isHotkeyKey(event, key) {
  const normalizedKey = key.toLowerCase();
  if (event.key.toLowerCase() === normalizedKey) return true;
  if (getHotkeyCode(normalizedKey) === event.code) return true;
  const aliases = {
    q: ["\u3142", "\u3143"]
  };
  return aliases[normalizedKey]?.includes(event.key) ?? false;
}
function getHotkeyCode(key) {
  if (/^[a-z]$/.test(key)) return `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  return void 0;
}

// src/core/location.ts
var INTERNAL_QUERY_PARAMS = ["__dfwr_target"];
function getPageUrl(environment) {
  const location = environment?.window.location ?? window.location;
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}
function getOriginalUrl(environment) {
  const location = environment?.window.location ?? window.location;
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}
function getRouteKey(environment) {
  const location = environment?.window.location ?? window.location;
  return normalizeRoutePath(location.pathname);
}
function getPublicSearch(location) {
  const params = new URLSearchParams(location.search);
  INTERNAL_QUERY_PARAMS.forEach((key) => params.delete(key));
  const value = params.toString();
  return value ? `?${value}` : "";
}

// src/core/review/item.ts
function getBoundMarkerPoint(item, environment) {
  const marker = getItemMarker(item);
  if (!marker) return void 0;
  if (item.kind !== "area" && item.anchor && marker.relative) {
    const resolved = resolveAnchorElement(item.anchor, environment);
    const element = resolved?.element;
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: roundPoint({
            x: rect.left + rect.width * marker.relative.x,
            y: rect.top + rect.height * marker.relative.y
          }),
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector
        };
      }
    }
  }
  const sourceScroll = item.scroll ?? { x: 0, y: 0 };
  return {
    viewport: roundPoint({
      x: marker.viewport.x + sourceScroll.x - environment.window.scrollX,
      y: marker.viewport.y + sourceScroll.y - environment.window.scrollY
    }),
    isBound: false,
    confidence: 0
  };
}
function getItemHighlightSelection(item, environment) {
  if (item.kind === "area") {
    return getVisibleHighlightSelection(
      [
        getBoundSelection(item, environment),
        getPointHighlightSelection(item, environment)
      ],
      environment
    );
  }
  if (isDomReviewItem(item)) {
    return getVisibleHighlightSelection(
      [
        getAnchorHighlightSelection(item, environment),
        getBoundSelection(item, environment),
        getPointHighlightSelection(item, environment)
      ],
      environment
    );
  }
  return getVisibleHighlightSelection(
    [
      getAnchorHighlightSelection(item, environment),
      getBoundSelection(item, environment),
      getPointHighlightSelection(item, environment)
    ],
    environment
  );
}
function getReviewItemHighlightMode(item) {
  if (isDomReviewItem(item)) return "dom";
  if (item.kind === "area") return "area";
  return "note";
}
function getItemMarker(item) {
  if (item.marker) return item.marker;
  const selection = getItemSelection(item);
  if (!selection?.viewport) return void 0;
  return {
    viewport: roundPoint(getSelectionCenter(selection.viewport)),
    relative: selection.relative ? roundPoint(getSelectionCenter(selection.relative)) : void 0
  };
}
function getItemSelection(item) {
  const value = item.selection;
  if (!value) return void 0;
  if ("viewport" in value && isRelativeSelection(value.viewport)) {
    return value;
  }
  if (isRelativeSelection(value)) {
    return {
      viewport: value
    };
  }
  return void 0;
}
function shouldShowMarkerForScope(scope, currentScope) {
  return scope === currentScope;
}
function createSelectionCenterMarker(selection, anchor, environment) {
  const centerPoint = getSelectionCenter(selection);
  return {
    viewport: roundPoint(centerPoint),
    relative: anchor ? getRelativePoint(centerPoint, anchor, environment) : void 0
  };
}
function getBoundSelection(item, environment) {
  const selection = getItemSelection(item);
  if (!selection?.viewport) return void 0;
  if (item.kind !== "area" && item.anchor && selection.relative) {
    const resolved = resolveAnchorElement(item.anchor, environment);
    const element = resolved?.element;
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: {
            left: rect.left + rect.width * selection.relative.x,
            top: rect.top + rect.height * selection.relative.y,
            width: rect.width * selection.relative.width,
            height: rect.height * selection.relative.height
          },
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector
        };
      }
    }
  }
  const sourceScroll = item.scroll ?? { x: 0, y: 0 };
  const viewportSelection = toViewportSelection(selection.viewport);
  return {
    viewport: {
      left: viewportSelection.left + sourceScroll.x - environment.window.scrollX,
      top: viewportSelection.top + sourceScroll.y - environment.window.scrollY,
      width: viewportSelection.width,
      height: viewportSelection.height
    },
    isBound: item.kind === "area",
    confidence: 0
  };
}
function getAnchorHighlightSelection(item, environment) {
  if (!item.anchor) return void 0;
  const viewport = getElementViewportSelection(item.anchor, environment);
  if (!viewport) return void 0;
  return {
    viewport,
    isBound: true
  };
}
function getPointHighlightSelection(item, environment) {
  const point = getBoundMarkerPoint(item, environment);
  if (!point) return void 0;
  const size = 16;
  return {
    viewport: {
      left: point.viewport.x - size / 2,
      top: point.viewport.y - size / 2,
      width: size,
      height: size
    },
    isBound: point.isBound
  };
}
function getVisibleHighlightSelection(candidates, environment) {
  return candidates.find(
    (candidate) => Boolean(candidate && isSelectionInViewport(candidate.viewport, environment))
  );
}
function isDomReviewItem(item) {
  return item.scope === "dom" || item.kind === "note" && Boolean(item.anchor && getItemSelection(item));
}

// src/core/scroll.ts
function waitForNextFrame(environment) {
  return new Promise((resolve) => {
    (environment?.window ?? window).requestAnimationFrame(() => resolve());
  });
}
function runWithAutoScrollBehavior(targetDocument, callback) {
  const elements = [
    targetDocument.documentElement,
    targetDocument.body
  ].filter((element) => Boolean(element));
  const previousValues = elements.map((element) => element.style.scrollBehavior);
  elements.forEach((element) => {
    element.style.scrollBehavior = "auto";
  });
  try {
    callback();
  } finally {
    elements.forEach((element, index) => {
      element.style.scrollBehavior = previousValues[index] ?? "";
    });
  }
}
function setDocumentScrollInstantly(environment, position) {
  const scrollElement = environment.document.scrollingElement;
  if (scrollElement) {
    scrollElement.scrollLeft = Math.max(0, Math.round(position.x));
    scrollElement.scrollTop = Math.max(0, Math.round(position.y));
    return;
  }
  environment.window.scrollTo(
    Math.max(0, Math.round(position.x)),
    Math.max(0, Math.round(position.y))
  );
}

// src/core/overlay.style.ts
function createStyleElement() {
  const style = document.createElement("style");
  style.textContent = `
    :host {
      color-scheme: dark;
      --df-review-font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --df-review-font-size-2xs: 10px;
      --df-review-font-size-xs: 11px;
      --df-review-font-size-sm: 12px;
      --df-review-font-size-md: 13px;
      --df-review-font-size-xl: 15px;
      --df-review-space-1: 4px;
      --df-review-space-1-5: 6px;
      --df-review-space-2: 8px;
      --df-review-space-2-5: 10px;
      --df-review-space-3: 12px;
      --df-review-space-3-5: 14px;
      --df-review-space-4: 16px;
      --df-review-control-height-sm: 32px;
      --df-review-control-height-md: 34px;
      --df-review-radius-xs: 3px;
      --df-review-radius-sm: 6px;
      --df-review-radius-md: 8px;
      --df-review-radius-pill: 999px;
      --df-review-color-canvas: #111820;
      --df-review-color-panel: #1f2428;
      --df-review-color-panel-strong: #15191d;
      --df-review-color-control: #2c3338;
      --df-review-color-control-hover: #3b444b;
      --df-review-color-border: rgba(255, 255, 255, 0.14);
      --df-review-color-border-strong: rgba(255, 255, 255, 0.18);
      --df-review-color-text: #f7f7f2;
      --df-review-color-text-muted: rgba(247, 247, 242, 0.62);
      --df-review-color-text-subtle: rgba(247, 247, 242, 0.46);
      --df-review-color-accent: #d7ff5f;
      --df-review-color-accent-contrast: #171b1e;
      --df-review-color-accent-soft: rgba(215, 255, 95, 0.16);
      --df-review-color-accent-ring: rgba(215, 255, 95, 0.6);
      --df-review-color-area: #63d7c7;
      --df-review-color-error: #ffb7a7;
      --df-review-shadow-panel: 0 18px 48px rgba(0, 0, 0, 0.34);
      --df-review-shadow-popover: 0 16px 38px rgba(0, 0, 0, 0.32);
      --df-review-shadow-highlight: 0 10px 30px rgba(0, 0, 0, 0.22);
      font-family: var(--df-review-font-sans);
    }

    * {
      box-sizing: border-box;
    }

    .dfwr-shell {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 500;
      pointer-events: none;
    }

    .dfwr-shell.is-open {
      display: block;
    }

    .dfwr-shell.has-dismissible-draft {
      z-index: 900;
    }

    .dfwr-draft-cancel-layer {
      position: fixed;
      inset: 0;
      z-index: 2;
      pointer-events: auto;
      background: transparent;
      cursor: default;
    }

    .dfwr-panel {
      position: fixed;
      right: 16px;
      top: 16px;
      z-index: 3;
      width: min(380px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
      pointer-events: auto;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel);
      border: 1px solid var(--df-review-color-border);
      border-radius: var(--df-review-radius-md);
      box-shadow: var(--df-review-shadow-panel);
    }

    .dfwr-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 14px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .dfwr-title {
      font-size: 15px;
      font-weight: 700;
      line-height: 1.25;
    }

    .dfwr-meta {
      max-width: 292px;
      margin-top: 4px;
      overflow: hidden;
      color: rgba(247, 247, 242, 0.56);
      font-size: var(--df-review-font-size-xs);
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dfwr-toolbar,
    .dfwr-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 14px;
    }

    .dfwr-body,
    .dfwr-list {
      padding: 0 14px 14px;
    }

    .dfwr-list {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 12px;
    }

    .dfwr-button,
    .dfwr-icon-button {
      appearance: none;
      border: 1px solid var(--df-review-color-border-strong);
      background: var(--df-review-color-control);
      color: var(--df-review-color-text);
      cursor: pointer;
      font: inherit;
    }

    .dfwr-button {
      min-height: var(--df-review-control-height-md);
      padding: 0 12px;
      border-radius: var(--df-review-radius-sm);
      font-size: var(--df-review-font-size-sm);
      font-weight: 650;
    }

    .dfwr-button:hover,
    .dfwr-icon-button:hover,
    .dfwr-button.is-active {
      border-color: rgba(255, 255, 255, 0.4);
      background: var(--df-review-color-control-hover);
    }

    .dfwr-button.is-primary {
      border-color: var(--df-review-color-accent);
      background: var(--df-review-color-accent);
      color: var(--df-review-color-accent-contrast);
    }

    .dfwr-icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: var(--df-review-control-height-sm);
      padding: 0 8px;
      border-radius: var(--df-review-radius-sm);
      font-size: var(--df-review-font-size-xs);
      font-weight: 700;
      line-height: 1;
      text-transform: uppercase;
    }

    .dfwr-marker-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }

    .dfwr-area-preview-layer {
      position: fixed;
      inset: 0;
      z-index: 3;
      pointer-events: none;
    }

    .dfwr-selection-highlight {
      position: fixed;
      z-index: 1;
      border: 2px solid #d7ff5f;
      border-radius: var(--df-review-radius-xs);
      background: rgba(215, 255, 95, 0.08);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.72),
        0 0 0 9999px rgba(0, 0, 0, 0.12),
        0 10px 30px rgba(0, 0, 0, 0.22);
      animation: dfwr-selection-pulse 900ms ease 0s 2;
    }

    .dfwr-selection-highlight.is-draft {
      border-color: #63d7c7;
      background: rgba(99, 215, 199, 0.1);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.72),
        0 0 0 9999px rgba(0, 0, 0, 0.08),
        0 10px 30px rgba(0, 0, 0, 0.2);
      animation: none;
    }

    .dfwr-dom-hover {
      position: fixed;
      z-index: 2;
      border: 1px solid #d7ff5f;
      border-radius: var(--df-review-radius-xs);
      background: rgba(215, 255, 95, 0.1);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.72),
        0 0 0 9999px rgba(0, 0, 0, 0.08);
      pointer-events: none;
    }

    .dfwr-dom-hover[hidden] {
      display: none;
    }

    .dfwr-bound-marker,
    .dfwr-item-scope {
      --dfwr-scope: #7cc7ff;
      --dfwr-scope-rgb: 124, 199, 255;
    }

    .dfwr-bound-marker.is-scope-tablet,
    .dfwr-item-scope.is-scope-tablet {
      --dfwr-scope: #63d7c7;
      --dfwr-scope-rgb: 99, 215, 199;
    }

    .dfwr-bound-marker.is-scope-desktop,
    .dfwr-item-scope.is-scope-desktop {
      --dfwr-scope: #f3b75f;
      --dfwr-scope-rgb: 243, 183, 95;
    }

    .dfwr-bound-marker.is-scope-wide,
    .dfwr-item-scope.is-scope-wide {
      --dfwr-scope: #c99cff;
      --dfwr-scope-rgb: 201, 156, 255;
    }

    .dfwr-bound-marker.is-scope-dom,
    .dfwr-item-scope.is-scope-dom {
      --dfwr-scope: #ff8f61;
      --dfwr-scope-rgb: 255, 143, 97;
    }

    .dfwr-item-target-highlight,
    .dfwr-item-target-label {
      --dfwr-item-color: #7cc7ff;
      --dfwr-item-color-rgb: 124, 199, 255;
    }

    .dfwr-item-target-highlight.is-mode-area,
    .dfwr-item-target-label.is-mode-area {
      --dfwr-item-color: #63d7c7;
      --dfwr-item-color-rgb: 99, 215, 199;
    }

    .dfwr-item-target-highlight.is-mode-dom,
    .dfwr-item-target-label.is-mode-dom {
      --dfwr-item-color: #ff8f61;
      --dfwr-item-color-rgb: 255, 143, 97;
    }

    .dfwr-item-target-highlight {
      position: fixed;
      z-index: 2;
      border: 2px solid var(--dfwr-item-color);
      border-radius: 4px;
      background: rgba(var(--dfwr-item-color-rgb), 0.08);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.78),
        0 0 0 9999px rgba(0, 0, 0, 0.08),
        0 12px 30px rgba(0, 0, 0, 0.24);
      pointer-events: none;
    }

    .dfwr-item-target-highlight.is-fallback {
      border-style: dashed;
    }

    .dfwr-item-target-highlight.is-highlighted {
      border-width: 3px;
      background: rgba(var(--dfwr-item-color-rgb), 0.12);
    }

    .dfwr-item-target-highlight.is-highlighted::after {
      content: "";
      position: absolute;
      inset: -6px;
      border: 2px solid var(--dfwr-item-color);
      border-radius: var(--df-review-radius-md);
      opacity: 0;
      animation: dfwr-target-ring-blink 1000ms ease-in-out infinite;
      pointer-events: none;
    }

    .dfwr-item-target-label {
      position: fixed;
      z-index: 3;
      display: inline-flex;
      align-items: center;
      min-width: 24px;
      height: 20px;
      padding: 0 7px;
      border: 1px solid var(--dfwr-item-color);
      border-radius: 4px;
      background: var(--dfwr-item-color);
      box-shadow:
        0 0 0 3px rgba(var(--dfwr-item-color-rgb), 0.2),
        0 8px 18px rgba(0, 0, 0, 0.28);
      color: #111820;
      font-size: var(--df-review-font-size-2xs);
      font-weight: 900;
      line-height: 1;
      pointer-events: none;
    }

    .dfwr-item-target-label.is-highlighted {
      animation: dfwr-selected-blink 1000ms ease-in-out infinite;
    }

    .dfwr-bound-marker {
      position: fixed;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-width: 28px;
      height: 22px;
      padding: 0 6px;
      transform: translate(-50%, -50%);
      border: 1px solid var(--dfwr-scope);
      border-radius: var(--df-review-radius-pill);
      background: var(--df-review-color-panel);
      box-shadow: 0 0 0 4px rgba(var(--dfwr-scope-rgb), 0.18);
      color: var(--dfwr-scope);
      font-size: var(--df-review-font-size-2xs);
      font-weight: 800;
    }

    .dfwr-bound-marker.is-highlighted {
      min-width: 32px;
      height: 26px;
      border-width: 2px;
      box-shadow:
        0 0 0 5px rgba(var(--dfwr-scope-rgb), 0.22),
        0 12px 26px rgba(0, 0, 0, 0.34);
      animation: dfwr-selected-blink 1000ms ease-in-out infinite;
    }

    .dfwr-bound-marker.is-fallback {
      border-style: dashed;
    }

    .dfwr-bound-marker.is-note-callout,
    .dfwr-bound-marker.is-note-callout.is-highlighted {
      --dfwr-scope: #7cc7ff;
      --dfwr-scope-rgb: 124, 199, 255;
      min-width: 0;
      width: 0;
      height: 0;
      padding: 0;
      transform: none;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      color: var(--dfwr-scope);
      animation: none;
      overflow: visible;
    }

    .dfwr-bound-marker.is-note-callout::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 8px;
      height: 8px;
      transform: translate(-50%, -50%);
      border: 2px solid #111820;
      border-radius: var(--df-review-radius-pill);
      background: var(--dfwr-scope);
      box-shadow:
        0 0 0 3px rgba(var(--dfwr-scope-rgb), 0.22),
        0 6px 16px rgba(0, 0, 0, 0.28);
    }

    .dfwr-bound-marker.is-note-callout.is-highlighted::before {
      animation: dfwr-note-dot-pulse 1000ms ease-in-out infinite;
    }

    .dfwr-bound-marker.is-note-callout .dfwr-bound-marker-icon {
      position: absolute;
      left: 0;
      top: 0;
      width: 31px;
      height: 2px;
      transform: rotate(-42deg);
      transform-origin: left center;
      border-radius: var(--df-review-radius-pill);
      background: currentColor;
      opacity: 1;
    }

    .dfwr-bound-marker.is-note-callout .dfwr-bound-marker-icon::before,
    .dfwr-bound-marker.is-note-callout .dfwr-bound-marker-icon::after {
      display: none;
    }

    .dfwr-bound-marker.is-note-callout .dfwr-bound-marker-number {
      position: absolute;
      left: 24px;
      top: -41px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 20px;
      padding: 0 7px;
      border: 1px solid var(--dfwr-scope);
      border-radius: 4px;
      background: var(--dfwr-scope);
      box-shadow:
        0 0 0 3px rgba(var(--dfwr-scope-rgb), 0.18),
        0 8px 18px rgba(0, 0, 0, 0.28);
      color: #111820;
      text-align: center;
      line-height: 1;
      white-space: nowrap;
    }

    .dfwr-bound-marker.is-note-callout.is-highlighted .dfwr-bound-marker-icon,
    .dfwr-bound-marker.is-note-callout.is-highlighted .dfwr-bound-marker-number {
      animation: dfwr-selected-blink 1000ms ease-in-out infinite;
    }

    .dfwr-area-preview-layer .dfwr-bound-marker {
      border-color: #63d7c7;
      background: var(--df-review-color-panel);
      box-shadow:
        0 0 0 5px rgba(99, 215, 199, 0.2),
        0 12px 26px rgba(0, 0, 0, 0.3);
      color: #63d7c7;
    }

    .dfwr-bound-marker-icon {
      position: relative;
      display: inline-block;
      width: 10px;
      height: 10px;
      flex: 0 0 auto;
    }

    .dfwr-bound-marker-icon::before,
    .dfwr-bound-marker-icon::after {
      content: "";
      position: absolute;
      display: block;
    }

    .dfwr-bound-marker-icon::before {
      inset: 1px 2px;
      border: 1.5px solid currentColor;
      border-radius: 2px;
    }

    .dfwr-bound-marker.is-scope-mobile .dfwr-bound-marker-icon::before {
      inset: 0 2.5px;
      border-radius: 2px;
    }

    .dfwr-bound-marker.is-scope-tablet .dfwr-bound-marker-icon::before {
      inset: 0.5px 1.5px;
      border-radius: 2px;
    }

    .dfwr-bound-marker.is-scope-desktop .dfwr-bound-marker-icon::before {
      inset: 1px 0 3px;
      border-radius: 1px;
    }

    .dfwr-bound-marker.is-scope-desktop .dfwr-bound-marker-icon::after {
      left: 3px;
      right: 3px;
      bottom: 0;
      height: 1.5px;
      background: currentColor;
    }

    .dfwr-bound-marker.is-scope-wide .dfwr-bound-marker-icon::before {
      inset: 2px 0;
      border-radius: 1px;
    }

    .dfwr-bound-marker.is-scope-dom .dfwr-bound-marker-icon::before {
      inset: 2px;
      border-radius: 1px;
      transform: rotate(45deg);
    }

    .dfwr-bound-marker-number {
      min-width: 6px;
      text-align: center;
      line-height: 1;
    }

    .dfwr-note-draft {
      position: fixed;
      inset: 0;
      z-index: 4;
      pointer-events: none;
    }

    .dfwr-note-pin {
      appearance: none;
      position: fixed;
      z-index: 5;
      width: 18px;
      height: 18px;
      padding: 0;
      transform: translate(-50%, -50%);
      border: 2px solid #1f2428;
      border-radius: var(--df-review-radius-pill);
      background: var(--df-review-color-accent);
      box-shadow:
        0 0 0 4px rgba(215, 255, 95, 0.22),
        0 8px 18px rgba(0, 0, 0, 0.28);
      cursor: grab;
      pointer-events: auto;
    }

    .dfwr-note-pin:active {
      cursor: grabbing;
    }

    .dfwr-note-popover {
      position: fixed;
      z-index: 4;
      width: min(320px, calc(100vw - 24px));
      padding: 12px;
      pointer-events: auto;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel);
      border: 1px solid rgba(215, 255, 95, 0.56);
      border-radius: var(--df-review-radius-md);
      box-shadow: var(--df-review-shadow-popover);
    }

    .dfwr-note-popover.is-composer,
    .dfwr-area-draft.is-composer {
      max-height: min(360px, calc(100vh - 32px));
      overflow: auto;
      border-color: rgba(99, 215, 199, 0.56);
    }

    .dfwr-note-popover.is-dragging,
    .dfwr-area-draft.is-dragging {
      user-select: none;
    }

    .dfwr-draft-drag-handle {
      display: block;
      width: 42px;
      height: 6px;
      margin: 0 auto 10px;
      padding: 0;
      cursor: grab;
      pointer-events: auto;
      background: rgba(247, 247, 242, 0.28);
      border: 0;
      border-radius: 999px;
    }

    .dfwr-draft-drag-handle:hover,
    .dfwr-draft-drag-handle:focus-visible {
      background: rgba(215, 255, 95, 0.62);
    }

    .dfwr-draft-drag-handle:active {
      cursor: grabbing;
    }

    .dfwr-area-draft {
      position: fixed;
      right: 16px;
      top: 16px;
      z-index: 4;
      width: min(360px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
      padding: 12px;
      pointer-events: auto;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel);
      border: 1px solid rgba(215, 255, 95, 0.56);
      border-radius: var(--df-review-radius-md);
      box-shadow: var(--df-review-shadow-popover);
    }

    .dfwr-note-popover .dfwr-actions {
      padding: 0;
    }

    .dfwr-note-actions {
      justify-content: flex-end;
    }

    .dfwr-note-actions .dfwr-button:first-child {
      margin-right: auto;
    }

    .dfwr-area-draft .dfwr-actions {
      padding: 0;
    }

    .dfwr-form {
      display: grid;
      gap: 10px;
    }

    .dfwr-textarea {
      width: 100%;
      min-height: 92px;
      resize: vertical;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: var(--df-review-radius-sm);
      padding: 10px;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel-strong);
      font: inherit;
      font-size: var(--df-review-font-size-md);
      line-height: 1.45;
    }

    .dfwr-textarea:focus {
      outline: 2px solid var(--df-review-color-accent-ring);
      outline-offset: 1px;
    }

    .dfwr-adjust-panel {
      display: grid;
      gap: 4px;
      padding: 8px 10px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--df-review-radius-sm);
      background: rgba(255, 255, 255, 0.04);
    }

    .dfwr-adjust-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-width: 0;
    }

    .dfwr-adjust-panel-header .dfwr-adjust-help {
      flex: 1 1 auto;
      min-width: 0;
    }

    .dfwr-adjust-panel.is-active {
      border-color: rgba(215, 255, 95, 0.5);
      background: var(--df-review-color-accent-soft);
    }

    .dfwr-adjust-help,
    .dfwr-adjust-status {
      margin: 0;
      color: var(--df-review-color-text-muted);
      font-size: var(--df-review-font-size-xs);
      line-height: 1.35;
    }

    .dfwr-adjust-status {
      color: var(--df-review-color-text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }

    .dfwr-adjust-toggle {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 30px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--df-review-radius-sm);
      background: rgba(255, 255, 255, 0.04);
      color: var(--df-review-color-text);
      cursor: pointer;
      font: inherit;
      font-size: 14px;
      font-weight: 800;
      line-height: 1;
    }

    .dfwr-adjust-toggle:hover,
    .dfwr-adjust-toggle:focus-visible,
    .dfwr-adjust-toggle.is-active {
      border-color: rgba(215, 255, 95, 0.68);
      background: var(--df-review-color-accent-soft);
      outline: none;
    }

    .dfwr-adjust-hud {
      position: fixed;
      z-index: 5;
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 0 8px;
      border: 1px solid rgba(99, 215, 199, 0.72);
      border-radius: var(--df-review-radius-sm);
      background: rgba(21, 25, 29, 0.92);
      box-shadow:
        0 0 0 3px rgba(99, 215, 199, 0.14),
        0 8px 18px rgba(0, 0, 0, 0.26);
      color: #63d7c7;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: var(--df-review-font-size-2xs);
      font-weight: 800;
      line-height: 1;
      pointer-events: none;
      white-space: nowrap;
    }

    .dfwr-adjust-hud[hidden] {
      display: none;
    }

    .dfwr-empty,
    .dfwr-error {
      margin: 0;
      color: rgba(247, 247, 242, 0.62);
      font-size: var(--df-review-font-size-sm);
      line-height: 1.45;
    }

    .dfwr-error {
      color: var(--df-review-color-error);
    }

    .dfwr-preview,
    .dfwr-thumb {
      display: block;
      width: 100%;
      border: 1px solid var(--df-review-color-border);
      border-radius: var(--df-review-radius-sm);
      object-fit: cover;
      background: var(--df-review-color-canvas);
    }

    .dfwr-preview {
      max-height: 180px;
    }

    .dfwr-thumb {
      max-height: 120px;
      margin-top: 10px;
    }

    .dfwr-list-heading {
      margin-bottom: 10px;
      color: rgba(247, 247, 242, 0.74);
      font-size: var(--df-review-font-size-sm);
      font-weight: 700;
    }

    .dfwr-item {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      padding: 12px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
    }

    .dfwr-item:first-of-type {
      border-top: 0;
    }

    .dfwr-item:focus-visible {
      outline: 2px solid rgba(215, 255, 95, 0.72);
      outline-offset: 4px;
    }

    .dfwr-item-body {
      min-width: 0;
      flex: 1;
    }

    .dfwr-item-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .dfwr-item-scope,
    .dfwr-item-kind {
      display: inline-flex;
      align-items: center;
      min-height: 20px;
      border-radius: var(--df-review-radius-pill);
      padding: 0 7px;
      font-size: var(--df-review-font-size-2xs);
      font-weight: 800;
      line-height: 1;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .dfwr-item-scope {
      border: 1px solid rgba(var(--dfwr-scope-rgb), 0.38);
      background: rgba(var(--dfwr-scope-rgb), 0.12);
      color: var(--dfwr-scope);
    }

    .dfwr-item-kind {
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.05);
      color: rgba(247, 247, 242, 0.64);
    }

    .dfwr-item-comment {
      margin: 4px 0;
      color: var(--df-review-color-text);
      font-size: var(--df-review-font-size-md);
      line-height: 1.42;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .dfwr-item-date {
      color: rgba(247, 247, 242, 0.46);
      font-size: var(--df-review-font-size-xs);
    }

    .dfwr-item-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 0 0 auto;
    }

    .dfwr-text-layer,
    .dfwr-element-layer,
    .dfwr-area-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: auto;
    }

    .dfwr-text-layer {
      cursor: crosshair;
      background: rgba(0, 0, 0, 0.06);
    }

    .dfwr-element-layer {
      cursor: cell;
      background: rgba(0, 0, 0, 0.06);
    }

    .dfwr-area-layer {
      cursor: crosshair;
      background: rgba(0, 0, 0, 0.22);
    }

    .dfwr-area-box {
      position: fixed;
      z-index: 2;
      width: 0;
      height: 0;
      border: 1px solid #d7ff5f;
      background: rgba(215, 255, 95, 0.16);
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.18);
    }

    @keyframes dfwr-marker-pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.92);
      }
      45% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes dfwr-note-dot-pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.88);
      }
      45% {
        transform: translate(-50%, -50%) scale(1.3);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes dfwr-selected-blink {
      0%,
      100% {
        opacity: 0.78;
      }
      50% {
        opacity: 1;
      }
    }

    @keyframes dfwr-target-ring-blink {
      0%,
      100% {
        opacity: 0;
        transform: scale(0.98);
      }
      50% {
        opacity: 0.82;
        transform: scale(1);
      }
    }

    @keyframes dfwr-selection-pulse {
      0% {
        opacity: 0.72;
      }
      45% {
        opacity: 1;
      }
      100% {
        opacity: 0.86;
      }
    }

    @media (max-width: 520px) {
      .dfwr-panel {
        right: 8px;
        top: 8px;
        width: calc(100vw - 16px);
        max-height: calc(100vh - 16px);
      }
    }
  `;
  return style;
}

// src/core/review/format.ts
function formatNoteDraftMeta(draft) {
  const parts = [
    `viewport ${formatSize(draft.viewport)}`,
    `point ${formatPoint(draft.marker.viewport)}`
  ];
  if (draft.anchor) {
    parts.push(formatAnchorMeta(draft.anchor));
  }
  return parts.join(" / ");
}
function formatItemMeta(item) {
  const parts = [formatDate(item.createdAt)];
  const marker = getItemMarker(item);
  const selection = getItemSelection(item);
  if (item.viewport) {
    parts.push(`viewport ${formatSize(item.viewport)}`);
  }
  if (marker) {
    parts.push(`point ${formatPoint(marker.viewport)}`);
  }
  if (selection) {
    parts.push(`rect ${formatSelection(selection.viewport)}`);
  }
  if (item.anchor) {
    parts.push(formatAnchorMeta(item.anchor));
  }
  return parts.join(" / ");
}
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(void 0, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatSize(size) {
  return `${Math.round(size.width)}x${Math.round(size.height)}`;
}
function formatPoint(point) {
  return `${Math.round(point.x)},${Math.round(point.y)}`;
}
function formatSelection(selection) {
  return [
    Math.round(selection.x),
    Math.round(selection.y),
    Math.round(selection.width),
    Math.round(selection.height)
  ].join(",");
}
function formatAnchorMeta(anchor) {
  const parts = [`dom ${anchor.strategy}`];
  if (typeof anchor.confidence === "number") {
    parts.push(`${Math.round(anchor.confidence * 100)}%`);
  }
  const candidates = getAnchorCandidates(anchor);
  if (candidates.length > 1) {
    parts.push(`${candidates.length} candidates`);
  }
  return parts.join(" ");
}

// src/core/web.review.kit.view.ts
var DEFAULT_ADJUSTMENT_LABEL = "Responsive CSS px adjustments";
var WebReviewKitView = class {
  constructor(config) {
    this.config = config;
  }
  clearDraftPreview() {
    this.restoreDraftPreview();
  }
  render(shadow, hiddenItemsStyle) {
    const state = this.state;
    this.syncDraftPreview(
      state.isOpen && state.mode === "element" ? state.noteDraft : void 0
    );
    shadow.replaceChildren();
    shadow.append(createStyleElement());
    shadow.append(hiddenItemsStyle);
    const hasDismissableDraft = Boolean(state.noteDraft || state.areaDraft);
    const shell = document.createElement("div");
    shell.className = [
      "dfwr-shell",
      state.isOpen ? "is-open" : "",
      hasDismissableDraft ? "has-dismissible-draft" : ""
    ].filter(Boolean).join(" ");
    shell.setAttribute("aria-hidden", state.isOpen ? "false" : "true");
    if (this.config.options.ui?.panel !== false) {
      const panel = document.createElement("div");
      panel.className = "dfwr-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "Web review kit");
      panel.append(
        this.createHeader(),
        this.createToolbar(),
        this.createBody(),
        this.createList()
      );
      shell.append(panel);
    }
    shell.append(this.createMarkerLayer());
    if (state.isOpen && hasDismissableDraft) {
      shell.append(this.createDraftCancelLayer());
    }
    if (state.isOpen && (state.mode === "note" || state.mode === "element")) {
      shell.append(
        state.noteDraft ? this.createNotePopover(state.noteDraft) : state.mode === "element" ? this.createElementLayer() : this.createNoteLayer()
      );
    }
    if (state.isOpen && state.mode === "area" && !state.areaDraft) {
      shell.append(this.createAreaLayer());
    }
    if (state.isOpen && state.mode === "area" && state.areaDraft && this.config.options.ui?.panel === false) {
      if (state.areaDraft.selection) {
        shell.append(this.createAreaDraftOverlay(state.areaDraft));
      }
      shell.append(this.createAreaDraftPopover(state.areaDraft));
    }
    shadow.append(shell);
  }
  get state() {
    return this.config.getState();
  }
  createDraftCancelLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-draft-cancel-layer";
    layer.setAttribute("aria-hidden", "true");
    const cancel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.config.actions.setModeState("idle");
      this.config.actions.clearDrafts();
      this.config.actions.setSelectingArea(false);
      this.config.actions.render();
    };
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      cancel(event);
    });
    layer.addEventListener("click", cancel);
    return layer;
  }
  getDraftAdjustmentMetrics(draft) {
    const adjustment = draft.adjustment;
    const x = adjustment?.x ?? 0;
    const y = adjustment?.y ?? 0;
    const scale = adjustment?.scale ?? 0;
    const {
      scale: viewportScale,
      designWidth,
      presetLabel
    } = this.getDraftViewportScale(draft.viewport);
    const selection = draft.selection ? toViewportSelection(draft.selection.viewport) : void 0;
    const scaleCssDelta = scale * viewportScale;
    const scaleFactor = selection && selection.width > 0 ? Math.max(
      1 / selection.width,
      (selection.width + scaleCssDelta) / selection.width
    ) : 1;
    return {
      x,
      y,
      scale,
      cssX: x * viewportScale,
      cssY: y * viewportScale,
      scaleFactor,
      viewportScale,
      designWidth,
      presetLabel,
      viewportWidth: draft.viewport.width
    };
  }
  hasDraftAdjustment(draft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return metrics.x !== 0 || metrics.y !== 0 || metrics.scale !== 0;
  }
  getAdjustedDraftPoint(point, draft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return {
      x: point.x + metrics.cssX,
      y: point.y + metrics.cssY
    };
  }
  getAdjustedDraftSelection(selection, draft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return {
      ...selection,
      left: selection.left + metrics.cssX,
      top: selection.top + metrics.cssY,
      width: selection.width * metrics.scaleFactor,
      height: selection.height * metrics.scaleFactor
    };
  }
  getDraftViewportScale(viewport) {
    const preset = findReviewViewportPreset(
      viewport,
      this.config.options.viewports?.presets
    );
    const designWidth = typeof preset.designWidth === "number" && preset.designWidth > 0 ? preset.designWidth : viewport.width;
    const scale = designWidth > 0 ? viewport.width / designWidth : 1;
    return { scale, designWidth, presetLabel: preset.label };
  }
  getDraftComposerWidth(environment) {
    const bounds = environment.overlayRect;
    const margin = 12;
    return Math.min(360, Math.max(240, bounds.width - margin * 2));
  }
  getClampedComposerPosition(position, environment, size, bounds = environment.overlayRect) {
    const margin = 12;
    const width = size?.width ?? this.getDraftComposerWidth(environment);
    const height = size?.height ?? 236;
    return {
      x: clamp(
        position.x,
        bounds.left + margin,
        bounds.left + bounds.width - width - margin
      ),
      y: clamp(
        position.y,
        bounds.top + margin,
        bounds.top + bounds.height - height - margin
      )
    };
  }
  getHostComposerBounds() {
    const root = document.documentElement;
    return {
      left: 0,
      top: 0,
      width: root.clientWidth || window.innerWidth,
      height: root.clientHeight || window.innerHeight
    };
  }
  getInitialDraftComposerPosition(selection, environment, size) {
    const bounds = this.getHostComposerBounds();
    const margin = 12;
    const gap = 20;
    if (!selection) {
      return this.getClampedComposerPosition(
        {
          x: environment.overlayRect.left + margin,
          y: environment.overlayRect.top + margin
        },
        environment,
        size,
        bounds
      );
    }
    const preferredX = selection.left + selection.width + gap;
    const maxX = bounds.left + bounds.width - size.width - margin;
    const x = preferredX <= maxX ? preferredX : selection.left - size.width - gap;
    return this.getClampedComposerPosition(
      {
        x,
        y: selection.top
      },
      environment,
      size,
      bounds
    );
  }
  getDraftComposerPosition({
    selection,
    environment,
    composerPosition,
    estimatedHeight
  }) {
    const width = this.getDraftComposerWidth(environment);
    if (composerPosition) {
      const clamped = this.getClampedComposerPosition(
        composerPosition,
        environment,
        { width, height: estimatedHeight },
        this.getHostComposerBounds()
      );
      return { width, left: clamped.x, top: clamped.y };
    }
    const position = this.getInitialDraftComposerPosition(selection, environment, {
      width,
      height: estimatedHeight
    });
    return { width, left: position.x, top: position.y };
  }
  getSelectionMqMetrics(selection, viewport) {
    const { scale } = this.getDraftViewportScale(viewport);
    const ratio = scale > 0 ? 1 / scale : 1;
    return {
      x: selection.left * ratio,
      y: selection.top * ratio,
      width: selection.width * ratio,
      height: selection.height * ratio
    };
  }
  formatSignedPx(value) {
    if (value === 0) return "+0px";
    return `${value > 0 ? "+" : ""}${value}px`;
  }
  formatRoundedPx(value) {
    return `${Math.round(value)}px`;
  }
  getAdjustmentLabel() {
    return this.config.options.adjustmentLabel?.trim() || DEFAULT_ADJUSTMENT_LABEL;
  }
  getSelectionMetricLines(selection, viewport) {
    if (!selection) return ["area", "x none / y none", "w none / h none"];
    const metrics = this.getSelectionMqMetrics(selection, viewport);
    return [
      "area",
      `x ${this.formatRoundedPx(metrics.x)} / y ${this.formatRoundedPx(
        metrics.y
      )}`,
      `w ${this.formatRoundedPx(metrics.width)} / h ${this.formatRoundedPx(
        metrics.height
      )}`
    ];
  }
  getAreaDraftMetricSelection(draft) {
    if (!draft.selection) return void 0;
    return toViewportSelection(draft.selection.viewport);
  }
  formatDraftAdjustmentStatus(draft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return [
      `x ${this.formatSignedPx(metrics.x)}`,
      `y ${this.formatSignedPx(metrics.y)}`,
      `scale ${this.formatSignedPx(metrics.scale)}`
    ].join(" / ");
  }
  getDraftAdjustmentMetricLines(draft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return [
      `x ${this.formatSignedPx(metrics.x)} / y ${this.formatSignedPx(
        metrics.y
      )}`,
      `scale ${this.formatSignedPx(metrics.scale)}`
    ];
  }
  withDraftAdjustmentComment(comment, draft) {
    if (!this.hasDraftAdjustment(draft)) return comment;
    const metrics = this.getDraftAdjustmentMetrics(draft);
    const adjustment = [
      `${this.getAdjustmentLabel()}: x ${this.formatSignedPx(
        metrics.x
      )}, y ${this.formatSignedPx(metrics.y)}, scale ${this.formatSignedPx(
        metrics.scale
      )}`,
      `(${metrics.presetLabel} viewport, ${Math.round(
        metrics.viewportWidth
      )}/design ${Math.round(metrics.designWidth)})`
    ].join(" ");
    return `${comment.trim()}
${adjustment}`;
  }
  getStyleableDraftElement(draft, environment) {
    if (!draft.anchor) return void 0;
    const element = resolveAnchorElement(draft.anchor, environment)?.element;
    if (!element) return void 0;
    if ("style" in element) return element;
    return void 0;
  }
  syncDraftPreview(draft) {
    const environment = this.config.getEnvironment();
    if (!draft || !environment || !this.hasDraftAdjustment(draft)) {
      this.restoreDraftPreview();
      return;
    }
    const element = this.getStyleableDraftElement(draft, environment);
    if (!element) {
      this.restoreDraftPreview();
      return;
    }
    if (this.draftPreview?.element !== element) {
      this.restoreDraftPreview();
    }
    if (!this.draftPreview) {
      const computedTransform = environment.window.getComputedStyle(element).transform;
      this.draftPreview = {
        element,
        transform: element.style.transform,
        transformOrigin: element.style.transformOrigin,
        transition: element.style.transition,
        willChange: element.style.willChange,
        baseTransform: element.style.transform || (computedTransform && computedTransform !== "none" ? computedTransform : "")
      };
    }
    const metrics = this.getDraftAdjustmentMetrics(draft);
    const translate = `translate(${this.toCssNumber(metrics.cssX)}px, ${this.toCssNumber(
      metrics.cssY
    )}px)`;
    const scale = metrics.scaleFactor === 1 ? "" : `scale(${this.toCssNumber(metrics.scaleFactor)})`;
    element.style.transition = "none";
    element.style.willChange = "transform";
    element.style.transformOrigin = "top left";
    element.style.transform = [
      this.draftPreview.baseTransform,
      translate,
      scale
    ].filter(Boolean).join(" ");
  }
  restoreDraftPreview() {
    if (!this.draftPreview) return;
    const { element, transform, transformOrigin, transition, willChange } = this.draftPreview;
    element.style.transform = transform;
    element.style.transformOrigin = transformOrigin;
    element.style.transition = transition;
    element.style.willChange = willChange;
    this.draftPreview = void 0;
  }
  toCssNumber(value) {
    return Math.round(value * 1e3) / 1e3;
  }
  createHeader() {
    const header = document.createElement("div");
    header.className = "dfwr-header";
    const title = document.createElement("div");
    title.className = "dfwr-title";
    title.textContent = "Review Kit";
    const meta = document.createElement("div");
    meta.className = "dfwr-meta";
    meta.textContent = getRouteKey(this.config.getEnvironment());
    const titleGroup = document.createElement("div");
    titleGroup.append(title, meta);
    const close = document.createElement("button");
    close.className = "dfwr-icon-button";
    close.type = "button";
    close.textContent = "x";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => this.config.actions.close());
    header.append(titleGroup, close);
    return header;
  }
  createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "dfwr-toolbar";
    toolbar.append(
      this.createToolbarButton("Note", this.state.mode === "note", () => {
        const mode = this.state.mode;
        this.config.actions.setModeState(mode === "note" ? "idle" : "note");
        this.config.actions.clearDrafts();
        this.config.actions.render();
      }),
      this.createToolbarButton("Element", this.state.mode === "element", () => {
        const mode = this.state.mode;
        this.config.actions.setModeState(
          mode === "element" ? "idle" : "element"
        );
        this.config.actions.clearDrafts();
        this.config.actions.render();
      }),
      this.createToolbarButton(
        this.state.isSelectingArea ? "Selecting" : "Area",
        this.state.mode === "area",
        () => {
          const mode = this.state.mode;
          this.config.actions.setModeState(mode === "area" ? "idle" : "area");
          this.config.actions.clearDrafts();
          this.config.actions.render();
        }
      ),
      this.createToolbarButton("Refresh", false, () => {
        void this.config.actions.reload();
      })
    );
    return toolbar;
  }
  createToolbarButton(label, active, onClick) {
    const button = document.createElement("button");
    button.className = `dfwr-button${active ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }
  createBody() {
    const body = document.createElement("div");
    body.className = "dfwr-body";
    const state = this.state;
    if (state.mode === "idle") {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "Add a note or mark an area.";
      body.append(empty);
      return body;
    }
    if (state.mode === "note" || state.mode === "element") {
      body.append(this.createNoteBody());
      return body;
    }
    body.append(this.createAreaForm());
    return body;
  }
  createNoteBody() {
    const empty = document.createElement("p");
    empty.className = "dfwr-empty";
    empty.textContent = this.state.noteDraft ? "Write the note in the page box." : this.state.mode === "element" ? "Click an element to add QA." : "Click on the page to place a note.";
    return empty;
  }
  createNotePopover(draft) {
    const environment = this.config.getEnvironment();
    const group = document.createElement("div");
    group.className = "dfwr-note-draft";
    if (!environment) return group;
    const isElementDraft = this.state.mode === "element" && Boolean(draft.selection);
    const hostPoint = toHostPoint(
      isElementDraft ? this.getAdjustedDraftPoint(draft.marker.viewport, draft) : draft.marker.viewport,
      environment
    );
    let selectionHighlight;
    if (draft.selection) {
      const selection = toViewportSelection(draft.selection.viewport);
      selectionHighlight = this.createSelectionHighlight(
        isElementDraft ? this.getAdjustedDraftSelection(selection, draft) : selection,
        environment,
        true
      );
      group.append(selectionHighlight);
    }
    const pin = document.createElement("button");
    pin.className = "dfwr-note-pin";
    pin.type = "button";
    pin.setAttribute("aria-label", "Move note point");
    pin.style.left = `${hostPoint.x}px`;
    pin.style.top = `${hostPoint.y}px`;
    const popover = document.createElement("div");
    const position = getPopoverPosition(hostPoint, environment);
    popover.className = `dfwr-note-popover${isElementDraft ? " is-composer" : ""}`;
    if (isElementDraft) {
      const selection = draft.selection ? toHostSelection(
        this.getAdjustedDraftSelection(
          toViewportSelection(draft.selection.viewport),
          draft
        ),
        environment
      ) : void 0;
      const composer = this.getDraftComposerPosition({
        selection,
        environment,
        composerPosition: draft.composerPosition,
        estimatedHeight: 252
      });
      popover.style.left = `${composer.left}px`;
      popover.style.top = `${composer.top}px`;
      popover.style.width = `${composer.width}px`;
    } else {
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;
    }
    const form = document.createElement("form");
    form.className = "dfwr-form";
    const meta = isElementDraft ? void 0 : document.createElement("div");
    if (meta) {
      meta.className = "dfwr-item-date";
      meta.textContent = formatNoteDraftMeta(draft);
    }
    const textarea = document.createElement("textarea");
    textarea.className = "dfwr-textarea";
    textarea.placeholder = "Review comment";
    textarea.rows = 4;
    textarea.value = draft.comment ?? "";
    textarea.addEventListener("input", () => {
      const noteDraft = this.state.noteDraft;
      if (!noteDraft) return;
      this.config.actions.setNoteDraft({
        ...noteDraft,
        comment: textarea.value
      });
    });
    const saveDraft = () => {
      const comment = textarea.value.trim();
      if (!comment) return;
      const currentDraft = this.state.noteDraft ?? draft;
      void this.config.actions.createItem({
        kind: "note",
        comment: this.withDraftAdjustmentComment(comment, currentDraft),
        viewport: currentDraft.viewport,
        anchor: currentDraft.anchor,
        marker: currentDraft.marker,
        selection: currentDraft.selection
      });
    };
    const adjustmentHud = isElementDraft ? this.createAdjustmentHud(draft, environment) : void 0;
    if (adjustmentHud) {
      group.append(adjustmentHud);
    }
    const adjustmentControls = isElementDraft ? this.createAdjustmentControls({
      draft,
      hud: adjustmentHud,
      pin,
      popover,
      selectionHighlight,
      textarea
    }) : void 0;
    const actions = this.createFormActions("Save note", saveDraft);
    form.append(
      ...meta ? [meta] : [],
      ...adjustmentControls ? [adjustmentControls.panel] : [],
      textarea,
      actions
    );
    const dragHandle = isElementDraft ? this.createDraftDragHandle("Move DOM composer") : void 0;
    popover.append(...dragHandle ? [dragHandle] : [], form);
    group.append(pin, popover);
    if (dragHandle) {
      this.attachDraftComposerDrag(popover, dragHandle, (composerPosition) => {
        const noteDraft = this.state.noteDraft ?? draft;
        this.config.actions.setNoteDraft({
          ...noteDraft,
          composerPosition,
          comment: textarea.value
        });
      });
    }
    this.attachDraftPinDrag(
      pin,
      isElementDraft ? void 0 : popover,
      meta,
      textarea
    );
    window.setTimeout(() => {
      if (draft.adjustment?.isActive) {
        adjustmentControls?.focusTarget.focus();
        return;
      }
      textarea.focus();
    }, 0);
    return group;
  }
  createDraftDragHandle(label) {
    const handle = document.createElement("button");
    handle.className = "dfwr-draft-drag-handle";
    handle.type = "button";
    handle.setAttribute("aria-label", label);
    return handle;
  }
  attachDraftComposerDrag(popover, handle, onMove) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    const movePopover = (event) => {
      const environment = this.config.getEnvironment();
      if (!environment) return;
      const position = this.getClampedComposerPosition(
        {
          x: event.clientX - offsetX,
          y: event.clientY - offsetY
        },
        environment,
        {
          width: popover.offsetWidth,
          height: popover.offsetHeight
        },
        this.getHostComposerBounds()
      );
      popover.style.left = `${position.x}px`;
      popover.style.top = `${position.y}px`;
      onMove(position);
    };
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const rect = popover.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      isDragging = true;
      event.preventDefault();
      event.stopPropagation();
      handle.setPointerCapture(event.pointerId);
      popover.classList.add("is-dragging");
    });
    handle.addEventListener("pointermove", (event) => {
      if (!isDragging || !handle.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      movePopover(event);
    });
    const stopDrag = (event) => {
      if (!isDragging || !handle.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      event.stopPropagation();
      isDragging = false;
      handle.releasePointerCapture(event.pointerId);
      popover.classList.remove("is-dragging");
      movePopover(event);
    };
    handle.addEventListener("pointerup", stopDrag);
    handle.addEventListener("pointercancel", stopDrag);
  }
  createAdjustmentControls({
    draft,
    hud,
    pin,
    popover,
    selectionHighlight,
    textarea
  }) {
    const panel = document.createElement("div");
    panel.className = "dfwr-adjust-panel is-dom-adjust-panel";
    const header = document.createElement("div");
    header.className = "dfwr-adjust-panel-header";
    const help = document.createElement("div");
    help.className = "dfwr-adjust-help";
    help.textContent = this.getAdjustmentLabel();
    const adjust = document.createElement("button");
    adjust.className = "dfwr-adjust-toggle";
    adjust.type = "button";
    adjust.title = "Adjust DOM element with keyboard arrows";
    adjust.setAttribute("aria-label", "Adjust DOM element with keyboard arrows");
    const xyStatus = document.createElement("div");
    xyStatus.className = "dfwr-adjust-status";
    const scaleStatus = document.createElement("div");
    scaleStatus.className = "dfwr-adjust-status";
    const syncControls = (nextDraft) => {
      const isActive = nextDraft.adjustment?.isActive === true;
      panel.classList.toggle("is-active", isActive);
      adjust.classList.toggle("is-active", isActive);
      adjust.setAttribute("aria-pressed", isActive ? "true" : "false");
      adjust.textContent = isActive ? "\u2713" : "\u2194\u2195";
      adjust.title = isActive ? "Finish DOM adjustment" : "Adjust DOM element with keyboard arrows";
      adjust.setAttribute(
        "aria-label",
        isActive ? "Finish DOM adjustment" : "Adjust DOM element with keyboard arrows"
      );
      const [xyLine, scaleLine] = this.getDraftAdjustmentMetricLines(nextDraft);
      xyStatus.textContent = xyLine;
      scaleStatus.textContent = scaleLine;
      this.syncDraftAdjustmentUi({
        draft: nextDraft,
        hud,
        pin,
        selectionHighlight
      });
    };
    const updateDraft = (updater) => {
      const currentDraft = this.state.noteDraft ?? draft;
      const nextDraft = updater(currentDraft);
      this.config.actions.setNoteDraft({
        ...nextDraft,
        comment: textarea.value
      });
      syncControls(nextDraft);
    };
    adjust.addEventListener("click", () => {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        adjustment: {
          x: currentDraft.adjustment?.x ?? 0,
          y: currentDraft.adjustment?.y ?? 0,
          scale: currentDraft.adjustment?.scale ?? 0,
          isActive: currentDraft.adjustment?.isActive !== true
        }
      }));
      adjust.focus();
    });
    popover.addEventListener("keydown", (event) => {
      const currentDraft = this.state.noteDraft ?? draft;
      if (currentDraft.adjustment?.isActive !== true) return;
      const keyDelta = this.getAdjustmentKeyDelta(event);
      if (!keyDelta) return;
      event.preventDefault();
      event.stopPropagation();
      updateDraft((activeDraft) => ({
        ...activeDraft,
        adjustment: {
          x: (activeDraft.adjustment?.x ?? 0) + keyDelta.x,
          y: (activeDraft.adjustment?.y ?? 0) + keyDelta.y,
          scale: (activeDraft.adjustment?.scale ?? 0) + keyDelta.scale,
          isActive: true
        }
      }));
    });
    header.append(help, adjust);
    panel.append(header, xyStatus, scaleStatus);
    syncControls(draft);
    return {
      panel,
      focusTarget: adjust
    };
  }
  getAdjustmentKeyDelta(event) {
    const step = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowLeft") return { x: -step, y: 0, scale: 0 };
    if (event.key === "ArrowRight") return { x: step, y: 0, scale: 0 };
    if (event.key === "ArrowUp") return { x: 0, y: -step, scale: 0 };
    if (event.key === "ArrowDown") return { x: 0, y: step, scale: 0 };
    if (event.key.toLowerCase() === "w") return { x: 0, y: 0, scale: step };
    if (event.key.toLowerCase() === "s") return { x: 0, y: 0, scale: -step };
    return void 0;
  }
  createAdjustmentHud(draft, environment) {
    const hud = document.createElement("div");
    hud.className = "dfwr-adjust-hud";
    hud.setAttribute("aria-hidden", "true");
    this.syncAdjustmentHud(hud, draft, environment);
    return hud;
  }
  syncDraftAdjustmentUi({
    draft,
    hud,
    pin,
    selectionHighlight
  }) {
    const environment = this.config.getEnvironment();
    if (!environment) return;
    const hostPoint = toHostPoint(
      this.getAdjustedDraftPoint(draft.marker.viewport, draft),
      environment
    );
    pin.style.left = `${hostPoint.x}px`;
    pin.style.top = `${hostPoint.y}px`;
    if (draft.selection && selectionHighlight) {
      const rect = toHostSelection(
        this.getAdjustedDraftSelection(
          toViewportSelection(draft.selection.viewport),
          draft
        ),
        environment
      );
      selectionHighlight.style.left = `${rect.left}px`;
      selectionHighlight.style.top = `${rect.top}px`;
      selectionHighlight.style.width = `${rect.width}px`;
      selectionHighlight.style.height = `${rect.height}px`;
    }
    if (hud) {
      this.syncAdjustmentHud(hud, draft, environment);
    }
    this.syncDraftPreview(draft);
  }
  syncAdjustmentHud(hud, draft, environment) {
    if (!draft.selection) return;
    const rect = toHostSelection(
      this.getAdjustedDraftSelection(
        toViewportSelection(draft.selection.viewport),
        draft
      ),
      environment
    );
    const isVisible = draft.adjustment?.isActive === true || this.hasDraftAdjustment(draft);
    hud.hidden = !isVisible;
    hud.textContent = this.formatDraftAdjustmentStatus(draft);
    hud.style.left = `${Math.max(4, rect.left)}px`;
    hud.style.top = `${Math.max(4, rect.top - 28)}px`;
  }
  createAreaForm() {
    const form = document.createElement("form");
    form.className = "dfwr-form";
    const areaDraft = this.state.areaDraft;
    if (!areaDraft) {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "Drag on the page to select an area.";
      form.append(empty);
      return form;
    }
    form.append(this.createAreaMetricsPanel(areaDraft));
    const textarea = document.createElement("textarea");
    textarea.className = "dfwr-textarea";
    textarea.placeholder = "Area comment";
    textarea.rows = 4;
    textarea.value = areaDraft.comment ?? "";
    textarea.addEventListener("input", () => {
      const draft = this.state.areaDraft;
      if (!draft) return;
      this.config.actions.setAreaDraft({
        ...draft,
        comment: textarea.value
      });
    });
    const actions = this.createFormActions("Save area", () => {
      const comment = textarea.value.trim();
      const draft = this.state.areaDraft;
      if (!comment || !draft) return;
      void this.config.actions.createItem({
        kind: "area",
        comment,
        viewport: draft.viewport,
        anchor: draft.anchor,
        marker: draft.marker,
        selection: draft.selection
      });
    });
    form.append(textarea, actions);
    return form;
  }
  createAreaMetricsPanel(draft) {
    const panel = document.createElement("div");
    panel.className = "dfwr-adjust-panel is-area-metrics-panel";
    const help = document.createElement("div");
    help.className = "dfwr-adjust-help";
    const [labelLine, xyLine, sizeLine] = this.getSelectionMetricLines(
      this.getAreaDraftMetricSelection(draft),
      draft.viewport
    );
    help.textContent = labelLine;
    const xyStatus = document.createElement("div");
    xyStatus.className = "dfwr-adjust-status";
    xyStatus.textContent = xyLine;
    const sizeStatus = document.createElement("div");
    sizeStatus.className = "dfwr-adjust-status";
    sizeStatus.textContent = sizeLine;
    panel.append(help, xyStatus, sizeStatus);
    return panel;
  }
  createAreaDraftOverlay(draft) {
    const layer = document.createElement("div");
    layer.className = "dfwr-area-preview-layer";
    const environment = this.config.getEnvironment();
    if (!environment || !draft.selection) return layer;
    const selection = toViewportSelection(draft.selection.viewport);
    layer.append(this.createSelectionHighlight(selection, environment, true));
    if (draft.marker) {
      const hostPoint = toHostPoint(draft.marker.viewport, environment);
      layer.append(
        this.createMarkerElement(
          void 0,
          hostPoint,
          "\u2022",
          getReviewViewportScope(
            draft.viewport,
            this.config.options.viewports?.presets
          ),
          true,
          true
        )
      );
    }
    return layer;
  }
  createAreaDraftPopover(draft) {
    const environment = this.config.getEnvironment();
    const popover = document.createElement("div");
    popover.className = "dfwr-area-draft is-composer";
    if (environment && draft.selection) {
      const selection = toHostSelection(
        toViewportSelection(draft.selection.viewport),
        environment
      );
      const composer = this.getDraftComposerPosition({
        selection,
        environment,
        composerPosition: draft.composerPosition,
        estimatedHeight: 220
      });
      popover.style.left = `${composer.left}px`;
      popover.style.top = `${composer.top}px`;
      popover.style.width = `${composer.width}px`;
      popover.style.right = "auto";
    }
    const dragHandle = this.createDraftDragHandle("Move area composer");
    popover.append(dragHandle, this.createAreaForm());
    this.attachDraftComposerDrag(popover, dragHandle, (composerPosition) => {
      const areaDraft = this.state.areaDraft ?? draft;
      this.config.actions.setAreaDraft({
        ...areaDraft,
        composerPosition
      });
    });
    return popover;
  }
  createFormActions(saveLabel, onSave, options) {
    const actions = document.createElement("div");
    actions.className = ["dfwr-actions", options?.className].filter(Boolean).join(" ");
    const save = document.createElement("button");
    save.className = "dfwr-button is-primary";
    save.type = "button";
    save.textContent = saveLabel;
    save.addEventListener("click", onSave);
    const cancel = document.createElement("button");
    cancel.className = "dfwr-button";
    cancel.type = "button";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => {
      this.config.actions.setModeState("idle");
      this.config.actions.clearDrafts();
      this.config.actions.render();
    });
    if (options?.beforeSave?.length || options?.className) {
      actions.append(cancel, ...options.beforeSave ?? [], save);
      return actions;
    }
    actions.append(save, cancel);
    return actions;
  }
  createList() {
    const section = document.createElement("div");
    section.className = "dfwr-list";
    const state = this.state;
    const heading = document.createElement("div");
    heading.className = "dfwr-list-heading";
    heading.textContent = `Review items (${state.items.length})`;
    section.append(heading);
    if (state.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "No review items on this page.";
      section.append(empty);
      return section;
    }
    for (const numberedItem of getNumberedReviewItems(
      state.items,
      this.config.options.viewports?.presets
    )) {
      section.append(this.createListItem(numberedItem));
    }
    return section;
  }
  createListItem(numberedItem) {
    const { item } = numberedItem;
    const row = document.createElement("article");
    row.className = "dfwr-item";
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute(
      "aria-label",
      `Restore review item: ${item.title ?? item.comment}`
    );
    row.addEventListener("click", () => {
      void this.config.actions.restoreItem(item);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      void this.config.actions.restoreItem(item);
    });
    const body = document.createElement("div");
    body.className = "dfwr-item-body";
    const badges = document.createElement("div");
    badges.className = "dfwr-item-badges";
    const scope = document.createElement("div");
    scope.className = `dfwr-item-scope is-scope-${numberedItem.scope}`;
    scope.textContent = numberedItem.displayLabel;
    const kind = document.createElement("div");
    kind.className = "dfwr-item-kind";
    kind.textContent = item.kind;
    badges.append(scope, kind);
    const comment = document.createElement("p");
    comment.className = "dfwr-item-comment";
    comment.textContent = item.comment;
    const date = document.createElement("time");
    date.className = "dfwr-item-date";
    date.dateTime = item.createdAt;
    date.textContent = formatItemMeta(item);
    body.append(badges, comment, date);
    const actions = document.createElement("div");
    actions.className = "dfwr-item-actions";
    actions.addEventListener("click", (event) => event.stopPropagation());
    actions.addEventListener("keydown", (event) => event.stopPropagation());
    const remove = document.createElement("button");
    remove.className = "dfwr-icon-button";
    remove.type = "button";
    remove.textContent = "x";
    remove.setAttribute("aria-label", "Delete");
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      void this.config.actions.removeItem(item.id).then(() => this.config.actions.reload());
    });
    actions.append(remove);
    row.append(body, actions);
    return row;
  }
  createMarkerLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-marker-layer";
    const environment = this.config.getEnvironment();
    if (!environment) return layer;
    const currentScope = getReviewViewportScope(
      getViewportSize(environment),
      this.config.options.viewports?.presets
    );
    getNumberedReviewItems(
      this.state.items,
      this.config.options.viewports?.presets
    ).forEach((numberedItem) => {
      const { item, scope, displayLabel } = numberedItem;
      if (!shouldShowMarkerForScope(scope, currentScope)) {
        return;
      }
      const isHighlighted = item.id === this.state.highlightedItemId;
      const highlightMode = getReviewItemHighlightMode(item);
      if (highlightMode !== "note" && (!this.state.highlightedItemId || isHighlighted)) {
        const selection = getItemHighlightSelection(item, environment);
        if (selection) {
          layer.append(
            ...this.createItemHighlightElements(
              selection.viewport,
              environment,
              item,
              displayLabel,
              selection.isBound,
              isHighlighted
            )
          );
          return;
        }
      }
      const point = getBoundMarkerPoint(item, environment);
      if (!point || !isPointInViewport(point.viewport, environment)) {
        return;
      }
      const hostPoint = toHostPoint(point.viewport, environment);
      const marker = this.createMarkerElement(
        item.id,
        hostPoint,
        displayLabel,
        scope,
        point.isBound,
        isHighlighted,
        highlightMode === "note" ? "note" : "default"
      );
      marker.title = `${displayLabel} / ${item.comment}
${formatItemMeta(item)}`;
      layer.append(marker);
    });
    return layer;
  }
  createItemHighlightElements(selection, environment, item, label, isBound, isHighlighted) {
    const rect = toHostSelection(selection, environment);
    const mode = getReviewItemHighlightMode(item);
    const highlight = document.createElement("div");
    highlight.className = [
      "dfwr-item-target-highlight",
      `is-mode-${mode}`,
      isBound ? "is-bound" : "is-fallback",
      isHighlighted ? "is-highlighted" : ""
    ].filter(Boolean).join(" ");
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.dataset.reviewItemId = item.id;
    const labelElement = document.createElement("div");
    labelElement.className = [
      "dfwr-item-target-label",
      `is-mode-${mode}`,
      isHighlighted ? "is-highlighted" : ""
    ].filter(Boolean).join(" ");
    labelElement.textContent = label;
    labelElement.style.left = `${Math.max(4, rect.left)}px`;
    labelElement.style.top = `${Math.max(4, rect.top - 24)}px`;
    labelElement.dataset.reviewItemId = item.id;
    return [highlight, labelElement];
  }
  createSelectionHighlight(selection, environment, isDraft) {
    const rect = toHostSelection(selection, environment);
    const highlight = document.createElement("div");
    highlight.className = `dfwr-selection-highlight${isDraft ? " is-draft" : ""}`;
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    return highlight;
  }
  createMarkerElement(itemId, hostPoint, label, scope, isBound, isHighlighted, variant = "default") {
    const isNoteCallout = variant === "note";
    const marker = document.createElement("div");
    marker.className = [
      "dfwr-bound-marker",
      isNoteCallout ? "is-note-callout" : "",
      `is-scope-${scope}`,
      isBound ? "is-bound" : "is-fallback",
      isHighlighted ? "is-highlighted" : ""
    ].filter(Boolean).join(" ");
    marker.style.left = `${hostPoint.x}px`;
    marker.style.top = `${hostPoint.y}px`;
    marker.dataset.scope = scope;
    if (itemId) {
      marker.dataset.reviewItemId = itemId;
    }
    const iconElement = document.createElement("span");
    iconElement.className = "dfwr-bound-marker-icon";
    iconElement.setAttribute("aria-hidden", "true");
    const labelElement = document.createElement("span");
    labelElement.className = "dfwr-bound-marker-number";
    labelElement.textContent = label;
    marker.append(iconElement, labelElement);
    return marker;
  }
  attachDraftPinDrag(pin, popover, meta, textarea) {
    let isDragging = false;
    const moveDraftUi = (hostPoint) => {
      const environment = this.config.getEnvironment();
      if (!environment) return;
      const nextPoint = clampPoint(toTargetPoint(hostPoint, environment), environment);
      const nextHostPoint = toHostPoint(nextPoint, environment);
      pin.style.left = `${nextHostPoint.x}px`;
      pin.style.top = `${nextHostPoint.y}px`;
      if (popover) {
        const position = getPopoverPosition(nextHostPoint, environment);
        popover.style.left = `${position.left}px`;
        popover.style.top = `${position.top}px`;
      }
      const noteDraft = this.state.noteDraft;
      if (!noteDraft) return;
      const nextDraft = {
        ...noteDraft,
        marker: {
          ...noteDraft.marker,
          viewport: roundPoint(nextPoint)
        },
        comment: textarea.value
      };
      this.config.actions.setNoteDraft(nextDraft);
      if (meta) {
        meta.textContent = formatNoteDraftMeta(nextDraft);
      }
    };
    pin.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      isDragging = true;
      pin.setPointerCapture(event.pointerId);
    });
    pin.addEventListener("pointermove", (event) => {
      if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      moveDraftUi({
        x: event.clientX,
        y: event.clientY
      });
    });
    pin.addEventListener("pointerup", (event) => {
      if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      event.stopPropagation();
      isDragging = false;
      pin.releasePointerCapture(event.pointerId);
      const nextPoint = toTargetPointFromHostEvent(
        event,
        this.config.getEnvironment()
      );
      void (this.state.mode === "element" ? this.config.actions.bindElementDraftToPoint(nextPoint, textarea.value) : this.config.actions.bindNoteDraftToPoint(nextPoint, textarea.value));
    });
  }
  createNoteLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-text-layer";
    const environment = this.config.getEnvironment();
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.config.actions.bindNoteDraftToPoint(
        toTargetPointFromHostEvent(event, this.config.getEnvironment())
      );
    });
    return layer;
  }
  createElementLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-element-layer";
    const environment = this.config.getEnvironment();
    const hover = document.createElement("div");
    hover.className = "dfwr-dom-hover";
    hover.hidden = true;
    layer.append(hover);
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    const updateHover = (point) => {
      const nextEnvironment = this.config.getEnvironment();
      if (!nextEnvironment) return;
      const anchor = getDomAnchorFromPoint(
        clampPoint(point, nextEnvironment),
        this.config.options.anchors?.attribute,
        nextEnvironment
      );
      const selection = anchor ? getElementViewportSelection(anchor, nextEnvironment) : void 0;
      if (!selection) {
        hover.hidden = true;
        return;
      }
      const rect = toHostSelection(selection, nextEnvironment);
      hover.hidden = false;
      hover.style.left = `${rect.left}px`;
      hover.style.top = `${rect.top}px`;
      hover.style.width = `${rect.width}px`;
      hover.style.height = `${rect.height}px`;
    };
    layer.addEventListener("pointermove", (event) => {
      updateHover(toTargetPointFromHostEvent(event, this.config.getEnvironment()));
    });
    layer.addEventListener("pointerleave", () => {
      hover.hidden = true;
    });
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.config.actions.bindElementDraftToPoint(
        toTargetPointFromHostEvent(event, this.config.getEnvironment())
      );
    });
    return layer;
  }
  createAreaLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-area-layer";
    const environment = this.config.getEnvironment();
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    const box = document.createElement("div");
    box.className = "dfwr-area-box";
    layer.append(box);
    let startX = 0;
    let startY = 0;
    let selection;
    const updateBox = (event) => {
      const nextPoint = toTargetPointFromHostEvent(
        event,
        this.config.getEnvironment()
      );
      const left = Math.min(startX, nextPoint.x);
      const top = Math.min(startY, nextPoint.y);
      const width = Math.abs(nextPoint.x - startX);
      const height = Math.abs(nextPoint.y - startY);
      const hostPoint = toHostPoint(
        { x: left, y: top },
        this.config.getEnvironment()
      );
      selection = { left, top, width, height };
      box.style.left = `${hostPoint.x}px`;
      box.style.top = `${hostPoint.y}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    };
    layer.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      layer.setPointerCapture(event.pointerId);
      const startPoint = toTargetPointFromHostEvent(
        event,
        this.config.getEnvironment()
      );
      startX = startPoint.x;
      startY = startPoint.y;
      updateBox(event);
    });
    layer.addEventListener("pointermove", (event) => {
      if (!layer.hasPointerCapture(event.pointerId)) return;
      updateBox(event);
    });
    layer.addEventListener("pointerup", (event) => {
      if (!layer.hasPointerCapture(event.pointerId)) return;
      layer.releasePointerCapture(event.pointerId);
      updateBox(event);
      if (!selection || selection.width < 8 || selection.height < 8) return;
      this.config.actions.setSelectingArea(true);
      this.config.actions.render();
      void this.config.actions.createAreaDraft(selection);
    });
    return layer;
  }
};

// src/core/web.review.kit.app.ts
var ROOT_ID = "df-web-review-kit-root";
function isEditableEventTarget(event) {
  const path = event.composedPath?.() ?? [];
  const element = path[0] ?? event.target;
  if (!element || typeof element.tagName !== "string") return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || element.isContentEditable === true;
}
function createWebReviewKit(options) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return createNoopController();
  }
  const app = new WebReviewKitApp(options);
  app.mount();
  return {
    open: () => app.open(),
    close: () => app.close(),
    toggle: () => app.toggle(),
    setMode: (mode) => app.setMode(mode),
    getMode: () => app.getMode(),
    highlightItem: (itemId) => app.highlightItem(itemId),
    setHiddenItemIds: (itemIds) => app.setHiddenItemIds(itemIds),
    reload: () => app.reload(),
    getItems: () => app.getItems(),
    destroy: () => app.destroy()
  };
}
var WebReviewKitApp = class {
  constructor(options) {
    this.options = options;
    this.isOpen = false;
    this.mode = "idle";
    this.items = [];
    this.isSelectingArea = false;
    this.handleKeyDown = (event) => {
      if (event.key === "Escape" && this.cancelMode()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (isEditableEventTarget(event) || !isHotkey(event, this.hotkey)) return;
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
    };
    this.handleViewportChange = () => {
      if (!this.isOpen || this.renderFrame) return;
      this.renderFrame = window.requestAnimationFrame(() => {
        this.renderFrame = void 0;
        this.render();
      });
    };
    this.adapter = options.adapter ?? localAdapter();
    this.hotkey = options.hotkeys?.qa ?? "Shift+Q";
    this.view = new WebReviewKitView({
      options,
      getState: () => ({
        isOpen: this.isOpen,
        mode: this.mode,
        items: this.items,
        noteDraft: this.noteDraft,
        areaDraft: this.areaDraft,
        isSelectingArea: this.isSelectingArea,
        highlightedItemId: this.highlightedItemId
      }),
      getEnvironment: () => this.getEnvironment(),
      actions: {
        close: () => this.close(),
        render: () => this.render(),
        reload: () => this.reload(),
        restoreItem: (item) => this.restoreItem(item),
        removeItem: (itemId) => this.adapter.remove(itemId),
        setModeState: (mode) => this.setModeState(mode),
        clearDrafts: () => {
          this.noteDraft = void 0;
          this.areaDraft = void 0;
        },
        setNoteDraft: (draft) => {
          this.noteDraft = draft;
        },
        setAreaDraft: (draft) => {
          this.areaDraft = draft;
        },
        setSelectingArea: (isSelectingArea) => {
          this.isSelectingArea = isSelectingArea;
        },
        createItem: (input) => this.createItem(input),
        bindNoteDraftToPoint: (point, comment) => this.bindNoteDraftToPoint(point, comment),
        bindElementDraftToPoint: (point, comment) => this.bindElementDraftToPoint(point, comment),
        createAreaDraft: (selection) => this.createAreaDraft(selection)
      }
    });
  }
  mount() {
    if (this.root) return;
    const existing = document.getElementById(ROOT_ID);
    if (existing) existing.remove();
    this.root = document.createElement("div");
    this.root.id = ROOT_ID;
    this.root.style.display = "contents";
    this.shadow = this.root.attachShadow({ mode: "open" });
    document.body.appendChild(this.root);
    document.addEventListener("keydown", this.handleKeyDown, true);
    window.addEventListener("scroll", this.handleViewportChange, true);
    window.addEventListener("resize", this.handleViewportChange);
    this.render();
  }
  destroy() {
    this.view.clearDraftPreview();
    document.removeEventListener("keydown", this.handleKeyDown, true);
    window.removeEventListener("scroll", this.handleViewportChange, true);
    window.removeEventListener("resize", this.handleViewportChange);
    if (this.renderFrame) {
      window.cancelAnimationFrame(this.renderFrame);
      this.renderFrame = void 0;
    }
    this.root?.remove();
    this.root = void 0;
    this.shadow = void 0;
  }
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    void this.reload();
  }
  close() {
    this.isOpen = false;
    this.setModeState("idle");
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    this.isSelectingArea = false;
    this.render();
  }
  toggle() {
    if (this.isOpen) {
      this.close();
      return;
    }
    this.open();
  }
  setMode(mode) {
    if (!this.isOpen) {
      this.isOpen = true;
    }
    this.setModeState(this.mode === mode ? "idle" : mode);
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    this.render();
  }
  getMode() {
    return this.mode;
  }
  getItems() {
    return this.items;
  }
  highlightItem(itemId) {
    if (!itemId) {
      this.clearHighlightedItem();
      return;
    }
    if (!this.isOpen) {
      this.isOpen = true;
    }
    this.highlightedItemId = itemId;
    this.render();
  }
  setHiddenItemIds(itemIds) {
    this.hiddenItemIds = itemIds ? new Set(itemIds) : void 0;
    this.updateHiddenItemsStyle();
  }
  clearHighlightedItem() {
    if (!this.highlightedItemId) return;
    this.highlightedItemId = void 0;
    this.render();
  }
  createHiddenItemsStyleElement() {
    const style = document.createElement("style");
    style.dataset.dfwrHiddenItems = "true";
    style.textContent = this.getHiddenItemsCss();
    return style;
  }
  updateHiddenItemsStyle() {
    if (!this.shadow) return;
    let style = this.shadow.querySelector(
      'style[data-dfwr-hidden-items="true"]'
    );
    if (!style) {
      style = this.createHiddenItemsStyleElement();
      this.shadow.prepend(style);
      return;
    }
    style.textContent = this.getHiddenItemsCss();
  }
  getHiddenItemsCss() {
    if (!this.hiddenItemIds?.size) return "";
    return Array.from(this.hiddenItemIds).map(
      (itemId) => `[data-review-item-id="${cssEscape(itemId)}"] { display: none !important; }`
    ).join("\n");
  }
  setModeState(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.options.onModeChange?.(mode);
  }
  cancelMode() {
    if (this.mode === "idle" && !this.noteDraft && !this.areaDraft && !this.isSelectingArea) {
      return false;
    }
    this.setModeState("idle");
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    this.isSelectingArea = false;
    this.render();
    return true;
  }
  getEnvironment() {
    const target = typeof this.options.target === "function" ? this.options.target() : this.options.target;
    if (!target) {
      return {
        window,
        document,
        viewportRect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight
        },
        overlayRect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    }
    try {
      const rect = target.getViewportRect?.() ?? {
        left: 0,
        top: 0,
        width: target.window.innerWidth,
        height: target.window.innerHeight
      };
      const overlayRect = target.getOverlayRect?.() ?? rect;
      return {
        window: target.window,
        document: target.document,
        viewportRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        },
        overlayRect: {
          left: overlayRect.left,
          top: overlayRect.top,
          width: overlayRect.width,
          height: overlayRect.height
        }
      };
    } catch {
      return void 0;
    }
  }
  async reload() {
    const environment = this.getEnvironment();
    if (!environment) return this.items;
    this.items = await this.adapter.list({
      projectId: this.options.projectId,
      routeKey: getRouteKey(environment)
    });
    this.options.onItemsChange?.(this.items);
    if (this.isOpen) {
      this.render();
    }
    return this.items;
  }
  render() {
    if (!this.shadow) return;
    this.view.render(this.shadow, this.createHiddenItemsStyleElement());
  }
  async bindNoteDraftToPoint(point, comment) {
    const environment = this.getEnvironment();
    if (!environment) return;
    const viewport = getViewportSize(environment);
    const nextPoint = clampPoint(point, environment);
    const draft = await this.withOverlayHidden(() => {
      const selection = getPointSelection(nextPoint);
      const anchor = getDomAnchor(
        selection,
        this.options.anchors?.attribute,
        environment
      );
      const marker = {
        viewport: roundPoint(nextPoint),
        relative: anchor ? getRelativePoint(nextPoint, anchor, environment) : void 0
      };
      return {
        viewport,
        anchor,
        marker,
        comment
      };
    });
    this.noteDraft = draft;
    this.render();
  }
  async bindElementDraftToPoint(point, comment) {
    const environment = this.getEnvironment();
    if (!environment) return;
    const viewport = getViewportSize(environment);
    const nextPoint = clampPoint(point, environment);
    const draft = await this.withOverlayHidden(() => {
      const anchor = getDomAnchorFromPoint(
        nextPoint,
        this.options.anchors?.attribute,
        environment
      );
      const elementSelection = anchor ? getElementViewportSelection(anchor, environment) : void 0;
      const selection = elementSelection ?? getPointSelection(nextPoint);
      const markerPoint = elementSelection ? { x: selection.left, y: selection.top } : getSelectionCenter(selection);
      const reviewSelection = elementSelection ? {
        viewport: toPublicSelection(elementSelection),
        relative: getRelativeSelection(
          elementSelection,
          anchor,
          environment
        )
      } : void 0;
      const marker = {
        viewport: roundPoint(markerPoint),
        relative: anchor ? getRelativePoint(markerPoint, anchor, environment) : void 0
      };
      return {
        viewport,
        anchor,
        marker,
        selection: reviewSelection,
        comment
      };
    });
    this.noteDraft = draft;
    this.render();
  }
  async createAreaDraft(selection) {
    const environment = this.getEnvironment();
    if (!environment) return;
    const viewport = getViewportSize(environment);
    this.areaDraft = await this.withOverlayHidden(() => {
      const marker = createSelectionCenterMarker(
        selection,
        void 0,
        environment
      );
      const reviewSelection = {
        viewport: toPublicSelection(selection)
      };
      return {
        viewport,
        marker,
        selection: reviewSelection
      };
    });
    this.isSelectingArea = false;
    this.setModeState("area");
    this.render();
  }
  async withOverlayHidden(callback) {
    if (!this.root) return callback();
    const previousDisplay = this.root.style.display;
    this.root.style.display = "none";
    try {
      return await callback();
    } finally {
      this.root.style.display = previousDisplay;
    }
  }
  async createItem(input) {
    const environment = this.getEnvironment();
    if (!environment) return;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const routeKey = getRouteKey(environment);
    const viewport = input.viewport ?? getViewportSize(environment);
    const createdBy = this.options.userId?.trim();
    const item = {
      id: createId(),
      projectId: this.options.projectId,
      routeKey,
      pageUrl: getPageUrl(environment),
      originalUrl: getOriginalUrl(environment),
      normalizedPath: routeKey,
      scope: input.scope ?? getReviewViewportScope(viewport, this.options.viewports?.presets),
      kind: input.kind,
      title: input.comment.split("\n")[0]?.slice(0, 80),
      comment: input.comment,
      createdBy: createdBy || void 0,
      status: "todo",
      viewport,
      devicePixelRatio: environment.window.devicePixelRatio || 1,
      scroll: {
        x: environment.window.scrollX,
        y: environment.window.scrollY
      },
      anchor: input.anchor,
      marker: input.marker,
      selection: input.selection,
      createdAt: now,
      updatedAt: now
    };
    const createdItem = await this.adapter.create(item);
    this.setModeState("idle");
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    this.highlightItem(createdItem.id);
    await this.reload();
    await this.options.onCreateItem?.(createdItem);
  }
  async restoreItem(item) {
    this.setModeState("idle");
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    if (this.options.onRestoreItem) {
      await this.options.onRestoreItem(item);
      return;
    }
    const environment = this.getEnvironment();
    if (!environment) return;
    const scroll = item.scroll;
    if (scroll) {
      runWithAutoScrollBehavior(environment.document, () => {
        setDocumentScrollInstantly(environment, scroll);
      });
      await waitForNextFrame(environment);
    }
    this.highlightItem(item.id);
    this.render();
  }
};
function createNoopController() {
  return {
    open() {
    },
    close() {
    },
    toggle() {
    },
    setMode() {
    },
    getMode() {
      return "idle";
    },
    highlightItem() {
    },
    setHiddenItemIds() {
    },
    async reload() {
      return [];
    },
    getItems() {
      return [];
    },
    destroy() {
    }
  };
}

export {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  normalizeReviewItemStatus,
  localAdapter,
  DEFAULT_REVIEW_VIEWPORTS,
  findReviewViewportPreset,
  getReviewViewportScope,
  getReviewItemScope,
  getReviewItemScopeLabel,
  getNumberedReviewItems,
  createWebReviewKit
};
//# sourceMappingURL=chunk-VDHDUYVD.js.map