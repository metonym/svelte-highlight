/** createSearch scan cost, query modes, incremental rescan, and highlightMatches on a fake DOM. */
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

function paintLine(i: number) {
  return `  const value${i} = compute(${i}, "needle") + other_${i % 7};`;
}

function tokenSpans(text: string) {
  return (text.match(/\w+|\W+/g) ?? []).map((token) => h("span", {}, token));
}

/** `rows` wraps lines in `[data-line]` spans like HighlightVirtual; else offsets span the whole `<code>`. */
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

// The <mark> fallback mutates the tree, so each run builds a fresh fixture.
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
