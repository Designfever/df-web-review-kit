// Generic review + Figma example. The two capabilities remain independently wired.
export default {
  schemaVersion: 1,
  capabilities: {
    review: {
      mode: 'bootstrap',
      module: '@example/full-provider',
      exportName: 'createReviewBootstrap',
      options: {
        endpoint: { env: 'VITE_EXAMPLE_REVIEW_URL' },
      },
    },
    figma: {
      module: '@example/full-provider',
      exportName: 'createFigmaImageStore',
      options: {
        endpoint: { env: 'VITE_EXAMPLE_IMAGE_URL' },
      },
    },
  },
  env: [
    {
      key: 'VITE_EXAMPLE_IMAGE_URL',
      secret: false,
      required: true,
      example: 'https://example.invalid',
    },
    {
      key: 'VITE_EXAMPLE_REVIEW_URL',
      secret: false,
      required: true,
      example: '/api/review',
    },
  ],
  dependencies: {
    '@example/full-provider': '^2.0.0',
  },
  doctorChecks: [
    {
      code: 'PROFILE_BOOTSTRAP_MISSING',
      capability: 'review',
      message: 'Provider bootstrap export is missing.',
      sourceIncludes: 'reviewBootstrap',
    },
  ],
};
