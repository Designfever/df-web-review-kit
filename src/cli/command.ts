import { InitCancelledError, resolveInitConfig } from './init-config';
import { createReadlineInitPrompt } from './init-prompt';
import { resolveProviderProfile } from './provider-install';

export const CLI_EXIT_CODE = {
  success: 0,
  failure: 1,
  cancelled: 130,
} as const;

export type CliIo = {
  stdout: (message: string) => void;
  stderr: (message: string) => void;
};

export type CliCommandContext = {
  args: string[];
  io: CliIo;
};

export type CliCommandHandler = (
  context: CliCommandContext
) => number | void | Promise<number | void>;

export type CliCommandHandlers = {
  init: CliCommandHandler;
  doctor: CliCommandHandler;
};

export class CliCancelledError extends Error {
  constructor(message = 'Operation cancelled.') {
    super(message);
    this.name = 'CliCancelledError';
  }
}

const HELP = `Usage: web-review-kit <command> [options]

Commands:
  init      Prepare a review-kit installation
  doctor    Diagnose an existing installation

Options:
  -h, --help     Show help
  -v, --version  Show version`;

const defaultHandlers: CliCommandHandlers = {
  init: async ({ args, io }) => {
    io.stdout('web-review-kit init');
    const interactive = !args.includes('--non-interactive');
    const promptSession = interactive
      ? createReadlineInitPrompt(process.stdin, process.stdout)
      : null;
    let config;
    try {
      config = await resolveInitConfig({ args, prompt: promptSession?.prompt });
    } catch (error) {
      if (error instanceof InitCancelledError) throw new CliCancelledError(error.message);
      throw error;
    } finally {
      promptSession?.close();
    }

    if (config.profile) {
      const profile = await resolveProviderProfile(config.profile);
      const capabilities = profile.capabilities.figma ? 'review, figma' : 'review';
      io.stdout(`Provider profile loaded (${capabilities}).`);
    }
    io.stdout(
      `Configuration ready: ${config.projectId} (${config.reviewStorage} review, ${config.figmaImageStore} Figma).`
    );
  },
  doctor: ({ io }) => {
    io.stdout('web-review-kit doctor');
    io.stdout('Doctor setup is ready. Diagnostics arrive in the next v0.9 step.');
  },
};

export async function runCli(
  args: string[],
  options: {
    io: CliIo;
    version: string;
    handlers?: Partial<CliCommandHandlers>;
  }
): Promise<number> {
  const { io, version } = options;
  const command = args[0];

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    io.stdout(HELP);
    return CLI_EXIT_CODE.success;
  }

  if (command === '--version' || command === '-v' || command === 'version') {
    io.stdout(version);
    return CLI_EXIT_CODE.success;
  }

  if (command !== 'init' && command !== 'doctor') {
    io.stderr(`Unknown command: ${command}`);
    io.stderr('Run web-review-kit --help to see available commands.');
    return CLI_EXIT_CODE.failure;
  }

  const handler = options.handlers?.[command] ?? defaultHandlers[command];

  try {
    const result = await handler({ args: args.slice(1), io });
    return result ?? CLI_EXIT_CODE.success;
  } catch (error) {
    if (error instanceof CliCancelledError) {
      io.stderr(error.message);
      return CLI_EXIT_CODE.cancelled;
    }

    io.stderr(error instanceof Error ? error.message : String(error));
    return CLI_EXIT_CODE.failure;
  }
}
