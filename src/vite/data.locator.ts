import type { Plugin } from 'vite';
import { isReviewLocatorEnabled } from './review-locator.mode';
import { normalizePath, createRuntimeMatcher, matchesPath, createReviewSourceEnvReplacements, injectReviewSourceEnv, type ReviewDataLocatorOptions } from './locator.options';

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
      sourceEnvReplacements = createReviewSourceEnvReplacements(
        config.env,
        config.command
      );
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
