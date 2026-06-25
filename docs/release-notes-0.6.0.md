# 릴리즈 노트: 0.6.0

0.5.0 release 이후 변경 사항 정리.

비교 기준: `0.5.0`
검토 기준: 0.6.0 dogfood working tree (`Source Tree` metadata, docked QA composer, Lexus mobile/WebKit flow 포함)

## 주요 변경

- DOM/area draft composer를 QA panel 하단 dock 방식으로 바꿔 mobile viewport/keyboard resize 영향을 줄였다.
- Source Tree를 component inspection tool로 확장했다.
- Source Tree box/text/font/media/class metadata 표시를 추가했다.
- Source Tree, QA panel, QA status filter 상태를 browser localStorage에 유지한다.
- QA list ID capsule click-to-copy, toolbar/header spacing, icon button density를 정리했다.
- Lexus dogfood에서 local package 연결, 540x1080 mobile viewport, LAN preview 흐름을 확인했다.

## 변경

### Docked QA Composer

React shell mode에서 DOM/area draft composer는 target 위 floating layer 대신 QA list 하단에 붙는다.

- mobile Safari input focus/viewport resize에 덜 흔들리는 구조
- DOM selection adjustment controls 유지
- area selection draft도 같은 host 영역 사용
- draft composer가 열리면 QA panel로 focus 이동

Core standalone overlay mode는 기존처럼 target overlay 안에서 composer를 렌더링한다.

### Source Tree Metadata

Source Tree row에 inspection metadata를 표시할 수 있게 했다.

- box: target iframe 기준 `top / left / width / height`
- text: PlacerTextInline 등 text node 값
- font: font size/weight summary
- media: image/poster/video URL, desktop/mobile asset label
- class: className tag list

Box 값은 render 시점의 iframe element rect를 다시 읽어서 viewport/resolution 변경 후에도 최신 값에 맞춘다.

### Source Tree Controls

Source Tree header/filter layout을 QA sheet와 맞췄고, metadata option은 icon-only toggle로 정리했다.

- filter input을 최상단에 배치
- root count와 metadata toggles를 같은 header row에 배치
- Source Tree를 켤 때 parent tree nodes는 기본 collapsed 상태로 시작
- row hover 영역은 metadata block까지 포함
- row의 DOM select action은 QA panel로 전환한 뒤 draft 작성 흐름을 시작

### QA List

- `DRAFT-1`, `#102` 같은 QA ID capsule을 누르면 ID가 copy된다.
- Local QA title case/color와 list/header spacing을 정리했다.
- QA status filter 선택값을 새로고침 후에도 유지한다.
- side panel mode와 panel open/close 상태를 새로고침/페이지 이동 후에도 유지한다.

## Persistence

0.6.0에서 shell UI state는 browser-local localStorage에 저장된다.

- `df-review-side-panel`
- `df-review-side-panel-visible`
- `df-review-source-tree-filter`
- `df-review-source-tree-meta-visibility`
- `df-review-qa-status-filter`

이 값들은 QA item data가 아니며, adapter나 backend로 sync되지 않는다.

## Host 적용 메모

### Lexus dogfood integration

- `lexus_official_v2026`에서 `@designfever/web-review-kit`을 `file:../df-web-review-kit`로 연결해 검증했다.
- review dev server는 LAN 접근을 위해 `--host 0.0.0.0`로 띄워 mobile device에서 확인했다.
- 540x1080 mobile preset에서 DOM QA composer 입력/저장/취소, Source Tree metadata toggles, QA status filter persistence를 확인했다.

## 문서

- README에 0.6.0 release note link와 Source Tree metadata/persistence 설명을 추가했다.
- Installation docs에 docked composer, Source Tree metadata, localStorage persistence 설명을 추가했다.
- Architecture docs에 React shell composer host boundary를 추가했다.
- 오래된 internal handoff note를 삭제했다.

## 검증

아래 명령을 확인했다.

- `pnpm typecheck`
- `pnpm typecheck:dev`
- `pnpm build`
- `pnpm build:dev`
- `git diff --check`
- `npm pack --dry-run --json`

수동 확인:

- Lexus dogfood review page DOM QA create/cancel
- Source Tree filter/meta toggle persistence
- QA status filter persistence
- mobile/LAN preview

## 메모

- `package.json` version은 `0.6.0`이다.
- npm publish 전에는 registry login 상태를 확인해야 한다.
- Lexus target app에서 React SVG prop warning(`fill-rule`, `clip-rule`)이 보일 수 있으나 review-kit package warning은 아니다.
