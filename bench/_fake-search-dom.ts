/**
 * Just enough DOM for search.js's highlightMatches() to run under Bun:
 * elements and text nodes with linked siblings, the four selectors it
 * queries (`[data-line="N"]`, `[data-line]`, `.line`, and tag names), a
 * text-only TreeWalker, Range, Highlight, and CSS.highlights. Dev-only,
 * shared by bench/search.bench.ts and tests/search-highlight.test.ts so
 * neither needs a DOM dependency.
 *
 * Siblings are a linked list, so walking and splitting stay O(1) per node
 * like a browser's; an array with indexOf() would make the shim itself
 * quadratic and hide what highlightMatches costs.
 */

const TAG_NAME = /^[a-z]+$/;
const DATA_LINE_VALUE = /^\[data-line="(.*)"\]$/;

export class FakeNode {
  parentNode: FakeElement | null = null;
  previousSibling: FakeNode | null = null;
  nextSibling: FakeNode | null = null;

  get parentElement() {
    return this.parentNode;
  }

  replaceWith(...nodes: FakeNode[]) {
    const parent = this.parentNode;
    if (!parent) return;
    const next = this.nextSibling;
    parent.removeChild(this);
    for (const node of nodes) parent.insertBefore(node, next);
  }
}

export class FakeText extends FakeNode {
  readonly nodeType = 3;

  constructor(public data: string) {
    super();
  }

  splitText(offset: number) {
    const tail = new FakeText(this.data.slice(offset));
    this.data = this.data.slice(0, offset);
    this.parentNode?.insertBefore(tail, this.nextSibling);
    return tail;
  }
}

export class FakeElement extends FakeNode {
  readonly nodeType = 1;
  firstChild: FakeNode | null = null;
  lastChild: FakeNode | null = null;
  className = "";
  dataset: { line?: string; [key: string]: string | undefined } = {};

  constructor(public readonly localName: string) {
    super();
  }

  get childNodes() {
    const nodes: FakeNode[] = [];
    for (let n = this.firstChild; n; n = n.nextSibling) nodes.push(n);
    return nodes;
  }

  get textContent(): string {
    let text = "";
    for (let n = this.firstChild; n; n = n.nextSibling) {
      text += n instanceof FakeText ? n.data : (n as FakeElement).textContent;
    }
    return text;
  }

  getAttribute(name: string) {
    if (name === "class") return this.className || null;
    if (!name.startsWith("data-")) return null;
    const key = name
      .slice(5)
      .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    return this.dataset[key] ?? null;
  }

  appendChild(node: FakeNode) {
    return this.insertBefore(node, null);
  }

  insertBefore(node: FakeNode, ref: FakeNode | null) {
    node.parentNode?.removeChild(node);
    node.parentNode = this;
    const prev = ref ? ref.previousSibling : this.lastChild;
    node.previousSibling = prev;
    node.nextSibling = ref;
    if (prev) prev.nextSibling = node;
    else this.firstChild = node;
    if (ref) ref.previousSibling = node;
    else this.lastChild = node;
    return node;
  }

  removeChild(node: FakeNode) {
    if (node.previousSibling)
      node.previousSibling.nextSibling = node.nextSibling;
    else this.firstChild = node.nextSibling;
    if (node.nextSibling)
      node.nextSibling.previousSibling = node.previousSibling;
    else this.lastChild = node.previousSibling;
    node.parentNode = null;
    node.previousSibling = null;
    node.nextSibling = null;
    return node;
  }

  normalize() {
    let n = this.firstChild;
    while (n) {
      if (n instanceof FakeText) {
        while (n.nextSibling instanceof FakeText) {
          n.data += n.nextSibling.data;
          this.removeChild(n.nextSibling);
        }
        const next: FakeNode | null = n.nextSibling;
        if (n.data === "") this.removeChild(n);
        n = next;
      } else {
        (n as FakeElement).normalize();
        n = n.nextSibling;
      }
    }
  }

  matches(selector: string) {
    if (TAG_NAME.test(selector)) return this.localName === selector;
    if (selector === ".line") return this.className.split(" ").includes("line");
    if (selector === "[data-line]") return this.dataset.line !== undefined;
    const value = DATA_LINE_VALUE.exec(selector)?.[1];
    if (value !== undefined) return this.dataset.line === value;
    throw new Error(`fake DOM: unsupported selector ${selector}`);
  }

  querySelectorAll(selector: string) {
    const found: FakeElement[] = [];
    for (const el of descendants(this))
      if (el.matches(selector)) found.push(el);
    return found;
  }

  querySelector(selector: string) {
    for (const el of descendants(this)) if (el.matches(selector)) return el;
    return null;
  }
}

/** Pre-order walk of every node under `root`, excluding `root` itself. */
function nextInTree(node: FakeNode, root: FakeNode): FakeNode | null {
  if (node instanceof FakeElement && node.firstChild) return node.firstChild;
  let n: FakeNode | null = node;
  while (n && n !== root) {
    if (n.nextSibling) return n.nextSibling;
    n = n.parentNode;
  }
  return null;
}

function* descendants(root: FakeElement) {
  for (let n = nextInTree(root, root); n; n = nextInTree(n, root)) {
    if (n instanceof FakeElement) yield n;
  }
}

class FakeTreeWalker {
  currentNode: FakeNode;

  constructor(readonly root: FakeNode) {
    this.currentNode = root;
  }

  nextNode() {
    let n = nextInTree(this.currentNode, this.root);
    while (n && !(n instanceof FakeText)) n = nextInTree(n, this.root);
    if (n) this.currentNode = n;
    return n;
  }
}

export class FakeRange {
  startContainer: FakeNode | null = null;
  startOffset = 0;
  endContainer: FakeNode | null = null;
  endOffset = 0;

  setStart(node: FakeNode, offset: number) {
    this.startContainer = node;
    this.startOffset = offset;
  }

  setEnd(node: FakeNode, offset: number) {
    this.endContainer = node;
    this.endOffset = offset;
  }
}

export class FakeHighlight extends Set<FakeRange> {}

/**
 * `h("span", { dataset: { line: "3" } }, "text", h(...))` builds a
 * FakeElement; string children become text nodes.
 */
export function h(
  localName: string,
  props: { className?: string; dataset?: Record<string, string> } = {},
  ...children: (FakeNode | string)[]
) {
  const el = new FakeElement(localName);
  if (props.className) el.className = props.className;
  if (props.dataset) Object.assign(el.dataset, props.dataset);
  for (const child of children) {
    el.appendChild(typeof child === "string" ? new FakeText(child) : child);
  }
  return el;
}

/**
 * Install the fake DOM as globals. `highlights: false` leaves out
 * CSS.highlights, so highlightMatches takes its `<mark>` fallback.
 * Returns the CSS.highlights registry (empty when `highlights` is false).
 */
export function installFakeDom({ highlights = true } = {}) {
  const registry = new Map<string, FakeHighlight>();
  const globals: [string, unknown][] = [
    [
      "document",
      {
        createTreeWalker: (root: FakeNode) => new FakeTreeWalker(root),
        createElement: (localName: string) => new FakeElement(localName),
      },
    ],
    ["NodeFilter", Object.fromEntries([["SHOW_TEXT", 4]])],
    ["Range", FakeRange],
    ["Highlight", FakeHighlight],
    ["CSS", highlights ? { highlights: registry } : {}],
  ];
  for (const [name, value] of globals) Reflect.set(globalThis, name, value);
  return registry;
}
