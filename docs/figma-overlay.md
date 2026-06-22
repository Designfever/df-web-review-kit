# Figma Overlay

The Figma overlay button in the review shell toggles a host-page helper. The package does not fetch Figma data by itself and does not own a server-side Figma token.

## User Flow

- Open `/review`.
- Click the settings button.
- Enter a Figma token if the host helper requires one.
- Click the Figma overlay button or press `f`.

The token is stored in browser localStorage with this key:

```txt
figma-token
```

Treat this as a dev/debug convenience. Do not use it for private server tokens.

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

## Troubleshooting

If the button does nothing:

- Confirm the iframe target page is same-origin and can receive dispatched keyboard events.
- Confirm the host helper listens for `KeyF`.
- Confirm the helper renders `.helper-figma-root` or `.helper-figma-loading-backdrop`.
- Confirm the current viewport preset is `mobile` or `wide`.

If the overlay needs a private Figma integration, move that work to a backend/admin service and expose only browser-safe state to the host page.
