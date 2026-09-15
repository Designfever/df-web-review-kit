import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { SourceComponentPopup } from './source.inspector.overlay';
import { SourceInspectorPopup } from './source.inspector.popup';

const componentEntry = {
  id: 'component',
  label: 'HeroSection',
  filePath: 'src/hero.section.tsx',
  source: { file: 'src/hero.section.tsx', line: '12' },
};

const renderPopup = (dataEntries: SourceComponentPopup['dataEntries']) => {
  const html = renderToStaticMarkup(
    <SourceInspectorPopup
      popup={{
        rect: { height: 100, left: 100, top: 100, width: 100 },
        dataEntries,
        entries: [componentEntry],
      }}
      onSelectData={vi.fn()}
      onSelectSource={vi.fn()}
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
        source: { file: 'src/hero.data.ts', line: '4' },
      },
      {
        id: 'data-parent',
        label: 'PageData',
        filePath: 'src/page.data.ts',
        source: { file: 'src/page.data.ts', line: '8' },
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

  it('routes data and component clicks to their source callbacks', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const onSelectData = vi.fn();
    const onSelectSource = vi.fn();
    const source = { file: 'src/hero.data.ts', line: '4' };

    await act(async () => {
      root.render(
        <SourceInspectorPopup
          popup={{
            rect: { height: 100, left: 100, top: 100, width: 100 },
            dataEntries: [
              {
                id: 'data',
                label: 'HeroData',
                filePath: 'src/hero.data.ts',
                source,
              },
            ],
            entries: [componentEntry],
          }}
          onSelectData={onSelectData}
          onSelectSource={onSelectSource}
        />
      );
    });

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('.is-data')
        ?.click();
    });

    expect(onSelectData).toHaveBeenCalledWith(source);
    expect(onSelectSource).not.toHaveBeenCalled();
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>(
          '.df-review-source-popup-entry:not(.is-data)'
        )
        ?.click();
    });
    expect(onSelectSource).toHaveBeenCalledWith(componentEntry.source);
    await act(async () => root.unmount());
  });
});
