import type {
  ReviewShellPage,
  ReviewShellViewportPreset,
} from '../../../src/react-shell';

export const REVIEW_PATH_PREFIX = '/review';

export const pages: ReviewShellPage[] = [
  { href: '/' },
  { href: '/components/' },
  { href: '/long-form/' },
];

export const presets: ReviewShellViewportPreset[] = [
  { label: 'MO 390', kind: 'mobile', width: 390, height: 844, designWidth: 585 },
  { label: 'MO 620', kind: 'mobile', width: 620, height: 900, designWidth: 620 },
  { label: 'TA 768', kind: 'tablet', width: 768, height: 1024, designWidth: 768 },
  { label: 'PC 1440', kind: 'desktop', width: 1440, height: 900, designWidth: 1440 },
];
