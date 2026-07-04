import { HomeActionList } from './home-action-list';

export function HomeHeroSection() {
  return (
    <section className="dev-hero" data-qa-id="home-hero" data-section-id="home-hero">
      <div className="dev-hero-copy" data-qa-id="home-hero-copy">
        <p className="dev-eyebrow">Local fixture</p>
        <h1>Review shell smoke target</h1>
        <p>
          Use this page to create area and DOM marker review items without a host project.
        </p>
      </div>
      <HomeActionList />
    </section>
  );
}
