# df-sheet adapter reference

## Purpose

This document keeps the df-sheet integration as adapter reference material for
`df-web-review-kit`.

df-sheet is not the package's default backend yet. The current package should be
understood as review UI, restore logic, and adapter contracts. df-sheet can later
become a service backend when its API, auth, permissions, and optional presence
contract are fixed.

## Current status

- The repo may keep `src/adapters/df-sheet.ts` as a reference implementation.
- The adapter is not a stable public package API.
- The root package export should not expose `dfSheetAdapter` until the df-sheet
  service contract is stable.
- Host projects should not treat this as a ready production backend.

## Non-goals

- Do not turn review-kit into a full df-sheet issue editor.
- Do not expose broad issue CRUD from the browser.
- Do not store restore metadata in a hidden block inside `description`.
- Do not require df-sheet for normal package installation.

## Expected df-sheet service contract

### Database

Add a nullable JSON field to `issues`.

```sql
alter table issues
add column if not exists review_metadata jsonb null;
```

Human-readable QA content stays in `title` and `description`.
Restore data stays in `review_metadata`.

### API

Prefer review-kit-specific endpoints instead of widening the generic issue API.

```txt
GET    /api/review-kit/issues
GET    /api/review-kit/issues/:id
POST   /api/review-kit/issues
PATCH  /api/review-kit/issues/:id/status
```

Optional:

```txt
DELETE /api/review-kit/issues/:id
```

Every response that is converted back into a review item must include
`review_metadata`.

### Auth

Use a narrow integration token or same-domain authenticated session.

Recommended integration-token scope:

- one `project_id`
- one `page_id`
- allowed actions: `create`, `read`, optional `update_status`, optional `delete`
- attachment upload only for issues in that scope

If the browser can see the token, assume it can leak and keep the scope small.
For production service use, prefer a backend proxy or df-sheet domain auth.

## Adapter options

```ts
type DfSheetAdapterOptions = {
  baseUrl?: string;
  projectId: string;
  pageId: string;
  reviewProjectId?: string;
  reviewPathPrefix?: string;
  source?: string;
  issueType?: string;
  priority?: string;
  token?: string;
};
```

Reference host usage:

```ts
createWebReviewKit({
  projectId: 'my-project',
  adapter: dfSheetAdapter({
    baseUrl: 'https://df-sheet.example.com',
    projectId: '<df-sheet-project-id>',
    pageId: '<df-sheet-page-id>',
    token: '<scoped-integration-token>',
    reviewProjectId: 'my-project',
    issueType: 'task',
    priority: 'medium',
  }),
});
```

## Adapter behavior

The df-sheet adapter should be narrow:

- `create`: local QA item to df-sheet issue
- `list`: df-sheet issue list to review items
- `get`: df-sheet issue detail to review item for deep-link restore
- `updateStatus`: optional, status-only
- `remove`: optional, only if df-sheet service explicitly supports safe delete
- generic `update`: avoid

## Status mapping

df-web-review-kit:

- `todo`
- `doing`
- `review`
- `hold`
- `done`

df-sheet example:

- `todo`
- `in_progress`
- `review`
- `on_hold`
- `done`

Mapping:

```ts
const toDfSheetStatus = {
  todo: 'todo',
  doing: 'in_progress',
  review: 'review',
  hold: 'on_hold',
  done: 'done',
} as const;

const fromDfSheetStatus = {
  todo: 'todo',
  in_progress: 'doing',
  review: 'review',
  on_hold: 'hold',
  done: 'done',
} as const;
```

If df-sheet uses a different status vocabulary, keep that mapping inside the
adapter.

## Review metadata

The metadata must be enough to rebuild a `ReviewItem` from a df-sheet issue.

```ts
type DfSheetReviewMetadata = {
  schema: 'df-web-review-kit';
  version: 1;
  reviewProjectId: string;
  routeKey: string;
  pageUrl: string;
  originalUrl?: string;
  normalizedPath: string;
  scope?: ReviewItemScope;
  kind: ReviewItemKind;
  viewport: ViewportSize;
  devicePixelRatio?: number;
  scroll?: { x: number; y: number };
  anchor?: DomAnchor;
  marker?: ReviewMarker;
  selection?: ReviewSelection;
  reviewUrl?: string;
};
```

Do not store screenshot data URLs in metadata. Use df-sheet attachments.

## Deep-link flow

Target URL:

```txt
/review?target=/path&w=390&h=720&item=<issue.id>
```

Flow:

1. `ReviewShell` reads `item` from the query string.
2. It calls `adapter.get(itemId)`.
3. The adapter fetches `GET /api/review-kit/issues/:id`.
4. It maps the df-sheet issue to `ReviewItem`.
5. `ReviewShell` restores target route and viewport from the item metadata.
6. It reloads the target iframe.
7. It highlights the restored item after the target document is ready.

The query params `target`, `w`, and `h` are early rendering hints.
`adapter.get(item)` is the source of truth.

## List sync

MVP behavior:

- load list on review shell mount
- reload after create or status update
- reload when target route changes
- reload on manual refresh
- optionally reload when the window regains focus

Do not start with realtime sync. Add a df-sheet service presence/realtime
adapter only if the service contract needs team live state.

## Package boundary

Keep df-sheet-specific code isolated.

- public shell adapter contracts stay storage-agnostic
- df-sheet endpoint names and payload types stay inside the adapter
- root package export should not expose df-sheet as stable API yet
- docs describe this as reference/sample material until the service contract is
  fixed

Possible later public path:

```txt
@designfever/web-review-kit/adapters/df-sheet
```

Do not add that export until create/list/get/status/restore/auth are verified
against the real df-sheet service contract.

## Verification before promotion

- `pnpm typecheck`
- `pnpm build`
- create text QA from a host review page
- create capture QA with attachment upload
- list reload shows created issues
- status update maps both directions if enabled
- deep link restores route, viewport, and highlighted QA
- df-sheet issue detail shows title, description, status, attachment, and link
- package export map exposes df-sheet only through the chosen adapter path

## Open questions

- final df-sheet review-kit endpoint shape
- integration token creation and rotation flow
- cookie auth vs integration token
- df-sheet issue type dedicated to QA
- status vocabulary mapping
- whether remote delete becomes archive instead of hard delete
