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
  // Text (tags included) is copied in runs delimited by newlines rather
  // than character by character; only `<` and `\n` need inspecting.
  let runStart = 0;
  let i = 0;

  while (i < html.length) {
    const code = html.charCodeAt(i);

    if (code === LESS_THAN) {
      const tagEnd = html.indexOf(">", i);
      if (html.startsWith("</span", i)) {
        stack.pop();
      } else if (html.startsWith("<span", i)) {
        stack.push(html.slice(i, tagEnd + 1));
      }
      i = tagEnd + 1;
      continue;
    }

    if (code === NEWLINE) {
      current += html.slice(runStart, i);
      if (stack.length > 0) current += "</span>".repeat(stack.length);
      lines.push(current);
      current = stack.join("");
      runStart = i + 1;
    }

    i++;
  }

  lines.push(current + html.slice(runStart));

  return lines;
}

const LESS_THAN = 60;
const NEWLINE = 10;
