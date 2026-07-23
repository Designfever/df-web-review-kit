import { describe, expect, it } from 'vitest';
import type { ResolvedConfig } from 'vite';
import { reviewDataLocator, reviewSourceLocator } from '../vite';
import { isReviewLocatorEnabled } from './review-locator.mode';

type TestLocatorPlugin = {
  configResolved: (config: ResolvedConfig) => void;
  resolveId: (id: string, importer?: string) => string | null;
  transform: (
    code: string,
    id: string
  ) => Promise<{ code: string } | null>;
};

type TestDataLocatorPlugin = {
  configResolved: (config: ResolvedConfig) => void;
  transform: (code: string, id: string) => { code: string } | null;
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

const createDataLocatorPlugin = (
  command: ResolvedConfig['command'],
  enabled: boolean
) => {
  const plugin = reviewDataLocator({
    enabled,
  }) as unknown as TestDataLocatorPlugin;
  plugin.configResolved({
    command,
    env: {},
    root: '/private/project',
  } as unknown as ResolvedConfig);
  return plugin;
};

describe('isReviewLocatorEnabled', () => {
  it('enables review locators on the dev server', () => {
    expect(isReviewLocatorEnabled('serve')).toBe(true);
  });

  it('disables review locators by default in production builds', () => {
    expect(isReviewLocatorEnabled('build')).toBe(false);
  });

  it('keeps review locators enabled on the dev server', () => {
    const plugin = createLocatorPlugin('serve', false);

    expect(
      plugin.resolveId('react/jsx-dev-runtime', '/private/project/src/app.tsx')
    ).not.toBeNull();
  });

  it('keeps review locators disabled without build opt-in', async () => {
    const plugin = createLocatorPlugin('build', false);
    const code =
      'const root = typeof __DF_WRK_REVIEW_SOURCE_ROOT__ === "undefined";';

    expect(
      plugin.resolveId('react/jsx-dev-runtime', '/private/project/src/app.tsx')
    ).toBeNull();
    await expect(
      plugin.transform(code, '/private/project/src/app.tsx')
    ).resolves.toBeNull();
  });

  it('enables source locators but disables editor links in review builds', async () => {
    const plugin = createLocatorPlugin('build', true);
    const code = [
      'const root = typeof __DF_WRK_REVIEW_SOURCE_ROOT__ === "undefined";',
      'const canOpen = typeof __DF_WRK_REVIEW_SOURCE_OPEN_ENABLED__ === "undefined" ? true : __DF_WRK_REVIEW_SOURCE_OPEN_ENABLED__;',
    ].join('\n');

    expect(isReviewLocatorEnabled('build', true)).toBe(true);
    expect(
      plugin.resolveId('react/jsx-dev-runtime', '/private/project/src/app.tsx')
    ).not.toBeNull();
    await expect(
      plugin.transform(code, '/private/project/src/app.tsx')
    ).resolves.toMatchObject({
      code: expect.stringContaining('const canOpen = typeof false'),
    });
  });

  it('keeps editor links enabled on the dev server', async () => {
    const plugin = createLocatorPlugin('serve', false);
    const code =
      'const canOpen = typeof __DF_WRK_REVIEW_SOURCE_OPEN_ENABLED__ === "undefined" ? true : __DF_WRK_REVIEW_SOURCE_OPEN_ENABLED__;';

    await expect(
      plugin.transform(code, '/private/project/src/app.tsx')
    ).resolves.toMatchObject({
      code: expect.stringContaining('const canOpen = typeof true'),
    });
  });

  it('enables data locators only with explicit build opt-in', () => {
    const code = "const page = { component: 'SectionHero' };";
    const id = '/private/project/src/data.ts';

    expect(
      createDataLocatorPlugin('build', false).transform(code, id)
    ).toBeNull();
    expect(
      createDataLocatorPlugin('build', true).transform(code, id)?.code
    ).toContain('__wrkDataFile');
  });
});
