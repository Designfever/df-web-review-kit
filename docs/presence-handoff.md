# review-kit presence handoff

## 목적

QA 작업 중 "누가 어떤 review page를 보고 있는지"를 보여주기 위한 presence 기능 handoff 문서다.

Presence는 저장소가 아니다. `local`, `df-sheet`, `supabase` 같은 review item adapter는 영속 데이터 CRUD를 맡고, presence adapter는 현재 접속 세션 상태만 공유한다.

## 현재 구현

추가된 파일:

- `src/react-shell/presence.ts`
- `src/react-shell/types.ts`
- `src/react-shell.tsx`
- Lexus mount: `page/review/index.tsx`

현재 `page/review/index.tsx`는 local 개발용 presence adapter를 붙인다.

```ts
import { createLocalPresenceAdapter } from '@designfever/web-review-kit/react-shell';

const REVIEW_PRESENCE_ADAPTER = createLocalPresenceAdapter({
  channelName: `${REVIEW_PROJECT_ID}:review-presence`,
});

mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters: REVIEW_ADAPTERS,
  presence: REVIEW_PRESENCE_ADAPTER,
});
```

현재 Lexus pilot은 `VITE_REVIEW_SUPABASE_ANON_KEY`가 있으면 Supabase Presence를 쓰고, 없으면 `createLocalPresenceAdapter()`로 fallback한다.

`createLocalPresenceAdapter()`는 `BroadcastChannel` 기반이다. 같은 origin의 여러 review 탭에서만 동작한다. 실제 팀 공유용 구현은 Supabase adapter를 사용한다.

```env
VITE_REVIEW_SUPABASE_URL=https://vhqnvfkamnpgyqclohso.supabase.co
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
```

## Public contract

```ts
type ReviewPresenceAdapter = {
  label: string;
  connect: (
    context: ReviewPresenceContext
  ) => Promise<ReviewPresenceSession> | ReviewPresenceSession;
};

type ReviewPresenceSession = {
  update: (state: Partial<ReviewPresenceState>) => void | Promise<void>;
  subscribe: (
    callback: (users: ReviewPresenceUser[]) => void
  ) => () => void;
  disconnect: () => void | Promise<void>;
};
```

`ReviewPresenceState`는 현재 이 shape을 사용한다.

```ts
type ReviewPresenceState = {
  projectId: string;
  sessionId: string;
  userId: string;
  displayName: string;
  color: string;
  routeKey: string;
  target: string;
  source: 'local' | 'df-sheet';
  viewport: {
    label: string;
    width: number;
    height: number;
    kind: 'mobile' | 'tablet' | 'desktop' | 'wide';
  };
  mode: 'idle' | 'note' | 'element' | 'area';
  selectedItemId?: string | null;
  selectedReviewNumber?: number | null;
  status: 'idle' | 'reviewing' | 'editing';
  updatedAt: string;
};
```

## Shell behavior

- Settings의 `User ID`가 비어 있으면 presence는 연결하지 않는다.
- `User ID`가 있으면 우측 QA list header 아래에 `online N`과 user chip을 보여준다.
- user chip에는 `displayName`, `target`, `viewport.label`을 표시한다.
- 현재 탭은 `is-self` class로 표시된다.
- 업데이트는 느린 상태만 보낸다:
  - route/target
  - source
  - viewport
  - review mode
  - selected item/review number
  - status
- scroll, mousemove, cursor 위치는 보내지 않는다.

## 왜 storage adapter와 분리했나

storage adapter:

- `get`
- `list`
- `create`
- `updateStatus`
- `remove`
- remote promote/move

presence adapter:

- `connect`
- `update`
- `subscribe`
- `disconnect`

수명주기가 다르다. storage는 item의 영속 상태이고, presence는 websocket session 상태다. 같은 adapter array에 넣으면 API가 어색해지고, remote item source를 바꾸는 일과 협업 session을 바꾸는 일이 섞인다.

## 다음 작업

1. `supabasePresenceAdapter` 추가
2. `@supabase/supabase-js`를 peer/dev dependency로 둘지 별도 package adapter로 분리할지 결정
3. Supabase project/env 연결
4. private channel + Realtime Authorization 적용
5. 두 브라우저 또는 두 기기에서 같은 project presence 확인

## 주의점

- Presence payload는 작게 유지한다.
- high-frequency state는 Presence에 넣지 않는다.
- 현재 `ReviewSource`가 `'local' | 'df-sheet'`로 고정되어 있어서 source generalization 작업과 Supabase storage adapter 작업이 만나면 타입을 먼저 풀어야 한다.
- `User ID`는 현재 localStorage 기반이다. 실제 remote presence에서는 auth user id나 project member id로 바꾸는 편이 맞다.
