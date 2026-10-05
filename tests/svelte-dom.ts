/**
 * Mounts Svelte 5 client components in Bun without a browser, for tests and
 * benches that need real component updates (prop propagation, reactive
 * re-runs, retained state) rather than SSR output.
 *
 * Two parts:
 * - A minimal DOM: just the node tree, attribute, and `innerHTML` surface
 *   Svelte's client runtime touches. `innerHTML` stores the raw string as one
 *   opaque node instead of parsing it, so `@html` output round-trips through
 *   `outerHTML` unchanged.
 * - A compile step: `.svelte` files compiled for the client with
 *   `fragments: "tree"` (built from `createElement` calls, so no HTML
 *   parser is needed), written next to their sources so relative imports
 *   resolve.
 *
 * Not a general-purpose DOM. Layout is inert (`scrollHeight` and friends are
 * plain numbers), and `requestAnimationFrame` queues callbacks until
 * `flushFrames()` runs them.
 */

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;

type Child = string | FakeNode;

class FakeNode {
  nodeType: number;
  nodeName: string;
  parentNode: FakeNode | null = null;
  // Linked siblings, so `nextSibling` (Svelte's hot path) is O(1).
  _first: FakeNode | null = null;
  _last: FakeNode | null = null;
  _prev: FakeNode | null = null;
  _next: FakeNode | null = null;
  // Svelte reads/writes expando properties (`__t`, `__e`, ...) on nodes.
  [key: string]: unknown;

  constructor(nodeType: number, nodeName: string) {
    this.nodeType = nodeType;
    this.nodeName = nodeName;
  }

  get firstChild() {
    return this._first;
  }

  get lastChild() {
    return this._last;
  }

  get nextSibling() {
    return this._next;
  }

  get previousSibling() {
    return this._prev;
  }

  get childNodes() {
    const nodes: FakeNode[] = [];
    for (let n = this._first; n; n = n._next) nodes.push(n);
    return nodes;
  }

  get ownerDocument() {
    return fakeDocument;
  }

  get isConnected(): boolean {
    let n: FakeNode = this;
    while (n.parentNode) n = n.parentNode;
    return n === fakeDocument;
  }

  getRootNode() {
    let n: FakeNode = this;
    while (n.parentNode) n = n.parentNode;
    return n;
  }

  contains(other: FakeNode | null) {
    for (let n = other; n; n = n.parentNode) if (n === this) return true;
    return false;
  }

  insertBefore<T extends FakeNode>(node: T, ref: FakeNode | null): T {
    if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
      while (node._first) this.insertBefore(node._first, ref);
      return node;
    }
    node.parentNode?.removeChild(node);
    node.parentNode = this;
    node._next = ref;
    node._prev = ref ? ref._prev : this._last;
    if (node._prev) node._prev._next = node;
    else this._first = node;
    if (ref) ref._prev = node;
    else this._last = node;
    return node;
  }

  appendChild<T extends FakeNode>(node: T): T {
    return this.insertBefore(node, null);
  }

  removeChild<T extends FakeNode>(node: T): T {
    if (node._prev) node._prev._next = node._next;
    else this._first = node._next;
    if (node._next) node._next._prev = node._prev;
    else this._last = node._prev;
    node.parentNode = null;
    node._prev = null;
    node._next = null;
    return node;
  }

  remove() {
    this.parentNode?.removeChild(this);
  }

  append(...nodes: Child[]) {
    for (const n of nodes) this.appendChild(toNode(n));
  }

  before(...nodes: Child[]) {
    const parent = this.parentNode;
    if (parent) for (const n of nodes) parent.insertBefore(toNode(n), this);
  }

  after(...nodes: Child[]) {
    const parent = this.parentNode;
    const ref = this._next;
    if (parent) for (const n of nodes) parent.insertBefore(toNode(n), ref);
  }

  replaceWith(...nodes: Child[]) {
    this.before(...nodes);
    this.remove();
  }

  get textContent(): string {
    let text = "";
    for (let n = this._first; n; n = n._next) text += n.textContent;
    return text;
  }

  set textContent(value: string) {
    while (this._first) this.removeChild(this._first);
    if (value !== "") this.appendChild(new FakeText(value));
  }

  cloneNode(deep = false): FakeNode {
    const copy = this._shallowClone();
    if (deep) {
      for (let n = this._first; n; n = n._next) {
        copy.appendChild(n.cloneNode(true));
      }
    }
    return copy;
  }

  _shallowClone(): FakeNode {
    return new FakeFragment();
  }

  addEventListener() {}

  removeEventListener() {}

  _serialize(): string {
    let html = "";
    for (let n = this._first; n; n = n._next) html += n._serialize();
    return html;
  }
}

function toNode(child: Child) {
  return typeof child === "string" ? new FakeText(child) : child;
}

function escapeText(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

class FakeCharacterData extends FakeNode {
  data: string;

  constructor(nodeType: number, nodeName: string, data: string) {
    super(nodeType, nodeName);
    this.data = data;
  }

  get nodeValue() {
    return this.data;
  }

  set nodeValue(value: string) {
    this.data = value;
  }

  override get textContent() {
    return this.data;
  }

  override set textContent(value: string) {
    this.data = value;
  }
}

class FakeText extends FakeCharacterData {
  constructor(data = "") {
    super(TEXT_NODE, "#text", data);
  }

  override _shallowClone(): FakeNode {
    return new FakeText(this.data);
  }

  override _serialize() {
    return escapeText(this.data);
  }
}

// What `innerHTML = html` leaves behind: the unparsed string, serialized
// verbatim.
class FakeRawHtml extends FakeText {
  // A browser reads the whole string to parse it, which flattens a
  // concatenated string (a JSC rope, a V8 cons string) in place. Do the
  // same, or retained-memory numbers count rope nodes no browser keeps.
  // Stored, so the JIT can't drop the (otherwise unused) search.
  _nul: number;

  constructor(html: string) {
    super(html);
    this._nul = html.indexOf("\0");
  }

  override _shallowClone(): FakeNode {
    return new FakeRawHtml(this.data);
  }

  override _serialize() {
    return this.data;
  }
}

class FakeComment extends FakeCharacterData {
  constructor(data = "") {
    super(COMMENT_NODE, "#comment", data);
  }

  override _shallowClone(): FakeNode {
    return new FakeComment(this.data);
  }

  override _serialize() {
    return `<!--${this.data}-->`;
  }
}

class FakeFragment extends FakeNode {
  constructor() {
    super(DOCUMENT_FRAGMENT_NODE, "#document-fragment");
  }
}

class FakeStyle {
  cssText = "";
  setProperty() {}
  removeProperty() {}
  getPropertyValue() {
    return "";
  }
}

class FakeElement extends FakeNode {
  localName: string;
  // biome-ignore lint/style/useNamingConvention: DOM API name
  namespaceURI: string;
  _attributes = new Map<string, string>();
  style = new FakeStyle();
  scrollTop = 0;
  scrollHeight = 0;
  clientHeight = 0;

  constructor(localName: string, namespaceUri = HTML_NAMESPACE) {
    super(ELEMENT_NODE, localName.toUpperCase());
    this.localName = localName;
    this.namespaceURI = namespaceUri;
  }

  get tagName() {
    return this.nodeName;
  }

  getAttribute(name: string) {
    return this._attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: unknown) {
    this._attributes.set(name, String(value));
  }

  removeAttribute(name: string) {
    this._attributes.delete(name);
  }

  hasAttribute(name: string) {
    return this._attributes.has(name);
  }

  toggleAttribute(name: string, force?: boolean) {
    const on = force ?? !this.hasAttribute(name);
    if (on) this.setAttribute(name, "");
    else this.removeAttribute(name);
    return on;
  }

  get className() {
    return this.getAttribute("class") ?? "";
  }

  set className(value: string) {
    this.setAttribute("class", value);
  }

  // biome-ignore lint/style/useNamingConvention: DOM API name
  get innerHTML() {
    return this._serialize();
  }

  // biome-ignore lint/style/useNamingConvention: DOM API name
  set innerHTML(html: string) {
    this.textContent = "";
    if (html !== "") this.appendChild(new FakeRawHtml(html));
  }

  // biome-ignore lint/style/useNamingConvention: DOM API name
  get outerHTML() {
    return this._serialize();
  }

  querySelector() {
    return null;
  }

  scrollIntoView() {}

  override _shallowClone(): FakeNode {
    const copy = createElement(this.localName, this.namespaceURI);
    for (const [name, value] of this._attributes)
      copy.setAttribute(name, value);
    return copy;
  }

  override _serialize() {
    let attrs = "";
    for (const [name, value] of this._attributes) {
      attrs += value === "" ? ` ${name}` : ` ${name}="${value}"`;
    }
    return `<${this.localName}${attrs}>${super._serialize()}</${this.localName}>`;
  }
}

class FakeHtmlElement extends FakeElement {}

class FakeHtmlMediaElement extends FakeHtmlElement {}

class FakeTemplateElement extends FakeHtmlElement {
  content = new FakeFragment();

  override get innerHTML() {
    return this.content._serialize();
  }

  override set innerHTML(html: string) {
    this.content.textContent = "";
    if (html !== "") this.content.appendChild(new FakeRawHtml(html));
  }
}

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

function createElement(localName: string, namespaceUri = HTML_NAMESPACE) {
  return localName === "template"
    ? new FakeTemplateElement(localName, namespaceUri)
    : new FakeHtmlElement(localName, namespaceUri);
}

class FakeDocument extends FakeNode {
  constructor() {
    super(DOCUMENT_NODE, "#document");
  }

  createElement(localName: string) {
    return createElement(localName);
  }

  // biome-ignore lint/style/useNamingConvention: DOM API name
  createElementNS(namespaceUri: string, localName: string) {
    return createElement(localName, namespaceUri);
  }

  createTextNode(data: string) {
    return new FakeText(data);
  }

  createComment(data: string) {
    return new FakeComment(data);
  }

  createDocumentFragment() {
    return new FakeFragment();
  }

  importNode(node: FakeNode, deep = false) {
    return node.cloneNode(deep);
  }
}

const fakeDocument = new FakeDocument();

interface DomState {
  // `requestAnimationFrame` callbacks wait here until `flushFrames()`.
  frames: Map<number, () => void>;
  nextFrameId: number;
  // Hook for the `createEventDispatcher` shim; see `loadComponents`.
  onDispatch?:
    | ((instance: number, type: string, detail: unknown) => void)
    | undefined;
  nextInstance: number;
}

// Installed once per process. `ostia ab` loads the base and candidate copies
// of a suite into one process, and Svelte captures `Node.prototype`'s
// getters on first mount, so both copies must share one DOM and one state.
const globals = globalThis as Record<string, unknown>;
const installed = globals.__svelteDom as DomState | undefined;
const state: DomState = installed ?? {
  frames: new Map(),
  nextFrameId: 1,
  nextInstance: 0,
};

/** Runs queued animation frames (and any they queue) until none remain. */
export function flushFrames() {
  while (state.frames.size > 0) {
    const callbacks = [...state.frames.values()];
    state.frames.clear();
    for (const callback of callbacks) callback();
  }
}

if (!installed) {
  // Pairs rather than an object literal: DOM global names don't follow the
  // lint's property naming.
  const domGlobals: [string, unknown][] = [
    ["__svelteDom", state],
    ["window", globalThis],
    ["document", fakeDocument],
    ["navigator", { userAgent: "svelte-dom" }],
    ["Node", FakeNode],
    ["CharacterData", FakeCharacterData],
    ["Text", FakeText],
    ["Comment", FakeComment],
    ["DocumentFragment", FakeFragment],
    ["Element", FakeElement],
    ["HTMLElement", FakeHtmlElement],
    ["HTMLTemplateElement", FakeTemplateElement],
    ["HTMLMediaElement", FakeHtmlMediaElement],
    [
      "requestAnimationFrame",
      (callback: () => void) => {
        const id = state.nextFrameId++;
        state.frames.set(id, callback);
        return id;
      },
    ],
    ["cancelAnimationFrame", (id: number) => state.frames.delete(id)],
  ];
  for (const [name, value] of domGlobals) globals[name] = value;
}

// Bun resolves `svelte` with its default (server) export condition, so
// point compiled components at the client entry points by file path.
const svelteDir = path.dirname(
  createRequire(import.meta.url).resolve("svelte/package.json"),
);
const svelteClient = path.join(svelteDir, "src/index-client.js");
const svelteLegacy = path.join(svelteDir, "src/legacy/legacy-client.js");

let loadCount = 0;

/**
 * Compiles `<srcDir>/<name>.svelte` for each name and imports the results.
 * Imports between the listed components (`./HighlightStream.svelte`) point
 * at each other's compiled copies.
 *
 * Every `createEventDispatcher` call in them is wrapped, so
 * `onDispatch(fn)` sees each dispatched event with the id of the component
 * instance that sent it (ids count up in creation order).
 */
export async function loadComponents<const Name extends string>(
  srcDir: string,
  names: readonly Name[],
): Promise<Record<Name, unknown>> {
  const tag = `${process.pid}-${loadCount++}`;
  const file = (name: string) => `.tmp-${name}.${tag}.client.js`;
  const shim = file("svelte-shim");
  const written = [path.join(srcDir, shim)];
  fs.writeFileSync(
    written[0] as string,
    [
      `export * from ${JSON.stringify(svelteClient)};`,
      `import { createEventDispatcher as create } from ${JSON.stringify(svelteClient)};`,
      "export function createEventDispatcher() {",
      "  const state = globalThis.__svelteDom;",
      "  const id = state.nextInstance++;",
      "  const dispatch = create();",
      "  return (type, detail, options) => {",
      "    state.onDispatch?.(id, type, detail);",
      "    return dispatch(type, detail, options);",
      "  };",
      "}",
    ].join("\n"),
  );
  for (const name of names) {
    const source = fs.readFileSync(path.join(srcDir, `${name}.svelte`), "utf8");
    let code = compile(source, {
      generate: "client",
      fragments: "tree",
      filename: `${name}.svelte`,
    }).js.code.replaceAll(' from "svelte";', ` from "./${shim}";`);
    for (const other of names) {
      code = code.replaceAll(`"./${other}.svelte"`, `"./${file(other)}"`);
    }
    const out = path.join(srcDir, file(name));
    fs.writeFileSync(out, code);
    written.push(out);
  }
  try {
    const loaded = await Promise.all(
      names.map(
        async (name) =>
          [
            name,
            (await import(pathToFileURL(path.join(srcDir, file(name))).href))
              .default,
          ] as const,
      ),
    );
    return Object.fromEntries(loaded) as Record<Name, unknown>;
  } finally {
    for (const out of written) fs.unlinkSync(out);
  }
}

/** Sees every event dispatched by a component from `loadComponents`. */
export function onDispatch(fn: DomState["onDispatch"]) {
  state.onDispatch = fn;
}

/** The id `onDispatch` will report for the next component instance. */
export function nextInstanceId() {
  return state.nextInstance;
}

export interface Mounted {
  target: FakeElement;
  /** Updates props, then flushes effects and queued animation frames. */
  set(props: Record<string, unknown>): void;
  destroy(): void;
}

const { createClassComponent } = (await import(svelteLegacy)) as {
  createClassComponent(options: unknown): {
    $set(props: Record<string, unknown>): void;
    $destroy(): void;
  };
};
const { flushSync } = (await import(svelteClient)) as {
  flushSync(): void;
};

/** Flushes pending effects and animation frames until both are idle. */
export function flush() {
  flushSync();
  flushFrames();
  flushSync();
}

/** Mounts a component from `loadComponents` with Svelte 4-style `$set`. */
export function mountComponent(
  component: unknown,
  props: Record<string, unknown> = {},
): Mounted {
  const target = createElement("div");
  const instance = createClassComponent({ component, target, props });
  flush();
  return {
    target,
    set(next) {
      instance.$set(next);
      flush();
    },
    destroy() {
      instance.$destroy();
    },
  };
}
