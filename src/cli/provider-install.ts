import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  validateProviderProfile,
  type ProviderCapability,
  type ProviderProfile,
  type ProviderReviewMode,
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
  reviewMode: ProviderReviewMode;
};

type ProviderDoctorDiagnostic = {
  code: string;
  severity: 'info' | 'warning' | 'blocker';
  message: string;
};

export type ProviderDoctorResult = {
  healthy: boolean;
  capabilities: ProviderCapability[];
  diagnostics: ProviderDoctorDiagnostic[];
};

function getDeclaredCapabilities(profile: ProviderProfile): ProviderCapability[] {
  return profile.capabilities.figma ? ['review', 'figma'] : ['review'];
}

function getSelectedEnvKeys(
  profile: ProviderProfile,
  capabilities: ProviderCapability[]
) {
  const keys = new Set<string>();
  for (const capability of capabilities) {
    const wiring = profile.capabilities[capability];
    for (const option of Object.values(wiring?.options ?? {})) {
      if (typeof option === 'object') keys.add(option.env);
    }
  }
  return keys;
}

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
  envValues: Record<string, string> = {},
  selectedCapabilities: ProviderCapability[] = getDeclaredCapabilities(profile)
): ProviderArtifacts {
  validateProviderProfile(profile);
  const capabilities = [...new Set(selectedCapabilities)];
  if (!capabilities.length) throw new Error('Provider artifacts require a selected capability.');
  for (const capability of capabilities) {
    if (!profile.capabilities[capability]) {
      throw new Error(`Provider profile does not declare ${capability} capability.`);
    }
  }
  const reviewMode = profile.capabilities.review.mode ?? 'adapter';
  const includesReview = capabilities.includes('review');
  const includesFigma = capabilities.includes('figma');
  const imports = new Map<string, Set<string>>();
  const addImport = (wiring: ProviderWiring) => {
    const exports = imports.get(wiring.module) ?? new Set<string>();
    exports.add(wiring.exportName);
    imports.set(wiring.module, exports);
  };
  if (includesReview) addImport(profile.capabilities.review);
  if (includesFigma && profile.capabilities.figma) addImport(profile.capabilities.figma);

  const source = [
    '// Generated provider wiring. Browser code receives public configuration only.',
    `// Provider capabilities selected: ${capabilities.join(', ')}`,
    ...[...imports.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, exports]) => `import { ${[...exports].sort().join(', ')} } from ${JSON.stringify(module)};`),
    '',
    ...(includesReview ? [renderWiring('providerReview', profile.capabilities.review)] : []),
    ...(includesFigma && profile.capabilities.figma
      ? ['', renderWiring('providerFigma', profile.capabilities.figma)]
      : []),
    '',
    'export const providerCapabilities = {',
    ...(includesReview ? ['  review: providerReview,'] : []),
    ...(includesFigma ? ['  figma: providerFigma,'] : []),
    '};',
    '',
  ].join('\n');

  const declaredCapabilities = getDeclaredCapabilities(profile);
  const selectedEnvKeys = getSelectedEnvKeys(profile, capabilities);
  const fields = [...(profile.env ?? [])]
    .filter(
      (field) =>
        capabilities.length === declaredCapabilities.length || selectedEnvKeys.has(field.key)
    )
    .sort((a, b) => a.key.localeCompare(b.key));
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
    capabilities,
    reviewMode,
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

  const marker = /Provider capabilities selected: ([^\n]+)/.exec(source);
  const markedCapabilities = marker
    ? marker[1]
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry): entry is ProviderCapability => entry === 'review' || entry === 'figma')
    : [];
  const capabilities = markedCapabilities.length
    ? markedCapabilities
    : getDeclaredCapabilities(profile);
  const declaredCapabilities = getDeclaredCapabilities(profile);
  const selectedEnvKeys = getSelectedEnvKeys(profile, capabilities);

  for (const field of [...(profile.env ?? [])]
    .filter(
      (entry) =>
        capabilities.length === declaredCapabilities.length || selectedEnvKeys.has(entry.key)
    )
    .sort((a, b) => a.key.localeCompare(b.key))) {
    if (field.required && !env[field.key]) {
      diagnostics.push({
        code: 'PROFILE_ENV_MISSING',
        severity: 'blocker',
        message: `Required environment variable is missing: ${field.key}`,
      });
    }
  }

  const wiring = capabilities.map(
    (capability) => [capability, profile.capabilities[capability]] as const
  );

  for (const [capability, entry] of wiring) {
    if (!entry || !source.includes(entry.exportName)) {
      diagnostics.push({
        code: `PROFILE_${capability.toUpperCase()}_WIRING_MISSING`,
        severity: 'blocker',
        message: `${capability} capability wiring was not found.`,
      });
    }
  }

  for (const check of profile.doctorChecks ?? []) {
    if (check.capability && !capabilities.includes(check.capability)) continue;
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
