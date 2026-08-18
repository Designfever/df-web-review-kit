import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  renderCustomFigmaScaffold,
  renderCustomReviewScaffold,
} from './custom-scaffold';
import { formatDoctorResult, runDoctor } from './doctor';

const roots: string[] = [];
const SECRET = 'never-print-this-secret';

async function createFixture(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), 'web-review-kit-doctor-'));
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

const installedManifest = JSON.stringify({
  version: '0.9.0',
  exports: {
    '.': './dist/index.js',
    './react-shell': './dist/react-shell.js',
    './vite': './dist/vite.js',
  },
});

function healthyFiles() {
  return {
    'package.json': JSON.stringify({
      dependencies: {
        '@designfever/web-review-kit': '^0.9.0',
        react: '^19.0.0',
        vite: '^8.0.0',
      },
    }),
    'pnpm-lock.yaml': 'lockfileVersion: 9\n',
    'node_modules/@designfever/web-review-kit/package.json': installedManifest,
    'vite.config.ts': "import { defineConfig } from 'vite';\nexport default defineConfig({ plugins: [] });\n",
    'src/review/index.tsx': `
      import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
      import { localAdapter } from '@designfever/web-review-kit';
      const adapters = { local: localAdapter() };
      mountReviewShell({ projectId: 'fixture', pages: [], adapters });
    `,
    '.env.local': `VITE_REVIEW_PROJECT_ID=fixture\nVITE_PRIVATE_TOKEN=${SECRET}\n`,
  };
}

function codes(result: Awaited<ReturnType<typeof runDoctor>>) {
  return result.diagnostics.map(({ code }) => code);
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('doctor', () => {
  it('reports a healthy installation and never changes the project', async () => {
    const root = await createFixture(healthyFiles());
    const before = await snapshot(root);

    const result = await runDoctor({ root });

    expect(result.status).toBe('healthy');
    expect(result.exitCode).toBe(0);
    expect(codes(result)).toContain('PACKAGE_OK');
    expect(result.detected.capabilities.review).toBe(true);
    expect(await snapshot(root)).toEqual(before);
  });

  it('reports missing package, route, mount, and env as blockers or warnings', async () => {
    const root = await createFixture({
      'package.json': JSON.stringify({
        dependencies: {
          '@designfever/web-review-kit': '^0.9.0',
          react: '^19.0.0',
          vite: '^8.0.0',
        },
      }),
      'package-lock.json': '{}\n',
      'vite.config.js': 'export default { plugins: [] };\n',
      'src/main.jsx': 'export const app = true;\n',
    });

    const result = await runDoctor({ root });

    expect(result.status).toBe('failed');
    expect(result.exitCode).toBe(1);
    expect(codes(result)).toEqual(
      expect.arrayContaining([
        'PACKAGE_NOT_INSTALLED',
        'REVIEW_ROUTE_MISSING',
        'REVIEW_KIT_PARTIAL',
        'ENV_PROJECT_ID_MISSING',
      ])
    );
  });

  it('recognizes a legacy integration', async () => {
    const root = await createFixture({
      'package.json': JSON.stringify({
        dependencies: { react: '^19.0.0', vite: '^8.0.0' },
      }),
      'yarn.lock': '# lock\n',
      'vite.config.mjs': 'export default { plugins: [] };\n',
      'src/review-legacy.ts': `
        import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';
        createWebReviewKit({ projectId: 'legacy', adapter: localAdapter() });
      `,
      '.env.example': 'VITE_REVIEW_PROJECT_ID=legacy\n',
    });

    const result = await runDoctor({ root });

    expect(codes(result)).toContain('LEGACY_CONFIG_DETECTED');
  });

  it('detects partial Figma and adapter capability wiring', async () => {
    const files = healthyFiles();
    files['vite.config.ts'] = `
      import { reviewFigmaImageStore } from '@designfever/web-review-kit/vite';
      export default { plugins: [reviewFigmaImageStore()] };
    `;
    files['src/review/index.tsx'] = `
      import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
      mountReviewShell({ projectId: 'fixture', pages: [] });
    `;
    const root = await createFixture(files);

    const result = await runDoctor({ root });

    expect(result.status).toBe('failed');
    expect(codes(result)).toEqual(
      expect.arrayContaining(['REVIEW_ADAPTER_MISSING', 'FIGMA_CAPABILITY_PARTIAL'])
    );
  });

  it('accepts a custom runtime Figma store without a Vite plugin', async () => {
    const files = healthyFiles();
    files['src/review/index.tsx'] = `
      import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
      import { createFigmaImageStore, createReviewBootstrap } from '@example/provider';
      const reviewBootstrap = createReviewBootstrap();
      const figmaImageStore = createFigmaImageStore();
      reviewBootstrap.mount({
        rootId: 'root',
        projectId: 'fixture',
        onReady: ({ adapters }) => mountReviewShell({
          projectId: 'fixture',
          pages: [],
          adapters,
          figmaImages: { store: figmaImageStore },
        }),
      });
    `;
    const root = await createFixture(files);

    const result = await runDoctor({ root });

    expect(codes(result)).not.toContain('FIGMA_CAPABILITY_PARTIAL');
    expect(result.detected.capabilities.review).toBe(true);
    expect(result.detected.capabilities.figma).toBe(true);
  });

  it('blocks unfinished host-owned custom scaffolds', async () => {
    const root = await createFixture({
      ...healthyFiles(),
      'src/review/custom.review.tsx': renderCustomReviewScaffold(),
      'src/review/custom.figma.store.ts': renderCustomFigmaScaffold(),
    });

    const result = await runDoctor({ root });

    expect(result.status).toBe('failed');
    expect(codes(result)).toEqual(
      expect.arrayContaining(['CUSTOM_REVIEW_INCOMPLETE', 'CUSTOM_FIGMA_INCOMPLETE'])
    );
    expect(
      result.diagnostics.find(({ code }) => code === 'CUSTOM_REVIEW_INCOMPLETE')?.paths
    ).toEqual(['src/review/custom.review.tsx']);
  });

  it('keeps secret values out of human and JSON output', async () => {
    const root = await createFixture(healthyFiles());
    const result = await runDoctor({ root });
    const human = formatDoctorResult(result);
    const json = JSON.stringify(result);

    expect(result.detected.envKeys).toContain('VITE_PRIVATE_TOKEN');
    expect(human).not.toContain(SECRET);
    expect(json).not.toContain(SECRET);
  });
});
