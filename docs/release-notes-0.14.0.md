# Release Notes: 0.14.0

DF Sheet SSO 기반 Amplitude 분석과 Session Replay를 추가하고, 레일 메뉴와
DF 팝업을 정리합니다.

## DF 팝업과 UI

- DF 로고 버튼에서 About, Prompt, Settings, Shortcuts 탭을 엽니다.
  별도의 Prompt와 Settings 레일 버튼은 제거합니다.
- Prompt 복사와 기존 설정 기능을 한 팝업에서 사용할 수 있습니다.
  탭을 전환해도 저장 전 설정 입력을 유지합니다.
- 탭은 방향키와 Home/End로 이동할 수 있으며 Escape로 팝업을 닫습니다.
- DF 팝업과 개선사항 모달을 560 × 680px로 통일합니다. 작은 화면에서는
  화면 크기에 맞게 줄어들며 긴 내용은 내부에서 스크롤합니다.
- 개선사항 하단 버튼을 높이 34px, 글자 크기 12px로 조정합니다.
- Element QA는 포인터 클릭 아이콘, 로그아웃은 간단한 전원 아이콘을 사용합니다.
- DF Sheet 페이지가 하나일 때 QA 헤더에 페이지 이름을 표시하고
  불필요한 `0/0` 카운트를 숨깁니다.

## Analytics

- 호스트 프로젝트의 환경변수나 별도 초기화 코드 없이 인증된 SSO 응답을
  사용합니다.
- `view`, `click`, `success`, `failure` 네 이벤트만 명시적으로 전송합니다.
- 패널 노출, Review Kit 컨트롤, QA 저장, Figma 이미지 import, 개선사항
  첨부 upload 결과를 기록합니다.
- 모든 이벤트에 `source`, `package_version`, 브라우저 식별자 `anonymous_id`,
  로그인한 DF Sheet 계정 ID인 `creator_id`를 포함합니다.
- 선택한 DF Sheet 페이지 이름을 `page_name`으로 보냅니다. 페이지 선택 전에는
  생략하며, 기존 `project_id`와 `reviewer_name` 이벤트 속성을 대체합니다.
- 대상 사이트의 일반 클릭, 텍스트, 폼 값은 analytics 이벤트로 보내지
  않습니다.

## Session Replay와 안전장치

- SSO 설정의 sample rate를 사용하며 현재 기본값은 100%입니다.
- 기본 masking level은 `medium`이며, SSO 설정의 `maskInputs: false`에서는
  `light`를 사용합니다. 명시된 민감 요소는 추가로 가립니다.
- SDK는 설정이 있을 때만 동적으로 로드합니다.
- SDK 로드·초기화·전송 실패는 로그인, 렌더링, 저장, upload, import를
  중단하지 않습니다.

## Rail 메뉴와 개선사항

- 레일을 Development(Design Inspector, Figma Images, Component List),
  Issues(QA), Custom 그룹으로 나눕니다. Custom은 등록된 패널이 있을 때 표시합니다.
- 개선사항은 하단 메뉴에서 설정과 같은 중앙 모달로 열립니다.
  기존 사이드 패널과 작성 중인 내용을 유지하며 Escape, 닫기 버튼,
  배경 클릭으로 닫을 수 있습니다.

## 개발용 DF Sheet 리뷰

- `/review-df-sheet/`에서 실제 DF Sheet 로그인과 페이지 선택을 테스트합니다.
  인증 후 페이지 목록을 조회하며, 페이지가 하나면 자동으로 선택합니다.
- 기본 fetch 함수를 브라우저에 바인딩해 호출 오류를 방지합니다.
- components 데모에서 DF Sheet 리뷰의 Custom 패널 테스트로 이동할 수 있습니다.

## 검증 범위

- SSO analytics 계약과 session cache 전달을 검증합니다.
- SDK 지연 초기화, property allowlist, 비활성화와 실패 격리를 검증합니다.
- QA 저장의 click → success/failure 경로를 검증합니다.
- 브라우저에서 DF 팝업 탭 전환, 방향키 이동, 설정 draft 유지,
  Escape 닫기와 Custom 패널 편집·재연결을 확인했습니다.
- 사용자가 실제 DF Sheet 이슈 추가와 Amplitude 이벤트 수신을 확인했습니다.
  변경된 `page_name`/`creator_id`의 대시보드 수신, 실제 Figma import,
  Session Replay masking은 별도 실환경 확인이 필요합니다.
