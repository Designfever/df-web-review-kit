# 릴리즈 노트: 0.5.0

0.4.1 release 이후 변경 사항 정리.

비교 기준: `a80ca35` (`release: 0.4.1`)
검토 기준: 0.5.0 dogfood working tree (`Source Tree`, QA UI polish, Lexus host integration 포함)

## 주요 변경

- Review shell side rail에 Source Tree panel을 추가했다.
- Source inspector 후보에서 infrastructure file을 숨길 수 있게 했다.
- Source Tree 탐색 깊이를 `sourceInspector.maxDepth`로 제한할 수 있게 했다.
- Vite dev plugin에 page data 출처를 주입하는 `reviewDataLocator()`를 추가했다.
- Source candidate가 page data file hint를 함께 노출하도록 확장했다.
- QA status filter가 iframe overlay 표시에도 반영되도록 했다.
- 모바일 comment textarea focus 시 viewport zoom으로 popup 위치가 틀어지는 현상을 줄였다.
- Lexus dogfood 기준 init, review route, Vite locator 설정을 0.5.0 host integration 기준으로 정리했다.

## 추가

### Source Tree Panel

QA side rail에 `SOURCE` panel을 추가했다. Source inspector가 활성화된 상태에서 target iframe의 section/source 구조를 tree로 볼 수 있다.

- section/source 후보 tree 표시
- filter input으로 label, source file, data file 검색
- section row 클릭 시 target section으로 scroll
- source file open action
- data file open action
- DOM QA 작성 action
- collapsible tree row

Tree root는 source hint가 있는 section wrapper와 header/footer landmark를 기준으로 잡는다. Placer 계열 primitive는 tree noise를 줄이기 위해 기본 제외하고, 필요하면 `sourceInspector.includePlacer`로 표시할 수 있다.

기본 펼침 정책은 Source Tree가 너무 길어지는 것을 막기 위해 2depth까지만 열고, 그 아래 subtree는 접는다. `FrameHeader`, `FrameFooter`는 root(1depth)여도 기본 접힘 상태로 시작한다.

### Source Inspector 옵션

`sourceInspector` mount option을 확장했다.

- `sourceInspector.maxDepth`: Source Tree traversal depth 제한
- `sourceInspector.ignore`: source candidate와 Source Tree에서 숨길 file pattern
- `sourceInspector.hoverOutline`: Source Tree item hover 시 iframe target outline 표시 여부
- `sourceInspector.includePlacer`: Source Tree에서 Placer primitive node 표시 여부

문자열 pattern은 normalized path 부분 일치로 처리하고, `RegExp` pattern도 지원한다. Ignore 결과로 후보가 모두 사라지면 빈 list 대신 원본 후보를 보여준다.

동일 source file 비교는 absolute/relative/suffix 경로를 정규화해서 같은 파일이 root와 child에 중복 표시되지 않게 했다. 단, 같은 이름의 sibling node는 branch-local 기준으로 유지해서 실제 sibling 구조가 사라지지 않게 했다.

### Data Locator

`@designfever/web-review-kit/vite`에 `reviewDataLocator()`를 추가했다. Page data 파일의 section object에서 `component: 'SectionXxx'` 패턴을 찾아 data file/line hint prop을 주입한다.

기본 주입 prop:

- `__wrkDataFile`
- `__wrkDataLine`

Host component가 이 prop을 section wrapper의 `data-wrk-data-file`, `data-wrk-data-line`으로 넘기면 Source Tree에서 data file open action을 사용할 수 있다.

## 변경

### Source Candidate 수집

Source 후보 수집이 DOM source hint와 data hint를 함께 본다.

- 클릭 지점에서 부모로 올라가며 source hint 수집
- 같은 source file은 클릭 지점에 가까운 후보 1개만 유지
- data hint는 별도 후보로 추가
- `sourceInspector.ignore` 적용

Option source candidate popup은 후보 row 사이 divider를 추가하고, row 높이를 고정값이 아니라 content 기반 padding/line-height로 정리했다. 위치가 없는 후보는 `file only` 대신 `-:-`로 표시해 `line:column` 양식과 맞췄다.

### Source Open 표시

`pages/` 경로도 display path 축약 규칙에 포함했다. 기존 `page/`, `app/`, `components/`, `src/` 계열 규칙은 유지한다.

### Review Shell UI

- side rail을 아이콘 중심 UI로 바꾸고 active 상태는 우측 line indicator로 표시한다.
- Source Tree/QA 아이콘 weight와 전체 font weight를 낮춰 panel 밀도를 줄였다.
- Source Tree filter clear button의 클릭 영역과 색상을 정리했다.
- Source Tree 1depth item 사이 divider를 추가했다.
- Source Tree hover 시 iframe target outline을 표시하고, row action에서 DOM QA 작성을 시작할 수 있게 했다.
- Source Tree row click scroll은 smooth behavior를 제거하고 target element가 iframe center 쪽에 오도록 조정했다.
- QA header와 Source Tree header/filter 높이를 34px control 기준으로 맞췄다.
- 좁은 viewport에서는 해상도 선택을 dropdown으로, overlay tool group을 `...` menu로 줄여 2줄 layout을 유지한다.
- 설정 modal에 Dark / Light / System theme icon option을 추가했다.
- 사용자 presence는 side rail 하단 icon badge로 표시하고, 클릭 시 사용자 이름 list를 세로로 보여준다.

### QA Filter / Overlay

QA list의 status filter(`Todo`, `Doing`, `Done` 등)를 선택하면 해당 status item만 iframe overlay에 표시되도록 했다.

### Mobile 입력

모바일 Safari에서 comment textarea focus 시 16px 미만 input zoom이 popup layer 위치를 흔드는 문제를 줄이기 위해 coarse pointer 환경의 textarea/select font-size를 16px로 보정했다.

## Host 적용 메모

### Lexus dogfood integration

`lexus_official_v2026` dogfood 적용 기준으로 아래 host 설정을 확인했다.

- `vite.config.js`에서 `reviewSourceLocator()`와 `reviewDataLocator()`를 dev 전용으로 함께 사용한다.
- `reviewSourceLocator({ include: ['src', 'page'], filePath: 'absolute' })`로 component/source hint를 주입한다.
- `reviewDataLocator({ include: ['page', 'src/data'], filePath: 'absolute' })`로 page data object의 file/line hint를 주입한다.
- Vite `define.__DFWR_SOURCE_ROOT__`로 review shell이 상대 source path를 editor open용 project root와 매칭할 수 있게 한다.
- review route init(`page/review/index.tsx`)에서 `sourceRoot`, `sourceInspector.maxDepth`, `sourceInspector.includePlacer`, `sourceInspector.ignore`를 host별로 설정한다.
- app-level dev init(`src/helper/helper.review-kit.ts`)은 `import.meta.env.DEV`에서만 동작하고, `__dfwr_target` query가 있으면 중복 mount를 피한다.
- host section base interface는 `__wrkDataFile`, `__wrkDataLine` dev hint prop을 허용해야 `reviewDataLocator()` 주입값을 section wrapper까지 전달할 수 있다.
- dogfood 중에는 `@designfever/web-review-kit`을 `file:../df-web-review-kit`로 연결해 0.5.0 dist를 Lexus review page에서 직접 검증했다.

## 문서

- README에 `reviewDataLocator()`와 Source Tree 설명을 추가했다.
- Installation docs에 data locator, Source Tree, `ignore`, `maxDepth` 설정을 추가했다.

## 검증

검토한 main branch 기준으로 아래 명령을 확인했다.

- `pnpm typecheck`
- `pnpm typecheck:dev`
- `pnpm build`
- `pnpm build:dev`
- `git diff --check`
- `npm pack --dry-run`
- Lexus dogfood review page에서 Source Tree, Option source popup, QA status filter, side rail, mobile textarea 보정을 수동 확인했다.

## 메모

- `package.json` version은 `0.5.0`이다.
- npm publish 전에는 registry login 상태를 확인해야 한다.
