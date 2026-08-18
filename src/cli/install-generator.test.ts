import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createInitConfig } from './init-config';
import { createProviderArtifacts } from './provider-install';
import { defineProviderProfile } from './provider-profile';
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
  reviewStorage: 'local',
  figmaImageStore: 'local',
  sourceLocator: true,
  profile: null,
});

const bootstrapConfig = createInitConfig({
  projectId: 'fixture',
  projectName: 'Fixture',
  reviewStorage: 'profile',
  figmaImageStore: 'profile',
  sourceLocator: false,
  profile: './provider-profile.mjs',
});

const hostCustomConfig = createInitConfig({
  projectId: 'fixture',
  projectName: 'Fixture',
  reviewStorage: 'custom',
  figmaImageStore: 'custom',
  sourceLocator: false,
  profile: null,
});

const bootstrapProfile = defineProviderProfile({
  schemaVersion: 1,
  capabilities: {
    review: {
      mode: 'bootstrap',
      module: '@example/provider',
      exportName: 'createReviewBootstrap',
      options: { endpoint: { env: 'VITE_REVIEW_PROXY_URL' } },
    },
    figma: {
      module: '@example/provider',
      exportName: 'createFigmaImageStore',
      options: { endpoint: { env: 'VITE_FIGMA_PROXY_URL' } },
    },
  },
  env: [
    { key: 'VITE_FIGMA_PROXY_URL', secret: false, example: '/api/figma' },
    { key: 'VITE_REVIEW_PROXY_URL', secret: false, example: '/api/review' },
  ],
});

const bootstrapProvider = createProviderArtifacts(bootstrapProfile);
const reviewOnlyProvider = createProviderArtifacts(bootstrapProfile, {}, ['review']);
const figmaOnlyProvider = createProviderArtifacts(bootstrapProfile, {}, ['figma']);

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

describe('safe install generator', () => {
  it('creates a minimal local integration and a dependency plan', async () => {
    const root = await createFixture(baseFiles);
    const plan = await createInstallPlan({
      root,
      config: localConfig,
      preflight: await scanProject(root),
      packageVersion: '^0.9.0',
    });

    expect(plan.dependencies).toEqual({ '@designfever/web-review-kit': '^0.9.0' });
    expect(formatInstallPlan(plan)).toContain('+++ src/review/index.tsx');
    expect(await snapshot(root)).toEqual(await snapshot(root));

    await applyInstallPlan(plan);
    const generated = await snapshot(root);
    expect(generated['src/review/index.tsx']).toContain('mountReviewShell');
    expect(generated['src/review/review.config.ts']).toContain('localAdapter');
    expect(generated['src/review/review.config.ts']).toContain('createReviewFigmaImageStoreClient');
    expect(generated['review/index.html']).toContain('/src/review/index.tsx');
    expect(generated['vite.config.ts']).toContain('reviewSourceLocator()');
    expect(generated['vite.config.ts']).toContain('reviewFigmaImageStore({ projectId: "fixture" })');
    expect(generated['.env.example']).toBe('VITE_REVIEW_PROJECT_ID=fixture\n');
  });

  it('preserves existing Vite and env content while adding only requested entries', async () => {
    const root = await createFixture({
      ...baseFiles,
      'vite.config.ts': "import { defineConfig } from 'vite';\nconst existing = true;\nexport default defineConfig({ plugins: [existing], server: { port: 4100 } });\n",
      '.env.example': 'VITE_EXISTING=value\n',
    });
    const plan = await createInstallPlan({ root, config: localConfig, preflight: await scanProject(root) });
    await applyInstallPlan(plan);

    const vite = await readFile(join(root, 'vite.config.ts'), 'utf8');
    const env = await readFile(join(root, '.env.example'), 'utf8');
    expect(vite).toContain('const existing = true;');
    expect(vite).toContain('server: { port: 4100 }');
    expect(env).toBe('VITE_EXISTING=value\nVITE_REVIEW_PROJECT_ID=fixture\n');
  });

  it('generates a provider gate before mounting the shell without a Figma Vite plugin', async () => {
    const root = await createFixture(baseFiles);
    const plan = await createInstallPlan({
      root,
      config: bootstrapConfig,
      preflight: await scanProject(root),
      provider: bootstrapProvider,
    });
    await applyInstallPlan(plan);

    const generated = await snapshot(root);
    expect(generated['src/review/review.config.ts']).toContain(
      'export const reviewBootstrap = providerCapabilities.review'
    );
    expect(generated['src/review/index.tsx']).toContain('reviewBootstrap.mount');
    expect(generated['src/review/index.tsx']).toContain('onReady: mountProviderSession');
    expect(generated['src/review/index.tsx']).toContain('figmaImages: { store: figmaImageStore }');
    expect(generated['vite.config.ts']).not.toContain('reviewFigmaImageStore');
    expect(generated['.env.example']).toContain('VITE_REVIEW_PROXY_URL=/api/review');
    expect(generated['.env.example']).not.toMatch(/TOKEN|SECRET/);
  });

  it('creates host-owned custom scaffolds once and preserves later edits', async () => {
    const root = await createFixture(baseFiles);
    const first = await createInstallPlan({
      root,
      config: hostCustomConfig,
      preflight: await scanProject(root),
    });
    await applyInstallPlan(first);

    const generated = await snapshot(root);
    expect(generated['src/review/custom.review.tsx']).toContain(
      'WEB_REVIEW_KIT_CUSTOM_REVIEW_TODO'
    );
    expect(generated['src/review/custom.figma.store.ts']).toContain(
      'WEB_REVIEW_KIT_CUSTOM_FIGMA_TODO'
    );
    expect(generated['src/review/review.config.ts']).toContain(
      "from './custom.review'"
    );
    expect(generated['src/review/review.config.ts']).toContain(
      "from './custom.figma.store'"
    );
    expect(generated['src/review/index.tsx']).toContain('reviewBootstrap.mount');
    expect(generated['vite.config.ts']).not.toContain('reviewFigmaImageStore');

    const customReviewPath = join(root, 'src/review/custom.review.tsx');
    const edited = `${generated['src/review/custom.review.tsx']}\n// host edit\n`;
    await writeFile(customReviewPath, edited);
    const second = await createInstallPlan({
      root,
      config: hostCustomConfig,
      preflight: await scanProject(root),
    });

    expect(second.changes.find(({ path }) => path === 'src/review/custom.review.tsx')).toBeUndefined();
    expect(await readFile(customReviewPath, 'utf8')).toBe(edited);
  });

  it('composes local and profile capabilities independently', async () => {
    const localReviewRoot = await createFixture(baseFiles);
    const localReviewPlan = await createInstallPlan({
      root: localReviewRoot,
      config: createInitConfig({
        projectId: 'fixture',
        projectName: 'Fixture',
        reviewStorage: 'local',
        figmaImageStore: 'profile',
        sourceLocator: false,
        profile: './provider-profile.mjs',
      }),
      preflight: await scanProject(localReviewRoot),
      provider: figmaOnlyProvider,
    });
    await applyInstallPlan(localReviewPlan);
    const localReview = await snapshot(localReviewRoot);
    expect(localReview['src/review/review.config.ts']).toContain('localAdapter');
    expect(localReview['src/review/review.config.ts']).toContain(
      'figmaImageStore = providerCapabilities.figma'
    );
    expect(localReview['src/review/review.config.ts']).not.toContain('createReviewBootstrap');
    expect(localReview['.env.example']).not.toContain('VITE_REVIEW_PROXY_URL');
    expect(localReview['src/review/index.tsx']).not.toContain('reviewBootstrap.mount');
    expect(localReview['vite.config.ts']).not.toContain('reviewFigmaImageStore');

    const localFigmaRoot = await createFixture(baseFiles);
    const localFigmaPlan = await createInstallPlan({
      root: localFigmaRoot,
      config: createInitConfig({
        projectId: 'fixture',
        projectName: 'Fixture',
        reviewStorage: 'profile',
        figmaImageStore: 'local',
        sourceLocator: false,
        profile: './provider-profile.mjs',
      }),
      preflight: await scanProject(localFigmaRoot),
      provider: reviewOnlyProvider,
    });
    await applyInstallPlan(localFigmaPlan);
    const localFigma = await snapshot(localFigmaRoot);
    expect(localFigma['src/review/review.config.ts']).toContain(
      'createReviewFigmaImageStoreClient'
    );
    expect(localFigma['src/review/review.config.ts']).not.toContain('createFigmaImageStore');
    expect(localFigma['.env.example']).not.toContain('VITE_FIGMA_PROXY_URL');
    expect(localFigma['src/review/index.tsx']).toContain('reviewBootstrap.mount');
    expect(localFigma['vite.config.ts']).toContain('reviewFigmaImageStore');
  });

  it('is idempotent after applying the first plan', async () => {
    const root = await createFixture(baseFiles);
    const first = await createInstallPlan({ root, config: localConfig, preflight: await scanProject(root) });
    await applyInstallPlan(first);
    const before = await snapshot(root);
    const second = await createInstallPlan({ root, config: localConfig, preflight: await scanProject(root) });

    expect(second.changes).toEqual([]);
    await applyInstallPlan(second);
    expect(await snapshot(root)).toEqual(before);
  });

  it('leaves every file untouched when a generated path conflicts', async () => {
    const root = await createFixture({
      ...baseFiles,
      'src/review/index.tsx': '// user-owned review entry\n',
    });
    const before = await snapshot(root);

    await expect(
      createInstallPlan({ root, config: localConfig, preflight: await scanProject(root) })
    ).rejects.toThrow('INSTALL_FILE_CONFLICT: src/review/index.tsx');
    expect(await snapshot(root)).toEqual(before);
  });

  it('checks the complete preview for stale files before writing anything', async () => {
    const root = await createFixture(baseFiles);
    const plan = await createInstallPlan({ root, config: localConfig, preflight: await scanProject(root) });
    await writeFile(join(root, 'vite.config.ts'), '// changed after preview\n');
    const before = await snapshot(root);

    await expect(applyInstallPlan(plan)).rejects.toThrow('INSTALL_STALE_PLAN: vite.config.ts');
    expect(await snapshot(root)).toEqual(before);
  });
});
