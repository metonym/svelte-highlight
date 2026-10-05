/**
 * editable-css-paint.js: HighlightEditable's "css-highlights" engine cost
 * for the common single-line repaint (typing within one line), which only
 * needs the token ranges on that line. Sized by document line count, at a
 * line near the start, middle, and end of the document, since the cost of
 * reaching a line can depend on where it sits.
 */
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

// Run this suite with `ostia bench bench/css-paint.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
