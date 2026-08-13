import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  validateProviderProfile,
  type ProviderCapability,
  type ProviderProfile,
  type ProviderWiring,
} from './provider-profile';

export type ProviderProfileModule = {
  default?: unknown;
  providerProfile?: unknown;
};

export type ProviderArtifacts = {
  source: string;
  envLocal: string;
  envExample: string;
  dependencies: Record<string, string>;
  capabilities: ProviderCapability[];
};

export type ProviderDoctorDiagnostic = {
  code: string;
  severity: 'info' | 'warning' | 'blocker';
  message: string;
};

export type ProviderDoctorResult = {
  healthy: boolean;
  capabilities: ProviderCapability[];
  diagnostics: ProviderDoctorDiagnostic[];
};

function isLocalSpecifier(specifier: string) {
  return specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('file:');
}

export async function resolveProviderProfile(
  specifier: string,
  cwd = process.cwd(),
  load: (specifier: string) => Promise<ProviderProfileModule> = (target) => import(target)
): Promise<ProviderProfile> {
  if (!specifier) throw new Error('The --profile option requires a package name or module path.');

  let target: string;
  if (specifier.startsWith('file:')) {
    target = specifier;
  } else if (isLocalSpecifier(specifier)) {
    const path = isAbsolute(specifier) ? specifier : resolve(cwd, specifier);
    await access(path);
    target = pathToFileURL(path).href;
  } else {
    target = pathToFileURL(createRequire(resolve(cwd, 'package.json')).resolve(specifier)).href;
  }

  const module = await load(target);
  const profile = module.default ?? module.providerProfile;
  validateProviderProfile(profile);
  return profile;
}

export function getProfileSpecifier(args: string[]) {
  const index = args.indexOf('--profile');
  if (index === -1) return null;
  const specifier = args[index + 1];
  if (!specifier || specifier.startsWith('-')) {
    throw new Error('The --profile option requires a package name or module path.');
  }
  return specifier;
}

function renderValue(value: { env: string } | string | boolean | number) {
  if (typeof value === 'object') return `import.meta.env.${value.env}`;
  return JSON.stringify(value);
}

function renderWiring(name: string, wiring: ProviderWiring) {
  const options = Object.entries(wiring.options ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `  ${JSON.stringify(key)}: ${renderValue(value)},`)
    .join('\n');
  return `const ${name} = ${wiring.exportName}(${options ? `{\n${options}\n}` : ''});`;
}

function renderEnvValue(value: string) {
  if (/\r|\n/.test(value)) throw new Error('Environment values cannot contain line breaks.');
  return value;
}

export function createProviderArtifacts(
  profile: ProviderProfile,
  envValues: Record<string, string> = {}
): ProviderArtifacts {
  validateProviderProfile(profile);
  const imports = new Map<string, Set<string>>();
  const addImport = (wiring: ProviderWiring) => {
    const exports = imports.get(wiring.module) ?? new Set<string>();
    exports.add(wiring.exportName);
    imports.set(wiring.module, exports);
  };
  addImport(profile.capabilities.review);
  if (profile.capabilities.figma) addImport(profile.capabilities.figma);

  const source = [
    '// Generated provider wiring. Secret values stay in .env.local.',
    ...[...imports.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, exports]) => `import { ${[...exports].sort().join(', ')} } from ${JSON.stringify(module)};`),
    '',
    renderWiring('reviewAdapter', profile.capabilities.review),
    ...(profile.capabilities.figma
      ? ['', renderWiring('figmaImageStore', profile.capabilities.figma)]
      : []),
    '',
    'export const providerCapabilities = {',
    '  review: reviewAdapter,',
    ...(profile.capabilities.figma ? ['  figma: figmaImageStore,'] : []),
    '};',
    '',
  ].join('\n');

  const fields = [...(profile.env ?? [])].sort((a, b) => a.key.localeCompare(b.key));
  const envExample = fields
    .map((field) => `${field.key}=${field.secret ? '' : field.example ?? ''}`)
    .join('\n');
  const envLocal = fields
    .filter((field) => Object.prototype.hasOwnProperty.call(envValues, field.key))
    .map((field) => `${field.key}=${renderEnvValue(envValues[field.key])}`)
    .join('\n');

  return {
    source,
    envLocal: envLocal ? `${envLocal}\n` : '',
    envExample: envExample ? `${envExample}\n` : '',
    dependencies: { ...(profile.dependencies ?? {}) },
    capabilities: profile.capabilities.figma ? ['review', 'figma'] : ['review'],
  };
}

export function doctorProviderProfile(input: {
  profile: ProviderProfile;
  source: string;
  env: Record<string, string | undefined>;
}): ProviderDoctorResult {
  const { profile, source, env } = input;
  validateProviderProfile(profile);
  const diagnostics: ProviderDoctorDiagnostic[] = [
    { code: 'PROFILE_LOADED', severity: 'info', message: 'Provider profile loaded successfully.' },
  ];

  for (const field of [...(profile.env ?? [])].sort((a, b) => a.key.localeCompare(b.key))) {
    if (field.required && !env[field.key]) {
      diagnostics.push({
        code: 'PROFILE_ENV_MISSING',
        severity: 'blocker',
        message: `Required environment variable is missing: ${field.key}`,
      });
    }
  }

  const capabilities: ProviderCapability[] = ['review'];
  const wiring = [
    ['review', profile.capabilities.review] as const,
    ...(profile.capabilities.figma ? [['figma', profile.capabilities.figma] as const] : []),
  ];
  if (profile.capabilities.figma) capabilities.push('figma');

  for (const [capability, entry] of wiring) {
    if (!source.includes(entry.exportName)) {
      diagnostics.push({
        code: `PROFILE_${capability.toUpperCase()}_WIRING_MISSING`,
        severity: 'blocker',
        message: `${capability} capability wiring was not found.`,
      });
    }
  }

  for (const check of profile.doctorChecks ?? []) {
    if (check.sourceIncludes && !source.includes(check.sourceIncludes)) {
      diagnostics.push({ code: check.code, severity: 'warning', message: check.message });
    }
  }

  return {
    healthy: !diagnostics.some(({ severity }) => severity === 'blocker'),
    capabilities,
    diagnostics,
  };
}
