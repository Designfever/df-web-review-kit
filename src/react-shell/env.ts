import type {
  ReviewShellProps,
  ReviewSourceEditor,
  ReviewSourceInspectorOptions,
} from './types';

type ReviewRuntimeEnv = Record<string, unknown>;

declare const __DF_WRK_REVIEW_SOURCE_ROOT__: string | undefined;
declare const __DF_WRK_REVIEW_SOURCE_EDITOR__: string | undefined;
declare const __DF_WRK_REVIEW_SOURCE_URL_TEMPLATE__: string | undefined;
declare const __DF_WRK_REVIEW_SOURCE_OPEN_ENABLED__: boolean | undefined;

const REVIEW_SOURCE_EDITORS: readonly ReviewSourceEditor[] = [
  'vscode',
  'cursor',
  'webstorm',
  'custom',
];

const getInjectedSourceRoot = () =>
  typeof __DF_WRK_REVIEW_SOURCE_ROOT__ === 'undefined'
    ? undefined
    : __DF_WRK_REVIEW_SOURCE_ROOT__;

const getInjectedSourceEditor = () =>
  typeof __DF_WRK_REVIEW_SOURCE_EDITOR__ === 'undefined'
    ? undefined
    : __DF_WRK_REVIEW_SOURCE_EDITOR__;

const getInjectedSourceUrlTemplate = () =>
  typeof __DF_WRK_REVIEW_SOURCE_URL_TEMPLATE__ === 'undefined'
    ? undefined
    : __DF_WRK_REVIEW_SOURCE_URL_TEMPLATE__;

const getInjectedSourceOpenEnabled = () =>
  typeof __DF_WRK_REVIEW_SOURCE_OPEN_ENABLED__ === 'undefined'
    ? true
    : __DF_WRK_REVIEW_SOURCE_OPEN_ENABLED__;

const getRuntimeEnv = (): ReviewRuntimeEnv => ({
  VITE_REVIEW_SOURCE_EDITOR: getInjectedSourceEditor(),
  VITE_REVIEW_SOURCE_ROOT: getInjectedSourceRoot(),
  VITE_REVIEW_SOURCE_URL_TEMPLATE: getInjectedSourceUrlTemplate(),
});

const getEnvString = (env: ReviewRuntimeEnv, key: string) => {
  const value = env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const getEnvSourceEditor = (
  env: ReviewRuntimeEnv
): ReviewSourceEditor | undefined => {
  const value = getEnvString(env, 'VITE_REVIEW_SOURCE_EDITOR');
  return REVIEW_SOURCE_EDITORS.includes(value as ReviewSourceEditor)
    ? (value as ReviewSourceEditor)
    : undefined;
};

export const resolveReviewSourceOptions = ({
  sourceInspector,
  sourceRoot,
}: Pick<ReviewShellProps, 'sourceInspector' | 'sourceRoot'>) => {
  const env = getRuntimeEnv();
  const envSourceRoot = getEnvString(env, 'VITE_REVIEW_SOURCE_ROOT');
  const envSourceEditor = getEnvSourceEditor(env);
  const envUrlTemplate = getEnvString(env, 'VITE_REVIEW_SOURCE_URL_TEMPLATE');

  const resolvedSourceInspector: ReviewSourceInspectorOptions | undefined =
    sourceInspector || envSourceEditor || envUrlTemplate
      ? {
          ...sourceInspector,
          ...(envSourceEditor ? { editor: envSourceEditor } : {}),
          ...(envUrlTemplate ? { urlTemplate: envUrlTemplate } : {}),
        }
      : sourceInspector;

  return {
    canOpenSourceFiles: getInjectedSourceOpenEnabled(),
    sourceInspector: resolvedSourceInspector,
    sourceRoot: envSourceRoot ?? sourceRoot,
  };
};
