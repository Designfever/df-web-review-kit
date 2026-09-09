/** iframe 등 서로 다른 Window에서 생성된 노드도 판별합니다. */
export function isElement(target: EventTarget | null | undefined): target is Element {
  return !!target && (target as Node).nodeType === 1;
}

export function isShadowRoot(node: Node): node is ShadowRoot {
  return node.nodeType === 11 && 'host' in node;
}
