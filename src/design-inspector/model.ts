export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type Measure = {
  axis: 'x' | 'y';
  start: number;
  end: number;
  lane: number;
  kind: 'gap' | 'inset' | 'overlap';
  label: string;
};

export function px(value: number) {
  return `${Math.round(value * 100) / 100} px`;
}

export function plainRect(rect: Rect): Rect {
  const { left, top, right, bottom, width, height } = rect;
  return { left, top, right, bottom, width, height };
}

export function measureRects(a: Rect, b: Rect): Measure[] {
  const contains = (outer: Rect, inner: Rect) =>
    outer.left <= inner.left &&
    outer.top <= inner.top &&
    outer.right >= inner.right &&
    outer.bottom >= inner.bottom;
  if (contains(a, b) || contains(b, a)) {
    const [outer, inner] = contains(a, b) ? [a, b] : [b, a];
    return [
      {
        axis: 'x',
        start: outer.left,
        end: inner.left,
        lane: inner.top + inner.height / 2,
        kind: 'inset',
        label: '왼쪽 경계 거리'
      },
      {
        axis: 'x',
        start: inner.right,
        end: outer.right,
        lane: inner.top + inner.height / 2,
        kind: 'inset',
        label: '오른쪽 경계 거리'
      },
      {
        axis: 'y',
        start: outer.top,
        end: inner.top,
        lane: inner.left + inner.width / 2,
        kind: 'inset',
        label: '위쪽 경계 거리'
      },
      {
        axis: 'y',
        start: inner.bottom,
        end: outer.bottom,
        lane: inner.left + inner.width / 2,
        kind: 'inset',
        label: '아래쪽 경계 거리'
      }
    ];
  }
  const guides: Measure[] = [];
  const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  if (overlapX <= 0) {
    const [left, right] = a.left <= b.left ? [a, b] : [b, a];
    guides.push({
      axis: 'x',
      start: left.right,
      end: right.left,
      lane:
        overlapY > 0
          ? Math.max(a.top, b.top) + overlapY / 2
          : (a.top + a.height / 2 + b.top + b.height / 2) / 2,
      kind: 'gap',
      label: '가로 간격'
    });
  }
  if (overlapY <= 0) {
    const [top, bottom] = a.top <= b.top ? [a, b] : [b, a];
    guides.push({
      axis: 'y',
      start: top.bottom,
      end: bottom.top,
      lane:
        overlapX > 0
          ? Math.max(a.left, b.left) + overlapX / 2
          : (a.left + a.width / 2 + b.left + b.width / 2) / 2,
      kind: 'gap',
      label: '세로 간격'
    });
  }
  if (overlapX > 0 && overlapY > 0) {
    guides.push(
      {
        axis: 'x',
        start: Math.max(a.left, b.left),
        end: Math.min(a.right, b.right),
        lane: Math.max(a.top, b.top) + overlapY / 2,
        kind: 'overlap',
        label: '가로 겹침'
      },
      {
        axis: 'y',
        start: Math.max(a.top, b.top),
        end: Math.min(a.bottom, b.bottom),
        lane: Math.max(a.left, b.left) + overlapX / 2,
        kind: 'overlap',
        label: '세로 겹침'
      }
    );
  }
  return guides;
}

export function filterStyles(styles: Record<string, string>, query: string) {
  const search = query.trim().toLowerCase();
  return Object.entries(styles)
    .filter(([name, value]) => !search || `${name} ${value}`.toLowerCase().includes(search))
    .sort(([a], [b]) => a.localeCompare(b));
}

// Reports deliberately omit generated text, URL credentials/tokens and form values.
export function reportValue(name: string, value: string) {
  if (name === 'content') return '[생성 텍스트 제외]';
  // Redact the whole declaration, including quoted URLs containing parentheses
  // and image-set's string form. Partial regex replacement can leak URL suffixes.
  if (/(?:url\s*\(|image-set\s*\(|https?:|data:|blob:|file:)/i.test(value))
    return '[URL 포함 값 제외]';
  return value;
}
