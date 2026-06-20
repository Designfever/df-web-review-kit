# review-kit adapter handoff

## 목적

`df-web-review-kit`를 Lexus repo 안에서 검증한 뒤 별도 package repo로 옮기기 위한 handoff 문서다.

현재 방향은 review shell/core와 저장소를 분리하고, project page에서는 adapter array만 선언해서 local, remote, Supabase 같은 저장소를 교체 가능하게 만드는 것이다.

## 현재 상태

- Mount 위치: `page/review/index.tsx`
- Package 위치: `packages/df-web-review-kit`
- 현재 source: `local`, `df-sheet`
- 현재 shell-facing adapter config: array
- core-facing internal adapter: 기존 `WebReviewKitAdapter`
- local item id: uuid
- local 표시 번호: 개인 draft용 `reviewNumber`
- remote 표시 번호: remote source가 새로 배정하는 canonical `reviewNumber`
- remote submit 성공 시 local item은 삭제하고, remote source에서 새 canonical id/number item으로 조회한다.

현재 public shell adapter는 generic `update`를 노출하지 않는다.

```ts
type ReviewShellAdapter = {
  label: ReviewSource;
  pageId?: string;
  get: WebReviewKitAdapter['get'];
  list: WebReviewKitAdapter['list'];
  create: WebReviewKitAdapter['create'];
  statusOptions?: readonly ReviewShellStatusOption[];
  updateStatus?: (input: ReviewShellUpdateStatusInput) => Promise<ReviewItem>;
  syncSubmission?: (input: ReviewShellSyncSubmissionInput) => Promise<ReviewItem>;
  remove?: WebReviewKitAdapter['remove'];
};
```

의도:

- `create`: QA 생성 또는 remote 등록
- `list/get`: source별 QA 조회와 deep link restore
- `statusOptions + updateStatus`: 상태 변경 UI
- `remove`: 삭제 버튼 노출 조건
- `syncSubmission`: remote 등록 중/실패 상태를 local item에 임시 기록하는 좁은 bookkeeping

## 결정된 원칙

- shell public adapter에는 generic `update`를 넣지 않는다.
- 상태 변경은 `updateStatus`로만 다룬다.
- `statusIndex`는 identity가 아니라 외부 시스템 매핑 보조값이다.
- 저장 기준은 stable status value다.
- source가 기능을 제공하지 않으면 shell은 해당 버튼/UI를 숨기거나 readonly badge로 보여준다.
- `local`은 생성, 상태 변경, 삭제, remote submit 중/실패 상태 기록을 담당한다.
- `df-sheet`는 현재 review-kit 안에서는 remote 등록과 읽기 중심으로 둔다.

## Supabase adapter

Supabase adapter를 하나 붙이면 adapter 계약 검증에 좋다. df-sheet보다 DB schema를 직접 통제할 수 있어서 `statusOptions`, `updateStatus`, `remove`의 동작 경계를 확인하기 쉽다.

초기 source 이름은 `supabase`로 잡았다.

```ts
{
  label: 'supabase',
  get,
  list,
  create,
  statusOptions,
  updateStatus,
  remove,
}
```

현재 구현:

- Adapter: `packages/df-web-review-kit/src/adapters/supabase.ts`
- Lexus wiring: `page/review/index.tsx`
- SQL/runbook: `packages/df-web-review-kit/docs/supabase-review-items.md`
- `ReviewSource`는 string 확장 가능 타입으로 풀었다.
- route query의 `source` 처리는 `source !== 'local'` 기준으로 일반화했다.
- shell은 adapter array의 첫 non-local adapter를 remote source로 사용한다.
- source별 list title, empty text도 label 기반으로 바꿨다.

## Supabase schema

브라우저에서 직접 붙이는 빠른 검증은 anon key + RLS 기준으로 시작한다. service role key는 브라우저에 절대 넣지 않는다.

현재 schema/runbook은 `supabase-review-items.md`가 source of truth다.

핵심 구조:

- `review_items`: QA row. 실제 review item payload는 `item jsonb`에 저장한다.
- `review_project_counters`: `(project_id, source)`별 다음 `review_number`를 보관한다.
- `create_review_item`: counter row를 짧게 증가시키고 canonical `review_number`를 item에 주입해서 insert한다.

주의:

- 이 RLS는 dev 검증용이다.
- production/package용으로는 Supabase Edge Function 또는 project-scoped backend proxy가 더 안전하다.
- RLS 조건에 쓰는 컬럼에는 인덱스를 둔다.

## Supabase adapter draft

Adapter option:

```ts
type SupabaseReviewAdapterOptions = {
  url: string;
  anonKey: string;
  table?: string;
  projectId: string;
  source?: string;
  createRpc?: string;
  unsafeClientReviewNumberFallback?: boolean;
};
```

API mapping:

- `get(id)`: `select().eq('id', id).maybeSingle()`
- `list(query)`: `project_id`, `route_key`, optional `status` filter
- `create(item)`: `create_review_item` RPC로 canonical id/number 발급 후 review item 반환
- `updateStatus({ id, status })`: `status`, `updated_at`만 patch
- `remove(id)`: row delete

local `reviewNumber`는 사람별 draft 번호라 서로 겹칠 수 있다. remote submit 시 local 번호를 보존하지 않고 Supabase adapter가 새 `id`와 새 canonical `reviewNumber`를 배정한다.

현재 구현은 `create_review_item` RPC가 `review_project_counters` row를 `insert ... on conflict ... do update returning`으로 증가시켜 `review_number`를 발급하고 row를 insert한다. 동시 등록 충돌과 삭제 후 번호 재사용을 피하기 위한 구조다. `unsafeClientReviewNumberFallback` option을 켜면 예전 client `max(review_number) + 1` 방식을 쓸 수 있지만 dev 임시 용도다.

## 작업 순서

1. `ReviewSource`/route/source select를 adapter label 기반으로 일반화한다.
2. `supabaseAdapter` 파일을 추가한다.
3. `page/review/index.tsx`에 Supabase adapter config를 선택적으로 추가한다.
4. `.env` 예시를 문서화한다.
5. local, df-sheet, supabase source 전환을 브라우저에서 확인한다.
6. `pnpm --dir packages/df-web-review-kit typecheck`
7. `pnpm typecheck:review`
8. `pnpm review-kit:build`

## Open questions

- Supabase는 dev 검증만 할지, package 정식 adapter로 포함할지.
- remote source에서 delete를 허용할지.
- remote source의 `reviewNumber`를 사람이 쓰는 canonical id로 확정할지.
- auth를 anon+RLS로 유지할지, Edge Function/proxy로 감쌀지.
- status option을 package default로 둘지, project page config에서만 주입할지.
