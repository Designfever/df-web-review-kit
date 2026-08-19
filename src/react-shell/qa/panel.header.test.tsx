import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QaPanelHeader } from './panel.header';

describe('QaPanelHeader', () => {
  it('replaces the QA title with the selected df-sheet page', () => {
    const html = renderToStaticMarkup(
      <QaPanelHeader
        activeItemCount={0}
        activeRemainingItemCount={0}
        filteredItemCount={0}
        isAllQaVisible={false}
        isLoading={false}
        label="df-sheet"
        qaPageSelector={{
          options: [
            { label: 'Home', value: 'home' },
            { label: 'Story', value: 'story' },
          ],
          value: 'story',
          onChange: () => undefined,
        }}
        qaStatusFilters={['todo', 'doing', 'review', 'hold']}
        qaStatusFilterCounts={new Map()}
        showSourceSelect={false}
        source="df-sheet"
        sourceEntries={[]}
        statusOptions={[]}
        onChangeReviewSource={() => undefined}
        onEnableActiveQaStatusFilters={() => undefined}
        onQaStatusFilterToggle={() => undefined}
        onRefreshReviewData={async () => undefined}
      />
    );

    expect(html).not.toContain('df-sheet QA');
    expect(html).toContain('aria-label="df-sheet page"');
    expect(html).toContain('<option value="story" selected="">Story</option>');
  });
});
