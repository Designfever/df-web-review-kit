# 인수인계 — Release 알림 / Amplitude POC

## 현재 상태

- Dudu 프로젝트: `df-web-review-kit` (37).
- 1420: 릴리즈 알림 구현 완료, Dudu `review`. MCP는 `done` 전환을 지원하지 않으므로 사용자가 최종 완료 처리한다.
- 1419: Amplitude 설치 및 핵심 이벤트 추적. 요구사항 논의만 했으며 SDK 설치·코드 변경·이벤트 전송은 아직 없다.
- 사용자는 퇴근 전 인수인계 문서와 이번 변경의 commit/push를 요청했다. npm 릴리즈 요청은 아니다.
- 패키지 버전은 `0.13.3` 그대로다. 이번 작업 중 npm publish는 하지 않았다.

## 1420 — 구현과 검증

GitHub Actions/OIDC 계획은 사용자의 요청으로 폐기하고 짧은 로컬 스크립트로 구현했다.

```sh
pnpm release -- "변경 내용 메모"
```

- `scripts/release.sh`: 설정 검사 → test → test:release → typecheck → build → npm publish → 알림.
- `scripts/release/notify.mjs`: JANDI 녹색 attachment 카드, Discord 주황색 embed.
  패키지, 버전, 메모, 완료 시각(KST), npm 링크를 보낸다. Discord 멘션은 비활성화한다.
- `.env.release`에서 두 webhook URL을 읽는다. 로컬 파일은 이미 설정되어 있으며 Git 제외 대상이다.
  **파일 내용을 출력하거나 commit하지 말 것.** 다른 컴퓨터에서는 `.env.release.example`을 복사하고 별도로 설정해야 한다.
- 서비스마다 한 번 요청, 10초 timeout, 자동 재시도 없음. 한쪽 실패해도 다른 쪽을 시도한다.
- 알림 실패는 publish를 되돌리지 않는다. 실패 코드만 보고 재배포하지 말고 registry와 채널 상태부터 확인한다.
  `notify.mjs send`는 양쪽 모두 전송하므로 부분 실패 복구에 그대로 쓰지 않는다.
- `AGENTS.md`와 README의 Release 항목에 사용법을 기록했다.

검증 근거:

- 기존 385 tests, release tests 4개, typecheck, build 통과.
- release tests는 payload/문자열 보존/KST/멘션 억제, 서비스 실패 처리, 각 명령 실패 시 중단 순서를 확인한다.
- 실제 URL로 양쪽에 일반 테스트 메시지를 보냈고 사용자가 스크린샷으로 수신을 확인했다.
- 카드 형식 변경 후에도 양쪽에 `[TEST]` 메시지 전송, HTTP 성공 확인. 카드 렌더링의 추가 사용자 확인은 아직 없다.
- `.env.release` Git 제외 확인. npm pack dry-run에서 `.env` 및 릴리즈 스크립트 제외 확인.
- 다음 신규 릴리즈에서 실제 publish → registry 반영 → 알림 전체 흐름을 확인해야 한다.

## 1419 — 합의된 방향

사용자는 Amplitude를 POC로 사용하고 비용이 발생하면 직접 만든 수집 서버로 대체하고 싶어 한다.
UI에서 SDK를 직접 부르지 말고 작은 공통 `track(event, properties)` 모듈을 통해 연동한다.
과도한 provider 구조나 추상화는 만들지 않는다.

- Review Kit 자체 패널과 컨트롤만 추적한다. 검토 대상 사이트의 일반 클릭, 입력, DOM/text 내용은 제외한다.
- 이벤트: `view`, `click`, `success`, `failure`.
- 공통 속성: 소비 프로젝트 `project_id`, `package_version`, 안정적인 익명 식별자.
  `reviewer_name`은 제공될 때만 선택 속성으로 사용하며 이름을 고유 ID로 쓰지 않는다.
- `view`: 실제 보이는 패널의 `panel_id`.
- `click`: `panel_id`, `control_id`, `action`.
- `success`/`failure`: save/import/upload 등의 실제 결과. HTTP 상태와 application-level 결과를 모두 검사한다.
- 키가 없으면 앱 동작에 영향 없이 비활성화. 민감정보가 이벤트에 섞이지 않도록 허용할 속성을 명시한다.
- offline queue/retry 동작, 저장 성공·실패 경로, 실제 대시보드 수신, 기존 tests/typecheck/build를 검증한다.

### 아직 결정하지 않은 사항

사용자가 Amplitude 설치 프롬프트를 제공했다. 그 프롬프트는 `@amplitude/unified@^1`,
autocapture 활성화, Session Replay 100%, 명시적 이벤트 정확히 1개를 요구한다.
이는 기존 태스크 범위와 충돌한다. 그대로 적용하지 말고 사용자와 범위를 확정한다.
프롬프트에 프로젝트 ingestion key가 있었지만 이 문서나 소스에 복사하지 않았다.
필요하면 사용자에게 로컬 환경설정을 요청한다.

마지막 추천은 Event Segmentation, Funnels, Retention부터 시작하고 Session Replay는
내부 테스트 환경에서 별도 실험하는 것이었다. 사용자가 이 추천을 최종 승인한 것은 아니다.
Replay를 도입한다면 고객 사이트 내용에 대한 masking/capture 경계를 먼저 검증한다.
요금·기능 한도는 변할 수 있으므로 시작 시 공식 문서에서 다시 확인한다.

## 다음 에이전트의 시작점

1. `AGENTS.md`, 현재 Git 상태, Dudu 1419의 최신 요구사항을 확인한다.
2. 사용자와 POC 범위(명시적 analytics / autocapture / replay)를 확정한다.
3. 동의된 범위에서 SDK 문서를 확인하고 공통 tracking 모듈 및 Save 성공·실패 경로부터 연결한다.
4. Amplitude 실제 수신 증거를 확보한 뒤 나머지 컨트롤로 확장한다.

공식 참고: [Amplitude 문서](https://amplitude.com/docs), [요금](https://amplitude.com/pricing).
