import type { Plugin } from 'vite';
import { createRuntimeOptions, createReviewSourceEnvReplacements, injectReviewSourceEnv, type ReviewSourceLocatorOptions } from './locator.options';
import { injectReviewSourceComponentHints } from './locator.transform';
import { createJsxDevRuntime } from './jsx.runtime';

const VIRTUAL_JSX_DEV_RUNTIME_ID =
  '\0@designfever/web-review-kit/source-locator/jsx-dev-runtime';

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
      sourceEnvReplacements = createReviewSourceEnvReplacements(
        config.env,
        config.command
      );
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
