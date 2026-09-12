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
});
