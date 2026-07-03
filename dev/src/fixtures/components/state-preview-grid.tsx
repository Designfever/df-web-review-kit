import { StatePreviewTile, type StatePreviewTileItem } from './state-preview-tile';

const stateTiles: StatePreviewTileItem[] = [
  {
    label: 'default',
    title: 'Idle control',
    body: 'Baseline spacing, radius, and text hierarchy.',
  },
  {
    label: 'hover',
    title: 'Hover surface',
    body: 'Checks color contrast on interactive surfaces.',
  },
  {
    label: 'disabled',
    title: 'Disabled state',
    body: 'Keeps muted UI readable without implying action.',
  },
];

export function StatePreviewGrid() {
  return (
    <div className="dev-state-grid" data-qa-id="state-preview-grid">
      {stateTiles.map((tile) => (
        <StatePreviewTile key={tile.label} tile={tile} />
      ))}
    </div>
  );
}
