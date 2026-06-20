# Supabase setup

Supabase는 `df-web-review-kit`의 remote QA 저장소와 team presence backend로 쓸 수 있다.

Lexus pilot:

```txt
Supabase project: bb-qa
url: https://vhqnvfkamnpgyqclohso.supabase.co
review project id: lexus-official-v2026
source: supabase
```

## 역할

Supabase review item adapter:

- local draft를 remote QA row로 등록
- canonical `reviewNumber` 발급
- remote item list/get/update/delete
- deep link restore용 item JSON 저장

Supabase presence adapter:

- 같은 review project 안의 접속자 상태 공유
- shell UI에서는 현재 page에 있는 user id만 표시
- sitemap에서는 page별 presence 표시로 확장 가능

## Required env

```env
VITE_REVIEW_SUPABASE_URL=https://your-project.supabase.co
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_TABLE=review_items
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
```

`anon` key만 browser env에 넣는다. `service_role` key는 browser에 넣지 않는다.

## Database setup

새 Supabase project에서는 [supabase-review-items.md](supabase-review-items.md)의 `Schema` SQL을 실행한다.

이미 이전 `max(review_number) + 1` RPC를 실행한 DB에서는 [supabase-review-items.md](supabase-review-items.md)의 `Migration from max+1 RPC` 블록만 실행한다.

현재 table:

- `review_items`: QA row와 restore payload 저장
- `review_project_counters`: `(project_id, source)`별 다음 번호 저장

현재 RPC:

- `create_review_item`: counter row를 증가시키고 item을 insert

## Review number policy

local `#id`는 개인 draft 번호다. 여러 사람이 local에서 동시에 만들면 번호가 겹칠 수 있다.

remote 등록 시 Supabase adapter는 local id와 local `reviewNumber`를 버린다. `create_review_item` RPC가 새 UUID와 canonical `reviewNumber`를 부여한다.

번호 발급은 `review_project_counters`를 사용한다.

- 동시 등록 중복 방지
- 삭제 후 번호 재사용 방지
- project/source별 번호 분리

검증된 smoke:

```txt
concurrent create: #7, #8
delete #7/#8
next create: #9
```

## RLS policy

현재 Lexus pilot RLS는 dev 검증용이다.

```txt
project_id = 'lexus-official-v2026'
role = anon
```

이 방식은 anon key와 project id를 알면 row create/update/delete가 가능하다. production/package 운영에서는 다음 중 하나로 좁힌다.

- Supabase Auth + project member table 기반 RLS
- Supabase Edge Function
- project backend proxy
- private deployment 내부 service endpoint

여러 project를 같은 `bb-qa` DB에 넣는 것은 가능하다. `review_projects`와 `review_items.project_id`로 분리한다. 예:

```sql
insert into public.review_projects (id, label)
values
  ('lexus-official-v2026', 'Lexus Official v2026'),
  ('hdc-lab', 'HDC Lab')
on conflict (id) do update
set label = excluded.label;
```

Project를 추가하면 해당 `project_id`를 허용하는 RLS policy도 같이 추가해야 한다.

## Host code wiring

```tsx
import {
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
  createSupabasePresenceAdapter,
  type SupabasePresenceClient,
} from '@designfever/web-review-kit/react-shell';
import {
  supabaseAdapter,
  type SupabaseReviewClient,
} from '@designfever/web-review-kit';
import { createClient } from '@supabase/supabase-js';

const REVIEW_PROJECT_ID = 'lexus-official-v2026';
const REVIEW_PATH_PREFIX = '/review';

const supabaseClient = import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY
  ? createClient(
      import.meta.env.VITE_REVIEW_SUPABASE_URL,
      import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY
    )
  : null;

const reviewAdapter = supabaseClient
  ? supabaseAdapter({
      client: supabaseClient as unknown as SupabaseReviewClient,
      table: import.meta.env.VITE_REVIEW_SUPABASE_TABLE || 'review_items',
      projectId: REVIEW_PROJECT_ID,
      source: 'supabase',
      reviewPathPrefix: REVIEW_PATH_PREFIX,
    })
  : null;

const localPresence = createLocalPresenceAdapter({
  channelName: `${REVIEW_PROJECT_ID}:review-presence`,
});

const presence = supabaseClient
  ? createFallbackPresenceAdapter(
      createSupabasePresenceAdapter({
        client: supabaseClient as unknown as SupabasePresenceClient,
        channelPrefix: 'review-presence',
        private: import.meta.env.VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE === 'true',
      }),
      localPresence
    )
  : localPresence;
```

## Presence channel

Topic:

```txt
review-presence-<projectId>
```

Adapter는 topic에 안전하지 않은 문자를 `-`로 normalize한다.

`private=false`면 별도 Realtime RLS 없이 빠르게 검증할 수 있다. `private=true`로 바꾸려면 Supabase Realtime authorization policy가 필요하다.

## Validation

After SQL:

1. `/review?source=supabase` 접속
2. local item 생성
3. remote 등록
4. local draft 삭제 확인
5. remote source에서 item 표시 확인
6. status dropdown 변경 확인
7. delete 확인
8. 새 remote item을 만들어 번호가 재사용되지 않는지 확인
9. review page를 두 탭에서 열고 같은 page presence 표시 확인

SQL smoke:

- concurrent create 2개가 서로 다른 `review_number`를 받아야 한다.
- 두 row 삭제 후 다음 create가 더 큰 번호를 받아야 한다.

## Troubleshooting

`create_review_item rpc is required`

- Supabase client mock이나 wrapper에 `rpc`가 없는 경우다.
- 실제 `@supabase/supabase-js` client를 넘긴다.

`permission denied for table review_project_counters`

- counter table grant 또는 RLS policy가 빠진 상태다.
- `Migration from max+1 RPC` 블록을 다시 확인한다.

remote item은 보이지만 presence가 안 보임

- `VITE_REVIEW_SUPABASE_ANON_KEY`가 비어 있으면 local presence fallback만 동작한다.
- `VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=true`인데 Realtime authorization policy가 없으면 실패할 수 있다.

remote 번호가 local 번호와 다름

- 정상이다. local 번호는 draft용이고 Supabase 번호가 canonical 번호다.
