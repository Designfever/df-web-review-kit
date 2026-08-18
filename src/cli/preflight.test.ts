import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { scanProject, type PreflightDiagnosticCode } from './preflight';

const fixtureRoots: string[] = [];

async function createFixture(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), 'web-review-kit-preflight-'));
  fixtureRoots.push(root);

  for (const [path, content] of Object.entries(files)) {
    const absolutePath = join(root, path);
    await mkdir(join(absolutePath, '..'), { recursive: true });
    await writeFile(absolutePath, content);
  }

  return root;
}

async function snapshotFiles(root: string) {
  const snapshot: Record<string, string> = {};

  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.isFile()) {
        snapshot[path.slice(root.length + 1)] = await readFile(path, 'utf8');
      }
    }
  }

  await visit(root);
  return snapshot;
}

function codes(result: Awaited<ReturnType<typeof scanProject>>) {
  return result.diagnostics.map(({ code }) => code);
}

function expectCode(
  result: Awaited<ReturnType<typeof scanProject>>,
  code: PreflightDiagnosticCode
) {
  expect(codes(result)).toContain(code);
}

afterEach(async () => {
  await Promise.all(fixtureRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('scanProject', () => {
  it('recognizes a fresh React and Vite project without changing it', async () => {
    const root = await createFixture({
      'package.json': JSON.stringify({
        dependencies: { react: '^19.0.0' },
        devDependencies: { vite: '^8.0.0' },
      }),
      'pnpm-lock.yaml': 'lockfileVersion: 9\n',
      'vite.config.ts': "import { defineConfig } from 'vite';\nexport default defineConfig({});\n",
      'src/main.tsx': "import React from 'react';\n",
      '.env.example': 'VITE_REVIEW_PROJECT_ID=\n',
      'tsconfig.json': '{}\n',
    });
    const before = await snapshotFiles(root);

    const result = await scanProject(root);

    expect(result.support).toBe('warning');
    expect(result.packageManager).toBe('pnpm');
    expect(result.language).toBe('typescript');
    expect(result.files.envFiles).toEqual(['.env.example']);
    expectCode(result, 'REVIEW_ROUTE_MISSING');
    expect(result.features.reviewKitInstalled).toBe(false);
    expect(await snapshotFiles(root)).toEqual(before);
  });

  it('recognizes an existing review-kit route and selected Vite plugins', async () => {
    const root = await createFixture({
      'package.json': JSON.stringify({
        dependencies: {
          '@designfever/web-review-kit': '^0.8.12',
          react: '^19.0.0',
        },
        devDependencies: { vite: '^8.0.0' },
      }),
      'package-lock.json': '{}\n',
      'vite.config.js': `
        import {
          reviewDataLocator,
          reviewFigmaImageStore,
          reviewSourceLocator,
        } from '@designfever/web-review-kit/vite';
        export default {
          plugins: [reviewSourceLocator(), reviewDataLocator(), reviewFigmaImageStore()],
        };
      `,
      'page/review/index.jsx': `
        import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
        mountReviewShell({ projectId: 'fixture', pages: [], adapters: [] });
      `,
    });

    const result = await scanProject(root);

    expect(result.support).toBe('supported');
    expect(result.packageManager).toBe('npm');
    expect(result.language).toBe('javascript');
    expect(result.files.reviewRoutes).toEqual(['page/review/index.jsx']);
    expect(result.features).toEqual({
      reviewKitInstalled: true,
      reviewShellMounted: true,
      sourceLocator: true,
      dataLocator: true,
      figmaImageStorePlugin: true,
    });
    expect(result.diagnostics).toEqual([]);
  });

  it('blocks unsupported framework hosts instead of guessing a patch', async () => {
    const root = await createFixture({
      'package.json': JSON.stringify({
        dependencies: { next: '^16.0.0', react: '^19.0.0' },
      }),
      'package-lock.json': '{}\n',
      'src/app/review/page.tsx': 'export default function Review() { return null; }\n',
    });

    const result = await scanProject(root);

    expect(result.support).toBe('blocked');
    expectCode(result, 'HOST_FRAMEWORK_UNSUPPORTED');
    expectCode(result, 'HOST_VITE_MISSING');
  });

  it('blocks ambiguous lockfiles, Vite configs, and review routes', async () => {
    const root = await createFixture({
      'package.json': JSON.stringify({
        dependencies: {
          '@designfever/web-review-kit': '^0.8.12',
          react: '^19.0.0',
          vite: '^8.0.0',
        },
      }),
      'package-lock.json': '{}\n',
      'pnpm-lock.yaml': 'lockfileVersion: 9\n',
      'vite.config.js': 'export default {};\n',
      'vite.config.ts': 'export default {};\n',
      'page/review/index.tsx': 'mountReviewShell({});\n',
      'src/pages/review.tsx': 'mountReviewShell({});\n',
    });

    const result = await scanProject(root);

    expect(result.support).toBe('blocked');
    expectCode(result, 'PACKAGE_MANAGER_AMBIGUOUS');
    expectCode(result, 'VITE_CONFIG_CONFLICT');
    expectCode(result, 'REVIEW_ROUTE_CONFLICT');
    expect(result.files.lockfiles).toEqual(['package-lock.json', 'pnpm-lock.yaml']);
    expect(result.files.viteConfigs).toEqual(['vite.config.js', 'vite.config.ts']);
    expect(result.files.reviewRoutes).toEqual([
      'page/review/index.tsx',
      'src/pages/review.tsx',
    ]);
  });

  it('uses the declared package manager when stale lockfiles coexist', async () => {
    const root = await createFixture({
      'package.json': JSON.stringify({
        packageManager: 'pnpm@9.0.0',
        dependencies: { react: '^19.0.0', vite: '^8.0.0' },
      }),
      'package-lock.json': '{}\n',
      'pnpm-lock.yaml': 'lockfileVersion: 9\n',
      'vite.config.ts': 'export default {};\n',
      'src/main.tsx': 'console.log("fixture");\n',
    });

    const result = await scanProject(root);

    expect(result.packageManager).toBe('pnpm');
    expect(result.files.lockfiles).toEqual(['package-lock.json', 'pnpm-lock.yaml']);
    expect(codes(result)).not.toContain('PACKAGE_MANAGER_AMBIGUOUS');
  });

  it('returns the same normalized result for repeated scans', async () => {
    const root = await createFixture({
      'package.json': JSON.stringify({
        dependencies: { react: '^19.0.0', vite: '^8.0.0' },
      }),
      'yarn.lock': '# yarn lockfile\n',
      'vite.config.mjs': 'export default {};\n',
      'src/main.jsx': 'console.log("fixture");\n',
    });

    expect(await scanProject(root)).toEqual(await scanProject(root));
  });

  it('reports an invalid package manifest without throwing', async () => {
    const root = await createFixture({
      'package.json': '{ invalid',
    });

    const result = await scanProject(root);

    expect(result.support).toBe('blocked');
    expectCode(result, 'PROJECT_PACKAGE_JSON_INVALID');
    expectCode(result, 'HOST_REACT_MISSING');
    expectCode(result, 'HOST_VITE_MISSING');
  });
});
