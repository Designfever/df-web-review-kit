import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { detectPackageManager, type PackageManager } from './package-manager';

type PreflightSeverity = 'info' | 'warning' | 'blocker';

export type PreflightDiagnosticCode =
  | 'PROJECT_PACKAGE_JSON_MISSING'
  | 'PROJECT_PACKAGE_JSON_INVALID'
  | 'HOST_REACT_MISSING'
  | 'HOST_VITE_MISSING'
  | 'HOST_FRAMEWORK_UNSUPPORTED'
  | 'PACKAGE_MANAGER_MISSING'
  | 'PACKAGE_MANAGER_AMBIGUOUS'
  | 'VITE_CONFIG_MISSING'
  | 'VITE_CONFIG_CONFLICT'
  | 'REVIEW_ROUTE_MISSING'
  | 'REVIEW_ROUTE_CONFLICT'
  | 'REVIEW_KIT_PARTIAL';

type PreflightDiagnostic = {
  code: PreflightDiagnosticCode;
  severity: PreflightSeverity;
  message: string;
  paths?: string[];
};

type ProjectLanguage = 'javascript' | 'typescript';
export type ReviewHostFramework =
  | 'nextjs-app-router'
  | 'vite-react'
  | 'vue-router'
  | 'custom';

export type ProjectPreflightResult = {
  root: string;
  support: 'supported' | 'warning' | 'blocked';
  packageManager: PackageManager | null;
  language: ProjectLanguage;
  framework: ReviewHostFramework;
  dependencies: {
    react: string | null;
    vite: string | null;
    reviewKit: string | null;
  };
  files: {
    packageJson: string | null;
    lockfiles: string[];
    viteConfigs: string[];
    reviewRoutes: string[];
    envFiles: string[];
  };
  features: {
    reviewKitInstalled: boolean;
    reviewShellMounted: boolean;
    sourceLocator: boolean;
    dataLocator: boolean;
    figmaImageStorePlugin: boolean;
  };
  diagnostics: PreflightDiagnostic[];
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const VITE_CONFIG_NAMES = [
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.cjs',
  'vite.config.ts',
  'vite.config.mts',
  'vite.config.cts',
];

const ENV_FILE_PATTERN = /^\.env(?:\.[A-Za-z0-9_-]+)?$/;
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts', '.vue']);
const IGNORED_DIRECTORIES = new Set(['.git', 'dist', 'build', 'coverage', 'node_modules']);
const REVIEW_ROUTE_PATTERN =
  /(^|\/)(?:(?:app|page|pages|src\/pages|src\/app|src\/views)\/review(?:\/(?:index|page))?|src\/review\/index)\.(?:jsx?|tsx?|vue)$/;
const MAX_SOURCE_FILES = 2_000;

function toPosix(path: string) {
  return path.replace(/\\/g, '/');
}

function getDependency(packageJson: PackageJson, name: string) {
  return packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name] ?? null;
}

function detectFramework(packageJson: PackageJson): ReviewHostFramework {
  if (getDependency(packageJson, 'next')) return 'nextjs-app-router';
  if (getDependency(packageJson, 'vue') || getDependency(packageJson, 'nuxt')) {
    return 'vue-router';
  }
  if (getDependency(packageJson, 'vite') && getDependency(packageJson, 'react')) {
    return 'vite-react';
  }
  return 'custom';
}

function diagnostic(
  code: PreflightDiagnosticCode,
  severity: PreflightSeverity,
  message: string,
  paths?: string[]
): PreflightDiagnostic {
  return { code, severity, message, ...(paths?.length ? { paths: [...paths].sort() } : {}) };
}

async function isFile(path: string) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function collectSourceFiles(root: string) {
  const files: string[] = [];

  async function visit(directory: string): Promise<void> {
    if (files.length >= MAX_SOURCE_FILES) return;

    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (files.length >= MAX_SOURCE_FILES) break;
      if (entry.isSymbolicLink()) continue;

      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) await visit(absolutePath);
        continue;
      }

      if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
        files.push(toPosix(relative(root, absolutePath)));
      }
    }
  }

  await visit(root);
  return files.sort();
}

async function readSourceFeatures(root: string, sourceFiles: string[]) {
  const features = {
    reviewShellMounted: false,
    sourceLocator: false,
    dataLocator: false,
    figmaImageStorePlugin: false,
  };

  for (const path of sourceFiles) {
    let source = '';
    try {
      source = await readFile(join(root, path), 'utf8');
    } catch {
      continue;
    }

    features.reviewShellMounted ||= source.includes('mountReviewShell');
    features.sourceLocator ||= source.includes('reviewSourceLocator');
    features.dataLocator ||= source.includes('reviewDataLocator');
    features.figmaImageStorePlugin ||= source.includes('reviewFigmaImageStore');
  }

  return features;
}

function getSupport(diagnostics: PreflightDiagnostic[]) {
  if (diagnostics.some(({ severity }) => severity === 'blocker')) return 'blocked';
  if (diagnostics.some(({ severity }) => severity === 'warning')) return 'warning';
  return 'supported';
}

export async function scanProject(root: string): Promise<ProjectPreflightResult> {
  const diagnostics: PreflightDiagnostic[] = [];
  const packageJsonPath = join(root, 'package.json');
  let packageJson: PackageJson = {};
  let packageJsonFile: string | null = null;

  if (!(await isFile(packageJsonPath))) {
    diagnostics.push(
      diagnostic('PROJECT_PACKAGE_JSON_MISSING', 'blocker', 'package.json was not found.')
    );
  } else {
    packageJsonFile = 'package.json';
    try {
      packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as PackageJson;
    } catch {
      diagnostics.push(
        diagnostic('PROJECT_PACKAGE_JSON_INVALID', 'blocker', 'package.json is not valid JSON.', [
          'package.json',
        ])
      );
    }
  }

  const react = getDependency(packageJson, 'react');
  const vite = getDependency(packageJson, 'vite');
  const reviewKit = getDependency(packageJson, '@designfever/web-review-kit');
  const framework = detectFramework(packageJson);

  if (framework === 'custom' && !react) {
    diagnostics.push(
      diagnostic(
        'HOST_REACT_MISSING',
        'warning',
        'React is not declared. The custom guide must provide the React runtime used by Review Shell.'
      )
    );
  }

  const { packageManager, managers: packageManagers, lockfiles } =
    await detectPackageManager(root);

  if (packageManagers.length === 0) {
    diagnostics.push(
      diagnostic('PACKAGE_MANAGER_MISSING', 'warning', 'No supported package manager lockfile was found.')
    );
  } else if (packageManagers.length > 1 && !packageManager) {
    diagnostics.push(
      diagnostic(
        'PACKAGE_MANAGER_AMBIGUOUS',
        'blocker',
        'Multiple package managers were detected.',
        lockfiles
      )
    );
  }

  const viteConfigs = [];
  for (const name of VITE_CONFIG_NAMES) {
    if (await isFile(join(root, name))) viteConfigs.push(name);
  }
  viteConfigs.sort();
  if (framework === 'vite-react') {
    if (viteConfigs.length === 0) {
      diagnostics.push(diagnostic('VITE_CONFIG_MISSING', 'warning', 'No root Vite config was found.'));
    } else if (viteConfigs.length > 1) {
      diagnostics.push(
        diagnostic('VITE_CONFIG_CONFLICT', 'blocker', 'Multiple root Vite configs were found.', viteConfigs)
      );
    }
  }

  const rootEntries = await readdir(root).catch(() => [] as string[]);
  const envFiles = rootEntries.filter((name) => ENV_FILE_PATTERN.test(name)).sort();
  const sourceFiles = await collectSourceFiles(root);
  const sourceFeatures = await readSourceFeatures(root, sourceFiles);
  const reviewRoutes = sourceFiles.filter((path) => REVIEW_ROUTE_PATTERN.test(path)).sort();

  if (reviewRoutes.length === 0) {
    diagnostics.push(diagnostic('REVIEW_ROUTE_MISSING', 'warning', 'No recognized review route was found.'));
  } else if (reviewRoutes.length > 1) {
    diagnostics.push(
      diagnostic('REVIEW_ROUTE_CONFLICT', 'blocker', 'Multiple review route candidates were found.', reviewRoutes)
    );
  }

  if (Boolean(reviewKit) !== sourceFeatures.reviewShellMounted) {
    diagnostics.push(
      diagnostic(
        'REVIEW_KIT_PARTIAL',
        'warning',
        reviewKit
          ? 'The review-kit package is installed, but mountReviewShell was not found.'
          : 'mountReviewShell was found, but the review-kit package is not declared.'
      )
    );
  }

  diagnostics.sort((a, b) => a.code.localeCompare(b.code));
  const language: ProjectLanguage =
    (await isFile(join(root, 'tsconfig.json'))) || sourceFiles.some((path) => /\.(?:ts|tsx|mts|cts)$/.test(path))
      ? 'typescript'
      : 'javascript';

  return {
    root,
    support: getSupport(diagnostics),
    packageManager,
    language,
    framework,
    dependencies: { react, vite, reviewKit },
    files: {
      packageJson: packageJsonFile,
      lockfiles,
      viteConfigs,
      reviewRoutes,
      envFiles,
    },
    features: {
      reviewKitInstalled: Boolean(reviewKit),
      ...sourceFeatures,
    },
    diagnostics,
  };
}
