# 릴리즈 노트: 0.8.2

## Source Tree / 소스 추적

- Source Tree와 Option 소스 선택을 dev 서버에서 자동 활성화하고 production build에서는 비활성화한다.
- `VITE_REVIEW_SOURCE_HINT`와 legacy `enabled` 조건 없이 dev source/data locator가 동작한다.
- Option으로 선택한 DOM을 Component List에 동기화하고 source, data, parent usage metadata를 표시한다.
- Component List의 전체 item 영역을 선택 영역으로 사용하고 불필요한 컴포넌트명 복사 버튼을 제거했다.

## DOM 선택과 이동

- Component 선택, DOM QA 선택, DOM 이동을 독립된 상태로 분리했다.
- QA 선택은 파란색, DOM 선택과 이동은 연두색으로 구분했다.
- Component List의 DOM 이동을 canvas snapshot layer 방식으로 변경했다.
- 같은 페이지에서 여러 DOM 이동을 유지하고 원본 DOM은 투명 처리한다.
- canvas의 clear 버튼이나 Component List의 Clear 동작으로 이동을 초기화할 수 있다.
- 바깥 영역을 클릭하면 이동 선택을 종료하고 좌표는 고정 폭 `x : y` 형식으로 표시한다.
- Source Tree DOM 이동에서 scale 조작을 제거했다.

## 선택과 포커스

- 같은 Component 또는 QA item을 다시 클릭하면 선택을 해제한다.
- iframe을 포함한 중앙 공란을 클릭하면 현재 Component 또는 QA 선택을 해제한다.
- Component List focus는 연두색, QA List focus는 파란색으로 통일했다.
- Escape를 누르면 DOM outline, Component List focus, QA 선택과 QA card focus를 함께 해제한다.
- Component List panel이 target outline보다 위에 표시되도록 layer 순서를 조정했다.

## SPA iframe 이동

- iframe의 `history.pushState()`와 `history.replaceState()`를 감지한다.
- SPA 이동은 iframe을 재로드하지 않고 shell target과 QA route만 동기화한다.
- host router가 처리한 링크는 가로채지 않고, 일반 링크와 back/hash 이동은 hard navigation으로 처리한다.
- SPA fixture와 navigation 회귀 테스트를 추가했다.

## Figma Images

- Figma API 요청, 이미지 다운로드, 이미지 처리 timeout을 단계별로 분리했다.
- timeout 발생 시 `AbortController`로 진행 중인 요청을 중단한다.
- 이미지 decode를 한 번만 수행하고 WebP 변환 실패 시 원본 이미지로 fallback한다.
- host에서 client render `timeoutMs`를 설정할 수 있다.
- Figma image layer card의 edit/delete icon tooltip을 제거해 panel 내부 가로 스크롤을 막았다.

## Verification

- `pnpm typecheck`
- `pnpm typecheck:dev`
- `pnpm test`
- `pnpm lint:dead-code`
- `pnpm build`
- Lexus review shell에서 SPA 이동과 QA 등록/삭제를 확인했다.
