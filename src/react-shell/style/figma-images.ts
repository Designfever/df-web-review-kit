export const reviewShellFigmaImagesStyle = `
  .df-review-figma-images-panel {
    grid-column: 2;
    grid-row: 1 / span 3;
    position: relative;
    z-index: 600;
    display: grid;
    grid-template-rows: auto auto auto auto auto minmax(0, 1fr);
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
    gap: 8px;
    min-height: var(--df-review-control-height-md);
    min-width: 0;
  }

  .df-review-figma-images-title {
    display: grid;
    min-width: 0;
  }

  .df-review-figma-images-title strong {
    overflow: hidden;
    color: var(--df-review-text);
    font-size: inherit;
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-figma-image-form {
    display: grid;
    grid-template-rows:
      var(--df-review-control-height-md)
      var(--df-review-control-height-md);
    align-items: center;
    gap: var(--df-review-space-2);
    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-card);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
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

  .df-review-figma-image-url-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--df-review-control-height-md);
    align-items: center;
    gap: var(--df-review-space-1-5);
    min-width: 0;
  }

  .df-review-figma-image-header-button {
    display: inline-grid;
    place-items: center;
    justify-self: end;
    width: 26px;
    min-width: 26px;
    height: 26px;
    min-height: 26px;
    border: 0;
    border-radius: 0;
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
    box-shadow: none;
    cursor: pointer;
  }

  .df-review-figma-image-header-button:hover,
  .df-review-figma-image-header-button:focus-visible {
    color: var(--df-review-text);
    opacity: 1;
    outline: 0;
  }

  .df-review-figma-image-header-button:disabled {
    cursor: default;
    opacity: 0.36;
  }

  .df-review-figma-image-header-button svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
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

  .df-review-figma-image-selected-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    gap: var(--df-review-space-1);
    padding: var(--df-review-space-2) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: color-mix(in srgb, var(--df-review-card) 82%, transparent);
  }

  .df-review-figma-image-selected-numbers {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(54px, 64px) var(--df-review-control-height-sm);
    justify-self: stretch;
    gap: var(--df-review-space-1);
    min-width: 0;
  }

  .df-review-figma-image-selected-link {
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-sm);
    min-width: var(--df-review-control-height-sm);
    height: var(--df-review-control-height-sm);
    min-height: var(--df-review-control-height-sm);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    text-decoration: none;
  }

  .df-review-figma-image-selected-link:hover,
  .df-review-figma-image-selected-link:focus-visible {
    border-color: var(--df-review-accent);
    color: var(--df-review-text);
    background: var(--df-review-control-hover);
    outline: none;
  }

  .df-review-figma-image-selected-link:disabled {
    cursor: default;
    opacity: 0.42;
  }

  .df-review-figma-image-selected-link svg {
    width: 13px;
    height: 13px;
  }

  .df-review-figma-image-number-control {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 4px;
    min-width: 0;
    height: var(--df-review-control-height-sm);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 5px;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-xs);
    font-variant-numeric: tabular-nums;
  }

  .df-review-figma-image-number-control svg {
    width: 13px;
    height: 13px;
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-number-control span {
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1;
  }

  .df-review-figma-image-number-control input {
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

  .df-review-figma-image-number-control input:disabled {
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-number-control:focus-within {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-opacity-control {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) 26px;
    align-items: center;
    gap: 6px;
    min-width: 0;
    height: var(--df-review-control-height-sm);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 6px;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-xs);
    font-variant-numeric: tabular-nums;
  }

  .df-review-figma-image-opacity-control span {
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1;
  }

  .df-review-figma-image-opacity-control strong {
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: 500;
    line-height: 1;
    text-align: right;
  }

  .df-review-figma-image-opacity-slider {
    --df-review-figma-opacity-thumb-size: 12px;
    --df-review-figma-opacity-thumb-radius: 6px;
    position: relative;
    display: grid;
    align-items: center;
    min-width: 0;
    height: 20px;
    cursor: pointer;
    touch-action: none;
  }

  .df-review-figma-image-opacity-slider::before {
    content: "";
    position: absolute;
    top: 50%;
    right: var(--df-review-figma-opacity-thumb-radius);
    left: var(--df-review-figma-opacity-thumb-radius);
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--df-review-accent) 0 var(--df-review-figma-opacity-value),
      var(--df-review-line) var(--df-review-figma-opacity-value) 100%
    );
    transform: translateY(-50%);
    pointer-events: none;
  }

  .df-review-figma-image-opacity-slider::after {
    content: "";
    position: absolute;
    top: 50%;
    left: clamp(
      var(--df-review-figma-opacity-thumb-radius),
      var(--df-review-figma-opacity-left, var(--df-review-figma-opacity-value)),
      calc(100% - var(--df-review-figma-opacity-thumb-radius))
    );
    z-index: 2;
    box-sizing: border-box;
    width: var(--df-review-figma-opacity-thumb-size);
    height: var(--df-review-figma-opacity-thumb-size);
    border: 1px solid var(--df-review-accent);
    border-radius: 50%;
    background: var(--df-review-text);
    box-shadow: 0 0 0 2px var(--df-review-bg);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .df-review-figma-image-opacity-slider input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    position: absolute;
    inset: 0;
    z-index: 3;
    width: 100%;
    min-width: 0;
    height: 100%;
    border: 0;
    margin: 0;
    padding: 0;
    background: transparent;
    outline: none;
    opacity: 0;
    cursor: pointer;
  }

  .df-review-figma-image-opacity-slider input[type="range"]::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 999px;
    background: transparent;
  }

  .df-review-figma-image-opacity-slider input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: var(--df-review-figma-opacity-thumb-size);
    height: var(--df-review-figma-opacity-thumb-size);
    margin-top: -4px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
  }

  .df-review-figma-image-opacity-slider input[type="range"]::-moz-range-track {
    height: 4px;
    border-radius: 999px;
    background: transparent;
  }

  .df-review-figma-image-opacity-slider input[type="range"]::-moz-range-thumb {
    width: var(--df-review-figma-opacity-thumb-size);
    height: var(--df-review-figma-opacity-thumb-size);
    border: 0;
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
  }

  .df-review-figma-image-opacity-slider input[type="range"]:disabled {
    cursor: default;
  }

  .df-review-figma-image-opacity-control:focus-within {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-status {
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
    display: grid;
    align-content: start;
    gap: var(--df-review-space-2);
    min-height: 0;
    overflow: auto;
    padding: var(--df-review-space-2);
  }

  .df-review-figma-image-card {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: "state main actions";
    align-items: center;
    gap: var(--df-review-space-1-5);
    min-width: 0;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: var(--df-review-space-4) var(--df-review-space-2);
    background: var(--df-review-card);
    cursor: pointer;
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }

  .df-review-figma-image-card:hover {
    border-color: var(--df-review-line);
  }

  .df-review-figma-image-card.is-dragging {
    opacity: 0.58;
  }

  .df-review-figma-image-card.is-drop-target {
    border-color: var(--df-review-line-soft);
    box-shadow: none;
  }

  .df-review-figma-image-card.is-drop-before::before,
  .df-review-figma-image-card.is-drop-after::after {
    content: "";
    position: absolute;
    z-index: 2;
    right: 6px;
    left: 6px;
    height: 2px;
    border-radius: 999px;
    background: var(--df-review-accent);
    box-shadow: 0 0 0 2px rgba(124, 199, 255, 0.16);
    pointer-events: none;
  }

  .df-review-figma-image-card.is-drop-before::before {
    top: -6px;
  }

  .df-review-figma-image-card.is-drop-after::after {
    bottom: -6px;
  }

  .df-review-figma-image-card.is-active {
    border-color: var(--df-review-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover), 0 0 0 3px rgba(124, 199, 255, 0.12);
  }

  .df-review-figma-image-card.is-editing {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas: "state main";
  }

  .df-review-figma-image-layer-state {
    grid-area: state;
    display: grid;
    grid-template-columns: repeat(3, 22px);
    align-items: center;
    gap: 2px;
    min-width: 0;
    height: var(--df-review-control-height-sm);
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
    color: var(--df-review-subtle);
    background: transparent;
    box-shadow: none;
    opacity: 0.62;
  }

  .df-review-figma-image-state-button:hover,
  .df-review-figma-image-state-button:focus-visible {
    color: var(--df-review-text);
    opacity: 1;
    outline: none;
  }

  .df-review-figma-image-state-button.is-active {
    color: var(--df-review-accent);
    opacity: 1;
  }

  .df-review-figma-image-state-button svg {
    width: 13px;
    height: 13px;
  }

  .df-review-figma-image-card-main {
    grid-area: main;
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .df-review-figma-image-label-input {
    width: 100%;
    min-width: 0;
    height: 24px;
    border: 1px solid transparent;
    border-radius: 2px;
    padding: 0 4px;
    color: var(--df-review-text);
    background: transparent;
    box-shadow: none;
    font-size: var(--df-review-font-size-sm);
    font-weight: 500;
    line-height: 1.28;
  }

  .df-review-figma-image-label-input:focus {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-label-input:disabled {
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-card-main small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-figma-image-card-main strong,
  .df-review-figma-image-card-main small {
    user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  .df-review-figma-image-card-main strong {
    min-width: 0;
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-sm);
    font-weight: 500;
    line-height: 1.28;
    overflow-wrap: anywhere;
    white-space: normal;
  }

  .df-review-figma-image-card-main small {
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1.2;
  }

  .df-review-figma-image-card-actions {
    grid-area: actions;
    display: grid;
    grid-template-columns: repeat(2, 22px);
    gap: 2px;
  }

  .df-review-figma-image-card-actions .df-review-figma-image-icon-button {
    width: 22px;
    min-width: 22px;
    height: 22px;
    min-height: 22px;
    border: 0;
    border-radius: 0;
    color: var(--df-review-subtle);
    background: transparent;
    box-shadow: none;
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease, color 120ms ease;
  }

  .df-review-figma-image-card:hover .df-review-figma-image-card-actions .df-review-figma-image-icon-button,
  .df-review-figma-image-card:focus-within .df-review-figma-image-card-actions .df-review-figma-image-icon-button {
    opacity: 0.62;
    pointer-events: auto;
  }

  .df-review-figma-image-card-actions .df-review-figma-image-icon-button:hover,
  .df-review-figma-image-card-actions .df-review-figma-image-icon-button:focus-visible {
    color: var(--df-review-text);
    background: transparent;
    opacity: 1;
    outline: none;
  }

  .df-review-figma-image-card.is-editing .df-review-figma-image-card-actions {
    display: none;
  }

  @media (hover: none) {
    .df-review-figma-image-card.is-active .df-review-figma-image-card-actions .df-review-figma-image-icon-button {
      opacity: 0.62;
      pointer-events: auto;
    }
  }
`;
