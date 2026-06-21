# df-sheet service next plan

## 목적

df-sheet를 `df-web-review-kit`의 future remote destination으로 사용할 때의 역할과 필요한 df-sheet 쪽 변경을 분리해서 정리한다.

이 문서는 확정된 production backend 계약이 아니라 df-sheet service/API 후보 기준이다. 현재 public package의 기본 backend로 취급하지 않는다.

## 현재 위치

현재 repo의 `dfSheetAdapter`는 reference implementation이다. service 계약이 고정되기 전까지 stable public API로 취급하지 않는다.

현재 동작:

- `create`: local QA item을 df-sheet issue로 등록
- `list`: df-sheet issue 목록을 review item으로 변환
- `get`: issue detail을 review item으로 변환
- `update/remove`: review-kit 안에서는 read-only로 막음
- restore data: `issues.review_metadata`
- review link: issue metadata/link에 `/review?...&item=<issueId>` 저장

현재 shell adapter에서는 df-sheet config에 `updateStatus`와 `remove`를 넣지 않는다. 따라서 df-sheet source에서는 상태 변경 dropdown은 readonly badge로만 둘 수 있고, 삭제 버튼도 숨긴다.

## 후보 역할

df-sheet service가 붙는다면 source of record가 될 수 있다. review-kit은 다음 역할까지만 한다.

- local에서 만든 QA를 df-sheet issue로 등록
- df-sheet issue를 현재 page/viewport에서 restore
- issue status를 표시
- 필요 시 status update만 좁게 허용

review-kit이 df-sheet의 전체 issue editor가 되면 안 된다.

## 상태 변경 정책

generic `update`는 넣지 않는다.

df-sheet 상태를 review-kit에서 바꾸고 싶다면 `updateStatus`만 추가한다.

```ts
{
  label: 'df-sheet',
  get,
  list,
  create,
  statusOptions: DF_SHEET_STATUS_OPTIONS,
  updateStatus: async ({ id, status, statusOption, statusIndex }) => {
    return dfSheet.updateIssueStatus(id, {
      status,
      statusIndex,
      statusLabel: statusOption.label,
    });
  },
}
```

상태 기준:

- 저장 identity: `statusOption.value`
- 표시명: `statusOption.label`
- 외부 매핑 보조값: `statusIndex`

df-sheet의 실제 status vocabulary가 다르면 adapter에서 mapping한다.

```ts
const DF_SHEET_STATUS_OPTIONS = [
  { value: 'todo', label: '작업전' },
  { value: 'doing', label: '작업중' },
  { value: 'review', label: '검토 필요' },
  { value: 'hold', label: '보류' },
  { value: 'done', label: '완료' },
] as const;
```

## df-sheet API 제안

현재 issue CRUD API를 그대로 넓히기보다 review-kit 전용 endpoint를 두는 쪽이 안전하다.

추천 endpoint:

```txt
GET    /api/review-kit/issues
GET    /api/review-kit/issues/:id
POST   /api/review-kit/issues
PATCH  /api/review-kit/issues/:id/status
```

선택 endpoint:

```txt
DELETE /api/review-kit/issues/:id
```

요청은 integration token 기준으로 project/page scope를 제한한다.

```http
Authorization: Bearer <review-kit-token>
```

Token scope:

- `project_id`
- `page_id`
- allowed actions: `create`, `read`, optional `update_status`, optional `delete`

브라우저에서 직접 token을 쓰는 경우 누출을 전제로 작게 scope를 잡는다. production에서는 backend proxy 또는 df-sheet domain cookie auth를 우선 검토한다.

## DB 필드

`issues.review_metadata jsonb`는 유지한다.

```sql
alter table issues
add column if not exists review_metadata jsonb null;
```

`review_metadata`에 들어가는 값:

- review item id
- review number
- route/normalized path
- viewport
- scroll
- anchor
- marker
- selection
- original comment
- review link
- schema/source/version

사람이 읽어야 하는 내용은 `title`/`description`에 둔다. restore에 필요한 구조 데이터는 `review_metadata`에 둔다.

## create flow

1. local item 선택
2. review-kit이 df-sheet `POST /api/review-kit/issues` 호출
3. df-sheet가 issue 생성
4. df-sheet가 issue id/url 반환
5. remote 등록 성공 시 local item은 삭제하고, 실패 시에만 `syncSubmission`으로 실패 상태를 기록

remote issue id를 local id로 덮어쓰지 않는다. 대신 remote 등록 payload에서는 사람이 볼 번호로 `reviewNumber`를 보낸다.

## list/get flow

`list`는 route 기준으로 좁게 가져온다.

```txt
project_id=<df-sheet-project-id>
page_id=<df-sheet-page-id>
review_source=df-web-review-kit
review_route_key=<target route>
```

응답에는 `review_metadata`가 반드시 포함되어야 한다. metadata가 없거나 source/schema가 맞지 않으면 adapter는 review item으로 변환하지 않는다.

## status update flow

df-sheet에서 status 변경을 허용하려면 issue 전체 patch가 아니라 status-only endpoint를 쓴다.

```txt
PATCH /api/review-kit/issues/:id/status
```

Body:

```json
{
  "status": "doing"
}
```

Response는 updated issue와 `review_metadata`를 포함한다.

review-kit adapter는 이 응답을 `ReviewItem`으로 변환한다.

## delete policy

초기에는 df-sheet delete를 review-kit에서 열지 않는 편이 낫다.

이유:

- remote issue 삭제는 팀 공유 데이터에 직접 영향이 크다.
- review-kit list에서 실수 클릭으로 삭제될 수 있다.
- df-sheet 내부 권한/감사 로그와 맞춰야 한다.

필요하면 `remove`를 adapter에 넣고, UI는 확인 modal을 추가한다. 현재 shell의 local 삭제 UX와 같은 즉시 삭제 방식으로 remote delete를 열면 안 된다.

## package 관점

df-sheet adapter를 package에 포함하게 되더라도 df-sheet 전용 타입/설정은 adapter 내부에 묶는다.

`ReviewShellAdapter`는 계속 storage-agnostic이어야 한다.

좋은 방향:

- `dfSheetAdapter(options)`는 core `WebReviewKitAdapter` 구현
- `dfSheetShellAdapter(options)` 또는 helper는 shell-facing adapter config 생성
- page/review에서는 helper를 조립해서 넘김

예시:

```ts
const dfSheet = dfSheetAdapter(options);

const REVIEW_ADAPTERS = [
  localReviewShellAdapter(local),
  dfSheetReviewShellAdapter(dfSheet, {
    pageId: options.pageId,
    statusOptions: DF_SHEET_STATUS_OPTIONS,
    canUpdateStatus: false,
  }),
];
```

## 남은 결정

- df-sheet에서 review-kit 전용 endpoint를 새로 만들지, 기존 `/api/issues`를 확장할지.
- status update를 review-kit에서 허용할지.
- integration token을 cookie auth와 병행할지.
- df-sheet issue status vocabulary와 review-kit status value를 1:1로 맞출지.
- remote delete를 허용할지.
- public package export path를 언제 열지.
