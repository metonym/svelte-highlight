/**
 * Composable transforms for `CopyButton`'s `transform` prop, for stripping
 * decoration (shell prompts, REPL markers, diff signs) that should not
 * survive a copy.
 */

/**
 * Strip a leading prompt from each line that has one. Lines without a
 * matching prompt (e.g. command output in a multi-command block) are kept
 * as-is.
 * @param {string} code
 * @param {string[]} [prompts]
 * @returns {string}
 */
export function stripPrompts(code, prompts = ["$ ", "> "]) {
  return code
    .split("\n")
    .map((line) => {
      const prompt = prompts.find((p) => line.startsWith(p));
      return prompt ? line.slice(prompt.length) : line;
    })
    .join("\n");
}

/**
 * Strip a leading diff marker (`+ `, `- `, or a bare `+`/`-` immediately
 * before content) from each line. Context lines without a marker are left
 * unchanged.
 * @param {string} code
 * @returns {string}
 */
export function stripDiffMarkers(code) {
  return code
    .split("\n")
    .map((line) => {
      if (line.startsWith("+ ") || line.startsWith("- ")) return line.slice(2);
      if (line.startsWith("+") || line.startsWith("-")) return line.slice(1);
      return line;
    })
    .join("\n");
}
