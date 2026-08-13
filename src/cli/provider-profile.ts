export type ProviderCapability = 'review' | 'figma';

export type ProviderQuestion = {
  key: string;
  message: string;
  envKey?: string;
  required?: boolean;
};

export type ProviderEnvField = {
  key: string;
  secret: boolean;
  required?: boolean;
  description?: string;
  example?: string;
};

export type ProviderWiring = {
  module: string;
  exportName: string;
  options?: Record<string, { env: string } | string | boolean | number>;
};

export type ProviderDoctorCheck = {
  code: string;
  message: string;
  capability?: ProviderCapability;
  sourceIncludes?: string;
};

export type ProviderProfile = {
  schemaVersion: 1;
  capabilities: {
    review: ProviderWiring;
    figma?: ProviderWiring;
  };
  questions?: ProviderQuestion[];
  env?: ProviderEnvField[];
  dependencies?: Record<string, string>;
  doctorChecks?: ProviderDoctorCheck[];
};

const ENV_KEY = /^[A-Z][A-Z0-9_]*$/;
const PROFILE_EXPORT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function defineProviderProfile(profile: ProviderProfile): ProviderProfile {
  validateProviderProfile(profile);
  return profile;
}

export function validateProviderProfile(value: unknown): asserts value is ProviderProfile {
  if (!value || typeof value !== 'object') throw new Error('Provider profile must be an object.');
  const profile = value as Partial<ProviderProfile>;
  if (profile.schemaVersion !== 1) throw new Error('Unsupported provider profile schemaVersion.');
  if (!profile.capabilities?.review) throw new Error('Provider profile must declare review wiring.');

  const wirings = [profile.capabilities.review, profile.capabilities.figma].filter(
    (entry): entry is ProviderWiring => Boolean(entry)
  );
  for (const wiring of wirings) {
    if (!wiring.module || !wiring.exportName || !PROFILE_EXPORT.test(wiring.exportName)) {
      throw new Error('Provider wiring requires a module and valid exportName.');
    }
  }

  const envKeys = new Set<string>();
  for (const field of profile.env ?? []) {
    if (!ENV_KEY.test(field.key)) throw new Error(`Invalid provider env key: ${field.key}`);
    if (envKeys.has(field.key)) throw new Error(`Duplicate provider env key: ${field.key}`);
    if (field.secret && field.example) {
      throw new Error(`Secret env field ${field.key} cannot declare an example value.`);
    }
    envKeys.add(field.key);
  }

  const questionKeys = new Set<string>();
  for (const question of profile.questions ?? []) {
    if (!question.key || !question.message) throw new Error('Provider questions require key and message.');
    if (questionKeys.has(question.key)) throw new Error(`Duplicate provider question: ${question.key}`);
    if (question.envKey && !envKeys.has(question.envKey)) {
      throw new Error(`Question ${question.key} references undeclared env key ${question.envKey}.`);
    }
    questionKeys.add(question.key);
  }

  for (const wiring of wirings) {
    for (const option of Object.values(wiring.options ?? {})) {
      if (typeof option === 'object' && !envKeys.has(option.env)) {
        throw new Error(`Provider wiring references undeclared env key ${option.env}.`);
      }
    }
  }

  const doctorCodes = new Set<string>();
  for (const check of profile.doctorChecks ?? []) {
    if (!check.code || !check.message) throw new Error('Provider doctor checks require code and message.');
    if (doctorCodes.has(check.code)) throw new Error(`Duplicate provider doctor code: ${check.code}`);
    if (check.capability && !profile.capabilities[check.capability]) {
      throw new Error(`Doctor check ${check.code} references an unavailable capability.`);
    }
    doctorCodes.add(check.code);
  }
}
