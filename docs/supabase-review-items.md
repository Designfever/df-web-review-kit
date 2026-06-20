# Supabase review item adapter

## Purpose

`df-web-review-kit`의 remote QA 저장소를 Supabase table로 검증하기 위한 문서다.

Lexus pilot:

```txt
project: bb-qa
url: https://vhqnvfkamnpgyqclohso.supabase.co
table: review_items
source: supabase
```

## Environment

```env
VITE_REVIEW_SUPABASE_URL=https://vhqnvfkamnpgyqclohso.supabase.co
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_TABLE=review_items
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
```

`anon` key만 browser env에 넣는다. `service_role` key는 browser env에 넣지 않는다.

## Schema

Supabase SQL editor에서 실행한다.

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

alter table public.review_items enable row level security;
alter table public.review_project_counters enable row level security;

drop policy if exists review_items_lexus_read on public.review_items;
create policy review_items_lexus_read
  on public.review_items
  for select
  to anon
  using (project_id = 'lexus-official-v2026');

drop policy if exists review_items_lexus_insert on public.review_items;
create policy review_items_lexus_insert
  on public.review_items
  for insert
  to anon
  with check (project_id = 'lexus-official-v2026');

drop policy if exists review_items_lexus_update on public.review_items;
create policy review_items_lexus_update
  on public.review_items
  for update
  to anon
  using (project_id = 'lexus-official-v2026')
  with check (project_id = 'lexus-official-v2026');

drop policy if exists review_items_lexus_delete on public.review_items;
create policy review_items_lexus_delete
  on public.review_items
  for delete
  to anon
  using (project_id = 'lexus-official-v2026');

drop policy if exists review_project_counters_lexus_read on public.review_project_counters;
create policy review_project_counters_lexus_read
  on public.review_project_counters
  for select
  to anon
  using (project_id = 'lexus-official-v2026');

drop policy if exists review_project_counters_lexus_insert on public.review_project_counters;
create policy review_project_counters_lexus_insert
  on public.review_project_counters
  for insert
  to anon
  with check (project_id = 'lexus-official-v2026');

drop policy if exists review_project_counters_lexus_update on public.review_project_counters;
create policy review_project_counters_lexus_update
  on public.review_project_counters
  for update
  to anon
  using (project_id = 'lexus-official-v2026')
  with check (project_id = 'lexus-official-v2026');
```

## Migration from max+1 RPC

이미 `review_items`와 이전 `create_review_item` RPC를 만든 DB에서는 아래 블록만 실행한다.

```sql
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

grant select, insert, update on public.review_project_counters to anon;

alter table public.review_project_counters enable row level security;

drop policy if exists review_project_counters_lexus_read on public.review_project_counters;
create policy review_project_counters_lexus_read
  on public.review_project_counters
  for select
  to anon
  using (project_id = 'lexus-official-v2026');

drop policy if exists review_project_counters_lexus_insert on public.review_project_counters;
create policy review_project_counters_lexus_insert
  on public.review_project_counters
  for insert
  to anon
  with check (project_id = 'lexus-official-v2026');

drop policy if exists review_project_counters_lexus_update on public.review_project_counters;
create policy review_project_counters_lexus_update
  on public.review_project_counters
  for update
  to anon
  using (project_id = 'lexus-official-v2026')
  with check (project_id = 'lexus-official-v2026');
```

## Current adapter behavior

- `list`: `project_id`, `source`, optional `route_key`, optional `status`로 조회한다.
- `create`: local draft id/number를 버리고 새 `id`를 만든 뒤 `create_review_item` RPC로 canonical `review_number`를 발급하고 insert한다.
- `update`: status 포함 item patch를 JSONB와 query 컬럼에 반영한다.
- `remove`: row를 삭제한다.

## Security note

위 RLS는 dev 검증용이다. 누구든 anon key와 project id를 알면 QA row를 만들고 수정할 수 있다.

package 배포 전에는 다음 중 하나로 좁히는 것을 권장한다.

- authenticated user + project member table 기반 RLS
- Supabase Edge Function 또는 project backend proxy
- private deployment 내부에서만 노출되는 service endpoint

## Numbering note

local item의 `#id`는 개인 draft 번호라 여러 사용자가 동시에 작업하면 겹칠 수 있다.

remote source에 등록될 때는 Supabase adapter가 local 번호를 버리고 새 canonical `review_number`를 받는다. 기본 create 경로는 `create_review_item` RPC를 사용한다. RPC는 `review_project_counters` row를 `insert ... on conflict ... do update returning`으로 증가시켜 같은 project/source 번호 발급만 짧게 직렬화한다. 삭제된 번호도 재사용하지 않는다.

`unsafeClientReviewNumberFallback: true`를 adapter option에 넣으면 예전 client-side `max(review_number) + 1` fallback을 사용할 수 있지만, 동시 등록에서 충돌 가능성이 있으므로 dev 임시 용도 외에는 쓰지 않는다.
