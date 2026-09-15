import { measureRects, plainRect, px } from './model';
import {
  createReport,
  elementLabel,
  parentElement,
  readSnapshot,
  type StyleSnapshot
} from './snapshot';
import { createDesignInspectorPanel } from './panel.view';
import { createDesignInspectorGeometry } from './geometry.view';
import { bindDesignInspectorTargetEvents } from './target.events';
import type {
  DesignInspectorSourceLocation,
  DesignInspectorSourceOptions
} from './source';
import {
  getFrameDocument,
  getFrameGeometry,
  type FrameGeometry,
} from './frame.geometry';

export type DesignInspectorMode = 'pick' | 'browse';
export type DesignInspectorSession = { destroy(): void };
export type DesignInspectorOptions = {
  /** Existing review-kit sidebar content. No preview iframe is created. */
  container: HTMLElement;
  /** Place fixed geometry inside the shell stacking context when the shell is embedded. */
  overlayContainer?: HTMLElement;
  /** Existing same-origin target iframe, including its CSS scale. */
  frame: HTMLIFrameElement;
  source?: DesignInspectorSourceOptions;
  initialMode?: DesignInspectorMode;
  /** Called synchronously on initial bind, mode changes and iframe document rebind. */
  onModeChange?(mode: DesignInspectorMode): void;
};

/** Embedded Studio inspector core. The shell owns shortcuts, preview sizing and Figma. */
export function createDesignInspector({
  container,
  overlayContainer,
  frame: targetFrame,
  source,
  initialMode = 'pick',
  onModeChange,
}: DesignInspectorOptions): DesignInspectorSession {
  const doc = container.ownerDocument;
  const win = doc.defaultView!;
  const panel = createDesignInspectorPanel(doc);
  const geometryView = createDesignInspectorGeometry(doc);
  const { host, get } = panel;
  const overlayHost = geometryView.host;
  container.append(host);
  (overlayContainer ?? doc.body).append(overlayHost);
  const status = get('.status');
  const search = get<HTMLInputElement>('.search');
  const pseudoSelect = get<HTMLSelectElement>('.pseudo');
  let targetDoc: Document | null = null;
  let selected: Element | null = null;
  let hovered: Element | null = null;
  let compared: Element | null = null;
  let mode: DesignInspectorMode = initialMode;
  let notifiedMode: DesignInspectorMode | null = null;
  let measuring = false;
  let alt = false;
  let tab: 'summary' | 'css' = 'summary';
  let snapshot: StyleSnapshot | null = null;
  let sourceLocation: DesignInspectorSourceLocation | null = null;
  let sourceReady: Promise<void> | null = null;
  let sourceRequest = 0;
  let openingSource = false;
  let dirtyStyle = false;
  let dirtyDetails = false;
  let hitTest = false;
  let point: { x: number; y: number } | null = null;
  let animationFrame = 0;
  let destroyed = false;
  const cleanups: (() => void)[] = [];
  let targetCleanup: (() => void) | null = null;
  const resize = typeof win.ResizeObserver === 'function'
    ? new win.ResizeObserver(() => invalidate()) : null;
  const mutation = new win.MutationObserver(() => invalidate());
  const layoutResize = typeof win.ResizeObserver === 'function'
    ? new win.ResizeObserver(() => invalidate()) : null;
  const layoutMutation = new win.MutationObserver(() => invalidate());
  let origin: FrameGeometry = getFrameGeometry(targetFrame);

  function listen(
    target: EventTarget,
    name: string,
    callback: EventListener,
    options?: AddEventListenerOptions
  ) {
    target.addEventListener(name, callback, options);
    cleanups.push(() => target.removeEventListener(name, callback, options));
  }
  function click(selector: string, callback: () => void) {
    listen(get(selector), 'click', callback);
  }
  function inside(event: Event) {
    return event.composedPath().includes(host);
  }
  function observeSelection() {
    resize?.disconnect();
    mutation.disconnect();
    if (!selected) return;
    // Only selected branches, never a document-wide subtree observer.
    for (const base of [selected, compared]) {
      let current = base;
      for (let depth = 0; current && depth < 64; depth++) {
        resize?.observe(current);
        mutation.observe(current, {
          attributes: true,
          childList: true,
          characterData: current === base,
          subtree: current === base
        });
        current = parentElement(current);
      }
    }
  }
  function clearSource() {
    sourceRequest++;
    sourceLocation = null;
    sourceReady = null;
    openingSource = false;
    const container = get('.source-location');
    const button = get<HTMLButtonElement>('.open-source');
    container.hidden = true;
    container.classList.remove('error');
    get('.source-path').textContent = '';
    get('.source-path').removeAttribute('title');
    button.disabled = true;
    button.textContent = '소스 열기';
  }
  function resolveSource(element: Element) {
    clearSource();
    if (!source) return;
    const request = ++sourceRequest;
    const container = get('.source-location');
    const path = get('.source-path');
    container.hidden = false;
    path.textContent = '코드 위치 확인 중…';
    sourceReady = Promise.resolve().then(() => source.resolve(element)).then(
      (location) => {
        if (destroyed || request !== sourceRequest || selected !== element) return;
        sourceLocation = location;
        if (!location) {
          container.classList.add('error');
          path.textContent = '이 요소의 소스 위치를 찾지 못했습니다.';
          return;
        }
        container.classList.remove('error');
        path.textContent = `${location.displayPath}:${location.line}:${location.column}`;
        path.setAttribute('title', location.file);
        get<HTMLButtonElement>('.open-source').disabled = false;
      },
      () => {
        if (destroyed || request !== sourceRequest || selected !== element) return;
        container.classList.add('error');
        path.textContent = '이 요소의 소스 위치를 찾지 못했습니다.';
      }
    );
  }
  async function openSelectedSource() {
    if (!source || openingSource) return;
    const request = sourceRequest;
    const button = get<HTMLButtonElement>('.open-source');
    openingSource = true;
    if (!sourceLocation && sourceReady) await sourceReady;
    if (destroyed || request !== sourceRequest || !sourceLocation) {
      if (request === sourceRequest) openingSource = false;
      return;
    }
    button.disabled = true;
    button.textContent = '여는 중…';
    try {
      await source.open(sourceLocation);
      if (!destroyed && request === sourceRequest) button.textContent = '소스 열림';
    } catch {
      if (!destroyed && request === sourceRequest) {
        get('.source-location').classList.add('error');
        button.textContent = '열기 실패';
      }
    } finally {
      if (request === sourceRequest) {
        openingSource = false;
        if (!destroyed && sourceLocation) button.disabled = false;
      }
    }
  }
  function select(element: Element | null) {
    if (!element || element === host || !element.isConnected) return;
    selected = element;
    compared = null;
    hovered = null;
    measuring = false;
    snapshot = null;
    get<HTMLTextAreaElement>('.report').hidden = true;
    get('.copy').textContent = 'CSS 리포트 복사';
    resolveSource(element);
    observeSelection();
    updateMode();
    invalidate();
  }
  function updateMode() {
    get('.pick').setAttribute('aria-pressed', String(mode === 'pick' && !measuring));
    get('.browse').setAttribute('aria-pressed', String(mode === 'browse'));
    get<HTMLButtonElement>('.compare').disabled = !selected;
    get('.compare').setAttribute('aria-pressed', String(measuring));
    if (notifiedMode !== mode) {
      notifiedMode = mode;
      onModeChange?.(mode);
    }
    const message =
      !targetDoc
        ? '검사할 문서에 접근할 수 없습니다. 페이지 로드를 기다리거나 같은 출처의 미리보기를 열어주세요.'
        : mode === 'browse'
        ? '사이트 조작 중 · 버튼과 입력이 정상 동작합니다.'
        : measuring
          ? '비교할 두 번째 요소를 클릭/탭하세요.'
          : selected
            ? `클릭/탭으로 요소 선택${source ? ' · 더블클릭으로 소스 열기' : ''} · Alt/Option+호버 또는 ‘거리 측정’`
            : '호버로 크기 확인 · 클릭/탭으로 선택';
    if (status.textContent !== message) status.textContent = message;
  }
  function schedule() {
    if (!destroyed && !animationFrame) animationFrame = win.requestAnimationFrame(flush);
  }
  function invalidate() {
    dirtyStyle = true;
    dirtyDetails = true;
    schedule();
  }
  function atPoint() {
    if (!point || !targetDoc) return null;
    let element = targetDoc.elementFromPoint?.(point.x, point.y) ?? null;
    while (element?.shadowRoot) {
      if (element === host) return null;
      const inner = element.shadowRoot.elementFromPoint?.(point.x, point.y);
      if (!inner || inner === element) break;
      element = inner;
    }
    return element === host ? null : element;
  }
  function flush() {
    animationFrame = 0;
    if (destroyed) return;
    if (selected && !selected.isConnected) {
      clearSource();
      selected = null;
      compared = null;
      snapshot = null;
      measuring = false;
      observeSelection();
    }
    if (compared && !compared.isConnected) {
      compared = null;
      observeSelection();
    }
    if (hovered && !hovered.isConnected) hovered = null;
    if (hitTest) {
      hovered = mode === 'pick' ? atPoint() : null;
      hitTest = false;
    }
    const target = (alt || measuring) && hovered && hovered !== selected ? hovered : compared;
    // Batch target DOM reads before writing any overlay nodes.
    const selectedRect = selected ? plainRect(selected.getBoundingClientRect()) : null;
    const hoverRect =
      hovered && hovered !== selected && mode === 'pick'
        ? plainRect(hovered.getBoundingClientRect())
        : null;
    const targetRect = target ? plainRect(target.getBoundingClientRect()) : null;
    if (selected && (dirtyStyle || !snapshot))
      snapshot = readSnapshot(selected, pseudoSelect.value, tab === 'css');
    const guides =
      selectedRect && targetRect
        ? measureRects(selectedRect, targetRect).map((guide) =>
            guide.axis === 'y' && guide.kind === 'gap'
              ? { ...guide, lane: Math.max(64, Math.min(selectedRect.left, targetRect.left) - 12) }
              : guide
          )
        : [];
    const hoverLabel = hovered ? elementLabel(hovered) : '';
    origin = getFrameGeometry(targetFrame);
    geometryView.clear(origin);
    if (selectedRect && selected) geometryView.box(selectedRect, `A · ${elementLabel(selected)}`, origin);
    if (targetRect && target)
      geometryView.box(
        targetRect,
        `B · ${elementLabel(target)}`,
        origin,
        true,
        !!selectedRect &&
          targetRect.top >= selectedRect.top &&
          targetRect.top - 23 < selectedRect.bottom
      );
    else if (hoverRect) geometryView.box(hoverRect, hoverLabel, origin, true);
    guides.forEach((guide) => geometryView.drawMeasure(guide, origin));
    geometryView.fitLabels();
    get('.empty').hidden = !!selected;
    get('.selection').hidden = !selected;
    updateMode();
    const targetWin = targetDoc?.defaultView;
    get('.brand small').textContent = targetWin
      ? `DESIGN QA · ${targetWin.innerWidth} × ${targetWin.innerHeight}`
      : 'DESIGN QA · 미리보기 연결 대기';
    if (snapshot && selectedRect && selected) {
      snapshot.rect = selectedRect;
      get('.identity').textContent = snapshot.label + snapshot.pseudo;
      get('.width').textContent = px(selectedRect.width);
      get('.height').textContent = px(selectedRect.height);
      get<HTMLButtonElement>('.parent').disabled = !parentElement(selected);
      get<HTMLButtonElement>('.child').disabled = !selected.firstElementChild;
      get<HTMLButtonElement>('.previous').disabled = !selected.previousElementSibling;
      get<HTMLButtonElement>('.next').disabled =
        !selected.nextElementSibling || selected.nextElementSibling === host;
      panel.renderMeasurements(guides);
      if (dirtyDetails) panel.renderDetails(snapshot, tab, search.value);
    }
    dirtyStyle = false;
    dirtyDetails = false;
  }

  function changeDocument(next: Document | null) {
    targetCleanup?.();
    targetCleanup = null;
    targetDoc = next;
    notifiedMode = null;
    clearSource();
    selected = hovered = compared = null;
    snapshot = null;
    point = null;
    alt = measuring = hitTest = false;
    observeSelection();
    get<HTMLTextAreaElement>('.report').hidden = true;
    if (next && !destroyed) {
      targetCleanup = bindDesignInspectorTargetEvents(next, {
        isPicking: () => mode === 'pick',
        isInside: inside,
        getSelected: () => selected,
        sourceEnabled: !!source,
        onHover: (element, nextPoint, nextAlt) => {
          point = nextPoint;
          alt = nextAlt;
          hovered = element;
          schedule();
        },
        onSelect: (element, withAlt) => {
          if (selected && (measuring || withAlt)) {
            if (element !== selected) {
              compared = element;
              measuring = false;
              observeSelection();
              updateMode();
              schedule();
            }
          } else if (element !== selected) select(element);
        },
        onOpenSource: () => { void openSelectedSource(); },
        onAltChange: (nextAlt) => { alt = nextAlt; schedule(); },
        onLeave: (clearPoint) => {
          hovered = null;
          if (clearPoint) point = null;
          alt = false;
          schedule();
        },
        onPageHide: () => changeDocument(null),
        onViewportChange: (readStyles) => {
          hitTest = true;
          if (readStyles) invalidate();
          else schedule();
        },
        schedule,
        invalidate,
      });
      select(next.body);
    }
    updateMode();
    invalidate();
  }
  click('.pick', () => {
    mode = 'pick';
    measuring = false;
    compared = null;
    observeSelection();
    updateMode();
    schedule();
  });
  click('.browse', () => {
    mode = 'browse';
    measuring = false;
    hovered = null;
    alt = false;
    updateMode();
    schedule();
  });
  click('.compare', () => {
    mode = 'pick';
    measuring = !measuring;
    compared = null;
    observeSelection();
    updateMode();
    schedule();
  });
  click('.parent', () => select(selected ? parentElement(selected) : null));
  click('.child', () => select(selected?.firstElementChild ?? null));
  click('.previous', () => select(selected?.previousElementSibling ?? null));
  click('.next', () => select(selected?.nextElementSibling ?? null));
  click('.open-source', () => void openSelectedSource());
  function setTab(value: 'summary' | 'css') {
    tab = value;
    if (value === 'summary') pseudoSelect.value = '';
    get('.summary-tab').setAttribute('aria-pressed', String(value === 'summary'));
    get('.css-tab').setAttribute('aria-pressed', String(value === 'css'));
    get('.css-controls').hidden = value !== 'css';
    invalidate();
  }
  click('.summary-tab', () => setTab('summary'));
  click('.css-tab', () => setTab('css'));
  click('.refresh', invalidate);
  listen(search, 'input', () => {
    dirtyDetails = true;
    schedule();
  });
  listen(pseudoSelect, 'change', invalidate);
  click('.copy', () => {
    if (!selected) return;
    const targetWin = selected.ownerDocument.defaultView!;
    const report = createReport(readSnapshot(selected, pseudoSelect.value, true), {
      width: targetWin.innerWidth,
      height: targetWin.innerHeight
    });
    const output = get<HTMLTextAreaElement>('.report');
    const fallback = () => {
      if (destroyed) return;
      output.value = report;
      output.hidden = false;
      output.focus();
      output.select();
      get('.copy').textContent = '아래 텍스트를 직접 복사하세요';
    };
    if (win.isSecureContext && win.navigator.clipboard?.writeText) {
      void win.navigator.clipboard.writeText(report).then(() => {
        if (!destroyed) get('.copy').textContent = '복사 완료';
      }, fallback);
    } else fallback();
  });
  const rebind = () => changeDocument(getFrameDocument(targetFrame));
  listen(targetFrame, 'load', rebind);
  listen(targetFrame, 'error', () => changeDocument(null));
  listen(doc, 'scroll', () => schedule(), { capture: true, passive: true });
  listen(win, 'resize', invalidate, { passive: true });
  listen(win, 'blur', () => { alt = false; hovered = null; schedule(); });
  listen(doc, 'keydown', (event) => { alt = (event as KeyboardEvent).altKey; schedule(); });
  listen(doc, 'keyup', (event) => { alt = (event as KeyboardEvent).altKey; schedule(); });
  for (let element: Element | null = targetFrame; element; element = parentElement(element)) {
    layoutResize?.observe(element);
    layoutMutation.observe(element, { attributes: true });
  }
  if (win.visualViewport) {
    listen(win.visualViewport, 'resize', invalidate, { passive: true });
    listen(win.visualViewport, 'scroll', () => schedule(), { passive: true });
  }
  rebind();
  updateMode();
  get('.pick').focus({ preventScroll: true });
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (animationFrame) win.cancelAnimationFrame(animationFrame);
      layoutResize?.disconnect();
      layoutMutation.disconnect();
      resize?.disconnect();
      mutation.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      targetCleanup?.();
      targetCleanup = null;
      host.remove();
      overlayHost.remove();
      clearSource();
      selected = null;
      hovered = null;
      compared = null;
      snapshot = null;
      point = null;
    }
  };
}
