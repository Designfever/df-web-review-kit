import { SmokeTargetCard, type SmokeTargetCardItem } from './smoke-target-card';

const smokeTargets: SmokeTargetCardItem[] = [
  {
    id: 'alpha',
    number: '01',
    title: 'Anchor target',
    body: 'DOM marker mode should capture this card with a stable data-qa-id selector.',
  },
  {
    id: 'beta',
    number: '02',
    title: 'Area target',
    body: 'Area mode should keep the relative selection across viewport presets.',
    accent: true,
  },
  {
    id: 'gamma',
    number: '03',
    title: 'Prompt target',
    body: 'Item prompt should include page, viewport, marker, anchor, and comment context.',
  },
];

export function SmokeGridSection() {
  return (
    <section className="dev-grid" aria-label="Smoke targets" data-section-id="smoke-targets">
      {smokeTargets.map((item) => (
        <SmokeTargetCard item={item} key={item.id} />
      ))}
    </section>
  );
}
