// src/vite.ts
var VIRTUAL_JSX_DEV_RUNTIME_ID = "\0@designfever/web-review-kit/source-locator/jsx-dev-runtime";
var reviewSourceLocator = (options = {}) => {
  let runtimeOptions = createRuntimeOptions(options);
  return {
    name: "df-web-review-kit-source-locator",
    enforce: "pre",
    configResolved(config) {
      runtimeOptions = createRuntimeOptions(options, config);
    },
    resolveId(id, importer) {
      if (!runtimeOptions.enabled) return null;
      if (id !== "react/jsx-dev-runtime") return null;
      if (importer === VIRTUAL_JSX_DEV_RUNTIME_ID) return null;
      return VIRTUAL_JSX_DEV_RUNTIME_ID;
    },
    load(id) {
      if (id !== VIRTUAL_JSX_DEV_RUNTIME_ID) return null;
      return createJsxDevRuntime(runtimeOptions);
    }
  };
};
var reviewDataLocator = (options = {}) => {
  let root = normalizePath(options.root ?? "");
  let enabled = options.enabled ?? false;
  const include = (options.include ?? []).map(createRuntimeMatcher);
  const exclude = (options.exclude ?? ["node_modules", "dist"]).map(
    createRuntimeMatcher
  );
  const componentPattern = options.componentPattern ?? /Section[A-Za-z0-9_]*/;
  const fileKey = options.fileAttribute ?? "__wrkDataFile";
  const lineKey = options.lineAttribute ?? "__wrkDataLine";
  const componentSource = `(^|[\\n,{(\\[]\\s*)(component:\\s*)(['"\`])(${componentPattern.source})\\3`;
  return {
    name: "df-web-review-kit-data-locator",
    enforce: "pre",
    configResolved(config) {
      root = normalizePath(options.root ?? config.root ?? "");
      enabled = options.enabled ?? config.command === "serve";
    },
    transform(code, id) {
      if (!enabled) return null;
      const file = normalizePath(id.split("?")[0]);
      const relativeFile = root && file.startsWith(root + "/") ? file.slice(root.length + 1) : file;
      if (include.length > 0 && !include.some((m) => matchesPath(m, file, relativeFile)))
        return null;
      if (exclude.some((m) => matchesPath(m, file, relativeFile))) return null;
      const sourceFile = (options.filePath ?? "relative") === "absolute" ? file : relativeFile;
      const regex = new RegExp(componentSource, "g");
      let changed = false;
      const out = code.replace(
        regex,
        (_match, pre, comp, quote, name, offset) => {
          const line = code.slice(0, offset + pre.length).split("\n").length;
          changed = true;
          return `${pre}${JSON.stringify(fileKey)}: ${JSON.stringify(sourceFile)}, ${JSON.stringify(lineKey)}: ${line}, ${comp}${quote}${name}${quote}`;
        }
      );
      return changed ? { code: out, map: null } : null;
    }
  };
};
function matchesPath(matcher, absoluteFile, relativeFile) {
  if (matcher.type === "regex") {
    const regex = new RegExp(matcher.value, matcher.flags);
    return regex.test(absoluteFile) || regex.test(relativeFile);
  }
  const target = matcher.value.startsWith("/") ? absoluteFile : relativeFile;
  return target === matcher.value || target.startsWith(matcher.value + "/") || target.includes("/" + matcher.value);
}
function createRuntimeOptions(options, config) {
  const attributePrefix = (options.attributePrefix ?? "data-wrk-source").replace(
    /-+$/,
    ""
  );
  const root = normalizePath(options.root ?? config?.root ?? "");
  const enabled = options.enabled ?? config?.command === "serve";
  return {
    enabled,
    root,
    include: (options.include ?? []).map(createRuntimeMatcher),
    exclude: (options.exclude ?? ["node_modules", "dist"]).map(
      createRuntimeMatcher
    ),
    filePath: options.filePath ?? "relative",
    line: options.line ?? true,
    column: options.column ?? true,
    fileAttribute: `${attributePrefix}-file`,
    lineAttribute: `${attributePrefix}-line`,
    columnAttribute: `${attributePrefix}-column`
  };
}
function createRuntimeMatcher(pattern) {
  if (pattern instanceof RegExp) {
    return { type: "regex", value: pattern.source, flags: pattern.flags };
  }
  return { type: "path", value: normalizePath(pattern).replace(/^\.\//, "") };
}
function normalizePath(value) {
  return value.replace(/\\/g, "/").replace(/\/+$/, "");
}
function createJsxDevRuntime(options) {
  return `
import { Fragment, jsxDEV as baseJsxDEV } from 'react/jsx-dev-runtime';

const OPTIONS = ${JSON.stringify(options)};

export { Fragment };

export function jsxDEV(type, props, key, isStaticChildren, source, self) {
  return baseJsxDEV(
    type,
    injectSourceProps(type, props, source),
    key,
    isStaticChildren,
    source,
    self
  );
}

function injectSourceProps(type, props, source) {
  if (typeof type !== 'string') return props;
  if (!source || typeof source.fileName !== 'string') return props;

  const sourceFile = getSourceFile(source.fileName);
  if (!sourceFile) return props;

  const nextProps = props ? { ...props } : {};
  if (nextProps[OPTIONS.fileAttribute] == null) {
    nextProps[OPTIONS.fileAttribute] = sourceFile;
  }
  if (OPTIONS.line && source.lineNumber != null && nextProps[OPTIONS.lineAttribute] == null) {
    nextProps[OPTIONS.lineAttribute] = String(source.lineNumber);
  }
  if (OPTIONS.column && source.columnNumber != null && nextProps[OPTIONS.columnAttribute] == null) {
    nextProps[OPTIONS.columnAttribute] = String(source.columnNumber);
  }

  return nextProps;
}

function getSourceFile(fileName) {
  const absoluteFile = normalizePath(fileName);
  const relativeFile = getRelativeFile(absoluteFile);

  if (OPTIONS.include.length > 0 && !matchesAny(OPTIONS.include, absoluteFile, relativeFile)) {
    return null;
  }
  if (matchesAny(OPTIONS.exclude, absoluteFile, relativeFile)) return null;

  return OPTIONS.filePath === 'absolute' ? absoluteFile : relativeFile;
}

function getRelativeFile(absoluteFile) {
  if (!OPTIONS.root) return absoluteFile;
  if (absoluteFile === OPTIONS.root) return '';
  if (absoluteFile.startsWith(OPTIONS.root + '/')) {
    return absoluteFile.slice(OPTIONS.root.length + 1);
  }

  return absoluteFile;
}

function matchesAny(patterns, absoluteFile, relativeFile) {
  return patterns.some((pattern) =>
    matchesPattern(pattern, absoluteFile, relativeFile)
  );
}

function matchesPattern(pattern, absoluteFile, relativeFile) {
  if (pattern.type === 'regex') {
    const regex = new RegExp(pattern.value, pattern.flags);
    return regex.test(absoluteFile) || regex.test(relativeFile);
  }

  const value = pattern.value;
  const target = isAbsolutePattern(value) ? absoluteFile : relativeFile;
  if (!value.includes('*')) {
    return target === value || target.startsWith(value + '/');
  }

  return globToRegExp(value).test(target);
}

function isAbsolutePattern(value) {
  return value.startsWith('/') || /^[a-zA-Z]:\\//.test(value);
}

function globToRegExp(value) {
  const source = escapeRegExp(value)
    .replace(/\\\\\\*\\\\\\*/g, '.*')
    .replace(/\\\\\\*/g, '[^/]*');

  return new RegExp('^' + source + '$');
}

function escapeRegExp(value) {
  return value.replace(/[|\\\\{}()[\\]^$+*?.]/g, '\\\\$&');
}

function normalizePath(value) {
  return value.replace(/\\\\/g, '/').replace(/\\/+$/, '');
}
`;
}
export {
  reviewDataLocator,
  reviewSourceLocator
};
//# sourceMappingURL=vite.js.map