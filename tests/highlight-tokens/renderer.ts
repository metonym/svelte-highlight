// The render-to-objects renderer from Svelte's custom renderer docs, plus
// `serialize` to read the tree back.

import { createRenderer } from "svelte/renderer";
import type { Renderer } from "svelte/renderer";

type Parent = { children: Node[] };
type Fragment = Parent & { type: "fragment"; parent: null };
type Element = Parent & {
  type: "element";
  name: string;
  attributes: Record<string, unknown>;
  listeners: Record<string, Set<(...args: unknown[]) => void>>;
  parent: Element | Fragment | null;
};
type Text = { type: "text"; data: string; parent: Element | Fragment | null };
type Comment = {
  type: "comment";
  data: string;
  parent: Element | Fragment | null;
};
type Node = Fragment | Element | Text | Comment;

export type Serialized =
  string | [string, Record<string, unknown>, ...Serialized[]];

type Nodes = {
  fragment: Fragment;
  element: Element;
  text: Text;
  comment: Comment;
};

const renderer: Renderer<Nodes> = createRenderer<Nodes>({
  createFragment: () => ({ type: "fragment", children: [], parent: null }),
  createElement: (name) => ({
    type: "element",
    name,
    attributes: {},
    listeners: {},
    children: [],
    parent: null,
  }),
  createText: (data) => ({ type: "text", data, parent: null }),
  createComment: (data) => ({ type: "comment", data, parent: null }),
  getNodeType: (node) => node.type,
  getText: (node) => node.data,
  setText(node, text) {
    node.data = text;
  },
  getAttribute: (element, name) =>
    (element.attributes[name] as string | undefined) ?? null,
  setAttribute(element, name, value) {
    element.attributes[name] = value;
  },
  removeAttribute(element, name) {
    element.attributes[name] = undefined;
  },
  hasAttribute: (element, name) => element.attributes[name] !== undefined,
  getFirstChild: (node) => node.children[0] ?? null,
  getLastChild: (node) => node.children.at(-1) ?? null,
  getNextSibling(node) {
    const siblings: Node[] = node.parent?.children ?? [];
    return siblings[siblings.indexOf(node) + 1] ?? null;
  },
  getParent: (node) => node.parent,
  insert(parent, node, anchor) {
    const nodes = node.type === "fragment" ? node.children.splice(0) : [node];
    for (const child of nodes) remove(child);
    const index = anchor
      ? parent.children.indexOf(anchor)
      : parent.children.length;
    parent.children.splice(index, 0, ...nodes);
    for (const child of nodes) {
      if (child.type !== "fragment") child.parent = parent;
    }
  },
  remove,
  addEventListener(element, type, handler) {
    (element.listeners[type] ??= new Set()).add(handler);
  },
  removeEventListener(element, type, handler) {
    element.listeners[type]?.delete(handler);
  },
});

function remove(node: Node) {
  if (node.type !== "fragment" && node.parent) {
    const siblings = node.parent.children;
    siblings.splice(siblings.indexOf(node), 1);
    node.parent = null;
  }
}

export default renderer;

/**
 * Elements as `[name, attributes, ...children]` and text as strings, with
 * Svelte's block markers (comments, empty text) and unset attributes left
 * out.
 */
export function serialize(node: Fragment): Serialized[];
export function serialize(node: Node): Serialized;
export function serialize(node: Node): Serialized | Serialized[] {
  if (node.type === "text" || node.type === "comment") return node.data;
  const children = node.children
    .filter((child) => child.type !== "comment")
    .map((child) => serialize(child))
    .filter((child) => child !== "");
  if (node.type === "fragment") return children;
  const attributes = Object.fromEntries(
    Object.entries(node.attributes).filter(([, v]) => v !== undefined),
  );
  return [node.name, attributes, ...children];
}
