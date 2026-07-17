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

  it('disables review locators in builds without a source root', () => {
    expect(isReviewLocatorEnabled('build')).toBe(false);
  });

  it('enables review locators in builds with a source root', () => {
    expect(
      isReviewLocatorEnabled('build', {
        VITE_REVIEW_SOURCE_ROOT: '/private/project',
      })
    ).toBe(true);
  });

  it('keeps review locators disabled for an empty build source root', () => {
    expect(
      isReviewLocatorEnabled('build', {
        VITE_REVIEW_SOURCE_ROOT: '   ',
      })
    ).toBe(false);
  });

  it('ignores legacy disable options on the dev server', () => {
    const plugin = createLocatorPlugin('serve', false);

    expect(
      plugin.resolveId('react/jsx-dev-runtime', '/private/project/src/app.tsx')
    ).not.toBeNull();
  });

  it('enables production build transforms when source root is configured', async () => {
    const plugin = createLocatorPlugin('build', true);
    const code =
      'const root = typeof __DF_WRK_REVIEW_SOURCE_ROOT__ === "undefined";';

    expect(
      plugin.resolveId('react/jsx-dev-runtime', '/private/project/src/app.tsx')
    ).not.toBeNull();
    await expect(
      plugin.transform(code, '/private/project/src/app.tsx')
    ).resolves.toMatchObject({
      code: 'const root = typeof "/private/project" === "undefined";',
    });
  });
});
