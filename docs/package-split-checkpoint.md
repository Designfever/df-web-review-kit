# Package split checkpoint

Date: 2026-06-20
Branch: `uforgot/feat/review-kit-stabilize-ui`

## Goal

Prepare `packages/df-web-review-kit` to behave like an independent package before moving Figma overlay or editing proposal work into it.

This checkpoint is not the actual repo split and does not publish the package.

## Public entrypoints

Only these imports are public:

```ts
import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';
import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
```

The package export map exposes:

- `.` → core API, adapters, shared types.
- `./react-shell` → review shell UI, presence adapters, page glob helper.
- `./package.json` → package metadata for tooling.

`src/*` paths are not public API.

## Publish/file policy

`package.json#files` intentionally includes only:

- `dist`
- `docs`
- `README.md`

`src` is kept in the repo for development but excluded from the package file list so consumers rely on the exported API and generated declarations.

## Dependency policy

- `react` and `react-dom` stay peer dependencies.
- `lucide-react` stays bundled into the built `react-shell` output for now. It is a dev/build dependency, not a host peer dependency.
- Figma token/API/fetch logic must not enter package core in this branch.

## Host consumption policy

The host app imports the package through the same public package entrypoints it would use after a repo split:

- `@designfever/web-review-kit`
- `@designfever/web-review-kit/react-shell`

Vite should not alias those package imports to `packages/df-web-review-kit/src` in dev. The host resolves the installed file dependency under `node_modules`, so package `dist` must be rebuilt after package source changes.

## Review/test page policy

A host `/review` page can remain the integration smoke page. It is a consumer of the package, not part of the package surface.

If this package is moved to a separate repo later, keep a small playground/example app outside the package publish files so review-shell behavior can still be manually verified.

## Verification gate

Before moving this item to review, run:

```bash
pnpm typecheck
pnpm build
pnpm typecheck:dev
npm pack --dry-run --ignore-scripts --json
```

Manual smoke:

- Open `/review`.
- Confirm empty QA state.
- Inject or create a local QA item.
- Confirm card and prompt modal still render.
- Confirm settings and sitemap modals still open.
- Confirm browser console has no errors/warnings.
