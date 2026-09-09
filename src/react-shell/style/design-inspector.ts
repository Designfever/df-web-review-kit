export const reviewShellDesignInspectorStyle = `
  .df-review-design-inspector-panel {
    grid-column: 2;
    grid-row: 1 / span 3;
    position: relative;
    z-index: 600;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-left: 1px solid var(--df-review-line-soft);
    background: var(--df-review-panel);
    color: var(--df-review-text);
  }
  .df-review-design-inspector-host {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .df-review-design-inspector-panel > [role="alert"] {
    padding: 16px;
    font-size: 13px;
  }
`;
