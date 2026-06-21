# Supabase presence adapter

## 목적

`df-web-review-kit`의 `ReviewPresenceAdapter` contract를 Supabase Realtime Presence로 구현하는 optional adapter 문서다. Supabase를 선택한 host project가 자기 Supabase client를 주입할 때만 사용한다.

공식 문서 기준:

- Presence는 접속자/활성 문서 같은 느리게 변하는 상태 공유에 맞다: https://supabase.com/docs/guides/realtime/presence
- Realtime은 Broadcast, Presence, Postgres Changes를 제공한다: https://supabase.com/docs/guides/realtime
- DB 변경 fan-out은 Broadcast가 scalability/security 측면에서 권장되고, Postgres Changes는 단순하지만 scale이 약하다: https://supabase.com/docs/guides/realtime/subscribing-to-database-changes
- private Broadcast/Presence는 `realtime.messages` RLS policy와 `private: true` channel 설정이 필요하다: https://supabase.com/docs/guides/realtime/authorization

## Adapter position

Supabase Presence is an optional adapter sample for host projects that choose Supabase. It is not the default presence backend for the public package.

The goal is not "sync every QA item change in realtime." The goal is "show who is currently looking at which page/viewport/source." For that use case, Supabase Presence fits better than Postgres Changes. Broadcast can be considered later for event fan-out, but item persistence remains the storage adapter's job.

현재 shell UI는 두 단계로 보여준다.

- 우측 QA panel: 현재 page에 있는 user id만 표시
- sitemap: page별 user id 표시

## Channel 전략

권장 channel topic:

```txt
review-presence-<projectId>
```

page별 channel이 아니라 project 단위 channel을 쓴다. 그래야 `/review`를 열어 둔 사람이 서로 다른 page를 보고 있어도 sitemap에서 "누가 어느 페이지에 있는지"를 볼 수 있다.

Payload의 `target`/`routeKey`로 page를 구분한다.

topic은 Supabase Realtime 호환성을 위해 `:` 같은 구분자를 쓰지 않고, adapter에서 `channelPrefix`와 `projectId`를 alphanumeric/`_`/`-` slug로 normalize한다.

## Adapter implementation

현재 구현 위치:

```txt
packages/df-web-review-kit/src/react-shell/supabase-presence.ts
```

현재 package adapter는 Supabase client를 직접 생성하지 않고 `client`를 주입받는다. Host page 쪽에서 `@supabase/supabase-js`의 `createClient()`를 호출해 넘긴다. 이렇게 하면 package 본체가 Supabase dependency에 강하게 묶이지 않는다.

현재 구현 특징:

- channel topic은 `review-presence-<projectId>`로 생성한다.
- `projectId`, `sessionId`, `userId`, `routeKey`, `target`, `source`, `viewport`, `mode`, `selectedItemId`, `selectedReviewNumber`를 track한다.
- StrictMode/HMR에서 같은 topic channel이 중복으로 남지 않도록 bridge/refCount를 둔다.
- `presenceState()` 결과는 `sessionId` 기준으로 dedupe한다.
- primary Supabase presence 연결이 실패하면 `createFallbackPresenceAdapter()`로 local BroadcastChannel presence를 쓸 수 있다.

## Public dev mode

초기 연결 검증은 public channel로도 가능하다.

```ts
const presence = createSupabasePresenceAdapter({
  client: supabase,
  private: false,
});
```

주의:

- public channel은 같은 Supabase project key를 가진 사용자가 topic을 알면 subscribe 가능하다.
- dev smoke test까지만 허용한다.

## Private mode

If a host uses Supabase Presence beyond local/dev smoke, private channels are recommended.

```ts
const presence = createSupabasePresenceAdapter({
  client: supabase,
  private: true,
});
```

The client must have an authenticated Supabase session. Private channels need Realtime Authorization policy.

## RLS sketch

Supabase Realtime Authorization은 `realtime.messages`에 대한 RLS policy로 Broadcast/Presence 권한을 계산한다.

project membership table을 둔다고 가정한다.

```sql
create table if not exists public.review_project_members (
  project_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

alter table public.review_project_members enable row level security;

create policy review_project_members_read_own
  on public.review_project_members
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists review_project_members_user_project_idx
  on public.review_project_members (user_id, project_id);
```

Presence topic은 `review-presence-<projectId>` 형식이므로 RLS에서 topic을 project id로 해석한다.

```sql
create or replace function public.review_presence_project_id(topic text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(topic, '^review-presence-', ''), topic);
$$;
```

Presence read/write policy:

```sql
create policy "authenticated can listen to review presence"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'presence'
  and exists (
    select 1
    from public.review_project_members member
    where member.user_id = (select auth.uid())
      and member.project_id = public.review_presence_project_id((select realtime.topic()))
  )
);

create policy "authenticated can track review presence"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension = 'presence'
  and exists (
    select 1
    from public.review_project_members member
    where member.user_id = (select auth.uid())
      and member.project_id = public.review_presence_project_id((select realtime.topic()))
  )
);
```

RLS performance notes:

- `auth.uid()`는 `(select auth.uid())` 형태로 감싸서 per-row 호출을 줄인다.
- RLS 조건에서 조회하는 `(user_id, project_id)`는 composite index를 둔다.
- policy가 복잡해질수록 channel join latency가 늘 수 있다.

## Env

Optional host env:

```txt
VITE_REVIEW_SUPABASE_URL=https://your-project.supabase.co
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
```

브라우저에는 anon key만 둔다. service role key는 절대 넣지 않는다.
OpenClaw `KUKU_*` 운영 env와 host browser env를 섞지 않는다.

`VITE_REVIEW_SUPABASE_ANON_KEY`가 비어 있으면 shell은 local BroadcastChannel presence로 fallback한다.

## QA checklist

1. Settings에서 각 브라우저에 다른 `User ID` 입력
2. Browser A/B: 같은 target page로 `/review?target=/&w=540&h=1080`
3. A/B 양쪽 우측 QA panel에서 서로의 user id 확인
4. Browser B를 다른 target page로 이동
5. A의 우측 QA panel에서는 B가 사라지고, sitemap에서는 B가 이동한 page에 표시되는지 확인
6. B에서 viewport 변경 후 presence payload의 viewport가 바뀌는지 devtools로 확인
7. B에서 다른 QA item 선택 후 `selectedReviewNumber`가 payload에 들어가는지 devtools로 확인
8. B tab close 후 A에서 B가 사라지는지 확인

## Open decisions

- private presence를 실제 host project에서 쓸 때 auth/member policy를 어디까지 package 문서화할지.
- sitemap presence를 별도 dashboard로 키울지.
