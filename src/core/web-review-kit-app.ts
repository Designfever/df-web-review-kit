import { localAdapter } from '../adapters/local';
import { normalizeRoutePath } from '../route';
import type {
  DomAnchor,
  DomAnchorCandidate,
  DomSourceHint,
  NumberedReviewItem,
  RelativeSelection,
  ReviewItem,
  ReviewItemScope,
  ReviewMarker,
  ReviewMode,
  ReviewPoint,
  ReviewSelection,
  ViewportSize,
  WebReviewKitAdapter,
  WebReviewKitController,
  WebReviewKitOptions,
} from '../types';
import { createStyleElement } from './overlay-style';
import {
  getNumberedReviewItems,
  getReviewViewportScope,
} from './review-scope';

interface ViewportSelection {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface AreaDraft {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker?: ReviewMarker;
  selection?: ReviewSelection;
}

interface NoteDraft {
  viewport: ViewportSize;
  anchor?: DomAnchor;
  marker: ReviewMarker;
  selection?: ReviewSelection;
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
  overlayRect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

type ReviewItemHighlightMode = 'note' | 'area' | 'dom';
interface ReviewItemHighlightSelection {
  viewport: ViewportSelection;
  isBound: boolean;
}

const ROOT_ID = 'df-web-review-kit-root';
const INTERNAL_QUERY_PARAMS = ['__dfwr_target'];
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
  private root?: HTMLDivElement;
  private shadow?: ShadowRoot;
  private panel?: HTMLDivElement;
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

    this.shadow.replaceChildren();
    this.shadow.append(createStyleElement());
    this.shadow.append(this.createHiddenItemsStyleElement());

    const shell = document.createElement('div');
    shell.className = `dfwr-shell${this.isOpen ? ' is-open' : ''}`;
    shell.setAttribute('aria-hidden', this.isOpen ? 'false' : 'true');

    if (this.options.ui?.panel !== false) {
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
    } else {
      this.panel = undefined;
    }

    shell.append(this.createMarkerLayer());

    if (this.isOpen && (this.mode === 'note' || this.mode === 'element')) {
      shell.append(
        this.noteDraft
          ? this.createNotePopover(this.noteDraft)
          : this.mode === 'element'
            ? this.createElementLayer()
            : this.createNoteLayer()
      );
    }

    if (this.isOpen && this.mode === 'area' && !this.areaDraft) {
      shell.append(this.createAreaLayer());
    }

    if (
      this.isOpen &&
      this.mode === 'area' &&
      this.areaDraft &&
      this.options.ui?.panel === false
    ) {
      if (this.areaDraft.selection) {
        shell.append(this.createAreaDraftOverlay(this.areaDraft));
      }
      shell.append(this.createAreaDraftPopover(this.areaDraft));
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
    meta.textContent = getRouteKey(this.getEnvironment());

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
      this.createToolbarButton('Note', this.mode === 'note', () => {
        this.setModeState(this.mode === 'note' ? 'idle' : 'note');
        this.noteDraft = undefined;
        this.areaDraft = undefined;
        this.render();
      }),
      this.createToolbarButton('Element', this.mode === 'element', () => {
        this.setModeState(this.mode === 'element' ? 'idle' : 'element');
        this.noteDraft = undefined;
        this.areaDraft = undefined;
        this.render();
      }),
      this.createToolbarButton(
        this.isSelectingArea ? 'Selecting' : 'Area',
        this.mode === 'area',
        () => {
          this.setModeState(this.mode === 'area' ? 'idle' : 'area');
          this.noteDraft = undefined;
          this.areaDraft = undefined;
          this.render();
        }
      ),
      this.createToolbarButton('Refresh', false, () => {
        void this.reload();
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
      empty.textContent = 'Add a note or mark an area.';
      body.append(empty);
      return body;
    }

    if (this.mode === 'note' || this.mode === 'element') {
      body.append(this.createNoteBody());
      return body;
    }

    body.append(this.createAreaForm());
    return body;
  }

  private createNoteBody() {
    const empty = document.createElement('p');
    empty.className = 'dfwr-empty';
    empty.textContent = this.noteDraft
      ? 'Write the note in the page box.'
      : this.mode === 'element'
        ? 'Click an element to add QA.'
        : 'Click on the page to place a note.';
    return empty;
  }

  private createNotePopover(draft: NoteDraft) {
    const environment = this.getEnvironment();
    const group = document.createElement('div');
    group.className = 'dfwr-note-draft';
    if (!environment) return group;

    const hostPoint = toHostPoint(draft.marker.viewport, environment);

    if (draft.selection) {
      group.append(
        this.createSelectionHighlight(
          toViewportSelection(draft.selection.viewport),
          environment,
          true
        )
      );
    }

    const pin = document.createElement('button');
    pin.className = 'dfwr-note-pin';
    pin.type = 'button';
    pin.setAttribute('aria-label', 'Move note point');
    pin.style.left = `${hostPoint.x}px`;
    pin.style.top = `${hostPoint.y}px`;

    const popover = document.createElement('div');
    const position = getPopoverPosition(hostPoint, environment);

    popover.className = 'dfwr-note-popover';
    popover.style.left = `${position.left}px`;
    popover.style.top = `${position.top}px`;

    const form = document.createElement('form');
    form.className = 'dfwr-form';

    const meta = document.createElement('div');
    meta.className = 'dfwr-item-date';
    meta.textContent = formatNoteDraftMeta(draft);

    const textarea = document.createElement('textarea');
    textarea.className = 'dfwr-textarea';
    textarea.placeholder = 'Review comment';
    textarea.rows = 4;
    textarea.value = draft.comment ?? '';
    textarea.addEventListener('input', () => {
      if (!this.noteDraft) return;
      this.noteDraft = {
        ...this.noteDraft,
        comment: textarea.value,
      };
    });

    const actions = this.createFormActions('Save note', () => {
      const comment = textarea.value.trim();
      if (!comment) return;
      void this.createItem({
        kind: 'note',
        comment,
        viewport: draft.viewport,
        anchor: draft.anchor,
        marker: draft.marker,
        selection: draft.selection,
      });
    });

    form.append(meta, textarea, actions);
    popover.append(form);
    group.append(pin, popover);

    this.attachDraftPinDrag(pin, popover, meta, textarea);

    window.setTimeout(() => textarea.focus(), 0);

    return group;
  }

  private createAreaForm() {
    const form = document.createElement('form');
    form.className = 'dfwr-form';

    if (!this.areaDraft) {
      const empty = document.createElement('p');
      empty.className = 'dfwr-empty';
      empty.textContent = 'Drag on the page to select an area.';
      form.append(empty);
      return form;
    }

    const meta = document.createElement('div');
    meta.className = 'dfwr-item-date';
    meta.textContent = formatAreaDraftMeta(this.areaDraft);
    form.append(meta);

    const textarea = document.createElement('textarea');
    textarea.className = 'dfwr-textarea';
    textarea.placeholder = 'Area comment';
    textarea.rows = 4;

    const actions = this.createFormActions('Save area', () => {
      const comment = textarea.value.trim();
      if (!comment || !this.areaDraft) return;
      void this.createItem({
        kind: 'area',
        comment,
        viewport: this.areaDraft.viewport,
        anchor: this.areaDraft.anchor,
        marker: this.areaDraft.marker,
        selection: this.areaDraft.selection,
      });
    });

    form.append(textarea, actions);
    return form;
  }

  private createAreaDraftOverlay(draft: AreaDraft) {
    const layer = document.createElement('div');
    layer.className = 'dfwr-area-preview-layer';

    const environment = this.getEnvironment();
    if (!environment || !draft.selection) return layer;

    const selection = toViewportSelection(draft.selection.viewport);
    layer.append(this.createSelectionHighlight(selection, environment, true));

    if (draft.marker) {
      const hostPoint = toHostPoint(draft.marker.viewport, environment);
      layer.append(
        this.createMarkerElement(
          undefined,
          hostPoint,
          '•',
          getReviewViewportScope(
            draft.viewport,
            this.options.viewports?.presets
          ),
          true,
          true
        )
      );
    }

    return layer;
  }

  private createAreaDraftPopover(draft: AreaDraft) {
    const environment = this.getEnvironment();
    const popover = document.createElement('div');
    popover.className = 'dfwr-area-draft';
    if (environment && draft.selection) {
      const selection = toHostSelection(
        toViewportSelection(draft.selection.viewport),
        environment
      );
      const position = getAreaPopoverPosition(selection, environment);
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;
      popover.style.right = 'auto';
    }
    popover.append(this.createAreaForm());
    return popover;
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
      this.setModeState('idle');
      this.noteDraft = undefined;
      this.areaDraft = undefined;
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
    heading.textContent = `Review items (${this.items.length})`;
    section.append(heading);

    if (this.items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'dfwr-empty';
      empty.textContent = 'No review items on this page.';
      section.append(empty);
      return section;
    }

    for (const numberedItem of getNumberedReviewItems(
      this.items,
      this.options.viewports?.presets
    )) {
      section.append(this.createListItem(numberedItem));
    }

    return section;
  }

  private createListItem(numberedItem: NumberedReviewItem) {
    const { item } = numberedItem;
    const row = document.createElement('article');
    row.className = 'dfwr-item';
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute(
      'aria-label',
      `Restore review item: ${item.title ?? item.comment}`
    );
    row.addEventListener('click', () => {
      void this.restoreItem(item);
    });
    row.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      void this.restoreItem(item);
    });

    const body = document.createElement('div');
    body.className = 'dfwr-item-body';

    const badges = document.createElement('div');
    badges.className = 'dfwr-item-badges';

    const scope = document.createElement('div');
    scope.className = `dfwr-item-scope is-scope-${numberedItem.scope}`;
    scope.textContent = numberedItem.displayLabel;

    const kind = document.createElement('div');
    kind.className = 'dfwr-item-kind';
    kind.textContent = item.kind;
    badges.append(scope, kind);

    const comment = document.createElement('p');
    comment.className = 'dfwr-item-comment';
    comment.textContent = item.comment;

    const date = document.createElement('time');
    date.className = 'dfwr-item-date';
    date.dateTime = item.createdAt;
    date.textContent = formatItemMeta(item);

    body.append(badges, comment, date);

    const actions = document.createElement('div');
    actions.className = 'dfwr-item-actions';
    actions.addEventListener('click', (event) => event.stopPropagation());
    actions.addEventListener('keydown', (event) => event.stopPropagation());

    const remove = document.createElement('button');
    remove.className = 'dfwr-icon-button';
    remove.type = 'button';
    remove.textContent = 'x';
    remove.setAttribute('aria-label', 'Delete');
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      void this.adapter
        .remove(item.id)
        .then(() => this.reload());
    });

    actions.append(remove);
    row.append(body, actions);
    return row;
  }

  private createMarkerLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-marker-layer';
    const environment = this.getEnvironment();
    if (!environment) return layer;

    const currentScope = getReviewViewportScope(
      getViewportSize(environment),
      this.options.viewports?.presets
    );

    getNumberedReviewItems(
      this.items,
      this.options.viewports?.presets
    ).forEach((numberedItem) => {
      const { item, scope, number, displayLabel } = numberedItem;
      if (!shouldShowMarkerForScope(scope, currentScope)) {
        return;
      }

      const isHighlighted = item.id === this.highlightedItemId;
      const highlightMode = getReviewItemHighlightMode(item);
      if (highlightMode !== 'note') {
        const selection = getItemHighlightSelection(item, environment);
        if (selection) {
          layer.append(
            ...this.createItemHighlightElements(
              selection.viewport,
              environment,
              item,
              String(number),
              selection.isBound,
              isHighlighted
            )
          );
          return;
        }
      }

      const point = getBoundMarkerPoint(item, environment);
      if (!point || !isPointInViewport(point.viewport, environment)) {
        return;
      }

      const hostPoint = toHostPoint(point.viewport, environment);
      const marker = this.createMarkerElement(
        item.id,
        hostPoint,
        String(number),
        scope,
        point.isBound,
        isHighlighted,
        highlightMode === 'note' ? 'note' : 'default'
      );
      marker.title = `${displayLabel} / ${item.comment}\n${formatItemMeta(item)}`;
      layer.append(marker);
    });

    return layer;
  }

  private createItemHighlightElements(
    selection: ViewportSelection,
    environment: ReviewEnvironment,
    item: ReviewItem,
    label: string,
    isBound: boolean,
    isHighlighted: boolean
  ) {
    const rect = toHostSelection(selection, environment);
    const mode = getReviewItemHighlightMode(item);
    const highlight = document.createElement('div');
    highlight.className = [
      'dfwr-item-target-highlight',
      `is-mode-${mode}`,
      isBound ? 'is-bound' : 'is-fallback',
      isHighlighted ? 'is-highlighted' : '',
    ]
      .filter(Boolean)
      .join(' ');
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.dataset.reviewItemId = item.id;

    const labelElement = document.createElement('div');
    labelElement.className = [
      'dfwr-item-target-label',
      `is-mode-${mode}`,
      isHighlighted ? 'is-highlighted' : '',
    ]
      .filter(Boolean)
      .join(' ');
    labelElement.textContent = `#${label}`;
    labelElement.style.left = `${Math.max(4, rect.left)}px`;
    labelElement.style.top = `${Math.max(4, rect.top - 24)}px`;
    labelElement.dataset.reviewItemId = item.id;

    return [highlight, labelElement];
  }

  private createSelectionHighlight(
    selection: ViewportSelection,
    environment: ReviewEnvironment,
    isDraft: boolean
  ) {
    const rect = toHostSelection(selection, environment);
    const highlight = document.createElement('div');
    highlight.className = `dfwr-selection-highlight${
      isDraft ? ' is-draft' : ''
    }`;
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    return highlight;
  }

  private createMarkerElement(
    itemId: string | undefined,
    hostPoint: ReviewPoint,
    label: string,
    scope: ReviewItemScope,
    isBound: boolean,
    isHighlighted: boolean,
    variant: 'default' | 'note' = 'default'
  ) {
    const isNoteCallout = variant === 'note';
    const marker = document.createElement('div');
    marker.className = [
      'dfwr-bound-marker',
      isNoteCallout ? 'is-note-callout' : '',
      `is-scope-${scope}`,
      isBound ? 'is-bound' : 'is-fallback',
      isHighlighted ? 'is-highlighted' : '',
    ]
      .filter(Boolean)
      .join(' ');
    marker.style.left = `${hostPoint.x}px`;
    marker.style.top = `${hostPoint.y}px`;
    marker.dataset.scope = scope;
    if (itemId) {
      marker.dataset.reviewItemId = itemId;
    }

    const iconElement = document.createElement('span');
    iconElement.className = 'dfwr-bound-marker-icon';
    iconElement.setAttribute('aria-hidden', 'true');
    const labelElement = document.createElement('span');
    labelElement.className = 'dfwr-bound-marker-number';
    labelElement.textContent = isNoteCallout ? `#${label}` : label;
    marker.append(iconElement, labelElement);

    return marker;
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
      const position = getPopoverPosition(nextHostPoint, environment);

      pin.style.left = `${nextHostPoint.x}px`;
      pin.style.top = `${nextHostPoint.y}px`;
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;

      if (!this.noteDraft) return;

      this.noteDraft = {
        ...this.noteDraft,
        marker: {
          ...this.noteDraft.marker,
          viewport: roundPoint(nextPoint),
        },
        comment: textarea.value,
      };
      meta.textContent = formatNoteDraftMeta(this.noteDraft);
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

      const nextPoint = toTargetPointFromHostEvent(event, this.getEnvironment());
      void (this.mode === 'element'
        ? this.bindElementDraftToPoint(nextPoint, textarea.value)
        : this.bindNoteDraftToPoint(nextPoint, textarea.value));
    });
  }

  private createNoteLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-text-layer';
    const environment = this.getEnvironment();

    if (environment) {
      placeLayerOverTarget(layer, environment);
    }

    layer.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.createNoteDraft(
        toTargetPointFromHostEvent(event, this.getEnvironment())
      );
    });

    return layer;
  }

  private createElementLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-element-layer';
    const environment = this.getEnvironment();
    const hover = document.createElement('div');
    hover.className = 'dfwr-dom-hover';
    hover.hidden = true;
    layer.append(hover);

    if (environment) {
      placeLayerOverTarget(layer, environment);
    }

    const updateHover = (point: ReviewPoint) => {
      const nextEnvironment = this.getEnvironment();
      if (!nextEnvironment) return;

      const anchor = getDomAnchorFromPoint(
        clampPoint(point, nextEnvironment),
        this.options.anchors?.attribute,
        nextEnvironment
      );
      const selection = anchor
        ? getElementViewportSelection(anchor, nextEnvironment)
        : undefined;

      if (!selection) {
        hover.hidden = true;
        return;
      }

      const rect = toHostSelection(selection, nextEnvironment);
      hover.hidden = false;
      hover.style.left = `${rect.left}px`;
      hover.style.top = `${rect.top}px`;
      hover.style.width = `${rect.width}px`;
      hover.style.height = `${rect.height}px`;
    };

    layer.addEventListener('pointermove', (event) => {
      updateHover(toTargetPointFromHostEvent(event, this.getEnvironment()));
    });

    layer.addEventListener('pointerleave', () => {
      hover.hidden = true;
    });

    layer.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.createElementDraft(
        toTargetPointFromHostEvent(event, this.getEnvironment())
      );
    });

    return layer;
  }

  private async createNoteDraft(point: ReviewPoint) {
    await this.bindNoteDraftToPoint(point);
  }

  private async createElementDraft(point: ReviewPoint) {
    await this.bindElementDraftToPoint(point);
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
      const anchor = getDomAnchorFromPoint(
        nextPoint,
        this.options.anchors?.attribute,
        environment
      );
      const elementSelection = anchor
        ? getElementViewportSelection(anchor, environment)
        : undefined;
      const selection = elementSelection ?? getPointSelection(nextPoint);
      const markerPoint = getSelectionCenter(selection);
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
      };
    });

    this.noteDraft = draft;
    this.render();
  }

  private createAreaLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-area-layer';
    const environment = this.getEnvironment();

    if (environment) {
      placeLayerOverTarget(layer, environment);
    }

    const box = document.createElement('div');
    box.className = 'dfwr-area-box';
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

      this.isSelectingArea = true;
      this.render();
      void this.createAreaDraft(selection);
    });

    return layer;
  }

  private async createAreaDraft(selection: ViewportSelection) {
    const environment = this.getEnvironment();
    if (!environment) return;

    const viewport = getViewportSize(environment);

    this.areaDraft = await this.withOverlayHidden(() => {
      const anchor = getDomAnchor(
        selection,
        this.options.anchors?.attribute,
        environment
      );
      const relativeSelection = anchor
        ? getRelativeSelection(selection, anchor, environment)
        : undefined;
      const marker = createSelectionCenterMarker(
        selection,
        anchor,
        environment
      );
      const reviewSelection: ReviewSelection = {
        viewport: toPublicSelection(selection),
        relative: relativeSelection,
      };

      return {
        viewport,
        anchor,
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
      return await callback();
    } finally {
      this.root.style.display = previousDisplay;
    }
  }

  private async createItem(
    input: Pick<ReviewItem, 'kind' | 'comment'> &
      Partial<
        Pick<ReviewItem, 'scope' | 'viewport' | 'anchor' | 'marker' | 'selection'>
      >
  ) {
    const environment = this.getEnvironment();
    if (!environment) return;

    const now = new Date().toISOString();
    const routeKey = getRouteKey(environment);
    const viewport = input.viewport ?? getViewportSize(environment);
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

    await this.adapter.create(item);
    this.setModeState('idle');
    this.noteDraft = undefined;
    this.areaDraft = undefined;
    this.highlightItem(item.id);
    await this.reload();
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
  return getDomAnchorFromPoint({ x, y }, configuredAttribute, environment);
}

function getDomAnchorFromPoint(
  point: ReviewPoint,
  configuredAttribute = 'data-qa-id',
  environment: ReviewEnvironment
): DomAnchor | undefined {
  const target = environment.document.elementFromPoint(point.x, point.y);
  if (!target) return undefined;

  const candidates = createAnchorCandidates(target, configuredAttribute);
  const primary = candidates[0];
  if (!primary) return undefined;

  return {
    ...primary,
    candidates,
    htmlSnippet: getElementHtmlSnippet(
      getAnchorSourceElement(target, primary, configuredAttribute) ?? target
    ),
    source: getDomSourceHint(target),
  };
}

function getElementViewportSelection(
  anchor: DomAnchor,
  environment: ReviewEnvironment
): ViewportSelection | undefined {
  const element = getAnchorElement(anchor, environment);
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return undefined;

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function createAnchorCandidates(
  target: Element,
  configuredAttribute: string
): DomAnchorCandidate[] {
  const candidates: DomAnchorCandidate[] = [];

  const anchoredByAttribute = target.closest(`[${configuredAttribute}]`);
  if (anchoredByAttribute) {
    const value = anchoredByAttribute.getAttribute(configuredAttribute);
    if (value) {
      candidates.push({
        selector: `[${configuredAttribute}="${cssEscape(value)}"]`,
        strategy: 'configured-attribute',
        confidence: 0.98,
        textFingerprint: getTextFingerprint(anchoredByAttribute),
      });
    }
  }

  if (isMeaningfulId(target.id)) {
    candidates.push({
      selector: `#${cssEscape(target.id)}`,
      strategy: 'id',
      confidence: 0.94,
      textFingerprint: getTextFingerprint(target),
    });
  }

  const targetClassName = getMeaningfulClassName(target);
  if (targetClassName) {
    candidates.push({
      selector: `${target.tagName.toLowerCase()}.${cssEscape(targetClassName)}`,
      strategy: 'class',
      confidence: 0.82,
      textFingerprint: getTextFingerprint(target),
    });
  }

  candidates.push({
    selector: getDomPath(target),
    strategy: 'dom-path',
    confidence: 0.9,
    textFingerprint: getTextFingerprint(target),
  });

  const parent = target.parentElement;
  const anchoredById = parent
    ? findClosest(parent, (element) => isMeaningfulId(element.id))
    : undefined;
  if (anchoredById?.id) {
    candidates.push({
      selector: `#${cssEscape(anchoredById.id)}`,
      strategy: 'id',
      confidence: 0.72,
      textFingerprint: getTextFingerprint(anchoredById),
    });
  }

  const anchoredByClass = parent
    ? findClosest(parent, (element) => Boolean(getMeaningfulClassName(element)))
    : undefined;
  const className = anchoredByClass
    ? getMeaningfulClassName(anchoredByClass)
    : undefined;

  if (anchoredByClass && className) {
    candidates.push({
      selector: `${anchoredByClass.tagName.toLowerCase()}.${cssEscape(
        className
      )}`,
      strategy: 'class',
      confidence: 0.58,
      textFingerprint: getTextFingerprint(anchoredByClass),
    });
  }

  return dedupeAnchorCandidates(candidates);
}

function getAnchorSourceElement(
  target: Element,
  candidate: DomAnchorCandidate,
  configuredAttribute: string
) {
  if (candidate.strategy === 'configured-attribute') {
    return target.closest(`[${configuredAttribute}]`);
  }

  if (candidate.strategy === 'dom-path') return target;

  try {
    return target.closest(candidate.selector);
  } catch {
    return target;
  }
}

function getElementHtmlSnippet(element: Element, maxLength = 1000) {
  const html = decodeHtmlEntities(element.outerHTML.replace(/\s+/g, ' ').trim());
  if (html.length <= maxLength) return html;
  return `${html.slice(0, maxLength - 3)}...`;
}

function decodeHtmlEntities(value: string) {
  return value.replace(
    /&(#\d+|#x[\da-f]+|lt|gt|quot|apos|amp);/gi,
    (match, entity: string) => {
      const normalized = entity.toLowerCase();

      if (normalized === 'lt') return '<';
      if (normalized === 'gt') return '>';
      if (normalized === 'quot') return '"';
      if (normalized === 'apos') return "'";
      if (normalized === 'amp') return '&';

      const codePoint = normalized.startsWith('#x')
        ? Number.parseInt(normalized.slice(2), 16)
        : Number.parseInt(normalized.slice(1), 10);

      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : match;
    }
  );
}

function getDomSourceHint(target: Element): DomSourceHint | undefined {
  const sourceElement = target.closest(
    '[data-file], [data-component], [data-section-index], [data-section-id]'
  );
  if (!sourceElement) return undefined;

  const dataset = (sourceElement as HTMLElement).dataset;
  const source: DomSourceHint = {
    component: dataset.component,
    file: dataset.file,
    sectionId: dataset.sectionId,
    sectionIndex: dataset.sectionIndex,
  };

  return Object.values(source).some(Boolean) ? source : undefined;
}

function getRelativeSelection(
  selection: ViewportSelection,
  anchor: DomAnchor | string,
  environment: ReviewEnvironment
): RelativeSelection | undefined {
  const element = getAnchorElement(anchor, environment);
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
  anchor: DomAnchor | string,
  environment: ReviewEnvironment
): ReviewPoint | undefined {
  const element = getAnchorElement(anchor, environment);
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
  const marker = getItemMarker(item);
  if (!marker) return undefined;

  if (item.anchor && marker.relative) {
    const resolved = resolveAnchorElement(item.anchor, environment);
    const element = resolved?.element;

    if (element) {
      const rect = element.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: roundPoint({
            x: rect.left + rect.width * marker.relative.x,
            y: rect.top + rect.height * marker.relative.y,
          }),
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector,
        };
      }
    }
  }

  const sourceScroll = item.scroll ?? { x: 0, y: 0 };

  return {
    viewport: roundPoint({
      x: marker.viewport.x + sourceScroll.x - environment.window.scrollX,
      y: marker.viewport.y + sourceScroll.y - environment.window.scrollY,
    }),
    isBound: false,
    confidence: 0,
  };
}

function getBoundSelection(item: ReviewItem, environment: ReviewEnvironment) {
  const selection = getItemSelection(item);
  if (!selection?.viewport) return undefined;

  if (item.anchor && selection.relative) {
    const resolved = resolveAnchorElement(item.anchor, environment);
    const element = resolved?.element;

    if (element) {
      const rect = element.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: {
            left: rect.left + rect.width * selection.relative.x,
            top: rect.top + rect.height * selection.relative.y,
            width: rect.width * selection.relative.width,
            height: rect.height * selection.relative.height,
          },
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector,
        };
      }
    }
  }

  const sourceScroll = item.scroll ?? { x: 0, y: 0 };
  const viewportSelection = toViewportSelection(selection.viewport);

  return {
    viewport: {
      left: viewportSelection.left + sourceScroll.x - environment.window.scrollX,
      top: viewportSelection.top + sourceScroll.y - environment.window.scrollY,
      width: viewportSelection.width,
      height: viewportSelection.height,
    },
    isBound: false,
    confidence: 0,
  };
}

function getItemHighlightSelection(
  item: ReviewItem,
  environment: ReviewEnvironment
): ReviewItemHighlightSelection | undefined {
  if (item.kind === 'area') {
    return getVisibleHighlightSelection(
      [
        getBoundSelection(item, environment),
        getAnchorHighlightSelection(item, environment),
        getPointHighlightSelection(item, environment),
      ],
      environment
    );
  }

  if (isDomReviewItem(item)) {
    return getVisibleHighlightSelection(
      [
        getAnchorHighlightSelection(item, environment),
        getBoundSelection(item, environment),
        getPointHighlightSelection(item, environment),
      ],
      environment
    );
  }

  return getVisibleHighlightSelection(
    [
      getAnchorHighlightSelection(item, environment),
      getBoundSelection(item, environment),
      getPointHighlightSelection(item, environment),
    ],
    environment
  );
}

function getAnchorHighlightSelection(
  item: ReviewItem,
  environment: ReviewEnvironment
): ReviewItemHighlightSelection | undefined {
  if (!item.anchor) return undefined;

  const viewport = getElementViewportSelection(item.anchor, environment);
  if (!viewport) return undefined;

  return {
    viewport,
    isBound: true,
  };
}

function getPointHighlightSelection(
  item: ReviewItem,
  environment: ReviewEnvironment
): ReviewItemHighlightSelection | undefined {
  const point = getBoundMarkerPoint(item, environment);
  if (!point) return undefined;

  const size = 16;
  return {
    viewport: {
      left: point.viewport.x - size / 2,
      top: point.viewport.y - size / 2,
      width: size,
      height: size,
    },
    isBound: point.isBound,
  };
}

function getVisibleHighlightSelection(
  candidates: Array<ReviewItemHighlightSelection | undefined>,
  environment: ReviewEnvironment
): ReviewItemHighlightSelection | undefined {
  return candidates.find(
    (candidate): candidate is ReviewItemHighlightSelection =>
      Boolean(candidate && isSelectionInViewport(candidate.viewport, environment))
  );
}

function getReviewItemHighlightMode(
  item: ReviewItem
): ReviewItemHighlightMode {
  if (isDomReviewItem(item)) return 'dom';
  if (item.kind === 'area') return 'area';
  return 'note';
}

function isDomReviewItem(item: ReviewItem) {
  return (
    item.scope === 'dom' ||
    (item.kind === 'note' && Boolean(item.anchor && getItemSelection(item)))
  );
}

function getItemMarker(item: ReviewItem): ReviewMarker | undefined {
  if (item.marker) return item.marker;

  const selection = getItemSelection(item);
  if (!selection?.viewport) return undefined;

  return {
    viewport: roundPoint(getSelectionCenter(selection.viewport)),
    relative: selection.relative
      ? roundPoint(getSelectionCenter(selection.relative))
      : undefined,
  };
}

function getItemSelection(item: ReviewItem): ReviewSelection | undefined {
  const value = item.selection as ReviewSelection | RelativeSelection | undefined;
  if (!value) return undefined;

  if ('viewport' in value && isRelativeSelection(value.viewport)) {
    return value;
  }

  if (isRelativeSelection(value)) {
    return {
      viewport: value,
    };
  }

  return undefined;
}

function shouldShowMarkerForScope(
  scope: ReviewItemScope,
  currentScope: ReviewItemScope
) {
  return scope === currentScope;
}

function createSelectionCenterMarker(
  selection: ViewportSelection,
  anchor: DomAnchor | undefined,
  environment: ReviewEnvironment
): ReviewMarker {
  const centerPoint = getSelectionCenter(selection);

  return {
    viewport: roundPoint(centerPoint),
    relative: anchor ? getRelativePoint(centerPoint, anchor, environment) : undefined,
  };
}

function getAnchorElement(
  anchor: DomAnchor | string,
  environment: ReviewEnvironment
) {
  return typeof anchor === 'string'
    ? queryAnchorElement(anchor, environment)
    : resolveAnchorElement(anchor, environment)?.element;
}

function resolveAnchorElement(
  anchor: DomAnchor,
  environment: ReviewEnvironment
) {
  const matches = getAnchorCandidates(anchor).flatMap((candidate) => {
    const match = queryBestAnchorCandidate(
      candidate,
      candidate.textFingerprint ?? anchor.textFingerprint,
      environment
    );

    if (!match) return [];

    const confidence = roundRatio(
      (candidate.confidence ?? 0.5) * match.score
    );

    return [{
      element: match.element,
      candidate,
      confidence,
    }];
  });

  return matches.sort((a, b) => b.confidence - a.confidence)[0];
}

function getAnchorCandidates(anchor: DomAnchor) {
  return dedupeAnchorCandidates([
    anchor,
    ...(anchor.candidates ?? []),
  ]);
}

function dedupeAnchorCandidates(candidates: DomAnchorCandidate[]) {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function queryBestAnchorCandidate(
  candidate: DomAnchorCandidate,
  textFingerprint: string | undefined,
  environment: ReviewEnvironment
) {
  const elements = queryAnchorElements(candidate.selector, environment);
  if (elements.length === 0) return undefined;
  if (!textFingerprint) {
    return {
      element: elements[0],
      score: 1,
    };
  }

  return elements
    .map((element) => ({
      element,
      score: getTextFingerprintScore(
        textFingerprint,
        getTextFingerprint(element)
      ),
    }))
    .sort((a, b) => b.score - a.score)[0];
}

function queryAnchorElement(selector: string, environment: ReviewEnvironment) {
  return queryAnchorElements(selector, environment)[0];
}

function queryAnchorElements(selector: string, environment: ReviewEnvironment) {
  try {
    return Array.from(environment.document.querySelectorAll(selector));
  } catch {
    return [];
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

function toViewportSelection(selection: RelativeSelection): ViewportSelection {
  return {
    left: selection.x,
    top: selection.y,
    width: selection.width,
    height: selection.height,
  };
}

function toPublicSelection(selection: ViewportSelection): RelativeSelection {
  return {
    x: Math.round(selection.left),
    y: Math.round(selection.top),
    width: Math.round(selection.width),
    height: Math.round(selection.height),
  };
}

function getSelectionCenter(
  selection: ViewportSelection | RelativeSelection
): ReviewPoint {
  if ('left' in selection) {
    return {
      x: selection.left + selection.width / 2,
      y: selection.top + selection.height / 2,
    };
  }

  return {
    x: selection.x + selection.width / 2,
    y: selection.y + selection.height / 2,
  };
}

function isRelativeSelection(value: unknown): value is RelativeSelection {
  if (!value || typeof value !== 'object') return false;

  const selection = value as Partial<RelativeSelection>;
  return (
    typeof selection.x === 'number' &&
    typeof selection.y === 'number' &&
    typeof selection.width === 'number' &&
    typeof selection.height === 'number'
  );
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

function getTextFingerprintScore(expected?: string, actual?: string) {
  if (!expected) return 1;
  if (!actual) return 0.5;
  if (expected === actual) return 1;
  if (actual.includes(expected) || expected.includes(actual)) return 0.82;

  const expectedTokens = getFingerprintTokens(expected);
  const actualTokens = new Set(getFingerprintTokens(actual));
  if (expectedTokens.length === 0 || actualTokens.size === 0) return 0.5;

  const matches = expectedTokens.filter((token) => actualTokens.has(token));
  return clamp(matches.length / expectedTokens.length, 0.25, 0.76);
}

function getFingerprintTokens(value: string) {
  return value
    .toLowerCase()
    .split(/[\s/|,.:;()[\]{}"'`~!?<>]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function isMeaningfulId(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.length <= 1) return false;

  return ![
    'app',
    'main',
    'page',
    'root',
    '__next',
    '__nuxt',
  ].includes(normalized);
}

function getMeaningfulClassName(element: Element) {
  return Array.from(element.classList).find((name) => isMeaningfulClass(name));
}

function isMeaningfulClass(value: string) {
  const normalized = value.trim();
  if (
    [
      'absolute',
      'block',
      'contents',
      'fixed',
      'flex',
      'grid',
      'hidden',
      'relative',
      'sticky',
    ].includes(normalized)
  ) {
    return false;
  }

  return (
    normalized.length > 2 &&
    !normalized.includes(':') &&
    !/^(aspect|basis|bg|border|bottom|col|content|delay|duration|ease|font|from|gap|grow|h|inset|items|justify|leading|left|m|max-h|max-w|mb|ml|mr|mt|mx|my|min-h|min-w|object|opacity|order|origin|overflow|p|pb|pl|place|pointer|pr|pt|px|py|right|rotate|rounded|row|scale|self|shadow|shrink|text|to|top|tracking|transition|translate|via|w|z)-/.test(
      normalized
    ) &&
    !normalized.startsWith('mq-')
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
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}

function getOriginalUrl(environment?: ReviewEnvironment) {
  const location = environment?.window.location ?? window.location;
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}

function getRouteKey(environment?: ReviewEnvironment) {
  const location = environment?.window.location ?? window.location;
  return normalizeRoutePath(location.pathname);
}

function getNormalizedPath(environment?: ReviewEnvironment) {
  return getRouteKey(environment);
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

function formatAreaDraftMeta(draft: AreaDraft) {
  const parts = [`viewport ${formatSize(draft.viewport)}`];

  if (draft.selection) {
    parts.push(`rect ${formatSelection(draft.selection.viewport)}`);
  }

  if (draft.marker) {
    parts.push(`point ${formatPoint(draft.marker.viewport)}`);
  }

  return parts.join(' / ');
}

function formatNoteDraftMeta(draft: NoteDraft) {
  const parts = [
    `viewport ${formatSize(draft.viewport)}`,
    `point ${formatPoint(draft.marker.viewport)}`,
  ];

  if (draft.anchor) {
    parts.push(formatAnchorMeta(draft.anchor));
  }

  return parts.join(' / ');
}

function formatItemMeta(item: ReviewItem) {
  const parts = [formatDate(item.createdAt)];
  const marker = getItemMarker(item);
  const selection = getItemSelection(item);

  if (item.viewport) {
    parts.push(`viewport ${formatSize(item.viewport)}`);
  }

  if (marker) {
    parts.push(`point ${formatPoint(marker.viewport)}`);
  }

  if (selection) {
    parts.push(`rect ${formatSelection(selection.viewport)}`);
  }

  if (item.anchor) {
    parts.push(formatAnchorMeta(item.anchor));
  }

  return parts.join(' / ');
}

function formatSize(size: ViewportSize) {
  return `${Math.round(size.width)}x${Math.round(size.height)}`;
}

function formatPoint(point: ReviewPoint) {
  return `${Math.round(point.x)},${Math.round(point.y)}`;
}

function formatSelection(selection: RelativeSelection) {
  return [
    Math.round(selection.x),
    Math.round(selection.y),
    Math.round(selection.width),
    Math.round(selection.height),
  ].join(',');
}

function formatAnchorMeta(anchor: DomAnchor) {
  const parts = [`dom ${anchor.strategy}`];

  if (typeof anchor.confidence === 'number') {
    parts.push(`${Math.round(anchor.confidence * 100)}%`);
  }

  const candidates = getAnchorCandidates(anchor);
  if (candidates.length > 1) {
    parts.push(`${candidates.length} candidates`);
  }

  return parts.join(' ');
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

function runWithAutoScrollBehavior(
  targetDocument: Document,
  callback: () => void
) {
  const elements = [
    targetDocument.documentElement,
    targetDocument.body,
  ].filter((element): element is HTMLElement => Boolean(element));
  const previousValues = elements.map((element) => element.style.scrollBehavior);

  elements.forEach((element) => {
    element.style.scrollBehavior = 'auto';
  });

  try {
    callback();
  } finally {
    elements.forEach((element, index) => {
      element.style.scrollBehavior = previousValues[index] ?? '';
    });
  }
}

function setDocumentScrollInstantly(
  environment: ReviewEnvironment,
  position: { x: number; y: number }
) {
  const scrollElement = environment.document.scrollingElement as HTMLElement | null;

  if (scrollElement) {
    scrollElement.scrollLeft = Math.max(0, Math.round(position.x));
    scrollElement.scrollTop = Math.max(0, Math.round(position.y));
    return;
  }

  environment.window.scrollTo(
    Math.max(0, Math.round(position.x)),
    Math.max(0, Math.round(position.y))
  );
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

function isSelectionInViewport(
  selection: ViewportSelection,
  environment?: ReviewEnvironment
) {
  const viewport = getViewportSize(environment);
  return rectanglesIntersect(selection, {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height,
  });
}

function clampPoint(point: ReviewPoint, environment?: ReviewEnvironment) {
  const viewport = getViewportSize(environment);
  return {
    x: clamp(point.x, 0, viewport.width),
    y: clamp(point.y, 0, viewport.height),
  };
}

function getPopoverPosition(
  point: ReviewPoint,
  environment?: ReviewEnvironment,
  options?: {
    width?: number;
    estimatedHeight?: number;
    offset?: number;
  }
) {
  const bounds = getPopoverBounds(environment);
  const margin = 12;
  const width = Math.min(
    options?.width ?? 320,
    Math.max(240, bounds.width - margin * 2)
  );
  const estimatedHeight = options?.estimatedHeight ?? 178;
  const offset = options?.offset ?? 12;

  return {
    left: clamp(
      point.x + offset,
      bounds.left + margin,
      bounds.left + bounds.width - width - margin
    ),
    top: clamp(
      point.y + offset,
      bounds.top + margin,
      bounds.top + bounds.height - estimatedHeight - margin
    ),
  };
}

function getAreaPopoverPosition(
  selection: ViewportSelection,
  environment: ReviewEnvironment
) {
  return getPopoverPosition(
    {
      x: selection.left + selection.width,
      y: selection.top,
    },
    environment,
    {
      width: 360,
      estimatedHeight: 206,
    }
  );
}

function getPopoverBounds(environment?: ReviewEnvironment) {
  if (!environment) {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  return environment.overlayRect;
}

function toHostPoint(point: ReviewPoint, environment?: ReviewEnvironment) {
  if (!environment) return point;

  return {
    x: point.x + environment.viewportRect.left,
    y: point.y + environment.viewportRect.top,
  };
}

function toHostSelection(
  selection: ViewportSelection,
  environment: ReviewEnvironment
): ViewportSelection {
  return {
    left: selection.left + environment.viewportRect.left,
    top: selection.top + environment.viewportRect.top,
    width: selection.width,
    height: selection.height,
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
    setMode() {},
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
