# Handoff: df-web-review-kit mobile QA composer

Date: 2026-06-25

## Repo

- Path: `/Users/sinhyeongju/WebstormProjects/df-web-review-kit`
- Branch: `codex/review-kit-0.5.1-dots-menu`
- Changed: `src/core/web.review.kit.view.ts`, `src/core/overlay.style.ts`, `dist/*`

## What changed

- QA draft composer switches to compact mode when `draft.viewport.width <= 768`.
- Compact mode applies to both note/DOM composer and area composer.
- Compact mode:
  - adds `is-compact-composer`
  - moves composer to bottom of the visible overlay area
  - removes DOM adjustment panel
  - removes drag handle
  - removes area metrics panel
  - adds top-right close button
  - keeps textarea, Save, Cancel
- Core overlay panel breakpoint changed from `520px` to `768px`.

## Files

- `src/core/web.review.kit.view.ts`
  - `COMPACT_DRAFT_VIEWPORT_MAX_WIDTH = 768`
  - `isCompactDraftViewport()`
  - `applyCompactDraftComposerPosition()`
  - `createDraftCloseButton()`
  - compact branches in `createNotePopover()` and `createAreaDraftPopover()`
- `src/core/overlay.style.ts`
  - `.is-compact-composer`
  - `.dfwr-draft-close`
  - `@media (max-width: 768px)`

## Validation already done

```sh
pnpm exec tsc --noEmit --ignoreDeprecations 6.0
rtk pnpm typecheck:dev
pnpm build
rtk pnpm build:dev
git diff --check
```

Notes:

- Raw `pnpm typecheck` fails because `tsconfig.json` has an `ignoreDeprecations` value invalid for TS6. The override command above passes.
- `pnpm build` updates tracked `dist` files and changes the generated chunk from `chunk-TWCSIBMY` to `chunk-YJWDY4S3`.

## Runtime verification note

```txt
popoverClass: "dfwr-note-popover is-composer is-compact-composer"
hasAdjustPanel: false
hasDragHandle: false
hasClose: true
popoverStyle.bottom: "68px"
popoverStyle.width: "516px"
```

This was verified after rebuilding the package dist and loading the updated package in a host review shell.

## Current caution

- `dist/chunk-TWCSIBMY.js` is deleted and `dist/chunk-YJWDY4S3.js` is created by `pnpm build`.
- Keep the generated `dist` update if this branch is intended for package release or local host validation.
- Before publishing, decide whether to bump `package.json` version from `0.5.0`.
