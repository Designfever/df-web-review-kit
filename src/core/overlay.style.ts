import { overlayBaseStyle, overlayListStyle, overlayResponsiveStyle } from './style/overlay.base';
import { overlayMarkersStyle, overlayMarkerAnimationsStyle } from './style/overlay.markers';
import { overlayDraftStyle, overlaySelectionStyle } from './style/overlay.draft';

/** Creates the shadow-root stylesheet for the standalone core overlay. */
export function createStyleElement() {
  const style = document.createElement('style');
  // Keep the original cascade, including interleaved list/selection/keyframe rules.
  style.textContent = [
    overlayBaseStyle,
    overlayMarkersStyle,
    overlayDraftStyle,
    overlayListStyle,
    overlaySelectionStyle,
    overlayMarkerAnimationsStyle,
    overlayResponsiveStyle,
  ].join('');
  return style;
}
