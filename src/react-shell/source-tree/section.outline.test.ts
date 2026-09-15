import { afterEach, describe, expect, it } from 'vitest';
import { getSectionOutline } from './section.outline';

afterEach(() => document.body.replaceChildren());

describe('getSectionOutline', () => {
  it('ignores DOM adjustment preview clones', () => {
    document.body.innerHTML = `
      <main data-wrk-source-component="TargetApp" data-wrk-source-file="src/target-app.tsx">
        <section data-wrk-source-component="HomeHeroSection" data-wrk-source-file="src/home-hero.section.tsx"></section>
      </main>
      <section data-dfwr-adjust-preview="true" data-wrk-source-component="HomeHeroSection" data-wrk-source-file="src/home-hero.section.tsx"></section>
    `;

    const outline = getSectionOutline(document);

    expect(outline).toHaveLength(1);
    expect(outline[0]?.label).toBe('TargetApp');
    expect(outline[0]?.children).toHaveLength(1);
  });
});
