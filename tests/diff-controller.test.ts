import { createDiffController } from "../src/diff-controller.js";
import { parsePatch } from "../src/diff-edits.js";
import { overlayRanges } from "../src/diff-html.js";
import javascript from "../src/languages/javascript.js";

const before = `${Array.from({ length: 40 }, (_, i) => `const v${i} = ${i};`).join("\n")}\n`;
const after = before
  .replace("const v5 = 5;", "const v5 = 50;")
  .replace("const v30 = 30;\n", "");

function controller() {
  const diff = createDiffController({ language: javascript });
  diff.update(before, after);
  return diff;
}

describe("createDiffController", () => {
  it("notifies subscribers on changes, and not on no-op options", () => {
    const diff = createDiffController();
    let calls = 0;
    diff.subscribe(() => calls++);
    expect(calls).toBe(1);
    diff.update(before, after);
    expect(calls).toBe(2);
    diff.update(before, after);
    diff.setOptions({ view: "unified" });
    expect(calls).toBe(2);
    diff.setOptions({ view: "split" });
    expect(calls).toBe(3);
  });

  it("keeps folds and review while `after` grows, and resets them when it's replaced", () => {
    const diff = controller();
    diff.decide(0, "rejected");
    diff.expandAll();
    diff.update(before, `${after}// more\n`);
    expect(diff.decisions().size).toBe(1);
    expect(diff.rows().some((r) => r.kind === "fold")).toBe(false);
    diff.update(before, "something else\n");
    expect(diff.decisions().size).toBe(0);
    expect(diff.current()).toBe(-1);
  });

  it("navigates changes, wrapping, and asks views to reveal them", () => {
    const diff = controller();
    const reveals: number[] = [];
    diff.on("reveal", ({ unit }) => reveals.push(unit));
    expect(diff.nextChange()).toEqual({ change: 0, index: 0, count: 2 });
    expect(diff.nextChange()).toEqual({ change: 1, index: 1, count: 2 });
    expect(diff.nextChange()?.change).toBe(0);
    expect(diff.prevChange()?.change).toBe(1);
    expect(reveals).toHaveLength(4);
    const tops = diff.tops();
    const firstChangeRow = diff.rows().findIndex((r) => r.change === 0);
    expect(reveals[0]).toBe(tops[firstChangeRow]);
  });

  it("emits review results with rejected changes reverted", () => {
    const diff = controller();
    const texts: string[] = [];
    diff.on("review", ({ text }) => texts.push(text));
    diff.decide(1, "rejected");
    expect(texts[0]).toBe(before.replace("const v5 = 5;", "const v5 = 50;"));
    diff.decideAll("accepted");
    expect(diff.result()).toBe(after);
  });

  it("renders highlighted rows with word diffs", () => {
    const diff = controller();
    const rows = diff.rows();
    const del = rows.findIndex((r) => r.kind === "del");
    const [removed, added] = diff.renderRows(del, del + 2);
    expect(removed?.oldHtml).toContain("hljs-keyword");
    expect(removed?.oldHtml).toContain('<span class="shl-diff-word">5</span>');
    expect(added?.newHtml).toContain('<span class="shl-diff-word">50</span>');
  });

  it("escapes text when no language is set", () => {
    const diff = createDiffController();
    diff.update("a < b\n", "a <= b\n");
    const html = diff
      .renderRows(0, 2)
      .map((r) => r.oldHtml + r.newHtml)
      .join("");
    expect(html).toContain("&lt;");
    expect(html).not.toContain("a < b");
  });

  it("gives annotations their own rows and heights", () => {
    const diff = controller();
    diff.setOptions({
      annotations: [
        { side: "new", line: 6, body: "one\ntwo" },
        { side: "new", line: 6, body: "tall", lines: 4 },
      ],
    });
    const rows = diff.rows();
    const notes = rows.filter((r) => r.note);
    expect(notes).toHaveLength(2);
    const at = rows.indexOf(notes[0]!);
    const tops = diff.tops();
    expect((tops[at + 1] ?? 0) - (tops[at] ?? 0)).toBe(3);
    expect((tops[at + 2] ?? 0) - (tops[at + 1] ?? 0)).toBe(4);
  });

  it("marks each change for the minimap", () => {
    const diff = controller();
    const marks = diff.marks();
    expect(marks.map((m) => m.kind)).toEqual(["mod", "del"]);
    expect(marks.every((m) => m.top >= 0 && m.top < 1 && m.height > 0)).toBe(
      true,
    );
    diff.decide(1, "rejected");
    expect(diff.marks()[1]?.decision).toBe("rejected");
  });

  it("shows a patch without the source files", () => {
    const diff = createDiffController({ language: javascript });
    const [file] = parsePatch(
      "--- a/x.js\n+++ b/x.js\n@@ -20,2 +20,2 @@\n a\n-b\n+c\n",
    );
    diff.setPatch(file ?? null);
    const rows = diff.rows();
    expect(rows[0]?.fold?.unknown).toBe(true);
    expect(diff.stats()).toEqual({ additions: 1, deletions: 1, changes: 1 });
  });

  it("finds the row at a scroll position", () => {
    const diff = controller();
    expect(diff.rowAt(0)).toBe(0);
    expect(diff.rowAt(diff.totalUnits())).toBe(diff.rows().length);
  });
});

describe("overlayRanges", () => {
  it("keeps the wrapper innermost across tags and counts entities as one character", () => {
    const html = '<span class="k">a&amp;b</span>cd';
    expect(overlayRanges(html, [[1, 4]], "w")).toBe(
      '<span class="k">a<span class="w">&amp;b</span></span><span class="w">c</span>d',
    );
  });

  it("returns the input when there's nothing to mark", () => {
    expect(overlayRanges("<b>x</b>", [], "w")).toBe("<b>x</b>");
  });
});
