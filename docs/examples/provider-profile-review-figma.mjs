// Generic review + Figma example. The two capabilities remain independently wired.
export default {
  schemaVersion: 1,
  capabilities: {
    review: {
      module: '@example/full-provider',
      exportName: 'createReviewAdapter',
      options: {
        token: { env: 'VITE_EXAMPLE_REVIEW_TOKEN' },
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
      key: 'VITE_EXAMPLE_REVIEW_TOKEN',
      secret: true,
      required: true,
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
      sourceIncludes: 'providerCapabilities',
    },
  ],
};
