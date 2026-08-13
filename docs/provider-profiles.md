# Custom Provider Profiles

Provider profiles let `web-review-kit init` compose host-owned review storage and optional Figma image storage without embedding a backend implementation in the public package.

```bash
npx @designfever/web-review-kit init --profile ./review-profile.mjs
npx @designfever/web-review-kit init --profile @example/review-profile
```

A profile is declarative. It contributes questions, environment variable names, dependencies, capability wiring, and doctor checks. It cannot write host files directly; the core installer turns it into the same previewable installation plan used by built-in local setup.

## Authoring

TypeScript packages can import the helper and types from the public `./profile` export:

```ts
import { defineProviderProfile } from '@designfever/web-review-kit/profile';

export default defineProviderProfile({
  schemaVersion: 1,
  capabilities: {
    review: {
      module: '@example/review-provider',
      exportName: 'createReviewAdapter',
      options: {
        token: { env: 'VITE_EXAMPLE_REVIEW_TOKEN' },
      },
    },
  },
  env: [
    {
      key: 'VITE_EXAMPLE_REVIEW_TOKEN',
      secret: true,
      required: true,
    },
  ],
  dependencies: {
    '@example/review-provider': '^1.0.0',
  },
});
```

A JavaScript profile can export the same object directly. See:

- [`examples/provider-profile-review.mjs`](examples/provider-profile-review.mjs)
- [`examples/provider-profile-review-figma.mjs`](examples/provider-profile-review-figma.mjs)

The module must default-export the profile, or export it as `providerProfile`.

## Capabilities

Every profile declares `capabilities.review`. `capabilities.figma` is optional and independent. Each wiring entry names a package module, factory export, and serializable options. An option shaped as `{ env: "ENV_KEY" }` generates an `import.meta.env.ENV_KEY` reference instead of a value.

`dependencies` lists host packages for the future installation plan. The public CLI does not download or execute provider code beyond loading the selected profile module.

## Questions and environment fields

`questions` declares public prompt metadata. A question can target an environment field through `envKey`. Every referenced key must exist in `env`.

Environment rules:

- keys must use uppercase `A-Z`, numbers, and underscores;
- secret fields cannot declare example values;
- generated source contains environment references, never entered values;
- `.env.example` contains all declared keys, but secret values are always empty;
- entered values may be written only to `.env.local` after the installer preview and confirmation;
- diagnostics report environment key names, never values;
- secrets must not be supplied through CLI arguments.

Profiles should avoid `VITE_` for server-only credentials. Values exposed through `import.meta.env` are client-visible by Vite design; the provider package owns that security decision.

## Doctor checks

Core checks verify that:

- the profile loaded and passed schema validation;
- required environment keys exist;
- declared review and Figma factory exports appear in generated wiring;
- optional profile checks find their `sourceIncludes` marker.

Custom checks are declarative and report a stable `code` and message. They cannot access or print environment values.

## Compatibility

`schemaVersion: 1` is the only v0.9 schema. Profile authors should pin a compatible `@designfever/web-review-kit` peer dependency while this contract remains experimental. The profile schema will be frozen before v1.0.
