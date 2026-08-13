#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { runCli, type CliIo } from './cli/command';

const io: CliIo = {
  stdout: (message) => console.log(message),
  stderr: (message) => console.error(message),
};

async function readPackageVersion() {
  const packageUrl = new URL('../package.json', import.meta.url);
  const packageJson = JSON.parse(
    await readFile(fileURLToPath(packageUrl), 'utf8')
  ) as { version?: unknown };

  if (typeof packageJson.version !== 'string') {
    throw new Error('Package version is unavailable.');
  }

  return packageJson.version;
}

async function main() {
  const version = await readPackageVersion();
  process.exitCode = await runCli(process.argv.slice(2), { io, version });
}

main().catch((error) => {
  io.stderr(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
