# Installation

Host project에 `df-web-review-kit`를 설치하고 `/review` route에서 `mountReviewShell()`을 호출한다.

## Package install

NPM package로 사용할 때:

```bash
pnpm add @designfever/web-review-kit react react-dom
```

Supabase remote/presence를 쓰면 host project에 Supabase client도 설치한다.

```bash
pnpm add @supabase/supabase-js
```

Lexus repo 안에서 검증할 때는 file dependency를 사용한다.

```json
"@designfever/web-review-kit": "file:packages/df-web-review-kit"
```

## Vite route

Vite project에서는 `page/review/index.html`과 `page/review/index.tsx` 같은 review entry를 만든다.

Minimal `index.html`:

```html
<div id="root"></div>
<script type="module" src="./index.tsx"></script>
```

Minimal `index.tsx`:

```tsx
import {
  createReviewPagesFromGlob,
  mountReviewShell,
} from '@designfever/web-review-kit/react-shell';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  localAdapter,
} from '@designfever/web-review-kit';

const REVIEW_PROJECT_ID = 'my-project';
const local = localAdapter({
  storageKey: `${REVIEW_PROJECT_ID}-review-items`,
});

const pages = createReviewPagesFromGlob(import.meta.glob('/**/index.tsx'), {
  exclude: (href) => href === '/review/',
});

mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters: [
    {
      label: 'local',
      get: (id) => local.get(id),
      list: (query) => local.list(query),
      create: (item) => local.create(item),
      statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
      updateStatus: ({ id, status }) => local.update(id, { status }),
      syncSubmission: ({ id, patch }) => local.update(id, patch),
      remove: (id) => local.remove(id),
    },
  ],
  reviewPathPrefix: '/review',
});
```

## Supabase remote example

Supabase를 붙일 때는 host project에서 client를 만들고 package adapter에 주입한다.

```tsx
import {
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
  createSupabasePresenceAdapter,
  type ReviewShellAdapter,
  type SupabasePresenceClient,
} from '@designfever/web-review-kit/react-shell';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  localAdapter,
  supabaseAdapter,
  type SupabaseReviewClient,
} from '@designfever/web-review-kit';
import { createClient } from '@supabase/supabase-js';

const REVIEW_PROJECT_ID = 'lexus-official-v2026';
const REVIEW_PATH_PREFIX = '/review';

const local = localAdapter({
  storageKey: `${REVIEW_PROJECT_ID}-review-items`,
});

const supabaseClient = import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY
  ? createClient(
      import.meta.env.VITE_REVIEW_SUPABASE_URL,
      import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY
    )
  : null;

const remote = supabaseClient
  ? supabaseAdapter({
      client: supabaseClient as unknown as SupabaseReviewClient,
      table: import.meta.env.VITE_REVIEW_SUPABASE_TABLE || 'review_items',
      projectId: REVIEW_PROJECT_ID,
      source: 'supabase',
      reviewPathPrefix: REVIEW_PATH_PREFIX,
    })
  : null;

const adapters = [
  {
    label: 'local',
    get: (id) => local.get(id),
    list: (query) => local.list(query),
    create: (item) => local.create(item),
    statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
    updateStatus: ({ id, status }) => local.update(id, { status }),
    syncSubmission: ({ id, patch }) => local.update(id, patch),
    remove: (id) => local.remove(id),
  },
  ...(remote
    ? [
        {
          label: 'supabase',
          get: (id) => remote.get(id),
          list: (query) => remote.list(query),
          create: (item) => remote.create(item),
          statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
          updateStatus: ({ id, status }) => remote.update(id, { status }),
          remove: (id) => remote.remove(id),
        } satisfies ReviewShellAdapter,
      ]
    : []),
] satisfies ReviewShellAdapter[];

const localPresence = createLocalPresenceAdapter({
  channelName: `${REVIEW_PROJECT_ID}:review-presence`,
});

const presence = supabaseClient
  ? createFallbackPresenceAdapter(
      createSupabasePresenceAdapter({
        client: supabaseClient as unknown as SupabasePresenceClient,
        channelPrefix: 'review-presence',
        private: import.meta.env.VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE === 'true',
      }),
      localPresence
    )
  : localPresence;
```

그 다음 `mountReviewShell({ adapters, presence, ... })`에 넘긴다.

## Environment

```env
VITE_REVIEW_SUPABASE_URL=https://your-project.supabase.co
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_TABLE=review_items
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
```

Rules:

- browser env에는 Supabase `anon` key만 넣는다.
- `service_role` key는 절대 browser env에 넣지 않는다.
- package는 Supabase dependency를 직접 만들지 않는다. host project가 `createClient()`를 호출한다.

## Viewport preset

Project별 design width가 다르면 `presets`를 넘긴다.

```tsx
mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters,
  presets: [
    { label: 'Mobile', kind: 'mobile', width: 540, height: 1080, designWidth: 540 },
    { label: 'Tablet', kind: 'tablet', width: 768, height: 1024, designWidth: 768 },
    { label: 'Desktop', kind: 'desktop', width: 1440, height: 900, designWidth: 1440 },
    { label: 'Wide', kind: 'wide', width: 1980, height: 1080, designWidth: 1980 },
  ],
});
```

## Development commands

Lexus repo 기준:

```bash
pnpm dev:review
pnpm review-kit:typecheck
pnpm typecheck:review
pnpm review-kit:build
pnpm build:review
```

Package source를 수정하면 `pnpm review-kit:build`로 `dist`를 갱신한다.

## Publish checklist

0.1 package 배포 전 확인:

- `packages/df-web-review-kit/package.json`의 `files`에 `dist`, `src`, `docs`, `README.md` 포함
- `pnpm review-kit:typecheck`
- `pnpm review-kit:build`
- local source에서 note/dom/area 생성 확인
- local item을 remote로 등록하면 local draft 삭제 확인
- remote source에서 status update/delete 확인
- `/review?source=supabase&target=...&item=...` restore 확인
- Supabase `reviewNumber`가 삭제 후 재사용되지 않는지 확인
