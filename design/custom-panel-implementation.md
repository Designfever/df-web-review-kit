# Custom panel implementation — step 2 review handoff

## Scope

Implements the [API contract](custom-panel-api.md) without a demo, HMG integration,
version bump, push, or package publication. Initial working tree was clean at
`bce1bb1`; no repository/ancestor AGENTS.md was found on the checked paths.

- Public `connectReviewCustomPanel` and definition/snapshot/connection types are
  exported from `@designfever/web-review-kit/react-shell`.
- `ReviewShellProps.customPanels` opts in, default false. Existing mount cleanup
  and built-in panels are preserved.
- `src/react-shell/custom-panels/` owns versioned discovery, a per-shell registry,
  stable mount containers, rail buttons, and target connections. No editor state,
  HMG dependencies, new dependencies, or public DOM selectors.
- Registration is bound to the active iframe and Document; IDs are validated,
  duplicates rejected, and old handles cannot delete newer owners. Snapshots are
  frozen/reference-stable. Consumer listener errors cannot interrupt cleanup.
- `custom:<id>` is transient selection. Built-in preference writes are skipped
  while a custom panel is selected; built-in buttons/actions retain their path.
- Hidden panel containers remain mounted and preserve target-owned portal state.
  Focus leaves hidden/removed panels. Close only affects the owning selection.
- Keyed iframe removal, pre-reload invalidation, pagehide/pageshow, Document changes
  on load, and shell teardown revoke old containers. Host restart reconnects a
  surviving target; full document reload does not persist editor values.

## Verification

- `pnpm typecheck` — passed.
- `pnpm typecheck:dev` — passed.
- `NODE_OPTIONS=--no-experimental-webstorage pnpm test` — **59 files, 301 tests passed**,
  including 21 new tests in `custom-panels.test.ts` and `integration.test.tsx`.
- Plain `pnpm test` initially failed in 8 existing tests because Node v26.8.1
  exposes experimental web storage that shadows jsdom storage. The command above
  disables that Node feature for this process; no environment/config workaround
  was committed. The feature tests passed independently of that adjustment.
- `pnpm build` — passed (ESM, CJS, declarations, CLI).
- `pnpm build:dev` — passed (Vite emitted its non-fatal >500 kB chunk warning).
- Built ESM/CJS imports expose the public connection function; both return an
  unavailable snapshot outside the browser and dispose successfully. Generated
  declarations include the three public types, function, and opt-in flag.
- `git diff --check` — passed.

Tests exercise host-first/target-first readiness, duplicate/invalid registrations,
selection across all built-ins, close/dispose ownership, focus, shell restart,
pre-reload revocation, pagehide/pageshow ordering, frame replacement, instance
isolation, unavailable states, and throwing consumers. React StrictMode tests
verify one portal editor with target context, live input updates, preserved DOM
identity through hide/show, built-in preference persistence, and portal cleanup.

## Remaining verification boundary

These are automated jsdom and build checks, not real-browser claims. Separate
parent/iframe bundles, full navigation/reload behavior, CSS/fonts/popups, accurate
viewport sizing, and detached-document memory checks still need the planned
`dev:review` demo and browser-verification steps. No demo fixture was modified.
