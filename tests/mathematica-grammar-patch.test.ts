import hljsFactory from "highlight.js/lib/core";
import stockMathematica from "highlight.js/lib/languages/mathematica";
import patchedMathematica from "../scripts/hljs-patches/mathematica.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import mathematica from "../src/languages/mathematica.js";

// scripts/hljs-patches/mathematica.js: the `wolfram` alias.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("mathematica", patchedMathematica.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("mathematica", stockMathematica);

const registry = createRegistry();
registry.register(mathematica.register);

const CODE = `(* Sum of squares *)
f[n_Integer] := Sum[k^2, {k, 1, n}]
Table[f[n], {n, 1, 5}]
Plot[Sin[x], {x, 0, 2 Pi}]`;

describe("mathematica grammar patch", () => {
  it("resolves wolfram to mathematica", () => {
    expect(resolveLanguageName("wolfram")).toBe("mathematica");
    expect(resolveLanguageName("WOLFRAM")).toBe("mathematica");
  });

  it("highlights the same through the alias", () => {
    const expected = stock.highlight(CODE, { language: "mathematica" }).value;
    expect(registry.highlight(CODE, { language: "wolfram" }).value).toEqual(
      expected,
    );
  });

  it("does not change Mathematica output", () => {
    const expected = stock.highlight(CODE, { language: "mathematica" }).value;
    expect(hljs.highlight(CODE, { language: "mathematica" }).value).toEqual(
      expected,
    );
    expect(registry.highlight(CODE, { language: "mathematica" }).value).toEqual(
      expected,
    );
  });
});
