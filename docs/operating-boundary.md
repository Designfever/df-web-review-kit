# Operating boundary

`df-web-review-kit` is a public npm package. It should stay safe to publish and should not own Designfever's internal operations, secrets, or project-specific QA administration.

## Roles

### df-web-review-kit

The package provides the review UI and adapter contracts.

- review shell UI
- iframe target loading
- marker creation and restore
- prompt generation
- adapter contracts
- local adapter
- presence adapter contract
- optional backend adapters and reference implementations
- schema/runbook docs for optional backend adapters

The package can include optional adapters such as Supabase or df-sheet references, but those adapters must be configured by the host project. The package must not assume one Designfever-operated backend as the default service.

### Host project

The consuming project owns the `/review` route and browser-safe configuration.

- creates the review route
- passes page list, project id, and viewport presets
- chooses which adapters to enable
- creates any browser client such as Supabase
- chooses whether presence is local, optional Supabase, or a future service adapter
- provides only browser-safe env values

Browser env may contain a Supabase `anon` key or a narrowly scoped integration token when the host intentionally enables that adapter. It must not contain `service_role` keys or OpenClaw operator credentials.

### OpenClaw / kuku

OpenClaw owns internal QA operations.

- reads operator secrets from OpenClaw env
- lists and edits QA rows for agents
- moves item status during agent work
- can use server/operator credentials when needed

This layer is not part of the public npm package. The planned command name is `kuku`; it belongs under the OpenClaw workspace, not under this package's publish surface.

### Future df-sheet service

df-sheet can become a review backend service later.

- stores review items as issues
- provides scoped API endpoints
- handles production auth and permissions
- can provide realtime/presence if needed

Until that service contract is finalized, the df-sheet adapter docs are reference/sample material, not a required production backend.

## Decisions

- The default install path is local-only.
- Supabase remains an optional adapter/sample for users who want to configure their own Supabase project.
- Supabase `service_role` keys never go in browser env, package docs examples, or package files.
- Presence is transient collaboration state, not the source of record for QA items.
- Supabase Presence remains an optional adapter sample; future production presence may live in df-sheet or another backend service.
- Direct DB/admin workflows belong to OpenClaw `kuku` or a future backend/admin service.
- Public package docs may describe adapter contracts and schema setup, but not internal operator secrets.

## Operator tooling

Direct DB/admin workflows are intentionally outside this public package. The follow-up operational tool is OpenClaw `kuku`.

- The package does not publish a `bin` command.
- The package does not include direct DB operator CLI docs.
- OpenClaw `kuku` owns agent-side list/show/status/edit workflows.
- Supabase adapter docs remain optional setup/reference.
- df-sheet adapter docs remain sample/reference until service API is fixed.
