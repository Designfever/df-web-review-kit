import { filterStyles, px, type Measure } from './model';
import { styleGroups, type StyleSnapshot } from './snapshot';
import { inspectorStyles } from './styles';
import { appendText } from './dom';

/** Owns panel DOM and detail rows, not selection, source requests or events. */
export function createDesignInspectorPanel(doc: Document) {
  const win = doc.defaultView!;
  const host = doc.createElement('div');
  host.dataset.dfReviewDesignInspector = '';
  const shadow = host.attachShadow({ mode: 'open' });
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
  const get = <T extends HTMLElement = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const body = get('.body');
  const details = get('.details');

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
  function renderDetails(data: StyleSnapshot, tab: 'summary' | 'css', query: string) {
    const previousScroll = body.scrollTop;
    details.replaceChildren();
    for (const warning of data.warnings) appendText(details, 'div', warning, 'notice');
    if (tab === 'css') {
      const entries = filterStyles(data.styles, query);
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
  function renderMeasurements(guides: readonly Measure[]) {
    const info = get('.measure-info');
    info.replaceChildren();
    for (const guide of guides) row(info, guide.label, px(guide.end - guide.start));
  }
  return { host, get, renderDetails, renderMeasurements };
}
