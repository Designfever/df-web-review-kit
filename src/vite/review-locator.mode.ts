type ReviewLocatorEnv = Record<string, string | undefined>;

export const isReviewLocatorEnabled = (
  command: 'serve' | 'build',
  env: ReviewLocatorEnv = {}
) => command === 'serve' || Boolean(env.VITE_REVIEW_SOURCE_ROOT?.trim());
