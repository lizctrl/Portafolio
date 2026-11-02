// Fábrica JSX mínima: convierte el JSX en nodos del DOM reales, sin React.
export type Child = Node | string | number | boolean | null | undefined | Child[];
type Attrs = Record<string, unknown>;

declare global {
  namespace JSX {
    type Element = Node;
    interface IntrinsicElements {
      [tag: string]: Attrs;
    }
    interface ElementChildrenAttribute {
      children: unknown;
    }
  }
}

// Los hijos se crean antes que el padre, así que las etiquetas SVG se reconocen por nombre.
const SVG_TAGS = new Set(['svg', 'path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon', 'g']);

function append(parent: Node, child: Child): void {
  if (Array.isArray(child)) child.forEach((c) => append(parent, c));
  else if (child instanceof Node) parent.appendChild(child);
  else if (child !== null && child !== undefined && typeof child !== 'boolean') {
    parent.appendChild(document.createTextNode(String(child)));
  }
}

export function Fragment({ children }: { children?: Child }): Node {
  const fragment = document.createDocumentFragment();
  append(fragment, children);
  return fragment;
}

export function h(tag: string | ((props: any) => Node), attrs: Attrs | null, ...children: Child[]): Node {
  if (typeof tag === 'function') return tag({ ...attrs, children });

  const el = SVG_TAGS.has(tag)
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (value === true) el.setAttribute(key, '');
    else if (value !== false && value !== null && value !== undefined) el.setAttribute(key, String(value));
  }
  append(el, children);
  return el;
}
