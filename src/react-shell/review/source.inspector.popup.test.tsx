import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { SourceComponentPopup } from './source.inspector.overlay';
import { SourceInspectorPopup } from './source.inspector.popup';

const element = document.createElement('section');
const componentEntry = {
  id: 'component',
  label: 'HeroSection',
  filePath: 'src/hero.section.tsx',
  element,
};

const renderPopup = (dataEntries: SourceComponentPopup['dataEntries']) => {
  const html = renderToStaticMarkup(
    <SourceInspectorPopup
      popup={{
        rect: { height: 100, left: 100, top: 100, width: 100 },
        dataEntries,
        entries: [componentEntry],
      }}
      onSelectEntry={vi.fn()}
    />
  );
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
};

describe('SourceInspectorPopup', () => {
  it('renders data candidates before components with a divider', () => {
    const root = renderPopup([
      {
        id: 'data-child',
        label: 'HeroData',
        filePath: 'src/hero.data.ts',
        element,
      },
      {
        id: 'data-parent',
        label: 'PageData',
        filePath: 'src/page.data.ts',
        element,
      },
    ]);
    const items = root.querySelectorAll('.df-review-source-popup-list > li');

    expect(items).toHaveLength(4);
    expect(items[0]?.querySelector('.is-data')).not.toBeNull();
    expect(items[0]?.textContent).toContain('HeroData');
    expect(items[1]?.textContent).toContain('PageData');
    expect(items[2]?.classList.contains('df-review-source-popup-divider')).toBe(
      true
    );
    expect(items[3]?.textContent).toContain('HeroSection');
  });

  it('omits the divider when there are no data candidates', () => {
    const root = renderPopup([]);

    expect(root.querySelector('.df-review-source-popup-divider')).toBeNull();
    expect(
      root.querySelector('.df-review-source-popup-list')?.textContent
    ).toContain('HeroSection');
  });
});
