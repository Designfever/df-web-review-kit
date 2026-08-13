import { createInterface } from 'node:readline/promises';
import type { Readable, Writable } from 'node:stream';
import type { InitPrompt } from './init-config';

export function createReadlineInitPrompt(input: Readable, output: Writable): {
  prompt: InitPrompt;
  close: () => void;
} {
  const readline = createInterface({ input, output });

  async function ask(message: string) {
    try {
      return await readline.question(message);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ABORT_ERR') return null;
      throw error;
    }
  }

  const prompt: InitPrompt = {
    async text({ message, defaultValue }) {
      const suffix = defaultValue ? ` (${defaultValue})` : '';
      const answer = await ask(`${message}${suffix}: `);
      if (answer === null) return null;
      return answer.trim() || defaultValue || '';
    },
    async select<T extends string>({
      message,
      choices,
      defaultValue,
    }: {
      message: string;
      choices: readonly T[];
      defaultValue: T;
    }): Promise<T | null> {
      const answer = await ask(`${message} [${choices.join('/')}] (${defaultValue}): `);
      if (answer === null) return null;
      const value = answer.trim() || defaultValue;
      if (!choices.includes(value as T)) {
        throw new Error(`${message} must be one of: ${choices.join(', ')}.`);
      }
      return value as T;
    },
    async confirm({ message, defaultValue }) {
      const answer = await ask(`${message} [${defaultValue ? 'Y/n' : 'y/N'}]: `);
      if (answer === null) return null;
      const value = answer.trim().toLowerCase();
      if (!value) return defaultValue;
      if (value === 'y' || value === 'yes') return true;
      if (value === 'n' || value === 'no') return false;
      throw new Error(`${message} expects yes or no.`);
    },
  };

  return { prompt, close: () => readline.close() };
}
