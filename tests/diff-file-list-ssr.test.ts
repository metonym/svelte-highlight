// @depends-on src/DiffFileList.svelte src/DiffFileListItem.svelte src/DiffView.svelte
import { render } from "svelte/server";
import typescript from "../src/languages/typescript.js";
import { loadForServer } from "./_ssr";

const file = (i: number, lines = 3) => ({
  path: `src/file${i}.ts`,
  before: Array.from({ length: lines }, (_, j) => `const a${j} = ${j};`).join(
    "\n",
  ),
  after: Array.from(
    { length: lines },
    (_, j) => `const a${j} = ${j + 1};`,
  ).join("\n"),
});

describe("DiffFileList SSR", () => {
  it("renders the first files' diffs, not placeholders", async () => {
    const { default: DiffFileList } = await loadForServer("DiffFileList");
    const { body } = render(DiffFileList, {
      props: { files: [file(0), file(1)] },
    });

    expect(body).toContain("shl-diff-file-body");
    expect(body).not.toContain("shl-diff-file-placeholder");
    // Word-level changes are wrapped, so compare the text.
    expect(body.replace(/<[^>]+>/g, "")).toContain("const a1 = 2;");
  });

  it("leaves files past about a screen and a half as placeholders", async () => {
    const { default: DiffFileList } = await loadForServer("DiffFileList");
    // Each file is estimated at maxHeight (640px), so three fill 1500px.
    const files = Array.from({ length: 6 }, (_, i) => file(i, 100));
    const { body } = render(DiffFileList, { props: { files } });

    expect(body.match(/shl-diff-file-body/g)).toHaveLength(3);
    expect(body.match(/shl-diff-file-placeholder/g)).toHaveLength(3);
  });

  it("highlights a file whose language is given directly", async () => {
    const { default: DiffFileList } = await loadForServer("DiffFileList");
    const { body } = render(DiffFileList, {
      props: { files: [{ ...file(0), language: typescript }] },
    });

    expect(body).toContain('<span class="hljs-keyword">const</span>');
  });
});
