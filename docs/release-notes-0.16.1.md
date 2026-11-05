# Release Notes: 0.16.1

Amplitude 이벤트의 프로젝트 식별 정보를 복구하고 프로젝트 이름으로
사용량을 비교할 수 있도록 표시 이름을 추가합니다.

## 프로젝트·페이지 분석

- `view`, `click`, `success`, `failure` 이벤트 모두에 안정적인 DF Sheet
  프로젝트 ID인 `project_id`를 다시 전송합니다.
- 읽기 쉬운 프로젝트 키인 `project_key`와 DF Sheet의 전체 프로젝트 이름인
  `project_name`을 추가합니다. 이름은 SSO 응답에 제공된 경우에만 전송합니다.
- 기존 `page_name`은 선택한 페이지의 이름을 계속 전송합니다. 페이지 선택
  전에는 이 속성을 생략하며, 프로젝트 식별 정보는 유지합니다.
- 기존 `creator_id`와 익명 식별 방식은 변경하지 않습니다.
- 이벤트가 전송 대기 중 프로젝트·페이지·사용자 컨텍스트가 바뀌어도 해당
  이벤트가 발생한 시점의 컨텍스트를 유지합니다.
- 이벤트 속성 allowlist를 유지하며 토큰이나 리뷰 내용은 추가로 전송하지 않습니다.

## 적용 순서 및 호환성

1. DF Sheet SSO 응답에 `project.name`을 포함하는 서버 변경을 배포합니다.
2. npm 게시 후 호스트 프로젝트의 `@designfever/web-review-kit`을
   `0.16.1`로 업데이트하고 각 호스트를 다시 배포합니다.
3. 기존 캐시 세션은 다시 로그인해야 프로젝트 이름을 받습니다.
4. Amplitude에서 `source = review-kit`으로 필터링하고 `project_name`
   또는 `project_key`로 사용량을 비교합니다. 프로젝트 간 안정적인 연결에는
   `project_id`를 사용합니다.

기존 SSO 응답도 계속 지원하며 이름이 없으면 `project_name`을 생략합니다.
프로젝트 키를 전체 이름으로 대체해 기록하지 않습니다.

이 수정은 업그레이드 후 새로 발생하는 명시적 이벤트에 적용되며 과거에
누락된 ID나 이름을 소급해서 채우지 않습니다. SDK가 생성하는 replay 및
진단 이벤트에는 프로젝트 속성을 추가하지 않습니다.

## 검증

- 패키지 unit test 410개 및 릴리즈 스크립트 테스트 4개 통과.
- 패키지 typecheck, 개발 fixture typecheck 및 package build 통과.
- DF Sheet SSO·세션 관련 테스트 12개 및 서버 typecheck 통과.
- npm pack dry-run에서 패키지 버전과 배포 파일 목록 확인.
- 실제 운영 이벤트의 Amplitude 수신 확인은 호스트 업그레이드 및 재로그인
  이후에 별도로 필요합니다.

## 릴리즈 메모

`0.16.1: Amplitude project_id 복구, project_key·project_name 추가 및 선택한 page_name 유지`
