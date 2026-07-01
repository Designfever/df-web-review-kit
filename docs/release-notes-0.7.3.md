# 릴리즈 노트: 0.7.3

0.7.2 이후 host-owned API가 Figma image metadata와 asset 저장을 함께 책임질 수 있게 endpoint store를 추가한 patch release.

비교 기준: `0.7.2`
검토 기준: `main`

## 변경

- `createEndpointReviewFigmaImageStore()`를 추가했다.
- 옵션 없이 호출하면 기존 dev/local endpoint인 `/__dfwr/figma-images`를 사용한다.
- `endpoint`, `headers`, `fetch`, `token`, `clientRender` 옵션을 지원한다.
- `headers`는 static `HeadersInit` 또는 동적 provider function을 받을 수 있다.
- 기존 `createReviewFigmaImageStoreClient()`는 호환을 유지하면서 endpoint store 구현을 재사용한다.

## Host 영향

- browser가 Supabase/R2 같은 저장소 권한을 직접 들고 있지 않아도 된다.
- host는 서버 endpoint 하나만 주입하고, 파일 저장과 DB metadata 처리는 서버에서 닫을 수 있다.
- 인증이 필요한 endpoint는 `headers` 옵션으로 Bearer token 등을 붙이면 된다.

## 검증

- `pnpm run typecheck`
- `pnpm run typecheck:dev`
- `pnpm run lint:dead-code`
- `pnpm run build`
- `npm pack --dry-run --json`
