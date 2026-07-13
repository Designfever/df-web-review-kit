export type DomAdjustmentPosition = {
  x: number;
  y: number;
};

type RenderElementToCanvas = (element: HTMLElement) => Promise<HTMLCanvasElement>;

type DomAdjustmentLayer = {
  element: HTMLElement;
  hiddenAttributeValue: string | null;
  position: DomAdjustmentPosition;
  wrapper: HTMLDivElement;
};

type DomAdjustmentLayerManagerOptions = {
  document: Document;
  onClear: (entryId: string) => void;
  renderElement?: RenderElementToCanvas;
};

const SOURCE_HIDDEN_ATTRIBUTE = 'data-dfwr-move-source-hidden';
const LAYER_ROOT_ATTRIBUTE = 'data-dfwr-move-layer-root';

export class DomAdjustmentLayerManager {
  private readonly document: Document;
  private readonly layers = new Map<string, DomAdjustmentLayer>();
  private readonly onClear: (entryId: string) => void;
  private readonly pending = new Map<string, symbol>();
  private readonly renderElement: RenderElementToCanvas;
  private readonly root: HTMLDivElement;
  private readonly style: HTMLStyleElement;

  constructor({
    document,
    onClear,
    renderElement = renderDomElementToCanvas,
  }: DomAdjustmentLayerManagerOptions) {
    this.document = document;
    this.onClear = onClear;
    this.renderElement = renderElement;
    this.root = createLayerRoot(document);
    this.style = createLayerStyle(document);
    document.head?.appendChild(this.style);
    document.documentElement.appendChild(this.root);
  }

  belongsTo(document: Document) {
    return this.document === document;
  }

  async create(
    entryId: string,
    label: string,
    element: Element,
    position: DomAdjustmentPosition,
    viewportScale: number
  ) {
    const existing = this.layers.get(entryId);
    if (existing) {
      existing.position = position;
      syncLayerPosition(existing.wrapper, position, viewportScale);
      return true;
    }

    const HTMLElementConstructor =
      element.ownerDocument.defaultView?.HTMLElement;
    if (!HTMLElementConstructor || !(element instanceof HTMLElementConstructor)) {
      return false;
    }

    const token = Symbol(entryId);
    this.pending.set(entryId, token);
    const rect = element.getBoundingClientRect();
    const canvas = await this.renderElement(element as HTMLElement);
    if (this.pending.get(entryId) !== token) return false;
    this.pending.delete(entryId);

    const wrapper = createLayerWrapper(this.document, entryId, label, canvas);
    wrapper.style.left = `${roundCss(rect.left + (this.document.defaultView?.scrollX ?? 0))}px`;
    wrapper.style.top = `${roundCss(rect.top + (this.document.defaultView?.scrollY ?? 0))}px`;
    wrapper.style.width = `${roundCss(rect.width)}px`;
    wrapper.style.height = `${roundCss(rect.height)}px`;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    syncLayerPosition(wrapper, position, viewportScale);

    const hiddenAttributeValue = element.getAttribute(SOURCE_HIDDEN_ATTRIBUTE);
    element.setAttribute(SOURCE_HIDDEN_ATTRIBUTE, 'true');
    wrapper.querySelector('button')?.addEventListener('click', () => {
      this.clear(entryId);
    });
    this.root.appendChild(wrapper);
    this.layers.set(entryId, {
      element: element as HTMLElement,
      hiddenAttributeValue,
      position,
      wrapper,
    });
    return true;
  }

  adjust(
    entryId: string,
    delta: Partial<DomAdjustmentPosition>,
    viewportScale: number
  ) {
    const layer = this.layers.get(entryId);
    if (!layer) return null;

    layer.position = {
      x: layer.position.x + (delta.x ?? 0),
      y: layer.position.y + (delta.y ?? 0),
    };
    syncLayerPosition(layer.wrapper, layer.position, viewportScale);
    return layer.position;
  }

  clear(entryId: string, notify = true) {
    this.pending.delete(entryId);
    const layer = this.layers.get(entryId);
    if (!layer) {
      if (notify) this.onClear(entryId);
      return;
    }

    layer.wrapper.remove();
    if (layer.hiddenAttributeValue === null) {
      layer.element.removeAttribute(SOURCE_HIDDEN_ATTRIBUTE);
    } else {
      layer.element.setAttribute(
        SOURCE_HIDDEN_ATTRIBUTE,
        layer.hiddenAttributeValue
      );
    }
    this.layers.delete(entryId);
    if (notify) this.onClear(entryId);
  }

  destroy() {
    this.pending.clear();
    [...this.layers.keys()].forEach((entryId) => this.clear(entryId, false));
    this.root.remove();
    this.style.remove();
  }
}

async function renderDomElementToCanvas(element: HTMLElement) {
  const html2canvas = (await import('html2canvas')).default;
  return html2canvas(element, {
    allowTaint: false,
    backgroundColor: null,
    imageTimeout: 5000,
    logging: false,
    removeContainer: true,
    scale: element.ownerDocument.defaultView?.devicePixelRatio ?? 1,
    useCORS: true,
  });
}

function createLayerRoot(document: Document) {
  const root = document.createElement('div');
  root.setAttribute(LAYER_ROOT_ATTRIBUTE, 'true');
  root.style.position = 'absolute';
  root.style.inset = '0 auto auto 0';
  root.style.width = '0';
  root.style.height = '0';
  root.style.zIndex = '2147483645';
  root.style.pointerEvents = 'none';
  return root;
}

function createLayerStyle(document: Document) {
  const style = document.createElement('style');
  style.textContent = `
    [${SOURCE_HIDDEN_ATTRIBUTE}='true'] {
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  return style;
}

function createLayerWrapper(
  document: Document,
  entryId: string,
  label: string,
  canvas: HTMLCanvasElement
) {
  const wrapper = document.createElement('div');
  wrapper.dataset.dfwrMoveEntryId = entryId;
  wrapper.style.position = 'absolute';
  wrapper.style.transformOrigin = 'top left';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.willChange = 'transform';

  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.display = 'block';
  canvas.style.pointerEvents = 'none';

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.title = `Clear ${label} move`;
  clear.setAttribute('aria-label', `Clear ${label} move`);
  clear.setAttribute('data-dfwr-source-open-shortcut', 'true');
  clear.style.position = 'absolute';
  clear.style.top = '4px';
  clear.style.right = '4px';
  clear.style.width = '22px';
  clear.style.height = '22px';
  clear.style.display = 'grid';
  clear.style.placeItems = 'center';
  clear.style.padding = '0';
  clear.style.border = '1px solid rgba(255, 255, 255, 0.35)';
  clear.style.borderRadius = '50%';
  clear.style.background = 'rgba(18, 23, 31, 0.88)';
  clear.style.color = '#edf3fb';
  clear.style.font = '16px/1 system-ui, sans-serif';
  clear.style.cursor = 'pointer';
  clear.style.pointerEvents = 'auto';

  const clearIcon = document.createElement('span');
  clearIcon.textContent = '×';
  clearIcon.style.transform = 'translateY(-1px)';
  clear.appendChild(clearIcon);

  wrapper.append(canvas, clear);
  return wrapper;
}

function syncLayerPosition(
  wrapper: HTMLElement,
  position: DomAdjustmentPosition,
  viewportScale: number
) {
  wrapper.style.transform = `translate(${roundCss(position.x * viewportScale)}px, ${roundCss(position.y * viewportScale)}px)`;
}

function roundCss(value: number) {
  return Math.round(value * 1000) / 1000;
}
