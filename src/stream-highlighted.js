/** Append-only buffer of completed stream lines' HTML, joined by "\n". */

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
     * Keeps the first `lines` lines; cost scales with the lines dropped.
     * @param {number} lines
     */
    truncate(lines) {
      if (lines >= lineCount) return;
      let end = html.length;
      for (let n = lineCount; n > lines; n--) {
        end = html.lastIndexOf("\n", end - 1);
      }
      // `end` is -1 when `lines === 0` (the first line has no leading "\n").
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
