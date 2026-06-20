# Stabilize UI work guide

Branch:

```txt
uforgot/feat/review-kit-stabilize-ui
```

Purpose:

`df-web-review-kit`를 package로 분리하기 전에 0.1 기반을 안정화하고, review shell chrome을 token 기반 UI로 정리한다.

## Scope

In scope:

- Fix DOM anchor restore bug.
- Establish smoke test baseline for current review workflow.
- Introduce `df-review-token` layer inspired by Vercel Geist tokens.
- Apply tokenized UI to review shell chrome.
- Split only the React shell parts that block the UI cleanup.
- Prepare package split checklist.

Out of scope:

- Figma overlay module migration.
- Editing proposal feature.
- Source patch AI adapter.
- Full rewrite of `react-shell.tsx`.

Follow-up branches:

```txt
uforgot/feat/review-kit-figma-module
uforgot/feat/review-kit-editing-proposal
```

## Work order

### 0. Fix anchor restore

Files:

```txt
src/react-shell/anchor-restore.ts
src/core/web-review-kit-app.ts
```

Goal:

Element-mode review items must restore by DOM anchor even when their `scope` is a viewport scope such as `mobile` or `desktop`.

Context:

Current `queryReviewItemAnchorElement` exits unless `item.scope === 'dom'`, but element-mode items can be stored as `kind: note` with `anchor + selection` and viewport scope.

Deliverable:

- Shared or local predicate that treats `scope === 'dom'` or `kind === 'note' && anchor && selection` as anchor-restorable.
- Anchor restore path uses that predicate.

Verification:

- Create an element-mode QA item.
- Scroll away.
- Click the item in the QA list.
- The target element is restored by selector/anchor, not only by stale coordinates.

### 1. Capture smoke baseline

Goal:

Before UI changes, confirm the current workflow still works.

Deliverable:

- Manual smoke checklist result in the PR/commit notes or a short docs note.

Verification checklist:

- Local note create.
- Local element QA create.
- Local area QA create.
- Item restore after scroll.
- Remote submit to Supabase.
- Remote source list.
- Remote status change.
- Remote delete.
- `/review?source=supabase&target=...&item=...` restore.

### 2. Add review token layer

Files:

```txt
src/react-shell/style.ts
src/core/overlay-style.ts
```

Goal:

Adopt a developer-tool UI tone using Vercel Geist as reference, without depending on Vercel token names at runtime.

Rules:

- Use `df-review-token` or `--df-review-*` naming.
- Do not expose `geist` or `vercel` as public API names.
- Keep light/dark theme support.
- Use neutral surfaces, restrained color, clear state colors.
- Do not change target page styling.

Deliverable:

- CSS custom properties for color, spacing, radius, typography, shadow/border.
- Existing chrome components consume those variables.

Verification:

- Dark and light themes render correctly.
- Buttons, selects, cards, modals, and overlay controls keep usable contrast.
- Target iframe content is not affected.

### 3. Apply UI chrome refresh

Files:

```txt
src/react-shell.tsx
src/react-shell/style.ts
src/core/overlay-style.ts
```

Goal:

Refresh only the review tool UI, not the host website UI.

Targets:

- Topbar.
- Path input and load/copy buttons.
- Source select and refresh button.
- Viewport preset buttons.
- Grid, Figma, ruler, settings controls.
- QA cards.
- Prompt/settings/sitemap modals.

Deliverable:

- More consistent developer-tool chrome.
- Icon buttons stay compact.
- Text does not overflow in compact panels.

Verification:

- Mobile, tablet, desktop, wide review presets.
- QA list open/closed states.
- Empty state and filtered state.
- Prompt/settings/sitemap modals.

### 4. Split only blocking React shell parts

Goal:

Reduce `react-shell.tsx` risk without turning this branch into a rewrite.

Allowed splits:

- `Topbar`.
- `ItemList`.
- `SettingsModal`.
- `PromptModal`.
- `SitemapModal`.

Rules:

- Split only when the UI token work becomes hard to review in one file.
- Keep behavior unchanged.
- Avoid new state architecture in this branch.

Deliverable:

- Smaller reviewable components if needed.
- No broad refactor.

Verification:

- Typecheck passes.
- Existing interactions still work.

### 5. Package split checkpoint

Goal:

Make the package ready to split after this branch, before Figma module migration.

Checklist:

- `package.json` export map is accurate.
- `files` list is intentional.
- `react` and `react-dom` stay peer dependencies.
- Decide whether `lucide-react` is peer or bundled.
- `src`, `dist`, and `docs` publishing policy is explicit.
- Host project consumes the package through the same exported API.

Deliverable:

- Short package split note or checklist update.

Verification:

```bash
pnpm --dir packages/df-web-review-kit typecheck
pnpm exec tsc --noEmit
pnpm review-kit:build
```

## Figma module boundary for next branch

Figma overlay migration should start only after this branch is stable.

Boundary:

- Package core renders overlay.
- Host provides image URL/blob or a Figma asset adapter.
- Browser-exposed Figma token and Figma REST fetch do not enter package core.
- Current viewport replaces host zustand `isMobile/clientWidth` dependency.

Expected next branch:

```txt
uforgot/feat/review-kit-figma-module
```

## Completion criteria

This branch is ready for review when:

- Anchor restore bug is fixed.
- Smoke baseline is documented.
- UI token layer is in place.
- Review shell chrome is visually consistent.
- Typecheck and build pass.
- Figma migration remains out of scope.
