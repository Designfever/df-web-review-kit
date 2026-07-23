# 릴리즈 노트: 0.8.8

Option(Alt)으로 DOM을 선택했을 때 연결된 component 계층과 source 경로를
바로 확인하고 Source Tree 탐색으로 이어갈 수 있게 한 patch release.

비교 기준: `0.8.7`

## Component 계층 popup

- Option(Alt)으로 DOM을 선택하면 선택한 component부터 root까지의 조상 체인을
  popup으로 표시한다.
- 각 항목에 component 이름과 source 경로를 표시한다.
- 항목을 선택하면 기존 Source Tree focus 흐름을 사용해 해당 component로
  이동한다.
- 연결된 data file을 popup 상단에 고정해 component 계층과 함께 확인할 수 있다.
- popup은 선택 요소 주변에 표시되며, 화면 공간에 따라 좌우 위치를 바꾸고
  viewport 안에 유지된다.

## 내부 구조 개선

- capture의 색공간 변환 로직을 별도 module로 분리했다.
- section outline hook의 DOM 이동 조정 로직을 전용 hook으로 분리했다.
- review app의 capture input과 draft builder 로직을 별도 module로 분리했다.
- 위 구조 변경은 기존 capture, draft, DOM adjustment 동작과 public API를
  변경하지 않는다.

## 검증

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
