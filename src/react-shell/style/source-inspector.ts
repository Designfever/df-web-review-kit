export const reviewShellSourceInspectorStyle = `
  .df-review-source-outline {
    position: fixed;
    z-index: 880;
    pointer-events: none;
    border: 2px solid var(--df-review-dom);
    border-radius: 4px;
    box-shadow:
      0 0 0 1px rgba(15, 18, 24, 0.58),
      0 0 0 5px var(--df-review-dom-soft);
  }

  .df-review-source-outline.is-hover {
    border-width: 1px;
    border-color: var(--df-review-dom);
    opacity: 0.72;
    box-shadow: 0 0 0 1px rgba(15, 18, 24, 0.48);
  }

  .df-review-source-popup {
    position: fixed;
    z-index: 890;
    min-width: 200px;
    max-width: 320px;
    padding: 8px;
    display: grid;
    gap: 6px;
    border-radius: var(--df-review-radius-md);
    background: var(--df-review-panel);
    box-shadow: var(--df-review-shadow-panel);
    color: var(--df-review-text);
    font-size: 12px;
    line-height: 1.35;
  }

  .df-review-source-popup-divider {
    margin: 4px 0;
    border-top: 1px solid var(--df-review-dom-soft);
  }

  .df-review-source-popup-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 2px;
    max-height: 260px;
    overflow-y: auto;
  }

  .df-review-source-popup-entry {
    width: 100%;
    display: grid;
    gap: 1px;
    padding: 5px 7px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 140ms ease, border-color 140ms ease;
  }

  .df-review-source-popup-entry:hover,
  .df-review-source-popup-entry:focus-visible {
    outline: 0;
    background: var(--df-review-accent-soft);
    border-color: rgba(124, 199, 255, 0.2);
  }

  .df-review-source-popup-entry.is-selected {
    background: var(--df-review-dom-soft);
    border-color: var(--df-review-dom);
  }

  .df-review-source-popup-entry.is-data {
    color: var(--df-review-accent);
  }

  .df-review-source-popup-entry-label {
    color: inherit;
    font-weight: 500;
  }

  .df-review-source-popup-entry-path {
    color: var(--df-review-muted);
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-source-popup-entry.is-data
    .df-review-source-popup-entry-path {
    color: inherit;
    opacity: 0.72;
  }

`;
