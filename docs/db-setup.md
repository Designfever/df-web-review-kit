# DB Setup

Supabase is an optional backend adapter. A host project may use it for canonical QA items and Realtime Presence, but the public package does not own the Supabase project or any operator secrets.

## Environment

Start from [.env.sample](../.env.sample), then fill Supabase values only in the host project that uses the Supabase adapter.

```env
VITE_REVIEW_PROJECT_ID=my-project
VITE_REVIEW_SUPABASE_URL=
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_TABLE=review_items
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
```

Use only an `anon` key in browser env. Keep `service_role`, OpenClaw `KUKU_*`, and future admin keys in an operator layer or backend service.

## Review Item Schema

Run this in the Supabase SQL editor to create the tables, indexes, RPC, and grants.

```sql
create table if not exists public.review_items (
  id text primary key,
  project_id text not null,
  route_key text not null,
  source text not null default 'supabase',
  review_number integer,
  status text not null default 'todo',
  item jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists review_items_project_review_number_idx
  on public.review_items (project_id, source, review_number)
  where review_number is not null;

create index if not exists review_items_project_route_updated_idx
  on public.review_items (project_id, source, route_key, updated_at desc);

create index if not exists review_items_project_status_idx
  on public.review_items (project_id, source, status);

create table if not exists public.review_project_counters (
  project_id text not null,
  source text not null default 'supabase',
  next_review_number integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (project_id, source),
  constraint review_project_counters_next_review_number_check
    check (next_review_number > 0)
);

create or replace function public.create_review_item(
  p_id text,
  p_project_id text,
  p_route_key text,
  p_source text,
  p_status text,
  p_item jsonb
)
returns public.review_items
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_review_number integer;
  v_now timestamptz := now();
  v_row public.review_items;
begin
  insert into public.review_project_counters (
    project_id,
    source,
    next_review_number,
    updated_at
  )
  select
    p_project_id,
    p_source,
    coalesce(max(review_number), 0) + 2,
    v_now
  from public.review_items
  where project_id = p_project_id
    and source = p_source
  on conflict (project_id, source) do update
    set next_review_number = greatest(
          public.review_project_counters.next_review_number + 1,
          excluded.next_review_number
        ),
        updated_at = excluded.updated_at
  returning next_review_number - 1 into v_review_number;

  insert into public.review_items (
    id,
    project_id,
    route_key,
    source,
    review_number,
    status,
    item,
    created_at,
    updated_at
  )
  values (
    p_id,
    p_project_id,
    p_route_key,
    p_source,
    v_review_number,
    p_status,
    p_item || jsonb_build_object(
      'id', p_id,
      'reviewNumber', v_review_number,
      'projectId', p_project_id,
      'routeKey', p_route_key,
      'normalizedPath', coalesce(nullif(p_item->>'normalizedPath', ''), p_route_key),
      'status', p_status,
      'externalIssueId', p_id,
      'submittedAt', coalesce(p_item->>'submittedAt', v_now::text),
      'submitStatus', coalesce(p_item->>'submitStatus', 'submitted'),
      'createdAt', v_now::text,
      'updatedAt', v_now::text
    ),
    v_now,
    v_now
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_review_item(
  text,
  text,
  text,
  text,
  text,
  jsonb
) to anon;

grant select, insert, update, delete on public.review_items to anon;
grant select, insert, update on public.review_project_counters to anon;
```

## RLS Policies

Run this after the schema SQL. Replace `df-web-review-kit` if `VITE_REVIEW_PROJECT_ID` uses a different value.

```sql
alter table public.review_items enable row level security;
alter table public.review_project_counters enable row level security;

drop policy if exists review_items_sample_read on public.review_items;
create policy review_items_sample_read
  on public.review_items
  for select
  to anon
  using (project_id = 'df-web-review-kit');

drop policy if exists review_items_sample_insert on public.review_items;
create policy review_items_sample_insert
  on public.review_items
  for insert
  to anon
  with check (project_id = 'df-web-review-kit');

drop policy if exists review_items_sample_update on public.review_items;
create policy review_items_sample_update
  on public.review_items
  for update
  to anon
  using (project_id = 'df-web-review-kit')
  with check (project_id = 'df-web-review-kit');

drop policy if exists review_items_sample_delete on public.review_items;
create policy review_items_sample_delete
  on public.review_items
  for delete
  to anon
  using (project_id = 'df-web-review-kit');

drop policy if exists review_project_counters_sample_read on public.review_project_counters;
create policy review_project_counters_sample_read
  on public.review_project_counters
  for select
  to anon
  using (project_id = 'df-web-review-kit');

drop policy if exists review_project_counters_sample_insert on public.review_project_counters;
create policy review_project_counters_sample_insert
  on public.review_project_counters
  for insert
  to anon
  with check (project_id = 'df-web-review-kit');

drop policy if exists review_project_counters_sample_update on public.review_project_counters;
create policy review_project_counters_sample_update
  on public.review_project_counters
  for update
  to anon
  using (project_id = 'df-web-review-kit')
  with check (project_id = 'df-web-review-kit');
```

## Adapter Behavior

- `list`: reads by `project_id`, `source`, optional `route_key`, optional `status`.
- `create`: discards local draft number and calls `create_review_item` for a canonical `review_number`.
- `update`: updates row columns and the nested `item` JSON.
- `remove`: deletes the row.

Remote numbers are canonical. Local draft numbers can overlap between browsers and are not reused as remote numbers.

## Presence

Supabase Presence is optional session state. It is not QA item storage.

Default topic:

```txt
review-presence-<projectId>
```

The adapter normalizes unsafe topic characters. `private=false` is enough for quick dev validation. `private=true` requires an authenticated Supabase session and Realtime authorization policies for `realtime.messages`.

Use project-level channels instead of page-level channels so the sitemap can show who is on each page.

## Security

The RLS policies above are sample/dev policies. Anyone with the anon key and allowed `project_id` can create, update, and delete QA rows.

For production, use one of these instead:

- Supabase Auth plus project member table based RLS
- Supabase Edge Function
- host project backend proxy
- private admin service

Never put a `service_role` key in browser env.

## Validation

1. Open `/review?source=supabase`.
2. Create a local item.
3. Submit it to remote.
4. Confirm the local draft disappears.
5. Confirm remote list/get works.
6. Change status.
7. Delete the remote item.
8. Create another remote item and confirm the number is not reused.
9. If presence is enabled, open two browser tabs and confirm each user appears on the active page or sitemap.
