import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { SitemapModal } from './modal';
import { createEmptySitemapQaCount } from './tree';

const qaCount = createEmptySitemapQaCount();
const props = {
  activeRoute: '/',
  allQaCount: qaCount,
  getPageTarget: (href: string) => href,
  isAllQaVisible: false,
  pagePresenceUsers: new Map(),
  pageQaCounts: new Map(),
  pages: [{ href: '/' }, { href: '/alpha/' }],
  onClose: vi.fn(),
  onSelectAllQa: vi.fn(),
  onSelectPage: vi.fn(),
};

describe('SitemapModal visibility', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('keeps filter state while closed and reopened', async () => {
    const renderModal = async (isOpen: boolean) => {
      await act(async () => {
        root.render(<SitemapModal {...props} isOpen={isOpen} />);
      });
    };

    await renderModal(true);
    const search = container.querySelector<HTMLInputElement>(
      '[aria-label="Search sitemap"]'
    );
    const todoFilter = container.querySelector<HTMLButtonElement>(
      '[title="Show pages with Todo QA"]'
    );
    expect(search).not.toBeNull();
    expect(todoFilter).not.toBeNull();

    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )?.set;
      setValue?.call(search, 'alpha');
      search?.dispatchEvent(new Event('input', { bubbles: true }));
      todoFilter?.click();
    });

    await renderModal(false);
    expect(
      container.querySelector('.df-review-sitemap-modal.is-hidden')
    ).not.toBeNull();
    await renderModal(true);

    expect(
      container.querySelector<HTMLInputElement>('[aria-label="Search sitemap"]')
        ?.value
    ).toBe('alpha');
    expect(
      container
        .querySelector('[title="Show pages with Todo QA"]')
        ?.getAttribute('aria-pressed')
    ).toBe('true');
  });
});
