import { describe, expect, it } from 'vitest';
import {
  createReviewFigmaFrameUrl,
  createReviewFigmaNodeValue,
  parseReviewFigmaNodeRef,
  requireReviewFigmaNodeRef,
} from './parse';

describe('parseReviewFigmaNodeRef', () => {
  it('parses design/file/proto/board share URLs', () => {
    for (const kind of ['design', 'file', 'proto', 'board']) {
      const url = `https://www.figma.com/${kind}/AbCdEf123/My-File?node-id=12-34`;
      expect(parseReviewFigmaNodeRef(url)).toEqual({
        fileKey: 'AbCdEf123',
        nodeId: '12:34',
        sourceUrl: url,
      });
    }
  });

  it('normalizes dashed node ids to the colon form', () => {
    // 공유 URL 은 12-34, API 는 12:34 표기를 쓴다. 저장은 콜론으로 통일.
    const ref = parseReviewFigmaNodeRef(
      'https://www.figma.com/design/KEY/name?node-id=12-34'
    );
    expect(ref?.nodeId).toBe('12:34');

    const colonRef = parseReviewFigmaNodeRef(
      'https://www.figma.com/design/KEY/name?node-id=12%3A34'
    );
    expect(colonRef?.nodeId).toBe('12:34');
  });

  it('rejects non-figma hosts to avoid fetching arbitrary URLs', () => {
    expect(
      parseReviewFigmaNodeRef('https://evil.com/design/KEY?node-id=1-2')
    ).toBeNull();
    // 서브도메인 위장(figma.com.evil.com)도 걸러져야 한다.
    expect(
      parseReviewFigmaNodeRef(
        'https://www.figma.com.evil.com/design/KEY?node-id=1-2'
      )
    ).toBeNull();
  });

  it('rejects URLs without a node id or file key', () => {
    expect(
      parseReviewFigmaNodeRef('https://www.figma.com/design/KEY/name')
    ).toBeNull();
    expect(
      parseReviewFigmaNodeRef('https://www.figma.com/files?node-id=1-2')
    ).toBeNull();
  });

  it('parses the fileKey->nodeId shorthand', () => {
    expect(parseReviewFigmaNodeRef('KEY->12:34')).toEqual({
      fileKey: 'KEY',
      nodeId: '12:34',
    });
    // 구분자가 두 번 나오면 모호하므로 거부한다.
    expect(parseReviewFigmaNodeRef('KEY->12:34->extra')).toBeNull();
  });

  it('normalizes already-parsed ref objects', () => {
    expect(
      parseReviewFigmaNodeRef({ fileKey: ' KEY ', nodeId: '12-34' })
    ).toEqual({ fileKey: 'KEY', nodeId: '12:34' });
    expect(parseReviewFigmaNodeRef({ fileKey: '', nodeId: '1:2' })).toBeNull();
  });
});

describe('requireReviewFigmaNodeRef', () => {
  it('throws for unusable input', () => {
    expect(() => requireReviewFigmaNodeRef('not a url')).toThrow(
      /Figma node link/
    );
  });
});

describe('createReviewFigmaNodeValue / createReviewFigmaFrameUrl', () => {
  it('round-trips through the shorthand value', () => {
    const ref = { fileKey: 'KEY', nodeId: '12:34' };
    expect(parseReviewFigmaNodeRef(createReviewFigmaNodeValue(ref))).toEqual(
      ref
    );
  });

  it('builds a design URL with a dashed node id', () => {
    expect(createReviewFigmaFrameUrl('KEY->12:34')).toBe(
      'https://www.figma.com/design/KEY?node-id=12-34'
    );
    expect(createReviewFigmaFrameUrl('nope')).toBeNull();
  });
});
