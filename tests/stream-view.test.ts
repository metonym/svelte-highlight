import javascript from "../src/languages/javascript.js";
import python from "../src/languages/python.js";
import { registry } from "../src/registry.js";
import { createStreamView } from "../src/stream.js";
import { SEAL_CHUNK_LINES } from "../src/stream-highlighter.js";
import { flushFrames } from "./svelte-dom.ts";

const stripTags = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

// The fake DOM's `innerHTML` getter includes the element's own tag.
const contents = (element: HTMLElement) =>
  element.innerHTML.replace(/^<code>/, "").replace(/<\/code>$/, "");

function mountCode() {
  const pre = document.createElement("pre");
  const code = document.createElement("code");
  pre.append(code);
  return code;
}

const lineOf = (element: HTMLElement, line: number) =>
  Array.from(element.childNodes).find(
    (node) => (node as Element).getAttribute?.("data-line") === String(line),
  );

const lines = (count: number) =>
  Array.from({ length: count }, (_, i) => `const x${i} = ${i};\n`).join("");

describe("createStreamView", () => {
  it("renders the first frame at once, then one render per frame", () => {
    const element = mountCode();
    const highlights: string[] = [];
    const view = createStreamView(element, {
      language: javascript,
      code: "const a",
      onHighlight: (html) => highlights.push(html),
    });
    expect(highlights.length).toBe(1);
    expect(stripTags(element.innerHTML)).toBe("const a");

    view.update({ code: "const a = 1" });
    view.update({ code: "const a = 1;\nlet b" });
    expect(highlights.length).toBe(1);
    flushFrames();
    expect(highlights.length).toBe(2);
    expect(stripTags(element.innerHTML)).toBe("const a = 1;\nlet b");
    view.destroy();
  });

  it("skips an update that changes nothing", () => {
    const element = mountCode();
    let renders = 0;
    const view = createStreamView(element, {
      language: javascript,
      code: "const a = 1;",
      onHighlight: () => renders++,
    });
    view.update({ code: "const a = 1;", language: javascript });
    flushFrames();
    expect(renders).toBe(1);
    view.destroy();
  });

  it("keeps a line's element as more lines stream in", () => {
    const element = mountCode();
    const view = createStreamView(element, {
      language: javascript,
      code: "const a = 1;\n",
    });
    const first = lineOf(element, 0);
    expect(first).toBeDefined();

    view.update({ code: `const a = 1;\n${lines(20)}` });
    flushFrames();
    expect(lineOf(element, 0)).toBe(first);
    expect(lineOf(element, 20)).toBeDefined();
    view.destroy();
  });

  it("keeps sealed chunk nodes when later chunks seal", () => {
    const element = mountCode();
    const code = lines(SEAL_CHUNK_LINES * 2 + 10);
    const view = createStreamView(element, {
      language: javascript,
      code: code.slice(0, code.indexOf(`x${SEAL_CHUNK_LINES + 5} `)),
    });
    // Everything before the first tail line's "\n" is the first chunk.
    const children = Array.from(element.childNodes);
    const tailStart = children.indexOf(
      lineOf(element, SEAL_CHUNK_LINES) as ChildNode,
    );
    const sealedNodes = children.slice(0, tailStart - 1);
    expect(sealedNodes.length).toBeGreaterThan(0);

    view.update({ code });
    flushFrames();
    for (const node of sealedNodes) expect(node.parentNode).toBe(element);
    expect(Array.from(element.childNodes).slice(0, sealedNodes.length)).toEqual(
      sealedNodes,
    );
    // The trailing "\n" leaves an empty preview line.
    expect(stripTags(element.innerHTML)).toBe(code);
    view.destroy();
  });

  it("patches the output when an earlier line changes", () => {
    const element = mountCode();
    const code = lines(SEAL_CHUNK_LINES + 20);
    const view = createStreamView(element, { language: javascript, code });

    const edited = code.replace("const x3 = 3;", "let x3 = 3;");
    view.update({ code: edited });
    flushFrames();
    expect(stripTags(element.innerHTML)).toBe(edited);
    view.destroy();
  });

  it("draws the caret last while streaming, and drops it when done", () => {
    const element = mountCode();
    const view = createStreamView(element, {
      language: javascript,
      code: "const a\nlet",
    });
    const caret = element.lastChild as Element;
    expect(caret.getAttribute("class")).toBe("highlight-stream-caret");
    expect(caret.getAttribute("aria-hidden")).toBe("true");

    view.update({ code: "const a\nlet b" });
    flushFrames();
    expect(element.lastChild).toBe(caret);

    view.update({ caret: false });
    flushFrames();
    expect(element.innerHTML).not.toContain("highlight-stream-caret");

    view.update({ caret: true, done: true });
    expect(element.innerHTML).not.toContain("highlight-stream-caret");
    view.destroy();
  });

  it("renders the full highlight when done and reports it once", () => {
    const element = mountCode();
    const code = "const greet = () => `Hello`;\n";
    let doneCount = 0;
    const view = createStreamView(element, {
      language: javascript,
      code: code.slice(0, 10),
      onDone: () => doneCount++,
    });

    view.update({ code, done: true });
    expect(doneCount).toBe(1);
    expect(contents(element)).toBe(
      registry.highlight(code, { language: "javascript" }).value,
    );
    expect(view.highlighted).toBe(contents(element));

    view.update({ caret: false });
    expect(doneCount).toBe(1);

    // A restarted stream reports `done` again.
    view.update({ done: false, code: `${code}let b` });
    flushFrames();
    expect(element.innerHTML).toContain('data-line="1"');
    view.update({ done: true });
    expect(doneCount).toBe(2);
    view.destroy();
  });

  it("starts over when the language changes", () => {
    const element = mountCode();
    const view = createStreamView(element, {
      language: javascript,
      code: "def f():\n  pass",
    });
    view.update({ language: python });
    flushFrames();
    expect(element.innerHTML).toContain(
      '<span class="hljs-keyword">def</span>',
    );
    expect(stripTags(element.innerHTML)).toBe("def f():\n  pass");
    view.destroy();
  });

  it("stops rendering after destroy", () => {
    const element = mountCode();
    let renders = 0;
    const view = createStreamView(element, {
      language: javascript,
      code: "a",
      onHighlight: () => renders++,
    });
    view.update({ code: "ab" });
    view.destroy();
    view.update({ code: "abc", done: true });
    flushFrames();
    expect(renders).toBe(1);
    expect(stripTags(element.innerHTML)).toBe("a");
  });
});
