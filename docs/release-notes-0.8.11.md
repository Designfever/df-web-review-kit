# 릴리즈 노트: 0.8.11

Review help의 version 표시를 package metadata와 동기화하고, Figma overlay가
켜진 상태에서도 Option(Alt) DOM 선택이 정상 동작하도록 수정한 patch release.

비교 기준: `0.8.10`

## Package version 표시

- Review help에 하드코딩돼 있던 version 값을 제거했다.
- build 시 `package.json`의 version을 읽어 화면에 표시한다.
- package version을 변경하면 별도 UI 수정 없이 동일한 version이 표시된다.

## Figma overlay와 Option DOM 선택

- Option 선택 중 target pointer down에서 Figma overlay pointer lock이 너무 일찍 해제되지 않도록 수정했다.
- overlay가 켜져 있어도 실제 DOM element를 source candidate로 선택할 수 있다.
- 선택한 DOM element를 component selection 상태에 저장해 Source Tree focus와 component popup이 함께 표시된다.

## 검증

- `pnpm typecheck`
- `pnpm build`
- Source Inspector popup callback 테스트
- build 결과에 `0.8.11` version 포함 확인
