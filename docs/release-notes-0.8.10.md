# 릴리즈 노트: 0.8.10

Option(Alt) DOM 선택 popup의 data와 component 후보를 눌렀을 때 해당 file을
editor에서 직접 열도록 수정한 patch release.

비교 기준: `0.8.9`

## Data file 열기

- data 후보 클릭을 component의 Source Tree focus 동작과 분리했다.
- 선택한 data hint와 기존 source open 설정을 사용해 editor URL을 연다.
- source opening이 비활성인 build에서는 동작을 무시하지 않고 안내를 표시한다.

## Component source 열기

- component 후보 클릭을 Source Tree focus 동작과 분리했다.
- 선택한 component의 source file을 기존 source open 설정으로 연다.
- Source Tree의 source 열기와 동일하게 line 위치는 생략한다.

## 검증

- data 후보와 component 후보의 source callback 분리 테스트
- source editor URL 테스트
- `pnpm typecheck`
