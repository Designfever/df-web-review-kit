# Testing

`df-web-review-kit` uses Vitest (jsdom environment) for package-level unit and adapter contract tests.

## Commands

```bash
pnpm test
pnpm test:watch
```

Use the full package check before release or when touching public types:

```bash
pnpm typecheck
pnpm test
pnpm lint:dead-code
pnpm build
pnpm typecheck:dev
pnpm build:dev
npm pack --dry-run --json
```

## Current Coverage

### Adapter contract suite

`src/adapters/adapter.contract.test.ts` verifies that the built-in local and Supabase adapters:

- support `create`, `list`, `get`, `update`, and `remove`
- filter by project, route, and status
- preserve attachments, external links, assignee, and status metadata
- only return `dom` and `area` review item kinds
- filter legacy point-note rows instead of showing them in the QA list

The Supabase coverage uses an in-memory PostgREST/RPC mock. It does not contact a real Supabase project.

### Regression and unit suites

Colocated `*.test.ts` and `*.test.tsx` files cover the runtime contracts that
refactors depend on:

- `src/design-inspector/target.events.test.ts`: current-mode event policy, native touch pointerdown, and document/window/viewport/font listener cleanup.
- `src/design-inspector/inspector.test.ts`: rendering, selection, source resolution, iframe rebind, pending source-open invalidation and observer/session teardown.
- `src/core/web.review.kit.app.test.ts`: the interaction-layer host stays fixed to the viewport without blocking pointer events globally.
- `src/core/geometry.test.ts`: coordinate conversion (host/target spaces), clamping, selection shapes, popover placement.
- `src/core/hotkey.test.ts`: hotkey matching with modifiers, Korean IME key aliases, physical key-code fallback, and editable-target blocking including `<select>`.
- `src/core/location.test.ts`: page URL building and review-internal query param stripping.
- `src/core/review/scope.test.ts`: viewport preset matching, scope inference, and item numbering/draft labels.
- `src/react-shell/route.test.ts`: shell URL updates preserve the current hash while changing target or selected QA item.
- `src/react-shell/figma/use.image.overlay.test.tsx`: unchanged image-list refreshes do not rewrite overlay state in localStorage.
- `src/react-shell/sitemap/tree.test.ts`: status filters use OR with each other, AND with search, and return flat full-path page rows.
- `src/react-shell/sitemap/modal.test.tsx`: closing and reopening the sitemap preserves search and status-filter state.
- `src/figma/parse.test.ts`: Figma URL/node-ref parsing, including non-figma host rejection.
- `src/figma/image.asset.test.ts`: shared storage-key validation and MIME/format helpers.
- `src/figma/image.target.test.ts`: persisted store/overlay key formats and existing client-store re-exports.
- `src/vite/figma-asset.test.ts`: server asset pathname decoding, including encoded traversal rejection.
- `src/vite/figma-image-store.server.test.ts`: dev middleware request guards — cross-origin (CSRF) rejection, JSON content-type enforcement, body size limit.
- `src/vite/figma-image-store.image.test.ts`: image store mutation lock ordering, lost-update prevention, and atomic data-file writes.
- `src/react-shell/source-tree/source.open.test.ts`: repeated same-source element indexing (`#i/n`) and the per-call document scan cache.

Security-relevant behavior (figma.com host allowlist, asset path traversal guard) is pinned by these tests; keep them green when touching `src/figma/parse.ts`, `src/figma/image.asset.ts`, or `src/vite/figma-asset.ts`.

## When to Add Tests

Add or extend Vitest coverage when changing:

- `ReviewItem` shape or adapter normalization
- localStorage migration behavior
- Supabase row mapping, RPC payloads, or review URL generation
- attachment upload contracts
- status, assignee, or external link fields
- route-keyed Figma image overlay storage or migration behavior
- sitemap count aggregation, filtering, sorting, or close/reopen state
- coordinate/scope/route/parsing helpers listed above (extend the colocated suite)

## Known Behavior Notes

- `getReviewItemScope` (`src/core/review/scope.ts`) intentionally never returns `dom`: a legacy `dom`/`element` scope falls back to viewport-based grouping so those items keep showing markers (marker visibility requires `scope === currentScope`, and the current scope is always a viewport scope). Current code never persists a `dom` scope, so this path only applies to legacy data. `scope.test.ts` pins this behavior.

Use Playwright only for browser-visible shell flows, screenshots, or iframe interaction. Adapter regressions should stay in Vitest because they are faster and easier to run in package CI.


## Custom-panel browser regression

Use a local-only dev server (empty Supabase URL prevents remote adapters/presence):

```sh
VITE_REVIEW_SUPABASE_URL= pnpm dev:review
```

In a second terminal, with Puppeteer installed in the test environment:

```sh
node scripts/e2e/custom-panel.mjs
```

Optional environment variables: `PUPPETEER_MODULE` (module name or absolute module
path), `CHROME_BIN` (installed Chrome executable), `REVIEW_BASE_URL` (localhost /
127.0.0.1 only, defaults to port 5177), and `REVIEW_EVIDENCE_DIR` (screenshots and
JSON results). Puppeteer is optional tooling, not a runtime package dependency.
The script blocks external HTTP requests and fails if any were attempted. Do not
point it at a remotely configured fixture. It edits only the local demo, never
creates/updates QA records, and uses a fresh browser profile.

Coverage: ordinary URL controls, portal text/color, keyboard focus/Tab, all rail
panels/shortcuts, duplicate IDs, 390/620/768/1920px target widths, responsive styles,
reload resets, document and SPA navigation, and stale-container detachment.
Garbage collection is recorded separately as an observation, not a deterministic
pass/fail gate or an exhaustive heap leak proof. Retained detached containers must
not be reported as collected; an inconclusive result remains visible in the JSON. This script targets the source-served dev fixture, not a production
site. See [Custom panels](custom-panels.md) for the integration contract.

On Node 26, if experimental native web storage shadows jsdom and existing tests
fail on `localStorage`, run `NODE_OPTIONS=--no-experimental-webstorage pnpm test`.
This is a test-process workaround, not an application setting.

Source selection cleanup coverage:

- `src/react-shell/source-tree/source.selection.events.test.ts`: Alt/Option,
  Escape/blur, font deduplication, first Figma click hit-testing, Design Inspector
  exclusion, composer/outside focus policy, and old document/host listener disposal.

Source Tree observation and action coverage:

- `src/react-shell/source-tree/use.outline.observation.test.tsx`: initial rAF and
  120/500/1200ms retries, late DOM, 80ms mutation debounce, close/reload/unmount
  cancellation and observer disposal.
- `src/react-shell/source-tree/use.section.outline.test.tsx`: filter/collapse,
  late focus path surviving retries, frame reset and DOM adjustment → QA handoff.
  Both hooks are real; shell contexts/controller and canvas rasterization boundary
  are test doubles. Apply the documented Node 26 workaround if webstorage fails.

Figma import UI coverage:

- `src/react-shell/figma/images.import.test.tsx`: Figma vs image URL routing,
  successful/null mutation draft handling, file label/drop state, error precedence
  and status placement, and loading/mutation guards. Asset decoding is mocked
  at the existing helper boundary; real decoding is a local browser fixture check.

- `src/react-shell/figma/images.panel.test.tsx`: row Enter/blur/Escape and
  duplicate-save guards, single active editor, pointer threshold/order changes,
  post-drag click suppression, mutation/edit/interactive-target guards.

Core item/attachment orchestration coverage:

- `src/core/web.review.kit.app.operations.test.ts`: real app actions through a
  stubbed view boundary; required upload errors, best-effort automatic upload,
  manual capture retry/current-draft merge, capture/submit guards through async
  completion, owner metadata and preview disposal. Adapters/capture are mocks;
  this does not cover real storage uploads or browser image capture.

Vite locator coverage:

- `src/vite/review-locator.mode.test.ts`: serve/build opt-in and editor-link gates.
- `src/vite/locator.transform.test.ts`: public-plugin AST/data annotations,
  explicit hints, line preservation, matching, and generated JSX runtime source
  propagation/wrapper cleanup. Vitest's VM cannot dynamically import via
  `new Function`; this file substitutes only that loader with the real TypeScript
  module. Validate the unmodified dynamic loader separately against built
  ESM/CJS when changing plugin module boundaries.


Df-sheet session and adapter coverage:

- `src/df-sheet.test.ts`: cached-session expiry skew, selected-page validation,
  callback/state/project checks, SHA-256 PKCE challenge, logout/disconnect,
  request errors/401 identity, multipart fields and in-flight list/retry behavior.
  Fetch and storage are mocks; no real login or remote writes.

## Sequence 8 final regression — 2026-09-12

Validated `70bd8ab` after steps 01–14; step 15 changes documentation only.
Original baseline is `dab969b`. Reproduction scripts, raw logs, JSON inventories
and screenshots are under the local artifact directory
`~/Shared/AgentFiles/df-web-review-kit/`, prefixed `step-52-`.

| Check | Result |
|---|---|
| `pnpm typecheck`, `pnpm typecheck:dev` | Pass |
| `pnpm lint:dead-code` | Pass |
| `pnpm test` with default Node 26 | 4 files failed; 15 failed / 345 passed tests |
| `NODE_OPTIONS=--no-experimental-webstorage pnpm test` | 70 files / 360 tests passed |
| `pnpm build` (library + CLI) | Pass |
| `VITE_REVIEW_SUPABASE_URL= VITE_REVIEW_SUPABASE_ANON_KEY= pnpm build:dev` | Pass; >500 kB main-chunk warning remains |
| `npm pack --dry-run --json` | Pass; all 20 exports/bin target paths included |

Default-test failures arise from native Node web storage shadowing jsdom;
cleanup failures follow that missing storage setup. Preserve the original failure
log; the successful workaround run is not a default-environment pass.
Jsdom also logs its unsupported full-document navigation in redirect tests.
Pack dry-run invokes prepare/build and prints lifecycle logs before JSON;
`step-52-pack-manifest.json` is the parsed manifest, the raw output is retained.
No tarball install test or publish was performed.

### Local browser evidence

Fresh Chrome profiles, local-only dev/isolated fixtures:

- Design Inspector: pick/browse, Alt comparison, native touch scroll, stale-source
  cancellation, iframe reload and listener cleanup at 0.5/1 scale.
- Source selection: font hints, Alt/Option, Escape/blur, exclusion, reload,
  blocked/unmount cleanup. Isolated fixture uses host-context doubles.
- Figma: row rename/cancel/blur, pointer reorder/click suppression, mock-store
  refresh and opacity/offset/lock/visible/invert. Earlier step-46 artifacts retain
  URL/file import and preview checks; these were not rerun as browser import E2E
  in step 15 (their unit tests ran in the full suite).
- Core composer, QA, custom panel and populated Figma widget screenshots at
  390/1440px. Sixteen repeated fixture PNGs match the previous step results.
  That is comparison against the previous verified fixtures, not a claim that
  every app screen was compared directly against the original baseline.
- Custom-panel regression: all eight check groups/four viewport presets passed
  on retry, including reload/navigation/old-container detachment. First attempt
  timed out loading the standalone editor; cause is unconfirmed and its log is
  retained. No product fix or claim of reliable first-run loading.
- Real local adapter: Source Tree filter/collapse/select → DOM QA → save →
  full-page reload retains the comment; localStorage only, zero page errors or
  attempted external requests. Screenshots visually inspected.

### Open observations and limits

- Step-49 iframe reload once encountered null `documentElement` in
  `target/target.ts`. It was not changed or fixed; later successful runs do not
  resolve this observation. Step-52 standalone-editor timeout is separate.
- GC remains **inconclusive**: three old panel containers detached, zero observed
  collected. This is not proof of absence of leaks.
- Step-49 QA 390px before/after difference of one pixel and step-46 error-screen
  difference of seven pixels remain in original artifacts. Current repeated
  screenshots do not erase those observations.
- Local fixture favicon 404 messages remain; no product page exceptions in the
  successful asserted flows. Dev main-chunk size warning remains.
- Real df-sheet login, Supabase writes, Figma remote imports, deployed browsers,
  cross-browser coverage and packed-package installation were not tested.
  No dependency addition, push, release, deployment or Todo approval occurred.
