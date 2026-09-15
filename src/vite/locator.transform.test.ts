// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as typescript from 'typescript';
import { reviewSourceLocator, reviewDataLocator, type ReviewSourceLocatorOptions, type ReviewDataLocatorOptions } from '../vite';
import type { Plugin, ResolvedConfig } from 'vite';

// Vitest's VM cannot dynamically import from new Function. Substitute only that
// loader with the real compiler; AST/runtime behavior below remains production code.
beforeAll(() => {
  vi.stubGlobal('Function', new Proxy(Function, {
    construct(target, args) {
      if (args[0] === 'specifier' && args[1] === 'return import(specifier)') {
        return async () => typescript;
      }
      return Reflect.construct(target, args);
    },
  }));
});
afterAll(() => vi.unstubAllGlobals());

type Locator = {
  configResolved(config: ResolvedConfig): void;
  resolveId(id: string, importer?: string): string | null;
  load(id: string): string | null;
  transform(code: string, id: string): Promise<{ code: string; map: null } | null> | { code: string; map: null } | null;
};
function configured(plugin: Plugin) {
  const locator = plugin as unknown as Locator;
  locator.configResolved({ root: '/project', command: 'serve', env: { VITE_REVIEW_SOURCE_ROOT: '/project' } } as unknown as ResolvedConfig);
  return locator;
}
function source(options: ReviewSourceLocatorOptions = {}) { return configured(reviewSourceLocator(options)); }
function data(options: ReviewDataLocatorOptions = {}) { return configured(reviewDataLocator(options)); }

describe('locator annotations through the public Vite entry', () => {
  it('annotates intrinsic and component usage without changing line count or explicit hints', async () => {
    const code = [
      'function Card(){ return <section><Button/><span data-component="Named"/><React.Fragment><div/></React.Fragment></section>; }',
      'const Other = () => <Card data-wrk-source-parent-component="Explicit"/>;',
      'class ClassCard { render(){ return <article/>; } }',
    ].join('\n');
    const out = await source().transform(code, '/project/src/card.tsx?import');
    expect(out?.map).toBeNull();
    expect(out?.code).toContain('<section data-wrk-source-component="Card">');
    expect(out?.code).toContain('<Button data-wrk-source-parent-component="Card"/>');
    expect(out?.code).toContain('<span data-component="Named"/>');
    expect(out?.code).toContain('<React.Fragment><div data-wrk-source-component="Card"/>');
    expect(out?.code).toContain('<Card data-wrk-source-parent-component="Explicit"/>');
    expect(out?.code).toContain('<article data-wrk-source-component="ClassCard"/>');
    expect(out?.code.split('\n')).toHaveLength(code.split('\n').length);
  });

  it('preserves include/exclude, path normalization, custom prefix and environment-only transforms', async () => {
    const plugin = source({ root: 'C:\\project\\', include: ['src'], exclude: [/skip/], attributePrefix: 'data-test---' });
    const code = 'const Hero = () => <main/>;';
    expect((await plugin.transform(code, 'C:\\project\\src\\hero.jsx'))?.code).toContain('data-test-component="Hero"');
    expect(await plugin.transform(code, 'C:\\project\\src\\skip.jsx')).toBeNull();
    expect(await plugin.transform(code, 'C:\\project\\other\\hero.jsx')).toBeNull();
    expect(await plugin.transform(code, 'C:\\project\\src\\hero.ts')).toBeNull();
    const env = 'const root = typeof __DF_WRK_REVIEW_SOURCE_ROOT__ === "undefined" ? "" : __DF_WRK_REVIEW_SOURCE_ROOT__;';
    expect((await plugin.transform(env, '/not-included/file.ts'))?.code).toContain(': "/project"');
  });

  it('injects data source and original line numbers with configurable matching/keys', async () => {
    const code = "const data = [\n  { component: 'FeatureHero' },\n  { component: 'SectionSkip' },\n  { component: `FeatureCards` }\n];";
    const plugin = data({ include: ['src'], componentPattern: /Feature[A-Za-z]+/, fileAttribute: 'originFile', lineAttribute: 'originLine' });
    const out = await plugin.transform(code, '/project/src/page.ts?raw');
    expect(out?.code).toContain('"originFile": "src/page.ts", "originLine": 2, component:');
    expect(out?.code).toContain('"originFile": "src/page.ts", "originLine": 4, component:');
    expect(out?.code).toContain("{ component: 'SectionSkip' }");
    expect(out?.code.split('\n')).toHaveLength(code.split('\n').length);
    expect(await plugin.transform(code, '/project/node_modules/page.ts')).toBeNull();
  });
});

type RuntimeElement = { type: string | ((props: Record<string, unknown>) => RuntimeElement); props: Record<string, unknown> };
type JsxDev = (type: RuntimeElement['type'], props: Record<string, unknown>, key: unknown, isStatic: boolean, source: { fileName: string; lineNumber: number; columnNumber: number }, self?: unknown) => RuntimeElement;
function runtime(options: ReviewSourceLocatorOptions = {}): JsxDev {
  const plugin = source(options);
  const id = plugin.resolveId('react/jsx-dev-runtime', '/project/src/card.tsx')!;
  expect(plugin.resolveId('react/jsx-dev-runtime', id)).toBeNull();
  expect(plugin.load('unrelated')).toBeNull();
  const code = plugin.load(id)!
    .replace("import { Fragment, jsxDEV as baseJsxDEV } from 'react/jsx-dev-runtime';", '')
    .replace('export { Fragment };', '')
    .replace('export function jsxDEV', 'function jsxDEV');
  return new Function('baseJsxDEV', 'Fragment', code + '\nreturn jsxDEV;')(
    (type: RuntimeElement['type'], props: Record<string, unknown>) => ({ type, props }), Symbol('Fragment')
  ) as JsxDev;
}
const location = { fileName: '/project/src/card.tsx', lineNumber: 4, columnNumber: 9 };
describe('generated JSX runtime behavior', () => {
  it('injects source props while retaining explicit annotations and excluding vendor paths', () => {
    const jsx = runtime({ include: ['src'], column: false });
    const item = jsx('button', { 'data-wrk-source-line': '77' }, null, false, location);
    expect(item.props).toEqual({ 'data-wrk-source-file': 'src/card.tsx', 'data-wrk-source-line': '77' });
    expect(jsx('div', { title: 'vendor' }, null, false, { ...location, fileName: '/project/node_modules/pkg/a.tsx' }).props).toEqual({ title: 'vendor' });
  });

  it('propagates parent usage during function rendering and reuses wrappers without leaking the stack', () => {
    const jsx = runtime();
    const Child = () => jsx('div', {}, null, false, { ...location, fileName: '/project/src/child.tsx' });
    const parentProps = { 'data-wrk-source-parent-component': 'Parent' };
    const child = jsx(Child, parentProps, null, false, location);
    expect(jsx(Child, parentProps, null, false, location).type).toBe(child.type);
    const rendered = (child.type as (props: Record<string, unknown>) => RuntimeElement)(child.props);
    expect(rendered.props).toMatchObject({ 'data-wrk-source-file': 'src/child.tsx', 'data-wrk-source-parent-file': 'src/card.tsx', 'data-wrk-source-parent-line': '4', 'data-wrk-source-parent-column': '9', 'data-wrk-source-parent-component': 'Parent' });
    expect(jsx('aside', {}, null, false, location).props['data-wrk-source-parent-file']).toBeUndefined();
    const Throws = () => { throw new Error('render'); };
    const errorChild = jsx(Throws, {}, null, false, location);
    expect(() => (errorChild.type as () => RuntimeElement)()).toThrow('render');
    expect(jsx('aside', {}, null, false, location).props['data-wrk-source-parent-file']).toBeUndefined();
  });
});
