export const reviewShellQaPanelStyle = `
	  .df-review-qa-panel {
	    grid-column: 2;
	    grid-row: 1 / span 3;
	    position: relative;
	    z-index: 600;
	    display: grid;
	    grid-template-rows: minmax(0, 1fr) auto;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	    border-left: 1px solid var(--df-review-line-soft);
	    background:
	      linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
	  }

  .df-review-qa-draft-host {
    position: relative;
    z-index: 2;
    display: none;
    justify-self: end;
    width: calc(100% - var(--df-review-space-4));
    margin: 0 var(--df-review-space-2) var(--df-review-space-2) auto;
    min-width: 0;
  }

  .df-review-qa-draft-host[data-has-draft-composer="true"] {
    display: block;
  }

  .df-review-qa-panel[data-has-draft-composer="true"] .df-review-panel-body {
    opacity: 0.36;
    pointer-events: none;
  }

	  .df-review-shell:not(.is-list-visible) .df-review-qa-panel,
  .df-review-qa-panel[aria-hidden="true"] {
	    visibility: hidden;
	    border-left: 0;
    pointer-events: none;
	  }

  .df-review-source-tree-panel {
    grid-column: 2;
    grid-row: 1 / span 3;
    position: relative;
    z-index: 600;
    display: grid;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-left: 1px solid var(--df-review-line-soft);
    background:
      linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
  }

  .df-review-shell:not(.is-list-visible) .df-review-source-tree-panel,
  .df-review-source-tree-panel[aria-hidden="true"] {
    visibility: hidden;
    border-left: 0;
    pointer-events: none;
  }

	  .df-review-panel-body {
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-item-list {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }

			  .df-review-list-header {
			    display: grid;
			    grid-template-rows:
      var(--df-review-control-height-md)
      var(--df-review-control-height-md);
			    gap: var(--df-review-space-2);
			    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
			    border-bottom: 1px solid var(--df-review-line-soft);
			    background: var(--df-review-card);
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: 500;
			  }

			  .df-review-list-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: var(--df-review-control-height-md);
    min-width: 0;
  }

			  .df-review-list-title {
			    display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
			    align-items: center;
			    gap: 8px;
          min-height: var(--df-review-control-height-md);
		    min-width: 0;
		  }

  .df-review-list-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

		  .df-review-list-meta span {
		    min-width: 0;
		    overflow: hidden;
		    color: #fff;
		    text-overflow: ellipsis;
		    white-space: nowrap;
		  }

			  .df-review-list-meta strong {
			    flex: 0 0 auto;
			    color: #fff;
			    font-size: var(--df-review-font-size-xs);
			    font-variant-numeric: tabular-nums;
          font-weight: 500;
			  }

  .df-review-list-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .df-review-source-select,
  .df-review-status-filter-select {
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 24px 0 8px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-xs);
    font-weight: 500;
  }

  .df-review-source-select {
    width: 104px;
  }

  .df-review-status-filter-select {
    width: 124px;
  }

  .df-review-source-refresh {
    position: relative;
		    display: inline-grid;
		    place-items: center;
		    width: var(--df-review-control-height-md);
		    min-width: var(--df-review-control-height-md);
		    height: var(--df-review-control-height-md);
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-sm);
		    padding: 0;
		    color: var(--df-review-muted);
		    background: var(--df-review-control);
		    box-shadow: var(--df-review-shadow-control);
		  }

		  .df-review-source-refresh svg {
		    width: 16px;
		    height: 16px;
		  }

			  .df-review-filter-tabs {
    display: flex;
    align-items: center;
    justify-self: end;
    gap: 2px;
    height: 26px;
    min-height: 26px;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

				  .df-review-filter-tab {
    position: relative;
    display: grid;
    place-items: center;
    width: 26px;
    min-width: 26px;
    height: 26px;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--df-review-subtle);
    opacity: 0.3;
  }

				  .df-review-filter-icon {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }

				  .df-review-filter-separator {
				    display: block;
				    width: 18px;
				    height: 1px;
				    border-radius: var(--df-review-radius-pill);
				    background: currentColor;
				    opacity: 0.42;
				  }

		  .df-review-filter-tab:hover,
		  .df-review-filter-tab.is-active {
		    color: var(--df-review-text);
        opacity: 1;
		  }

		  .df-review-filter-tab.is-active {
		    box-shadow: none;
		    color: var(--df-review-accent);
		  }

				  .df-review-filter-icon svg {
				    width: 14px;
				    height: 14px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
			    stroke-width: 1.9;
			  }

			  .df-review-filter-count {
			    color: currentColor;
			    font-size: var(--df-review-font-size-3xs);
			    font-weight: 600;
			    font-variant-numeric: tabular-nums;
			    line-height: 1;
			  }

  .df-review-list-scroll {
    display: grid;
    align-content: start;
    gap: var(--df-review-space-2);
    min-height: 0;
    overflow: auto;
    padding: var(--df-review-space-2);
  }

	  .df-review-empty {
	    margin: 0;
	    padding: var(--df-review-space-5) var(--df-review-space-4);
	    border: 1px dashed var(--df-review-line);
	    border-radius: var(--df-review-radius-lg);
	    background: var(--df-review-card);
	    color: var(--df-review-subtle);
	    font-size: var(--df-review-font-size-sm);
	    line-height: 1.45;
	  }

  .df-review-item-card.is-dim {
    opacity: 0.4;
  }

  .df-review-item-card.is-dim:hover {
    opacity: 0.72;
  }

	  .df-review-item-card {
		    position: relative;
		    display: grid;
		    gap: var(--df-review-space-2-5);
		    padding: var(--df-review-space-3-5);
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-lg);
		    background: var(--df-review-card);
		    cursor: pointer;
		    transition: border-color 140ms ease, background 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
		  }

  .df-review-item-card:not(.is-dim):hover {
    border-color: var(--df-review-line);
  }

  .df-review-item-card.is-active {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-card);
	    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover), 0 0 0 3px rgba(124, 199, 255, 0.12);
	  }

  .df-review-item-card.is-overlay-hidden .df-review-item-main {
    opacity: 0.68;
  }

  .df-review-item-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 8px;
    min-width: 0;
  }

  .df-review-item-main {
    display: grid;
    gap: 4px;
    min-width: 0;
	    border: 0;
	    padding: 0;
	    text-align: left;
	    background: transparent;
	    color: var(--df-review-text);
	  }

  .df-review-item-main strong {
    overflow-wrap: anywhere;
    font-size: var(--df-review-font-size-md);
    font-weight: 500;
    line-height: 1.35;
  }

  .df-review-item-comment {
    padding: 5px 0;
    white-space: pre-wrap;
  }

	  .df-review-item-main small {
	    color: var(--df-review-subtle);
	    font-size: var(--df-review-font-size-xs);
	  }

  .df-review-item-meta {
    display: block;
    overflow-wrap: anywhere;
    line-height: 1.35;
  }

  .df-review-item-error {
    color: var(--df-review-danger) !important;
    overflow-wrap: anywhere;
  }

  .df-review-item-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-item-id,
  .df-review-item-scope,
  .df-review-item-mode,
  .df-review-item-status-badge,
  .df-review-item-status-select {
    --df-review-scope: var(--df-review-accent);
    --df-review-scope-rgb: 124, 199, 255;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 20px;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-pill);
    padding: 0 7px;
    font-size: var(--df-review-font-size-2xs);
    font-weight: 600;
    line-height: 1;
    text-transform: uppercase;
  }

  .df-review-item-id {
    appearance: none;
    border-color: var(--df-review-line);
    background: rgba(255, 255, 255, 0.03);
    color: var(--df-review-text);
    cursor: copy;
    font-family: inherit;
  }

  .df-review-item-id:hover,
  .df-review-item-id:focus-visible,
  .df-review-item-id.is-copied {
    border-color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
    color: var(--df-review-accent);
    outline: none;
  }

  .df-review-item-scope {
    border-color: rgba(var(--df-review-scope-rgb), 0.36);
    background: rgba(var(--df-review-scope-rgb), 0.12);
    color: var(--df-review-scope);
  }

  .df-review-item-scope.is-scope-tablet {
    --df-review-scope: var(--df-review-area);
    --df-review-scope-rgb: 99, 215, 199;
  }

  .df-review-item-scope.is-scope-desktop {
    --df-review-scope: var(--df-review-note);
    --df-review-scope-rgb: 243, 183, 95;
  }

  .df-review-item-scope.is-scope-wide {
    --df-review-scope: var(--df-review-purple);
    --df-review-scope-rgb: 201, 156, 255;
  }

  .df-review-item-scope.is-scope-dom {
    --df-review-scope: var(--df-review-danger);
    --df-review-scope-rgb: 255, 143, 97;
  }

  .df-review-item-scope svg,
  .df-review-item-mode svg {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

	  .df-review-item-mode {
	    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

  .df-review-item-mode.is-mode-area {
    color: var(--df-review-area);
  }

  .df-review-item-mode.is-mode-dom {
    color: var(--df-review-danger);
  }

  .df-review-item-status-badge {
    min-height: 30px;
    border-radius: var(--df-review-radius-sm);
    padding: 0 11px;
    font-size: var(--df-review-font-size-xs);
    font-weight: 500;
    text-transform: none;
  }

  .df-review-item-status-select {
    min-height: 30px;
    min-width: 92px;
    max-width: 118px;
    border-radius: var(--df-review-radius-sm);
    padding: 0 10px;
    cursor: pointer;
    outline: 0;
    font-size: var(--df-review-font-size-xs);
    font-weight: 500;
    text-transform: none;
  }

  .df-review-item-status-select:focus-visible {
    border-color: var(--df-review-accent);
    box-shadow: 0 0 0 2px var(--df-review-accent-soft);
  }

  .df-review-item-status-badge.is-status-todo,
  .df-review-item-status-select.is-status-todo {
    border-color: var(--df-review-line);
    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

  .df-review-item-status-badge.is-status-doing,
  .df-review-item-status-select.is-status-doing {
    border-color: rgba(124, 199, 255, 0.34);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
  }

  .df-review-item-status-badge.is-status-review,
  .df-review-item-status-select.is-status-review {
    border-color: rgba(243, 183, 95, 0.34);
    color: var(--df-review-note);
    background: var(--df-review-note-soft);
  }

  .df-review-item-status-badge.is-status-hold,
  .df-review-item-status-select.is-status-hold {
    border-color: rgba(179, 149, 255, 0.32);
    color: var(--df-review-purple);
    background: var(--df-review-purple-soft);
  }

  .df-review-item-status-badge.is-status-done,
  .df-review-item-status-select.is-status-done {
    border-color: rgba(99, 215, 199, 0.34);
    color: var(--df-review-area);
    background: var(--df-review-area-soft);
  }

  .df-review-source-select,
  .df-review-status-filter-select,
  .df-review-item-status-select,
  .df-review-item-status-select.is-status-todo,
  .df-review-item-status-select.is-status-doing,
  .df-review-item-status-select.is-status-review,
  .df-review-item-status-select.is-status-hold,
  .df-review-item-status-select.is-status-done,
  .df-review-sitemap-controls select {
    --df-review-select-padding-x: 12px;
    --df-review-select-chevron-size: 14px;
    --df-review-select-chevron-gap: 8px;
    appearance: none;
    -webkit-appearance: none;
    background-image: var(--df-review-select-chevron);
    background-repeat: no-repeat;
    background-position: right var(--df-review-select-padding-x) center;
    background-size:
      var(--df-review-select-chevron-size)
      var(--df-review-select-chevron-size);
    padding-right: calc(
      var(--df-review-select-padding-x) +
      var(--df-review-select-chevron-size) +
      var(--df-review-select-chevron-gap)
    );
    padding-left: var(--df-review-select-padding-x);
  }

  .df-review-item-status-badge.is-error {
    border-color: rgba(255, 143, 97, 0.36);
    color: var(--df-review-danger);
    background: var(--df-review-danger-soft);
  }

	  .df-review-item-main img {
	    width: 100%;
	    max-height: 110px;
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-sm);
	    object-fit: cover;
	    background: var(--df-review-control);
  }

	  .df-review-item-header-actions {
	    display: inline-flex;
	    align-items: center;
	    justify-content: flex-end;
	    gap: 2px;
	    cursor: auto;
	  }

  .df-review-item-delete,
  .df-review-item-edit,
  .df-review-item-link-copy,
  .df-review-item-prompt-copy,
  .df-review-item-visibility {
    display: inline-grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
    text-decoration: none;
    transition: border-color 140ms ease, background 140ms ease, color 140ms ease;
  }

  .df-review-item-visibility:hover,
  .df-review-item-edit:hover,
  .df-review-item-link-copy:hover,
  .df-review-item-prompt-copy:hover {
    border-color: rgba(124, 199, 255, 0.34);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
  }

  .df-review-item-delete:hover {
    border-color: rgba(255, 143, 97, 0.34);
    color: var(--df-review-danger);
    background: var(--df-review-danger-soft);
  }

  .df-review-item-visibility.is-visible {
    color: var(--df-review-accent);
  }

  .df-review-item-visibility.is-hidden {
    opacity: 0.7;
    color: var(--df-review-subtle);
  }

  .df-review-item-link-copy.is-copied,
  .df-review-item-prompt-copy.is-copied {
    color: var(--df-review-accent);
  }

  .df-review-item-delete svg,
  .df-review-item-edit svg,
  .df-review-item-link-copy svg,
  .df-review-item-prompt-copy svg,
  .df-review-item-visibility svg {
    width: 14px;
    height: 14px;
  }

				  .df-review-item-actions {
				    display: grid;
				    grid-template-columns: auto minmax(0, 1fr) auto;
			    align-items: center;
			    gap: 6px;
			    min-width: 0;
			    margin-top: 2px;
			  }

			  .df-review-item-status-actions {
			    display: inline-flex;
			    grid-column: 1;
			    align-items: center;
			    min-width: 0;
		    cursor: auto;
			  }

			  .df-review-item-prompt-actions {
			    display: inline-flex;
			    grid-column: 2;
			    align-items: center;
			    justify-self: end;
			    min-width: 0;
		    cursor: auto;
			  }

			  .df-review-item-remote-actions {
			    display: inline-flex;
			    grid-column: 3;
			    align-items: center;
			    justify-content: flex-end;
			    justify-self: end;
			    gap: 6px;
			    min-width: 0;
		    cursor: auto;
			  }

  .df-review-item-action-button {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 32px;
    min-width: 32px;
    height: 30px;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: var(--df-review-control);
  }

	  .df-review-item-action-button:hover:not(:disabled) {
	    border-color: rgba(124, 199, 255, 0.42);
	    color: var(--df-review-text);
	    background: var(--df-review-control-hover);
	  }

			  .df-review-item-actions .df-review-item-submit-button {
			    display: inline-flex;
			    align-items: center;
			    gap: 6px;
			    min-height: 30px;
			    height: 30px;
			    width: auto;
			    min-width: 0;
			    border-radius: var(--df-review-radius-sm);
			    padding: 0 11px;
		    border-color: var(--df-review-line);
		    background: var(--df-review-control);
		    color: var(--df-review-text);
		  }

		  .df-review-item-submit-button span {
		    font-size: var(--df-review-font-size-xs);
		    font-weight: 500;
		    line-height: 1;
		    text-transform: none;
		    white-space: nowrap;
		  }

	  .df-review-item-actions .df-review-item-submit-button:hover:not(:disabled) {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-accent-hover);
	    color: var(--df-review-text);
	  }

  .df-review-item-action-button:disabled {
    cursor: default;
    opacity: 0.45;
  }

  .df-review-item-action-button svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

`;
