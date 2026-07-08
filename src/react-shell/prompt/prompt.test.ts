import { describe, expect, it } from 'vitest';
import type { NumberedReviewItem, ReviewItem } from '../../types';
import { buildReviewItemPrompt } from './prompt';

function createNumberedItem(
  overrides: Partial<ReviewItem> = {}
): NumberedReviewItem {
  return {
    item: {
      id: 'item-1',
      projectId: 'test',
      routeKey: '/about/',
      pageUrl: 'http://localhost:5173/about/',
      normalizedPath: '/about/',
      kind: 'dom',
      title: 'Hero title spacing',
      comment: 'The hero title wraps too early.',
      status: 'todo',
      viewport: { width: 390, height: 844 },
      createdAt: '2026-07-07T07:00:00.000Z',
      updatedAt: '2026-07-07T07:00:00.000Z',
      ...overrides,
    },
    scope: 'mobile',
    label: 'Mobile',
    number: 3,
    displayLabel: '#3',
  };
}

describe('buildReviewItemPrompt', () => {
  it('keeps the standard QA prompt first when no custom prompt is configured', () => {
    const prompt = buildReviewItemPrompt(createNumberedItem(), '/review');

    expect(prompt.startsWith('Fix this df-web-review-kit QA issue.')).toBe(
      true
    );
  });

  it('prepends the configured QA prompt before item details', () => {
    const prompt = buildReviewItemPrompt(
      createNumberedItem(),
      '/review',
      '\nCheck project coding rules first.\n'
    );

    expect(prompt).toMatch(/^Check project coding rules first\.\n\nFix this/);
  });
});
