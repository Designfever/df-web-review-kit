export const reviewShellImprovementsStyle = `
  .df-review-improvements-panel {
    grid-column: 2;
    grid-row: 1 / span 3;
    position: relative;
    z-index: 880;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-left: 1px solid var(--df-review-line-soft);
    color: var(--df-review-text);
    background: linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
  }

  .df-review-shell:not(.is-list-visible) .df-review-improvements-panel,
  .df-review-improvements-panel[aria-hidden='true'] {
    visibility: hidden;
    border-left: 0;
    pointer-events: none;
  }

  .df-review-improvements-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--df-review-space-3);
    min-height: 65px;
    padding: var(--df-review-space-3) var(--df-review-space-4);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-card);
  }

  .df-review-improvements-header > div {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .df-review-improvements-header strong {
    font-size: var(--df-review-font-size-md);
    font-weight: var(--df-review-font-weight-emphasis);
  }

  .df-review-improvements-header span {
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
  }

  .df-review-improvements-header button,
  .df-review-improvements-attachment li button {
    display: inline-grid;
    place-items: center;
    width: 30px;
    min-width: 30px;
    height: 30px;
    border: 0;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
  }

  .df-review-improvements-header button:hover,
  .df-review-improvements-attachment li button:hover {
    color: var(--df-review-text);
    background: var(--df-review-card-hover);
  }

  .df-review-improvements-header svg,
  .df-review-improvements-attachment li svg {
    width: 16px;
    height: 16px;
  }

  .df-review-improvements-form {
    display: flex;
    flex-direction: column;
    gap: var(--df-review-space-4);
    min-height: 0;
    padding: var(--df-review-space-4);
    overflow-y: auto;
  }

  .df-review-improvements-intro {
    margin: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    line-height: 1.6;
  }

  .df-review-improvements-form label,
  .df-review-improvements-attachment {
    display: grid;
    gap: var(--df-review-space-2);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
  }

  .df-review-improvements-form label > span,
  .df-review-improvements-attachment > span {
    color: var(--df-review-text);
    font-weight: var(--df-review-font-weight-emphasis);
  }

  .df-review-improvements-form em {
    margin-left: 4px;
    color: var(--df-review-accent);
    font-size: var(--df-review-font-size-2xs);
    font-style: normal;
  }

  .df-review-improvements-form input,
  .df-review-improvements-form select,
  .df-review-improvements-form textarea {
    width: 100%;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    color: var(--df-review-text);
    background: var(--df-review-control);
    outline: 0;
  }

  .df-review-improvements-form input,
  .df-review-improvements-form select {
    height: 38px;
    padding: 0 10px;
  }

  .df-review-improvements-form select {
    appearance: none;
    padding-right: 32px;
    background-image: var(--df-review-select-chevron);
    background-position: right 9px center;
    background-repeat: no-repeat;
    background-size: 15px;
  }

  .df-review-improvements-form textarea {
    min-height: 132px;
    resize: vertical;
    padding: 10px;
    line-height: 1.55;
  }

  .df-review-improvements-form input:focus,
  .df-review-improvements-form select:focus,
  .df-review-improvements-form textarea:focus {
    border-color: var(--df-review-accent);
    box-shadow: 0 0 0 3px var(--df-review-accent-soft);
  }

  .df-review-improvements-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--df-review-space-3);
  }

  .df-review-improvements-file-button,
  .df-review-improvements-form footer button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 36px;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 12px;
    color: var(--df-review-text);
    background: var(--df-review-control);
  }

  .df-review-improvements-file-button {
    width: fit-content;
  }

  .df-review-improvements-file-button svg,
  .df-review-improvements-form footer svg,
  .df-review-improvements-success svg {
    width: 15px;
    height: 15px;
  }

  .df-review-improvements-attachment ul {
    display: grid;
    gap: 5px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .df-review-improvements-attachment li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 4px 4px 4px 9px;
    background: var(--df-review-card);
  }

  .df-review-improvements-attachment li span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-improvements-attachment small,
  .df-review-improvements-context span {
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-2xs);
  }

  .df-review-improvements-context {
    display: grid;
    gap: 5px;
    min-width: 0;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 9px 10px;
    background: var(--df-review-card);
  }

  .df-review-improvements-context code {
    min-width: 0;
    overflow: hidden;
    color: var(--df-review-muted);
    font-family: inherit;
    font-size: var(--df-review-font-size-2xs);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-improvements-error,
  .df-review-improvements-success {
    margin: 0;
    border-radius: var(--df-review-radius-sm);
    padding: 10px;
    font-size: var(--df-review-font-size-xs);
    line-height: 1.45;
  }

  .df-review-improvements-error {
    border: 1px solid var(--df-review-danger);
    color: var(--df-review-danger);
    background: var(--df-review-danger-soft);
  }

  .df-review-improvements-success {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 7px;
    border: 1px solid var(--df-review-area);
    color: var(--df-review-area);
    background: var(--df-review-area-soft);
  }

  .df-review-improvements-success a {
    grid-column: 2;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    width: fit-content;
    color: inherit;
  }

  .df-review-improvements-form footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--df-review-space-2);
    margin-top: auto;
    padding-top: var(--df-review-space-2);
  }

  .df-review-improvements-form footer button.is-primary {
    border-color: var(--df-review-accent);
    color: var(--df-review-accent-contrast);
    background: var(--df-review-accent);
  }

  .df-review-improvements-form button:disabled {
    cursor: default;
    opacity: 0.45;
  }

  .df-review-improvements-form .is-spinning {
    animation: df-review-spinner-spin 760ms linear infinite;
  }

  @media (max-width: 560px) {
    .df-review-improvements-row {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;
