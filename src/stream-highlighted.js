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
 *   truncate: (lines: number) => void,
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
    /**
     * Keeps the first `lines` lines. Walks back from the end, so the cost
     * scales with the lines dropped, not the lines kept.
     * @param {number} lines
     */
    truncate(lines) {
      if (lines >= lineCount) return;
      let end = html.length;
      for (let n = lineCount; n > lines; n--) {
        end = html.lastIndexOf("\n", end - 1);
      }
      // With `lines === 0`, the walk passes the first line, which has no
      // "\n" before it, and `end` is -1.
      html = lines === 0 ? "" : html.slice(0, end);
      lineCount = lines;
    },
    toString() {
      return html;
    },
    get lineCount() {
      return lineCount;
    },
  };
}
