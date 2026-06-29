export const reviewShellStageStyle = `
	  .df-review-stage {
	    grid-column: 1;
	    grid-row: 3;
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-frame {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    min-width: 0;
    min-height: 0;
  }

  .df-review-frame-actions {
    position: relative;
    z-index: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    padding: 8px 40px 10px;
    border-top: 1px solid var(--df-review-line-soft);
    background: var(--df-review-mode-bar);
  }

	  .df-review-frame-scroll {
	    min-width: 0;
	    min-height: 0;
	    overflow: auto;
	  }

	  .df-review-frame-canvas {
	    display: grid;
	    place-items: center;
	    width: max-content;
	    height: max-content;
	    min-width: 100%;
	    min-height: 100%;
	    padding: 34px 58px 12px 40px;
	  }

  .df-review-target-stack {
    display: grid;
    justify-items: start;
    gap: 8px;
    width: max-content;
    max-width: 100%;
  }

  .df-review-device {
	    box-sizing: border-box;
	    flex: 0 0 auto;
	    position: relative;
	    margin: 0;
	    overflow: hidden;
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-lg);
	    background: #fff;
	    box-shadow: var(--df-review-shadow-device);
  }

  .df-review-device iframe {
    display: block;
    width: inherit;
    height: inherit;
    min-width: inherit;
    min-height: inherit;
    border: 0;
    background: #fff;
  }

  .df-review-frame-link-stack {
    position: absolute;
    z-index: 14;
    top: 0;
    right: -44px;
    display: grid;
    gap: 8px;
  }

  .df-review-frame-link {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid rgba(15, 23, 42, 0.16);
    border-radius: var(--df-review-radius-md);
    color: #17202c;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.18);
    text-decoration: none;
    backdrop-filter: blur(8px);
    transition: transform 140ms ease, border-color 140ms ease, color 140ms ease,
      background 140ms ease;
  }

  .df-review-frame-link:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 102, 255, 0.42);
    color: #005be8;
    background: rgba(255, 255, 255, 0.98);
  }

  .df-review-frame-link svg {
    width: 18px;
    height: 18px;
  }

  .df-review-frame-link.is-target svg {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  .df-review-frame-link.is-figma svg {
    fill: currentColor;
    stroke: none;
  }
`;
