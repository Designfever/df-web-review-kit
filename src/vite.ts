import type { Plugin, ResolvedConfig } from 'vite';

type SourceLocatorPattern = string | RegExp;

export interface ReviewSourceLocatorOptions {
  enabled?: boolean;
  root?: string;
  include?: readonly SourceLocatorPattern[];
  exclude?: readonly SourceLocatorPattern[];
  filePath?: 'relative' | 'absolute';
  line?: boolean;
  column?: boolean;
  attributePrefix?: string;
}

type RuntimeMatcher =
  | { type: 'path'; value: string }
  | { type: 'regex'; value: string; flags: string };

type RuntimeOptions = {
  enabled: boolean;
  root: string;
  include: RuntimeMatcher[];
  exclude: RuntimeMatcher[];
  filePath: 'relative' | 'absolute';
  line: boolean;
  column: boolean;
  fileAttribute: string;
  lineAttribute: string;
  columnAttribute: string;
};

const VIRTUAL_JSX_DEV_RUNTIME_ID =
  '\0@designfever/web-review-kit/source-locator/jsx-dev-runtime';

export const reviewSourceLocator = (
  options: ReviewSourceLocatorOptions = {}
): Plugin => {
  let runtimeOptions = createRuntimeOptions(options);

  return {
    name: 'df-web-review-kit-source-locator',
    enforce: 'pre',
    configResolved(config) {
      runtimeOptions = createRuntimeOptions(options, config);
    },
    resolveId(id, importer) {
      if (!runtimeOptions.enabled) return null;
      if (id !== 'react/jsx-dev-runtime') return null;
      if (importer === VIRTUAL_JSX_DEV_RUNTIME_ID) return null;

      return VIRTUAL_JSX_DEV_RUNTIME_ID;
    },
    load(id) {
      if (id !== VIRTUAL_JSX_DEV_RUNTIME_ID) return null;
      return createJsxDevRuntime(runtimeOptions);
    },
  };
};

function createRuntimeOptions(
  options: ReviewSourceLocatorOptions,
  config?: ResolvedConfig
): RuntimeOptions {
  const attributePrefix = (options.attributePrefix ?? 'data-wrk-source').replace(
    /-+$/,
    ''
  );
  const root = normalizePath(options.root ?? config?.root ?? '');
  const enabled = options.enabled ?? (config?.command === 'serve');

  return {
    enabled,
    root,
    include: (options.include ?? []).map(createRuntimeMatcher),
    exclude: (options.exclude ?? ['node_modules', 'dist']).map(
      createRuntimeMatcher
    ),
    filePath: options.filePath ?? 'relative',
    line: options.line ?? true,
    column: options.column ?? true,
    fileAttribute: `${attributePrefix}-file`,
    lineAttribute: `${attributePrefix}-line`,
    columnAttribute: `${attributePrefix}-column`,
  };
}

function createRuntimeMatcher(pattern: SourceLocatorPattern): RuntimeMatcher {
  if (pattern instanceof RegExp) {
    return { type: 'regex', value: pattern.source, flags: pattern.flags };
  }

  return { type: 'path', value: normalizePath(pattern).replace(/^\.\//, '') };
}

function normalizePath(value: string) {
  return value.replace(/\\/g, '/').replace(/\/+$/, '');
}

function createJsxDevRuntime(options: RuntimeOptions) {
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
