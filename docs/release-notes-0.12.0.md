# Release Notes: 0.12.0

Adds custom right-rail panels, automatic issue captures, and opt-in df-sheet
page selection, with a shared image preview and fixes for assignee menus and
issue composer layout.

## Added

- Opt-in df-sheet page selection through `selectPage: true`, returning
  `session.selectedPageId`. Requires the corresponding df-sheet server update.
- Opt-in `customPanels` on `ReviewShell` and `mountReviewShell`, plus the public
  `connectReviewCustomPanel` API for target-owned React portals.
- Stable custom panel containers, duplicate-ID protection, readiness and
  visibility notifications, and cleanup/reconnection after target navigation.
- Automatic capture when saving an issue without an existing capture, when the
  host supports capture and attachment uploads. Capture failure does not block
  issue creation.
- Camera buttons inside outside-point labels and selected-area titles open the
  same image preview modal as task attachments.
- Optional `initiallyVisible` for the Figma dev overlay, for opening the widget
  immediately after a host's login flow.

## Improved

- Captures use 1x CSS-pixel resolution to avoid oversized Retina images.
- Task images use square thumbnails with `object-fit: contain`. Clicking the
  image in the preview modal opens the original in a new window.
- Multi-owner menus close when clicking outside, including inside the target
  iframe. New-issue menus match task-panel styling.
- DOM and area composers have matching heights, and panel overflow no longer
  creates unwanted horizontal scrolling.
- Dev fixtures include multiple owners and a shared custom text/color editor.

## Compatibility

Existing built-in panels remain supported. Custom panels are disabled by default
and support the active direct same-origin iframe. Hosts must load editor styles
in both documents; unsaved target data is not persisted across reconnection.
No new runtime dependency is added.

Shared df-sheet page selection is disabled by default. Deploy df-sheet's
`/review/select-page` page and updated SSO authorize route before enabling
`selectPage: true` in a host. Without that server update, login returns without
a selected page and the connection fails. Existing host-owned selectors and
Figma-only login continue to work with the option omitted. See
[df-sheet integration](df-sheet.md#shared-page-selection-0120).

Update the package and restart the host dev server. See [Custom panels](custom-panels.md)
for integration and lifecycle details.

## Verification

- 315 tests across 60 Vitest files passed.
- Package/dev typechecks and Knip passed.
- Library/CLI and dev builds passed, with the existing chunk-size warning.
- Packed-install E2E passed for Vite React, Next.js detection, and migration guards.
- Lexus dogfooding verified issue composer layout, assignee dismissal, and Figma
  session integration. The host's Figma data migration is separate from this package.
- The current 0.12.0 package was installed in Lexus and matched the local build.
  Host typechecking, iframe rendering, QA page switching, and the Figma preview
  modal passed with the existing host-owned page selector.
- Shared page selection was tested against the current df-sheet server and
  stopped at the missing selected-page response. End-to-end verification of
  that opt-in flow remains pending the df-sheet server deployment.
