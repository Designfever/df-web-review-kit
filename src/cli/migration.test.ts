import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  applyMigrationPlan,
  createMigrationPlan,
  formatMigrationPlan,
  rollbackMigration,
} from './migration';

const roots: string[] = [];

async function createFixture(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), 'web-review-kit-migration-'));
  roots.push(root);
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

async function snapshot(root: string, ignoreBackup = false) {
  const result: Record<string, string> = {};
  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (ignoreBackup && entry.name === '.web-review-kit') continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else result[path.slice(root.length + 1)] = await readFile(path, 'utf8');
    }
  }
  await visit(root);
  return result;
}

function legacyFiles(source = `
  import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';
  createWebReviewKit({ projectId: 'legacy-app', adapter: localAdapter() });
`) {
  return {
    'package.json': JSON.stringify({
      dependencies: {
        '@designfever/web-review-kit': '^0.8.0',
        react: '^19.0.0',
        vite: '^8.0.0',
      },
    }),
    'pnpm-lock.yaml': 'lockfileVersion: 9\n',
    'vite.config.ts': "import { defineConfig } from 'vite';\nexport default defineConfig({ plugins: [] });\n",
    'src/legacy-review.ts': source,
    '.env.example': 'VITE_EXISTING=value\n',
  };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('safe migration', () => {
  it('previews deterministic changes and leaves files unchanged until apply', async () => {
    const root = await createFixture(legacyFiles());
    const before = await snapshot(root);
    const first = await createMigrationPlan(root);
    const second = await createMigrationPlan(root);

    expect(first).toEqual(second);
    expect(first.blockers).toEqual([]);
    expect(first.changes.map(({ path }) => path)).toEqual([
      '.env.example',
      'review/index.html',
      'src/review/index.tsx',
      'src/review/review.config.ts',
    ]);
    expect(formatMigrationPlan(first)).toContain(`Backup before apply: ${first.backupPath}`);
    expect(await snapshot(root)).toEqual(before);
  });

  it('creates a complete backup, supports rollback, and is idempotent', async () => {
    const root = await createFixture(legacyFiles());
    const before = await snapshot(root);
    const plan = await createMigrationPlan(root);

    const backupPath = await applyMigrationPlan(plan);
    expect(backupPath).toBe(plan.backupPath);
    expect(JSON.parse(await readFile(join(root, plan.backupPath, 'manifest.json'), 'utf8')))
      .toMatchObject({ schemaVersion: 1, migrationId: plan.id });
    expect(await readFile(join(root, plan.backupPath, 'before/.env.example'), 'utf8'))
      .toBe('VITE_EXISTING=value\n');

    const rerun = await createMigrationPlan(root);
    expect(rerun.changes).toEqual([]);
    await rollbackMigration(root, plan.backupPath);
    expect(await snapshot(root, true)).toEqual(before);
  });

  it('reports customized legacy wiring as a blocker without modifying files', async () => {
    const root = await createFixture(legacyFiles(`
      import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';
      createWebReviewKit({
        projectId: 'custom',
        adapter: localAdapter({ storageKey: 'host-owned' }),
        onSubmit: sendToHost,
      });
    `));
    const before = await snapshot(root);
    const plan = await createMigrationPlan(root);

    expect(plan.changes).toEqual([]);
    expect(plan.blockers.map(({ code }) => code)).toContain('MIGRATION_CUSTOMIZATION_UNSUPPORTED');
    expect(formatMigrationPlan(plan)).toContain('migrate this host-specific integration manually');
    await expect(applyMigrationPlan(plan)).rejects.toThrow('MIGRATION_BLOCKED');
    expect(await snapshot(root)).toEqual(before);
  });

  it('rejects a stale preview before creating backups or writing files', async () => {
    const root = await createFixture(legacyFiles());
    const plan = await createMigrationPlan(root);
    await writeFile(join(root, '.env.example'), 'changed after preview\n');
    const before = await snapshot(root);

    await expect(applyMigrationPlan(plan)).rejects.toThrow('MIGRATION_STALE_PLAN');
    expect(await snapshot(root)).toEqual(before);
  });
});
