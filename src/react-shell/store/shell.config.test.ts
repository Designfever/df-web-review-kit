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
    sourceInspector: { enabled: true },
  });

describe('createReviewShellConfig', () => {
  it('disables the source inspector when sourceRoot is missing', () => {
    const config = createConfig();

    expect(config.isSourceInspectorEnabled).toBe(false);
    expect(config.isSourceTreeHoverOutlineEnabled).toBe(false);
  });

  it('enables the source inspector when sourceRoot is available', () => {
    const config = createConfig('/Users/designfever/project');

    expect(config.isSourceInspectorEnabled).toBe(true);
    expect(config.isSourceTreeHoverOutlineEnabled).toBe(true);
  });
});
