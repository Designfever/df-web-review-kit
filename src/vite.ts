import { type Plugin, type ResolvedConfig } from 'vite';
import { isReviewLocatorEnabled } from './vite/review-locator.mode';

export * from './vite/figma-image-store';

type SourceLocatorPattern = string | RegExp;

export interface ReviewSourceLocatorOptions {
  /** Dev server에서는 자동 활성화된다. Build에서는 true일 때만 활성화된다. */
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
  componentAttribute: string;
  parentFileAttribute: string;
  parentLineAttribute: string;
  parentColumnAttribute: string;
  parentComponentAttribute: string;
};

type TypeScriptModule = typeof import('typescript');

type SourceComponentInsertion = {
  offset: number;
  value: string;
};

const VIRTUAL_JSX_DEV_RUNTIME_ID =
  '\0@designfever/web-review-kit/source-locator/jsx-dev-runtime';

let typescriptModulePromise: Promise<TypeScriptModule | null> | undefined;

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
    async transform(code, id) {
      if (!runtimeOptions.enabled) return null;

      const injectedCode = injectReviewSourceEnv(code, sourceEnvReplacements);
      const inputCode = injectedCode ?? code;
      const componentInjectedCode = await injectReviewSourceComponentHints(
        inputCode,
        id,
        runtimeOptions
      );

      return injectedCode || componentInjectedCode
        ? { code: componentInjectedCode ?? inputCode, map: null }
        : null;
    },
  };
};

export interface ReviewDataLocatorOptions {
  /** Dev server에서는 자동 활성화된다. Build에서는 true일 때만 활성화된다. */
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
  let enabled = false;
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
      enabled = isReviewLocatorEnabled(config.command, options.enabled);
      sourceEnvReplacements = createReviewSourceEnvReplacements(config.env);
    },
    transform(code, id) {
      if (!enabled) return null;

      const envInjectedCode = injectReviewSourceEnv(
        code,
        sourceEnvReplacements
      );
      const inputCode = envInjectedCode ?? code;
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

async function injectReviewSourceComponentHints(
  code: string,
  id: string,
  options: RuntimeOptions
) {
  const file = normalizePath(id.split('?')[0]);
  if (!isJsxSourceFile(file, code)) return null;

  const relativeFile =
    options.root && file.startsWith(options.root + '/')
      ? file.slice(options.root.length + 1)
      : file;
  if (
    options.include.length > 0 &&
    !options.include.some((matcher) => matchesPath(matcher, file, relativeFile))
  ) {
    return null;
  }
  if (
    options.exclude.some((matcher) => matchesPath(matcher, file, relativeFile))
  ) {
    return null;
  }

  const ts = await loadTypeScript();
  if (!ts) return null;

  const sourceFile = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.TSX
  );
  const insertions = getSourceComponentInsertions(
    ts,
    sourceFile,
    options.componentAttribute,
    options.parentComponentAttribute
  );
  if (insertions.length === 0) return null;

  return applySourceComponentInsertions(code, insertions);
}

async function loadTypeScript() {
  const importTypeScript = new Function(
    'specifier',
    'return import(specifier)'
  ) as (specifier: string) => Promise<TypeScriptModule>;
  typescriptModulePromise ??= importTypeScript('typescript')
    .then((module) => module)
    .catch(() => null);
  return typescriptModulePromise;
}

function isJsxSourceFile(file: string, code: string) {
  return /\.[cm]?[jt]sx$/.test(file) && code.includes('<');
}

function getSourceComponentInsertions(
  ts: TypeScriptModule,
  sourceFile: import('typescript').SourceFile,
  componentAttribute: string,
  parentComponentAttribute: string
) {
  const insertions: SourceComponentInsertion[] = [];

  const visit = (
    node: import('typescript').Node,
    currentComponent: string | undefined
  ) => {
    const component = getComponentNameForNode(ts, node) ?? currentComponent;
    if (
      component &&
      isIntrinsicJsxElement(ts, node, sourceFile) &&
      !hasJsxAttribute(ts, node, componentAttribute) &&
      !hasJsxAttribute(ts, node, 'data-component')
    ) {
      insertions.push({
        offset: node.tagName.end,
        value: ` ${componentAttribute}=${JSON.stringify(component)}`,
      });
    }
    if (
      component &&
      isCustomJsxElement(ts, node, sourceFile) &&
      !hasJsxAttribute(ts, node, parentComponentAttribute)
    ) {
      insertions.push({
        offset: node.tagName.end,
        value: ` ${parentComponentAttribute}=${JSON.stringify(component)}`,
      });
    }

    ts.forEachChild(node, (child) => visit(child, component));
  };

  visit(sourceFile, undefined);
  return insertions;
}

function getComponentNameForNode(
  ts: TypeScriptModule,
  node: import('typescript').Node
) {
  if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
    const name = node.name?.text;
    return isComponentName(name) ? name : undefined;
  }

  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
    const name = node.name.text;
    return isComponentName(name) && node.initializer ? name : undefined;
  }

  return undefined;
}

function isIntrinsicJsxElement(
  ts: TypeScriptModule,
  node: import('typescript').Node,
  sourceFile: import('typescript').SourceFile
): node is import('typescript').JsxOpeningLikeElement {
  if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) {
    return false;
  }

  const tagName = node.tagName.getText(sourceFile);
  return /^[a-z]/.test(tagName) || tagName.includes('-');
}

function isCustomJsxElement(
  ts: TypeScriptModule,
  node: import('typescript').Node,
  sourceFile: import('typescript').SourceFile
): node is import('typescript').JsxOpeningLikeElement {
  if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) {
    return false;
  }

  const tagName = node.tagName.getText(sourceFile);
  if (isReactRuntimeElementName(tagName)) return false;
  return /^[A-Z]/.test(tagName);
}

function isReactRuntimeElementName(tagName: string) {
  const name = tagName.startsWith('React.')
    ? tagName.slice('React.'.length)
    : tagName;
  return name === 'Fragment' || name === 'StrictMode' || name === 'Profiler';
}

function hasJsxAttribute(
  ts: TypeScriptModule,
  node: import('typescript').JsxOpeningLikeElement,
  name: string
) {
  return node.attributes.properties.some(
    (property) =>
      ts.isJsxAttribute(property) && property.name.getText() === name
  );
}

function isComponentName(name: string | undefined) {
  return Boolean(name && /^[A-Z][A-Za-z0-9_$]*$/.test(name));
}

function applySourceComponentInsertions(
  code: string,
  insertions: SourceComponentInsertion[]
) {
  return insertions
    .slice()
    .sort((a, b) => b.offset - a.offset)
    .reduce(
      (nextCode, insertion) =>
        `${nextCode.slice(0, insertion.offset)}${insertion.value}${nextCode.slice(
          insertion.offset
        )}`,
      code
    );
}

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
  const enabled = config
    ? isReviewLocatorEnabled(config.command, options.enabled)
    : false;

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
    componentAttribute: `${attributePrefix}-component`,
    parentFileAttribute: `${attributePrefix}-parent-file`,
    parentLineAttribute: `${attributePrefix}-parent-line`,
    parentColumnAttribute: `${attributePrefix}-parent-column`,
    parentComponentAttribute: `${attributePrefix}-parent-component`,
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
const sourceUsageStack = [];
const sourceUsageWrapperCache = new WeakMap();

export { Fragment };

export function jsxDEV(type, props, key, isStaticChildren, source, self) {
  const sourceUsage = getSourceUsage(type, props, source);
  const nextType = sourceUsage ? getSourceUsageWrapper(type, sourceUsage) : type;
  return baseJsxDEV(
    nextType,
    injectSourceProps(type, props, source, sourceUsage),
    key,
    isStaticChildren,
    source,
    self
  );
}

function injectSourceProps(type, props, source, sourceUsage) {
  if (!source || typeof source.fileName !== 'string') return props;

  const sourceFile = getSourceFile(source.fileName);
  if (!sourceFile) return props;

  const nextProps = props ? { ...props } : {};
  if (typeof type !== 'string') {
    injectParentSourceProps(nextProps, sourceUsage);
    return nextProps;
  }

  if (nextProps[OPTIONS.fileAttribute] == null) {
    nextProps[OPTIONS.fileAttribute] = sourceFile;
  }
  if (OPTIONS.line && source.lineNumber != null && nextProps[OPTIONS.lineAttribute] == null) {
    nextProps[OPTIONS.lineAttribute] = String(source.lineNumber);
  }
  if (OPTIONS.column && source.columnNumber != null && nextProps[OPTIONS.columnAttribute] == null) {
    nextProps[OPTIONS.columnAttribute] = String(source.columnNumber);
  }
  injectParentSourceProps(nextProps, getCurrentSourceUsage());

  return nextProps;
}

function getSourceUsage(type, props, source) {
  if (!isSourceUsageComponentType(type)) return null;
  if (!source || typeof source.fileName !== 'string') return null;

  const sourceFile = getSourceFile(source.fileName);
  if (!sourceFile) return null;

  return {
    file: sourceFile,
    line: OPTIONS.line && source.lineNumber != null ? String(source.lineNumber) : '',
    column: OPTIONS.column && source.columnNumber != null ? String(source.columnNumber) : '',
    component: readSourceUsageComponent(props),
  };
}

function isSourceUsageComponentType(type) {
  return (
    typeof type === 'function' &&
    !isClassComponent(type)
  );
}

function isClassComponent(type) {
  return Boolean(type?.prototype?.isReactComponent);
}

function getSourceUsageWrapper(type, usage) {
  let wrappers = sourceUsageWrapperCache.get(type);
  if (!wrappers) {
    wrappers = new Map();
    sourceUsageWrapperCache.set(type, wrappers);
  }

  const key = getSourceUsageKey(usage);
  const existing = wrappers.get(key);
  if (existing) return existing;

  const wrapped = function ReviewSourceUsageWrapper(props) {
    sourceUsageStack.push(usage);
    try {
      return type(props);
    } finally {
      sourceUsageStack.pop();
    }
  };
  wrapped.displayName = 'ReviewSourceUsage(' + getComponentDisplayName(type) + ')';
  wrappers.set(key, wrapped);
  return wrapped;
}

function getComponentDisplayName(type) {
  return type.displayName || type.name || 'Component';
}

function getSourceUsageKey(usage) {
  return [
    usage.file,
    usage.line,
    usage.column,
    usage.component,
  ].join('|');
}

function getCurrentSourceUsage() {
  return sourceUsageStack[sourceUsageStack.length - 1] || null;
}

function readSourceUsageComponent(props) {
  const value = props?.[OPTIONS.parentComponentAttribute];
  return typeof value === 'string' ? value : '';
}

function injectParentSourceProps(props, usage) {
  if (!usage?.file) return;

  if (props[OPTIONS.parentFileAttribute] == null) {
    props[OPTIONS.parentFileAttribute] = usage.file;
  }
  if (usage.line && props[OPTIONS.parentLineAttribute] == null) {
    props[OPTIONS.parentLineAttribute] = usage.line;
  }
  if (usage.column && props[OPTIONS.parentColumnAttribute] == null) {
    props[OPTIONS.parentColumnAttribute] = usage.column;
  }
  if (usage.component && props[OPTIONS.parentComponentAttribute] == null) {
    props[OPTIONS.parentComponentAttribute] = usage.component;
  }
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
