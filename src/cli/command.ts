import {
  formatDoctorResult,
  parseDoctorArgs,
  runDoctor,
} from './doctor';
import {
  InitCancelledError,
  resolveInitConfig,
} from './init-config';
import {
  applyInstallPlan,
  createInstallPlan,
  formatInstallPlan,
} from './install-generator';
import { createReadlineInitPrompt } from './init-prompt';
import {
  applyMigrationPlan,
  createMigrationPlan,
  formatMigrationPlan,
} from './migration';
import {
  createPackageInstallCommand,
  installPackage,
} from './package-manager';
import { scanProject, type ReviewHostFramework } from './preflight';
import { isLocalDependencySpec } from './version.check';
import { runVersionCheck } from './version.check';

export const CLI_EXIT_CODE = {
  success: 0,
  failure: 1,
  cancelled: 130,
} as const;

export type CliIo = {
  stdout: (message: string) => void;
  stderr: (message: string) => void;
};

type CliCommandContext = {
  args: string[];
  io: CliIo;
  version: string;
};

type CliCommandHandler = (
  context: CliCommandContext
) => number | void | Promise<number | void>;

type CliCommandHandlers = {
  init: CliCommandHandler;
  doctor: CliCommandHandler;
  check: CliCommandHandler;
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
  check     Check for a newer package version

Options:
  -h, --help     Show help
  -v, --version  Show version`;

const REVIEW_PAGE_GUIDES: Record<
  ReviewHostFramework,
  { label: string; file: string }
> = {
  'nextjs-app-router': {
    label: 'Next.js App Router',
    file: 'nextjs-app-router.md',
  },
  'vite-react': { label: 'Vite + React', file: 'vite-react.md' },
  'vue-router': { label: 'Vue Router', file: 'vue-router.md' },
  custom: { label: 'Custom', file: 'custom.md' },
};

export function getReviewPageGuide(
  framework: ReviewHostFramework,
  version: string
) {
  const guide = REVIEW_PAGE_GUIDES[framework];
  const ref = version.includes('-') ? 'main' : `v${version}`;
  return {
    framework: guide.label,
    url: `https://github.com/Designfever/df-web-review-kit/blob/${ref}/docs/review-page/${guide.file}`,
  };
}

function printReviewPageGuide(
  io: CliIo,
  framework: ReviewHostFramework,
  version: string
) {
  const guide = getReviewPageGuide(framework, version);
  io.stdout('Create /review manually. The CLI does not modify host routes.');
  io.stdout(`Detected framework: ${guide.framework}`);
  io.stdout(`Guide: ${guide.url}`);
}

const defaultHandlers: CliCommandHandlers = {
  init: async ({ args, io, version }) => {
    io.stdout('web-review-kit init');
    const interactive = !args.includes('--non-interactive');
    const dryRun = args.includes('--dry-run');
    const promptSession = interactive
      ? createReadlineInitPrompt(process.stdin, process.stdout)
      : null;
    try {
      const config = await resolveInitConfig({ args, prompt: promptSession?.prompt });
      const root = process.cwd();
      const preflight = await scanProject(root);
      const plan = await createInstallPlan({
        root,
        config,
        preflight,
        packageVersion: `^${version}`,
      });
      const currentSpec = preflight.dependencies.reviewKit;
      const shouldInstallPackage = !currentSpec || !isLocalDependencySpec(currentSpec);
      const packageInstall = shouldInstallPackage && preflight.packageManager
        ? createPackageInstallCommand(
            preflight.packageManager,
            '@designfever/web-review-kit',
            version
          )
        : null;
      io.stdout(formatInstallPlan(plan));
      if (packageInstall) {
        io.stdout(`Install package: ${packageInstall.command} ${packageInstall.args.join(' ')}`);
      } else if (!currentSpec) {
        io.stdout('Install package manually: @designfever/web-review-kit');
      }
      if (dryRun || (plan.changes.length === 0 && !packageInstall)) {
        printReviewPageGuide(io, preflight.framework, version);
        return;
      }

      let approved = args.includes('--yes');
      if (!approved && promptSession) {
        const answer = await promptSession.prompt.confirm({
          message: 'Apply this installation plan?',
          defaultValue: false,
        });
        if (answer === null) throw new InitCancelledError();
        approved = answer;
      }
      if (!approved) {
        throw new InitCancelledError(
          interactive
            ? 'Initialization cancelled.'
            : 'Use --dry-run to preview or --yes to apply non-interactively.'
        );
      }

      if (!currentSpec && !packageInstall) {
        throw new Error(
          'INSTALL_PACKAGE_MANAGER_REQUIRED: declare packageManager or keep one npm, pnpm, or Yarn lockfile.'
        );
      }
      if (packageInstall) {
        io.stdout(`Installing @designfever/web-review-kit@${version}...`);
        await installPackage(root, packageInstall);
      }
      await applyInstallPlan(plan);
      io.stdout(`Applied ${plan.changes.length} file change(s).`);
      printReviewPageGuide(io, preflight.framework, version);
    } catch (error) {
      if (error instanceof InitCancelledError) throw new CliCancelledError(error.message);
      throw error;
    } finally {
      promptSession?.close();
    }
  },
  doctor: async ({ args, io }) => {
    const options = parseDoctorArgs(args);
    const root = process.cwd();
    let result = await runDoctor({ root, profileSpecifier: options.profileSpecifier });
    if (!options.fix) {
      io.stdout(options.json ? JSON.stringify(result, null, 2) : formatDoctorResult(result));
      return result.exitCode;
    }

    const migration = await createMigrationPlan(root);
    if (options.json) {
      io.stdout(JSON.stringify({ doctor: result, migration }, null, 2));
    } else {
      io.stdout(formatDoctorResult(result));
      io.stdout(formatMigrationPlan(migration));
    }
    if (migration.blockers.length) return CLI_EXIT_CODE.failure;
    if (!migration.changes.length || !options.yes) return result.exitCode;

    const backupPath = await applyMigrationPlan(migration);
    io.stdout(`Applied ${migration.changes.length} migration change(s). Backup: ${backupPath}`);
    result = await runDoctor({ root, profileSpecifier: options.profileSpecifier });
    return result.exitCode;
  },
  check: ({ io }) =>
    runVersionCheck({
      log: io.stdout,
      warn: io.stderr,
    }),
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

  if (command !== 'init' && command !== 'doctor' && command !== 'check') {
    io.stderr(`Unknown command: ${command}`);
    io.stderr('Run web-review-kit --help to see available commands.');
    return CLI_EXIT_CODE.failure;
  }

  const handler = options.handlers?.[command] ?? defaultHandlers[command];

  try {
    const result = await handler({ args: args.slice(1), io, version });
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
