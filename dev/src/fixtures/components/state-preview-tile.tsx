export interface StatePreviewTileItem {
  label: string;
  title: string;
  body: string;
}

interface StatePreviewTileProps {
  tile: StatePreviewTileItem;
}

export function StatePreviewTile({ tile }: StatePreviewTileProps) {
  return (
    <article className="dev-state-tile" data-qa-id={`state-tile-${tile.label}`}>
      <span>{tile.label}</span>
      <h2>{tile.title}</h2>
      <p>{tile.body}</p>
    </article>
  );
}
