# 릴리즈 노트: 0.8.4

`html2canvas`가 크기 0인 gradient 요소를 렌더링할 때 color stop을
`NaN`으로 계산해 선택 영역 캡처가 실패하던 문제를 수정한 patch release.

비교 기준: `0.8.3`

## 버그 수정

- 캡처용 document clone에서 너비나 높이가 0인 요소의 gradient 배경을
  제거한다. 화면에 보이지 않는 요소만 대상으로 하므로 캡처 결과의
  가시 콘텐츠에는 영향을 주지 않는다.
- `CanvasGradient.addColorStop()`에 non-finite 값이 전달되면서 발생하던
  `Selected region capture failed` 오류를 방지한다.
- `VITE_REVIEW_SOURCE_ROOT`가 설정된 Vite production build에서도 source/data
  locator를 활성화한다. Vercel 같은 build 기반 리뷰 배포에서 Component List의
  `Used in`과 `Option` source 매칭용 metadata가 유지된다.

## 검증

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint:dead-code`
- Kia Worldwide `1920x1080` review shell에서 Element 선택 후 WebP attachment
  생성 확인
