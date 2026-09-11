import hljsFactory from "highlight.js/lib/core";
import patchedTypescript from "../scripts/hljs-patches/typescript.js";
import { createRegistry } from "../src/engine.js";
import typescript from "../src/languages/typescript.js";

// scripts/hljs-patches/typescript.js: type-level keywords `keyof` / `infer`
// / `asserts`, the `accessor` modifier, and the same runtime globals as the
// JavaScript patch.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("typescript", patchedTypescript.register);

const registry = createRegistry();
registry.register(typescript.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "typescript" }).value;
  const actual = registry.highlight(code, { language: "typescript" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("typescript grammar patch", () => {
  it("styles keyof and infer as keywords", () => {
    const html = expectMatchesHljs(
      "type Keys = keyof T;\ntype Inner<T> = T extends Array<infer U> ? U : never;",
    );
    expect(html).toContain('<span class="hljs-keyword">keyof</span>');
    expect(html).toContain('<span class="hljs-keyword">infer</span>');
  });

  it("styles asserts in an assertion signature", () => {
    const html = expectMatchesHljs(
      "function assertIsString(v: unknown): asserts v is string {}",
    );
    expect(html).toContain('<span class="hljs-keyword">asserts</span>');
  });

  it("styles the accessor class-member modifier", () => {
    const html = expectMatchesHljs("class Counter {\n  accessor count = 0;\n}");
    expect(html).toContain('<span class="hljs-keyword">accessor</span>');
  });

  it("styles globalThis and fetch like the javascript patch", () => {
    const html = expectMatchesHljs(
      "const r = await globalThis.fetch(url);\nstructuredClone(r);",
    );
    expect(html).toContain(
      '<span class="hljs-variable language_">globalThis</span>',
    );
    expect(html).toContain('<span class="hljs-built_in">fetch</span>(url)');
    expect(html).toContain(
      '<span class="hljs-built_in">structuredClone</span>(r)',
    );
  });

  it("still styles a user-defined call as a function title", () => {
    const html = expectMatchesHljs("fetchUser(id); setTimeout(tick, 1);");
    expect(html).toContain(
      '<span class="hljs-title function_">fetchUser</span>',
    );
    expect(html).toContain('<span class="hljs-built_in">setTimeout</span>');
  });

  it("does not treat keyof as a keyword inside an identifier", () => {
    const html = expectMatchesHljs("keyofThing();");
    expect(html).toContain(
      '<span class="hljs-title function_">keyofThing</span>',
    );
    expect(html).not.toContain('<span class="hljs-keyword">keyof</span>');
  });
});
