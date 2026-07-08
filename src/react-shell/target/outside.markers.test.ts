import { describe, expect, it } from 'vitest';
import { arrangeOutsideMarkerLayout } from './outside.markers';

describe('arrangeOutsideMarkerLayout', () => {
  it('keeps close markers separated while preserving input order', () => {
    const markers = arrangeOutsideMarkerLayout(
      [
        { id: 'first', anchorTop: 100 },
        { id: 'second', anchorTop: 104 },
        { id: 'third', anchorTop: 108 },
      ],
      720
    );

    expect(markers.map((marker) => marker.id)).toEqual([
      'first',
      'second',
      'third',
    ]);
    expect(markers[1].top - markers[0].top).toBeGreaterThanOrEqual(28);
    expect(markers[2].top - markers[1].top).toBeGreaterThanOrEqual(28);
  });

  it('pushes bottom-colliding markers upward and keeps connectors on anchors', () => {
    const markers = arrangeOutsideMarkerLayout(
      [
        { id: 'near-bottom-1', anchorTop: 690 },
        { id: 'near-bottom-2', anchorTop: 695 },
      ],
      720
    );

    expect(markers[1].top).toBe(698);
    expect(markers[1].top - markers[0].top).toBeGreaterThanOrEqual(28);
    expect(markers[0].top + markers[0].connectorTop).toBe(700);
    expect(markers[1].top + markers[1].connectorTop).toBe(705);
  });
});
