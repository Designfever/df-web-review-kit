# df-web-review-kit docs

현재 문서의 읽는 순서:

1. [Concept](concept.md)
2. [Installation](installation.md)
3. [Supabase setup](supabase.md)
4. [Supabase review item SQL](supabase-review-items.md)
5. [Supabase presence](supabase-presence.md)
6. [Adapter handoff](adapter-handoff.md)
7. [df-sheet next](df-sheet-next.md)
8. [Review feedback 2026-06-20](review-feedback-2026-06-20.md)
9. [Stabilize UI work guide](stabilize-ui-work-guide.md)
10. [Smoke baseline 2026-06-20](smoke-baseline-2026-06-20.md)
11. [Package split checkpoint](package-split-checkpoint.md)

## 문서 역할

- `concept.md`: 왜 이 package가 있고 어떤 문제를 해결하는지.
- `installation.md`: host project에 설치하고 `/review` route에 붙이는 방법.
- `supabase.md`: Supabase를 remote QA 저장소와 presence backend로 연결하는 방법.
- `supabase-review-items.md`: 실제 table/RPC/RLS SQL.
- `supabase-presence.md`: Supabase Realtime Presence adapter 구조.
- `adapter-handoff.md`: package repo로 옮길 때 필요한 adapter contract 정리.
- `df-sheet-next.md`: df-sheet를 source of record로 쓸 때 필요한 제품/API 방향.
- `review-feedback-2026-06-20.md`: 빵빵/팡팡/오빵 package 리뷰 메모와 우선순위.
- `stabilize-ui-work-guide.md`: anchor 안정화, UI token화, package split 전 작업 순서.
- `smoke-baseline-2026-06-20.md`: 761 현재 기능 smoke 기준선 결과.
- `package-split-checkpoint.md`: 765 package export/file/peer dependency와 host 소비 경계.
- `initial-plan.md`: 초기 계획 기록. 현재 기준 문서가 아니다.

## 현재 기준

- `local`: 개인 draft 저장소.
- `supabase`: 팀 공유 remote 저장소.
- `df-sheet`: 나중에 issue workflow로 연결할 수 있는 remote destination.
- local 번호는 개인 draft용이고, remote 번호는 remote source가 새로 발급하는 canonical 번호다.
