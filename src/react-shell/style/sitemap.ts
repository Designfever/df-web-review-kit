export const reviewShellSitemapStyle = `
  .df-review-sitemap-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
				    padding: 18px;
  }

	  .df-review-sitemap-backdrop {
	    position: absolute;
	    inset: 0;
	    min-height: 0;
	    border: 0;
	    border-radius: 0;
	    padding: 0;
	    background: var(--df-review-color-backdrop);
	  }

  .df-review-sitemap-dialog {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
	    width: min(940px, calc(100vw - 48px));
	    max-height: min(720px, calc(100vh - 48px));
	    overflow: hidden;
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-lg);
	    background: var(--df-review-panel);
	    box-shadow: var(--df-review-shadow-modal);
	  }

  .df-review-sitemap-header {
    display: flex;
    align-items: center;
	    justify-content: space-between;
	    gap: 12px;
	    min-height: 54px;
	    padding: 0 14px 0 16px;
	    border-bottom: 1px solid var(--df-review-line);
	  }

  .df-review-sitemap-header div {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
  }

  .df-review-sitemap-header strong {
    font-size: var(--df-review-font-size-lg);
    font-weight: var(--df-review-font-weight-emphasis);
  }

	  .df-review-sitemap-header span {
	    color: var(--df-review-muted);
	    font-size: var(--df-review-font-size-sm);
	    font-weight: var(--df-review-font-weight-normal);
	  }

  .df-review-sitemap-header button {
    display: grid;
    place-items: center;
	    width: 34px;
	    min-width: 34px;
	    min-height: var(--df-review-control-height-md);
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-sm);
	    background: var(--df-review-control);
	    color: var(--df-review-text);
	    font-size: var(--df-review-font-size-md);
	    font-weight: var(--df-review-font-weight-normal);
	  }

	  .df-review-sitemap-header button:hover {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-control-hover);
	  }

  .df-review-sitemap-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 10px 12px;
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-panel);
  }

  .df-review-sitemap-search {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 34px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 10px;
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    color: var(--df-review-muted);
  }

  .df-review-sitemap-search:focus-within {
    border-color: var(--df-review-accent);
    color: var(--df-review-text);
  }

  .df-review-sitemap-search svg {
    width: 15px;
    min-width: 15px;
    height: 15px;
  }

  .df-review-sitemap-search input {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 30px;
    border: 0;
    padding: 0;
    outline: none;
    color: var(--df-review-text);
    background: transparent;
    appearance: none;
    font: inherit;
    font-size: var(--df-review-font-size-sm);
  }

  .df-review-sitemap-search input::-webkit-search-cancel-button {
    appearance: none;
  }

  .df-review-sitemap-search input::placeholder {
    color: var(--df-review-muted);
  }

  .df-review-sitemap-search-clear {
    display: grid;
    place-items: center;
    width: 34px;
    min-width: 34px;
    min-height: 34px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    background: var(--df-review-control);
    color: var(--df-review-muted);
  }

  .df-review-sitemap-search-clear:hover {
    border-color: var(--df-review-accent);
    color: var(--df-review-text);
    background: var(--df-review-control-hover);
  }

  .df-review-sitemap-search-clear svg {
    width: 15px;
    height: 15px;
  }

  .df-review-sitemap-search-count {
    flex: 0 0 auto;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    white-space: nowrap;
  }

  .df-review-sitemap-controls select {
    min-width: 138px;
    min-height: 32px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 26px 0 10px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-emphasis);
  }

  .df-review-sitemap-list {
    --df-review-sitemap-grid-template: minmax(190px, 1fr) 74px 78px 64px minmax(108px, 160px);
    position: relative;
    display: grid;
    align-content: start;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 8px;
  }

  .df-review-sitemap-table-head,
  .df-review-sitemap-row {
    display: grid;
    grid-template-columns: var(--df-review-sitemap-grid-template);
    align-items: center;
    column-gap: 0;
  }

  .df-review-sitemap-table-head {
    position: sticky;
    top: 0;
    z-index: 3;
    min-height: 32px;
    border-bottom: 1px solid var(--df-review-line);
    padding: 0 10px;
    background: var(--df-review-panel);
    box-shadow:
      0 -8px 0 0 var(--df-review-panel),
      0 1px 0 var(--df-review-line);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .df-review-sitemap-sort {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 0;
    min-height: 28px;
    border: 0;
    border-radius: 0;
    padding: 0 0 0 8px;
    color: inherit;
    background: transparent;
    box-shadow: none;
    font: inherit;
    letter-spacing: inherit;
    text-align: right;
    text-transform: inherit;
    cursor: pointer;
  }

  .df-review-sitemap-sort.is-page {
    justify-content: flex-start;
    padding-left: 0;
    text-align: left;
  }

  .df-review-sitemap-sort-indicator {
    width: 8px;
    min-width: 8px;
    color: var(--df-review-accent);
    text-align: center;
  }

  .df-review-sitemap-sort-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-sitemap-sort:hover,
  .df-review-sitemap-sort.is-active {
    color: var(--df-review-text);
  }

  .df-review-sitemap-row {
    min-height: 42px;
    border: 0;
    border-radius: 0;
    padding: 0 10px;
    background: transparent;
    color: var(--df-review-text);
    text-align: left;
  }

  .df-review-sitemap-row.is-summary {
    position: sticky;
    bottom: 0;
    z-index: 3;
    border-top: 1px solid var(--df-review-line);
    border-bottom: 0;
    background: var(--df-review-panel);
    box-shadow:
      0 8px 0 0 var(--df-review-panel),
      0 -1px 0 var(--df-review-line);
  }

  .df-review-sitemap-row.is-folder {
    cursor: default;
  }

  .df-review-sitemap-empty {
    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    min-height: 74px;
    padding: 0 10px;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
  }

  .df-review-sitemap-row:not(.is-summary):hover,
  button.df-review-sitemap-row.is-summary:hover,
  .df-review-sitemap-row.is-active {
    background: var(--df-review-accent-soft);
  }

  .df-review-sitemap-path {
    position: relative;
    display: inline-flex;
    align-items: center;
    align-self: stretch;
    gap: 6px;
    min-width: 0;
    padding-left: calc(var(--df-review-sitemap-depth, 0) * 18px);
    overflow-wrap: anywhere;
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-md);
    font-weight: var(--df-review-font-weight-normal);
    line-height: 1.35;
  }

  .df-review-sitemap-path::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: calc(var(--df-review-sitemap-depth, 0) * 18px);
    background-image: repeating-linear-gradient(
      to right,
      transparent 0,
      transparent 11px,
      var(--df-review-line-soft) 11px,
      var(--df-review-line-soft) 12px,
      transparent 12px,
      transparent 18px
    );
    opacity: 0.9;
    pointer-events: none;
  }

  .df-review-sitemap-row.is-folder .df-review-sitemap-path {
    color: var(--df-review-muted);
  }

  .df-review-sitemap-tree-toggle,
  .df-review-sitemap-tree-spacer {
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    width: 22px;
    min-width: 22px;
    height: 22px;
  }

  .df-review-sitemap-tree-toggle {
    border: 0;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    background: transparent;
    color: var(--df-review-muted);
    box-shadow: none;
    cursor: pointer;
  }

  .df-review-sitemap-tree-toggle:hover,
  .df-review-sitemap-tree-toggle:focus-visible {
    color: var(--df-review-text);
    background: var(--df-review-control-hover);
  }

  .df-review-sitemap-tree-toggle svg {
    width: 15px;
    height: 15px;
  }

  .df-review-sitemap-page-button {
    min-width: 0;
    min-height: 28px;
    border: 0;
    border-radius: var(--df-review-radius-sm);
    padding: 0 5px;
    overflow: hidden;
    color: inherit;
    background: transparent;
    box-shadow: none;
    font: inherit;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }

  .df-review-sitemap-page-button:hover,
  .df-review-sitemap-page-button:focus-visible {
    color: var(--df-review-text);
    background: var(--df-review-control-hover);
  }

  .df-review-sitemap-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .df-review-sitemap-cell {
    min-width: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
    font-variant-numeric: tabular-nums;
    font-weight: var(--df-review-font-weight-normal);
    line-height: 1;
    text-align: right;
  }

  .df-review-sitemap-cell.is-total {
    color: var(--df-review-accent);
    font-weight: var(--df-review-font-weight-normal);
  }

  .df-review-sitemap-cell.is-total strong {
    font: inherit;
  }

  .df-review-sitemap-cell.is-online {
    display: flex;
    justify-content: flex-end;
    color: var(--df-review-text);
  }

  .df-review-sitemap-users {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-sitemap-user {
    --df-review-presence-color: var(--df-review-accent);
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    border: 1px solid var(--df-review-presence-color);
    border-radius: var(--df-review-radius-pill);
    padding: 0 7px;
    background: var(--df-review-chip-bg);
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1.1;
    white-space: nowrap;
  }

  .df-review-sitemap-online-empty {
    color: var(--df-review-muted);
  }

  .df-review-sitemap-row.is-page:hover .df-review-sitemap-path,
  button.df-review-sitemap-row.is-summary:hover .df-review-sitemap-path,
  .df-review-sitemap-row.is-active .df-review-sitemap-path {
    color: var(--df-review-text);
  }

`;
