import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createProviderArtifacts,
  doctorProviderProfile,
  getProfileSpecifier,
  resolveProviderProfile,
} from './provider-install';
import { defineProviderProfile } from './provider-profile';

const roots: string[] = [];
const SECRET_VALUE = 'do-not-leak-this-token';

const reviewOnlyProfile = defineProviderProfile({
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
    { key: 'VITE_EXAMPLE_PROJECT_ID', secret: false, required: true, example: 'my-project' },
    { key: 'VITE_EXAMPLE_REVIEW_TOKEN', secret: true, required: true },
  ],
  dependencies: { '@example/review-provider': '^1.0.0' },
});

const reviewAndFigmaProfile = defineProviderProfile({
  schemaVersion: 1,
  capabilities: {
    review: {
      module: '@example/full-provider',
      exportName: 'createReviewAdapter',
      options: { token: { env: 'VITE_EXAMPLE_TOKEN' } },
    },
    figma: {
      module: '@example/full-provider',
      exportName: 'createFigmaImageStore',
      options: { endpoint: { env: 'VITE_EXAMPLE_IMAGE_URL' } },
    },
  },
  env: [
    { key: 'VITE_EXAMPLE_IMAGE_URL', secret: false, required: true, example: 'https://example.invalid' },
    { key: 'VITE_EXAMPLE_TOKEN', secret: true, required: true },
  ],
  dependencies: { '@example/full-provider': '^2.0.0' },
  doctorChecks: [
    {
      code: 'PROFILE_BOOTSTRAP_MISSING',
      capability: 'review',
      message: 'Provider bootstrap export is missing.',
      sourceIncludes: 'providerCapabilities',
    },
  ],
});

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('provider profile installation contract', () => {
  it('creates review-only wiring while isolating secret values', () => {
    const artifacts = createProviderArtifacts(reviewOnlyProfile, {
      VITE_EXAMPLE_PROJECT_ID: 'fixture',
      VITE_EXAMPLE_REVIEW_TOKEN: SECRET_VALUE,
    });

    expect(artifacts.capabilities).toEqual(['review']);
    expect(artifacts.source).toContain('createReviewAdapter');
    expect(artifacts.source).not.toContain(SECRET_VALUE);
    expect(artifacts.envExample).toContain('VITE_EXAMPLE_PROJECT_ID=my-project');
    expect(artifacts.envExample).toContain('VITE_EXAMPLE_REVIEW_TOKEN=\n');
    expect(artifacts.envExample).not.toContain(SECRET_VALUE);
    expect(artifacts.envLocal).toContain(`VITE_EXAMPLE_REVIEW_TOKEN=${SECRET_VALUE}`);
  });

  it('composes independent review and Figma capabilities', () => {
    const artifacts = createProviderArtifacts(reviewAndFigmaProfile, {
      VITE_EXAMPLE_IMAGE_URL: 'https://host.invalid',
      VITE_EXAMPLE_TOKEN: SECRET_VALUE,
    });

    expect(artifacts.capabilities).toEqual(['review', 'figma']);
    expect(artifacts.source).toContain('createReviewAdapter');
    expect(artifacts.source).toContain('createFigmaImageStore');
    expect(artifacts.source).not.toContain(SECRET_VALUE);
    expect(artifacts.envExample).toBe(
      'VITE_EXAMPLE_IMAGE_URL=https://example.invalid\nVITE_EXAMPLE_TOKEN=\n'
    );
  });

  it('loads a local profile module through the profile resolver', async () => {
    const root = await mkdtemp(join(tmpdir(), 'web-review-kit-profile-'));
    roots.push(root);
    await mkdir(join(root, 'profiles'));
    await writeFile(join(root, 'profiles/review.mjs'), 'export default {};\n');
    let loadedSpecifier = '';

    const profile = await resolveProviderProfile('./profiles/review.mjs', root, async (specifier) => {
      loadedSpecifier = specifier;
      return { default: reviewOnlyProfile };
    });

    expect(loadedSpecifier).toMatch(/^file:/);
    expect(profile).toBe(reviewOnlyProfile);
  });

  it('parses --profile without accepting an absent value', () => {
    expect(getProfileSpecifier(['--dry-run', '--profile', './profile.mjs'])).toBe('./profile.mjs');
    expect(getProfileSpecifier(['--dry-run'])).toBeNull();
    expect(() => getProfileSpecifier(['--profile'])).toThrow('requires a package name or module path');
  });

  it('checks profile env keys and capability wiring without printing values', () => {
    const artifacts = createProviderArtifacts(reviewAndFigmaProfile);
    const healthy = doctorProviderProfile({
      profile: reviewAndFigmaProfile,
      source: artifacts.source,
      env: {
        VITE_EXAMPLE_IMAGE_URL: 'https://host.invalid',
        VITE_EXAMPLE_TOKEN: SECRET_VALUE,
      },
    });
    const unhealthy = doctorProviderProfile({
      profile: reviewAndFigmaProfile,
      source: 'createReviewAdapter();',
      env: {},
    });

    expect(healthy.healthy).toBe(true);
    expect(healthy.capabilities).toEqual(['review', 'figma']);
    expect(unhealthy.healthy).toBe(false);
    expect(unhealthy.diagnostics.map(({ code }) => code)).toEqual(
      expect.arrayContaining(['PROFILE_ENV_MISSING', 'PROFILE_FIGMA_WIRING_MISSING'])
    );
    expect(JSON.stringify(unhealthy)).not.toContain(SECRET_VALUE);
  });
});
