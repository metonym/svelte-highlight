/**
 * Line-element DOM helpers for HighlightEditable, kept out of the component
 * so they can be benchmarked and unit-tested against a fake DOM (see
 * line-dom.bench.ts).
 *
 * The editor holds one `<span>` per line, joined by literal "\n" text nodes
 * so caret offset math stays identical to a flat paint.
 */

/** `NodeFilter.SHOW_TEXT`, inlined so this module loads outside a browser. */
const SHOW_TEXT = 4;

/**
 * The editor's line elements and what they currently show.
 * @typedef {{
 *   lineEls: HTMLElement[],
 *   lineLengths: number[],
 *   renderedLines: string[],
 * }} LineView
 */

/**
 * Callbacks for state kept per line outside the view (the css-highlights
 * engine's Highlight ranges): `onReset` after a full rebuild, `onSplice`
 * after lines `[index, index + removed)` were replaced by `inserted` new
 * line elements.
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
 * Character offset (in the editor's flat text) where line `index` starts.
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
 * `array.splice(index, removed, ...items)`, without spreading a huge `items`
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
 * Patches `editor` to match `lines`. Only lines whose content actually
 * changed touch the DOM (assigned via `setContent`: innerHTML for the "dom"
 * engine, textContent for "css-highlights"). Returns the index of the
 * single changed line when nothing else shifted (used to scope caret
 * restoration), or null.
 *
 * Lines are matched from both ends, not by index: the common leading and
 * trailing runs keep their elements, and only the middle is rewritten,
 * inserted, or removed. Enter or Backspace across a line break mid-document
 * then writes one line and inserts or removes one, instead of rewriting
 * every line below the edit: see line-dom.bench.ts.
 * @param {HTMLElement} editor
 * @param {LineView} view
 * @param {string[]} lines
 * @param {(el: HTMLElement, line: string) => void} setContent
 * @param {LineHooks} hooks
 * @returns {number | null}
 */
export function renderLines(editor, view, lines, setContent, hooks) {
  const doc = /** @type {Document} */ (editor.ownerDocument);
  // Some browsers can place a native selection boundary just outside a
  // line's <span> (e.g. Firefox collapsing a select-all there); typing at
  // that point inserts a stray sibling text node our diffing never touches.
  // Detect the drift by child count and self-heal with a full rebuild.
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

  // `patchLineHtml` reuses unchanged lines' strings, so most of these
  // compares end at a pointer check.
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

  // Lines present on both sides of the middle reuse their element.
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
    // Insert the extra lines before the first trailing line, or append.
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
 * `nodeAtOffset(editor, offset)` for an editor painted by `renderLines`,
 * without walking every text node before the caret's line.
 *
 * Every text node before the separator that precedes line `k` ends at or
 * before that line's start minus one, so for the last line `k` starting at
 * or before `offset`, none of them can match: the walk can start at that
 * separator with the count it would have reached there. The line is found
 * from `lineLengths` (integer adds) instead of the DOM: see
 * line-dom.bench.ts's Enter group.
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
  for (let node = /** @type {Node | null} */ (separator); node; ) {
    const next = count + /** @type {string} */ (node.textContent).length;
    if (offset <= next) return { node, offset: offset - count };
    count = next;
    node = walker.nextNode();
  }
  return null;
}
