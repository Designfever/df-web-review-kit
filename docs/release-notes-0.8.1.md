# 릴리즈 노트: 0.8.1

0.8.0 이후 QA workflow 사용성을 다듬은 patch release. Copy Prompt 커스텀 지시문, status filter preset, count/tooltip/long comment/outside marker 표시 개선을 담았다.

비교 기준: `0.8.0`
검토 기준: `main`

## 주요 변경

- `mountReviewShell({ qaPrompt })`를 추가해 QA item Copy Prompt 앞에 프로젝트별 지시문을 붙일 수 있게 했다.
- QA status filter에 done을 제외한 active 상태(`todo`, `doing`, `review`, `hold`)를 한 번에 켜는 preset 버튼을 추가했다.
- 해상도별 QA count에서 `done` item을 제외해 남은 작업량 기준으로 표시한다.
- Figma image layer state button tooltip을 왼쪽으로 표시해 panel 내부 스크롤이 생기지 않게 했다.
- QA list item의 긴 comment는 기본 상태에서 max-height와 내부 스크롤을 적용하고, More/Less 버튼으로 펼치거나 접을 수 있게 했다.
- Outside QA marker가 세로로 몰릴 때 marker 간격을 자동 보정하고, connector는 원래 anchor 위치를 가리키게 했다.

## 검증

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm typecheck:dev`
- `pnpm build:dev`
