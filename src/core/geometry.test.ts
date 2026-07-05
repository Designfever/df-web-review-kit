import { describe, expect, it } from 'vitest';
import {
  clamp,
  clampPoint,
  getPointSelection,
  getPopoverPosition,
  getSelectionCenter,
  isPointInViewport,
  isRelativeSelection,
  isSelectionInViewport,
  roundPoint,
  roundRatio,
  toHostPoint,
  toHostSelection,
  toPublicSelection,
  toTargetPoint,
  toViewportSelection,
  type ReviewEnvironment,
} from './geometry';

// 좌표 변환 검증용 최소 환경. viewportRect 오프셋만 있으면 되므로
// window/document 는 테스트에서 사용하지 않는 자리표시자로 채운다.
function createEnvironment(
  overrides: Partial<ReviewEnvironment> = {}
): ReviewEnvironment {
  return {
    window: { innerWidth: 400, innerHeight: 300 } as Window,
    document: {} as Document,
    viewportRect: { left: 100, top: 50, width: 400, height: 300 },
    overlayRect: { left: 0, top: 0, width: 600, height: 400 },
    ...overrides,
  };
}

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('falls back to min when max is smaller than min', () => {
    // 팝오버 배치처럼 가용 영역이 콘텐츠보다 작아지면 max < min 이 될 수 있다.
    expect(clamp(5, 10, 2)).toBe(10);
  });
});

describe('roundRatio / roundPoint', () => {
  it('rounds ratios to 4 decimal places', () => {
    expect(roundRatio(0.123456)).toBe(0.1235);
    expect(roundRatio(1 / 3)).toBe(0.3333);
  });

  it('rounds points to integer pixels', () => {
    expect(roundPoint({ x: 10.4, y: 10.6 })).toEqual({ x: 10, y: 11 });
  });
});

describe('selection shape conversions', () => {
  it('converts a point into a 1x1 selection', () => {
    expect(getPointSelection({ x: 3, y: 7 })).toEqual({
      left: 3,
      top: 7,
      width: 1,
      height: 1,
    });
  });

  it('round-trips public selection through the internal shape', () => {
    const publicSelection = { x: 1, y: 2, width: 30, height: 40 };
    expect(toPublicSelection(toViewportSelection(publicSelection))).toEqual(
      publicSelection
    );
  });

  it('rounds when converting back to the public shape', () => {
    expect(
      toPublicSelection({ left: 1.4, top: 2.6, width: 30.5, height: 39.4 })
    ).toEqual({ x: 1, y: 3, width: 31, height: 39 });
  });

  it('finds the center for both selection shapes', () => {
    expect(
      getSelectionCenter({ left: 10, top: 20, width: 100, height: 40 })
    ).toEqual({ x: 60, y: 40 });
    expect(
      getSelectionCenter({ x: 10, y: 20, width: 100, height: 40 })
    ).toEqual({ x: 60, y: 40 });
  });
});

describe('isRelativeSelection', () => {
  it('accepts persisted selection objects', () => {
    expect(
      isRelativeSelection({ x: 1, y: 2, width: 3, height: 4 })
    ).toBe(true);
  });

  it('rejects malformed persisted values', () => {
    // localStorage 등에서 읽은 값이라 어떤 형태든 들어올 수 있다.
    expect(isRelativeSelection(null)).toBe(false);
    expect(isRelativeSelection('selection')).toBe(false);
    expect(isRelativeSelection({ x: 1, y: 2, width: 3 })).toBe(false);
    expect(isRelativeSelection({ x: '1', y: 2, width: 3, height: 4 })).toBe(
      false
    );
  });
});

describe('viewport visibility', () => {
  const environment = createEnvironment();

  it('checks whether a point is inside the target viewport', () => {
    expect(isPointInViewport({ x: 0, y: 0 }, environment)).toBe(true);
    expect(isPointInViewport({ x: 400, y: 300 }, environment)).toBe(true);
    expect(isPointInViewport({ x: 401, y: 0 }, environment)).toBe(false);
    expect(isPointInViewport({ x: 0, y: -1 }, environment)).toBe(false);
  });

  it('checks selection overlap with the target viewport', () => {
    expect(
      isSelectionInViewport(
        { left: 390, top: 290, width: 50, height: 50 },
        environment
      )
    ).toBe(true);
    expect(
      isSelectionInViewport(
        { left: 400, top: 0, width: 50, height: 50 },
        environment
      )
    ).toBe(false);
  });

  it('clamps points to the target viewport', () => {
    expect(clampPoint({ x: -10, y: 500 }, environment)).toEqual({
      x: 0,
      y: 300,
    });
  });
});

describe('host/target coordinate conversions', () => {
  const environment = createEnvironment();

  it('round-trips points between host and target spaces', () => {
    const targetPoint = { x: 10, y: 20 };
    const hostPoint = toHostPoint(targetPoint, environment);

    expect(hostPoint).toEqual({ x: 110, y: 70 });
    expect(toTargetPoint(hostPoint, environment)).toEqual(targetPoint);
  });

  it('passes points through when no environment is provided', () => {
    // 쉘 없이 단독으로 마운트된 경우 target 좌표가 곧 host 좌표다.
    expect(toHostPoint({ x: 10, y: 20 })).toEqual({ x: 10, y: 20 });
    expect(toTargetPoint({ x: 10, y: 20 })).toEqual({ x: 10, y: 20 });
  });

  it('offsets selections into host space without resizing them', () => {
    expect(
      toHostSelection(
        { left: 10, top: 20, width: 30, height: 40 },
        environment
      )
    ).toEqual({ left: 110, top: 70, width: 30, height: 40 });
  });

  it('scales points and selections when the target is rendered smaller', () => {
    const scaledEnvironment = createEnvironment({
      viewportRect: { left: 100, top: 50, width: 200, height: 150 },
      scaleX: 0.5,
      scaleY: 0.5,
    });

    expect(toHostPoint({ x: 40, y: 80 }, scaledEnvironment)).toEqual({
      x: 120,
      y: 90,
    });
    expect(toTargetPoint({ x: 120, y: 90 }, scaledEnvironment)).toEqual({
      x: 40,
      y: 80,
    });
    expect(
      toHostSelection(
        { left: 10, top: 20, width: 30, height: 40 },
        scaledEnvironment
      )
    ).toEqual({ left: 105, top: 60, width: 15, height: 20 });
  });
});

describe('getPopoverPosition', () => {
  it('keeps the popover inside the overlay bounds', () => {
    const environment = createEnvironment();
    const position = getPopoverPosition({ x: 590, y: 390 }, environment, {
      width: 320,
      estimatedHeight: 178,
    });

    // overlay(600x400) 기준: left <= 600 - 320 - 12, top <= 400 - 178 - 12
    expect(position.left).toBeLessThanOrEqual(268);
    expect(position.top).toBeLessThanOrEqual(210);
    expect(position.left).toBeGreaterThanOrEqual(12);
    expect(position.top).toBeGreaterThanOrEqual(12);
  });

  it('offsets from the anchor point when space is available', () => {
    const environment = createEnvironment();
    expect(
      getPopoverPosition({ x: 100, y: 100 }, environment, { offset: 12 })
    ).toEqual({ left: 112, top: 112 });
  });
});
