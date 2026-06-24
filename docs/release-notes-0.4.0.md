# 릴리즈 노트: 0.4.0

0.3.0 release 이후 변경 사항 정리.

비교 기준: `a82b204` (`release: 0.3.0`)
검토 기준: `0.4.0` release commit

## 주요 변경

- Source inspector를 단일 source open에서 후보 선택형 inspector로 확장했다.
- DOM anchor 후보를 더 많이 수집하고, 클릭한 실제 DOM element를 우선 anchor로 사용하도록 개선했다.
- Sitemap을 QA 현황판처럼 쓸 수 있게 remaining, review, hold, online 기준 집계와 정렬을 추가했다.
- 전체 QA 보기와 review link restore 흐름을 정리했다.
- DOM/area draft composer를 draggable workflow로 바꾸고, DOM 위치 보정 모드를 추가했다.
- QA panel에 status filter를 추가하고, status select chevron과 spacing을 정리했다.
- Presence 표시를 QA list에서 분리해 상단 toolbar 아래 별도 row로 옮겼다.

## 추가

### Source Inspector

Review target에서 `Option`을 누른 상태로 hover하면 DOM ancestry에서 source 후보를 수집해 outline으로 표시한다. 클릭하면 후보 list가 고정되고, 사용자가 열 source를 직접 고를 수 있다.

Source open 옵션을 확장했다.

- `sourceInspector.editor`: `vscode`, `cursor`, `webstorm`, `custom`
- `sourceInspector.urlTemplate`: custom editor URL template
- 후보별 line/column confidence에 따라 위치 포함 여부 결정
- `sourceRoot` 기준 relative path resolve 유지

문서도 `Option + click` 단일 동작 설명에서 후보 선택형 flow로 갱신했다.

### Figma Frame Link

Target iframe이 `window.__figma`에 frame config를 제공하면 review frame 옆에 Figma frame link를 표시한다.

- `desktopNodeId`
- `mobileNodeId`
- viewport preset 종류에 맞는 frame URL 선택

Target page 새 창 열기 action도 같은 link stack에 배치했다.

### Sitemap QA Overview

Sitemap modal에 페이지별 QA 현황 집계를 추가했다.

- remaining total
- review count
- hold count
- online users
- All QA summary row
- page, total, review, hold, online 기준 정렬

Folder/group row는 하위 page의 QA count와 online user를 합산해서 보여준다.

### 전체 QA 보기

Sitemap에서 All QA row를 선택하면 현재 page에 묶이지 않은 전체 QA list를 볼 수 있다. QA panel title도 All pages 상태를 구분해서 표시한다.

### QA Item Link Copy

QA item card에서 개별 review item link를 복사할 수 있게 했다. 복사한 link를 target input에 붙여넣으면 source, viewport, item id를 해석해 해당 item으로 복원한다.

## 변경

### DOM Anchor

Anchor 후보 수집 우선순위를 개선했다.

- 클릭한 실제 target element 우선
- `data-testid`, `data-cy`, `data-section-id`, `data-component` 계열 attribute 지원
- `aria-label`, `title`, `name`, `href` 같은 semantic attribute 지원
- 안정적인 ancestor 기준 scoped DOM path 추가
- full DOM path는 fallback confidence로 낮춤

이 변경으로 nested component나 반복 section 안에서 DOM item 복원 안정성이 좋아졌다.

### Draft Composer

DOM/area draft composer workflow를 조정했다.

- composer drag handle 추가
- composer를 shell 밖 클릭으로 cancel 가능
- 선택 영역 옆에 composer 배치
- composer drag 중 shell z-index와 pointer handling 정리
- composer metric, spacing, action layout 통일

### DOM 위치 보정 모드

DOM review composer에 위치 보정 mode를 추가했다.

- DOM nudge adjustment
- scale key 조정
- adjustment HUD 표시
- toggle icon을 SVG 기반으로 정리

### QA Panel

QA list header에 status filter를 추가했다.

- All status / Todo / Doing / Review / Hold / Done 필터
- status별 count 표시
- remaining count와 active item count를 함께 표시
- QA source select와 status select chevron spacing 통일

### Presence

Page presence 표시를 QA list header에서 제거했다. 대신 상단 toolbar 아래 별도 row에 chip으로 표시한다.

- 기본은 첫 사용자 + `+N` 접힘 표시
- `+N` 클릭 시 전체 사용자 펼침
- iframe/device 내부에 겹치지 않도록 review shell row에 배치

## 수정

- 초기 review link restore timing을 안정화했다.
- 붙여넣은 review link에서 target, source, viewport, item id를 해석하도록 수정했다.
- QA card action layout과 restore timing을 정리했다.
- Status select chevron이 status별 background style에 덮이는 문제를 수정했다.
- MO preset design width ratio를 390 기준으로 조정했다.
- Sitemap count column 구조와 typography를 정리했다.

## 문서

- README에 `sourceInspector` mount option 예시를 추가했다.
- Installation docs에 source inspector 후보 선택 flow와 editor option을 추가했다.
- Architecture docs에 anchor 후보 수집 전략을 보강했다.

## 검증

검토한 main branch 기준으로 아래 명령을 확인했다.

- `pnpm typecheck`
- `pnpm typecheck:dev`
- `pnpm build`
- `pnpm build:dev`
- `git diff --check`
- Puppeteer smoke checks for QA status select, presence row, and expand/collapse behavior

## 메모

- 이 노트는 0.4.0 publishing 전 검토용이다.
- `package.json` version은 `0.4.0`이다.
- npm publish 전에는 registry login 상태를 확인해야 한다.
