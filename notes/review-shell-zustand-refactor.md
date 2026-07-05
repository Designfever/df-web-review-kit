# Review Shell Zustand Refactor Plan

## Goal

Reduce the prop drilling and orchestration load in `src/react-shell/review/shell.tsx` by moving shell UI/domain state into feature-scoped Zustand slices.

The current problem is not only `shell.tsx`. The same state and callbacks are passed from `ReviewShell` into feature panels and then further into panel headers, cards, toolbars, and overlays. Refactoring only the top-level props would turn the issue into larger prop objects. The target shape is feature boundary components that read their own state through selectors, while leaf UI stays mostly presentational.

## Current Pressure Points

- `ReviewShell` is acting as a state switchboard instead of a composition layer.
- `ReviewQaPanel` receives a broad mix of adapter config, item data, filters, source controls, mutation actions, copy actions, and selection state.
- `ReviewTargetFrame` receives many ruler-related fields that naturally belong to one feature state group.
- Several feature hooks return large objects that are immediately exploded into props.
- Adding new review features currently increases the width of `shell.tsx` and the downstream prop chains.

## Direction

Use Zustand for shell-owned UI and domain state, split by feature.

Do not move every value into the store. Keep imperative integration values in hooks/refs, especially anything tied to iframe DOM, core controller lifecycle, browser event binding, or request cancellation.

### Store in Zustand

- Current route/source/target/viewport state.
- Side panel visibility and active panel.
- QA item raw state, filters, loading state, selected/editing item id, hidden overlay ids, mutation ids.
- Settings modal draft state.
- Figma image panel UI state and overlay toggles, where it reduces prop chains.
- Source tree filter/collapse/meta visibility state.
- Ruler visibility and display state, if it can stay independent from DOM refs.
- Toast state, if shared across feature actions.

### Keep Outside Zustand

- `iframeRef`, `frameScrollRef`, `controllerRef`, `targetRef`, `sizeRef`, `selectedItemIdRef`.
- `pendingInitialItemIdRef`, `pendingRestoreRef`, `cleanupTargetRef`.
- Source inspector interaction refs and direct iframe shortcut binding.
- Ruler overlay DOM refs and pointer-event wiring.
- Core controller initialization/reload/restore functions.
- Request race guards such as incrementing refresh ids.
- Host adapter instances and store clients, unless they become stable app-level dependencies.

## Proposed Slice Boundaries

### `target` slice

Owns route/source/target/viewport UI state.

- `activeRoute`
- `source`
- `target`
- `draftTarget`
- `size`
- `targetOverlayState`
- derived selectors for `targetSrc`, active adapter entry, and source select visibility can live in hooks/selectors.

### `qa` slice

Owns QA item state and QA panel UI state.

- `items`
- `sitemapItems`
- `qaFilter`
- `qaStatusFilter`
- `hiddenOverlayItemIds`
- `selectedItemId`
- `editingItemId` or `editingItem`
- `isItemsLoading`
- `mutatingItemIds`
- `copiedPromptKey`

Derived lists such as `activeItems`, `filteredNumberedActiveItems`, counts, and scope maps should be selector/hook output, not stored raw state.

### `sidePanel` slice

Owns feature panel visibility.

- `sidePanel`
- `isListVisible`
- `openSidePanel`
- `toggleSidePanel`

This is low risk and a good first migration because it has little adapter/core coupling.

### `settings` slice

Owns shell settings modal and drafts.

- Figma token modal open state.
- Token/user/theme draft values.
- Save status.
- Token guide and visibility toggles.

Persistence can stay in the existing settings hook while the UI state moves to the slice.

### `sourceTree` slice

Owns source outline panel UI state.

- Filter text.
- Collapsed ids.
- Metadata visibility.
- Filtering/loading flags.

DOM extraction, retry scheduling, and MutationObserver logic should stay in the feature hook.

### `ruler` slice

Owns user-visible ruler state where practical.

- Visible flag.
- Hover point.
- Measurement display data.
- Unit/scale values.

Pointer handling and overlay refs stay in `useReviewRuler`.

## Component Ownership

Prefer this shape:

```txt
ReviewShell
  -> mounts feature containers and modal gates

QaPanelContainer
  -> reads qa/target/source slices with narrow selectors
  -> calls feature actions
  -> renders presentational QaPanel/Header/Card components

TargetFrameContainer
  -> reads target/ruler/figma overlay selectors
  -> keeps iframe/ref wiring close to target frame logic
  -> renders ReviewTargetFrame
```

Avoid making every tiny component call the store directly. Use store selectors at feature boundaries, then pass small props inside the feature.

## Selector Rules

- Never call `useReviewShellStore()` without a selector in React components.
- Export focused selectors or small feature hooks such as `useQaPanelView()`.
- Prefer primitive or stable object selector outputs.
- Use shallow comparison only where a selector must return a grouped object.
- Keep derived arrays/maps memoized, especially QA counts and filtered item lists.

## Migration Order

### 1. Add store scaffold

- Add Zustand as a runtime dependency.
- Create `src/react-shell/store/`.
- Add `use.review.shell.store.ts` or feature-specific store modules.
- Keep the public React shell API unchanged.

Validation:

- `pnpm typecheck`
- `pnpm test`

### 2. Move side panel state

- Replace `useReviewSidePanel` local state with a `sidePanel` slice or make the hook a wrapper around the slice.
- Keep existing component props during this step.

Validation:

- QA panel, Source Tree panel, and Figma Images panel open/toggle behavior.
- Local persistence behavior, if currently owned by the hook.

### 3. Move QA panel state

- Move raw QA state and filters into the `qa` slice.
- Keep adapter mutations in `useReviewItemActions` at first.
- Convert `ReviewQaPanel` to a feature container plus smaller presentational children.
- Remove most QA props from `ReviewShell`.

Validation:

- Item refresh.
- Filter/status filter.
- Select/restore item.
- Hide/show item overlay.
- Status/assignee mutation.
- Edit modal.
- Copy prompt/link/remote issue path.

### 4. Move target/viewport shell state

- Move target, draft target, source, viewport size, route, and overlay state into `target`.
- Keep core controller write-through actions in existing controller/navigation hooks.
- Ensure URL sync remains one-way and predictable.

Validation:

- Page switch through sitemap.
- Manual path entry.
- Viewport preset change.
- Target reload.
- Overlay toggles.
- Initial item restore from URL.

### 5. Move settings/source tree/ruler selectively

- Move only state that reduces prop chains.
- Keep DOM extraction, keyboard binding, pointer handling, and controller interaction in hooks.

Validation:

- Settings save/reload flow.
- Source Tree refresh/filter/collapse/open source.
- Ruler toggle/measure/close interactions.

## Risks

- Over-storing refs and imperative objects would make lifecycle bugs harder to debug.
- Broad selectors can cause unnecessary re-renders and erase the performance benefit.
- Moving derived state into the store can create stale duplicated state.
- Letting leaf components mutate global state directly can make feature behavior hard to trace.
- Introducing Zustand as a dependency affects the package runtime surface. It should be a direct dependency unless the store is intentionally exposed to host apps.

## Done Criteria

- `ReviewShell` reads as a composition layer, not a state switchboard.
- Feature panels no longer receive 20+ mixed props from `ReviewShell`.
- Core controller and iframe lifecycle remain in hooks/refs.
- Public package API remains compatible.
- Typecheck, tests, and build pass:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Manual smoke:

```bash
pnpm dev:review
```

Check target navigation, QA item CRUD, panel toggles, source tree, ruler, and Figma image overlay flows.
