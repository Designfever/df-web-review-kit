import { describe, expect, it } from 'vitest';
import type { WebReviewKitAdapter } from '../../types';
import { createReviewShellConfig } from './shell.config';

const adapter: WebReviewKitAdapter = {
  get: async () => null,
  list: async () => [],
  create: async (item) => item,
  update: async (_id, patch) => ({
    id: 'item',
    projectId: 'test',
    routeKey: '/',
    pageUrl: '/',
    normalizedPath: '/',
    kind: 'area',
    comment: '',
    status: 'todo',
    viewport: { width: 390, height: 844 },
    createdAt: '',
    updatedAt: '',
    ...patch,
  }),
  remove: async () => undefined,
};

const createConfig = (sourceRoot?: string) =>
  createReviewShellConfig({
    projectId: 'test',
    pages: [{ href: '/' }],
    adapters: { local: adapter },
    sourceRoot,
  });

describe('createReviewShellConfig', () => {
  it('keeps source tools independent from sourceRoot', () => {
    const config = createConfig();

    expect(config.sourceOpenOptions.sourceRoot).toBeUndefined();
    expect(config.isSourceTreeHoverOutlineEnabled).toBe(true);
  });

  it('uses sourceRoot only to resolve source paths', () => {
    const config = createConfig('/Users/designfever/project');

    expect(config.sourceOpenOptions.sourceRoot).toBe(
      '/Users/designfever/project'
    );
    expect(config.isSourceTreeHoverOutlineEnabled).toBe(true);
  });

  it('does not create source feature availability gates', () => {
    const config = createReviewShellConfig({
      projectId: 'test',
      pages: [{ href: '/' }],
      adapters: { local: adapter },
      sourceInspector: { enabled: false },
    });

    expect(config).not.toHaveProperty('isSourceInspectorEnabled');
    expect(config).not.toHaveProperty('isSourceTreeEnabled');
    expect(config.isSourceTreeHoverOutlineEnabled).toBe(true);
  });
});
