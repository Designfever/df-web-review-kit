import { reviewShellBaseStyle } from './style/base';
import { reviewShellSitemapStyle } from './style/sitemap';
import { reviewShellModalStyle } from './style/modals';
import { reviewShellToolbarStyle } from './style/toolbar';
import { reviewShellCustomPanelStyle } from './custom-panels/style';
import { reviewShellQaPanelStyle } from './style/qa-panel';
import { reviewShellFigmaImagesStyle } from './style/figma-images';
import { reviewShellStageStyle } from './style/stage';
import { reviewShellSourceInspectorStyle } from './style/source-inspector';
import { reviewShellSectionOutlineStyle } from './style/section-outline';
import { reviewShellRulerStyle } from './style/ruler';
import { reviewShellDesignInspectorStyle } from './style/design-inspector';

const REVIEW_SHELL_STYLE_ID = 'df-review-shell-style';

export function ensureReviewShellStyle() {
  if (!document.getElementById(REVIEW_SHELL_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = REVIEW_SHELL_STYLE_ID;
    style.textContent = [
      reviewShellBaseStyle,
      reviewShellSitemapStyle,
      reviewShellModalStyle,
      reviewShellToolbarStyle,
      // These adjacent fragments shared one stylesheet; keep their exact boundary.
      reviewShellCustomPanelStyle + reviewShellQaPanelStyle,
      reviewShellFigmaImagesStyle,
      reviewShellStageStyle,
      reviewShellSourceInspectorStyle,
      reviewShellSectionOutlineStyle,
      reviewShellRulerStyle,
      reviewShellDesignInspectorStyle
    ].join('\n\n');
    document.head.append(style);
  }
}
