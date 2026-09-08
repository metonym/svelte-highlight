/**
 * search.js: createSearch's scan cost as documents grow, the relative
 * cost of its literal/caseSensitive/wholeWord/regex modes, and the
 * incremental-rescan optimization against a growing TokenizedDocument -
 * repeated query()s only rescan newly appended lines instead of the whole
 * document, the same kind of typing-simulation comparison
 * incremental.bench.ts runs for parseIncremental/reparseIncremental.
 *
 * highlightMatches (the DOM-painting half of this module) isn't benched
 * here: it walks real DOM (TreeWalker, Range, CSS.highlights), which this
 * Bun-native bench environment has no shim for.
 */
import { group, task } from "ostia";
import javascript from "../src/languages/javascript.js";
import { createSearch } from "../src/search.js";
import { createTokenizedDocument } from "../src/tokenized-document.js";
import { jsLines } from "./_shared.ts";

group("createSearch query() full rescan by document size", () => {
  for (const lines of [2_000, 20_000, 100_000]) {
    const code = jsLines(lines);
    task(`${lines.toLocaleString()} lines`, () =>
      createSearch(code).query("return"),
    );
  }
});

group("createSearch query() mode cost @ 20,000 lines", () => {
  const code = jsLines(20_000);
  task("literal (case-insensitive)", () => createSearch(code).query("return"));
  task("caseSensitive", () =>
    createSearch(code).query("return", { caseSensitive: true }),
  );
  task("wholeWord", () =>
    createSearch(code).query("return", { wholeWord: true }),
  );
  task("regex", () => createSearch(code).query("a \\+ b", { regex: true }));
});

function incrementalRepeatedQuery(totalLines: number, steps: number) {
  const doc = createTokenizedDocument({ language: javascript });
  const search = createSearch(doc);
  const perStep = Math.ceil(totalLines / steps);
  for (let s = 0; s < steps; s += 1) {
    doc.append(jsLines(perStep));
    search.query("return");
  }
}

function freshSearchPerStep(totalLines: number, steps: number) {
  const doc = createTokenizedDocument({ language: javascript });
  const perStep = Math.ceil(totalLines / steps);
  for (let s = 0; s < steps; s += 1) {
    doc.append(jsLines(perStep));
    createSearch(doc).query("return");
  }
}

group(
  "createSearch incremental rescan vs a fresh full rescan every append",
  () => {
    for (const [totalLines, steps] of [
      [8_000, 20],
      [40_000, 40],
    ] as const) {
      task(
        `query() reused across ${steps} appends (${totalLines.toLocaleString()} lines total)`,
        () => incrementalRepeatedQuery(totalLines, steps),
      );
      task(
        `fresh createSearch() + full query() per append (${totalLines.toLocaleString()} lines total)`,
        () => freshSearchPerStep(totalLines, steps),
      );
    }
  },
);

// Run this suite with `ostia bench bench/search.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
