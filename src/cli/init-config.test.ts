import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  InitCancelledError,
  createInitConfig,
  parseInitArgs,
  promptInitAnswers,
  resolveInitConfig,
  type InitPrompt,
} from './init-config';

const roots: string[] = [];

function promptWith(values: Array<string | boolean | null>) {
  const next = () => Promise.resolve(values.shift() ?? null);
  return {
    text: vi.fn(next),
    select: vi.fn(next),
    confirm: vi.fn(next),
  } as unknown as InitPrompt;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('init configuration', () => {
  it('normalizes a local-only interactive setup', async () => {
    const prompt = promptWith(['demo', 'Demo site', 'local', 'none', true]);

    const config = createInitConfig(await promptInitAnswers({}, prompt));

    expect(config).toEqual({
      schemaVersion: 1,
      projectId: 'demo',
      projectName: 'Demo site',
      reviewStorage: 'local',
      figmaImageStore: 'none',
      sourceLocator: true,
      profile: null,
    });
  });

  it('represents custom review and Figma capabilities with one profile', async () => {
    const config = await resolveInitConfig({
      args: [
        '--non-interactive',
        '--project-id',
        'custom-site',
        '--project-name',
        'Custom site',
        '--review-storage',
        'custom',
        '--figma-image-store',
        'custom',
        '--source-locator',
        '--profile',
        './provider-profile.mjs',
      ],
    });

    expect(config.reviewStorage).toBe('custom');
    expect(config.figmaImageStore).toBe('custom');
    expect(config.profile).toBe('./provider-profile.mjs');
    expect(JSON.stringify(config)).not.toMatch(/token|secret/i);
  });

  it('loads a secret-free JSON config and lets explicit flags override it', async () => {
    const root = await mkdtemp(join(tmpdir(), 'web-review-kit-init-'));
    roots.push(root);
    await writeFile(
      join(root, 'review-kit.json'),
      JSON.stringify({
        schemaVersion: 1,
        projectId: 'fixture',
        projectName: 'Fixture',
        reviewStorage: 'local',
        figmaImageStore: 'none',
        sourceLocator: false,
        profile: null,
      })
    );

    const config = await resolveInitConfig({
      cwd: root,
      args: ['--non-interactive', '--config', 'review-kit.json', '--source-locator'],
    });

    expect(config.sourceLocator).toBe(true);
    expect(config.projectId).toBe('fixture');
  });

  it('rejects missing and invalid input before any writer boundary exists', async () => {
    await expect(
      resolveInitConfig({ args: ['--non-interactive', '--project-id', 'missing-fields'] })
    ).rejects.toThrow('projectName is required');
    expect(() =>
      createInitConfig({
        projectId: 'Invalid ID',
        projectName: 'Invalid',
        reviewStorage: 'local',
        figmaImageStore: 'none',
        sourceLocator: true,
        profile: null,
      })
    ).toThrow('projectId');
    await expect(
      resolveInitConfig({
        args: [
          '--non-interactive',
          '--project-id',
          'custom',
          '--project-name',
          'Custom',
          '--review-storage',
          'custom',
          '--figma-image-store',
          'none',
          '--source-locator',
        ],
      })
    ).rejects.toThrow('provider profile is required');
  });

  it('rejects secret-like and unknown CLI arguments', () => {
    expect(() => parseInitArgs(['--token', 'do-not-accept'])).toThrow(
      'Unknown init option: --token'
    );
    expect(() => parseInitArgs(['--review-storage', 'remote'])).toThrow(
      'must be one of: local, custom'
    );
  });

  it('rejects secret-like fields in checked-in config input', async () => {
    const root = await mkdtemp(join(tmpdir(), 'web-review-kit-init-secret-'));
    roots.push(root);
    await writeFile(
      join(root, 'review-kit.json'),
      JSON.stringify({
        schemaVersion: 1,
        projectId: 'fixture',
        projectName: 'Fixture',
        reviewStorage: 'custom',
        figmaImageStore: 'none',
        sourceLocator: true,
        profile: './profile.mjs',
        token: 'do-not-accept',
      })
    );

    await expect(
      resolveInitConfig({
        cwd: root,
        args: ['--non-interactive', '--config', 'review-kit.json'],
      })
    ).rejects.toThrow('Unknown init config field: token');
  });

  it('stops immediately when an interactive prompt is cancelled', async () => {
    const prompt = promptWith([null]);

    await expect(promptInitAnswers({}, prompt)).rejects.toBeInstanceOf(InitCancelledError);
    expect(prompt.text).toHaveBeenCalledTimes(1);
    expect(prompt.select).not.toHaveBeenCalled();
  });
});
