export const reviewShellFigmaImagesStyle = `
  .df-review-figma-images-panel {
    grid-column: 2;
    grid-row: 1 / span 3;
    position: relative;
    z-index: 600;
    display: grid;
    grid-template-rows: auto auto auto auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-left: 1px solid var(--df-review-line-soft);
    background:
      linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
  }

  .df-review-shell:not(.is-list-visible) .df-review-figma-images-panel,
  .df-review-figma-images-panel[aria-hidden="true"] {
    visibility: hidden;
    border-left: 0;
    pointer-events: none;
  }

  .df-review-figma-images-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--df-review-space-2);
    min-height: 58px;
    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-card);
  }

  .df-review-figma-images-title {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .df-review-figma-images-title strong {
    overflow: hidden;
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-md);
    font-weight: 500;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-figma-images-title span {
    overflow: hidden;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-figma-image-form {
    display: grid;
    gap: var(--df-review-space-2);
    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
  }

  .df-review-figma-image-form input {
    width: 100%;
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    min-width: 0;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 10px;
    color: var(--df-review-text);
    background: var(--df-review-bg);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-sm);
  }

  .df-review-figma-image-form input:focus {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-target-summary {
    display: grid;
    gap: var(--df-review-space-1);
    padding: var(--df-review-space-2) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: color-mix(in srgb, var(--df-review-card) 68%, transparent);
  }

  .df-review-figma-image-target-summary div {
    display: grid;
    grid-template-columns: 16px 58px minmax(0, 1fr);
    align-items: center;
    gap: var(--df-review-space-1-5);
    min-width: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    line-height: 1.25;
  }

  .df-review-figma-image-target-summary svg {
    width: 14px;
    height: 14px;
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-target-summary span {
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-target-summary strong {
    min-width: 0;
    overflow: hidden;
    color: var(--df-review-text);
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-figma-image-url-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--df-review-control-height-md);
    gap: var(--df-review-space-1-5);
    min-width: 0;
  }

  .df-review-figma-image-url-row button,
  .df-review-figma-image-icon-button {
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-md);
    min-width: var(--df-review-control-height-md);
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    text-decoration: none;
  }

  .df-review-figma-image-url-row button:hover,
  .df-review-figma-image-icon-button:hover {
    border-color: var(--df-review-accent);
    color: var(--df-review-text);
    background: var(--df-review-control-hover);
  }

  .df-review-figma-image-url-row button:disabled,
  .df-review-figma-image-icon-button:disabled {
    cursor: default;
    opacity: 0.42;
  }

  .df-review-figma-image-url-row button svg,
  .df-review-figma-image-icon-button svg {
    width: 15px;
    height: 15px;
  }

  .df-review-figma-image-icon-button.is-danger:hover {
    border-color: rgba(255, 143, 97, 0.34);
    color: var(--df-review-danger);
    background: var(--df-review-danger-soft);
  }

  .df-review-figma-image-icon-button.is-active {
    border-color: var(--df-review-accent);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
  }

  .df-review-figma-image-icon-button.is-order-fallback {
    opacity: 0.58;
  }

  .df-review-figma-image-icon-button.is-order-fallback:hover {
    opacity: 1;
  }

  .df-review-figma-image-icon-button.is-order-fallback:disabled {
    opacity: 0.32;
  }

  .df-review-figma-image-overlay-controls {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: var(--df-review-space-2);
    padding: var(--df-review-space-2) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
  }

  .df-review-figma-image-overlay-controls button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 10px;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-sm);
  }

  .df-review-figma-image-overlay-controls button svg {
    width: 15px;
    height: 15px;
  }

  .df-review-figma-image-overlay-controls button.is-active {
    border-color: var(--df-review-accent);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
  }

  .df-review-figma-image-overlay-controls button:disabled {
    cursor: default;
    opacity: 0.42;
  }

  .df-review-figma-image-overlay-controls label {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    align-items: center;
    gap: var(--df-review-space-2);
    min-width: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-variant-numeric: tabular-nums;
  }

  .df-review-figma-image-overlay-controls input[type="range"] {
    width: 100%;
    min-width: 0;
    accent-color: var(--df-review-accent);
  }

  .df-review-figma-image-status {
    grid-row: 4;
    margin: 0;
    padding: var(--df-review-space-2) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .df-review-figma-image-status.is-error {
    color: var(--df-review-danger);
  }

  .df-review-figma-image-list {
    grid-row: 5;
    display: grid;
    align-content: start;
    gap: var(--df-review-space-2);
    min-height: 0;
    overflow: auto;
    padding: var(--df-review-space-2);
  }

  .df-review-figma-image-card {
    display: grid;
    grid-template-columns: var(--df-review-control-height-md) var(--df-review-control-height-md) 64px minmax(0, 1fr) auto;
    grid-template-areas:
      "drag eye preview main actions"
      "drag eye controls controls controls";
    align-items: center;
    gap: var(--df-review-space-2);
    min-width: 0;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-lg);
    padding: var(--df-review-space-2);
    background: var(--df-review-card);
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }

  .df-review-figma-image-card:hover {
    border-color: var(--df-review-line);
  }

  .df-review-figma-image-card.is-dragging {
    opacity: 0.58;
  }

  .df-review-figma-image-card.is-drop-target {
    border-color: var(--df-review-accent);
    box-shadow: 0 0 0 3px rgba(124, 199, 255, 0.14);
  }

  .df-review-figma-image-card.is-active {
    border-color: var(--df-review-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover), 0 0 0 3px rgba(124, 199, 255, 0.12);
  }

  .df-review-figma-image-card.is-editing {
    grid-template-columns: var(--df-review-control-height-md) var(--df-review-control-height-md) 64px minmax(0, 1fr);
    grid-template-areas: "drag eye preview main";
  }

  .df-review-figma-image-drag-handle {
    grid-area: drag;
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-md);
    min-width: var(--df-review-control-height-md);
    height: 100%;
    min-height: 72px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-subtle);
    background: transparent;
    cursor: grab;
  }

  .df-review-figma-image-drag-handle:hover,
  .df-review-figma-image-drag-handle:focus-visible {
    border-color: var(--df-review-line);
    color: var(--df-review-text);
    background: var(--df-review-control);
    outline: none;
  }

  .df-review-figma-image-drag-handle:active {
    cursor: grabbing;
  }

  .df-review-figma-image-drag-handle:disabled {
    cursor: default;
    opacity: 0.32;
  }

  .df-review-figma-image-drag-handle svg {
    width: 16px;
    height: 16px;
  }

  .df-review-figma-image-layer-toggle {
    grid-area: eye;
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-md);
    min-width: var(--df-review-control-height-md);
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
  }

  .df-review-figma-image-layer-toggle.is-visible {
    border-color: var(--df-review-accent);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
  }

  .df-review-figma-image-layer-toggle.is-hidden {
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-layer-toggle:hover {
    border-color: var(--df-review-accent);
    color: var(--df-review-text);
    background: var(--df-review-control-hover);
  }

  .df-review-figma-image-layer-toggle svg {
    width: 15px;
    height: 15px;
  }

  .df-review-figma-image-preview {
    grid-area: preview;
    display: block;
    width: 64px;
    height: 46px;
    overflow: hidden;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    background: var(--df-review-control);
  }

  .df-review-figma-image-preview img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .df-review-figma-image-card-main {
    grid-area: main;
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .df-review-figma-image-edit-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--df-review-control-height-md) var(--df-review-control-height-md);
    align-items: center;
    gap: var(--df-review-space-1);
    min-width: 0;
  }

  .df-review-figma-image-edit-form input {
    width: 100%;
    height: var(--df-review-control-height-md);
    min-width: 0;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 9px;
    color: var(--df-review-text);
    background: var(--df-review-bg);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-sm);
  }

  .df-review-figma-image-edit-form input:focus {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-card-main strong,
  .df-review-figma-image-card-main span,
  .df-review-figma-image-card-main small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-figma-image-card-main strong {
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-sm);
    font-weight: 500;
    line-height: 1.2;
  }

  .df-review-figma-image-card-main span {
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1.2;
  }

  .df-review-figma-image-card-main small {
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1.2;
  }

  .df-review-figma-image-card-actions {
    grid-area: actions;
    display: grid;
    grid-template-columns: repeat(3, var(--df-review-control-height-md));
    gap: var(--df-review-space-1);
  }

  .df-review-figma-image-layer-controls {
    grid-area: controls;
    display: grid;
    grid-template-columns: minmax(78px, 1fr) var(--df-review-control-height-md) var(--df-review-control-height-md) minmax(54px, 64px);
    align-items: center;
    gap: var(--df-review-space-1);
    min-width: 0;
  }

  .df-review-figma-image-opacity-control {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    align-items: center;
    gap: var(--df-review-space-1);
    min-width: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-2xs);
    font-variant-numeric: tabular-nums;
  }

  .df-review-figma-image-opacity-control input[type="range"] {
    width: 100%;
    min-width: 0;
    accent-color: var(--df-review-accent);
  }

  .df-review-figma-image-offset-control {
    display: grid;
    grid-template-columns: 16px minmax(0, 1fr);
    align-items: center;
    gap: 4px;
    min-width: 0;
    height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 5px;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
  }

  .df-review-figma-image-offset-control svg {
    width: 14px;
    height: 14px;
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-offset-control input {
    width: 100%;
    min-width: 0;
    border: 0;
    padding: 0;
    color: var(--df-review-text);
    background: transparent;
    font-size: var(--df-review-font-size-xs);
    font-variant-numeric: tabular-nums;
    outline: none;
  }

  .df-review-figma-image-offset-control:focus-within {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-card.is-editing .df-review-figma-image-card-actions {
    display: none;
  }

  .df-review-figma-image-card.is-editing .df-review-figma-image-layer-controls {
    display: none;
  }
`;
