# 릴리즈 노트: 0.3.0

0.2.0 mainline merge 이후 변경 사항 정리.

비교 기준: `49f2665` (`Merge pull request #7 ... feat: release web review kit 0.2.0`)
검토 기준 HEAD: `a82b204` (`release: 0.3.0`)

## 주요 변경

- 개발용 Vite source locator export `@designfever/web-review-kit/vite`를 추가했다.
- DOM 리뷰 대상에 source file hint를 주입하고, 리뷰 shell에서 VS Code로 바로 여는 동작을 추가했다.
- QA item card에서 comment를 수정할 수 있게 했다.
- ruler 가독성, 측정 label, light theme 대비를 개선했다.
- `data-font`를 가진 요소에 source-select font hint overlay를 표시한다.
- 입력 필드에서 글을 쓰는 중 review hotkey가 실행되지 않도록 수정했다.

## 추가

### 리뷰 대상 Source Locator

Host project가 Vite에서 `reviewSourceLocator()`를 선택적으로 사용할 수 있다. 이 plugin은 React dev JSX runtime을 감싸서 렌더링된 DOM node에 source attribute를 주입한다.

- `data-wrk-source-file`
- `data-wrk-source-line`
- `data-wrk-source-column`

Source hint가 있으면 review shell에서 해당 source 위치를 VS Code로 열 수 있다. 절대 경로 source path와 `sourceRoot` 기준 상대 경로를 모두 지원한다.

Public package 변경:

- `./vite` package export 추가
- `src/vite.ts` 추가
- `ReviewShellProps`에 optional `sourceRoot` 추가
- `DomSourceHint`에 `line`, `column` 추가

### Review Shell Source Action

Review shell에서 다음 동작을 지원한다.

- Target iframe 안에서 `Option` + click으로 클릭한 source hint 열기
- Option key 활성화 중 source hover 표시
- `data-font` metadata가 있는 요소의 source-select font hint overlay 표시
- 저장된 source hint가 있는 QA card에 source open action 표시
- Source hint가 없거나 source root가 필요한 경우 toast feedback 표시

### QA Comment 수정

Active adapter가 update를 지원하면 QA item card에 edit action을 표시한다. Edit modal은 빈 comment를 막고, active adapter로 저장한 뒤 review data를 새로고침하고 toast feedback을 보여준다.

Adapter normalization에 `canUpdate`를 추가해서 read-only source에서는 edit action을 숨길 수 있게 했다.

## 변경

### Ruler UI

- 측정 label을 Figma 전용 문구가 아니라 중립적인 `width x height unit` 형식으로 바꿨다.
- Dark/light theme 모두에서 ruler label, coordinate chip, guide line, popover 가독성을 개선했다.
- 후속 fix에서 light theme ruler 대비를 한 번 더 개선했다.

### Review Shell Workflow

- QA item list 정렬 기준을 `updatedAt`에서 `createdAt`으로 바꿨다. 이제 기존 item을 수정해도 목록 최상단으로 튀지 않는다.
- Supabase list ordering도 remote source에서 같은 동작을 하도록 `created_at` 기준으로 바꿨다.
- Quick add toolbar는 DOM element capture와 area capture 중심으로 정리했다.
- Edit comment modal은 settings modal의 visual system을 재사용한다.

### Prompt Context

DOM source hint가 있으면 review item prompt에 source line context를 포함한다.

## 수정

- Focus가 `input`, `textarea`, `select`, `contenteditable` 안에 있을 때 review hotkey를 무시한다.
- DOM source 추출이 새 `data-wrk-source-*` attribute와 기존 `data-file` / `data-component` 계열 attribute를 모두 읽도록 했다.

## 문서

- README에 public import `@designfever/web-review-kit/vite`를 문서화했다.
- Installation docs에 source locator 설정, `sourceRoot`, source path가 DOM에 기록되는 dev/review build 주의사항을 추가했다.

## 검증

검토한 main branch 기준으로 아래 명령을 확인했다.

- `pnpm typecheck`
- `pnpm typecheck:dev`
- `pnpm build`
- `pnpm build:dev`

## 메모

- `package.json` version은 `0.3.0`이다.
- `0.3.0` release commit은 `a82b204`다.
- 이 노트를 작성한 시점에는 local/remote 모두 `0.3.0` git tag가 없었다.
