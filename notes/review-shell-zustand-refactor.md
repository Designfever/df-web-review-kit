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

### Store Architecture: Context-Scoped, Not Global

This package is an npm library (`@designfever/web-review-kit`) consumed by host apps, not an app. A module-level global store (`create()`) would leak state across multiple `ReviewShell` mounts, across unmount/remount, and between tests.

Use the vanilla `createStore` + Context provider pattern so each `ReviewShell` instance owns its store:

```tsx
const ReviewShellStoreContext = createContext<ReviewShellStore | null>(null);

// Inside ReviewShell — useState initializer is StrictMode safe.
const [store] = useState(() => createReviewShellStore({ ... }));
```

Expose a `useReviewShellStore(selector)` helper that reads the context and throws outside the provider.

### Ref Mirrors Become getState() Reads

`sizeRef`, `targetRef`, `selectedItemIdRef`, and `hiddenOverlayItemIdListRef` are not DOM/imperative refs — they are mirrors of React state kept for imperative reads in callbacks. Once the backing state moves into a slice, callbacks read `store.getState()` directly and these mirror refs are deleted. Removing the state↔ref double bookkeeping is one of the main wins of this refactor.

Genuinely imperative refs (`iframeRef`, `controllerRef`, `cleanupTargetRef`, etc.) stay in hooks as listed below.

### Config Props Access for Containers

Feature containers stop receiving state through props, but they still need prop-derived config: `projectId`, normalized adapters (`activeAdapterEntry`, `sourceEntries`), `pages`, `reviewPathPrefix`, viewport presets.

Decision: pass these through a separate lightweight config context (`ReviewShellConfigContext`) rather than syncing them into the store. They are effectively immutable per mount, so a context avoids prop→store sync effects. Only `source`-dependent derivations (`activeAdapterEntry`, `isRemoteSource`) combine config context with the `target` slice, via a small hook.

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

- `iframeRef`, `frameScrollRef`, `controllerRef`.
- `pendingInitialItemIdRef`, `pendingRestoreRef`, `cleanupTargetRef`.
- Source inspector interaction refs and direct iframe shortcut binding.
- Ruler overlay DOM refs and pointer-event wiring.
- Core controller initialization/reload/restore functions.
- Request race guards such as incrementing refresh ids.
- Host adapter instances and store clients, unless they become stable app-level dependencies.

Removed from this list vs the first draft: `targetRef`, `sizeRef`, `selectedItemIdRef`, `hiddenOverlayItemIdListRef` — these are state mirrors, deleted once their state moves into slices (see "Ref Mirrors Become getState() Reads").

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

Note: `getAvailableSidePanel` clamping depends on prop-derived flags (`isFigmaImageManagementEnabled`, `isSourceInspectorEnabled`). Decide in this step where the clamp lives — keep it in a wrapper hook that combines the slice with config context, so the slice itself stays prop-free. localStorage persistence stays in the wrapper hook as well.

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
- Never create new arrays/objects inside a selector (`filter`/`map`/spread). Zustand v5 uses `useSyncExternalStore`; an unstable snapshot re-renders every store change and can throw an infinite-loop error. Selectors only pick stored values.
- Derived computation (filtered lists, counts, scope maps) lives in feature hooks with `useMemo` on top of primitive selections — the current `useReviewShellData` shape moves into container hooks.
- Use shallow comparison only where a selector must return a grouped object.

## Execution Sessions

The migration runs as 3 work sessions, each ending with `pnpm typecheck && pnpm test && pnpm build` green and one commit. Sessions may be executed by different agents/AI sessions — this document is the single source of truth for scope and status. When resuming, check the status below and `git log` to find the current position.

- [x] **Session A — scaffold + sidePanel** (migration steps 1–2). Establishes the pattern: store directory layout, `createReviewShellStore`, Provider, `useReviewShellStore(selector)` helper, first slice. Later sessions replicate this pattern — do not deviate from it without updating this document. Landed in `f665cbe`. Pattern established: `src/react-shell/store/` with `create.review.shell.store.ts` (per-instance store), `store.context.tsx` (Provider + `useReviewShellStoreApi` + selector-required `useReviewShellStore`), `side.panel.slice.ts` (`StateCreator<ReviewShellState, [], [], SliceType>`, type-only circular import for `ReviewShellState` is intended). `ReviewShell` is now a thin provider wrapper around `ReviewShellContent`. Clamp/persistence stayed in `useReviewSidePanel`; the hook clamps at read time and uses `storeApi.getState()` in callbacks.
- [ ] **Session B — target slice** (migration step 3). Includes `ReviewShellConfigContext` and deleting `targetRef`/`sizeRef`.
- [ ] **Session C — qa slice + selective rest** (migration steps 4–5). Largest diff: `ReviewQaPanel` container conversion, then selective settings/sourceTree/ruler moves.

Rules for whoever executes a session:

- Read this whole document first; the Direction decisions (Context-scoped store, getState() over mirror refs, config context, selector rules) are binding.
- Do not start a session until the previous one is committed and its checkbox above is ticked.
- Tick the checkbox and note the commit hash next to it when a session lands.
- If a session ends mid-work (context/token limit), commit nothing partial to the branch; leave a short "handoff state" note under the session bullet instead.

## Migration Order

### 1. Add store scaffold

- Add Zustand to `dependencies` (not peer — it is ~1KB and host apps should not manage it). Confirm build externals still treat only react/react-dom as external.
- Create `src/react-shell/store/` with per-slice files from the start (`target.slice.ts`, `qa.slice.ts`, ...) plus `create.review.shell.store.ts` and the provider/`useReviewShellStore(selector)` helper.
- Keep store modules reachable only from the `./react-shell` entry; nothing under the core entry may import them.
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

### 3. Move target/viewport shell state

Target moves before QA because the QA derived lists depend on `activeRoute`/`target`/`size`. With `target` in the store first, the QA container reads them through selectors instead of a transitional mix of store and shell props.

- Move target, draft target, source, viewport size, route, and overlay state into `target`.
- Delete `targetRef` and `sizeRef`; callbacks read `store.getState()` instead.
- Add the `ReviewShellConfigContext` for prop-derived config here if not done in step 1.
- Keep core controller write-through actions in existing controller/navigation hooks.
- Ensure URL sync remains one-way and predictable.

Validation:

- Page switch through sitemap.
- Manual path entry.
- Viewport preset change.
- Target reload.
- Overlay toggles.
- Initial item restore from URL.

### 4. Move QA panel state

- Move raw QA state and filters into the `qa` slice.
- Delete `selectedItemIdRef` and `hiddenOverlayItemIdListRef`; imperative readers use `store.getState()`.
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
- Selectors that build new arrays/objects per call cause re-render storms or `useSyncExternalStore` loop errors.
- Moving derived state into the store can create stale duplicated state.
- Letting leaf components mutate global state directly can make feature behavior hard to trace.
- A module-level global store would leak state across multiple `ReviewShell` mounts in host apps — mitigated by the Context-scoped store decision above.

## Done Criteria

- `ReviewShell` reads as a composition layer, not a state switchboard.
- Feature panels no longer receive 20+ mixed props from `ReviewShell`.
- State mirror refs (`targetRef`, `sizeRef`, `selectedItemIdRef`, `hiddenOverlayItemIdListRef`) are deleted, replaced by `store.getState()` reads.
- The store is Context-scoped; mounting two `ReviewShell` instances does not share state.
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
