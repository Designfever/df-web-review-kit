import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { detectPackageManager, type PackageManager } from './package-manager';

const REVIEW_KIT_PACKAGE_NAME = '@designfever/web-review-kit';

type DependencyField =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

type PackageManifest = {
  name?: string;
} & Partial<Record<DependencyField, Record<string, string>>>;

export type ReviewKitDependency = {
  field: DependencyField;
  spec: string;
};

type VersionCheckOptions = {
  cwd?: string;
  currentVersion?: string;
  dependency?: ReviewKitDependency | null;
  packageManager?: PackageManager | null;
  fetchLatestVersion?: () => Promise<string>;
  confirmUpdate?: (latestVersion: string) => Promise<boolean>;
  installUpdate?: (update: PackageUpdateCommand) => Promise<number>;
  interactive?: boolean;
  log?: (message: string) => void;
  warn?: (message: string) => void;
};

type PackageUpdateCommand = {
  command: PackageManager;
  args: string[];
};

const DEPENDENCY_FIELDS: DependencyField[] = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

export function isNewerVersion(current: string, latest: string): boolean {
  const currentVersion = parseVersion(current);
  const latestVersion = parseVersion(latest);
  if (!currentVersion || !latestVersion) return false;

  for (let index = 0; index < 3; index += 1) {
    const difference = latestVersion.numbers[index] - currentVersion.numbers[index];
    if (difference !== 0) return difference > 0;
  }

  return currentVersion.prerelease && !latestVersion.prerelease;
}

export function findReviewKitDependency(
  manifest: PackageManifest
): ReviewKitDependency | null {
  for (const field of DEPENDENCY_FIELDS) {
    const spec = manifest[field]?.[REVIEW_KIT_PACKAGE_NAME];
    if (spec) return { field, spec };
  }
  return null;
}

export function isLocalDependencySpec(spec: string): boolean {
  return ['file:', 'link:', 'workspace:'].some((prefix) =>
    spec.startsWith(prefix)
  );
}

export function createPackageUpdateCommand(
  packageManager: PackageManager,
  dependency: ReviewKitDependency,
  latestVersion: string
): PackageUpdateCommand {
  const fieldFlags: Record<
    PackageManager,
    Partial<Record<DependencyField, string>>
  > = {
    npm: {
      devDependencies: '--save-dev',
      optionalDependencies: '--save-optional',
      peerDependencies: '--save-peer',
    },
    pnpm: {
      devDependencies: '--save-dev',
      optionalDependencies: '--save-optional',
      peerDependencies: '--save-peer',
    },
    yarn: {
      devDependencies: '--dev',
      optionalDependencies: '--optional',
      peerDependencies: '--peer',
    },
  };
  const args =
    packageManager === 'npm' ? ['install', '--save-exact'] : ['add', '--exact'];
  const flag = fieldFlags[packageManager][dependency.field];
  if (flag) args.push(flag);
  args.push(`${REVIEW_KIT_PACKAGE_NAME}@${latestVersion}`);
  return { command: packageManager, args };
}

async function fetchLatestReviewKitVersion(): Promise<string> {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(REVIEW_KIT_PACKAGE_NAME)}/latest`,
    { signal: AbortSignal.timeout(5_000) }
  );
  if (!response.ok) {
    throw new Error(`npm registry responded with ${response.status}`);
  }

  const data = (await response.json()) as { version?: unknown };
  if (typeof data.version !== 'string') {
    throw new Error('npm registry response did not include a version');
  }
  return data.version;
}

export async function runVersionCheck(
  options: VersionCheckOptions = {}
): Promise<number> {
  const cwd = options.cwd ?? process.cwd();
  const log = options.log ?? console.log;
  const warn = options.warn ?? console.warn;

  log(`→ Checking ${REVIEW_KIT_PACKAGE_NAME} version...`);

  let currentVersion: string;
  let latestVersion: string;
  try {
    [currentVersion, latestVersion] = await Promise.all([
      options.currentVersion
        ? Promise.resolve(options.currentVersion)
        : readInstalledVersion(cwd),
      (options.fetchLatestVersion ?? fetchLatestReviewKitVersion)(),
    ]);
  } catch (error) {
    warn(`! Version check skipped: ${getErrorMessage(error)}`);
    return 0;
  }

  if (!isNewerVersion(currentVersion, latestVersion)) {
    log(`✓ ${currentVersion} is up to date.`);
    return 0;
  }

  log(`↑ ${latestVersion} is available (installed: ${currentVersion}).`);

  let dependency = options.dependency;
  if (dependency === undefined) {
    const manifest = await readManifest(path.join(cwd, 'package.json'));
    dependency = manifest ? findReviewKitDependency(manifest) : null;
  }
  if (!dependency) {
    warn(`! Update skipped: ${REVIEW_KIT_PACKAGE_NAME} is not declared in package.json.`);
    return 0;
  }
  if (isLocalDependencySpec(dependency.spec)) {
    warn(`! Update skipped: local dependency ${dependency.spec} is active.`);
    return 0;
  }

  let packageManager = options.packageManager;
  if (packageManager === undefined) {
    packageManager = (await detectPackageManager(cwd)).packageManager;
  }
  if (!packageManager) {
    warn(
      '! Update skipped: declare packageManager in package.json or keep one npm, pnpm, or Yarn lockfile.'
    );
    return 0;
  }
  const update = createPackageUpdateCommand(
    packageManager,
    dependency,
    latestVersion
  );

  const interactive =
    options.interactive ?? Boolean(process.stdin.isTTY && process.stdout.isTTY);
  if (!interactive && !options.confirmUpdate) {
    log(`  Run: ${update.command} ${update.args.join(' ')}`);
    return 0;
  }

  const confirmed = await (options.confirmUpdate ?? confirmInTerminal)(latestVersion);
  if (!confirmed) {
    log('→ Update skipped. Starting dev with the installed version.');
    return 0;
  }

  log(`→ Installing ${REVIEW_KIT_PACKAGE_NAME}@${latestVersion}...`);
  const exitCode = await (
    options.installUpdate ??
    ((targetUpdate) => installPackageUpdate(cwd, targetUpdate))
  )(update);
  if (exitCode !== 0) {
    warn('! Package update failed.');
    return exitCode;
  }

  log(`✓ Updated to ${latestVersion}. Starting dev...`);
  return 0;
}

async function readInstalledVersion(cwd: string): Promise<string> {
  const require = createRequire(path.resolve(cwd, 'package.json'));
  const installedManifestPath = require.resolve(
    `${REVIEW_KIT_PACKAGE_NAME}/package.json`
  );
  const manifest = await readManifest(installedManifestPath);
  if (!manifest || typeof manifest.version !== 'string') {
    throw new Error(`cannot read installed ${REVIEW_KIT_PACKAGE_NAME} version`);
  }
  return manifest.version;
}

async function readManifest(
  manifestPath: string
): Promise<(PackageManifest & { version?: string }) | null> {
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8')) as PackageManifest & {
      version?: string;
    };
  } catch {
    return null;
  }
}

async function confirmInTerminal(latestVersion: string): Promise<boolean> {
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await terminal.question(
      `? Install ${REVIEW_KIT_PACKAGE_NAME}@${latestVersion} now? (y/N) `
    );
    return ['y', 'yes'].includes(answer.trim().toLowerCase());
  } finally {
    terminal.close();
  }
}

function installPackageUpdate(
  cwd: string,
  update: PackageUpdateCommand
): Promise<number> {
  const command =
    process.platform === 'win32' ? `${update.command}.cmd` : update.command;
  return new Promise((resolve) => {
    const child = spawn(command, update.args, { cwd, stdio: 'inherit' });
    child.on('error', () => resolve(1));
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

function parseVersion(
  value: string
): { numbers: [number, number, number]; prerelease: boolean } | null {
  const match = value.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([^+]+))?/);
  if (!match) return null;
  return {
    numbers: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: Boolean(match[4]),
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
