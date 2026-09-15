import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NormalizedReviewShellAdapter } from '../adapters';
import { ImprovementsPanel } from './panel';

describe('ImprovementsPanel', () => {
  let container: HTMLDivElement;
  let root: Root;
  const createImprovement = vi.fn();

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT = true;
    window.history.replaceState(
      null,
      '',
      '/review?target=%2Fstory&w=390&h=844'
    );
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    createImprovement.mockResolvedValue({
      id: 'improvement-1',
      title: '검색 개선',
      status: 'pending',
      url: 'https://df-sheet.test/improvements',
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('adds the current review URL and shows a successful DF Sheet result', async () => {
    const adapter = {
      createImprovement,
    } as unknown as NormalizedReviewShellAdapter;
    await act(async () => {
      root.render(
        <ImprovementsPanel
          adapter={adapter}
          isVisible
          projectId="project-1"
          reviewRoute="/story"
          onClose={() => undefined}
        />
      );
    });

    const title = container.querySelector<HTMLInputElement>(
      'input[placeholder="제목을 입력하세요"]'
    );
    const content = container.querySelector<HTMLTextAreaElement>(
      'textarea[placeholder="내용을 입력하세요"]'
    );
    const setInputValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )?.set;
    const setTextareaValue = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    await act(async () => {
      setInputValue?.call(title, '검색 개선');
      title?.dispatchEvent(new Event('input', { bubbles: true }));
      setTextareaValue?.call(content, '검색 결과를 빠르게 확인하고 싶습니다.');
      content?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      container.querySelector<HTMLFormElement>('form')?.requestSubmit();
    });

    expect(createImprovement).toHaveBeenCalledWith({
      title: '검색 개선',
      content:
        '검색 결과를 빠르게 확인하고 싶습니다.\n\n' +
        'Review Kit 화면: http://localhost/review?target=%2Fstory&w=390&h=844',
      category: 'other',
      area: 'all',
      attachmentUrls: [],
    });
    expect(container.textContent).toContain('개선사항이 등록되었습니다.');
    expect(
      container.querySelector<HTMLAnchorElement>(
        'a[href="https://df-sheet.test/improvements"]'
      )
    ).not.toBeNull();
  });
});
