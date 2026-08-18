# Custom Provider Profiles

Provider profiles are a v0.9 extension contract. In v0.10, `web-review-kit init` no longer accepts `--profile` and never generates provider or `/review` code.

A project that needs Jira, Mantis, Trac, FTP, a custom database, or a custom Figma bridge must keep that adapter and its setup guide in the host repository. The types below remain available for existing integrations and read-only `doctor --profile` checks, but they are not an installer path.

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
        endpoint: { env: 'VITE_EXAMPLE_REVIEW_URL' },
      },
    },
  },
  env: [
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
});
```

A JavaScript profile can export the same object directly. See:

- [`examples/provider-profile-review.mjs`](examples/provider-profile-review.mjs)
- [`examples/provider-profile-review-figma.mjs`](examples/provider-profile-review-figma.mjs)

The module must default-export the profile, or export it as `providerProfile`.

## Capabilities

Every profile declares `capabilities.review`. `capabilities.figma` is optional and independent. Each wiring entry names a package module, factory export, and serializable options. An option shaped as `{ env: "ENV_KEY" }` generates an `import.meta.env.ENV_KEY` reference instead of a value.

Review wiring has two modes:

- `mode: "adapter"` is the default. The factory returns a ready `ReviewShellAdapter`.
- `mode: "bootstrap"` is for providers that must show login or project/page selection before creating adapters. The factory returns a `ReviewProviderBootstrap`.

```ts
import type { ReviewProviderBootstrap } from '@designfever/web-review-kit/react-shell';

export function createReviewBootstrap({ mountGate }): ReviewProviderBootstrap {
  return {
    mount({ rootId, projectId, onReady }) {
      mountGate({
        rootId,
        projectId,
        onStart(adapter) {
          onReady({ adapters: [adapter] });
        },
      });
    },
  };
}
```

The host-owned entry waits for `onReady` before calling `mountReviewShell`. The bootstrap owns its gate UI and must unmount that UI before invoking `onReady`.

The optional Figma factory is still created independently. A custom runtime Figma store does not require `reviewFigmaImageStore()` in Vite; that plugin belongs only to the built-in local Figma store.

`dependencies` lists host packages for the future installation plan. The public CLI does not download or execute provider code beyond loading the selected profile module.

## Questions and environment fields

`questions` declares public prompt metadata. A question can target an environment field through `envKey`. Every referenced key must exist in `env`.

Environment rules:

- keys must use uppercase `A-Z`, numbers, and underscores;
- secret fields cannot declare example values;
- secret fields cannot use the `VITE_` prefix;
- browser wiring cannot reference a field marked `secret`;
- generated source contains environment references, never entered values;
- `.env.example` contains all declared keys, but secret values are always empty;
- entered values may be written only to `.env.local` after the installer preview and confirmation;
- diagnostics report environment key names, never values;
- secrets must not be supplied through CLI arguments.

Values exposed through `import.meta.env` are client-visible by Vite design. A browser provider should receive only public proxy URLs and non-secret identifiers. Private review-storage or Figma credentials belong in a server environment behind a narrow proxy or secure session.

## Doctor checks

Core checks verify that:

- the profile loaded and passed schema validation;
- required environment keys exist;
- declared review and Figma factory exports appear in generated wiring;
- optional profile checks find their `sourceIncludes` marker.

Custom checks are declarative and report a stable `code` and message. They cannot access or print environment values.

## Compatibility

`schemaVersion: 1` is the only v0.9 schema. Profile authors should pin a compatible `@designfever/web-review-kit` peer dependency while this contract remains experimental. The profile schema will be frozen before v1.0.
