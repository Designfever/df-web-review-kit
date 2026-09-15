# Release Notes: 0.13.1

Review Kit에서 DF Sheet에 연결된 QA를 완료하면 DF Sheet 이슈 상태도 함께
완료되도록 상태 동기화를 보강합니다.

## 개선

- DF Sheet에서 불러온 QA의 상태 변경은 기존처럼 DF Sheet API에 직접
  반영합니다.
- 이전 버전에서 로컬에 남은 제출 완료 QA는 `externalIssueId`를 사용해
  DF Sheet 이슈를 먼저 완료한 뒤 로컬 상태를 갱신합니다.
- DF Sheet 동기화가 실패하거나 사용할 수 없으면 로컬 QA만 완료된 것처럼
  남지 않도록 상태 변경을 중단하고 오류를 표시합니다.
- 진행 중이나 검토 중 같은 완료 이외의 상태는 기존 동작을 유지합니다.

## 범위

이번 변경은 Review Kit에서 DF Sheet로 전달되는 완료 상태의 단방향
동기화입니다. DF Sheet에서 바꾼 상태를 열린 Review Kit 화면에 실시간으로
밀어주는 양방향 동기화는 포함하지 않습니다.

## 검증

- DF Sheet 어댑터가 `PATCH /api/review/issues/:id`에 `done` 상태를 전달하는
  계약을 검증했습니다.
- 연결된 로컬 QA의 원격 우선 완료, 원격 실패, 연결 부재, 일반 상태 변경
  경로를 검증했습니다.
- 전체 테스트, TypeScript 타입 검사, 라이브러리와 CLI 빌드, npm 패키지
  구성 검사를 통과했습니다.
