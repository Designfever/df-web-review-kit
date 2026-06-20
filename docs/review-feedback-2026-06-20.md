# Review feedback 2026-06-20

`packages/df-web-review-kit`를 독립 package로 분리하기 전에 확인할 리뷰 메모다.

검토자:

- 빵빵: package source와 host wiring typecheck 확인
- 팡팡: 기능 버그와 adapter edge case 리뷰
- 오빵: package 경계, 구조, concept 방향 리뷰

## 결론

컨셉은 유지할 만하다. 차별점은 browser extension이나 외부 SaaS가 아니라 host project 안에 `/review` shell을 심어서 route, viewport, DOM anchor, style context를 그대로 쓰는 점이다.

다만 0.1 안정성은 `anchor restore` 신뢰도에 걸려 있다. DOM anchor가 흔들리면 이 package는 좌표 메모장 수준으로 내려간다.

## High priority

### 1. DOM anchor restore 조건 수정

파일:

```txt
src/react-shell/anchor-restore.ts
```

현재 문제:

```ts
if (!anchor || item.scope !== 'dom') return undefined;
```

element mode로 만든 item은 `anchor`와 `selection`을 가지지만, `scope`는 `mobile`, `tablet`, `desktop`, `wide` 같은 viewport preset으로 저장된다. 그래서 restore 시 anchor 기반 scroll 복원이 early return으로 막힐 수 있다.

판정 기준은 shell의 `isDomReviewItem`과 맞춰야 한다.

권장 방향:

```ts
const isAnchorRestorable =
  item.scope === 'dom' ||
  (item.kind === 'note' && Boolean(item.anchor && item.selection));

if (!anchor || !isAnchorRestorable) return undefined;
```

검증:

- element mode로 QA 생성
- scroll 이동 후 item 클릭
- 원래 DOM element 기준으로 scroll restore 되는지 확인
- viewport를 바꿔도 selector candidate가 같은 element를 찾는지 확인

### 2. Supabase review number fallback 정책 정리

파일:

```txt
src/adapters/supabase.ts
```

현재 fallback:

```ts
const reviewNumber = await getNextReviewNumber(...);
await fromTable().insert(row).select('*').single();
```

`SELECT max(review_number)`와 `INSERT` 사이에 gap이 있어서 동시 생성 시 unique conflict가 날 수 있다. retry는 있지만 fallback 이름이 `unsafeClientReviewNumberFallback`이라 운영 경로가 아니란 뜻은 전달된다.

권장 방향:

- default는 지금처럼 RPC 유지
- client fallback은 문서상 dev/test only로 못 박기
- 이름은 유지해도 되지만, "optimistic retry fallback" 성격을 docs에 명시
- package 외부 공개 시 fallback option을 숨기거나 experimental로 내리기

검증:

- concurrent create 2개 이상이 서로 다른 remote `reviewNumber`를 받는지 확인
- 삭제 후 다음 번호가 재사용되지 않는지 확인

### 3. Shell adapter update 분기 단순화

파일:

```txt
src/react-shell/adapters.ts
```

현재 문제:

- `patch.status`가 있고 `updateStatus`가 있으면 status 전용 path를 탄다.
- `updateStatus`가 없으면 `syncSubmission`으로 generic patch를 보내는 구조다.
- status patch와 submission patch가 같은 `update` method 안에서 섞여 있어, adapter capability가 늘어날수록 디버깅이 어려워진다.

권장 방향:

- shell UI에서 status 변경은 `activeAdapterEntry.updateStatus`만 직접 호출한다.
- `adapter.update` wrapper는 submission sync 같은 generic patch만 담당한다.
- remote adapter가 generic update를 지원해야 하면 `syncSubmission`보다 `updateItem` 같은 명시적 이름을 검토한다.

검증:

- local status dropdown 변경
- remote status dropdown 변경
- local item remote 등록 실패 후 `submitStatus: failed` 저장

### 4. Submit success 후 UI refresh 흐름 확인

파일:

```txt
src/react-shell.tsx
```

현재 flow:

```ts
await remoteAdapterEntry.adapter.create(...);
await localAdapterEntry.adapter.remove(item.id);
await refreshReviewData();
```

성공 후 local draft를 바로 삭제하므로, remote list 반영 타이밍이 늦으면 UI에서 item이 잠깐 사라질 수 있다.

권장 방향:

- `remote.create`의 반환 item을 받아서 remote source로 즉시 이동하거나
- 성공 직후 selected item을 clear하면서 "remote 등록됨" state를 명확히 보여주거나
- refresh 순서를 local remove와 분리해 깜빡임을 줄인다.

검증:

- local item 생성
- remote 등록 클릭
- 등록 직후 list/sitemap count가 어색하게 튀지 않는지 확인
- network delay가 있을 때도 local item이 실패/성공 상태를 분명히 보여주는지 확인

## Medium priority

### 5. `getItemSelection` normalize 책임 정리

파일:

```txt
src/core/web-review-kit-app.ts
```

현재는 legacy `RelativeSelection`과 현재 `ReviewSelection`을 core에서 즉석 판정한다. local adapter에도 migration/normalize가 있어 책임이 분산돼 있다.

권장 방향:

- `normalizeReviewSelection(value)` helper를 core 또는 shared module로 분리
- adapter migration과 render/restore path가 같은 helper를 쓰게 정리

### 6. Local presence fallback 문서화

파일:

```txt
src/react-shell/presence.ts
```

`BroadcastChannel`이 없으면 local presence는 현재 tab 내부 상태만 가진다. 이건 큰 버그는 아니지만, fallback 동작으로 문서화해야 한다.

권장 문구:

- `BroadcastChannel` available: same-origin tab/window 간 공유
- unavailable: current tab only
- Supabase presence 실패 시 local fallback으로 degrade

## Package split

현재 package 경계는 나쁘지 않다.

- host hardcoding은 거의 없다.
- `core/adapters`는 React에 의존하지 않는다.
- Supabase adapter는 `@supabase/supabase-js`를 직접 import하지 않고 client interface를 주입받는다.
- host project wiring은 `/review` route에서만 담당한다.

분리 전 체크:

- `private: true` 제거 여부 결정
- package name/scope 확정
- `files`에 `src`, `dist`, `docs`를 모두 넣을지 결정
- `react`, `react-dom`은 peerDependency 유지
- `lucide-react`는 peer로 둘지 bundle할지 결정
- export map에서 `.`와 `./react-shell` 유지
- root project에서 `pnpm install --frozen-lockfile --ignore-scripts` 후 typecheck 통과 확인

확인된 사항:

```txt
pnpm --dir packages/df-web-review-kit typecheck
pnpm exec tsc --noEmit
```

둘 다 통과한다. 단, pull 직후 stale `node_modules` 상태에서는 새 export를 못 볼 수 있으므로 install이 필요했다.

## Structure debt

독립 package로 공개하기 전에 가장 큰 구조 문제는 파일 크기다.

- `src/react-shell.tsx`: shell UI가 한 파일에 몰려 있다.
- `src/core/web-review-kit-app.ts`: overlay core가 한 파일에 크다.
- `src/react-shell/style.ts`: CSS string이 크다.
- `src/core/overlay-style.ts`: overlay CSS string이 크다.

우선 분리 후보:

- `react-shell/Topbar`
- `react-shell/SitemapModal`
- `react-shell/SettingsModal`
- `react-shell/PromptModal`
- `react-shell/ItemList`
- `react-shell/ViewportStage`
- `react-shell/RulerOverlay`

목표는 추상화가 아니라 리뷰 가능한 단위로 쪼개는 것이다.

## Product direction

### 0.1 focus

0.1은 "QA issue capture and restore"에 집중한다.

필수:

- local draft 생성
- remote source 등록
- canonical remote number
- page/viewport/source deep link
- DOM anchor restore
- prompt copy

보류 또는 optional:

- screenshot upload
- full collaboration presence
- source code edit automation

Presence는 있으면 좋지만, 0.1의 핵심 가치는 아니다. anchor restore 안정화가 우선이다.

### Visual editing idea

마진, 폰트, spacing 같은 값을 review shell에서 임시 조정하고 저장하는 방향은 가능하다. 다만 이건 두 층으로 나눠야 한다.

1층: override and proposal

- 브라우저에서 element style을 임시 조정한다.
- 저장하면 review item에 before/after value가 구조화 데이터로 붙는다.
- AI 없이도 review-kit scope 안에서 자연스럽다.

2층: source patch suggestion

- 실제 source 수정은 별도 AI/codegen adapter가 맡는다.
- review-kit은 `anchor`, `DOM path`, `source hint`, `before/after`를 넘긴다.
- AI는 "어느 컴포넌트의 어느 token/style을 바꿀지" diff나 PR 제안을 만든다.
- 사람이 확인하고 merge한다.

중요한 경계:

- review-kit core는 "제안 생산"까지 담당한다.
- 실제 source 반영은 package core 밖 adapter 또는 별도 package로 둔다.

이 경계를 지키면 review-kit이 issue editor나 visual builder로 비대해지는 걸 막을 수 있다.
