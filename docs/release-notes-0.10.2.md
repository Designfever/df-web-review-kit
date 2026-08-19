# Release Notes: 0.10.2

0.10.2 connects the Review Shell more closely to df-sheet and makes status and
multi-owner assignment available when QA is created as well as after it is
saved.

## df-sheet session controls

- Hosts can place a df-sheet page selector directly in the QA panel header.
- Hosts can add a logout action to the side rail.
- The df-sheet session exposes project assignees and a logout URL that returns
  through the normal PKCE authorization flow.
- Authenticated Figma requests no longer forward a legacy browser Figma token.

## Status and multiple owners

- Existing QA cards can select, clear, and apply multiple owners without
  resetting earlier checkbox selections.
- New DOM QA and Area QA forms expose the configured workflow statuses and the
  same multi-owner picker.
- New items persist the selected status and all owner IDs and names while
  retaining the first owner in the legacy single-owner fields.

## Verification

- Full Vitest suite
- TypeScript typecheck
- Knip dead-code check
- Library and CLI build
- Packed install E2E
- Browser verification in the iKAOS review route
