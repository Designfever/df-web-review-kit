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

## Document Roles

- `installation.md`: install the npm package, create the `/review` route, wire adapters, and run checks.
- `../.env.sample`: copyable host project env template for local, Supabase, and source opening.
- `adapters.md`: QA adapter and Figma image store responsibility boundary.
- `testing.md`: Vitest adapter contract and core pure-function unit coverage, plus local verification commands.
- `adaptor.sample.ts`: copyable starting point for host-owned remote adapters.
- `db-setup.md`: optional Supabase review item table/RPC/RLS/presence setup.
- `architecture.md`: core/runtime, React shell, coordinate, anchor, sitemap, and feature ownership boundaries.
- `figma-overlay.md`: host helper requirements plus package image overlay state and interaction rules.
- `grid-overlay.md`: host requirements for the grid/helper overlay toggle.

## Release History

- [0.8.8](release-notes-0.8.8.md): component ancestry popup for Option DOM selection and internal module cleanup.
- [0.8.7](release-notes-0.8.7.md): direct Figma overlay image imports and build-safe Source Tree paths.
- [0.8.6](release-notes-0.8.6.md): explicit source hint opt-in for review builds.
- [0.8.5](release-notes-0.8.5.md): reliable Source Tree focus for asynchronously rendered targets.
- [0.8.4](release-notes-0.8.4.md): reliable viewport capture for zero-size gradient elements.
- [0.8.3](release-notes-0.8.3.md): code-review bug fixes (hidden draft composer, select hotkeys, overlay state writes, URL hash), sitemap state persistence/filtering, tests, and feature-module cleanup.
- [0.8.2](release-notes-0.8.2.md): Figma image layer edit/delete tooltip removal.
- [0.8.1](release-notes-0.8.1.md): QA prompt prefix, QA filtering, counters, tooltip, long-content, and outside marker fixes.
- [0.8.0](release-notes-0.8.0.md): next minor release notes for QA attachments, adapter contract, capture, source inspector, and dev fixture changes.
- [0.7.3](release-notes-0.7.3.md): endpoint Figma image store API and validation scope.
- [0.7.2](release-notes-0.7.2.md): remote Figma image store API and validation scope.
- [0.7.1](release-notes-0.7.1.md): fallback settings, host notes, and validation scope.
- [0.7.0](release-notes-0.7.0.md): Figma image workflow, QA fields, remote adapter pending UI, and release candidate fixes.
- [0.6.0](release-notes-0.6.0.md): docked QA composer, Source Tree metadata, and local UI persistence.
- [0.5.0](release-notes-0.5.0.md): Source Tree panel, data locator, source candidate, and QA filter changes.
- [0.4.0](release-notes-0.4.0.md): Source inspector, sitemap QA overview, DOM anchor, and presence changes.
- [0.3.0](release-notes-0.3.0.md): Vite source locator, source action, QA edit, and ruler improvements.

## Boundary

- `local` is the default draft storage.
- `supabase` is an optional adapter sample for users who configure their own backend.
- `presence` is temporary session state, not QA item persistence.
- `kuku` and operator keys belong to OpenClaw or a backend/admin service, not this public package.
