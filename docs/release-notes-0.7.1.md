# 릴리즈 노트: 0.7.1

0.7.0 release 이후 fallback 설정을 보강한 patch release.

비교 기준: `0.7.0`
검토 기준: `main`

## 변경

- Figma image create 요청에서 server env `FIGMA_TOKEN`을 우선 사용하고, 없으면 Settings의 browser-local `figma-token`을 fallback으로 사용한다.
- list/update/delete 요청에는 Figma token header를 보내지 않고, Figma API가 필요한 create path에서만 token을 전달한다.
- adapter `defaultUserId`로 Settings `user-id` 기본값을 줄 수 있게 했다.
- Settings localStorage `user-id`가 있으면 저장값을 우선 사용하고, 비어 있을 때만 adapter 기본값을 사용한다.
- dev adapter sample과 installation guide에 `VITE_REVIEW_USER_ID` 예시를 추가했다.
- 페이지 전환 후 Source Tree가 빈 상태로 남지 않도록 iframe load/DOM mutation 이후 component outline을 다시 읽는다.

## 검증

- `pnpm run typecheck`
- `pnpm run typecheck:dev`
- `pnpm run lint:dead-code`
- `pnpm run build`
- `npm pack --dry-run --json`

수동 확인:

- Settings modal에서 `VITE_REVIEW_USER_ID=env-reviewer`가 Review user ID 기본값으로 표시되는지 확인했다.
- About help text에서 Figma token fallback 안내가 표시되는지 확인했다.
- fake fetch로 Figma token header가 addImage create 요청에만 붙는지 확인했다.
- review shell에서 Source Tree를 연 뒤 `/components/`로 이동해 tree가 토글 없이 현재 DOM 기준으로 유지되는지 확인했다.

## 메모

- npm `0.7.0`은 `070e2e2` 기준으로 이미 publish되어, 이 patch는 `0.7.1`로 배포한다.
