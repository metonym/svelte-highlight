// A Svelte custom renderer for opentui (https://opentui.com).
//
// Svelte renders into a light tree of plain objects. After each change,
// `mountOpentui` rebuilds the matching opentui renderables from it:
//
//   <box ...>   a BoxRenderable, with the attributes as its options
//   <text ...>  a TextRenderable, one row of styled text
//   <span ...>  a styled run inside <text>: fg, bg, bold, italic,
//               underline, strikethrough
//
// Rebuilding is simple and fine for a code view. A full binding would
// update renderables in place instead.

import {
  BoxRenderable,
  TextAttributes,
  TextNodeRenderable,
  TextRenderable,
} from "@opentui/core";
import { mount, unmount } from "svelte";
import { createRenderer } from "svelte/renderer";

let scheduleSync = () => {};

const node = (type, extra) => ({ type, parent: null, ...extra });

function remove(n) {
  if (!n.parent) return;
  n.parent.children.splice(n.parent.children.indexOf(n), 1);
  n.parent = null;
  scheduleSync();
}

const renderer = createRenderer({
  createFragment: () => node("fragment", { children: [] }),
  createElement: (name) => node("element", { name, attributes: {}, children: [] }),
  createText: (data) => node("text", { data }),
  createComment: (data) => node("comment", { data }),
  getNodeType: (n) => n.type,
  getText: (n) => n.data,
  setText(n, text) {
    n.data = text;
    scheduleSync();
  },
  getAttribute: (el, name) => el.attributes[name] ?? null,
  setAttribute(el, name, value) {
    el.attributes[name] = value;
    scheduleSync();
  },
  removeAttribute(el, name) {
    delete el.attributes[name];
    scheduleSync();
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
    scheduleSync();
  },
  remove,
  addEventListener() {},
  removeEventListener() {},
});

export default renderer;

const FLAGS = {
  bold: TextAttributes.BOLD,
  italic: TextAttributes.ITALIC,
  underline: TextAttributes.UNDERLINE,
  strikethrough: TextAttributes.STRIKETHROUGH,
};

/** opentui's bit flags for a `<span>`'s boolean attributes. */
function attributesOf(attrs) {
  let bits = 0;
  for (const [name, bit] of Object.entries(FLAGS)) if (attrs[name]) bits |= bit;
  return bits;
}

/** Text and `<span>` children as opentui text nodes. */
function addTextChildren(parent, children) {
  for (const child of children) {
    if (child.type === "text" && child.data) parent.add(child.data);
    else if (child.type === "element" && child.name === "span") {
      const { fg, bg } = child.attributes;
      const span = new TextNodeRenderable({
        ...(fg && { fg }),
        ...(bg && { bg }),
        attributes: attributesOf(child.attributes),
      });
      addTextChildren(span, child.children);
      parent.add(span);
    }
  }
}

/** Builds the renderables for `n`'s children under `parent`. */
function build(ctx, parent, n) {
  for (const child of n.children ?? []) {
    if (child.type !== "element") continue;
    if (child.name === "box") {
      const box = new BoxRenderable(ctx, { ...child.attributes });
      build(ctx, box, child);
      parent.add(box);
    } else if (child.name === "text") {
      const text = new TextRenderable(ctx, { ...child.attributes });
      addTextChildren(text, child.children);
      parent.add(text);
    }
  }
}

/**
 * Mounts `Component` into `cli`, an opentui `CliRenderer`, and keeps its
 * renderables in step with the component.
 */
export function mountOpentui(Component, cli, props = {}) {
  const tree = renderer.createFragment();
  const container = new BoxRenderable(cli, { flexDirection: "column", flexGrow: 1 });
  cli.root.add(container);

  let pending = false;
  function sync() {
    pending = false;
    for (const child of container.getChildren()) {
      container.remove(child);
      child.destroyRecursively?.();
    }
    build(cli, container, tree);
    cli.requestRender();
  }
  scheduleSync = () => {
    if (pending) return;
    pending = true;
    queueMicrotask(sync);
  };

  const app = mount(Component, { target: tree, renderer, props });
  sync();
  return {
    app,
    destroy() {
      unmount(app);
      cli.root.remove(container);
    },
  };
}
