import { localAdapter } from '../adapters/local';
import type {
  DomAnchor,
  ReviewAttachment,
  ReviewItem,
  ReviewMarker,
  ReviewMode,
  ReviewPoint,
  ReviewSelection,
  RelativeSelection,
  ReviewViewportCaptureInput,
  ReviewViewportCaptureResult,
  WebReviewKitAdapter,
  WebReviewKitController,
  WebReviewKitOptions,
} from '../types';
import {
  cssEscape,
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
import { createSelectionStartMarker } from './review/item';
import type {
  AreaDraft,
  DomDraft,
  ReviewDraftAttachment,
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
const VIEWPORT_SCROLL_OPTIONS = { capture: true, passive: true } as const;

type DraftItemFields = Partial<
  Pick<ReviewItem, 'title' | 'comment' | 'assigneeId' | 'assigneeName'>
>;
type ElementDraftFields = DraftItemFields &
  Partial<Pick<DomDraft, 'adjustment' | 'isSelectionOnly'>>;

type CaptureDraftInput = Pick<
  AreaDraft,
  'marker' | 'selection' | 'viewport'
>;

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
    selectElement: (element) => app.selectElement(element),
    adjustElementSelection: (delta) => app.adjustElementSelection(delta),
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
  private domDraft?: DomDraft;
  private areaDraft?: AreaDraft;
  private draftError = '';
  private isCreatingItem = false;
  private isCapturingViewport = false;
  private isSelectingArea = false;
  private highlightedItemId?: string;
  private hiddenItemIds?: Set<string>;
  private renderFrame?: number;
  private targetViewportWindow?: Window;

  constructor(private readonly options: WebReviewKitOptions) {
    this.adapter = options.adapter ?? localAdapter();
    this.hotkey = options.hotkeys?.qa ?? 'Shift+Q';
    this.view = new WebReviewKitView({
      options,
      getState: () => ({
        isOpen: this.isOpen,
        mode: this.mode,
        items: this.items,
        domDraft: this.domDraft,
        areaDraft: this.areaDraft,
        draftError: this.draftError,
        isCreatingItem: this.isCreatingItem,
        isCapturingViewport: this.isCapturingViewport,
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
        clearDrafts: () => this.clearDrafts(),
        setDomDraft: (draft) => {
          this.domDraft = draft;
          this.draftError = '';
        },
        setAreaDraft: (draft) => {
          this.areaDraft = draft;
          this.draftError = '';
        },
        setSelectingArea: (isSelectingArea) => {
          this.isSelectingArea = isSelectingArea;
        },
        createItem: (input) => this.createItem(input),
        captureDomDraft: (input) => this.captureDomDraft(input),
        captureAreaDraft: (input) => this.captureAreaDraft(input),
        bindElementDraftToPoint: (point, fields) =>
          this.bindElementDraftToPoint(point, fields),
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
    window.addEventListener(
      'scroll',
      this.handleViewportChange,
      VIEWPORT_SCROLL_OPTIONS
    );
    window.addEventListener('resize', this.handleViewportChange);
    this.targetViewportWindow = this.getEnvironment()?.window;
    if (this.targetViewportWindow && this.targetViewportWindow !== window) {
      this.targetViewportWindow.addEventListener(
        'scroll',
        this.handleViewportChange,
        VIEWPORT_SCROLL_OPTIONS
      );
      this.targetViewportWindow.addEventListener(
        'resize',
        this.handleViewportChange
      );
    }

    this.render();
  }

  destroy() {
    this.view.clearDraftPreview();
    this.clearDrafts();
    document.removeEventListener('keydown', this.handleKeyDown, true);
    window.removeEventListener(
      'scroll',
      this.handleViewportChange,
      VIEWPORT_SCROLL_OPTIONS
    );
    window.removeEventListener('resize', this.handleViewportChange);
    if (this.targetViewportWindow && this.targetViewportWindow !== window) {
      this.targetViewportWindow.removeEventListener(
        'scroll',
        this.handleViewportChange,
        VIEWPORT_SCROLL_OPTIONS
      );
      this.targetViewportWindow.removeEventListener(
        'resize',
        this.handleViewportChange
      );
    }
    this.targetViewportWindow = undefined;
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
    this.clearDrafts();
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
    this.clearDrafts();
    this.render();
  }

  async startElementReview(element: Element, comment?: string) {
    if (!this.isOpen) {
      this.isOpen = true;
    }

    this.setModeState('element');
    this.clearDrafts();
    this.isSelectingArea = false;
    await this.bindElementDraftToElement(element, { comment });
  }

  async selectElement(element: Element) {
    if (!this.isOpen) {
      this.isOpen = true;
    }

    this.setModeState('element');
    this.clearDrafts();
    this.isSelectingArea = false;
    await this.bindElementDraftToElement(element, {
      isSelectionOnly: true,
    });
  }

  adjustElementSelection(delta: { x?: number; y?: number; scale?: number }) {
    if (!this.domDraft?.selection) return false;

    const current = this.domDraft.adjustment;
    this.domDraft = {
      ...this.domDraft,
      adjustment: {
        x: (current?.x ?? 0) + (delta.x ?? 0),
        y: (current?.y ?? 0) + (delta.y ?? 0),
        scale: (current?.scale ?? 0) + (delta.scale ?? 0),
        isActive: true,
      },
    };
    this.render();
    return true;
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

  private clearDrafts() {
    this.revokeDraftAttachmentPreviews(this.domDraft);
    this.revokeDraftAttachmentPreviews(this.areaDraft);
    this.domDraft = undefined;
    this.areaDraft = undefined;
    this.draftError = '';
  }

  private revokeDraftAttachmentPreviews(draft?: DomDraft | AreaDraft) {
    draft?.attachments?.forEach((attachment) => {
      if (attachment.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    });
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
      !this.domDraft &&
      !this.areaDraft &&
      !this.isSelectingArea
    ) {
      return false;
    }

    this.setModeState('idle');
    this.clearDrafts();
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
    if (!this.isOpen || this.renderFrame || this.isDraftComposerFocused()) return;

    this.renderFrame = window.requestAnimationFrame(() => {
      this.renderFrame = undefined;
      if (this.isDraftComposerFocused()) return;
      this.syncDomDraftViewportGeometry();
      this.render();
    });
  };

  private syncDomDraftViewportGeometry() {
    const draft = this.domDraft;
    const element = draft?.previewElement;
    const environment = this.getEnvironment();
    if (
      !draft?.selection ||
      !element?.isConnected ||
      !environment ||
      element.ownerDocument !== environment.document
    ) {
      return;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const selection: ViewportSelection = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
    this.domDraft = {
      ...draft,
      marker: {
        ...draft.marker,
        viewport: roundPoint({ x: rect.left, y: rect.top }),
      },
      selection: {
        ...draft.selection,
        viewport: toPublicSelection(selection),
      },
    };
  }

  private isDraftComposerFocused() {
    if (!this.domDraft && !this.areaDraft) return false;
    const composerHost = this.getEnvironment()?.composerHost;
    const activeElement = composerHost?.ownerDocument.activeElement;
    return Boolean(
      composerHost &&
        activeElement &&
        composerHost.contains(activeElement)
    );
  }

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
      const composerHost = target.getComposerHost?.();
      const scaleX =
        target.window.innerWidth > 0
          ? rect.width / target.window.innerWidth
          : 1;
      const scaleY =
        target.window.innerHeight > 0
          ? rect.height / target.window.innerHeight
          : 1;

      return {
        window: target.window,
        document: target.document,
        viewportRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        scaleX,
        scaleY,
        overlayRect: {
          left: overlayRect.left,
          top: overlayRect.top,
          width: overlayRect.width,
          height: overlayRect.height,
        },
        composerHost,
        captureViewport: target.captureViewport,
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

  private async bindElementDraftToPoint(
    point: ReviewPoint,
    fields: DraftItemFields = {}
  ) {
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
        ...fields,
        previewElement,
      };
    });

    this.domDraft = draft;
    this.render();
  }

  private async bindElementDraftToElement(
    element: Element,
    fields: ElementDraftFields = {}
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
        ...fields,
        previewElement,
      };
    });

    if (!draft) return;

    this.domDraft = draft;
    this.render();
  }

  private async createAreaDraft(selection: ViewportSelection) {
    const environment = this.getEnvironment();
    if (!environment) {
      this.isSelectingArea = false;
      this.render();
      return;
    }

    try {
      const viewport = getViewportSize(environment);

      this.areaDraft = await this.withOverlayHidden(() => {
        const anchorPoint = clampPoint(
          getSelectionCenter(selection),
          environment
        );
        const anchor = getDomAnchorFromPoint(
          anchorPoint,
          this.options.anchors?.attribute,
          environment
        );
        const marker = createSelectionStartMarker(
          selection,
          anchor,
          environment
        );
        const reviewSelection: ReviewSelection = {
          viewport: toPublicSelection(selection),
          relative: anchor
            ? getRelativeSelection(selection, anchor, environment)
            : undefined,
        };

        return {
          viewport,
          anchor,
          marker,
          selection: reviewSelection,
        };
      });
      this.setModeState('area');
    } finally {
      this.isSelectingArea = false;
      this.render();
    }
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

  private async captureDomDraft(input: CaptureDraftInput) {
    if (this.isCapturingViewport) return;

    const environment = this.getEnvironment();
    const draft = this.domDraft;
    if (!draft) return;
    if (!environment?.captureViewport) {
      this.draftError = 'Viewport capture helper is not available.';
      this.render();
      return;
    }

    const captureInput = this.createViewportCaptureInput(
      environment,
      input,
      input.selection?.viewport
    );
    this.draftError = '';
    this.isCapturingViewport = true;
    this.render();

    try {
      const result = await environment.captureViewport(captureInput);
      const attachment = this.createCaptureDraftAttachment(result, captureInput);
      const currentDraft = this.domDraft ?? draft;
      this.domDraft = {
        ...currentDraft,
        attachments: [...(currentDraft.attachments ?? []), attachment],
      };
    } catch (error) {
      this.draftError = this.getErrorMessage(
        error,
        'Failed to capture viewport.'
      );
    } finally {
      this.isCapturingViewport = false;
      this.render();
    }
  }

  private async captureAreaDraft(input: CaptureDraftInput) {
    if (this.isCapturingViewport) return;

    const environment = this.getEnvironment();
    const draft = this.areaDraft;
    if (!draft) return;
    if (!environment?.captureViewport) {
      this.draftError = 'Viewport capture helper is not available.';
      this.render();
      return;
    }

    const captureInput = this.createViewportCaptureInput(
      environment,
      input,
      input.selection?.viewport
    );
    this.draftError = '';
    this.isCapturingViewport = true;
    this.render();

    try {
      const result = await environment.captureViewport(captureInput);
      const attachment = this.createCaptureDraftAttachment(result, captureInput);
      const currentDraft = this.areaDraft ?? draft;
      this.areaDraft = {
        ...currentDraft,
        attachments: [...(currentDraft.attachments ?? []), attachment],
      };
    } catch (error) {
      this.draftError = this.getErrorMessage(
        error,
        'Failed to capture viewport.'
      );
    } finally {
      this.isCapturingViewport = false;
      this.render();
    }
  }

  private createViewportCaptureInput(
    environment: ReviewEnvironment,
    draft: CaptureDraftInput,
    captureRegion?: RelativeSelection
  ): ReviewViewportCaptureInput {
    const timestamp = new Date().toISOString();
    const viewport = draft.viewport ?? getViewportSize(environment);
    const routeKey = getRouteKey(environment);

    return {
      routeKey,
      pageUrl: getPageUrl(environment),
      originalUrl: getOriginalUrl(environment),
      viewport,
      captureRegion,
      devicePixelRatio: environment.window.devicePixelRatio || 1,
      scroll: {
        x: environment.window.scrollX,
        y: environment.window.scrollY,
      },
      marker: draft.marker,
      selection: draft.selection,
      timestamp,
    };
  }

  private createCaptureDraftAttachment(
    result: ReviewViewportCaptureResult,
    input: ReviewViewportCaptureInput
  ): ReviewDraftAttachment {
    const mime = result.mime || result.file.type || 'image/png';
    const name = result.name || `review-capture-${Date.now()}.png`;
    return {
      id: createId(),
      file: result.file,
      name,
      mime,
      size: result.file.size,
      kind: 'capture',
      previewUrl: mime.startsWith('image/')
        ? URL.createObjectURL(result.file)
        : undefined,
      metadata: {
        ...result.metadata,
        source: 'viewport-capture',
        target: 'iframe',
        routeKey: input.routeKey,
        pageUrl: input.pageUrl,
        originalUrl: input.originalUrl,
        viewport: input.viewport,
        scroll: input.scroll,
        marker: input.marker,
        selection: input.selection,
        timestamp: input.timestamp,
        devicePixelRatio: input.devicePixelRatio,
        width: result.width,
        height: result.height,
      },
    };
  }

  private async createItem(input: CreateReviewItemInput) {
    const environment = this.getEnvironment();
    if (!environment || this.isCreatingItem) return;

    const now = new Date().toISOString();
    const routeKey = getRouteKey(environment);
    const viewport = input.viewport ?? getViewportSize(environment);
    const createdBy = this.options.userId?.trim();
    const title = input.title?.trim();
    const assigneeId = input.assigneeId?.trim() || undefined;
    const assigneeOption = this.options.assigneeOptions?.find(
      (option) => option.value === assigneeId
    );
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
      title: title || undefined,
      comment: input.comment,
      assigneeId,
      assigneeName: input.assigneeName ?? assigneeOption?.label,
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

    this.draftError = '';
    this.isCreatingItem = true;
    this.render();

    try {
      const attachments = await this.uploadDraftAttachments(
        input.attachments,
        item
      );
      const itemWithAttachments =
        attachments.length > 0 ? { ...item, attachments } : item;
      const createdItem = await this.adapter.create(itemWithAttachments);
      this.setModeState('idle');
      this.clearDrafts();
      this.highlightItem(createdItem.id);
      await this.reload();
      await this.options.onCreateItem?.(createdItem);
    } catch (error) {
      this.draftError = this.getCreateItemErrorMessage(
        error,
        Boolean(input.attachments?.length)
      );
    } finally {
      this.isCreatingItem = false;
      this.render();
    }
  }

  private async uploadDraftAttachments(
    attachments: ReviewDraftAttachment[] | undefined,
    item: ReviewItem
  ): Promise<ReviewAttachment[]> {
    if (!attachments?.length) return [];
    const uploadAttachment = this.adapter.uploadAttachment;
    if (!uploadAttachment) {
      throw new Error('Attachment upload adapter is not configured.');
    }

    return Promise.all(
      attachments.map((attachment) =>
        uploadAttachment({
          file: attachment.file,
          name: attachment.name,
          mime: attachment.mime,
          kind: attachment.kind,
          item,
          metadata: attachment.metadata,
        })
      )
    );
  }

  private getCreateItemErrorMessage(
    error: unknown,
    wasUploadingAttachments: boolean
  ) {
    const message = this.getErrorMessage(error, 'Failed to save QA.');
    const reason =
      error && typeof error === 'object' && 'reason' in error &&
      typeof error.reason === 'string'
        ? ` (${error.reason})`
        : '';
    return wasUploadingAttachments && reason
      ? `Attachment upload failed${reason}: ${message}`
      : message;
  }

  private getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error) return error.message;
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }
    return fallback;
  }

  private async restoreItem(item: ReviewItem) {
    this.setModeState('idle');
    this.clearDrafts();

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
    async selectElement() {},
    adjustElementSelection() {
      return false;
    },
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
