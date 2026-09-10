# Release Notes: 0.11.1

Fixes the grid toolbar button remaining active after the host grid is turned off.

- When a host `.helper` is mounted, the toolbar follows its current DOM state
  instead of stale cookie, localStorage, or sessionStorage flags.
- Recognizes `html.is-help` as well as `body.is-help` and `.helper.onShow`.
- Keeps the stored-state fallback for hosts without a recognized helper.

No host API changes are required. Update the package and restart the host dev server.

## Verification

- 280 tests across 57 Vitest files passed, including stale-storage grid regressions.
- Package/dev typechecks, Knip, library/CLI builds, and dev build passed.
- Packed-install E2E passed.
- Dev and packed-host builds retain the non-blocking chunk-size warning.
- The original stuck-button behavior was reproduced in the HMG host; the patch
  has not yet been installed and rechecked in that host.
