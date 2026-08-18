# Easy Install Preview

> **v0.9 preview:** the CLI, generated files, config schema, provider profile schema, and diagnostic codes may change before v1.0. Review every diff before applying it and pin the package version in automated workflows.

The easy installer currently targets React 18+ and Vite 5+ JavaScript or TypeScript projects with a detectable npm, pnpm, or Yarn package manager. When stale lockfiles coexist, an explicit `packageManager` field in `package.json` selects the owner.

## New Project: 10-Minute Quick Start

Run this from the React + Vite host root:

```bash
npx @designfever/web-review-kit@0.9 init \
  --non-interactive \
  --project-id my-project \
  --project-name "My Project" \
  --review-storage local \
  --figma-image-store none \
  --source-locator \
  --dry-run
```

The first command is read-only. It scans the host and prints the exact files and Vite/environment changes it would make. Resolve every blocker and review the diff, then apply the same normalized answers:

```bash
npx @designfever/web-review-kit@0.9 init \
  --non-interactive \
  --project-id my-project \
  --project-name "My Project" \
  --review-storage local \
  --figma-image-store none \
  --source-locator \
  --yes
```

Install the dependencies listed by the plan with the host package manager. The CLI deliberately does not rewrite `package.json` or run a package manager. Then verify:

```bash
npx @designfever/web-review-kit@0.9 doctor
npm run build
```

Replace the final command with the host's normal build command. Open `/review/` through the Vite dev server after the build passes.

Without `--non-interactive`, `init` asks for the same values and still shows the plan before confirmation. For CI or a reproducible setup, use the flags above or a checked-in secret-free JSON config with `--config <path>`.

## Keep the Package Current

Run the bundled check before the host dev command:

```json
{
  "scripts": {
    "dev": "web-review-kit check && vite"
  }
}
```

`check` detects npm, pnpm, or Yarn from the lockfile or the explicit
`packageManager` field and asks before running that package manager's
exact-version update command. Declining the prompt, using a
local `link:`, `file:`, or `workspace:` dependency, failing the registry check,
or running non-interactively leaves the host unchanged and does not block the
dev command.

## Existing Project: Diagnose First

Diagnosis is read-only by default:

```bash
npx @designfever/web-review-kit@0.9 doctor
npx @designfever/web-review-kit@0.9 doctor --json
```

Exit codes are:

- `0`: healthy;
- `2`: warnings only;
- `1`: blocker, invalid input, conflict, or failed operation.

Diagnostics contain `severity`, stable `code`, `message`, and `fixHint`. Environment diagnostics expose key names only, never values.

## Safe Migration

Preview a recognized legacy local integration:

```bash
npx @designfever/web-review-kit@0.9 doctor --fix
```

`--fix` alone does not modify the host. It prints the doctor result, migration diff, and planned backup directory. Apply only after reviewing that output:

```bash
npx @designfever/web-review-kit@0.9 doctor --fix --yes
```

Before changing host files, the CLI stores a manifest and copies every replaced file under:

```text
.web-review-kit/backups/<migration-id>/
```

The migration is deterministic and idempotent: running it again produces no additional diff. Automatic migration is intentionally narrow. Custom adapter options, host callbacks, multiple legacy entries, unrecognized Vite syntax, or user-owned generated paths are blockers and remain untouched. Follow the diagnostic fix hint and migrate those cases manually.

Rollback is currently manifest-backed rather than exposed as a stable CLI command. To restore a migration during v0.9, use version control or restore the files listed in `manifest.json` from the matching backup's `before/` directory; remove paths whose manifest entry has `"existed": false`. Keep the backup until the host build and `/review/` route are verified.

## Host-Owned Custom Adapter and Store

Choose `custom` to create editable source files inside the host project without a provider package:

```bash
npx @designfever/web-review-kit@0.9 init \
  --non-interactive \
  --project-id my-project \
  --project-name "My Project" \
  --review-storage custom \
  --figma-image-store custom \
  --no-source-locator \
  --dry-run
```

The plan creates:

- `src/review/custom.review.tsx`: a host-owned bootstrap that can mount a host-specific login/project/page gate or immediately resolve a custom adapter;
- `src/review/custom.figma.store.ts`: a host-owned `ReviewFigmaImageStore` implementation;
- generated config and entry files that wire those exports into Review Shell.

The two custom files are created once and never overwritten on rerun. Their initial TODO markers make `doctor` fail until the host implementation is complete.

## Provider Profile

A custom backend belongs in a host-owned or separately published provider package. The public installer accepts only a generic declarative profile:

```bash
npx @designfever/web-review-kit@0.9 init \
  --non-interactive \
  --project-id my-project \
  --project-name "My Project" \
  --review-storage profile \
  --figma-image-store none \
  --no-source-locator \
  --profile ./review-profile.mjs \
  --dry-run
```

Minimal profile:

```js
export default {
  schemaVersion: 1,
  capabilities: {
    review: {
      module: '@example/review-provider',
      exportName: 'createReviewAdapter',
      options: {
        projectId: { env: 'VITE_EXAMPLE_PROJECT_ID' },
      },
    },
  },
  env: [
    {
      key: 'VITE_EXAMPLE_PROJECT_ID',
      secret: false,
      required: true,
      example: 'my-project',
    },
  ],
  dependencies: {
    '@example/review-provider': '^1.0.0',
  },
};
```

`profile` is different from `custom`: it loads a separately published package or module instead of creating host-owned implementation files. The default factory returns a compatible `ReviewShellAdapter`. A provider that needs login and project/page selection sets `mode: 'bootstrap'` and returns a `ReviewProviderBootstrap` instead. The generated entry waits for the bootstrap to resolve adapters before mounting Review Shell.

```js
export default {
  schemaVersion: 1,
  capabilities: {
    review: {
      mode: 'bootstrap',
      module: '@example/review-provider',
      exportName: 'createReviewBootstrap',
      options: {
        endpoint: { env: 'VITE_EXAMPLE_REVIEW_URL' },
      },
    },
  },
  env: [
    {
      key: 'VITE_EXAMPLE_REVIEW_URL',
      secret: false,
      required: true,
      example: '/api/review',
    },
  ],
};
```

Figma image storage is a separate optional capability. Custom runtime Figma stores do not require a Vite plugin. See [Custom Provider Profiles](provider-profiles.md) for the typed schema and review-plus-Figma example.

## Security and Conflict Rules

- Never pass secrets as CLI arguments or put them in installer JSON.
- Generated source contains environment references, not secret values.
- `.env.example` contains names and blank/example values only.
- Any `VITE_` variable is client-visible; do not use it for server credentials or admin keys.
- Profile validation rejects `VITE_` secrets and any secret referenced by browser wiring.
- Host-owned custom scaffolds contain explicit TODO markers, and `doctor` blocks until they are implemented.
- Installer reruns never overwrite host-owned custom adapter/store files.
- `init --dry-run`, plain `doctor`, and `doctor --fix` are read-only.
- `init --yes` and `doctor --fix --yes` apply a previously displayed plan.
- A file changed after preview makes the plan stale and blocks every write.
- Existing generated-path files without the installer header are user-owned conflicts and are never overwritten.
- Unknown project structures and host-specific customizations are blockers, not guesses.

## Before Promoting to v1.0

Use the detailed [v1.0 Promotion Checklist](v1.0-promotion-checklist.md). v1.0 requires the packed synthetic matrix, two real-host migrations, docs/implementation parity, security review, and an explicit freeze of the CLI/config/profile/diagnostic contracts.
