# 릴리즈 노트: 0.8.9

Option(Alt) DOM 선택 popup에서 data file 후보와 component 계층을 함께
선택할 수 있게 정리한 patch release.

비교 기준: `0.8.8`

## Data 후보

- 클릭 지점부터 조상 방향으로 찾은 data file 후보를 popup 상단에 표시한다.
- 중복되거나 숨김 대상인 data file은 기존 source candidate 규칙으로 제외한다.
- data 후보를 선택하면 연결된 component를 기존 Source Tree focus 흐름으로 찾는다.
- data 후보는 accent text color로 component 항목과 구분한다.

## Component 계층

- data 후보 아래에는 기존처럼 자신부터 root까지의 component 계층을 표시한다.
- data 후보가 있을 때만 두 목록 사이 divider를 표시한다.
- data 후보가 없으면 빈 data 상태나 divider 없이 component 계층만 표시한다.

## 검증

- popup data 있음/없음 rendering 테스트
- `pnpm typecheck`
- browser에서 data 없는 popup의 component 순서와 divider 미표시 확인
