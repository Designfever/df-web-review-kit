import { pages } from './config';

interface DevNavProps {
  activePage: string;
  onNavigate: (href: string) => void;
  reviewPathPrefix: string;
}

export function DevNav({
  activePage,
  onNavigate,
  reviewPathPrefix,
}: DevNavProps) {
  const isReviewTarget = new URLSearchParams(window.location.search).has(
    '__dfwr_target'
  );

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
            onClick={(event) => {
              if (!isReviewTarget) return;
              event.preventDefault();
              onNavigate(page.href);
            }}
          >
            {page.href === '/' ? 'Home' : page.href.replace(/\//g, '')}
          </a>
        ))}
      </nav>
      {!isReviewTarget ? (
        <a className="dev-review-link" href={`${reviewPathPrefix}/?target=/&w=390&h=844`}>
          Open /review
        </a>
      ) : null}
    </header>
  );
}
