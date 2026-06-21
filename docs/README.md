# df-web-review-kit docs

현재 문서의 읽는 순서:

1. [Concept](concept.md)
2. [Operating boundary](operating-boundary.md)
3. [Installation](installation.md)
4. [Supabase setup](supabase.md)
5. [Supabase review item SQL](supabase-review-items.md)
6. [Presence strategy](presence-handoff.md)
7. [Supabase presence](supabase-presence.md)
8. [Adapter handoff](adapter-handoff.md)
9. [df-sheet next](df-sheet-next.md)
10. [Review feedback 2026-06-20](review-feedback-2026-06-20.md)
11. [Stabilize UI work guide](stabilize-ui-work-guide.md)
12. [Smoke baseline 2026-06-20](smoke-baseline-2026-06-20.md)
13. [Package split checkpoint](package-split-checkpoint.md)

## 문서 역할

- `concept.md`: 왜 이 package가 있고 어떤 문제를 해결하는지.
- `operating-boundary.md`: public package, host project, OpenClaw 운영 도구, future backend의 책임 경계.
- `installation.md`: host project에 설치하고 `/review` route에 붙이는 방법.
- `supabase.md`: optional Supabase remote/presence adapter를 연결하는 방법.
- `supabase-review-items.md`: optional Supabase adapter sample table/RPC/RLS SQL.
- `presence-handoff.md`: presence의 개념, storage adapter와의 분리, local/Supabase/future service 전략.
- `supabase-presence.md`: optional Supabase Realtime Presence adapter 구조.
- `adapter-handoff.md`: package repo로 옮길 때 필요한 adapter contract 정리.
- `df-sheet-next.md`: df-sheet를 future service/reference로 쓸 때 필요한 제품/API 방향.
- `review-feedback-2026-06-20.md`: 빵빵/팡팡/오빵 package 리뷰 메모와 우선순위.
- `stabilize-ui-work-guide.md`: anchor 안정화, UI token화, package split 전 작업 순서.
- `smoke-baseline-2026-06-20.md`: 761 현재 기능 smoke 기준선 결과.
- `package-split-checkpoint.md`: 765 package export/file/peer dependency와 host 소비 경계.
- `initial-plan.md`: 초기 계획 기록. 현재 기준 문서가 아니다.

## 현재 기준

- `local`: 개인 draft 저장소.
- `supabase`: optional remote/presence adapter sample. 사용자가 자기 Supabase를 설정할 때 쓴다.
- `df-sheet`: adapter sample/reference. service 계약이 확정되면 backend 후보가 된다.
- `presence`: 영속 저장소가 아니라 현재 접속 session state다.
- `kuku`: OpenClaw 내부 운영 CLI. public package publish surface에 포함하지 않는다.
- local 번호는 개인 draft용이고, remote 번호는 remote source가 새로 발급하는 canonical 번호다.
- browser env에는 anon key나 scoped token만 둔다. service/operator secret은 OpenClaw나 backend에 둔다.
