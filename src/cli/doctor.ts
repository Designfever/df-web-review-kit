import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { scanProject } from './preflight';
import {
  doctorProviderProfile,
  resolveProviderProfile,
} from './provider-install';

export type DoctorSeverity = 'info' | 'warning' | 'blocker';

export type DoctorDiagnostic = {
  code: string;
  severity: DoctorSeverity;
  message: string;
  fixHint: string;
  paths?: string[];
};

export type DoctorResult = {
  root: string;
  status: 'healthy' | 'warning' | 'failed';
  exitCode: 0 | 1 | 2;
  diagnostics: DoctorDiagnostic[];
  detected: {
    packageVersion: string | null;
    envKeys: string[];
    capabilities: {
      review: boolean;
      figma: boolean;
      sourceLocator: boolean;
      dataLocator: boolean;
    };
  };
};

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts']);
const IGNORED_DIRECTORIES = new Set(['.git', 'dist', 'build', 'coverage', 'node_modules']);
const REQUIRED_EXPORTS = ['.', './react-shell', './vite'];

function finding(
  code: string,
  severity: DoctorSeverity,
  message: string,
  fixHint: string,
  paths?: string[]
): DoctorDiagnostic {
  return { code, severity, message, fixHint, ...(paths?.length ? { paths: [...paths].sort() } : {}) };
}

async function readOptional(path: string) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function isFile(path: string) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function collectSources(root: string) {
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
        if (content !== null) {
          sources.push({ path: relative(root, absolute).replace(/\\/g, '/'), content });
        }
      }
    }
  }
  await visit(root);
  return sources.sort((a, b) => a.path.localeCompare(b.path));
}

async function readEnvKeys(root: string, files: string[]) {
  const keys = new Set<string>();
  for (const file of files) {
    const content = await readOptional(join(root, file));
    for (const line of content?.split(/\r?\n/) ?? []) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
      if (match) keys.add(match[1]);
    }
  }
  return [...keys].sort();
}

function majorOf(range: string | null) {
  const match = range?.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function getStatus(diagnostics: DoctorDiagnostic[]) {
  if (diagnostics.some(({ severity }) => severity === 'blocker')) {
    return { status: 'failed' as const, exitCode: 1 as const };
  }
  if (diagnostics.some(({ severity }) => severity === 'warning')) {
    return { status: 'warning' as const, exitCode: 2 as const };
  }
  return { status: 'healthy' as const, exitCode: 0 as const };
}

export async function runDoctor(input: {
  root: string;
  profileSpecifier?: string | null;
}): Promise<DoctorResult> {
  const { root } = input;
  const preflight = await scanProject(root);
  const diagnostics: DoctorDiagnostic[] = [];
  const sources = await collectSources(root);
  const combinedSource = sources.map(({ content }) => content).join('\n');
  const envKeys = await readEnvKeys(root, preflight.files.envFiles);

  for (const diagnostic of preflight.diagnostics) {
    const severity: DoctorSeverity =
      diagnostic.code === 'REVIEW_ROUTE_MISSING' || diagnostic.code === 'REVIEW_KIT_PARTIAL'
        ? 'blocker'
        : diagnostic.severity;
    diagnostics.push(
      finding(
        diagnostic.code,
        severity,
        diagnostic.message,
        diagnostic.code.startsWith('HOST_')
          ? 'Use a supported React 18+ and Vite 5+ host before installing.'
          : 'Run init --dry-run and resolve this project structure before applying changes.',
        diagnostic.paths
      )
    );
  }

  const reactMajor = majorOf(preflight.dependencies.react);
  const viteMajor = majorOf(preflight.dependencies.vite);
  if (reactMajor !== null && reactMajor < 18) {
    diagnostics.push(
      finding('REACT_VERSION_UNSUPPORTED', 'blocker', 'React must be version 18 or newer.', 'Upgrade React before using the review shell.')
    );
  }
  if (viteMajor !== null && viteMajor < 5) {
    diagnostics.push(
      finding('VITE_VERSION_UNSUPPORTED', 'blocker', 'Vite must be version 5 or newer.', 'Upgrade Vite before enabling review plugins.')
    );
  }

  let packageVersion: string | null = null;
  const installedManifestPath = join(root, 'node_modules/@designfever/web-review-kit/package.json');
  const installedManifest = await readOptional(installedManifestPath);
  if (preflight.dependencies.reviewKit && installedManifest === null) {
    diagnostics.push(
      finding('PACKAGE_NOT_INSTALLED', 'blocker', 'The review-kit dependency is declared but not installed.', 'Run the detected package manager install command.')
    );
  } else if (installedManifest !== null) {
    try {
      const manifest = JSON.parse(installedManifest) as {
        version?: unknown;
        exports?: Record<string, unknown>;
      };
      packageVersion = typeof manifest.version === 'string' ? manifest.version : null;
      const missingExports = REQUIRED_EXPORTS.filter((key) => !(key in (manifest.exports ?? {})));
      if (missingExports.length) {
        diagnostics.push(
          finding('PACKAGE_EXPORT_MISSING', 'blocker', `Installed package is missing exports: ${missingExports.join(', ')}.`, 'Reinstall a complete compatible package version.', ['node_modules/@designfever/web-review-kit/package.json'])
        );
      } else {
        diagnostics.push(
          finding('PACKAGE_OK', 'info', `Review-kit package ${packageVersion ?? 'unknown'} and required exports were found.`, 'No action required.')
        );
      }
    } catch {
      diagnostics.push(
        finding('PACKAGE_MANIFEST_INVALID', 'blocker', 'The installed review-kit package manifest is invalid.', 'Remove and reinstall the package.')
      );
    }
  }

  const reviewCapability = /\badapters\s*:|\breviewAdapters\b|\blocalAdapter\s*\(/.test(combinedSource);
  const figmaClient = /\bfigmaImages\s*:|\bfigmaImageStore\b/.test(combinedSource);
  if (preflight.features.reviewShellMounted && !reviewCapability) {
    diagnostics.push(
      finding('REVIEW_ADAPTER_MISSING', 'blocker', 'Review shell mount was found without adapter capability wiring.', 'Pass at least one ReviewShellAdapter to mountReviewShell().')
    );
  }
  if (preflight.features.figmaImageStorePlugin !== figmaClient) {
    diagnostics.push(
      finding('FIGMA_CAPABILITY_PARTIAL', 'warning', 'Figma server plugin and client image-store wiring are incomplete.', 'Wire both reviewFigmaImageStore() and figmaImages.store, or remove both.')
    );
  }
  if (!envKeys.includes('VITE_REVIEW_PROJECT_ID')) {
    diagnostics.push(
      finding('ENV_PROJECT_ID_MISSING', 'warning', 'Environment key VITE_REVIEW_PROJECT_ID was not found.', 'Add the key to .env.example and set it in the local environment.')
    );
  }
  if (combinedSource.includes('createWebReviewKit') && !preflight.features.reviewShellMounted) {
    diagnostics.push(
      finding('LEGACY_CONFIG_DETECTED', 'warning', 'A legacy createWebReviewKit integration was detected.', 'Migrate to a mountReviewShell review route after previewing the migration plan.')
    );
  }

  if (input.profileSpecifier) {
    try {
      const profile = await resolveProviderProfile(input.profileSpecifier, root);
      const profileResult = doctorProviderProfile({
        profile,
        source: combinedSource,
        env: Object.fromEntries(envKeys.map((key) => [key, 'present'])),
      });
      for (const diagnostic of profileResult.diagnostics) {
        diagnostics.push(
          finding(diagnostic.code, diagnostic.severity, diagnostic.message, 'Review the selected provider profile wiring and required environment key names.')
        );
      }
    } catch {
      diagnostics.push(
        finding('PROFILE_LOAD_FAILED', 'blocker', 'The selected provider profile could not be loaded.', 'Install the profile package or correct its local module path.')
      );
    }
  }

  diagnostics.sort((a, b) => a.code.localeCompare(b.code) || a.message.localeCompare(b.message));
  const policy = getStatus(diagnostics);
  return {
    root,
    ...policy,
    diagnostics,
    detected: {
      packageVersion,
      envKeys,
      capabilities: {
        review: reviewCapability,
        figma: figmaClient && preflight.features.figmaImageStorePlugin,
        sourceLocator: preflight.features.sourceLocator,
        dataLocator: preflight.features.dataLocator,
      },
    },
  };
}

export function formatDoctorResult(result: DoctorResult) {
  const icon: Record<DoctorSeverity, string> = { info: 'INFO', warning: 'WARN', blocker: 'FAIL' };
  return [
    `web-review-kit doctor: ${result.status}`,
    ...result.diagnostics.map(
      ({ code, severity, message, fixHint }) =>
        `[${icon[severity]}] ${code}: ${message}\n  Fix: ${fixHint}`
    ),
  ].join('\n');
}

export function parseDoctorArgs(args: string[]) {
  let json = false;
  let fix = false;
  let yes = false;
  let profileSpecifier: string | null = null;
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (flag === '--json') {
      json = true;
      continue;
    }
    if (flag === '--fix') {
      fix = true;
      continue;
    }
    if (flag === '--yes') {
      yes = true;
      continue;
    }
    if (flag === '--profile') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--profile requires a value.');
      profileSpecifier = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown doctor option: ${flag}`);
  }
  if (yes && !fix) throw new Error('--yes requires --fix.');
  return { json, fix, yes, profileSpecifier };
}
