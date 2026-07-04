# Testing

`df-web-review-kit` uses Vitest for package-level unit and adapter contract tests.

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

The adapter contract suite lives in `src/adapters/adapter.contract.test.ts`.

It verifies that the built-in local and Supabase adapters:

- support `create`, `list`, `get`, `update`, and `remove`
- filter by project, route, and status
- preserve attachments, external links, assignee, and status metadata
- only return `dom` and `area` review item kinds
- filter legacy point-note rows instead of showing them in the QA list

The Supabase coverage uses an in-memory PostgREST/RPC mock. It does not contact a real Supabase project.

## When to Add Tests

Add or extend Vitest coverage when changing:

- `ReviewItem` shape or adapter normalization
- localStorage migration behavior
- Supabase row mapping, RPC payloads, or review URL generation
- attachment upload contracts
- status, assignee, or external link fields

Use Playwright only for browser-visible shell flows, screenshots, or iframe interaction. Adapter regressions should stay in Vitest because they are faster and easier to run in package CI.
