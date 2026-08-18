import { describe, expect, it, vi } from 'vitest';
import {
  createPackageUpdateCommand,
  findReviewKitDependency,
  isLocalDependencySpec,
  isNewerVersion,
  runVersionCheck,
} from './version.check';

describe('review-kit version check', () => {
  it('compares stable and prerelease versions', () => {
    expect(isNewerVersion('0.8.12', '0.8.13')).toBe(true);
    expect(isNewerVersion('0.9.0', '0.8.13')).toBe(false);
    expect(isNewerVersion('0.8.13-beta.1', '0.8.13')).toBe(true);
    expect(isNewerVersion('0.8.13', '0.8.13')).toBe(false);
  });

  it.each([
    ['npm', ['install', '--save-exact', '--save-dev']],
    ['pnpm', ['add', '--exact', '--save-dev']],
    ['yarn', ['add', '--exact', '--dev']],
  ] as const)('creates an exact %s update command', (packageManager, args) => {
    const dependency = findReviewKitDependency({
      devDependencies: { '@designfever/web-review-kit': '0.8.12' },
    });

    expect(dependency).toEqual({ field: 'devDependencies', spec: '0.8.12' });
    expect(
      createPackageUpdateCommand(packageManager, dependency!, '0.8.13')
    ).toEqual({
      command: packageManager,
      args: [...args, '@designfever/web-review-kit@0.8.13'],
    });
  });

  it('recognizes dependency specs that must not be replaced', () => {
    expect(isLocalDependencySpec('link:../df-web-review-kit')).toBe(true);
    expect(isLocalDependencySpec('workspace:*')).toBe(true);
    expect(isLocalDependencySpec('0.8.12')).toBe(false);
  });

  it('updates only after interactive confirmation', async () => {
    const log = vi.fn();
    const installUpdate = vi.fn(async () => 0);
    const exitCode = await runVersionCheck({
      cwd: process.cwd(),
      currentVersion: '0.8.12',
      dependency: { field: 'dependencies', spec: '0.8.12' },
      packageManager: 'npm',
      fetchLatestVersion: async () => '0.8.13',
      confirmUpdate: async () => true,
      installUpdate,
      log,
    });

    expect(exitCode).toBe(0);
    expect(installUpdate).toHaveBeenCalledWith({
      command: 'npm',
      args: [
        'install',
        '--save-exact',
        '@designfever/web-review-kit@0.8.13',
      ],
    });
    expect(log).toHaveBeenCalledWith('✓ Updated to 0.8.13. Starting dev...');
  });

  it('continues without installing when the user declines', async () => {
    const log = vi.fn();
    const installUpdate = vi.fn(async () => 0);
    const exitCode = await runVersionCheck({
      currentVersion: '0.8.12',
      dependency: { field: 'dependencies', spec: '0.8.12' },
      packageManager: 'yarn',
      fetchLatestVersion: async () => '0.8.13',
      confirmUpdate: async () => false,
      installUpdate,
      log,
    });

    expect(exitCode).toBe(0);
    expect(installUpdate).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      '→ Update skipped. Starting dev with the installed version.'
    );
  });
});
