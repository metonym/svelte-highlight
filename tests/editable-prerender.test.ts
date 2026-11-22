import { editorHtml, lineHtmlFromEvents } from "../src/editable-dom-paint.js";
import { prerenderEditor } from "../src/editable.js";
import { parseIncremental } from "../src/incremental-tokenize.js";
import typescript from "../src/languages/typescript.js";
import { registry } from "../src/registry.js";

describe("prerenderEditor", () => {
  it("returns the markup the dom engine's first paint builds", () => {
    const code = "const a = 1;\n// two\nlet b = `x${a}`;\n";
    const { html, parse } = prerenderEditor(typescript, code);
    const expected = parseIncremental(registry, "typescript", code);
    expect((parse as typeof expected).events).toEqual(expected.events);
    expect(html).toBe(editorHtml(lineHtmlFromEvents(expected.events, code)));
    expect(
      html.startsWith('<span><span class="hljs-keyword">const</span> a'),
    ).toBe(true);
  });

  it("keeps the dom engine's empty lines for empty code", () => {
    expect(prerenderEditor(typescript, "").html).toBe(
      editorHtml(lineHtmlFromEvents([], "")),
    );
  });
});
