// Separate ordered fragments retain their original cascade positions.
export const overlayMarkersStyle = `    .dfwr-marker-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }

    .dfwr-area-preview-layer {
      display: contents;
    }

    .dfwr-review-canvas {
      position: fixed;
      display: block;
      z-index: 3;
      pointer-events: none;
      touch-action: none;
    }

    .dfwr-review-canvas.is-drawing {
      cursor: crosshair;
      pointer-events: auto;
    }

    .dfwr-area-annotation-toolbar {
      position: fixed;
      z-index: 5;
      display: flex;
      padding: 3px;
      transform: translateX(-100%);
      border: 1px solid var(--df-review-color-border);
      border-radius: var(--df-review-radius-sm);
      background: var(--df-review-color-panel);
      box-shadow: var(--df-review-shadow-popover);
      pointer-events: auto;
    }

    .dfwr-area-annotation-toolbar button {
      appearance: none;
      width: 28px;
      height: 26px;
      padding: 0;
      border: 1px solid var(--df-review-color-border-strong);
      border-radius: var(--df-review-radius-xs);
      color: var(--df-review-color-text);
      background: var(--df-review-color-control);
      cursor: pointer;
      font: inherit;
      font-size: var(--df-review-font-size-xs);
    }

    .dfwr-area-annotation-toolbar button:hover,
    .dfwr-area-annotation-toolbar button:focus-visible,
    .dfwr-area-annotation-toolbar button.is-active {
      border-color: #8b5cf6;
      background: rgba(139, 92, 246, 0.16);
      outline: none;
    }

    .dfwr-area-annotation-rectangle-icon {
      position: relative;
      display: block;
      width: 14px;
      height: 14px;
      margin: auto;
    }

    .dfwr-area-annotation-rectangle-icon span {
      position: absolute;
      width: 5px;
      height: 5px;
      border-color: #8b5cf6;
      border-style: solid;
      border-width: 0;
    }

    .dfwr-area-annotation-rectangle-icon span:nth-child(1) {
      top: 0;
      left: 0;
      border-top-width: 1.5px;
      border-left-width: 1.5px;
    }

    .dfwr-area-annotation-rectangle-icon span:nth-child(2) {
      top: 0;
      right: 0;
      border-top-width: 1.5px;
      border-right-width: 1.5px;
    }

    .dfwr-area-annotation-rectangle-icon span:nth-child(3) {
      bottom: 0;
      left: 0;
      border-bottom-width: 1.5px;
      border-left-width: 1.5px;
    }

    .dfwr-area-annotation-rectangle-icon span:nth-child(4) {
      right: 0;
      bottom: 0;
      border-right-width: 1.5px;
      border-bottom-width: 1.5px;
    }

    .dfwr-area-annotation-clear-icon {
      position: relative;
      display: block;
      width: 14px;
      height: 14px;
      margin: auto;
    }

    .dfwr-area-annotation-clear-icon::before,
    .dfwr-area-annotation-clear-icon::after {
      position: absolute;
      top: 6px;
      left: 1px;
      width: 12px;
      border-top: 1.5px solid currentColor;
      content: '';
    }

    .dfwr-area-annotation-clear-icon::before {
      transform: rotate(45deg);
    }

    .dfwr-area-annotation-clear-icon::after {
      transform: rotate(-45deg);
    }

    .dfwr-dom-hover {
      position: fixed;
      z-index: 2;
      border: 1px solid #7cc7ff;
      border-radius: var(--df-review-radius-xs);
      background: rgba(124, 199, 255, 0.1);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.72),
        0 0 0 9999px rgba(0, 0, 0, 0.08);
      pointer-events: none;
    }

    .dfwr-dom-hover[hidden] {
      display: none;
    }

    .dfwr-bound-marker,
    .dfwr-item-scope {
      --dfwr-scope: #7cc7ff;
      --dfwr-scope-rgb: 124, 199, 255;
    }

    .dfwr-bound-marker.is-scope-tablet,
    .dfwr-item-scope.is-scope-tablet {
      --dfwr-scope: #63d7c7;
      --dfwr-scope-rgb: 99, 215, 199;
    }

    .dfwr-bound-marker.is-scope-desktop,
    .dfwr-item-scope.is-scope-desktop {
      --dfwr-scope: #f3b75f;
      --dfwr-scope-rgb: 243, 183, 95;
    }

    .dfwr-bound-marker.is-scope-wide,
    .dfwr-item-scope.is-scope-wide {
      --dfwr-scope: #c99cff;
      --dfwr-scope-rgb: 201, 156, 255;
    }

    .dfwr-bound-marker.is-scope-dom,
    .dfwr-item-scope.is-scope-dom {
      --dfwr-scope: #ff8f61;
      --dfwr-scope-rgb: 255, 143, 97;
    }

    .dfwr-item-target-label {
      --dfwr-item-color: #7cc7ff;
      --dfwr-item-color-rgb: 124, 199, 255;
    }

    .dfwr-item-target-label.is-mode-area {
      --dfwr-item-color: #63d7c7;
      --dfwr-item-color-rgb: 99, 215, 199;
    }

    .dfwr-item-target-label.is-mode-dom {
      --dfwr-item-color: #ff8f61;
      --dfwr-item-color-rgb: 255, 143, 97;
    }

    .dfwr-item-target-label.is-scope-mobile {
      --dfwr-item-color: #7cc7ff;
      --dfwr-item-color-rgb: 124, 199, 255;
    }

    .dfwr-item-target-label.is-scope-tablet {
      --dfwr-item-color: #63d7c7;
      --dfwr-item-color-rgb: 99, 215, 199;
    }

    .dfwr-item-target-label.is-scope-desktop {
      --dfwr-item-color: #f3b75f;
      --dfwr-item-color-rgb: 243, 183, 95;
    }

    .dfwr-item-target-label.is-scope-wide {
      --dfwr-item-color: #c99cff;
      --dfwr-item-color-rgb: 201, 156, 255;
    }

    .dfwr-item-target-label.is-scope-dom {
      --dfwr-item-color: #ff8f61;
      --dfwr-item-color-rgb: 255, 143, 97;
    }

    .dfwr-item-target-label {
      position: fixed;
      z-index: 3;
      display: inline-flex;
      align-items: center;
      min-width: 24px;
      height: 20px;
      padding: 0 7px;
      border: 1px solid var(--dfwr-item-color);
      border-radius: 4px;
      background: var(--dfwr-item-color);
      box-shadow:
        0 0 0 3px rgba(var(--dfwr-item-color-rgb), 0.2),
        0 8px 18px rgba(0, 0, 0, 0.28);
      color: #111820;
      font-size: var(--df-review-font-size-2xs);
      font-weight: var(--df-review-font-weight-emphasis);
      line-height: 1;
      pointer-events: none;
    }

    .dfwr-item-target-label.is-highlighted {
      animation: dfwr-selected-blink 1000ms ease-in-out infinite;
    }

    .dfwr-bound-marker {
      position: fixed;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-width: 28px;
      height: 22px;
      padding: 0 6px;
      transform: translate(-50%, -50%);
      border: 1px solid var(--dfwr-scope);
      border-radius: var(--df-review-radius-pill);
      background: var(--df-review-color-panel);
      box-shadow: 0 0 0 4px rgba(var(--dfwr-scope-rgb), 0.18);
      color: var(--dfwr-scope);
      font-size: var(--df-review-font-size-2xs);
      font-weight: var(--df-review-font-weight-emphasis);
    }

    .dfwr-bound-marker.is-highlighted {
      min-width: 32px;
      height: 26px;
      border-width: 2px;
      box-shadow:
        0 0 0 5px rgba(var(--dfwr-scope-rgb), 0.22),
        0 12px 26px rgba(0, 0, 0, 0.34);
      animation: dfwr-selected-blink 1000ms ease-in-out infinite;
    }

    .dfwr-bound-marker.is-fallback {
      border-style: dashed;
    }

    .dfwr-area-preview-layer .dfwr-bound-marker {
      border-color: #7cc7ff;
      background: var(--df-review-color-panel);
      box-shadow:
        0 0 0 5px rgba(124, 199, 255, 0.2),
        0 12px 26px rgba(0, 0, 0, 0.3);
      color: #7cc7ff;
    }

    .dfwr-bound-marker-icon {
      position: relative;
      display: inline-block;
      width: 10px;
      height: 10px;
      flex: 0 0 auto;
    }

    .dfwr-bound-marker-icon::before,
    .dfwr-bound-marker-icon::after {
      content: "";
      position: absolute;
      display: block;
    }

    .dfwr-bound-marker-icon::before {
      inset: 1px 2px;
      border: 1.5px solid currentColor;
      border-radius: 2px;
    }

    .dfwr-bound-marker.is-scope-mobile .dfwr-bound-marker-icon::before {
      inset: 0 2.5px;
      border-radius: 2px;
    }

    .dfwr-bound-marker.is-scope-tablet .dfwr-bound-marker-icon::before {
      inset: 0.5px 1.5px;
      border-radius: 2px;
    }

    .dfwr-bound-marker.is-scope-desktop .dfwr-bound-marker-icon::before {
      inset: 1px 0 3px;
      border-radius: 1px;
    }

    .dfwr-bound-marker.is-scope-desktop .dfwr-bound-marker-icon::after {
      left: 3px;
      right: 3px;
      bottom: 0;
      height: 1.5px;
      background: currentColor;
    }

    .dfwr-bound-marker.is-scope-wide .dfwr-bound-marker-icon::before {
      inset: 2px 0;
      border-radius: 1px;
    }

    .dfwr-bound-marker.is-scope-dom .dfwr-bound-marker-icon::before {
      inset: 2px;
      border-radius: 1px;
      transform: rotate(45deg);
    }

    .dfwr-bound-marker-number {
      min-width: 6px;
      text-align: center;
      line-height: 1;
    }

`;

export const overlayMarkerAnimationsStyle = `    @keyframes dfwr-marker-pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.92);
      }
      45% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes dfwr-selected-blink {
      0%,
      100% {
        opacity: 0.78;
      }
      50% {
        opacity: 1;
      }
    }

`;
