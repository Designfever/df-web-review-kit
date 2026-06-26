import { reviewShellBaseStyle } from './style/base';
import { reviewShellSitemapStyle } from './style/sitemap';
import { reviewShellModalStyle } from './style/modals';
import { reviewShellToolbarStyle } from './style/toolbar';
import { reviewShellQaPanelStyle } from './style/qa-panel';
import { reviewShellFigmaImagesStyle } from './style/figma-images';
import { reviewShellStageStyle } from './style/stage';
import { reviewShellRulerStyle } from './style/ruler';

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
      reviewShellQaPanelStyle,
      reviewShellFigmaImagesStyle,
      reviewShellStageStyle,
      reviewShellRulerStyle
    ].join('\n\n');
    document.head.append(style);
  }
}
