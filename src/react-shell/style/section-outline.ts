export const reviewShellSectionOutlineStyle = `
  .df-review-section-outline {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    border: 0;
    border-radius: 0;
    color: var(--df-review-text);
    background: transparent;
    box-shadow: none;
    overflow: hidden;
  }

  .df-review-section-outline-head {
    display: grid;
    grid-template-rows:
      var(--df-review-control-height-md)
      var(--df-review-control-height-md);
    align-items: center;
    gap: var(--df-review-space-2);
    min-width: 0;
    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-card);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
  }

  .df-review-section-outline-summary {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: var(--df-review-control-height-md);
    min-width: 0;
  }

  .df-review-section-outline-summary span {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
  }

  .df-review-section-outline-head strong {
    overflow: hidden;
    color: var(--df-review-text);
    font-size: inherit;
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-section-outline-head small {
    flex: 0 0 auto;
    overflow: hidden;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-section-outline-meta-controls {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    height: 26px;
    min-height: 26px;
    min-width: 0;
    border: 0;
    border-radius: 0;
    padding: 0;
    background: transparent;
    box-shadow: none;
  }

  .df-review-section-outline-meta-toggle {
    display: inline-grid;
    place-items: center;
    width: 26px;
    min-width: 26px;
    height: 26px;
    border: 0;
    border-radius: 0;
    padding: 0;
    color: var(--df-review-subtle);
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    opacity: 0.3;
  }

  .df-review-section-outline-meta-toggle:hover,
  .df-review-section-outline-meta-toggle:focus-visible,
  .df-review-section-outline-meta-toggle.is-active {
    color: var(--df-review-text);
    opacity: 1;
    outline: 0;
  }

  .df-review-section-outline-meta-toggle.is-active {
    box-shadow: none;
    color: var(--df-review-accent);
  }

  .df-review-section-outline-meta-toggle svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .df-review-section-outline-filter {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    align-self: stretch;
    gap: 8px;
    min-width: 0;
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 7px 0 11px;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
  }

  .df-review-section-outline-filter:focus-within {
    border-color: var(--df-review-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
  }

  .df-review-section-outline-filter svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
  }

  .df-review-section-outline-filter input {
    width: 100%;
    min-width: 0;
    height: 100%;
    border: 0;
    padding: 0;
    color: var(--df-review-text);
    background: transparent;
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    outline: 0;
    -webkit-appearance: none;
    appearance: none;
  }

  .df-review-section-outline-filter input::placeholder {
    color: var(--df-review-subtle);
  }

  .df-review-section-outline-filter input::-webkit-search-cancel-button,
  .df-review-section-outline-filter input::-webkit-search-decoration {
    display: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .df-review-section-outline-filter-clear {
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-md);
    height: var(--df-review-control-height-md);
    border: 0;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
    cursor: pointer;
  }

  .df-review-section-outline-filter-clear:hover,
  .df-review-section-outline-filter-clear:focus-visible {
    color: var(--df-review-text);
    background: var(--df-review-accent-soft);
    outline: 0;
  }

  .df-review-section-outline-list {
    display: grid;
    align-content: start;
    gap: var(--df-review-space-2);
    min-height: 0;
    overflow-y: auto;
    padding: var(--df-review-space-2) var(--df-review-space-2) var(--df-review-space-3);
    scrollbar-gutter: stable;
  }

  .df-review-section-outline-item {
    display: grid;
    --df-review-section-outline-name-color: var(--df-review-text);
  }

  /* Each root renders as a card so the tree scans like the QA list. */
  .df-review-section-outline-item.is-depth-1 {
    padding: var(--df-review-space-1);
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-lg);
    background: var(--df-review-card);
  }

  .df-review-section-outline-entry-body {
    display: grid;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    transition: border-color 140ms ease, background 140ms ease;
  }

  .df-review-section-outline-entry-body:hover {
    border-color: rgba(124, 199, 255, 0.2);
    background: var(--df-review-accent-soft);
  }

  .df-review-section-outline-entry-body.is-selected {
    border-color: transparent;
    background: transparent;
    box-shadow: none;
  }


  .df-review-section-outline-row {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    align-items: start;
    gap: 7px;
    border-radius: var(--df-review-radius-sm);
    min-height: 62px;
    padding: 8px 7px 7px 6px;
  }

  .df-review-section-outline-toggle {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border: 0;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
  }

  .df-review-section-outline-toggle:hover {
    color: var(--df-review-text);
    background: var(--df-review-accent-soft);
  }

  .df-review-section-outline-toggle svg {
    width: 13px;
    height: 13px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.4;
    transition: transform 120ms ease;
  }

  .df-review-section-outline-toggle.is-collapsed svg {
    transform: rotate(-90deg);
  }

  .df-review-section-outline-toggle.is-placeholder {
    pointer-events: none;
  }

  .df-review-section-outline-main {
    display: grid;
    gap: 7px;
    min-width: 0;
  }

  .df-review-section-outline-title {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 6px;
    min-width: 0;
  }

  .df-review-section-outline-name {
    display: grid;
    gap: 2px;
    min-width: 0;
    overflow: hidden;
    border: 0;
    padding: 0;
    color: var(--df-review-text);
    background: transparent;
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
    line-height: 1.25;
    text-align: left;
    white-space: normal;
    cursor: pointer;
  }

  .df-review-section-outline-name span {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--df-review-section-outline-name-color);
    white-space: normal;
  }

  .df-review-section-outline-name:hover {
    color: var(--df-review-accent);
  }

  .df-review-section-outline-row.is-selected .df-review-section-outline-name span {
    color: var(--df-review-warning);
    font-weight: var(--df-review-font-weight-emphasis);
  }

  .df-review-section-outline-meta {
    position: relative;
    display: grid;
    gap: 3px;
    min-width: 0;
    padding: 8px 6px 7px;
  }

  .df-review-section-outline-meta::before {
    position: absolute;
    top: 0;
    left: 29px;
    right: 8px;
    height: 1px;
    background: var(--df-review-line-soft);
    content: '';
  }

  .df-review-section-outline-meta-row {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    align-items: start;
    gap: 6px;
    min-width: 0;
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1.35;
  }

  .df-review-section-outline-meta-row b {
    color: var(--df-review-subtle);
    font-weight: var(--df-review-font-weight-emphasis);
  }

  .df-review-section-outline-meta-row code {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--df-review-muted);
    font-family: inherit;
  }

  .df-review-section-outline-meta-row.is-text code {
    color: var(--df-review-text);
  }

  .df-review-section-outline-meta-row.is-media code {
    color: var(--df-review-accent);
  }

  .df-review-section-outline-meta-row.is-source code,
  .df-review-section-outline-meta-row.is-usage code {
    color: var(--df-review-accent);
  }

  .df-review-section-outline-source-link,
  .df-review-section-outline-usage-link {
    display: block;
    min-width: 0;
    border: 0;
    padding: 0;
    color: var(--df-review-accent);
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .df-review-section-outline-source-link:hover,
  .df-review-section-outline-source-link:focus-visible,
  .df-review-section-outline-usage-link:hover,
  .df-review-section-outline-usage-link:focus-visible {
    color: var(--df-review-text);
    outline: 0;
  }

  .df-review-section-outline-media-link {
    display: block;
    min-width: 0;
    color: var(--df-review-accent);
    text-decoration: none;
  }

  .df-review-section-outline-media-link:hover,
  .df-review-section-outline-media-link:focus-visible {
    color: var(--df-review-text);
    outline: 0;
  }

  .df-review-section-outline-meta-row.is-class code {
    color: var(--df-review-source-popover-data-subtle);
  }

  .df-review-section-outline-meta-row.is-class {
    align-items: center;
  }

  .df-review-section-outline-class-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 3px;
    min-width: 0;
  }

  .df-review-section-outline-class-tags code {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    min-height: 20px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-pill);
    padding: 0 6px;
    background: var(--df-review-control);
    line-height: 1;
  }

  .df-review-section-outline-action-group {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .df-review-section-outline-action-group.is-left {
    justify-content: flex-start;
  }

  .df-review-section-outline-action-group.is-right {
    justify-content: flex-end;
  }

  .df-review-section-outline-actions {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .df-review-section-outline-divider {
    display: block;
    width: 1px;
    height: 14px;
    margin: 0 2px;
    overflow: hidden;
    background: var(--df-review-line-soft);
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-xs);
    line-height: 1;
    text-indent: -999px;
    user-select: none;
  }

  .df-review-section-outline-link {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
    cursor: pointer;
    transition: border-color 140ms ease, background 140ms ease,
      color 140ms ease, opacity 140ms ease;
  }

  .df-review-section-outline-link.is-dom-adjust,
  .df-review-section-outline-link.is-dom-select,
  .df-review-section-outline-link.is-dom-reset,
  .df-review-section-outline-link.is-copy-name {
    width: 24px;
    min-width: 24px;
    padding: 0;
  }

  .df-review-section-outline-link.is-dom-adjust svg,
  .df-review-section-outline-link.is-dom-select svg,
  .df-review-section-outline-link.is-dom-reset svg,
  .df-review-section-outline-link.is-copy-name svg {
    width: 16px;
    height: 16px;
  }

  .df-review-section-outline-adjust-status {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1;
    white-space: nowrap;
  }

  .df-review-section-outline-link:hover {
    border-color: rgba(124, 199, 255, 0.34);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
  }

  .df-review-section-outline-link.is-active,
  .df-review-section-outline-link.is-copied {
    color: var(--df-review-accent);
  }

  .df-review-section-outline-link.is-active {
    border-color: rgba(124, 199, 255, 0.42);
    background: var(--df-review-accent-soft);
  }

  .df-review-section-outline-link.is-copied {
    border-color: rgba(243, 183, 95, 0.42);
    color: var(--df-review-warning);
    background: rgba(243, 183, 95, 0.1);
  }

  .df-review-section-outline-link svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .df-review-section-outline-link:disabled {
    color: var(--df-review-subtle);
    cursor: not-allowed;
    opacity: 0.42;
  }

  .df-review-section-outline-link:disabled:hover {
    border-color: transparent;
    color: var(--df-review-subtle);
    background: transparent;
  }

  .df-review-section-outline-children {
    display: grid;
    margin-left: 16px;
    border-left: 1px solid var(--df-review-line-soft);
  }

  .df-review-section-outline-item.is-depth-1
    > .df-review-section-outline-children {
    border-left-color: var(--df-review-accent);
  }

  .df-review-section-outline-item.is-depth-2 {
    --df-review-section-outline-name-color: var(--df-review-accent);
  }

  .df-review-section-outline-item.is-depth-2
    > .df-review-section-outline-children {
    border-left-color: var(--df-review-area);
  }

  .df-review-section-outline-item.is-depth-3 {
    --df-review-section-outline-name-color: var(--df-review-area);
  }

  .df-review-section-outline-item.is-depth-3
    > .df-review-section-outline-children {
    border-left-color: var(--df-review-warning);
  }

  .df-review-section-outline-item.is-depth-4 {
    --df-review-section-outline-name-color: var(--df-review-warning);
  }

  .df-review-section-outline-item.is-depth-4
    > .df-review-section-outline-children {
    border-left-color: var(--df-review-purple);
  }

  .df-review-section-outline-item.is-depth-5 {
    --df-review-section-outline-name-color: var(--df-review-purple);
  }

  .df-review-section-outline-empty {
    padding: 14px 12px 16px;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
  }

`;
