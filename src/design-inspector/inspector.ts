import { filterStyles, measureRects, plainRect, px, type Measure, type Rect } from './model';
import {
  createReport,
  elementLabel,
  parentElement,
  readSnapshot,
  styleGroups,
  type StyleSnapshot
} from './snapshot';
import { inspectorStyles } from './styles';
import { isElement } from './dom';
import type {
  DesignInspectorSourceLocation,
  DesignInspectorSourceOptions
} from './source';
import {
  fitLabelInViewport,
  getFrameDocument,
  getFrameGeometry,
  projectRect,
  projectMeasure,
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
  const host = doc.createElement('div');
  host.dataset.dfReviewDesignInspector = '';
  const shadow = host.attachShadow({ mode: 'open' });
  const overlayHost = doc.createElement('div');
  overlayHost.dataset.dfReviewDesignGeometry = '';
  Object.assign(overlayHost.style, {
    position: 'fixed', inset: '0', zIndex: '870', pointerEvents: 'none',
  });
  const overlayShadow = overlayHost.attachShadow({ mode: 'open' });
  const canvas = doc.createElement('div');
  canvas.className = 'canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.innerHTML = '<div class="geometry"></div><div class="labels"></div>';
  const root = doc.createElement('div');
  root.className = 'inspector';
  const style = doc.createElement('style');
  style.textContent = inspectorStyles;
  // Static, package-owned markup only. Inspected content is always assigned with textContent.
  root.innerHTML = `
    <section class="panel" aria-label="디자인 인스펙터">
      <div class="header">
        <div class="brand">Design Inspector<small>DESIGNFEVER · LOCAL QA</small></div>
        <div class="toolbar">
          <button class="pick" aria-pressed="true">요소 선택</button>
          <button class="browse" aria-pressed="false">사이트 조작</button>
          <button class="compare" aria-pressed="false" disabled>거리 측정</button>
        </div>
      </div>
      <div class="status" role="status" aria-live="polite">호버로 크기 확인 · 클릭/탭으로 선택</div>
      <div class="body">
        <div class="empty"><strong>화면 위의 요소를 선택하세요</strong>폰트, 색상, 크기와 간격을 확인합니다.<br>버튼을 실제로 누르려면 ‘사이트 조작’으로 전환하세요.<p>Shift+1 켜기/끄기<br>요소 선택 후 Alt/Option+호버로 거리 측정</p></div>
        <div class="selection" hidden>
          <div class="identity"></div>
          <div class="source-location" hidden><code class="source-path"></code><button class="open-source" type="button" disabled>소스 열기</button></div>
          <div class="navigation">
            <button class="parent">부모 ↑</button><button class="child">자식 ↓</button>
            <button class="previous">이전 형제</button><button class="next">다음 형제</button>
          </div>
          <div class="metrics"><div class="metric"><span>화면 너비 · border box</span><strong class="width"></strong></div><div class="metric"><span>화면 높이 · border box</span><strong class="height"></strong></div></div>
          <div class="measure-info"></div>
          <div class="tabs"><button class="summary-tab" aria-pressed="true">디자인 요약</button><button class="css-tab" aria-pressed="false">전체 CSS</button></div>
          <div class="css-controls" hidden>
            <select class="pseudo" aria-label="가상 요소 선택"><option value="">요소 자체</option><option value="::before">::before</option><option value="::after">::after</option><option value="::placeholder">::placeholder</option><option value="::marker">::marker</option></select>
            <input class="search" aria-label="CSS 속성 검색" placeholder="속성 또는 값 검색 · font, 16px…" type="search" autocomplete="off">
          </div>
          <div class="details"></div>
          <div class="actions"><button class="refresh">값 새로고침</button><button class="copy">CSS 리포트 복사</button></div>
          <textarea class="report" aria-label="복사할 CSS 리포트" readonly hidden></textarea>
          <p class="hint">현재 브라우저의 계산값 · CSS px 기준. 색상은 합성 전 CSS 값, 폰트는 선언 목록입니다. 원본 CSS 규칙·우선순위와 강제 hover는 아직 지원하지 않습니다.</p>
        </div>
      </div>
    </section>`;
  shadow.append(style, root);
  overlayShadow.append(style.cloneNode(true), canvas);
  container.append(host);
  (overlayContainer ?? doc.body).append(overlayHost);
  const get = <T extends HTMLElement = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const geometry = canvas.querySelector<HTMLElement>('.geometry')!;
  const labels = canvas.querySelector<HTMLElement>('.labels')!;
  const body = get('.body');
  const status = get('.status');
  const details = get('.details');
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
  const targetCleanups: (() => void)[] = [];
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
    options?: AddEventListenerOptions,
    bucket = cleanups
  ) {
    target.addEventListener(name, callback, options);
    bucket.push(() => target.removeEventListener(name, callback, options));
  }
  function click(selector: string, callback: () => void) {
    listen(get(selector), 'click', callback);
  }
  function inside(event: Event) {
    return event.composedPath().includes(host);
  }
  function targetOf(event: Event) {
    if (inside(event)) return null;
    return event.composedPath().find(isElement) ?? null;
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
  function appendText(parent: Element, tag: string, text: string, className = '') {
    const node = doc.createElement(tag);
    node.textContent = text;
    node.className = className;
    parent.append(node);
    return node;
  }
  function row(parent: Element, name: string, value: string) {
    const line = appendText(parent, 'div', '', 'row');
    appendText(line, 'span', name, 'key');
    const output = appendText(line, 'span', value || '—', 'value');
    if (name.endsWith('color') && win.CSS?.supports?.('color', value)) {
      const swatch = doc.createElement('span');
      swatch.className = 'swatch';
      swatch.style.backgroundColor = value;
      output.prepend(swatch);
    }
  }
  function renderDetails(data: StyleSnapshot) {
    const previousScroll = body.scrollTop;
    details.replaceChildren();
    for (const warning of data.warnings) appendText(details, 'div', warning, 'notice');
    if (tab === 'css') {
      const entries = filterStyles(data.styles, search.value);
      appendText(
        details,
        'p',
        `${entries.length}개 속성 · 현재 브라우저가 제공하는 계산값`,
        'hint'
      );
      for (const [name, value] of entries) row(details, name, value);
    } else {
      appendText(details, 'h3', '박스 모델 · 위 / 오른쪽 / 아래 / 왼쪽');
      const sides = (kind: string) =>
        ['top', 'right', 'bottom', 'left']
          .map(
            (side) => data.styles[`${kind}-${side}${kind === 'border' ? '-width' : ''}`] || '0px'
          )
          .join(' / ');
      const box = appendText(details, 'div', `margin  ${sides('margin')}`, 'box-model');
      const border = appendText(box, 'div', `border  ${sides('border')}`, 'border');
      const padding = appendText(border, 'div', `padding  ${sides('padding')}`, 'padding');
      appendText(
        padding,
        'div',
        `CSS width ${data.styles.width} · height ${data.styles.height}`,
        'content'
      );
      appendText(
        details,
        'p',
        'margin/padding 값과 요소 간 실측 거리는 다를 수 있습니다. 부모 정렬, gap, margin 상쇄 등이 함께 영향을 줍니다.',
        'hint'
      );
      for (const [title, properties] of styleGroups) {
        appendText(details, 'h3', title);
        for (const name of properties) row(details, name, data.styles[name]);
      }
    }
    body.scrollTop = previousScroll;
  }
  function box(rect: Rect, label: string, hover = false, below = false) {
    const actual = rect;
    rect = projectRect(rect, origin);
    const outline = doc.createElement('div');
    outline.className = `outline${hover ? ' hover' : ''}`;
    Object.assign(outline.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
    geometry.append(outline);
    const badge = appendText(
      labels,
      'div',
      `${label}  ${px(actual.width)} × ${px(actual.height)}`,
      `badge${hover ? ' hover' : ''}`
    );
    badge.dataset.above = String(!below);
    Object.assign(badge.style, {
      left: `${rect.left}px`,
      top: `${below ? rect.bottom + 3 : rect.top}px`
    });
  }
  function drawMeasure(guide: Measure) {
    const distance = guide.end - guide.start;
    guide = projectMeasure(guide, origin);
    const line = doc.createElement('div');
    line.className = `line ${guide.axis} ${guide.kind}`;
    const x = guide.axis === 'x' ? guide.start : guide.lane;
    const y = guide.axis === 'y' ? guide.start : guide.lane;
    Object.assign(line.style, {
      left: `${x}px`,
      top: `${y}px`,
      [guide.axis === 'x' ? 'width' : 'height']: `${guide.end - guide.start}px`
    });
    geometry.append(line);
    const label = appendText(
      labels,
      'div',
      `${guide.kind === 'overlap' ? '겹침 ' : ''}${px(distance)}`,
      `distance ${guide.kind}`
    );
    Object.assign(label.style, {
      left: `${Math.max(0, Math.min(guide.axis === 'x' ? (guide.start + guide.end) / 2 - 24 : guide.kind === 'gap' ? guide.lane - 64 : guide.lane + 6, win.innerWidth - 100))}px`,
      top: `${Math.max(0, Math.min(guide.axis === 'y' ? (guide.start + guide.end) / 2 - 11 : guide.lane + 6, win.innerHeight - 26))}px`
    });
  }
  function fitLabels() {
    // 표시 라벨만 한 번에 읽은 뒤 위치를 보정합니다. 페이지 전체는 측정하지 않습니다.
    const positions = Array.from(labels.children, (node) => {
      const label = node as HTMLElement;
      const rect = label.getBoundingClientRect();
      return {
        label,
        position: fitLabelInViewport(
          {
            left: rect.left,
            top: rect.top - (label.dataset.above === 'true' ? rect.height + 4 : 0),
            width: rect.width,
            height: rect.height
          },
          win.innerWidth,
          win.innerHeight
        )
      };
    });
    for (const { label, position } of positions) {
      label.style.left = `${position.left}px`;
      label.style.top = `${position.top}px`;
    }
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
    const bounds = origin.bounds;
    geometry.style.clipPath = `inset(${bounds.top}px ${Math.max(0, win.innerWidth - bounds.right)}px ${Math.max(0, win.innerHeight - bounds.bottom)}px ${bounds.left}px)`;
    geometry.replaceChildren();
    labels.replaceChildren();
    if (selectedRect && selected) box(selectedRect, `A · ${elementLabel(selected)}`);
    if (targetRect && target)
      box(
        targetRect,
        `B · ${elementLabel(target)}`,
        true,
        !!selectedRect &&
          targetRect.top >= selectedRect.top &&
          targetRect.top - 23 < selectedRect.bottom
      );
    else if (hoverRect) box(hoverRect, hoverLabel, true);
    guides.forEach(drawMeasure);
    fitLabels();
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
      const info = get('.measure-info');
      info.replaceChildren();
      for (const guide of guides) row(info, guide.label, px(guide.end - guide.start));
      if (dirtyDetails) renderDetails(snapshot);
    }
    dirtyStyle = false;
    dirtyDetails = false;
  }

  function changeDocument(next: Document | null) {
    targetCleanups.splice(0).forEach((cleanup) => cleanup());
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
      bindTargetEvents(next);
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
  function bindTargetEvents(eventDoc: Document) {
    const eventWin = eventDoc.defaultView!;
    const listenTarget = (
      target: EventTarget,
      name: string,
      callback: EventListener,
      options?: AddEventListenerOptions
    ) => listen(target, name, callback, options, targetCleanups);
    listenTarget(
      eventDoc,
      'pointermove',
      (event) => {
        const pointer = event as PointerEvent;
        if (mode !== 'pick' || pointer.pointerType === 'touch' || inside(event)) return;
        point = { x: pointer.clientX, y: pointer.clientY };
        alt = pointer.altKey;
        hovered = targetOf(event);
        schedule();
      },
      { capture: true, passive: true }
    );
    listenTarget(
      eventDoc,
      'pointerdown',
      (event) => {
        if (mode !== 'pick' || inside(event)) return;
        // Keep touch scrolling native. Selection is completed on click, not touchstart.
        if ((event as PointerEvent).pointerType !== 'touch') event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true }
    );
    listenTarget(
      eventDoc,
      'click',
      (event) => {
        if (mode !== 'pick' || inside(event)) return;
        const element = targetOf(event);
        if (!element) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (selected && (measuring || (event as MouseEvent).altKey)) {
          if (element !== selected) {
            compared = element;
            measuring = false;
            observeSelection();
            updateMode();
            schedule();
          }
        } else if (element !== selected) select(element);
      },
      { capture: true }
    );
    listenTarget(
      eventDoc,
      'dblclick',
      (event) => {
        if (mode !== 'pick' || inside(event)) return;
        const element = targetOf(event);
        if (!element || element !== selected || !source) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        void openSelectedSource();
      },
      { capture: true }
    );
    listenTarget(eventDoc, 'keydown', (event) => {
      alt = (event as KeyboardEvent).altKey;
      schedule();
    });
    listenTarget(eventDoc, 'keyup', (event) => {
      alt = (event as KeyboardEvent).altKey;
      schedule();
    });
    listenTarget(eventWin, 'blur', () => {
      alt = false;
      hovered = null;
      schedule();
    });
    listenTarget(eventDoc, 'pointerout', (event) => {
      if ((event as MouseEvent).relatedTarget) return;
      hovered = null;
      point = null;
      alt = false;
      schedule();
    }, { capture: true });
    listenTarget(eventWin, 'pagehide', () => changeDocument(null));
    listenTarget(
      eventDoc,
      'scroll',
      (event) => {
        if (inside(event)) return;
        hitTest = true;
        schedule();
      },
      { capture: true, passive: true }
    );
    listenTarget(
      eventWin,
      'resize',
      () => {
        hitTest = true;
        invalidate();
      },
      { passive: true }
    );
    if (eventWin.visualViewport) {
      listenTarget(eventWin.visualViewport, 'resize', invalidate, { passive: true });
      listenTarget(eventWin.visualViewport, 'scroll', () => schedule(), { passive: true });
    }
    for (const name of [
      'transitionend',
      'animationend',
      'input',
      'change',
      'focusin',
      'focusout'
    ]) {
      listenTarget(
        eventDoc,
        name,
        (event) => {
          if (!inside(event)) invalidate();
        },
        { capture: true, passive: true }
      );
    }
    if (eventDoc.fonts) listenTarget(eventDoc.fonts, 'loadingdone', invalidate);
  }
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
      targetCleanups.splice(0).forEach((cleanup) => cleanup());
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
