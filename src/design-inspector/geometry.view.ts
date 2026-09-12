import { px, type Measure, type Rect } from './model';
import { fitLabelInViewport, projectRect, projectMeasure, type FrameGeometry } from './frame.geometry';
import { inspectorStyles } from './styles';
import { appendText } from './dom';

/** Draws geometry from the controller's current frame reads; owns no target state. */
export function createDesignInspectorGeometry(doc: Document) {
  const win = doc.defaultView!;
  const host = doc.createElement('div');
  host.dataset.dfReviewDesignGeometry = '';
  Object.assign(host.style, {
    position: 'fixed', inset: '0', zIndex: '870', pointerEvents: 'none',
  });
  const shadow = host.attachShadow({ mode: 'open' });
  const canvas = doc.createElement('div');
  canvas.className = 'canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.innerHTML = '<div class="geometry"></div><div class="labels"></div>';
  const style = doc.createElement('style');
  style.textContent = inspectorStyles;
  shadow.append(style, canvas);
  const geometry = canvas.querySelector<HTMLElement>('.geometry')!;
  const labels = canvas.querySelector<HTMLElement>('.labels')!;

  function clear(origin: FrameGeometry) {
    const bounds = origin.bounds;
    geometry.style.clipPath = `inset(${bounds.top}px ${Math.max(0, win.innerWidth - bounds.right)}px ${Math.max(0, win.innerHeight - bounds.bottom)}px ${bounds.left}px)`;
    geometry.replaceChildren();
    labels.replaceChildren();
  }
  function box(rect: Rect, label: string, origin: FrameGeometry, hover = false, below = false) {
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
  function drawMeasure(guide: Measure, origin: FrameGeometry) {
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
  return { host, clear, box, drawMeasure, fitLabels };
}
