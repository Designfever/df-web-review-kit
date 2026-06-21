# df-web-review-kit 초기 정리

## 결정된 방향

- Repository: `Designfever/df-web-review-kit`
- NPM package: `@designfever/web-review-kit`
- 목적: QA 전용 도구가 아니라 웹 페이지 위에 얹는 검수용 toolkit.
- 1차 대상: brand site 같은 웹 프로젝트.
- 설치 방식: 각 프로젝트에 npm package로 설치하고, 프로젝트별 설정만 넣는다.
- 단축키: 기본은 `Shift + Q`로 QA mode 진입.
- Chrome extension은 1차 대상이 아니다. 소스 접근 없는 사이트까지 다뤄야 할 때 adapter/wrapper로 나중에 검토한다.

## 큰 구조

패키지는 core와 module, adapter로 나눈다.

- Core
  - overlay root 생성
  - keyboard shortcut 관리
  - panel/modal/layer 공통 UI
  - 현재 URL/viewport/scroll 상태 수집
  - module lifecycle 관리
- QA module
  - 현재 페이지 기준 QA list 표시
  - text-only QA 등록
  - 화면 영역 드래그 캡처 QA 등록
  - DOM anchor 계산
- Grid module
  - 기존 grid helper를 나중에 module로 이관
  - 1차 MVP에는 인터페이스만 열어둔다
- Figma module
  - Figma overlay helper를 나중에 module로 이관
  - 1차 MVP에는 인터페이스만 열어둔다
- Adapter
  - 저장소/외부 서비스 연동만 담당
  - core와 QA module은 df-sheet, GitHub, localStorage 같은 저장소를 직접 알지 않는다

## Adapter로 뺀다는 뜻

Core는 "무엇을 수집하고 어떤 UI를 보여줄지"만 담당한다.
Adapter는 "수집한 QA item을 어디에 저장하고 어떻게 읽어올지"만 담당한다.

예시:

- brand site: `dfSheetAdapter`
- 초기 개발/검증: `localAdapter`
- 미래 확장: `githubIssueAdapter`, `jsonFileAdapter` 등

이렇게 분리하면 df-sheet 연동 방식이 바뀌어도 overlay core를 건드리지 않아도 된다.

## 1차 MVP

우선 df-sheet 연동 없이 local adapter로 기능을 검증한다.

1. npm package scaffold
2. target project에서 초기화 가능한 API
3. `Shift + Q`로 QA mode toggle
4. 현재 URL 기준 QA list 표시
5. text-only QA 생성
6. drag capture QA 생성
7. DOM anchor + relative coordinate 저장
8. local adapter 저장/조회/삭제

1차에서 Figma overlay와 grid helper를 완성하려고 하지 않는다.
다만 나중에 붙일 수 있게 module 구조는 처음부터 열어둔다.

## Local adapter 저장 방식

이름은 local adapter지만 실제 저장은 둘로 나눈다.

- Metadata: `localStorage`
- Screenshot/blob: `IndexedDB`

이유:

- `localStorage`에 screenshot data URL을 계속 넣으면 용량이 빨리 찬다.
- IndexedDB는 이미지 blob 저장에 더 적합하다.

## QA item 기본 데이터

```ts
type ReviewItem = {
  id: string;
  projectId: string;
  pageUrl: string;
  normalizedPath: string;
  kind: "text" | "capture";
  title?: string;
  comment: string;
  status: "open" | "resolved";
  viewport: {
    width: number;
    height: number;
  };
  scroll?: {
    x: number;
    y: number;
  };
  anchor?: DomAnchor;
  selection?: RelativeSelection;
  screenshotAssetId?: string;
  externalIssueId?: string;
  createdAt: string;
  updatedAt: string;
};
```

## DOM anchor 전략

단순 viewport 좌표만 저장하면 반응형 화면에서 위치가 틀어진다.
따라서 선택 영역과 가장 가까운 DOM element를 anchor로 잡고, 그 element 기준 상대 좌표를 저장한다.

Anchor 우선순위:

1. `data-qa-id` 또는 package 설정으로 지정한 attribute
2. `id`가 안정적인 element
3. 의미 있는 class/name/role 기반 selector
4. 텍스트 fingerprint
5. DOM path fallback

Relative coordinate 예시:

```ts
type RelativeSelection = {
  x: number; // (selection.left - anchor.left) / anchor.width
  y: number; // (selection.top - anchor.top) / anchor.height
  width: number; // selection.width / anchor.width
  height: number; // selection.height / anchor.height
};
```

나중에 다시 표시할 때는 현재 anchor rect를 찾고 위 비율로 위치를 복원한다.

## QA 생성 흐름

Text-only:

1. 사용자가 QA mode에서 text 등록 선택
2. 현재 URL, viewport width/height 저장
3. 사용자가 comment 입력
4. adapter에 저장

Capture:

1. 사용자가 capture 선택
2. 깨진 영역을 drag로 선택
3. 선택 영역 screenshot 생성
4. 선택 영역과 가장 가까운 DOM anchor 계산
5. anchor 기준 relative coordinate 저장
6. comment 입력
7. adapter에 저장

Screenshot 구현은 처음에는 `html2canvas` 계열로 시작할 수 있다.
단, cross-origin image/video/canvas는 깨질 수 있으니 정확도가 중요해지면 browser extension 또는 native capture 방식도 검토한다.

## df-sheet 연동 방향

df-sheet adapter는 QA item을 df-sheet issue로 매핑한다.

- 생성: QA item 생성 시 df-sheet issue 생성
- 조회: 현재 URL에 해당하는 unresolved issue만 QA list에 표시
- 해결: df-sheet issue status가 `done`이면 QA list에서 제외
- 첨부: capture screenshot은 issue attachment로 등록
- Metadata: page URL, viewport, anchor, selection 정보를 issue에 저장

df-sheet에 dedicated metadata field가 없으면 1차는 description이나 hidden JSON block으로 저장할 수 있다.
다만 장기적으로는 issue metadata field를 추가하는 편이 낫다.

## 예상 초기화 API

```ts
import { createWebReviewKit, localAdapter } from "@designfever/web-review-kit";

createWebReviewKit({
  projectId: "sample-brand-site",
  adapter: localAdapter({
    storageKey: "sample-brand-site-review-items",
  }),
  hotkeys: {
    qa: "Shift+Q",
  },
  anchors: {
    attribute: "data-qa-id",
  },
  modules: {
    qa: true,
    grid: false,
    figma: false,
  },
});
```

## 나중에 붙일 모듈

Grid helper:

- breakpoint/grid overlay
- column/gutter 표시
- 프로젝트별 grid preset

Figma helper:

- Figma screenshot 또는 frame overlay
- opacity/blend mode 조절
- viewport별 기준 이미지 전환

둘 다 core overlay와 단축키/패널 시스템은 공유하되, QA 저장소와는 강하게 묶지 않는다.

## 열어둔 질문

- package 배포를 public npm으로 할지 private npm으로 할지
- target project가 Next/Vite/vanilla를 모두 포함하는지
- React dependency를 peer로 둘지, framework-agnostic DOM package로 갈지
- df-sheet 인증은 cookie 기반인지 token 기반인지
- df-sheet에 QA metadata 전용 field를 추가할지
- target site에 `data-qa-id`를 어느 정도 심을지
- screenshot 정확도를 어디까지 요구할지

## 다음 세션에서 할 일

1. package scaffold 선택: Vite library, tsup, or rollup
2. core API 타입 먼저 작성
3. local adapter 인터페이스 작성
4. QA overlay 최소 UI 구현
5. brand site playground에 붙여 검증
