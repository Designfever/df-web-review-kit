# df-web-review-kit docs

Public docs are intentionally small. Keep implementation history, handoff notes, and internal operator decisions out of this package documentation.

## Read This Order

1. [Installation](installation.md)
2. [Host env sample](../.env.sample)
3. [Adapter boundaries](adapters.md)
4. [Testing](testing.md)
5. [Custom adapter sample](adaptor.sample.ts)
6. [DB setup](db-setup.md)
7. [Architecture and runtime logic](architecture.md)
8. [Figma overlay](figma-overlay.md)
9. [Grid overlay](grid-overlay.md)
10. [Release notes 0.8.0](release-notes-0.8.0.md)
11. [Release notes 0.7.3](release-notes-0.7.3.md)
12. [Release notes 0.7.2](release-notes-0.7.2.md)
13. [Release notes 0.7.1](release-notes-0.7.1.md)
14. [Release notes 0.7.0](release-notes-0.7.0.md)

## Document Roles

- `installation.md`: install the npm package, create the `/review` route, wire adapters, and run checks.
- `../.env.sample`: copyable host project env template for local, Supabase, and source opening.
- `adapters.md`: QA adapter and Figma image store responsibility boundary.
- `testing.md`: Vitest adapter contract coverage and local verification commands.
- `adaptor.sample.ts`: copyable starting point for host-owned remote adapters.
- `db-setup.md`: optional Supabase review item table/RPC/RLS/presence setup.
- `architecture.md`: core/runtime, React shell, coordinate, anchor, and feature boundary notes.
- `figma-overlay.md`: host requirements for the Figma overlay toggle.
- `grid-overlay.md`: host requirements for the grid/helper overlay toggle.
- `release-notes-0.8.0.md`: latest release changes, QA attachment/adapter/capture contract, source inspector updates, and validation scope.
- `release-notes-0.7.3.md`: previous release changes, endpoint Figma image store API, and validation scope.
- `release-notes-0.7.2.md`: previous release changes, remote Figma image store API, and validation scope.
- `release-notes-0.7.1.md`: previous release changes, host notes, and validation scope.
- `release-notes-0.7.0.md`: previous release changes and validation scope.

## Boundary

- `local` is the default draft storage.
- `supabase` is an optional adapter sample for users who configure their own backend.
- `presence` is temporary session state, not QA item persistence.
- `kuku` and operator keys belong to OpenClaw or a backend/admin service, not this public package.
