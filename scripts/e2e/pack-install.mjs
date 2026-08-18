import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
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
    env: {
      ...process.env,
      CI: '1',
      npm_config_cache: join(workspace, 'npm-cache'),
    },
    stdio: options.capture ? 'pipe' : 'inherit',
  });
}

function runResult(command, args, cwd) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: '1',
      npm_config_cache: join(workspace, 'npm-cache'),
    },
  });
}

function parseNpmPackOutput(output) {
  const trimmed = output.trim();
  const jsonStart = trimmed.lastIndexOf('\n[');
  return JSON.parse(jsonStart === -1 ? trimmed : trimmed.slice(jsonStart + 1));
}

function write(root, path, content) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function viteFixture(name) {
  const root = join(workspace, name);
  mkdirSync(root);
  write(
    root,
    'package.json',
    `${JSON.stringify(
      {
        name: `web-review-kit-e2e-${name}`,
        private: true,
        type: 'module',
        scripts: { build: 'vite build', typecheck: 'tsc --noEmit' },
        dependencies: {
          react: '^19.2.0',
          'react-dom': '^19.2.0',
          vite: '^8.0.0',
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          typescript: '^6.0.0',
        },
      },
      null,
      2
    )}\n`
  );
  write(
    root,
    'vite.config.ts',
    "import { defineConfig } from 'vite';\nexport default defineConfig({ build: { rollupOptions: { input: 'review/index.html' } } });\n"
  );
  write(
    root,
    'tsconfig.json',
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          lib: ['DOM', 'ES2020'],
          module: 'ESNext',
          moduleResolution: 'Bundler',
          jsx: 'react-jsx',
          types: ['vite/client'],
          strict: true,
          skipLibCheck: true,
        },
        include: ['df.ts', 'src/review/**/*'],
      },
      null,
      2
    )}\n`
  );
  write(root, 'src/main.tsx', 'export const host = true;\n');
  return root;
}

function filesHash(root) {
  const hash = createHash('sha256');
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      if (['node_modules', 'dist', '.web-review-kit'].includes(name)) continue;
      const filePath = join(directory, name);
      const info = statSync(filePath);
      if (info.isDirectory()) visit(filePath);
      else {
        hash
          .update(relative(root, filePath))
          .update('\0')
          .update(readFileSync(filePath))
          .update('\0');
      }
    }
  }
  visit(root);
  return hash.digest('hex');
}

function install(root, tarball) {
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], {
    cwd: root,
  });
}

function cli(root, args, capture = false) {
  return run(join(root, 'node_modules/.bin/web-review-kit'), args, {
    cwd: root,
    capture,
  });
}

function addHostReviewRoute(root) {
  write(
    root,
    'review/index.html',
    '<div id="root"></div><script type="module" src="/src/review/index.tsx"></script>\n'
  );
  write(
    root,
    'src/review/index.tsx',
    `import { localAdapter } from '@designfever/web-review-kit';
import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
import { REVIEW_PROJECT_ID } from '../../df';

mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages: [{ href: '/' }],
  adapters: [{ label: 'local', ...localAdapter() }],
});
`
  );
}

try {
  run('pnpm', ['build']);
  const packed = parseNpmPackOutput(
    run(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', packDir],
      { capture: true }
    )
  );
  const tarball = join(packDir, packed[0].filename);
  const matrix = [];

  {
    const root = viteFixture('vite-react');
    install(root, tarball);
    const args = [
      'init',
      '--non-interactive',
      '--project-id',
      'f82b8ad5-7289-43d4-b175-bd5ecf1d4dba',
      '--project-name',
      'Fixture',
    ];
    const before = filesHash(root);
    const preview = cli(root, [...args, '--dry-run'], true);
    if (filesHash(root) !== before) throw new Error('dry-run changed host files.');
    if (!preview.includes('docs/review-page/vite-react.md')) {
      throw new Error('Vite guide URL was not printed.');
    }

    cli(root, [...args, '--yes']);
    if (!readFileSync(join(root, 'df.ts'), 'utf8').includes('REVIEW_PROJECT_ID')) {
      throw new Error('df.ts was not created.');
    }
    if (statSync(join(root, 'vite.config.ts')).size === 0) {
      throw new Error('host Vite config was damaged.');
    }
    const applied = filesHash(root);
    cli(root, [...args, '--yes']);
    if (filesHash(root) !== applied) throw new Error('init was not idempotent.');

    addHostReviewRoute(root);
    const doctor = JSON.parse(cli(root, ['doctor', '--json'], true));
    if (doctor.status !== 'healthy') {
      throw new Error(`doctor failed: ${JSON.stringify(doctor.diagnostics)}`);
    }
    run('npm', ['run', 'typecheck'], { cwd: root });
    run('npm', ['run', 'build'], { cwd: root });
    matrix.push('vite-react: dry-run df.ts guide host-route doctor build idempotent');
  }

  {
    const root = viteFixture('next-detection');
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    manifest.dependencies.next = '^16.0.0';
    delete manifest.dependencies.vite;
    write(root, 'package.json', `${JSON.stringify(manifest, null, 2)}\n`);
    install(root, tarball);
    const output = cli(
      root,
      [
        'init',
        '--non-interactive',
        '--project-id',
        'next-project',
        '--project-name',
        'Next project',
        '--dry-run',
      ],
      true
    );
    if (!output.includes('docs/review-page/nextjs-app-router.md')) {
      throw new Error('Next.js guide URL was not printed.');
    }
    matrix.push('next: detected guide without route generation');
  }

  {
    const root = viteFixture('legacy');
    write(
      root,
      'src/legacy-review.ts',
      "import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';\ncreateWebReviewKit({ projectId: 'legacy', adapter: localAdapter() });\n"
    );
    install(root, tarball);
    const before = filesHash(root);
    const result = runResult(
      join(root, 'node_modules/.bin/web-review-kit'),
      ['doctor', '--fix', '--yes'],
      root
    );
    if (
      result.status !== 1 ||
      !result.stdout.includes('MIGRATION_MANUAL_REVIEW_ROUTE_REQUIRED') ||
      filesHash(root) !== before
    ) {
      throw new Error('legacy route migration was not blocked read-only.');
    }
    matrix.push('legacy: manual route migration blocker unchanged');
  }

  {
    const root = viteFixture('removed-custom-option');
    install(root, tarball);
    const before = filesHash(root);
    const result = runResult(
      join(root, 'node_modules/.bin/web-review-kit'),
      [
        'init',
        '--non-interactive',
        '--project-id',
        'custom',
        '--project-name',
        'Custom',
        '--review-storage',
        'custom',
        '--yes',
      ],
      root
    );
    if (
      result.status !== 1 ||
      !result.stderr.includes('Unknown init option: --review-storage') ||
      filesHash(root) !== before
    ) {
      throw new Error('removed custom option changed host files or exit code.');
    }
    matrix.push('custom: removed installer option fails unchanged');
  }

  console.log('PACK_INSTALL_E2E_PASS');
  for (const result of matrix) console.log(`- ${result}`);
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
