import { describe, expect, it } from 'vitest';
import type { ResolvedConfig } from 'vite';
import { reviewSourceLocator } from '../vite';
import { isReviewLocatorEnabled } from './review-locator.mode';

type TestLocatorPlugin = {
  configResolved: (config: ResolvedConfig) => void;
  resolveId: (id: string, importer?: string) => string | null;
  transform: (
    code: string,
    id: string
  ) => Promise<{ code: string } | null>;
};

const createLocatorPlugin = (
  command: ResolvedConfig['command'],
  enabled: boolean
) => {
  const plugin = reviewSourceLocator({
    enabled,
  }) as unknown as TestLocatorPlugin;
  plugin.configResolved({
    command,
    env: { VITE_REVIEW_SOURCE_ROOT: '/private/project' },
    root: '/private/project',
  } as unknown as ResolvedConfig);
  return plugin;
};

describe('isReviewLocatorEnabled', () => {
  it('enables review locators on the dev server', () => {
    expect(isReviewLocatorEnabled('serve')).toBe(true);
  });

  it('disables review locators in production builds', () => {
    expect(isReviewLocatorEnabled('build')).toBe(false);
  });

  it('ignores legacy disable options on the dev server', () => {
    const plugin = createLocatorPlugin('serve', false);

    expect(
      plugin.resolveId('react/jsx-dev-runtime', '/private/project/src/app.tsx')
    ).not.toBeNull();
  });

  it('ignores legacy enable options in production builds', async () => {
    const plugin = createLocatorPlugin('build', true);
    const code =
      'const root = typeof __DF_WRK_REVIEW_SOURCE_ROOT__ === "undefined";';

    expect(
      plugin.resolveId('react/jsx-dev-runtime', '/private/project/src/app.tsx')
    ).toBeNull();
    await expect(
      plugin.transform(code, '/private/project/src/app.tsx')
    ).resolves.toBeNull();
  });
});
