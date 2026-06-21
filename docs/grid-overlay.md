# Grid Overlay

The grid overlay button in the review shell toggles a host-page layout/helper overlay. It is for visual alignment while reviewing pages.

## User Flow

- Open `/review`.
- Click the grid button or press `g`.
- The target page toggles its own grid/helper layer.

## Host Requirements

The target page inside the iframe must already support the grid helper.

Expected behavior:

- The target page reacts to a `KeyboardEvent` with `code: 'KeyG'`.
- The target page toggles a visible grid/helper layer.
- The active state is reflected by one of these:
  - `document.body.classList.contains('is-help')`
  - `.helper.onShow`

The review shell uses those signals to keep the toolbar button state in sync.

## Notes

- The package does not prescribe the grid design.
- The grid overlay is not persisted as QA data.
- Use project-specific CSS/helper code in the host page when the grid differs by brand or design system.

## Troubleshooting

If the icon state does not change:

- Confirm the target page helper is mounted.
- Confirm it listens for `KeyG`.
- Confirm it sets `body.is-help` or `.helper.onShow`.
- Confirm the iframe is same-origin and keyboard events are not blocked.
