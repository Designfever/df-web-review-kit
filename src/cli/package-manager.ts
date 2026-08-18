import { spawn } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export type PackageInstallCommand = {
  command: PackageManager;
  args: string[];
};

const PACKAGE_MANAGER_LOCKS: Record<PackageManager, string[]> = {
  npm: ['package-lock.json', 'npm-shrinkwrap.json'],
  pnpm: ['pnpm-lock.yaml'],
  yarn: ['yarn.lock'],
};

async function isFile(path: string) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function readDeclaredPackageManager(root: string): Promise<PackageManager | null> {
  try {
    const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as {
      packageManager?: unknown;
    };
    if (typeof packageJson.packageManager !== 'string') return null;
    const name = packageJson.packageManager.split('@', 1)[0];
    return name === 'npm' || name === 'pnpm' || name === 'yarn' ? name : null;
  } catch {
    return null;
  }
}

export async function detectPackageManager(root: string) {
  const lockfiles: string[] = [];
  const managers: PackageManager[] = [];

  for (const manager of Object.keys(PACKAGE_MANAGER_LOCKS) as PackageManager[]) {
    const matches = [];
    for (const lockfile of PACKAGE_MANAGER_LOCKS[manager]) {
      if (await isFile(join(root, lockfile))) matches.push(lockfile);
    }
    if (matches.length) {
      managers.push(manager);
      lockfiles.push(...matches);
    }
  }

  const declaredPackageManager = await readDeclaredPackageManager(root);
  const packageManager =
    managers.length === 1
      ? managers[0]
      : declaredPackageManager &&
          (managers.length === 0 || managers.includes(declaredPackageManager))
        ? declaredPackageManager
        : null;

  return {
    packageManager,
    declaredPackageManager,
    managers,
    lockfiles: lockfiles.sort(),
  };
}

export function createPackageInstallCommand(
  packageManager: PackageManager,
  packageName: string,
  version: string
): PackageInstallCommand {
  const spec = `${packageName}@${version}`;
  if (packageManager === 'npm') {
    return { command: 'npm', args: ['install', '--save-exact', spec] };
  }
  return {
    command: packageManager,
    args: ['add', '--exact', spec],
  };
}

export function installPackage(
  root: string,
  install: PackageInstallCommand
): Promise<void> {
  const command = process.platform === 'win32'
    ? `${install.command}.cmd`
    : install.command;
  return new Promise((resolve, reject) => {
    const child = spawn(command, install.args, { cwd: root, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`INSTALL_PACKAGE_FAILED: ${install.command} exited with ${code ?? 1}.`));
    });
  });
}
