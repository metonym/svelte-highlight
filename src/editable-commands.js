/**
 * Editing commands for HighlightEditable, as pure functions from code and
 * selection to the next code and selection. Framework-free and DOM-free.
 */

/**
 * @typedef {{ start: number, end: number }} SelectionRange
 * @typedef {{ code: string, selection: SelectionRange }} Edit
 */

/**
 * Replaces the selection with `text` and puts the caret after it.
 * @param {string} code
 * @param {SelectionRange} selection
 * @param {string} text
 * @returns {Edit}
 */
export function replaceSelection(code, selection, text) {
  const caret = selection.start + text.length;
  return {
    code: code.slice(0, selection.start) + text + code.slice(selection.end),
    selection: { start: caret, end: caret },
  };
}

/**
 * Indents or outdents every line the selection touches by `tabSize` spaces.
 * Indent skips blank lines. Null when nothing changes.
 * @param {string} code
 * @param {SelectionRange} selection
 * @param {number} tabSize
 * @param {boolean} outdent
 * @returns {Edit | null}
 */
export function shiftLines(code, selection, tabSize, outdent) {
  const indentUnit = " ".repeat(tabSize);
  const blockStart = code.lastIndexOf("\n", selection.start - 1) + 1;
  const lines = code.slice(blockStart, selection.end).split("\n");

  let firstDelta = 0;
  let totalDelta = 0;
  const next = lines
    .map((line, index) => {
      if (outdent) {
        const leading = line.length - line.trimStart().length;
        const remove = Math.min(tabSize, leading);
        if (index === 0) firstDelta = -remove;
        totalDelta -= remove;
        return line.slice(remove);
      }
      if (line.length === 0) return line;
      if (index === 0) firstDelta = tabSize;
      totalDelta += tabSize;
      return indentUnit + line;
    })
    .join("\n");

  if (totalDelta === 0) return null;
  return {
    code: code.slice(0, blockStart) + next + code.slice(selection.end),
    selection: {
      start: Math.max(blockStart, selection.start + firstDelta),
      end: selection.end + totalDelta,
    },
  };
}

/**
 * Tab: indents every selected line when the selection spans lines, else
 * replaces the selection with `tabSize` spaces.
 * @param {string} code
 * @param {SelectionRange} selection
 * @param {number} tabSize
 * @returns {Edit | null}
 */
export function indentSelection(code, selection, tabSize) {
  if (code.slice(selection.start, selection.end).includes("\n")) {
    return shiftLines(code, selection, tabSize, false);
  }
  return replaceSelection(code, selection, " ".repeat(tabSize));
}
