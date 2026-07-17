# 릴리즈 노트: 0.8.6

일반 production build에서는 source/data hint를 계속 제외하면서, host가 명시한
검수 build에서만 locator를 활성화할 수 있게 한 patch release.

비교 기준: `0.8.5`

## 개선

- `reviewSourceLocator()`와 `reviewDataLocator()`가 Vite dev server에서는
  기존처럼 자동 활성화된다.
- production build에서는 기본적으로 비활성화되고, host가 `enabled: true`를
  전달한 경우에만 source/data hint를 주입한다.
- 검수 build에서는 `filePath: 'relative'`를 사용해 browser DOM에 절대 경로가
  노출되지 않도록 구성할 수 있다.

## 보안 및 호환성

- 기존 build는 option을 추가하지 않으면 source/data hint가 포함되지 않는다.
- `enabled: true`인 build는 relative path라도 source 구조와 line metadata가
  client에 노출될 수 있으므로 공개 production이 아닌 검수 환경에서만 사용한다.

## 검증

- dev server: `enabled` 없이 locator 활성화
- build: `enabled` 없음 또는 `false`일 때 locator 비활성화
- build: `enabled: true`일 때만 source/data locator 활성화
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
