# Custom right-rail panels

**Unreleased:** this API is present in repository source, not in published v0.11.1.

Custom panels let a host project place its own editor inside Review Kit. The
package owns the rail button and container; the target application owns the
editor, React state, context, cases, saving, and persistence. No project-specific
editor dependency is added to Review Kit.

## Integration

1. On the host-owned `/review` route, pass `customPanels: true` to
   `mountReviewShell` or `<ReviewShell>`. Default is false. Keep the existing
   mount cleanup callback and invoke it when that route is destroyed.
2. In a target browser effect, call `connectReviewCustomPanel({ id, label })`.
   Subscribe, then read `getSnapshot()` so initial readiness cannot be missed.
3. While `status === 'ready'`, render `createPortal(editor, snapshot.container)`
   from the **target's existing React tree**, even when `visible` is false.
4. On effect cleanup, unsubscribe and dispose. Do not create another React root,
   query a container DOM ID, or reach into Review Kit's internal registry.
5. For an ordinary top-level URL, provide a local right-side container and render
   the same editor there. Do not treat waiting or any registration error as a
   reason to mount a duplicate local editor inside the iframe.

See the complete [browser-only integration example](examples/custom-panel.tsx).
It includes local-only review mounting and an editor shared by both routes. The
host must create `/review` and `/example` routes; the package does not create them.
For a styled working example, run `pnpm dev:review` and open `/components/` or
`/review/?target=/components/&w=768&h=1024`. Click **Preview editor** in the rail.

## Public contract

Import the function and types from `@designfever/web-review-kit/react-shell`.

```ts
const connection = connectReviewCustomPanel({
  id: 'project.editor',
  label: 'Editor',
  icon: { viewBox: '0 0 24 24', paths: ['M4 7h16M4 17h16M8 4v6M16 14v6'] },
});
const unsubscribe = connection.subscribe(() => {
  const snapshot = connection.getSnapshot();
  // Update the target's rendering destination, not its editor data.
});
const initial = connection.getSnapshot();
// connection.open(); connection.close();
// cleanup: unsubscribe(); connection.dispose();
```

- `ReviewCustomPanelDefinition`: immutable registration metadata. ID must match
  `[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+`; label is nonblank plain text. Optional icon is
  SVG viewBox/path data, not HTML, a React component, or an external image URL.
  Default icon is a neutral panel symbol. Dispose/reconnect to change metadata.
- `ReviewCustomPanelConnection`: `getSnapshot`, `subscribe`, `open`, `close`,
  `dispose`. Opening is explicit, not a side effect of registration. Open/close
  before readiness are no-ops. Close does not hide some other active panel.
- `ReviewCustomPanelSnapshot`: frozen, reference-stable until a change. The
  ready snapshot contains a connected `HTMLElement` and a `visible` boolean.
  All other states have `container: null` and `visible: false`.
- Duplicate IDs within a shell return an error and leave the first owner intact.
  Separate shell instances have independent registries. Disposal is idempotent,
  removes its rail entry, and cannot remove a newer registration with the same ID.
- Subscribe does not immediately invoke its listener. Unsubscribe independently;
  dispose emits its final snapshot and then clears subscribers. Listener errors
  are reported without interrupting other listeners or shell cleanup.

| Status | Meaning |
| --- | --- |
| `waiting` | Host/container not ready, or a surviving connection is waiting for a remounted host. No arbitrary readiness timeout. |
| `ready` | Container is connected, including when the panel is hidden. |
| `unavailable` | `not-target`, `cross-origin`, `disabled`, or `incompatible`. Terminal; explicitly reconnect if conditions change. |
| `error` | `invalid-definition` or `duplicate-id`. Terminal; fix ownership/metadata before reconnecting. |
| `disposed` | Final state; open/close have no effect. |

The optional second argument `{ targetWindow }` selects the caller window and
is mainly useful for adapters/tests; it defaults to the current browser window.
Calling without a browser produces unavailable/not-target, but normal integration
belongs in effects, not SSR or render. A generic framed page without a Review Kit
endpoint can remain waiting until disposed; frame presence is not authorization.

## Same-origin and document boundaries

Only the active, direct, **same-origin** target iframe may register. Different
origins (including different ports), nested-frame discovery, and a messaging
bridge are not supported. The shell verifies the iframe and current Document;
a stale WindowProxy is not sufficient. This does not create a security boundary
against other code already trusted on the same origin.

A React portal keeps target React context and state ownership, but **does not
copy CSS, fonts, document-level event handlers, or third-party popup behavior**.
Load the editor's scoped styles/font definitions in the review document as well
as the target. Use the container's `ownerDocument` for document-sensitive DOM work.
Test libraries that append menus to `document.body` or assume a global window.
Review Kit styles the wrapper, not the contents of an external editor.

## Visibility, state and cleanup

- Custom and built-in panels share one selected side panel. Built-in rail buttons,
  shortcuts, and QA-mode actions continue to select their tools. Custom IDs do not
  overwrite stored built-in preferences or add custom URL/deep-link state.
- Hidden containers remain mounted and non-focusable. Do not conditionally remove
  the portal based on `visible`; use it only to pause costly work if needed.
  Closing a focused panel returns focus to its rail button. Removing it falls
  back to a built-in button; active custom removal selects QA with the panel closed.
- Keep durable editor values above the portal subtree. A replacement container
  can remount portal-local components; hidden/visible switching alone does not.
- Target `pagehide`, shell-controlled reload, iframe replacement and Document
  changes revoke old registrations. A new document runs its effect and reconnects.
  SPA component unmount must also run disposal. A surviving document may reconnect
  after shell teardown/remount; an old document may not register into a new target.
- **Reconnection is not persistence.** Full target reload resets unsaved React
  state. Save/restore only through an explicit host-owned mechanism.
- The shell's configured iframe viewport dimensions remain unchanged when a panel
  opens. Narrow stage scrolling is distinct from target responsive breakpoints.

## Verification and release boundary

The local browser regression script and run instructions are in [Testing](testing.md).
Review the API/example in the intended host before release. Cross-browser, popup
library, and host styling behavior are integration responsibilities, not implied
by successful portal mounting. No npm publication is required for `dev:review`.
