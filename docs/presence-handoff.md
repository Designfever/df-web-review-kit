# Presence strategy

## Purpose

Presence shows who is currently inside the review shell and what review context
they are looking at.

Presence is not storage. Review item adapters such as `local`, `supabase`, or a
future `df-sheet` service own persistent QA data. Presence adapters only share
temporary session state for open browser tabs.

## Product boundary

Persistent review item data:

- item title/comment/status
- route, viewport, scroll, marker, selection, DOM anchor
- remote canonical id and review number
- external issue link

Presence session data:

- current user/session id
- current route/target
- current source label
- current viewport
- current write mode
- selected review item
- reviewing/editing/idle state
- last heartbeat time

Do not put comments, screenshots, source patches, or high-frequency pointer data
in presence.

## Roles

### df-web-review-kit

The package owns:

- `ReviewPresenceAdapter` contract
- local `BroadcastChannel` adapter
- optional Supabase Presence adapter sample
- fallback adapter helper
- shell UI for current-page users and sitemap page users

The package does not own:

- production team membership
- operator secrets
- company-wide realtime service policy
- persistent QA status changes

### Host project

The consuming project decides whether presence is enabled.

- For local smoke: use `createLocalPresenceAdapter()`.
- For optional Supabase smoke: create a browser-safe Supabase client and pass it
  to `createSupabasePresenceAdapter()`.
- For a future df-sheet service: pass a df-sheet service presence adapter once
  that service contract exists.

### Future backend service

A backend such as df-sheet can own production presence later.

- auth and project membership
- private realtime channels
- dashboard-level page presence
- audit-friendly status transitions

Until then, Supabase Presence remains an optional adapter sample, not the
package's default operation model.

## Current implementation

Related files:

- `src/react-shell/presence.ts`
- `src/react-shell/supabase-presence.ts`
- `src/react-shell/types.ts`
- `src/react-shell.tsx`

Default local wiring:

```ts
import { createLocalPresenceAdapter } from '@designfever/web-review-kit/react-shell';

const presence = createLocalPresenceAdapter({
  channelName: `${REVIEW_PROJECT_ID}:review-presence`,
});

mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters,
  presence,
});
```

Optional Supabase wiring:

```ts
const localPresence = createLocalPresenceAdapter({
  channelName: `${REVIEW_PROJECT_ID}:review-presence`,
});

const presence = supabaseClient
  ? createFallbackPresenceAdapter(
      createSupabasePresenceAdapter({
        client: supabaseClient,
        channelPrefix: 'review-presence',
        private: false,
      }),
      localPresence
    )
  : localPresence;
```

## Public contract

```ts
type ReviewPresenceAdapter = {
  label: string;
  connect: (
    context: ReviewPresenceContext
  ) => Promise<ReviewPresenceSession> | ReviewPresenceSession;
};

type ReviewPresenceSession = {
  update: (state: Partial<ReviewPresenceState>) => void | Promise<void>;
  subscribe: (
    callback: (users: ReviewPresenceUser[]) => void
  ) => () => void;
  disconnect: () => void | Promise<void>;
};
```

`ReviewPresenceState` currently uses this shape:

```ts
type ReviewPresenceState = {
  projectId: string;
  sessionId: string;
  userId: string;
  displayName: string;
  color: string;
  routeKey: string;
  target: string;
  source: ReviewSource;
  viewport: {
    label: string;
    width: number;
    height: number;
    kind: 'mobile' | 'tablet' | 'desktop' | 'wide';
  };
  mode: 'idle' | 'note' | 'element' | 'area';
  selectedItemId?: string | null;
  selectedReviewNumber?: number | null;
  status: 'idle' | 'reviewing' | 'editing';
  updatedAt: string;
};
```

The `source` is the active review item source label. It is not tied to the
presence backend. A user can view `source='supabase'` while presence is local, or
view `source='local'` while presence is Supabase.

## Shell behavior

- If Settings `User ID` is empty, presence is disabled.
- If `User ID` exists, the right QA list header shows `online N` and user chips.
- User chips show `displayName`, `target`, and `viewport.label`.
- The current browser tab is marked with `is-self`.
- The sitemap can group users by target page.
- Updates are slow state only:
  - route/target
  - source
  - viewport
  - review mode
  - selected item/review number
  - status
- Scroll, mousemove, cursor position, drag position, screenshots, and comments
  are not sent through presence.

## Local adapter

`createLocalPresenceAdapter()` uses `BroadcastChannel`.

- Works across tabs in the same browser origin.
- Uses heartbeat/stale cleanup for closed tabs.
- If `BroadcastChannel` is unavailable, it effectively degrades to current-tab
  self presence.
- It is enough for local smoke tests and single-user development.

## Supabase adapter sample

Supabase Presence is useful when a host project wants cross-browser or
cross-device presence before a dedicated backend service exists.

Rules:

- Host creates and injects the Supabase client.
- Browser env may contain only an anon key.
- `private=false` is acceptable for local/dev smoke.
- `private=true` needs Supabase Auth plus Realtime Authorization RLS.
- Supabase Presence is not used for item CRUD fan-out.
- If the Supabase adapter fails, `createFallbackPresenceAdapter()` can degrade to
  local presence.

See [Supabase presence](supabase-presence.md) for the optional adapter details.

## Future df-sheet service

If df-sheet becomes the team review backend, presence can move behind that
service.

Expected shape:

- host passes a df-sheet presence adapter
- df-sheet handles user identity and membership
- df-sheet owns private realtime authorization
- package still only depends on `ReviewPresenceAdapter`

This keeps the public package from depending on one company-owned realtime
backend.

## Why this is separate from storage adapters

Storage adapter:

- `get`
- `list`
- `create`
- `updateStatus`
- `remove`
- remote promote/move

Presence adapter:

- `connect`
- `update`
- `subscribe`
- `disconnect`

The lifecycle is different. Storage is persistent item state. Presence is
websocket/session state. Mixing them would make source switching and
collaboration state harder to reason about.

## Verification

- Open two tabs with different User IDs.
- Confirm both users appear on the same review page.
- Move one tab to another target page.
- Confirm current-page users update and sitemap page users move.
- Change viewport and selected item.
- Confirm only slow state changes are reflected.
- Close one tab and confirm stale presence disappears.
- Run the same flow with Supabase optional presence if that adapter is enabled.

## Decisions

- Presence is transient collaboration state.
- Presence is not a source of record for QA items.
- Local presence is the default smoke path.
- Supabase Presence is optional sample/dev infrastructure.
- Future production presence can live in df-sheet or another backend service.
- Public package docs describe contracts and safe wiring, not internal operator
  secrets.
