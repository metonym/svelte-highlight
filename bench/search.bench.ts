/**
 * search.js: createSearch's scan cost as documents grow, the relative
 * cost of its literal/caseSensitive/wholeWord/regex modes, and the
 * incremental-rescan optimization against a growing TokenizedDocument -
 * repeated query()s only rescan newly appended lines instead of the whole
 * document, the same kind of typing-simulation comparison
 * incremental.bench.ts runs for parseIncremental/reparseIncremental.
 *
 * highlightMatches (the DOM-painting half of this module) runs against
 * bench/_fake-search-dom.ts, a minimal DOM shim, so its cost here is the tree
 * walking and querying it does, not a browser's layout or paint.
 */
import { group, task } from "ostia";
import javascript from "../src/languages/javascript.js";
import { createSearch, highlightMatches } from "../src/search.js";
import { createTokenizedDocument } from "../src/tokenized-document.js";
import { type FakeElement, h, installFakeDom } from "./_fake-search-dom.ts";
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

// Typing into a find box: one createSearch, then a query() per keystroke as
// the text grows, so the per-query scan cost isn't hidden behind the
// one-time cost of building the search.
group("createSearch query() per keystroke on one search @ 20,000 lines", () => {
  const code = jsLines(20_000);
  const search = createSearch(code);
  const keystrokes = ["r", "re", "ret", "retu", "retur", "return"];
  task("literal, typing 'return'", () => {
    for (const text of keystrokes) search.query(text);
  });
  task("regex, typing 'return'", () => {
    for (const text of keystrokes) search.query(text, { regex: true });
  });
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

const PAINT_LINES = 2_000;

/** Line `i`'s plain text; every line has one "needle" to match. */
function paintLine(i: number) {
  return `  const value${i} = compute(${i}, "needle") + other_${i % 7};`;
}

/** One `<span>` per word or punctuation run, like highlighted tokens. */
function tokenSpans(text: string) {
  return (text.match(/\w+|\W+/g) ?? []).map((token) => h("span", {}, token));
}

/**
 * A `<code>` of PAINT_LINES token-split lines. `rows` wraps each line in a
 * `<span class="line" data-line="N">`, the way HighlightVirtual renders;
 * without it, highlightMatches falls back to offsets into the whole
 * `<code>`'s text.
 */
function paintFixture(rows: boolean) {
  const code = h("code");
  for (let i = 0; i < PAINT_LINES; i++) {
    const tokens = tokenSpans(paintLine(i));
    if (rows) {
      code.appendChild(
        h(
          "span",
          { className: "line", dataset: { line: String(i) } },
          ...tokens,
        ),
      );
    } else {
      for (const token of tokens) code.appendChild(token);
    }
    code.appendChild(h("span", {}, "\n"));
  }
  return h("pre", {}, code);
}

/** `count` "needle" matches spread evenly over PAINT_LINES lines. */
function paintMatches(count: number) {
  return Array.from({ length: count }, (_, k) => {
    const line = Math.floor((k * PAINT_LINES) / count);
    const start = paintLine(line).indexOf("needle");
    return { line, start, end: start + "needle".length };
  });
}

const PAINT_LAYOUTS = [
  ["[data-line] rows", true],
  ["<code> fallback", false],
] as const;

group("highlightMatches() CSS highlights @ 2,000 lines", () => {
  for (const [layout, rows] of PAINT_LAYOUTS) {
    const root = paintFixture(rows) as unknown as Element;
    for (const count of [250, 1_000]) {
      const matches = paintMatches(count);
      task(`${count.toLocaleString()} matches, ${layout}`, () => {
        const registry = installFakeDom();
        const paint = highlightMatches(root, matches, { current: 0 });
        const size =
          (registry.get("shl-search")?.size ?? 0) +
          (registry.get("shl-search-current")?.size ?? 0);
        paint.dispose();
        return size;
      });
    }
  }
});

// The <mark> fallback splits text nodes, so each run paints a fresh copy of
// the fixture; building it is the same work on both sides of an A/B.
group("highlightMatches() <mark> fallback @ 2,000 lines", () => {
  for (const [layout, rows] of PAINT_LAYOUTS) {
    for (const count of [250, 1_000]) {
      const matches = paintMatches(count);
      task(`${count.toLocaleString()} matches, ${layout}`, () => {
        installFakeDom({ highlights: false });
        const root: FakeElement = paintFixture(rows);
        highlightMatches(root as unknown as Element, matches, { current: 0 });
        return root.querySelectorAll("mark").length;
      });
    }
  }
});

// Run this suite with `ostia bench bench/search.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
