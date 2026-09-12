import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSourceCandidates, openSourceInEditor } from './source.open';

// 같은 소스 라인에서 렌더된 반복 요소(#index/count) 판정과
// per-call 문서 스캔 캐시가 유지되는지 검증한다.

function renderRepeatedCards() {
  document.body.innerHTML = `
    <main data-wrk-source-file="src/App.tsx" data-wrk-source-line="3">
      <article data-wrk-source-file="src/Card.tsx" data-wrk-source-line="10">
        <p>first card</p>
      </article>
      <article data-wrk-source-file="src/Card.tsx" data-wrk-source-line="10">
        <p>second card</p>
      </article>
      <article data-wrk-source-file="src/Card.tsx" data-wrk-source-line="10">
        <p>third card</p>
      </article>
    </main>
  `;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('openSourceInEditor', () => {
  it('does not open a Vite root-relative source without sourceRoot', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    expect(openSourceInEditor({ file: '/src/App.tsx', line: '3' })).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });

  it('opens the same source after sourceRoot is configured', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    expect(
      openSourceInEditor(
        { file: '/src/App.tsx', line: '3' },
        { sourceRoot: '/Users/example/project' }
      )
    ).toBe(true);
    expect(open).toHaveBeenCalledWith(
      'vscode://file//Users/example/project/src/App.tsx:3',
      '_blank',
      'noreferrer'
    );
  });
});

describe('getSourceCandidates repeat info', () => {
  it('labels repeated same-source elements with their document-order index', () => {
    renderRepeatedCards();
    const second = document.querySelectorAll('article')[1];

    const candidates = getSourceCandidates(second);
    const cardCandidate = candidates.find(
      (candidate) => candidate.source.file === 'src/Card.tsx'
    );

    expect(cardCandidate).toBeDefined();
    // 반복 정보는 detail 에 #index/count 로 표기된다.
    expect(cardCandidate?.detail).toContain('#2/3');
  });

  it('scans the document once per kind, not once per candidate', () => {
    renderRepeatedCards();
    const target = document.querySelectorAll('article')[0].querySelector('p');
    const querySpy = vi.spyOn(document, 'querySelectorAll');

    const candidates = getSourceCandidates(target);
    expect(candidates.length).toBeGreaterThan(1);

    // 반복 인덱스용 문서 스캔은 kind 별 1회까지만 허용
    // ('source' 1회 + 'data' 는 data 힌트가 없으므로 key 부재로 스킵).
    const repeatScans = querySpy.mock.calls.filter(([selector]) =>
      String(selector).includes('data-wrk-source-file')
    );
    expect(repeatScans.length).toBeLessThanOrEqual(1);
  });

  it('returns no repeat marker for unique sources', () => {
    document.body.innerHTML = `
      <section data-wrk-source-file="src/Only.tsx" data-wrk-source-line="5">
        <p>only</p>
      </section>
    `;

    const candidates = getSourceCandidates(document.querySelector('p'));
    const only = candidates.find(
      (candidate) => candidate.source.file === 'src/Only.tsx'
    );
    expect(only).toBeDefined();
    expect(only?.detail).not.toContain('#');
  });
});
