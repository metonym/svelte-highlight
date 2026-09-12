import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import typescript from "../src/languages/typescript.js";

const componentPath = path.join(import.meta.dir, "../src/HighlightDiff.svelte");
const lineNumbersPath = path.join(import.meta.dir, "../src/LineNumbers.svelte");

async function compileForServer() {
  // HighlightDiff imports LineNumbers.svelte, so compiling only HighlightDiff
  // leaves a raw, un-compiled ".svelte" import in the output. Compile
  // LineNumbers too and rewrite the import to point at its compiled output.
  const lineNumbersJs = compile(fs.readFileSync(lineNumbersPath, "utf-8"), {
    generate: "server",
    filename: "LineNumbers.svelte",
  }).js.code;
  const lineNumbersOutPath = path.join(
    import.meta.dir,
    "../src/.tmp-line-numbers.server.js",
  );
  fs.writeFileSync(lineNumbersOutPath, lineNumbersJs);

  const source = fs.readFileSync(componentPath, "utf-8");
  const { js } = compile(source, {
    generate: "server",
    filename: "HighlightDiff.svelte",
  });
  const code = js.code.replace(
    '"./LineNumbers.svelte"',
    '"./.tmp-line-numbers.server.js"',
  );

  // Written alongside the component (not in tests/) so its relative imports
  // resolve.
  const outPath = path.join(
    import.meta.dir,
    "../src/.tmp-highlight-diff.server.js",
  );
  fs.writeFileSync(outPath, code);
  try {
    return await import(pathToFileURL(outPath).href);
  } finally {
    fs.unlinkSync(outPath);
    fs.unlinkSync(lineNumbersOutPath);
  }
}

describe("HighlightDiff SSR", () => {
  it("renders both gutters' numbers and both markers as plain text, with no undefined/null leaks", async () => {
    const { default: HighlightDiff } = await compileForServer();

    const diff = `diff --git a/one.ts b/one.ts
--- a/one.ts
+++ b/one.ts
@@ -1,2 +1,2 @@
-const a = 1;
+const a = 2;
 const b = 2;
diff --git a/two.ts b/two.ts
--- a/two.ts
+++ b/two.ts
@@ -1,2 +1,2 @@
-const c = 3;
+const c = 4;
 const d = 4;
`;

    const { body } = render(HighlightDiff, {
      props: { diff, language: typescript },
    });

    expect(body).not.toContain("undefined");
    expect(body).not.toContain("null");

    expect(body).toContain('data-diff="add"');
    expect(body).toContain('data-diff="del"');
    expect(body).toContain('data-diff="ctx"');

    // Old-file (secondary) and new-file (primary) gutter numbers for both
    // hunks, including the ones only reachable on one side of a change.
    for (const n of [1, 2]) {
      expect(body).toContain(`>${n}<`);
    }

    expect(body).toContain("hljs-keyword");
  });

  it("keeps add-line content aligned to its own row when a ctx line separates two changes in one hunk", async () => {
    const { default: HighlightDiff } = await compileForServer();

    // A ctx line between two add/del pairs: the after-side reconstruction is
    // [ctx, add, ctx, add], so the second add must read index 3, not 1 --
    // regression coverage for a bug where ctx lines only advanced the
    // before-side index, shifting every later add onto the wrong row.
    const before = "const a = 1;\nconst mid = 0;\nconst b = 2;";
    const after = "const a = 100;\nconst mid = 0;\nconst b = 200;";

    const { body } = render(HighlightDiff, {
      props: { before, after, language: typescript },
    });

    const addMarkerIndex = body.indexOf('data-diff="add"');
    const firstAddRow = body.slice(addMarkerIndex, addMarkerIndex + 200);
    expect(firstAddRow).toContain("100");
    expect(firstAddRow).not.toContain("200");

    const secondAddMarkerIndex = body.indexOf(
      'data-diff="add"',
      addMarkerIndex + 1,
    );
    const secondAddRow = body.slice(
      secondAddMarkerIndex,
      secondAddMarkerIndex + 200,
    );
    expect(secondAddRow).toContain("200");
    expect(secondAddRow).not.toContain("100");
  });

  it("gutter=unified renders one gutter column, falling back to the old-file number for removed lines", async () => {
    const { default: HighlightDiff } = await compileForServer();

    const before = "const a = 1;\nconst b = 2;";
    const after = "const a = 2;\nconst b = 2;";

    const { body } = render(HighlightDiff, {
      props: { before, after, gutter: "unified", language: typescript },
    });

    // One gutter <td> per row (not two, like "both" would render).
    const rowCount = (body.match(/<tr/g) ?? []).length;
    const gutterCellCount = (body.match(/<td aria-hidden="true"/g) ?? [])
      .length;
    expect(gutterCellCount).toBe(rowCount);

    // The removed line has no new-file number, so it falls back to its
    // old-file number (1) instead of a blank cell.
    const delMarkerIndex = body.indexOf('data-diff="del"');
    const delRow = body.slice(delMarkerIndex - 400, delMarkerIndex);
    expect(delRow).toContain(">1<");
  });
});
