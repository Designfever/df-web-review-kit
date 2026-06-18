# df-sheet adapter implementation plan

## Goal

`dfSheetAdapter` connects df-web-review-kit QA items to df-sheet issues.

The first production pilot is Lexus. Keep the adapter local and project-tested
before exposing it as a package export.

## Current decision

- Use `issues.id` as the canonical QA item id.
- Add only one df-sheet field: `issues.review_metadata jsonb null`.
- Store human-readable QA content in `description`.
- Store restore data in `review_metadata`.
- Store screenshots through df-sheet `/api/upload`, then attach the returned URL
  to `issues.attachments`.
- Use a project/page scoped integration token, not an open unauthenticated API.
- Publish the adapter only after the Lexus pilot validates create, list, update,
  delete, upload, and deep-link restore.

## Required df-sheet changes

### Database

Add a nullable JSON field to `issues`.

```sql
alter table issues
add column if not exists review_metadata jsonb null;
```

### API

Pass `review_metadata` through the existing issue APIs.

- `POST /api/issues`
  - accept `body.review_metadata`
  - insert it into `issues.review_metadata`
- `PATCH /api/issues/:id`
  - accept `body.review_metadata`
  - update `issues.review_metadata`
- `GET /api/issues`
  - include `review_metadata` in list responses
- `GET /api/issues/:id`
  - include `review_metadata` in detail responses

Do not hide adapter metadata in `description`. df-sheet uses Tiptap JSON there,
so a hidden JSON block would be fragile.

### Auth

Add an integration token path for adapter calls.

Recommended rules:

- token is sent with `Authorization: Bearer <token>`
- token is scoped to one `project_id`
- token is scoped to one `page_id`
- token can only create/list/read/update/delete issues in that scope
- token can upload attachments for those issues

Do not expose issue CRUD without auth.

## Adapter config

```ts
type DfSheetAdapterOptions = {
  baseUrl: string;
  projectId: string;
  pageId: string;
  token: string;
  issueType?: string;
  issuePriority?: "low" | "medium" | "high" | "urgent";
};
```

Example usage during the Lexus pilot:

```ts
createWebReviewKit({
  projectId: "lexus-official-v2026",
  adapter: createDfSheetAdapter({
    baseUrl: "https://df-sheet.vercel.app",
    projectId: "<df-sheet-project-id>",
    pageId: "<df-sheet-page-id>",
    token: "<integration-token>",
    issueType: "task",
    issuePriority: "medium",
  }),
});
```

If the target project has no backend proxy, assume the browser can see this
token. Keep the token project/page scoped so leakage impact is limited.

## Adapter contract changes

Current adapter contract:

```ts
interface WebReviewKitAdapter {
  list(query: ReviewItemQuery): Promise<ReviewItem[]>;
  create(item: ReviewItem): Promise<ReviewItem>;
  update(id: string, patch: Partial<Omit<ReviewItem, "id" | "createdAt">>): Promise<ReviewItem>;
  remove(id: string): Promise<void>;
}
```

Add `get(id)` for deep-link restore:

```ts
interface WebReviewKitAdapter {
  get(id: string): Promise<ReviewItem | null>;
  list(query: ReviewItemQuery): Promise<ReviewItem[]>;
  create(item: ReviewItem): Promise<ReviewItem>;
  update(id: string, patch: Partial<Omit<ReviewItem, "id" | "createdAt">>): Promise<ReviewItem>;
  remove(id: string): Promise<void>;
}
```

`localAdapter` should implement `get(id)` from local storage.

## Status mapping

df-web-review-kit:

- `todo`
- `doing`
- `review`
- `hold`
- `done`

df-sheet:

- `todo`
- `in_progress`
- `review`
- `on_hold`
- `done`

Mapping:

```ts
const toDfSheetStatus = {
  todo: "todo",
  doing: "in_progress",
  review: "review",
  hold: "on_hold",
  done: "done",
} as const;

const fromDfSheetStatus = {
  todo: "todo",
  in_progress: "doing",
  review: "review",
  on_hold: "hold",
  done: "done",
} as const;
```

## Review metadata shape

The metadata must be enough to rebuild a `ReviewItem` from a df-sheet issue.

```ts
type DfSheetReviewMetadata = {
  schema: "df-web-review-kit";
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
  scroll?: {
    x: number;
    y: number;
  };
  anchor?: DomAnchor;
  marker?: ReviewMarker;
  selection?: ReviewSelection;
  reviewUrl?: string;
};
```

Avoid storing screenshot data URLs in metadata. Use `attachments`.

## Issue mapping

### ReviewItem to Issue

```ts
{
  project_id: options.projectId,
  page_id: options.pageId,
  title: item.title || makeIssueTitle(item),
  description: makeIssueDescription(item),
  status: toDfSheetStatus[normalizeReviewItemStatus(item.status)],
  priority: options.issuePriority ?? "medium",
  type: options.issueType ?? "task",
  attachments: item.screenshot ? [uploadedScreenshot] : [],
  links: makeReviewUrl(item),
  review_metadata: makeReviewMetadata(item),
}
```

### Issue to ReviewItem

```ts
{
  id: issue.id,
  externalIssueId: issue.id,
  projectId: metadata.reviewProjectId,
  routeKey: metadata.routeKey,
  pageUrl: metadata.pageUrl,
  originalUrl: metadata.originalUrl,
  normalizedPath: metadata.normalizedPath,
  scope: metadata.scope,
  kind: metadata.kind,
  title: issue.title,
  comment: extractComment(issue.description),
  status: fromDfSheetStatus[issue.status],
  viewport: metadata.viewport,
  devicePixelRatio: metadata.devicePixelRatio,
  scroll: metadata.scroll,
  anchor: metadata.anchor,
  marker: metadata.marker,
  selection: metadata.selection,
  screenshot: undefined,
  createdAt: issue.created_at,
  updatedAt: issue.updated_at ?? issue.created_at,
}
```

## Deep link flow

Target URL:

```txt
/review?target=/path&w=390&h=720&item=<issue.id>
```

Flow:

1. `ReviewShell` reads `item` from the query string.
2. It calls `adapter.get(itemId)`.
3. The adapter fetches `GET /api/issues/:id`.
4. It maps the df-sheet issue to `ReviewItem`.
5. `ReviewShell` restores target route and viewport from the item metadata.
6. It reloads the target iframe.
7. It highlights the restored item after the target document is ready.

The query params `target`, `w`, and `h` are hints for early shell rendering.
`adapter.get(item)` is the source of truth.

## List sync

MVP behavior:

- load list on review shell mount
- reload after create/update/delete
- reload when target route changes
- reload on manual refresh
- optionally reload when the window regains focus

Do not start with realtime sync. Add Supabase realtime later only if the Lexus
pilot shows that multiple reviewers need live updates.

## Delete behavior

Use the existing df-sheet delete API for the pilot:

```txt
DELETE /api/issues/:id
```

If teams want QA history preserved later, add an archive/hidden status in
df-sheet instead of hard delete.

## Implementation phases

### Phase 1: contract

- add `adapter.get(id)`
- update `localAdapter`
- update review shell deep-link restore to use adapter data instead of local
  storage only

### Phase 2: df-sheet adapter

- add `src/adapters/df-sheet.ts`
- implement `createDfSheetAdapter(options)`
- implement issue/status/metadata mapping helpers
- implement screenshot upload helper
- keep the adapter unexported or internally linked during Lexus pilot

### Phase 3: Lexus pilot

- configure Lexus review shell with df-sheet adapter options
- test create/list/update/delete
- test screenshot attachment upload
- test `/review?...&item=<issue.id>` restore
- test status changes from both review-kit and df-sheet

### Phase 4: package export

After the Lexus pilot is stable:

- export as `@designfever/web-review-kit/adapters/df-sheet`
- include adapter files in package build
- update README with installation/config examples
- publish npm package

## Verification checklist

- `pnpm typecheck`
- `pnpm build`
- create text QA from Lexus review page
- create capture QA with screenshot
- list reload shows created issues
- status update maps both directions
- delete removes item from list
- deep link restores route, viewport, and highlighted QA
- df-sheet issue detail shows title, description, status, attachment, and link

## Open questions

- Lexus df-sheet `project_id`
- Lexus df-sheet `page_id`
- integration token creation and rotation flow
- whether df-sheet should expose an issue type dedicated to QA
- whether delete should become archive after the pilot
