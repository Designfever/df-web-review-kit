import { describe, expect, it } from 'vitest';
import type { ReviewItem } from '../../types';
import {
  DEFAULT_REVIEW_VIEWPORTS,
  findReviewViewportPreset,
  getNumberedReviewItems,
  getReviewItemScope,
  getReviewItemScopeLabel,
  getReviewViewportScope,
} from './scope';

// scope 판정에 필요한 필드만 채운 최소 아이템.
function createItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: 'item-1',
    projectId: 'test',
    routeKey: '/',
    pageUrl: 'http://localhost/',
    normalizedPath: '/',
    kind: 'area',
    comment: '',
    status: 'todo',
    viewport: { width: 390, height: 720 },
    createdAt: '2026-07-04T09:00:00.000Z',
    updatedAt: '2026-07-04T09:00:00.000Z',
    ...overrides,
  } as ReviewItem;
}

describe('findReviewViewportPreset', () => {
  it('returns the exact preset match first', () => {
    const preset = findReviewViewportPreset({ width: 768, height: 1024 });
    expect(preset.label).toBe('Tablet');
  });

  it('falls back to the closest preset by size distance', () => {
    // 리뷰어가 창 크기를 살짝 바꿔도 같은 프리셋으로 묶여야 한다.
    expect(findReviewViewportPreset({ width: 400, height: 700 }).label).toBe(
      'Mobile'
    );
    expect(findReviewViewportPreset({ width: 1500, height: 900 }).label).toBe(
      'Desktop'
    );
  });
});

describe('getReviewViewportScope', () => {
  it('maps viewport sizes to scopes via presets', () => {
    expect(getReviewViewportScope({ width: 390, height: 720 })).toBe('mobile');
    expect(getReviewViewportScope({ width: 1980, height: 1080 })).toBe('wide');
  });

  it('infers scope from custom preset labels and widths', () => {
    const presets = [
      { label: 'Phone S', width: 320, height: 568 },
      { label: 'Huge', width: 2560, height: 1440 },
    ];
    expect(getReviewViewportScope({ width: 320, height: 568 }, presets)).toBe(
      'mobile'
    );
    // 라벨에 힌트가 없으면 너비 기준(>=1800 → wide)으로 추론한다.
    expect(getReviewViewportScope({ width: 2560, height: 1440 }, presets)).toBe(
      'wide'
    );
  });
});

describe('getReviewItemScope / getReviewItemScopeLabel', () => {
  it('prefers the persisted scope over the viewport', () => {
    const item = createItem({ scope: 'tablet' });
    expect(getReviewItemScope(item)).toBe('tablet');
  });

  it('groups legacy dom/element scoped items by their captured viewport', () => {
    // 레거시 호환: 'dom'(구버전 'element') scope 는 뷰포트 scope 로 폴백한다.
    // 마커 표시 조건이 scope === currentScope 라서 'dom' 을 그대로 반환하면
    // 레거시 아이템 마커가 어느 뷰포트에서도 안 보이게 되기 때문 (scope.ts 주석 참고).
    const item = createItem({ scope: 'element' as ReviewItem['scope'] });
    expect(getReviewItemScope(item)).toBe('mobile');
    expect(getReviewItemScopeLabel(item)).toBe('Mobile');
  });

  it('falls back to the captured viewport when scope is missing', () => {
    const item = createItem({ viewport: { width: 1440, height: 900 } });
    expect(getReviewItemScope(item)).toBe('desktop');
    expect(getReviewItemScopeLabel(item)).toBe('Desktop');
  });
});

describe('getNumberedReviewItems', () => {
  it('labels numbered items with #N and drafts in creation order', () => {
    const items = [
      createItem({ id: 'b', reviewNumber: 7 }),
      createItem({ id: 'c', createdAt: '2026-07-04T09:02:00.000Z' }),
      createItem({ id: 'a', createdAt: '2026-07-04T09:01:00.000Z' }),
    ];

    const numbered = getNumberedReviewItems(items);
    const byId = new Map(numbered.map((entry) => [entry.item.id, entry]));

    expect(byId.get('b')?.displayLabel).toBe('#7');
    // draft 번호는 표시 순서가 아니라 생성 시각 순서로 안정적으로 부여된다.
    expect(byId.get('a')?.displayLabel).toBe('draft-1');
    expect(byId.get('c')?.displayLabel).toBe('draft-2');
  });

  it('ignores invalid persisted review numbers', () => {
    const items = [createItem({ id: 'x', reviewNumber: 0 })];
    expect(getNumberedReviewItems(items)[0].displayLabel).toBe('draft-1');
  });

  it('keeps default presets available for hosts', () => {
    expect(DEFAULT_REVIEW_VIEWPORTS.length).toBeGreaterThan(0);
  });
});
