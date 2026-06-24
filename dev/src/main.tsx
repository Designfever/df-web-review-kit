import React from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  localAdapter,
  supabaseAdapter,
  type SupabaseReviewClient,
} from '../../src';
import {
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
  createSupabasePresenceAdapter,
  mountReviewShell,
  type ReviewShellAdapter,
  type ReviewShellPage,
  type ReviewShellViewportPreset,
  type SupabasePresenceClient,
} from '../../src/react-shell';
import './style.css';

declare global {
  interface Window {
    __figma?: {
      desktopNodeId: string;
      mobileNodeId: string;
    };
  }
}

const REVIEW_PROJECT_ID =
  import.meta.env.VITE_REVIEW_PROJECT_ID || 'df-web-review-kit';
const REVIEW_PATH_PREFIX = '/review';
const REVIEW_STORAGE_KEY = `${REVIEW_PROJECT_ID}:items`;
const REVIEW_SUPABASE_TABLE =
  import.meta.env.VITE_REVIEW_SUPABASE_TABLE || 'review_items';

window.__figma = {
  desktopNodeId: 'p2DY6W7xu5WmDNtJK8v6zd->4:228',
  mobileNodeId: 'p2DY6W7xu5WmDNtJK8v6zd->4:491',
};

const pages: ReviewShellPage[] = [
  { href: '/' },
  { href: '/components/' },
  { href: '/long-form/' },
];

const presets: ReviewShellViewportPreset[] = [
  { label: 'MO 390', kind: 'mobile', width: 390, height: 844, designWidth: 585 },
  { label: 'MO 620', kind: 'mobile', width: 620, height: 900, designWidth: 620 },
  { label: 'TA 768', kind: 'tablet', width: 768, height: 1024, designWidth: 768 },
  { label: 'PC 1440', kind: 'desktop', width: 1440, height: 900, designWidth: 1440 },
];

const local = localAdapter({ storageKey: REVIEW_STORAGE_KEY });
const supabaseUrl = import.meta.env.VITE_REVIEW_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY;
const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
const remote = supabaseClient
  ? supabaseAdapter({
      client: supabaseClient as unknown as SupabaseReviewClient,
      table: REVIEW_SUPABASE_TABLE,
      projectId: REVIEW_PROJECT_ID,
      source: 'supabase',
      reviewPathPrefix: REVIEW_PATH_PREFIX,
    })
  : null;

const adapters: ReviewShellAdapter[] = [
  {
    label: 'local',
    get: (id) => local.get(id),
    list: (query) => local.list(query),
    create: (item) => local.create(item),
    update: (id, patch) => local.update(id, patch),
    statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
    updateStatus: ({ id, status }) => local.update(id, { status }),
    syncSubmission: ({ id, patch }) => local.update(id, patch),
    remove: (id) => local.remove(id),
  },
  ...(remote
    ? [
        {
          label: 'supabase',
          get: (id) => remote.get(id),
          list: (query) => remote.list(query),
          create: (item) => remote.create(item),
          update: (id, patch) => remote.update(id, patch),
          canWrite: true,
          statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
          updateStatus: ({ id, status }) => remote.update(id, { status }),
          remove: (id) => remote.remove(id),
        } satisfies ReviewShellAdapter,
      ]
    : []),
];

const localPresence = createLocalPresenceAdapter({
  channelName: `${REVIEW_PROJECT_ID}:presence`,
});
const presence = supabaseClient
  ? createFallbackPresenceAdapter(
      createSupabasePresenceAdapter({
        client: supabaseClient as unknown as SupabasePresenceClient,
        channelPrefix: 'review-presence',
        private: import.meta.env.VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE === 'true',
      }),
      localPresence
    )
  : localPresence;

const initialPrompt = [
  'You are reviewing the df-web-review-kit local dev fixture.',
  'Use the selected item route, viewport, marker, anchor, and comment to verify review shell behavior before adding package features.',
].join('\n');

function mountDevReviewShell() {
  mountReviewShell({
    projectId: REVIEW_PROJECT_ID,
    pages,
    adapters,
    presets,
    presence,
    initialPrompt,
    reviewPathPrefix: REVIEW_PATH_PREFIX,
    ruler: { enabled: true, unit: 'px' },
  });
}

function normalizePath(pathname: string) {
  if (pathname === '') return '/';
  if (pathname !== '/' && !pathname.endsWith('/')) return `${pathname}/`;
  return pathname;
}

function getActivePage(pathname: string) {
  const normalized = normalizePath(pathname);
  return pages.some((page) => page.href === normalized) ? normalized : '/404/';
}

function TargetApp() {
  const activePage = getActivePage(window.location.pathname);

  return (
    <main className="dev-page" data-page={activePage}>
      <DevNav activePage={activePage} />
      {activePage === '/' ? <HomeFixture /> : null}
      {activePage === '/components/' ? <ComponentsFixture /> : null}
      {activePage === '/long-form/' ? <LongFormFixture /> : null}
      {activePage === '/404/' ? <NotFoundFixture /> : null}
    </main>
  );
}

function DevNav({ activePage }: { activePage: string }) {
  const isReviewTarget = new URLSearchParams(window.location.search).has('__dfwr_target');

  return (
    <header className="dev-nav" data-qa-id="dev-nav">
      <a className="dev-brand" href="/">
        df-web-review-kit dev
      </a>
      <nav aria-label="Fixture pages">
        {pages.map((page) => (
          <a
            key={page.href}
            aria-current={activePage === page.href ? 'page' : undefined}
            href={page.href}
          >
            {page.href === '/' ? 'Home' : page.href.replace(/\//g, '')}
          </a>
        ))}
      </nav>
      {!isReviewTarget ? (
        <a className="dev-review-link" href="/review/?target=/&w=390&h=844">
          Open /review
        </a>
      ) : null}
    </header>
  );
}

function HomeFixture() {
  return (
    <>
      <section className="dev-hero" data-qa-id="home-hero">
        <p className="dev-eyebrow">Local fixture</p>
        <h1>Review shell smoke target</h1>
        <p>
          Use this page to create note, area, and DOM marker review items without a host project.
        </p>
        <div className="dev-actions" data-qa-id="home-actions">
          <a href="/components/">Inspect components</a>
          <a href="/long-form/">Test scroll restore</a>
        </div>
      </section>
      <section className="dev-grid" aria-label="Smoke targets">
        <article className="dev-card" data-qa-id="smoke-card-alpha">
          <span data-font="12<24 - Label/XXS/Medium<Label/XS/Medium">
            01
          </span>
          <h2 data-font="34<10 - Heading/H5<Heading/H2">Anchor target</h2>
          <p data-font="40<20 - Body/S/Regular<Body/M/Regular">
            DOM marker mode should capture this card with a stable data-qa-id selector.
          </p>
        </article>
        <article className="dev-card dev-card-accent" data-qa-id="smoke-card-beta">
          <span data-font="12<24 - Label/XXS/Medium<Label/XS/Medium">
            02
          </span>
          <h2 data-font="34<10 - Heading/H5<Heading/H2">Area target</h2>
          <p data-font="40<20 - Body/S/Regular<Body/M/Regular">
            Area mode should keep the relative selection across viewport presets.
          </p>
        </article>
        <article className="dev-card" data-qa-id="smoke-card-gamma">
          <span data-font="12<24 - Label/XXS/Medium<Label/XS/Medium">
            03
          </span>
          <h2 data-font="34<10 - Heading/H5<Heading/H2">Prompt target</h2>
          <p data-font="40<20 - Body/S/Regular<Body/M/Regular">
            Item prompt should include page, viewport, marker, anchor, and comment context.
          </p>
        </article>
      </section>
    </>
  );
}

function ComponentsFixture() {
  return (
    <section className="dev-section" data-qa-id="components-section">
      <p className="dev-eyebrow">Components</p>
      <h1>Controls and layout states</h1>
      <div className="dev-component-row">
        <button data-qa-id="primary-button" type="button">Primary button</button>
        <button data-qa-id="secondary-button" type="button">Secondary button</button>
        <label data-qa-id="input-label">
          Input label
          <input placeholder="Focusable field" />
        </label>
      </div>
      <div className="dev-panel" data-qa-id="metrics-panel">
        <strong>Measured panel</strong>
        <p>Use ruler/grid overlays to check spacing against this panel.</p>
      </div>
    </section>
  );
}

function LongFormFixture() {
  return (
    <section className="dev-section dev-long" data-qa-id="long-form-section">
      <p className="dev-eyebrow">Scroll restore</p>
      <h1>Long page fixture</h1>
      {Array.from({ length: 8 }).map((_, index) => (
        <article
          className="dev-long-card"
          data-qa-id={`long-card-${index + 1}`}
          key={index}
        >
          <span>{String(index + 1).padStart(2, '0')}</span>
          <h2>Scrollable review target {index + 1}</h2>
          <p>
            Create a DOM marker on this block, open the copied deep link, and confirm that the
            iframe scrolls back to the selected element.
          </p>
        </article>
      ))}
    </section>
  );
}

function NotFoundFixture() {
  return (
    <section className="dev-section" data-qa-id="not-found-section">
      <p className="dev-eyebrow">Missing fixture</p>
      <h1>Fixture not found</h1>
      <p>Pick one of the registered fixture pages from the nav.</p>
    </section>
  );
}

if (window.location.pathname.startsWith(REVIEW_PATH_PREFIX)) {
  mountDevReviewShell();
} else {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <TargetApp />
    </React.StrictMode>
  );
}
