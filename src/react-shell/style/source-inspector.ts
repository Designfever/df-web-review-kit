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

`;
