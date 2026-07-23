import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { SectionOutlineEntry } from '../section.outline';
import { SectionOutlinePanel } from './section.outline.panel';

const entry: SectionOutlineEntry = {
  id: 'hero',
  label: 'HeroSection',
  filePath: 'src/hero.tsx',
  depth: 1,
  element: document.createElement('section'),
  source: { file: 'src/hero.tsx', line: '10' },
  data: { file: 'src/hero.data.ts', line: '4' },
  metadata: {
    usage: {
      source: { file: 'src/page.tsx', line: '20' },
      label: 'Page',
      filePath: 'src/page.tsx',
      positionLabel: '20:1',
    },
  },
  children: [],
};

const renderPanel = (canOpenSourceFiles: boolean) => {
  const noop = vi.fn();
  const html = renderToStaticMarkup(
    <SectionOutlinePanel
      isPanelVisible
      isFiltering={false}
      filteredCount={1}
      totalCount={1}
      rootCount={1}
      filter=""
      entries={[entry]}
      collapsedIds={new Set()}
      selectedEntryId={null}
      activeDomAdjustmentEntryId={null}
      domAdjustmentByEntryId={{}}
      canOpenSourceFiles={canOpenSourceFiles}
      canWriteDom
      isFontMetaVisible={false}
      isMediaMetaVisible={false}
      isClassMetaVisible={false}
      onToggleMeta={noop}
      onFilterChange={noop}
      onToggleEntry={noop}
      onSelectEntry={noop}
      onClearSelection={noop}
      onClearDomAdjustment={noop}
      onStartDomAdjustment={noop}
      onOpenData={noop}
      onOpenSource={noop}
      onOpenUsageSource={noop}
      onStartDomReview={noop}
      onHoverElement={noop}
      onClearHover={noop}
    />
  );
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
};

describe('SectionOutlinePanel source links', () => {
  it('renders source paths without code links in build mode', () => {
    const root = renderPanel(false);

    expect(root.querySelector('.is-source code')?.textContent).toBe(
      'src/hero.tsx'
    );
    expect(root.querySelector('.is-source button')).toBeNull();
    expect(root.querySelector('.is-usage code')?.textContent).toBe(
      'src/page.tsx:20:1'
    );
    expect(root.querySelector('.is-usage button')).toBeNull();
    expect(
      root.querySelectorAll(
        '[title="Open data"], [title="Open source"], [title="Open parent usage"]'
      )
    ).toHaveLength(0);
  });

  it('keeps source links enabled on the dev server', () => {
    const root = renderPanel(true);

    expect(root.querySelector('.is-source button')).not.toBeNull();
    expect(root.querySelector('.is-usage button')).not.toBeNull();
    expect(
      Array.from(
        root.querySelectorAll<HTMLButtonElement>(
          '[title="Open data"], [title="Open source"], [title="Open parent usage"]'
        )
      ).every((button) => !button.disabled)
    ).toBe(true);
  });
});
