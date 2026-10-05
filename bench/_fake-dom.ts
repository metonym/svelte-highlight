/**
 * A minimal fake DOM for driving editable-line-dom.js outside a browser:
 * just the node tree, text, and a SHOW_TEXT TreeWalker, plus counters for
 * the writes that matter (`innerHTML`/`textContent` assignments, inserts,
 * removals). `innerHTML` is not parsed into elements: it becomes one text
 * node holding the markup's text, which is all the line math reads.
 */

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
};

export type DomCounters = {
  contentWrites: number;
  inserts: number;
  removals: number;
};

// Children are a doubly linked list, as in a real DOM, so sibling steps,
// inserts, and removals are O(1) and the timings reflect the code under
// test rather than the fake.
class FakeNode {
  parentNode: FakeElement | null = null;
  nextSibling: FakeNode | null = null;
  previousSibling: FakeNode | null = null;
  constructor(
    readonly ownerDocument: FakeDocument,
    readonly nodeType: number,
  ) {}

  get textContent(): string {
    return "";
  }

  remove() {
    this.parentNode?.removeChild(this);
  }
}

class FakeText extends FakeNode {
  constructor(
    ownerDocument: FakeDocument,
    public data: string,
  ) {
    super(ownerDocument, 3);
  }

  override get textContent() {
    return this.data;
  }
}

class FakeElement extends FakeNode {
  firstChild: FakeNode | null = null;
  lastChild: FakeNode | null = null;
  /** Only `length` is read; a full NodeList isn't needed. */
  childNodes = { length: 0 };
  constructor(ownerDocument: FakeDocument) {
    super(ownerDocument, 1);
  }

  override get textContent(): string {
    let text = "";
    for (let n = this.firstChild; n; n = n.nextSibling) text += n.textContent;
    return text;
  }

  override set textContent(text: string) {
    this.ownerDocument.counters.contentWrites++;
    this.replaceText(text);
  }

  // biome-ignore lint/style/useNamingConvention: the DOM property it fakes
  set innerHTML(html: string) {
    this.ownerDocument.counters.contentWrites++;
    this.replaceText(
      html
        .replace(/<[^>]*>/g, "")
        .replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (e) => ENTITIES[e] ?? e),
    );
  }

  private replaceText(text: string) {
    for (let n = this.firstChild; n; n = n.nextSibling) n.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.childNodes.length = 0;
    if (text !== "") this.link(new FakeText(this.ownerDocument, text), null);
  }

  appendChild<T extends FakeNode>(node: T): T {
    return this.insertBefore(node, null);
  }

  insertBefore<T extends FakeNode>(node: T, ref: FakeNode | null): T {
    this.ownerDocument.counters.inserts++;
    node.parentNode?.unlink(node);
    this.link(node, ref);
    return node;
  }

  removeChild<T extends FakeNode>(node: T): T {
    this.ownerDocument.counters.removals++;
    this.unlink(node);
    return node;
  }

  private link(node: FakeNode, ref: FakeNode | null) {
    const prev = ref ? ref.previousSibling : this.lastChild;
    node.parentNode = this;
    node.previousSibling = prev;
    node.nextSibling = ref;
    if (prev) prev.nextSibling = node;
    else this.firstChild = node;
    if (ref) ref.previousSibling = node;
    else this.lastChild = node;
    this.childNodes.length++;
  }

  unlink(node: FakeNode) {
    const { previousSibling: prev, nextSibling: next } = node;
    if (prev) prev.nextSibling = next;
    else this.firstChild = next;
    if (next) next.previousSibling = prev;
    else this.lastChild = prev;
    node.parentNode = null;
    node.previousSibling = null;
    node.nextSibling = null;
    this.childNodes.length--;
  }
}

/** Pre-order walk over the text nodes under `root`, like a SHOW_TEXT TreeWalker. */
class FakeTreeWalker {
  currentNode: FakeNode;
  constructor(readonly root: FakeNode) {
    this.currentNode = root;
  }

  nextNode(): FakeNode | null {
    let node: FakeNode | null = this.currentNode;
    for (;;) {
      node = this.following(node);
      if (!node) return null;
      if (node.nodeType === 3) {
        this.currentNode = node;
        return node;
      }
    }
  }

  private following(node: FakeNode): FakeNode | null {
    if (node instanceof FakeElement && node.firstChild) return node.firstChild;
    for (
      let n: FakeNode | null = node;
      n && n !== this.root;
      n = n.parentNode
    ) {
      if (n.nextSibling) return n.nextSibling;
    }
    return null;
  }
}

class FakeDocument {
  counters: DomCounters = { contentWrites: 0, inserts: 0, removals: 0 };

  createElement(_tag: string) {
    return new FakeElement(this);
  }

  createTextNode(text: string) {
    return new FakeText(this, text);
  }

  createTreeWalker(root: FakeNode) {
    return new FakeTreeWalker(root);
  }
}

/** An editor root plus its document's write counters. */
export function createFakeEditor() {
  const doc = new FakeDocument();
  return {
    editor: doc.createElement("code") as unknown as HTMLElement,
    counters: doc.counters,
  };
}
