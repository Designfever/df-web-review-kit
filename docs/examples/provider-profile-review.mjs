// Generic review-only example. Keep backend implementation in your own package.
export default {
  schemaVersion: 1,
  capabilities: {
    review: {
      module: '@example/review-provider',
      exportName: 'createReviewAdapter',
      options: {
        projectId: { env: 'VITE_EXAMPLE_PROJECT_ID' },
        token: { env: 'VITE_EXAMPLE_REVIEW_TOKEN' },
      },
    },
  },
  questions: [
    {
      key: 'reviewToken',
      message: 'Review access token',
      envKey: 'VITE_EXAMPLE_REVIEW_TOKEN',
      required: true,
    },
  ],
  env: [
    {
      key: 'VITE_EXAMPLE_PROJECT_ID',
      secret: false,
      required: true,
      example: 'my-project',
    },
    {
      key: 'VITE_EXAMPLE_REVIEW_TOKEN',
      secret: true,
      required: true,
    },
  ],
  dependencies: {
    '@example/review-provider': '^1.0.0',
  },
};
