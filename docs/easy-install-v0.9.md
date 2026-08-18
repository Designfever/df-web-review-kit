# Easy Install v0.9 Contract

Status: implementation contract for the experimental v0.9 installer

Target: stabilize this contract for v1.0

## Goal

A React + Vite host should be able to add a working review route without copying the full manual setup from the documentation. A maintainer of an existing integration should be able to diagnose it before changing files.

v0.9 develops and dogfoods that installation foundation. It is not the stable installer release. v1.0 is the first release that promises a stable CLI and generated-config contract.

## User Flows

### New installation

```bash
npx @designfever/web-review-kit@0.9 init
```

`init`:

1. scans the current project without changing it;
2. reports supported, warning, and blocking findings;
3. asks for the project ID and public capabilities;
4. builds a file and dependency change plan;
5. shows the plan before writing;
6. writes only after confirmation;
7. runs `doctor` against the result and prints the remaining manual steps.

The public choices are capability based:

- QA storage: `local`, host-owned `custom`, or `profile`;
- Figma image storage: `none`, `local`, host-owned `custom`, or `profile`;
- source locator: enabled or disabled;
- provider profile: an optional package name or local module path.

Backend product names, private endpoints, and organization-specific token rules are not built-in presets.

`custom` and `profile` are intentionally different. `custom` creates a host-owned editable scaffold and never requires a provider package. `profile` loads declarative wiring from a package or local module.

For automation, `init` must eventually accept the same answers through non-interactive flags or a checked-in, secret-free config. The interactive prompt and non-interactive input must produce the same normalized installation plan.

### Existing project diagnosis

```bash
npx @designfever/web-review-kit@0.9 doctor
```

`doctor` is read-only by default. It checks:

- installed package and peer dependency versions;
- React + Vite host support;
- review route and shell mount wiring;
- Vite source/data/Figma plugins when selected;
- required environment variable names without printing their values;
- QA adapter and Figma image store capabilities;
- direct adapter or login/selection bootstrap review mode;
- provider profile availability and compatibility;
- known legacy or partially installed structures.

It prints stable diagnostic codes, severity, a short explanation, and a fix hint. `--json` exposes the same result for CI.

Safe migration may later be applied with:

```bash
npx @designfever/web-review-kit@0.9 doctor --fix
```

`--fix` must preview its plan and require confirmation. It may only apply deterministic, reversible changes. Ambiguous host customizations remain blockers with manual guidance. Running it twice must not create a second diff.

## CLI Contract

The package exposes one executable, `web-review-kit`, through its npm `bin` entry. The supported v0.9 commands are:

```text
web-review-kit init [--profile <package-or-path>] [--dry-run] [non-interactive options]
web-review-kit doctor [--json] [--fix]
web-review-kit check
web-review-kit --help
web-review-kit --version
```

Contract rules:

- prompts and filesystem operations are separate, testable boundaries;
- cancellation before confirmation leaves the host unchanged;
- unknown commands, invalid input, and blockers return a non-zero exit code;
- `--dry-run` never writes or installs dependencies;
- `check` updates only after interactive confirmation and uses the detected
  npm, pnpm, or Yarn lockfile; an explicit `packageManager` field resolves
  stale lockfiles from another manager;
- secrets are never accepted as command-line arguments;
- secret values are never written to generated source, logs, diagnostics, or `.env.example`;
- unsupported structures are reported instead of guessed.

Exact non-interactive option names and diagnostic exit codes are implementation details to finalize during v0.9 dogfooding, then freeze for v1.0.

## Supported Host Scope

v0.9 supports:

- React 18 or newer;
- Vite 5 or newer;
- JavaScript or TypeScript host projects;
- npm, pnpm, or Yarn projects when one package manager can be identified unambiguously;
- a host-controlled `/review` route or equivalent explicit entry module;
- local adapters and host-supplied custom integrations.

The scanner may recognize other structures, but `init` must block automatic writes when it cannot produce a deterministic React + Vite integration. Framework-specific routers, monorepo package selection, and non-Vite bundlers require later contracts or manual setup.

## Generated and Patched Artifacts

The normalized installation plan may include:

- package dependency changes;
- a review route or entry module;
- one host-owned review configuration module;
- host-owned custom Review/Figma scaffolds when selected;
- a small app bootstrap hook when the selected flow requires it;
- Vite plugin additions for selected local/source capabilities;
- `.env.example` entries containing names and empty/example values only;
- a secret-bearing `.env.local` update only when the user enters a value interactively and explicitly approves the write;
- an optional public, secret-free installer config for reproducible runs.

Generation rules:

- never replace an existing config file wholesale;
- patch only a recognized structure;
- show a diff or equivalent change summary before writing;
- stop on conflicting files or unrecognized syntax;
- preserve unrelated formatting and configuration;
- be idempotent on rerun;
- identify every manual follow-up.

Exact filenames are selected by the scanner from the host's existing conventions. Templates must not require private package imports.

## Extension Points

Installation composes independent capabilities rather than one large backend preset.

### QA adapter

The host supplies a `ReviewShellAdapter` entry for review item persistence. The built-in public default is local storage. A host-owned custom selection creates an editable bootstrap scaffold that can resolve an adapter immediately or mount a login/project/page gate first. Profile-owned implementations remain separately packaged.

### Figma image store

The host independently supplies a `ReviewFigmaImageStore`, selects the public local Vite store, loads a profile capability, or disables Figma images. QA storage and Figma image storage must not be coupled. A custom runtime store does not require the local-store Vite plugin.

### Provider profile

An optional provider profile package or local module can declare:

- public questions and validation;
- required environment variable names and which are secrets;
- dependencies to add;
- QA adapter and Figma image store capabilities;
- generated host wiring fragments;
- additional `doctor` checks.

The public package defines and validates the profile contract. A profile owns backend-specific code. Loading a profile must not grant unrestricted file writes: it contributes to the same previewable installation plan and the core writer enforces the same safety rules.

The typed profile interface supports review-only and review-plus-Figma profiles without naming or embedding private services in this repository. Bootstrap mode lets a provider complete login and project/page selection before Review Shell mounts.

## Explicit Non-Goals for v0.9

- bb-vision integration or visual comparison UI;
- built-in presets for private or company-internal backends;
- shipping private endpoints, credentials, admin keys, or token exchange logic;
- automatic migration of unknown custom code;
- support promises for Next.js, Vue, webpack, or other non-Vite hosts;
- automatic route discovery for every router convention;
- publishing the installer contract as stable.

Manual installation remains supported throughout v0.9.

## v1.0 Promotion Criteria

Easy install can become v1.0 when all of the following are true:

1. `init` installs from the packed npm artifact into clean React + Vite JavaScript and TypeScript fixtures.
2. Local QA works end to end after generation.
3. Host-owned custom Review/Figma scaffolds and generic provider profiles install without private code in this repository.
4. `doctor` correctly diagnoses healthy, partial, legacy, and unsupported fixtures without exposing secret values.
5. Safe fixes are previewable, reversible, idempotent, and leave ambiguous customizations untouched.
6. Generated projects pass dependency install, typecheck where applicable, and production build.
7. The CLI behaves consistently with npm, pnpm, and Yarn fixtures.
8. Two existing real host projects complete migration and remain buildable.
9. Quick Start, host-owned custom code, provider profile, migration, rollback, and security documentation match the packed artifact.
10. The CLI options, profile schema, generated-config schema, diagnostic codes, and support matrix are reviewed and declared stable.

Until these checks pass, v0.9 CLI behavior may change between preview releases and must say so in its output and release notes.

## Follow-up Implementation Order

1. CLI entry and command boundary.
2. Read-only React + Vite preflight scanner.
3. Provider profile contract.
4. Normalized `init` answers and installation plan.
5. Safe generator and patch layer.
6. Read-only `doctor` diagnostics.
7. Previewable migration fixes.
8. Packed-artifact E2E matrix.
9. User and profile-author documentation.
