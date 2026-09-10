# Custom right-rail panel API contract

Status: implemented locally in step 2; **unreleased and not available in published v0.11.1**.
See [implementation evidence](custom-panel-implementation.md). Browser/demo acceptance remains pending.
Scope: reusable Review Kit extension, with a same-origin target-owned portal demo.
This design lives outside published `docs/` until implementation is verified.

## 1. Ownership and boundary

- Review Kit owns the rail button, accessible panel wrapper, container lifetime,
  visibility, and registration discovery. The target owns its React tree,
  editor, props, selected case, save behavior, and persistence.
- Do not create a second React root for the editor. `createPortal` changes its
  DOM destination, not its React owner or context.
- No HMG/ComponentLab imports, state schema, or editor CSS in the package.
- Only the shell's current direct, same-origin preview iframe may register.
  Cross-origin, nested-frame discovery, arbitrary parent-page registration,
  iframe messaging, custom shortcuts, and resizable panels are out of scope.
- On a normal page, the host application provides its own right-side container.
  This API does not create a standalone editor or a second shell there.

## 2. Proposed public surface

Exports below are proposed additions to `@designfever/web-review-kit/react-shell`.
Existing exports and `mountReviewShell`'s cleanup return value remain unchanged.
Add `customPanels?: boolean` to `ReviewShellProps`/mount options, default `false`.
The review host explicitly enables the capability with `customPanels: true`.

```ts
export interface ReviewCustomPanelDefinition {
  id: string;
  label: string;
  // Optional SVG path data, not HTML, a component, or an external asset URL.
  // Shell renders stroke=currentColor, fill=none, strokeWidth=2.
  icon?: { viewBox: string; paths: readonly string[] };
}

export type ReviewCustomPanelSnapshot =
  | { status: 'waiting'; container: null; visible: false }
  | { status: 'ready'; container: HTMLElement; visible: boolean }
  | { status: 'unavailable'; container: null; visible: false;
      reason: 'not-target' | 'cross-origin' | 'disabled' | 'incompatible' }
  | { status: 'error'; container: null; visible: false;
      reason: 'invalid-definition' | 'duplicate-id' }
  | { status: 'disposed'; container: null; visible: false };

export interface ReviewCustomPanelConnection {
  getSnapshot(): ReviewCustomPanelSnapshot;
  subscribe(listener: () => void): () => void;
  open(): void;
  close(): void;
  dispose(): void;
}

export function connectReviewCustomPanel(
  definition: ReviewCustomPanelDefinition,
  options?: { targetWindow?: Window }, // defaults to caller's window
): ReviewCustomPanelConnection;
```

Contract details:

- Call from a browser effect, not module initialization, SSR, or render.
- `connect` starts discovery and registration, returns immediately, and does not
  implicitly open the panel. Unavailability is data, not an uncaught exception.
- IDs match `[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+` (e.g. `demo.controls`). Labels must
  be nonblank plain text. Definition is immutable for a connection; dispose and
  reconnect to change it. Invalid icon/definition produces `invalid-definition`.
- Internal selection uses a distinct `custom:<id>` namespace; built-in IDs
  cannot be replaced. IDs are unique within one live shell registry.
- Duplicate registration returns `duplicate-id` without replacing the original
  button/container. No auto-retry: fix ownership, dispose, and reconnect.
- Each registration has an opaque ownership token. Cleanup from an old handle
  must never remove a newer registration using the same ID.
- Rail order is registration order after built-in tools, before bottom actions.
  Missing icon gets a neutral package-owned panel icon. Render path data as SVG
  attributes, never `innerHTML`; icon is decorative, label names the button.
- Snapshots are immutable and reference-stable until something changes.
  `subscribe` does not emit immediately: subscribe then read `getSnapshot()` to
  avoid a missed initial update. Notifications describe all state transitions.
- `open`/`close` only act when ready. Calls while waiting/terminal are no-ops,
  not queued commands. `close` only closes this panel if it is active.
- `dispose` is idempotent, terminal, removes registration and discovery listeners,
  and emits one disposed snapshot before clearing subscribers. Unsubscribe is
  independently idempotent. React StrictMode setup/cleanup/setup is supported.

## 3. Readiness and supported discovery

A container is ready only after its connected wrapper exists in the shell
Document and the caller is authenticated as the current preview Document.
Hidden registered panels also have connected containers: ready does not mean open.
No DOM ID, query selector, or undocumented Window property is consumer API.

Implementation protocol (private, versioned):

1. Shell owns a registry per instance, never a module-global registry. Attach its
   endpoint to the current iframe element, through package-private storage and a
   versioned readiness event dispatched on that same element.
2. Target helper subscribes to readiness before reading the endpoint through
   `targetWindow.frameElement`. This works with separate parent/iframe bundles:
   a shared JavaScript module singleton is not required.
3. Endpoint verifies iframe identity, `contentWindow`, **current Document identity**,
   same origin, and protocol version on every connect. A WindowProxy alone is
   insufficient because it survives navigation. Keep old document tokens invalid.
4. Framed target before endpoint readiness is `waiting`. Top-level/non-target,
   inaccessible origin, disabled shell, and incompatible protocol return explicit
   unavailable reasons. A generic iframe without an endpoint can remain waiting
   until disposed; do not guess it is a Review Kit frame or use an arbitrary timeout.
5. Publish capability state even when disabled, so a real target can distinguish
   disabled from not-yet-ready. Recheck identity at load and before registration.
6. On shell teardown revoke endpoint, registrations, listeners, and DOM references.
   A still-live target connection returns to waiting and may reconnect if a host
   reappears. Error/unavailable/disposed connections are terminal; reconnect
   explicitly if their conditions change.

This is a same-origin integration contract, not a security boundary against other
scripts already running on that origin. No credentials or project data cross it.

## 4. Visibility, switching, and removal

- A single active side-panel selection covers built-ins and custom panels.
  Opening custom hides the previous panel; built-in buttons, shortcuts, QA mode
  actions, and deep-link handling use the same switching path.
- Clicking the active custom button toggles it closed. Closing all panels retains
  the current selection but collapses the shared panel column.
- Hiding is **not unmounting**: retain the same container node and portal subtree.
  Hide inactive wrappers with `hidden`/`display:none` and remove them from focus
  navigation. Consumers may pause expensive work using `visible`.
- When hiding/removing the focused panel, return focus to its rail button if that
  button survives, otherwise a stable built-in rail button. Use `aria-controls`,
  `aria-pressed`, and a labelled panel region; preserve built-in shortcuts 1–4.
- Disposing active custom selection falls back to QA selected but closed; removing
  an inactive panel does not change the active built-in or another custom panel.
- Preserve existing built-in storage/URL semantics. Custom IDs and editor data
  are not persisted. When custom is active, skip writes to built-in selection and
  visibility storage, preserving the last built-in preference. Never normalize a
  custom ID to QA as a side effect on each render.
- Use existing panel-column sizing. Do not change iframe viewport dimensions to
  fit the available stage width; scrolling/scaling remains shell behavior.

## 5. Navigation, reload, and cleanup

Registration ownership is `(shell instance, iframe element, target Document,
registration token)`, not URL alone.

- SPA navigation with the same Document retains registration until the owning
  target component disposes. A route-specific editor must clean up on unmount.
- Before shell-controlled iframe replacement/reload, revoke the old document's
  registrations. Also listen for target `pagehide` and reconcile Document identity
  on iframe `load` for user-initiated navigation/reload. Do not rely only on React
  effect cleanup: unloading a document need not run it.
- Revocation notifies live subscribers with no container before removing the
  wrapper and dropping references. The consumer removes its portal on that
  snapshot. Detached DOM must be removed even if an unloading target cannot run
  React cleanup; no guarantee of effect cleanup during browser document destruction.
- Keyed iframe removal must clean up even without a subsequent load. Cross-origin
  navigation is caught and revoked without breaking built-in tools. Back/forward
  restoration (`pageshow`) rediscoveries must not leave duplicate registrations.
- A fresh target document executes its own setup and registers again. A stale
  document cannot re-register. The new container may have a different identity.
- Reload reconnection is **not value persistence**. Unsaved target React state
  resets on full reload. Saving/reloading values is exclusively host-owned.
- Portal DOM replacement may remount the editor subtree. Keep durable editing
  state above the portal in the target tree, not in the shell/container or solely
  inside the portal subtree. Switching visibility alone must not replace it.

## 6. Proposed React usage (not runnable against v0.11.1)

Review route: pass `customPanels: true` alongside existing pages/adapters options
in `mountReviewShell`, or `<ReviewShell customPanels {...existingProps} />`.
The target page supplies its editor styles in the **parent document** as well as
its own: iframe CSS does not follow a portal. Shell only styles its wrapper.

```tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  connectReviewCustomPanel,
  type ReviewCustomPanelSnapshot,
} from '@designfever/web-review-kit/react-shell';

export function Demo() {
  const [text, setText] = useState('Preview'); // owned by target, above portal
  const [color, setColor] = useState('#3366ff');
  const [panel, setPanel] = useState<ReviewCustomPanelSnapshot | null>(null);

  useEffect(() => {
    const connection = connectReviewCustomPanel({
      id: 'demo.controls', label: 'Demo controls',
    });
    const sync = () => setPanel(connection.getSnapshot());
    const unsubscribe = connection.subscribe(sync);
    sync();
    return () => { unsubscribe(); connection.dispose(); };
  }, []);

  const editor = (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <label>Text <input value={text}
        onChange={(event) => setText(event.target.value)} /></label>
      <label>Color <input type="color" value={color}
        onChange={(event) => setColor(event.target.value)} /></label>
    </div>
  );
  return <>
    <h1 style={{ color }}>{text}</h1>
    {panel?.status === 'ready' && createPortal(editor, panel.container)}
    {/* Normal-page host may render editor in its own right-side container.
        Do not mount a second editor while waiting inside a Review Kit iframe. */}
  </>;
}
```

The demo intentionally has no persistence and no automatic opening. Click its
rail button after readiness. A real application distinguishes unavailable/error
states in its own UI; do not silently treat every failure as a standalone page.

## 7. Implementation map verified against current source

Baseline inspected: `358971d` / v0.11.1; working tree initially clean.
No repository/ancestor AGENTS.md was found in the checked user/repo paths.
These are implementation locations, not claims that the API already exists.

| Existing source | Current behavior and required extension |
| --- | --- |
| `src/react-shell.tsx`, `src/react-shell/types.ts` | Public shell entry and options; export proposed connection/types and opt-in flag without changing mount cleanup. |
| `src/react-shell/review/shell.tsx`, `store/shell.config.tsx` | Store and refs are per instance; add per-shell registry, opt-in dependencies, and lifecycle owner. |
| `src/react-shell/review/shell.frame.tsx` | Internal built-in ReactNode slots only; add stable registered container wrappers, not public DOM selectors. |
| `src/react-shell/review/side.rail.tsx`, `side.rail.container.tsx` | Four hard-coded tools; render custom entries and unified selection visibility. |
| `src/react-shell/store/side.panel.slice.ts`, `hooks/use.review.side.panel.ts`, `settings.ts` | Selection is a built-in union with storage normalization; separate runtime custom selection from stored built-in values. |
| `src/react-shell/hooks/use.review.shell.runtime.actions.ts` | QA modes open QA; reload calls location.reload; load reinitializes tools. Add pre-reload revocation without losing existing actions. |
| `src/react-shell/target/frame.tsx` | iframe key uses source + navigation version; onLoad initializes tools; width/height follow viewport size. Bind endpoint to the actual element and clean up keyed replacements. |
| `src/react-shell/hooks/use.review.shell.runtime.ts` | Wires load actions; coordinate registry invalidation with existing runtime lifecycle. |
| `src/react-shell/style/base.ts`, `style/qa-panel.ts` | Existing grid panel column and visibility rules; reuse sizing, add custom wrappers/focus handling. |
| `dev/src/main.tsx`, `dev/src/fixtures/components/components.fixture.tsx` | Existing review mount and component fixture; opt in and add target-owned demo in later step. |
| `dev/vite.config.ts` | Shared origin at 127.0.0.1:5177, source imports; no package release needed for demo. |

Suggested new module boundary: `src/react-shell/custom-panels/` for protocol,
registry, target connection, and panel container. Registry must not own editor data.

## 8. Acceptance checklist for implementation/demo steps

All items below are **pending**; source inspection is not browser validation.

- [ ] Public exports/types build; existing mount cleanup and disabled default work.
- [ ] Both target-first and shell-first mount produce one ready connected container;
      separate parent/iframe bundles work without shared module singletons.
- [ ] Two panels register in order; duplicate/invalid IDs fail without replacement;
      stale cleanup cannot remove a newer owner. StrictMode/HMR do not leak buttons.
- [ ] Text/color updates in the portal update the target immediately with one state
      owner. Input typing, selection, focus, and target React context work.
- [ ] Switch to each built-in and back; close/reopen; input value and node identity
      remain stable. Hidden controls are not focusable. Active-removal focus works.
- [ ] Built-in Shift+1–4 and QA write-mode switching still work; custom IDs never
      overwrite built-in persisted preferences. QA deep links retain precedence.
- [ ] Shell reload action, iframe self-reload, changed URL/key, SPA route unmount,
      back/forward restoration, shell teardown/remount cleanly remove old owners.
      Fresh target reconnects once; unsaved text resets on full document reload.
- [ ] Top-level/disabled/incompatible/cross-origin cases report defined states;
      cross-origin navigation does not crash the shell or leak previous controls.
- [ ] Parent-loaded editor CSS, fonts, focus styles, nested popup placement and
      scroll behavior work; React context inheritance does not imply CSS inheritance.
- [ ] At mobile/tablet/desktop presets, opening a panel does not change iframe
      innerWidth or configured dimensions. Narrow-shell overflow remains usable.
- [ ] After repeated navigation, old containers and registered listeners are gone;
      verify registry counts plus detached-document retention in browser tooling.

Suggested next-step checks: focused registry/lifecycle unit tests, existing rail,
settings and hotkey tests; `pnpm typecheck`, `pnpm typecheck:dev`, `pnpm build:dev`,
and browser checks at `/review/` with `/components/`. Capture observable results,
not just successful compilation. This design step makes no runtime changes.

## 9. Design-step verification

- Re-read current public exports, shell ownership, rail selection/storage, keyed
  iframe load/reload paths, panel grid sizing, and dev source imports at baseline.
- Existing baseline regression command:
  `pnpm exec vitest run src/react-shell/review/side.rail.test.tsx src/react-shell/settings.test.ts src/react-shell/hooks/use.review.shell.hotkeys.test.tsx`
  — 3 files, 13 tests passed. These do not test the proposed feature.
- Both fenced TypeScript/TSX blocks passed TypeScript syntax transpilation;
  13 explicitly referenced full source file paths were checked to exist.
  This is not API implementation type-checking or portal browser validation.
- Change scope: this design document only. No runtime code, dependency, release,
  HMG integration, or published documentation changes.
