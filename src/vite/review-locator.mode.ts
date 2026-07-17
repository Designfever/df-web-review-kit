export const isReviewLocatorEnabled = (
  command: 'serve' | 'build',
  enabled = false
) => command === 'serve' || enabled;
