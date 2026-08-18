import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import {
  applyInstallPlan,
  type InstallFileChange,
  type InstallPlan,
} from './install-generator';
import { scanProject } from './preflight';

type MigrationBlocker = {
  code: string;
  message: string;
  fixHint: string;
  paths?: string[];
};

export type MigrationPlan = {
  root: string;
  id: string;
  backupPath: string;
  changes: InstallFileChange[];
  blockers: MigrationBlocker[];
  sourcePath: string | null;
};

type BackupManifest = {
  schemaVersion: 1;
  migrationId: string;
  changes: Array<{ path: string; existed: boolean }>;
};

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts']);
const IGNORED_DIRECTORIES = new Set(['.git', '.web-review-kit', 'dist', 'build', 'coverage', 'node_modules']);
const SIMPLE_LEGACY_CALL = /createWebReviewKit\s*\(\s*\{\s*projectId\s*:\s*(['"])([a-z0-9]+(?:[._-][a-z0-9]+)*)\1\s*,\s*adapter\s*:\s*localAdapter\s*\(\s*\)\s*,?\s*\}\s*\)\s*;?/g;

async function readOptional(path: string) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function collectLegacySources(root: string) {
  const sources: Array<{ path: string; content: string }> = [];
  async function visit(directory: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) await visit(absolute);
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
        const content = await readOptional(absolute);
        if (content?.includes('createWebReviewKit')) {
          sources.push({ path: relative(root, absolute).replace(/\\/g, '/'), content });
        }
      }
    }
  }
  await visit(root);
  return sources.sort((a, b) => a.path.localeCompare(b.path));
}

export async function createMigrationPlan(root: string): Promise<MigrationPlan> {
  const preflight = await scanProject(root);
  const legacySources = await collectLegacySources(root);
  const blockers: MigrationBlocker[] = [];

  if (preflight.features.reviewShellMounted || legacySources.length === 0) {
    return { root, id: 'none', backupPath: '', changes: [], blockers, sourcePath: null };
  }
  if (legacySources.length > 1) {
    blockers.push({
      code: 'MIGRATION_LEGACY_AMBIGUOUS',
      message: 'Multiple legacy createWebReviewKit integrations were found.',
      fixHint: 'Choose and migrate the host review entry manually.',
      paths: legacySources.map(({ path }) => path),
    });
  }

  const source = legacySources[0];
  const matches = [...source.content.matchAll(SIMPLE_LEGACY_CALL)];
  const allCalls = source.content.match(/createWebReviewKit\s*\(/g) ?? [];
  if (legacySources.length === 1 && (matches.length !== 1 || allCalls.length !== 1)) {
    blockers.push({
      code: 'MIGRATION_CUSTOMIZATION_UNSUPPORTED',
      message: 'The legacy integration contains options or adapter wiring that cannot be preserved automatically.',
      fixHint: 'Use the doctor fix hint and generated diff as a guide; migrate this host-specific integration manually.',
      paths: [source.path],
    });
  }
  if (blockers.length) {
    return { root, id: 'blocked', backupPath: '', changes: [], blockers, sourcePath: source.path };
  }

  blockers.push({
    code: 'MIGRATION_MANUAL_REVIEW_ROUTE_REQUIRED',
    message: 'The CLI cannot safely replace a host-owned review route.',
    fixHint: 'Follow the detected framework guide and migrate the /review page manually.',
    paths: [source.path],
  });
  return {
    root,
    id: 'blocked',
    backupPath: '',
    changes: [],
    blockers,
    sourcePath: source.path,
  };
}

function asInstallPlan(plan: MigrationPlan): InstallPlan {
  return { root: plan.root, dependencies: {}, changes: plan.changes, summary: [] };
}

export async function applyMigrationPlan(plan: MigrationPlan) {
  if (plan.blockers.length) throw new Error('MIGRATION_BLOCKED: automatic changes are not safe.');
  if (!plan.changes.length) return null;

  // Validate the complete preview before creating the backup or changing host files.
  for (const change of plan.changes) {
    if ((await readOptional(join(plan.root, change.path))) !== change.before) {
      throw new Error(`MIGRATION_STALE_PLAN: ${change.path} changed after preview; no files were written.`);
    }
  }

  const backupRoot = join(plan.root, plan.backupPath);
  if (await readOptional(join(backupRoot, 'manifest.json'))) {
    throw new Error(`MIGRATION_BACKUP_CONFLICT: ${plan.backupPath} already exists.`);
  }
  const manifest: BackupManifest = {
    schemaVersion: 1,
    migrationId: plan.id,
    changes: plan.changes.map(({ path, before }) => ({ path, existed: before !== null })),
  };
  await mkdir(backupRoot, { recursive: true });
  for (const change of plan.changes) {
    if (change.before === null) continue;
    const backupFile = join(backupRoot, 'before', change.path);
    await mkdir(dirname(backupFile), { recursive: true });
    await writeFile(backupFile, change.before);
  }
  await writeFile(join(backupRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  try {
    await applyInstallPlan(asInstallPlan(plan));
  } catch (error) {
    await rollbackMigration(plan.root, plan.backupPath);
    throw error;
  }
  return plan.backupPath;
}

async function rollbackMigration(root: string, backupPath: string) {
  const backupRoot = join(root, backupPath);
  const raw = await readOptional(join(backupRoot, 'manifest.json'));
  if (raw === null) throw new Error(`MIGRATION_BACKUP_MISSING: ${backupPath}`);
  const manifest = JSON.parse(raw) as BackupManifest;
  if (manifest.schemaVersion !== 1) throw new Error('MIGRATION_BACKUP_INVALID: unsupported schema.');

  for (const change of [...manifest.changes].reverse()) {
    const target = join(root, change.path);
    if (change.existed) {
      const before = await readOptional(join(backupRoot, 'before', change.path));
      if (before === null) throw new Error(`MIGRATION_BACKUP_INVALID: missing ${change.path}.`);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, before);
    } else {
      await rm(target, { force: true });
    }
  }
}

function redactEnv(content: string) {
  return content.replace(/^(\s*(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*=).*$/gm, '$1<redacted>');
}

export function formatMigrationPlan(plan: MigrationPlan) {
  if (plan.blockers.length) {
    return plan.blockers
      .map(({ code, message, fixHint }) => `[FAIL] ${code}: ${message}\n  Fix: ${fixHint}`)
      .join('\n');
  }
  if (!plan.changes.length) return 'No safe migration changes required.';
  return [
    `Migration ${plan.id}`,
    `Backup before apply: ${plan.backupPath}`,
    ...plan.changes.map((change) => {
      const sanitize = change.path.startsWith('.env') ? redactEnv : (value: string) => value;
      return [
        `--- ${change.before === null ? '/dev/null' : change.path}`,
        `+++ ${change.path}`,
        ...sanitize(change.before ?? '').split('\n').map((line) => `-${line}`),
        ...sanitize(change.after).split('\n').map((line) => `+${line}`),
      ].join('\n');
    }),
  ].join('\n');
}
