# 코드 리뷰 및 정리: 0.6.0 → 0.7.0 준비

리뷰 대상: `df-web-review-kit@0.6.0` (`origin/main` 기준)
작업 브랜치: `chore/0.7.0-code-review-cleanup`
범위: `src/**` 구조 정리, 죽은 코드/죽은 export 제거, dead-code 검사 설정 추가

---

## 요약

0.6.0에서 기능이 늘며 가장 크게 비대한 파일은 `src/react-shell/style.ts`였다. 단일 함수 안에 3,500줄 이상 CSS 문자열이 들어 있었고, Source Tree / QA list / composer / modal / ruler 스타일이 한 파일에 섞여 있었다.

이번 0.7.0 준비 브랜치에서는 위험도가 낮은 정리부터 적용했다.

1. `react-shell/style.ts`를 7개 스타일 chunk로 분리
2. 실제 미사용 함수/타입/상수와 내부 전용 helper의 잘못된 export 제거
3. `knip` 설정과 `pnpm lint:dead-code` 스크립트 추가
4. `typecheck`, `typecheck:dev`, `lint:dead-code`, `build` 통과 확인

---

## 1. 한 파일에 몰린 곳

### 정리 전 상위 파일

| 파일 | LOC | 문제 |
|---|---:|---|
| `src/react-shell/style.ts` | 3,579 | 단일 함수가 전체 review shell CSS 문자열을 보유 |
| `src/react-shell/review/shell.tsx` | 2,306 | `ReviewShell` 단일 컴포넌트에 상태/핸들러/렌더가 많이 남음 |
| `src/core/web.review.kit.view.ts` | 1,937 | overlay, scroll, draft, anchor 책임이 한 클래스에 집중 |
| `src/core/overlay.style.ts` | 1,025 | core overlay CSS 덩어리 |
| `src/core/dom.anchor.ts` | 818 | anchor 후보/매칭 로직 집중 |
| `src/react-shell/source.open.ts` | 785 | Source Tree 기능 확장으로 커짐 |

### 이번 브랜치에서 처리한 부분

`src/react-shell/style.ts`를 작은 조립 파일로 줄이고, CSS는 역할별 파일로 이동했다.

| 파일 | 역할 | 현재 LOC |
|---|---|---:|
| `src/react-shell/style.ts` | style tag 주입 + chunk 조립 | 26 |
| `src/react-shell/style/base.ts` | token, reset, topbar 공통 | 401 |
| `src/react-shell/style/sitemap.ts` | sitemap modal/table | 317 |
| `src/react-shell/style/modals.ts` | settings/edit/prompt modal | 606 |
| `src/react-shell/style/toolbar.ts` | tools, side rail, presence | 530 |
| `src/react-shell/style/qa-panel.ts` | QA panel/list/card/actions | 722 |
| `src/react-shell/style/stage.ts` | frame, source popover, section outline | 744 |
| `src/react-shell/style/ruler.ts` | ruler + responsive media query | 262 |

동작 변화 없이 문자열을 나눠서 `ensureReviewShellStyle()`에서 concat만 하도록 정리했다.

---

## 2. 죽은 코드 / 죽은 export 정리

`knip` 결과를 기준으로 public entry false positive와 실제 내부 전용 helper를 구분했다.

### 삭제한 실제 미사용 코드

| 파일 | 삭제 내용 |
|---|---|
| `src/react-shell/prompt/prompt.ts` | 미사용 `formatItemMeta`, `formatDate` 삭제 |
| `src/react-shell/source.open.ts` | 미사용 `SOURCE_SELECTOR`, `getSourceHintElement`, `getElementSourceHint` 삭제 |
| `src/core/geometry.ts` | 미사용 `getAreaPopoverPosition` 삭제 |
| `src/core/location.ts` | 미사용 alias `getNormalizedPath` 삭제 |
| `src/core/review/format.ts` | 미사용 `formatAreaDraftMeta` 삭제 |

### export만 제거하고 내부 helper로 남긴 것

아래 항목은 같은 파일 내부에서는 쓰이지만 외부 export가 필요 없던 helper다. 삭제하지 않고 `export`만 제거했다.

- `src/react-shell/anchor.restore.ts`
  - `getReviewItemExpectedDocumentRect`
  - `getReviewAnchorMatchScore`
  - `getElementDocumentRect`
  - `getReviewTextFingerprintScore`
  - `getReviewFingerprintTokens`
  - `isScrollableReviewAnchorElement`
- `src/react-shell/prompt/prompt.ts`
  - `formatPromptViewport`
  - `formatPromptPoint`
  - `formatPromptSelection`
  - `decodePromptHtmlEntities`
  - `getPromptAnchorCandidates`
  - `formatPromptSourceHint`
- `src/core/geometry.ts`
  - `rectanglesIntersect`
  - `getPopoverBounds`
- `src/react-shell/route.ts`
  - `normalizeReviewPathPrefix`
  - `getHashRoutePath`
- `src/react-shell/settings.ts`
  - `normalizeStoredReviewSidePanel`
  - `normalizeStoredReviewQaStatusFilter`
- `src/react-shell/viewport.ts`
  - `getFallbackPreset`
  - `getViewportPresetDistance`
- `src/react-shell/target/target.ts`
  - `HIDE_SCROLLBAR_STYLE_ID`
  - `FIGMA_POINTER_LOCK_STYLE_ID`
- `src/react-shell/review/shell.actions.ts`
  - `listReviewItems`
  - `listSitemapReviewItems`
- 내부 타입 export 축소
  - `src/core/review/draft.ts`
  - `src/react-shell/sitemap/tree.ts`
  - `src/react-shell/source.open.ts`
  - `src/react-shell/types.ts`

---

## 3. Dead-code 검사 설정

추가 파일:

- `knip.json`

추가 스크립트:

```json
"lint:dead-code": "knip"
```

설정 의도:

- public entry는 `src/index.ts`, `src/react-shell.tsx`, `src/vite.ts`로 명시
- 검사 대상은 `src/**/*.{ts,tsx}`로 제한
- `dist/**`와 `docs/adaptor.sample.ts` 같은 빌드 산출물/샘플은 검사 대상 밖에 둬서 false positive를 막음

현재 `pnpm lint:dead-code`는 이 설정으로 0 issue 통과한다.

---

## 4. 아직 남은 큰 덩어리

이번 브랜치에서는 위험도가 낮은 style split + dead-code cleanup까지만 적용했다. 아래는 별도 브랜치에서 작은 단위로 나누는 게 안전하다.

### `src/react-shell/review/shell.tsx` (2,306 LOC)

남은 책임:

- source panel resize / delayed close
- source candidate popover state
- section outline filtering / expand state
- prompt modal copy/open 흐름
- QA list selection + card action bridge

추천 다음 작업:

1. `use.source.panel.ts`
2. `use.section.outline.ts`
3. `use.prompt.modal.ts`
4. `use.qa.selection.ts`

`ReviewShell`은 layout assembly + child component wiring 정도로 줄이는 게 목표다.

### `src/core/web.review.kit.view.ts` (1,937 LOC)

남은 책임:

- overlay 렌더링
- scroll sync
- draft 작성/취소/저장
- anchor restore
- marker lifecycle

추천 다음 작업:

1. draft controller 분리
2. marker renderer 분리
3. scroll/restore orchestration 분리
4. view class는 조립/라이프사이클만 담당

---

## 5. 검증

실행한 명령:

```bash
pnpm lint:dead-code
pnpm typecheck
pnpm typecheck:dev
pnpm build
```

결과:

- `pnpm lint:dead-code` 통과
- `pnpm typecheck` 통과
- `pnpm typecheck:dev` 통과
- `pnpm build` 통과

`pnpm build` 결과로 `dist/**` 산출물이 갱신됐고, 기존 chunk hash는 `chunk-IN36JHEU` → `chunk-BDP7FS4Q`로 변경됐다.
