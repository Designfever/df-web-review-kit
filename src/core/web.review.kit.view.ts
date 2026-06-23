import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemScope,
  ReviewMode,
  ReviewPoint,
  WebReviewKitOptions,
} from '../types';
import {
  getDomAnchorFromPoint,
  getElementViewportSelection,
  resolveAnchorElement,
} from './dom.anchor';
import {
  clampPoint,
  getAreaPopoverPosition,
  getPopoverPosition,
  getViewportSize,
  isPointInViewport,
  placeLayerOverTarget,
  roundPoint,
  toHostPoint,
  toHostSelection,
  toTargetPoint,
  toTargetPointFromHostEvent,
  toViewportSelection,
  type ReviewEnvironment,
  type ViewportSelection,
} from './geometry';
import { getRouteKey } from './location';
import { createStyleElement } from './overlay.style';
import type { AreaDraft, NoteDraft } from './review/draft';
import {
  formatAreaDraftMeta,
  formatItemMeta,
  formatNoteDraftMeta,
} from './review/format';
import {
  getBoundMarkerPoint,
  getItemHighlightSelection,
  getReviewItemHighlightMode,
  shouldShowMarkerForScope,
} from './review/item';
import {
  findReviewViewportPreset,
  getNumberedReviewItems,
  getReviewViewportScope,
} from './review/scope';

/** Minimal item payload collected by the view before the app fills persistence metadata. */
export type CreateReviewItemInput = Pick<ReviewItem, 'kind' | 'comment'> &
  Partial<
    Pick<ReviewItem, 'scope' | 'viewport' | 'anchor' | 'marker' | 'selection'>
  >;

interface WebReviewKitViewState {
  isOpen: boolean;
  mode: ReviewMode;
  items: ReviewItem[];
  noteDraft?: NoteDraft;
  areaDraft?: AreaDraft;
  isSelectingArea: boolean;
  highlightedItemId?: string;
}

interface WebReviewKitViewActions {
  close: () => void;
  render: () => void;
  reload: () => Promise<ReviewItem[]>;
  restoreItem: (item: ReviewItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  setModeState: (mode: ReviewMode) => void;
  clearDrafts: () => void;
  setNoteDraft: (draft?: NoteDraft) => void;
  setSelectingArea: (isSelectingArea: boolean) => void;
  createItem: (input: CreateReviewItemInput) => Promise<void>;
  bindNoteDraftToPoint: (point: ReviewPoint, comment?: string) => Promise<void>;
  bindElementDraftToPoint: (
    point: ReviewPoint,
    comment?: string
  ) => Promise<void>;
  createAreaDraft: (selection: ViewportSelection) => Promise<void>;
}

interface WebReviewKitViewConfig {
  options: WebReviewKitOptions;
  getState: () => WebReviewKitViewState;
  getEnvironment: () => ReviewEnvironment | undefined;
  actions: WebReviewKitViewActions;
}

type DraftPreviewElement = HTMLElement | SVGElement;

interface DraftPreviewSnapshot {
  element: DraftPreviewElement;
  transform: string;
  transition: string;
  willChange: string;
  baseTransform: string;
}

/** Vanilla DOM renderer for the core overlay, separate from React shell chrome. */
export class WebReviewKitView {
  private draftPreview?: DraftPreviewSnapshot;

  constructor(private readonly config: WebReviewKitViewConfig) {}

  clearDraftPreview() {
    this.restoreDraftPreview();
  }

  render(shadow: ShadowRoot, hiddenItemsStyle: HTMLStyleElement) {
    const state = this.state;
    this.syncDraftPreview(
      state.isOpen && state.mode === 'element' ? state.noteDraft : undefined
    );

    shadow.replaceChildren();
    shadow.append(createStyleElement());
    shadow.append(hiddenItemsStyle);

    const shell = document.createElement('div');
    shell.className = `dfwr-shell${state.isOpen ? ' is-open' : ''}`;
    shell.setAttribute('aria-hidden', state.isOpen ? 'false' : 'true');

    if (this.config.options.ui?.panel !== false) {
      // Standalone core usage gets a built-in panel; React shell disables this.
      const panel = document.createElement('div');
      panel.className = 'dfwr-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Web review kit');

      panel.append(
        this.createHeader(),
        this.createToolbar(),
        this.createBody(),
        this.createList()
      );

      shell.append(panel);
    }

    shell.append(this.createMarkerLayer());

    if (state.isOpen && (state.mode === 'note' || state.mode === 'element')) {
      shell.append(
        state.noteDraft
          ? this.createNotePopover(state.noteDraft)
          : state.mode === 'element'
            ? this.createElementLayer()
            : this.createNoteLayer()
      );
    }

    if (state.isOpen && state.mode === 'area' && !state.areaDraft) {
      shell.append(this.createAreaLayer());
    }

    if (
      state.isOpen &&
      state.mode === 'area' &&
      state.areaDraft &&
      this.config.options.ui?.panel === false
    ) {
      // Shell mode renders the draft form near the target because the side panel is React-owned.
      if (state.areaDraft.selection) {
        shell.append(this.createAreaDraftOverlay(state.areaDraft));
      }
      shell.append(this.createAreaDraftPopover(state.areaDraft));
    }

    shadow.append(shell);
  }

  private get state() {
    return this.config.getState();
  }

  private getDraftAdjustmentMetrics(draft: NoteDraft) {
    const adjustment = draft.adjustment;
    const x = adjustment?.x ?? 0;
    const y = adjustment?.y ?? 0;
    const preset = findReviewViewportPreset(
      draft.viewport,
      this.config.options.viewports?.presets
    );
    const designWidth =
      typeof preset.designWidth === 'number' && preset.designWidth > 0
        ? preset.designWidth
        : draft.viewport.width;
    const scale = designWidth > 0 ? draft.viewport.width / designWidth : 1;

    return {
      x,
      y,
      cssX: x * scale,
      cssY: y * scale,
      scale,
      designWidth,
      presetLabel: preset.label,
      viewportWidth: draft.viewport.width,
    };
  }

  private hasDraftAdjustment(draft: NoteDraft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return metrics.x !== 0 || metrics.y !== 0;
  }

  private getAdjustedDraftPoint(point: ReviewPoint, draft: NoteDraft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return {
      x: point.x + metrics.cssX,
      y: point.y + metrics.cssY,
    };
  }

  private getAdjustedDraftSelection(
    selection: ViewportSelection,
    draft: NoteDraft
  ) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return {
      ...selection,
      left: selection.left + metrics.cssX,
      top: selection.top + metrics.cssY,
    };
  }

  private formatSignedPx(value: number) {
    if (value === 0) return '+0px';
    return `${value > 0 ? '+' : ''}${value}px`;
  }

  private formatDraftAdjustmentStatus(draft: NoteDraft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return [
      `x ${this.formatSignedPx(metrics.x)}`,
      `y ${this.formatSignedPx(metrics.y)}`,
      `MQ px`,
      `${metrics.presetLabel} ${Math.round(metrics.viewportWidth)}/design ${Math.round(
        metrics.designWidth
      )}`,
      `preview x${Math.round(metrics.scale * 1000) / 1000}`,
    ].join(' / ');
  }

  private withDraftAdjustmentComment(comment: string, draft: NoteDraft) {
    if (!this.hasDraftAdjustment(draft)) return comment;

    const metrics = this.getDraftAdjustmentMetrics(draft);
    const adjustment = [
      `Adjust: x ${this.formatSignedPx(metrics.x)}, y ${this.formatSignedPx(
        metrics.y
      )}`,
      `(MQ 기준 px, ${metrics.presetLabel} ${Math.round(
        metrics.viewportWidth
      )}/design ${Math.round(metrics.designWidth)})`,
    ].join(' ');

    return `${comment.trim()}\n${adjustment}`;
  }

  private getStyleableDraftElement(
    draft: NoteDraft,
    environment: ReviewEnvironment
  ): DraftPreviewElement | undefined {
    if (!draft.anchor) return undefined;

    const element = resolveAnchorElement(draft.anchor, environment)?.element;
    if (!element) return undefined;

    if ('style' in element) return element as DraftPreviewElement;

    return undefined;
  }

  private syncDraftPreview(draft?: NoteDraft) {
    const environment = this.config.getEnvironment();
    if (!draft || !environment || !this.hasDraftAdjustment(draft)) {
      this.restoreDraftPreview();
      return;
    }

    const element = this.getStyleableDraftElement(draft, environment);
    if (!element) {
      this.restoreDraftPreview();
      return;
    }

    if (this.draftPreview?.element !== element) {
      this.restoreDraftPreview();
    }

    if (!this.draftPreview) {
      const computedTransform =
        environment.window.getComputedStyle(element).transform;
      this.draftPreview = {
        element,
        transform: element.style.transform,
        transition: element.style.transition,
        willChange: element.style.willChange,
        baseTransform:
          element.style.transform ||
          (computedTransform && computedTransform !== 'none'
            ? computedTransform
            : ''),
      };
    }

    const metrics = this.getDraftAdjustmentMetrics(draft);
    const translate = `translate(${this.toCssNumber(metrics.cssX)}px, ${this.toCssNumber(
      metrics.cssY
    )}px)`;
    element.style.transition = 'none';
    element.style.willChange = 'transform';
    element.style.transform = [this.draftPreview.baseTransform, translate]
      .filter(Boolean)
      .join(' ');
  }

  private restoreDraftPreview() {
    if (!this.draftPreview) return;

    const { element, transform, transition, willChange } = this.draftPreview;
    element.style.transform = transform;
    element.style.transition = transition;
    element.style.willChange = willChange;
    this.draftPreview = undefined;
  }

  private toCssNumber(value: number) {
    return Math.round(value * 1000) / 1000;
  }

  private createHeader() {
    const header = document.createElement('div');
    header.className = 'dfwr-header';

    const title = document.createElement('div');
    title.className = 'dfwr-title';
    title.textContent = 'Review Kit';

    const meta = document.createElement('div');
    meta.className = 'dfwr-meta';
    meta.textContent = getRouteKey(this.config.getEnvironment());

    const titleGroup = document.createElement('div');
    titleGroup.append(title, meta);

    const close = document.createElement('button');
    close.className = 'dfwr-icon-button';
    close.type = 'button';
    close.textContent = 'x';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', () => this.config.actions.close());

    header.append(titleGroup, close);
    return header;
  }

  private createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'dfwr-toolbar';

    toolbar.append(
      this.createToolbarButton('Note', this.state.mode === 'note', () => {
        const mode = this.state.mode;
        this.config.actions.setModeState(mode === 'note' ? 'idle' : 'note');
        this.config.actions.clearDrafts();
        this.config.actions.render();
      }),
      this.createToolbarButton('Element', this.state.mode === 'element', () => {
        const mode = this.state.mode;
        this.config.actions.setModeState(
          mode === 'element' ? 'idle' : 'element'
        );
        this.config.actions.clearDrafts();
        this.config.actions.render();
      }),
      this.createToolbarButton(
        this.state.isSelectingArea ? 'Selecting' : 'Area',
        this.state.mode === 'area',
        () => {
          const mode = this.state.mode;
          this.config.actions.setModeState(mode === 'area' ? 'idle' : 'area');
          this.config.actions.clearDrafts();
          this.config.actions.render();
        }
      ),
      this.createToolbarButton('Refresh', false, () => {
        void this.config.actions.reload();
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
    const state = this.state;

    if (state.mode === 'idle') {
      const empty = document.createElement('p');
      empty.className = 'dfwr-empty';
      empty.textContent = 'Add a note or mark an area.';
      body.append(empty);
      return body;
    }

    if (state.mode === 'note' || state.mode === 'element') {
      body.append(this.createNoteBody());
      return body;
    }

    body.append(this.createAreaForm());
    return body;
  }

  private createNoteBody() {
    const empty = document.createElement('p');
    empty.className = 'dfwr-empty';
    empty.textContent = this.state.noteDraft
      ? 'Write the note in the page box.'
      : this.state.mode === 'element'
        ? 'Click an element to add QA.'
        : 'Click on the page to place a note.';
    return empty;
  }

  private createNotePopover(draft: NoteDraft) {
    const environment = this.config.getEnvironment();
    const group = document.createElement('div');
    group.className = 'dfwr-note-draft';
    if (!environment) return group;

    const isElementDraft = this.state.mode === 'element' && Boolean(draft.selection);
    const hostPoint = toHostPoint(
      isElementDraft
        ? this.getAdjustedDraftPoint(draft.marker.viewport, draft)
        : draft.marker.viewport,
      environment
    );
    let selectionHighlight: HTMLDivElement | undefined;

    if (draft.selection) {
      const selection = toViewportSelection(draft.selection.viewport);
      selectionHighlight = this.createSelectionHighlight(
        isElementDraft
          ? this.getAdjustedDraftSelection(selection, draft)
          : selection,
        environment,
        true
      );
      group.append(selectionHighlight);
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
      const noteDraft = this.state.noteDraft;
      if (!noteDraft) return;
      this.config.actions.setNoteDraft({
        ...noteDraft,
        comment: textarea.value,
      });
    });

    const saveDraft = () => {
      const comment = textarea.value.trim();
      if (!comment) return;
      const currentDraft = this.state.noteDraft ?? draft;
      void this.config.actions.createItem({
        kind: 'note',
        comment: this.withDraftAdjustmentComment(comment, currentDraft),
        viewport: currentDraft.viewport,
        anchor: currentDraft.anchor,
        marker: currentDraft.marker,
        selection: currentDraft.selection,
      });
    };

    const adjustmentControls = isElementDraft
      ? this.createAdjustmentControls({
          draft,
          pin,
          popover,
          selectionHighlight,
          textarea,
        })
      : undefined;

    const actions = this.createFormActions('Save note', saveDraft, {
      className: isElementDraft ? 'dfwr-note-actions' : undefined,
      beforeSave: adjustmentControls?.buttons,
    });

    form.append(
      meta,
      textarea,
      ...(adjustmentControls ? [adjustmentControls.panel] : []),
      actions
    );
    popover.append(form);
    group.append(pin, popover);

    this.attachDraftPinDrag(pin, popover, meta, textarea);

    window.setTimeout(() => {
      if (draft.adjustment?.isActive) {
        adjustmentControls?.focusTarget.focus();
        return;
      }

      textarea.focus();
    }, 0);

    return group;
  }

  private createAdjustmentControls({
    draft,
    pin,
    popover,
    selectionHighlight,
    textarea,
  }: {
    draft: NoteDraft;
    pin: HTMLButtonElement;
    popover: HTMLDivElement;
    selectionHighlight?: HTMLDivElement;
    textarea: HTMLTextAreaElement;
  }) {
    const panel = document.createElement('div');
    panel.className = 'dfwr-adjust-panel';

    const help = document.createElement('div');
    help.className = 'dfwr-adjust-help';
    help.textContent = 'MQ 기준 CSS px로 이동값을 기록합니다.';

    const status = document.createElement('div');
    status.className = 'dfwr-adjust-status';

    const reset = document.createElement('button');
    reset.className = 'dfwr-button';
    reset.type = 'button';
    reset.textContent = 'Reset';

    const adjust = document.createElement('button');
    adjust.className = 'dfwr-button';
    adjust.type = 'button';

    const syncControls = (nextDraft: NoteDraft) => {
      const isActive = nextDraft.adjustment?.isActive === true;
      const hasAdjustment = this.hasDraftAdjustment(nextDraft);
      panel.classList.toggle('is-active', isActive);
      reset.hidden = !hasAdjustment;
      adjust.textContent = isActive ? 'Done' : 'Adjust';
      status.textContent = this.formatDraftAdjustmentStatus(nextDraft);
      this.syncDraftAdjustmentUi({
        draft: nextDraft,
        pin,
        selectionHighlight,
        status,
      });
    };

    const updateDraft = (updater: (current: NoteDraft) => NoteDraft) => {
      const currentDraft = this.state.noteDraft ?? draft;
      const nextDraft = updater(currentDraft);
      this.config.actions.setNoteDraft({
        ...nextDraft,
        comment: textarea.value,
      });
      syncControls(nextDraft);
    };

    adjust.addEventListener('click', () => {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        adjustment: {
          x: currentDraft.adjustment?.x ?? 0,
          y: currentDraft.adjustment?.y ?? 0,
          isActive: currentDraft.adjustment?.isActive !== true,
        },
      }));
      adjust.focus();
    });

    reset.addEventListener('click', () => {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        adjustment: {
          x: 0,
          y: 0,
          isActive: currentDraft.adjustment?.isActive,
        },
      }));
      adjust.focus();
    });

    popover.addEventListener('keydown', (event) => {
      const currentDraft = this.state.noteDraft ?? draft;
      if (currentDraft.adjustment?.isActive !== true) return;

      const keyDelta = this.getAdjustmentKeyDelta(event);
      if (!keyDelta) return;

      event.preventDefault();
      event.stopPropagation();

      updateDraft((activeDraft) => ({
        ...activeDraft,
        adjustment: {
          x: (activeDraft.adjustment?.x ?? 0) + keyDelta.x,
          y: (activeDraft.adjustment?.y ?? 0) + keyDelta.y,
          isActive: true,
        },
      }));
    });

    panel.append(help, status);
    syncControls(draft);

    return {
      panel,
      buttons: [reset, adjust],
      focusTarget: adjust,
    };
  }

  private getAdjustmentKeyDelta(event: KeyboardEvent) {
    const step = event.shiftKey ? 10 : 1;

    if (event.key === 'ArrowLeft') return { x: -step, y: 0 };
    if (event.key === 'ArrowRight') return { x: step, y: 0 };
    if (event.key === 'ArrowUp') return { x: 0, y: -step };
    if (event.key === 'ArrowDown') return { x: 0, y: step };

    return undefined;
  }

  private syncDraftAdjustmentUi({
    draft,
    pin,
    selectionHighlight,
    status,
  }: {
    draft: NoteDraft;
    pin: HTMLButtonElement;
    selectionHighlight?: HTMLDivElement;
    status?: HTMLDivElement;
  }) {
    const environment = this.config.getEnvironment();
    if (!environment) return;

    const hostPoint = toHostPoint(
      this.getAdjustedDraftPoint(draft.marker.viewport, draft),
      environment
    );
    pin.style.left = `${hostPoint.x}px`;
    pin.style.top = `${hostPoint.y}px`;

    if (draft.selection && selectionHighlight) {
      const rect = toHostSelection(
        this.getAdjustedDraftSelection(
          toViewportSelection(draft.selection.viewport),
          draft
        ),
        environment
      );
      selectionHighlight.style.left = `${rect.left}px`;
      selectionHighlight.style.top = `${rect.top}px`;
      selectionHighlight.style.width = `${rect.width}px`;
      selectionHighlight.style.height = `${rect.height}px`;
    }

    if (status) {
      status.textContent = this.formatDraftAdjustmentStatus(draft);
    }

    this.syncDraftPreview(draft);
  }

  private createAreaForm() {
    const form = document.createElement('form');
    form.className = 'dfwr-form';
    const areaDraft = this.state.areaDraft;

    if (!areaDraft) {
      const empty = document.createElement('p');
      empty.className = 'dfwr-empty';
      empty.textContent = 'Drag on the page to select an area.';
      form.append(empty);
      return form;
    }

    const meta = document.createElement('div');
    meta.className = 'dfwr-item-date';
    meta.textContent = formatAreaDraftMeta(areaDraft);
    form.append(meta);

    const textarea = document.createElement('textarea');
    textarea.className = 'dfwr-textarea';
    textarea.placeholder = 'Area comment';
    textarea.rows = 4;

    const actions = this.createFormActions('Save area', () => {
      const comment = textarea.value.trim();
      const draft = this.state.areaDraft;
      if (!comment || !draft) return;
      void this.config.actions.createItem({
        kind: 'area',
        comment,
        viewport: draft.viewport,
        anchor: draft.anchor,
        marker: draft.marker,
        selection: draft.selection,
      });
    });

    form.append(textarea, actions);
    return form;
  }

  private createAreaDraftOverlay(draft: AreaDraft) {
    const layer = document.createElement('div');
    layer.className = 'dfwr-area-preview-layer';

    const environment = this.config.getEnvironment();
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
            this.config.options.viewports?.presets
          ),
          true,
          true
        )
      );
    }

    return layer;
  }

  private createAreaDraftPopover(draft: AreaDraft) {
    const environment = this.config.getEnvironment();
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

  private createFormActions(
    saveLabel: string,
    onSave: () => void,
    options?: {
      beforeSave?: HTMLButtonElement[];
      className?: string;
    }
  ) {
    const actions = document.createElement('div');
    actions.className = ['dfwr-actions', options?.className]
      .filter(Boolean)
      .join(' ');

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
      this.config.actions.setModeState('idle');
      this.config.actions.clearDrafts();
      this.config.actions.render();
    });

    if (options?.beforeSave?.length || options?.className) {
      actions.append(cancel, ...(options.beforeSave ?? []), save);
      return actions;
    }

    actions.append(save, cancel);
    return actions;
  }

  private createList() {
    const section = document.createElement('div');
    section.className = 'dfwr-list';
    const state = this.state;

    const heading = document.createElement('div');
    heading.className = 'dfwr-list-heading';
    heading.textContent = `Review items (${state.items.length})`;
    section.append(heading);

    if (state.items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'dfwr-empty';
      empty.textContent = 'No review items on this page.';
      section.append(empty);
      return section;
    }

    for (const numberedItem of getNumberedReviewItems(
      state.items,
      this.config.options.viewports?.presets
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
      void this.config.actions.restoreItem(item);
    });
    row.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      void this.config.actions.restoreItem(item);
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
      void this.config.actions
        .removeItem(item.id)
        .then(() => this.config.actions.reload());
    });

    actions.append(remove);
    row.append(body, actions);
    return row;
  }

  private createMarkerLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-marker-layer';
    const environment = this.config.getEnvironment();
    if (!environment) return layer;

    const currentScope = getReviewViewportScope(
      getViewportSize(environment),
      this.config.options.viewports?.presets
    );

    getNumberedReviewItems(
      this.state.items,
      this.config.options.viewports?.presets
    ).forEach((numberedItem) => {
      const { item, scope, displayLabel } = numberedItem;
      if (!shouldShowMarkerForScope(scope, currentScope)) {
        return;
      }

      const isHighlighted = item.id === this.state.highlightedItemId;
      const highlightMode = getReviewItemHighlightMode(item);
      if (
        highlightMode !== 'note' &&
        (!this.state.highlightedItemId || isHighlighted)
      ) {
        const selection = getItemHighlightSelection(item, environment);
        if (selection) {
          layer.append(
            ...this.createItemHighlightElements(
              selection.viewport,
              environment,
              item,
              displayLabel,
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
        displayLabel,
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
    labelElement.textContent = label;
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
    labelElement.textContent = label;
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
      const environment = this.config.getEnvironment();
      if (!environment) return;

      const nextPoint = clampPoint(toTargetPoint(hostPoint, environment), environment);
      const nextHostPoint = toHostPoint(nextPoint, environment);
      const position = getPopoverPosition(nextHostPoint, environment);

      pin.style.left = `${nextHostPoint.x}px`;
      pin.style.top = `${nextHostPoint.y}px`;
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;

      const noteDraft = this.state.noteDraft;
      if (!noteDraft) return;

      const nextDraft = {
        ...noteDraft,
        marker: {
          ...noteDraft.marker,
          viewport: roundPoint(nextPoint),
        },
        comment: textarea.value,
      };
      this.config.actions.setNoteDraft(nextDraft);
      meta.textContent = formatNoteDraftMeta(nextDraft);
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

      const nextPoint = toTargetPointFromHostEvent(
        event,
        this.config.getEnvironment()
      );
      void (this.state.mode === 'element'
        ? this.config.actions.bindElementDraftToPoint(nextPoint, textarea.value)
        : this.config.actions.bindNoteDraftToPoint(nextPoint, textarea.value));
    });
  }

  private createNoteLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-text-layer';
    const environment = this.config.getEnvironment();

    if (environment) {
      placeLayerOverTarget(layer, environment);
    }

    layer.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.config.actions.bindNoteDraftToPoint(
        toTargetPointFromHostEvent(event, this.config.getEnvironment())
      );
    });

    return layer;
  }

  private createElementLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-element-layer';
    const environment = this.config.getEnvironment();
    const hover = document.createElement('div');
    hover.className = 'dfwr-dom-hover';
    hover.hidden = true;
    layer.append(hover);

    if (environment) {
      placeLayerOverTarget(layer, environment);
    }

    const updateHover = (point: ReviewPoint) => {
      const nextEnvironment = this.config.getEnvironment();
      if (!nextEnvironment) return;

      const anchor = getDomAnchorFromPoint(
        clampPoint(point, nextEnvironment),
        this.config.options.anchors?.attribute,
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
      updateHover(toTargetPointFromHostEvent(event, this.config.getEnvironment()));
    });

    layer.addEventListener('pointerleave', () => {
      hover.hidden = true;
    });

    layer.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.config.actions.bindElementDraftToPoint(
        toTargetPointFromHostEvent(event, this.config.getEnvironment())
      );
    });

    return layer;
  }

  private createAreaLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-area-layer';
    const environment = this.config.getEnvironment();

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
        this.config.getEnvironment()
      );
      const left = Math.min(startX, nextPoint.x);
      const top = Math.min(startY, nextPoint.y);
      const width = Math.abs(nextPoint.x - startX);
      const height = Math.abs(nextPoint.y - startY);
      const hostPoint = toHostPoint(
        { x: left, y: top },
        this.config.getEnvironment()
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
        this.config.getEnvironment()
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

      this.config.actions.setSelectingArea(true);
      this.config.actions.render();
      void this.config.actions.createAreaDraft(selection);
    });

    return layer;
  }
}
