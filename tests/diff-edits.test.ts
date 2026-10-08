import { buildRows } from "../src/diff.js";
import {
  applyEdits,
  detectEditFormat,
  locate,
  parseEdits,
  parsePatch,
  patchToState,
  streamEditPrefix,
} from "../src/diff-edits.js";

const source = `def load(path):
    with open(path) as f:
        data = json.load(f)
    return data


def main():
    config = load("config.json")
    run(config)
`;

describe("detectEditFormat", () => {
  it("recognizes each format", () => {
    expect(
      detectEditFormat("<<<<<<< SEARCH\na\n=======\nb\n>>>>>>> REPLACE"),
    ).toBe("search-replace");
    expect(detectEditFormat("*** Begin Patch\n*** End Patch")).toBe(
      "apply-patch",
    );
    expect(detectEditFormat('{"old_str": "a", "new_str": "b"}')).toBe(
      "str-replace",
    );
    expect(detectEditFormat("@@ -1 +1 @@\n-a\n+b")).toBe("unified-diff");
    expect(detectEditFormat("```py\nprint(1)\n```")).toBe("whole-file");
    expect(detectEditFormat("just prose")).toBe("unknown");
  });
});

describe("parseEdits", () => {
  it("reads SEARCH/REPLACE blocks and their file path", () => {
    const { edits } = parseEdits(
      "app.py\n```python\n<<<<<<< SEARCH\n    return data\n=======\n    return dict(data)\n>>>>>>> REPLACE\n```\n",
    );
    expect(edits).toEqual([
      {
        search: "    return data\n",
        replace: "    return dict(data)\n",
        path: "app.py",
        searchComplete: true,
        complete: true,
      },
    ]);
  });

  it("marks a truncated SEARCH/REPLACE block as incomplete", () => {
    const { edits } = parseEdits("<<<<<<< SEARCH\na\n=======\nb\nc");
    expect(edits[0]).toMatchObject({
      searchComplete: true,
      complete: false,
      replace: "b\nc",
    });
    const early = parseEdits("<<<<<<< SEARCH\na\n").edits;
    expect(early[0]).toMatchObject({ searchComplete: false, complete: false });
  });

  it("turns unified diff hunks into search/replace pairs, tolerating missing context spaces", () => {
    const { edits } = parseEdits(
      "--- a/app.py\n+++ b/app.py\n@@ -99,3 +99,3 @@\ndef main():\n-    run(config)\n+    run(config, debug=True)\n",
    );
    expect(edits[0]).toMatchObject({
      path: "app.py",
      search: "def main():\n    run(config)\n",
      replace: "def main():\n    run(config, debug=True)\n",
    });
  });

  it("reads str_replace calls and MultiEdit arrays", () => {
    const single = parseEdits(
      JSON.stringify({ path: "a.py", old_str: "x", new_str: "y" }),
    );
    expect(single.edits).toMatchObject([
      { path: "a.py", search: "x", replace: "y" },
    ]);
    const multi = parseEdits(
      JSON.stringify({
        file_path: "a.py",
        edits: [
          { old_string: "a", new_string: "b" },
          { old_string: "c", new_string: "d" },
        ],
      }),
    );
    expect(multi.edits.map((e) => [e.path, e.search, e.replace])).toEqual([
      ["a.py", "a", "b"],
      ["a.py", "c", "d"],
    ]);
  });

  it("reads apply_patch envelopes", () => {
    const { edits } = parseEdits(
      "*** Begin Patch\n*** Update File: app.py\n@@ def main():\n     config = load(\"config.json\")\n-    run(config)\n+    run(config)\n+    print('done')\n*** End Patch",
    );
    expect(edits).toHaveLength(1);
    expect(edits[0]).toMatchObject({ path: "app.py", complete: true });
    expect(edits[0]?.replace).toContain("print('done')");
  });
});

describe("locate", () => {
  const lines = source.split("\n");

  it("prefers an exact match", () => {
    expect(locate(lines, ["    return data"])).toEqual({
      start: 3,
      strategy: "exact",
      score: 1,
    });
  });

  it("falls back to ignoring indentation", () => {
    expect(
      locate(lines, ["with open(path) as f:", "    data = json.load(f)"])
        ?.strategy,
    ).toBe("indentation");
  });

  it("falls back to fuzzy similarity", () => {
    const hit = locate(lines, [
      "def main():",
      "    config = load('config.json')",
      "    run(config)",
    ]);
    expect(hit?.strategy).toBe("fuzzy");
    expect(hit?.start).toBe(6);
  });

  it("gives up on text that isn't there", () => {
    expect(locate(lines, ["def shutdown():", "    close()"])).toBeNull();
  });
});

describe("applyEdits", () => {
  it("applies edits and reports how each one matched", () => {
    const { text, results } = applyEdits(source, [
      {
        search: "    return data\n",
        replace: "    return dict(data)\n",
        searchComplete: true,
        complete: true,
      },
      {
        search: "def nope():\n",
        replace: "",
        searchComplete: true,
        complete: true,
      },
    ]);
    expect(text).toContain("return dict(data)");
    expect(results.map((r) => r.status)).toEqual(["applied", "failed"]);
    expect(results[1]?.reason).toBe("search text not found");
  });

  it("re-indents a replacement written at the wrong depth", () => {
    const { text } = applyEdits(source, [
      {
        search: "with open(path) as f:\n    data = json.load(f)\n",
        replace:
          "with open(path, encoding='utf-8') as f:\n    data = json.load(f)\n",
        searchComplete: true,
        complete: true,
      },
    ]);
    expect(text).toContain(
      "    with open(path, encoding='utf-8') as f:\n        data = json.load(f)\n",
    );
  });

  it("rejects an edit that overlaps an earlier one", () => {
    const { results } = applyEdits(source, [
      {
        search: "def load(path):\n    with open(path) as f:\n",
        replace: "x\n",
        searchComplete: true,
        complete: true,
      },
      {
        search: "    with open(path) as f:\n        data = json.load(f)\n",
        replace: "y\n",
        searchComplete: true,
        complete: true,
      },
    ]);
    expect(results[1]).toMatchObject({
      status: "failed",
      reason: "overlaps an earlier edit",
    });
  });

  it("skips incomplete edits", () => {
    const { text, results } = applyEdits(source, [
      {
        search: "    return data\n",
        replace: "    ret",
        searchComplete: true,
        complete: false,
      },
    ]);
    expect(text).toBe(source);
    expect(results).toEqual([]);
  });
});

describe("streamEditPrefix", () => {
  const output = `<<<<<<< SEARCH
    return data
=======
    return dict(data)
>>>>>>> REPLACE
<<<<<<< SEARCH
    run(config)
=======
    run(config, debug=True)
>>>>>>> REPLACE
`;

  it("only grows as the model output streams in", () => {
    let previous = "";
    for (let i = 0; i <= output.length; i++) {
      const done = i === output.length;
      const { after } = streamEditPrefix(source, output.slice(0, i), { done });
      expect(after.startsWith(previous)).toBe(true);
      previous = after;
    }
  });

  it("ends with the fully edited file", () => {
    const result = streamEditPrefix(source, output, { done: true });
    expect(result.done).toBe(true);
    expect(result.after).toBe(
      applyEdits(source, parseEdits(output).edits).text,
    );
  });

  it("shows a replacement line by line while it streams", () => {
    const partial = output.slice(0, output.indexOf("dict(data)") + 4);
    const { after, done } = streamEditPrefix(source, partial);
    expect(done).toBe(false);
    expect(after.endsWith("    return dict")).toBe(true);
  });
});

describe("parsePatch", () => {
  const patch = `diff --git a/x.js b/x.js
index 1..2 100644
--- a/x.js
+++ b/x.js
@@ -10,3 +10,4 @@ function f() {
 a
-b
+B
+C
 c
@@ -40,2 +41,2 @@
 x
-y
+Y

diff --git a/new.md b/new.md
new file mode 100644
--- /dev/null
+++ b/new.md
@@ -0,0 +1,2 @@
+hello
+world
diff --git a/old.md b/old.md
deleted file mode 100644
--- a/old.md
+++ /dev/null
@@ -1 +0,0 @@
-bye
`;
  const files = parsePatch(patch);

  it("splits files and reads their status", () => {
    expect(
      files.map((f) => [f.newPath, f.status, f.additions, f.deletions]),
    ).toEqual([
      ["x.js", "modified", 3, 2],
      ["new.md", "added", 2, 0],
      ["old.md", "deleted", 0, 1],
    ]);
  });

  it("reads hunk positions and the section heading", () => {
    expect(files[0]?.hunks[0]).toMatchObject({
      oldStart: 10,
      oldLines: 3,
      newStart: 10,
      newLines: 4,
      section: "function f() {",
    });
    // The blank line between files isn't hunk content.
    expect(files[0]?.hunks[1]?.lines).toHaveLength(3);
  });

  it("builds a state with unknown gaps that keep real line numbers", () => {
    const state = patchToState(files[0]!);
    const rows = buildRows(state);
    const first = rows[0];
    expect(first?.kind).toBe("fold");
    expect(first?.fold).toMatchObject({
      unknown: true,
      header: "@@ -10,3 +10,4 @@ function f() {",
    });
    expect(first?.count).toBe(9);
    const del = rows.find((r) => r.kind === "del");
    expect(del?.old).toBe(10);
    expect(state.beforeLines[10]).toBe("b");
    expect(state.afterLines[41]).toBe("Y");
  });
});
