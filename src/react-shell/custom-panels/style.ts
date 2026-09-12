export const reviewShellCustomPanelStyle = `
  .df-review-custom-panel-host { display: contents; }
  .df-review-custom-panel {
    grid-column: 2;
    grid-row: 1 / span 3;
    position: relative;
    z-index: 900;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    border-left: 1px solid var(--df-review-line-soft);
    background: var(--df-review-panel);
  }
  .df-review-custom-panel[hidden] { display: none; }

`;
