# 릴리즈 노트: 0.7.2

0.7.1 이후 host별로 흩어진 remote Figma image store 구현을 package API로 올린 patch release.

비교 기준: `0.7.1`
검토 기준: `main`

## 변경

- `createRemoteReviewFigmaImageStore()`를 추가했다.
- remote Figma image store가 Supabase-like client, image table, asset upload endpoint를 옵션으로 받아 `ReviewFigmaImageStore`를 만든다.
- Figma image create path에서 package 내부 client-rendered asset 생성 로직을 재사용한다.
- remote store token은 factory `token` 옵션을 먼저 사용하고, 비어 있으면 Settings의 browser-local `figma-token`을 fallback으로 사용한다.
- remote store의 list/update/reorder/delete는 Figma token을 요구하지 않고, Figma API가 필요한 create path에서만 token을 요구한다.

## Host 영향

- host는 Supabase client와 upload endpoint만 주입하는 얇은 wrapper를 유지하면 된다.
- host custom store가 직접 `VITE_FIGMA_TOKEN`이나 `figma-token`을 읽을 필요가 없다.
- shared image metadata schema는 기존 `review_figma_images` shape를 그대로 사용한다.

## 검증

- `pnpm run typecheck`
- `pnpm run typecheck:dev`
- `pnpm run lint:dead-code`
- `pnpm run build`
- `npm pack --dry-run --json`

수동 확인:

- Lexus host에서 `@designfever/web-review-kit@0.7.2`로 bump 후 remote Figma image store wrapper가 build 되는지 확인한다.
- Vercel review shell에서 Settings `figma-token` 저장 후 image add가 `Figma token is required`에 걸리지 않는지 확인한다.
