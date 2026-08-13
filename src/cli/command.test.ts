import { describe, expect, it, vi } from 'vitest';
import {
  CLI_EXIT_CODE,
  CliCancelledError,
  runCli,
  type CliIo,
} from './command';

function createIo() {
  const stdout = vi.fn<(message: string) => void>();
  const stderr = vi.fn<(message: string) => void>();

  return {
    io: { stdout, stderr } satisfies CliIo,
    stdout,
    stderr,
  };
}

describe('runCli', () => {
  it('shows help when no command is provided', async () => {
    const { io, stdout } = createIo();

    await expect(runCli([], { io, version: '0.9.0' })).resolves.toBe(
      CLI_EXIT_CODE.success
    );
    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('init'));
    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('doctor'));
  });

  it('prints the package version', async () => {
    const { io, stdout } = createIo();

    await expect(
      runCli(['--version'], { io, version: '0.9.0' })
    ).resolves.toBe(CLI_EXIT_CODE.success);
    expect(stdout).toHaveBeenCalledWith('0.9.0');
  });

  it.each(['init', 'doctor'] as const)(
    'routes %s arguments through the injected command boundary',
    async (command) => {
      const { io } = createIo();
      const handler = vi.fn(() => CLI_EXIT_CODE.success);

      await expect(
        runCli([command, '--dry-run'], {
          io,
          version: '0.9.0',
          handlers: { [command]: handler },
        })
      ).resolves.toBe(CLI_EXIT_CODE.success);
      expect(handler).toHaveBeenCalledWith({ args: ['--dry-run'], io });
    }
  );

  it('returns a failure for unknown commands', async () => {
    const { io, stderr } = createIo();

    await expect(
      runCli(['unknown'], { io, version: '0.9.0' })
    ).resolves.toBe(CLI_EXIT_CODE.failure);
    expect(stderr).toHaveBeenCalledWith('Unknown command: unknown');
  });

  it('uses a distinct cancellation exit code', async () => {
    const { io, stderr } = createIo();

    await expect(
      runCli(['init'], {
        io,
        version: '0.9.0',
        handlers: {
          init: () => {
            throw new CliCancelledError('Cancelled by user.');
          },
        },
      })
    ).resolves.toBe(CLI_EXIT_CODE.cancelled);
    expect(stderr).toHaveBeenCalledWith('Cancelled by user.');
  });

  it('reports command errors without exposing a stack trace', async () => {
    const { io, stderr } = createIo();

    await expect(
      runCli(['doctor'], {
        io,
        version: '0.9.0',
        handlers: {
          doctor: () => {
            throw new Error('Project scan failed.');
          },
        },
      })
    ).resolves.toBe(CLI_EXIT_CODE.failure);
    expect(stderr).toHaveBeenCalledWith('Project scan failed.');
  });
});
