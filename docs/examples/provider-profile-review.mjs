// Generic review-only example. Keep backend implementation in your own package.
export default {
  schemaVersion: 1,
  capabilities: {
    review: {
      module: '@example/review-provider',
      exportName: 'createReviewAdapter',
      options: {
        projectId: { env: 'VITE_EXAMPLE_PROJECT_ID' },
        endpoint: { env: 'VITE_EXAMPLE_REVIEW_URL' },
      },
    },
  },
  env: [
    {
      key: 'VITE_EXAMPLE_PROJECT_ID',
      secret: false,
      required: true,
      example: 'my-project',
    },
    {
      key: 'VITE_EXAMPLE_REVIEW_URL',
      secret: false,
      required: true,
      example: '/api/review',
    },
  ],
  dependencies: {
    '@example/review-provider': '^1.0.0',
  },
};
