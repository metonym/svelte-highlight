/** lineTokenRanges(): single-line repaint for HighlightEditable's css-highlights engine. */
import { group, task } from "ostia";
import { lineTokenRanges } from "../src/editable-css-paint.js";
import { parseIncremental } from "../src/incremental-tokenize.js";
import { buildRegistry, jsLines } from "./_shared.ts";

const registry = await buildRegistry();

/** Document offsets `[start, end)` of `line`'s text, excluding its "\n". */
function lineBounds(code: string, line: number) {
  let start = 0;
  for (let i = 0; i < line; i++) start = code.indexOf("\n", start) + 1;
  const newline = code.indexOf("\n", start);
  return { start, end: newline === -1 ? code.length : newline };
}

group("lineTokenRanges() single-line repaint", () => {
  for (const lines of [500, 2_000, 8_000]) {
    const code = jsLines(lines);
    const { events } = parseIncremental(registry, "javascript", code);
    for (const [where, line] of [
      ["first line", 0],
      ["middle line", lines >> 1],
      ["last line", lines - 1],
    ] as const) {
      const { start, end } = lineBounds(code, line);
      task(`${where} @ ${lines.toLocaleString()} lines`, () =>
        lineTokenRanges(events, start, end),
      );
    }
  }
});
