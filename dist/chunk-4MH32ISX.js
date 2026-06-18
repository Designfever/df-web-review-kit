// src/index.ts
var REVIEW_WORKFLOW_STATUS_OPTIONS = [
  { value: "todo", label: "\uC791\uC5C5\uC804" },
  { value: "doing", label: "\uC791\uC5C5\uC911" },
  { value: "review", label: "\uAC80\uD1A0 \uD544\uC694" },
  { value: "hold", label: "\uBCF4\uB958" },
  { value: "done", label: "\uC644\uB8CC" }
];
function normalizeReviewItemStatus(status) {
  if (status === "resolved") return "done";
  if (status === "open" || !status) return "todo";
  return status;
}
function matchesReviewItemStatus(itemStatus, queryStatus) {
  return normalizeReviewItemStatus(itemStatus) === normalizeReviewItemStatus(queryStatus);
}
var DEFAULT_STORAGE_KEY = "df-web-review-kit:items";
var ROOT_ID = "df-web-review-kit-root";
var INTERNAL_QUERY_PARAMS = ["__dfwr_target"];
var DEFAULT_REVIEW_VIEWPORTS = [
  { label: "Mobile", width: 390, height: 720, scope: "mobile" },
  { label: "Tablet", width: 768, height: 1024, scope: "tablet" },
  { label: "Desktop", width: 1440, height: 900, scope: "desktop" },
  { label: "Wide", width: 1980, height: 1080, scope: "wide" }
];
var REVIEW_SCOPE_LABELS = {
  mobile: "Mobile",
  tablet: "Tablet",
  desktop: "Desktop",
  wide: "Wide",
  dom: "Element"
};
var normalizeReviewItemScope = (value) => {
  if (value === "element") return "dom";
  if (value === "mobile" || value === "tablet" || value === "desktop" || value === "wide" || value === "dom") {
    return value;
  }
  return void 0;
};
var getViewportPresetDistance = (preset, viewport) => Math.abs(preset.width - viewport.width) + Math.abs(preset.height - viewport.height);
var inferViewportScope = (preset) => {
  if (preset.scope) return preset.scope;
  const label = preset.label.toLowerCase();
  if (label.includes("mobile") || label.includes("phone")) return "mobile";
  if (label.includes("tablet") || label.includes("pad")) return "tablet";
  if (label.includes("wide") || label.includes("1980") || label.includes("1940") || label.includes("1920")) {
    return "wide";
  }
  if (label.includes("desktop")) return "desktop";
  if (preset.width >= 1800) return "wide";
  if (preset.width >= 1e3) return "desktop";
  if (preset.width >= 700) return "tablet";
  return "mobile";
};
function findReviewViewportPreset(viewport, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const fallback = presets[0] ?? DEFAULT_REVIEW_VIEWPORTS[0];
  const exact = presets.find(
    (preset) => preset.width === viewport.width && preset.height === viewport.height
  );
  if (exact) return exact;
  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance(closest, viewport);
    const presetDistance = getViewportPresetDistance(preset, viewport);
    return presetDistance < closestDistance ? preset : closest;
  }, fallback);
}
function getReviewViewportScope(viewport, presets = DEFAULT_REVIEW_VIEWPORTS) {
  return inferViewportScope(findReviewViewportPreset(viewport, presets));
}
function getReviewItemScope(item, presets = DEFAULT_REVIEW_VIEWPORTS) {
  return normalizeReviewItemScope(item.scope) ?? getReviewViewportScope(item.viewport, presets);
}
function getReviewItemScopeLabel(item, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const scope = getReviewItemScope(item, presets);
  if (scope === "dom") return REVIEW_SCOPE_LABELS.dom;
  const preset = findReviewViewportPreset(item.viewport, presets);
  return preset.label || REVIEW_SCOPE_LABELS[scope];
}
function getNumberedReviewItems(items, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const counts = /* @__PURE__ */ new Map();
  return items.map((item) => {
    const scope = getReviewItemScope(item, presets);
    const label = getReviewItemScopeLabel(item, presets);
    const number = (counts.get(scope) ?? 0) + 1;
    counts.set(scope, number);
    return {
      item,
      scope,
      label,
      number,
      displayLabel: `${label}-${number}`
    };
  });
}
function localAdapter(options = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const read = () => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };
  const write = (items) => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  };
  return {
    async list(query) {
      return read().filter((item) => {
        if (item.projectId !== query.projectId) return false;
        const queryRouteKey = query.routeKey ?? query.normalizedPath;
        if (queryRouteKey && getItemRouteKey(item) !== queryRouteKey) {
          return false;
        }
        if (query.status && !matchesReviewItemStatus(item.status, query.status)) {
          return false;
        }
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
      const next = {
        ...items[index],
        ...patch,
        id,
        createdAt: items[index].createdAt,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      items[index] = next;
      write(items);
      return next;
    },
    async remove(id) {
      write(read().filter((item) => item.id !== id));
    }
  };
}
function createWebReviewKit(options) {
  if (typeof window === "undefined" || typeof document === "undefined") {
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
    reload: () => app.reload(),
    getItems: () => app.getItems(),
    destroy: () => app.destroy()
  };
}
var WebReviewKitApp = class {
  constructor(options) {
    this.options = options;
    this.isOpen = false;
    this.mode = "idle";
    this.items = [];
    this.isCapturing = false;
    this.handleKeyDown = (event) => {
      if (event.key === "Escape" && this.cancelMode()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (!isHotkey(event, this.hotkey)) return;
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
    };
    this.handleViewportChange = () => {
      if (!this.isOpen || this.renderFrame) return;
      this.renderFrame = window.requestAnimationFrame(() => {
        this.renderFrame = void 0;
        this.render();
      });
    };
    this.adapter = options.adapter ?? localAdapter();
    this.hotkey = options.hotkeys?.qa ?? "Shift+Q";
  }
  mount() {
    if (this.root) return;
    const existing = document.getElementById(ROOT_ID);
    if (existing) existing.remove();
    this.root = document.createElement("div");
    this.root.id = ROOT_ID;
    this.root.style.display = "contents";
    this.shadow = this.root.attachShadow({ mode: "open" });
    document.body.appendChild(this.root);
    document.addEventListener("keydown", this.handleKeyDown, true);
    window.addEventListener("scroll", this.handleViewportChange, true);
    window.addEventListener("resize", this.handleViewportChange);
    this.render();
  }
  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown, true);
    window.removeEventListener("scroll", this.handleViewportChange, true);
    window.removeEventListener("resize", this.handleViewportChange);
    if (this.renderFrame) {
      window.cancelAnimationFrame(this.renderFrame);
      this.renderFrame = void 0;
    }
    if (this.highlightClearTimer) {
      window.clearTimeout(this.highlightClearTimer);
      this.highlightClearTimer = void 0;
    }
    this.root?.remove();
    this.root = void 0;
    this.shadow = void 0;
  }
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    void this.reload().then(() => this.render());
  }
  close() {
    this.isOpen = false;
    this.setModeState("idle");
    this.textDraft = void 0;
    this.captureDraft = void 0;
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
  setMode(mode) {
    if (!this.isOpen) {
      this.isOpen = true;
    }
    this.setModeState(this.mode === mode ? "idle" : mode);
    this.textDraft = void 0;
    this.captureDraft = void 0;
    this.render();
  }
  getMode() {
    return this.mode;
  }
  getItems() {
    return this.items;
  }
  highlightItem(itemId) {
    if (!this.isOpen) {
      this.isOpen = true;
    }
    this.highlightedItemId = itemId;
    if (this.highlightClearTimer) {
      window.clearTimeout(this.highlightClearTimer);
    }
    this.highlightClearTimer = window.setTimeout(() => {
      if (this.highlightedItemId !== itemId) return;
      this.highlightedItemId = void 0;
      this.highlightClearTimer = void 0;
      this.render();
    }, 2400);
    this.render();
  }
  setModeState(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.options.onModeChange?.(mode);
  }
  cancelMode() {
    if (this.mode === "idle" && !this.textDraft && !this.captureDraft && !this.isCapturing) {
      return false;
    }
    this.setModeState("idle");
    this.textDraft = void 0;
    this.captureDraft = void 0;
    this.isCapturing = false;
    this.render();
    return true;
  }
  getEnvironment() {
    const target = typeof this.options.target === "function" ? this.options.target() : this.options.target;
    if (!target) {
      return {
        window,
        document,
        viewportRect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    }
    try {
      const rect = target.getViewportRect?.() ?? {
        left: 0,
        top: 0,
        width: target.window.innerWidth,
        height: target.window.innerHeight
      };
      return {
        window: target.window,
        document: target.document,
        viewportRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        }
      };
    } catch {
      return void 0;
    }
  }
  async reload() {
    const environment = this.getEnvironment();
    if (!environment) return this.items;
    this.items = await this.adapter.list({
      projectId: this.options.projectId,
      routeKey: getRouteKey(environment)
    });
    this.options.onItemsChange?.(this.items);
    return this.items;
  }
  render() {
    if (!this.shadow) return;
    this.shadow.replaceChildren();
    this.shadow.append(createStyleElement());
    const shell = document.createElement("div");
    shell.className = `dfwr-shell${this.isOpen ? " is-open" : ""}`;
    shell.setAttribute("aria-hidden", this.isOpen ? "false" : "true");
    if (this.options.ui?.panel !== false) {
      this.panel = document.createElement("div");
      this.panel.className = "dfwr-panel";
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-label", "Web review kit");
      this.panel.append(
        this.createHeader(),
        this.createToolbar(),
        this.createBody(),
        this.createList()
      );
      shell.append(this.panel);
    } else {
      this.panel = void 0;
    }
    shell.append(this.createMarkerLayer());
    if (this.isOpen && (this.mode === "text" || this.mode === "element")) {
      shell.append(
        this.textDraft ? this.createTextPopover(this.textDraft) : this.mode === "element" ? this.createElementLayer() : this.createTextLayer()
      );
    }
    if (this.isOpen && this.mode === "capture" && !this.captureDraft) {
      shell.append(this.createCaptureLayer());
    }
    if (this.isOpen && this.mode === "capture" && this.captureDraft && this.options.ui?.panel === false) {
      if (this.captureDraft.selection) {
        shell.append(this.createCaptureDraftOverlay(this.captureDraft));
      }
      shell.append(this.createCaptureDraftPopover());
    }
    this.shadow.append(shell);
  }
  createHeader() {
    const header = document.createElement("div");
    header.className = "dfwr-header";
    const title = document.createElement("div");
    title.className = "dfwr-title";
    title.textContent = "Review Kit";
    const meta = document.createElement("div");
    meta.className = "dfwr-meta";
    meta.textContent = getRouteKey(this.getEnvironment());
    const titleGroup = document.createElement("div");
    titleGroup.append(title, meta);
    const close = document.createElement("button");
    close.className = "dfwr-icon-button";
    close.type = "button";
    close.textContent = "x";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => this.close());
    header.append(titleGroup, close);
    return header;
  }
  createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "dfwr-toolbar";
    toolbar.append(
      this.createToolbarButton("Text", this.mode === "text", () => {
        this.setModeState(this.mode === "text" ? "idle" : "text");
        this.textDraft = void 0;
        this.captureDraft = void 0;
        this.render();
      }),
      this.createToolbarButton("Element", this.mode === "element", () => {
        this.setModeState(this.mode === "element" ? "idle" : "element");
        this.textDraft = void 0;
        this.captureDraft = void 0;
        this.render();
      }),
      this.createToolbarButton(
        this.isCapturing ? "Capturing" : "Capture",
        this.mode === "capture",
        () => {
          this.setModeState(this.mode === "capture" ? "idle" : "capture");
          this.textDraft = void 0;
          this.captureDraft = void 0;
          this.render();
        }
      ),
      this.createToolbarButton("Refresh", false, () => {
        void this.reload().then(() => this.render());
      })
    );
    return toolbar;
  }
  createToolbarButton(label, active, onClick) {
    const button = document.createElement("button");
    button.className = `dfwr-button${active ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }
  createBody() {
    const body = document.createElement("div");
    body.className = "dfwr-body";
    if (this.mode === "idle") {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "Add a text note or capture an area.";
      body.append(empty);
      return body;
    }
    if (this.mode === "text" || this.mode === "element") {
      body.append(this.createTextBody());
      return body;
    }
    body.append(this.createCaptureForm());
    return body;
  }
  createTextBody() {
    const empty = document.createElement("p");
    empty.className = "dfwr-empty";
    empty.textContent = this.textDraft ? "Write the note in the page box." : this.mode === "element" ? "Click an element to add QA." : "Click on the page to place a text note.";
    return empty;
  }
  createTextPopover(draft) {
    const environment = this.getEnvironment();
    const group = document.createElement("div");
    group.className = "dfwr-note-draft";
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
    const pin = document.createElement("button");
    pin.className = "dfwr-note-pin";
    pin.type = "button";
    pin.setAttribute("aria-label", "Move note point");
    pin.style.left = `${hostPoint.x}px`;
    pin.style.top = `${hostPoint.y}px`;
    const popover = document.createElement("div");
    const position = getPopoverPosition(hostPoint);
    popover.className = "dfwr-note-popover";
    popover.style.left = `${position.left}px`;
    popover.style.top = `${position.top}px`;
    const form = document.createElement("form");
    form.className = "dfwr-form";
    const meta = document.createElement("div");
    meta.className = "dfwr-item-date";
    meta.textContent = formatTextDraftMeta(draft);
    const textarea = document.createElement("textarea");
    textarea.className = "dfwr-textarea";
    textarea.placeholder = "Review comment";
    textarea.rows = 4;
    textarea.value = draft.comment ?? "";
    textarea.addEventListener("input", () => {
      if (!this.textDraft) return;
      this.textDraft = {
        ...this.textDraft,
        comment: textarea.value
      };
    });
    const actions = this.createFormActions("Save text", () => {
      const comment = textarea.value.trim();
      if (!comment) return;
      void this.createItem({
        kind: "text",
        comment,
        scope: this.mode === "element" && draft.anchor ? "dom" : void 0,
        viewport: draft.viewport,
        anchor: draft.anchor,
        marker: draft.marker,
        selection: draft.selection
      });
    });
    form.append(meta, textarea, actions);
    popover.append(form);
    group.append(pin, popover);
    this.attachDraftPinDrag(pin, popover, meta, textarea);
    window.setTimeout(() => textarea.focus(), 0);
    return group;
  }
  createCaptureForm() {
    const form = document.createElement("form");
    form.className = "dfwr-form";
    if (!this.captureDraft) {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "Drag on the page to select an area.";
      form.append(empty);
      return form;
    }
    if (this.captureDraft.error) {
      const error = document.createElement("p");
      error.className = "dfwr-error";
      error.textContent = this.captureDraft.error;
      form.append(error);
    }
    if (this.captureDraft.screenshot) {
      const image = document.createElement("img");
      image.className = "dfwr-preview";
      image.alt = "";
      image.src = this.captureDraft.screenshot.dataUrl;
      form.append(image);
    }
    const meta = document.createElement("div");
    meta.className = "dfwr-item-date";
    meta.textContent = formatCaptureDraftMeta(this.captureDraft);
    form.append(meta);
    const textarea = document.createElement("textarea");
    textarea.className = "dfwr-textarea";
    textarea.placeholder = "Capture comment";
    textarea.rows = 4;
    const actions = this.createFormActions("Save capture", () => {
      const comment = textarea.value.trim();
      if (!comment || !this.captureDraft) return;
      void this.createItem({
        kind: "capture",
        comment,
        viewport: this.captureDraft.viewport,
        anchor: this.captureDraft.anchor,
        marker: this.captureDraft.marker,
        selection: this.captureDraft.selection,
        screenshot: this.captureDraft.screenshot
      });
    });
    form.append(textarea, actions);
    return form;
  }
  createCaptureDraftOverlay(draft) {
    const layer = document.createElement("div");
    layer.className = "dfwr-capture-preview-layer";
    const environment = this.getEnvironment();
    if (!environment || !draft.selection) return layer;
    const selection = toViewportSelection(draft.selection.viewport);
    layer.append(this.createSelectionHighlight(selection, environment, true));
    if (draft.marker) {
      const hostPoint = toHostPoint(draft.marker.viewport, environment);
      layer.append(
        this.createMarkerElement(
          hostPoint,
          "\u2022",
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
  createCaptureDraftPopover() {
    const popover = document.createElement("div");
    popover.className = "dfwr-capture-draft";
    popover.append(this.createCaptureForm());
    return popover;
  }
  createFormActions(saveLabel, onSave) {
    const actions = document.createElement("div");
    actions.className = "dfwr-actions";
    const save = document.createElement("button");
    save.className = "dfwr-button is-primary";
    save.type = "button";
    save.textContent = saveLabel;
    save.addEventListener("click", onSave);
    const cancel = document.createElement("button");
    cancel.className = "dfwr-button";
    cancel.type = "button";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => {
      this.setModeState("idle");
      this.textDraft = void 0;
      this.captureDraft = void 0;
      this.render();
    });
    actions.append(save, cancel);
    return actions;
  }
  createList() {
    const section = document.createElement("div");
    section.className = "dfwr-list";
    const heading = document.createElement("div");
    heading.className = "dfwr-list-heading";
    heading.textContent = `Review items (${this.items.length})`;
    section.append(heading);
    if (this.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "No review items on this page.";
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
  createListItem(numberedItem) {
    const { item } = numberedItem;
    const row = document.createElement("article");
    row.className = "dfwr-item";
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute(
      "aria-label",
      `Restore review item: ${item.title ?? item.comment}`
    );
    row.addEventListener("click", () => {
      void this.restoreItem(item);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      void this.restoreItem(item);
    });
    const body = document.createElement("div");
    body.className = "dfwr-item-body";
    const badges = document.createElement("div");
    badges.className = "dfwr-item-badges";
    const scope = document.createElement("div");
    scope.className = `dfwr-item-scope is-scope-${numberedItem.scope}`;
    scope.textContent = numberedItem.displayLabel;
    const kind = document.createElement("div");
    kind.className = "dfwr-item-kind";
    kind.textContent = item.kind;
    badges.append(scope, kind);
    const comment = document.createElement("p");
    comment.className = "dfwr-item-comment";
    comment.textContent = item.comment;
    const date = document.createElement("time");
    date.className = "dfwr-item-date";
    date.dateTime = item.createdAt;
    date.textContent = formatItemMeta(item);
    body.append(badges, comment, date);
    if (item.screenshot) {
      const image = document.createElement("img");
      image.className = "dfwr-thumb";
      image.alt = "";
      image.src = item.screenshot.dataUrl;
      body.append(image);
    }
    const actions = document.createElement("div");
    actions.className = "dfwr-item-actions";
    actions.addEventListener("click", (event) => event.stopPropagation());
    actions.addEventListener("keydown", (event) => event.stopPropagation());
    const status = document.createElement("select");
    status.className = "dfwr-status-select";
    status.setAttribute("aria-label", "Workflow status");
    REVIEW_WORKFLOW_STATUS_OPTIONS.forEach((option) => {
      const itemOption = document.createElement("option");
      itemOption.value = option.value;
      itemOption.textContent = option.label;
      status.append(itemOption);
    });
    status.value = normalizeReviewItemStatus(item.status);
    status.addEventListener("change", (event) => {
      event.stopPropagation();
      void this.adapter.update(item.id, { status: status.value }).then(() => this.reload()).then(() => this.render());
    });
    const remove = document.createElement("button");
    remove.className = "dfwr-icon-button";
    remove.type = "button";
    remove.textContent = "x";
    remove.setAttribute("aria-label", "Delete");
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      void this.adapter.remove(item.id).then(() => this.reload()).then(() => this.render());
    });
    actions.append(status, remove);
    row.append(body, actions);
    return row;
  }
  createMarkerLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-marker-layer";
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
      const point = getBoundMarkerPoint(item, environment);
      if (!point || !isPointInViewport(point.viewport, environment) || !shouldShowMarkerForScope(scope, currentScope, point.isBound)) {
        return;
      }
      const isHighlighted = item.id === this.highlightedItemId;
      if (isHighlighted) {
        const selection = getBoundSelection(item, environment);
        if (selection && isSelectionInViewport(selection.viewport, environment)) {
          layer.append(
            this.createSelectionHighlight(selection.viewport, environment, false)
          );
        }
      }
      const hostPoint = toHostPoint(point.viewport, environment);
      const marker = this.createMarkerElement(
        hostPoint,
        String(number),
        scope,
        point.isBound,
        isHighlighted
      );
      marker.title = `${displayLabel} / ${item.comment}
${formatItemMeta(item)}`;
      layer.append(marker);
    });
    return layer;
  }
  createSelectionHighlight(selection, environment, isDraft) {
    const rect = toHostSelection(selection, environment);
    const highlight = document.createElement("div");
    highlight.className = `dfwr-selection-highlight${isDraft ? " is-draft" : ""}`;
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    return highlight;
  }
  createMarkerElement(hostPoint, label, scope, isBound, isHighlighted) {
    const marker = document.createElement("div");
    marker.className = [
      "dfwr-bound-marker",
      `is-scope-${scope}`,
      isBound ? "is-bound" : "is-fallback",
      isHighlighted ? "is-highlighted" : ""
    ].filter(Boolean).join(" ");
    marker.style.left = `${hostPoint.x}px`;
    marker.style.top = `${hostPoint.y}px`;
    marker.dataset.scope = scope;
    const iconElement = document.createElement("span");
    iconElement.className = "dfwr-bound-marker-icon";
    iconElement.setAttribute("aria-hidden", "true");
    const labelElement = document.createElement("span");
    labelElement.className = "dfwr-bound-marker-number";
    labelElement.textContent = label;
    marker.append(iconElement, labelElement);
    return marker;
  }
  attachDraftPinDrag(pin, popover, meta, textarea) {
    let isDragging = false;
    const moveDraftUi = (hostPoint) => {
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
          viewport: roundPoint(nextPoint)
        },
        comment: textarea.value
      };
      meta.textContent = formatTextDraftMeta(this.textDraft);
    };
    pin.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      isDragging = true;
      pin.setPointerCapture(event.pointerId);
    });
    pin.addEventListener("pointermove", (event) => {
      if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      moveDraftUi({
        x: event.clientX,
        y: event.clientY
      });
    });
    pin.addEventListener("pointerup", (event) => {
      if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      event.stopPropagation();
      isDragging = false;
      pin.releasePointerCapture(event.pointerId);
      const nextPoint = toTargetPointFromHostEvent(event, this.getEnvironment());
      void (this.mode === "element" ? this.bindElementDraftToPoint(nextPoint, textarea.value) : this.bindTextDraftToPoint(nextPoint, textarea.value));
    });
  }
  createTextLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-text-layer";
    const environment = this.getEnvironment();
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.createTextDraft(
        toTargetPointFromHostEvent(event, this.getEnvironment())
      );
    });
    return layer;
  }
  createElementLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-element-layer";
    const environment = this.getEnvironment();
    const hover = document.createElement("div");
    hover.className = "dfwr-dom-hover";
    hover.hidden = true;
    layer.append(hover);
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    const updateHover = (point) => {
      const nextEnvironment = this.getEnvironment();
      if (!nextEnvironment) return;
      const anchor = getDomAnchorFromPoint(
        clampPoint(point, nextEnvironment),
        this.options.anchors?.attribute,
        nextEnvironment
      );
      const selection = anchor ? getElementViewportSelection(anchor, nextEnvironment) : void 0;
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
    layer.addEventListener("pointermove", (event) => {
      updateHover(toTargetPointFromHostEvent(event, this.getEnvironment()));
    });
    layer.addEventListener("pointerleave", () => {
      hover.hidden = true;
    });
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.createElementDraft(
        toTargetPointFromHostEvent(event, this.getEnvironment())
      );
    });
    return layer;
  }
  async createTextDraft(point) {
    await this.bindTextDraftToPoint(point);
  }
  async createElementDraft(point) {
    await this.bindElementDraftToPoint(point);
  }
  async bindTextDraftToPoint(point, comment) {
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
      const marker = {
        viewport: roundPoint(nextPoint),
        relative: anchor ? getRelativePoint(nextPoint, anchor, environment) : void 0
      };
      return {
        viewport,
        anchor,
        marker,
        comment
      };
    });
    this.textDraft = draft;
    this.render();
  }
  async bindElementDraftToPoint(point, comment) {
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
      const elementSelection = anchor ? getElementViewportSelection(anchor, environment) : void 0;
      const selection = elementSelection ?? getPointSelection(nextPoint);
      const markerPoint = getSelectionCenter(selection);
      const reviewSelection = elementSelection ? {
        viewport: toPublicSelection(elementSelection),
        relative: getRelativeSelection(
          elementSelection,
          anchor,
          environment
        )
      } : void 0;
      const marker = {
        viewport: roundPoint(markerPoint),
        relative: anchor ? getRelativePoint(markerPoint, anchor, environment) : void 0
      };
      return {
        viewport,
        anchor,
        marker,
        selection: reviewSelection,
        comment
      };
    });
    this.textDraft = draft;
    this.render();
  }
  createCaptureLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-capture-layer";
    const environment = this.getEnvironment();
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    const box = document.createElement("div");
    box.className = "dfwr-capture-box";
    layer.append(box);
    let startX = 0;
    let startY = 0;
    let selection;
    const updateBox = (event) => {
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
    layer.addEventListener("pointerdown", (event) => {
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
    layer.addEventListener("pointermove", (event) => {
      if (!layer.hasPointerCapture(event.pointerId)) return;
      updateBox(event);
    });
    layer.addEventListener("pointerup", (event) => {
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
  async createCaptureDraft(selection) {
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
        const relativeSelection = anchor ? getRelativeSelection(selection, anchor, environment) : void 0;
        const marker = createSelectionCenterMarker(
          selection,
          anchor,
          environment
        );
        const reviewSelection = {
          viewport: toPublicSelection(selection),
          relative: relativeSelection
        };
        try {
          const screenshot = await captureSelection(selection, environment);
          return {
            viewport,
            anchor,
            marker,
            selection: reviewSelection,
            screenshot
          };
        } catch (error) {
          return {
            viewport,
            anchor,
            marker,
            selection: reviewSelection,
            error: error instanceof Error ? error.message : "Capture failed. The selected area will be saved without an image."
          };
        }
      });
      this.captureDraft = draft;
    } catch (error) {
      this.captureDraft = {
        viewport,
        error: error instanceof Error ? error.message : "Capture failed. Try a smaller area."
      };
    } finally {
      this.isCapturing = false;
      this.setModeState("capture");
      this.render();
    }
  }
  async withOverlayHidden(callback) {
    if (!this.root) return callback();
    const previousDisplay = this.root.style.display;
    this.root.style.display = "none";
    try {
      return await callback();
    } finally {
      this.root.style.display = previousDisplay;
    }
  }
  async createItem(input) {
    const environment = this.getEnvironment();
    if (!environment) return;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const routeKey = getRouteKey(environment);
    const viewport = input.viewport ?? getViewportSize(environment);
    const item = {
      id: createId(),
      projectId: this.options.projectId,
      routeKey,
      pageUrl: getPageUrl(environment),
      originalUrl: getOriginalUrl(environment),
      normalizedPath: routeKey,
      scope: input.scope ?? getReviewViewportScope(viewport, this.options.viewports?.presets),
      kind: input.kind,
      title: input.comment.split("\n")[0]?.slice(0, 80),
      comment: input.comment,
      status: "todo",
      viewport,
      devicePixelRatio: environment.window.devicePixelRatio || 1,
      scroll: {
        x: environment.window.scrollX,
        y: environment.window.scrollY
      },
      anchor: input.anchor,
      marker: input.marker,
      selection: input.selection,
      screenshot: input.screenshot,
      createdAt: now,
      updatedAt: now
    };
    await this.adapter.create(item);
    this.setModeState("idle");
    this.textDraft = void 0;
    this.captureDraft = void 0;
    this.highlightItem(item.id);
    await this.reload();
    this.render();
  }
  async restoreItem(item) {
    this.setModeState("idle");
    this.textDraft = void 0;
    this.captureDraft = void 0;
    if (this.options.onRestoreItem) {
      await this.options.onRestoreItem(item);
      return;
    }
    const environment = this.getEnvironment();
    if (!environment) return;
    if (item.scroll) {
      environment.window.scrollTo(item.scroll.x, item.scroll.y);
      await waitForNextFrame(environment);
    }
    this.highlightItem(item.id);
    this.render();
  }
};
async function captureSelection(selection, environment) {
  if (hasLiveMediaInSelection(selection, environment)) {
    return captureSelectionFromDisplayMedia(selection, environment);
  }
  await waitForNextFrame(environment);
  const { default: html2canvas } = await import("html2canvas");
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
    windowHeight: environment.document.documentElement.scrollHeight
  });
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: selection.width,
    height: selection.height
  };
}
function hasLiveMediaInSelection(selection, environment) {
  const mediaElements = Array.from(
    environment.document.querySelectorAll("video, canvas")
  );
  return mediaElements.some((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    return rectanglesIntersect(selection, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });
  });
}
function rectanglesIntersect(a, b) {
  return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
}
async function captureSelectionFromDisplayMedia(selection, environment) {
  if (!window.isSecureContext || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error(
      "Video/canvas capture needs HTTPS or localhost. Open the HTTPS Tailscale URL and try again."
    );
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
    surfaceSwitching: "exclude",
    video: {
      displaySurface: "browser",
      frameRate: 1
    }
  });
  try {
    const video = document.createElement("video");
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
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Capture failed. Canvas is unavailable.");
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
      dataUrl: canvas.toDataURL("image/png"),
      width: selection.width,
      height: selection.height
    };
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}
async function waitForVideoFrame(video) {
  const videoWithFrameCallback = video;
  if (typeof videoWithFrameCallback.requestVideoFrameCallback === "function") {
    await new Promise((resolve) => {
      videoWithFrameCallback.requestVideoFrameCallback?.(() => resolve());
    });
    return;
  }
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await new Promise((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("error", handleError);
      };
      const handleLoadedData = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error("Capture failed. Display stream did not load."));
      };
      video.addEventListener("loadeddata", handleLoadedData, { once: true });
      video.addEventListener("error", handleError, { once: true });
    });
  }
  await waitForNextFrame();
}
function waitForNextFrame(environment) {
  return new Promise((resolve) => {
    (environment?.window ?? window).requestAnimationFrame(() => resolve());
  });
}
function getDomAnchor(selection, configuredAttribute = "data-qa-id", environment) {
  const x = selection.left + selection.width / 2;
  const y = selection.top + selection.height / 2;
  return getDomAnchorFromPoint({ x, y }, configuredAttribute, environment);
}
function getDomAnchorFromPoint(point, configuredAttribute = "data-qa-id", environment) {
  const target = environment.document.elementFromPoint(point.x, point.y);
  if (!target) return void 0;
  const candidates = createAnchorCandidates(target, configuredAttribute);
  const primary = candidates[0];
  if (!primary) return void 0;
  return {
    ...primary,
    candidates,
    htmlSnippet: getElementHtmlSnippet(
      getAnchorSourceElement(target, primary, configuredAttribute) ?? target
    ),
    source: getDomSourceHint(target)
  };
}
function getElementViewportSelection(anchor, environment) {
  const element = getAnchorElement(anchor, environment);
  if (!element) return void 0;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return void 0;
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
}
function createAnchorCandidates(target, configuredAttribute) {
  const candidates = [];
  const anchoredByAttribute = target.closest(`[${configuredAttribute}]`);
  if (anchoredByAttribute) {
    const value = anchoredByAttribute.getAttribute(configuredAttribute);
    if (value) {
      candidates.push({
        selector: `[${configuredAttribute}="${cssEscape(value)}"]`,
        strategy: "configured-attribute",
        confidence: 0.98,
        textFingerprint: getTextFingerprint(anchoredByAttribute)
      });
    }
  }
  if (isMeaningfulId(target.id)) {
    candidates.push({
      selector: `#${cssEscape(target.id)}`,
      strategy: "id",
      confidence: 0.94,
      textFingerprint: getTextFingerprint(target)
    });
  }
  const targetClassName = getMeaningfulClassName(target);
  if (targetClassName) {
    candidates.push({
      selector: `${target.tagName.toLowerCase()}.${cssEscape(targetClassName)}`,
      strategy: "class",
      confidence: 0.82,
      textFingerprint: getTextFingerprint(target)
    });
  }
  candidates.push({
    selector: getDomPath(target),
    strategy: "dom-path",
    confidence: 0.9,
    textFingerprint: getTextFingerprint(target)
  });
  const parent = target.parentElement;
  const anchoredById = parent ? findClosest(parent, (element) => isMeaningfulId(element.id)) : void 0;
  if (anchoredById?.id) {
    candidates.push({
      selector: `#${cssEscape(anchoredById.id)}`,
      strategy: "id",
      confidence: 0.72,
      textFingerprint: getTextFingerprint(anchoredById)
    });
  }
  const anchoredByClass = parent ? findClosest(parent, (element) => Boolean(getMeaningfulClassName(element))) : void 0;
  const className = anchoredByClass ? getMeaningfulClassName(anchoredByClass) : void 0;
  if (anchoredByClass && className) {
    candidates.push({
      selector: `${anchoredByClass.tagName.toLowerCase()}.${cssEscape(
        className
      )}`,
      strategy: "class",
      confidence: 0.58,
      textFingerprint: getTextFingerprint(anchoredByClass)
    });
  }
  return dedupeAnchorCandidates(candidates);
}
function getAnchorSourceElement(target, candidate, configuredAttribute) {
  if (candidate.strategy === "configured-attribute") {
    return target.closest(`[${configuredAttribute}]`);
  }
  if (candidate.strategy === "dom-path") return target;
  try {
    return target.closest(candidate.selector);
  } catch {
    return target;
  }
}
function getElementHtmlSnippet(element, maxLength = 1e3) {
  const html = decodeHtmlEntities(element.outerHTML.replace(/\s+/g, " ").trim());
  if (html.length <= maxLength) return html;
  return `${html.slice(0, maxLength - 3)}...`;
}
function decodeHtmlEntities(value) {
  return value.replace(
    /&(#\d+|#x[\da-f]+|lt|gt|quot|apos|amp);/gi,
    (match, entity) => {
      const normalized = entity.toLowerCase();
      if (normalized === "lt") return "<";
      if (normalized === "gt") return ">";
      if (normalized === "quot") return '"';
      if (normalized === "apos") return "'";
      if (normalized === "amp") return "&";
      const codePoint = normalized.startsWith("#x") ? Number.parseInt(normalized.slice(2), 16) : Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
  );
}
function getDomSourceHint(target) {
  const sourceElement = target.closest(
    "[data-file], [data-component], [data-section-index], [data-section-id]"
  );
  if (!sourceElement) return void 0;
  const dataset = sourceElement.dataset;
  const source = {
    component: dataset.component,
    file: dataset.file,
    sectionId: dataset.sectionId,
    sectionIndex: dataset.sectionIndex
  };
  return Object.values(source).some(Boolean) ? source : void 0;
}
function getRelativeSelection(selection, anchor, environment) {
  const element = getAnchorElement(anchor, environment);
  if (!element) return void 0;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return void 0;
  return {
    x: roundRatio((selection.left - rect.left) / rect.width),
    y: roundRatio((selection.top - rect.top) / rect.height),
    width: roundRatio(selection.width / rect.width),
    height: roundRatio(selection.height / rect.height)
  };
}
function getRelativePoint(point, anchor, environment) {
  const element = getAnchorElement(anchor, environment);
  if (!element) return void 0;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return void 0;
  return {
    x: roundRatio((point.x - rect.left) / rect.width),
    y: roundRatio((point.y - rect.top) / rect.height)
  };
}
function getBoundMarkerPoint(item, environment) {
  const marker = getItemMarker(item);
  if (!marker) return void 0;
  if (item.anchor && marker.relative) {
    const resolved = resolveAnchorElement(item.anchor, environment);
    const element = resolved?.element;
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: roundPoint({
            x: rect.left + rect.width * marker.relative.x,
            y: rect.top + rect.height * marker.relative.y
          }),
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector
        };
      }
    }
  }
  const sourceScroll = item.scroll ?? { x: 0, y: 0 };
  return {
    viewport: roundPoint({
      x: marker.viewport.x + sourceScroll.x - environment.window.scrollX,
      y: marker.viewport.y + sourceScroll.y - environment.window.scrollY
    }),
    isBound: false,
    confidence: 0
  };
}
function getBoundSelection(item, environment) {
  const selection = getItemSelection(item);
  if (!selection?.viewport) return void 0;
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
            height: rect.height * selection.relative.height
          },
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector
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
      height: viewportSelection.height
    },
    isBound: false,
    confidence: 0
  };
}
function getItemMarker(item) {
  if (item.marker) return item.marker;
  const selection = getItemSelection(item);
  if (!selection?.viewport) return void 0;
  return {
    viewport: roundPoint(getSelectionCenter(selection.viewport)),
    relative: selection.relative ? roundPoint(getSelectionCenter(selection.relative)) : void 0
  };
}
function getItemSelection(item) {
  const value = item.selection;
  if (!value) return void 0;
  if ("viewport" in value && isRelativeSelection(value.viewport)) {
    return value;
  }
  if (isRelativeSelection(value)) {
    return {
      viewport: value
    };
  }
  return void 0;
}
function shouldShowMarkerForScope(scope, currentScope, isBound) {
  if (scope === "dom") return isBound;
  return scope === currentScope;
}
function createSelectionCenterMarker(selection, anchor, environment) {
  const centerPoint = getSelectionCenter(selection);
  return {
    viewport: roundPoint(centerPoint),
    relative: anchor ? getRelativePoint(centerPoint, anchor, environment) : void 0
  };
}
function getAnchorElement(anchor, environment) {
  return typeof anchor === "string" ? queryAnchorElement(anchor, environment) : resolveAnchorElement(anchor, environment)?.element;
}
function resolveAnchorElement(anchor, environment) {
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
      confidence
    }];
  });
  return matches.sort((a, b) => b.confidence - a.confidence)[0];
}
function getAnchorCandidates(anchor) {
  return dedupeAnchorCandidates([
    anchor,
    ...anchor.candidates ?? []
  ]);
}
function dedupeAnchorCandidates(candidates) {
  const seen = /* @__PURE__ */ new Set();
  return candidates.filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function queryBestAnchorCandidate(candidate, textFingerprint, environment) {
  const elements = queryAnchorElements(candidate.selector, environment);
  if (elements.length === 0) return void 0;
  if (!textFingerprint) {
    return {
      element: elements[0],
      score: 1
    };
  }
  return elements.map((element) => ({
    element,
    score: getTextFingerprintScore(
      textFingerprint,
      getTextFingerprint(element)
    )
  })).sort((a, b) => b.score - a.score)[0];
}
function queryAnchorElement(selector, environment) {
  return queryAnchorElements(selector, environment)[0];
}
function queryAnchorElements(selector, environment) {
  try {
    return Array.from(environment.document.querySelectorAll(selector));
  } catch {
    return [];
  }
}
function getPointSelection(point) {
  return {
    left: point.x,
    top: point.y,
    width: 1,
    height: 1
  };
}
function toViewportSelection(selection) {
  return {
    left: selection.x,
    top: selection.y,
    width: selection.width,
    height: selection.height
  };
}
function toPublicSelection(selection) {
  return {
    x: Math.round(selection.left),
    y: Math.round(selection.top),
    width: Math.round(selection.width),
    height: Math.round(selection.height)
  };
}
function getSelectionCenter(selection) {
  if ("left" in selection) {
    return {
      x: selection.left + selection.width / 2,
      y: selection.top + selection.height / 2
    };
  }
  return {
    x: selection.x + selection.width / 2,
    y: selection.y + selection.height / 2
  };
}
function isRelativeSelection(value) {
  if (!value || typeof value !== "object") return false;
  const selection = value;
  return typeof selection.x === "number" && typeof selection.y === "number" && typeof selection.width === "number" && typeof selection.height === "number";
}
function findClosest(start, predicate) {
  let element = start;
  const root = start.ownerDocument.documentElement;
  while (element && element !== root) {
    if (predicate(element)) return element;
    element = element.parentElement;
  }
  return void 0;
}
function getDomPath(element) {
  const parts = [];
  let current = element;
  const ownerDocument = element.ownerDocument;
  while (current && current !== ownerDocument.body && current !== ownerDocument.documentElement) {
    const parent = current.parentElement;
    const tag = current.tagName.toLowerCase();
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const currentTagName = current.tagName;
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === currentTagName
    );
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  return `body > ${parts.join(" > ")}`;
}
function getTextFingerprint(element) {
  const text = element.textContent?.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 120) : void 0;
}
function getTextFingerprintScore(expected, actual) {
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
function getFingerprintTokens(value) {
  return value.toLowerCase().split(/[\s/|,.:;()[\]{}"'`~!?<>]+/).map((token) => token.trim()).filter((token) => token.length > 1);
}
function isMeaningfulId(value) {
  const normalized = value.trim().toLowerCase();
  if (normalized.length <= 1) return false;
  return ![
    "app",
    "main",
    "page",
    "root",
    "__next",
    "__nuxt"
  ].includes(normalized);
}
function getMeaningfulClassName(element) {
  return Array.from(element.classList).find((name) => isMeaningfulClass(name));
}
function isMeaningfulClass(value) {
  const normalized = value.trim();
  if ([
    "absolute",
    "block",
    "contents",
    "fixed",
    "flex",
    "grid",
    "hidden",
    "relative",
    "sticky"
  ].includes(normalized)) {
    return false;
  }
  return normalized.length > 2 && !normalized.includes(":") && !/^(aspect|basis|bg|border|bottom|col|content|delay|duration|ease|font|from|gap|grow|h|inset|items|justify|leading|left|m|max-h|max-w|mb|ml|mr|mt|mx|my|min-h|min-w|object|opacity|order|origin|overflow|p|pb|pl|place|pointer|pr|pt|px|py|right|rotate|rounded|row|scale|self|shadow|shrink|text|to|top|tracking|transition|translate|via|w|z)-/.test(
    normalized
  ) && !normalized.startsWith("mq-");
}
function isHotkey(event, hotkey) {
  const parts = hotkey.split("+").map((part) => part.trim().toLowerCase()).filter(Boolean);
  const key = parts.find(
    (part) => !["shift", "ctrl", "control", "alt", "meta", "cmd"].includes(part)
  );
  if (!key) return false;
  if (parts.includes("shift") !== event.shiftKey) return false;
  if ((parts.includes("ctrl") || parts.includes("control")) !== event.ctrlKey) {
    return false;
  }
  if (parts.includes("alt") !== event.altKey) return false;
  if ((parts.includes("meta") || parts.includes("cmd")) !== event.metaKey) {
    return false;
  }
  return isHotkeyKey(event, key);
}
function isHotkeyKey(event, key) {
  const normalizedKey = key.toLowerCase();
  if (event.key.toLowerCase() === normalizedKey) return true;
  if (getHotkeyCode(normalizedKey) === event.code) return true;
  const aliases = {
    q: ["\u3142", "\u3143"]
  };
  return aliases[normalizedKey]?.includes(event.key) ?? false;
}
function getHotkeyCode(key) {
  if (/^[a-z]$/.test(key)) return `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  return void 0;
}
function getPageUrl(environment) {
  const location = environment?.window.location ?? window.location;
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}
function getOriginalUrl(environment) {
  const location = environment?.window.location ?? window.location;
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}
function getRouteKey(environment) {
  const location = environment?.window.location ?? window.location;
  return normalizeRoutePath(location.pathname);
}
function getItemRouteKey(item) {
  return item.routeKey || normalizeRoutePath(item.normalizedPath);
}
function normalizeRoutePath(pathname) {
  const [pathWithoutQuery] = pathname.split(/[?#]/);
  const path = (pathWithoutQuery || "/").replace(/\/index\.html$/, "/");
  return path.startsWith("/") ? path : `/${path}`;
}
function getPublicSearch(location) {
  const params = new URLSearchParams(location.search);
  INTERNAL_QUERY_PARAMS.forEach((key) => params.delete(key));
  const value = params.toString();
  return value ? `?${value}` : "";
}
function createId() {
  if ("randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(void 0, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatCaptureDraftMeta(draft) {
  const parts = [`viewport ${formatSize(draft.viewport)}`];
  if (draft.selection) {
    parts.push(`rect ${formatSelection(draft.selection.viewport)}`);
  }
  if (draft.marker) {
    parts.push(`point ${formatPoint(draft.marker.viewport)}`);
  }
  if (draft.screenshot) {
    parts.push(`capture ${formatSize(draft.screenshot)}`);
  }
  return parts.join(" / ");
}
function formatTextDraftMeta(draft) {
  const parts = [
    `viewport ${formatSize(draft.viewport)}`,
    `point ${formatPoint(draft.marker.viewport)}`
  ];
  if (draft.anchor) {
    parts.push(formatAnchorMeta(draft.anchor));
  }
  return parts.join(" / ");
}
function formatItemMeta(item) {
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
  if (item.screenshot) {
    parts.push(`capture ${formatSize(item.screenshot)}`);
  }
  return parts.join(" / ");
}
function formatSize(size) {
  return `${Math.round(size.width)}x${Math.round(size.height)}`;
}
function formatPoint(point) {
  return `${Math.round(point.x)},${Math.round(point.y)}`;
}
function formatSelection(selection) {
  return [
    Math.round(selection.x),
    Math.round(selection.y),
    Math.round(selection.width),
    Math.round(selection.height)
  ].join(",");
}
function formatAnchorMeta(anchor) {
  const parts = [`dom ${anchor.strategy}`];
  if (typeof anchor.confidence === "number") {
    parts.push(`${Math.round(anchor.confidence * 100)}%`);
  }
  const candidates = getAnchorCandidates(anchor);
  if (candidates.length > 1) {
    parts.push(`${candidates.length} candidates`);
  }
  return parts.join(" ");
}
function getViewportSize(environment) {
  const targetWindow = environment?.window ?? window;
  return {
    width: targetWindow.innerWidth,
    height: targetWindow.innerHeight
  };
}
function roundPoint(point) {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
}
function isPointInViewport(point, environment) {
  const viewport = getViewportSize(environment);
  return point.x >= 0 && point.y >= 0 && point.x <= viewport.width && point.y <= viewport.height;
}
function isSelectionInViewport(selection, environment) {
  const viewport = getViewportSize(environment);
  return rectanglesIntersect(selection, {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height
  });
}
function clampPoint(point, environment) {
  const viewport = getViewportSize(environment);
  return {
    x: clamp(point.x, 0, viewport.width),
    y: clamp(point.y, 0, viewport.height)
  };
}
function getPopoverPosition(point) {
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
    )
  };
}
function toHostPoint(point, environment) {
  if (!environment) return point;
  return {
    x: point.x + environment.viewportRect.left,
    y: point.y + environment.viewportRect.top
  };
}
function toHostSelection(selection, environment) {
  return {
    left: selection.left + environment.viewportRect.left,
    top: selection.top + environment.viewportRect.top,
    width: selection.width,
    height: selection.height
  };
}
function toTargetPoint(point, environment) {
  if (!environment) return point;
  return {
    x: point.x - environment.viewportRect.left,
    y: point.y - environment.viewportRect.top
  };
}
function toTargetPointFromHostEvent(event, environment) {
  return toTargetPoint(
    {
      x: event.clientX,
      y: event.clientY
    },
    environment
  );
}
function placeLayerOverTarget(layer, environment) {
  layer.style.left = `${environment.viewportRect.left}px`;
  layer.style.top = `${environment.viewportRect.top}px`;
  layer.style.width = `${environment.viewportRect.width}px`;
  layer.style.height = `${environment.viewportRect.height}px`;
  layer.style.right = "auto";
  layer.style.bottom = "auto";
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
function roundRatio(value) {
  return Math.round(value * 1e4) / 1e4;
}
function cssEscape(value) {
  if ("CSS" in window && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
function createNoopController() {
  return {
    open() {
    },
    close() {
    },
    toggle() {
    },
    setMode() {
    },
    getMode() {
      return "idle";
    },
    highlightItem() {
    },
    async reload() {
      return [];
    },
    getItems() {
      return [];
    },
    destroy() {
    }
  };
}
function createStyleElement() {
  const style = document.createElement("style");
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
      z-index: 500;
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
    .dfwr-status-select:hover,
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

    .dfwr-status-select {
      min-height: 32px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 6px;
      padding: 0 8px;
      color: #f7f7f2;
      background: #2a3137;
      font: inherit;
      font-size: 11px;
      font-weight: 700;
    }

    .dfwr-marker-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }

    .dfwr-capture-preview-layer {
      position: fixed;
      inset: 0;
      z-index: 3;
      pointer-events: none;
    }

    .dfwr-selection-highlight {
      position: fixed;
      z-index: 1;
      border: 2px solid #d7ff5f;
      border-radius: 3px;
      background: rgba(215, 255, 95, 0.08);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.72),
        0 0 0 9999px rgba(0, 0, 0, 0.12),
        0 10px 30px rgba(0, 0, 0, 0.22);
      animation: dfwr-selection-pulse 900ms ease 0s 2;
    }

    .dfwr-selection-highlight.is-draft {
      border-color: #63d7c7;
      background: rgba(99, 215, 199, 0.1);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.72),
        0 0 0 9999px rgba(0, 0, 0, 0.08),
        0 10px 30px rgba(0, 0, 0, 0.2);
      animation: none;
    }

    .dfwr-dom-hover {
      position: fixed;
      z-index: 2;
      border: 1px solid #d7ff5f;
      border-radius: 3px;
      background: rgba(215, 255, 95, 0.1);
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
      border-radius: 999px;
      background: #1f2428;
      box-shadow: 0 0 0 4px rgba(var(--dfwr-scope-rgb), 0.18);
      color: var(--dfwr-scope);
      font-size: 10px;
      font-weight: 800;
    }

    .dfwr-bound-marker.is-highlighted {
      min-width: 32px;
      height: 26px;
      border-width: 2px;
      box-shadow:
        0 0 0 5px rgba(var(--dfwr-scope-rgb), 0.22),
        0 12px 26px rgba(0, 0, 0, 0.34);
      animation: dfwr-marker-pulse 900ms ease 0s 2;
    }

    .dfwr-bound-marker.is-fallback {
      border-style: dashed;
    }

    .dfwr-capture-preview-layer .dfwr-bound-marker {
      border-color: #63d7c7;
      background: #1f2428;
      box-shadow:
        0 0 0 5px rgba(99, 215, 199, 0.2),
        0 12px 26px rgba(0, 0, 0, 0.3);
      color: #63d7c7;
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

    .dfwr-capture-draft {
      position: fixed;
      right: 16px;
      top: 16px;
      z-index: 4;
      width: min(360px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
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

    .dfwr-capture-draft .dfwr-actions {
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
      cursor: pointer;
    }

    .dfwr-item:first-of-type {
      border-top: 0;
    }

    .dfwr-item:focus-visible {
      outline: 2px solid rgba(215, 255, 95, 0.72);
      outline-offset: 4px;
    }

    .dfwr-item-body {
      min-width: 0;
      flex: 1;
    }

    .dfwr-item-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .dfwr-item-scope,
    .dfwr-item-kind {
      display: inline-flex;
      align-items: center;
      min-height: 20px;
      border-radius: 999px;
      padding: 0 7px;
      font-size: 10px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .dfwr-item-scope {
      border: 1px solid rgba(var(--dfwr-scope-rgb), 0.38);
      background: rgba(var(--dfwr-scope-rgb), 0.12);
      color: var(--dfwr-scope);
    }

    .dfwr-item-kind {
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.05);
      color: rgba(247, 247, 242, 0.64);
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
    .dfwr-element-layer,
    .dfwr-capture-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: auto;
    }

    .dfwr-text-layer {
      cursor: crosshair;
      background: rgba(0, 0, 0, 0.06);
    }

    .dfwr-element-layer {
      cursor: cell;
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

    @keyframes dfwr-marker-pulse {
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

    @keyframes dfwr-selection-pulse {
      0% {
        opacity: 0.72;
      }
      45% {
        opacity: 1;
      }
      100% {
        opacity: 0.86;
      }
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

export {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  normalizeReviewItemStatus,
  DEFAULT_REVIEW_VIEWPORTS,
  findReviewViewportPreset,
  getReviewViewportScope,
  getReviewItemScope,
  getReviewItemScopeLabel,
  getNumberedReviewItems,
  localAdapter,
  createWebReviewKit
};
//# sourceMappingURL=chunk-4MH32ISX.js.map