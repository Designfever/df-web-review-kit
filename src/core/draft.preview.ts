import type { ReviewEnvironment } from './geometry';
import { toViewportSelection } from './geometry';
import { resolveAnchorElement } from './dom.anchor';
import type { DraftAdjustmentMetrics } from './draft.metrics';
import type { NoteDraft, ReviewDraftPreviewElement } from './review/draft';

interface DraftPreviewControllerConfig {
  getEnvironment: () => ReviewEnvironment | undefined;
  getMetrics: (draft: NoteDraft) => DraftAdjustmentMetrics;
  hasAdjustment: (draft: NoteDraft) => boolean;
}

interface DraftPreviewSnapshot {
  element: ReviewDraftPreviewElement;
  clone: ReviewDraftPreviewElement;
  visibility: string;
}

export class DraftPreviewController {
  private snapshot?: DraftPreviewSnapshot;

  constructor(private readonly config: DraftPreviewControllerConfig) {}

  clear() {
    if (!this.snapshot) return;

    const { element, clone, visibility } = this.snapshot;
    clone.remove();
    element.style.visibility = visibility;
    this.snapshot = undefined;
  }

  sync(draft?: NoteDraft) {
    const environment = this.config.getEnvironment();
    if (!draft || !environment || !this.config.hasAdjustment(draft)) {
      this.clear();
      return;
    }

    const element = this.getStyleableDraftElement(draft, environment);
    if (!element) {
      this.clear();
      return;
    }

    if (this.snapshot?.element !== element) {
      this.clear();
    }

    if (!this.snapshot) {
      const computedStyle = environment.window.getComputedStyle(element);
      const clone = element.cloneNode(true) as ReviewDraftPreviewElement;
      removeDuplicateIds(clone);
      copyComputedStyle(element, clone, environment);
      positionDraftPreviewClone(clone, element, computedStyle);
      environment.document.body?.appendChild(clone);
      this.snapshot = {
        element,
        clone,
        visibility: element.style.visibility,
      };
      element.style.visibility = 'hidden';
    }

    const metrics = this.config.getMetrics(draft);
    const translate = `translate(${toCssNumber(metrics.cssX)}px, ${toCssNumber(
      metrics.cssY
    )}px)`;
    const scale =
      metrics.scaleFactor === 1
        ? ''
        : `scale(${toCssNumber(metrics.scaleFactor)})`;
    this.snapshot.clone.style.transform = [translate, scale]
      .filter(Boolean)
      .join(' ');
  }

  private getStyleableDraftElement(
    draft: NoteDraft,
    environment: ReviewEnvironment
  ): ReviewDraftPreviewElement | undefined {
    if (
      draft.previewElement &&
      draft.previewElement.ownerDocument === environment.document &&
      'style' in draft.previewElement
    ) {
      return draft.previewElement;
    }

    if (!draft.anchor) return undefined;

    const preferredSelection = draft.selection
      ? toViewportSelection(draft.selection.viewport)
      : undefined;
    const element = resolveAnchorElement(
      draft.anchor,
      environment,
      preferredSelection
    )?.element;
    if (!element) return undefined;

    if ('style' in element) return element as ReviewDraftPreviewElement;

    return undefined;
  }
}

function positionDraftPreviewClone(
  clone: ReviewDraftPreviewElement,
  element: ReviewDraftPreviewElement,
  computedStyle: CSSStyleDeclaration
) {
  const rect = element.getBoundingClientRect();
  clone.setAttribute('data-dfwr-adjust-preview', 'true');
  clone.setAttribute('aria-hidden', 'true');
  clone.style.position = 'fixed';
  clone.style.left = `${toCssNumber(rect.left)}px`;
  clone.style.top = `${toCssNumber(rect.top)}px`;
  clone.style.right = 'auto';
  clone.style.bottom = 'auto';
  clone.style.width = `${toCssNumber(rect.width)}px`;
  clone.style.height = `${toCssNumber(rect.height)}px`;
  clone.style.maxWidth = 'none';
  clone.style.maxHeight = 'none';
  clone.style.margin = '0';
  clone.style.boxSizing = 'border-box';
  clone.style.display = getDraftPreviewDisplay(computedStyle.display);
  clone.style.zIndex = '2147483646';
  clone.style.pointerEvents = 'none';
  clone.style.transition = 'none';
  clone.style.willChange = 'transform';
  clone.style.transformOrigin = 'top left';
  clone.style.transform = 'none';
}

function getDraftPreviewDisplay(display: string) {
  if (display === 'inline' || display === 'contents') return 'inline-block';
  return display || 'block';
}

function copyComputedStyle(
  element: ReviewDraftPreviewElement,
  clone: ReviewDraftPreviewElement,
  environment: ReviewEnvironment
) {
  const computedStyle = environment.window.getComputedStyle(element);
  for (let index = 0; index < computedStyle.length; index += 1) {
    const property = computedStyle.item(index);
    clone.style.setProperty(
      property,
      computedStyle.getPropertyValue(property),
      computedStyle.getPropertyPriority(property)
    );
  }
}

function removeDuplicateIds(element: Element) {
  element.removeAttribute('id');
  element.querySelectorAll('[id]').forEach((child) => {
    child.removeAttribute('id');
  });
}

function toCssNumber(value: number) {
  return Math.round(value * 1000) / 1000;
}
