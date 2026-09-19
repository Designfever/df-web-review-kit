import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ReviewSideRail } from './side.rail';

describe('ReviewSideRail', () => {
  it('renders logout at the top of the bottom action group', () => {
    const html = renderToStaticMarkup(
      <ReviewSideRail
        currentPagePresenceUsers={[]}
        isFigmaImageManagementEnabled={false}
        isFigmaImagesPanelVisible={false}
        isQaPanelVisible={true}
        isImprovementEnabled={false}
        isImprovementsPanelVisible={false}
        isDesignInspectorVisible={false}
        isSourceTreePanelVisible={false}
        presenceSessionId="session"
        onLogout={() => undefined}
        onOpenAbout={() => undefined}
        onToggleFigmaImagesPanel={() => undefined}
        onToggleQaPanel={() => undefined}
        onToggleImprovementsPanel={() => undefined}
        onToggleDesignInspector={() => undefined}
        onToggleSourceTreePanel={() => undefined}
      />
    );

    const logoutIndex = html.indexOf('aria-label="Log out"');
    const aboutIndex = html.indexOf('aria-label="Open about"');

    expect(logoutIndex).toBeGreaterThan(-1);
    expect(aboutIndex).toBeGreaterThan(logoutIndex);
    expect(html).not.toContain('aria-label="Open initial prompt"');
    expect(html).not.toContain('aria-label="Open settings"');
    expect(html).toContain('aria-label="Show design inspector"');
    expect(html).toContain('aria-controls="df-review-design-inspector"');
  });
});
