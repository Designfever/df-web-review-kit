import { plainRect, reportValue, type Rect } from './model';
import { isShadowRoot } from './dom';

export const styleGroups = [
  [
    '타이포그래피',
    [
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
      'letter-spacing',
      'text-align',
      'text-decoration',
      'white-space',
      'word-break',
      'text-wrap',
      'text-overflow',
      '-webkit-line-clamp'
    ]
  ],
  [
    '색상·효과',
    [
      'color',
      'background-color',
      'opacity',
      'border-radius',
      'box-shadow',
      'background-image',
      'filter',
      'backdrop-filter',
      'mix-blend-mode'
    ]
  ],
  [
    '레이아웃',
    [
      'display',
      'box-sizing',
      'width',
      'height',
      'min-width',
      'max-width',
      'min-height',
      'max-height',
      'aspect-ratio',
      'gap',
      'row-gap',
      'column-gap',
      'flex-direction',
      'flex-wrap',
      'justify-content',
      'align-items',
      'flex-grow',
      'flex-shrink',
      'flex-basis',
      'grid-template-columns',
      'grid-template-rows'
    ]
  ],
  [
    '위치·스크롤',
    [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'overflow-x',
      'overflow-y',
      'transform',
      'object-fit',
      'object-position'
    ]
  ],
  ['동작', ['cursor', 'pointer-events', 'appearance', 'transition', 'animation']]
] as const;
const boxProperties = ['margin', 'padding', 'border'].flatMap((kind) =>
  ['top', 'right', 'bottom', 'left'].map(
    (side) => `${kind}-${side}${kind === 'border' ? '-width' : ''}`
  )
);
const summaryProperties = [
  ...new Set([...styleGroups.flatMap(([, names]) => [...names]), ...boxProperties])
];

export type StyleSnapshot = {
  rect: Rect;
  label: string;
  selector: string;
  styles: Record<string, string>;
  pseudo: string;
  warnings: string[];
};

export function parentElement(element: Element): Element | null {
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return isShadowRoot(root) ? root.host : null;
}

export function elementLabel(element: Element) {
  // Do not inspect textContent, input values or arbitrary data attributes.
  const classes = [...element.classList]
    .slice(0, 2)
    .map((name) => `.${name}`)
    .join('');
  return `${element.localName}${classes}`.slice(0, 180);
}

function structuralSelector(element: Element) {
  const parts: string[] = [];
  let current: Element | null = element;
  for (let depth = 0; current && depth < 8; depth++) {
    let index = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.localName === current.localName) index++;
      sibling = sibling.previousElementSibling;
    }
    parts.unshift(`${current.localName}:nth-of-type(${index})`);
    if (!current.parentElement && isShadowRoot(current.getRootNode())) parts.unshift('::shadow');
    current = parentElement(current);
  }
  return parts.join(' > ');
}

export function readSnapshot(element: Element, pseudo = '', all = false): StyleSnapshot {
  const computed = element.ownerDocument.defaultView!.getComputedStyle(element, pseudo || null);
  const names = all
    ? [...new Set([...Array.from(computed), ...summaryProperties])]
    : summaryProperties;
  const styles = Object.fromEntries(
    names.map((name) => [name, computed.getPropertyValue(name).trim()])
  );
  const rect = plainRect(element.getBoundingClientRect());
  const warnings: string[] = [];
  if (pseudo)
    warnings.push(
      '가상 요소의 계산 CSS입니다. 표시 박스·거리는 원본 요소 기준이며 가상 요소 크기가 아닙니다.'
    );
  if (styles.transform !== 'none')
    warnings.push('화면 크기는 변형 후 경계 상자입니다. CSS width/height와 다를 수 있습니다.');
  if (element.getClientRects().length > 1)
    warnings.push(
      '여러 줄/조각의 통합 경계 상자입니다. 글자 잉크 영역이나 개별 줄 간격이 아닙니다.'
    );
  if (styles.display === 'contents')
    warnings.push('display: contents 요소는 자체 레이아웃 박스가 없습니다. 자식을 선택하세요.');
  if (
    element.scrollWidth > element.clientWidth + 1 ||
    element.scrollHeight > element.clientHeight + 1
  )
    warnings.push('콘텐츠가 내부 표시 영역보다 큽니다. overflow와 잘림을 확인하세요.');
  if (['iframe', 'canvas'].includes(element.localName))
    warnings.push(
      '이 요소의 외곽 CSS만 제공합니다. iframe 내부와 canvas 픽셀은 검사하지 않습니다.'
    );
  return {
    rect,
    label: elementLabel(element),
    selector: structuralSelector(element),
    styles,
    pseudo,
    warnings
  };
}

export function createReport(snapshot: StyleSnapshot, viewport: { width: number; height: number }) {
  return [
    'Design Inspector · CSS snapshot',
    `viewport: ${viewport.width} × ${viewport.height} CSS px`,
    `element: ${snapshot.selector}${snapshot.pseudo}`,
    `rendered border box: ${snapshot.rect.width} × ${snapshot.rect.height} CSS px`,
    '입력값, 페이지 텍스트, URL 및 쿼리스트링은 포함하지 않습니다.',
    ...snapshot.warnings,
    '',
    ...Object.entries(snapshot.styles)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([name, value]) =>
          `${name}: ${name.startsWith('--') ? '[사용자 정의 변수 값 제외]' : reportValue(name, value)};`
      )
  ].join('\n');
}
