import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemScope,
  ReviewMode,
  ReviewPoint,
  ViewportSize,
  WebReviewKitOptions,
} from '../types';
import { getDomAnchorFromPoint, getElementViewportSelection } from './dom.anchor';
import {
  attachDraftImagePasteQueue,
  createDraftAttachmentQueue,
  removeDraftAttachment,
} from './draft.attachments';
import {
  clampPoint,
  clamp,
  getPopoverPosition,
  getViewportSize,
  isPointInViewport,
  placeLayerOverTarget,
  roundPoint,
  toHostPoint,
  toHostSelection,
  toPublicSelection,
  toTargetPoint,
  toTargetPointFromHostEvent,
  toViewportSelection,
  type ReviewEnvironment,
  type ViewportSelection,
} from './geometry';
import { getRouteKey } from './location';
import * as draftMetrics from './draft.metrics';
import { DraftPreviewController } from './draft.preview';
import { createStyleElement } from './overlay.style';
import type {
  AreaDraft,
  NoteDraft,
  ReviewDraftAttachment,
} from './review/draft';
import { formatItemMeta, formatNoteDraftMeta } from './review/format';
import {
  getBoundMarkerPoint,
  getItemHighlightSelection,
  getReviewItemHighlightMode,
  shouldShowMarkerForScope,
} from './review/item';
import {
  getNumberedReviewItems,
  getReviewViewportScope,
} from './review/scope';

type DraftItemFields = Partial<
  Pick<ReviewItem, 'title' | 'comment' | 'assigneeId' | 'assigneeName'>
>;

/** Minimal item payload collected by the view before the app fills persistence metadata. */
export type CreateReviewItemInput = Pick<ReviewItem, 'kind' | 'comment'> &
  Partial<
    Pick<
      ReviewItem,
      | 'title'
      | 'assigneeId'
      | 'assigneeName'
      | 'scope'
      | 'viewport'
      | 'anchor'
      | 'marker'
      | 'selection'
    >
  > & {
    attachments?: ReviewDraftAttachment[];
  };

const DEFAULT_ADJUSTMENT_LABEL = 'Responsive CSS px adjustments';

interface WebReviewKitViewState {
  isOpen: boolean;
  mode: ReviewMode;
  items: ReviewItem[];
  noteDraft?: NoteDraft;
  areaDraft?: AreaDraft;
  draftError?: string;
  isCreatingItem: boolean;
  isCapturingViewport: boolean;
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
  setAreaDraft: (draft?: AreaDraft) => void;
  setSelectingArea: (isSelectingArea: boolean) => void;
  createItem: (input: CreateReviewItemInput) => Promise<void>;
  captureNoteDraft: (
    input: Pick<AreaDraft, 'marker' | 'selection' | 'viewport'>
  ) => Promise<void>;
  captureAreaDraft: (
    input: Pick<AreaDraft, 'marker' | 'selection' | 'viewport'>
  ) => Promise<void>;
  bindNoteDraftToPoint: (
    point: ReviewPoint,
    fields?: DraftItemFields
  ) => Promise<void>;
  bindElementDraftToPoint: (
    point: ReviewPoint,
    fields?: DraftItemFields
  ) => Promise<void>;
  createAreaDraft: (selection: ViewportSelection) => Promise<void>;
}

interface WebReviewKitViewConfig {
  options: WebReviewKitOptions;
  getState: () => WebReviewKitViewState;
  getEnvironment: () => ReviewEnvironment | undefined;
  actions: WebReviewKitViewActions;
}

/** Vanilla DOM renderer for the core overlay, separate from React shell chrome. */
export class WebReviewKitView {
  private readonly draftPreview: DraftPreviewController;
  private shellComposerHost?: HTMLElement;

  constructor(private readonly config: WebReviewKitViewConfig) {
    this.draftPreview = new DraftPreviewController({
      getEnvironment: () => this.config.getEnvironment(),
      getMetrics: (draft) => this.getDraftAdjustmentMetrics(draft),
      hasAdjustment: (draft) => this.hasDraftAdjustment(draft),
    });
  }

  clearDraftPreview() {
    this.draftPreview.clear();
    this.clearShellComposer();
  }

  render(shadow: ShadowRoot, hiddenItemsStyle: HTMLStyleElement) {
    const state = this.state;
    this.draftPreview.sync(
      state.isOpen && state.mode === 'element' ? state.noteDraft : undefined
    );

    shadow.replaceChildren();
    shadow.append(createStyleElement());
    shadow.append(hiddenItemsStyle);

    const hasDismissableDraft = Boolean(state.noteDraft || state.areaDraft);
    const shouldDockComposer =
      this.config.options.ui?.panel === false &&
      hasDismissableDraft &&
      Boolean(this.getShellComposerHost());
    let dockedComposer: HTMLElement | undefined;
    const shell = document.createElement('div');
    shell.className = [
      'dfwr-shell',
      state.isOpen ? 'is-open' : '',
      hasDismissableDraft && !shouldDockComposer ? 'has-dismissible-draft' : '',
    ]
      .filter(Boolean)
      .join(' ');
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
    if (state.isOpen && hasDismissableDraft && !shouldDockComposer) {
      shell.append(this.createDraftCancelLayer());
    }

    if (state.isOpen && (state.mode === 'note' || state.mode === 'element')) {
      if (state.noteDraft) {
        const noteDraft = this.createNotePopover(state.noteDraft, {
          dockComposer: shouldDockComposer,
        });
        shell.append(noteDraft.layer);
        dockedComposer = noteDraft.composer;
      } else {
        shell.append(
          state.mode === 'element'
            ? this.createElementLayer()
            : this.createNoteLayer()
        );
      }
    }

    if (
      state.isOpen &&
      state.mode === 'area' &&
      !state.areaDraft &&
      !state.isSelectingArea
    ) {
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
      const areaComposer = this.createAreaDraftPopover(state.areaDraft, {
        dockComposer: shouldDockComposer,
      });
      if (shouldDockComposer) {
        dockedComposer = areaComposer;
      } else {
        shell.append(areaComposer);
      }
    }

    shadow.append(shell);
    this.renderShellComposer(dockedComposer);
  }

  private get state() {
    return this.config.getState();
  }

  private getShellComposerHost() {
    const environment = this.config.getEnvironment();
    if (this.config.options.ui?.panel !== false) return undefined;
    return environment?.composerHost ?? undefined;
  }

  private renderShellComposer(composer?: HTMLElement) {
    const host = composer ? this.getShellComposerHost() : undefined;
    if (!host || !composer) {
      this.clearShellComposer();
      return;
    }

    if (this.shellComposerHost && this.shellComposerHost !== host) {
      this.clearShellComposer();
    }

    this.shellComposerHost = host;
    host.dataset.hasDraftComposer = 'true';
    if (host.parentElement) {
      host.parentElement.dataset.hasDraftComposer = 'true';
    }

    const shell = document.createElement('div');
    shell.className = 'dfwr-shell is-open is-shell-draft is-docked-composer';
    shell.append(composer);

    host.replaceChildren(createStyleElement(), shell);
  }

  private clearShellComposer() {
    const host = this.shellComposerHost;
    host?.replaceChildren();
    if (host) {
      delete host.dataset.hasDraftComposer;
      delete host.parentElement?.dataset.hasDraftComposer;
    }
    this.shellComposerHost = undefined;
  }

  private createDraftCancelLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-draft-cancel-layer';
    layer.setAttribute('aria-hidden', 'true');

    layer.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      this.cancelDraft(event);
    });

    return layer;
  }

  private cancelDraft(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    event?.stopImmediatePropagation();
    this.config.actions.setModeState('idle');
    this.config.actions.clearDrafts();
    this.config.actions.setSelectingArea(false);
    this.config.actions.render();
  }

  // Draft adjustment geometry lives in draft.metrics.ts; these thin wrappers
  // supply the configured viewport presets so call sites stay unchanged.
  private get viewportPresets() {
    return this.config.options.viewports?.presets;
  }

  private getDraftAdjustmentMetrics(draft: NoteDraft) {
    return draftMetrics.getDraftAdjustmentMetrics(draft, this.viewportPresets);
  }

  private hasDraftAdjustment(draft: NoteDraft) {
    return draftMetrics.hasDraftAdjustment(draft, this.viewportPresets);
  }

  private getAdjustedDraftPoint(point: ReviewPoint, draft: NoteDraft) {
    return draftMetrics.getAdjustedDraftPoint(point, draft, this.viewportPresets);
  }

  private getAdjustedDraftSelection(
    selection: ViewportSelection,
    draft: NoteDraft
  ) {
    return draftMetrics.getAdjustedDraftSelection(
      selection,
      draft,
      this.viewportPresets
    );
  }

  private getDraftViewportScale(viewport: ViewportSize) {
    return draftMetrics.getDraftViewportScale(viewport, this.viewportPresets);
  }

  private getDraftComposerWidth(environment: ReviewEnvironment) {
    const bounds = environment.overlayRect;
    const margin = 12;
    return Math.min(360, Math.max(240, bounds.width - margin * 2));
  }

  private getClampedComposerPosition(
    position: ReviewPoint,
    environment: ReviewEnvironment,
    size?: { width?: number; height?: number },
    bounds = environment.overlayRect
  ) {
    const margin = 12;
    const width = size?.width ?? this.getDraftComposerWidth(environment);
    const height = size?.height ?? 236;

    return {
      x: clamp(
        position.x,
        bounds.left + margin,
        bounds.left + bounds.width - width - margin
      ),
      y: clamp(
        position.y,
        bounds.top + margin,
        bounds.top + bounds.height - height - margin
      ),
    };
  }

  private getHostComposerBounds() {
    const root = document.documentElement;
    return {
      left: 0,
      top: 0,
      width: root.clientWidth || window.innerWidth,
      height: root.clientHeight || window.innerHeight,
    };
  }

  private getInitialDraftComposerPosition(
    selection: ViewportSelection | undefined,
    environment: ReviewEnvironment,
    size: { width: number; height?: number }
  ) {
    const bounds = this.getHostComposerBounds();
    const margin = 12;
    const gap = 20;

    if (!selection) {
      return this.getClampedComposerPosition(
        {
          x: environment.overlayRect.left + margin,
          y: environment.overlayRect.top + margin,
        },
        environment,
        size,
        bounds
      );
    }

    const preferredX = selection.left + selection.width + gap;
    const maxX = bounds.left + bounds.width - size.width - margin;
    const x =
      preferredX <= maxX
        ? preferredX
        : selection.left - size.width - gap;

    return this.getClampedComposerPosition(
      {
        x,
        y: selection.top,
      },
      environment,
      size,
      bounds
    );
  }

  private getDraftComposerPosition({
    selection,
    environment,
    composerPosition,
    estimatedHeight,
  }: {
    selection?: ViewportSelection;
    environment: ReviewEnvironment;
    composerPosition?: ReviewPoint;
    estimatedHeight?: number;
  }) {
    const width = this.getDraftComposerWidth(environment);

    if (composerPosition) {
      const clamped = this.getClampedComposerPosition(
        composerPosition,
        environment,
        { width, height: estimatedHeight },
        this.getHostComposerBounds()
      );
      return { width, left: clamped.x, top: clamped.y };
    }

    const position = this.getInitialDraftComposerPosition(selection, environment, {
      width,
      height: estimatedHeight,
    });

    return { width, left: position.x, top: position.y };
  }

  private getSelectionMqMetrics(
    selection: ViewportSelection,
    viewport: ViewportSize
  ) {
    const { scale } = this.getDraftViewportScale(viewport);
    const ratio = scale > 0 ? 1 / scale : 1;

    return {
      x: selection.left * ratio,
      y: selection.top * ratio,
      width: selection.width * ratio,
      height: selection.height * ratio,
    };
  }

  private formatSignedPx(value: number) {
    if (value === 0) return '+0px';
    return `${value > 0 ? '+' : ''}${value}px`;
  }

  private formatRoundedPx(value: number) {
    return `${Math.round(value)}px`;
  }

  private getAdjustmentLabel() {
    return (
      this.config.options.adjustmentLabel?.trim() || DEFAULT_ADJUSTMENT_LABEL
    );
  }

  private getSelectionMetricLines(
    selection: ViewportSelection | undefined,
    viewport: ViewportSize
  ) {
    if (!selection) return ['area', 'x none / y none', 'w none / h none'];

    const metrics = this.getSelectionMqMetrics(selection, viewport);
    return [
      'area',
      `x ${this.formatRoundedPx(metrics.x)} / y ${this.formatRoundedPx(
        metrics.y
      )}`,
      `w ${this.formatRoundedPx(metrics.width)} / h ${this.formatRoundedPx(
        metrics.height
      )}`,
    ];
  }

  private getAreaDraftMetricSelection(draft: AreaDraft) {
    if (!draft.selection) return undefined;

    return toViewportSelection(draft.selection.viewport);
  }

  private getDraftAdjustmentMetricLines(draft: NoteDraft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return [
      `x ${this.formatSignedPx(metrics.x)} / y ${this.formatSignedPx(
        metrics.y
      )}`,
      `scale ${this.formatSignedPx(metrics.scale)}`,
    ];
  }

  private withDraftAdjustmentComment(comment: string, draft: NoteDraft) {
    if (!this.hasDraftAdjustment(draft)) return comment;

    const trimmedComment = comment.trim();
    const metrics = this.getDraftAdjustmentMetrics(draft);
    const adjustment = [
      `${this.getAdjustmentLabel()}: x ${this.formatSignedPx(
        metrics.x
      )}, y ${this.formatSignedPx(metrics.y)}, scale ${this.formatSignedPx(
        metrics.scale
      )}`,
      `(${metrics.presetLabel} viewport, ${Math.round(
        metrics.viewportWidth
      )}/design ${Math.round(metrics.designWidth)})`,
    ].join(' ');

    return trimmedComment ? `${trimmedComment}\n${adjustment}` : adjustment;
  }

  private getAssigneeOption(assigneeId: string | null | undefined) {
    if (!assigneeId) return undefined;
    return this.config.options.assigneeOptions?.find(
      (option) => option.value === assigneeId
    );
  }

  private getAssigneeName(assigneeId: string | null | undefined) {
    return this.getAssigneeOption(assigneeId)?.label;
  }

  private createDraftTitleInput(
    value: string | undefined,
    onInput: (value: string) => void
  ) {
    const input = document.createElement('input');
    input.className = 'dfwr-input';
    input.placeholder = 'Title';
    input.type = 'text';
    input.value = value ?? '';
    input.addEventListener('input', () => onInput(input.value));
    return input;
  }

  private isTitleFieldEnabled() {
    return this.config.options.fields?.title === true;
  }

  private createDraftAssigneeSelect(
    value: string | null | undefined,
    fallbackLabel: string | undefined,
    onChange: (assigneeId: string | null, assigneeName?: string) => void
  ) {
    const assigneeOptions = this.config.options.assigneeOptions ?? [];
    if (assigneeOptions.length === 0) return undefined;
    const assigneeTitle =
      this.config.options.assigneeTitle?.trim() || 'Assignee';

    const select = document.createElement('select');
    select.className = 'dfwr-select';

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = assigneeTitle;
    select.append(emptyOption);

    const hasUnknownAssignee =
      Boolean(value) &&
      !assigneeOptions.some((option) => option.value === value);
    if (hasUnknownAssignee && value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = fallbackLabel ?? value;
      select.append(option);
    }

    assigneeOptions.forEach((assigneeOption) => {
      const option = document.createElement('option');
      option.value = assigneeOption.value;
      option.textContent = assigneeOption.label;
      select.append(option);
    });

    select.value = value ?? '';
    select.addEventListener('change', () => {
      onChange(select.value || null, this.getAssigneeName(select.value));
    });

    return select;
  }

  private getDraftFields(
    titleInput: HTMLInputElement | undefined,
    textarea: HTMLTextAreaElement,
    assigneeSelect: HTMLSelectElement | undefined
  ) {
    const title = titleInput?.value.trim();
    const comment = textarea.value.trim();
    const assigneeId = assigneeSelect?.value.trim() || undefined;
    return {
      title: title || undefined,
      comment,
      assigneeId,
      assigneeName: this.getAssigneeName(assigneeId),
    };
  }

  private canCaptureViewport() {
    return Boolean(this.config.getEnvironment()?.captureViewport);
  }

  private createDraftCaptureButton(
    draft: NoteDraft | AreaDraft,
    options:
      | {
          kind: 'note';
          isElementDraft: boolean;
          textarea: HTMLTextAreaElement;
        }
      | {
          kind: 'area';
          textarea: HTMLTextAreaElement;
        }
  ) {
    const button = document.createElement('button');
    const isCapturing = this.state.isCapturingViewport;
    const canCapture = this.canCaptureViewport();

    button.className = 'dfwr-button';
    button.type = 'button';
    button.disabled = !canCapture || isCapturing || this.state.isCreatingItem;
    button.setAttribute('aria-busy', isCapturing ? 'true' : 'false');
    button.title = canCapture
      ? 'Capture current viewport'
      : 'Viewport capture helper is not available';
    if (isCapturing) {
      button.append(this.createSpinner('dfwr-spinner'), 'Capturing...');
    } else {
      button.textContent = 'Capture';
    }

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.canCaptureViewport() || this.state.isCapturingViewport) return;

      if (options.kind === 'area') {
        const areaDraft = this.state.areaDraft ?? (draft as AreaDraft);
        const nextDraft = {
          ...areaDraft,
          comment: options.textarea.value,
        };
        this.config.actions.setAreaDraft(nextDraft);
        void this.config.actions.captureAreaDraft(
          this.getCaptureAreaDraft(nextDraft)
        );
        return;
      }

      const noteDraft = this.state.noteDraft ?? (draft as NoteDraft);
      const nextDraft = {
        ...noteDraft,
        comment: options.textarea.value,
      };
      this.config.actions.setNoteDraft(nextDraft);
      void this.config.actions.captureNoteDraft(
        this.getCaptureNoteDraft(nextDraft, options.isElementDraft)
      );
    });

    return button;
  }

  private getCaptureAreaDraft(draft: AreaDraft) {
    return {
      viewport: draft.viewport,
      marker: draft.marker,
      selection: draft.selection,
    };
  }

  private getCaptureNoteDraft(draft: NoteDraft, isElementDraft: boolean) {
    if (!isElementDraft) {
      return {
        viewport: draft.viewport,
        marker: draft.marker,
        selection: draft.selection,
      };
    }

    const marker = {
      ...draft.marker,
      viewport: roundPoint(
        this.getAdjustedDraftPoint(draft.marker.viewport, draft)
      ),
    };
    const selection = draft.selection
      ? {
          ...draft.selection,
          viewport: toPublicSelection(
            this.getAdjustedDraftSelection(
              toViewportSelection(draft.selection.viewport),
              draft
            )
          ),
        }
      : undefined;

    return {
      viewport: draft.viewport,
      marker,
      selection,
    };
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

  // Builds the note draft layer: the on-page marker/highlight plus its composer
  // popover. When dockComposer is set the composer renders into the side panel
  // instead of floating next to the marker (used for the docked review mode).
  private createNotePopover(
    draft: NoteDraft,
    options: { dockComposer?: boolean } = {}
  ) {
    const environment = this.config.getEnvironment();
    const group = document.createElement('div');
    group.className = 'dfwr-note-draft';
    if (!environment) return { layer: group, composer: undefined };

    const isElementDraft =
      this.state.mode === 'element' && Boolean(draft.selection);
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

    popover.className = [
      'dfwr-note-popover',
      isElementDraft ? 'is-composer' : '',
      options.dockComposer ? 'is-docked-composer' : '',
    ]
      .filter(Boolean)
      .join(' ');
    if (options.dockComposer) {
      popover.style.width = '100%';
    } else if (isElementDraft) {
      const selection = draft.selection
        ? toHostSelection(
            this.getAdjustedDraftSelection(
              toViewportSelection(draft.selection.viewport),
              draft
            ),
            environment
          )
        : undefined;
      const composer = this.getDraftComposerPosition({
        selection,
        environment,
        composerPosition: draft.composerPosition,
        estimatedHeight: 252,
      });
      popover.style.left = `${composer.left}px`;
      popover.style.top = `${composer.top}px`;
      popover.style.width = `${composer.width}px`;
    } else {
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;
    }

    const form = document.createElement('form');
    form.className = 'dfwr-form';

    const meta =
      isElementDraft ? undefined : document.createElement('div');
    if (meta) {
      meta.className = 'dfwr-item-date';
      meta.textContent = formatNoteDraftMeta(draft);
    }

    const titleInput = this.isTitleFieldEnabled()
      ? this.createDraftTitleInput(draft.title, (title) => {
          const noteDraft = this.state.noteDraft;
          if (!noteDraft) return;
          this.config.actions.setNoteDraft({
            ...noteDraft,
            title,
          });
        })
      : undefined;

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
    attachDraftImagePasteQueue(textarea, {
      getAttachments: () =>
        this.state.noteDraft?.attachments ?? draft.attachments,
      onAttachmentsChange: (attachments) => {
        const noteDraft = this.state.noteDraft ?? draft;
        this.config.actions.setNoteDraft({
          ...noteDraft,
          comment: textarea.value,
          attachments,
        });
      },
      onCommentChange: (comment) => {
        const noteDraft = this.state.noteDraft ?? draft;
        this.config.actions.setNoteDraft({
          ...noteDraft,
          comment,
        });
      },
      onPasteComplete: () => this.config.actions.render(),
    });

    const assigneeSelect = this.createDraftAssigneeSelect(
      draft.assigneeId,
      draft.assigneeName,
      (assigneeId, assigneeName) => {
        const noteDraft = this.state.noteDraft;
        if (!noteDraft) return;
        this.config.actions.setNoteDraft({
          ...noteDraft,
          assigneeId,
          assigneeName,
        });
      }
    );

    const saveDraft = () => {
      const currentDraft = this.state.noteDraft ?? draft;
      const fields = this.getDraftFields(titleInput, textarea, assigneeSelect);
      const comment = fields.comment;
      const hasAttachments = Boolean(currentDraft.attachments?.length);
      if (
        !comment &&
        !this.hasDraftAdjustment(currentDraft) &&
        !hasAttachments
      ) {
        return;
      }
      void this.config.actions.createItem({
        kind: 'note',
        title: fields.title,
        comment: this.withDraftAdjustmentComment(comment, currentDraft),
        assigneeId: fields.assigneeId,
        assigneeName: fields.assigneeName,
        viewport: currentDraft.viewport,
        anchor: currentDraft.anchor,
        marker: currentDraft.marker,
        selection: currentDraft.selection,
        attachments: currentDraft.attachments,
      });
    };

    const adjustmentControls =
      isElementDraft
        ? this.createAdjustmentControls({
            draft,
            pin,
            popover,
            selectionHighlight,
            textarea,
            dockToggle: options.dockComposer,
          })
        : undefined;
    const leadingActions = [
      adjustmentControls?.actionButton,
      this.createDraftCaptureButton(draft, {
        kind: 'note',
        isElementDraft,
        textarea,
      }),
    ].filter((element): element is HTMLButtonElement => Boolean(element));

    const actions = this.createFormActions('Save note', saveDraft, {
      leading: leadingActions.length > 0 ? leadingActions : undefined,
    });
    const error = this.createDraftError();
    const attachmentQueue = createDraftAttachmentQueue(
      document,
      draft.attachments,
      (attachmentId) => {
        const noteDraft = this.state.noteDraft ?? draft;
        const attachments = removeDraftAttachment(
          noteDraft.attachments,
          attachmentId
        );
        this.config.actions.setNoteDraft({
          ...noteDraft,
          comment: textarea.value,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        this.config.actions.render();
      }
    );

    form.append(
      ...(meta ? [meta] : []),
      ...(adjustmentControls ? [adjustmentControls.panel] : []),
      ...(titleInput ? [titleInput] : []),
      textarea,
      ...(attachmentQueue ? [attachmentQueue] : []),
      ...(assigneeSelect ? [assigneeSelect] : []),
      ...(error ? [error] : []),
      actions
    );
    const dragHandle =
      isElementDraft && !options.dockComposer
        ? this.createDraftDragHandle('Move DOM composer')
        : undefined;
    popover.append(
      ...(dragHandle ? [dragHandle] : []),
      form
    );
    group.append(pin);
    if (!options.dockComposer) {
      group.append(popover);
    }

    if (dragHandle) {
      this.attachDraftComposerDrag(popover, dragHandle, (composerPosition) => {
        const noteDraft = this.state.noteDraft ?? draft;
        this.config.actions.setNoteDraft({
          ...noteDraft,
          composerPosition,
          comment: textarea.value,
        });
      });
    }

    this.attachDraftPinDrag(
      pin,
      isElementDraft || options.dockComposer ? undefined : popover,
      meta,
      textarea
    );

    if (!options.dockComposer) {
      window.setTimeout(() => {
        if (draft.adjustment?.isActive) {
          adjustmentControls?.focusTarget.focus();
          return;
        }

        textarea.focus();
      }, 0);
    }

    return {
      layer: group,
      composer: options.dockComposer ? popover : undefined,
    };
  }

  private createDraftDragHandle(label: string) {
    const handle = document.createElement('button');
    handle.className = 'dfwr-draft-drag-handle';
    handle.type = 'button';
    handle.setAttribute('aria-label', label);
    return handle;
  }

  private createIcon(paths: string[]) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.4');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    paths.forEach((d) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      svg.append(path);
    });

    return svg;
  }

  private setAdjustmentToggleIcon(button: HTMLButtonElement, isActive: boolean) {
    const paths = isActive
      ? ['M20 6 9 17l-5-5']
      : [
          'M12 2v20',
          'M2 12h20',
          'm9 5 3-3 3 3',
          'm9 19 3 3 3-3',
          'm5 9-3 3 3 3',
          'm19 9 3 3-3 3',
        ];
    button.replaceChildren(this.createIcon(paths));
  }

  private attachDraftComposerDrag(
    popover: HTMLDivElement,
    handle: HTMLButtonElement,
    onMove: (position: ReviewPoint) => void
  ) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const movePopover = (event: PointerEvent) => {
      const environment = this.config.getEnvironment();
      if (!environment) return;

      const position = this.getClampedComposerPosition(
        {
          x: event.clientX - offsetX,
          y: event.clientY - offsetY,
        },
        environment,
        {
          width: popover.offsetWidth,
          height: popover.offsetHeight,
        },
        this.getHostComposerBounds()
      );

      popover.style.left = `${position.x}px`;
      popover.style.top = `${position.y}px`;
      onMove(position);
    };

    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;

      const rect = popover.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      isDragging = true;

      event.preventDefault();
      event.stopPropagation();
      handle.setPointerCapture(event.pointerId);
      popover.classList.add('is-dragging');
    });

    handle.addEventListener('pointermove', (event) => {
      if (!isDragging || !handle.hasPointerCapture(event.pointerId)) return;

      event.preventDefault();
      movePopover(event);
    });

    const stopDrag = (event: PointerEvent) => {
      if (!isDragging || !handle.hasPointerCapture(event.pointerId)) return;

      event.preventDefault();
      event.stopPropagation();
      isDragging = false;
      handle.releasePointerCapture(event.pointerId);
      popover.classList.remove('is-dragging');
      movePopover(event);
    };

    handle.addEventListener('pointerup', stopDrag);
    handle.addEventListener('pointercancel', stopDrag);
  }

  // Builds the element-adjustment controls (nudge the previewed element via
  // arrow keys / buttons). Wires keyboard deltas to the draft transform and
  // keeps the pin, popover, highlight and textarea in sync as the value changes.
  private createAdjustmentControls({
    draft,
    pin,
    popover,
    selectionHighlight,
    textarea,
    dockToggle,
  }: {
    draft: NoteDraft;
    pin: HTMLButtonElement;
    popover: HTMLDivElement;
    selectionHighlight?: HTMLDivElement;
    textarea: HTMLTextAreaElement;
    dockToggle?: boolean;
  }) {
    const panel = document.createElement('div');
    panel.className = 'dfwr-adjust-panel is-dom-adjust-panel';

    const header = document.createElement('div');
    header.className = 'dfwr-adjust-panel-header';
    const help = document.createElement('div');
    help.className = 'dfwr-adjust-help';
    help.textContent = this.getAdjustmentLabel();

    const adjust = document.createElement('button');
    adjust.className = 'dfwr-adjust-toggle';
    adjust.type = 'button';
    adjust.title = 'Adjust DOM element with keyboard arrows';
    adjust.setAttribute('aria-label', 'Adjust DOM element with keyboard arrows');

    const xyStatus = document.createElement('div');
    xyStatus.className = 'dfwr-adjust-status';

    const scaleStatus = document.createElement('div');
    scaleStatus.className = 'dfwr-adjust-status';

    const syncControls = (nextDraft: NoteDraft) => {
      const isActive = nextDraft.adjustment?.isActive === true;
      panel.classList.toggle('is-active', isActive);
      adjust.classList.toggle('is-active', isActive);
      adjust.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      this.setAdjustmentToggleIcon(adjust, isActive);
      adjust.title = isActive
        ? 'Finish DOM adjustment'
        : 'Adjust DOM element with keyboard arrows';
      adjust.setAttribute(
        'aria-label',
        isActive
          ? 'Finish DOM adjustment'
          : 'Adjust DOM element with keyboard arrows'
      );
      const [xyLine, scaleLine] = this.getDraftAdjustmentMetricLines(nextDraft);
      xyStatus.textContent = xyLine;
      scaleStatus.textContent = scaleLine;
      this.syncDraftAdjustmentUi({
        draft: nextDraft,
        pin,
        selectionHighlight,
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
          scale: currentDraft.adjustment?.scale ?? 0,
          isActive: currentDraft.adjustment?.isActive !== true,
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
          scale: (activeDraft.adjustment?.scale ?? 0) + keyDelta.scale,
          isActive: true,
        },
      }));
    });

    header.append(help);
    if (!dockToggle) {
      header.append(adjust);
    }
    panel.append(header, xyStatus, scaleStatus);
    syncControls(draft);

    return {
      panel,
      focusTarget: adjust,
      actionButton: dockToggle ? adjust : undefined,
    };
  }

  private getAdjustmentKeyDelta(event: KeyboardEvent) {
    const step = event.shiftKey ? 10 : 1;

    if (event.key === 'ArrowLeft') return { x: -step, y: 0, scale: 0 };
    if (event.key === 'ArrowRight') return { x: step, y: 0, scale: 0 };
    if (event.key === 'ArrowUp') return { x: 0, y: -step, scale: 0 };
    if (event.key === 'ArrowDown') return { x: 0, y: step, scale: 0 };
    if (event.key.toLowerCase() === 'w') return { x: 0, y: 0, scale: step };
    if (event.key.toLowerCase() === 's') return { x: 0, y: 0, scale: -step };

    return undefined;
  }

  private syncDraftAdjustmentUi({
    draft,
    pin,
    selectionHighlight,
  }: {
    draft: NoteDraft;
    pin: HTMLButtonElement;
    selectionHighlight?: HTMLDivElement;
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

    this.draftPreview.sync(draft);
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

    form.append(this.createAreaMetricsPanel(areaDraft));

    const titleInput = this.isTitleFieldEnabled()
      ? this.createDraftTitleInput(areaDraft.title, (title) => {
          const draft = this.state.areaDraft;
          if (!draft) return;
          this.config.actions.setAreaDraft({
            ...draft,
            title,
          });
        })
      : undefined;

    const textarea = document.createElement('textarea');
    textarea.className = 'dfwr-textarea';
    textarea.placeholder = 'Area comment';
    textarea.rows = 4;
    textarea.value = areaDraft.comment ?? '';
    textarea.addEventListener('input', () => {
      const draft = this.state.areaDraft;
      if (!draft) return;
      this.config.actions.setAreaDraft({
        ...draft,
        comment: textarea.value,
      });
    });
    attachDraftImagePasteQueue(textarea, {
      getAttachments: () =>
        this.state.areaDraft?.attachments ?? areaDraft.attachments,
      onAttachmentsChange: (attachments) => {
        const draft = this.state.areaDraft ?? areaDraft;
        this.config.actions.setAreaDraft({
          ...draft,
          comment: textarea.value,
          attachments,
        });
      },
      onCommentChange: (comment) => {
        const draft = this.state.areaDraft ?? areaDraft;
        this.config.actions.setAreaDraft({
          ...draft,
          comment,
        });
      },
      onPasteComplete: () => this.config.actions.render(),
    });

    const assigneeSelect = this.createDraftAssigneeSelect(
      areaDraft.assigneeId,
      areaDraft.assigneeName,
      (assigneeId, assigneeName) => {
        const draft = this.state.areaDraft;
        if (!draft) return;
        this.config.actions.setAreaDraft({
          ...draft,
          assigneeId,
          assigneeName,
        });
      }
    );

    const actions = this.createFormActions(
      'Save area',
      () => {
        const draft = this.state.areaDraft;
        const fields = this.getDraftFields(titleInput, textarea, assigneeSelect);
        const comment = fields.comment;
        if ((!comment && !draft?.attachments?.length) || !draft) return;
        void this.config.actions.createItem({
          kind: 'area',
          title: fields.title,
          comment,
          assigneeId: fields.assigneeId,
          assigneeName: fields.assigneeName,
          viewport: draft.viewport,
          anchor: draft.anchor,
          marker: draft.marker,
          selection: draft.selection,
          attachments: draft.attachments,
        });
      },
      {
        leading: [
          this.createDraftCaptureButton(areaDraft, {
            kind: 'area',
            textarea,
          }),
        ],
      }
    );
    const error = this.createDraftError();
    const attachmentQueue = createDraftAttachmentQueue(
      document,
      areaDraft.attachments,
      (attachmentId) => {
        const draft = this.state.areaDraft ?? areaDraft;
        const attachments = removeDraftAttachment(
          draft.attachments,
          attachmentId
        );
        this.config.actions.setAreaDraft({
          ...draft,
          comment: textarea.value,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        this.config.actions.render();
      }
    );

    form.append(
      ...(titleInput ? [titleInput] : []),
      textarea,
      ...(attachmentQueue ? [attachmentQueue] : []),
      ...(assigneeSelect ? [assigneeSelect] : []),
      ...(error ? [error] : []),
      actions
    );
    return form;
  }

  private createAreaMetricsPanel(draft: AreaDraft) {
    const panel = document.createElement('div');
    panel.className = 'dfwr-adjust-panel is-area-metrics-panel';

    const help = document.createElement('div');
    help.className = 'dfwr-adjust-help';
    const [labelLine, xyLine, sizeLine] = this.getSelectionMetricLines(
      this.getAreaDraftMetricSelection(draft),
      draft.viewport
    );
    help.textContent = labelLine;

    const xyStatus = document.createElement('div');
    xyStatus.className = 'dfwr-adjust-status';
    xyStatus.textContent = xyLine;

    const sizeStatus = document.createElement('div');
    sizeStatus.className = 'dfwr-adjust-status';
    sizeStatus.textContent = sizeLine;

    panel.append(help, xyStatus, sizeStatus);
    return panel;
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

  private createAreaDraftPopover(
    draft: AreaDraft,
    options: { dockComposer?: boolean } = {}
  ) {
    const environment = this.config.getEnvironment();
    const popover = document.createElement('div');
    popover.className = [
      'dfwr-area-draft',
      'is-composer',
      options.dockComposer ? 'is-docked-composer' : '',
    ]
      .filter(Boolean)
      .join(' ');
    if (options.dockComposer) {
      popover.style.width = '100%';
    } else if (environment && draft.selection) {
      const selection = toHostSelection(
        toViewportSelection(draft.selection.viewport),
        environment
      );
      const composer = this.getDraftComposerPosition({
        selection,
        environment,
        composerPosition: draft.composerPosition,
        estimatedHeight: 220,
      });
      popover.style.left = `${composer.left}px`;
      popover.style.top = `${composer.top}px`;
      popover.style.width = `${composer.width}px`;
      popover.style.right = 'auto';
    }
    const dragHandle = options.dockComposer
      ? undefined
      : this.createDraftDragHandle('Move area composer');
    popover.append(
      ...(dragHandle ? [dragHandle] : []),
      this.createAreaForm()
    );
    if (dragHandle) {
      this.attachDraftComposerDrag(popover, dragHandle, (composerPosition) => {
        const areaDraft = this.state.areaDraft ?? draft;
        this.config.actions.setAreaDraft({
          ...areaDraft,
          composerPosition,
        });
      });
    }
    return popover;
  }

  private createFormActions(
    saveLabel: string,
    onSave: () => void,
    options?: {
      beforeSave?: HTMLButtonElement[];
      className?: string;
      leading?: HTMLElement[];
    }
  ) {
    const actions = document.createElement('div');
    actions.className = ['dfwr-actions', options?.className]
      .filter(Boolean)
      .join(' ');
    const isSaving = this.state.isCreatingItem;

    const save = document.createElement('button');
    save.className = 'dfwr-button is-primary';
    save.type = 'button';
    save.disabled = isSaving;
    save.setAttribute('aria-busy', isSaving ? 'true' : 'false');
    if (isSaving) {
      save.append(this.createSpinner('dfwr-spinner'), 'Saving...');
    } else {
      save.textContent = saveLabel;
    }
    save.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.state.isCreatingItem) return;
      onSave();
    });

    const cancel = document.createElement('button');
    cancel.className = 'dfwr-button';
    cancel.type = 'button';
    cancel.disabled = isSaving;
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', (event) => {
      this.cancelDraft(event);
    });

    if (options?.leading?.length) {
      actions.classList.add('has-leading');
      const leading = document.createElement('div');
      leading.className = 'dfwr-actions-leading';
      leading.append(...options.leading);
      const primary = document.createElement('div');
      primary.className = 'dfwr-actions-primary';
      primary.append(save, cancel);
      actions.append(leading, primary);
      return actions;
    }

    if (options?.beforeSave?.length || options?.className) {
      actions.append(cancel, ...(options.beforeSave ?? []), save);
      return actions;
    }

    actions.append(save, cancel);
    return actions;
  }

  private createSpinner(className: string) {
    const spinner = document.createElement('span');
    spinner.className = className;
    spinner.setAttribute('aria-hidden', 'true');
    return spinner;
  }

  private createDraftError() {
    if (!this.state.draftError) return undefined;

    const error = document.createElement('p');
    error.className = 'dfwr-form-error';
    error.setAttribute('role', 'alert');
    error.textContent = this.state.draftError;
    return error;
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

    const title = this.isTitleFieldEnabled() ? item.title?.trim() : '';
    const titleElement = title ? document.createElement('strong') : undefined;
    if (title && titleElement) {
      titleElement.className = 'dfwr-item-title';
      titleElement.textContent = title;
    }

    const comment = document.createElement('p');
    comment.className = `dfwr-item-comment${title ? '' : ' is-primary'}`;
    comment.textContent = item.comment;

    const date = document.createElement('time');
    date.className = 'dfwr-item-date';
    date.dateTime = item.createdAt;
    date.textContent = formatItemMeta(item);

    body.append(badges, ...(titleElement ? [titleElement] : []), comment, date);

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
    popover: HTMLDivElement | undefined,
    meta: HTMLDivElement | undefined,
    textarea: HTMLTextAreaElement
  ) {
    let isDragging = false;

    const moveDraftUi = (hostPoint: ReviewPoint) => {
      const environment = this.config.getEnvironment();
      if (!environment) return;

      const nextPoint = clampPoint(toTargetPoint(hostPoint, environment), environment);
      const nextHostPoint = toHostPoint(nextPoint, environment);

      pin.style.left = `${nextHostPoint.x}px`;
      pin.style.top = `${nextHostPoint.y}px`;
      if (popover) {
        const position = getPopoverPosition(nextHostPoint, environment);
        popover.style.left = `${position.left}px`;
        popover.style.top = `${position.top}px`;
      }

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
      if (meta) {
        meta.textContent = formatNoteDraftMeta(nextDraft);
      }
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
      const currentDraft = this.state.noteDraft;
      const fields = {
        title: currentDraft?.title,
        comment: textarea.value,
        assigneeId: currentDraft?.assigneeId,
        assigneeName: currentDraft?.assigneeName,
      };
      void (this.state.mode === 'element'
        ? this.config.actions.bindElementDraftToPoint(nextPoint, fields)
        : this.config.actions.bindNoteDraftToPoint(nextPoint, fields));
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
    let activePointerId: number | undefined;
    let isDragging = false;
    const ownerWindow = layer.ownerDocument.defaultView ?? window;

    const updateBox = (event: PointerEvent) => {
      const nextEnvironment = this.config.getEnvironment();
      const nextPoint = toTargetPointFromHostEvent(
        event,
        nextEnvironment
      );
      const left = Math.min(startX, nextPoint.x);
      const top = Math.min(startY, nextPoint.y);
      const width = Math.abs(nextPoint.x - startX);
      const height = Math.abs(nextPoint.y - startY);
      const hostPoint = toHostPoint(
        { x: left, y: top },
        nextEnvironment
      );

      selection = { left, top, width, height };
      box.style.left = `${hostPoint.x}px`;
      box.style.top = `${hostPoint.y}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    };

    const addDragListeners = () => {
      ownerWindow.addEventListener('pointermove', handlePointerMove, true);
      ownerWindow.addEventListener('pointerup', handlePointerUp, true);
      ownerWindow.addEventListener('pointercancel', handlePointerCancel, true);
    };

    const removeDragListeners = () => {
      ownerWindow.removeEventListener('pointermove', handlePointerMove, true);
      ownerWindow.removeEventListener('pointerup', handlePointerUp, true);
      ownerWindow.removeEventListener(
        'pointercancel',
        handlePointerCancel,
        true
      );
    };

    const releasePointerCapture = (event: PointerEvent) => {
      try {
        if (layer.hasPointerCapture(event.pointerId)) {
          layer.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Pointer capture can be gone when the iframe/overlay reflows mid-drag.
      }
    };

    function isActivePointer(event: PointerEvent) {
      return isDragging && event.pointerId === activePointerId;
    }

    const finishAreaSelection = (event: PointerEvent) => {
      if (!isActivePointer(event)) return;

      event.preventDefault();
      updateBox(event);
      releasePointerCapture(event);
      removeDragListeners();
      isDragging = false;
      activePointerId = undefined;

      if (!selection || selection.width < 8 || selection.height < 8) return;

      this.config.actions.setSelectingArea(true);
      this.config.actions.render();
      void this.config.actions.createAreaDraft(selection);
    };

    function handlePointerMove(event: PointerEvent) {
      if (!isActivePointer(event)) return;

      event.preventDefault();
      updateBox(event);
    }

    const handlePointerUp = (event: PointerEvent) => {
      finishAreaSelection(event);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (!isActivePointer(event)) return;

      releasePointerCapture(event);
      removeDragListeners();
      isDragging = false;
      activePointerId = undefined;
    };

    layer.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;

      event.preventDefault();
      activePointerId = event.pointerId;
      isDragging = true;

      try {
        layer.setPointerCapture(event.pointerId);
      } catch {
        // Continue with window-level listeners when capture is unavailable.
      }

      const startPoint = toTargetPointFromHostEvent(
        event,
        this.config.getEnvironment()
      );
      startX = startPoint.x;
      startY = startPoint.y;
      updateBox(event);
      addDragListeners();
    });

    layer.addEventListener('pointermove', handlePointerMove);
    layer.addEventListener('pointerup', handlePointerUp);
    layer.addEventListener('pointercancel', handlePointerCancel);

    return layer;
  }
}
