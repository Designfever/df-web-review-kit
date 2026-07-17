# 릴리즈 노트: 0.8.5

비동기 렌더링된 target에서 `Option + click`으로 component를 선택할 때
Source Tree가 최신 DOM을 반영하고 선택 상태를 안정적으로 유지하도록 개선한
patch release.

비교 기준: `0.8.4`

## 버그 수정

- `Option + click` 시점의 target DOM에서 Source Tree를 다시 읽어, panel이
  처음 열릴 때 저장된 root-only outline 때문에 하위 component를 찾지 못하던
  문제를 수정했다.
- panel open 직후 실행되는 outline refresh가 Option 선택으로 펼친 경로를
  다시 접지 않도록 현재 collapse 상태를 유지한다.
- 선택된 Source Tree row가 panel 중앙에 오도록 scroll 위치를 보정했다.

## 호환성

- public API와 adapter contract 변경은 없다.

## 검증

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
