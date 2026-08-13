import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';

const repo = process.cwd();
const workspace = mkdtempSync(join(tmpdir(), 'web-review-kit-pack-e2e-'));
const packDir = join(workspace, 'pack');
mkdirSync(packDir);

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? repo,
    encoding: 'utf8',
    env: { ...process.env, CI: '1', ...options.env },
    stdio: options.capture ? 'pipe' : 'inherit',
  });
}

function runResult(command, args, cwd) {
  return spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, CI: '1' } });
}

function write(root, path, content) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function fixture(name, language = 'typescript') {
  const root = join(workspace, name);
  mkdirSync(root);
  const typescript = language === 'typescript';
  write(root, 'package.json', `${JSON.stringify({
    name: `web-review-kit-e2e-${name}`,
    private: true,
    type: 'module',
    scripts: { build: 'vite build', typecheck: 'tsc --noEmit' },
    dependencies: { react: '^19.2.0', 'react-dom': '^19.2.0', vite: '^8.0.0' },
    devDependencies: { typescript: '^6.0.0', '@types/react': '^19.0.0', '@types/react-dom': '^19.0.0' },
  }, null, 2)}\n`);
  write(root, 'vite.config.ts', "import { defineConfig } from 'vite';\nexport default defineConfig({ plugins: [], build: { rollupOptions: { input: 'review/index.html' } } });\n");
  write(root, 'tsconfig.json', `${JSON.stringify({ compilerOptions: {
    target: 'ES2020', lib: ['DOM', 'ES2020'], module: 'ESNext', moduleResolution: 'Bundler',
    jsx: 'react-jsx', types: ['vite/client'], strict: true, allowJs: !typescript, checkJs: false, skipLibCheck: true,
  }, include: ['src/review/**/*'] }, null, 2)}\n`);
  write(root, typescript ? 'src/main.tsx' : 'src/main.jsx', 'export const host = true;\n');
  return root;
}

function filesHash(root) {
  const hash = createHash('sha256');
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      if (['node_modules', 'dist', '.web-review-kit'].includes(name) || name.startsWith('.e2e-')) continue;
      const path = join(directory, name);
      const info = statSync(path);
      if (info.isDirectory()) visit(path);
      else hash.update(relative(root, path)).update('\0').update(readFileSync(path)).update('\0');
    }
  }
  visit(root);
  return hash.digest('hex');
}

function install(root, tarball) {
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], { cwd: root });
}

function cli(root, args, capture = false) {
  return run(join(root, 'node_modules/.bin/web-review-kit'), args, { cwd: root, capture });
}

function verifyBuild(root) {
  run('npm', ['run', 'typecheck'], { cwd: root });
  run('npm', ['run', 'build'], { cwd: root });
}

function verifyDoctor(root, profile) {
  const args = ['doctor', '--json', ...(profile ? ['--profile', profile] : [])];
  const result = JSON.parse(cli(root, args, true));
  if (result.status !== 'healthy' || result.exitCode !== 0) {
    throw new Error(`doctor failed in ${root}: ${JSON.stringify(result.diagnostics)}`);
  }
}

try {
  run('pnpm', ['build']);
  const packed = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', packDir], { capture: true }));
  const tarball = join(packDir, packed[0].filename);
  const matrix = [];

  for (const language of ['javascript', 'typescript']) {
    const root = fixture(`clean-${language}`, language);
    install(root, tarball);
    const before = filesHash(root);
    cli(root, ['init', '--non-interactive', '--project-id', `clean-${language}`, '--project-name', `Clean ${language}`, '--review-storage', 'local', '--figma-image-store', 'none', '--no-source-locator', '--dry-run']);
    if (filesHash(root) !== before) throw new Error(`${language} dry-run changed fixture files.`);
    cli(root, ['init', '--non-interactive', '--project-id', `clean-${language}`, '--project-name', `Clean ${language}`, '--review-storage', 'local', '--figma-image-store', 'none', '--no-source-locator', '--yes']);
    verifyDoctor(root);
    verifyBuild(root);
    const applied = filesHash(root);
    cli(root, ['init', '--non-interactive', '--project-id', `clean-${language}`, '--project-name', `Clean ${language}`, '--review-storage', 'local', '--figma-image-store', 'none', '--no-source-locator', '--yes']);
    if (filesHash(root) !== applied) throw new Error(`${language} init was not idempotent.`);
    matrix.push(`clean-${language}: init doctor typecheck build idempotent`);
  }

  {
    const root = fixture('existing-0.8');
    write(root, 'src/legacy-review.ts', "import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';\ncreateWebReviewKit({ projectId: 'legacy-08', adapter: localAdapter() });\n");
    install(root, tarball);
    const before = filesHash(root);
    const preview = runResult(join(root, 'node_modules/.bin/web-review-kit'), ['doctor', '--fix'], root);
    if (preview.status !== 1 || preview.signal) {
      throw new Error(`legacy preview exit changed: ${preview.status}`);
    }
    if (!preview.stdout.includes('Backup before apply:') || filesHash(root) !== before) {
      throw new Error('legacy preview did not remain read-only.');
    }
    cli(root, ['doctor', '--fix', '--yes']);
    verifyDoctor(root);
    verifyBuild(root);
    const second = cli(root, ['doctor', '--fix'], true);
    if (!second.includes('No safe migration changes required.')) throw new Error('migration rerun produced a diff.');
    matrix.push('existing-0.8: preview backup migrate doctor typecheck build idempotent');
  }

  {
    const root = fixture('custom-adapter');
    install(root, tarball);
    write(root, 'node_modules/@example/test-provider/package.json', JSON.stringify({
      name: '@example/test-provider', type: 'module', exports: './index.js',
    }));
    write(root, 'node_modules/@example/test-provider/index.js', `
      import { localAdapter } from '@designfever/web-review-kit';
      export function createReviewAdapter() {
        return { label: 'local', adapter: localAdapter() };
      }
    `);
    write(root, 'node_modules/@example/test-provider/index.d.ts', `
      import type { ReviewShellAdapter } from '@designfever/web-review-kit/react-shell';
      export declare function createReviewAdapter(): ReviewShellAdapter;
    `);
    write(root, 'provider.mjs', `export default {
  schemaVersion: 1,
  capabilities: { review: { module: '@example/test-provider', exportName: 'createReviewAdapter' } },
  env: [{ key: 'VITE_CUSTOM_PROJECT_ID', secret: false, required: true, example: 'custom-app' }],
  doctorChecks: [{ code: 'CUSTOM_WIRING_MISSING', message: 'Custom wiring missing.', sourceIncludes: 'providerCapabilities' }],
};\n`);
    cli(root, ['init', '--non-interactive', '--project-id', 'custom-app', '--project-name', 'Custom app', '--review-storage', 'custom', '--figma-image-store', 'none', '--no-source-locator', '--profile', './provider.mjs', '--yes']);
    verifyDoctor(root, './provider.mjs');
    verifyBuild(root);
    const applied = filesHash(root);
    cli(root, ['init', '--non-interactive', '--project-id', 'custom-app', '--project-name', 'Custom app', '--review-storage', 'custom', '--figma-image-store', 'none', '--no-source-locator', '--profile', './provider.mjs', '--yes']);
    if (filesHash(root) !== applied) throw new Error('custom adapter init was not idempotent.');
    matrix.push('custom-adapter: profile init doctor typecheck build idempotent');
  }

  {
    const root = fixture('failure-conflict');
    install(root, tarball);
    write(root, 'src/review/index.tsx', '// host-owned conflict\n');
    const before = filesHash(root);
    const failed = runResult(join(root, 'node_modules/.bin/web-review-kit'), ['init', '--non-interactive', '--project-id', 'failure', '--project-name', 'Failure', '--review-storage', 'local', '--figma-image-store', 'none', '--no-source-locator', '--yes'], root);
    if (failed.status !== 1 || filesHash(root) !== before) throw new Error('conflict failure changed fixture files or exit code.');

    const custom = fixture('failure-custom-migration');
    write(custom, 'src/legacy.ts', "import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';\ncreateWebReviewKit({ projectId: 'custom', adapter: localAdapter({ storageKey: 'owned' }), onSubmit: send });\n");
    install(custom, tarball);
    const customBefore = filesHash(custom);
    const blocked = runResult(join(custom, 'node_modules/.bin/web-review-kit'), ['doctor', '--fix', '--yes'], custom);
    if (blocked.status !== 1 || !blocked.stdout.includes('MIGRATION_CUSTOMIZATION_UNSUPPORTED') || filesHash(custom) !== customBefore) {
      throw new Error('custom migration blocker did not preserve fixture files.');
    }
    matrix.push('failures: conflict/customization exit=1 unchanged');
  }

  console.log('PACK_INSTALL_E2E_PASS');
  for (const result of matrix) console.log(`- ${result}`);
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
