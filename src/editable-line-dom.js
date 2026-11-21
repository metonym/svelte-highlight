/**
 * Line-element DOM helpers for HighlightEditable. The editor holds one
 * `<span>` per line, joined by literal "\n" text nodes.
 */

/** `NodeFilter.SHOW_TEXT`, inlined so this module loads outside a browser. */
const SHOW_TEXT = 4;

/** `Node.TEXT_NODE` and `Node.ELEMENT_NODE`, inlined for the same reason. */
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

/**
 * @typedef {{
 *   lineEls: HTMLElement[],
 *   lineLengths: number[],
 *   renderedLines: string[],
 * }} LineView
 */

/**
 * Keeps per-line state outside the view in sync: `onReset` after a full
 * rebuild, `onSplice` after lines `[index, index + removed)` were replaced by
 * `inserted` new ones.
 * @typedef {{
 *   onReset: () => void,
 *   onSplice: (index: number, removed: number, inserted: number) => void,
 * }} LineHooks
 */

/** @returns {LineView} */
export function createLineView() {
  return { lineEls: [], lineLengths: [], renderedLines: [] };
}

/**
 * @param {LineView} view
 * @param {number} index
 */
export function lineStartOffset(view, index) {
  let start = index; // one "\n" separator per preceding line
  for (let i = 0; i < index; i++)
    start += /** @type {number} */ (view.lineLengths[i]);
  return start;
}

/**
 * `array.splice(index, removed, ...items)` without spreading a huge `items`
 * (a large paste) into call arguments.
 * @template T
 * @param {T[]} array
 * @param {number} index
 * @param {number} removed
 * @param {T[]} items
 * @returns {T[]}
 */
function spliceIn(array, index, removed, items) {
  if (items.length <= 1024) {
    array.splice(index, removed, ...items);
    return array;
  }
  return array.slice(0, index).concat(items, array.slice(index + removed));
}

/**
 * Patches `editor` to match `lines`, touching only changed lines. Lines are
 * matched from both ends so Enter/Backspace mid-document doesn't rewrite
 * every line below. Returns the index of the single changed line when
 * nothing else shifted, or null.
 * @param {HTMLElement} editor
 * @param {LineView} view
 * @param {string[]} lines
 * @param {(el: HTMLElement, line: string) => void} setContent
 * @param {LineHooks} hooks
 * @returns {number | null}
 */
export function renderLines(editor, view, lines, setContent, hooks) {
  const doc = /** @type {Document} */ (editor.ownerDocument);
  // Typing at a selection boundary outside a line's <span> (e.g. Firefox
  // after select-all) adds a stray text node: rebuild when the count drifts.
  const expectedChildren =
    view.lineEls.length === 0 ? 0 : view.lineEls.length * 2 - 1;
  if (editor.childNodes.length !== expectedChildren) {
    editor.textContent = "";
    view.lineEls = [];
    view.lineLengths = [];
    view.renderedLines = [];
    hooks.onReset();
  }

  const { lineEls, lineLengths, renderedLines } = view;
  const prevLen = lineEls.length;
  const newLen = lines.length;
  const shared = Math.min(prevLen, newLen);

  // Unchanged lines are usually the same string objects: pointer compares.
  let head = 0;
  while (head < shared && renderedLines[head] === lines[head]) head++;
  let tail = 0;
  while (
    tail < shared - head &&
    renderedLines[prevLen - 1 - tail] === lines[newLen - 1 - tail]
  ) {
    tail++;
  }
  const prevEnd = prevLen - tail;
  const newEnd = newLen - tail;
  const pairedEnd = Math.min(prevEnd, newEnd);

  let changedIndex = null;
  let changedCount = 0;
  for (let i = head; i < pairedEnd; i++) {
    if (renderedLines[i] === lines[i]) continue;
    const el = /** @type {HTMLElement} */ (lineEls[i]);
    setContent(el, /** @type {string} */ (lines[i]));
    lineLengths[i] = /** @type {string} */ (el.textContent).length;
    changedIndex = i;
    changedCount++;
  }

  if (newEnd > pairedEnd) {
    const before = pairedEnd < prevLen ? lineEls[pairedEnd] : null;
    /** @type {HTMLElement[]} */
    const spans = [];
    /** @type {number[]} */
    const lengths = [];
    for (let i = pairedEnd; i < newEnd; i++) {
      const span = doc.createElement("span");
      setContent(span, /** @type {string} */ (lines[i]));
      if (before) {
        editor.insertBefore(span, before);
        editor.insertBefore(doc.createTextNode("\n"), before);
      } else {
        if (i > 0) editor.appendChild(doc.createTextNode("\n"));
        editor.appendChild(span);
      }
      spans.push(span);
      lengths.push(/** @type {string} */ (span.textContent).length);
    }
    view.lineEls = spliceIn(lineEls, pairedEnd, 0, spans);
    view.lineLengths = spliceIn(lineLengths, pairedEnd, 0, lengths);
    hooks.onSplice(pairedEnd, 0, spans.length);
  } else if (prevEnd > pairedEnd) {
    // Drop the surplus lines, each with one adjacent separator: the one
    // after it, or before it for the last line.
    for (let i = pairedEnd; i < prevEnd; i++) {
      const el = /** @type {HTMLElement} */ (lineEls[i]);
      const separator = el.nextSibling ?? el.previousSibling;
      editor.removeChild(el);
      if (separator) editor.removeChild(separator);
    }
    lineEls.splice(pairedEnd, prevEnd - pairedEnd);
    lineLengths.splice(pairedEnd, prevEnd - pairedEnd);
    hooks.onSplice(pairedEnd, prevEnd - pairedEnd, 0);
  }

  view.renderedLines = lines;
  return prevLen === newLen && changedCount === 1 ? changedIndex : null;
}

/**
 * The text node and offset within it at character `offset` of `root`'s
 * text, or null past the end.
 * @param {Node} root
 * @param {number} offset
 * @returns {{ node: Node, offset: number } | null}
 */
export function nodeAtOffset(root, offset) {
  const doc = /** @type {Document} */ (root.ownerDocument);
  const walker = doc.createTreeWalker(root, SHOW_TEXT, null);
  let count = 0;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const next = count + /** @type {string} */ (node.textContent).length;
    if (offset <= next) return { node, offset: offset - count };
    count = next;
  }
  return null;
}

/**
 * `nodeAtOffset(editor, offset)` for an editor painted by `renderLines`:
 * finds the line from `lineLengths`, then walks from the separator before it
 * instead of from the first text node.
 * @param {HTMLElement} editor
 * @param {LineView} view
 * @param {number} offset
 * @returns {{ node: Node, offset: number } | null}
 */
export function editorNodeAtOffset(editor, view, offset) {
  const { lineEls, lineLengths } = view;
  if (editor.childNodes.length !== lineEls.length * 2 - 1) {
    return nodeAtOffset(editor, offset);
  }

  let line = 0;
  let lineStart = 0;
  while (line + 1 < lineEls.length) {
    const next = lineStart + /** @type {number} */ (lineLengths[line]) + 1;
    if (next > offset) break;
    lineStart = next;
    line++;
  }
  if (line === 0) return nodeAtOffset(editor, offset);

  const separator = /** @type {HTMLElement} */ (lineEls[line]).previousSibling;
  if (separator?.nodeType !== 3) {
    return nodeAtOffset(editor, offset);
  }
  const doc = /** @type {Document} */ (editor.ownerDocument);
  const walker = doc.createTreeWalker(editor, SHOW_TEXT, null);
  walker.currentNode = separator;
  let count = lineStart - 1;
  for (let node = /** @type {Node | null} */ (separator); node;) {
    const next = count + /** @type {string} */ (node.textContent).length;
    if (offset <= next) return { node, offset: offset - count };
    count = next;
    node = walker.nextNode();
  }
  return null;
}

/**
 * @param {Node} el
 * @param {number} count
 */
function sumChildLengths(el, count) {
  let total = 0;
  for (let i = 0; i < count && i < el.childNodes.length; i++) {
    const child = /** @type {Node} */ (el.childNodes[i]);
    total += /** @type {string} */ (child.textContent).length;
  }
  return total;
}

/**
 * Character offset of a Selection boundary, derived from the line structure
 * instead of serializing the document. Null when the DOM has drifted from
 * `view`, so the caller falls back to cloneRange/toString.
 * @param {HTMLElement} editor
 * @param {LineView} view
 * @param {Node} container
 * @param {number} offsetInContainer
 * @returns {number | null}
 */
export function offsetOfBoundary(editor, view, container, offsetInContainer) {
  const { lineEls, lineLengths } = view;
  const expectedChildren = lineEls.length === 0 ? 0 : lineEls.length * 2 - 1;
  if (editor.childNodes.length !== expectedChildren) return null;

  if (container === editor) {
    if (lineEls.length === 0) return offsetInContainer === 0 ? 0 : null;
    const lineIndex = offsetInContainer >> 1;
    if (lineIndex >= lineEls.length) return null;
    return offsetInContainer % 2 === 0
      ? lineStartOffset(view, lineIndex)
      : lineStartOffset(view, lineIndex) +
          /** @type {number} */ (lineLengths[lineIndex]);
  }

  let node = container;
  while (node.parentNode !== editor) {
    if (!node.parentNode) return null;
    node = node.parentNode;
  }

  let childIndex = 0;
  for (let sib = node.previousSibling; sib; sib = sib.previousSibling) {
    childIndex++;
  }
  const lineIndex = childIndex >> 1;

  if (childIndex % 2 === 1) {
    // A "\n" separator has no children, so it must be `container` itself.
    if (container !== node || lineIndex >= lineLengths.length) return null;
    return (
      lineStartOffset(view, lineIndex) +
      /** @type {number} */ (lineLengths[lineIndex]) +
      offsetInContainer
    );
  }

  if (lineIndex >= lineEls.length || lineEls[lineIndex] !== node) return null;

  let charOffset =
    container.nodeType === TEXT_NODE
      ? offsetInContainer
      : sumChildLengths(container, offsetInContainer);
  let n = container;
  while (n !== node) {
    for (let sib = n.previousSibling; sib; sib = sib.previousSibling) {
      charOffset += /** @type {string} */ (sib.textContent).length;
    }
    if (!n.parentNode) return null;
    n = n.parentNode;
  }
  return lineStartOffset(view, lineIndex) + charOffset;
}

/**
 * The editor's selection as character offsets, or null when it lies outside
 * `editor`.
 * @param {HTMLElement} editor
 * @param {LineView} view
 * @param {Selection | null} selection
 * @returns {{ start: number, end: number } | null}
 */
export function readSelection(editor, view, selection) {
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return null;
  const start = offsetOfBoundary(
    editor,
    view,
    range.startContainer,
    range.startOffset,
  );
  const end = offsetOfBoundary(
    editor,
    view,
    range.endContainer,
    range.endOffset,
  );
  if (start != null && end != null) return { start, end };
  const pre = range.cloneRange();
  pre.selectNodeContents(editor);
  pre.setEnd(range.startContainer, range.startOffset);
  const fallbackStart = pre.toString().length;
  return { start: fallbackStart, end: fallbackStart + range.toString().length };
}

/**
 * Firefox: a boundary at a text node's edge breaks its native undo after a
 * repaint, so anchor edges via setStartBefore/After. A boundary at a
 * separator's end goes inside the next line's `<span>`, else Firefox types
 * into a stray text node (forcing a full rebuild).
 * @param {HTMLElement} editor
 * @param {Range} range
 * @param {"Start" | "End"} side
 * @param {Node} node
 * @param {number} offset
 */
function setRangeBoundary(editor, range, side, node, offset) {
  const length = /** @type {string} */ (node.textContent).length;
  const nextLine = node.nextSibling;
  if (
    node.parentNode === editor &&
    offset === length &&
    nextLine?.nodeType === ELEMENT_NODE
  ) {
    range[side === "Start" ? "setStart" : "setEnd"](nextLine, 0);
  } else if (offset === 0) range[`set${side}Before`](node);
  else if (offset === length) range[`set${side}After`](node);
  else range[side === "Start" ? "setStart" : "setEnd"](node, offset);
}

/**
 * Selects characters `[start, end)` of `root`, or puts the caret at `start`
 * when `end` is null or equal. `root` defaults to the editor; pass another
 * element (such as a cloned preview) to select inside it.
 * @param {HTMLElement} editor
 * @param {LineView} view
 * @param {Selection | null} selection
 * @param {number} start
 * @param {number | null} [end]
 * @param {Node} [root]
 */
export function writeSelection(
  editor,
  view,
  selection,
  start,
  end,
  root = editor,
) {
  if (!selection) return;
  /** @param {number} offset */
  const locate = (offset) =>
    root === editor
      ? editorNodeAtOffset(editor, view, offset)
      : nodeAtOffset(root, offset);
  const from = locate(start);
  if (!from) return;
  const doc = /** @type {Document} */ (editor.ownerDocument);
  const range = doc.createRange();
  setRangeBoundary(editor, range, "Start", from.node, from.offset);
  const to = end != null && end !== start ? locate(end) : null;
  if (to) setRangeBoundary(editor, range, "End", to.node, to.offset);
  else range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}
