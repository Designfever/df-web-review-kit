# Custom right-rail panels — release notes draft

**Included in v0.12.0.** See [Release notes 0.12.0](release-notes-0.12.0.md)
for the complete release. This feature is not available in v0.11.1.

## Added

- Opt-in `customPanels` support on ReviewShell and mountReviewShell.
- Public `connectReviewCustomPanel` API and metadata, snapshot, connection types.
- Custom rail buttons and stable panel containers for target-owned React portals.
- Duplicate-ID protection, explicit readiness, visibility and disposal behavior.
- Per-document cleanup/reconnection for target reloads and navigation.
- A text/color editor demo shared by normal `/components/` and `/review/`.

## Compatibility and limits

Existing built-in tools and stored preferences remain supported; custom panels
are disabled by default. No new runtime dependency or HMG-specific code is added.
Only the active direct same-origin iframe is supported. Host editor styles must
be loaded into both documents. Reconnection does not persist unsaved target data.

See [Custom panels](custom-panels.md) for integration and lifecycle details.
Cross-origin messaging and automatic state persistence are not part of this feature.
