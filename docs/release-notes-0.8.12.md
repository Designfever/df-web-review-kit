# 릴리즈 노트: 0.8.12

Figma overlay의 첫 클릭 DOM target 해석을 수정하고, review item 조회 범위를
화면 목적에 맞게 분리해 Supabase egress를 줄인 patch release.

비교 기준: `0.8.11`

## Figma overlay 첫 클릭

- Figma overlay를 켠 직후 첫 클릭에서도 실제 DOM target을 올바르게 해석한다.
- 첫 클릭에서 target을 놓쳐 다시 클릭해야 하던 문제를 수정했다.

## URL parameter route matching

- route identity는 query parameter와 hash를 제외한 pathname만 사용한다.
- `/en/?ttt-tttt`, `/en/#section`, `/en/`을 모두 같은 `/en/` route로 묶는다.
- query parameter가 있는 page도 sitemap, QA count, marker, adapter 조회에서 별도 path로 중복되지 않는다.
- iframe navigation에는 원래 query parameter를 유지한다.

## Supabase egress 최적화

- 일반 review 화면은 현재 route의 full review item만 조회한다.
- 초기화 중 중복되던 route refresh를 제거해 같은 데이터를 두 번 요청하지 않는다.
- sitemap count는 full project item 대신 `id`, `route_key`, `status`, `scope`, `viewport`만 조회하는 summary query를 사용한다.
- sitemap을 열기 전에는 summary query를 실행하지 않고, 처음 열 때 lazy load한다.
- 같은 project와 adapter로 sitemap을 다시 열면 cache를 재사용한다.
- All QA의 full project item은 All QA를 선택할 때만 별도로 lazy load한다.
- create, update, delete, status 변경 후에는 관련 cache를 무효화하고 필요한 데이터만 갱신한다.
- pagination과 UI 동작은 변경하지 않았으며 marker, route restoration, All QA, sitemap count 동작을 유지한다.

## Adapter API

- `WebReviewKitAdapter`에 optional `listSummary()`를 추가했다.
- Supabase adapter는 projected summary query를 사용한다.
- local adapter와 custom adapter fallback도 기존 동작을 유지한다.

## 검증

- adapter query shape 및 sitemap lazy/cache 테스트 8개 통과
- 관련 없는 기존 Figma overlay environment test를 제외한 전체 테스트 153개 통과
- `pnpm typecheck`
- `pnpm typecheck:dev`
- `pnpm lint:dead-code`
- `pnpm build`
- `pnpm build:dev`
- `git diff --check`
