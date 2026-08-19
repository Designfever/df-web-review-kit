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
        isSourceTreePanelVisible={false}
        presenceSessionId="session"
        onLogout={() => undefined}
        onOpenAbout={() => undefined}
        onOpenInitialPrompt={() => undefined}
        onOpenSettings={() => undefined}
        onToggleFigmaImagesPanel={() => undefined}
        onToggleQaPanel={() => undefined}
        onToggleSourceTreePanel={() => undefined}
      />
    );

    const logoutIndex = html.indexOf('aria-label="Log out"');
    const promptIndex = html.indexOf('aria-label="Open initial prompt"');

    expect(logoutIndex).toBeGreaterThan(-1);
    expect(logoutIndex).toBeLessThan(promptIndex);
  });
});
