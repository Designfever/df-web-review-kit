import type { ResolvedConfig } from 'vite';
import { isReviewLocatorEnabled } from './review-locator.mode';

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

type RuntimeMatcher =
  | { type: 'path'; value: string }
  | { type: 'regex'; value: string; flags: string };

export type RuntimeOptions = {
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

const REVIEW_SOURCE_ENV_DEFINE_KEYS = [
  ['__DF_WRK_REVIEW_SOURCE_ROOT__', 'VITE_REVIEW_SOURCE_ROOT'],
  ['__DF_WRK_REVIEW_SOURCE_EDITOR__', 'VITE_REVIEW_SOURCE_EDITOR'],
  [
    '__DF_WRK_REVIEW_SOURCE_URL_TEMPLATE__',
    'VITE_REVIEW_SOURCE_URL_TEMPLATE',
  ],
] as const;

const REVIEW_SOURCE_OPEN_ENABLED_DEFINE_KEY =
  '__DF_WRK_REVIEW_SOURCE_OPEN_ENABLED__';

type ReviewSourceEnvReplacements = Record<string, string>;

export const createReviewSourceEnvReplacements = (
  env: ResolvedConfig['env'] = {},
  command: ResolvedConfig['command'] = 'serve'
): ReviewSourceEnvReplacements => {
  return {
    ...Object.fromEntries(
      REVIEW_SOURCE_ENV_DEFINE_KEYS.map(([defineKey, envKey]) => [
        defineKey,
        JSON.stringify(env[envKey] ?? ''),
      ])
    ),
    [REVIEW_SOURCE_OPEN_ENABLED_DEFINE_KEY]: JSON.stringify(command === 'serve'),
  };
};

export const injectReviewSourceEnv = (
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

export function matchesPath(
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

export function createRuntimeOptions(
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

export function createRuntimeMatcher(pattern: SourceLocatorPattern): RuntimeMatcher {
  if (pattern instanceof RegExp) {
    return { type: 'regex', value: pattern.source, flags: pattern.flags };
  }

  return { type: 'path', value: normalizePath(pattern).replace(/^\.\//, '') };
}

export function normalizePath(value: string) {
  return value.replace(/\\/g, '/').replace(/\/+$/, '');
}
