# Release Notes: 0.3.0

Release notes for the changes after the 0.2.0 mainline merge.

Compare base: `49f2665` (`Merge pull request #7 ... feat: release web review kit 0.2.0`)
Head reviewed: `a82b204` (`release: 0.3.0`)

## Highlights

- Added a dev-only Vite source locator export at `@designfever/web-review-kit/vite`.
- Added source-file hints for DOM review targets and VS Code open actions from the review shell.
- Added QA comment editing from the review item card.
- Improved ruler readability, measurement labels, and light-theme ruler contrast.
- Added source-select font hint overlays for elements that expose `data-font`.
- Fixed the review hotkey so it no longer fires while typing in editable fields.

## Added

### Source locator for review targets

Host projects can now opt into `reviewSourceLocator()` in Vite. The plugin wraps React's dev JSX runtime and injects source attributes into rendered DOM nodes:

- `data-wrk-source-file`
- `data-wrk-source-line`
- `data-wrk-source-column`

When source hints are present, the review shell can open the matching source location in VS Code. The shell supports both absolute source paths and relative paths resolved with `sourceRoot`.

Public package changes:

- Added `./vite` package export.
- Added `src/vite.ts`.
- Added optional `sourceRoot` to `ReviewShellProps`.
- Added `line` and `column` to `DomSourceHint`.

### Source actions in the review shell

The review shell now supports:

- `Option` + click inside the target iframe to open the clicked source hint.
- Source hover affordance while the option key is active.
- Source-select font hint overlays for elements with `data-font` metadata.
- Source-open action on QA cards when an item has persisted source hints.
- Toast feedback when a source hint cannot be found or a source root is required.

### QA comment editing

QA item cards now expose an edit action when the active adapter supports updates. The edit modal validates non-empty comments, saves through the active adapter, refreshes review data, and shows toast feedback.

Adapter normalization now tracks `canUpdate` so the shell can hide edit actions for read-only sources.

## Changed

### Ruler UI

- Measurement labels now use a neutral `width x height unit` format instead of a Figma-specific label.
- Ruler labels, coordinate chips, guide lines, and popovers are more visible in both dark and light themes.
- Light-theme ruler contrast was improved in a follow-up fix.

### Review shell workflow

- QA item lists now sort by `createdAt` instead of `updatedAt`, so edits do not unexpectedly move older items to the top.
- Supabase list ordering now also uses `created_at` for the same behavior across remote sources.
- The quick add toolbar now focuses on DOM element and area capture actions.
- The edit comment modal now reuses the settings modal visual system.

### Prompt context

Review item prompts include source-line context when available from DOM source hints.

## Fixed

- The review hotkey is ignored while focus is inside `input`, `textarea`, `select`, or `contenteditable` targets.
- DOM source extraction now reads both the new `data-wrk-source-*` attributes and the older `data-file` / `data-component` style attributes.

## Docs

- README now documents the public `@designfever/web-review-kit/vite` import.
- Installation docs now include source locator setup, `sourceRoot`, and the dev/review-build warning about source paths in the DOM.

## Validation

Verified on the reviewed main branch:

- `pnpm typecheck`
- `pnpm typecheck:dev`
- `pnpm build`
- `pnpm build:dev`

## Notes

- `package.json` reports `0.3.0`.
- The `0.3.0` release commit exists at `a82b204`.
- No local or remote `0.3.0` git tag was present when these notes were written.
