# 릴리즈 노트: 0.8.0

0.7.3 이후 QA 작성, source inspection, iframe capture, dev review fixture를 함께 보강한 minor release.

비교 기준: `0.7.3`
검토 기준: `main` release candidate

## 주요 변경

- QA item에 여러 외부 링크를 표시할 수 있는 `externalLinks` 필드를 추가했다.
- QA DOM/area composer에서 paste attachment와 iframe viewport capture를 같은 attachment queue로 다룬다.
- `ReviewShellAdapter.uploadAttachment`와 `ReviewItem.attachments` contract를 추가했다.
- point-only Note QA를 제거하고 `ReviewItem.kind`를 `dom | area`로 정리했다.
- Vitest adapter contract suite를 추가해 local/Supabase adapter의 CRUD, 필터, legacy row 처리를 검증한다.
- iframe viewport capture는 WebP를 우선 생성하고, raster capture가 실패하면 SVG attachment로 fallback한다.
- source locator가 TSX/JSX AST를 읽어 `data-wrk-source-component`를 주입한다.
- Source Tree가 function component의 parent JSX call site를 `used in`으로 표시하고 바로 열 수 있다.
- Option source inspector의 후보 매칭을 DOM path, component stack, QA target, text, 반복 index 기준으로 개선했다.
- Source Tree가 component hierarchy를 더 잘 보여주도록 root 수집과 기본 표시 depth를 보정했다.
- dev review fixture를 page/section/card/component 단위로 나눠 Source Tree와 후보 매칭을 검증하기 쉽게 만들었다.
- Option source selection 중 Figma image overlay hit layer가 target hit-test를 가로채지 않도록 pointer lock을 분리했다.
- icon-only control에 hover/focus tooltip을 추가해 버튼 기능을 바로 확인할 수 있게 했다.
- keyboard shortcut matching이 한글 입력 상태의 물리 키를 함께 인식한다.
- DF logo help modal에 shortcut list를 추가하고 prompt/help modal shell을 공통 component로 정리했다.

## 변경

### QA External Links

`ReviewItem.externalLinks`를 추가해 한 QA item에서 여러 remote issue, sheet, admin URL을 표시할 수 있게 했다.

- 각 link는 `label`, `url`, optional `title`, optional `icon`을 가진다.
- QA card는 `externalLinks`를 우선 렌더링한다.
- 기존 `externalIssueUrl`만 있는 item은 `Remote` link로 fallback 렌더링한다.
- remote submit 후 local draft의 외부 링크 필드는 중복되지 않도록 정리한다.

### Attachments and Capture

QA draft에 attachment queue를 추가했다.

- image paste는 draft attachment로 들어가고, 제출 전에 adapter `uploadAttachment`로 업로드된다.
- DOM/area draft는 attachment만 있어도 제출할 수 있다.
- `ReviewAttachment`는 `url`, `name`, `mime`, `size`, optional `kind`, `metadata`를 저장한다.
- `ReviewAttachmentUploadInput`은 browser `File | Blob`과 draft item context를 함께 넘긴다.
- iframe capture는 현재 viewport, marker, selection을 합성한 attachment를 만든다.
- capture metadata에는 route, viewport, scroll, marker, selection, timestamp, renderer 정보가 들어간다.
- capture는 same-origin iframe DOM 접근이 가능한 환경에서 동작한다. HTTPS 전용 기능은 아니다.

### Adapter Contract and Note Removal

QA item kind를 DOM/area 중심으로 정리했다.

- `ReviewItemKind`는 `dom | area`만 허용한다.
- `ReviewMode`는 `idle | element | area`만 남긴다.
- point-only Note QA toolbar, shortcut, draft layer, popover style을 제거했다.
- 기존 DOM QA는 `kind: 'dom'`으로 저장된다.
- local/Supabase adapter는 legacy `note` row를 QA list에 노출하지 않는다.
- legacy `capture` row는 local adapter에서 `area`로 정규화한다.

Adapter 회귀를 줄이기 위해 Vitest를 추가했다.

- `pnpm test`는 `vitest run`을 실행한다.
- `pnpm test:watch`는 watch 모드로 Vitest를 실행한다.
- `src/adapters/adapter.contract.test.ts`에서 local adapter와 Supabase adapter mock을 같은 contract로 검증한다.
- contract는 `create/list/get/update/remove`, route/status filter, attachments, externalLinks, assignee/status 보존, legacy `note` 필터링을 확인한다.

### Capture Format

capture output은 용량을 줄이기 위해 WebP를 우선 사용한다.

- `html2canvas`로 iframe DOM을 rasterize한 뒤 `image/webp`로 인코딩한다.
- 실패하면 기존 SVG clone을 canvas에 그려 WebP로 다시 시도한다.
- 두 raster path가 모두 실패할 때만 `image/svg+xml` attachment로 저장한다.
- WebP metadata에는 `captureRenderer`와 `captureScale`이 기록된다.

### Source Locator and Source Tree

source opening의 실제 후보 품질을 높였다.

- Vite `reviewSourceLocator()`가 TypeScript가 있는 host에서 TSX/JSX를 파싱한다.
- intrinsic JSX node에 component 이름을 `data-wrk-source-component`로 주입한다.
- function component render path에는 parent JSX call site를 `data-wrk-source-parent-*` hint로 전달한다.
- Source Tree는 nested source roots를 flat root로 중복 수집하지 않고 parent/child hierarchy로 보여준다.
- Source Tree row는 parent usage가 있으면 `used in` meta와 usage source open action을 보여준다.
- 기본 표시 depth를 늘려 dev fixture처럼 page/section/card로 나뉜 구조가 바로 보인다.
- `includePlacer: false`일 때 Placer 계열 primitive는 Source Tree와 candidate list에서 숨긴다.

### Source Candidate Matching

Option source inspector 후보 정렬을 보강했다.

- 후보 dedupe 기준을 file-only에서 source identity 기준으로 바꿨다.
- target element, QA data attribute, component stack, text match, section hint, line/column을 함께 점수화한다.
- 같은 component가 반복되는 카드/리스트는 `#1/3`, `#2/3`처럼 반복 index를 표시한다.
- candidate popover에는 `23:9 · component · target · qa · text · #1/3`처럼 선택 이유를 노출한다.
- file별 후보는 최대 3개, 전체 후보는 최대 8개까지 보여준다.

### Figma Overlay Interaction

Option source selection과 Figma overlay의 hit-test 충돌을 막았다.

- 기존 element review mode의 Figma pointer lock은 유지한다.
- Option source selection용 pointer lock을 별도 style id로 분리했다.
- lock 대상에 host helper selector와 package Figma image overlay selector를 함께 포함했다.
- Option 키를 누른 동안 overlay image가 source target hit-test를 가로채지 않고, 키를 떼면 기존 overlay 조작이 복구된다.

### Icon Tooltips

아이콘만 있는 주요 control에 커스텀 tooltip을 추가했다.

- topbar action, overlay toggle, side rail, QA card action, Source Tree action, Figma image action에 기능명을 표시한다.
- tooltip은 `hover`와 `focus-visible`에서 표시되어 마우스와 키보드 탐색 모두에서 확인할 수 있다.

### Shortcuts and Help

단축키 접근성을 정리했다.

- `G/F/R/E/A` shell shortcut은 한글 입력 상태에서도 `ㅎ/ㄹ/ㄱ/ㄷ/ㅁ`로 동작한다.
- `Shift+Q`와 Figma dev overlay `Shift+F`도 같은 hotkey matcher를 사용한다.
- side rail 순서를 Figma Images, QA, Component List로 정리하고 `Shift+1/2/3` panel shortcut을 추가했다.
- DF logo로 여는 help modal에 shortcut list를 추가했다.
- 기존 설명글은 제거하고 header에 package version만 표시한다.
- help/prompt modal은 max-height를 제한하고 header 아래 body만 내부 스크롤되게 정리했다.
- help/prompt 계열 modal은 공통 `ReviewModal` component가 wrapper를 담당하고 contents는 children으로 받는다.

### Dev Review Fixture

`pnpm dev:review` fixture를 release 검증용으로 더 현실적으로 나눴다.

- page routing, nav, home, components, long-form fixture를 분리했다.
- home fixture는 hero/action list/smoke grid/card 계층을 가진다.
- components fixture는 controls, metrics panel, state preview grid로 나뉜다.
- long-form fixture는 scroll, anchor restore, Source Tree depth 확인에 사용한다.

## Host 영향

- attachment paste/capture를 저장하려면 host `ReviewShellAdapter`에 `uploadAttachment`를 구현해야 한다.
- `uploadAttachment`가 없는 adapter에서 attachment가 포함된 draft를 제출하면 저장하지 않고 error feedback을 표시한다.
- `note` kind를 저장하거나 반환하던 host adapter는 `dom` 또는 `area`로 매핑해야 한다.
- capture는 browser package dependency로 `html2canvas`를 사용한다.
- source locator component/parent usage hint는 TypeScript가 host dependency로 있을 때만 동작한다. 없으면 기존 file/line/column hint만 사용한다.
- source hints는 DOM에 source path와 component 이름을 쓰므로 dev/review build에서만 켜야 한다.
- 기존 `externalIssueUrl`만 쓰는 host는 계속 동작한다. 여러 링크가 필요할 때만 `externalLinks`를 추가하면 된다.
- Figma image overlay를 쓰는 host는 Option source selection 중 overlay drag가 잠깐 비활성화된다.

## 문서

- README 최신 release note 링크를 0.8.0으로 갱신했다.
- docs index에 0.8.0 release note와 0.7.3 patch note를 정리했다.
- installation guide에 external links, attachment upload, WebP capture contract를 정리했다.
- adapter boundary 문서에 QA attachment, item kind, contract test, Figma image store 책임 분리를 반영했다.
- Vitest adapter contract 문서를 추가했다.
- Figma overlay 문서에 package image overlay selector와 source selection pointer lock behavior를 추가했다.

## 검증

아래 명령을 확인했다.

- `pnpm typecheck`
- `pnpm test`
- `pnpm typecheck:dev`
- `pnpm build`
- `pnpm build:dev`

수동 확인:

- iframe fake Figma image overlay에서 Option down/up hit-test가 overlay -> target -> overlay 순서로 바뀌는지 확인했다.
- source candidate 반복 카드가 `#1/3`, `#2/3`, `#3/3`으로 구분되는지 확인했다.
- Source Tree가 `/`, `/components/`, `/long-form/` fixture에서 depth 있는 hierarchy와 `used in` parent usage를 보여주는지 확인했다.
- viewport capture가 WebP attachment와 renderer metadata를 생성하는지 확인했다.
- icon-only control hover 시 tooltip이 표시되는지 확인했다.
- 한글 키 synthetic event로 shell shortcut이 처리되는지 확인했다.
- DF logo help modal에서 shortcut list 13개와 modal layout을 확인했다.
