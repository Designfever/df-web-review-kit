# Release Notes: 0.14.0

DF Sheet SSO가 제공하는 설정으로 Review Kit의 Amplitude 분석과 Session
Replay를 자동 활성화합니다.

## Analytics

- 호스트 프로젝트의 환경변수나 별도 초기화 코드 없이 인증된 SSO 응답을
  사용합니다.
- `view`, `click`, `success`, `failure` 네 이벤트만 명시적으로 전송합니다.
- 패널 노출, Review Kit 컨트롤, QA 저장, Figma 이미지 import, 개선사항
  첨부 upload 결과를 기록합니다.
- 모든 이벤트에 `source`, `project_id`, `package_version`, 안정적인 익명
  식별자를 포함하고 reviewer name은 제공될 때만 사용합니다.
- 대상 사이트의 일반 클릭, 텍스트, 폼 값은 analytics 이벤트로 보내지
  않습니다.

## Session Replay와 안전장치

- SSO 설정의 sample rate를 사용하며 현재 기본값은 100%입니다.
- 모든 form input을 masking하고 명시된 민감 요소도 추가로 가립니다.
- SDK는 설정이 있을 때만 동적으로 로드합니다.
- SDK 로드·초기화·전송 실패는 로그인, 렌더링, 저장, upload, import를
  중단하지 않습니다.

## 검증

- SSO analytics 계약과 session cache 전달을 검증합니다.
- SDK 지연 초기화, property allowlist, 비활성화와 실패 격리를 검증합니다.
- QA 저장의 click → success/failure 경로를 검증합니다.
