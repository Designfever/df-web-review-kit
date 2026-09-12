import { normalizePath, matchesPath, type RuntimeOptions } from './locator.options';

type TypeScriptModule = typeof import('typescript');

type SourceComponentInsertion = {
  offset: number;
  value: string;
};

let typescriptModulePromise: Promise<TypeScriptModule | null> | undefined;

export async function injectReviewSourceComponentHints(
  code: string,
  id: string,
  options: RuntimeOptions
) {
  const file = normalizePath(id.split('?')[0]);
  if (!isJsxSourceFile(file, code)) return null;

  const relativeFile =
    options.root && file.startsWith(options.root + '/')
      ? file.slice(options.root.length + 1)
      : file;
  if (
    options.include.length > 0 &&
    !options.include.some((matcher) => matchesPath(matcher, file, relativeFile))
  ) {
    return null;
  }
  if (
    options.exclude.some((matcher) => matchesPath(matcher, file, relativeFile))
  ) {
    return null;
  }

  const ts = await loadTypeScript();
  if (!ts) return null;

  const sourceFile = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.TSX
  );
  const insertions = getSourceComponentInsertions(
    ts,
    sourceFile,
    options.componentAttribute,
    options.parentComponentAttribute
  );
  if (insertions.length === 0) return null;

  return applySourceComponentInsertions(code, insertions);
}

async function loadTypeScript() {
  const importTypeScript = new Function(
    'specifier',
    'return import(specifier)'
  ) as (specifier: string) => Promise<TypeScriptModule>;
  typescriptModulePromise ??= importTypeScript('typescript')
    .then((module) => module)
    .catch(() => null);
  return typescriptModulePromise;
}

function isJsxSourceFile(file: string, code: string) {
  return /\.[cm]?[jt]sx$/.test(file) && code.includes('<');
}

function getSourceComponentInsertions(
  ts: TypeScriptModule,
  sourceFile: import('typescript').SourceFile,
  componentAttribute: string,
  parentComponentAttribute: string
) {
  const insertions: SourceComponentInsertion[] = [];

  const visit = (
    node: import('typescript').Node,
    currentComponent: string | undefined
  ) => {
    const component = getComponentNameForNode(ts, node) ?? currentComponent;
    if (
      component &&
      isIntrinsicJsxElement(ts, node, sourceFile) &&
      !hasJsxAttribute(ts, node, componentAttribute) &&
      !hasJsxAttribute(ts, node, 'data-component')
    ) {
      insertions.push({
        offset: node.tagName.end,
        value: ` ${componentAttribute}=${JSON.stringify(component)}`,
      });
    }
    if (
      component &&
      isCustomJsxElement(ts, node, sourceFile) &&
      !hasJsxAttribute(ts, node, parentComponentAttribute)
    ) {
      insertions.push({
        offset: node.tagName.end,
        value: ` ${parentComponentAttribute}=${JSON.stringify(component)}`,
      });
    }

    ts.forEachChild(node, (child) => visit(child, component));
  };

  visit(sourceFile, undefined);
  return insertions;
}

function getComponentNameForNode(
  ts: TypeScriptModule,
  node: import('typescript').Node
) {
  if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
    const name = node.name?.text;
    return isComponentName(name) ? name : undefined;
  }

  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
    const name = node.name.text;
    return isComponentName(name) && node.initializer ? name : undefined;
  }

  return undefined;
}

function isIntrinsicJsxElement(
  ts: TypeScriptModule,
  node: import('typescript').Node,
  sourceFile: import('typescript').SourceFile
): node is import('typescript').JsxOpeningLikeElement {
  if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) {
    return false;
  }

  const tagName = node.tagName.getText(sourceFile);
  return /^[a-z]/.test(tagName) || tagName.includes('-');
}

function isCustomJsxElement(
  ts: TypeScriptModule,
  node: import('typescript').Node,
  sourceFile: import('typescript').SourceFile
): node is import('typescript').JsxOpeningLikeElement {
  if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) {
    return false;
  }

  const tagName = node.tagName.getText(sourceFile);
  if (isReactRuntimeElementName(tagName)) return false;
  return /^[A-Z]/.test(tagName);
}

function isReactRuntimeElementName(tagName: string) {
  const name = tagName.startsWith('React.')
    ? tagName.slice('React.'.length)
    : tagName;
  return name === 'Fragment' || name === 'StrictMode' || name === 'Profiler';
}

function hasJsxAttribute(
  ts: TypeScriptModule,
  node: import('typescript').JsxOpeningLikeElement,
  name: string
) {
  return node.attributes.properties.some(
    (property) =>
      ts.isJsxAttribute(property) && property.name.getText() === name
  );
}

function isComponentName(name: string | undefined) {
  return Boolean(name && /^[A-Z][A-Za-z0-9_$]*$/.test(name));
}

function applySourceComponentInsertions(
  code: string,
  insertions: SourceComponentInsertion[]
) {
  return insertions
    .slice()
    .sort((a, b) => b.offset - a.offset)
    .reduce(
      (nextCode, insertion) =>
        `${nextCode.slice(0, insertion.offset)}${insertion.value}${nextCode.slice(
          insertion.offset
        )}`,
      code
    );
}
