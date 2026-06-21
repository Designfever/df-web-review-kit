# df-web-review-kit docs

Public docs are intentionally small. Keep implementation history, handoff notes, and internal operator decisions out of this package documentation.

## Read This Order

1. [Installation](installation.md)
2. [DB setup](db-setup.md)
3. [Architecture and runtime logic](architecture.md)
4. [Figma overlay](figma-overlay.md)
5. [Grid overlay](grid-overlay.md)

## Document Roles

- `installation.md`: install the npm package, create the `/review` route, wire adapters, and run checks.
- `db-setup.md`: optional Supabase review item table/RPC/RLS/presence setup.
- `architecture.md`: core/runtime, React shell, coordinate, anchor, and feature boundary notes.
- `figma-overlay.md`: host requirements for the Figma overlay toggle.
- `grid-overlay.md`: host requirements for the grid/helper overlay toggle.

## Boundary

- `local` is the default draft storage.
- `supabase` is an optional adapter sample for users who configure their own backend.
- `presence` is temporary session state, not QA item persistence.
- `kuku` and operator keys belong to OpenClaw or a backend/admin service, not this public package.
