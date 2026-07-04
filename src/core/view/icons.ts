// 오버레이 렌더러가 공유하는 아이콘/스피너 DOM 헬퍼.
// 뷰 상태에 의존하지 않는 순수 DOM 빌더만 모아둔다.

/** Builds an inline stroke icon from SVG path data. */
function createIcon(paths: string[]) {
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

/** Swaps the adjustment toggle between "move" (idle) and "check" (active) icons. */
export function setAdjustmentToggleIcon(
  button: HTMLButtonElement,
  isActive: boolean
) {
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
  button.replaceChildren(createIcon(paths));
}

/** Creates the busy spinner shown inside async buttons. */
export function createSpinner(className: string) {
  const spinner = document.createElement('span');
  spinner.className = className;
  spinner.setAttribute('aria-hidden', 'true');
  return spinner;
}
