/**
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
