import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  createWebReviewKit,
  getNumberedReviewItems,
  localAdapter,
  normalizeReviewItemStatus
} from "./chunk-4MH32ISX.js";

// src/react-shell.tsx
import React, {
  useCallback,
  useEffect,
  useMemo as useMemo2,
  useRef,
  useState
} from "react";

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
import { forwardRef as forwardRef2, createElement as createElement3 } from "react";

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs
var toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/Icon.mjs
import { forwardRef, createElement as createElement2 } from "react";

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/defaultAttributes.mjs
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs
var hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/context.mjs
import { createContext, useContext, useMemo, createElement } from "react";
var LucideContext = createContext({});
var useLucideContext = () => useContext(LucideContext);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/Icon.mjs
var Icon = forwardRef(
  ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = "currentColor",
      className: contextClass = ""
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
    return createElement2(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size ?? contextSize ?? defaultAttributes.width,
        height: size ?? contextSize ?? defaultAttributes.height,
        stroke: color ?? contextColor,
        strokeWidth: calculatedStrokeWidth,
        className: mergeClasses("lucide", contextClass, className),
        ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement2(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
var createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef2(
    ({ className, ...props }, ref) => createElement3(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/circle-question-mark.mjs
var __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
var CircleQuestionMark = createLucideIcon("circle-question-mark", __iconNode);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/copy.mjs
var __iconNode2 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
var Copy = createLucideIcon("copy", __iconNode2);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/eye-off.mjs
var __iconNode3 = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
var EyeOff = createLucideIcon("eye-off", __iconNode3);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/eye.mjs
var __iconNode4 = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Eye = createLucideIcon("eye", __iconNode4);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/grip-vertical.mjs
var __iconNode5 = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
var GripVertical = createLucideIcon("grip-vertical", __iconNode5);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/image.mjs
var __iconNode6 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
var Image = createLucideIcon("image", __iconNode6);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/layout-grid.mjs
var __iconNode7 = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
var LayoutGrid = createLucideIcon("layout-grid", __iconNode7);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/list-filter.mjs
var __iconNode8 = [
  ["path", { d: "M2 5h20", key: "1fs1ex" }],
  ["path", { d: "M6 12h12", key: "8npq4p" }],
  ["path", { d: "M9 19h6", key: "456am0" }]
];
var ListFilter = createLucideIcon("list-filter", __iconNode8);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/map.mjs
var __iconNode9 = [
  [
    "path",
    {
      d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
      key: "169xi5"
    }
  ],
  ["path", { d: "M15 5.764v15", key: "1pn4in" }],
  ["path", { d: "M9 3.236v15", key: "1uimfh" }]
];
var Map2 = createLucideIcon("map", __iconNode9);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/maximize-2.mjs
var __iconNode10 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
var Maximize2 = createLucideIcon("maximize-2", __iconNode10);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/monitor.mjs
var __iconNode11 = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
var Monitor = createLucideIcon("monitor", __iconNode11);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/rectangle-horizontal.mjs
var __iconNode12 = [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }]
];
var RectangleHorizontal = createLucideIcon("rectangle-horizontal", __iconNode12);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/ruler.mjs
var __iconNode13 = [
  [
    "path",
    {
      d: "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",
      key: "icamh8"
    }
  ],
  ["path", { d: "m14.5 12.5 2-2", key: "inckbg" }],
  ["path", { d: "m11.5 9.5 2-2", key: "fmmyf7" }],
  ["path", { d: "m8.5 6.5 2-2", key: "vc6u1g" }],
  ["path", { d: "m17.5 15.5 2-2", key: "wo5hmg" }]
];
var Ruler = createLucideIcon("ruler", __iconNode13);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/scan.mjs
var __iconNode14 = [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }]
];
var Scan = createLucideIcon("scan", __iconNode14);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/settings.mjs
var __iconNode15 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Settings = createLucideIcon("settings", __iconNode15);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/smartphone.mjs
var __iconNode16 = [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
];
var Smartphone = createLucideIcon("smartphone", __iconNode16);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/square-mouse-pointer.mjs
var __iconNode17 = [
  [
    "path",
    {
      d: "M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z",
      key: "xwnzip"
    }
  ],
  ["path", { d: "M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6", key: "14rsvq" }]
];
var SquareMousePointer = createLucideIcon("square-mouse-pointer", __iconNode17);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/sticky-note.mjs
var __iconNode18 = [
  [
    "path",
    {
      d: "M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z",
      key: "1dfntj"
    }
  ],
  ["path", { d: "M15 3v5a1 1 0 0 0 1 1h5", key: "6s6qgf" }]
];
var StickyNote = createLucideIcon("sticky-note", __iconNode18);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/x.mjs
var __iconNode19 = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
var X = createLucideIcon("x", __iconNode19);

// src/react-shell.tsx
import { createRoot } from "react-dom/client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var REVIEW_QA_FILTERS = [
  { key: "all", label: "All" },
  { key: "mobile", label: "Mobile", scope: "mobile" },
  { key: "tablet", label: "Tablet", scope: "tablet" },
  { key: "desktop", label: "Desktop", scope: "desktop" },
  { key: "wide", label: "Wide", scope: "wide" },
  { key: "dom", label: "Element", scope: "dom" }
];
var DEFAULT_REVIEW_VIEWPORT_PRESETS = [
  { label: "Mobile", width: 390, height: 720, kind: "mobile" },
  { label: "Tablet", width: 768, height: 1024, kind: "tablet" },
  { label: "Desktop", width: 1440, height: 900, kind: "desktop" },
  { label: "Wide", width: 1980, height: 1080, kind: "wide" }
];
var DEFAULT_REVIEW_PATH_PREFIX = "/review";
var REVIEW_SHELL_STYLE_ID = "df-review-shell-style";
var escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var normalizePageHref = (value) => {
  const href = value || "/";
  return href.startsWith("/") ? href : `/${href}`;
};
var sortReviewPages = (a, b) => {
  if (a.href === "/") return -1;
  if (b.href === "/") return 1;
  return a.href.localeCompare(b.href);
};
var createReviewPagesFromGlob = (entries, options = {}) => {
  const root = options.root ?? "/page";
  const rootPattern = root ? new RegExp(`^${escapeRegExp(root)}`) : null;
  return Object.keys(entries).map((key) => {
    const withoutRoot = rootPattern ? key.replace(rootPattern, "") : key;
    const href = withoutRoot.replace(/index\.(tsx|ts|jsx|js)$/, "");
    return normalizePageHref(href === "" ? "/" : href);
  }).filter((href) => !options.exclude?.(href)).sort((a, b) => sortReviewPages({ href: a }, { href: b })).map((href) => ({ href }));
};
var getStorageKey = (projectId) => `df-web-review-kit:${projectId}:review-items`;
var normalizeReviewPathPrefix = (value) => {
  const raw = value.trim() || DEFAULT_REVIEW_PATH_PREFIX;
  const prefix = raw.startsWith("/") ? raw : `/${raw}`;
  return prefix.length > 1 && prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
};
var normalizeTarget = (value, reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  const raw = value.trim() || "/";
  const [path] = raw.split(/[?#]/);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const reviewPrefix = normalizeReviewPathPrefix(reviewPathPrefix);
  return normalized === reviewPrefix || normalized.startsWith(`${reviewPrefix}/`) ? "/" : normalized;
};
var getInitialTarget = (reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  if (typeof window === "undefined") return "/";
  const target = new URLSearchParams(window.location.search).get("target");
  return target ? normalizeTarget(target, reviewPathPrefix) : "/";
};
var getFallbackPreset = (presets) => presets[0] ?? DEFAULT_REVIEW_VIEWPORT_PRESETS[0];
var getViewportPresetDistance = (preset, width, height) => Math.abs(preset.width - width) + Math.abs(preset.height - height);
var findViewportPreset = (presets, width, height) => {
  const fallback = getFallbackPreset(presets);
  const exact = presets.find(
    (preset) => preset.width === width && preset.height === height
  );
  if (exact) return exact;
  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance(closest, width, height);
    const presetDistance = getViewportPresetDistance(preset, width, height);
    return presetDistance < closestDistance ? preset : closest;
  }, fallback);
};
var getInitialSize = (presets) => {
  if (typeof window === "undefined") return getFallbackPreset(presets);
  const params = new URLSearchParams(window.location.search);
  const width = Number(params.get("w"));
  const height = Number(params.get("h"));
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return findViewportPreset(presets, width, height);
  }
  return getFallbackPreset(presets);
};
var buildTargetSrc = (target) => {
  const url = new URL(target || "/", window.location.origin);
  url.searchParams.set("__dfwr_target", "1");
  return `${url.pathname}${url.search}${url.hash}`;
};
var updateShellUrl = (target, size) => {
  const url = new URL(window.location.href);
  url.searchParams.set("target", target);
  url.searchParams.set("w", String(size.width));
  url.searchParams.set("h", String(size.height));
  url.searchParams.delete("item");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
};
var updateShellUrlForItem = (target, size, itemId) => {
  const url = new URL(window.location.href);
  url.searchParams.set("target", target);
  url.searchParams.set("w", String(size.width));
  url.searchParams.set("h", String(size.height));
  url.searchParams.set("item", itemId);
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
};
var getInitialItemId = () => {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("item");
};
var getItemTarget = (item, reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  if (item.routeKey) return normalizeTarget(item.routeKey, reviewPathPrefix);
  if (item.normalizedPath) {
    return normalizeTarget(item.normalizedPath, reviewPathPrefix);
  }
  try {
    return normalizeTarget(new URL(item.pageUrl).pathname, reviewPathPrefix);
  } catch {
    return "/";
  }
};
var getStoredItem = (itemId, storageKey) => {
  try {
    const items = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(items)) return void 0;
    return items.find((item) => item?.id === itemId);
  } catch {
    return void 0;
  }
};
var queryReviewItemAnchorElement = (targetDocument, item) => {
  const anchor = item.anchor;
  if (!anchor || item.scope !== "dom") return void 0;
  const expectedRect = getReviewItemExpectedDocumentRect(item);
  const candidates = [anchor, ...anchor.candidates ?? []].filter(
    (candidate) => Boolean(candidate.selector)
  );
  const matches = [];
  candidates.forEach((candidate, index) => {
    try {
      targetDocument.querySelectorAll(candidate.selector).forEach((element) => {
        if (!isScrollableReviewAnchorElement(element)) return;
        matches.push({
          element,
          score: getReviewAnchorMatchScore(
            element,
            expectedRect,
            candidate.textFingerprint ?? anchor.textFingerprint,
            index
          )
        });
      });
    } catch {
      return;
    }
  });
  return matches.sort((a, b) => a.score - b.score)[0]?.element;
};
var getReviewItemExpectedDocumentRect = (item) => {
  const scroll = item.scroll ?? { x: 0, y: 0 };
  const selection = item.selection?.viewport;
  if (selection && typeof selection.x === "number" && typeof selection.y === "number" && typeof selection.width === "number" && typeof selection.height === "number") {
    return {
      left: scroll.x + selection.x,
      top: scroll.y + selection.y,
      width: selection.width,
      height: selection.height
    };
  }
  const marker = item.marker?.viewport;
  if (marker && typeof marker.x === "number" && typeof marker.y === "number") {
    return {
      left: scroll.x + marker.x,
      top: scroll.y + marker.y,
      width: 1,
      height: 1
    };
  }
  return void 0;
};
var getReviewAnchorMatchScore = (element, expectedRect, textFingerprint, candidateIndex) => {
  const rect = getElementDocumentRect(element);
  let score = candidateIndex * 25;
  if (expectedRect) {
    score += Math.abs(rect.top - expectedRect.top);
    score += Math.abs(rect.left - expectedRect.left) * 0.25;
    score += Math.abs(rect.width - expectedRect.width) * 0.1;
    score += Math.abs(rect.height - expectedRect.height) * 0.1;
  }
  if (textFingerprint) {
    score += (1 - getReviewTextFingerprintScore(textFingerprint, element)) * 100;
  }
  return score;
};
var getElementDocumentRect = (element) => {
  const rect = element.getBoundingClientRect();
  const view = element.ownerDocument.defaultView;
  return {
    left: rect.left + (view?.scrollX ?? 0),
    top: rect.top + (view?.scrollY ?? 0),
    width: rect.width,
    height: rect.height
  };
};
var getReviewTextFingerprintScore = (expected, element) => {
  const actual = element.textContent?.replace(/\s+/g, " ").trim();
  if (!actual) return 0.5;
  if (expected === actual) return 1;
  if (actual.includes(expected) || expected.includes(actual)) return 0.82;
  const expectedTokens = getReviewFingerprintTokens(expected);
  const actualTokens = new Set(getReviewFingerprintTokens(actual));
  if (expectedTokens.length === 0 || actualTokens.size === 0) return 0.5;
  const matches = expectedTokens.filter((token) => actualTokens.has(token));
  return Math.min(Math.max(matches.length / expectedTokens.length, 0.25), 0.76);
};
var getReviewFingerprintTokens = (value) => value.toLowerCase().split(/[\s/|,.:;()[\]{}"'`~!?<>]+/).map((token) => token.trim()).filter((token) => token.length > 1);
var isScrollableReviewAnchorElement = (element) => {
  const id = element.id.trim().toLowerCase();
  if (element === element.ownerDocument.body || element === element.ownerDocument.documentElement || ["app", "main", "page", "root", "__next", "__nuxt"].includes(id)) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const viewportHeight = element.ownerDocument.documentElement.clientHeight;
  const scrollHeight = element.ownerDocument.documentElement.scrollHeight;
  return !(scrollHeight > viewportHeight * 1.5 && rect.height > viewportHeight * 3);
};
var getRestoredSize = (item, presets) => findViewportPreset(
  presets,
  Math.max(
    240,
    Math.round(item.viewport?.width ?? getFallbackPreset(presets).width)
  ),
  Math.max(
    320,
    Math.round(item.viewport?.height ?? getFallbackPreset(presets).height)
  )
);
var getViewportPresetKind = (preset) => {
  if (preset.kind) return preset.kind;
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
var ViewportPresetIcon = ({
  preset
}) => {
  return /* @__PURE__ */ jsx(ReviewScopeIcon, { scope: getViewportPresetKind(preset) });
};
var ReviewScopeIcon = ({ scope }) => {
  if (scope === "mobile") return /* @__PURE__ */ jsx(Smartphone, { "aria-hidden": "true" });
  if (scope === "tablet") return /* @__PURE__ */ jsx(RectangleHorizontal, { "aria-hidden": "true" });
  if (scope === "wide") return /* @__PURE__ */ jsx(Maximize2, { "aria-hidden": "true" });
  if (scope === "dom") return /* @__PURE__ */ jsx(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ jsx(Monitor, { "aria-hidden": "true" });
};
var toReviewViewportPresets = (presets) => presets.map((preset) => ({
  label: preset.label,
  width: preset.width,
  height: preset.height,
  scope: getViewportPresetKind(preset)
}));
var getIsFigmaOverlayAvailable = (preset) => {
  const kind = getViewportPresetKind(preset);
  return kind === "mobile" || kind === "wide";
};
var getRulerFrameDistance = (frame, preset) => {
  const widthDistance = typeof frame.viewportWidth === "number" ? Math.abs(frame.viewportWidth - preset.width) : 0;
  const heightDistance = typeof frame.viewportHeight === "number" ? Math.abs(frame.viewportHeight - preset.height) : 0;
  return widthDistance + heightDistance;
};
var getReviewRulerFrame = (ruler, preset) => {
  if (ruler?.enabled === false || !ruler?.frames?.length) return void 0;
  const kind = getViewportPresetKind(preset);
  const scopeMatches = ruler.frames.filter((frame) => frame.scope === kind);
  if (scopeMatches.length > 0) {
    return scopeMatches.reduce(
      (closest, frame) => getRulerFrameDistance(frame, preset) < getRulerFrameDistance(closest, preset) ? frame : closest
    );
  }
  return ruler.frames.reduce(
    (closest, frame) => getRulerFrameDistance(frame, preset) < getRulerFrameDistance(closest, preset) ? frame : closest
  );
};
var getRulerPointFromRect = (clientX, clientY, rect) => {
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
  return {
    x: Math.round(x),
    y: Math.round(y)
  };
};
var getRulerMeasure = (start, end) => {
  if (!start || !end) return void 0;
  return {
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
};
var formatRulerNumber = (value) => Number.isInteger(value) ? String(value) : value.toFixed(1);
var FIGMA_OVERLAY_UNAVAILABLE_MESSAGE = "\uD53C\uADF8\uB9C8 \uC624\uBC84\uB808\uC774 \uB514\uBC84\uAE45\uC774 \uC548\uB418\uB294 \uD574\uC0C1\uB3C4";
var FIGMA_TOKEN_STORAGE_KEY = "figma-token";
var REVIEW_USER_ID_STORAGE_KEY = "user-id";
var REVIEW_THEME_STORAGE_KEY = "df-review-theme";
var DEFAULT_REVIEW_THEME = "dark";
var FIGMA_TOKEN_GUIDE_ID = "df-review-figma-token-guide";
var DEFAULT_INITIAL_REVIEW_PROMPT = "You are fixing QA issues collected with df-web-review-kit. Use the copied QA prompt as the source of truth for page, viewport, selector, coordinates, screenshot context, and user comment. Make the smallest code or CSS change that fixes the issue, preserve unrelated behavior, then verify the target viewport again.";
var REVIEW_THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" }
];
var normalizeReviewTheme = (value) => value === "light" || value === "system" || value === "dark" ? value : DEFAULT_REVIEW_THEME;
var getStoredFigmaToken = () => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(FIGMA_TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};
var writeStoredFigmaToken = (token) => {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(FIGMA_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(FIGMA_TOKEN_STORAGE_KEY);
    }
  } catch {
    return;
  }
};
var getStoredReviewUserId = () => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(REVIEW_USER_ID_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};
var writeStoredReviewUserId = (userId) => {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      window.localStorage.setItem(REVIEW_USER_ID_STORAGE_KEY, userId);
    } else {
      window.localStorage.removeItem(REVIEW_USER_ID_STORAGE_KEY);
    }
  } catch {
    return;
  }
};
var getStoredReviewTheme = () => {
  if (typeof window === "undefined") return DEFAULT_REVIEW_THEME;
  try {
    return normalizeReviewTheme(
      window.localStorage.getItem(REVIEW_THEME_STORAGE_KEY)
    );
  } catch {
    return DEFAULT_REVIEW_THEME;
  }
};
var writeStoredReviewTheme = (theme) => {
  if (typeof window === "undefined") return;
  try {
    if (theme === DEFAULT_REVIEW_THEME) {
      window.localStorage.removeItem(REVIEW_THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(REVIEW_THEME_STORAGE_KEY, theme);
    }
  } catch {
    return;
  }
};
var getSystemReviewTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};
var getItemTitle = (item) => item.title || item.comment.split("\n")[0] || item.kind;
var getReviewStatusLabel = (status) => REVIEW_WORKFLOW_STATUS_OPTIONS.find(
  (option) => option.value === normalizeReviewItemStatus(status)
)?.label ?? REVIEW_WORKFLOW_STATUS_OPTIONS[0].label;
var getTargetOverlayState = (targetDocument) => ({
  grid: Boolean(
    targetDocument?.body.classList.contains("is-help") || targetDocument?.querySelector(".helper.onShow")
  ),
  figma: Boolean(
    targetDocument?.querySelector(
      ".helper-figma-root, .helper-figma-loading-backdrop"
    )
  )
});
var formatItemMeta = (item) => {
  const parts = [
    `${Math.round(item.viewport?.width ?? 0)}x${Math.round(item.viewport?.height ?? 0)}`
  ];
  if (item.scroll) {
    parts.push(
      `scroll ${Math.round(item.scroll.x)},${Math.round(item.scroll.y)}`
    );
  }
  return parts.join(" / ");
};
var formatPromptViewport = (item) => `${Math.round(item.viewport?.width ?? 0)}x${Math.round(
  item.viewport?.height ?? 0
)}`;
var formatPromptPoint = (point) => point ? `x=${Math.round(point.x)}, y=${Math.round(point.y)}` : "(none)";
var formatPromptSelection = (selection) => {
  if (!selection) return "(none)";
  const x = "x" in selection ? selection.x : selection.left;
  const y = "y" in selection ? selection.y : selection.top;
  return `x=${Math.round(x ?? 0)}, y=${Math.round(y ?? 0)}, width=${Math.round(
    selection.width
  )}, height=${Math.round(selection.height)}`;
};
var decodePromptHtmlEntities = (value) => value.replace(
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
var getPromptAnchorCandidates = (item) => {
  const anchor = item.anchor;
  if (!anchor) return [];
  const seen = /* @__PURE__ */ new Set();
  return [anchor, ...anchor.candidates ?? []].filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
var formatPromptSourceHint = (item) => {
  const source = item.anchor?.source;
  if (!source) return "(none)";
  return [
    `Component: ${source.component ?? "(unknown)"}`,
    `File: ${source.file ?? "(unknown)"}`,
    `Section index: ${source.sectionIndex ?? "(unknown)"}`,
    `Section id: ${source.sectionId ?? "(none)"}`
  ].join("\n");
};
var buildReviewItemPrompt = (numberedItem, reviewPathPrefix) => {
  const { item } = numberedItem;
  const anchor = item.anchor;
  const candidates = getPromptAnchorCandidates(item);
  const candidateLines = candidates.length > 0 ? candidates.map((candidate, index) => {
    const confidence = typeof candidate.confidence === "number" ? `, confidence=${Math.round(candidate.confidence * 100)}%` : "";
    const fingerprint = candidate.textFingerprint ? `, text="${candidate.textFingerprint}"` : "";
    return `${index + 1}. ${candidate.selector} (${candidate.strategy}${confidence}${fingerprint})`;
  }).join("\n") : "(none)";
  return [
    "Fix this df-web-review-kit QA issue.",
    "",
    `Page: ${getItemTarget(item, reviewPathPrefix)}`,
    `URL: ${item.originalUrl ?? item.pageUrl}`,
    `QA item: ${numberedItem.displayLabel}`,
    `Status: ${getReviewStatusLabel(item.status)}`,
    `Viewport: ${numberedItem.label} ${formatPromptViewport(item)}`,
    `Scroll: ${formatPromptPoint(item.scroll)}`,
    "",
    "Target:",
    `Primary selector: ${anchor?.selector ?? "(missing)"}`,
    `Primary strategy: ${anchor?.strategy ?? "(missing)"}`,
    `Text fingerprint: ${anchor?.textFingerprint ?? "(none)"}`,
    "Selector candidates:",
    candidateLines,
    "",
    "Source hint:",
    formatPromptSourceHint(item),
    "",
    `Marker: ${formatPromptPoint(item.marker?.viewport)}`,
    `Marker relative: ${formatPromptPoint(item.marker?.relative)}`,
    `Selection: ${formatPromptSelection(item.selection?.viewport)}`,
    `Selection relative: ${formatPromptSelection(item.selection?.relative)}`,
    "",
    "Element HTML snippet:",
    "```html",
    anchor?.htmlSnippet ? decodePromptHtmlEntities(anchor.htmlSnippet) : "(not captured)",
    "```",
    "",
    "Issue:",
    item.comment,
    "",
    "Request:",
    "Find the target element with the selector candidates above and apply the smallest UI/CSS/code change that fixes this QA issue. If the selector is missing because CSR or hydration has not finished, wait for the page to load and use the Source hint first. Preserve unrelated layout and behavior."
  ].join("\n");
};
var getPromptLengthLabel = (value) => {
  const length = value.length;
  if (length <= 2e3) return `${length} chars / Discord 2,000 OK`;
  if (length <= 4e3) return `${length} chars / Nitro 4,000 OK`;
  return `${length} chars / attach as file`;
};
var formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(void 0, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};
var ReviewShell = ({
  projectId,
  pages,
  storageKey = getStorageKey(projectId),
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ruler,
  initialPrompt = DEFAULT_INITIAL_REVIEW_PROMPT,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX
}) => {
  const viewportPresets = presets.length > 0 ? presets : DEFAULT_REVIEW_VIEWPORT_PRESETS;
  const reviewViewportPresets = useMemo2(
    () => toReviewViewportPresets(viewportPresets),
    [viewportPresets]
  );
  const adapter = useMemo2(
    () => localAdapter({
      storageKey
    }),
    [storageKey]
  );
  const iframeRef = useRef(null);
  const frameScrollRef = useRef(null);
  const rulerOverlayRef = useRef(null);
  const rulerDragRectRef = useRef(null);
  const isRulerDraggingRef = useRef(false);
  const controllerRef = useRef(null);
  const cleanupTargetRef = useRef(null);
  const pendingRestoreRef = useRef(null);
  const pendingInitialItemIdRef = useRef(getInitialItemId());
  const selectedItemIdRef = useRef(getInitialItemId());
  const [target, setTarget] = useState(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [draftTarget, setDraftTarget] = useState(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [activeRoute, setActiveRoute] = useState(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [size, setSize] = useState(
    () => getInitialSize(viewportPresets)
  );
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("idle");
  const [targetOverlayState, setTargetOverlayState] = useState({
    grid: false,
    figma: false
  });
  const [selectedItemId, setSelectedItemId] = useState(getInitialItemId());
  const [isListVisible, setIsListVisible] = useState(true);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isFigmaSettingsOpen, setIsFigmaSettingsOpen] = useState(false);
  const [figmaTokenDraft, setFigmaTokenDraft] = useState(getStoredFigmaToken);
  const [reviewUserIdDraft, setReviewUserIdDraft] = useState(
    getStoredReviewUserId
  );
  const [reviewTheme, setReviewTheme] = useState(getStoredReviewTheme);
  const [reviewThemeDraft, setReviewThemeDraft] = useState(getStoredReviewTheme);
  const [systemReviewTheme, setSystemReviewTheme] = useState(getSystemReviewTheme);
  const [figmaSettingsStatus, setFigmaSettingsStatus] = useState("");
  const [isFigmaTokenVisible, setIsFigmaTokenVisible] = useState(false);
  const [isFigmaTokenGuideOpen, setIsFigmaTokenGuideOpen] = useState(false);
  const [qaFilter, setQaFilter] = useState("all");
  const [isRulerVisible, setIsRulerVisible] = useState(false);
  const [rulerStart, setRulerStart] = useState(null);
  const [rulerPoint, setRulerPoint] = useState(null);
  const [isRulerDragging, setIsRulerDragging] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy URL");
  const [promptItemId, setPromptItemId] = useState(null);
  const [promptTab, setPromptTab] = useState("item");
  const [copiedPromptKey, setCopiedPromptKey] = useState(null);
  const targetRef = useRef(target);
  const sizeRef = useRef(size);
  const effectiveReviewTheme = reviewTheme === "system" ? systemReviewTheme : reviewTheme;
  const isFigmaOverlayAvailable = getIsFigmaOverlayAvailable(size);
  const activeRulerFrame = useMemo2(
    () => getReviewRulerFrame(ruler, size),
    [ruler, size]
  );
  const isRulerAvailable = Boolean(activeRulerFrame);
  const rulerUnit = ruler?.unit ?? "px";
  const rulerScaleX = activeRulerFrame ? size.width / activeRulerFrame.designWidth : 1;
  const rulerScaleY = activeRulerFrame?.designHeight && activeRulerFrame.designHeight > 0 ? size.height / activeRulerFrame.designHeight : rulerScaleX;
  const rulerMeasure = useMemo2(
    () => getRulerMeasure(rulerStart, rulerPoint),
    [rulerPoint, rulerStart]
  );
  const rulerMeasureLabel = useMemo2(() => {
    if (!rulerMeasure) return "";
    const designWidth = formatRulerNumber(rulerMeasure.width / rulerScaleX);
    const designHeight = formatRulerNumber(rulerMeasure.height / rulerScaleY);
    return `Figma ${designWidth}x${designHeight}${rulerUnit}`;
  }, [rulerMeasure, rulerScaleX, rulerScaleY, rulerUnit]);
  const targetSrc = useMemo2(() => buildTargetSrc(target), [target]);
  const activeItems = useMemo2(
    () => items.filter((item) => getItemTarget(item, reviewPathPrefix) === activeRoute).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [activeRoute, items, reviewPathPrefix]
  );
  const numberedActiveItems = useMemo2(
    () => getNumberedReviewItems(activeItems, reviewViewportPresets),
    [activeItems, reviewViewportPresets]
  );
  const filteredNumberedActiveItems = useMemo2(
    () => qaFilter === "all" ? numberedActiveItems : numberedActiveItems.filter(
      (numberedItem) => numberedItem.scope === qaFilter
    ),
    [numberedActiveItems, qaFilter]
  );
  const qaFilterCounts = useMemo2(() => {
    const counts = /* @__PURE__ */ new Map();
    counts.set("all", numberedActiveItems.length);
    numberedActiveItems.forEach((numberedItem) => {
      counts.set(numberedItem.scope, (counts.get(numberedItem.scope) ?? 0) + 1);
    });
    return counts;
  }, [numberedActiveItems]);
  const pageQaCounts = useMemo2(() => {
    const counts = /* @__PURE__ */ new Map();
    items.forEach((item) => {
      const pageTarget = normalizeTarget(
        getItemTarget(item, reviewPathPrefix),
        reviewPathPrefix
      );
      counts.set(pageTarget, (counts.get(pageTarget) ?? 0) + 1);
    });
    return counts;
  }, [items, reviewPathPrefix]);
  const promptDialogNumberedItem = useMemo2(
    () => promptItemId ? numberedActiveItems.find(
      (numberedItem) => numberedItem.item.id === promptItemId
    ) : void 0,
    [numberedActiveItems, promptItemId]
  );
  const initialPromptText = initialPrompt.trim();
  const promptDialogItemPrompt = promptDialogNumberedItem ? buildReviewItemPrompt(promptDialogNumberedItem, reviewPathPrefix) : "";
  const promptDialogItemCopyKey = promptDialogNumberedItem ? `dialog:${promptDialogNumberedItem.item.id}` : "dialog:item";
  const promptDialogActiveText = promptTab === "initial" ? initialPromptText : promptDialogItemPrompt;
  const promptDialogActiveLabel = promptTab === "initial" ? "Initial prompt" : "This QA prompt";
  const promptDialogActiveCopyKey = promptTab === "initial" ? "initial" : promptDialogItemCopyKey;
  const refreshItems = useCallback(async () => {
    const nextItems = await adapter.list({
      projectId
    });
    setItems(nextItems);
    return nextItems;
  }, [adapter, projectId]);
  const refreshReviewData = useCallback(async () => {
    await controllerRef.current?.reload();
    await refreshItems();
  }, [refreshItems]);
  const clearSelectedItem = useCallback(() => {
    selectedItemIdRef.current = null;
    setSelectedItemId(null);
  }, []);
  const destroyReviewKit = useCallback(() => {
    cleanupTargetRef.current?.();
    cleanupTargetRef.current = null;
    controllerRef.current?.destroy();
    controllerRef.current = null;
  }, []);
  const syncTargetViewport = useCallback(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);
  const refreshTargetOverlayState = useCallback(() => {
    setTargetOverlayState(
      getTargetOverlayState(iframeRef.current?.contentDocument ?? void 0)
    );
  }, []);
  const dispatchTargetOverlayHotkey = useCallback(
    (overlay) => {
      const targetWindow = iframeRef.current?.contentWindow;
      if (!targetWindow) return false;
      const code = overlay === "grid" ? "KeyG" : "KeyF";
      targetWindow.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          code,
          key: code.replace("Key", "").toLowerCase(),
          shiftKey: true
        })
      );
      window.setTimeout(refreshTargetOverlayState, 80);
      return true;
    },
    [refreshTargetOverlayState]
  );
  const toggleTargetOverlay = useCallback(
    (overlay) => {
      if (overlay === "figma" && !isFigmaOverlayAvailable) {
        refreshTargetOverlayState();
        return;
      }
      dispatchTargetOverlayHotkey(overlay);
    },
    [
      dispatchTargetOverlayHotkey,
      isFigmaOverlayAvailable,
      refreshTargetOverlayState
    ]
  );
  const syncShellTarget = useCallback(
    (nextTarget) => {
      const normalizedTarget = normalizeTarget(nextTarget, reviewPathPrefix);
      if (normalizedTarget !== targetRef.current) {
        clearSelectedItem();
        targetRef.current = normalizedTarget;
        setTarget(normalizedTarget);
        setDraftTarget(normalizedTarget);
        setActiveRoute(normalizedTarget);
      }
      if (selectedItemIdRef.current) {
        updateShellUrlForItem(
          normalizedTarget,
          sizeRef.current,
          selectedItemIdRef.current
        );
      } else {
        updateShellUrl(normalizedTarget, sizeRef.current);
      }
    },
    [clearSelectedItem, reviewPathPrefix]
  );
  const applyItemScroll = useCallback(
    (item) => {
      const scrollToItem = () => {
        const targetWindow = iframeRef.current?.contentWindow;
        const targetDocument = iframeRef.current?.contentDocument;
        if (!targetWindow) return;
        const anchorElement = targetDocument ? queryReviewItemAnchorElement(targetDocument, item) : void 0;
        if (anchorElement) {
          anchorElement.scrollIntoView({
            block: "center",
            inline: "center"
          });
        } else {
          targetWindow.scrollTo(item.scroll?.x ?? 0, item.scroll?.y ?? 0);
        }
        syncTargetViewport();
        controllerRef.current?.highlightItem(item.id);
      };
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollToItem);
      });
      window.setTimeout(scrollToItem, 120);
      window.setTimeout(scrollToItem, 360);
      window.setTimeout(scrollToItem, 720);
    },
    [syncTargetViewport]
  );
  const applyPendingRestore = useCallback(() => {
    const item = pendingRestoreRef.current;
    if (!item) return;
    applyItemScroll(item);
    pendingRestoreRef.current = null;
  }, [applyItemScroll]);
  const cancelReviewMode = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || controller.getMode() === "idle") return false;
    controller.setMode("idle");
    setMode(controller.getMode());
    return true;
  }, []);
  const clearRulerMeasure = useCallback(() => {
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setRulerStart(null);
    setRulerPoint(null);
    setIsRulerDragging(false);
  }, []);
  const closeRuler = useCallback(() => {
    if (!isRulerVisible) return false;
    setIsRulerVisible(false);
    clearRulerMeasure();
    return true;
  }, [clearRulerMeasure, isRulerVisible]);
  const toggleRuler = useCallback(() => {
    if (!isRulerAvailable) return;
    cancelReviewMode();
    setIsSitemapOpen(false);
    setIsFigmaSettingsOpen(false);
    setPromptItemId(null);
    clearRulerMeasure();
    setIsRulerVisible((current) => !current);
  }, [cancelReviewMode, clearRulerMeasure, isRulerAvailable]);
  const finishRulerDrag = useCallback((point) => {
    if (point) {
      setRulerPoint(point);
    }
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setIsRulerDragging(false);
  }, []);
  const startRulerDrag = useCallback(
    (clientX, clientY, rect) => {
      const point = getRulerPointFromRect(clientX, clientY, rect);
      rulerDragRectRef.current = rect;
      isRulerDraggingRef.current = true;
      setRulerStart(point);
      setRulerPoint(point);
      setIsRulerDragging(true);
    },
    []
  );
  const reloadTargetFrame = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      return;
    }
  }, []);
  const openFigmaSettings = useCallback(() => {
    cancelReviewMode();
    setIsSitemapOpen(false);
    setPromptItemId(null);
    setFigmaTokenDraft(getStoredFigmaToken());
    setReviewUserIdDraft(getStoredReviewUserId());
    setReviewThemeDraft(reviewTheme);
    setFigmaSettingsStatus("");
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
    setIsFigmaSettingsOpen(true);
  }, [cancelReviewMode, reviewTheme]);
  const closeFigmaSettings = useCallback(() => {
    setIsFigmaSettingsOpen(false);
    setFigmaSettingsStatus("");
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
  }, []);
  const saveReviewSettings = useCallback(
    (token, userId, theme) => {
      const nextToken = token.trim();
      const nextUserId = userId.trim();
      const nextTheme = normalizeReviewTheme(theme);
      const shouldReload = nextToken !== getStoredFigmaToken() || nextUserId !== getStoredReviewUserId();
      writeStoredFigmaToken(nextToken);
      writeStoredReviewUserId(nextUserId);
      writeStoredReviewTheme(nextTheme);
      setFigmaTokenDraft(nextToken);
      setReviewUserIdDraft(nextUserId);
      setReviewTheme(nextTheme);
      setReviewThemeDraft(nextTheme);
      setFigmaSettingsStatus(
        nextToken || nextUserId || nextTheme !== DEFAULT_REVIEW_THEME ? "Saved" : "Cleared"
      );
      if (shouldReload) {
        reloadTargetFrame();
      }
    },
    [reloadTargetFrame]
  );
  const restoreReviewItem = useCallback(
    (item) => {
      const nextTarget = getItemTarget(item, reviewPathPrefix);
      const nextSize = getRestoredSize(item, viewportPresets);
      pendingRestoreRef.current = item;
      selectedItemIdRef.current = item.id;
      setSelectedItemId(item.id);
      setActiveRoute(nextTarget);
      setDraftTarget(nextTarget);
      setSize(nextSize);
      updateShellUrlForItem(nextTarget, nextSize, item.id);
      if (targetRef.current !== nextTarget) {
        setTarget(nextTarget);
        return;
      }
      applyPendingRestore();
    },
    [applyPendingRestore, viewportPresets, reviewPathPrefix]
  );
  const restoreInitialItem = useCallback(() => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;
    pendingInitialItemIdRef.current = null;
    const item = getStoredItem(itemId, storageKey);
    if (item) {
      restoreReviewItem(item);
    }
  }, [restoreReviewItem, storageKey]);
  const initReviewKit = useCallback(() => {
    destroyReviewKit();
    const iframe = iframeRef.current;
    const targetWindow = iframe?.contentWindow;
    const targetDocument = iframe?.contentDocument;
    if (!iframe || !targetWindow || !targetDocument) return;
    const syncRouteFromFrame = () => {
      syncShellTarget(targetWindow.location.pathname);
    };
    const handleClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const targetElement = event.target;
      if (!targetElement || !("closest" in targetElement)) return;
      const link = targetElement.closest("a[href]");
      const href = link?.getAttribute("href");
      const linkTarget = link?.getAttribute("target");
      if (!href || linkTarget && linkTarget !== "_self") return;
      const url = new URL(href, targetWindow.location.href);
      if (url.origin !== targetWindow.location.origin) return;
      const nextTarget = normalizeTarget(url.pathname, reviewPathPrefix);
      if (nextTarget === targetRef.current) return;
      event.preventDefault();
      syncShellTarget(nextTarget);
    };
    const handleFrameKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (!cancelReviewMode() && !closeRuler()) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const history = targetWindow.history;
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);
    history.pushState = (...args) => {
      originalPushState(...args);
      syncRouteFromFrame();
    };
    history.replaceState = (...args) => {
      originalReplaceState(...args);
      syncRouteFromFrame();
    };
    syncRouteFromFrame();
    targetWindow.addEventListener("popstate", syncRouteFromFrame);
    targetWindow.addEventListener("hashchange", syncRouteFromFrame);
    targetWindow.addEventListener("keydown", handleFrameKeyDown, true);
    targetDocument.addEventListener("click", handleClick, true);
    targetWindow.addEventListener("scroll", syncTargetViewport, true);
    targetWindow.addEventListener("resize", syncTargetViewport);
    cleanupTargetRef.current = () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      targetWindow.removeEventListener("popstate", syncRouteFromFrame);
      targetWindow.removeEventListener("hashchange", syncRouteFromFrame);
      targetWindow.removeEventListener("keydown", handleFrameKeyDown, true);
      targetDocument.removeEventListener("click", handleClick, true);
      targetWindow.removeEventListener("scroll", syncTargetViewport, true);
      targetWindow.removeEventListener("resize", syncTargetViewport);
    };
    controllerRef.current = createWebReviewKit({
      projectId,
      adapter,
      target: () => {
        const frame = iframeRef.current;
        const frameWindow = frame?.contentWindow;
        const frameDocument = frame?.contentDocument;
        if (!frame || !frameWindow || !frameDocument) return void 0;
        return {
          window: frameWindow,
          document: frameDocument,
          getViewportRect: () => frame.getBoundingClientRect()
        };
      },
      hotkeys: {
        qa: "Shift+Q"
      },
      anchors: {
        attribute: "data-qa-id"
      },
      viewports: {
        presets: reviewViewportPresets
      },
      ruler,
      onRestoreItem: restoreReviewItem,
      onItemsChange: () => {
        void refreshItems();
      },
      onModeChange: setMode,
      ui: {
        panel: false
      },
      modules: {
        qa: true,
        grid: false,
        figma: false
      }
    });
    controllerRef.current.open();
    setMode(controllerRef.current.getMode());
    void refreshItems();
    restoreInitialItem();
    applyPendingRestore();
    refreshTargetOverlayState();
  }, [
    adapter,
    applyPendingRestore,
    cancelReviewMode,
    closeRuler,
    destroyReviewKit,
    projectId,
    refreshItems,
    refreshTargetOverlayState,
    reviewViewportPresets,
    restoreInitialItem,
    restoreReviewItem,
    ruler,
    reviewPathPrefix,
    syncShellTarget,
    syncTargetViewport
  ]);
  useEffect(() => destroyReviewKit, [destroyReviewKit]);
  useEffect(() => {
    void refreshItems();
  }, [refreshItems]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return void 0;
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const syncSystemTheme = () => {
      setSystemReviewTheme(query.matches ? "light" : "dark");
    };
    syncSystemTheme();
    if (query.addEventListener) {
      query.addEventListener("change", syncSystemTheme);
      return () => query.removeEventListener("change", syncSystemTheme);
    }
    query.addListener(syncSystemTheme);
    return () => query.removeListener(syncSystemTheme);
  }, []);
  useEffect(() => {
    document.body.classList.toggle(
      "df-review-theme-light",
      effectiveReviewTheme === "light"
    );
    document.body.classList.toggle(
      "df-review-theme-dark",
      effectiveReviewTheme === "dark"
    );
    return () => {
      document.body.classList.remove(
        "df-review-theme-light",
        "df-review-theme-dark"
      );
    };
  }, [effectiveReviewTheme]);
  useEffect(() => {
    if (mode === "idle" && !isRulerVisible && !promptItemId && !isSitemapOpen && !isFigmaSettingsOpen) {
      return;
    }
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (mode !== "idle" && cancelReviewMode()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (closeRuler()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (promptItemId) {
        setPromptItemId(null);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (isSitemapOpen) {
        setIsSitemapOpen(false);
        return;
      }
      if (isFigmaSettingsOpen) {
        closeFigmaSettings();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cancelReviewMode,
    closeRuler,
    closeFigmaSettings,
    isFigmaSettingsOpen,
    isRulerVisible,
    isSitemapOpen,
    promptItemId,
    mode
  ]);
  useEffect(() => {
    targetRef.current = target;
    setActiveRoute(target);
  }, [target]);
  useEffect(() => {
    sizeRef.current = size;
    if (selectedItemIdRef.current) {
      updateShellUrlForItem(targetRef.current, size, selectedItemIdRef.current);
    } else {
      updateShellUrl(targetRef.current, size);
    }
    syncTargetViewport();
  }, [size, syncTargetViewport]);
  useEffect(() => {
    const frameScroll = frameScrollRef.current;
    if (!frameScroll) return void 0;
    const centerFrameScroll = () => {
      frameScroll.scrollLeft = Math.max(
        0,
        (frameScroll.scrollWidth - frameScroll.clientWidth) / 2
      );
      frameScroll.scrollTop = 0;
    };
    const animationFrame = window.requestAnimationFrame(centerFrameScroll);
    const transitionTimeout = window.setTimeout(centerFrameScroll, 180);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(transitionTimeout);
    };
  }, [isListVisible, size.height, size.width, targetSrc]);
  useEffect(() => {
    if (isFigmaOverlayAvailable || !targetOverlayState.figma) return;
    dispatchTargetOverlayHotkey("figma");
  }, [
    dispatchTargetOverlayHotkey,
    isFigmaOverlayAvailable,
    targetOverlayState.figma
  ]);
  useEffect(() => {
    if (!isRulerVisible || !isRulerAvailable) return void 0;
    const getRulerEventClientPoint = (event) => {
      const frame2 = iframeRef.current;
      let isFrameEvent = false;
      try {
        isFrameEvent = Boolean(frame2?.contentWindow) && event.view === frame2?.contentWindow;
        if (!isFrameEvent && frame2?.contentDocument) {
          const targetDocument = event.target?.ownerDocument;
          isFrameEvent = targetDocument === frame2.contentDocument;
        }
      } catch {
        isFrameEvent = false;
      }
      if (isFrameEvent && frame2) {
        const frameRect = frame2.getBoundingClientRect();
        return {
          clientX: event.clientX + frameRect.left,
          clientY: event.clientY + frameRect.top
        };
      }
      return {
        clientX: event.clientX,
        clientY: event.clientY
      };
    };
    const getActiveRulerPoint = (event) => {
      const rect = rulerDragRectRef.current ?? rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return void 0;
      const point = getRulerEventClientPoint(event);
      return getRulerPointFromRect(point.clientX, point.clientY, rect);
    };
    const handleDragStart = (event) => {
      if (isRulerDraggingRef.current) return;
      const mouseEvent = event;
      if (mouseEvent.button !== 0) return;
      const overlay = rulerOverlayRef.current;
      const target2 = mouseEvent.target;
      if (!overlay || !(target2 instanceof Node) || !overlay.contains(target2)) {
        return;
      }
      event.preventDefault();
      startRulerDrag(
        mouseEvent.clientX,
        mouseEvent.clientY,
        overlay.getBoundingClientRect()
      );
    };
    const handleDragMove = (event) => {
      if (!isRulerDraggingRef.current) return;
      const point = getActiveRulerPoint(event);
      if (!point) return;
      event.preventDefault();
      setRulerPoint(point);
    };
    const handleDragEnd = (event) => {
      if (!isRulerDraggingRef.current) return;
      const point = getActiveRulerPoint(event);
      event.preventDefault();
      finishRulerDrag(point);
    };
    const handleWindowBlur = () => {
      if (!isRulerDraggingRef.current) return;
      finishRulerDrag();
    };
    const dragTargets = /* @__PURE__ */ new Set([window]);
    const frame = iframeRef.current;
    try {
      if (frame?.contentWindow) dragTargets.add(frame.contentWindow);
      if (frame?.contentDocument) dragTargets.add(frame.contentDocument);
    } catch {
    }
    dragTargets.forEach((target2) => {
      target2.addEventListener("mousedown", handleDragStart, true);
      target2.addEventListener("mousemove", handleDragMove, true);
      target2.addEventListener("mouseup", handleDragEnd, true);
    });
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      dragTargets.forEach((target2) => {
        target2.removeEventListener("mousedown", handleDragStart, true);
        target2.removeEventListener("mousemove", handleDragMove, true);
        target2.removeEventListener("mouseup", handleDragEnd, true);
      });
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [finishRulerDrag, isRulerAvailable, isRulerVisible, startRulerDrag]);
  useEffect(() => {
    clearRulerMeasure();
  }, [clearRulerMeasure, size.height, size.width, targetSrc]);
  useEffect(() => {
    if (!isRulerVisible || isRulerAvailable) return;
    closeRuler();
  }, [closeRuler, isRulerAvailable, isRulerVisible]);
  const applyTarget = () => {
    const normalizedTarget = normalizeTarget(draftTarget, reviewPathPrefix);
    clearSelectedItem();
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current);
  };
  const selectPage = (href) => {
    const normalizedTarget = normalizeTarget(href, reviewPathPrefix);
    clearSelectedItem();
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current);
    setIsSitemapOpen(false);
  };
  const setReviewMode = (nextMode) => {
    closeRuler();
    controllerRef.current?.setMode(nextMode);
    setMode(controllerRef.current?.getMode() ?? "idle");
  };
  const copyCurrentUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy URL"), 1200);
  };
  const updateItemStatus = async (item, status) => {
    await adapter.update(item.id, { status });
    await refreshReviewData();
  };
  const copyPrompt = async (value, key) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedPromptKey(key);
    window.setTimeout(() => {
      setCopiedPromptKey((current) => current === key ? null : current);
    }, 1200);
  };
  const copyItemPrompt = async (numberedItem) => {
    await copyPrompt(
      buildReviewItemPrompt(numberedItem, reviewPathPrefix),
      `item:${numberedItem.item.id}`
    );
  };
  const removeItem = async (item) => {
    await adapter.remove(item.id);
    if (selectedItemIdRef.current === item.id) {
      clearSelectedItem();
      updateShellUrl(targetRef.current, sizeRef.current);
    }
    await refreshReviewData();
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `df-review-shell is-theme-${effectiveReviewTheme}${isListVisible ? " is-list-visible" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("header", { className: "df-review-topbar", children: [
          /* @__PURE__ */ jsxs(
            "form",
            {
              className: "df-review-address",
              onSubmit: (event) => {
                event.preventDefault();
                applyTarget();
              },
              children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    "aria-label": "Open sitemap",
                    className: "df-review-sitemap-button",
                    "data-tooltip": "Sitemap",
                    type: "button",
                    onClick: () => setIsSitemapOpen(true),
                    children: /* @__PURE__ */ jsx(Map2, { "aria-hidden": "true" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    "aria-label": "Path",
                    value: draftTarget,
                    onChange: (event) => setDraftTarget(event.target.value)
                  }
                ),
                /* @__PURE__ */ jsx("button", { type: "submit", children: "Load" }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void copyCurrentUrl(), children: copyLabel })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "df-review-tools", children: [
            /* @__PURE__ */ jsxs("div", { className: "df-review-tool-controls", children: [
              /* @__PURE__ */ jsx("div", { className: "df-review-presets", "aria-label": "Viewport presets", children: viewportPresets.map((preset) => /* @__PURE__ */ jsxs(
                "button",
                {
                  className: preset.label === size.label ? "is-active" : "",
                  type: "button",
                  onClick: () => setSize(preset),
                  children: [
                    /* @__PURE__ */ jsx(ViewportPresetIcon, { preset }),
                    /* @__PURE__ */ jsx("span", { className: "df-review-preset-copy", children: /* @__PURE__ */ jsx("strong", { children: preset.label }) })
                  ]
                },
                preset.label
              )) }),
              /* @__PURE__ */ jsx("span", { className: "df-review-tool-divider", "aria-hidden": "true", children: "|" }),
              /* @__PURE__ */ jsxs("span", { className: "df-review-active-size", children: [
                size.width,
                "x",
                size.height
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "df-review-overlays", "aria-label": "Target overlays", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Toggle grid overlay",
                  className: `df-review-overlay-button is-grid${targetOverlayState.grid ? " is-active" : ""}`,
                  "data-tooltip": "Grid",
                  type: "button",
                  onClick: () => toggleTargetOverlay("grid"),
                  children: /* @__PURE__ */ jsx(LayoutGrid, { "aria-hidden": "true" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-disabled": !isFigmaOverlayAvailable,
                  "aria-label": isFigmaOverlayAvailable ? "Toggle Figma overlay" : FIGMA_OVERLAY_UNAVAILABLE_MESSAGE,
                  className: `df-review-overlay-button is-figma${targetOverlayState.figma ? " is-active" : ""}${isFigmaOverlayAvailable ? "" : " is-disabled"}`,
                  "data-tooltip": isFigmaOverlayAvailable ? "Figma" : FIGMA_OVERLAY_UNAVAILABLE_MESSAGE,
                  type: "button",
                  onClick: () => toggleTargetOverlay("figma"),
                  children: /* @__PURE__ */ jsx(Image, { "aria-hidden": "true" })
                }
              ),
              isRulerAvailable && /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Toggle ruler",
                  className: `df-review-overlay-button is-ruler${isRulerVisible ? " is-active" : ""}`,
                  "data-tooltip": "Ruler",
                  type: "button",
                  onClick: toggleRuler,
                  children: /* @__PURE__ */ jsx(Ruler, { "aria-hidden": "true" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Open settings",
                  className: "df-review-overlay-button is-settings",
                  "data-tooltip": "Settings",
                  type: "button",
                  onClick: openFigmaSettings,
                  children: /* @__PURE__ */ jsx(Settings, { "aria-hidden": "true" })
                }
              )
            ] })
          ] })
        ] }),
        isSitemapOpen && /* @__PURE__ */ jsxs(
          "div",
          {
            "aria-label": "Sitemap",
            "aria-modal": "true",
            className: "df-review-sitemap-modal",
            role: "dialog",
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Close sitemap",
                  className: "df-review-sitemap-backdrop",
                  type: "button",
                  onClick: () => setIsSitemapOpen(false)
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "df-review-sitemap-dialog", children: [
                /* @__PURE__ */ jsxs("div", { className: "df-review-sitemap-header", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Sitemap" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      pages.length,
                      " pages"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      "aria-label": "Close sitemap",
                      type: "button",
                      onClick: () => setIsSitemapOpen(false),
                      children: "x"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "df-review-sitemap-list", children: pages.map((page) => {
                  const pageTarget = normalizeTarget(page.href, reviewPathPrefix);
                  const qaCount = pageQaCounts.get(pageTarget) ?? 0;
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      "aria-label": `${page.href} / ${qaCount} QA`,
                      className: pageTarget === activeRoute ? "is-active" : "",
                      type: "button",
                      onClick: () => selectPage(page.href),
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "df-review-sitemap-path", children: page.href }),
                        /* @__PURE__ */ jsx("span", { className: "df-review-sitemap-count", children: qaCount })
                      ]
                    },
                    page.href
                  );
                }) })
              ] })
            ]
          }
        ),
        isFigmaSettingsOpen && /* @__PURE__ */ jsxs(
          "div",
          {
            "aria-label": "Review settings",
            "aria-modal": "true",
            className: "df-review-settings-modal",
            role: "dialog",
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Close settings",
                  className: "df-review-settings-backdrop",
                  type: "button",
                  onClick: closeFigmaSettings
                }
              ),
              /* @__PURE__ */ jsxs(
                "form",
                {
                  className: "df-review-settings-dialog",
                  onSubmit: (event) => {
                    event.preventDefault();
                    saveReviewSettings(
                      figmaTokenDraft,
                      reviewUserIdDraft,
                      reviewThemeDraft
                    );
                  },
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "df-review-settings-header", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("strong", { children: "Settings" }),
                        /* @__PURE__ */ jsxs("span", { children: [
                          FIGMA_TOKEN_STORAGE_KEY,
                          " / ",
                          REVIEW_USER_ID_STORAGE_KEY,
                          " /",
                          " ",
                          REVIEW_THEME_STORAGE_KEY
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          "aria-label": "Close settings",
                          type: "button",
                          onClick: closeFigmaSettings,
                          children: "x"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "df-review-settings-body", children: [
                      /* @__PURE__ */ jsxs("div", { className: "df-review-settings-field", children: [
                        /* @__PURE__ */ jsxs("div", { className: "df-review-settings-label-row", children: [
                          /* @__PURE__ */ jsx("label", { htmlFor: "df-review-figma-token", children: "Figma token" }),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              "aria-controls": FIGMA_TOKEN_GUIDE_ID,
                              "aria-expanded": isFigmaTokenGuideOpen,
                              "aria-label": "Show Figma token guide",
                              className: `df-review-settings-help-button${isFigmaTokenGuideOpen ? " is-active" : ""}`,
                              type: "button",
                              onClick: () => setIsFigmaTokenGuideOpen((current) => !current),
                              children: /* @__PURE__ */ jsx(CircleQuestionMark, { "aria-hidden": "true" })
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "df-review-settings-token-input", children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              id: "df-review-figma-token",
                              "aria-label": "Figma token",
                              "aria-describedby": isFigmaTokenGuideOpen ? FIGMA_TOKEN_GUIDE_ID : void 0,
                              autoCapitalize: "off",
                              autoComplete: "off",
                              autoCorrect: "off",
                              className: isFigmaTokenVisible ? void 0 : "is-token-masked",
                              "data-1p-ignore": "true",
                              "data-lpignore": "true",
                              inputMode: "text",
                              name: "df-review-figma-access-key",
                              spellCheck: false,
                              type: "text",
                              value: figmaTokenDraft,
                              onChange: (event) => {
                                setFigmaTokenDraft(event.target.value);
                                setFigmaSettingsStatus("");
                              }
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              "aria-label": isFigmaTokenVisible ? "Hide Figma token" : "Show Figma token",
                              className: "df-review-settings-token-toggle",
                              type: "button",
                              onClick: () => setIsFigmaTokenVisible((current) => !current),
                              children: isFigmaTokenVisible ? /* @__PURE__ */ jsx(EyeOff, { "aria-hidden": "true" }) : /* @__PURE__ */ jsx(Eye, { "aria-hidden": "true" })
                            }
                          )
                        ] }),
                        isFigmaTokenGuideOpen && /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: "df-review-settings-guide",
                            id: FIGMA_TOKEN_GUIDE_ID,
                            children: /* @__PURE__ */ jsxs("ol", { children: [
                              /* @__PURE__ */ jsx("li", { children: "Figma file browser\uC5D0\uC11C account menu\uB97C \uC5F4\uACE0 Settings\uB85C \uC774\uB3D9" }),
                              /* @__PURE__ */ jsx("li", { children: "Security \uD0ED\uC758 Personal access tokens\uB85C \uC774\uB3D9" }),
                              /* @__PURE__ */ jsx("li", { children: "Generate new token\uC5D0\uC11C \uC774\uB984\uACFC scope\uB97C \uC815\uD55C \uB4A4 \uC0DD\uC131" }),
                              /* @__PURE__ */ jsx("li", { children: "\uC0DD\uC131\uB41C token\uC744 \uBCF5\uC0AC\uD574\uC11C \uC5EC\uAE30\uC5D0 \uBD99\uC5EC\uB123\uAE30" })
                            ] })
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs("label", { className: "df-review-settings-field", children: [
                        /* @__PURE__ */ jsx("span", { children: "User ID" }),
                        /* @__PURE__ */ jsx("div", { className: "df-review-settings-text-input", children: /* @__PURE__ */ jsx(
                          "input",
                          {
                            "aria-label": "Review user ID",
                            autoComplete: "off",
                            spellCheck: false,
                            type: "text",
                            value: reviewUserIdDraft,
                            onChange: (event) => {
                              setReviewUserIdDraft(event.target.value);
                              setFigmaSettingsStatus("");
                            }
                          }
                        ) })
                      ] }),
                      /* @__PURE__ */ jsxs("label", { className: "df-review-settings-field", children: [
                        /* @__PURE__ */ jsx("span", { children: "Theme" }),
                        /* @__PURE__ */ jsx("div", { className: "df-review-settings-select-input", children: /* @__PURE__ */ jsx(
                          "select",
                          {
                            "aria-label": "Review theme",
                            value: reviewThemeDraft,
                            onChange: (event) => {
                              setReviewThemeDraft(
                                normalizeReviewTheme(event.target.value)
                              );
                              setFigmaSettingsStatus("");
                            },
                            children: REVIEW_THEME_OPTIONS.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
                          }
                        ) })
                      ] }),
                      figmaSettingsStatus && /* @__PURE__ */ jsx("p", { className: "df-review-settings-status", children: figmaSettingsStatus }),
                      /* @__PURE__ */ jsxs("div", { className: "df-review-settings-actions", children: [
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => saveReviewSettings("", "", DEFAULT_REVIEW_THEME),
                            children: "Clear"
                          }
                        ),
                        /* @__PURE__ */ jsx("span", {}),
                        /* @__PURE__ */ jsx("button", { type: "button", onClick: closeFigmaSettings, children: "Cancel" }),
                        /* @__PURE__ */ jsx("button", { type: "submit", children: "Save" })
                      ] })
                    ] })
                  ]
                }
              )
            ]
          }
        ),
        promptDialogNumberedItem && /* @__PURE__ */ jsxs(
          "div",
          {
            "aria-label": "Prompt",
            "aria-modal": "true",
            className: "df-review-prompt-modal",
            role: "dialog",
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": "Close prompt",
                  className: "df-review-prompt-backdrop",
                  type: "button",
                  onClick: () => setPromptItemId(null)
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-dialog", children: [
                /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-header", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("strong", { children: "Prompt" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      promptDialogNumberedItem.displayLabel,
                      " /",
                      " ",
                      getItemTitle(promptDialogNumberedItem.item)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      "aria-label": "Close prompt",
                      type: "button",
                      onClick: () => setPromptItemId(null),
                      children: "x"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-body", children: [
                  /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-tabs", role: "tablist", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        "aria-selected": promptTab === "initial",
                        className: promptTab === "initial" ? "is-active" : "",
                        role: "tab",
                        type: "button",
                        onClick: () => setPromptTab("initial"),
                        children: "Initial prompt"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        "aria-selected": promptTab === "item",
                        className: promptTab === "item" ? "is-active" : "",
                        role: "tab",
                        type: "button",
                        onClick: () => setPromptTab("item"),
                        children: "This QA prompt"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("section", { className: "df-review-prompt-block", role: "tabpanel", children: [
                    /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-block-header", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("strong", { children: promptDialogActiveLabel }),
                        /* @__PURE__ */ jsx("span", { children: getPromptLengthLabel(promptDialogActiveText) })
                      ] }),
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          disabled: !promptDialogActiveText,
                          type: "button",
                          onClick: () => void copyPrompt(promptDialogActiveText, promptDialogActiveCopyKey),
                          children: [
                            /* @__PURE__ */ jsx(Copy, { "aria-hidden": "true" }),
                            copiedPromptKey === promptDialogActiveCopyKey ? "Copied" : "Copy"
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        readOnly: true,
                        "aria-label": promptDialogActiveLabel,
                        value: promptDialogActiveText || `${promptDialogActiveLabel} is not configured.`
                      }
                    )
                  ] })
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "df-review-side-rail", children: /* @__PURE__ */ jsxs(
          "button",
          {
            "aria-label": isListVisible ? "Hide QA list" : "Show QA list",
            className: "df-review-side-toggle",
            type: "button",
            onClick: () => setIsListVisible((current) => !current),
            children: [
              /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: /* @__PURE__ */ jsx(GripVertical, {}) }),
              /* @__PURE__ */ jsx("strong", { children: "QA" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("aside", { className: "df-review-qa-panel", "aria-hidden": !isListVisible, children: /* @__PURE__ */ jsx("div", { className: "df-review-panel-body", children: /* @__PURE__ */ jsxs("section", { className: "df-review-item-list", children: [
          /* @__PURE__ */ jsxs("div", { className: "df-review-list-header", children: [
            /* @__PURE__ */ jsxs("div", { className: "df-review-list-title", children: [
              /* @__PURE__ */ jsx("span", { children: "Current page QA" }),
              /* @__PURE__ */ jsxs("strong", { children: [
                filteredNumberedActiveItems.length,
                qaFilter === "all" ? "" : `/${activeItems.length}`
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "df-review-filter-tabs", "aria-label": "QA filters", children: REVIEW_QA_FILTERS.map((filter) => {
              const count = qaFilterCounts.get(filter.key) ?? 0;
              const isActive = qaFilter === filter.key;
              return /* @__PURE__ */ jsx(
                "button",
                {
                  "aria-label": `${filter.label} QA (${count})`,
                  "aria-pressed": isActive,
                  className: `df-review-filter-tab${isActive ? " is-active" : ""}`,
                  "data-tooltip": `${filter.label} ${count}`,
                  title: `${filter.label} (${count})`,
                  type: "button",
                  onClick: () => setQaFilter(filter.key),
                  children: filter.scope ? /* @__PURE__ */ jsx(ReviewScopeIcon, { scope: filter.scope }) : /* @__PURE__ */ jsx(ListFilter, { "aria-hidden": "true" })
                },
                filter.key
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "df-review-list-scroll", children: [
            activeItems.length === 0 && /* @__PURE__ */ jsx("p", { className: "df-review-empty", children: "No QA on this page." }),
            activeItems.length > 0 && filteredNumberedActiveItems.length === 0 && /* @__PURE__ */ jsx("p", { className: "df-review-empty", children: "No QA in this filter." }),
            filteredNumberedActiveItems.map((numberedItem) => {
              const { item } = numberedItem;
              return /* @__PURE__ */ jsxs(
                "article",
                {
                  className: `df-review-item-card${item.id === selectedItemId ? " is-active" : ""}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        "aria-label": "Delete QA",
                        className: "df-review-item-delete",
                        "data-tooltip": "Delete",
                        title: "Delete",
                        type: "button",
                        onClick: () => void removeItem(item),
                        children: /* @__PURE__ */ jsx(X, { "aria-hidden": "true" })
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        className: "df-review-item-main",
                        type: "button",
                        onClick: () => restoreReviewItem(item),
                        children: [
                          /* @__PURE__ */ jsxs("span", { className: "df-review-item-badges", children: [
                            /* @__PURE__ */ jsxs(
                              "span",
                              {
                                className: `df-review-item-viewport is-scope-${numberedItem.scope}`,
                                children: [
                                  /* @__PURE__ */ jsx(ReviewScopeIcon, { scope: numberedItem.scope }),
                                  numberedItem.displayLabel
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsx("span", { className: "df-review-item-kind", children: item.kind }),
                            /* @__PURE__ */ jsx("span", { className: "df-review-item-status-badge", children: getReviewStatusLabel(item.status) })
                          ] }),
                          /* @__PURE__ */ jsx("strong", { children: getItemTitle(item) }),
                          /* @__PURE__ */ jsx("small", { children: formatDate(item.createdAt) }),
                          /* @__PURE__ */ jsx("small", { children: formatItemMeta(item) }),
                          item.screenshot && /* @__PURE__ */ jsx("img", { src: item.screenshot.dataUrl, alt: "" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "df-review-item-actions",
                        onClick: (event) => event.stopPropagation(),
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "df-review-item-prompt-actions", children: [
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                className: "df-review-item-prompt",
                                type: "button",
                                onClick: () => {
                                  setPromptTab("item");
                                  setPromptItemId(item.id);
                                },
                                children: "Prompt"
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                "aria-label": "Copy QA prompt",
                                className: `df-review-item-prompt-copy${copiedPromptKey === `item:${item.id}` ? " is-copied" : ""}`,
                                "data-tooltip": copiedPromptKey === `item:${item.id}` ? "Copied" : "Copy prompt",
                                type: "button",
                                onClick: () => void copyItemPrompt(numberedItem),
                                children: /* @__PURE__ */ jsx(Copy, { "aria-hidden": "true" })
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsx(
                            "select",
                            {
                              "aria-label": "Workflow status",
                              className: "df-review-item-status-select",
                              value: normalizeReviewItemStatus(item.status),
                              onChange: (event) => void updateItemStatus(
                                item,
                                event.currentTarget.value
                              ),
                              children: REVIEW_WORKFLOW_STATUS_OPTIONS.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
                            }
                          )
                        ]
                      }
                    )
                  ]
                },
                item.id
              );
            })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx("main", { className: "df-review-stage", children: /* @__PURE__ */ jsxs("div", { className: "df-review-frame", children: [
          /* @__PURE__ */ jsx("div", { className: "df-review-frame-scroll", ref: frameScrollRef, children: /* @__PURE__ */ jsx("div", { className: "df-review-frame-canvas", children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: "df-review-device",
              style: {
                width: `${size.width}px`,
                height: `${size.height}px`,
                minWidth: `${size.width}px`,
                minHeight: `${size.height}px`
              },
              children: [
                /* @__PURE__ */ jsx(
                  "iframe",
                  {
                    ref: iframeRef,
                    width: size.width,
                    height: size.height,
                    src: targetSrc,
                    title: "Review target",
                    onLoad: initReviewKit
                  },
                  targetSrc
                ),
                isRulerVisible && activeRulerFrame && /* @__PURE__ */ jsxs(
                  "div",
                  {
                    ref: rulerOverlayRef,
                    "aria-label": "Ruler",
                    className: `df-review-ruler-overlay${isRulerDragging ? " is-dragging" : ""}`,
                    role: "application",
                    style: {
                      "--df-review-ruler-step-x": `${rulerScaleX * 10}px`,
                      "--df-review-ruler-major-x": `${rulerScaleX * 100}px`,
                      "--df-review-ruler-step-y": `${rulerScaleY * 10}px`,
                      "--df-review-ruler-major-y": `${rulerScaleY * 100}px`
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "df-review-ruler-axis is-x",
                          "aria-hidden": "true"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "df-review-ruler-axis is-y",
                          "aria-hidden": "true"
                        }
                      ),
                      rulerPoint && /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: "df-review-ruler-guide is-x",
                            "aria-hidden": "true",
                            style: { top: `${rulerPoint.y}px` }
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: "df-review-ruler-guide is-y",
                            "aria-hidden": "true",
                            style: { left: `${rulerPoint.x}px` }
                          }
                        )
                      ] }),
                      rulerMeasure && (rulerMeasure.width > 0 || rulerMeasure.height > 0) && /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: "df-review-ruler-selection",
                            "aria-hidden": "true",
                            style: {
                              left: `${rulerMeasure.left}px`,
                              top: `${rulerMeasure.top}px`,
                              width: `${rulerMeasure.width}px`,
                              height: `${rulerMeasure.height}px`
                            }
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "div",
                          {
                            className: "df-review-ruler-label",
                            style: {
                              left: `${Math.min(
                                Math.max(
                                  rulerMeasure.left + rulerMeasure.width + 8,
                                  8
                                ),
                                Math.max(8, size.width - 164)
                              )}px`,
                              top: `${Math.min(
                                Math.max(
                                  rulerMeasure.top + rulerMeasure.height + 8,
                                  8
                                ),
                                Math.max(8, size.height - 34)
                              )}px`
                            },
                            children: rulerMeasureLabel
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "df-review-ruler-info", children: [
                        /* @__PURE__ */ jsx("strong", { children: activeRulerFrame.label ?? size.label }),
                        /* @__PURE__ */ jsxs("span", { children: [
                          activeRulerFrame.designWidth,
                          activeRulerFrame.designHeight ? `x${activeRulerFrame.designHeight}` : "",
                          rulerUnit
                        ] })
                      ] })
                    ]
                  }
                )
              ]
            }
          ) }) }),
          /* @__PURE__ */ jsx("div", { className: "df-review-frame-actions", children: /* @__PURE__ */ jsxs("div", { className: "df-review-mode", "aria-label": "Add QA", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                "aria-label": "Element",
                className: `df-review-mode-button is-element${mode === "element" ? " is-active" : ""}`,
                "data-tooltip": "Element",
                type: "button",
                onClick: () => setReviewMode("element"),
                children: /* @__PURE__ */ jsx(SquareMousePointer, { "aria-hidden": "true" })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "df-review-mode-divider", "aria-hidden": "true", children: "|" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                "aria-label": "Note",
                className: `df-review-mode-button is-note${mode === "text" ? " is-active" : ""}`,
                "data-tooltip": "Note",
                type: "button",
                onClick: () => setReviewMode("text"),
                children: /* @__PURE__ */ jsx(StickyNote, { "aria-hidden": "true" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                "aria-label": "Capture",
                className: `df-review-mode-button is-capture${mode === "capture" ? " is-active" : ""}`,
                "data-tooltip": "Capture",
                type: "button",
                onClick: () => setReviewMode("capture"),
                children: /* @__PURE__ */ jsx(Scan, { "aria-hidden": "true" })
              }
            )
          ] }) })
        ] }) })
      ]
    }
  );
};
var mountReviewShell = (options) => {
  if (typeof document === "undefined" || !document.head) return;
  const { rootId = "root", ...shellProps } = options;
  if (!document.getElementById(REVIEW_SHELL_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = REVIEW_SHELL_STYLE_ID;
    style.textContent = `
	  * {
	    box-sizing: border-box;
	    scrollbar-color: var(--df-review-scrollbar-thumb, rgba(237, 243, 251, 0.2)) var(--df-review-scrollbar-track, rgba(237, 243, 251, 0.04));
	    scrollbar-width: thin;
	  }

	  *::-webkit-scrollbar {
	    width: 10px;
	    height: 10px;
	  }

	  *::-webkit-scrollbar-track {
	    background: var(--df-review-scrollbar-track, rgba(237, 243, 251, 0.04));
	  }

	  *::-webkit-scrollbar-thumb {
	    border: 2px solid var(--df-review-scrollbar-border, rgba(15, 18, 24, 0.92));
	    border-radius: 999px;
	    background: var(--df-review-scrollbar-thumb, rgba(237, 243, 251, 0.18));
	  }

	  *::-webkit-scrollbar-thumb:hover {
	    background: var(--df-review-scrollbar-thumb-hover, rgba(237, 243, 251, 0.28));
	  }

	  *::-webkit-scrollbar-corner {
	    background: transparent;
	  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
  }

	  body {
	    overflow: hidden;
	    --df-review-bg: #0f1218;
	    --df-review-topbar: #171c24;
	    --df-review-panel: #131821;
	    --df-review-panel-strong: #1b2430;
	    --df-review-control: #202938;
	    --df-review-control-hover: #273345;
	    --df-review-line: rgba(226, 233, 245, 0.14);
	    --df-review-line-soft: rgba(226, 233, 245, 0.08);
	    --df-review-text: #edf3fb;
	    --df-review-muted: rgba(237, 243, 251, 0.58);
	    --df-review-subtle: rgba(237, 243, 251, 0.42);
	    --df-review-accent: #7cc7ff;
	    --df-review-accent-soft: rgba(124, 199, 255, 0.12);
	    --df-review-accent-hover: rgba(124, 199, 255, 0.2);
	    --df-review-note: #f3b75f;
	    --df-review-note-soft: rgba(243, 183, 95, 0.14);
	    --df-review-capture: #63d7c7;
	    --df-review-capture-soft: rgba(99, 215, 199, 0.14);
	    --df-review-tooltip-bg: #0a0d12;
	    --df-review-side-rail: #111722;
	    --df-review-mode-bar: rgba(15, 18, 24, 0.86);
	    --df-review-chip-bg: rgba(237, 243, 251, 0.06);
	    --df-review-scrollbar-track: rgba(237, 243, 251, 0.04);
	    --df-review-scrollbar-thumb: rgba(237, 243, 251, 0.18);
	    --df-review-scrollbar-thumb-hover: rgba(237, 243, 251, 0.28);
	    --df-review-scrollbar-border: rgba(15, 18, 24, 0.92);
	    background: var(--df-review-bg);
	    color: var(--df-review-text);
	    font-family:
	      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
	      "Segoe UI", sans-serif;
	  }

	  body.df-review-theme-light {
	    --df-review-bg: #f4f6f9;
	    --df-review-topbar: #ffffff;
	    --df-review-panel: #ffffff;
	    --df-review-panel-strong: #edf1f6;
	    --df-review-control: #eef2f7;
	    --df-review-control-hover: #e3e9f1;
	    --df-review-line: rgba(16, 24, 40, 0.14);
	    --df-review-line-soft: rgba(16, 24, 40, 0.08);
	    --df-review-text: #17202c;
	    --df-review-muted: rgba(23, 32, 44, 0.62);
	    --df-review-subtle: rgba(23, 32, 44, 0.44);
	    --df-review-accent: #1769aa;
	    --df-review-accent-soft: rgba(23, 105, 170, 0.1);
	    --df-review-accent-hover: rgba(23, 105, 170, 0.16);
	    --df-review-note: #a76617;
	    --df-review-note-soft: rgba(167, 102, 23, 0.12);
	    --df-review-capture: #087f73;
	    --df-review-capture-soft: rgba(8, 127, 115, 0.12);
	    --df-review-tooltip-bg: #17202c;
	    --df-review-side-rail: #edf1f6;
	    --df-review-mode-bar: rgba(255, 255, 255, 0.9);
	    --df-review-chip-bg: rgba(23, 32, 44, 0.06);
	    --df-review-scrollbar-track: rgba(23, 32, 44, 0.06);
	    --df-review-scrollbar-thumb: rgba(23, 32, 44, 0.24);
	    --df-review-scrollbar-thumb-hover: rgba(23, 32, 44, 0.34);
	    --df-review-scrollbar-border: rgba(244, 246, 249, 0.92);
	  }

	  button,
	  input,
	  select,
	  textarea {
	    font: inherit;
	  }

  button {
    cursor: pointer;
  }

  .df-review-shell {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 0 32px;
    grid-template-rows: auto minmax(0, 1fr);
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: grid-template-columns 160ms ease;
  }

  .df-review-shell.is-list-visible {
    grid-template-columns: minmax(0, 1fr) clamp(320px, 28vw, 420px) 32px;
  }

	  .df-review-topbar {
	    grid-column: 1;
	    grid-row: 1;
	    display: grid;
	    gap: 10px;
	    min-width: 0;
	    padding: 12px 16px;
	    border-bottom: 1px solid var(--df-review-line);
	    background: var(--df-review-topbar);
	  }

		  .df-review-address {
		    display: grid;
		    grid-template-columns: auto minmax(0, 1fr) auto auto;
		    gap: 8px;
		    width: 100%;
		    max-width: 1440px;
		    margin: 0 auto;
		  }

  .df-review-address input {
	    width: 100%;
	    min-height: 34px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 6px;
	    padding: 0 10px;
	    color: var(--df-review-text);
	    background: var(--df-review-bg);
	    font-size: 13px;
	  }

	  .df-review-address input:focus {
	    outline: 2px solid rgba(124, 199, 255, 0.58);
	    outline-offset: 1px;
	  }

		  .df-review-address button,
		  .df-review-side-toggle,
		  .df-review-presets button,
		  .df-review-overlay-button,
			  .df-review-mode-button,
			  .df-review-settings-header button,
			  .df-review-prompt-header button,
			  .df-review-settings-actions button,
			  .df-review-prompt-tabs button,
			  .df-review-prompt-block-header button,
			  .df-review-item-actions button,
			  .df-review-item-status-select {
		    min-height: 34px;
		    border: 1px solid var(--df-review-line);
		    border-radius: 6px;
		    background: var(--df-review-control);
	    color: var(--df-review-text);
	    font-size: 12px;
	    font-weight: 700;
	  }

		  .df-review-address button:hover,
	  .df-review-side-toggle:hover,
		  .df-review-presets button:hover,
		  .df-review-overlay-button:hover,
		  .df-review-mode-button:hover,
		  .df-review-settings-header button:hover,
		  .df-review-prompt-header button:hover,
		  .df-review-settings-actions button:hover,
		  .df-review-prompt-tabs button:hover,
		  .df-review-prompt-tabs button.is-active,
		  .df-review-prompt-block-header button:hover,
			  .df-review-item-actions button:hover,
		  .df-review-item-delete:hover,
		  .df-review-item-status-select:hover,
		  .df-review-presets button.is-active,
			  .df-review-overlay-button.is-active,
			  .df-review-mode-button.is-active {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-control-hover);
		  }

	  .df-review-sitemap-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: 38px;
	    min-width: 38px;
	    padding: 0;
	    color: var(--df-review-accent);
	  }

  .df-review-sitemap-button svg,
  .df-review-sitemap-header button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .df-review-sitemap-button::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 0;
    bottom: -30px;
    z-index: 5;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-2px);
	    border: 1px solid var(--df-review-line);
	    border-radius: 5px;
	    padding: 4px 7px;
	    background: var(--df-review-tooltip-bg);
	    color: var(--df-review-text);
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    transition:
      opacity 120ms ease,
      transform 120ms ease;
  }

	  .df-review-sitemap-button:hover::after,
	  .df-review-sitemap-button:focus-visible::after {
	    opacity: 1;
	    transform: translateY(0);
	  }

  .df-review-sitemap-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
				    padding: 18px;
  }

	  .df-review-sitemap-backdrop {
	    position: absolute;
	    inset: 0;
	    min-height: 0;
	    border: 0;
	    border-radius: 0;
	    padding: 0;
	    background: rgba(2, 6, 12, 0.62);
	  }

  .df-review-sitemap-dialog {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
	    width: min(760px, calc(100vw - 48px));
	    max-height: min(720px, calc(100vh - 48px));
	    overflow: hidden;
	    border: 1px solid var(--df-review-line);
	    border-radius: 8px;
	    background: var(--df-review-panel);
	    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
	  }

  .df-review-sitemap-header {
    display: flex;
    align-items: center;
	    justify-content: space-between;
	    gap: 12px;
	    min-height: 54px;
	    padding: 0 14px 0 16px;
	    border-bottom: 1px solid var(--df-review-line);
	  }

  .df-review-sitemap-header div {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
  }

  .df-review-sitemap-header strong {
    font-size: 14px;
  }

	  .df-review-sitemap-header span {
	    color: var(--df-review-muted);
	    font-size: 12px;
	    font-weight: 700;
	  }

  .df-review-sitemap-header button {
    display: grid;
    place-items: center;
	    width: 34px;
	    min-width: 34px;
	    min-height: 34px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 6px;
	    background: var(--df-review-control);
	    color: var(--df-review-text);
	    font-size: 13px;
	    font-weight: 800;
	  }

	  .df-review-sitemap-header button:hover {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-control-hover);
	  }

  .df-review-sitemap-list {
    display: grid;
    align-content: start;
    min-height: 0;
    overflow: auto;
    padding: 8px;
  }

  .df-review-sitemap-list button {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-height: 40px;
	    border: 0;
	    border-radius: 6px;
	    padding: 8px 10px;
	    background: transparent;
	    color: var(--df-review-text);
	    text-align: left;
	  }

	  .df-review-sitemap-list button:hover,
	  .df-review-sitemap-list button.is-active {
	    background: var(--df-review-accent-soft);
	  }

	  .df-review-sitemap-path {
	    min-width: 0;
	    overflow-wrap: anywhere;
	    color: var(--df-review-text);
	    font-size: 13px;
	    font-weight: 800;
	    line-height: 1.35;
  }

  .df-review-sitemap-count {
    display: inline-grid;
	    place-items: center;
	    min-width: 26px;
	    height: 24px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 999px;
	    padding: 0 8px;
	    background: var(--df-review-chip-bg);
	    color: var(--df-review-muted);
	    font-size: 12px;
	    font-weight: 900;
	  }

	  .df-review-sitemap-list button:hover .df-review-sitemap-path,
	  .df-review-sitemap-list button.is-active .df-review-sitemap-path {
	    color: var(--df-review-text);
	  }

		  .df-review-sitemap-list button:hover .df-review-sitemap-count,
		  .df-review-sitemap-list button.is-active .df-review-sitemap-count {
		    border-color: rgba(124, 199, 255, 0.72);
		    background: var(--df-review-accent-hover);
		    color: var(--df-review-accent);
		  }

		  .df-review-settings-modal {
		    position: fixed;
		    inset: 0;
		    z-index: 1001;
		    display: grid;
		    place-items: center;
		    padding: 24px;
		  }

		  .df-review-settings-backdrop {
		    position: absolute;
		    inset: 0;
		    min-height: 0;
		    border: 0;
		    border-radius: 0;
		    padding: 0;
		    background: rgba(2, 6, 12, 0.62);
		  }

		  .df-review-settings-dialog {
		    position: relative;
		    z-index: 1;
		    display: grid;
		    width: min(460px, calc(100vw - 48px));
		    overflow: hidden;
		    border: 1px solid var(--df-review-line);
		    border-radius: 8px;
		    background: var(--df-review-panel);
		    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
		  }

		  .df-review-settings-header {
		    display: flex;
		    align-items: center;
		    justify-content: space-between;
		    gap: 12px;
		    min-height: 54px;
		    padding: 0 14px 0 16px;
		    border-bottom: 1px solid var(--df-review-line);
		  }

		  .df-review-settings-header div {
		    display: grid;
		    gap: 2px;
		    min-width: 0;
		  }

		  .df-review-settings-header strong {
		    color: var(--df-review-text);
		    font-size: 14px;
		  }

		  .df-review-settings-header span {
		    color: var(--df-review-muted);
		    font-size: 11px;
		    font-weight: 800;
		  }

		  .df-review-settings-header button {
		    display: grid;
		    place-items: center;
		    width: 34px;
		    min-width: 34px;
		    padding: 0;
		    font-size: 13px;
		    font-weight: 800;
		  }

		  .df-review-settings-body {
		    display: grid;
		    gap: 12px;
		    padding: 16px;
		  }

		  .df-review-settings-field {
		    display: grid;
		    gap: 7px;
		  }

		  .df-review-settings-field span,
		  .df-review-settings-label-row label {
		    color: var(--df-review-muted);
		    font-size: 12px;
		    font-weight: 800;
		  }

		  .df-review-settings-label-row {
		    display: flex;
		    align-items: center;
		    gap: 6px;
		  }

		  .df-review-settings-help-button {
		    display: inline-grid;
		    place-items: center;
		    width: 20px;
		    min-width: 20px;
		    min-height: 20px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: 50%;
		    padding: 0;
		    background: transparent;
		    color: var(--df-review-muted);
		  }

		  .df-review-settings-help-button:hover,
		  .df-review-settings-help-button.is-active {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-accent-soft);
		    color: var(--df-review-accent);
		  }

		  .df-review-settings-help-button svg {
		    width: 13px;
		    height: 13px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
		    stroke-width: 2.1;
		  }

			  .df-review-settings-token-input,
			  .df-review-settings-text-input,
			  .df-review-settings-select-input {
			    display: grid;
			    align-items: stretch;
			    overflow: hidden;
			    border: 1px solid var(--df-review-line);
		    border-radius: 6px;
			    background: var(--df-review-bg);
			  }

			  .df-review-settings-token-input {
			    grid-template-columns: minmax(0, 1fr) 38px;
			  }

			  .df-review-settings-text-input,
			  .df-review-settings-select-input {
			    grid-template-columns: minmax(0, 1fr);
			  }

			  .df-review-settings-token-input:focus-within,
			  .df-review-settings-text-input:focus-within,
			  .df-review-settings-select-input:focus-within {
			    outline: 2px solid rgba(124, 199, 255, 0.58);
			    outline-offset: 1px;
			  }

			  .df-review-settings-token-input input,
			  .df-review-settings-text-input input,
			  .df-review-settings-select-input select {
			    min-width: 0;
			    min-height: 38px;
			    border: 0;
		    padding: 0 10px;
		    background: transparent;
		    color: var(--df-review-text);
			    font-size: 13px;
			  }

			  .df-review-settings-token-input input:focus,
			  .df-review-settings-text-input input:focus,
			  .df-review-settings-select-input select:focus {
			    outline: 0;
			  }

			  .df-review-settings-token-input input.is-token-masked {
			    -webkit-text-security: disc;
			  }

			  .df-review-settings-select-input select {
			    appearance: none;
			    cursor: pointer;
			  }

		  .df-review-settings-token-toggle {
		    display: grid;
		    place-items: center;
		    width: 38px;
		    min-width: 38px;
		    min-height: 38px;
		    border: 0;
		    border-left: 1px solid var(--df-review-line-soft);
		    border-radius: 0;
		    padding: 0;
		    background: transparent;
		    color: var(--df-review-muted);
		  }

		  .df-review-settings-token-toggle:hover {
		    background: var(--df-review-chip-bg);
		    color: var(--df-review-text);
		  }

		  .df-review-settings-token-toggle svg {
		    width: 16px;
		    height: 16px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
		    stroke-width: 2;
		  }

		  .df-review-settings-guide {
		    margin-top: -2px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: 6px;
		    padding: 9px 11px;
		    background: var(--df-review-chip-bg);
		    color: var(--df-review-muted);
		    font-size: 11px;
		    font-weight: 700;
		    line-height: 1.55;
		  }

		  .df-review-settings-guide ol {
		    display: grid;
		    gap: 3px;
		    margin: 0;
		    padding-left: 17px;
		  }

		  .df-review-settings-status {
		    min-height: 20px;
		    margin: 0;
		    color: var(--df-review-accent);
		    font-size: 12px;
		    font-weight: 800;
		  }

		  .df-review-settings-actions {
		    display: grid;
		    grid-template-columns: auto minmax(0, 1fr) auto auto;
		    gap: 8px;
		    align-items: center;
		  }

		  .df-review-settings-actions button {
		    padding: 0 12px;
		  }

			  .df-review-settings-actions button[type='submit'] {
			    border-color: var(--df-review-accent);
			    background: var(--df-review-accent-soft);
			    color: var(--df-review-accent);
			  }

			  .df-review-prompt-modal {
			    position: fixed;
			    inset: 0;
			    z-index: 1002;
			    display: grid;
			    place-items: center;
			    padding: 24px;
			  }

			  .df-review-prompt-backdrop {
			    position: absolute;
			    inset: 0;
			    min-height: 0;
			    border: 0;
			    border-radius: 0;
			    padding: 0;
			    background: rgba(2, 6, 12, 0.62);
			  }

			  .df-review-prompt-dialog {
			    position: relative;
			    z-index: 1;
			    display: grid;
			    grid-template-rows: auto minmax(0, 1fr);
				    width: min(1040px, calc(100vw - 36px));
				    max-height: min(900px, calc(100vh - 36px));
			    overflow: hidden;
			    border: 1px solid var(--df-review-line);
			    border-radius: 8px;
			    background: var(--df-review-panel);
			    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
			  }

			  .df-review-prompt-header {
			    display: flex;
			    align-items: center;
			    justify-content: space-between;
			    gap: 12px;
			    min-height: 54px;
			    padding: 0 14px 0 16px;
			    border-bottom: 1px solid var(--df-review-line);
			  }

			  .df-review-prompt-header div {
			    display: grid;
			    gap: 2px;
			    min-width: 0;
			  }

			  .df-review-prompt-header strong {
			    color: var(--df-review-text);
			    font-size: 14px;
			  }

			  .df-review-prompt-header span {
			    overflow: hidden;
			    color: var(--df-review-muted);
			    font-size: 11px;
			    font-weight: 800;
			    text-overflow: ellipsis;
			    white-space: nowrap;
			  }

			  .df-review-prompt-header button {
			    display: grid;
			    place-items: center;
			    width: 34px;
			    min-width: 34px;
			    padding: 0;
			    font-size: 13px;
			    font-weight: 800;
			  }

			  .df-review-prompt-body {
			    display: grid;
			    gap: 12px;
			    min-height: 0;
			    overflow: auto;
			    padding: 16px;
			  }

			  .df-review-prompt-tabs {
			    display: grid;
			    grid-template-columns: repeat(2, minmax(0, 1fr));
			    gap: 4px;
			    padding: 3px;
			    border: 1px solid var(--df-review-line-soft);
			    border-radius: 7px;
			    background: var(--df-review-line-soft);
			  }

			  .df-review-prompt-tabs button {
			    min-width: 0;
			    min-height: 32px;
			    padding: 0 10px;
			    border-color: transparent;
			    background: transparent;
			    color: var(--df-review-muted);
			    font-size: 11px;
			    font-weight: 900;
			  }

			  .df-review-prompt-tabs button:hover,
			  .df-review-prompt-tabs button.is-active {
			    border-color: var(--df-review-line);
			    background: var(--df-review-panel);
			    color: var(--df-review-text);
			  }

			  .df-review-prompt-block {
			    display: grid;
			    gap: 8px;
			    min-width: 0;
			  }

			  .df-review-prompt-block-header {
			    display: flex;
			    align-items: center;
			    justify-content: space-between;
			    gap: 12px;
			    min-width: 0;
			  }

			  .df-review-prompt-block-header div {
			    display: grid;
			    gap: 2px;
			    min-width: 0;
			  }

			  .df-review-prompt-block-header strong {
			    color: var(--df-review-text);
			    font-size: 12px;
			    font-weight: 900;
			  }

			  .df-review-prompt-block-header span {
			    color: var(--df-review-muted);
			    font-size: 11px;
			    font-weight: 800;
			  }

			  .df-review-prompt-block-header button {
			    display: inline-flex;
			    align-items: center;
			    gap: 6px;
			    min-height: 30px;
			    padding: 0 10px;
			  }

			  .df-review-prompt-block-header button:disabled {
			    cursor: not-allowed;
			    opacity: 0.5;
			  }

			  .df-review-prompt-block-header svg {
			    width: 13px;
			    height: 13px;
			    fill: none;
			    stroke: currentColor;
			    stroke-linecap: round;
			    stroke-linejoin: round;
			    stroke-width: 2;
			  }

				  .df-review-prompt-block textarea {
				    width: 100%;
				    height: min(520px, calc(100vh - 290px));
				    min-height: 360px;
				    max-height: calc(100vh - 290px);
			    resize: vertical;
			    border: 1px solid var(--df-review-line);
			    border-radius: 6px;
			    padding: 10px;
			    background: var(--df-review-bg);
			    color: var(--df-review-text);
			    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
			    font-size: 11px;
			    font-weight: 600;
			    line-height: 1.5;
			    white-space: pre;
			  }

			  .df-review-prompt-block textarea:focus {
			    outline: 2px solid rgba(124, 199, 255, 0.58);
			    outline-offset: 1px;
			  }

				  .df-review-tools {
			    display: flex;
			    align-items: center;
		    justify-content: space-between;
		    gap: 12px;
		    width: 100%;
		    max-width: 1440px;
		    min-width: 0;
		    margin: 0 auto;
		  }

		  .df-review-tool-controls {
		    display: flex;
		    align-items: center;
		    justify-content: flex-start;
		    gap: 12px;
		    min-width: 0;
		    flex-wrap: wrap;
	  }

		  .df-review-presets,
		  .df-review-mode,
	  .df-review-overlays {
	    display: flex;
	    align-items: center;
	    gap: 6px;
	  }

		  .df-review-tool-divider,
		  .df-review-mode-divider {
		    display: inline-flex;
		    align-items: center;
		    color: var(--df-review-line);
		    font-size: 18px;
		    font-weight: 700;
	    line-height: 1;
		    user-select: none;
	  }

		  .df-review-active-size {
		    flex: 0 0 auto;
		    display: inline-flex;
		    align-items: center;
		    min-height: 38px;
		    color: var(--df-review-muted);
		    font-size: 12px;
		    font-variant-numeric: tabular-nums;
	    font-weight: 800;
	    line-height: 1;
	  }

	  .df-review-presets button {
	    display: inline-flex;
	    align-items: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 11px 0 9px;
  }

  .df-review-presets button svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
  }

  .df-review-preset-copy {
    display: grid;
    gap: 1px;
    min-width: 0;
    text-align: left;
    line-height: 1.05;
  }

  .df-review-preset-copy strong {
    color: var(--df-review-text);
    font-size: 12px;
  }

	  .df-review-overlay-button,
	  .df-review-mode-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: 38px;
	    min-width: 38px;
	    padding: 0;
	    color: var(--df-review-muted);
	  }

  .df-review-overlay-button svg,
  .df-review-mode-button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
	  }

	  .df-review-overlay-button.is-grid {
	    border-color: rgba(124, 199, 255, 0.46);
	    background: var(--df-review-accent-soft);
	    color: var(--df-review-accent);
	  }

	  .df-review-overlay-button.is-grid:hover,
	  .df-review-overlay-button.is-grid.is-active {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-accent-hover);
	    color: #c7e7ff;
	  }

	  .df-review-overlay-button.is-figma {
	    border-color: rgba(255, 143, 97, 0.46);
	    background: rgba(255, 143, 97, 0.14);
	    color: #ffab83;
	  }

		  .df-review-overlay-button.is-figma:hover,
		  .df-review-overlay-button.is-figma.is-active {
		    border-color: #ff8f61;
		    background: rgba(255, 143, 97, 0.24);
		    color: #ffd1bf;
		  }

		  .df-review-overlay-button.is-ruler {
		    border-color: rgba(179, 149, 255, 0.46);
		    background: rgba(179, 149, 255, 0.14);
		    color: #c9b8ff;
		  }

		  .df-review-overlay-button.is-ruler:hover,
		  .df-review-overlay-button.is-ruler.is-active {
		    border-color: #b395ff;
		    background: rgba(179, 149, 255, 0.24);
		    color: #e1d8ff;
		  }

		  .df-review-overlay-button.is-settings {
		    color: var(--df-review-muted);
		  }

		  .df-review-overlay-button.is-settings:hover {
		    color: var(--df-review-text);
		  }

	  .df-review-overlay-button.is-disabled,
	  .df-review-overlay-button.is-disabled:hover {
	    cursor: not-allowed;
	    border-color: var(--df-review-line);
	    background: var(--df-review-line-soft);
	    color: var(--df-review-subtle);
	  }

	  .df-review-mode-button.is-note {
	    border-color: rgba(243, 183, 95, 0.46);
	    background: var(--df-review-note-soft);
	    color: var(--df-review-note);
	  }

		  .df-review-mode-button.is-note:hover,
		  .df-review-mode-button.is-note.is-active {
		    border-color: var(--df-review-note);
		    background: rgba(243, 183, 95, 0.24);
		    color: #ffd99a;
		  }

		  .df-review-mode-button.is-element {
		    border-color: rgba(255, 143, 97, 0.46);
		    background: rgba(255, 143, 97, 0.14);
		    color: #ff8f61;
		  }

		  .df-review-mode-button.is-element:hover,
		  .df-review-mode-button.is-element.is-active {
		    border-color: #ff8f61;
		    background: rgba(255, 143, 97, 0.24);
		    color: #ffc3ad;
		  }

		  .df-review-mode-button.is-capture {
		    border-color: rgba(99, 215, 199, 0.46);
		    background: var(--df-review-capture-soft);
	    color: var(--df-review-capture);
	  }

	  .df-review-mode-button.is-capture:hover,
	  .df-review-mode-button.is-capture.is-active {
	    border-color: var(--df-review-capture);
	    background: rgba(99, 215, 199, 0.24);
	    color: #bdf4ed;
	  }

  .df-review-overlay-button::after,
  .df-review-mode-button::after {
    content: attr(data-tooltip);
    position: absolute;
    right: 0;
    bottom: -30px;
    z-index: 4;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-2px);
	    border: 1px solid var(--df-review-line);
	    border-radius: 5px;
	    padding: 4px 7px;
	    background: var(--df-review-tooltip-bg);
	    color: var(--df-review-text);
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    transition:
      opacity 120ms ease,
      transform 120ms ease;
  }

  .df-review-overlay-button:hover::after,
  .df-review-overlay-button:focus-visible::after,
  .df-review-mode-button:hover::after,
  .df-review-mode-button:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
  }

	  .df-review-side-rail {
	    grid-column: 3;
	    grid-row: 1 / span 2;
	    display: flex;
	    align-items: stretch;
	    justify-content: center;
	    min-width: 0;
	    min-height: 0;
	    border-left: 1px solid var(--df-review-line);
	    background: var(--df-review-side-rail);
	  }

  .df-review-side-toggle {
    display: grid;
    grid-template-rows: 28px auto;
    align-items: start;
    justify-items: center;
    gap: 8px;
    width: 100%;
    min-height: 100%;
    border: 0;
	    border-radius: 0;
	    padding: 10px 0;
	    background: transparent;
	    color: var(--df-review-muted);
	  }

	  .df-review-side-toggle:hover {
	    background: var(--df-review-accent-soft);
	    color: var(--df-review-text);
	  }

  .df-review-side-toggle span {
    display: grid;
    place-items: center;
	    width: 20px;
	    height: 24px;
	    line-height: 1;
	  }

	  .df-review-side-toggle svg {
	    width: 18px;
	    height: 18px;
	    fill: none;
	    stroke: currentColor;
	    stroke-linecap: round;
	    stroke-width: 2;
	  }

  .df-review-side-toggle strong {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: inherit;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.08em;
  }

	  .df-review-qa-panel {
	    grid-column: 2;
	    grid-row: 1 / span 2;
	    display: grid;
	    grid-template-rows: minmax(0, 1fr);
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	    border-left: 1px solid var(--df-review-line);
	    background: var(--df-review-panel);
	  }

	  .df-review-shell:not(.is-list-visible) .df-review-qa-panel {
	    visibility: hidden;
	    border-left: 0;
	  }

	  .df-review-panel-body {
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-item-list {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }

		  .df-review-list-header {
		    display: grid;
		    grid-template-columns: minmax(0, 1fr) auto;
		    align-items: center;
		    gap: 8px;
		    min-height: 48px;
		    padding: 8px 10px 8px 12px;
		    border-bottom: 1px solid var(--df-review-line-soft);
		    color: var(--df-review-muted);
		    font-size: 12px;
		    font-weight: 800;
		  }

		  .df-review-list-title {
		    display: flex;
		    align-items: center;
		    gap: 8px;
		    min-width: 0;
		  }

		  .df-review-list-title span {
		    min-width: 0;
		    overflow: hidden;
		    text-overflow: ellipsis;
		    white-space: nowrap;
		  }

		  .df-review-list-title strong {
		    flex: 0 0 auto;
		    color: var(--df-review-muted);
		    font-size: 11px;
		    font-variant-numeric: tabular-nums;
		  }

		  .df-review-filter-tabs {
		    display: flex;
		    align-items: center;
		    gap: 3px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: 7px;
		    padding: 2px;
		    background: var(--df-review-line-soft);
		  }

		  .df-review-filter-tab {
		    position: relative;
		    display: grid;
		    place-items: center;
		    width: 28px;
		    min-width: 28px;
		    height: 28px;
		    border: 0;
		    border-radius: 5px;
		    padding: 0;
		    background: transparent;
		    color: var(--df-review-subtle);
		  }

		  .df-review-filter-tab:hover,
		  .df-review-filter-tab.is-active {
		    background: var(--df-review-accent-soft);
		    color: var(--df-review-text);
		  }

		  .df-review-filter-tab.is-active {
		    box-shadow: inset 0 0 0 1px rgba(124, 199, 255, 0.42);
		    color: var(--df-review-accent);
		  }

		  .df-review-filter-tab svg {
		    width: 15px;
		    height: 15px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
		    stroke-width: 2;
		  }

		  .df-review-filter-tab::after {
		    content: attr(data-tooltip);
		    position: absolute;
		    right: 0;
		    bottom: -29px;
		    z-index: 6;
		    pointer-events: none;
		    opacity: 0;
		    transform: translateY(-2px);
		    border: 1px solid var(--df-review-line);
		    border-radius: 5px;
		    padding: 4px 7px;
		    background: var(--df-review-tooltip-bg);
		    color: var(--df-review-text);
		    font-size: 11px;
		    font-weight: 800;
		    white-space: nowrap;
		    transition:
		      opacity 120ms ease,
		      transform 120ms ease;
		  }

		  .df-review-filter-tab:hover::after,
		  .df-review-filter-tab:focus-visible::after {
		    opacity: 1;
		    transform: translateY(0);
		  }

  .df-review-list-scroll {
    min-height: 0;
    overflow: auto;
  }

	  .df-review-empty {
	    margin: 0;
	    padding: 14px 12px;
	    color: var(--df-review-subtle);
	    font-size: 12px;
	    line-height: 1.45;
	  }

  .df-review-item-card {
	    position: relative;
	    display: grid;
	    gap: 8px;
	    padding: 10px 38px 10px 12px;
	    border-bottom: 1px solid var(--df-review-line-soft);
	  }

	  .df-review-item-card.is-active {
	    background: var(--df-review-accent-soft);
	  }

  .df-review-item-main {
    display: grid;
    gap: 4px;
    min-width: 0;
	    border: 0;
	    padding: 0;
	    text-align: left;
	    background: transparent;
	    color: var(--df-review-text);
	  }

  .df-review-item-main strong {
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 1.35;
  }

	  .df-review-item-main small {
	    color: var(--df-review-subtle);
	    font-size: 11px;
	  }

  .df-review-item-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-item-viewport,
	  .df-review-item-kind,
	  .df-review-item-status-badge {
    --df-review-scope: var(--df-review-accent);
    --df-review-scope-rgb: 124, 199, 255;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 20px;
    border: 1px solid var(--df-review-line);
    border-radius: 999px;
    padding: 0 7px;
    font-size: 10px;
    font-weight: 900;
    line-height: 1;
    text-transform: uppercase;
  }

  .df-review-item-viewport.is-scope-tablet {
    --df-review-scope: var(--df-review-capture);
    --df-review-scope-rgb: 99, 215, 199;
  }

  .df-review-item-viewport.is-scope-desktop {
    --df-review-scope: var(--df-review-note);
    --df-review-scope-rgb: 243, 183, 95;
  }

  .df-review-item-viewport.is-scope-wide {
    --df-review-scope: #c99cff;
    --df-review-scope-rgb: 201, 156, 255;
  }

  .df-review-item-viewport.is-scope-dom {
    --df-review-scope: #ff8f61;
    --df-review-scope-rgb: 255, 143, 97;
  }

  .df-review-item-viewport {
    border-color: rgba(var(--df-review-scope-rgb), 0.36);
    background: rgba(var(--df-review-scope-rgb), 0.12);
    color: var(--df-review-scope);
  }

  .df-review-item-viewport svg {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

	  .df-review-item-kind {
	    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

  .df-review-item-status-badge {
    border-color: var(--df-review-line);
    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

	  .df-review-item-main img {
	    width: 100%;
	    max-height: 110px;
	    border: 1px solid var(--df-review-line);
	    border-radius: 6px;
	    object-fit: cover;
	    background: var(--df-review-control);
  }

  .df-review-item-delete {
    position: absolute;
    top: 8px;
    right: 8px;
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
  }

  .df-review-item-delete svg {
    width: 14px;
    height: 14px;
  }

	  .df-review-item-actions {
	    display: flex;
	    align-items: center;
	    gap: 6px;
	    min-width: 0;
	  }

	  .df-review-item-prompt-actions {
	    display: inline-grid;
	    grid-template-columns: auto 28px;
	    align-items: stretch;
	    min-width: 0;
	  }

	  .df-review-item-prompt {
	    display: inline-flex;
	    align-items: center;
	    min-height: 28px;
	    padding: 0 8px;
	    border-top-right-radius: 0;
	    border-bottom-right-radius: 0;
	    font-size: 10px;
	    text-transform: uppercase;
	  }

	  .df-review-item-prompt-copy {
	    position: relative;
	    display: inline-grid;
	    place-items: center;
	    width: 28px;
	    min-width: 28px;
	    min-height: 28px;
	    border-left: 0;
	    border-top-left-radius: 0;
	    border-bottom-left-radius: 0;
	    padding: 0;
	  }

	  .df-review-item-prompt-copy.is-copied {
	    border-color: var(--df-review-accent);
	    color: var(--df-review-accent);
	  }

	  .df-review-item-prompt-copy::after {
	    content: attr(data-tooltip);
	    position: absolute;
	    right: 0;
	    bottom: calc(100% + 7px);
	    z-index: 5;
	    pointer-events: none;
	    opacity: 0;
	    transform: translateY(2px);
	    border: 1px solid var(--df-review-line);
	    border-radius: 5px;
	    padding: 4px 7px;
	    background: var(--df-review-tooltip-bg);
	    color: var(--df-review-text);
	    font-size: 11px;
	    font-weight: 800;
	    text-transform: none;
	    white-space: nowrap;
	    transition:
	      opacity 120ms ease,
	      transform 120ms ease;
	  }

	  .df-review-item-prompt-copy:hover::after,
	  .df-review-item-prompt-copy:focus-visible::after {
	    opacity: 1;
	    transform: translateY(0);
	  }

	  .df-review-item-prompt-copy svg {
	    width: 12px;
	    height: 12px;
	    fill: none;
	    stroke: currentColor;
	    stroke-linecap: round;
	    stroke-linejoin: round;
	    stroke-width: 2;
	  }

  .df-review-item-status-select {
    width: min(100%, 112px);
    min-height: 28px;
    padding: 0 7px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    font-size: 11px;
    font-weight: 800;
  }

	  .df-review-stage {
	    grid-column: 1;
	    grid-row: 2;
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-frame {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    min-width: 0;
    min-height: 0;
  }

  .df-review-frame-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    padding: 8px 40px 10px;
    border-top: 1px solid var(--df-review-line-soft);
    background: var(--df-review-mode-bar);
  }

  .df-review-frame-actions .df-review-mode-button::after {
    top: -30px;
    bottom: auto;
  }

	  .df-review-frame-scroll {
	    min-width: 0;
	    min-height: 0;
	    overflow: auto;
	  }

	  .df-review-frame-canvas {
	    display: grid;
	    place-items: center;
	    width: max-content;
	    height: max-content;
	    min-width: 100%;
	    min-height: 100%;
	    padding: 8px 40px;
	  }

  .df-review-device {
	    box-sizing: border-box;
	    flex: 0 0 auto;
	    position: relative;
	    margin: 0;
	    overflow: hidden;
	    border: 1px solid rgba(226, 233, 245, 0.22);
	    border-radius: 8px;
	    background: #fff;
	    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.38);
  }

  .df-review-device iframe {
    display: block;
    width: inherit;
    height: inherit;
    min-width: inherit;
    min-height: inherit;
    border: 0;
    background: #fff;
  }

  .df-review-ruler-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: inherit;
    height: inherit;
    z-index: 5;
    cursor: crosshair;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    background:
      linear-gradient(
        to right,
        rgba(179, 149, 255, 0.18) 1px,
        transparent 1px
      )
      0 0 / var(--df-review-ruler-major-x) 100%,
      linear-gradient(
        to bottom,
        rgba(179, 149, 255, 0.18) 1px,
        transparent 1px
      )
      0 0 / 100% var(--df-review-ruler-major-y),
      linear-gradient(
        to right,
        rgba(179, 149, 255, 0.08) 1px,
        transparent 1px
      )
      0 0 / var(--df-review-ruler-step-x) 100%,
      linear-gradient(
        to bottom,
        rgba(179, 149, 255, 0.08) 1px,
        transparent 1px
      )
      0 0 / 100% var(--df-review-ruler-step-y);
  }

  .df-review-ruler-overlay.is-dragging {
    cursor: crosshair;
  }

  .df-review-ruler-axis {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    border: 0 solid rgba(237, 243, 251, 0.18);
    background: rgba(10, 13, 18, 0.76);
    backdrop-filter: blur(5px);
  }

  .df-review-ruler-axis.is-x {
    left: 0;
    right: 0;
    top: 0;
    height: 24px;
    border-bottom-width: 1px;
    background-image: linear-gradient(
      to right,
      rgba(237, 243, 251, 0.28) 1px,
      transparent 1px
    );
    background-size: var(--df-review-ruler-step-x) 100%;
  }

  .df-review-ruler-axis.is-y {
    left: 0;
    top: 0;
    bottom: 0;
    width: 24px;
    border-right-width: 1px;
    background-image: linear-gradient(
      to bottom,
      rgba(237, 243, 251, 0.28) 1px,
      transparent 1px
    );
    background-size: 100% var(--df-review-ruler-step-y);
  }

  .df-review-ruler-guide {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    background: rgba(255, 255, 255, 0.74);
    box-shadow: 0 0 0 1px rgba(87, 55, 166, 0.45);
  }

  .df-review-ruler-guide.is-x {
    left: 0;
    right: 0;
    height: 1px;
  }

  .df-review-ruler-guide.is-y {
    top: 0;
    bottom: 0;
    width: 1px;
  }

  .df-review-ruler-selection {
    position: absolute;
    z-index: 3;
    pointer-events: none;
    border: 1px solid #c9b8ff;
    background: rgba(179, 149, 255, 0.16);
    box-shadow:
      inset 0 0 0 1px rgba(20, 12, 40, 0.38),
      0 0 0 1px rgba(20, 12, 40, 0.38);
  }

  .df-review-ruler-label,
  .df-review-ruler-info {
    position: absolute;
    z-index: 4;
    pointer-events: none;
    border: 1px solid rgba(237, 243, 251, 0.22);
    border-radius: 6px;
    background: rgba(10, 13, 18, 0.9);
    color: var(--df-review-text);
    font-size: 11px;
    font-weight: 900;
    line-height: 1;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.34);
  }

  .df-review-ruler-label {
    min-width: 156px;
    padding: 7px 8px;
    white-space: nowrap;
  }

  .df-review-ruler-info {
    right: 8px;
    top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 28px;
    padding: 0 8px;
  }

  .df-review-ruler-info strong {
    color: #e1d8ff;
    font-size: 11px;
  }

  .df-review-ruler-info span {
    color: var(--df-review-muted);
    font-size: 10px;
    font-weight: 900;
  }

	  @media (max-width: 860px) {
	    .df-review-shell,
	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) 0 32px;
	      grid-template-rows: auto minmax(0, 1fr);
	    }

	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) minmax(260px, 70vw) 32px;
	    }

	    .df-review-qa-panel {
	      border-left: 1px solid var(--df-review-line);
	      border-bottom: 0;
	    }

	    .df-review-tools {
	      flex-wrap: wrap;
	    }

	    .df-review-tool-controls {
	      justify-content: flex-start;
	    }

    .df-review-frame-actions {
      padding: 8px 20px 10px;
    }

	    .df-review-frame-canvas {
	      padding: 8px 20px;
	    }

		    .df-review-prompt-modal {
		      padding: 12px;
		    }

		    .df-review-prompt-dialog {
		      width: calc(100vw - 24px);
		      max-height: calc(100vh - 24px);
		    }

		    .df-review-prompt-block textarea {
		      height: min(360px, calc(100vh - 270px));
		      min-height: 240px;
		      max-height: calc(100vh - 270px);
		    }

	    .df-review-panel-body {
	      min-height: 0;
	    }
  }
    `;
    document.head.append(style);
  }
  const root = document.getElementById(rootId);
  if (!root) return;
  root.style.width = "100%";
  root.style.height = "100%";
  root.style.margin = "0";
  createRoot(root).render(
    /* @__PURE__ */ jsx(React.StrictMode, { children: /* @__PURE__ */ jsx(ReviewShell, { ...shellProps }) })
  );
};
export {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ReviewShell,
  createReviewPagesFromGlob,
  mountReviewShell
};
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs:
lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs:
lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs:
lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs:
lucide-react/dist/esm/defaultAttributes.mjs:
lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs:
lucide-react/dist/esm/context.mjs:
lucide-react/dist/esm/Icon.mjs:
lucide-react/dist/esm/createLucideIcon.mjs:
lucide-react/dist/esm/icons/circle-question-mark.mjs:
lucide-react/dist/esm/icons/copy.mjs:
lucide-react/dist/esm/icons/eye-off.mjs:
lucide-react/dist/esm/icons/eye.mjs:
lucide-react/dist/esm/icons/grip-vertical.mjs:
lucide-react/dist/esm/icons/image.mjs:
lucide-react/dist/esm/icons/layout-grid.mjs:
lucide-react/dist/esm/icons/list-filter.mjs:
lucide-react/dist/esm/icons/map.mjs:
lucide-react/dist/esm/icons/maximize-2.mjs:
lucide-react/dist/esm/icons/monitor.mjs:
lucide-react/dist/esm/icons/rectangle-horizontal.mjs:
lucide-react/dist/esm/icons/ruler.mjs:
lucide-react/dist/esm/icons/scan.mjs:
lucide-react/dist/esm/icons/settings.mjs:
lucide-react/dist/esm/icons/smartphone.mjs:
lucide-react/dist/esm/icons/square-mouse-pointer.mjs:
lucide-react/dist/esm/icons/sticky-note.mjs:
lucide-react/dist/esm/icons/x.mjs:
lucide-react/dist/esm/lucide-react.mjs:
  (**
   * @license lucide-react v1.20.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=react-shell.js.map