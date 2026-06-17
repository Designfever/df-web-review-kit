export type ReviewItemKind = 'text' | 'capture';
export type ReviewItemStatus = 'open' | 'resolved';
export type DomAnchorStrategy =
  | 'configured-attribute'
  | 'id'
  | 'class'
  | 'dom-path';

export interface DomAnchor {
  selector: string;
  strategy: DomAnchorStrategy;
  textFingerprint?: string;
}

export interface RelativeSelection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ReviewPoint {
  x: number;
  y: number;
}

export interface ReviewMarker {
  viewport: ReviewPoint;
  relative?: ReviewPoint;
}

export interface ReviewScreenshot {
  dataUrl: string;
  width: number;
  height: number;
}

export interface ReviewItem {
  id: string;
  projectId: string;
  pageUrl: string;
  normalizedPath: string;
  kind: ReviewItemKind;
  title?: string;
  comment: string;
  status: ReviewItemStatus;
  viewport: ViewportSize;
  scroll?: {
    x: number;
    y: number;
  };
  anchor?: DomAnchor;
  marker?: ReviewMarker;
  selection?: RelativeSelection;
  screenshot?: ReviewScreenshot;
  externalIssueId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItemQuery {
  projectId: string;
  normalizedPath?: string;
  status?: ReviewItemStatus;
}

export interface WebReviewKitAdapter {
  list(query: ReviewItemQuery): Promise<ReviewItem[]>;
  create(item: ReviewItem): Promise<ReviewItem>;
  update(
    id: string,
    patch: Partial<Omit<ReviewItem, 'id' | 'createdAt'>>
  ): Promise<ReviewItem>;
  remove(id: string): Promise<void>;
}

export interface LocalAdapterOptions {
  storageKey?: string;
}

export interface WebReviewKitOptions {
  projectId: string;
  adapter?: WebReviewKitAdapter;
  target?: WebReviewKitTarget | (() => WebReviewKitTarget | undefined);
  hotkeys?: {
    qa?: string;
  };
  anchors?: {
    attribute?: string;
  };
  modules?: {
    qa?: boolean;
    grid?: boolean;
    figma?: boolean;
  };
}

export interface WebReviewKitController {
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
}

export interface WebReviewKitTarget {
  window: Window;
  document: Document;
  getViewportRect?: () => Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
}

type ReviewMode = 'idle' | 'text' | 'capture';

interface ViewportSelection {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CaptureDraft {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  selection?: RelativeSelection;
  screenshot?: ReviewScreenshot;
  error?: string;
}

interface TextDraft {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker: ReviewMarker;
  comment?: string;
}

interface ReviewEnvironment {
  window: Window;
  document: Document;
  viewportRect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

const DEFAULT_STORAGE_KEY = 'df-web-review-kit:items';
const ROOT_ID = 'df-web-review-kit-root';
const INTERNAL_QUERY_PARAMS = ['__dfwr_target'];

export function localAdapter(
  options: LocalAdapterOptions = {}
): WebReviewKitAdapter {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;

  const read = (): ReviewItem[] => {
    if (typeof window === 'undefined') return [];

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    try {
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const write = (items: ReviewItem[]) => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  };

  return {
    async list(query) {
      return read().filter((item) => {
        if (item.projectId !== query.projectId) return false;
        if (
          query.normalizedPath &&
          item.normalizedPath !== query.normalizedPath
        ) {
          return false;
        }
        if (query.status && item.status !== query.status) return false;
        return true;
      });
    },

    async create(item) {
      const items = read();
      items.unshift(item);
      write(items);
      return item;
    },

    async update(id, patch) {
      const items = read();
      const index = items.findIndex((item) => item.id === id);

      if (index < 0) {
        throw new Error(`Review item not found: ${id}`);
      }

      const next: ReviewItem = {
        ...items[index],
        ...patch,
        id,
        createdAt: items[index].createdAt,
        updatedAt: new Date().toISOString(),
      };

      items[index] = next;
      write(items);
      return next;
    },

    async remove(id) {
      write(read().filter((item) => item.id !== id));
    },
  };
}

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
    destroy: () => app.destroy(),
  };
}

class WebReviewKitApp {
  private readonly adapter: WebReviewKitAdapter;
  private readonly hotkey: string;
  private root?: HTMLDivElement;
  private shadow?: ShadowRoot;
  private panel?: HTMLDivElement;
  private isOpen = false;
  private mode: ReviewMode = 'idle';
  private items: ReviewItem[] = [];
  private textDraft?: TextDraft;
  private captureDraft?: CaptureDraft;
  private isCapturing = false;
  private renderFrame?: number;

  constructor(private readonly options: WebReviewKitOptions) {
    this.adapter = options.adapter ?? localAdapter();
    this.hotkey = options.hotkeys?.qa ?? 'Shift+Q';
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
    void this.reload().then(() => this.render());
  }

  close() {
    this.isOpen = false;
    this.mode = 'idle';
    this.textDraft = undefined;
    this.captureDraft = undefined;
    this.isCapturing = false;
    this.render();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
      return;
    }

    this.open();
  }

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!isHotkey(event, this.hotkey)) return;

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
      };
    }

    try {
      const rect = target.getViewportRect?.() ?? {
        left: 0,
        top: 0,
        width: target.window.innerWidth,
        height: target.window.innerHeight,
      };

      return {
        window: target.window,
        document: target.document,
        viewportRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
      };
    } catch {
      return undefined;
    }
  }

  private async reload() {
    const environment = this.getEnvironment();
    if (!environment) return;

    this.items = await this.adapter.list({
      projectId: this.options.projectId,
      normalizedPath: getNormalizedPath(environment),
      status: 'open',
    });
  }

  private render() {
    if (!this.shadow) return;

    this.shadow.replaceChildren();
    this.shadow.append(createStyleElement());

    const shell = document.createElement('div');
    shell.className = `dfwr-shell${this.isOpen ? ' is-open' : ''}`;
    shell.setAttribute('aria-hidden', this.isOpen ? 'false' : 'true');

    this.panel = document.createElement('div');
    this.panel.className = 'dfwr-panel';
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Web review kit');

    this.panel.append(
      this.createHeader(),
      this.createToolbar(),
      this.createBody(),
      this.createList()
    );

    shell.append(this.panel);
    shell.append(this.createMarkerLayer());

    if (this.isOpen && this.mode === 'text') {
      shell.append(
        this.textDraft
          ? this.createTextPopover(this.textDraft)
          : this.createTextLayer()
      );
    }

    if (this.isOpen && this.mode === 'capture' && !this.captureDraft) {
      shell.append(this.createCaptureLayer());
    }

    this.shadow.append(shell);
  }

  private createHeader() {
    const header = document.createElement('div');
    header.className = 'dfwr-header';

    const title = document.createElement('div');
    title.className = 'dfwr-title';
    title.textContent = 'Review Kit';

    const meta = document.createElement('div');
    meta.className = 'dfwr-meta';
    meta.textContent = getNormalizedPath(this.getEnvironment());

    const titleGroup = document.createElement('div');
    titleGroup.append(title, meta);

    const close = document.createElement('button');
    close.className = 'dfwr-icon-button';
    close.type = 'button';
    close.textContent = 'x';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', () => this.close());

    header.append(titleGroup, close);
    return header;
  }

  private createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'dfwr-toolbar';

    toolbar.append(
      this.createToolbarButton('Text', this.mode === 'text', () => {
        this.mode = this.mode === 'text' ? 'idle' : 'text';
        this.textDraft = undefined;
        this.captureDraft = undefined;
        this.render();
      }),
      this.createToolbarButton(
        this.isCapturing ? 'Capturing' : 'Capture',
        this.mode === 'capture',
        () => {
          this.mode = this.mode === 'capture' ? 'idle' : 'capture';
          this.textDraft = undefined;
          this.captureDraft = undefined;
          this.render();
        }
      ),
      this.createToolbarButton('Refresh', false, () => {
        void this.reload().then(() => this.render());
      })
    );

    return toolbar;
  }

  private createToolbarButton(
    label: string,
    active: boolean,
    onClick: () => void
  ) {
    const button = document.createElement('button');
    button.className = `dfwr-button${active ? ' is-active' : ''}`;
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  private createBody() {
    const body = document.createElement('div');
    body.className = 'dfwr-body';

    if (this.mode === 'idle') {
      const empty = document.createElement('p');
      empty.className = 'dfwr-empty';
      empty.textContent = 'Add a text note or capture an area.';
      body.append(empty);
      return body;
    }

    if (this.mode === 'text') {
      body.append(this.createTextBody());
      return body;
    }

    body.append(this.createCaptureForm());
    return body;
  }

  private createTextBody() {
    const empty = document.createElement('p');
    empty.className = 'dfwr-empty';
    empty.textContent = this.textDraft
      ? 'Write the note in the page box.'
      : 'Click on the page to place a text note.';
    return empty;
  }

  private createTextPopover(draft: TextDraft) {
    const environment = this.getEnvironment();
    const group = document.createElement('div');
    group.className = 'dfwr-note-draft';
    if (!environment) return group;

    const hostPoint = toHostPoint(draft.marker.viewport, environment);

    const pin = document.createElement('button');
    pin.className = 'dfwr-note-pin';
    pin.type = 'button';
    pin.setAttribute('aria-label', 'Move note point');
    pin.style.left = `${hostPoint.x}px`;
    pin.style.top = `${hostPoint.y}px`;

    const popover = document.createElement('div');
    const position = getPopoverPosition(hostPoint);

    popover.className = 'dfwr-note-popover';
    popover.style.left = `${position.left}px`;
    popover.style.top = `${position.top}px`;

    const form = document.createElement('form');
    form.className = 'dfwr-form';

    const meta = document.createElement('div');
    meta.className = 'dfwr-item-date';
    meta.textContent = formatTextDraftMeta(draft);

    const textarea = document.createElement('textarea');
    textarea.className = 'dfwr-textarea';
    textarea.placeholder = 'Review comment';
    textarea.rows = 4;
    textarea.value = draft.comment ?? '';
    textarea.addEventListener('input', () => {
      if (!this.textDraft) return;
      this.textDraft = {
        ...this.textDraft,
        comment: textarea.value,
      };
    });

    const actions = this.createFormActions('Save text', () => {
      const comment = textarea.value.trim();
      if (!comment) return;
      void this.createItem({
        kind: 'text',
        comment,
        viewport: draft.viewport,
        anchor: draft.anchor,
        marker: draft.marker,
      });
    });

    form.append(meta, textarea, actions);
    popover.append(form);
    group.append(pin, popover);

    this.attachDraftPinDrag(pin, popover, meta, textarea);

    window.setTimeout(() => textarea.focus(), 0);

    return group;
  }

  private createCaptureForm() {
    const form = document.createElement('form');
    form.className = 'dfwr-form';

    if (!this.captureDraft) {
      const empty = document.createElement('p');
      empty.className = 'dfwr-empty';
      empty.textContent = 'Drag on the page to select an area.';
      form.append(empty);
      return form;
    }

    if (this.captureDraft.error) {
      const error = document.createElement('p');
      error.className = 'dfwr-error';
      error.textContent = this.captureDraft.error;
      form.append(error);
    }

    if (this.captureDraft.screenshot) {
      const image = document.createElement('img');
      image.className = 'dfwr-preview';
      image.alt = '';
      image.src = this.captureDraft.screenshot.dataUrl;
      form.append(image);
    }

    const meta = document.createElement('div');
    meta.className = 'dfwr-item-date';
    meta.textContent = formatCaptureDraftMeta(this.captureDraft);
    form.append(meta);

    const textarea = document.createElement('textarea');
    textarea.className = 'dfwr-textarea';
    textarea.placeholder = 'Capture comment';
    textarea.rows = 4;

    const actions = this.createFormActions('Save capture', () => {
      const comment = textarea.value.trim();
      if (!comment || !this.captureDraft) return;
      void this.createItem({
        kind: 'capture',
        comment,
        viewport: this.captureDraft.viewport,
        anchor: this.captureDraft.anchor,
        selection: this.captureDraft.selection,
        screenshot: this.captureDraft.screenshot,
      });
    });

    form.append(textarea, actions);
    return form;
  }

  private createFormActions(saveLabel: string, onSave: () => void) {
    const actions = document.createElement('div');
    actions.className = 'dfwr-actions';

    const save = document.createElement('button');
    save.className = 'dfwr-button is-primary';
    save.type = 'button';
    save.textContent = saveLabel;
    save.addEventListener('click', onSave);

    const cancel = document.createElement('button');
    cancel.className = 'dfwr-button';
    cancel.type = 'button';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', () => {
      this.mode = 'idle';
      this.textDraft = undefined;
      this.captureDraft = undefined;
      this.render();
    });

    actions.append(save, cancel);
    return actions;
  }

  private createList() {
    const section = document.createElement('div');
    section.className = 'dfwr-list';

    const heading = document.createElement('div');
    heading.className = 'dfwr-list-heading';
    heading.textContent = `Open items (${this.items.length})`;
    section.append(heading);

    if (this.items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'dfwr-empty';
      empty.textContent = 'No open review items on this page.';
      section.append(empty);
      return section;
    }

    for (const item of this.items) {
      section.append(this.createListItem(item));
    }

    return section;
  }

  private createListItem(item: ReviewItem) {
    const row = document.createElement('article');
    row.className = 'dfwr-item';

    const body = document.createElement('div');
    body.className = 'dfwr-item-body';

    const kind = document.createElement('div');
    kind.className = 'dfwr-item-kind';
    kind.textContent = item.kind;

    const comment = document.createElement('p');
    comment.className = 'dfwr-item-comment';
    comment.textContent = item.comment;

    const date = document.createElement('time');
    date.className = 'dfwr-item-date';
    date.dateTime = item.createdAt;
    date.textContent = formatItemMeta(item);

    body.append(kind, comment, date);

    if (item.screenshot) {
      const image = document.createElement('img');
      image.className = 'dfwr-thumb';
      image.alt = '';
      image.src = item.screenshot.dataUrl;
      body.append(image);
    }

    const actions = document.createElement('div');
    actions.className = 'dfwr-item-actions';

    const resolve = document.createElement('button');
    resolve.className = 'dfwr-icon-button';
    resolve.type = 'button';
    resolve.textContent = 'ok';
    resolve.setAttribute('aria-label', 'Resolve');
    resolve.addEventListener('click', () => {
      void this.adapter
        .update(item.id, { status: 'resolved' })
        .then(() => this.reload())
        .then(() => this.render());
    });

    const remove = document.createElement('button');
    remove.className = 'dfwr-icon-button';
    remove.type = 'button';
    remove.textContent = 'del';
    remove.setAttribute('aria-label', 'Delete');
    remove.addEventListener('click', () => {
      void this.adapter
        .remove(item.id)
        .then(() => this.reload())
        .then(() => this.render());
    });

    actions.append(resolve, remove);
    row.append(body, actions);
    return row;
  }

  private createMarkerLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-marker-layer';
    const environment = this.getEnvironment();
    if (!environment) return layer;

    this.items.forEach((item, index) => {
      const point = getBoundMarkerPoint(item, environment);
      if (!point || !isPointInViewport(point.viewport, environment)) return;
      const hostPoint = toHostPoint(point.viewport, environment);

      const marker = document.createElement('div');
      marker.className = `dfwr-bound-marker${
        point.isBound ? ' is-bound' : ' is-fallback'
      }`;
      marker.style.left = `${hostPoint.x}px`;
      marker.style.top = `${hostPoint.y}px`;
      marker.title = `${item.comment}\n${formatItemMeta(item)}`;

      const label = document.createElement('span');
      label.textContent = String(index + 1);
      marker.append(label);
      layer.append(marker);
    });

    return layer;
  }

  private attachDraftPinDrag(
    pin: HTMLButtonElement,
    popover: HTMLDivElement,
    meta: HTMLDivElement,
    textarea: HTMLTextAreaElement
  ) {
    let isDragging = false;

    const moveDraftUi = (hostPoint: ReviewPoint) => {
      const environment = this.getEnvironment();
      if (!environment) return;

      const nextPoint = clampPoint(toTargetPoint(hostPoint, environment), environment);
      const nextHostPoint = toHostPoint(nextPoint, environment);
      const position = getPopoverPosition(nextHostPoint);

      pin.style.left = `${nextHostPoint.x}px`;
      pin.style.top = `${nextHostPoint.y}px`;
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;

      if (!this.textDraft) return;

      this.textDraft = {
        ...this.textDraft,
        marker: {
          ...this.textDraft.marker,
          viewport: roundPoint(nextPoint),
        },
        comment: textarea.value,
      };
      meta.textContent = formatTextDraftMeta(this.textDraft);
    };

    pin.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();
      isDragging = true;
      pin.setPointerCapture(event.pointerId);
    });

    pin.addEventListener('pointermove', (event) => {
      if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;

      event.preventDefault();
      moveDraftUi({
        x: event.clientX,
        y: event.clientY,
      });
    });

    pin.addEventListener('pointerup', (event) => {
      if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;

      event.preventDefault();
      event.stopPropagation();
      isDragging = false;
      pin.releasePointerCapture(event.pointerId);

      void this.bindTextDraftToPoint(
        toTargetPointFromHostEvent(event, this.getEnvironment()),
        textarea.value
      );
    });
  }

  private createTextLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-text-layer';
    const environment = this.getEnvironment();

    if (environment) {
      placeLayerOverTarget(layer, environment);
    }

    layer.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.createTextDraft(
        toTargetPointFromHostEvent(event, this.getEnvironment())
      );
    });

    return layer;
  }

  private async createTextDraft(point: ReviewPoint) {
    await this.bindTextDraftToPoint(point);
  }

  private async bindTextDraftToPoint(point: ReviewPoint, comment?: string) {
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
          ? getRelativePoint(nextPoint, anchor.selector, environment)
          : undefined,
      };

      return {
        viewport,
        anchor,
        marker,
        comment,
      };
    });

    this.textDraft = draft;
    this.render();
  }

  private createCaptureLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-capture-layer';
    const environment = this.getEnvironment();

    if (environment) {
      placeLayerOverTarget(layer, environment);
    }

    const box = document.createElement('div');
    box.className = 'dfwr-capture-box';
    layer.append(box);

    let startX = 0;
    let startY = 0;
    let selection: ViewportSelection | undefined;

    const updateBox = (event: PointerEvent) => {
      const nextPoint = toTargetPointFromHostEvent(
        event,
        this.getEnvironment()
      );
      const left = Math.min(startX, nextPoint.x);
      const top = Math.min(startY, nextPoint.y);
      const width = Math.abs(nextPoint.x - startX);
      const height = Math.abs(nextPoint.y - startY);
      const hostPoint = toHostPoint(
        { x: left, y: top },
        this.getEnvironment()
      );

      selection = { left, top, width, height };
      box.style.left = `${hostPoint.x}px`;
      box.style.top = `${hostPoint.y}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    };

    layer.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      layer.setPointerCapture(event.pointerId);
      const startPoint = toTargetPointFromHostEvent(
        event,
        this.getEnvironment()
      );
      startX = startPoint.x;
      startY = startPoint.y;
      updateBox(event);
    });

    layer.addEventListener('pointermove', (event) => {
      if (!layer.hasPointerCapture(event.pointerId)) return;
      updateBox(event);
    });

    layer.addEventListener('pointerup', (event) => {
      if (!layer.hasPointerCapture(event.pointerId)) return;
      layer.releasePointerCapture(event.pointerId);
      updateBox(event);

      if (!selection || selection.width < 8 || selection.height < 8) return;

      this.isCapturing = true;
      this.render();
      void this.createCaptureDraft(selection);
    });

    return layer;
  }

  private async createCaptureDraft(selection: ViewportSelection) {
    const environment = this.getEnvironment();
    if (!environment) return;

    const viewport = getViewportSize(environment);

    try {
      const draft = await this.withOverlayHidden(async () => {
        const anchor = getDomAnchor(
          selection,
          this.options.anchors?.attribute,
          environment
        );
        const relativeSelection = anchor
          ? getRelativeSelection(selection, anchor.selector, environment)
          : undefined;

        try {
          const screenshot = await captureSelection(selection, environment);

          return {
            viewport,
            anchor,
            selection: relativeSelection,
            screenshot,
          };
        } catch (error) {
          return {
            viewport,
            anchor,
            selection: relativeSelection,
            error:
              error instanceof Error
                ? error.message
                : 'Capture failed. The selected area will be saved without an image.',
          };
        }
      });

      this.captureDraft = draft;
    } catch (error) {
      this.captureDraft = {
        viewport,
        error:
          error instanceof Error
            ? error.message
            : 'Capture failed. Try a smaller area.',
      };
    } finally {
      this.isCapturing = false;
      this.mode = 'capture';
      this.render();
    }
  }

  private async withOverlayHidden<T>(callback: () => Promise<T> | T) {
    if (!this.root) return callback();

    const previousDisplay = this.root.style.display;
    this.root.style.display = 'none';

    try {
      return await callback();
    } finally {
      this.root.style.display = previousDisplay;
    }
  }

  private async createItem(
    input: Pick<ReviewItem, 'kind' | 'comment'> &
      Partial<
        Pick<
          ReviewItem,
          'viewport' | 'anchor' | 'marker' | 'selection' | 'screenshot'
        >
      >
  ) {
    const environment = this.getEnvironment();
    if (!environment) return;

    const now = new Date().toISOString();
    const item: ReviewItem = {
      id: createId(),
      projectId: this.options.projectId,
      pageUrl: getPageUrl(environment),
      normalizedPath: getNormalizedPath(environment),
      kind: input.kind,
      title: input.comment.split('\n')[0]?.slice(0, 80),
      comment: input.comment,
      status: 'open',
      viewport: input.viewport ?? getViewportSize(environment),
      scroll: {
        x: environment.window.scrollX,
        y: environment.window.scrollY,
      },
      anchor: input.anchor,
      marker: input.marker,
      selection: input.selection,
      screenshot: input.screenshot,
      createdAt: now,
      updatedAt: now,
    };

    await this.adapter.create(item);
    this.mode = 'idle';
    this.textDraft = undefined;
    this.captureDraft = undefined;
    await this.reload();
    this.render();
  }
}

async function captureSelection(
  selection: ViewportSelection,
  environment: ReviewEnvironment
): Promise<ReviewScreenshot> {
  if (hasLiveMediaInSelection(selection, environment)) {
    return captureSelectionFromDisplayMedia(selection, environment);
  }

  await waitForNextFrame(environment);

  const { default: html2canvas } = await import('html2canvas');
  const scale = Math.min(environment.window.devicePixelRatio || 1, 2);
  const canvas = await html2canvas(environment.document.body, {
    allowTaint: false,
    backgroundColor: null,
    foreignObjectRendering: true,
    logging: false,
    scale,
    useCORS: true,
    x: selection.left + environment.window.scrollX,
    y: selection.top + environment.window.scrollY,
    width: selection.width,
    height: selection.height,
    windowWidth: environment.document.documentElement.scrollWidth,
    windowHeight: environment.document.documentElement.scrollHeight,
  });

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: selection.width,
    height: selection.height,
  };
}

function hasLiveMediaInSelection(
  selection: ViewportSelection,
  environment: ReviewEnvironment
) {
  const mediaElements = Array.from(
    environment.document.querySelectorAll('video, canvas')
  );
  return mediaElements.some((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    return rectanglesIntersect(selection, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  });
}

function rectanglesIntersect(
  a: ViewportSelection,
  b: ViewportSelection
) {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  );
}

async function captureSelectionFromDisplayMedia(
  selection: ViewportSelection,
  environment: ReviewEnvironment
): Promise<ReviewScreenshot> {
  if (!window.isSecureContext || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error(
      'Video/canvas capture needs HTTPS or localhost. Open the HTTPS Tailscale URL and try again.'
    );
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: 'include',
    surfaceSwitching: 'exclude',
    video: {
      displaySurface: 'browser',
      frameRate: 1,
    },
  } as DisplayMediaStreamOptions);

  try {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    await waitForVideoFrame(video);

    const sourceWidth = video.videoWidth || window.innerWidth;
    const sourceHeight = video.videoHeight || window.innerHeight;
    const scaleX = sourceWidth / window.innerWidth;
    const scaleY = sourceHeight / window.innerHeight;
    const outputWidth = Math.max(1, Math.round(selection.width * scaleX));
    const outputHeight = Math.max(1, Math.round(selection.height * scaleY));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Capture failed. Canvas is unavailable.');
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    context.drawImage(
      video,
      (environment.viewportRect.left + selection.left) * scaleX,
      (environment.viewportRect.top + selection.top) * scaleY,
      selection.width * scaleX,
      selection.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    );

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: selection.width,
      height: selection.height,
    };
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

async function waitForVideoFrame(video: HTMLVideoElement) {
  const videoWithFrameCallback = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: () => void) => number;
  };

  if (typeof videoWithFrameCallback.requestVideoFrameCallback === 'function') {
    await new Promise<void>((resolve) => {
      videoWithFrameCallback.requestVideoFrameCallback?.(() => resolve());
    });
    return;
  }

  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
      };
      const handleLoadedData = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error('Capture failed. Display stream did not load.'));
      };

      video.addEventListener('loadeddata', handleLoadedData, { once: true });
      video.addEventListener('error', handleError, { once: true });
    });
  }

  await waitForNextFrame();
}

function waitForNextFrame(environment?: ReviewEnvironment) {
  return new Promise<void>((resolve) => {
    (environment?.window ?? window).requestAnimationFrame(() => resolve());
  });
}

function getDomAnchor(
  selection: ViewportSelection,
  configuredAttribute = 'data-qa-id',
  environment: ReviewEnvironment
): DomAnchor | undefined {
  const x = selection.left + selection.width / 2;
  const y = selection.top + selection.height / 2;
  const target = environment.document.elementFromPoint(x, y);
  if (!target) return undefined;

  const anchoredByAttribute = target.closest(`[${configuredAttribute}]`);
  if (anchoredByAttribute) {
    const value = anchoredByAttribute.getAttribute(configuredAttribute);
    if (value) {
      return {
        selector: `[${configuredAttribute}="${cssEscape(value)}"]`,
        strategy: 'configured-attribute',
        textFingerprint: getTextFingerprint(anchoredByAttribute),
      };
    }
  }

  const anchoredById = findClosest(target, (element) => Boolean(element.id));
  if (anchoredById?.id) {
    return {
      selector: `#${cssEscape(anchoredById.id)}`,
      strategy: 'id',
      textFingerprint: getTextFingerprint(anchoredById),
    };
  }

  const anchoredByClass = findClosest(target, (element) =>
    Array.from(element.classList).some((name) => isMeaningfulClass(name))
  );

  if (anchoredByClass) {
    const className = Array.from(anchoredByClass.classList).find((name) =>
      isMeaningfulClass(name)
    );

    if (className) {
      return {
        selector: `${anchoredByClass.tagName.toLowerCase()}.${cssEscape(
          className
        )}`,
        strategy: 'class',
        textFingerprint: getTextFingerprint(anchoredByClass),
      };
    }
  }

  return {
    selector: getDomPath(target),
    strategy: 'dom-path',
    textFingerprint: getTextFingerprint(target),
  };
}

function getRelativeSelection(
  selection: ViewportSelection,
  selector: string,
  environment: ReviewEnvironment
): RelativeSelection | undefined {
  const element = queryAnchorElement(selector, environment);
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return undefined;

  return {
    x: roundRatio((selection.left - rect.left) / rect.width),
    y: roundRatio((selection.top - rect.top) / rect.height),
    width: roundRatio(selection.width / rect.width),
    height: roundRatio(selection.height / rect.height),
  };
}

function getRelativePoint(
  point: ReviewPoint,
  selector: string,
  environment: ReviewEnvironment
): ReviewPoint | undefined {
  const element = queryAnchorElement(selector, environment);
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return undefined;

  return {
    x: roundRatio((point.x - rect.left) / rect.width),
    y: roundRatio((point.y - rect.top) / rect.height),
  };
}

function getBoundMarkerPoint(
  item: ReviewItem,
  environment: ReviewEnvironment
) {
  if (!item.marker) return undefined;

  if (item.anchor && item.marker.relative) {
    const element = queryAnchorElement(item.anchor.selector, environment);

    if (element) {
      const rect = element.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: roundPoint({
            x: rect.left + rect.width * item.marker.relative.x,
            y: rect.top + rect.height * item.marker.relative.y,
          }),
          isBound: true,
        };
      }
    }
  }

  const sourceScroll = item.scroll ?? { x: 0, y: 0 };

  return {
    viewport: roundPoint({
      x: item.marker.viewport.x + sourceScroll.x - environment.window.scrollX,
      y: item.marker.viewport.y + sourceScroll.y - environment.window.scrollY,
    }),
    isBound: false,
  };
}

function queryAnchorElement(selector: string, environment: ReviewEnvironment) {
  try {
    return environment.document.querySelector(selector);
  } catch {
    return undefined;
  }
}

function getPointSelection(point: ReviewPoint): ViewportSelection {
  return {
    left: point.x,
    top: point.y,
    width: 1,
    height: 1,
  };
}

function findClosest(
  start: Element,
  predicate: (element: Element) => boolean
) {
  let element: Element | null = start;
  const root = start.ownerDocument.documentElement;

  while (element && element !== root) {
    if (predicate(element)) return element;
    element = element.parentElement;
  }

  return undefined;
}

function getDomPath(element: Element) {
  const parts: string[] = [];
  let current: Element | null = element;
  const ownerDocument = element.ownerDocument;

  while (
    current &&
    current !== ownerDocument.body &&
    current !== ownerDocument.documentElement
  ) {
    const parent: Element | null = current.parentElement;
    const tag = current.tagName.toLowerCase();

    if (!parent) {
      parts.unshift(tag);
      break;
    }

    const currentTagName = current.tagName;
    const siblings: Element[] = Array.from(parent.children).filter(
      (child) => child.tagName === currentTagName
    );
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }

  return `body > ${parts.join(' > ')}`;
}

function getTextFingerprint(element: Element) {
  const text = element.textContent?.replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, 120) : undefined;
}

function isMeaningfulClass(value: string) {
  return (
    value.length > 2 &&
    !value.includes(':') &&
    !value.startsWith('mq-') &&
    !value.startsWith('font-') &&
    !value.startsWith('bg-') &&
    !value.startsWith('text-') &&
    !value.startsWith('w-') &&
    !value.startsWith('h-') &&
    !value.startsWith('p-') &&
    !value.startsWith('m-')
  );
}

function isHotkey(event: KeyboardEvent, hotkey: string) {
  const parts = hotkey
    .split('+')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const key = parts.find(
    (part) => !['shift', 'ctrl', 'control', 'alt', 'meta', 'cmd'].includes(part)
  );

  if (!key) return false;
  if (parts.includes('shift') !== event.shiftKey) return false;
  if (
    (parts.includes('ctrl') || parts.includes('control')) !== event.ctrlKey
  ) {
    return false;
  }
  if (parts.includes('alt') !== event.altKey) return false;
  if ((parts.includes('meta') || parts.includes('cmd')) !== event.metaKey) {
    return false;
  }

  return isHotkeyKey(event, key);
}

function isHotkeyKey(event: KeyboardEvent, key: string) {
  const normalizedKey = key.toLowerCase();

  if (event.key.toLowerCase() === normalizedKey) return true;

  if (getHotkeyCode(normalizedKey) === event.code) return true;

  const aliases: Record<string, string[]> = {
    q: ['ㅂ', 'ㅃ'],
  };

  return aliases[normalizedKey]?.includes(event.key) ?? false;
}

function getHotkeyCode(key: string) {
  if (/^[a-z]$/.test(key)) return `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  return undefined;
}

function getPageUrl(environment?: ReviewEnvironment) {
  const location = environment?.window.location ?? window.location;
  return `${location.origin}${location.pathname}${getPublicSearch(location)}`;
}

function getNormalizedPath(environment?: ReviewEnvironment) {
  const location = environment?.window.location ?? window.location;
  const path = location.pathname.replace(/\/index\.html$/, '/');
  return `${path}${getPublicSearch(location)}`;
}

function getPublicSearch(location: Location) {
  const params = new URLSearchParams(location.search);

  INTERNAL_QUERY_PARAMS.forEach((key) => params.delete(key));

  const value = params.toString();
  return value ? `?${value}` : '';
}

function createId() {
  if ('randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCaptureDraftMeta(draft: CaptureDraft) {
  const parts = [`viewport ${formatSize(draft.viewport)}`];

  if (draft.screenshot) {
    parts.push(`capture ${formatSize(draft.screenshot)}`);
  }

  return parts.join(' / ');
}

function formatTextDraftMeta(draft: TextDraft) {
  const parts = [
    `viewport ${formatSize(draft.viewport)}`,
    `point ${formatPoint(draft.marker.viewport)}`,
  ];

  if (draft.anchor) {
    parts.push(`dom ${draft.anchor.strategy}`);
  }

  return parts.join(' / ');
}

function formatItemMeta(item: ReviewItem) {
  const parts = [formatDate(item.createdAt)];

  if (item.viewport) {
    parts.push(`viewport ${formatSize(item.viewport)}`);
  }

  if (item.marker) {
    parts.push(`point ${formatPoint(item.marker.viewport)}`);
  }

  if (item.anchor) {
    parts.push(`dom ${item.anchor.strategy}`);
  }

  if (item.screenshot) {
    parts.push(`capture ${formatSize(item.screenshot)}`);
  }

  return parts.join(' / ');
}

function formatSize(size: ViewportSize) {
  return `${Math.round(size.width)}x${Math.round(size.height)}`;
}

function formatPoint(point: ReviewPoint) {
  return `${Math.round(point.x)},${Math.round(point.y)}`;
}

function getViewportSize(environment?: ReviewEnvironment): ViewportSize {
  const targetWindow = environment?.window ?? window;
  return {
    width: targetWindow.innerWidth,
    height: targetWindow.innerHeight,
  };
}

function roundPoint(point: ReviewPoint): ReviewPoint {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

function isPointInViewport(
  point: ReviewPoint,
  environment?: ReviewEnvironment
) {
  const viewport = getViewportSize(environment);
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x <= viewport.width &&
    point.y <= viewport.height
  );
}

function clampPoint(point: ReviewPoint, environment?: ReviewEnvironment) {
  const viewport = getViewportSize(environment);
  return {
    x: clamp(point.x, 0, viewport.width),
    y: clamp(point.y, 0, viewport.height),
  };
}

function getPopoverPosition(point: ReviewPoint) {
  const width = Math.min(320, Math.max(240, window.innerWidth - 24));
  const estimatedHeight = 178;
  const offset = 12;
  const margin = 12;

  return {
    left: clamp(point.x + offset, margin, window.innerWidth - width - margin),
    top: clamp(
      point.y + offset,
      margin,
      window.innerHeight - estimatedHeight - margin
    ),
  };
}

function toHostPoint(point: ReviewPoint, environment?: ReviewEnvironment) {
  if (!environment) return point;

  return {
    x: point.x + environment.viewportRect.left,
    y: point.y + environment.viewportRect.top,
  };
}

function toTargetPoint(point: ReviewPoint, environment?: ReviewEnvironment) {
  if (!environment) return point;

  return {
    x: point.x - environment.viewportRect.left,
    y: point.y - environment.viewportRect.top,
  };
}

function toTargetPointFromHostEvent(
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
  environment?: ReviewEnvironment
) {
  return toTargetPoint(
    {
      x: event.clientX,
      y: event.clientY,
    },
    environment
  );
}

function placeLayerOverTarget(
  layer: HTMLElement,
  environment: ReviewEnvironment
) {
  layer.style.left = `${environment.viewportRect.left}px`;
  layer.style.top = `${environment.viewportRect.top}px`;
  layer.style.width = `${environment.viewportRect.width}px`;
  layer.style.height = `${environment.viewportRect.height}px`;
  layer.style.right = 'auto';
  layer.style.bottom = 'auto';
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function roundRatio(value: number) {
  return Math.round(value * 10000) / 10000;
}

function cssEscape(value: string) {
  if ('CSS' in window && typeof window.CSS.escape === 'function') {
    return window.CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function createNoopController(): WebReviewKitController {
  return {
    open() {},
    close() {},
    toggle() {},
    destroy() {},
  };
}

function createStyleElement() {
  const style = document.createElement('style');
  style.textContent = `
    :host {
      color-scheme: dark;
      font-family:
        Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
        "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .dfwr-shell {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      pointer-events: none;
    }

    .dfwr-shell.is-open {
      display: block;
    }

    .dfwr-panel {
      position: fixed;
      right: 16px;
      top: 16px;
      z-index: 3;
      width: min(380px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
      pointer-events: auto;
      color: #f7f7f2;
      background: #1f2428;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
    }

    .dfwr-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 14px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .dfwr-title {
      font-size: 15px;
      font-weight: 700;
      line-height: 1.25;
    }

    .dfwr-meta {
      max-width: 292px;
      margin-top: 4px;
      overflow: hidden;
      color: rgba(247, 247, 242, 0.56);
      font-size: 11px;
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dfwr-toolbar,
    .dfwr-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 14px;
    }

    .dfwr-body,
    .dfwr-list {
      padding: 0 14px 14px;
    }

    .dfwr-list {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 12px;
    }

    .dfwr-button,
    .dfwr-icon-button {
      appearance: none;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: #2c3338;
      color: #f7f7f2;
      cursor: pointer;
      font: inherit;
    }

    .dfwr-button {
      min-height: 34px;
      padding: 0 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 650;
    }

    .dfwr-button:hover,
    .dfwr-icon-button:hover,
    .dfwr-button.is-active {
      border-color: rgba(255, 255, 255, 0.4);
      background: #3b444b;
    }

    .dfwr-button.is-primary {
      border-color: #d7ff5f;
      background: #d7ff5f;
      color: #171b1e;
    }

    .dfwr-icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      text-transform: uppercase;
    }

    .dfwr-marker-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }

    .dfwr-bound-marker {
      position: fixed;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      transform: translate(-50%, -50%);
      border: 1px solid #d7ff5f;
      border-radius: 999px;
      background: #1f2428;
      box-shadow: 0 0 0 4px rgba(215, 255, 95, 0.18);
      color: #d7ff5f;
      font-size: 10px;
      font-weight: 800;
    }

    .dfwr-bound-marker.is-fallback {
      border-color: #ffb7a7;
      box-shadow: 0 0 0 4px rgba(255, 183, 167, 0.18);
      color: #ffb7a7;
    }

    .dfwr-note-draft {
      position: fixed;
      inset: 0;
      z-index: 4;
      pointer-events: none;
    }

    .dfwr-note-pin {
      appearance: none;
      position: fixed;
      z-index: 5;
      width: 18px;
      height: 18px;
      padding: 0;
      transform: translate(-50%, -50%);
      border: 2px solid #1f2428;
      border-radius: 999px;
      background: #d7ff5f;
      box-shadow:
        0 0 0 4px rgba(215, 255, 95, 0.22),
        0 8px 18px rgba(0, 0, 0, 0.28);
      cursor: grab;
      pointer-events: auto;
    }

    .dfwr-note-pin:active {
      cursor: grabbing;
    }

    .dfwr-note-popover {
      position: fixed;
      z-index: 4;
      width: min(320px, calc(100vw - 24px));
      padding: 12px;
      pointer-events: auto;
      color: #f7f7f2;
      background: #1f2428;
      border: 1px solid rgba(215, 255, 95, 0.56);
      border-radius: 8px;
      box-shadow: 0 16px 38px rgba(0, 0, 0, 0.32);
    }

    .dfwr-note-popover .dfwr-actions {
      padding: 0;
    }

    .dfwr-form {
      display: grid;
      gap: 10px;
    }

    .dfwr-textarea {
      width: 100%;
      min-height: 92px;
      resize: vertical;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 6px;
      padding: 10px;
      color: #f7f7f2;
      background: #15191d;
      font: inherit;
      font-size: 13px;
      line-height: 1.45;
    }

    .dfwr-textarea:focus {
      outline: 2px solid rgba(215, 255, 95, 0.6);
      outline-offset: 1px;
    }

    .dfwr-empty,
    .dfwr-error {
      margin: 0;
      color: rgba(247, 247, 242, 0.62);
      font-size: 12px;
      line-height: 1.45;
    }

    .dfwr-error {
      color: #ffb7a7;
    }

    .dfwr-preview,
    .dfwr-thumb {
      display: block;
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 6px;
      object-fit: cover;
      background: #111;
    }

    .dfwr-preview {
      max-height: 180px;
    }

    .dfwr-thumb {
      max-height: 120px;
      margin-top: 10px;
    }

    .dfwr-list-heading {
      margin-bottom: 10px;
      color: rgba(247, 247, 242, 0.74);
      font-size: 12px;
      font-weight: 700;
    }

    .dfwr-item {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      padding: 12px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .dfwr-item:first-of-type {
      border-top: 0;
    }

    .dfwr-item-body {
      min-width: 0;
      flex: 1;
    }

    .dfwr-item-kind {
      color: #d7ff5f;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .dfwr-item-comment {
      margin: 4px 0;
      color: #f7f7f2;
      font-size: 13px;
      line-height: 1.42;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .dfwr-item-date {
      color: rgba(247, 247, 242, 0.46);
      font-size: 11px;
    }

    .dfwr-item-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 0 0 auto;
    }

    .dfwr-text-layer,
    .dfwr-capture-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: auto;
    }

    .dfwr-text-layer {
      cursor: text;
      background: rgba(0, 0, 0, 0.06);
    }

    .dfwr-capture-layer {
      cursor: crosshair;
      background: rgba(0, 0, 0, 0.22);
    }

    .dfwr-capture-box {
      position: fixed;
      z-index: 2;
      width: 0;
      height: 0;
      border: 1px solid #d7ff5f;
      background: rgba(215, 255, 95, 0.16);
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.18);
    }

    @media (max-width: 520px) {
      .dfwr-panel {
        right: 8px;
        top: 8px;
        width: calc(100vw - 16px);
        max-height: calc(100vh - 16px);
      }
    }
  `;
  return style;
}
