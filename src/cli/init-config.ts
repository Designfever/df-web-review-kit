import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

export type InitAnswers = {
  projectId: string;
  projectName: string;
};

export type InitConfig = InitAnswers & {
  schemaVersion: 2;
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
const INIT_ANSWER_KEYS = new Set(['projectId', 'projectName']);
const VALUE_FLAGS = new Set(['--project-id', '--project-name', '--config']);
const BOOLEAN_FLAGS = new Set(['--non-interactive', '--dry-run', '--yes']);

function requireValue(args: string[], index: number, flag: string) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value.`);
  return value;
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
      if (flag === '--non-interactive') nonInteractive = true;
      continue;
    }

    const value = requireValue(args, index, flag);
    index += 1;
    if (flag === '--project-id') values.projectId = value;
    if (flag === '--project-name') values.projectName = value;
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
}

export function createInitConfig(answers: InitAnswers): InitConfig {
  validateInitAnswers(answers);
  return { schemaVersion: 2, ...answers };
}

async function loadInitConfig(path: string, cwd = process.cwd()): Promise<InitConfig> {
  const absolutePath = isAbsolute(path) ? path : resolve(cwd, path);
  const parsed = JSON.parse(await readFile(absolutePath, 'utf8')) as Partial<InitConfig>;
  if (parsed.schemaVersion !== 2) throw new Error('Unsupported init config schemaVersion.');
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
  const answers = { projectId, projectName };
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
  const merged: Partial<InitAnswers> = {
    ...(fromFile
      ? { projectId: fromFile.projectId, projectName: fromFile.projectName }
      : {}),
    ...parsed.values,
  };

  if (parsed.nonInteractive || !input.prompt) {
    validateInitAnswers(merged);
    return createInitConfig(merged);
  }
  return createInitConfig(await promptInitAnswers(merged, input.prompt));
}
