import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createInitConfig } from './init-config';
import {
  applyInstallPlan,
  createInstallPlan,
  formatInstallPlan,
} from './install-generator';
import { scanProject } from './preflight';

const roots: string[] = [];

async function createFixture(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), 'web-review-kit-generator-'));
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
  async function visit(path: string): Promise<void> {
    const entries = await readdir(path, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const target = join(path, entry.name);
      if (entry.isDirectory()) await visit(target);
      else result[target.slice(root.length + 1)] = await readFile(target, 'utf8');
    }
  }
  await visit(root);
  return result;
}

const localConfig = createInitConfig({
  projectId: 'fixture',
  projectName: 'Fixture',
});

const baseFiles = {
  'package.json': JSON.stringify({
    scripts: { build: 'vite build' },
    dependencies: { react: '^19.0.0' },
    devDependencies: { vite: '^8.0.0' },
  }, null, 2),
  'pnpm-lock.yaml': 'lockfileVersion: 9\n',
  'vite.config.ts': "import { defineConfig } from 'vite';\nexport default defineConfig({ plugins: [] });\n",
  'src/main.tsx': 'export const app = true;\n',
};

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('framework-neutral install generator', () => {
  it('creates only the checked-in public project config', async () => {
    const root = await createFixture(baseFiles);
    const plan = await createInstallPlan({
      root,
      config: localConfig,
      preflight: await scanProject(root),
      packageVersion: '^0.10.0',
    });

    expect(plan.dependencies).toEqual({ '@designfever/web-review-kit': '^0.10.0' });
    expect(plan.changes.map(({ path }) => path)).toEqual(['df.ts']);
    expect(formatInstallPlan(plan)).toContain('+++ df.ts');

    await applyInstallPlan(plan);
    const generated = await snapshot(root);
    expect(generated['df.ts']).toContain('export const REVIEW_PROJECT_ID = "fixture";');
    expect(generated['src/review/index.tsx']).toBeUndefined();
    expect(generated['review/index.html']).toBeUndefined();
    expect(generated['vite.config.ts']).toBe(baseFiles['vite.config.ts']);
  });

  it('does not touch an existing host-owned review route or env file', async () => {
    const root = await createFixture({
      ...baseFiles,
      'src/review/index.tsx': '// host-owned review route\n',
      '.env.local': 'VITE_EXISTING=value\n',
    });
    const plan = await createInstallPlan({
      root,
      config: localConfig,
      preflight: await scanProject(root),
    });
    await applyInstallPlan(plan);

    expect(await readFile(join(root, 'src/review/index.tsx'), 'utf8')).toBe(
      '// host-owned review route\n'
    );
    expect(await readFile(join(root, '.env.local'), 'utf8')).toBe(
      'VITE_EXISTING=value\n'
    );
  });

  it('is idempotent after applying the first plan', async () => {
    const root = await createFixture(baseFiles);
    const first = await createInstallPlan({
      root,
      config: localConfig,
      preflight: await scanProject(root),
    });
    await applyInstallPlan(first);
    const second = await createInstallPlan({
      root,
      config: localConfig,
      preflight: await scanProject(root),
    });

    expect(second.changes).toEqual([]);
  });

  it('leaves every file untouched when df.ts is host-owned', async () => {
    const root = await createFixture({
      ...baseFiles,
      'df.ts': "export const REVIEW_PROJECT_ID = 'host-owned';\n",
    });
    const before = await snapshot(root);

    await expect(
      createInstallPlan({
        root,
        config: localConfig,
        preflight: await scanProject(root),
      })
    ).rejects.toThrow('INSTALL_FILE_CONFLICT: df.ts');
    expect(await snapshot(root)).toEqual(before);
  });

  it('checks the complete preview before writing anything', async () => {
    const root = await createFixture(baseFiles);
    const plan = await createInstallPlan({
      root,
      config: localConfig,
      preflight: await scanProject(root),
    });
    await writeFile(join(root, 'df.ts'), 'changed after preview\n');
    const before = await snapshot(root);

    await expect(applyInstallPlan(plan)).rejects.toThrow('INSTALL_STALE_PLAN: df.ts');
    expect(await snapshot(root)).toEqual(before);
  });
});
