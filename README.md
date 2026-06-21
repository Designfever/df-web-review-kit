# df-web-review-kit

Designfever web page review overlay toolkit.

`df-web-review-kit`는 프로젝트 안에 `/review` shell을 붙이고, iframe으로 실제 page를 띄운 뒤 QA note/area/DOM marker를 생성하는 검수 도구다. 각 프로젝트는 adapter만 바꿔서 local draft, df-sheet, Supabase 같은 저장소를 선택한다.

현재 기준:

- package name: `@designfever/web-review-kit`
- current version: `0.1.0`
- default source: `local`
- optional adapters/references: `supabase`, `df-sheet` sample
- public package role: review UI, marker/restore logic, adapter contracts
- internal operations role: OpenClaw `kuku` or a future backend/admin service

## Docs

- [Concept](docs/concept.md): 제품 컨셉, local draft와 remote canonical QA의 역할
- [Operating boundary](docs/operating-boundary.md): public package, host project, OpenClaw 운영 도구의 경계
- [Installation](docs/installation.md): package 설치, `/review` mount, Vite host 예시
- [Supabase setup](docs/supabase.md): optional Supabase item/presence adapter 연결 절차
- [Supabase review item SQL](docs/supabase-review-items.md): table, RPC, RLS, migration SQL
- [Presence strategy](docs/presence-handoff.md): local/Supabase/future service presence 경계
- [Supabase presence](docs/supabase-presence.md): Realtime Presence adapter 구조
- [Adapter handoff](docs/adapter-handoff.md): adapter contract와 분리 계획
- [df-sheet next](docs/df-sheet-next.md): future df-sheet service/reference 방향

`docs/initial-plan.md`는 초기 아이디어 기록이다. 현재 설치/운영 기준은 이 README와 위 문서를 우선한다.

## Quick Start

Host project에 package와 React peer dependency를 설치한다.

```bash
pnpm add @designfever/web-review-kit react react-dom
```

기본 설치는 local-only다. Supabase를 optional remote/presence adapter로 쓰는 host만 Supabase client를 설치한다.

```bash
pnpm add @supabase/supabase-js
```

Vite project 예시:

```tsx
import {
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
  createReviewPagesFromGlob,
  createSupabasePresenceAdapter,
  mountReviewShell,
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

const REVIEW_PROJECT_ID = 'my-project';
const REVIEW_PATH_PREFIX = '/review';
const pages = createReviewPagesFromGlob(import.meta.glob('/**/index.tsx'), {
  exclude: (href) =>
    href === '/review/' ||
    href === '/guide/' ||
    href.startsWith('/guide/'),
});

const local = localAdapter({
  storageKey: `${REVIEW_PROJECT_ID}-review-items`,
});

const supabaseClient = import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY
  ? createClient(
      import.meta.env.VITE_REVIEW_SUPABASE_URL,
      import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY
    )
  : null;

const supabase = supabaseClient
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
  ...(supabase
    ? [
        {
          label: 'supabase',
          get: (id) => supabase.get(id),
          list: (query) => supabase.list(query),
          create: (item) => supabase.create(item),
          statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
          updateStatus: ({ id, status }) => supabase.update(id, { status }),
          remove: (id) => supabase.remove(id),
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

mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters,
  reviewPathPrefix: REVIEW_PATH_PREFIX,
  presence,
});
```

## Local dev review harness

Package 자체 동작을 host project 없이 확인할 수 있는 Vite fixture가 포함되어 있다.

```bash
pnpm dev:review
```

Open `http://127.0.0.1:5177/review/` and use the built-in fixture pages:

- `/` — note/area/DOM marker 기본 생성 확인
- `/components/` — controls, input, panel spacing 확인
- `/long-form/` — iframe scroll/anchor restore 확인

검증용 commands:

```bash
pnpm typecheck:dev
pnpm build:dev
```

## Package boundary

Public imports are limited to the export map:

```ts
import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';
import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
```

- `@designfever/web-review-kit`: core API, adapters, shared types.
- `@designfever/web-review-kit/react-shell`: review shell UI, presence adapters, page glob helper.
- `src/*` is not a public import path.
- OpenClaw-only operator tools such as `kuku` are not part of the package surface.
- `react` and `react-dom` are peer dependencies.
- `lucide-react` is currently bundled into the built shell output, not required from the host.
- Target published/packed files are `dist`, `docs`, and `README.md`; host `/review` pages stay as consumer smoke pages outside the package surface.
- Direct DB/admin CLI artifacts are transitional during the `kuku` split and should not remain in the public package surface.

See [Package split checkpoint](docs/package-split-checkpoint.md) for the current split policy.
See [Operating boundary](docs/operating-boundary.md) for the public package vs internal operations split.

## Optional Supabase Environment

```env
VITE_REVIEW_SUPABASE_URL=https://your-project.supabase.co
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_TABLE=review_items
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
```

Browser에는 Supabase `anon` key만 넣는다. `service_role` key는 넣지 않는다.
Operator keys belong in OpenClaw or backend services, not in this package or host browser env.

## Host Integration Commands

Host repo 안에서 file dependency로 package를 검증할 때의 예시:

```bash
pnpm dev:review
pnpm review-kit:build
pnpm review-kit:typecheck
pnpm typecheck:review
pnpm build:review
```

- `pnpm dev:review`: review-kit build 후 package watch와 Vite dev server 실행
- `pnpm review-kit:build`: package dist build 후 host `node_modules` sync
- `pnpm review-kit:typecheck`: package typecheck
- `pnpm typecheck:review`: host review route typecheck
- `pnpm build:review`: host build 또는 review integration build

이 repo에서는 package를 file dependency로 소비한다.

```json
"@designfever/web-review-kit": "file:packages/df-web-review-kit"
```

package source를 바꾸면 commit 전에 `pnpm review-kit:build`로 `dist`도 같이 갱신한다.

## Data Rules

- local item `#id`는 개인 draft 번호다.
- remote source에 등록하면 remote adapter가 새 canonical `reviewNumber`를 발급한다.
- local에서 remote 등록이 성공하면 local draft는 삭제한다.
- item model에는 screenshot data URL을 넣지 않는다.
- deep link restore는 `source`, `target`, `w`, `h`, `item` query를 기준으로 한다.

Example:

```txt
/review?source=supabase&target=/service/&w=540&h=1080&item=<remote-id>
```

## Verification

Docs-only:

```bash
git diff --check
```

Package source:

```bash
pnpm typecheck
pnpm build
```

Host integration:

```bash
pnpm typecheck:review
pnpm build:review
```

Manual smoke:

1. Open `/review`.
2. Load a target page.
3. Create local note, DOM note, and area item.
4. Submit local item to remote.
5. Confirm local draft is removed.
6. Switch to remote source and open the remote item.
7. Confirm route, viewport, scroll, marker, and prompt restore.
