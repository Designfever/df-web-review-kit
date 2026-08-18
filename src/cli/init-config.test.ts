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

describe('framework-neutral init configuration', () => {
  it('asks only for project id and project name', async () => {
    const prompt = promptWith(['f82b8ad5-7289-43d4-b175-bd5ecf1d4dba', 'iKAOS']);
    const config = createInitConfig(await promptInitAnswers({}, prompt));

    expect(config).toEqual({
      schemaVersion: 2,
      projectId: 'f82b8ad5-7289-43d4-b175-bd5ecf1d4dba',
      projectName: 'iKAOS',
    });
    expect(prompt.text).toHaveBeenCalledTimes(2);
    expect(prompt.select).not.toHaveBeenCalled();
    expect(prompt.confirm).not.toHaveBeenCalled();
  });

  it('loads schema v2 config and lets explicit flags override it', async () => {
    const root = await mkdtemp(join(tmpdir(), 'web-review-kit-init-'));
    roots.push(root);
    await writeFile(
      join(root, 'review-kit.json'),
      JSON.stringify({
        schemaVersion: 2,
        projectId: 'fixture',
        projectName: 'Fixture',
      })
    );

    const config = await resolveInitConfig({
      cwd: root,
      args: [
        '--non-interactive',
        '--config',
        'review-kit.json',
        '--project-name',
        'Changed',
      ],
    });

    expect(config).toEqual({
      schemaVersion: 2,
      projectId: 'fixture',
      projectName: 'Changed',
    });
  });

  it('rejects removed provider and secret options', () => {
    expect(() => parseInitArgs(['--review-storage', 'custom'])).toThrow(
      'Unknown init option: --review-storage'
    );
    expect(() => parseInitArgs(['--profile', './provider.mjs'])).toThrow(
      'Unknown init option: --profile'
    );
    expect(() => parseInitArgs(['--token', 'do-not-accept'])).toThrow(
      'Unknown init option: --token'
    );
  });

  it('rejects missing, invalid, old, and unknown config input', async () => {
    await expect(
      resolveInitConfig({ args: ['--non-interactive', '--project-id', 'missing-name'] })
    ).rejects.toThrow('projectName is required');
    expect(() =>
      createInitConfig({ projectId: 'Invalid ID', projectName: 'Invalid' })
    ).toThrow('projectId');

    const root = await mkdtemp(join(tmpdir(), 'web-review-kit-init-invalid-'));
    roots.push(root);
    await writeFile(
      join(root, 'old.json'),
      JSON.stringify({ schemaVersion: 1, projectId: 'fixture', projectName: 'Fixture' })
    );
    await writeFile(
      join(root, 'secret.json'),
      JSON.stringify({
        schemaVersion: 2,
        projectId: 'fixture',
        projectName: 'Fixture',
        token: 'do-not-accept',
      })
    );

    await expect(
      resolveInitConfig({
        cwd: root,
        args: ['--non-interactive', '--config', 'old.json'],
      })
    ).rejects.toThrow('Unsupported init config schemaVersion');
    await expect(
      resolveInitConfig({
        cwd: root,
        args: ['--non-interactive', '--config', 'secret.json'],
      })
    ).rejects.toThrow('Unknown init config field: token');
  });

  it('stops immediately when an interactive prompt is cancelled', async () => {
    const prompt = promptWith([null]);
    await expect(promptInitAnswers({}, prompt)).rejects.toBeInstanceOf(InitCancelledError);
    expect(prompt.text).toHaveBeenCalledTimes(1);
  });
});
