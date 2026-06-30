# 릴리즈 노트: 0.7.0

0.6.0 release 이후 변경 사항 정리.

비교 기준: `0.6.0`
검토 기준: `main` release candidate

## 주요 변경

- Figma reference image workflow를 review shell 안으로 옮겼다.
- Figma image local cache와 Vite plugin helper를 추가했다.
- QA 작성 필드를 `fields` option으로 확장해 title을 선택적으로 받을 수 있게 했다.
- QA item에 optional assignee 표시/변경 flow를 추가했다.
- 느린 remote adapter, 특히 df-sheet 연동에서 list/create/update/delete pending 상태를 UI로 표시한다.
- deep link item restore와 QA list focus 위치 보정을 개선했다.
- right rail Figma icon stroke를 다른 rail icon과 분리해 맞췄다.
- 릴리즈 직전 QA mutation failure feedback과 Figma image target key 보정을 반영했다.
- Sitemap modal에 페이지 검색 필터를 추가했다.
- Sitemap tree row를 ASCII prefix 대신 접기/펼치기 가능한 folder explorer 형태로 바꿨다.
- Sitemap tree depth를 더 빨리 읽을 수 있게 indent 영역에 subtle guide line을 추가했다.
- Sitemap tree guide line을 folder caret 중앙축에 맞추고 row divider가 guide line과 겹치지 않도록 정리했다.

## 변경

### Figma Image Workflow

review shell에서 Figma reference image를 등록하고 target page 위에 overlay로 올릴 수 있게 했다.

- dev server plugin이 Figma API 호출과 local asset cache를 담당한다.
- Figma token은 server env의 `FIGMA_TOKEN`을 사용하고 browser bundle로 노출하지 않는다.
- metadata는 `.df-review/figma-images.json`, asset은 `.df-review/figma-assets/`에 저장한다.
- review shell에서는 image manager panel과 layer controls를 제공한다.
- 일반 route에서는 host가 연결한 overlay control만 사용할 수 있게 boundary를 분리했다.

### QA Fields

adapter option에 `fields`를 추가했다.

- `fields.title`이 true일 때만 QA 작성/수정 화면에 title input을 표시한다.
- title은 optional field이며 없으면 기존 comment-only 작성 흐름을 유지한다.
- local fallback에는 assignee sample을 넣지 않고 host adapter가 필요한 field만 선언한다.

### Assignee

status와 분리된 optional assignee flow를 추가했다.

- `assigneeTitle`로 select label을 host가 지정할 수 있다.
- `assigneeOptions`로 담당자 목록을 넣는다.
- `updateAssignee`가 있는 adapter에서만 list item assignee 변경을 허용한다.
- edit modal에서는 assignee를 수정하지 않는다.

### Remote Adapter Pending UI

remote adapter가 느릴 때 빈 상태처럼 보이지 않도록 loading/pending feedback을 추가했다.

- QA list 로딩 중 spinner와 loading text를 표시한다.
- refresh 중에는 refresh button을 disabled + spinner 상태로 둔다.
- QA 등록/수정/삭제/status/assignee 변경 중에는 item/form 단위 pending 상태를 표시한다.
- create 실패 시 작성 form에 error message를 표시한다.

### Deep Link Restore

remote list가 늦게 도착하는 경우에도 URL의 `item` query를 복원할 수 있게 보정했다.

- initial item restore를 list loading 이후 한 번 더 시도한다.
- focus scroll 후 layout/animation 때문에 위치가 틀어지는 케이스를 다시 보정한다.
- df-sheet처럼 list 응답이 느린 adapter에서 deep link item focus 실패를 줄였다.

### Release Candidate Fixes

- QA status/assignee/submit/delete 실패 시 unhandled rejection으로 남기지 않고 toast로 feedback을 표시한다.
- QA edit 실패는 toast와 edit modal inline error를 함께 유지한다.
- Figma image target key가 review shell과 dev overlay에서 query/hash를 포함한 normalized target을 사용하도록 보정했다.
- Sitemap modal에서 페이지 이름/경로를 검색할 수 있고, 일치하는 하위 page의 상위 folder context를 유지한다.
- Sitemap folder row는 caret으로 접고 펼칠 수 있으며, 검색 중에는 일치 항목의 상위 folder를 자동으로 펼친다.
- Sitemap folder depth는 세로 guide line으로 보강해 깊은 경로도 한눈에 구분되게 했다.
- Sitemap row divider는 label 영역부터 시작해 guide line과 겹치지 않는다.

## Host 적용 메모

### Lexus dogfood integration

- Lexus host에서 df-sheet adapter로 title/assignee/status update flow를 확인했다.
- df-sheet list loading 동안 empty state 대신 loading state가 뜨는지 확인했다.
- direct URL item restore가 list load 이후 active item을 잡는지 확인했다.
- Lexus 배포 전에는 `link:../df-web-review-kit`를 published package version으로 바꿔야 한다.

### Vite plugin

Figma image local cache를 쓰는 host는 Vite config에 review-kit plugin helper를 연결해야 한다.

- `reviewFigmaImageStore()`는 dev/local cache endpoint를 제공한다.
- `FIGMA_TOKEN`은 server env로만 둔다.
- image format 변환이 필요하면 host가 `sharp` 같은 변환기를 plugin option으로 연결한다.

## 문서

- README quick start에 `fields`, `assigneeTitle`, `assigneeOptions`, `updateAssignee` 예시를 추가했다.
- custom adapter sample에 optional title/assignee field와 update flow를 추가했다.
- QA adapter와 Figma image store boundary 문서를 추가했다.
- Figma image MVP 구조 note를 추가했다.

## 검증

아래 명령을 확인했다.

- `pnpm run typecheck`
- `pnpm run typecheck:dev`
- `pnpm run lint:dead-code`
- `pnpm run build`
- `pnpm run build:dev`
- `npm pack --dry-run --json`

수동 확인:

- Lexus dogfood review page에서 df-sheet QA list loading state
- df-sheet QA create form title field
- QA list item status/assignee pending state
- direct URL item restore and focus
- Figma rail/menu icon stroke

## 메모

- `package.json` version은 `0.7.0`이다.
- npm publish 전에는 registry login 상태와 latest published version을 확인해야 한다.
- Lexus target app의 React SVG prop warning(`fill-rule`, `clip-rule`)은 review-kit package warning이 아니다.
