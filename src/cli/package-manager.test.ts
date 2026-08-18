import { describe, expect, it } from 'vitest';
import { createPackageInstallCommand } from './package-manager';

describe('package install command', () => {
  it.each([
    ['npm', ['install', '--save-exact']],
    ['pnpm', ['add', '--exact']],
    ['yarn', ['add', '--exact']],
  ] as const)('creates the exact %s command', (manager, args) => {
    expect(
      createPackageInstallCommand(
        manager,
        '@designfever/web-review-kit',
        '0.10.0'
      )
    ).toEqual({
      command: manager,
      args: [...args, '@designfever/web-review-kit@0.10.0'],
    });
  });
});
