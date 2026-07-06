/**
 * Splits highlight.js output HTML into lines without corrupting `<span>`
 * elements that wrap a line break (block comments, template literals).
 * Open spans are closed at the end of a line and the same stack is
 * reopened, in order, at the start of the next line -- the strategy
 * Prism and Shiki use for line-level transforms.
 * @param {string} html
 * @returns {string[]}
 */
export function splitLines(html) {
  const lines = [];
  /** @type {string[]} */
  const stack = [];
  let current = "";
  let i = 0;

  while (i < html.length) {
    const char = html[i];

    if (char === "<") {
      const tagEnd = html.indexOf(">", i);
      const tag = html.slice(i, tagEnd + 1);

      if (tag.startsWith("</span")) {
        stack.pop();
      } else if (tag.startsWith("<span")) {
        stack.push(tag);
      }

      current += tag;
      i = tagEnd + 1;
      continue;
    }

    if (char === "\n") {
      current += "</span>".repeat(stack.length);
      lines.push(current);
      current = stack.join("");
      i++;
      continue;
    }

    current += char;
    i++;
  }

  lines.push(current);

  return lines;
}
