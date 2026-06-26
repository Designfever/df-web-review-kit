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

const REVIEW_SOURCE_ENV_DEFINE_KEYS = [
  ['__DF_WRK_REVIEW_SOURCE_ROOT__', 'VITE_REVIEW_SOURCE_ROOT'],
  ['__DF_WRK_REVIEW_SOURCE_EDITOR__', 'VITE_REVIEW_SOURCE_EDITOR'],
  [
    '__DF_WRK_REVIEW_SOURCE_URL_TEMPLATE__',
    'VITE_REVIEW_SOURCE_URL_TEMPLATE',
  ],
] as const;

type ReviewSourceEnvReplacements = Record<string, string>;

const createReviewSourceEnvReplacements = (
  env: ResolvedConfig['env'] = {}
): ReviewSourceEnvReplacements => {
  return Object.fromEntries(
    REVIEW_SOURCE_ENV_DEFINE_KEYS.map(([defineKey, envKey]) => [
      defineKey,
      JSON.stringify(env[envKey] ?? ''),
    ])
  );
};

const injectReviewSourceEnv = (
  code: string,
  replacements: ReviewSourceEnvReplacements
) => {
  let nextCode = code;
  for (const [defineKey, value] of Object.entries(replacements)) {
    nextCode = nextCode
      .split(`typeof ${defineKey}`)
      .join(`typeof ${value}`)
      .split(`: ${defineKey}`)
      .join(`: ${value}`);
  }

  return nextCode === code ? null : nextCode;
};

export const reviewSourceLocator = (
  options: ReviewSourceLocatorOptions = {}
): Plugin => {
  let runtimeOptions = createRuntimeOptions(options);
  let sourceEnvReplacements = createReviewSourceEnvReplacements();

  return {
    name: 'df-web-review-kit-source-locator',
    enforce: 'pre',
    configResolved(config) {
      runtimeOptions = createRuntimeOptions(options, config);
      sourceEnvReplacements = createReviewSourceEnvReplacements(config.env);
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
    transform(code) {
      const injectedCode = injectReviewSourceEnv(code, sourceEnvReplacements);
      return injectedCode ? { code: injectedCode, map: null } : null;
    },
  };
};

export interface ReviewDataLocatorOptions {
  enabled?: boolean;
  root?: string;
  include?: readonly SourceLocatorPattern[];
  exclude?: readonly SourceLocatorPattern[];
  filePath?: 'relative' | 'absolute';
  /** 매칭할 component 이름 패턴. 기본은 `Section`으로 시작하는 이름. */
  componentPattern?: RegExp;
  fileAttribute?: string;
  lineAttribute?: string;
}

/**
 * page data 파일의 section 객체(`component: 'SectionXxx'`)에 출처 파일/라인을
 * `__wrkDataFile`/`__wrkDataLine` prop 으로 주입한다. 라인 보존을 위해 같은 줄에만 삽입한다.
 */
export const reviewDataLocator = (
  options: ReviewDataLocatorOptions = {}
): Plugin => {
  let root = normalizePath(options.root ?? '');
  let enabled = options.enabled ?? false;
  let sourceEnvReplacements = createReviewSourceEnvReplacements();
  const include = (options.include ?? []).map(createRuntimeMatcher);
  const exclude = (options.exclude ?? ['node_modules', 'dist']).map(
    createRuntimeMatcher
  );
  const componentPattern = options.componentPattern ?? /Section[A-Za-z0-9_]*/;
  const fileKey = options.fileAttribute ?? '__wrkDataFile';
  const lineKey = options.lineAttribute ?? '__wrkDataLine';

  const componentSource = `(^|[\\n,{(\\[]\\s*)(component:\\s*)(['"\`])(${componentPattern.source})\\3`;

  return {
    name: 'df-web-review-kit-data-locator',
    enforce: 'pre',
    configResolved(config) {
      root = normalizePath(options.root ?? config.root ?? '');
      enabled = options.enabled ?? config.command === 'serve';
      sourceEnvReplacements = createReviewSourceEnvReplacements(config.env);
    },
    transform(code, id) {
      const envInjectedCode = injectReviewSourceEnv(
        code,
        sourceEnvReplacements
      );
      const inputCode = envInjectedCode ?? code;
      if (!enabled) return null;
      const file = normalizePath(id.split('?')[0]);
      const relativeFile =
        root && file.startsWith(root + '/') ? file.slice(root.length + 1) : file;
      if (
        include.length > 0 &&
        !include.some((m) => matchesPath(m, file, relativeFile))
      )
        return envInjectedCode ? { code: envInjectedCode, map: null } : null;
      if (exclude.some((m) => matchesPath(m, file, relativeFile))) {
        return envInjectedCode ? { code: envInjectedCode, map: null } : null;
      }

      const sourceFile =
        (options.filePath ?? 'relative') === 'absolute' ? file : relativeFile;
      const regex = new RegExp(componentSource, 'g');
      let changed = false;
      const out = inputCode.replace(
        regex,
        (
          _match,
          pre: string,
          comp: string,
          quote: string,
          name: string,
          offset: number
        ) => {
          const line = inputCode
            .slice(0, offset + pre.length)
            .split('\n').length;
          changed = true;
          return `${pre}${JSON.stringify(fileKey)}: ${JSON.stringify(sourceFile)}, ${JSON.stringify(lineKey)}: ${line}, ${comp}${quote}${name}${quote}`;
        }
      );

      return changed || envInjectedCode ? { code: out, map: null } : null;
    },
  };
};

function matchesPath(
  matcher: RuntimeMatcher,
  absoluteFile: string,
  relativeFile: string
) {
  if (matcher.type === 'regex') {
    const regex = new RegExp(matcher.value, matcher.flags);
    return regex.test(absoluteFile) || regex.test(relativeFile);
  }
  const target = matcher.value.startsWith('/') ? absoluteFile : relativeFile;
  return target === matcher.value || target.startsWith(matcher.value + '/') || target.includes('/' + matcher.value);
}

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
