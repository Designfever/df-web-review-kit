import { useCallback, useState } from 'react';
import { ComponentsFixture } from './components/components.fixture';
import { HomeFixture } from './home/home.fixture';
import { LongFormFixture } from './long-form/long-form.fixture';
import { DevNav } from './nav';
import { NotFoundFixture } from './not-found.fixture';
import { getActivePage } from './page-routing';

interface TargetAppProps {
  reviewPathPrefix: string;
}

export function TargetApp({ reviewPathPrefix }: TargetAppProps) {
  const [activePage, setActivePage] = useState(() =>
    getActivePage(window.location.pathname)
  );
  const navigatePage = useCallback((href: string) => {
    window.history.pushState({}, '', href);
    setActivePage(getActivePage(href));
  }, []);

  return (
    <main className="dev-page" data-page={activePage}>
      <DevNav
        activePage={activePage}
        reviewPathPrefix={reviewPathPrefix}
        onNavigate={navigatePage}
      />
      <div className="dev-page-body" data-qa-id="fixture-page-body">
        {activePage === '/' ? <HomeFixture /> : null}
        {activePage === '/components/' ? <ComponentsFixture /> : null}
        {activePage === '/long-form/' ? <LongFormFixture /> : null}
        {activePage === '/404/' ? <NotFoundFixture /> : null}
      </div>
    </main>
  );
}
