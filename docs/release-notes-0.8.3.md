# 릴리즈 노트: 0.8.3

전체 코드 리뷰에서 나온 버그 수정과 중복 코드 정리를 담은 patch release. 동작 오류 4건을 고치고, sitemap 사용성을 개선하고, 내부 구현을 축소했다.

비교 기준: `0.8.2`
검토 기준: `main`

## 버그 수정

- Source Tree panel이 열린 상태에서 DOM/Area draft를 시작하면 docked composer가 panel 뒤에 가려져 사용할 수 없던 문제를 수정했다. composer가 있을 때 draft host를 panel보다 위로 올린다.
- `<select>`에 포커스가 있을 때 shell 단축키(`e`, `a`, `r`, `g`, `f`)가 동작하던 문제를 수정했다. select에서 글자 입력은 option 이동이므로 다른 입력 요소와 동일하게 단축키를 차단한다.
- Figma image overlay 상태 동기화의 no-change guard가 항상 새 객체 비교로 실패해, 이미지 목록이 갱신될 때마다 동일한 상태를 localStorage에 다시 쓰던 문제를 수정했다.
- shell이 `history.replaceState()`로 URL을 갱신할 때 `#hash`가 유실되던 문제를 수정했다.

## 개선

- Sitemap modal을 닫아도 unmount 하지 않고 숨겨서, 다시 열면 검색어·정렬·폴더 접힘·목록 스크롤이 마지막 상태 그대로 복원된다. 첫 오픈 전에는 기존처럼 mount 하지 않는다.
- Sitemap에 Todo/Review/Hold status filter chip을 추가했다. 켜진 상태끼리는 OR, 검색어와는 AND로 동작하고, 해당 status QA가 있는 페이지만 표시한다. 필터 중에는 folder를 자동으로 펼친다.

## 내부 정리

- `isEditableEventTarget` 4벌 복사본을 `core/hotkey.ts` 하나로 통합했다. 복사본 간 드리프트(SELECT 누락)가 위 단축키 버그의 원인이었다.
- `captureDomDraft`/`captureAreaDraft`의 동일한 capture 로직을 draft 접근자를 받는 함수 하나로 합쳤다.
- shell settings의 localStorage 접근을 `readStorage`/`writeStorage` 헬퍼로 통일해 SSR guard와 try/catch 반복을 제거했다.
- unknown error 메시지 추출을 `core/error.ts`의 `getErrorMessage`로 공유한다.
- Figma image overlay controller의 selected image setter 6개를 공통 updater로 축소했다.
- 동일한 구현이 중복된 source candidate key builder와 도달 불가능한 supabase `externalIssueUrl` fallback을 제거했다.
- git에 추적되던 `dist` 빌드 산출물을 제거하고 `.gitignore`에 추가했다. 배포 패키지에는 영향이 없다.

## 검증

- `pnpm typecheck`
- `pnpm typecheck:dev`
- `pnpm test`
- `pnpm lint:dead-code`
- `pnpm build`
- dev review shell 브라우저 테스트: viewport preset 전환, Source Tree 선택/해제, DOM QA 생성/상태 변경/삭제, theme 저장/복원, Figma image overlay 토글, sitemap 이동, ruler 표시를 확인했다.
