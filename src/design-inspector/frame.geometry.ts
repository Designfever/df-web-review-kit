import type { Measure, Rect } from './model';

export type FrameGeometry = {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  bounds: Rect;
};

function rect(left: number, top: number, right: number, bottom: number): Rect {
  return { left, top, right, bottom, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

/** iframe 내부의 CSS px를 호스트 viewport로 변환합니다. CSS scale과 border도 포함합니다. */
export function getFrameGeometry(frame: HTMLIFrameElement): FrameGeometry {
  const outer = frame.getBoundingClientRect();
  const scaleX = frame.offsetWidth > 0 ? outer.width / frame.offsetWidth : 1;
  const scaleY = frame.offsetHeight > 0 ? outer.height / frame.offsetHeight : 1;
  const left = outer.left + frame.clientLeft * scaleX;
  const top = outer.top + frame.clientTop * scaleY;
  const win = frame.ownerDocument.defaultView!;
  let clipLeft = Math.max(0, left);
  let clipTop = Math.max(0, top);
  let clipRight = Math.min(win.innerWidth, left + frame.clientWidth * scaleX);
  let clipBottom = Math.min(win.innerHeight, top + frame.clientHeight * scaleY);

  // review-kit의 바깥 스크롤 영역도 반영합니다. 부모 fixed overlay만 스크롤 밖으로 남지 않게 합니다.
  for (let parent = frame.parentElement; parent; parent = parent.parentElement) {
    const style = win.getComputedStyle(parent);
    const clips = (overflow: string) => /^(auto|scroll|hidden|clip)$/.test(overflow);
    if (!clips(style.overflowX) && !clips(style.overflowY)) continue;
    const box = parent.getBoundingClientRect();
    const x = parent.offsetWidth > 0 ? box.width / parent.offsetWidth : 1;
    const y = parent.offsetHeight > 0 ? box.height / parent.offsetHeight : 1;
    if (clips(style.overflowX)) {
      clipLeft = Math.max(clipLeft, box.left + parent.clientLeft * x);
      clipRight = Math.min(clipRight, box.left + (parent.clientLeft + parent.clientWidth) * x);
    }
    if (clips(style.overflowY)) {
      clipTop = Math.max(clipTop, box.top + parent.clientTop * y);
      clipBottom = Math.min(clipBottom, box.top + (parent.clientTop + parent.clientHeight) * y);
    }
  }
  return { left, top, scaleX, scaleY, bounds: rect(clipLeft, clipTop, Math.max(clipLeft, clipRight), Math.max(clipTop, clipBottom)) };
}

export function projectRect(value: Rect, origin: FrameGeometry): Rect {
  return rect(
    origin.left + value.left * origin.scaleX,
    origin.top + value.top * origin.scaleY,
    origin.left + value.right * origin.scaleX,
    origin.top + value.bottom * origin.scaleY,
  );
}

export function projectMeasure(guide: Measure, origin: FrameGeometry): Measure {
  const horizontal = guide.axis === 'x';
  const scale = horizontal ? origin.scaleX : origin.scaleY;
  const offset = horizontal ? origin.left : origin.top;
  return {
    ...guide,
    start: guide.start * scale + offset,
    end: guide.end * scale + offset,
    lane: guide.lane * (horizontal ? origin.scaleY : origin.scaleX) + (horizontal ? origin.top : origin.left),
  };
}

/** 안내 라벨은 iframe 경계 대신 부모 화면 안에 온전히 표시합니다. */
export function fitLabelInViewport(
  value: Pick<Rect, 'left' | 'top' | 'width' | 'height'>,
  width: number,
  height: number,
) {
  return {
    left: Math.max(8, Math.min(value.left, width - value.width - 8)),
    top: Math.max(8, Math.min(value.top, height - value.height - 8)),
  };
}

/** Cross-origin, sandbox 및 로드 중 문서는 정상적인 연결 대기 상태로 취급합니다. */
export function getFrameDocument(frame: HTMLIFrameElement): Document | null {
  try {
    const doc = frame.contentDocument;
    return doc?.documentElement && doc.defaultView ? doc : null;
  } catch {
    return null;
  }
}
