# df-web-review-kit docs

Public docs are intentionally small. Keep implementation history, handoff notes, and internal operator decisions out of this package documentation.

## Read This Order

1. [Easy Install](easy-install.md)
2. [Host-owned review page](review-page/README.md)
3. [df-sheet connection](df-sheet.md)
4. [Installation](installation.md)
5. [Easy Install v0.9 contract](easy-install-v0.9.md)
6. [Custom provider profiles](provider-profiles.md)
7. [Packed installation E2E matrix](pack-install-e2e.md)
8. [v1.0 promotion checklist](v1.0-promotion-checklist.md)
9. [Host env sample](../.env.sample)
10. [Adapter boundaries](adapters.md)
11. [Testing](testing.md)
12. [Custom adapter sample](adaptor.sample.ts)
13. [DB setup](db-setup.md)
14. [Architecture and runtime logic](architecture.md)
15. [Figma overlay](figma-overlay.md)
16. [Grid overlay](grid-overlay.md)

## Document Roles

- `easy-install.md`: framework-neutral installer boundary, `df.ts`, doctor, and guide routing.
- `review-page/`: host-owned `/review` recipes for Next.js, Vite + React, Vue Router, and custom hosts.
- `df-sheet.md`: standard df-login, short-session QA adapter, and authenticated Figma image flow.
- `installation.md`: manually install the npm package, create the `/review` route, wire adapters, and run checks.
- `easy-install-v0.9.md`: experimental CLI contract, support scope, extension contract, safety rules, and v1.0 criteria.
- `provider-profiles.md`: generic private-provider schema, capability composition, environment safety, and authoring examples.
- `../.env.sample`: copyable host project env template for local, Supabase, and source opening.
- `adapters.md`: QA adapter and Figma image store responsibility boundary.
- `testing.md`: Vitest adapter contract and core pure-function unit coverage, plus local verification commands.
- `adaptor.sample.ts`: copyable starting point for host-owned remote adapters.
- `db-setup.md`: optional Supabase review item table/RPC/RLS/presence setup.
- `architecture.md`: core/runtime, React shell, coordinate, anchor, sitemap, and feature ownership boundaries.
- `figma-overlay.md`: host helper requirements plus package image overlay state and interaction rules.
- `grid-overlay.md`: host requirements for the grid/helper overlay toggle.

## Release History

- [0.10.2](release-notes-0.10.2.md): df-sheet page/logout controls and status-aware multi-owner QA workflows.
- [0.10.1](release-notes-0.10.1.md): reliable pointer interaction for review-shell controls.
- [0.10.0](release-notes-0.10.0.md): framework-neutral easy install, df-login session, df-sheet QA, and authenticated Figma images.
- [0.9.0 preview](release-notes-0.9.0.md): experimental easy-install CLI, doctor, safe migration, provider profiles, and packed E2E matrix.
- [0.8.12](release-notes-0.8.12.md): reliable first Figma overlay selection and lower Supabase review-item egress.
- [0.8.11](release-notes-0.8.11.md): package-synced version display and reliable Option DOM selection over the Figma overlay.
- [0.8.10](release-notes-0.8.10.md): open data and component files directly from the Option DOM popup.
- [0.8.9](release-notes-0.8.9.md): data candidates in the Option DOM component popup.
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
