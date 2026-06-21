"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react-shell.tsx
var react_shell_exports = {};
__export(react_shell_exports, {
  DEFAULT_REVIEW_VIEWPORT_PRESETS: () => DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ReviewShell: () => ReviewShell,
  createFallbackPresenceAdapter: () => createFallbackPresenceAdapter,
  createLocalPresenceAdapter: () => createLocalPresenceAdapter,
  createReviewPagesFromGlob: () => createReviewPagesFromGlob,
  createSupabasePresenceAdapter: () => createSupabasePresenceAdapter,
  mountReviewShell: () => mountReviewShell
});
module.exports = __toCommonJS(react_shell_exports);
var import_react4 = __toESM(require("react"), 1);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
var import_react3 = require("react");

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
var import_react2 = require("react");

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
var import_react = require("react");
var LucideContext = (0, import_react.createContext)({});
var useLucideContext = () => (0, import_react.useContext)(LucideContext);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/Icon.mjs
var Icon = (0, import_react2.forwardRef)(
  ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = "currentColor",
      className: contextClass = ""
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
    return (0, import_react2.createElement)(
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
        ...iconNode.map(([tag, attrs]) => (0, import_react2.createElement)(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
var createLucideIcon = (iconName, iconNode) => {
  const Component = (0, import_react3.forwardRef)(
    ({ className, ...props }, ref) => (0, import_react3.createElement)(Icon, {
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

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/external-link.mjs
var __iconNode3 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
var ExternalLink = createLucideIcon("external-link", __iconNode3);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/eye-off.mjs
var __iconNode4 = [
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
var EyeOff = createLucideIcon("eye-off", __iconNode4);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/eye.mjs
var __iconNode5 = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Eye = createLucideIcon("eye", __iconNode5);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/grip-vertical.mjs
var __iconNode6 = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
var GripVertical = createLucideIcon("grip-vertical", __iconNode6);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/image.mjs
var __iconNode7 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
var Image = createLucideIcon("image", __iconNode7);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/layout-grid.mjs
var __iconNode8 = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
var LayoutGrid = createLucideIcon("layout-grid", __iconNode8);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/list-filter.mjs
var __iconNode9 = [
  ["path", { d: "M2 5h20", key: "1fs1ex" }],
  ["path", { d: "M6 12h12", key: "8npq4p" }],
  ["path", { d: "M9 19h6", key: "456am0" }]
];
var ListFilter = createLucideIcon("list-filter", __iconNode9);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/map.mjs
var __iconNode10 = [
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
var Map2 = createLucideIcon("map", __iconNode10);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/maximize-2.mjs
var __iconNode11 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
var Maximize2 = createLucideIcon("maximize-2", __iconNode11);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/monitor.mjs
var __iconNode12 = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
var Monitor = createLucideIcon("monitor", __iconNode12);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/rectangle-horizontal.mjs
var __iconNode13 = [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }]
];
var RectangleHorizontal = createLucideIcon("rectangle-horizontal", __iconNode13);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs
var __iconNode14 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
var RefreshCw = createLucideIcon("refresh-cw", __iconNode14);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/ruler.mjs
var __iconNode15 = [
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
var Ruler = createLucideIcon("ruler", __iconNode15);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/scan.mjs
var __iconNode16 = [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }]
];
var Scan = createLucideIcon("scan", __iconNode16);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/settings.mjs
var __iconNode17 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Settings = createLucideIcon("settings", __iconNode17);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/smartphone.mjs
var __iconNode18 = [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
];
var Smartphone = createLucideIcon("smartphone", __iconNode18);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/square-mouse-pointer.mjs
var __iconNode19 = [
  [
    "path",
    {
      d: "M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z",
      key: "xwnzip"
    }
  ],
  ["path", { d: "M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6", key: "14rsvq" }]
];
var SquareMousePointer = createLucideIcon("square-mouse-pointer", __iconNode19);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/sticky-note.mjs
var __iconNode20 = [
  [
    "path",
    {
      d: "M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z",
      key: "1dfntj"
    }
  ],
  ["path", { d: "M15 3v5a1 1 0 0 0 1 1h5", key: "6s6qgf" }]
];
var StickyNote = createLucideIcon("sticky-note", __iconNode20);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/upload.mjs
var __iconNode21 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
var Upload = createLucideIcon("upload", __iconNode21);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/users.mjs
var __iconNode22 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
var Users = createLucideIcon("users", __iconNode22);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/x.mjs
var __iconNode23 = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
var X = createLucideIcon("x", __iconNode23);

// src/react-shell.tsx
var import_client = require("react-dom/client");

// src/status.ts
var REVIEW_WORKFLOW_STATUS_OPTIONS = [
  { value: "todo", label: "\uC791\uC5C5\uC804" },
  { value: "doing", label: "\uC791\uC5C5\uC911" },
  { value: "review", label: "\uAC80\uD1A0 \uD544\uC694" },
  { value: "hold", label: "\uBCF4\uB958" },
  { value: "done", label: "\uC644\uB8CC" }
];
function normalizeReviewItemStatus(status) {
  if (status === "resolved") return "done";
  if (status === "open" || !status) return "todo";
  return status;
}
function matchesReviewItemStatus(itemStatus, queryStatus) {
  return normalizeReviewItemStatus(itemStatus) === normalizeReviewItemStatus(queryStatus);
}

// src/react-shell/adapters.ts
var ALL_REVIEW_WRITE_MODES = ["dom", "note", "area"];
function normalizeReviewShellAdapters(adapters) {
  if (Array.isArray(adapters)) {
    const normalized = adapters.map((adapter) => normalizeShellAdapter(adapter));
    const local = normalized.find((adapter) => adapter.label === "local") ?? null;
    const remote = normalized.find((adapter) => adapter.label !== "local") ?? null;
    if (normalized.length === 0 || !local && !remote) {
      throw new Error("ReviewShell requires at least one adapter.");
    }
    return {
      local,
      remote,
      sources: normalized
    };
  }
  return normalizeLegacyAdapterMap(adapters);
}
function normalizeLegacyAdapterMap(adapters) {
  const local = {
    label: "local",
    adapter: adapters.local,
    statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
    updateStatus: ({ id, status }) => adapters.local.update(id, { status }),
    syncSubmission: ({ id, patch }) => adapters.local.update(id, patch),
    writeModes: [...ALL_REVIEW_WRITE_MODES],
    canRemove: true
  };
  const remote = adapters.remote ? {
    label: "df-sheet",
    adapter: adapters.remote,
    statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
    updateStatus: ({ id, status }) => adapters.remote?.update(id, { status }) ?? Promise.reject(new Error("Remote adapter is not available.")),
    writeModes: [],
    canRemove: false,
    pageId: adapters.remotePageId
  } : null;
  return {
    local,
    remote,
    sources: remote ? [local, remote] : [local]
  };
}
function normalizeShellAdapter(adapterConfig) {
  const statusOptions = [
    ...adapterConfig.statusOptions ?? REVIEW_WORKFLOW_STATUS_OPTIONS
  ];
  const updateAdapter = adapterConfig.update;
  const updateStatus = adapterConfig.updateStatus ? adapterConfig.updateStatus : updateAdapter ? ({ id, status }) => updateAdapter(id, { status }) : void 0;
  const writeModes = normalizeWriteModes(
    adapterConfig.create ? adapterConfig.canWrite ?? adapterConfig.label === "local" : false
  );
  return {
    label: adapterConfig.label,
    pageId: adapterConfig.pageId,
    statusOptions,
    updateStatus,
    syncSubmission: adapterConfig.syncSubmission,
    writeModes,
    canRemove: Boolean(adapterConfig.remove),
    adapter: {
      get: adapterConfig.get,
      list: adapterConfig.list,
      create: async (item) => {
        if (!adapterConfig.create) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support create.`
          );
        }
        return adapterConfig.create(item);
      },
      update: async (id, patch) => {
        const nextStatus = patch.status;
        if (nextStatus && updateStatus) {
          const statusIndex = statusOptions.findIndex(
            (statusOption2) => statusOption2.value === nextStatus
          );
          const statusOption = statusOptions[statusIndex];
          if (statusOption) {
            const item2 = await adapterConfig.get(id);
            if (!item2) throw new Error(`Review item not found: ${id}`);
            const updated2 = await updateStatus({
              id,
              item: item2,
              status: nextStatus,
              statusOption,
              statusIndex
            });
            return updated2;
          }
        }
        if (updateAdapter) {
          return updateAdapter(id, patch);
        }
        if (!adapterConfig.syncSubmission) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support update.`
          );
        }
        const item = await adapterConfig.get(id);
        if (!item) throw new Error(`Review item not found: ${id}`);
        await adapterConfig.syncSubmission({
          id,
          item,
          patch
        });
        const updated = await adapterConfig.get(id);
        if (!updated) throw new Error(`Review item not found after update: ${id}`);
        return updated;
      },
      remove: async (id) => {
        if (!adapterConfig.remove) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support remove.`
          );
        }
        return adapterConfig.remove(id);
      }
    }
  };
}
function normalizeWriteModes(value) {
  if (value === true) return [...ALL_REVIEW_WRITE_MODES];
  if (Array.isArray(value)) {
    const modes = value.filter(
      (mode) => ALL_REVIEW_WRITE_MODES.includes(mode)
    );
    return Array.from(new Set(modes));
  }
  return [];
}

// src/react-shell/style.ts
var REVIEW_SHELL_STYLE_ID = "df-review-shell-style";
function ensureReviewShellStyle() {
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
	    border-radius: var(--df-review-radius-pill);
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
	    color-scheme: dark;

	    /* df-review-token layer. Keep these names internal to review-kit. */
	    --df-review-font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	    --df-review-font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
	    --df-review-font-size-3xs: 9px;
	    --df-review-font-size-2xs: 10px;
	    --df-review-font-size-xs: 11px;
	    --df-review-font-size-sm: 12px;
	    --df-review-font-size-md: 13px;
	    --df-review-font-size-lg: 14px;
	    --df-review-font-size-xl: 15px;
	    --df-review-font-size-2xl: 18px;
	    --df-review-font-weight-medium: 650;
	    --df-review-font-weight-bold: 700;
	    --df-review-font-weight-strong: 800;
	    --df-review-font-weight-heavy: 900;
	    --df-review-line-height-tight: 1.25;
	    --df-review-line-height-base: 1.42;
	    --df-review-line-height-relaxed: 1.55;
	    --df-review-space-0: 0;
	    --df-review-space-1: 4px;
	    --df-review-space-1-5: 6px;
	    --df-review-space-2: 8px;
	    --df-review-space-2-5: 10px;
	    --df-review-space-3: 12px;
	    --df-review-space-3-5: 14px;
	    --df-review-space-4: 16px;
	    --df-review-space-5: 20px;
	    --df-review-space-6: 24px;
	    --df-review-space-8: 32px;
	    --df-review-control-height-sm: 32px;
	    --df-review-control-height-md: 34px;
	    --df-review-control-height-lg: 38px;
	    --df-review-radius-xs: 3px;
	    --df-review-radius-sm: 6px;
	    --df-review-radius-md: 8px;
	    --df-review-radius-lg: 12px;
	    --df-review-radius-pill: 999px;
	    --df-review-color-canvas: #0f1218;
	    --df-review-color-surface: #171c24;
	    --df-review-color-panel: #131821;
	    --df-review-color-panel-strong: #1b2430;
	    --df-review-color-card: rgba(237, 243, 251, 0.035);
	    --df-review-color-card-hover: rgba(237, 243, 251, 0.065);
	    --df-review-color-control: #202938;
	    --df-review-color-control-hover: #273345;
	    --df-review-color-border: rgba(226, 233, 245, 0.14);
	    --df-review-color-border-soft: rgba(226, 233, 245, 0.08);
	    --df-review-color-text: #edf3fb;
	    --df-review-color-text-muted: rgba(237, 243, 251, 0.58);
	    --df-review-color-text-subtle: rgba(237, 243, 251, 0.42);
	    --df-review-color-accent: #7cc7ff;
	    --df-review-color-accent-contrast: #0f1218;
	    --df-review-color-accent-soft: rgba(124, 199, 255, 0.12);
	    --df-review-color-accent-hover: rgba(124, 199, 255, 0.2);
	    --df-review-color-danger: #ff8f61;
	    --df-review-color-danger-soft: rgba(255, 143, 97, 0.12);
	    --df-review-color-purple: #b395ff;
	    --df-review-color-purple-soft: rgba(179, 149, 255, 0.16);
	    --df-review-color-note: #f3b75f;
	    --df-review-color-note-soft: rgba(243, 183, 95, 0.14);
	    --df-review-color-area: #63d7c7;
	    --df-review-color-area-soft: rgba(99, 215, 199, 0.14);
	    --df-review-color-side-rail: #111722;
	    --df-review-color-mode-bar: rgba(15, 18, 24, 0.86);
	    --df-review-color-chip: rgba(237, 243, 251, 0.06);
	    --df-review-color-scrollbar-track: rgba(237, 243, 251, 0.04);
	    --df-review-color-scrollbar-thumb: rgba(237, 243, 251, 0.18);
	    --df-review-color-scrollbar-thumb-hover: rgba(237, 243, 251, 0.28);
	    --df-review-color-scrollbar-border: rgba(15, 18, 24, 0.92);
	    --df-review-color-backdrop: rgba(2, 6, 12, 0.62);
	    --df-review-focus-ring: rgba(124, 199, 255, 0.58);
	    --df-review-shadow-card: 0 14px 36px rgba(0, 0, 0, 0.34);
	    --df-review-shadow-control: inset 0 1px 0 rgba(255, 255, 255, 0.04);
	    --df-review-shadow-device: 0 24px 60px rgba(0, 0, 0, 0.38);
	    --df-review-shadow-panel: 0 18px 48px rgba(0, 0, 0, 0.38);
	    --df-review-shadow-modal: 0 24px 70px rgba(0, 0, 0, 0.48);

	    /* Semantic aliases consumed by the existing shell chrome. */
	    --df-review-bg: var(--df-review-color-canvas);
	    --df-review-topbar: var(--df-review-color-surface);
	    --df-review-panel: var(--df-review-color-panel);
	    --df-review-panel-strong: var(--df-review-color-panel-strong);
	    --df-review-card: var(--df-review-color-card);
	    --df-review-card-hover: var(--df-review-color-card-hover);
	    --df-review-control: var(--df-review-color-control);
	    --df-review-control-hover: var(--df-review-color-control-hover);
	    --df-review-line: var(--df-review-color-border);
	    --df-review-line-soft: var(--df-review-color-border-soft);
	    --df-review-text: var(--df-review-color-text);
	    --df-review-muted: var(--df-review-color-text-muted);
	    --df-review-subtle: var(--df-review-color-text-subtle);
	    --df-review-accent: var(--df-review-color-accent);
	    --df-review-accent-contrast: var(--df-review-color-accent-contrast);
	    --df-review-accent-soft: var(--df-review-color-accent-soft);
	    --df-review-accent-hover: var(--df-review-color-accent-hover);
	    --df-review-danger: var(--df-review-color-danger);
	    --df-review-danger-soft: var(--df-review-color-danger-soft);
	    --df-review-purple: var(--df-review-color-purple);
	    --df-review-purple-soft: var(--df-review-color-purple-soft);
	    --df-review-note: var(--df-review-color-note);
	    --df-review-note-soft: var(--df-review-color-note-soft);
	    --df-review-area: var(--df-review-color-area);
	    --df-review-area-soft: var(--df-review-color-area-soft);
	    --df-review-side-rail: var(--df-review-color-side-rail);
	    --df-review-mode-bar: var(--df-review-color-mode-bar);
	    --df-review-chip-bg: var(--df-review-color-chip);
	    --df-review-scrollbar-track: var(--df-review-color-scrollbar-track);
	    --df-review-scrollbar-thumb: var(--df-review-color-scrollbar-thumb);
	    --df-review-scrollbar-thumb-hover: var(--df-review-color-scrollbar-thumb-hover);
	    --df-review-scrollbar-border: var(--df-review-color-scrollbar-border);
	    background: var(--df-review-bg);
	    color: var(--df-review-text);
	    font-family: var(--df-review-font-sans);
	  }

	  body.df-review-theme-light {
	    color-scheme: light;
	    --df-review-color-canvas: #f4f6f9;
	    --df-review-color-surface: #ffffff;
	    --df-review-color-panel: #ffffff;
	    --df-review-color-panel-strong: #edf1f6;
	    --df-review-color-card: rgba(23, 32, 44, 0.035);
	    --df-review-color-card-hover: rgba(23, 32, 44, 0.065);
	    --df-review-color-control: #eef2f7;
	    --df-review-color-control-hover: #e3e9f1;
	    --df-review-color-border: rgba(16, 24, 40, 0.14);
	    --df-review-color-border-soft: rgba(16, 24, 40, 0.08);
	    --df-review-color-text: #17202c;
	    --df-review-color-text-muted: rgba(23, 32, 44, 0.62);
	    --df-review-color-text-subtle: rgba(23, 32, 44, 0.44);
	    --df-review-color-accent: #1769aa;
	    --df-review-color-accent-contrast: #ffffff;
	    --df-review-color-accent-soft: rgba(23, 105, 170, 0.1);
	    --df-review-color-accent-hover: rgba(23, 105, 170, 0.16);
	    --df-review-color-danger: #b94418;
	    --df-review-color-danger-soft: rgba(185, 68, 24, 0.1);
	    --df-review-color-purple: #6543b8;
	    --df-review-color-purple-soft: rgba(101, 67, 184, 0.12);
	    --df-review-color-note: #a76617;
	    --df-review-color-note-soft: rgba(167, 102, 23, 0.12);
	    --df-review-color-area: #087f73;
	    --df-review-color-area-soft: rgba(8, 127, 115, 0.12);
	    --df-review-color-side-rail: #edf1f6;
	    --df-review-color-mode-bar: rgba(255, 255, 255, 0.9);
	    --df-review-color-chip: rgba(23, 32, 44, 0.06);
	    --df-review-color-scrollbar-track: rgba(23, 32, 44, 0.06);
	    --df-review-color-scrollbar-thumb: rgba(23, 32, 44, 0.24);
	    --df-review-color-scrollbar-thumb-hover: rgba(23, 32, 44, 0.34);
	    --df-review-color-scrollbar-border: rgba(244, 246, 249, 0.92);
	    --df-review-color-backdrop: rgba(15, 23, 42, 0.32);
	    --df-review-focus-ring: rgba(23, 105, 170, 0.42);
	    --df-review-shadow-card: 0 14px 36px rgba(15, 23, 42, 0.14);
	    --df-review-shadow-control: inset 0 1px 0 rgba(255, 255, 255, 0.72);
	    --df-review-shadow-device: 0 24px 60px rgba(15, 23, 42, 0.18);
	    --df-review-shadow-panel: 0 18px 48px rgba(15, 23, 42, 0.18);
	    --df-review-shadow-modal: 0 24px 70px rgba(15, 23, 42, 0.2);
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
    --df-review-frame-gutter-x: var(--df-review-space-4);
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
	    gap: var(--df-review-space-2);
	    container-type: inline-size;
	    min-width: 0;
	    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
	    border-bottom: 1px solid var(--df-review-line-soft);
	    background:
	      linear-gradient(180deg, var(--df-review-topbar), var(--df-review-panel));
	    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.025);
	  }

		  .df-review-address {
		    display: grid;
		    grid-template-columns: auto minmax(160px, 1fr) auto auto;
		    align-items: stretch;
		    gap: var(--df-review-space-2);
		    width: 100%;
		    max-width: 1440px;
		    margin: 0 auto;
		  }

  .df-review-address input {
	    width: 100%;
	    min-height: var(--df-review-control-height-md);
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-sm);
	    padding: 0 11px;
	    color: var(--df-review-text);
	    background: var(--df-review-bg);
	    box-shadow: var(--df-review-shadow-control);
	    font-size: var(--df-review-font-size-md);
	    transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
	  }

	  .df-review-address input:focus {
	    outline: 2px solid var(--df-review-focus-ring);
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
			  .df-review-item-prompt-actions button,
			  .df-review-item-actions button {
		    min-height: var(--df-review-control-height-md);
		    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-sm);
		    background: var(--df-review-control);
	    box-shadow: var(--df-review-shadow-control);
	    color: var(--df-review-text);
	    font-size: var(--df-review-font-size-sm);
	    font-weight: 700;
	    transition: border-color 140ms ease, background 140ms ease, color 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
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
		  .df-review-item-prompt-actions button:hover,
			  .df-review-item-actions button:hover,
		  .df-review-item-visibility:hover,
		  .df-review-item-delete:hover,
		  .df-review-presets button.is-active,
			  .df-review-overlay-button.is-active,
			  .df-review-mode-button.is-active {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-control-hover);
		  }

	  .df-review-overlay-button.is-active,
  .df-review-mode-button.is-active {
    border-color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
    color: var(--df-review-accent);
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
	    background: var(--df-review-color-backdrop);
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
	    border-radius: var(--df-review-radius-lg);
	    background: var(--df-review-panel);
	    box-shadow: var(--df-review-shadow-modal);
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
    font-size: var(--df-review-font-size-lg);
  }

	  .df-review-sitemap-header span {
	    color: var(--df-review-muted);
	    font-size: var(--df-review-font-size-sm);
	    font-weight: 700;
	  }

  .df-review-sitemap-header button {
    display: grid;
    place-items: center;
	    width: 34px;
	    min-width: 34px;
	    min-height: var(--df-review-control-height-md);
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-sm);
	    background: var(--df-review-control);
	    color: var(--df-review-text);
	    font-size: var(--df-review-font-size-md);
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

  .df-review-sitemap-table-head,
  .df-review-sitemap-row {
    display: grid;
    grid-template-columns: minmax(160px, 1fr) 70px 78px minmax(96px, 140px);
    align-items: center;
    column-gap: 0;
  }

  .df-review-sitemap-table-head {
    position: sticky;
    top: 0;
    z-index: 1;
    min-height: 32px;
    border-bottom: 1px solid var(--df-review-line);
    padding: 0 10px;
    background: var(--df-review-surface);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .df-review-sitemap-table-head span:not(:first-child) {
    text-align: right;
  }

  .df-review-sitemap-row {
    min-height: 42px;
    border: 0;
    border-bottom: 1px solid var(--df-review-line-soft);
    border-radius: 0;
    padding: 0 10px;
    background: transparent;
    color: var(--df-review-text);
    text-align: left;
  }

  button.df-review-sitemap-row {
    cursor: pointer;
  }

  .df-review-sitemap-row.is-folder {
    cursor: default;
  }

  .df-review-sitemap-row:last-child {
    border-bottom: 0;
  }

  button.df-review-sitemap-row:hover,
  .df-review-sitemap-row.is-active {
    background: var(--df-review-accent-soft);
  }

  .df-review-sitemap-path {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-md);
    font-weight: 800;
    line-height: 1.35;
  }

  .df-review-sitemap-row.is-folder .df-review-sitemap-path {
    color: var(--df-review-muted);
  }

  .df-review-sitemap-tree-prefix {
    flex: 0 0 auto;
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-weight: 700;
    white-space: pre;
  }

  .df-review-sitemap-cell {
    min-width: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
    font-variant-numeric: tabular-nums;
    font-weight: 900;
    line-height: 1;
    text-align: right;
  }

  .df-review-sitemap-cell.is-local {
    color: var(--df-review-accent);
  }

  .df-review-sitemap-cell.is-remote {
    color: var(--df-review-area);
  }

  .df-review-sitemap-cell.is-online {
    display: flex;
    justify-content: flex-end;
    color: var(--df-review-text);
  }

  .df-review-sitemap-users {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-sitemap-user {
    --df-review-presence-color: var(--df-review-accent);
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    border: 1px solid var(--df-review-presence-color);
    border-radius: var(--df-review-radius-pill);
    padding: 0 7px;
    background: var(--df-review-chip-bg);
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: 900;
    line-height: 1.1;
    white-space: nowrap;
  }

  .df-review-sitemap-online-empty {
    color: var(--df-review-muted);
  }

  button.df-review-sitemap-row:hover .df-review-sitemap-path,
  .df-review-sitemap-row.is-active .df-review-sitemap-path {
    color: var(--df-review-text);
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
		    background: var(--df-review-color-backdrop);
		  }

		  .df-review-settings-dialog {
		    position: relative;
		    z-index: 1;
		    display: grid;
		    width: min(460px, calc(100vw - 48px));
		    overflow: hidden;
		    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-lg);
		    background: var(--df-review-panel);
		    box-shadow: var(--df-review-shadow-modal);
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

		  .df-review-settings-title {
		    display: grid;
		    gap: 2px;
		    min-width: 0;
		  }

		  .df-review-settings-header-actions {
		    display: inline-flex;
		    align-items: center;
		    justify-content: flex-end;
		    gap: 8px;
		    min-width: 0;
		  }

		  .df-review-settings-theme-select {
		    min-height: 34px;
		    max-width: 118px;
		    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-sm);
		    padding: 0 9px;
		    color: var(--df-review-text);
		    background: var(--df-review-control);
		    font-size: var(--df-review-font-size-sm);
		    font-weight: 800;
		  }

		  .df-review-settings-theme-select:focus-visible {
		    outline: 2px solid var(--df-review-focus-ring);
		    outline-offset: 1px;
		  }

		  .df-review-settings-header strong {
		    color: var(--df-review-text);
		    font-size: var(--df-review-font-size-lg);
		  }

		  .df-review-settings-header span {
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-xs);
		    font-weight: 800;
		  }

		  .df-review-settings-header button {
		    display: grid;
		    place-items: center;
		    width: 34px;
		    min-width: 34px;
		    padding: 0;
		    font-size: var(--df-review-font-size-md);
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
		    font-size: var(--df-review-font-size-sm);
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
		    border-radius: var(--df-review-radius-sm);
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
			    outline: 2px solid var(--df-review-focus-ring);
			    outline-offset: 1px;
			  }

			  .df-review-settings-token-input input,
			  .df-review-settings-text-input input,
			  .df-review-settings-select-input select {
			    min-width: 0;
			    min-height: var(--df-review-control-height-lg);
			    border: 0;
		    padding: 0 10px;
		    background: transparent;
		    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-md);
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
		    min-height: var(--df-review-control-height-lg);
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
		    border-radius: var(--df-review-radius-sm);
		    padding: 9px 11px;
		    background: var(--df-review-chip-bg);
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-xs);
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
		    font-size: var(--df-review-font-size-sm);
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
			    background: var(--df-review-color-backdrop);
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
			    border-radius: var(--df-review-radius-lg);
			    background: var(--df-review-panel);
			    box-shadow: var(--df-review-shadow-modal);
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
			    font-size: var(--df-review-font-size-lg);
			  }

			  .df-review-prompt-header span {
			    overflow: hidden;
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-xs);
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
			    font-size: var(--df-review-font-size-md);
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
			    font-size: var(--df-review-font-size-xs);
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
			    font-size: var(--df-review-font-size-sm);
			    font-weight: 900;
			  }

			  .df-review-prompt-block-header span {
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-xs);
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
			    border-radius: var(--df-review-radius-sm);
			    padding: 10px;
			    background: var(--df-review-bg);
			    color: var(--df-review-text);
			    font-family: var(--df-review-font-mono);
			    font-size: var(--df-review-font-size-xs);
			    font-weight: 600;
			    line-height: 1.5;
			    white-space: pre;
			  }

			  .df-review-prompt-block textarea:focus {
			    outline: 2px solid var(--df-review-focus-ring);
			    outline-offset: 1px;
			  }

			  .df-review-prompt-about {
			    display: grid;
			    gap: 10px;
			    min-width: 0;
			  }

			  .df-review-prompt-about article {
			    display: grid;
			    gap: 6px;
			    border: 1px solid var(--df-review-line);
			    border-radius: var(--df-review-radius-md);
			    padding: 12px;
			    background: var(--df-review-surface);
			  }

			  .df-review-prompt-about strong {
			    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: 900;
			  }

			  .df-review-prompt-about p {
			    margin: 0;
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: 700;
			    line-height: 1.55;
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
	    gap: var(--df-review-space-1-5);
	    min-height: calc(var(--df-review-control-height-lg) + 6px);
	    padding: 3px;
	    border: 1px solid var(--df-review-line-soft);
	    border-radius: var(--df-review-radius-md);
	    background: var(--df-review-card);
	  }

		  .df-review-tool-divider,
		  .df-review-mode-divider {
		    display: inline-flex;
		    align-items: center;
		    color: var(--df-review-line);
		    font-size: var(--df-review-font-size-2xl);
		    font-weight: 700;
	    line-height: 1;
		    user-select: none;
	  }

		  .df-review-active-size {
		    flex: 0 0 auto;
		    display: inline-flex;
		    align-items: center;
		    min-height: var(--df-review-control-height-lg);
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-sm);
		    font-variant-numeric: tabular-nums;
	    font-weight: 800;
	    line-height: 1;
	  }

	  .df-review-presets button {
	    display: inline-flex;
	    align-items: center;
    gap: 7px;
    min-height: var(--df-review-control-height-lg);
    padding: 0 11px 0 9px;
    border-color: transparent;
    background: transparent;
    box-shadow: none;
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

  .df-review-preset-count {
    min-width: 16px;
    padding: 0 5px;
    border-radius: var(--df-review-radius-pill);
    background: var(--df-review-line-soft);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-2xs);
    font-weight: 800;
    line-height: 16px;
    text-align: center;
  }

  .df-review-presets button.is-active .df-review-preset-count {
    background: var(--df-review-accent-hover);
    color: var(--df-review-accent);
  }

  .df-review-presets button.is-active {
    color: var(--df-review-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
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
    font-size: var(--df-review-font-size-sm);
  }

	  .df-review-overlay-button,
	  .df-review-mode-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: 38px;
	    min-width: 38px;
	    padding: 0;
	    border-color: transparent;
	    background: transparent;
	    box-shadow: none;
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

	  @container (max-width: 1040px) {
	    .df-review-tools {
	      flex-direction: column;
	      align-items: stretch;
	      justify-content: flex-start;
	    }

	    .df-review-tool-controls {
	      width: 100%;
	    }

	    .df-review-presets {
	      flex-wrap: wrap;
	    }

	    .df-review-overlays {
	      width: 100%;
	      justify-content: flex-start;
	    }
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
    font-size: var(--df-review-font-size-2xs);
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
	    border-left: 1px solid var(--df-review-line-soft);
	    background:
	      linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
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
			    grid-template-rows: auto auto;
			    gap: var(--df-review-space-2);
			    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
			    border-bottom: 1px solid var(--df-review-line-soft);
			    background: var(--df-review-card);
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: 800;
			  }

			  .df-review-list-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-width: 0;
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
		    font-size: var(--df-review-font-size-xs);
		    font-variant-numeric: tabular-nums;
		  }

  .df-review-presence-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 5px;
    min-width: 0;
  }

  .df-review-presence-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
  }

  .df-review-presence-label svg {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .df-review-presence-list {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-presence-chip {
    --df-review-presence-color: var(--df-review-accent);
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    flex: 0 1 auto;
    min-height: 22px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-pill);
    padding: 0 7px;
    color: var(--df-review-text);
    background: var(--df-review-chip-bg);
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
    line-height: 1.1;
    white-space: nowrap;
  }

  .df-review-presence-chip.is-self {
    border-color: var(--df-review-presence-color);
    background: var(--df-review-accent-soft);
  }

  .df-review-presence-dot {
    width: 7px;
    min-width: 7px;
    height: 7px;
    border-radius: var(--df-review-radius-pill);
    background: var(--df-review-presence-color);
  }

  .df-review-presence-name {
    min-width: 0;
  }

		  .df-review-list-controls {
		    display: flex;
		    align-items: center;
		    gap: 4px;
		  }

		  .df-review-source-select {
		    width: 104px;
		    min-height: 30px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-sm);
		    padding: 0 24px 0 8px;
		    color: var(--df-review-text);
		    background: var(--df-review-control);
		    box-shadow: var(--df-review-shadow-control);
		    font-size: var(--df-review-font-size-xs);
		    font-weight: 800;
		  }

		  .df-review-source-refresh {
		    position: relative;
		    display: inline-grid;
		    place-items: center;
		    width: 30px;
		    min-width: 30px;
		    height: 30px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-sm);
		    padding: 0;
		    color: var(--df-review-muted);
		    background: var(--df-review-control);
		    box-shadow: var(--df-review-shadow-control);
		  }

		  .df-review-source-refresh svg {
		    width: 14px;
		    height: 14px;
		  }

			  .df-review-filter-tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 30px;
    padding: 2px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-md);
    background: var(--df-review-card);
    box-shadow: var(--df-review-shadow-control);
  }

				  .df-review-filter-tab {
    position: relative;
    display: grid;
    place-items: center;
    width: 26px;
    min-width: 26px;
    height: 26px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: var(--df-review-subtle);
  }

				  .df-review-filter-icon {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }

				  .df-review-filter-separator {
				    display: block;
				    width: 18px;
				    height: 1px;
				    border-radius: var(--df-review-radius-pill);
				    background: currentColor;
				    opacity: 0.42;
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

				  .df-review-filter-icon svg {
				    width: 15px;
				    height: 15px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
			    stroke-width: 2;
			  }

			  .df-review-filter-count {
			    color: currentColor;
			    font-size: var(--df-review-font-size-3xs);
			    font-weight: 900;
			    font-variant-numeric: tabular-nums;
			    line-height: 1;
			  }

  .df-review-list-scroll {
    display: grid;
    align-content: start;
    gap: var(--df-review-space-2);
    min-height: 0;
    overflow: auto;
    padding: var(--df-review-space-2);
  }

	  .df-review-empty {
	    margin: 0;
	    padding: var(--df-review-space-5) var(--df-review-space-4);
	    border: 1px dashed var(--df-review-line);
	    border-radius: var(--df-review-radius-lg);
	    background: var(--df-review-card);
	    color: var(--df-review-subtle);
	    font-size: var(--df-review-font-size-sm);
	    line-height: 1.45;
	  }

  .df-review-item-card.is-dim {
    opacity: 0.4;
  }

  .df-review-item-card.is-dim:hover {
    opacity: 0.72;
  }

	  .df-review-item-card {
		    position: relative;
		    display: grid;
		    gap: var(--df-review-space-2);
		    padding: var(--df-review-space-3);
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-lg);
		    background: var(--df-review-card);
		    cursor: pointer;
		    transition: border-color 140ms ease, background 140ms ease, opacity 140ms ease, transform 140ms ease;
		  }

	  .df-review-item-card:not(.is-dim) {
    border-left: 3px solid var(--df-review-accent);
    padding-left: calc(var(--df-review-space-3) - 2px);
  }

  .df-review-item-card:not(.is-dim):hover {
    border-color: var(--df-review-line);
    background: var(--df-review-card-hover);
    transform: translateY(-1px);
  }

  .df-review-item-card.is-active {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-accent-soft);
	    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
	  }

  .df-review-item-card.is-overlay-hidden .df-review-item-main {
    opacity: 0.68;
  }

  .df-review-item-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 8px;
    min-width: 0;
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
    font-size: var(--df-review-font-size-md);
    line-height: 1.35;
  }

  .df-review-item-comment {
    padding: 5px 0;
    white-space: pre-wrap;
  }

	  .df-review-item-main small {
	    color: var(--df-review-subtle);
	    font-size: var(--df-review-font-size-xs);
	  }

  .df-review-item-error {
    color: var(--df-review-danger) !important;
    overflow-wrap: anywhere;
  }

  .df-review-item-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-item-id,
  .df-review-item-scope,
  .df-review-item-mode,
  .df-review-item-status-badge,
  .df-review-item-status-select {
    --df-review-scope: var(--df-review-accent);
    --df-review-scope-rgb: 124, 199, 255;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 20px;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-pill);
    padding: 0 7px;
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
    line-height: 1;
    text-transform: uppercase;
  }

  .df-review-item-id {
    border-color: var(--df-review-line);
    background: rgba(255, 255, 255, 0.03);
    color: var(--df-review-text);
  }

  .df-review-item-scope {
    border-color: rgba(var(--df-review-scope-rgb), 0.36);
    background: rgba(var(--df-review-scope-rgb), 0.12);
    color: var(--df-review-scope);
  }

  .df-review-item-scope.is-scope-tablet {
    --df-review-scope: var(--df-review-area);
    --df-review-scope-rgb: 99, 215, 199;
  }

  .df-review-item-scope.is-scope-desktop {
    --df-review-scope: var(--df-review-note);
    --df-review-scope-rgb: 243, 183, 95;
  }

  .df-review-item-scope.is-scope-wide {
    --df-review-scope: var(--df-review-purple);
    --df-review-scope-rgb: 201, 156, 255;
  }

  .df-review-item-scope.is-scope-dom {
    --df-review-scope: var(--df-review-danger);
    --df-review-scope-rgb: 255, 143, 97;
  }

  .df-review-item-scope svg,
  .df-review-item-mode svg {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

	  .df-review-item-mode {
	    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

  .df-review-item-mode.is-mode-area {
    color: var(--df-review-area);
  }

  .df-review-item-mode.is-mode-dom {
    color: var(--df-review-danger);
  }

  .df-review-item-status-badge {
    border-color: var(--df-review-line);
    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

  .df-review-item-status-select {
    max-width: 86px;
    cursor: pointer;
    border-color: var(--df-review-line);
    color: var(--df-review-text);
    background: var(--df-review-control);
    outline: 0;
  }

  .df-review-item-status-select:focus-visible {
    border-color: var(--df-review-accent);
    box-shadow: 0 0 0 2px var(--df-review-accent-soft);
  }

  .df-review-item-status-badge.is-error {
    border-color: rgba(255, 143, 97, 0.36);
    color: var(--df-review-danger);
    background: var(--df-review-danger-soft);
  }

	  .df-review-item-main img {
	    width: 100%;
	    max-height: 110px;
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-sm);
	    object-fit: cover;
	    background: var(--df-review-control);
  }

	  .df-review-item-header-actions {
	    display: inline-flex;
	    align-items: center;
	    justify-content: flex-end;
	    gap: 4px;
	    cursor: auto;
	  }

  .df-review-item-delete,
  .df-review-item-visibility {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
  }

  .df-review-item-visibility.is-visible {
    color: var(--df-review-accent);
  }

  .df-review-item-visibility.is-hidden {
    opacity: 0.7;
    color: var(--df-review-subtle);
  }

  .df-review-item-delete svg,
  .df-review-item-visibility svg {
    width: 14px;
    height: 14px;
  }

				  .df-review-item-actions {
				    display: grid;
				    grid-template-columns: auto minmax(0, 1fr) auto;
			    align-items: center;
			    gap: 6px;
			    min-width: 0;
			  }

			  .df-review-item-prompt-actions {
			    display: inline-grid;
			    grid-template-columns: auto 28px;
		    align-items: stretch;
			    min-width: 0;
		    cursor: auto;
			  }

			  .df-review-item-status-actions {
			    display: inline-flex;
			    grid-column: 1;
			    align-items: center;
			    min-width: 0;
		    cursor: auto;
			  }

			  .df-review-item-remote-actions {
			    display: inline-flex;
			    grid-column: 3;
			    align-items: center;
			    justify-content: flex-end;
			    gap: 6px;
			    min-width: 0;
		    cursor: auto;
			  }

	  .df-review-item-prompt {
	    display: inline-flex;
	    align-items: center;
	    min-height: 28px;
	    padding: 0 8px;
	    border-top-right-radius: 0;
	    border-bottom-right-radius: 0;
	    font-size: var(--df-review-font-size-2xs);
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

	  .df-review-item-prompt-copy svg {
	    width: 12px;
	    height: 12px;
	    fill: none;
	    stroke: currentColor;
	    stroke-linecap: round;
	    stroke-linejoin: round;
	    stroke-width: 2;
	  }

  .df-review-item-action-button {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 30px;
    min-width: 30px;
    height: 28px;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: var(--df-review-control);
  }

	  .df-review-item-action-button:hover:not(:disabled) {
	    border-color: rgba(124, 199, 255, 0.42);
	    color: var(--df-review-text);
	    background: var(--df-review-control-hover);
	  }

		  .df-review-item-submit-button {
		    display: inline-flex;
		    align-items: center;
		    gap: 6px;
		    width: auto;
		    min-width: 0;
		    padding: 0 9px;
		    border-color: rgba(124, 199, 255, 0.46);
		    background: var(--df-review-accent-soft);
		    color: var(--df-review-accent);
		  }

		  .df-review-item-submit-button span {
		    font-size: var(--df-review-font-size-2xs);
		    font-weight: 900;
		    line-height: 1;
		    white-space: nowrap;
		  }

	  .df-review-item-submit-button:hover:not(:disabled) {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-accent-hover);
	    color: var(--df-review-text);
	  }

  .df-review-item-action-button:disabled {
    cursor: default;
    opacity: 0.45;
  }

  .df-review-item-action-button svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
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
	    padding: 34px 40px 12px;
	  }

  .df-review-device {
	    box-sizing: border-box;
	    flex: 0 0 auto;
	    position: relative;
	    margin: 0;
	    overflow: hidden;
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-lg);
	    background: #fff;
	    box-shadow: var(--df-review-shadow-device);
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

  .df-review-device-frame {
    position: relative;
    box-sizing: border-box;
    flex: 0 0 auto;
  }

  .df-review-ruler-corner {
    position: absolute;
    left: -26px;
    top: -26px;
    width: 26px;
    height: 26px;
    z-index: 6;
    border-right: 1px solid var(--df-review-line-soft);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: rgba(10, 13, 18, 0.92);
  }

  .df-review-ruler-gutter {
    position: absolute;
    z-index: 6;
    background: rgba(10, 13, 18, 0.92);
    color: var(--df-review-muted);
    user-select: none;
  }

  .df-review-ruler-gutter.is-x {
    left: 0;
    right: 0;
    top: -26px;
    height: 26px;
    border-bottom: 1px solid var(--df-review-line-soft);
    background-image:
      linear-gradient(to right, rgba(179, 149, 255, 0.75) 1px, transparent 1px),
      linear-gradient(to right, rgba(237, 243, 251, 0.2) 1px, transparent 1px);
    background-size:
      calc(var(--df-review-ruler-step-x) * 5) 11px,
      var(--df-review-ruler-step-x) 6px;
    background-position: left bottom;
    background-repeat: repeat-x;
  }

  .df-review-ruler-gutter.is-y {
    left: -26px;
    top: 0;
    bottom: 0;
    width: 26px;
    border-right: 1px solid var(--df-review-line-soft);
    background-image:
      linear-gradient(to bottom, rgba(179, 149, 255, 0.75) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(237, 243, 251, 0.2) 1px, transparent 1px);
    background-size:
      11px calc(var(--df-review-ruler-step-y) * 5),
      6px var(--df-review-ruler-step-y);
    background-position: right top;
    background-repeat: repeat-y;
  }

  .df-review-ruler-frame-label {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 7px;
    border-radius: 5px;
    background: rgba(20, 24, 32, 0.92);
    line-height: 1;
    white-space: nowrap;
  }

  .df-review-ruler-frame-label strong {
    color: #e1d8ff;
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
  }

  .df-review-ruler-frame-label span {
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
  }

  .df-review-ruler-coord {
    position: absolute;
    z-index: 7;
    padding: 2px 4px;
    border-radius: 4px;
    background: #b395ff;
    color: #14111f;
    font-size: var(--df-review-font-size-3xs);
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
  }

  .df-review-ruler-coord.is-x {
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .df-review-ruler-coord.is-y {
    left: 50%;
    transform: translate(-50%, -50%);
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
  }

  .df-review-ruler-overlay.is-dragging {
    cursor: crosshair;
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

  .df-review-ruler-label {
    position: absolute;
    z-index: 4;
    pointer-events: none;
    min-width: 156px;
    padding: 7px 8px;
    border: 1px solid rgba(237, 243, 251, 0.22);
    border-radius: var(--df-review-radius-sm);
    background: rgba(10, 13, 18, 0.9);
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.34);
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
	      padding: 34px 28px 12px;
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

// src/core/overlay-style.ts
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

// src/core/review-scope.ts
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

// src/core/web-review-kit-app.ts
var ROOT_ID = "df-web-review-kit-root";
var INTERNAL_QUERY_PARAMS = ["__dfwr_target"];
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
      if (!isHotkey(event, this.hotkey)) return;
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
    this.shadow.replaceChildren();
    this.shadow.append(createStyleElement());
    this.shadow.append(this.createHiddenItemsStyleElement());
    const shell = document.createElement("div");
    shell.className = `dfwr-shell${this.isOpen ? " is-open" : ""}`;
    shell.setAttribute("aria-hidden", this.isOpen ? "false" : "true");
    if (this.options.ui?.panel !== false) {
      this.panel = document.createElement("div");
      this.panel.className = "dfwr-panel";
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-label", "Web review kit");
      this.panel.append(
        this.createHeader(),
        this.createToolbar(),
        this.createBody(),
        this.createList()
      );
      shell.append(this.panel);
    } else {
      this.panel = void 0;
    }
    shell.append(this.createMarkerLayer());
    if (this.isOpen && (this.mode === "note" || this.mode === "element")) {
      shell.append(
        this.noteDraft ? this.createNotePopover(this.noteDraft) : this.mode === "element" ? this.createElementLayer() : this.createNoteLayer()
      );
    }
    if (this.isOpen && this.mode === "area" && !this.areaDraft) {
      shell.append(this.createAreaLayer());
    }
    if (this.isOpen && this.mode === "area" && this.areaDraft && this.options.ui?.panel === false) {
      if (this.areaDraft.selection) {
        shell.append(this.createAreaDraftOverlay(this.areaDraft));
      }
      shell.append(this.createAreaDraftPopover(this.areaDraft));
    }
    this.shadow.append(shell);
  }
  createHeader() {
    const header = document.createElement("div");
    header.className = "dfwr-header";
    const title = document.createElement("div");
    title.className = "dfwr-title";
    title.textContent = "Review Kit";
    const meta = document.createElement("div");
    meta.className = "dfwr-meta";
    meta.textContent = getRouteKey(this.getEnvironment());
    const titleGroup = document.createElement("div");
    titleGroup.append(title, meta);
    const close = document.createElement("button");
    close.className = "dfwr-icon-button";
    close.type = "button";
    close.textContent = "x";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => this.close());
    header.append(titleGroup, close);
    return header;
  }
  createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "dfwr-toolbar";
    toolbar.append(
      this.createToolbarButton("Note", this.mode === "note", () => {
        this.setModeState(this.mode === "note" ? "idle" : "note");
        this.noteDraft = void 0;
        this.areaDraft = void 0;
        this.render();
      }),
      this.createToolbarButton("Element", this.mode === "element", () => {
        this.setModeState(this.mode === "element" ? "idle" : "element");
        this.noteDraft = void 0;
        this.areaDraft = void 0;
        this.render();
      }),
      this.createToolbarButton(
        this.isSelectingArea ? "Selecting" : "Area",
        this.mode === "area",
        () => {
          this.setModeState(this.mode === "area" ? "idle" : "area");
          this.noteDraft = void 0;
          this.areaDraft = void 0;
          this.render();
        }
      ),
      this.createToolbarButton("Refresh", false, () => {
        void this.reload();
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
    if (this.mode === "idle") {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "Add a note or mark an area.";
      body.append(empty);
      return body;
    }
    if (this.mode === "note" || this.mode === "element") {
      body.append(this.createNoteBody());
      return body;
    }
    body.append(this.createAreaForm());
    return body;
  }
  createNoteBody() {
    const empty = document.createElement("p");
    empty.className = "dfwr-empty";
    empty.textContent = this.noteDraft ? "Write the note in the page box." : this.mode === "element" ? "Click an element to add QA." : "Click on the page to place a note.";
    return empty;
  }
  createNotePopover(draft) {
    const environment = this.getEnvironment();
    const group = document.createElement("div");
    group.className = "dfwr-note-draft";
    if (!environment) return group;
    const hostPoint = toHostPoint(draft.marker.viewport, environment);
    if (draft.selection) {
      group.append(
        this.createSelectionHighlight(
          toViewportSelection(draft.selection.viewport),
          environment,
          true
        )
      );
    }
    const pin = document.createElement("button");
    pin.className = "dfwr-note-pin";
    pin.type = "button";
    pin.setAttribute("aria-label", "Move note point");
    pin.style.left = `${hostPoint.x}px`;
    pin.style.top = `${hostPoint.y}px`;
    const popover = document.createElement("div");
    const position = getPopoverPosition(hostPoint, environment);
    popover.className = "dfwr-note-popover";
    popover.style.left = `${position.left}px`;
    popover.style.top = `${position.top}px`;
    const form = document.createElement("form");
    form.className = "dfwr-form";
    const meta = document.createElement("div");
    meta.className = "dfwr-item-date";
    meta.textContent = formatNoteDraftMeta(draft);
    const textarea = document.createElement("textarea");
    textarea.className = "dfwr-textarea";
    textarea.placeholder = "Review comment";
    textarea.rows = 4;
    textarea.value = draft.comment ?? "";
    textarea.addEventListener("input", () => {
      if (!this.noteDraft) return;
      this.noteDraft = {
        ...this.noteDraft,
        comment: textarea.value
      };
    });
    const actions = this.createFormActions("Save note", () => {
      const comment = textarea.value.trim();
      if (!comment) return;
      void this.createItem({
        kind: "note",
        comment,
        viewport: draft.viewport,
        anchor: draft.anchor,
        marker: draft.marker,
        selection: draft.selection
      });
    });
    form.append(meta, textarea, actions);
    popover.append(form);
    group.append(pin, popover);
    this.attachDraftPinDrag(pin, popover, meta, textarea);
    window.setTimeout(() => textarea.focus(), 0);
    return group;
  }
  createAreaForm() {
    const form = document.createElement("form");
    form.className = "dfwr-form";
    if (!this.areaDraft) {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "Drag on the page to select an area.";
      form.append(empty);
      return form;
    }
    const meta = document.createElement("div");
    meta.className = "dfwr-item-date";
    meta.textContent = formatAreaDraftMeta(this.areaDraft);
    form.append(meta);
    const textarea = document.createElement("textarea");
    textarea.className = "dfwr-textarea";
    textarea.placeholder = "Area comment";
    textarea.rows = 4;
    const actions = this.createFormActions("Save area", () => {
      const comment = textarea.value.trim();
      if (!comment || !this.areaDraft) return;
      void this.createItem({
        kind: "area",
        comment,
        viewport: this.areaDraft.viewport,
        anchor: this.areaDraft.anchor,
        marker: this.areaDraft.marker,
        selection: this.areaDraft.selection
      });
    });
    form.append(textarea, actions);
    return form;
  }
  createAreaDraftOverlay(draft) {
    const layer = document.createElement("div");
    layer.className = "dfwr-area-preview-layer";
    const environment = this.getEnvironment();
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
            this.options.viewports?.presets
          ),
          true,
          true
        )
      );
    }
    return layer;
  }
  createAreaDraftPopover(draft) {
    const environment = this.getEnvironment();
    const popover = document.createElement("div");
    popover.className = "dfwr-area-draft";
    if (environment && draft.selection) {
      const selection = toHostSelection(
        toViewportSelection(draft.selection.viewport),
        environment
      );
      const position = getAreaPopoverPosition(selection, environment);
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;
      popover.style.right = "auto";
    }
    popover.append(this.createAreaForm());
    return popover;
  }
  createFormActions(saveLabel, onSave) {
    const actions = document.createElement("div");
    actions.className = "dfwr-actions";
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
      this.setModeState("idle");
      this.noteDraft = void 0;
      this.areaDraft = void 0;
      this.render();
    });
    actions.append(save, cancel);
    return actions;
  }
  createList() {
    const section = document.createElement("div");
    section.className = "dfwr-list";
    const heading = document.createElement("div");
    heading.className = "dfwr-list-heading";
    heading.textContent = `Review items (${this.items.length})`;
    section.append(heading);
    if (this.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "No review items on this page.";
      section.append(empty);
      return section;
    }
    for (const numberedItem of getNumberedReviewItems(
      this.items,
      this.options.viewports?.presets
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
      void this.restoreItem(item);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      void this.restoreItem(item);
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
      void this.adapter.remove(item.id).then(() => this.reload());
    });
    actions.append(remove);
    row.append(body, actions);
    return row;
  }
  createMarkerLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-marker-layer";
    const environment = this.getEnvironment();
    if (!environment) return layer;
    const currentScope = getReviewViewportScope(
      getViewportSize(environment),
      this.options.viewports?.presets
    );
    getNumberedReviewItems(
      this.items,
      this.options.viewports?.presets
    ).forEach((numberedItem) => {
      const { item, scope, number, displayLabel } = numberedItem;
      if (!shouldShowMarkerForScope(scope, currentScope)) {
        return;
      }
      const isHighlighted = item.id === this.highlightedItemId;
      const highlightMode = getReviewItemHighlightMode(item);
      if (highlightMode !== "note") {
        const selection = getItemHighlightSelection(item, environment);
        if (selection) {
          layer.append(
            ...this.createItemHighlightElements(
              selection.viewport,
              environment,
              item,
              String(number),
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
        String(number),
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
    labelElement.textContent = `#${label}`;
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
    labelElement.textContent = isNoteCallout ? `#${label}` : label;
    marker.append(iconElement, labelElement);
    return marker;
  }
  attachDraftPinDrag(pin, popover, meta, textarea) {
    let isDragging = false;
    const moveDraftUi = (hostPoint) => {
      const environment = this.getEnvironment();
      if (!environment) return;
      const nextPoint = clampPoint(toTargetPoint(hostPoint, environment), environment);
      const nextHostPoint = toHostPoint(nextPoint, environment);
      const position = getPopoverPosition(nextHostPoint, environment);
      pin.style.left = `${nextHostPoint.x}px`;
      pin.style.top = `${nextHostPoint.y}px`;
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;
      if (!this.noteDraft) return;
      this.noteDraft = {
        ...this.noteDraft,
        marker: {
          ...this.noteDraft.marker,
          viewport: roundPoint(nextPoint)
        },
        comment: textarea.value
      };
      meta.textContent = formatNoteDraftMeta(this.noteDraft);
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
      const nextPoint = toTargetPointFromHostEvent(event, this.getEnvironment());
      void (this.mode === "element" ? this.bindElementDraftToPoint(nextPoint, textarea.value) : this.bindNoteDraftToPoint(nextPoint, textarea.value));
    });
  }
  createNoteLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-text-layer";
    const environment = this.getEnvironment();
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.createNoteDraft(
        toTargetPointFromHostEvent(event, this.getEnvironment())
      );
    });
    return layer;
  }
  createElementLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-element-layer";
    const environment = this.getEnvironment();
    const hover = document.createElement("div");
    hover.className = "dfwr-dom-hover";
    hover.hidden = true;
    layer.append(hover);
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    const updateHover = (point) => {
      const nextEnvironment = this.getEnvironment();
      if (!nextEnvironment) return;
      const anchor = getDomAnchorFromPoint(
        clampPoint(point, nextEnvironment),
        this.options.anchors?.attribute,
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
      updateHover(toTargetPointFromHostEvent(event, this.getEnvironment()));
    });
    layer.addEventListener("pointerleave", () => {
      hover.hidden = true;
    });
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.createElementDraft(
        toTargetPointFromHostEvent(event, this.getEnvironment())
      );
    });
    return layer;
  }
  async createNoteDraft(point) {
    await this.bindNoteDraftToPoint(point);
  }
  async createElementDraft(point) {
    await this.bindElementDraftToPoint(point);
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
      const markerPoint = getSelectionCenter(selection);
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
  createAreaLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-area-layer";
    const environment = this.getEnvironment();
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
        this.getEnvironment()
      );
      const left = Math.min(startX, nextPoint.x);
      const top = Math.min(startY, nextPoint.y);
      const width = Math.abs(nextPoint.x - startX);
      const height = Math.abs(nextPoint.y - startY);
      const hostPoint = toHostPoint(
        { x: left, y: top },
        this.getEnvironment()
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
        this.getEnvironment()
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
      this.isSelectingArea = true;
      this.render();
      void this.createAreaDraft(selection);
    });
    return layer;
  }
  async createAreaDraft(selection) {
    const environment = this.getEnvironment();
    if (!environment) return;
    const viewport = getViewportSize(environment);
    this.areaDraft = await this.withOverlayHidden(() => {
      const anchor = getDomAnchor(
        selection,
        this.options.anchors?.attribute,
        environment
      );
      const relativeSelection = anchor ? getRelativeSelection(selection, anchor, environment) : void 0;
      const marker = createSelectionCenterMarker(
        selection,
        anchor,
        environment
      );
      const reviewSelection = {
        viewport: toPublicSelection(selection),
        relative: relativeSelection
      };
      return {
        viewport,
        anchor,
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
    await this.adapter.create(item);
    this.setModeState("idle");
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    this.highlightItem(item.id);
    await this.reload();
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
function rectanglesIntersect(a, b) {
  return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
}
function waitForNextFrame(environment) {
  return new Promise((resolve) => {
    (environment?.window ?? window).requestAnimationFrame(() => resolve());
  });
}
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
function createAnchorCandidates(target, configuredAttribute) {
  const candidates = [];
  const anchoredByAttribute = target.closest(`[${configuredAttribute}]`);
  if (anchoredByAttribute) {
    const value = anchoredByAttribute.getAttribute(configuredAttribute);
    if (value) {
      candidates.push({
        selector: `[${configuredAttribute}="${cssEscape(value)}"]`,
        strategy: "configured-attribute",
        confidence: 0.98,
        textFingerprint: getTextFingerprint(anchoredByAttribute)
      });
    }
  }
  if (isMeaningfulId(target.id)) {
    candidates.push({
      selector: `#${cssEscape(target.id)}`,
      strategy: "id",
      confidence: 0.94,
      textFingerprint: getTextFingerprint(target)
    });
  }
  const targetClassName = getMeaningfulClassName(target);
  if (targetClassName) {
    candidates.push({
      selector: `${target.tagName.toLowerCase()}.${cssEscape(targetClassName)}`,
      strategy: "class",
      confidence: 0.82,
      textFingerprint: getTextFingerprint(target)
    });
  }
  candidates.push({
    selector: getDomPath(target),
    strategy: "dom-path",
    confidence: 0.9,
    textFingerprint: getTextFingerprint(target)
  });
  const parent = target.parentElement;
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
    "[data-file], [data-component], [data-section-index], [data-section-id]"
  );
  if (!sourceElement) return void 0;
  const dataset = sourceElement.dataset;
  const source = {
    component: dataset.component,
    file: dataset.file,
    sectionId: dataset.sectionId,
    sectionIndex: dataset.sectionIndex
  };
  return Object.values(source).some(Boolean) ? source : void 0;
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
function getBoundMarkerPoint(item, environment) {
  const marker = getItemMarker(item);
  if (!marker) return void 0;
  if (item.anchor && marker.relative) {
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
function getBoundSelection(item, environment) {
  const selection = getItemSelection(item);
  if (!selection?.viewport) return void 0;
  if (item.anchor && selection.relative) {
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
    isBound: false,
    confidence: 0
  };
}
function getItemHighlightSelection(item, environment) {
  if (item.kind === "area") {
    return getVisibleHighlightSelection(
      [
        getBoundSelection(item, environment),
        getAnchorHighlightSelection(item, environment),
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
function getReviewItemHighlightMode(item) {
  if (isDomReviewItem(item)) return "dom";
  if (item.kind === "area") return "area";
  return "note";
}
function isDomReviewItem(item) {
  return item.scope === "dom" || item.kind === "note" && Boolean(item.anchor && getItemSelection(item));
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
function getAnchorElement(anchor, environment) {
  return typeof anchor === "string" ? queryAnchorElement(anchor, environment) : resolveAnchorElement(anchor, environment)?.element;
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
function getAnchorCandidates(anchor) {
  return dedupeAnchorCandidates([
    anchor,
    ...anchor.candidates ?? []
  ]);
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
function getTextFingerprint(element) {
  const text = element.textContent?.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 120) : void 0;
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
function createId() {
  if ("randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
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
function formatAreaDraftMeta(draft) {
  const parts = [`viewport ${formatSize(draft.viewport)}`];
  if (draft.selection) {
    parts.push(`rect ${formatSelection(draft.selection.viewport)}`);
  }
  if (draft.marker) {
    parts.push(`point ${formatPoint(draft.marker.viewport)}`);
  }
  return parts.join(" / ");
}
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
function getViewportSize(environment) {
  const targetWindow = environment?.window ?? window;
  return {
    width: targetWindow.innerWidth,
    height: targetWindow.innerHeight
  };
}
function roundPoint(point) {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
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
function getAreaPopoverPosition(selection, environment) {
  return getPopoverPosition(
    {
      x: selection.left + selection.width,
      y: selection.top
    },
    environment,
    {
      width: 360,
      estimatedHeight: 206
    }
  );
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
function cssEscape(value) {
  if ("CSS" in window && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
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

// src/react-shell/presence.ts
var REVIEW_PRESENCE_SESSION_KEY = "df-review-presence-session-id";
var DEFAULT_LOCAL_PRESENCE_CHANNEL = "df-review-kit:presence";
var DEFAULT_LOCAL_PRESENCE_HEARTBEAT_MS = 5e3;
var DEFAULT_LOCAL_PRESENCE_STALE_MS = 16e3;
var PRESENCE_COLORS = [
  "#7cc7ff",
  "#63d7c7",
  "#f3b75f",
  "#c99cff",
  "#ff8f61",
  "#9cc76b",
  "#f278a6",
  "#79a7ff"
];
var createId2 = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};
var hashString = (value) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};
var getReviewPresenceColor = (value) => PRESENCE_COLORS[hashString(value || "anonymous") % PRESENCE_COLORS.length];
var getReviewPresenceDisplayName = (userId) => userId.trim() || "anonymous";
var getReviewPresenceSessionId = () => {
  if (typeof window === "undefined") return createId2();
  try {
    const stored = window.sessionStorage.getItem(REVIEW_PRESENCE_SESSION_KEY);
    if (stored) return stored;
    const nextId = createId2();
    window.sessionStorage.setItem(REVIEW_PRESENCE_SESSION_KEY, nextId);
    return nextId;
  } catch {
    return createId2();
  }
};
var getTimestamp = () => (/* @__PURE__ */ new Date()).toISOString();
var normalizePresenceUser = (state) => ({
  ...state,
  displayName: getReviewPresenceDisplayName(state.displayName || state.userId),
  updatedAt: state.updatedAt || getTimestamp()
});
var createLocalPresenceAdapter = (options = {}) => ({
  label: "local-presence",
  connect: (context) => {
    const heartbeatMs = options.heartbeatMs ?? DEFAULT_LOCAL_PRESENCE_HEARTBEAT_MS;
    const staleMs = options.staleMs ?? DEFAULT_LOCAL_PRESENCE_STALE_MS;
    const users = /* @__PURE__ */ new Map();
    const listeners = /* @__PURE__ */ new Set();
    let currentUser = normalizePresenceUser({
      ...context.initialState,
      sessionId: context.sessionId,
      userId: context.userId,
      displayName: context.displayName,
      color: context.color,
      updatedAt: getTimestamp()
    });
    users.set(context.sessionId, currentUser);
    const Channel = typeof BroadcastChannel === "undefined" ? void 0 : BroadcastChannel;
    const channel = Channel ? new Channel(options.channelName ?? DEFAULT_LOCAL_PRESENCE_CHANNEL) : null;
    const getUsers = () => {
      const now = Date.now();
      users.forEach((user, sessionId) => {
        if (now - Date.parse(user.updatedAt) > staleMs) {
          users.delete(sessionId);
        }
      });
      return Array.from(users.values()).sort((a, b) => {
        if (a.sessionId === context.sessionId) return -1;
        if (b.sessionId === context.sessionId) return 1;
        return a.displayName.localeCompare(b.displayName);
      });
    };
    const emit = () => {
      const nextUsers = getUsers();
      listeners.forEach((listener) => listener(nextUsers));
    };
    const post = (message) => {
      try {
        channel?.postMessage(message);
      } catch {
        return;
      }
    };
    const publish = () => {
      post({
        type: "update",
        sessionId: context.sessionId,
        user: currentUser
      });
    };
    if (channel) {
      channel.onmessage = (event) => {
        const message = event.data;
        if (!message || message.sessionId === context.sessionId) return;
        if (message.type === "request") {
          publish();
          return;
        }
        if (message.type === "leave") {
          users.delete(message.sessionId);
          emit();
          return;
        }
        if (message.type === "update" && message.user) {
          users.set(message.sessionId, normalizePresenceUser(message.user));
          emit();
        }
      };
    }
    const intervalId = typeof window === "undefined" ? void 0 : window.setInterval(() => {
      currentUser = {
        ...currentUser,
        updatedAt: getTimestamp()
      };
      users.set(context.sessionId, currentUser);
      emit();
      publish();
    }, heartbeatMs);
    emit();
    publish();
    post({
      type: "request",
      sessionId: context.sessionId
    });
    return {
      update: (state) => {
        currentUser = normalizePresenceUser({
          ...currentUser,
          ...state,
          sessionId: context.sessionId,
          userId: context.userId,
          displayName: context.displayName,
          color: context.color,
          updatedAt: getTimestamp()
        });
        users.set(context.sessionId, currentUser);
        emit();
        publish();
      },
      subscribe: (callback) => {
        listeners.add(callback);
        callback(getUsers());
        return () => {
          listeners.delete(callback);
        };
      },
      disconnect: () => {
        if (intervalId) {
          window.clearInterval(intervalId);
        }
        post({
          type: "leave",
          sessionId: context.sessionId
        });
        channel?.close();
        listeners.clear();
        users.clear();
      }
    };
  }
});
var createFallbackPresenceAdapter = (primaryAdapter, fallbackAdapter) => ({
  label: `${primaryAdapter.label}-with-${fallbackAdapter.label}-fallback`,
  connect: async (context) => {
    try {
      return await primaryAdapter.connect(context);
    } catch (error) {
      if (typeof console !== "undefined") {
        console.warn(
          `[df-review-kit] ${primaryAdapter.label} failed. Falling back to ${fallbackAdapter.label}.`,
          error
        );
      }
      return fallbackAdapter.connect(context);
    }
  }
});

// src/react-shell/constants.ts
var REVIEW_QA_FILTERS = [
  { key: "all", label: "All" },
  { key: "mobile", label: "Mobile", scope: "mobile" },
  { key: "tablet", label: "Tablet", scope: "tablet" },
  { key: "desktop", label: "Desktop", scope: "desktop" },
  { key: "wide", label: "Wide", scope: "wide" }
];
var FIGMA_OVERLAY_UNAVAILABLE_MESSAGE = "\uD53C\uADF8\uB9C8 \uC624\uBC84\uB808\uC774 \uB514\uBC84\uAE45\uC774 \uC548\uB418\uB294 \uD574\uC0C1\uB3C4";
var FIGMA_TOKEN_STORAGE_KEY = "figma-token";
var REVIEW_USER_ID_STORAGE_KEY = "user-id";
var REVIEW_THEME_STORAGE_KEY = "df-review-theme";
var DEFAULT_REVIEW_THEME = "dark";
var FIGMA_TOKEN_GUIDE_ID = "df-review-figma-token-guide";
var DEFAULT_INITIAL_REVIEW_PROMPT = "You are fixing QA issues collected with df-web-review-kit. Use the copied QA prompt as the source of truth for page, viewport, selector, DOM metadata, coordinates, and user comment. Make the smallest code or CSS change that fixes the issue, preserve unrelated behavior, then verify the target viewport again.";
var REVIEW_THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" }
];

// src/react-shell/route.ts
var DEFAULT_REVIEW_PATH_PREFIX = "/review";
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
var buildTargetSrc = (target) => {
  const url = new URL(target || "/", window.location.origin);
  url.searchParams.set("__dfwr_target", "1");
  return `${url.pathname}${url.search}${url.hash}`;
};
var getHashRoutePath = (hash) => {
  if (!hash.startsWith("#/")) return null;
  const [path] = hash.slice(1).split(/[?#]/);
  try {
    return decodeURI(path || "/");
  } catch {
    return path || "/";
  }
};
var getFrameRouteTarget = (targetWindow, reviewPathPrefix) => {
  const hashPath = getHashRoutePath(targetWindow.location.hash);
  return normalizeTarget(
    hashPath ?? targetWindow.location.pathname,
    reviewPathPrefix
  );
};
var updateShellUrl = (target, size, source) => {
  const url = new URL(window.location.href);
  url.searchParams.set("target", target);
  url.searchParams.set("w", String(size.width));
  url.searchParams.set("h", String(size.height));
  if (source !== "local") {
    url.searchParams.set("source", source);
  } else {
    url.searchParams.delete("source");
  }
  url.searchParams.delete("item");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
};
var updateShellUrlForItem = (target, size, itemId, source) => {
  const url = new URL(window.location.href);
  url.searchParams.set("target", target);
  url.searchParams.set("w", String(size.width));
  url.searchParams.set("h", String(size.height));
  url.searchParams.set("item", itemId);
  if (source !== "local") {
    url.searchParams.set("source", source);
  } else {
    url.searchParams.delete("source");
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
};
var getInitialItemId = () => {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("item");
};
var getInitialSource = (remoteSource) => {
  if (typeof window === "undefined" || !remoteSource) return "local";
  return new URLSearchParams(window.location.search).get("source") === remoteSource ? remoteSource : "local";
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

// src/react-shell/viewport.ts
var DEFAULT_REVIEW_VIEWPORT_PRESETS = [
  { label: "Mobile", width: 390, height: 720, kind: "mobile" },
  { label: "Tablet", width: 768, height: 1024, kind: "tablet" },
  { label: "Desktop", width: 1440, height: 900, kind: "desktop" },
  { label: "Wide", width: 1980, height: 1080, kind: "wide" }
];
var getFallbackPreset = (presets) => presets[0] ?? DEFAULT_REVIEW_VIEWPORT_PRESETS[0];
var getViewportPresetDistance2 = (preset, width, height) => Math.abs(preset.width - width) + Math.abs(preset.height - height);
var findViewportPreset = (presets, width, height) => {
  const fallback = getFallbackPreset(presets);
  const exact = presets.find(
    (preset) => preset.width === width && preset.height === height
  );
  if (exact) return exact;
  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance2(closest, width, height);
    const presetDistance = getViewportPresetDistance2(preset, width, height);
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

// src/react-shell/anchor-restore.ts
var isAnchorRestorableReviewItem = (item) => item.scope === "dom" || item.kind === "note" && Boolean(item.anchor && item.selection);
var queryReviewItemAnchorElement = (targetDocument, item) => {
  const anchor = item.anchor;
  if (!anchor || !isAnchorRestorableReviewItem(item)) return void 0;
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
var getReviewItemRestoreScrollPosition = (targetWindow, targetDocument, item, anchorElement) => {
  if (anchorElement) {
    const rect = anchorElement.getBoundingClientRect();
    return clampDocumentScrollPosition(targetDocument, {
      left: targetWindow.scrollX + rect.left - Math.max(0, (targetWindow.innerWidth - rect.width) / 2),
      top: targetWindow.scrollY + rect.top - Math.max(0, (targetWindow.innerHeight - rect.height) / 2)
    });
  }
  return clampDocumentScrollPosition(targetDocument, {
    left: item.scroll?.x ?? 0,
    top: item.scroll?.y ?? 0
  });
};
var setDocumentScrollInstantly2 = (targetWindow, targetDocument, position) => {
  const scrollElement = targetDocument.scrollingElement;
  if (scrollElement) {
    scrollElement.scrollLeft = position.left;
    scrollElement.scrollTop = position.top;
    return;
  }
  targetWindow.scrollTo(position.left, position.top);
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
var clampDocumentScrollPosition = (targetDocument, position) => {
  const scrollElement = targetDocument.scrollingElement;
  const view = targetDocument.defaultView;
  const maxLeft = Math.max(
    0,
    (scrollElement?.scrollWidth ?? 0) - (view?.innerWidth ?? 0)
  );
  const maxTop = Math.max(
    0,
    (scrollElement?.scrollHeight ?? 0) - (view?.innerHeight ?? 0)
  );
  return {
    left: Math.min(Math.max(0, Math.round(position.left)), maxLeft),
    top: Math.min(Math.max(0, Math.round(position.top)), maxTop)
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

// src/react-shell/target.ts
var HIDE_SCROLLBAR_STYLE_ID = "df-review-hide-scrollbar";
var setTargetScrollbarHidden = (targetDocument, hidden) => {
  if (!targetDocument) return;
  const existing = targetDocument.getElementById(HIDE_SCROLLBAR_STYLE_ID);
  if (hidden) {
    if (existing) return;
    const style = targetDocument.createElement("style");
    style.id = HIDE_SCROLLBAR_STYLE_ID;
    style.textContent = "html{scrollbar-width:none}html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0;display:none}";
    targetDocument.head?.appendChild(style);
  } else {
    existing?.remove();
  }
};
var isEditableEventTarget = (event) => {
  const path = event.composedPath?.() ?? [];
  const element = path[0] ?? event.target;
  if (!element || typeof element.tagName !== "string") return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || element.isContentEditable === true;
};
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

// src/react-shell/ruler.ts
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

// src/react-shell/settings.ts
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

// src/react-shell/prompt.ts
var getItemTitle = (item) => item.title || item.comment.split("\n")[0] || item.kind;
var getPromptLengthLabel = (value) => {
  const length = value.length;
  if (length <= 2e3) return `${length} chars / Discord 2,000 OK`;
  if (length <= 4e3) return `${length} chars / Nitro 4,000 OK`;
  return `${length} chars / attach as file`;
};
var formatDate2 = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(void 0, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// src/react-shell/shell-modals.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var EMPTY_SITEMAP_QA_COUNT = {
  local: 0,
  remote: 0
};
var normalizeSitemapHref = (href) => {
  const [path = "/"] = href.split(/[?#]/);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath || "/";
};
var getSitemapSegments = (href) => normalizeSitemapHref(href).split("/").map((segment) => segment.trim()).filter(Boolean);
var createSitemapNode = (href, label, isPage = false) => ({
  href,
  label,
  isPage,
  children: /* @__PURE__ */ new Map()
});
var mergeSitemapUsers = (users) => {
  const userByKey = /* @__PURE__ */ new Map();
  users.forEach((user) => {
    const key = user.sessionId || user.userId;
    const currentUser = userByKey.get(key);
    if (!currentUser || Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)) {
      userByKey.set(key, user);
    }
  });
  return Array.from(userByKey.values());
};
var addSitemapQaCounts = (first, second) => ({
  local: first.local + second.local,
  remote: first.remote + second.remote
});
var createSitemapRows = (pages, activeRoute, pageQaCounts, pagePresenceUsers, getPageTarget) => {
  const root = createSitemapNode("/", "/", false);
  pages.forEach((page) => {
    const pageHref = page.href.startsWith("/") ? page.href : `/${page.href}`;
    const pathHref = normalizeSitemapHref(pageHref);
    const segments = getSitemapSegments(pathHref);
    if (segments.length === 0) {
      root.href = pageHref;
      root.isPage = true;
      return;
    }
    let parent = root;
    segments.forEach((segment, segmentIndex) => {
      const isLastSegment = segmentIndex === segments.length - 1;
      const segmentPath = `/${segments.slice(0, segmentIndex + 1).join("/")}`;
      const segmentHref = isLastSegment ? pageHref : `${segmentPath}/`;
      const segmentLabel = `${segment}${!isLastSegment || pathHref.endsWith("/") ? "/" : ""}`;
      const existingNode = parent.children.get(segment);
      const node = existingNode ?? createSitemapNode(segmentHref, segmentLabel, false);
      node.href = isLastSegment ? pageHref : node.href;
      node.label = isLastSegment ? segmentLabel : node.label;
      node.isPage = node.isPage || isLastSegment;
      parent.children.set(segment, node);
      parent = node;
    });
  });
  const getDirectCount = (node) => {
    if (!node.isPage) return EMPTY_SITEMAP_QA_COUNT;
    return pageQaCounts.get(getPageTarget(node.href)) ?? EMPTY_SITEMAP_QA_COUNT;
  };
  const getDirectUsers = (node) => {
    if (!node.isPage) return [];
    return pagePresenceUsers.get(getPageTarget(node.href)) ?? [];
  };
  const rows = [];
  const appendNodeRows = (node, depth, ancestorLastList, isLastNode) => {
    const children = Array.from(node.children.values());
    const directCount = getDirectCount(node);
    const directUsers = getDirectUsers(node);
    let rowIndex = null;
    if (node.isPage || depth > 0) {
      const prefix = depth === 0 ? "" : `${ancestorLastList.map((isLast) => isLast ? "   " : "\u2502  ").join("")}${isLastNode ? "\u2514\u2500 " : "\u251C\u2500 "}`;
      const pageTarget = node.isPage ? getPageTarget(node.href) : null;
      rowIndex = rows.length;
      rows.push({
        href: node.href,
        label: node.label,
        prefix,
        isPage: node.isPage,
        isActive: pageTarget === activeRoute,
        qaCount: directCount,
        users: directUsers
      });
    }
    const childAggregate = children.reduce(
      (aggregate, child, childIndex) => {
        const childResult = appendNodeRows(
          child,
          depth + 1,
          depth === 0 ? [] : [...ancestorLastList, isLastNode],
          childIndex === children.length - 1
        );
        return {
          count: addSitemapQaCounts(aggregate.count, childResult.count),
          users: mergeSitemapUsers([...aggregate.users, ...childResult.users])
        };
      },
      { count: EMPTY_SITEMAP_QA_COUNT, users: [] }
    );
    if (rowIndex !== null && !node.isPage) {
      rows[rowIndex] = {
        ...rows[rowIndex],
        qaCount: childAggregate.count,
        users: childAggregate.users
      };
    }
    return {
      count: node.isPage ? addSitemapQaCounts(directCount, childAggregate.count) : childAggregate.count,
      users: mergeSitemapUsers([...directUsers, ...childAggregate.users])
    };
  };
  if (root.isPage) {
    const directCount = getDirectCount(root);
    const directUsers = getDirectUsers(root);
    rows.push({
      href: root.href,
      label: root.label,
      prefix: "",
      isPage: true,
      isActive: getPageTarget(root.href) === activeRoute,
      qaCount: directCount,
      users: directUsers
    });
  }
  Array.from(root.children.values()).forEach((node, index, siblings) => {
    appendNodeRows(node, 1, [], index === siblings.length - 1);
  });
  return rows;
};
var SitemapModal = ({
  pages,
  activeRoute,
  pageQaCounts,
  pagePresenceUsers,
  getPageTarget,
  onClose,
  onSelectPage
}) => {
  const sitemapRows = createSitemapRows(
    pages,
    activeRoute,
    pageQaCounts,
    pagePresenceUsers,
    getPageTarget
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      "aria-label": "Sitemap",
      "aria-modal": "true",
      className: "df-review-sitemap-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            "aria-label": "Close sitemap",
            className: "df-review-sitemap-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-sitemap-dialog", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-sitemap-header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sitemap" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                pages.length,
                " pages"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { "aria-label": "Close sitemap", type: "button", onClick: onClose, children: "x" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-sitemap-list", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-sitemap-table-head", "aria-hidden": "true", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Page" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Local" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Remote" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Online" })
            ] }),
            sitemapRows.map((row) => {
              const rowClassName = [
                "df-review-sitemap-row",
                row.isPage ? "is-page" : "is-folder",
                row.isActive ? "is-active" : ""
              ].filter(Boolean).join(" ");
              const rowContent = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "df-review-sitemap-path", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "df-review-sitemap-tree-prefix", children: row.prefix }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.label })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "df-review-sitemap-cell is-local", children: row.qaCount.local }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "df-review-sitemap-cell is-remote", children: row.qaCount.remote }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "df-review-sitemap-cell is-online", children: row.users.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "df-review-sitemap-users", children: row.users.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "span",
                  {
                    className: "df-review-sitemap-user",
                    style: {
                      "--df-review-presence-color": user.color
                    },
                    children: user.userId
                  },
                  user.sessionId
                )) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "df-review-sitemap-online-empty", children: "0" }) })
              ] });
              if (!row.isPage) {
                return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "div",
                  {
                    "aria-label": `${row.href} group / local ${row.qaCount.local} QA / remote ${row.qaCount.remote} QA / ${row.users.length} online`,
                    className: rowClassName,
                    role: "row",
                    children: rowContent
                  },
                  row.href
                );
              }
              return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  "aria-label": `${row.href} / local ${row.qaCount.local} QA / remote ${row.qaCount.remote} QA / ${row.users.length} online`,
                  className: rowClassName,
                  type: "button",
                  onClick: () => onSelectPage(row.href),
                  children: rowContent
                },
                row.href
              );
            })
          ] })
        ] })
      ]
    }
  );
};
var ReviewSettingsModal = ({
  figmaTokenDraft,
  reviewUserIdDraft,
  reviewThemeDraft,
  figmaSettingsStatus,
  isFigmaTokenVisible,
  isFigmaTokenGuideOpen,
  onClose,
  onFigmaTokenDraftChange,
  onReviewUserIdDraftChange,
  onReviewThemeDraftChange,
  onClearStatus,
  onToggleFigmaTokenVisible,
  onToggleFigmaTokenGuide,
  onSave
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      "aria-label": "Review settings",
      "aria-modal": "true",
      className: "df-review-settings-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            "aria-label": "Close settings",
            className: "df-review-settings-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "form",
          {
            className: "df-review-settings-dialog",
            onSubmit: (event) => {
              event.preventDefault();
              onSave(figmaTokenDraft, reviewUserIdDraft, reviewThemeDraft);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-settings-header", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-settings-title", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Settings" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    FIGMA_TOKEN_STORAGE_KEY,
                    " / ",
                    REVIEW_USER_ID_STORAGE_KEY,
                    " /",
                    " ",
                    REVIEW_THEME_STORAGE_KEY
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-settings-header-actions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "select",
                    {
                      "aria-label": "Review theme",
                      className: "df-review-settings-theme-select",
                      value: reviewThemeDraft,
                      onChange: (event) => {
                        onReviewThemeDraftChange(normalizeReviewTheme(event.target.value));
                        onClearStatus();
                      },
                      children: REVIEW_THEME_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: option.value, children: option.label }, option.value))
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { "aria-label": "Close settings", type: "button", onClick: onClose, children: "x" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-settings-body", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-settings-field", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-settings-label-row", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: "df-review-figma-token", children: "Figma token" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "button",
                      {
                        "aria-controls": FIGMA_TOKEN_GUIDE_ID,
                        "aria-expanded": isFigmaTokenGuideOpen,
                        "aria-label": "Show Figma token guide",
                        className: `df-review-settings-help-button${isFigmaTokenGuideOpen ? " is-active" : ""}`,
                        type: "button",
                        onClick: onToggleFigmaTokenGuide,
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { "aria-hidden": "true" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-settings-token-input", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
                          onFigmaTokenDraftChange(event.target.value);
                          onClearStatus();
                        }
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "button",
                      {
                        "aria-label": isFigmaTokenVisible ? "Hide Figma token" : "Show Figma token",
                        className: "df-review-settings-token-toggle",
                        type: "button",
                        onClick: onToggleFigmaTokenVisible,
                        children: isFigmaTokenVisible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { "aria-hidden": "true" })
                      }
                    )
                  ] }),
                  isFigmaTokenGuideOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "div",
                    {
                      className: "df-review-settings-guide",
                      id: FIGMA_TOKEN_GUIDE_ID,
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Figma file browser\uC5D0\uC11C account menu\uB97C \uC5F4\uACE0 Settings\uB85C \uC774\uB3D9" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Security \uD0ED\uC758 Personal access tokens\uB85C \uC774\uB3D9" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Generate new token\uC5D0\uC11C \uC774\uB984\uACFC scope\uB97C \uC815\uD55C \uB4A4 \uC0DD\uC131" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "\uC0DD\uC131\uB41C token\uC744 \uBCF5\uC0AC\uD574\uC11C \uC5EC\uAE30\uC5D0 \uBD99\uC5EC\uB123\uAE30" })
                      ] })
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "df-review-settings-field", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "User ID" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "df-review-settings-text-input", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "input",
                    {
                      "aria-label": "Review user ID",
                      autoComplete: "off",
                      spellCheck: false,
                      type: "text",
                      value: reviewUserIdDraft,
                      onChange: (event) => {
                        onReviewUserIdDraftChange(event.target.value);
                        onClearStatus();
                      }
                    }
                  ) })
                ] }),
                figmaSettingsStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "df-review-settings-status", children: figmaSettingsStatus }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-settings-actions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      type: "button",
                      onClick: () => onSave("", "", DEFAULT_REVIEW_THEME),
                      children: "Clear"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: onClose, children: "Cancel" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "submit", children: "Save" })
                ] })
              ] })
            ]
          }
        )
      ]
    }
  );
};
var ABOUT_SECTIONS = [
  {
    title: "Settings",
    body: "Figma token, User ID, theme \uC124\uC815\uC740 \uC6B0\uCE21 \uC0C1\uB2E8 \uC124\uC815\uC5D0\uC11C \uC800\uC7A5\uD574. Token\uC740 Figma overlay\uB97C \uC4F8 \uB54C\uB9CC \uD544\uC694\uD558\uACE0, User ID\uB294 presence\uC640 \uC791\uC5C5\uC790 \uD45C\uC2DC \uC774\uB984\uC73C\uB85C \uC0AC\uC6A9\uB3FC."
  },
  {
    title: "Sitemap",
    body: "Sitemap\uC740 \uB4F1\uB85D\uB41C route\uB97C \uD3F4\uB354 \uD2B8\uB9AC\uB85C \uBCF4\uC5EC\uC8FC\uACE0, Local / Remote QA \uC218\uC640 Online \uC0AC\uC6A9\uC790\uB97C \uD55C \uBC88\uC5D0 \uD655\uC778\uD558\uB294 \uCC3D\uC774\uC57C. \uC2E4\uC81C page row\uB97C \uB204\uB974\uBA74 \uD574\uB2F9 route\uB85C \uC774\uB3D9\uD574."
  },
  {
    title: "List",
    body: "QA list\uB294 \uD604\uC7AC source\uC758 review item\uC744 \uBCF4\uC5EC\uC918. viewport \uD544\uD130, \uC0C1\uD0DC \uBCC0\uACBD, overlay \uC228\uAE40, \uC0AD\uC81C\uB97C \uC5EC\uAE30\uC11C \uCC98\uB9AC\uD558\uACE0, Online pill\uC740 \uAC19\uC740 project/route\uB97C \uBCF4\uB294 \uC0AC\uC6A9\uC790\uB97C \uD45C\uC2DC\uD574."
  }
];
var PromptModal = ({
  promptTab,
  initialPromptText,
  copiedPromptKey,
  onClose,
  onPromptTabChange,
  onCopyPrompt
}) => {
  const isInitialPromptTab = promptTab === "initial";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      "aria-label": "Review help",
      "aria-modal": "true",
      className: "df-review-prompt-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            "aria-label": "Close help",
            className: "df-review-prompt-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-prompt-dialog", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-prompt-header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Review shell help" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "About / Initial prompt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { "aria-label": "Close help", type: "button", onClick: onClose, children: "x" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-prompt-body", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-prompt-tabs", role: "tablist", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  "aria-selected": promptTab === "about",
                  className: promptTab === "about" ? "is-active" : "",
                  role: "tab",
                  type: "button",
                  onClick: () => onPromptTabChange("about"),
                  children: "About"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  "aria-selected": isInitialPromptTab,
                  className: isInitialPromptTab ? "is-active" : "",
                  role: "tab",
                  type: "button",
                  onClick: () => onPromptTabChange("initial"),
                  children: "Initial prompt"
                }
              )
            ] }),
            isInitialPromptTab ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "df-review-prompt-block", role: "tabpanel", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "df-review-prompt-block-header", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Initial prompt" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getPromptLengthLabel(initialPromptText) })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "button",
                  {
                    disabled: !initialPromptText,
                    type: "button",
                    onClick: () => onCopyPrompt(initialPromptText, "initial"),
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { "aria-hidden": "true" }),
                      copiedPromptKey === "initial" ? "Copied" : "Copy"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "textarea",
                {
                  readOnly: true,
                  "aria-label": "Initial prompt",
                  value: initialPromptText || "Initial prompt is not configured."
                }
              )
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: "df-review-prompt-about", role: "tabpanel", children: ABOUT_SECTIONS.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: section.title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: section.body })
            ] }, section.title)) })
          ] })
        ] })
      ]
    }
  );
};

// src/react-shell/topbar.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var ReviewScopeIcon = ({ scope }) => {
  if (scope === "mobile") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Smartphone, { "aria-hidden": "true" });
  if (scope === "tablet") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(RectangleHorizontal, { "aria-hidden": "true" });
  if (scope === "wide") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Maximize2, { "aria-hidden": "true" });
  if (scope === "dom") return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Monitor, { "aria-hidden": "true" });
};
var ViewportPresetIcon = ({
  preset
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ReviewScopeIcon, { scope: getViewportPresetKind(preset) });
};
var ReviewTopbar = ({
  draftTarget,
  copyLabel,
  viewportPresets,
  size,
  presetScopeCounts,
  isRulerAvailable,
  isRulerVisible,
  targetOverlayState,
  isFigmaOverlayAvailable,
  onDraftTargetChange,
  onApplyTarget,
  onOpenSitemap,
  onCopyCurrentUrl,
  onSizeChange,
  onToggleRuler,
  onToggleTargetOverlay,
  onOpenInitialPrompt,
  onOpenSettings
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("header", { className: "df-review-topbar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "form",
      {
        className: "df-review-address",
        onSubmit: (event) => {
          event.preventDefault();
          onApplyTarget();
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              "aria-label": "Open sitemap",
              className: "df-review-sitemap-button",
              type: "button",
              onClick: onOpenSitemap,
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Map2, { "aria-hidden": "true" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              "aria-label": "Path",
              value: draftTarget,
              onChange: (event) => onDraftTargetChange(event.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "submit", children: "Load" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", onClick: onCopyCurrentUrl, children: copyLabel })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "df-review-tools", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "df-review-tool-controls", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "df-review-presets", "aria-label": "Viewport presets", children: viewportPresets.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "button",
          {
            className: preset.label === size.label ? "is-active" : "",
            type: "button",
            onClick: () => onSizeChange(preset),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ViewportPresetIcon, { preset }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "df-review-preset-copy", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: preset.label }) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "df-review-preset-count", children: presetScopeCounts.get(getViewportPresetKind(preset)) ?? 0 })
            ]
          },
          preset.label
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "df-review-tool-divider", "aria-hidden": "true", children: "|" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "df-review-active-size", children: [
          size.width,
          "x",
          size.height
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "df-review-overlays", "aria-label": "Target overlays", children: [
        isRulerAvailable && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            "aria-label": "Toggle ruler",
            className: `df-review-overlay-button is-ruler${isRulerVisible ? " is-active" : ""}`,
            type: "button",
            onClick: onToggleRuler,
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Ruler, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            "aria-label": "Toggle grid overlay",
            className: `df-review-overlay-button is-grid${targetOverlayState.grid ? " is-active" : ""}`,
            type: "button",
            onClick: () => onToggleTargetOverlay("grid"),
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LayoutGrid, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            "aria-disabled": !isFigmaOverlayAvailable,
            "aria-label": isFigmaOverlayAvailable ? "Toggle Figma overlay" : FIGMA_OVERLAY_UNAVAILABLE_MESSAGE,
            className: `df-review-overlay-button is-figma${targetOverlayState.figma ? " is-active" : ""}${isFigmaOverlayAvailable ? "" : " is-disabled"}`,
            type: "button",
            onClick: () => onToggleTargetOverlay("figma"),
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Image, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "df-review-tool-divider", "aria-hidden": "true", children: "|" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            "aria-label": "Open initial prompt",
            className: "df-review-overlay-button is-prompt",
            type: "button",
            onClick: onOpenInitialPrompt,
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CircleQuestionMark, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            "aria-label": "Open settings",
            className: "df-review-overlay-button is-settings",
            type: "button",
            onClick: onOpenSettings,
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Settings, { "aria-hidden": "true" })
          }
        )
      ] })
    ] })
  ] });
};

// src/react-shell/pages.ts
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

// src/react-shell/supabase-presence.ts
var normalizeTopicPart = (value) => value.trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "default";
var getPresenceTopic = (channelPrefix, projectId) => `${normalizeTopicPart(channelPrefix)}-${normalizeTopicPart(projectId)}`;
var PRESENCE_BRIDGE_KEY = "__dfReviewPresenceBridge";
var isReviewPresenceUser = (value) => {
  if (!value || typeof value !== "object") return false;
  const candidate = value;
  return typeof candidate.projectId === "string" && typeof candidate.sessionId === "string" && typeof candidate.userId === "string" && typeof candidate.updatedAt === "string";
};
var flattenPresenceState = (state) => Object.values(state).flat().filter(isReviewPresenceUser);
var dedupePresenceUsers = (users) => {
  const userBySessionId = /* @__PURE__ */ new Map();
  users.forEach((user) => {
    const currentUser = userBySessionId.get(user.sessionId);
    if (!currentUser || Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)) {
      userBySessionId.set(user.sessionId, user);
    }
  });
  return Array.from(userBySessionId.values());
};
var sortPresenceUsers = (users, selfSessionId) => users.sort((a, b) => {
  if (a.sessionId === selfSessionId) return -1;
  if (b.sessionId === selfSessionId) return 1;
  return a.displayName.localeCompare(b.displayName);
});
var subscribeChannel = (channel) => new Promise((resolve, reject) => {
  channel.subscribe((status, error) => {
    if (status === "SUBSCRIBED") {
      resolve();
      return;
    }
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      reject(error ?? new Error(`Supabase presence ${status}`));
    }
  });
});
var removeTopicChannels = async (client, topic) => {
  const existingChannels = client.getChannels?.() ?? [];
  const normalizedTopic = `realtime:${topic}`;
  const topicChannels = existingChannels.filter(
    (channel) => channel.topic === topic || channel.topic === normalizedTopic
  );
  await Promise.allSettled(
    topicChannels.map(async (channel) => {
      const result = await client.removeChannel(channel);
      if (result !== "ok") {
        channel.teardown?.();
      }
    })
  );
};
var getTopicChannel = (client, topic) => {
  const normalizedTopic = `realtime:${topic}`;
  return client.getChannels?.().find(
    (channel) => channel.topic === topic || channel.topic === normalizedTopic
  );
};
var createPresenceBridge = (client, topic, context, isPrivate) => {
  const channel = client.channel(topic, {
    config: {
      private: isPrivate,
      presence: {
        key: context.sessionId
      }
    }
  });
  const bridge = {
    channel,
    listeners: /* @__PURE__ */ new Set(),
    refCount: 0,
    getUsers: () => dedupePresenceUsers(flattenPresenceState(channel.presenceState())),
    emit: () => {
      bridge.listeners.forEach((listener) => listener());
    },
    ready: Promise.resolve()
  };
  channel[PRESENCE_BRIDGE_KEY] = bridge;
  channel.on("presence", { event: "sync" }, bridge.emit).on("presence", { event: "join" }, bridge.emit).on("presence", { event: "leave" }, bridge.emit);
  bridge.ready = subscribeChannel(channel).catch((error) => {
    delete channel[PRESENCE_BRIDGE_KEY];
    throw error;
  });
  return bridge;
};
var getPresenceBridge = async (client, topic, context, isPrivate) => {
  const existingChannel = getTopicChannel(client, topic);
  const existingBridge = existingChannel?.[PRESENCE_BRIDGE_KEY];
  if (existingBridge) return existingBridge;
  if (existingChannel) {
    await removeTopicChannels(client, topic);
  }
  return createPresenceBridge(client, topic, context, isPrivate);
};
var createSupabasePresenceAdapter = ({
  client,
  channelPrefix = "review-presence",
  private: isPrivate = false
}) => ({
  label: "supabase-presence",
  connect: async (context) => {
    const topic = getPresenceTopic(channelPrefix, context.projectId);
    const bridge = await getPresenceBridge(client, topic, context, isPrivate);
    const listeners = /* @__PURE__ */ new Set();
    let currentState = context.initialState;
    bridge.refCount += 1;
    const getUsers = () => sortPresenceUsers(
      [...bridge.getUsers()],
      context.sessionId
    );
    const emit = () => {
      const users = getUsers();
      listeners.forEach((listener) => listener(users));
    };
    const bridgeListener = () => emit();
    bridge.listeners.add(bridgeListener);
    await bridge.ready;
    await bridge.channel.track(currentState);
    bridge.emit();
    emit();
    return {
      update: async (state) => {
        currentState = {
          ...currentState,
          ...state,
          sessionId: context.sessionId,
          userId: context.userId,
          displayName: context.displayName,
          color: context.color,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await bridge.channel.track(currentState);
      },
      subscribe: (callback) => {
        listeners.add(callback);
        callback(getUsers());
        return () => {
          listeners.delete(callback);
        };
      },
      disconnect: async () => {
        listeners.clear();
        bridge.listeners.delete(bridgeListener);
        bridge.refCount = Math.max(0, bridge.refCount - 1);
        if (bridge.refCount > 0) return;
        delete bridge.channel[PRESENCE_BRIDGE_KEY];
        await bridge.channel.untrack();
        await client.removeChannel(bridge.channel);
      }
    };
  }
});

// src/react-shell.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var ReviewScopeIcon2 = ({ scope }) => {
  if (scope === "mobile") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Smartphone, { "aria-hidden": "true" });
  if (scope === "tablet") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RectangleHorizontal, { "aria-hidden": "true" });
  if (scope === "wide") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Maximize2, { "aria-hidden": "true" });
  if (scope === "dom") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Monitor, { "aria-hidden": "true" });
};
var isDomReviewItem2 = (item) => isAnchorRestorableReviewItem(item);
var getReviewItemMode = (item) => isDomReviewItem2(item) ? "dom" : item.kind;
var getReviewModeWriteMode = (mode) => {
  if (mode === "element") return "dom";
  if (mode === "note" || mode === "area") return mode;
  return null;
};
var createEmptySitemapQaCount = () => ({
  local: 0,
  remote: 0
});
var getStatusOption = (status, statusOptions) => {
  const normalizedStatus = normalizeReviewItemStatus(status);
  return statusOptions.find((statusOption) => statusOption.value === status) ?? statusOptions.find(
    (statusOption) => statusOption.value === normalizedStatus
  ) ?? statusOptions[0];
};
var ReviewItemModeIcon = ({
  mode
}) => {
  if (mode === "area") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Scan, { "aria-hidden": "true" });
  if (mode === "dom") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(StickyNote, { "aria-hidden": "true" });
};
var getPresenceUserTarget = (user, reviewPathPrefix) => normalizeTarget(user.target || user.routeKey, reviewPathPrefix);
var dedupePresenceUsersByPageAndId = (users, reviewPathPrefix) => {
  const userByPageAndId = /* @__PURE__ */ new Map();
  users.forEach((user) => {
    const userId = user.userId.trim();
    if (!userId) return;
    const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
    const key = `${userTarget}::${userId}`;
    const currentUser = userByPageAndId.get(key);
    if (!currentUser || Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)) {
      userByPageAndId.set(key, user);
    }
  });
  return Array.from(userByPageAndId.values());
};
function runWithAutoScrollBehavior2(targetDocument, callback) {
  const elements = [
    targetDocument?.documentElement,
    targetDocument?.body
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
var ReviewShell = ({
  projectId,
  pages,
  adapters,
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ruler,
  initialPrompt = DEFAULT_INITIAL_REVIEW_PROMPT,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
  presence
}) => {
  const viewportPresets = presets.length > 0 ? presets : DEFAULT_REVIEW_VIEWPORT_PRESETS;
  const reviewViewportPresets = (0, import_react4.useMemo)(
    () => toReviewViewportPresets(viewportPresets),
    [viewportPresets]
  );
  const normalizedAdapters = (0, import_react4.useMemo)(
    () => normalizeReviewShellAdapters(adapters),
    [adapters]
  );
  const localAdapterEntry = normalizedAdapters.local;
  const remoteAdapterEntry = normalizedAdapters.remote;
  const sourceEntries = normalizedAdapters.sources;
  const defaultSource = sourceEntries[0]?.label ?? "local";
  const [source, setSource] = (0, import_react4.useState)(() => {
    const initialSource = getInitialSource(remoteAdapterEntry?.label);
    return sourceEntries.some((entry) => entry.label === initialSource) ? initialSource : defaultSource;
  });
  const remoteSource = remoteAdapterEntry?.label ?? null;
  const activeAdapterEntry = sourceEntries.find((entry) => entry.label === source) ?? sourceEntries[0];
  const isRemoteSource = Boolean(
    remoteSource && activeAdapterEntry.label === remoteSource
  );
  const showSourceSelect = sourceEntries.length > 1;
  const canWriteDom = activeAdapterEntry.writeModes.includes("dom");
  const canWriteNote = activeAdapterEntry.writeModes.includes("note");
  const canWriteArea = activeAdapterEntry.writeModes.includes("area");
  const canWriteAny = canWriteDom || canWriteNote || canWriteArea;
  const adapter = activeAdapterEntry.adapter;
  const iframeRef = (0, import_react4.useRef)(null);
  const frameScrollRef = (0, import_react4.useRef)(null);
  const rulerOverlayRef = (0, import_react4.useRef)(null);
  const rulerDragRectRef = (0, import_react4.useRef)(null);
  const isRulerDraggingRef = (0, import_react4.useRef)(false);
  const controllerRef = (0, import_react4.useRef)(null);
  const cleanupTargetRef = (0, import_react4.useRef)(null);
  const presenceSessionRef = (0, import_react4.useRef)(null);
  const pendingRestoreRef = (0, import_react4.useRef)(null);
  const pendingInitialItemIdRef = (0, import_react4.useRef)(getInitialItemId());
  const selectedItemIdRef = (0, import_react4.useRef)(getInitialItemId());
  const hiddenOverlayItemIdListRef = (0, import_react4.useRef)([]);
  const [target, setTarget] = (0, import_react4.useState)(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [draftTarget, setDraftTarget] = (0, import_react4.useState)(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [activeRoute, setActiveRoute] = (0, import_react4.useState)(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [size, setSize] = (0, import_react4.useState)(
    () => getInitialSize(viewportPresets)
  );
  const [items, setItems] = (0, import_react4.useState)([]);
  const [mode, setMode] = (0, import_react4.useState)("idle");
  const [targetOverlayState, setTargetOverlayState] = (0, import_react4.useState)({
    grid: false,
    figma: false
  });
  const [selectedItemId, setSelectedItemId] = (0, import_react4.useState)(getInitialItemId());
  const [hiddenOverlayItemIds, setHiddenOverlayItemIds] = (0, import_react4.useState)(() => /* @__PURE__ */ new Set());
  const [isListVisible, setIsListVisible] = (0, import_react4.useState)(true);
  const [isSitemapOpen, setIsSitemapOpen] = (0, import_react4.useState)(false);
  const [isFigmaSettingsOpen, setIsFigmaSettingsOpen] = (0, import_react4.useState)(false);
  const [figmaTokenDraft, setFigmaTokenDraft] = (0, import_react4.useState)(getStoredFigmaToken);
  const [reviewUserId, setReviewUserId] = (0, import_react4.useState)(getStoredReviewUserId);
  const [reviewUserIdDraft, setReviewUserIdDraft] = (0, import_react4.useState)(
    getStoredReviewUserId
  );
  const [reviewTheme, setReviewTheme] = (0, import_react4.useState)(getStoredReviewTheme);
  const [reviewThemeDraft, setReviewThemeDraft] = (0, import_react4.useState)(getStoredReviewTheme);
  const [systemReviewTheme, setSystemReviewTheme] = (0, import_react4.useState)(getSystemReviewTheme);
  const [figmaSettingsStatus, setFigmaSettingsStatus] = (0, import_react4.useState)("");
  const [isFigmaTokenVisible, setIsFigmaTokenVisible] = (0, import_react4.useState)(false);
  const [isFigmaTokenGuideOpen, setIsFigmaTokenGuideOpen] = (0, import_react4.useState)(false);
  const [isInitialPromptOpen, setIsInitialPromptOpen] = (0, import_react4.useState)(false);
  const [qaFilter, setQaFilter] = (0, import_react4.useState)("all");
  const [copyLabel, setCopyLabel] = (0, import_react4.useState)("Copy URL");
  const [sitemapItems, setSitemapItems] = (0, import_react4.useState)(() => ({
    local: [],
    remote: []
  }));
  const [isRulerVisible, setIsRulerVisible] = (0, import_react4.useState)(false);
  const [rulerStart, setRulerStart] = (0, import_react4.useState)(null);
  const [rulerPoint, setRulerPoint] = (0, import_react4.useState)(null);
  const [rulerHover, setRulerHover] = (0, import_react4.useState)(null);
  const [isRulerDragging, setIsRulerDragging] = (0, import_react4.useState)(false);
  const [promptTab, setPromptTab] = (0, import_react4.useState)("about");
  const [copiedPromptKey, setCopiedPromptKey] = (0, import_react4.useState)(null);
  const [presenceUsers, setPresenceUsers] = (0, import_react4.useState)([]);
  const [presenceSessionVersion, setPresenceSessionVersion] = (0, import_react4.useState)(0);
  const presenceSessionId = (0, import_react4.useMemo)(getReviewPresenceSessionId, []);
  const targetRef = (0, import_react4.useRef)(target);
  const sizeRef = (0, import_react4.useRef)(size);
  const effectiveReviewTheme = reviewTheme === "system" ? systemReviewTheme : reviewTheme;
  const isFigmaOverlayAvailable = getIsFigmaOverlayAvailable(size);
  const isRulerAvailable = ruler?.enabled !== false && typeof size.designWidth === "number" && size.designWidth > 0;
  const rulerUnit = ruler?.unit ?? "px";
  const rulerScaleX = isRulerAvailable && size.designWidth ? size.width / size.designWidth : 1;
  const rulerScaleY = size.designHeight && size.designHeight > 0 ? size.height / size.designHeight : rulerScaleX;
  const rulerMeasure = (0, import_react4.useMemo)(
    () => getRulerMeasure(rulerStart, rulerPoint),
    [rulerPoint, rulerStart]
  );
  const rulerMeasureLabel = (0, import_react4.useMemo)(() => {
    if (!rulerMeasure) return "";
    const designWidth = Math.round(rulerMeasure.width / rulerScaleX);
    const designHeight = Math.round(rulerMeasure.height / rulerScaleY);
    return `Figma ${designWidth}x${designHeight}${rulerUnit}`;
  }, [rulerMeasure, rulerScaleX, rulerScaleY, rulerUnit]);
  const targetSrc = (0, import_react4.useMemo)(() => buildTargetSrc(target), [target]);
  const pageTargets = (0, import_react4.useMemo)(
    () => new Set(
      pages.map((page) => normalizeTarget(page.href, reviewPathPrefix))
    ),
    [pages, reviewPathPrefix]
  );
  const activeItems = (0, import_react4.useMemo)(
    () => items.filter((item) => getItemTarget(item, reviewPathPrefix) === activeRoute).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [activeRoute, items, reviewPathPrefix]
  );
  const numberedActiveItems = (0, import_react4.useMemo)(
    () => getNumberedReviewItems(activeItems, reviewViewportPresets),
    [activeItems, reviewViewportPresets]
  );
  const filteredNumberedActiveItems = (0, import_react4.useMemo)(
    () => qaFilter === "all" ? numberedActiveItems : numberedActiveItems.filter(
      (numberedItem) => numberedItem.scope === qaFilter
    ),
    [numberedActiveItems, qaFilter]
  );
  const hiddenOverlayItemIdList = (0, import_react4.useMemo)(
    () => Array.from(hiddenOverlayItemIds),
    [hiddenOverlayItemIds]
  );
  const qaFilterCounts = (0, import_react4.useMemo)(() => {
    const counts = /* @__PURE__ */ new Map();
    counts.set("all", numberedActiveItems.length);
    numberedActiveItems.forEach((numberedItem) => {
      counts.set(numberedItem.scope, (counts.get(numberedItem.scope) ?? 0) + 1);
    });
    return counts;
  }, [numberedActiveItems]);
  const getItemPresetScope = (0, import_react4.useCallback)(
    (item) => getViewportPresetKind(
      findViewportPreset(
        viewportPresets,
        item.viewport?.width ?? 0,
        item.viewport?.height ?? 0
      )
    ),
    [viewportPresets]
  );
  const presetScopeCounts = (0, import_react4.useMemo)(() => {
    const counts = /* @__PURE__ */ new Map();
    activeItems.forEach((item) => {
      const scope = getItemPresetScope(item);
      counts.set(scope, (counts.get(scope) ?? 0) + 1);
    });
    return counts;
  }, [activeItems, getItemPresetScope]);
  const currentPresetScope = getViewportPresetKind(size);
  const pageQaCounts = (0, import_react4.useMemo)(() => {
    const counts = /* @__PURE__ */ new Map();
    const addItems = (sourceKey, sourceItems) => {
      sourceItems.forEach((item) => {
        const pageTarget = normalizeTarget(
          getItemTarget(item, reviewPathPrefix),
          reviewPathPrefix
        );
        const count = counts.get(pageTarget) ?? createEmptySitemapQaCount();
        count[sourceKey] += 1;
        counts.set(pageTarget, count);
      });
    };
    addItems("local", sitemapItems.local);
    addItems("remote", sitemapItems.remote);
    return counts;
  }, [reviewPathPrefix, sitemapItems]);
  const selectedNumberedItem = (0, import_react4.useMemo)(
    () => selectedItemId ? numberedActiveItems.find(
      (numberedItem) => numberedItem.item.id === selectedItemId
    ) : void 0,
    [numberedActiveItems, selectedItemId]
  );
  const initialPromptText = initialPrompt.trim();
  const normalizedReviewUserId = reviewUserId.trim();
  const presenceDisplayName = getReviewPresenceDisplayName(
    normalizedReviewUserId
  );
  const presenceColor = getReviewPresenceColor(
    normalizedReviewUserId || presenceSessionId
  );
  const presenceViewport = (0, import_react4.useMemo)(
    () => ({
      label: size.label,
      width: size.width,
      height: size.height,
      kind: getViewportPresetKind(size)
    }),
    [size]
  );
  const presenceStatus = mode === "idle" ? "reviewing" : "editing";
  const visiblePresenceUsers = (0, import_react4.useMemo)(
    () => {
      const projectPresenceUsers = presenceUsers.filter(
        (user) => user.projectId === projectId && user.userId.trim()
      );
      return dedupePresenceUsersByPageAndId(
        projectPresenceUsers,
        reviewPathPrefix
      );
    },
    [presenceUsers, projectId, reviewPathPrefix]
  );
  const currentPagePresenceUsers = (0, import_react4.useMemo)(
    () => visiblePresenceUsers.filter((user) => {
      const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
      return userTarget === activeRoute;
    }),
    [activeRoute, reviewPathPrefix, visiblePresenceUsers]
  );
  const pagePresenceUsers = (0, import_react4.useMemo)(() => {
    const usersByTarget = /* @__PURE__ */ new Map();
    visiblePresenceUsers.forEach((user) => {
      const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
      const pageUsers = usersByTarget.get(userTarget) ?? [];
      pageUsers.push(user);
      usersByTarget.set(userTarget, pageUsers);
    });
    return usersByTarget;
  }, [reviewPathPrefix, visiblePresenceUsers]);
  const getCurrentPresenceState = (0, import_react4.useCallback)(
    () => ({
      projectId,
      sessionId: presenceSessionId,
      userId: normalizedReviewUserId,
      displayName: presenceDisplayName,
      color: presenceColor,
      routeKey: activeRoute,
      target: activeRoute,
      source,
      viewport: presenceViewport,
      mode,
      selectedItemId: selectedNumberedItem?.item.id ?? null,
      selectedReviewNumber: selectedNumberedItem?.number ?? null,
      status: presenceStatus,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }),
    [
      activeRoute,
      mode,
      normalizedReviewUserId,
      presenceColor,
      presenceDisplayName,
      presenceSessionId,
      presenceStatus,
      presenceViewport,
      projectId,
      selectedNumberedItem,
      source
    ]
  );
  const refreshItems = (0, import_react4.useCallback)(async () => {
    const nextItems = await adapter.list({
      projectId,
      pageId: activeAdapterEntry.pageId,
      routeKey: isRemoteSource ? activeRoute : void 0
    });
    setItems(nextItems);
    return nextItems;
  }, [activeAdapterEntry.pageId, activeRoute, adapter, isRemoteSource, projectId]);
  const refreshSitemapItems = (0, import_react4.useCallback)(async () => {
    const [localResult, remoteResult] = await Promise.allSettled([
      localAdapterEntry ? localAdapterEntry.adapter.list({
        projectId,
        pageId: localAdapterEntry.pageId
      }) : Promise.resolve([]),
      remoteAdapterEntry ? remoteAdapterEntry.adapter.list({
        projectId,
        pageId: remoteAdapterEntry.pageId,
        source: remoteAdapterEntry.label
      }) : Promise.resolve([])
    ]);
    setSitemapItems({
      local: localResult.status === "fulfilled" ? localResult.value : [],
      remote: remoteResult.status === "fulfilled" ? remoteResult.value : []
    });
  }, [localAdapterEntry, projectId, remoteAdapterEntry]);
  const refreshReviewData = (0, import_react4.useCallback)(async () => {
    await controllerRef.current?.reload();
    await Promise.all([refreshItems(), refreshSitemapItems()]);
  }, [refreshItems, refreshSitemapItems]);
  const clearSelectedItem = (0, import_react4.useCallback)(() => {
    pendingRestoreRef.current = null;
    selectedItemIdRef.current = null;
    setSelectedItemId(null);
    controllerRef.current?.highlightItem(void 0);
  }, []);
  const toggleItemOverlayVisibility = (0, import_react4.useCallback)(
    (itemId) => {
      const nextHiddenItemIds = new Set(hiddenOverlayItemIds);
      if (nextHiddenItemIds.has(itemId)) {
        nextHiddenItemIds.delete(itemId);
      } else {
        nextHiddenItemIds.add(itemId);
      }
      const nextHiddenItemIdList = Array.from(nextHiddenItemIds);
      setHiddenOverlayItemIds(nextHiddenItemIds);
      const controller = controllerRef.current;
      controller?.setHiddenItemIds(nextHiddenItemIdList);
      hiddenOverlayItemIdListRef.current = nextHiddenItemIdList;
    },
    [hiddenOverlayItemIds]
  );
  const destroyReviewKit = (0, import_react4.useCallback)(() => {
    cleanupTargetRef.current?.();
    cleanupTargetRef.current = null;
    controllerRef.current?.destroy();
    controllerRef.current = null;
  }, []);
  const syncTargetViewport = (0, import_react4.useCallback)(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);
  const refreshTargetOverlayState = (0, import_react4.useCallback)(() => {
    setTargetOverlayState(
      getTargetOverlayState(iframeRef.current?.contentDocument ?? void 0)
    );
  }, []);
  const dispatchTargetOverlayHotkey = (0, import_react4.useCallback)(
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
  const toggleTargetOverlay = (0, import_react4.useCallback)(
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
  const closeTargetOverlay = (0, import_react4.useCallback)(
    (overlay) => {
      const currentState = getTargetOverlayState(
        iframeRef.current?.contentDocument ?? void 0
      );
      setTargetOverlayState(currentState);
      if (!currentState[overlay]) return false;
      return dispatchTargetOverlayHotkey(overlay);
    },
    [dispatchTargetOverlayHotkey]
  );
  const syncShellTarget = (0, import_react4.useCallback)(
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
          selectedItemIdRef.current,
          source
        );
      } else {
        updateShellUrl(normalizedTarget, sizeRef.current, source);
      }
    },
    [clearSelectedItem, reviewPathPrefix, source]
  );
  const applyItemScroll = (0, import_react4.useCallback)(
    (item) => {
      if (selectedItemIdRef.current !== item.id) return;
      const targetWindow = iframeRef.current?.contentWindow;
      const targetDocument = iframeRef.current?.contentDocument;
      if (!targetWindow) return;
      const anchorElement = targetDocument ? queryReviewItemAnchorElement(targetDocument, item) : void 0;
      runWithAutoScrollBehavior2(targetDocument ?? void 0, () => {
        if (!targetDocument) return;
        setDocumentScrollInstantly2(
          targetWindow,
          targetDocument,
          getReviewItemRestoreScrollPosition(
            targetWindow,
            targetDocument,
            item,
            anchorElement
          )
        );
      });
      syncTargetViewport();
      controllerRef.current?.highlightItem(item.id);
    },
    [syncTargetViewport]
  );
  const applyPendingRestore = (0, import_react4.useCallback)(() => {
    const item = pendingRestoreRef.current;
    if (!item) return;
    applyItemScroll(item);
    pendingRestoreRef.current = null;
  }, [applyItemScroll]);
  const cancelReviewMode = (0, import_react4.useCallback)(() => {
    const controller = controllerRef.current;
    if (!controller || controller.getMode() === "idle") return false;
    controller.setMode("idle");
    setMode(controller.getMode());
    return true;
  }, []);
  const clearRulerMeasure = (0, import_react4.useCallback)(() => {
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setRulerStart(null);
    setRulerPoint(null);
    setRulerHover(null);
    setIsRulerDragging(false);
  }, []);
  const closeRuler = (0, import_react4.useCallback)(() => {
    if (!isRulerVisible) return false;
    setIsRulerVisible(false);
    clearRulerMeasure();
    return true;
  }, [clearRulerMeasure, isRulerVisible]);
  const toggleRuler = (0, import_react4.useCallback)(() => {
    if (!isRulerAvailable) return;
    cancelReviewMode();
    setIsSitemapOpen(false);
    setIsFigmaSettingsOpen(false);
    clearRulerMeasure();
    setIsRulerVisible((current) => !current);
  }, [cancelReviewMode, clearRulerMeasure, isRulerAvailable]);
  const finishRulerDrag = (0, import_react4.useCallback)((point) => {
    if (point) {
      setRulerPoint(point);
    }
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setIsRulerDragging(false);
  }, []);
  const startRulerDrag = (0, import_react4.useCallback)(
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
  const reloadTargetFrame = (0, import_react4.useCallback)(() => {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      return;
    }
  }, []);
  const openFigmaSettings = (0, import_react4.useCallback)(() => {
    cancelReviewMode();
    setIsSitemapOpen(false);
    setIsInitialPromptOpen(false);
    setFigmaTokenDraft(getStoredFigmaToken());
    setReviewUserIdDraft(getStoredReviewUserId());
    setReviewThemeDraft(reviewTheme);
    setFigmaSettingsStatus("");
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
    setIsFigmaSettingsOpen(true);
  }, [cancelReviewMode, reviewTheme]);
  const closeFigmaSettings = (0, import_react4.useCallback)(() => {
    setIsFigmaSettingsOpen(false);
    setFigmaSettingsStatus("");
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
  }, []);
  const saveReviewSettings = (0, import_react4.useCallback)(
    (token, userId, theme) => {
      const nextToken = token.trim();
      const nextUserId = userId.trim();
      const nextTheme = normalizeReviewTheme(theme);
      const shouldReload = nextToken !== getStoredFigmaToken() || nextUserId !== getStoredReviewUserId();
      writeStoredFigmaToken(nextToken);
      writeStoredReviewUserId(nextUserId);
      writeStoredReviewTheme(nextTheme);
      setFigmaTokenDraft(nextToken);
      setReviewUserId(nextUserId);
      setReviewUserIdDraft(nextUserId);
      setReviewTheme(nextTheme);
      setReviewThemeDraft(nextTheme);
      setFigmaSettingsStatus(
        nextToken || nextUserId || nextTheme !== DEFAULT_REVIEW_THEME ? "Saved" : "Cleared"
      );
      if (shouldReload) {
        reloadTargetFrame();
      }
      closeFigmaSettings();
    },
    [closeFigmaSettings, reloadTargetFrame]
  );
  const restoreReviewItem = (0, import_react4.useCallback)(
    (item) => {
      const nextTarget = getItemTarget(item, reviewPathPrefix);
      const nextSize = getRestoredSize(item, viewportPresets);
      pendingRestoreRef.current = item;
      selectedItemIdRef.current = item.id;
      setSelectedItemId(item.id);
      setActiveRoute(nextTarget);
      setDraftTarget(nextTarget);
      setSize(nextSize);
      updateShellUrlForItem(nextTarget, nextSize, item.id, source);
      if (targetRef.current !== nextTarget) {
        setTarget(nextTarget);
        return;
      }
      applyPendingRestore();
    },
    [applyPendingRestore, viewportPresets, reviewPathPrefix, source]
  );
  const restoreInitialItem = (0, import_react4.useCallback)(async () => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;
    pendingInitialItemIdRef.current = null;
    const item = await adapter.get(itemId);
    if (item) {
      restoreReviewItem(item);
    }
  }, [adapter, restoreReviewItem]);
  const initReviewKit = (0, import_react4.useCallback)(() => {
    destroyReviewKit();
    const iframe = iframeRef.current;
    const targetWindow = iframe?.contentWindow;
    const targetDocument = iframe?.contentDocument;
    if (!iframe || !targetWindow || !targetDocument) return;
    const syncRouteFromFrame = () => {
      const nextTarget = getFrameRouteTarget(targetWindow, reviewPathPrefix);
      if (nextTarget !== targetRef.current && !pageTargets.has(nextTarget)) {
        return;
      }
      syncShellTarget(nextTarget);
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
          getViewportRect: () => frame.getBoundingClientRect(),
          getOverlayRect: () => {
            const frameRect = frame.getBoundingClientRect();
            const scrollRect = frameScrollRef.current?.getBoundingClientRect();
            if (!scrollRect) return frameRect;
            const left = Math.max(frameRect.left, scrollRect.left);
            const top = Math.max(frameRect.top, scrollRect.top);
            const right = Math.min(
              frameRect.left + frameRect.width,
              scrollRect.left + scrollRect.width
            );
            const bottom = Math.min(
              frameRect.top + frameRect.height,
              scrollRect.top + scrollRect.height
            );
            return {
              left,
              top,
              width: Math.max(0, right - left),
              height: Math.max(0, bottom - top)
            };
          }
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
    controllerRef.current.setHiddenItemIds(hiddenOverlayItemIdListRef.current);
    setMode(controllerRef.current.getMode());
    void refreshItems();
    void restoreInitialItem();
    applyPendingRestore();
    refreshTargetOverlayState();
    setTargetScrollbarHidden(
      targetDocument,
      getViewportPresetKind(sizeRef.current) === "mobile"
    );
  }, [
    adapter,
    applyPendingRestore,
    cancelReviewMode,
    closeRuler,
    destroyReviewKit,
    projectId,
    pageTargets,
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
  (0, import_react4.useEffect)(() => destroyReviewKit, [destroyReviewKit]);
  (0, import_react4.useEffect)(() => {
    if (!presence || !normalizedReviewUserId) {
      const session = presenceSessionRef.current;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
      void session?.disconnect();
      return void 0;
    }
    let isActive = true;
    let unsubscribe;
    const initialState = getCurrentPresenceState();
    void Promise.resolve(
      presence.connect({
        projectId,
        sessionId: presenceSessionId,
        userId: normalizedReviewUserId,
        displayName: presenceDisplayName,
        color: presenceColor,
        initialState
      })
    ).then((session) => {
      if (!isActive) {
        void session.disconnect();
        return;
      }
      presenceSessionRef.current = session;
      unsubscribe = session.subscribe(setPresenceUsers);
      setPresenceSessionVersion((current) => current + 1);
      void session.update(initialState);
    }).catch(() => {
      if (!isActive) return;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
    });
    return () => {
      isActive = false;
      unsubscribe?.();
      const session = presenceSessionRef.current;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
      void session?.disconnect();
    };
  }, [
    normalizedReviewUserId,
    presence,
    presenceColor,
    presenceDisplayName,
    presenceSessionId,
    projectId
  ]);
  (0, import_react4.useEffect)(() => {
    const session = presenceSessionRef.current;
    if (!session || !normalizedReviewUserId) return;
    void session.update(getCurrentPresenceState());
  }, [
    getCurrentPresenceState,
    normalizedReviewUserId,
    presenceSessionVersion
  ]);
  (0, import_react4.useEffect)(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument || frameDocument.readyState !== "complete") return;
    initReviewKit();
  }, [initReviewKit]);
  (0, import_react4.useEffect)(() => {
    void refreshItems();
  }, [refreshItems]);
  (0, import_react4.useEffect)(() => {
    void refreshSitemapItems();
  }, [refreshSitemapItems]);
  (0, import_react4.useEffect)(() => {
    if (!isSitemapOpen) return;
    void refreshSitemapItems();
  }, [isSitemapOpen, refreshSitemapItems]);
  (0, import_react4.useEffect)(() => {
    hiddenOverlayItemIdListRef.current = hiddenOverlayItemIdList;
    controllerRef.current?.setHiddenItemIds(hiddenOverlayItemIdList);
  }, [hiddenOverlayItemIdList]);
  (0, import_react4.useEffect)(() => {
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
  (0, import_react4.useEffect)(() => {
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
  (0, import_react4.useEffect)(() => {
    if (mode === "idle" && !isRulerVisible && !isInitialPromptOpen && !isSitemapOpen && !isFigmaSettingsOpen) {
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
      if (isInitialPromptOpen) {
        setIsInitialPromptOpen(false);
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
    isInitialPromptOpen,
    isRulerVisible,
    isSitemapOpen,
    mode
  ]);
  (0, import_react4.useEffect)(() => {
    targetRef.current = target;
    setActiveRoute(target);
  }, [target]);
  (0, import_react4.useEffect)(() => {
    sizeRef.current = size;
    if (selectedItemIdRef.current) {
      updateShellUrlForItem(
        targetRef.current,
        size,
        selectedItemIdRef.current,
        source
      );
    } else {
      updateShellUrl(targetRef.current, size, source);
    }
    syncTargetViewport();
    setTargetScrollbarHidden(
      iframeRef.current?.contentDocument,
      getViewportPresetKind(size) === "mobile"
    );
  }, [size, source, syncTargetViewport]);
  (0, import_react4.useEffect)(() => {
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
  (0, import_react4.useEffect)(() => {
    if (isFigmaOverlayAvailable || !targetOverlayState.figma) return;
    dispatchTargetOverlayHotkey("figma");
  }, [
    dispatchTargetOverlayHotkey,
    isFigmaOverlayAvailable,
    targetOverlayState.figma
  ]);
  (0, import_react4.useEffect)(() => {
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
    const snapDesign = (screen, axis) => {
      const current = sizeRef.current;
      const scaleX = current.designWidth ? current.width / current.designWidth : 1;
      const scale = axis === "y" ? current.designHeight ? current.height / current.designHeight : scaleX : scaleX;
      return Math.round(Math.round(screen / scale) * scale);
    };
    const getActiveRulerPoint = (event) => {
      const rect = rulerDragRectRef.current ?? rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return void 0;
      const point = getRulerEventClientPoint(event);
      const snapped = getRulerPointFromRect(point.clientX, point.clientY, rect);
      return { x: snapDesign(snapped.x, "x"), y: snapDesign(snapped.y, "y") };
    };
    const getHoverRulerPoint = (event) => {
      const rect = rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const { clientX, clientY } = getRulerEventClientPoint(event);
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
      return { x: snapDesign(x, "x"), y: snapDesign(y, "y") };
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
    const handlePointerMove = (event) => {
      const mouseEvent = event;
      if (isRulerDraggingRef.current) {
        const point = getActiveRulerPoint(mouseEvent);
        if (!point) return;
        mouseEvent.preventDefault();
        setRulerPoint(point);
        setRulerHover(point);
        return;
      }
      setRulerHover(getHoverRulerPoint(mouseEvent));
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
      target2.addEventListener("mousemove", handlePointerMove, true);
      target2.addEventListener("mouseup", handleDragEnd, true);
    });
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      dragTargets.forEach((target2) => {
        target2.removeEventListener("mousedown", handleDragStart, true);
        target2.removeEventListener("mousemove", handlePointerMove, true);
        target2.removeEventListener("mouseup", handleDragEnd, true);
      });
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [finishRulerDrag, isRulerAvailable, isRulerVisible, startRulerDrag]);
  (0, import_react4.useEffect)(() => {
    clearRulerMeasure();
  }, [clearRulerMeasure, size.height, size.width, targetSrc]);
  (0, import_react4.useEffect)(() => {
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
    updateShellUrl(normalizedTarget, sizeRef.current, source);
  };
  const selectPage = (href) => {
    const normalizedTarget = normalizeTarget(href, reviewPathPrefix);
    clearSelectedItem();
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current, source);
    setIsSitemapOpen(false);
  };
  const setReviewMode = (nextMode) => {
    const writeMode = getReviewModeWriteMode(nextMode);
    if (writeMode && !activeAdapterEntry.writeModes.includes(writeMode)) return;
    closeRuler();
    if (nextMode === "element") {
      closeTargetOverlay("figma");
    }
    controllerRef.current?.setMode(nextMode);
    setMode(controllerRef.current?.getMode() ?? "idle");
  };
  const copyCurrentUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy URL"), 1200);
  };
  const changeReviewSource = (nextSource) => {
    if (!sourceEntries.some((entry) => entry.label === nextSource)) return;
    cancelReviewMode();
    clearSelectedItem();
    setItems([]);
    setSource(nextSource);
    updateShellUrl(targetRef.current, sizeRef.current, nextSource);
  };
  const changeItemStatus = async (item, nextStatus) => {
    if (!activeAdapterEntry.updateStatus) return;
    const statusIndex = activeAdapterEntry.statusOptions.findIndex(
      (statusOption2) => statusOption2.value === nextStatus
    );
    const statusOption = activeAdapterEntry.statusOptions[statusIndex];
    if (!statusOption) return;
    await activeAdapterEntry.updateStatus({
      id: item.id,
      item,
      status: statusOption.value,
      statusOption,
      statusIndex
    });
    await refreshReviewData();
  };
  const submitItem = async (numberedItem) => {
    const { item } = numberedItem;
    const localSubmitAdapter = localAdapterEntry;
    const syncLocalSubmission = localSubmitAdapter?.syncSubmission;
    if (!remoteAdapterEntry || !localSubmitAdapter || !syncLocalSubmission || item.submitStatus === "submitted") {
      return;
    }
    const submitLocal = syncLocalSubmission;
    await submitLocal({
      id: item.id,
      item,
      patch: {
        submitStatus: "submitting",
        submitError: void 0
      }
    });
    await refreshReviewData();
    try {
      await remoteAdapterEntry.adapter.create({
        ...item,
        reviewNumber: void 0,
        externalIssueId: void 0,
        externalIssueUrl: void 0,
        submittedAt: void 0,
        submitStatus: "submitted",
        submitError: void 0
      });
      await localSubmitAdapter.adapter.remove(item.id);
      if (selectedItemIdRef.current === item.id) {
        clearSelectedItem();
      }
    } catch (error) {
      await submitLocal({
        id: item.id,
        item,
        patch: {
          submitStatus: "failed",
          submitError: error instanceof Error ? error.message : "Failed to submit remote"
        }
      });
    }
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
  const closePromptModal = () => {
    setIsInitialPromptOpen(false);
  };
  const removeItem = async (item) => {
    if (!activeAdapterEntry.canRemove || item.submitStatus === "submitting" || !isRemoteSource && item.submitStatus === "submitted") {
      return;
    }
    await activeAdapterEntry.adapter.remove(item.id);
    if (selectedItemIdRef.current === item.id) {
      clearSelectedItem();
      updateShellUrl(targetRef.current, sizeRef.current, source);
    }
    await refreshReviewData();
  };
  (0, import_react4.useEffect)(() => {
    const handleHotkey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      if (isEditableEventTarget(event)) return;
      const actions = {
        r: () => {
          if (isRulerAvailable) toggleRuler();
        },
        g: () => toggleTargetOverlay("grid"),
        f: () => toggleTargetOverlay("figma"),
        n: () => setReviewMode("note"),
        e: () => setReviewMode("element"),
        a: () => setReviewMode("area")
      };
      const action = actions[event.key.toLowerCase()];
      if (!action) return;
      event.preventDefault();
      action();
    };
    window.addEventListener("keydown", handleHotkey);
    return () => window.removeEventListener("keydown", handleHotkey);
  }, [isRulerAvailable, toggleRuler, toggleTargetOverlay, setReviewMode]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: `df-review-shell is-theme-${effectiveReviewTheme}${isListVisible ? " is-list-visible" : ""}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          ReviewTopbar,
          {
            draftTarget,
            copyLabel,
            viewportPresets,
            size,
            presetScopeCounts,
            isRulerAvailable,
            isRulerVisible,
            targetOverlayState,
            isFigmaOverlayAvailable,
            onDraftTargetChange: setDraftTarget,
            onApplyTarget: applyTarget,
            onOpenSitemap: () => setIsSitemapOpen(true),
            onCopyCurrentUrl: () => void copyCurrentUrl(),
            onSizeChange: setSize,
            onToggleRuler: toggleRuler,
            onToggleTargetOverlay: toggleTargetOverlay,
            onOpenInitialPrompt: () => {
              setPromptTab("about");
              setIsInitialPromptOpen(true);
            },
            onOpenSettings: openFigmaSettings
          }
        ),
        isSitemapOpen && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          SitemapModal,
          {
            pages,
            activeRoute,
            pageQaCounts,
            pagePresenceUsers,
            getPageTarget: (href) => normalizeTarget(href, reviewPathPrefix),
            onClose: () => setIsSitemapOpen(false),
            onSelectPage: selectPage
          }
        ),
        isFigmaSettingsOpen && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          ReviewSettingsModal,
          {
            figmaTokenDraft,
            reviewUserIdDraft,
            reviewThemeDraft,
            figmaSettingsStatus,
            isFigmaTokenVisible,
            isFigmaTokenGuideOpen,
            onClose: closeFigmaSettings,
            onFigmaTokenDraftChange: setFigmaTokenDraft,
            onReviewUserIdDraftChange: setReviewUserIdDraft,
            onReviewThemeDraftChange: setReviewThemeDraft,
            onClearStatus: () => setFigmaSettingsStatus(""),
            onToggleFigmaTokenVisible: () => setIsFigmaTokenVisible((current) => !current),
            onToggleFigmaTokenGuide: () => setIsFigmaTokenGuideOpen((current) => !current),
            onSave: saveReviewSettings
          }
        ),
        isInitialPromptOpen && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          PromptModal,
          {
            promptTab,
            initialPromptText,
            copiedPromptKey,
            onClose: closePromptModal,
            onPromptTabChange: setPromptTab,
            onCopyPrompt: (text, key) => void copyPrompt(text, key)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "df-review-side-rail", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            "aria-label": isListVisible ? "Hide QA list" : "Show QA list",
            className: "df-review-side-toggle",
            type: "button",
            onClick: () => setIsListVisible((current) => !current),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GripVertical, {}) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: "QA" })
            ]
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("aside", { className: "df-review-qa-panel", "aria-hidden": !isListVisible, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "df-review-panel-body", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "df-review-item-list", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-list-header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-list-toolbar", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-list-controls", children: [
                showSourceSelect && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "select",
                  {
                    "aria-label": "QA source",
                    className: "df-review-source-select",
                    value: source,
                    onChange: (event) => changeReviewSource(event.currentTarget.value),
                    children: sourceEntries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: entry.label, children: entry.label }, entry.label))
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "button",
                  {
                    "aria-label": "Refresh QA",
                    className: "df-review-source-refresh",
                    type: "button",
                    onClick: () => void refreshReviewData(),
                    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RefreshCw, { "aria-hidden": "true" })
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "df-review-filter-tabs", "aria-label": "QA filters", children: REVIEW_QA_FILTERS.map((filter) => {
                const count = qaFilterCounts.get(filter.key) ?? 0;
                const isActive = qaFilter === filter.key;
                return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "button",
                  {
                    "aria-label": `${filter.label} QA (${count})`,
                    "aria-pressed": isActive,
                    className: `df-review-filter-tab${isActive ? " is-active" : ""}`,
                    type: "button",
                    onClick: () => setQaFilter(filter.key),
                    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "df-review-filter-icon", children: filter.scope ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReviewScopeIcon2, { scope: filter.scope }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ListFilter, { "aria-hidden": "true" }) })
                  },
                  filter.key
                );
              }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-list-title", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
                activeAdapterEntry.label,
                " QA"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("strong", { children: [
                filteredNumberedActiveItems.length,
                qaFilter === "all" ? "" : `/${activeItems.length}`
              ] })
            ] }),
            currentPagePresenceUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "div",
              {
                "aria-label": "Review presence",
                className: "df-review-presence-row",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "df-review-presence-label", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Users, { "aria-hidden": "true" }),
                    "online ",
                    currentPagePresenceUsers.length
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "df-review-presence-list", children: currentPagePresenceUsers.map((user) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                    "span",
                    {
                      className: `df-review-presence-chip${user.sessionId === presenceSessionId ? " is-self" : ""}`,
                      style: {
                        "--df-review-presence-color": user.color
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                          "span",
                          {
                            className: "df-review-presence-dot",
                            "aria-hidden": "true"
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "df-review-presence-name", children: user.userId })
                      ]
                    },
                    user.sessionId
                  )) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-list-scroll", children: [
            activeItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "df-review-empty", children: isRemoteSource ? `No ${activeAdapterEntry.label} QA on this page.` : "No QA on this page." }),
            activeItems.length > 0 && filteredNumberedActiveItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "df-review-empty", children: "No QA in this filter." }),
            filteredNumberedActiveItems.map((numberedItem) => {
              const { item } = numberedItem;
              const itemMode = getReviewItemMode(item);
              const isSubmitted = item.submitStatus === "submitted";
              const isSubmitting = item.submitStatus === "submitting";
              const canRemoveItem = activeAdapterEntry.canRemove && !isSubmitting && (isRemoteSource || !isSubmitted);
              const hasRemoteActions = !isRemoteSource && Boolean(remoteAdapterEntry) || Boolean(item.externalIssueUrl);
              const isItemOverlayVisible = !hiddenOverlayItemIds.has(item.id);
              const itemComment = item.comment.trim() || getItemTitle(item);
              const statusOptions = activeAdapterEntry.statusOptions;
              const currentStatusOption = getStatusOption(
                item.status,
                statusOptions
              );
              const canUpdateStatus = Boolean(activeAdapterEntry.updateStatus) && statusOptions.length > 0 && !isSubmitting;
              return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                "article",
                {
                  className: `df-review-item-card${item.id === selectedItemId ? " is-active" : ""}${getItemPresetScope(item) !== currentPresetScope ? " is-dim" : ""}${isItemOverlayVisible ? "" : " is-overlay-hidden"}`,
                  onClick: () => restoreReviewItem(item),
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-item-header", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-item-main", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "df-review-item-badges", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "df-review-item-id", children: numberedItem.displayLabel }),
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                            "span",
                            {
                              className: `df-review-item-scope is-scope-${numberedItem.scope}`,
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReviewScopeIcon2, { scope: numberedItem.scope }),
                                numberedItem.label
                              ]
                            }
                          ),
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                            "span",
                            {
                              className: `df-review-item-mode is-mode-${itemMode}`,
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReviewItemModeIcon, { mode: itemMode }),
                                itemMode
                              ]
                            }
                          )
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { className: "df-review-item-comment", children: itemComment }),
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("small", { children: formatDate2(item.createdAt) }),
                        item.submitError && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("small", { className: "df-review-item-error", children: item.submitError })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                        "div",
                        {
                          className: "df-review-item-header-actions",
                          onClick: (event) => event.stopPropagation(),
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                              "button",
                              {
                                "aria-label": isItemOverlayVisible ? "Hide QA overlay" : "Show QA overlay",
                                className: `df-review-item-visibility${isItemOverlayVisible ? " is-visible" : " is-hidden"}`,
                                type: "button",
                                onClick: () => toggleItemOverlayVisibility(item.id),
                                children: isItemOverlayVisible ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Eye, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(EyeOff, { "aria-hidden": "true" })
                              }
                            ),
                            canRemoveItem && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                              "button",
                              {
                                "aria-label": "Delete QA",
                                className: "df-review-item-delete",
                                type: "button",
                                onClick: () => void removeItem(item),
                                children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(X, { "aria-hidden": "true" })
                              }
                            )
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-item-actions", children: [
                      currentStatusOption && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                        "div",
                        {
                          className: "df-review-item-status-actions",
                          onClick: (event) => event.stopPropagation(),
                          children: canUpdateStatus ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                            "select",
                            {
                              "aria-label": "QA status",
                              className: "df-review-item-status-select",
                              value: currentStatusOption.value,
                              onChange: (event) => void changeItemStatus(
                                item,
                                event.currentTarget.value
                              ),
                              children: statusOptions.map((statusOption) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                                "option",
                                {
                                  value: statusOption.value,
                                  children: statusOption.label
                                },
                                statusOption.value
                              ))
                            }
                          ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "df-review-item-status-badge", children: currentStatusOption.label })
                        }
                      ),
                      hasRemoteActions && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                        "div",
                        {
                          className: "df-review-item-remote-actions",
                          onClick: (event) => event.stopPropagation(),
                          children: [
                            !isRemoteSource && remoteAdapterEntry && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                              "button",
                              {
                                "aria-label": "Submit to remote",
                                className: "df-review-item-action-button df-review-item-submit-button",
                                disabled: isSubmitted || isSubmitting,
                                type: "button",
                                onClick: () => void submitItem(numberedItem),
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Upload, { "aria-hidden": "true" }),
                                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isSubmitted ? "\uB4F1\uB85D\uB428" : isSubmitting ? "\uB4F1\uB85D \uC911" : "remote \uB4F1\uB85D" })
                                ]
                              }
                            ),
                            item.externalIssueUrl && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                              "a",
                              {
                                "aria-label": "Open remote issue",
                                className: "df-review-item-action-button",
                                href: item.externalIssueUrl,
                                rel: "noreferrer",
                                target: "_blank",
                                children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ExternalLink, { "aria-hidden": "true" })
                              }
                            )
                          ]
                        }
                      )
                    ] })
                  ]
                },
                item.id
              );
            })
          ] })
        ] }) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("main", { className: "df-review-stage", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-frame", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "df-review-frame-scroll", ref: frameScrollRef, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "df-review-frame-canvas", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "div",
            {
              className: `df-review-device-frame${isRulerVisible && isRulerAvailable ? " is-ruler" : ""}`,
              children: [
                isRulerVisible && isRulerAvailable && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "df-review-ruler-corner", "aria-hidden": "true" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                    "div",
                    {
                      className: "df-review-ruler-gutter is-x",
                      style: {
                        "--df-review-ruler-step-x": `${rulerScaleX * 20}px`
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-ruler-frame-label", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: size.label }),
                          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
                            size.designWidth,
                            size.designHeight ? `x${size.designHeight}` : "",
                            rulerUnit
                          ] })
                        ] }),
                        rulerHover && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                          "div",
                          {
                            className: "df-review-ruler-coord is-x",
                            style: { left: `${rulerHover.x}px` },
                            children: Math.round(rulerHover.x / rulerScaleX)
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    "div",
                    {
                      className: "df-review-ruler-gutter is-y",
                      style: {
                        "--df-review-ruler-step-y": `${rulerScaleY * 20}px`
                      },
                      children: rulerHover && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                        "div",
                        {
                          className: "df-review-ruler-coord is-y",
                          style: { top: `${rulerHover.y}px` },
                          children: Math.round(rulerHover.y / rulerScaleY)
                        }
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
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
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
                      isRulerVisible && isRulerAvailable && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                        "div",
                        {
                          ref: rulerOverlayRef,
                          "aria-label": "Ruler",
                          className: `df-review-ruler-overlay${isRulerDragging ? " is-dragging" : ""}`,
                          role: "application",
                          onWheel: (event) => {
                            iframeRef.current?.contentWindow?.scrollBy(
                              event.deltaX,
                              event.deltaY
                            );
                          },
                          children: [
                            rulerHover && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
                              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                                "div",
                                {
                                  className: "df-review-ruler-guide is-x",
                                  "aria-hidden": "true",
                                  style: { top: `${rulerHover.y}px` }
                                }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                                "div",
                                {
                                  className: "df-review-ruler-guide is-y",
                                  "aria-hidden": "true",
                                  style: { left: `${rulerHover.x}px` }
                                }
                              )
                            ] }),
                            rulerMeasure && (rulerMeasure.width > 0 || rulerMeasure.height > 0) && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
                              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
                              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
                            ] })
                          ]
                        }
                      )
                    ]
                  }
                )
              ]
            }
          ) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "df-review-frame-actions", children: canWriteAny && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-mode", "aria-label": "Add QA", children: [
            canWriteDom && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                "aria-label": "Element",
                className: `df-review-mode-button is-element${mode === "element" ? " is-active" : ""}`,
                type: "button",
                onClick: () => setReviewMode("element"),
                children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SquareMousePointer, { "aria-hidden": "true" })
              }
            ),
            canWriteDom && (canWriteNote || canWriteArea) && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "df-review-mode-divider", "aria-hidden": "true", children: "|" }),
            canWriteNote && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                "aria-label": "Note",
                className: `df-review-mode-button is-note${mode === "note" ? " is-active" : ""}`,
                type: "button",
                onClick: () => setReviewMode("note"),
                children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(StickyNote, { "aria-hidden": "true" })
              }
            ),
            canWriteArea && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                "aria-label": "Area",
                className: `df-review-mode-button is-area${mode === "area" ? " is-active" : ""}`,
                type: "button",
                onClick: () => setReviewMode("area"),
                children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Scan, { "aria-hidden": "true" })
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
  ensureReviewShellStyle();
  const root = document.getElementById(rootId);
  if (!root) return;
  root.style.width = "100%";
  root.style.height = "100%";
  root.style.margin = "0";
  (0, import_client.createRoot)(root).render(
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react4.default.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReviewShell, { ...shellProps }) })
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ReviewShell,
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
  createReviewPagesFromGlob,
  createSupabasePresenceAdapter,
  mountReviewShell
});
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
lucide-react/dist/esm/icons/external-link.mjs:
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
lucide-react/dist/esm/icons/refresh-cw.mjs:
lucide-react/dist/esm/icons/ruler.mjs:
lucide-react/dist/esm/icons/scan.mjs:
lucide-react/dist/esm/icons/settings.mjs:
lucide-react/dist/esm/icons/smartphone.mjs:
lucide-react/dist/esm/icons/square-mouse-pointer.mjs:
lucide-react/dist/esm/icons/sticky-note.mjs:
lucide-react/dist/esm/icons/upload.mjs:
lucide-react/dist/esm/icons/users.mjs:
lucide-react/dist/esm/icons/x.mjs:
lucide-react/dist/esm/lucide-react.mjs:
  (**
   * @license lucide-react v1.20.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=react-shell.cjs.map