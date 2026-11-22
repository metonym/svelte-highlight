// A small Svelte custom renderer for terminals. Components build a tree of
// `<line>` and `<text>` elements, and `draw` prints it with true-color
// escapes through svelte-highlight's `toAnsi`.

import { createRenderer } from "svelte/renderer";
import { toAnsi } from "svelte-highlight/styled-tokens";

const node = (type, extra) => ({ type, parent: null, ...extra });

const renderer = createRenderer({
  createFragment: () => node("fragment", { children: [] }),
  createElement: (name) => node("element", { name, attributes: {}, children: [] }),
  createText: (data) => node("text", { data }),
  createComment: (data) => node("comment", { data }),
  getNodeType: (n) => n.type,
  getText: (n) => n.data,
  setText(n, text) {
    n.data = text;
  },
  getAttribute: (el, name) => el.attributes[name] ?? null,
  setAttribute(el, name, value) {
    el.attributes[name] = value;
  },
  removeAttribute(el, name) {
    delete el.attributes[name];
  },
  hasAttribute: (el, name) => name in el.attributes,
  getFirstChild: (n) => n.children[0] ?? null,
  getLastChild: (n) => n.children.at(-1) ?? null,
  getNextSibling(n) {
    const siblings = n.parent?.children ?? [];
    return siblings[siblings.indexOf(n) + 1] ?? null;
  },
  getParent: (n) => n.parent,
  insert(parent, n, anchor) {
    const nodes = n.type === "fragment" ? n.children.splice(0) : [n];
    for (const child of nodes) remove(child);
    const index = anchor ? parent.children.indexOf(anchor) : parent.children.length;
    parent.children.splice(index, 0, ...nodes);
    for (const child of nodes) child.parent = parent;
  },
  remove,
  addEventListener() {},
  removeEventListener() {},
});

function remove(n) {
  if (!n.parent) return;
  n.parent.children.splice(n.parent.children.indexOf(n), 1);
  n.parent = null;
}

export default renderer;

/** The text inside `n`, ignoring Svelte's comment markers. */
function textOf(n) {
  if (n.type === "text") return n.data;
  if (n.type === "comment") return "";
  return n.children.map(textOf).join("");
}

/** Every `<line>` under `n`, in order. */
function linesOf(n) {
  if (n.type === "element" && n.name === "line") return [n];
  return (n.children ?? []).flatMap(linesOf);
}

/**
 * Prints the tree under `root`: one row per `<line>`, and each `<text>`
 * styled by its `fg`, `bg`, `bold`, `italic` and `underline` attributes.
 */
export function draw(root, { background } = {}) {
  const lines = linesOf(root).map((line) =>
    line.children
      .filter((child) => child.type === "element" && child.name === "text")
      .map((text) => ({
        text: textOf(text),
        scopes: [],
        color: text.attributes.fg,
        background: text.attributes.bg,
        bold: text.attributes.bold || undefined,
        italic: text.attributes.italic || undefined,
        underline: text.attributes.underline || undefined,
      })),
  );
  return toAnsi({ lines, background }, { background: background !== undefined });
}
