# HANDOFF

Updated: 2026-07-04 KST
Branch: `main` (uncommitted working tree)

## Goal

vibe 코딩으로 커진 코드베이스를 사람이 유지보수할 수 있는 구조로 정리한다.

1. core 순수 함수에 유닛 테스트를 깔아 리팩토링 안전망을 만든다.
2. 초대형 파일 2개(`web.review.kit.view.ts` 2,223줄, `shell.tsx` 2,175줄)를 역할별 모듈로 분리한다.
3. 분리하면서 의도를 설명하는 주석을 추가한다.

## Changes In Current Working Tree

### 1. Unit tests (신규 7개 파일, 테스트 70개 통과)

- `src/core/geometry.test.ts` — 좌표 변환/클램프/host↔target 왕복
- `src/core/hotkey.test.ts` — modifier 매칭, 한글 자판 별칭(ㄱ→r), code fallback
- `src/core/location.test.ts` — 내부 query param(`__dfwr_target`) 제거
- `src/core/review/scope.test.ts` — 프리셋 매칭/scope 추론/draft 번호
- `src/route.test.ts` — route 정규화(index.html, query/hash)
- `src/figma/parse.test.ts` — Figma URL 파싱, 비-figma 호스트 거부(보안)
- `src/vite/figma-asset.test.ts` — asset key 검증, path traversal 거부(보안)

### 2. `src/core/web.review.kit.view.ts` 분리 (2,223 → 228줄)

본체는 렌더 오케스트레이션 + 셸 composer 도킹만 담당. DOM 조립은
`src/core/view/` 11개 모듈로 이동 (types, icons, composer.position,
draft.text, form.widgets, draft.capture, markers, selection.layers,
panel, dom.draft, area.draft). 모듈 지도는 `docs/architecture.md` 참고.

### 3. `src/react-shell/review/shell.tsx` 분리 (2,175 → 1,168줄)

- `hooks/use.review.source.inspector.ts` — Alt 소스 인스펙터 + iframe 바인딩
- `hooks/use.review.section.outline.ts` — Source Tree 패널 상태/갱신/액션
- `hooks/use.review.item.actions.ts` — QA mutation + 프롬프트/링크 복사
- `hooks/use.review.command.key.ts` — ⌘ 홀드 시 오버레이 숨김
- `review/side.rail.tsx` — 우측 레일 컴포넌트

### 4. 죽은 코드 제거 (knip 통과 상태)

- `getDomAnchor` (`src/core/dom.anchor.ts`) — 미사용 wrapper
- `setSectionOutlineWithDefaultCollapse`, `getItemTarget` import — shell.tsx 내 미사용

### 5. 기타

- 루트의 `pnpm-workspace.yaml`이 미완성 placeholder(`allowBuilds: esbuild: set this to true or false`)라
  `pnpm install` 자체가 깨져 있었음. 단일 패키지 레포라 불필요해서 제거함
  (백업: 세션 스크래치패드). 워크스페이스 전환 시 `packages:` 필드를 갖춰 새로 작성할 것.
- `.claude/launch.json` 추가 — dev fixture 서버(`pnpm dev:review`, port 5177) 프리뷰 실행용.
- `dist/*` — 배포 artifact 포함 레포라 `pnpm build` 결과가 같이 변경됨.

## Known Issues / Follow-ups

리팩토링 중 발견했지만 이번 범위에서 고치지 않은 것들:

1. ~~`getReviewItemScope`의 `dom` scope 처리~~ → 확인 완료, 해결됨.
   레거시 데이터 호환용 의도적 폴백('dom' 반환 시 마커가 안 보이게 됨)으로 확인.
   도달 불가능한 `Element` 라벨 분기를 제거하고 반환 타입을
   `Exclude<ReviewItemScope, 'dom'>`으로 좁혔으며, scope.ts 주석과
   `docs/testing.md`에 근거를 남김.
2. ~~Figma 개인 토큰 localStorage 저장 위험~~ → 문서화 완료.
   `docs/figma-overlay.md`에 "Security note: browser-stored token" 추가
   (server FIGMA_TOKEN 우선, 짧은 수명 토큰 권장 등). 코드 동작은 유지.
3. ~~dev 서버 figma-image-store 미들웨어 요청 검증 부재~~ → 해결됨.
   `assertTrustedReviewImageStoreRequest`(Origin↔Host CSRF 검사, 403),
   `readJsonRequestBody`에 JSON content-type 강제(415) + body 크기 상한
   (기본 25MB, `maxRequestBytes` 옵션, 413) 추가. 유닛 테스트 10개 +
   실제 dev 서버 curl 검증 완료. `docs/figma-overlay.md`에 근거 문서화.
4. ~~figma-images.json 동시 쓰기 race~~ → 해결됨.
   `runExclusiveReviewImageStoreTask`(dataFile 별 프로미스 큐)로 mutation 4종
   (POST/PATCH/reorder/DELETE)의 read-modify-write 를 직렬화하고,
   `writeReviewFigmaImageStoreFile`을 temp+rename 원자적 쓰기로 변경.
   유닛 테스트 + 실제 dev 서버 동시 POST 3건 재현으로 검증(3건 모두 보존).
5. ~~`getSourceRepeatInfo` 문서 전체 스캔 반복~~ → 해결됨.
   getSourceCandidates 호출 단위 캐시(`repeatIndexByKind`)로 kind 별 문서 스캔을
   1회로 축소 (기존: 후보 수 × 매칭 요소 수 만큼 재스캔). 반복 라벨(#i/n) 동작
   동등성은 `source.open.test.ts`로 고정.

## Verification Done

```bash
pnpm typecheck        # pass
pnpm typecheck:dev    # pass
pnpm lint:dead-code   # pass (knip)
pnpm test             # 70 passed (8 files)
pnpm build            # pass
pnpm build:dev        # pass
```

브라우저 스모크: dev fixture(`/review/`)에서 리뷰 셸 렌더, QA 패널,
draft 마커 오버레이, Component List(Source Tree) 패널 동작 확인. 콘솔 에러 없음.

## Current Git Status

- Modified: `src/core/dom.anchor.ts`, `src/core/web.review.kit.view.ts`,
  `src/react-shell/review/shell.tsx`, `docs/architecture.md`, `docs/testing.md`, `dist/*`
- New: `src/core/view/`, 테스트 7개, 셸 훅 4개 + `side.rail.tsx`, `.claude/launch.json`
- Deleted: `pnpm-workspace.yaml` (위 참고)

No commit has been made yet.
