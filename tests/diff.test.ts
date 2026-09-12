import { diffLines, parseUnifiedDiff } from "../src/diff.js";

describe("parseUnifiedDiff", () => {
  it("parses real `git diff` output", () => {
    const diff = `diff --git a/src/foo.ts b/src/foo.ts
index 83db48f..bf269f4 100644
--- a/src/foo.ts
+++ b/src/foo.ts
@@ -1,3 +1,4 @@
 const a = 1;
-const b = 2;
+const b = 3;
+const c = 4;
 const d = 5;
`;

    expect(parseUnifiedDiff(diff)).toEqual({
      files: [
        {
          oldPath: "src/foo.ts",
          newPath: "src/foo.ts",
          hunks: [
            {
              oldStart: 1,
              oldLines: 3,
              newStart: 1,
              newLines: 4,
              header: "@@ -1,3 +1,4 @@",
              lines: [
                { type: "ctx", text: "const a = 1;" },
                { type: "del", text: "const b = 2;" },
                { type: "add", text: "const b = 3;" },
                { type: "add", text: "const c = 4;" },
                { type: "ctx", text: "const d = 5;" },
              ],
            },
          ],
        },
      ],
    });
  });

  it("parses a plain `diff -u` (no `diff --git`)", () => {
    const diff = `--- foo.txt
+++ foo.txt
@@ -1,2 +1,2 @@
-old line
+new line
 unchanged
`;

    expect(parseUnifiedDiff(diff)).toEqual({
      files: [
        {
          oldPath: "foo.txt",
          newPath: "foo.txt",
          hunks: [
            {
              oldStart: 1,
              oldLines: 2,
              newStart: 1,
              newLines: 2,
              header: "@@ -1,2 +1,2 @@",
              lines: [
                { type: "del", text: "old line" },
                { type: "add", text: "new line" },
                { type: "ctx", text: "unchanged" },
              ],
            },
          ],
        },
      ],
    });
  });

  it("tolerates CRLF line endings", () => {
    const diff =
      "--- a/foo.txt\r\n+++ b/foo.txt\r\n@@ -1,1 +1,1 @@\r\n-old\r\n+new\r\n";

    expect(parseUnifiedDiff(diff)).toEqual({
      files: [
        {
          oldPath: "a/foo.txt",
          newPath: "b/foo.txt",
          hunks: [
            {
              oldStart: 1,
              oldLines: 1,
              newStart: 1,
              newLines: 1,
              header: "@@ -1,1 +1,1 @@",
              lines: [
                { type: "del", text: "old" },
                { type: "add", text: "new" },
              ],
            },
          ],
        },
      ],
    });
  });

  it("consumes `\\ No newline at end of file` on both sides", () => {
    const diff = `--- a/foo.txt
+++ b/foo.txt
@@ -1,1 +1,1 @@
-old
\\ No newline at end of file
+new
\\ No newline at end of file
`;

    expect(parseUnifiedDiff(diff)).toEqual({
      files: [
        {
          oldPath: "a/foo.txt",
          newPath: "b/foo.txt",
          hunks: [
            {
              oldStart: 1,
              oldLines: 1,
              newStart: 1,
              newLines: 1,
              header: "@@ -1,1 +1,1 @@",
              lines: [
                { type: "del", text: "old" },
                { type: "add", text: "new" },
              ],
            },
          ],
        },
      ],
    });
  });

  it("parses two files in one diff", () => {
    const diff = `diff --git a/one.txt b/one.txt
--- a/one.txt
+++ b/one.txt
@@ -1,1 +1,1 @@
-one
+ONE
diff --git a/two.txt b/two.txt
--- a/two.txt
+++ b/two.txt
@@ -1,1 +1,1 @@
-two
+TWO
`;

    const parsed = parseUnifiedDiff(diff);
    expect(parsed.files).toHaveLength(2);
    expect(parsed.files[0]?.oldPath).toBe("one.txt");
    expect(parsed.files[0]?.newPath).toBe("one.txt");
    expect(parsed.files[0]?.hunks[0]?.lines).toEqual([
      { type: "del", text: "one" },
      { type: "add", text: "ONE" },
    ]);
    expect(parsed.files[1]?.oldPath).toBe("two.txt");
    expect(parsed.files[1]?.newPath).toBe("two.txt");
    expect(parsed.files[1]?.hunks[0]?.lines).toEqual([
      { type: "del", text: "two" },
      { type: "add", text: "TWO" },
    ]);
  });

  it("parses a pure-addition hunk", () => {
    const diff = `--- a/foo.txt
+++ b/foo.txt
@@ -0,0 +1,2 @@
+line one
+line two
`;

    const parsed = parseUnifiedDiff(diff);
    expect(parsed.files[0]?.hunks[0]).toEqual({
      oldStart: 0,
      oldLines: 0,
      newStart: 1,
      newLines: 2,
      header: "@@ -0,0 +1,2 @@",
      lines: [
        { type: "add", text: "line one" },
        { type: "add", text: "line two" },
      ],
    });
  });

  it("starts a file at the first `@@` when no headers precede it", () => {
    const diff = `@@ -1,1 +1,1 @@
-old
+new
`;

    expect(parseUnifiedDiff(diff)).toEqual({
      files: [
        {
          oldPath: undefined,
          newPath: undefined,
          hunks: [
            {
              oldStart: 1,
              oldLines: 1,
              newStart: 1,
              newLines: 1,
              header: "@@ -1,1 +1,1 @@",
              lines: [
                { type: "del", text: "old" },
                { type: "add", text: "new" },
              ],
            },
          ],
        },
      ],
    });
  });
});

describe("diffLines", () => {
  it("marks identical strings as all `ctx`", () => {
    const hunk = diffLines("same", "same");
    expect(hunk.lines.every((line) => line.type === "ctx")).toBe(true);
  });

  it("round-trips before/after through the returned lines", () => {
    const before = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const after = "const a = 1;\nconst b = two;\nconst c = 3;\nconst d = 4;";
    const hunk = diffLines(before, after);

    expect(
      hunk.lines
        .filter((l) => l.type !== "del")
        .map((l) => l.text)
        .join("\n"),
    ).toBe(after);
    expect(
      hunk.lines
        .filter((l) => l.type !== "add")
        .map((l) => l.text)
        .join("\n"),
    ).toBe(before);
  });

  it("round-trips 200 random string pairs, with and without trailing newlines and astral Unicode", () => {
    const words = ["const", "let", "foo", "bar", "😀", "𐈀", "() =>", "{", "}"];
    let seed = 42;
    const random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const randomLine = () =>
      Array.from(
        { length: 1 + Math.floor(random() * 3) },
        () => words[Math.floor(random() * words.length)],
      ).join(" ");
    const randomString = () => {
      const lineCount = Math.floor(random() * 5);
      const lines = Array.from({ length: lineCount }, randomLine);
      const text = lines.join("\n");
      return random() < 0.5 ? text : `${text}\n`;
    };

    for (let i = 0; i < 200; i++) {
      const before = randomString();
      const after = randomString();
      const hunk = diffLines(before, after);

      expect(
        hunk.lines
          .filter((l) => l.type !== "del")
          .map((l) => l.text)
          .join("\n"),
      ).toBe(after);
      expect(
        hunk.lines
          .filter((l) => l.type !== "add")
          .map((l) => l.text)
          .join("\n"),
      ).toBe(before);
    }
  });

  it("round-trips empty strings", () => {
    const hunk = diffLines("", "");
    expect(hunk.lines).toEqual([{ type: "ctx", text: "" }]);
  });
});
