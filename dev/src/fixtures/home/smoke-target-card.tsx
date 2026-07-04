export interface SmokeTargetCardItem {
  id: string;
  number: string;
  title: string;
  body: string;
  accent?: boolean;
}

interface SmokeTargetCardProps {
  item: SmokeTargetCardItem;
}

export function SmokeTargetCard({ item }: SmokeTargetCardProps) {
  return (
    <article
      className={`dev-card${item.accent ? ' dev-card-accent' : ''}`}
      data-qa-id={`smoke-card-${item.id}`}
    >
      <span data-font="12<24 - Label/XXS/Medium<Label/XS/Medium">
        {item.number}
      </span>
      <div className="dev-card-copy" data-qa-id={`smoke-card-${item.id}-copy`}>
        <h2 data-font="34<10 - Heading/H5<Heading/H2">{item.title}</h2>
        <p data-font="40<20 - Body/S/Regular<Body/M/Regular">{item.body}</p>
      </div>
    </article>
  );
}
