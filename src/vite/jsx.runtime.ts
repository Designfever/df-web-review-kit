import type { RuntimeOptions } from './locator.options';

export function createJsxDevRuntime(options: RuntimeOptions) {
  return `
import { Fragment, jsxDEV as baseJsxDEV } from 'react/jsx-dev-runtime';

const OPTIONS = ${JSON.stringify(options)};
const sourceUsageStack = [];
const sourceUsageWrapperCache = new WeakMap();

export { Fragment };

export function jsxDEV(type, props, key, isStaticChildren, source, self) {
  const sourceUsage = getSourceUsage(type, props, source);
  const nextType = sourceUsage ? getSourceUsageWrapper(type, sourceUsage) : type;
  return baseJsxDEV(
    nextType,
    injectSourceProps(type, props, source, sourceUsage),
    key,
    isStaticChildren,
    source,
    self
  );
}

function injectSourceProps(type, props, source, sourceUsage) {
  if (!source || typeof source.fileName !== 'string') return props;

  const sourceFile = getSourceFile(source.fileName);
  if (!sourceFile) return props;

  const nextProps = props ? { ...props } : {};
  if (typeof type !== 'string') {
    injectParentSourceProps(nextProps, sourceUsage);
    return nextProps;
  }

  if (nextProps[OPTIONS.fileAttribute] == null) {
    nextProps[OPTIONS.fileAttribute] = sourceFile;
  }
  if (OPTIONS.line && source.lineNumber != null && nextProps[OPTIONS.lineAttribute] == null) {
    nextProps[OPTIONS.lineAttribute] = String(source.lineNumber);
  }
  if (OPTIONS.column && source.columnNumber != null && nextProps[OPTIONS.columnAttribute] == null) {
    nextProps[OPTIONS.columnAttribute] = String(source.columnNumber);
  }
  injectParentSourceProps(nextProps, getCurrentSourceUsage());

  return nextProps;
}

function getSourceUsage(type, props, source) {
  if (!isSourceUsageComponentType(type)) return null;
  if (!source || typeof source.fileName !== 'string') return null;

  const sourceFile = getSourceFile(source.fileName);
  if (!sourceFile) return null;

  return {
    file: sourceFile,
    line: OPTIONS.line && source.lineNumber != null ? String(source.lineNumber) : '',
    column: OPTIONS.column && source.columnNumber != null ? String(source.columnNumber) : '',
    component: readSourceUsageComponent(props),
  };
}

function isSourceUsageComponentType(type) {
  return (
    typeof type === 'function' &&
    !isClassComponent(type)
  );
}

function isClassComponent(type) {
  return Boolean(type?.prototype?.isReactComponent);
}

function getSourceUsageWrapper(type, usage) {
  let wrappers = sourceUsageWrapperCache.get(type);
  if (!wrappers) {
    wrappers = new Map();
    sourceUsageWrapperCache.set(type, wrappers);
  }

  const key = getSourceUsageKey(usage);
  const existing = wrappers.get(key);
  if (existing) return existing;

  const wrapped = function ReviewSourceUsageWrapper(props) {
    sourceUsageStack.push(usage);
    try {
      return type(props);
    } finally {
      sourceUsageStack.pop();
    }
  };
  wrapped.displayName = 'ReviewSourceUsage(' + getComponentDisplayName(type) + ')';
  wrappers.set(key, wrapped);
  return wrapped;
}

function getComponentDisplayName(type) {
  return type.displayName || type.name || 'Component';
}

function getSourceUsageKey(usage) {
  return [
    usage.file,
    usage.line,
    usage.column,
    usage.component,
  ].join('|');
}

function getCurrentSourceUsage() {
  return sourceUsageStack[sourceUsageStack.length - 1] || null;
}

function readSourceUsageComponent(props) {
  const value = props?.[OPTIONS.parentComponentAttribute];
  return typeof value === 'string' ? value : '';
}

function injectParentSourceProps(props, usage) {
  if (!usage?.file) return;

  if (props[OPTIONS.parentFileAttribute] == null) {
    props[OPTIONS.parentFileAttribute] = usage.file;
  }
  if (usage.line && props[OPTIONS.parentLineAttribute] == null) {
    props[OPTIONS.parentLineAttribute] = usage.line;
  }
  if (usage.column && props[OPTIONS.parentColumnAttribute] == null) {
    props[OPTIONS.parentColumnAttribute] = usage.column;
  }
  if (usage.component && props[OPTIONS.parentComponentAttribute] == null) {
    props[OPTIONS.parentComponentAttribute] = usage.component;
  }
}

function getSourceFile(fileName) {
  const absoluteFile = normalizePath(fileName);
  const relativeFile = getRelativeFile(absoluteFile);

  if (OPTIONS.include.length > 0 && !matchesAny(OPTIONS.include, absoluteFile, relativeFile)) {
    return null;
  }
  if (matchesAny(OPTIONS.exclude, absoluteFile, relativeFile)) return null;

  return OPTIONS.filePath === 'absolute' ? absoluteFile : relativeFile;
}

function getRelativeFile(absoluteFile) {
  if (!OPTIONS.root) return absoluteFile;
  if (absoluteFile === OPTIONS.root) return '';
  if (absoluteFile.startsWith(OPTIONS.root + '/')) {
    return absoluteFile.slice(OPTIONS.root.length + 1);
  }

  return absoluteFile;
}

function matchesAny(patterns, absoluteFile, relativeFile) {
  return patterns.some((pattern) =>
    matchesPattern(pattern, absoluteFile, relativeFile)
  );
}

function matchesPattern(pattern, absoluteFile, relativeFile) {
  if (pattern.type === 'regex') {
    const regex = new RegExp(pattern.value, pattern.flags);
    return regex.test(absoluteFile) || regex.test(relativeFile);
  }

  const value = pattern.value;
  const target = isAbsolutePattern(value) ? absoluteFile : relativeFile;
  if (!value.includes('*')) {
    return target === value || target.startsWith(value + '/');
  }

  return globToRegExp(value).test(target);
}

function isAbsolutePattern(value) {
  return value.startsWith('/') || /^[a-zA-Z]:\\//.test(value);
}

function globToRegExp(value) {
  const source = escapeRegExp(value)
    .replace(/\\\\\\*\\\\\\*/g, '.*')
    .replace(/\\\\\\*/g, '[^/]*');

  return new RegExp('^' + source + '$');
}

function escapeRegExp(value) {
  return value.replace(/[|\\\\{}()[\\]^$+*?.]/g, '\\\\$&');
}

function normalizePath(value) {
  return value.replace(/\\\\/g, '/').replace(/\\/+$/, '');
}
`;
}
