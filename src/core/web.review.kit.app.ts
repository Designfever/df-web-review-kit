import { localAdapter } from '../adapters/local';
import type {
  DomAnchor,
  ReviewItem,
  ReviewMarker,
  ReviewMode,
  ReviewPoint,
  ReviewSelection,
  WebReviewKitAdapter,
  WebReviewKitController,
  WebReviewKitOptions,
} from '../types';
import {
  cssEscape,
  getDomAnchor,
  getDomAnchorFromElement,
  getDomAnchorFromPoint,
  getElementViewportSelection,
  getRelativePoint,
  getRelativeSelection,
} from './dom.anchor';
import {
  createId,
} from './id';
import {
  clampPoint,
  getPointSelection,
  getSelectionCenter,
  getViewportSize,
  roundPoint,
  toPublicSelection,
  type ReviewEnvironment,
  type ViewportSelection,
} from './geometry';
import { isHotkey } from './hotkey';
import {
  getOriginalUrl,
  getPageUrl,
  getRouteKey,
} from './location';
import { getReviewViewportScope } from './review/scope';
import { createSelectionCenterMarker } from './review/item';
import type {
  AreaDraft,
  NoteDraft,
  ReviewDraftPreviewElement,
} from './review/draft';
import {
  runWithAutoScrollBehavior,
  setDocumentScrollInstantly,
  waitForNextFrame,
} from './scroll';
import {
  WebReviewKitView,
  type CreateReviewItemInput,
} from './web.review.kit.view';

const ROOT_ID = 'df-web-review-kit-root';

function isEditableEventTarget(event: KeyboardEvent) {
  const path = event.composedPath?.() ?? [];
  const element = (path[0] ?? event.target) as HTMLElement | null;
  if (!element || typeof element.tagName !== 'string') return false;

  const tag = element.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    element.isContentEditable === true
  );
}

/** Creates the vanilla runtime controller that mounts review overlays on a target page. */
export function createWebReviewKit(
  options: WebReviewKitOptions
): WebReviewKitController {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return createNoopController();
  }

  const app = new WebReviewKitApp(options);
  app.mount();

  return {
    open: () => app.open(),
    close: () => app.close(),
    toggle: () => app.toggle(),
    setMode: (mode) => app.setMode(mode),
    startElementReview: (element, comment) =>
      app.startElementReview(element, comment),
    getMode: () => app.getMode(),
    highlightItem: (itemId) => app.highlightItem(itemId),
    setHiddenItemIds: (itemIds) => app.setHiddenItemIds(itemIds),
    reload: () => app.reload(),
    getItems: () => app.getItems(),
    destroy: () => app.destroy(),
  };
}

class WebReviewKitApp {
  private readonly adapter: WebReviewKitAdapter;
  private readonly hotkey: string;
  private readonly view: WebReviewKitView;
  private root?: HTMLDivElement;
  private shadow?: ShadowRoot;
  private isOpen = false;
  private mode: ReviewMode = 'idle';
  private items: ReviewItem[] = [];
  private noteDraft?: NoteDraft;
  private areaDraft?: AreaDraft;
  private isSelectingArea = false;
  private highlightedItemId?: string;
  private hiddenItemIds?: Set<string>;
  private renderFrame?: number;

  constructor(private readonly options: WebReviewKitOptions) {
    this.adapter = options.adapter ?? localAdapter();
    this.hotkey = options.hotkeys?.qa ?? 'Shift+Q';
    this.view = new WebReviewKitView({
      options,
      getState: () => ({
        isOpen: this.isOpen,
        mode: this.mode,
        items: this.items,
        noteDraft: this.noteDraft,
        areaDraft: this.areaDraft,
        isSelectingArea: this.isSelectingArea,
        highlightedItemId: this.highlightedItemId,
      }),
      getEnvironment: () => this.getEnvironment(),
      actions: {
        close: () => this.close(),
        render: () => this.render(),
        reload: () => this.reload(),
        restoreItem: (item) => this.restoreItem(item),
        removeItem: (itemId) => this.adapter.remove(itemId),
        setModeState: (mode) => this.setModeState(mode),
        clearDrafts: () => {
          this.noteDraft = undefined;
          this.areaDraft = undefined;
        },
        setNoteDraft: (draft) => {
          this.noteDraft = draft;
        },
        setAreaDraft: (draft) => {
          this.areaDraft = draft;
        },
        setSelectingArea: (isSelectingArea) => {
          this.isSelectingArea = isSelectingArea;
        },
        createItem: (input) => this.createItem(input),
        bindNoteDraftToPoint: (point, comment) =>
          this.bindNoteDraftToPoint(point, comment),
        bindElementDraftToPoint: (point, comment) =>
          this.bindElementDraftToPoint(point, comment),
        createAreaDraft: (selection) => this.createAreaDraft(selection),
      },
    });
  }

  mount() {
    if (this.root) return;

    const existing = document.getElementById(ROOT_ID);
    if (existing) existing.remove();

    this.root = document.createElement('div');
    this.root.id = ROOT_ID;
    this.root.style.display = 'contents';

    this.shadow = this.root.attachShadow({ mode: 'open' });
    document.body.appendChild(this.root);
    document.addEventListener('keydown', this.handleKeyDown, true);
    window.addEventListener('scroll', this.handleViewportChange, true);
    window.addEventListener('resize', this.handleViewportChange);

    this.render();
  }

  destroy() {
    this.view.clearDraftPreview();
    document.removeEventListener('keydown', this.handleKeyDown, true);
    window.removeEventListener('scroll', this.handleViewportChange, true);
    window.removeEventListener('resize', this.handleViewportChange);
    if (this.renderFrame) {
      window.cancelAnimationFrame(this.renderFrame);
      this.renderFrame = undefined;
    }
    this.root?.remove();
    this.root = undefined;
    this.shadow = undefined;
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    void this.reload();
  }

  close() {
    this.isOpen = false;
    this.setModeState('idle');
    this.noteDraft = undefined;
    this.areaDraft = undefined;
    this.isSelectingArea = false;
    this.render();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
      return;
    }

    this.open();
  }

  setMode(mode: ReviewMode) {
    if (!this.isOpen) {
      this.isOpen = true;
    }

    this.setModeState(this.mode === mode ? 'idle' : mode);
    this.noteDraft = undefined;
    this.areaDraft = undefined;
    this.render();
  }

  async startElementReview(element: Element, comment?: string) {
    if (!this.isOpen) {
      this.isOpen = true;
    }

    this.setModeState('element');
    this.noteDraft = undefined;
    this.areaDraft = undefined;
    this.isSelectingArea = false;
    await this.bindElementDraftToElement(element, comment);
  }

  getMode() {
    return this.mode;
  }

  getItems() {
    return this.items;
  }

  highlightItem(itemId?: string) {
    if (!itemId) {
      this.clearHighlightedItem();
      return;
    }

    if (!this.isOpen) {
      this.isOpen = true;
    }

    this.highlightedItemId = itemId;
    this.render();
  }

  setHiddenItemIds(itemIds?: string[]) {
    this.hiddenItemIds = itemIds ? new Set(itemIds) : undefined;
    this.updateHiddenItemsStyle();
  }

  private clearHighlightedItem() {
    if (!this.highlightedItemId) return;

    this.highlightedItemId = undefined;
    this.render();
  }

  private createHiddenItemsStyleElement() {
    const style = document.createElement('style');
    style.dataset.dfwrHiddenItems = 'true';
    style.textContent = this.getHiddenItemsCss();
    return style;
  }

  private updateHiddenItemsStyle() {
    if (!this.shadow) return;

    let style = this.shadow.querySelector<HTMLStyleElement>(
      'style[data-dfwr-hidden-items="true"]'
    );
    if (!style) {
      style = this.createHiddenItemsStyleElement();
      this.shadow.prepend(style);
      return;
    }

    style.textContent = this.getHiddenItemsCss();
  }

  private getHiddenItemsCss() {
    if (!this.hiddenItemIds?.size) return '';

    return Array.from(this.hiddenItemIds)
      .map(
        (itemId) =>
          `[data-review-item-id="${cssEscape(itemId)}"] { display: none !important; }`
      )
      .join('\n');
  }

  private setModeState(mode: ReviewMode) {
    if (this.mode === mode) return;

    this.mode = mode;
    this.options.onModeChange?.(mode);
  }

  private cancelMode() {
    if (
      this.mode === 'idle' &&
      !this.noteDraft &&
      !this.areaDraft &&
      !this.isSelectingArea
    ) {
      return false;
    }

    this.setModeState('idle');
    this.noteDraft = undefined;
    this.areaDraft = undefined;
    this.isSelectingArea = false;
    this.render();
    return true;
  }

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.cancelMode()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (isEditableEventTarget(event) || !isHotkey(event, this.hotkey)) return;

    event.preventDefault();
    event.stopPropagation();
    this.toggle();
  };

  private readonly handleViewportChange = () => {
    if (!this.isOpen || this.renderFrame) return;

    this.renderFrame = window.requestAnimationFrame(() => {
      this.renderFrame = undefined;
      this.render();
    });
  };

  private getEnvironment(): ReviewEnvironment | undefined {
    const target =
      typeof this.options.target === 'function'
        ? this.options.target()
        : this.options.target;

    if (!target) {
      return {
        window,
        document,
        viewportRect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        },
        overlayRect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };
    }

    try {
      const rect = target.getViewportRect?.() ?? {
        left: 0,
        top: 0,
        width: target.window.innerWidth,
        height: target.window.innerHeight,
      };
      const overlayRect = target.getOverlayRect?.() ?? rect;

      return {
        window: target.window,
        document: target.document,
        viewportRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        overlayRect: {
          left: overlayRect.left,
          top: overlayRect.top,
          width: overlayRect.width,
          height: overlayRect.height,
        },
      };
    } catch {
      return undefined;
    }
  }

  async reload() {
    const environment = this.getEnvironment();
    if (!environment) return this.items;

    this.items = await this.adapter.list({
      projectId: this.options.projectId,
      routeKey: getRouteKey(environment),
    });
    this.options.onItemsChange?.(this.items);
    if (this.isOpen) {
      this.render();
    }
    return this.items;
  }

  private render() {
    if (!this.shadow) return;

    this.view.render(this.shadow, this.createHiddenItemsStyleElement());
  }

  private async bindNoteDraftToPoint(point: ReviewPoint, comment?: string) {
    const environment = this.getEnvironment();
    if (!environment) return;

    const viewport = getViewportSize(environment);
    const nextPoint = clampPoint(point, environment);

    const draft = await this.withOverlayHidden(() => {
      const selection = getPointSelection(nextPoint);
      const anchor = getDomAnchor(
        selection,
        this.options.anchors?.attribute,
        environment
      );
      const marker: ReviewMarker = {
        viewport: roundPoint(nextPoint),
        relative: anchor
          ? getRelativePoint(nextPoint, anchor, environment)
          : undefined,
      };

      return {
        viewport,
        anchor,
        marker,
        comment,
      };
    });

    this.noteDraft = draft;
    this.render();
  }

  private async bindElementDraftToPoint(point: ReviewPoint, comment?: string) {
    const environment = this.getEnvironment();
    if (!environment) return;

    const viewport = getViewportSize(environment);
    const nextPoint = clampPoint(point, environment);

    const draft = await this.withOverlayHidden(() => {
      const pointSelection = getPointSelection(nextPoint);
      const targetElement = environment.document.elementFromPoint(
        nextPoint.x,
        nextPoint.y
      );
      const previewElement =
        targetElement && 'style' in targetElement
          ? (targetElement as ReviewDraftPreviewElement)
          : undefined;
      const targetRect = targetElement?.getBoundingClientRect();
      const clickedSelection =
        targetRect && targetRect.width > 0 && targetRect.height > 0
          ? {
              left: targetRect.left,
              top: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
            }
          : undefined;
      const anchor = getDomAnchorFromPoint(
        nextPoint,
        this.options.anchors?.attribute,
        environment
      );
      const elementSelection = anchor
        ? (clickedSelection ??
          getElementViewportSelection(anchor, environment, pointSelection))
        : undefined;
      const selection = elementSelection ?? pointSelection;
      const markerPoint = elementSelection
        ? { x: selection.left, y: selection.top }
        : getSelectionCenter(selection);
      const reviewSelection = elementSelection
        ? {
            viewport: toPublicSelection(elementSelection),
            relative: getRelativeSelection(
              elementSelection,
              anchor as DomAnchor,
              environment
            ),
          }
        : undefined;
      const marker: ReviewMarker = {
        viewport: roundPoint(markerPoint),
        relative: anchor
          ? getRelativePoint(markerPoint, anchor, environment)
          : undefined,
      };

      return {
        viewport,
        anchor,
        marker,
        selection: reviewSelection,
        comment,
        previewElement,
      };
    });

    this.noteDraft = draft;
    this.render();
  }

  private async bindElementDraftToElement(
    element: Element,
    comment?: string
  ) {
    const environment = this.getEnvironment();
    if (!environment || element.ownerDocument !== environment.document) return;

    const viewport = getViewportSize(environment);

    const draft = await this.withOverlayHidden(() => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return undefined;

      const selection: ViewportSelection = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
      const anchor = getDomAnchorFromElement(
        element,
        this.options.anchors?.attribute,
        environment
      );
      const markerPoint = { x: selection.left, y: selection.top };
      const marker: ReviewMarker = {
        viewport: roundPoint(markerPoint),
        relative: anchor
          ? getRelativePoint(markerPoint, anchor, environment)
          : undefined,
      };
      const reviewSelection: ReviewSelection = {
        viewport: toPublicSelection(selection),
        relative: anchor
          ? getRelativeSelection(selection, anchor, environment)
          : undefined,
      };
      const previewElement =
        'style' in element ? (element as ReviewDraftPreviewElement) : undefined;

      return {
        viewport,
        anchor,
        marker,
        selection: reviewSelection,
        comment,
        previewElement,
      };
    });

    if (!draft) return;

    this.noteDraft = draft;
    this.render();
  }

  private async createAreaDraft(selection: ViewportSelection) {
    const environment = this.getEnvironment();
    if (!environment) return;

    const viewport = getViewportSize(environment);

    this.areaDraft = await this.withOverlayHidden(() => {
      const marker = createSelectionCenterMarker(
        selection,
        undefined,
        environment
      );
      const reviewSelection: ReviewSelection = {
        viewport: toPublicSelection(selection),
      };

      return {
        viewport,
        marker,
        selection: reviewSelection,
      };
    });
    this.isSelectingArea = false;
    this.setModeState('area');
    this.render();
  }

  private async withOverlayHidden<T>(callback: () => Promise<T> | T) {
    if (!this.root) return callback();

    const previousDisplay = this.root.style.display;
    this.root.style.display = 'none';

    try {
      // Hide our own overlay while sampling elementFromPoint so we anchor to the page.
      return await callback();
    } finally {
      this.root.style.display = previousDisplay;
    }
  }

  private async createItem(input: CreateReviewItemInput) {
    const environment = this.getEnvironment();
    if (!environment) return;

    const now = new Date().toISOString();
    const routeKey = getRouteKey(environment);
    const viewport = input.viewport ?? getViewportSize(environment);
    const createdBy = this.options.userId?.trim();
    const item: ReviewItem = {
      id: createId(),
      projectId: this.options.projectId,
      routeKey,
      pageUrl: getPageUrl(environment),
      originalUrl: getOriginalUrl(environment),
      normalizedPath: routeKey,
      scope:
        input.scope ??
        getReviewViewportScope(viewport, this.options.viewports?.presets),
      kind: input.kind,
      title: input.comment.split('\n')[0]?.slice(0, 80),
      comment: input.comment,
      createdBy: createdBy || undefined,
      status: 'todo',
      viewport,
      devicePixelRatio: environment.window.devicePixelRatio || 1,
      scroll: {
        x: environment.window.scrollX,
        y: environment.window.scrollY,
      },
      anchor: input.anchor,
      marker: input.marker,
      selection: input.selection,
      createdAt: now,
      updatedAt: now,
    };

    const createdItem = await this.adapter.create(item);
    this.setModeState('idle');
    this.noteDraft = undefined;
    this.areaDraft = undefined;
    this.highlightItem(createdItem.id);
    await this.reload();
    await this.options.onCreateItem?.(createdItem);
  }

  private async restoreItem(item: ReviewItem) {
    this.setModeState('idle');
    this.noteDraft = undefined;
    this.areaDraft = undefined;

    if (this.options.onRestoreItem) {
      await this.options.onRestoreItem(item);
      return;
    }

    const environment = this.getEnvironment();
    if (!environment) return;

    const scroll = item.scroll;
    if (scroll) {
      runWithAutoScrollBehavior(environment.document, () => {
        setDocumentScrollInstantly(environment, scroll);
      });
      await waitForNextFrame(environment);
    }

    this.highlightItem(item.id);
    this.render();
  }
}

function createNoopController(): WebReviewKitController {
  return {
    open() {},
    close() {},
    toggle() {},
    setMode() {},
    async startElementReview() {},
    getMode() {
      return 'idle';
    },
    highlightItem() {},
    setHiddenItemIds() {},
    async reload() {
      return [];
    },
    getItems() {
      return [];
    },
    destroy() {},
  };
}
