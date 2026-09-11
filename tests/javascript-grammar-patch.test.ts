import hljsFactory from "highlight.js/lib/core";
import patchedJavascript from "../scripts/hljs-patches/javascript.js";
import { createRegistry } from "../src/engine.js";
import javascript from "../src/languages/javascript.js";

// scripts/hljs-patches/javascript.js: `globalThis` and the modern runtime
// globals `fetch` / `queueMicrotask` / `structuredClone`.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("javascript", patchedJavascript.register);

const registry = createRegistry();
registry.register(javascript.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "javascript" }).value;
  const actual = registry.highlight(code, { language: "javascript" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("javascript grammar patch", () => {
  it("styles globalThis like window and self", () => {
    const html = expectMatchesHljs("globalThis.foo = window.foo;");
    expect(html).toContain(
      '<span class="hljs-variable language_">globalThis</span>',
    );
    expect(html).toContain(
      '<span class="hljs-variable language_">window</span>',
    );
  });

  it("styles fetch, queueMicrotask, and structuredClone calls as built-ins", () => {
    const html = expectMatchesHljs(
      "const res = await fetch(url);\nqueueMicrotask(() => structuredClone(obj));",
    );
    expect(html).toContain('<span class="hljs-built_in">fetch</span>(url)');
    expect(html).toContain(
      '<span class="hljs-built_in">queueMicrotask</span>(',
    );
    expect(html).toContain(
      '<span class="hljs-built_in">structuredClone</span>(obj)',
    );
  });

  it("still styles a user-defined call as a function title", () => {
    const html = expectMatchesHljs("fetchUser(id); setTimeout(tick, 1);");
    expect(html).toContain(
      '<span class="hljs-title function_">fetchUser</span>',
    );
    expect(html).toContain('<span class="hljs-built_in">setTimeout</span>');
  });
});
