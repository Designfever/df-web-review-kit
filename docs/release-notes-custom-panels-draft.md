# Custom right-rail panels — release notes draft

**Unreleased; version not assigned.** No package version bump or publication is
included. This feature is not available in published v0.11.1.

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
Release remains subject to user review; cross-origin messaging and automatic
state persistence are not part of this feature.
