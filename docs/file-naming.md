# File Naming and Feature Ownership

This is the path contract for the v0.12 cleanup sequence, not a description of
completed moves. Checked on 2026-09-12 against
`36024c984b4365045080276bb3b7ead836771941` (step 01), following the structural
review at `dab969be2bfd135d86791dd1e87a976b811f49f1`.
Step numbers below refer to sequence 8. Step 02 changed documentation only;
later implementation status is recorded below without rewriting the historical map.

## Implemented: step 03

- `src/figma/image.asset.ts` now owns shared MIME/format/storage-key helpers,
  including `getReviewFigmaImageMimeType`. Server pathname decoding remains in
  `src/vite/figma-asset.ts`; its tests stay there, while pure helper tests moved to
  `src/figma/image.asset.test.ts`.
- `src/figma/image.target.ts` now owns the normalized store target key and its
  existing normalization. It also owns the unchanged legacy overlay key helper
  previously in `src/react-shell/figma/image.controller.ts`: moving only the
  panel helper import would otherwise leave a transitive React dependency through
  overlay state. The JSON store key and pipe-separated overlay key are not merged.
- The default store endpoint moved from `src/figma/image.store.ts` to existing
  `src/figma/image.types.ts`, alongside the existing image-format default. This
  avoids a new constants-only module and removes Vite's remaining client-store
  import. Existing client-store public re-exports remain intact.
- `src/figma/image.target.test.ts` pins key formats and compatibility re-exports.
  See later implementation sections for subsequent progress.
- Locate the implementation commit with
  `git log --oneline --grep='refactor: decouple shared Figma helpers'`.

## Implemented: step 04

- `src/design-inspector/panel.view.ts` now owns static panel creation, detail rows,
  measurement rows and detail-scroll preservation.
- `src/design-inspector/geometry.view.ts` now owns overlay creation, clipping,
  projected boxes/lines and label fitting. Frame geometry is an explicit input.
- Shared `appendText` moved into existing `src/design-inspector/dom.ts` rather
  than duplicating it across views. Target selection, source requests, events and
  scheduling remain in `inspector.ts`; target event registration is handled in step 05.
- Locate the implementation commit with
  `git log --oneline --grep='refactor: separate Design Inspector rendering'`.

## Implemented: step 05

- `src/design-inspector/target.events.ts` binds one target Document/Window,
  visual viewport and FontFaceSet, returning one idempotent cleanup function.
- Controller read/command callbacks preserve single ownership of selection,
  mode, hover/compare state and scheduling. Rebinding cleans the previous document
  before installing the new binder; source request guards and observer cleanup
  remain in `inspector.ts`.
- `target.events.test.ts` covers live mode policy, native touch pointerdown and
  listener disposal. Inspector integration tests also cover rebind while a source
  open waits for resolution and observer teardown.
- Locate the implementation commit with
  `git log --oneline --grep='refactor: isolate Design Inspector target events'`.

## Implemented: step 06

- All 17 step-06 targets in the historical whole-file map now exist under
  `src/react-shell/source-tree/`; their former paths are removed, not compatibility
  shims. Four dedicated test files moved with their subjects.
- Hook filenames are now `use.section.outline.ts`, `use.source.inspector.ts` and
  `use.section.dom.adjustment.ts`; exported hook names and state ownership remain
  unchanged. Importers point directly to the feature folder.
- Only module paths changed in source/test bodies. Shared shell hooks, central
  styles and CSS Design Inspector implementations stay in their existing folders.
- Later extraction donor paths resolve through the step-06 map.
  Step-10 whole-file moves remain pending.
- Locate the implementation commit with
  `git log --oneline --grep='refactor: group Source Tree files by feature'`.

## Implemented: step 07

- `src/react-shell/source-tree/source.selection.events.ts` binds one target
  document and its host window through explicit outline/selection/focus/cancel
  commands. It returns cleanup for the same listener targets and capture options.
- `src/react-shell/source-tree/source.font.overlay.ts` owns shortcut style and
  font-hint DOM creation, positioning, deduplication and removal, using the existing
  stylesheet. Selection mode and Figma locking remain in the event binder.
- `use.source.inspector.ts` retains React hover/selection/popup state, rectangle
  tracking, blocked-mode policy and iframe rebind/unmount orchestration. Figma
  first-click hit-testing and Design Inspector exclusion keep their old order.
- Locate the implementation commit with
  `git log --oneline --grep='refactor: isolate Source selection events and font hints'`.

## Implemented: step 08

- `src/react-shell/source-tree/use.outline.observation.ts` owns ready-document
  scanning, frame reset notification, initial rAF + 120/500/1200ms retries and
  the existing 80ms child-list mutation debounce. Cleanup cancels pending work
  and disconnects the observer on close, frame changes and unmount.
- `use.section.outline.ts` owns applying snapshots, default-collapse policy,
  filter/collapse/selection state, focus-path expansion and QA handoff. Explicit
  reset/refresh callbacks keep UI state out of the observation hook.
- `use.section.dom.adjustment.ts` is reused unchanged. The optional
  `section.outline.entry.tsx` was **not created**: the current recursive renderer
  shares selection refs, metadata flags and numerous entry commands. Moving it
  would add prop forwarding or context solely for extraction; the focused entry
  renderer stays in `section.outline.panel.tsx`, unchanged.
- Locate the implementation commit with
  `git log --oneline --grep='refactor: isolate Source Tree observation lifecycle'`.

## Rules and ownership

- Keep the [core / React shell boundary](architecture.md): vanilla target review
  primitives in `src/core/`; reviewer workflow UI and iframe coordination in
  `src/react-shell/`. Moving a hook does not move state ownership.
- Directories use lowercase kebab-case; internal files use lowercase dot-separated
  names. React hook files start with `use.`; tests stay beside their subjects as
  `.test.ts` or `.test.tsx`. Keep existing public entry filenames unchanged.
- Group Source Tree and source selection in `src/react-shell/source-tree/`.
  Keep shell-wide orchestration in `hooks/`, layout assembly in `review/`,
  and shared config/refs/state in `store/`.
- CSS Design Inspector stays in `src/design-inspector/`; its shell container stays
  in `src/react-shell/design-inspector/`. It is not the source-selection feature.
- Runtime-independent Figma helpers belong in `src/figma/`, shell UI in
  `src/react-shell/figma/`, dev-server request handling in `src/vite/`.
  Shared browser helpers must not import Node or Vite runtime modules.
- Keep the existing custom-panel feature structure. Keep ordered style assembly;
  this is not a migration of all styles into feature folders.
- File moves and logic extraction are separate changes. A large line count is a
  review signal, not a requirement to split a cohesive module.
- Do not rename exported symbols, public options, persisted keys, CSS selectors,
  DOM attributes, or event/protocol names to match new filenames.

## Terminology

- **Source Tree** is the UI feature: target DOM/source hierarchy, metadata,
  selection, focus, and handoff to QA.
- **SectionOutline** is the existing internal vocabulary for the tree model,
  traversal, panel, and filter/collapse state. Its symbols can remain named
  `SectionOutline*` inside the new feature folder.
- **SourceInspector** is the existing source-selection/editor workflow: iframe
  hover/pick, shortcut handling, source candidate popup, and font hints. It is
  part of Source Tree ownership, not CSS Design Inspector.
- **Design Inspector** inspects computed CSS, geometry and measurements, and
  generates CSS reports. Its separate runtime and shell integration remain.
- Public `ReviewSourceInspectorOptions` and the `sourceInspector` option remain
  compatible. Existing `section-outline` selectors and stored UI keys are not
  migration targets.

## Current → target: whole-file moves

All paths are repository-relative. Every **Current** path exists at the baseline;
every **Target** below is **planned / absent** at step 02. Move the full file,
update importers and documentation, and preserve exported names. Step 06 does not
split `source.open.ts` into candidate/editor modules. Step-06 targets are now
implemented; only step-10 targets in this table remain planned.

| Step | Current | Target |
|---|---|---|
| 06 | `src/react-shell/section.outline.ts` | `src/react-shell/source-tree/section.outline.ts` |
| 06 | `src/react-shell/section.outline.test.ts` | `src/react-shell/source-tree/section.outline.test.ts` |
| 06 | `src/react-shell/source.open.ts` | `src/react-shell/source-tree/source.open.ts` |
| 06 | `src/react-shell/source.open.test.ts` | `src/react-shell/source-tree/source.open.test.ts` |
| 06 | `src/react-shell/source.hint.ts` | `src/react-shell/source-tree/source.hint.ts` |
| 06 | `src/react-shell/hooks/use.review.section.outline.ts` | `src/react-shell/source-tree/use.section.outline.ts` |
| 06 | `src/react-shell/hooks/use.review.source.inspector.ts` | `src/react-shell/source-tree/use.source.inspector.ts` |
| 06 | `src/react-shell/hooks/use.section.dom.adjustment.ts` | `src/react-shell/source-tree/use.section.dom.adjustment.ts` |
| 06 | `src/react-shell/review/section.outline.panel.tsx` | `src/react-shell/source-tree/section.outline.panel.tsx` |
| 06 | `src/react-shell/review/section.outline.panel.test.tsx` | `src/react-shell/source-tree/section.outline.panel.test.tsx` |
| 06 | `src/react-shell/review/section.outline.container.tsx` | `src/react-shell/source-tree/section.outline.container.tsx` |
| 06 | `src/react-shell/review/source.inspector.context.tsx` | `src/react-shell/source-tree/source.inspector.context.tsx` |
| 06 | `src/react-shell/review/source.inspector.overlay.tsx` | `src/react-shell/source-tree/source.inspector.overlay.tsx` |
| 06 | `src/react-shell/review/source.inspector.overlay.container.tsx` | `src/react-shell/source-tree/source.inspector.overlay.container.tsx` |
| 06 | `src/react-shell/review/source.inspector.popup.tsx` | `src/react-shell/source-tree/source.inspector.popup.tsx` |
| 06 | `src/react-shell/review/source.inspector.popup.test.tsx` | `src/react-shell/source-tree/source.inspector.popup.test.tsx` |
| 06 | `src/react-shell/review/source.shortcut.style.ts` | `src/react-shell/source-tree/source.shortcut.style.ts` |
| 10 | `src/react-shell/figma/image.controller.ts` | `src/react-shell/figma/use.image.store.ts` |
| 10 | `src/react-shell/figma/image.overlay.controller.ts` | `src/react-shell/figma/use.image.overlay.ts` |
| 10 | `src/react-shell/figma/image.overlay.controller.test.tsx` | `src/react-shell/figma/use.image.overlay.test.tsx` |

`source.shortcut.style.ts` moves with its sole feature consumer in step 06;
this does not change CSS text or cascade order. Shared shell hooks, Design
Inspector containers, and the central `style/section-outline.ts` stylesheet
stay put. Tests not listed here are not invented or renamed speculatively.

## Current → target: extraction destinations

Except for steps 03–05 and 07–08 marked implemented above, these are **new planned files**,
not whole-file renames. Every donor path exists
at the step-02 baseline and remains unless its whole-file move is listed above.
Use the step-06 target path when later extracting Source Tree code. Keep one
implementation and preserve public re-exports where already exposed.

| Step | Current donor | Planned destination | Responsibility |
|---|---|---|---|
| 03 | `src/vite/figma-asset.ts` | `src/figma/image.asset.ts` | Pure MIME/format/storage-key helpers; server-only request routing stays under Vite |
| 03 | `src/figma/image.store.ts` | `src/figma/image.target.ts` | Shared target key helper; reuse existing target normalization, preserve client-store re-export |
| 04 | `src/design-inspector/inspector.ts` | `src/design-inspector/panel.view.ts` | Panel and detail rendering |
| 04 | `src/design-inspector/inspector.ts` | `src/design-inspector/geometry.view.ts` | Measurement boxes, lines and label fitting |
| 05 | `src/design-inspector/inspector.ts` | `src/design-inspector/target.events.ts` | Target event binding and cleanup |
| 07 | `src/react-shell/hooks/use.review.source.inspector.ts` | `src/react-shell/source-tree/source.selection.events.ts` | Plain iframe shortcut/selection binder |
| 07 | `src/react-shell/hooks/use.review.source.inspector.ts` | `src/react-shell/source-tree/source.font.overlay.ts` | Font-hint DOM/style lifecycle beside the binder |
| 08 | `src/react-shell/hooks/use.review.section.outline.ts` | `src/react-shell/source-tree/use.outline.observation.ts` | Frame reset, initial scan and observation scheduling |
| 08 | `src/react-shell/review/section.outline.panel.tsx` | `src/react-shell/source-tree/section.outline.entry.tsx` | Recursive entry UI if extraction reduces complexity |
| 09 | `src/react-shell/figma/images.panel.tsx` | `src/react-shell/figma/images.import.tsx` | URL/file import UI and local interaction state |
| 09 | `src/react-shell/figma/images.panel.tsx` | `src/react-shell/figma/image.preview.tsx` | Existing Figma preview component |
| 10 | `src/react-shell/figma/images.panel.tsx` | `src/react-shell/figma/image.row.tsx` | Row rendering and inline rename |
| 10 | `src/react-shell/figma/images.panel.tsx` | `src/react-shell/figma/use.image.reorder.ts` | Pointer reorder interaction |
| 11 | `src/core/web.review.kit.app.ts` | `src/core/review/item.payload.ts` | Pure item construction; reuse draft.builder |
| 11 | `src/core/web.review.kit.app.ts` | `src/core/review/draft.attachments.ts` | Capture/upload operation; reuse capture.input |
| 12 | `src/core/overlay.style.ts` | `src/core/style/overlay.base.ts` | Base controls; preserve composition order |
| 12 | `src/core/overlay.style.ts` | `src/core/style/overlay.markers.ts` | Marker styles |
| 12 | `src/core/overlay.style.ts` | `src/core/style/overlay.draft.ts` | Draft/composer styles |
| 12 | `src/react-shell/style/qa-panel.ts` | `src/react-shell/custom-panels/style.ts` | Custom-panel-owned rules only |
| 12 | `src/react-shell/figma/dev-overlay.tsx` | `src/react-shell/figma/dev.overlay.style.ts` | Existing embedded stylesheet |
| 13 | `src/vite.ts` | `src/vite/source.locator.ts` | Source locator plugin |
| 13 | `src/vite.ts` | `src/vite/data.locator.ts` | Data locator plugin |
| 13 | `src/vite.ts` | `src/vite/locator.transform.ts` | Shared AST insertion |
| 13 | `src/vite.ts` | `src/vite/locator.options.ts` | Shared matching/options |
| 13 | `src/vite.ts` | `src/vite/jsx.runtime.ts` | Generated runtime template, unchanged semantics |
| 14 | `src/df-sheet.ts` | `src/df-sheet/session.ts` | PKCE/session/expiry/logout |
| 14 | `src/df-sheet.ts` | `src/df-sheet/http.ts` | HTTP transport and errors |
| 14 | `src/df-sheet.ts` | `src/df-sheet/adapter.ts` | QA adapter and attachment contract |

In step 03, move `getReviewFigmaImageMimeType` from the client store into the
shared asset module too; preserve its existing public re-export. Keep
`ReorderReviewFigmaImagesInput` at its existing definition rather than inventing
another type. The panel helper imports overlay types/defaults directly from
existing `src/react-shell/figma/image.overlay.state.ts`; no new state module.

Preserve `src/vite/figma-asset.test.ts` coverage when moving helpers: move
helper-only tests to `src/figma/image.asset.test.ts`, but retain tests beside any
Vite-only behavior that remains. Other extraction tests are colocated with their
new subject only when the later step requires a meaningful regression check.

The step-08 entry destination remains an unimplemented optional proposal, as
recorded above. Destinations fix naming and ownership, not a quota of new modules. If a listed
extraction would duplicate an existing helper or increase state coupling, reuse
the existing module and record the actual path and reason here in that step.
Mark completed moves with their commit and update architecture/test references;
never describe planned paths as already present.

## Public entry baseline

Package name: `@designfever/web-review-kit`. These package subpaths, source
entries, output names and signatures remain stable throughout the sequence.
Internal folders do not create new package exports.

| Export key | Existing source entry | types | import | require |
|---|---|---|---|---|
| `.` | `src/index.ts` | `./dist/index.d.ts` | `./dist/index.js` | `./dist/index.cjs` |
| `./react-shell` | `src/react-shell.tsx` | `./dist/react-shell.d.ts` | `./dist/react-shell.js` | `./dist/react-shell.cjs` |
| `./df-sheet` | `src/df-sheet.ts` | `./dist/df-sheet.d.ts` | `./dist/df-sheet.js` | `./dist/df-sheet.cjs` |
| `./vite` | `src/vite.ts` | `./dist/vite.d.ts` | `./dist/vite.js` | `./dist/vite.cjs` |
| `./profile` | `src/profile.ts` | `./dist/profile.d.ts` | `./dist/profile.js` | `./dist/profile.cjs` |
| `./init` | `src/init.ts` | `./dist/init.d.ts` | `./dist/init.js` | `./dist/init.cjs` |

- Metadata export: `./package.json` → `./package.json`; no compiled source.
- CLI bin: `web-review-kit` → `./dist/cli.js`, built from `src/cli.ts`.
  There is no `./cli` package export.
- Legacy fields: `main=./dist/index.cjs`, `module=./dist/index.js`,
  `types=./dist/index.d.ts`.
- `build:lib` supplies all six library entries to tsup with ESM/CJS and declarations.
  `build:cli` builds the CLI as ESM for Node 18. `build` runs both.
- `knip.json` includes all seven source entrypoints (six library entries + CLI).
  Unused-entry-export findings are not permission to delete external APIs.
- Output paths above are the manifest/build contract, not a claim that the
  current `dist/` has been rebuilt or verified. Build and declaration comparison
  are later execution checks.

## Verification baseline and handoff

Observed at step 01 commit `36024c9` on Node v26.8.1:

- `pnpm typecheck`, `pnpm typecheck:dev`, `pnpm lint:dead-code`: passed.
- `noUnusedLocals` and `noUnusedParameters` are enabled in shared
  `tsconfig.json`; dev config inherits them.
- Targeted tests: doctor, source.open, adapter.contract, figma-image-store.image,
  figma-image-store.server: **5 files / 33 tests passed**.
- Full suite, builds, package contents and browser flows: **not yet verified by
  this cleanup sequence**. A prior partial check is not a full baseline pass.

Step 02 checks current donor/entry paths, absent planned targets, unique move
destinations, package exports/bin/build/Knip correspondence, relative doc links,
and `git diff --check`. It does not rerun runtime tests for documentation-only
changes.

After each implementation step, run its scoped checks using actual mapped paths.
For final regression use [Testing](testing.md): typecheck, typecheck:dev, full
tests, dead-code lint, package/dev builds and pack dry-run, plus local-only
browser flows. Apply the Node 26 webstorage workaround only after that failure
is reproduced. Preserve original failures and unverified checks in evidence.

## Deferred, not scheduled renames

The review also suggested `target/target.ts` → `target/overlay.ts`, splitting
source candidate discovery from editor opening, and normalizing remaining Figma
hyphenated filenames. Those are not automatic additions to a sequence step.
Current files remain until explicitly scoped; keep the dot convention for
new/touched modules without a repository-wide rename.

Likewise, dom.anchor, target capture fallbacks, and Vite image storage/render
separation stay on the watchlist. No Figma package split is part of this map.
