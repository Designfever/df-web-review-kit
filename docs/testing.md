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
pnpm build
pnpm typecheck:dev
pnpm build:dev
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

### Pure function unit suites

Colocated `*.test.ts` files cover the core pure-function modules that refactors depend on:

- `src/core/geometry.test.ts`: coordinate conversion (host/target spaces), clamping, selection shapes, popover placement.
- `src/core/hotkey.test.ts`: hotkey matching with modifiers, Korean IME key aliases, physical key-code fallback.
- `src/core/location.test.ts`: page URL building and review-internal query param stripping.
- `src/core/review/scope.test.ts`: viewport preset matching, scope inference, and item numbering/draft labels.
- `src/route.test.ts`: route path normalization (`index.html`, query/hash) and item route keys.
- `src/figma/parse.test.ts`: Figma URL/node-ref parsing, including non-figma host rejection.
- `src/vite/figma-asset.test.ts`: asset storage key validation, including path traversal rejection, and mime/format helpers.
- `src/vite/figma-image-store.server.test.ts`: dev middleware request guards — cross-origin (CSRF) rejection, JSON content-type enforcement, body size limit.
- `src/vite/figma-image-store.image.test.ts`: image store mutation lock ordering, lost-update prevention, and atomic data-file writes.
- `src/react-shell/source.open.test.ts`: repeated same-source element indexing (`#i/n`) and the per-call document scan cache.

Security-relevant behavior (figma.com host allowlist, asset path traversal guard) is pinned by these tests; keep them green when touching `src/figma/parse.ts` or `src/vite/figma-asset.ts`.

## When to Add Tests

Add or extend Vitest coverage when changing:

- `ReviewItem` shape or adapter normalization
- localStorage migration behavior
- Supabase row mapping, RPC payloads, or review URL generation
- attachment upload contracts
- status, assignee, or external link fields
- coordinate/scope/route/parsing helpers listed above (extend the colocated suite)

## Known Behavior Notes

- `getReviewItemScope` (`src/core/review/scope.ts`) intentionally never returns `dom`: a legacy `dom`/`element` scope falls back to viewport-based grouping so those items keep showing markers (marker visibility requires `scope === currentScope`, and the current scope is always a viewport scope). Current code never persists a `dom` scope, so this path only applies to legacy data. `scope.test.ts` pins this behavior.

Use Playwright only for browser-visible shell flows, screenshots, or iframe interaction. Adapter regressions should stay in Vitest because they are faster and easier to run in package CI.
