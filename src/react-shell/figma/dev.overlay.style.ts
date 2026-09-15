export const figmaDevOverlayStyle = `
  :host {
    all: initial;
    color-scheme: dark;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    --df-review-figma-dev-bg: rgba(15, 18, 24, 0.94);
    --df-review-figma-dev-panel: rgba(19, 24, 33, 0.96);
    --df-review-figma-dev-control: #202938;
    --df-review-figma-dev-control-hover: #273345;
    --df-review-figma-dev-border: rgba(226, 233, 245, 0.16);
    --df-review-figma-dev-border-soft: rgba(226, 233, 245, 0.09);
    --df-review-figma-dev-text: #edf3fb;
    --df-review-figma-dev-muted: rgba(237, 243, 251, 0.58);
    --df-review-figma-dev-subtle: rgba(237, 243, 251, 0.42);
    --df-review-figma-dev-accent: #7cc7ff;
    --df-review-figma-dev-accent-soft: rgba(124, 199, 255, 0.16);
  }

  * {
    box-sizing: border-box;
  }

  .df-review-figma-dev-widget {
    position: fixed;
    right: calc(16px + env(safe-area-inset-right));
    bottom: calc(16px + env(safe-area-inset-bottom));
    z-index: 2147483200;
    display: grid;
    justify-items: end;
    gap: 8px;
    color: var(--df-review-figma-dev-text);
    font-size: 13px;
    line-height: 1.25;
    pointer-events: none;
  }

  .df-review-figma-dev-panel,
  .df-review-figma-dev-bar {
    pointer-events: auto;
  }

  .df-review-figma-dev-panel {
    display: grid;
    gap: 8px;
    width: min(360px, calc(100vw - 32px - env(safe-area-inset-left) - env(safe-area-inset-right)));
    max-height: min(460px, calc(100vh - 96px - env(safe-area-inset-top) - env(safe-area-inset-bottom)));
    overflow: hidden;
    border: 1px solid var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 10px;
    background: var(--df-review-figma-dev-panel);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .df-review-figma-dev-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  }

  .df-review-figma-dev-panel-header strong {
    font-size: 14px;
    font-weight: 700;
  }

  .df-review-figma-dev-panel-header span,
  .df-review-figma-dev-status,
  .df-review-figma-dev-empty {
    color: var(--df-review-figma-dev-muted);
    font-size: 12px;
  }

  .df-review-figma-dev-selected-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 84px;
    gap: 8px;
  }

  .df-review-figma-dev-opacity-control,
  .df-review-figma-dev-y-control {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    height: 36px;
    border: 1px solid var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 0 10px;
    background: var(--df-review-figma-dev-control);
  }

  .df-review-figma-dev-opacity-control span {
    color: var(--df-review-figma-dev-muted);
    font-size: 12px;
  }

  .df-review-figma-dev-opacity-control strong {
    min-width: 24px;
    text-align: right;
    font-size: 13px;
  }

  .df-review-figma-dev-opacity-control input[type="range"] {
    flex: 1;
    min-width: 0;
    height: 24px;
    accent-color: var(--df-review-figma-dev-accent);
  }

  .df-review-figma-dev-y-control svg {
    width: 15px;
    height: 15px;
    color: var(--df-review-figma-dev-muted);
  }

  .df-review-figma-dev-y-control input {
    width: 100%;
    min-width: 0;
    border: 0;
    padding: 0;
    color: var(--df-review-figma-dev-text);
    background: transparent;
    font: inherit;
    outline: none;
  }

  .df-review-figma-dev-status,
  .df-review-figma-dev-empty {
    margin: 0;
    border: 1px dashed var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 12px;
  }

  .df-review-figma-dev-list {
    display: grid;
    gap: 6px;
    min-height: 0;
    overflow: auto;
  }

  .df-review-figma-dev-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
    border: 1px solid var(--df-review-figma-dev-border-soft);
    border-radius: 8px;
    padding: 12px 10px;
    color: var(--df-review-figma-dev-text);
    background: rgba(237, 243, 251, 0.035);
    font: inherit;
    text-align: left;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
  }

  .df-review-figma-dev-row:hover,
  .df-review-figma-dev-row:focus-visible {
    border-color: var(--df-review-figma-dev-border);
    outline: none;
  }

  .df-review-figma-dev-row.is-active {
    border-color: var(--df-review-figma-dev-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-figma-dev-accent-soft);
  }

  .df-review-figma-dev-row-main {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .df-review-figma-dev-row-main strong {
    color: var(--df-review-figma-dev-text);
    font-size: 13px;
    font-weight: 700;
    white-space: normal;
    word-break: break-word;
  }

  .df-review-figma-dev-row-main small {
    color: var(--df-review-figma-dev-muted);
    font-size: 12px;
  }

  .df-review-figma-image-layer-state {
    display: grid;
    grid-template-columns: repeat(3, 22px);
    align-items: center;
    gap: 2px;
    min-width: 0;
    height: 24px;
  }

  .df-review-figma-image-state-button {
    display: inline-grid;
    place-items: center;
    width: 22px;
    min-width: 22px;
    height: 22px;
    min-height: 22px;
    border: 0;
    border-radius: 0;
    padding: 0;
    color: var(--df-review-figma-dev-subtle);
    background: transparent;
    box-shadow: none;
    opacity: 0.68;
    cursor: pointer;
  }

  .df-review-figma-image-state-button:hover,
  .df-review-figma-image-state-button:focus-visible {
    color: var(--df-review-figma-dev-text);
    opacity: 1;
    outline: none;
  }

  .df-review-figma-image-state-button.is-active {
    color: var(--df-review-figma-dev-accent);
    opacity: 1;
  }

  .df-review-figma-image-state-button svg {
    width: 13px;
    height: 13px;
  }

  .df-review-figma-dev-bar {
    display: inline-flex;
    align-items: center;
    pointer-events: auto;
  }

  .df-review-figma-dev-button {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 0;
    color: var(--df-review-figma-dev-muted);
    background: var(--df-review-figma-dev-control);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
    cursor: pointer;
  }

  .df-review-figma-dev-button:hover,
  .df-review-figma-dev-button:focus-visible,
  .df-review-figma-dev-widget.is-active .df-review-figma-dev-button.is-figma {
    color: var(--df-review-figma-dev-accent);
    border-color: rgba(124, 199, 255, 0.5);
    outline: none;
  }

  .df-review-figma-dev-button:disabled {
    color: var(--df-review-figma-dev-subtle);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .df-review-figma-dev-button svg {
    width: 17px;
    height: 17px;
  }

  .df-review-figma-dev-button .df-review-figma-mark-icon {
    width: 17px;
    height: 17px;
    fill: currentColor;
  }

  .df-review-figma-dev-button.is-figma {
    width: 38px;
    height: 38px;
  }

  .df-review-figma-dev-button-count {
    position: absolute;
    right: -3px;
    top: -4px;
    display: inline-grid;
    place-items: center;
    min-width: 15px;
    height: 15px;
    border: 1px solid rgba(15, 18, 24, 0.86);
    border-radius: 4px;
    padding: 0 3px;
    color: currentColor;
    background: rgba(15, 18, 24, 0.92);
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
  }

  .df-review-figma-dev-button.is-figma:disabled .df-review-figma-dev-button-count {
    color: var(--df-review-figma-dev-subtle);
  }

  @media (max-width: 420px) {
    .df-review-figma-dev-widget {
      right: calc(10px + env(safe-area-inset-right));
      bottom: calc(10px + env(safe-area-inset-bottom));
    }

    .df-review-figma-dev-selected-controls {
      grid-template-columns: 1fr;
    }
  }
`;
