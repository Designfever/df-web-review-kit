import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

export type InitReviewStorage = 'local' | 'custom' | 'profile';
export type InitFigmaImageStore = 'none' | 'local' | 'custom' | 'profile';

export type InitAnswers = {
  projectId: string;
  projectName: string;
  reviewStorage: InitReviewStorage;
  figmaImageStore: InitFigmaImageStore;
  sourceLocator: boolean;
  profile: string | null;
};

export type InitConfig = InitAnswers & {
  schemaVersion: 1;
};

export type InitPrompt = {
  text(input: { message: string; defaultValue?: string }): Promise<string | null>;
  select<T extends string>(input: {
    message: string;
    choices: readonly T[];
    defaultValue: T;
  }): Promise<T | null>;
  confirm(input: { message: string; defaultValue: boolean }): Promise<boolean | null>;
};

export class InitCancelledError extends Error {
  constructor(message = 'Initialization cancelled.') {
    super(message);
    this.name = 'InitCancelledError';
  }
}

export type ParsedInitInput = {
  values: Partial<InitAnswers>;
  configPath: string | null;
  nonInteractive: boolean;
};

const PROJECT_ID = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const INIT_ANSWER_KEYS = new Set([
  'projectId',
  'projectName',
  'reviewStorage',
  'figmaImageStore',
  'sourceLocator',
  'profile',
]);
const VALUE_FLAGS = new Set([
  '--project-id',
  '--project-name',
  '--review-storage',
  '--figma-image-store',
  '--profile',
  '--config',
]);
const BOOLEAN_FLAGS = new Set([
  '--source-locator',
  '--no-source-locator',
  '--non-interactive',
  '--dry-run',
  '--yes',
]);
const REVIEW_STORAGE_CHOICES = ['local', 'custom', 'profile'] as const;
const FIGMA_IMAGE_STORE_CHOICES = ['none', 'local', 'custom', 'profile'] as const;

export function usesProviderProfile(
  answers: Partial<Pick<InitAnswers, 'reviewStorage' | 'figmaImageStore'>>
) {
  return answers.reviewStorage === 'profile' || answers.figmaImageStore === 'profile';
}

function requireValue(args: string[], index: number, flag: string) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value.`);
  return value;
}

function parseChoice<T extends string>(value: string, choices: readonly T[], flag: string): T {
  if (!choices.includes(value as T)) {
    throw new Error(`${flag} must be one of: ${choices.join(', ')}.`);
  }
  return value as T;
}

export function parseInitArgs(args: string[]): ParsedInitInput {
  const values: Partial<InitAnswers> = {};
  let configPath: string | null = null;
  let nonInteractive = false;

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!VALUE_FLAGS.has(flag) && !BOOLEAN_FLAGS.has(flag)) {
      throw new Error(`Unknown init option: ${flag}`);
    }

    if (BOOLEAN_FLAGS.has(flag)) {
      if (flag === '--source-locator') values.sourceLocator = true;
      if (flag === '--no-source-locator') values.sourceLocator = false;
      if (flag === '--non-interactive') nonInteractive = true;
      continue;
    }

    const value = requireValue(args, index, flag);
    index += 1;
    if (flag === '--project-id') values.projectId = value;
    if (flag === '--project-name') values.projectName = value;
    if (flag === '--review-storage') {
      values.reviewStorage = parseChoice(value, REVIEW_STORAGE_CHOICES, flag);
    }
    if (flag === '--figma-image-store') {
      values.figmaImageStore = parseChoice(value, FIGMA_IMAGE_STORE_CHOICES, flag);
    }
    if (flag === '--profile') values.profile = value;
    if (flag === '--config') configPath = value;
  }

  return { values, configPath, nonInteractive };
}

export function validateInitAnswers(value: unknown): asserts value is InitAnswers {
  if (!value || typeof value !== 'object') throw new Error('Init configuration must be an object.');
  const answers = value as Partial<InitAnswers>;
  if (!answers.projectId || !PROJECT_ID.test(answers.projectId)) {
    throw new Error('projectId must use lowercase letters, numbers, dots, underscores, or hyphens.');
  }
  if (!answers.projectName?.trim()) throw new Error('projectName is required.');
  if (!REVIEW_STORAGE_CHOICES.includes(answers.reviewStorage as InitReviewStorage)) {
    throw new Error('reviewStorage must be local, custom, or profile.');
  }
  if (!FIGMA_IMAGE_STORE_CHOICES.includes(answers.figmaImageStore as InitFigmaImageStore)) {
    throw new Error('figmaImageStore must be none, local, custom, or profile.');
  }
  if (typeof answers.sourceLocator !== 'boolean') throw new Error('sourceLocator must be boolean.');
  if (answers.profile !== null && typeof answers.profile !== 'string') {
    throw new Error('profile must be a package/module specifier or null.');
  }
  if (
    usesProviderProfile(answers) &&
    !answers.profile
  ) {
    throw new Error('A provider profile is required for profile capabilities.');
  }
}

export function createInitConfig(answers: InitAnswers): InitConfig {
  validateInitAnswers(answers);
  return { schemaVersion: 1, ...answers };
}

async function loadInitConfig(path: string, cwd = process.cwd()): Promise<InitConfig> {
  const absolutePath = isAbsolute(path) ? path : resolve(cwd, path);
  const parsed = JSON.parse(await readFile(absolutePath, 'utf8')) as Partial<InitConfig>;
  if (parsed.schemaVersion !== 1) throw new Error('Unsupported init config schemaVersion.');
  const unknownKeys = Object.keys(parsed).filter(
    (key) => key !== 'schemaVersion' && !INIT_ANSWER_KEYS.has(key)
  );
  if (unknownKeys.length) {
    throw new Error(`Unknown init config field: ${unknownKeys.sort().join(', ')}.`);
  }
  validateInitAnswers(parsed);
  return createInitConfig(parsed);
}

function cancelled<T>(value: T | null): T {
  if (value === null) throw new InitCancelledError();
  return value;
}

export async function promptInitAnswers(
  initial: Partial<InitAnswers>,
  prompt: InitPrompt
): Promise<InitAnswers> {
  const projectId = initial.projectId ?? cancelled(await prompt.text({ message: 'Project ID' }));
  const projectName =
    initial.projectName ??
    cancelled(await prompt.text({ message: 'Project name', defaultValue: projectId }));
  const reviewStorage: InitReviewStorage =
    initial.reviewStorage ??
    cancelled(
      await prompt.select<InitReviewStorage>({
        message: 'Review storage (custom creates a host-owned adapter)',
        choices: REVIEW_STORAGE_CHOICES,
        defaultValue: 'local',
      })
    );
  const figmaImageStore: InitFigmaImageStore =
    initial.figmaImageStore ??
    cancelled(
      await prompt.select<InitFigmaImageStore>({
        message: 'Figma image store (custom creates a host-owned store)',
        choices: FIGMA_IMAGE_STORE_CHOICES,
        defaultValue: 'none',
      })
    );
  const sourceLocator =
    initial.sourceLocator ??
    cancelled(await prompt.confirm({ message: 'Enable source locator?', defaultValue: true }));
  const needsProfile = usesProviderProfile({ reviewStorage, figmaImageStore });
  const profile = needsProfile
    ? initial.profile ?? cancelled(await prompt.text({ message: 'Provider profile package or path' }))
    : initial.profile ?? null;

  const answers = { projectId, projectName, reviewStorage, figmaImageStore, sourceLocator, profile };
  validateInitAnswers(answers);
  return answers;
}

export async function resolveInitConfig(input: {
  args: string[];
  cwd?: string;
  prompt?: InitPrompt;
}): Promise<InitConfig> {
  const parsed = parseInitArgs(input.args);
  const fromFile = parsed.configPath
    ? await loadInitConfig(parsed.configPath, input.cwd)
    : undefined;
  const merged: Partial<InitAnswers> = fromFile
    ? {
        projectId: fromFile.projectId,
        projectName: fromFile.projectName,
        reviewStorage: fromFile.reviewStorage,
        figmaImageStore: fromFile.figmaImageStore,
        sourceLocator: fromFile.sourceLocator,
        profile: fromFile.profile,
        ...parsed.values,
      }
    : parsed.values;

  if (parsed.nonInteractive || !input.prompt) {
    const answers = { ...merged, profile: merged.profile ?? null };
    validateInitAnswers(answers);
    return createInitConfig(answers);
  }

  return createInitConfig(await promptInitAnswers(merged, input.prompt));
}
