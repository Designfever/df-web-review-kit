# Agent instructions

## Release

- 사용자가 npm 릴리즈를 요청하면 반드시 `pnpm release -- "변경 내용 메모"`를 사용한다.
  이 명령은 `scripts/release.sh`를 실행한다. 별도로 `npm publish`를 실행하면 알림이 누락된다.
- 실행 전 변경 범위와 `package.json` 버전을 확인한다. 신규 버전과 실제 변경 내용을 담은 메모를 준비한다.
  스크립트는 버전 증가, commit, tag, push를 수행하지 않는다.
- Node 22.9+, pnpm, npm publish 권한이 있는 기존 로그인이 필요하다.
- 프로젝트 루트의 `.env.release`에 `JANDI_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL`을 설정한다.
  파일이 없을 때만 `.env.release.example`을 복사한다. 기존 값을 덮어쓰거나 출력하지 않는다.
  실제 URL은 인증정보이므로 Git, 로그, 채팅에 넣지 않는다. 기존 shell 환경변수가 파일보다 우선한다.
- 배포나 메시지 전송 없이 설정만 확인하려면 다음 명령을 사용한다.

  ```sh
  node --env-file-if-exists=.env.release scripts/release/notify.mjs check "변경 내용 메모"
  ```

- 실행 순서: 설정 검사 → 기존 테스트 → 릴리즈 테스트 → typecheck → build → npm publish → JANDI/Discord 알림.
  알림은 패키지, 버전, 메모, 완료 시각(KST), npm 링크를 카드로 전달한다.
- 검사 또는 publish 실패 시 알림은 전송되지 않는다. 알림은 서비스당 한 번만 시도하며 자동 재시도하지 않는다.
- 알림 실패로 명령이 실패해도 npm publish는 이미 성공했을 수 있다. **알림 재시도를 위해 릴리즈 명령을 다시 실행하지 않는다.**
  npm registry와 각 채널의 수신 여부를 먼저 확인한다. timeout도 이미 전달됐을 수 있다.
  재전송이 필요하면 누락된 서비스만 대상으로 한다. `notify.mjs send`는 두 서비스 모두에 전송한다.
- 완료 보고에는 npm registry의 해당 버전 확인 결과와 각 서비스 전송 결과를 구분한다.
  HTTP 성공과 사용자의 실제 채널 수신 확인도 구분한다.

자세한 설정과 사용법: [README의 Release 항목](README.md#release).
