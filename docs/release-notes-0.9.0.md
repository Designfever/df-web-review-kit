# Release Notes: 0.9.0 Preview

0.9.0 introduces the experimental easy-install foundation for React + Vite hosts. It is a preview for dogfooding and migration validation, not the stable installer contract.

> The CLI options, generated config, provider profile schema, migration rules, diagnostic codes, and JSON output may change before 1.0. Pin 0.9.x versions and review every generated diff.

## CLI

The package exposes the `web-review-kit` executable:

```text
web-review-kit init
web-review-kit doctor
```

`init` supports interactive answers, non-interactive flags, and schema-versioned secret-free JSON config through one validation path. It scans the host, creates a previewable plan, and writes only after confirmation or `--yes`.

`doctor` checks host/package versions, package exports, review route and React mount, selected Vite plugins, environment key presence, adapter capabilities, provider wiring, partial installs, and known legacy integrations. Human and `--json` output use the same diagnostics. Exit codes are 0 for healthy, 2 for warnings, and 1 for blockers or failures.

## Safe Generation

The installer can generate a minimal `/review/` HTML entry, React mount, and review configuration for local or profile-supplied capabilities. It plans dependencies and minimally patches recognized Vite and `.env.example` structures.

Dry-run is read-only. Installer-owned files have an explicit header; existing user-owned files are conflicts. A stale plan blocks the complete write. Repeated installation produces no additional diff.

## Provider Profiles

The public `@designfever/web-review-kit/profile` export defines schema version 1. A generic profile can declare review storage, optional independent Figma image storage, dependencies, environment key metadata, generated wiring, and declarative doctor checks.

Profiles do not receive unrestricted filesystem access. Backend implementation, endpoints, and authentication remain in host-owned or separately published packages.

## Migration

`doctor --fix` previews deterministic legacy migration and remains read-only. `doctor --fix --yes` applies only the narrow recognized local-adapter form after creating a manifest-backed backup under `.web-review-kit/backups/<migration-id>/`.

Customized adapter options, host callbacks, multiple legacy integrations, and ambiguous structures are blockers with manual guidance. Applied migration is reversible and idempotent.

## Verification

`pnpm test:e2e:pack` builds and packs the package, installs the tarball into temporary clean JavaScript/TypeScript, existing 0.8, and generic custom-adapter fixtures, then verifies init/doctor/migration, typecheck, production build, idempotency, failure exit codes, and unchanged-file guarantees.

See:

- [Easy Install Preview](easy-install.md)
- [Custom Provider Profiles](provider-profiles.md)
- [Packed Installation E2E Matrix](pack-install-e2e.md)
- [v1.0 Promotion Checklist](v1.0-promotion-checklist.md)

## Scope

Supported automatic setup is limited to React 18+, Vite 5+, JavaScript/TypeScript, and one unambiguous npm/pnpm/Yarn project root. Framework-specific routers, monorepo package selection, non-Vite bundlers, unknown custom code, and visual-comparison integrations are outside the 0.9 automatic-install scope.
