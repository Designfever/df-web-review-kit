import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  applyMigrationPlan,
  createMigrationPlan,
  formatMigrationPlan,
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

async function snapshot(root: string) {
  const result: Record<string, string> = {};
  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
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
  };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('host-owned review route migration', () => {
  it('reports a manual guide blocker without changing the host', async () => {
    const root = await createFixture(legacyFiles());
    const before = await snapshot(root);
    const plan = await createMigrationPlan(root);

    expect(plan.changes).toEqual([]);
    expect(plan.blockers.map(({ code }) => code)).toContain(
      'MIGRATION_MANUAL_REVIEW_ROUTE_REQUIRED'
    );
    expect(formatMigrationPlan(plan)).toContain('migrate the /review page manually');
    await expect(applyMigrationPlan(plan)).rejects.toThrow('MIGRATION_BLOCKED');
    expect(await snapshot(root)).toEqual(before);
  });

  it('keeps customized legacy wiring as an explicit blocker', async () => {
    const root = await createFixture(legacyFiles(`
      import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';
      createWebReviewKit({
        projectId: 'custom',
        adapter: localAdapter({ storageKey: 'host-owned' }),
        onSubmit: sendToHost,
      });
    `));
    const plan = await createMigrationPlan(root);

    expect(plan.changes).toEqual([]);
    expect(plan.blockers.map(({ code }) => code)).toContain(
      'MIGRATION_CUSTOMIZATION_UNSUPPORTED'
    );
  });
});
