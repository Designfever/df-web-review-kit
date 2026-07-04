import { LongFormCard, type LongFormCardItem } from './long-form-card';

const longFormCards: LongFormCardItem[] = Array.from({ length: 8 }).map(
  (_, index) => ({
    index: index + 1,
    title: `Scrollable review target ${index + 1}`,
    body: 'Create a DOM marker on this block, open the copied deep link, and confirm that the iframe scrolls back to the selected element.',
  })
);

export function LongFormFixture() {
  return (
    <section
      className="dev-section dev-long"
      data-qa-id="long-form-section"
      data-section-id="long-form"
    >
      <div className="dev-section-heading" data-qa-id="long-form-heading">
        <p className="dev-eyebrow">Scroll restore</p>
        <h1>Long page fixture</h1>
      </div>
      <div className="dev-long-list" data-qa-id="long-form-list">
        {longFormCards.map((card) => (
          <LongFormCard card={card} key={card.index} />
        ))}
      </div>
    </section>
  );
}
