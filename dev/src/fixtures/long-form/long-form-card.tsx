export interface LongFormCardItem {
  index: number;
  title: string;
  body: string;
}

interface LongFormCardProps {
  card: LongFormCardItem;
}

export function LongFormCard({ card }: LongFormCardProps) {
  return (
    <article
      className="dev-long-card"
      data-qa-id={`long-card-${card.index}`}
      data-section-index={card.index}
    >
      <span>{String(card.index).padStart(2, '0')}</span>
      <div className="dev-long-card-copy" data-qa-id={`long-card-${card.index}-copy`}>
        <h2>{card.title}</h2>
        <p>{card.body}</p>
      </div>
    </article>
  );
}
