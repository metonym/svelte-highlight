import {
  applyReview,
  type Block,
  buildRows,
  createDiffSession,
  type DiffState,
  detectMoves,
  diffLines,
  diffStats,
  diffTexts,
  splitText,
  toUnifiedPatch,
  wordDiff,
} from "../src/diff.js";
import { parsePatch } from "../src/diff-edits.js";

/** Rebuilds `after` from the blocks and checks that they tile both sides. */
function checkBlocks(state: DiffState) {
  let a = 0;
  let b = 0;
  for (const block of state.blocks) {
    expect([block.a, block.b]).toEqual([a, b]);
    if (block.type === "equal") {
      expect(state.beforeLines.slice(block.a, block.aEnd)).toEqual(
        state.afterLines.slice(block.b, block.bEnd),
      );
    }
    a = block.aEnd;
    b = block.bEnd;
  }
  expect(a).toBe(state.streaming ? state.pendingA : state.beforeLines.length);
  expect(b).toBe(state.afterLines.length);
}

/** Seeded PRNG, so failures reproduce. */
function rng(seed: number) {
  let s = seed;
  return (n: number) => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return Math.floor((s / 2147483648) * n);
  };
}

const summary = (blocks: Block[]) =>
  blocks.map((b) => `${b.type[0]}${b.a}-${b.aEnd}/${b.b}-${b.bEnd}`).join(" ");

describe("splitText", () => {
  it("drops the empty line a final newline makes", () => {
    expect(splitText("a\nb\n")).toEqual({ lines: ["a", "b"], noEol: false });
    expect(splitText("a\nb")).toEqual({ lines: ["a", "b"], noEol: true });
    expect(splitText("")).toEqual({ lines: [], noEol: false });
  });
});

describe("diffLines", () => {
  it("finds a single replaced line", () => {
    expect(summary(diffLines(["a", "b", "c"], ["a", "B", "c"]))).toBe(
      "e0-1/0-1 c1-2/1-2 e2-3/2-3",
    );
  });

  it("handles empty sides", () => {
    expect(summary(diffLines([], ["x", "y"]))).toBe("c0-0/0-2");
    expect(summary(diffLines(["x", "y"], []))).toBe("c0-2/0-0");
    expect(diffLines([], [])).toEqual([]);
  });

  it("anchors on unique lines instead of matching common braces", () => {
    const before = [
      "function a() {",
      "  one();",
      "}",
      "function b() {",
      "  two();",
      "}",
    ];
    const after = [
      "function b() {",
      "  two();",
      "}",
      "function a() {",
      "  one();",
      "}",
    ];
    const blocks = diffLines(before, after);
    // One function stays equal; the other moves as a delete + insert.
    const equal = blocks.filter((b) => b.type === "equal");
    expect(equal.reduce((n, b) => n + b.aEnd - b.a, 0)).toBe(3);
  });

  it("treats whitespace-only changes as equal with ignoreWhitespace", () => {
    const before = ["if (x) {", "\treturn 1;", "}"];
    const after = ["if (x)  {", "    return 1;", "}"];
    expect(diffLines(before, after).some((b) => b.type === "change")).toBe(
      true,
    );
    expect(
      diffLines(before, after, { ignoreWhitespace: true }).every(
        (b) => b.type === "equal",
      ),
    ).toBe(true);
  });

  it("produces blocks that rebuild the other side for random edits", () => {
    const rand = rng(42);
    for (let t = 0; t < 2000; t++) {
      const a = Array.from({ length: rand(30) }, () => "abcde"[rand(5)] ?? "a");
      const b = a.slice();
      for (let e = 0; e < rand(8); e++) {
        const i = rand(b.length + 1);
        const op = rand(3);
        if (op === 0) b.splice(i, 1);
        else if (op === 1) b.splice(i, 0, "xyzab"[rand(5)] ?? "x");
        else b[i] = "q";
      }
      checkBlocks(diffTexts(`${a.join("\n")}\n`, `${b.join("\n")}\n`));
    }
  });
});

describe("diffTexts", () => {
  it("counts a missing final newline as a change", () => {
    const state = diffTexts("a\nb\n", "a\nb");
    expect(state.afterNoEol).toBe(true);
    expect(summary(state.blocks)).toBe("e0-1/0-1 c1-2/1-2");
  });

  it("numbers changes by position", () => {
    const state = diffTexts("a\nb\nc\nd\ne\n", "A\nb\nc\nd\nE\n");
    expect(
      state.blocks.filter((b) => b.type === "change").map((b) => b.id),
    ).toEqual([0, 1]);
  });
});

describe("createDiffSession streaming", () => {
  const before = `${Array.from({ length: 60 }, (_, i) => `line ${i}`).join("\n")}\n`;
  const after = before
    .replace("line 5\n", "line 5 changed\nextra\n")
    .replace("line 30\n", "")
    .replace("line 50\n", "line fifty\n");

  it("leaves the unreached end of `before` pending, not deleted", () => {
    const session = createDiffSession();
    const state = session.update(
      before,
      after.slice(0, after.indexOf("line 20")),
      {
        streaming: true,
      },
    );
    checkBlocks(state);
    expect(state.pendingA).toBe(20);
    expect(diffStats(state).deletions).toBe(1);
  });

  it("keeps the partial last line out of the diff", () => {
    const session = createDiffSession();
    const state = session.update(before, "line 0\nline 1\nlin", {
      streaming: true,
    });
    expect(state.partial).toBe("lin");
    expect(state.afterLines).toEqual(["line 0", "line 1"]);
  });

  it("never changes sealed blocks as `after` grows", () => {
    const session = createDiffSession();
    let sealed: string[] = [];
    for (let i = 1; i <= after.length; i += 3) {
      const state = session.update(before, after.slice(0, i), {
        streaming: true,
      });
      checkBlocks(state);
      const now = state.blocks
        .slice(0, state.sealedBlocks)
        .map((b) => JSON.stringify(b));
      // Every block sealed earlier is still there, unchanged (the last one may
      // only grow, since an equal run can extend).
      for (let k = 0; k < sealed.length - 1; k++)
        expect(now[k]).toBe(sealed[k]);
      sealed = now;
    }
  });

  it("matches a one-shot diff once streaming ends", () => {
    const session = createDiffSession();
    for (let i = 1; i <= after.length; i += 7) {
      session.update(before, after.slice(0, i), { streaming: true });
    }
    const final = session.update(before, after);
    expect(summary(final.blocks)).toBe(
      summary(diffTexts(before, after).blocks),
    );
  });

  it("starts over when `after` is replaced instead of grown", () => {
    const session = createDiffSession();
    session.update(before, after.slice(0, 100), { streaming: true });
    const state = session.update(before, "something else\n", {
      streaming: true,
    });
    checkBlocks(state);
    expect(state.afterLines).toEqual(["something else"]);
  });
});

describe("buildRows", () => {
  const before = `${Array.from({ length: 30 }, (_, i) => `l${i}`).join("\n")}\n`;
  const after = before.replace("l15\n", "L15\n");
  const state = diffTexts(before, after);

  it("folds unchanged runs beyond the context", () => {
    const rows = buildRows(state, { context: 2 });
    expect(rows.map((r) => r.kind)).toEqual([
      "fold",
      "context",
      "context",
      "del",
      "add",
      "context",
      "context",
      "fold",
    ]);
    expect(rows[0]?.count).toBe(13);
    // The fold names the hunk that follows it, context included.
    expect(rows[0]?.fold?.header).toBe("@@ -14,5 +14,5 @@");
    expect(rows[7]?.count).toBe(12);
  });

  it("expands a fold by key", () => {
    const folded = buildRows(state, { context: 2 });
    const key = folded[0]?.key ?? "";
    const rows = buildRows(state, { context: 2, expanded: new Set([key]) });
    expect(rows.filter((r) => r.kind === "context").length).toBe(17);
  });

  it("pairs removed and added lines side by side in split view", () => {
    const rows = buildRows(diffTexts("a\nb\nc\n", "a\nB\nC\nD\nc\n"), {
      view: "split",
    });
    const changes = rows.filter((r) => r.kind === "change");
    expect(changes.map((r) => [r.old, r.new])).toEqual([
      [1, 1],
      [undefined, 2],
      [undefined, 3],
    ]);
    expect(changes[0]?.first).toBe(true);
  });

  it("pairs lines for word diffs in unified view", () => {
    const rows = buildRows(diffTexts("a\nb\n", "a\nB\n"));
    expect(rows.find((r) => r.kind === "del")?.pairNew).toBe(1);
    expect(rows.find((r) => r.kind === "add")?.pairOld).toBe(1);
  });

  it("adds incoming and pending rows while streaming", () => {
    const state = createDiffSession().update("a\nb\nc\nd\n", "a\nb", {
      streaming: true,
    });
    const kinds = buildRows(state).map((r) => r.kind);
    expect(kinds.slice(-2)).toEqual(["incoming", "pending"]);
  });

  it("shows identical texts as one fold", () => {
    const rows = buildRows(diffTexts("a\nb\n", "a\nb\n"));
    expect(rows.map((r) => r.kind)).toEqual(["fold"]);
  });
});

describe("detectMoves", () => {
  it("links a block removed in one place and added in another", () => {
    const fn = ["function f() {", "  doSomething();", "  return 42;", "}"];
    const before = [
      ...fn,
      "",
      "const a = 1;",
      "const b = 2;",
      "const c = 3;",
      "",
    ];
    const after = [
      "",
      "const a = 1;",
      "const b = 2;",
      "const c = 3;",
      "",
      ...fn,
    ];
    const state = diffTexts(`${before.join("\n")}\n`, `${after.join("\n")}\n`);
    const { oldMoves, newMoves, groups } = detectMoves(state);
    expect(groups).toBe(1);
    expect(oldMoves.size).toBeGreaterThanOrEqual(3);
    for (const [i, { to }] of oldMoves) {
      expect(state.beforeLines[i]?.trim()).toBe(
        state.afterLines[to ?? -1]?.trim(),
      );
      expect(newMoves.get(to ?? -1)?.from).toBe(i);
    }
  });

  it("ignores runs shorter than minLines", () => {
    const state = diffTexts(
      "x = 1;\nfoo();\ny = 2;\n",
      "y = 2;\nfoo();\nx = 1;\n",
    );
    expect(detectMoves(state).groups).toBe(0);
  });
});

describe("wordDiff", () => {
  it("marks only the changed words", () => {
    const result = wordDiff("const foo = bar(1, 2);", "const foo = baz(1, 3);");
    expect(result.old).toEqual([
      [12, 15],
      [19, 20],
    ]);
    expect(result.new).toEqual([
      [12, 15],
      [19, 20],
    ]);
  });

  it("skips unrelated lines and bridges whitespace between changed words", () => {
    const result = wordDiff("alpha beta", "gamma delta");
    expect(result.similarity).toBeLessThan(0.35);
    expect(result.old).toEqual([]);
    const near = wordDiff("keep this one two", "keep this uno dos");
    expect(near.old).toEqual([[10, 17]]);
  });

  it("splits on code points, not UTF-16 units", () => {
    const result = wordDiff('"👋🏽 hi"', '"👋🏿 hi"');
    const [range] = result.new;
    expect(range).toBeDefined();
    expect('"👋🏿 hi"'.slice(...(range as [number, number]))).toBe("🏿");
  });
});

describe("applyReview", () => {
  const before = "a\nb\nc\nd\n";
  const after = "a\nB\nc\nD\n";
  const state = diffTexts(before, after);

  it("keeps accepted and undecided changes", () => {
    expect(applyReview(state, new Map())).toBe(after);
    expect(applyReview(state, new Map([[0, "accepted"]]))).toBe(after);
  });

  it("reverts rejected changes", () => {
    expect(applyReview(state, new Map([[0, "rejected"]]))).toBe("a\nb\nc\nD\n");
    expect(
      applyReview(
        state,
        new Map([
          [0, "rejected"],
          [1, "rejected"],
        ]),
      ),
    ).toBe(before);
  });
});

describe("toUnifiedPatch", () => {
  it("writes hunks with context that parsePatch reads back", () => {
    const before = `${Array.from({ length: 20 }, (_, i) => `l${i}`).join("\n")}\n`;
    const after = before.replace("l3\n", "L3\n").replace("l15\n", "");
    const patch = toUnifiedPatch(diffTexts(before, after), {
      oldPath: "a/x",
      newPath: "b/x",
    });
    expect(patch.startsWith("--- a/x\n+++ b/x\n@@ -1,7 +1,7 @@\n")).toBe(true);
    const [file] = parsePatch(patch);
    expect(file?.hunks.length).toBe(2);
    expect(file?.additions).toBe(1);
    expect(file?.deletions).toBe(2);
    expect(file?.hunks[1]).toMatchObject({
      oldStart: 13,
      oldLines: 7,
      newStart: 13,
      newLines: 6,
    });
  });

  it("is empty of hunks when nothing changed", () => {
    expect(toUnifiedPatch(diffTexts("a\n", "a\n"))).toBe("--- a\n+++ b\n");
  });
});
