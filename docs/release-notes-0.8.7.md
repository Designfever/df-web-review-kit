# 릴리즈 노트: 0.8.7

Figma overlay에 로컬 이미지와 직접 이미지 URL을 추가할 수 있게 하고,
검수 build에서 source 경로는 유지하되 로컬 editor 실행 UI는 노출하지 않도록
정리한 patch release.

비교 기준: `0.8.6`

## Figma 이미지 가져오기

- Figma image URL 입력 영역에 PNG, WebP, JPG, JPEG 파일을 drag & drop해
  overlay layer로 추가할 수 있다.
- 기존 Figma node URL뿐 아니라 PNG, WebP, JPG, JPEG 직접 URL도 입력할 수 있다.
- 파일과 URL에서 가져온 image asset은 local, endpoint, remote Figma image store의
  기존 저장 흐름을 사용한다.
- 지원하지 않는 파일 형식이나 image URL에는 구체적인 오류 메시지를 표시한다.

## Source Tree 보안 및 동작

- Vite dev server에서는 기존처럼 source, usage, data 경로를 editor로 열 수 있다.
- production review build에서는 source metadata와 경로 표시는 유지하지만,
  로컬 editor를 여는 버튼과 링크는 렌더링하지 않는다.
- source root가 설정되지 않았을 때 source open 동작을 안전하게 중단한다.

## 호환성

- 기존 Figma node URL 등록 흐름과 image store contract는 유지된다.
- public API에 direct image import helper가 추가됐다.

## 검증

- `pnpm typecheck`
- `pnpm typecheck:dev`
- image import 및 image store 테스트
- source locator mode 및 Source Tree rendering 테스트
- `pnpm build`
