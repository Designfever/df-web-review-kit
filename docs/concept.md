# Concept

`df-web-review-kit`는 웹 프로젝트 안에 넣는 review shell이다. QA 전용 SaaS나 Chrome extension이 아니라, 프로젝트가 가진 route, viewport, DOM, style context를 그대로 사용해 검수 이슈를 남기는 toolkit이다.

## 해결하려는 문제

웹 QA는 보통 다음 정보가 빠져서 다시 확인하는 시간이 길어진다.

- 정확한 page route
- viewport size
- scroll position
- DOM anchor
- 깨진 영역의 좌표
- 사람이 남긴 comment
- 누가 같은 page를 보고 있는지

review-kit은 이 정보를 review item 하나에 묶어서 저장하고, `/review?...` link로 다시 복원한다.

## 기본 UX

1. `/review`를 연다.
2. sitemap에서 target page를 고른다.
3. mobile/tablet/desktop/wide viewport를 고른다.
4. iframe 안에서 note, DOM note, area item을 만든다.
5. 개인이 처리할 것은 `local` draft에 둔다.
6. 팀 공유가 필요한 것만 remote source에 등록한다.
7. remote item link를 공유하거나 AI prompt로 복사한다.

## Source 개념

### local

개인 draft 저장소다. `localStorage` 기반이라 빠르고, 실험/개인 처리용 QA를 remote에 섞지 않는다.

local item의 `#id`는 개인 브라우저 안에서만 의미가 있다. 여러 사람이 같은 번호를 가질 수 있다.

### remote

팀이 같이 보는 source of record다. 현재 검증 source는 `supabase`다.

local item을 remote에 등록하면 local id/number를 보존하지 않고 remote source가 새 id와 canonical `reviewNumber`를 발급한다. 등록 성공 후 local draft는 삭제한다.

### df-sheet

df-sheet는 issue workflow와 연결되는 remote destination 후보다. review-kit이 df-sheet issue editor가 되면 안 되고, local QA를 issue로 등록하고 restore link를 제공하는 역할이 맞다.

## Item 종류

- `note`: 화면 특정 지점에 남기는 comment.
- `dom`: DOM element에 anchor를 둔 note.
- `area`: 사용자가 드래그한 영역.

표시 범위는 mobile/tablet/desktop/wide와 연결된다. DOM item은 viewport가 달라도 anchor를 찾아 복원하는 것을 목표로 한다.

## Presence

Presence는 저장소가 아니다. 현재 접속한 사용자의 page/source/viewport 상태만 공유한다.

현재 UI는 같은 page에 들어온 사용자 id만 page header 쪽에 보여준다. sitemap 같은 상위 화면에서는 page별 접속자 표시로 확장할 수 있다.

## 패키지 경계

Package가 담당하는 것:

- review shell UI
- iframe target loading
- marker 생성과 restore
- prompt generation
- adapter contract
- local adapter
- Supabase adapter
- presence adapter contract

Host project가 담당하는 것:

- `/review` route 생성
- page glob 전달
- viewport preset 전달
- project id와 storage key 결정
- remote adapter env와 auth 결정
- Supabase client 생성

## 0.1 목표

0.1은 완전한 review platform이 아니라, 프로젝트별로 붙여 쓸 수 있는 최소 안정 package다.

포함:

- local draft
- Supabase remote CRUD
- Supabase Presence
- stable remote review number
- prompt copy
- route/viewport/scroll/marker restore

보류:

- screenshot upload
- full df-sheet workflow
- auth/member 기반 production RLS
- sitemap presence dashboard
- Chrome extension
