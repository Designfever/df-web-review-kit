# Figma Overlay

The Figma overlay button in the review shell toggles a host-page helper. The
Figma image manager can also call the review-kit image store when the host wires
one.

## User Flow

- Open `/review`.
- Click the settings button.
- Enter a Figma token if the host helper or image store fallback requires one.
- Click the Figma overlay button or press `f`.

The token is stored in browser localStorage with this key:

```txt
figma-token
```

For Figma image add/render requests, the server/dev process uses `FIGMA_TOKEN`
first. If that env token is missing, the browser sends this Settings token to
the same-origin image store request as a fallback.

Treat this as a review/debug convenience. Do not expose `VITE_FIGMA_TOKEN`.

## Availability

The shell currently enables the Figma overlay on viewport presets whose `kind` is:

- `mobile`
- `wide`

Other viewport kinds show the unavailable message.

## Host Requirements

The target page inside the iframe must already support the Figma helper.

Expected behavior:

- The target page reacts to a `KeyboardEvent` with `code: 'KeyF'`.
- The target page mounts a visible Figma helper layer.
- The helper root uses one of these selectors:
  - `.helper-figma-root`
  - `.helper-figma-loading-backdrop`

The review shell uses those selectors only to detect whether the overlay is active.

When the package-managed Figma image store is configured, the shell renders image
overlays into the iframe instead. Those overlays use:

- `#df-review-figma-image-target-root`
- `.df-review-figma-image-target-overlay`

The image overlay hit layer is interactive only when the image can be dragged.
During element review mode or `Option` source selection, the shell temporarily
locks both host helper layers and package image overlays with
`pointer-events: none` so target selection is not blocked. Releasing `Option`
restores the image overlay hit area.

## Troubleshooting

If the button does nothing:

- Confirm the iframe target page is same-origin and can receive dispatched keyboard events.
- Confirm the host helper listens for `KeyF`.
- Confirm the helper renders `.helper-figma-root` or `.helper-figma-loading-backdrop`.
- Confirm the current viewport preset is `mobile` or `wide`.
- If `Option` source selection cannot pick an element under a Figma image
  overlay, confirm the overlay root uses the package selectors above or the host
  helper selectors listed in Host Requirements.

If the overlay needs a private shared Figma integration, move that work to a
backend/admin service and expose only browser-safe state to the host page.
