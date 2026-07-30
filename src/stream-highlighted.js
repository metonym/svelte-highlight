/**
 * Append-only buffer for completed (line-finalized) stream HTML.
 *
 * Appending newly completed line HTML is O(n) over the whole stream. Callers
 * still assemble `highlighted = completed + preview` each repaint so the
 * `highlight` event stays live mid-line; that assembly copies the completed
 * string but does not rebuild it from sealed DOM chunks.
 */

/**
 * @returns {{
 *   appendLines: (lines: string[]) => void,
 *   reset: () => void,
 *   toString: () => string,
 *   lineCount: number,
 * }}
 */
export function createCompletedHtmlBuffer() {
  let html = "";
  let lineCount = 0;
  return {
    /** @param {string[]} lines */
    appendLines(lines) {
      for (let i = 0; i < lines.length; i++) {
        if (lineCount > 0) html += "\n";
        html += lines[i];
        lineCount++;
      }
    },
    reset() {
      html = "";
      lineCount = 0;
    },
    toString() {
      return html;
    },
    get lineCount() {
      return lineCount;
    },
  };
}
